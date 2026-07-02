import { z } from "zod";
import {
  CONSTRAINT_ALLOWED_PROVENANCE,
  CONSTRAINT_REL,
  GraphNode,
  NODE_KINDS,
  PROVENANCES,
  RELS,
  Statement,
  StatementId,
  mintId,
  type Episode,
  type EpisodeId,
  ulid,
} from "@excursed/schema";
import { assertConstraintGuard, type TripStore } from "./trip.js";
import { GraphQuery } from "./query.js";
import type { LlmClient } from "./llm.js";

/* Desk-time extraction, Pass B of 13-council-ai §4.3. Pass A (turn-time chips/
   scales/pairs) never touches this file — the instrument does no NLP. */

/* The extractor prompt from the spec, verbatim in spirit. The one mechanical
   addition is the "nodes" array + local-id note: statements alone cannot mint
   the tension/taste nodes the rules demand, and models cannot be trusted to
   produce well-formed ULIDs, so the store re-mints ids on ingest. */
export const EXTRACTOR_SYSTEM = `You extract knowledge-graph statements about travelers from interview
transcripts, for a private trip-planning system. You are given:
(1) the statement JSON schema and the 12 node kinds with their fields;
(2) the current active statements (compact serialization);
(3) new episodes (verbatim, with ids).

Emit a JSON object {"new": Statement[], "nodes": GraphNode[], "invalidate": [{"id": string, "reason": string}]}.
Any node you introduce (taste, rhythm, tension, place, ...) goes in "nodes";
reference it from statements by its id. Use any locally-unique id string for
new nodes — real ids are minted on ingest. Reuse existing node ids as-is.

Rules — these are hard:
- provenance discipline: 'stated' only for facts the person said in so many
  words (include the verbatim in \`quote\`); 'implied' for clear entailments
  (quote the entailing text); 'inferred' for your reads of the story —
  confidence <= 0.7, always with a \`note\` explaining the read.
- NEVER emit 'stated' for anything paraphrased. NEVER emit constraint
  statements (allergy/mobility/medical/child) at any provenance other than
  'stated' — if a story implies a constraint, emit an 'inferred' taste/rhythm
  AND flag it in \`note\` as "constraint-suspect: verify by asking".
- Ladder silently: when a story praises an attribute, also emit the value
  behind it as a separate 'inferred' statement (attribute -> consequence ->
  value), each with its own confidence. Store the whole ladder.
- Tensions: when the person wants two things that trade off, emit a tension
  node + holdsTension statements. Do not resolve tensions.
- source: every statement cites episode ids. A statement you cannot cite
  does not exist.
- Contradictions: if a new episode contradicts an active statement, add it
  to \`invalidate\` with the episode id as reason; then emit the replacement.
- Do not invent node kinds or relations. Unmappable material goes into a
  single 'composer-note' statement, verbatim, for the human.`;

export const EXTRACTION_SCHEMA_NAME = "extraction.v1";
export const CONSTRAINT_SUSPECT_NOTE = "constraint-suspect: verify by asking";

/* Derived from the frozen schema constants so the prompt can never drift
   from what the validator accepts. */
function schemaDigest(): string {
  return [
    "Statement fields: id, from (node id), rel, to (node id | {key, value, unit?} literal),",
    "provenance, confidence (0..1), source (array of {episode}|{claim}|{url}|{checker}|{proxy}, never empty),",
    "quote? (required for stated/implied), assertedAt, validFrom?, validTo?, note?.",
    `Provenances: ${PROVENANCES.join(", ")}.`,
    `Relations: ${RELS.join(", ")}.`,
    `Node kinds: ${NODE_KINDS.join(", ")}. Node fields: id, kind, label, note?, plus per-kind`,
    "fields (constraint: category+severity; taste: polarity+ladder; rhythm: category;",
    "tension: betweenIds [two node ids]; place: category).",
  ].join("\n");
}

export function serializeStatementCompact(st: Statement): string {
  const to = typeof st.to === "string" ? st.to : `{${st.to.key}=${JSON.stringify(st.to.value)}}`;
  const quote = st.quote ? ` quote=${JSON.stringify(st.quote)}` : "";
  const note = st.note ? ` note=${JSON.stringify(st.note)}` : "";
  return `${st.id} ${st.from} -[${st.rel}]-> ${to} (${st.provenance} ${st.confidence})${quote}${note}`;
}

export function serializeEpisode(ep: Episode): string {
  const head = [
    `[${ep.id}]`,
    `kind=${ep.kind}`,
    `at=${ep.at}`,
    ep.traveler !== undefined ? `traveler=${ep.traveler}` : undefined,
    ep.question !== undefined ? `question=${ep.question}` : undefined,
    ep.url !== undefined ? `url=${ep.url}` : undefined,
  ]
    .filter((x): x is string => x !== undefined)
    .join(" ");
  const structured = ep.structured !== undefined ? `\nstructured: ${JSON.stringify(ep.structured)}` : "";
  return `${head}${structured}\n${ep.text}`;
}

export interface ExtractionPrompt {
  system: string;
  prompt: string;
  schemaName: string;
}

export function buildExtractionPrompt(
  activeStatements: readonly Statement[],
  episodes: readonly Episode[],
): ExtractionPrompt {
  const prompt = [
    "## Statement schema and node kinds",
    schemaDigest(),
    "",
    "## Current active statements (compact)",
    activeStatements.length === 0 ? "(none yet)" : activeStatements.map(serializeStatementCompact).join("\n"),
    "",
    "## New episodes (verbatim)",
    episodes.map(serializeEpisode).join("\n\n"),
  ].join("\n");
  return { system: EXTRACTOR_SYSTEM, prompt, schemaName: EXTRACTION_SCHEMA_NAME };
}

export class ExtractionParseError extends Error {
  constructor(message: string, readonly issues: readonly string[] = []) {
    super(issues.length ? `${message}\n- ${issues.join("\n- ")}` : message);
    this.name = "ExtractionParseError";
  }
}

export interface ExtractionResult {
  new: Statement[];
  nodes: GraphNode[];
  invalidate: { id: StatementId; reason: string }[];
}

const RawPayload = z.object({
  new: z.array(z.record(z.unknown())).default([]),
  nodes: z.array(z.record(z.unknown())).default([]),
  invalidate: z.array(z.object({ id: StatementId, reason: z.string().min(1) })).default([]),
});

const NODE_ID_RE = /^nd_[0-9A-HJKMNP-TV-Z]{26}$/;

function stripFences(text: string): string {
  const m = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  return (m ? m[1]! : text).trim();
}

function asRecord(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null ? { ...(v as Record<string, unknown>) } : {};
}

/* Validate + repair a model extraction. Repairs are strictly the ones the
   spec licenses; everything else is a hard error:
   - local node ids are re-minted (models cannot produce ULIDs);
   - inferred/assumed confidence is clamped to its schema cap;
   - a constraint-suspect (hasConstraint at provenance != stated) is DEMOTED
     to an inferred taste + "constraint-suspect" note — and its proposed
     constraint node becomes a taste node. It never enters as a constraint.
   Missing quotes on stated/implied, empty sources, unknown rels/kinds all
   reject: cite-or-not-exist is validated, not requested. */
export function parseExtraction(json: string, opts: { now?: string } = {}): ExtractionResult {
  const now = opts.now ?? new Date().toISOString();
  let data: unknown;
  try {
    data = JSON.parse(stripFences(json));
  } catch {
    throw new ExtractionParseError("model output is not valid JSON");
  }
  const payload = RawPayload.safeParse(data);
  if (!payload.success) {
    throw new ExtractionParseError(
      "extraction payload must be {new, nodes?, invalidate?}",
      payload.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
  }

  // First pass: re-mint every node id that is not already a real nd_<ULID>.
  const idMap = new Map<string, string>();
  const rawNodes = payload.data.nodes.map(asRecord);
  for (const n of rawNodes) {
    const given = typeof n["id"] === "string" ? n["id"] : `local:${ulid()}`;
    if (!NODE_ID_RE.test(given)) {
      const minted = mintId("node");
      idMap.set(given, minted);
      n["id"] = minted;
    }
  }
  const remap = (v: unknown): unknown => (typeof v === "string" && idMap.has(v) ? idMap.get(v)! : v);
  for (const n of rawNodes) {
    if (Array.isArray(n["betweenIds"])) n["betweenIds"] = n["betweenIds"].map(remap);
    if (Array.isArray(n["travelerIds"])) n["travelerIds"] = n["travelerIds"].map(remap);
    if (n["createdAt"] === undefined) n["createdAt"] = now;
  }

  // Second pass: statements — remap endpoints, mint ids, clamp caps, demote.
  const demotedNodeIds = new Set<string>();
  const issues: string[] = [];
  const statements: Statement[] = [];
  payload.data.new.forEach((raw, i) => {
    const st = asRecord(raw);
    st["id"] = mintId("statement");
    st["from"] = remap(st["from"]);
    if (typeof st["to"] === "string") st["to"] = remap(st["to"]);
    if (st["assertedAt"] === undefined) st["assertedAt"] = now;
    if (typeof st["confidence"] === "number") {
      const conf: number = st["confidence"];
      if (st["provenance"] === "inferred") st["confidence"] = Math.min(conf, 0.7);
      if (st["provenance"] === "assumed") st["confidence"] = Math.min(conf, 0.5);
    }
    if (st["rel"] === CONSTRAINT_REL && st["provenance"] !== CONSTRAINT_ALLOWED_PROVENANCE) {
      st["rel"] = "hasTaste";
      st["provenance"] = "inferred";
      if (typeof st["confidence"] === "number") st["confidence"] = Math.min(st["confidence"], 0.7);
      st["note"] = st["note"] ? `${CONSTRAINT_SUSPECT_NOTE} | ${String(st["note"])}` : CONSTRAINT_SUSPECT_NOTE;
      if (typeof st["to"] === "string") demotedNodeIds.add(st["to"]);
    }
    const parsed = Statement.safeParse(st);
    if (!parsed.success) {
      issues.push(`new[${i}]: ${parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ")}`);
      return;
    }
    assertConstraintGuard(parsed.data); // belt over braces: demotion above makes this unreachable
    statements.push(parsed.data);
  });

  const nodes: GraphNode[] = [];
  rawNodes.forEach((n, i) => {
    let candidate: Record<string, unknown> = n;
    if (typeof n["id"] === "string" && demotedNodeIds.has(n["id"]) && n["kind"] === "constraint") {
      candidate = {
        id: n["id"],
        kind: "taste",
        label: n["label"],
        createdAt: n["createdAt"],
        polarity: "avoids",
        ladder: "attribute",
        note: [CONSTRAINT_SUSPECT_NOTE, typeof n["category"] === "string" ? `suspected ${n["category"]}` : undefined, typeof n["note"] === "string" ? n["note"] : undefined]
          .filter((x): x is string => x !== undefined)
          .join(" | "),
      };
    }
    const parsed = GraphNode.safeParse(candidate);
    if (!parsed.success) {
      issues.push(`nodes[${i}]: ${parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ")}`);
      return;
    }
    nodes.push(parsed.data);
  });

  if (issues.length > 0) throw new ExtractionParseError("extraction failed validation", issues);
  return { new: statements, nodes, invalidate: payload.data.invalidate };
}

export interface ApplyExtractionSummary {
  runId: string;
  appendedNodes: number;
  appendedStatements: number;
  invalidated: number;
  markedEpisodes: number;
}

export function applyExtraction(
  store: TripStore,
  result: ExtractionResult,
  opts: { runId: string; episodeIds?: readonly EpisodeId[]; now?: string },
): ApplyExtractionSummary {
  const now = opts.now ?? new Date().toISOString();
  // Invalidate before appending replacements so a mid-apply crash leaves the
  // graph conservative (missing new belief) rather than contradictory.
  for (const inv of result.invalidate) {
    store.invalidate(inv.id, `${inv.reason} (run ${opts.runId})`, undefined, now);
  }
  const existing = new Set(store.nodes.loadAll().map((n) => n.id));
  const freshNodes = result.nodes.filter((n) => !existing.has(n.id));
  store.nodes.appendMany(freshNodes);
  store.statements.appendMany(result.new); // constraint guard runs here again
  const marked = opts.episodeIds ? store.markExtracted(opts.episodeIds, opts.runId) : 0;
  return {
    runId: opts.runId,
    appendedNodes: freshNodes.length,
    appendedStatements: result.new.length,
    invalidated: result.invalidate.length,
    markedEpisodes: marked,
  };
}

/* One desk-time pass over everything not yet projected. Returns null when
   there is nothing to extract (idempotent to call after every episode drop). */
export async function runExtraction(
  store: TripStore,
  client: LlmClient,
  opts: { now?: string; runId?: string } = {},
): Promise<ApplyExtractionSummary | null> {
  const pending = store.episodes.loadAll().filter((ep) => ep.extractedBy === undefined);
  if (pending.length === 0) return null;
  const runId = opts.runId ?? `xr_${ulid()}`;
  const query = GraphQuery.fromStore(store);
  const req = buildExtractionPrompt(query.activeStatements(), pending);
  const response = await client.complete({ ...req, maxTokens: 4096 });
  const parseOpts = opts.now !== undefined ? { now: opts.now } : {};
  const result = parseExtraction(response, parseOpts);
  const applyOpts: { runId: string; episodeIds: EpisodeId[]; now?: string } = {
    runId,
    episodeIds: pending.map((ep) => ep.id),
  };
  if (opts.now !== undefined) applyOpts.now = opts.now;
  return applyExtraction(store, result, applyOpts);
}
