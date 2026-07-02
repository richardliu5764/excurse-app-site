/* Shared builders for colocated tests. Not exported from the package index;
   deterministic ids come from mintId with a fixed clock + seeded-ish rand so
   ULID ordering in tests follows construction order. */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  mintId,
  type Episode,
  type EpisodeId,
  type GraphNode,
  type NodeId,
  type Statement,
  type StatementId,
} from "@excursed/schema";

export const T0 = "2026-07-01T12:00:00.000Z";

let tick = 0;
export function nid(): NodeId {
  return mintId("node", 1_750_000_000_000 + tick++);
}
export function sid(): StatementId {
  return mintId("statement", 1_750_000_000_000 + tick++);
}
export function eid(): EpisodeId {
  return mintId("episode", 1_750_000_000_000 + tick++);
}

export function tmpTripDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "excursed-graph-"));
}

export function traveler(label: string): GraphNode {
  return { id: nid(), kind: "traveler", label, createdAt: T0, role: "primary" };
}

export function constraintNode(
  label: string,
  category: "allergy" | "diet" | "mobility" | "medical" | "child" | "schedule" | "budget" | "other" = "allergy",
): GraphNode {
  return { id: nid(), kind: "constraint", label, createdAt: T0, category, severity: "hard" };
}

export function tasteNode(
  label: string,
  polarity: "likes" | "avoids" = "likes",
  ladder: "attribute" | "consequence" | "value" = "attribute",
): GraphNode {
  return { id: nid(), kind: "taste", label, createdAt: T0, polarity, ladder };
}

export function rhythmNode(
  label: string,
  category: "chronotype" | "pace" | "rest" | "meals" | "energy" | "other" = "other",
): GraphNode {
  return { id: nid(), kind: "rhythm", label, createdAt: T0, category };
}

export function placeNode(
  label: string,
  opts: { createdAt?: string; osm?: string; wikidata?: string } = {},
): GraphNode {
  const node: GraphNode = {
    id: nid(),
    kind: "place",
    label,
    createdAt: opts.createdAt ?? T0,
    category: "restaurant",
  };
  if (opts.osm !== undefined || opts.wikidata !== undefined) {
    node.external = {
      ...(opts.osm !== undefined ? { osm: opts.osm } : {}),
      ...(opts.wikidata !== undefined ? { wikidata: opts.wikidata } : {}),
    };
  }
  return node;
}

export function tensionNode(label: string, between: [NodeId, NodeId]): GraphNode {
  return { id: nid(), kind: "tension", label, createdAt: T0, betweenIds: between };
}

export function stmt(partial: Partial<Statement> & Pick<Statement, "from" | "rel" | "to">): Statement {
  const episode = eid();
  return {
    id: sid(),
    provenance: "stated",
    confidence: 0.95,
    source: [{ episode }],
    quote: "verbatim words",
    assertedAt: T0,
    ...partial,
  } as Statement;
}

export function episode(partial: Partial<Episode> = {}): Episode {
  return {
    id: eid(),
    kind: "interview_turn",
    at: T0,
    text: "we found a tiny counter where the owner kept bringing us things",
    ...partial,
  } as Episode;
}
