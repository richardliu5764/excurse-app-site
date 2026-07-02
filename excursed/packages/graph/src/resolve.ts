import { mintId, type GraphNode, type NodeId, type Statement } from "@excursed/schema";
import type { TripStore } from "./trip.js";

/* Deterministic entity resolution — no LLM anywhere in this file. Two nodes
   are the same entity iff (same kind AND normalized label equal) OR (both
   places sharing an external id). Anything fuzzier goes to LLM adjudication
   elsewhere, and every merge is a git diff the owner reviews. */

export interface MergeProposal {
  keep: NodeId;
  drop: NodeId;
  reason: string;
}

/* Marker written into a merged-away node's note; GraphQuery.nodesByKind
   filters on it. The node's line stays in the file forever. */
export const MERGED_NOTE_PREFIX = "merged-into:";

export function normalizeLabel(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics exposed by NFD
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "") // strip punctuation, keep letters/digits
    .replace(/\s+/g, " ")
    .trim();
}

function isMerged(n: GraphNode): boolean {
  return n.note !== undefined && n.note.startsWith(MERGED_NOTE_PREFIX);
}

/* Older node wins (ULIDs sort by creation, createdAt breaks near-ties), so
   repeated extraction runs converge on stable canonical ids. */
function older(a: GraphNode, b: GraphNode): [GraphNode, GraphNode] {
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? [a, b] : [b, a];
  return a.id < b.id ? [a, b] : [b, a];
}

export function proposeMerges(nodes: readonly GraphNode[]): MergeProposal[] {
  const live = nodes.filter((n) => !isMerged(n));
  const buckets = new Map<string, { node: GraphNode; why: string }[]>();
  const put = (key: string, node: GraphNode, why: string) => {
    const list = buckets.get(key) ?? [];
    list.push({ node, why });
    buckets.set(key, list);
  };
  for (const n of live) {
    const norm = normalizeLabel(n.label);
    if (norm !== "") put(`label|${n.kind}|${norm}`, n, `same kind+label: ${n.kind} "${norm}"`);
    if (n.kind === "place" && n.external) {
      if (n.external.osm) put(`osm|${n.external.osm}`, n, `shared external id: osm ${n.external.osm}`);
      if (n.external.wikidata) put(`wikidata|${n.external.wikidata}`, n, `shared external id: wikidata ${n.external.wikidata}`);
    }
  }

  const proposals: MergeProposal[] = [];
  const seen = new Set<string>(); // dedupe pairs found via multiple keys
  for (const entries of buckets.values()) {
    if (entries.length < 2) continue;
    // Merge everything in the bucket into its oldest member.
    let canonical = entries[0]!.node;
    for (const e of entries.slice(1)) canonical = older(canonical, e.node)[0];
    for (const e of entries) {
      if (e.node.id === canonical.id) continue;
      const pairKey = `${canonical.id}<${e.node.id}`;
      if (seen.has(pairKey)) continue;
      seen.add(pairKey);
      proposals.push({ keep: canonical.id, drop: e.node.id, reason: e.why });
    }
  }
  return proposals;
}

function buildResolveMap(proposals: readonly MergeProposal[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of proposals) map.set(p.drop, p.keep);
  const resolve = (id: string, hops = 0): string => {
    const next = map.get(id);
    if (next === undefined || hops > proposals.length) return id;
    return resolve(next, hops + 1); // chains: A→B, B→C ⇒ A→C
  };
  const flat = new Map<string, string>();
  for (const drop of map.keys()) flat.set(drop, resolve(drop));
  return flat;
}

export interface ApplyMergesSummary {
  merged: number;
  rewrittenStatements: number;
}

/* Applying a merge never edits history: every active statement touching a
   dropped node is invalidated and superseded by a copy with rewritten
   endpoints (same provenance, quote and sources — the fact didn't change,
   our idea of which node it attaches to did). */
export function applyMerges(
  store: TripStore,
  proposals: readonly MergeProposal[],
  now: string = new Date().toISOString(),
): ApplyMergesSummary {
  if (proposals.length === 0) return { merged: 0, rewrittenStatements: 0 };
  const resolve = buildResolveMap(proposals);
  let rewritten = 0;

  for (const st of store.statements.loadAll()) {
    if (st.invalidatedAt) continue;
    const from = resolve.get(st.from);
    const to = typeof st.to === "string" ? resolve.get(st.to) : undefined;
    if (from === undefined && to === undefined) continue;
    const marker = `entity-merge: rewrote ${[from !== undefined ? `${st.from}->${from}` : "", to !== undefined ? `${String(st.to)}->${to}` : ""].filter(Boolean).join(", ")}`;
    const next: Statement = {
      ...st,
      id: mintId("statement"),
      from: from ?? st.from,
      to: to ?? st.to,
      assertedAt: now,
      note: st.note ? `${st.note} | ${marker}` : marker,
    };
    store.statements.append(next);
    store.invalidate(st.id, marker, next.id, now);
    rewritten++;
  }

  store.nodes.amend((n) => {
    const keep = resolve.get(n.id);
    if (keep === undefined || isMerged(n)) return n;
    const marker = `${MERGED_NOTE_PREFIX}${keep}`;
    return { ...n, note: n.note ? `${marker} | ${n.note}` : marker };
  });

  return { merged: resolve.size, rewrittenStatements: rewritten };
}
