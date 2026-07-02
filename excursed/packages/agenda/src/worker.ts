import { z } from "zod";
import {
  Claim,
  ClaimSource,
  IsoDate,
  SOURCE_TIERS,
  SourceTier,
  Statement,
  UNFOUND,
  Volatility,
  mintId,
  type ClaimId,
  type ResearchTaskRow,
  type StatementId,
} from "@excursed/schema";
import type { LlmClient, TripStore } from "@excursed/graph";
import { T1_REQUIRED_FIELDS, fieldsForForm, unknownFieldIssues } from "./forms.js";
import { isoNow } from "./tasks.js";

/* The research worker, master spec §5: one form-constrained agentic pass —
   (1) model proposes search queries from the brief (memory generates
   HYPOTHESES AND QUERIES ONLY — the T0 rule), (2) we retrieve through an
   injected SearchClient, (3) model fills the fixed form citing only retrieved
   urls, (4) the validator rejects anything else. Rejection leaves the task
   pending with an error note appended to later brief lines (task identity is
   the first line, so rules never re-create a rejected task). */

export interface SearchResult {
  url: string;
  title?: string;
  snippet?: string;
}

export interface FetchedDoc {
  url: string;
  title?: string;
  text: string;
  /** stamped by the fetcher, never by the model — this is what T0 leans on */
  retrievedAt: string;
}

export interface SearchClient {
  search(query: string): Promise<SearchResult[]>;
  fetch(url: string): Promise<FetchedDoc>;
}

export const QUERY_SCHEMA_NAME = "research.queries.v1";
export const FORM_SCHEMA_NAME = "research.form.v1";

export const WORKER_SYSTEM = `You are a research worker filling a fixed per-stop form for a private,
hand-made trip guide. You answer the form's questions about real places,
with sources, or mark fields "${UNFOUND}".

Source tier policy:
- T1 (${SOURCE_TIERS.T1}): the venue's own site, reservation system, posted
  hours, official park/museum/transit pages. REQUIRED for hours, closures,
  tickets, gates, and dietary/allergen safety.
- T2 (${SOURCE_TIERS.T2}): named humans, reputable editorial, recent
  first-person reports.
- T3 (${SOURCE_TIERS.T3}): review aggregates and forums — pattern evidence
  only, never plain fact.

The T0 rule is absolute: your memory generates hypotheses and search queries
ONLY. Every field value must cite at least one source retrieved in this
session. A field you cannot support with a retrieved source is "${UNFOUND}".
An invented value is a validator error — it will be rejected, not restyled.`;

const MAX_QUERIES = 6;
const MAX_DOCS = 8;
const DOC_EXCERPT_CHARS = 2000;

export function buildQueryPrompt(task: ResearchTaskRow): { system: string; prompt: string; schemaName: string } {
  const prompt = [
    `## Task (rule ${task.rule}, form: ${task.form})`,
    task.brief,
    "",
    "## Form fields you will need evidence for",
    fieldsForForm(task.form).join(", "),
    "",
    `Return ONLY a JSON array of up to ${MAX_QUERIES} web search query strings, most important first.`,
  ].join("\n");
  return { system: WORKER_SYSTEM, prompt, schemaName: QUERY_SCHEMA_NAME };
}

export function buildFormPrompt(
  task: ResearchTaskRow,
  docs: readonly FetchedDoc[],
): { system: string; prompt: string; schemaName: string } {
  const sources = docs
    .map(
      (d, i) =>
        `[${i + 1}] ${d.url} (retrieved ${d.retrievedAt})${d.title ? ` — ${d.title}` : ""}\n${d.text.slice(0, DOC_EXCERPT_CHARS)}`,
    )
    .join("\n\n");
  const prompt = [
    `## Task (rule ${task.rule}, form: ${task.form})`,
    task.brief,
    "",
    "## Retrieved sources (the ONLY citable material)",
    docs.length === 0 ? "(nothing retrieved)" : sources,
    "",
    "## Output",
    `A JSON object {"fields": {...}} with EXACTLY these keys: ${fieldsForForm(task.form).join(", ")}.`,
    `Each value is either the string "${UNFOUND}" or an object:`,
    `{"predicate": "hours(2026-10-11) = 08:00-14:00", "sentence": "prose the guide may cite",`,
    ` "tier": "T1"|"T2"|"T3", "confidence": 0..1, "volatility": "static"|"seasonal"|"weekly"|"daily",`,
    ` "validFrom"?: "YYYY-MM-DD", "validTo"?: "YYYY-MM-DD",`,
    ` "sources": [{"url": "<a retrieved url above>", "excerpt": "the retrieved words it rests on"}]}`,
    "Cite only urls listed above. Fields the sources do not answer are " + `"${UNFOUND}".`,
  ].join("\n");
  return { system: WORKER_SYSTEM, prompt, schemaName: FORM_SCHEMA_NAME };
}

export class WorkerValidationError extends Error {
  constructor(message: string, readonly issues: readonly string[] = []) {
    super(issues.length ? `${message}\n- ${issues.join("\n- ")}` : message);
    this.name = "WorkerValidationError";
  }
}

function stripFences(text: string): string {
  const m = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  return (m ? m[1]! : text).trim();
}

export function parseQueries(json: string): string[] {
  let data: unknown;
  try {
    data = JSON.parse(stripFences(json));
  } catch {
    throw new WorkerValidationError("query output is not valid JSON");
  }
  const parsed = z.array(z.string().min(1)).min(1).safeParse(data);
  if (!parsed.success) throw new WorkerValidationError("query output must be a non-empty JSON array of strings");
  return parsed.data.slice(0, MAX_QUERIES);
}

const RawSource = z.object({
  url: z.string().min(1),
  excerpt: z.string().optional(),
});

const RawFilled = z.object({
  predicate: z.string().min(1),
  sentence: z.string().min(1),
  tier: SourceTier.optional(), // optionality checked by hand for a sharper message
  confidence: z.number().min(0).max(1).optional(),
  volatility: Volatility.optional(),
  validFrom: IsoDate.optional(),
  validTo: IsoDate.optional(),
  sources: z.array(RawSource).min(1, "T0 rule: claim cites no retrieved source"),
});

/* fields values are parsed per-field (not via z.union) so a bad fill yields
   the sharp message — "T0 rule: claim cites no retrieved source" — instead of
   zod's generic invalid-union noise. */
const RawForm = z.object({
  fields: z.record(z.unknown()),
});

export interface ParsedFormFill {
  claims: Claim[];
  unfoundFields: string[];
}

/* Validate a form fill against the T0 rule and the form contract. Everything
   here is mechanical: unknown field, missing tier, source url not among the
   retrieved docs, or a claim failing the ledger schema each reject the whole
   fill — the task stays pending and the worker runs again with the error
   note in view. retrievedAt is stamped from the fetcher's record, never
   trusted from the model. */
export function parseFormFill(
  json: string,
  task: ResearchTaskRow,
  docs: readonly FetchedDoc[],
  now: string = isoNow(),
): ParsedFormFill {
  let data: unknown;
  try {
    data = JSON.parse(stripFences(json));
  } catch {
    throw new WorkerValidationError("form output is not valid JSON");
  }
  const parsed = RawForm.safeParse(data);
  if (!parsed.success) {
    throw new WorkerValidationError(
      "form output must be {fields: {name: UNFOUND | filled}}",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
  }

  const docByUrl = new Map(docs.map((d) => [d.url, d]));
  const issues: string[] = unknownFieldIssues(task.form, Object.keys(parsed.data.fields));
  const claims: Claim[] = [];
  const unfoundFields: string[] = [];

  for (const [field, rawValue] of Object.entries(parsed.data.fields)) {
    if (rawValue === UNFOUND) {
      unfoundFields.push(field);
      continue;
    }
    const filled = RawFilled.safeParse(rawValue);
    if (!filled.success) {
      issues.push(`${field}: ${filled.error.issues.map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message)).join("; ")}`);
      continue;
    }
    const value = filled.data;
    if (value.tier === undefined) {
      issues.push(`${field}: no source tier assigned`);
      continue;
    }
    if (T1_REQUIRED_FIELDS.has(field) && value.tier !== "T1") {
      issues.push(`${field}: requires a T1 primary source (got ${value.tier})`);
      continue;
    }
    const sources: ClaimSource[] = [];
    for (const src of value.sources) {
      const doc = docByUrl.get(src.url);
      if (doc === undefined) {
        issues.push(`${field}: cites un-retrieved source ${src.url} (T0 rule)`);
        continue;
      }
      const s: ClaimSource = { url: doc.url, kind: "web", retrievedAt: doc.retrievedAt };
      if (doc.title !== undefined) s.title = doc.title;
      if (src.excerpt !== undefined) s.excerpt = src.excerpt;
      sources.push(s);
    }
    if (sources.length !== value.sources.length) continue; // issue already recorded
    const candidate: Record<string, unknown> = {
      id: mintId("claim"),
      about: [...task.targets],
      predicate: value.predicate,
      sentence: value.sentence,
      field,
      tier: value.tier,
      confidence: value.confidence ?? 0.7,
      volatility: value.volatility ?? "seasonal",
      sources,
      lastCheckedAt: now,
      taskId: task.id,
    };
    if (value.validFrom !== undefined) candidate["validFrom"] = value.validFrom;
    if (value.validTo !== undefined) candidate["validTo"] = value.validTo;
    const claim = Claim.safeParse(candidate);
    if (!claim.success) {
      issues.push(`${field}: ${claim.error.issues.map((i) => i.message).join("; ")}`);
      continue;
    }
    claims.push(claim.data);
  }

  if (issues.length > 0) throw new WorkerValidationError("form fill failed validation", issues);
  return { claims, unfoundFields };
}

/* Claims are mirrored onto the graph as researched statements so the verifier
   sees one world: place —hasProperty→ {key: field, value: sentence}, source =
   the claim. */
export function claimToStatement(claim: Claim, now: string): Statement {
  const st: Record<string, unknown> = {
    id: mintId("statement"),
    from: claim.about[0]!,
    rel: "hasProperty",
    to: { key: claim.field, value: claim.sentence },
    provenance: "researched",
    confidence: claim.confidence,
    source: [{ claim: claim.id }],
    assertedAt: now,
    note: claim.predicate,
  };
  if (claim.validFrom !== undefined) st["validFrom"] = claim.validFrom;
  if (claim.validTo !== undefined) st["validTo"] = claim.validTo;
  return Statement.parse(st);
}

export interface ExecuteTaskResult {
  taskId: string;
  status: "done" | "unfound" | "rejected";
  claimIds: ClaimId[];
  statementIds: StatementId[];
  unfoundFields: string[];
  errors: string[];
}

export interface ExecuteTaskOptions {
  now?: string;
  /** urls fetched per task, across all queries */
  maxDocs?: number;
}

function amendTask(store: TripStore, id: string, map: (t: ResearchTaskRow) => ResearchTaskRow): void {
  store.research.amend((t) => (t.id === id ? map(t) : t));
}

/* One task, end to end. Deterministic given the injected clients: the tests
   drive it with FixtureClient + a scripted SearchClient. */
export async function executeTask(
  store: TripStore,
  task: ResearchTaskRow,
  llm: LlmClient,
  search: SearchClient,
  opts: ExecuteTaskOptions = {},
): Promise<ExecuteTaskResult> {
  if (task.status !== "pending") {
    throw new Error(`task ${task.id} is '${task.status}', not 'pending'`);
  }
  const now = opts.now ?? isoNow();
  const maxDocs = opts.maxDocs ?? MAX_DOCS;

  const reject = (errors: readonly string[]): ExecuteTaskResult => {
    // Task stays pending; the note rides LATER brief lines so task identity
    // (rule, targets, first line) is unchanged and rules stay idempotent.
    amendTask(store, task.id, (t) => ({
      ...t,
      brief: `${t.brief}\n[worker-rejected ${now}] ${errors.join(" | ")}`,
    }));
    return { taskId: task.id, status: "rejected", claimIds: [], statementIds: [], unfoundFields: [], errors: [...errors] };
  };

  let docs: FetchedDoc[];
  try {
    const queryJson = await llm.complete({ ...buildQueryPrompt(task), maxTokens: 512 });
    const queries = parseQueries(queryJson);
    const urls: string[] = [];
    const seen = new Set<string>();
    for (const q of queries) {
      for (const r of await search.search(q)) {
        if (!seen.has(r.url)) {
          seen.add(r.url);
          urls.push(r.url);
        }
      }
    }
    docs = [];
    for (const url of urls.slice(0, maxDocs)) docs.push(await search.fetch(url));
  } catch (e) {
    return reject([e instanceof Error ? e.message : String(e)]);
  }

  let fill: ParsedFormFill;
  try {
    const formJson = await llm.complete({ ...buildFormPrompt(task, docs), maxTokens: 4096 });
    fill = parseFormFill(formJson, task, docs, now);
  } catch (e) {
    if (e instanceof WorkerValidationError) return reject(e.issues.length > 0 ? e.issues : [e.message]);
    return reject([e instanceof Error ? e.message : String(e)]);
  }

  const claims = store.claims.appendMany(fill.claims);
  const statements = store.statements.appendMany(claims.map((c) => claimToStatement(c, now)));
  const status = claims.length > 0 ? "done" : "unfound";
  amendTask(store, task.id, (t) => ({
    ...t,
    status,
    resultClaimIds: claims.map((c) => c.id),
    resolvedAt: now,
  }));

  return {
    taskId: task.id,
    status,
    claimIds: claims.map((c) => c.id),
    statementIds: statements.map((s) => s.id),
    unfoundFields: fill.unfoundFields,
    errors: [],
  };
}
