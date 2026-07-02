import {
  GraphNode,
  Statement,
  mintId,
  type Aspect,
  type NodeId,
  type SourceRef,
} from "@excursed/schema";
import { ASPECT_RULES, type AspectPattern } from "@excursed/graph";

/* Pass A — turn-time tagging (13-council-ai §4.3). Chips/scales/pairs are
   already structured; they write statements directly via the bank's aspects[]
   mapping. NO NLP happens here: the value written is the option the traveler
   clicked, verbatim, at provenance 'stated' / confidence 0.95. Stories and
   free text are stored raw as episodes for Pass B.

   The shapes written are exactly the shapes ASPECT_RULES declares, so
   GraphQuery.coverage() rises the moment the click lands: hasProperty aspects
   get the declared literal key; constraint/rhythm/taste aspects get a minted
   node plus the edge. */

export const STATED_CONFIDENCE = 0.95;

export interface PassAWrite {
  statements: Statement[];
  nodes: GraphNode[];
}

export interface PassAOpts {
  aspect: Aspect;
  travelerId: NodeId;
  value: string | number | boolean;
  /** the selected option text (or the sweep line), verbatim — stated needs it */
  quote: string;
  source: SourceRef[];
  now: string;
  confidence?: number;
  /** safety sweep only: this category was asserted empty. A soft constraint
      node labeled "none stated" is minted so coverage rises without ever
      creating a hard constraint downstream rules would verify against. */
  negative?: boolean;
  note?: string;
}

function pickPattern(aspect: Aspect): AspectPattern {
  const patterns = ASPECT_RULES[aspect];
  return patterns.find((p) => p.propertyKey !== undefined) ?? patterns[0]!;
}

export function passAWrite(opts: PassAOpts): PassAWrite {
  const pattern = pickPattern(opts.aspect);
  const confidence = opts.confidence ?? STATED_CONFIDENCE;
  const base = {
    id: mintId("statement"),
    from: opts.travelerId,
    provenance: "stated" as const,
    confidence,
    source: opts.source,
    quote: opts.quote,
    assertedAt: opts.now,
    ...(opts.note !== undefined ? { note: opts.note } : {}),
  };

  if (pattern.propertyKey !== undefined) {
    const st = Statement.parse({
      ...base,
      rel: pattern.rel,
      to: { key: pattern.propertyKey, value: opts.value },
    });
    return { statements: [st], nodes: [] };
  }

  const label = opts.negative ? "none stated" : String(opts.value);
  const note = opts.negative
    ? "none-stated: the sweep was answered and this category came back empty"
    : opts.note;
  let node: GraphNode;
  switch (pattern.toKind) {
    case "constraint":
      node = GraphNode.parse({
        id: mintId("node"),
        kind: "constraint",
        label,
        createdAt: opts.now,
        category: pattern.category ?? "other",
        severity: opts.negative ? "soft" : "hard",
        ...(note !== undefined ? { note } : {}),
      });
      break;
    case "rhythm":
      node = GraphNode.parse({
        id: mintId("node"),
        kind: "rhythm",
        label,
        createdAt: opts.now,
        category: pattern.category ?? "other",
        ...(note !== undefined ? { note } : {}),
      });
      break;
    case "taste":
      node = GraphNode.parse({
        id: mintId("node"),
        kind: "taste",
        label,
        createdAt: opts.now,
        polarity: pattern.polarity ?? "likes",
        ladder: pattern.ladder ?? "attribute",
        ...(note !== undefined ? { note } : {}),
      });
      break;
    default:
      throw new Error(
        `aspect ${opts.aspect}: no Pass-A shape (pattern rel=${pattern.rel}, toKind=${String(pattern.toKind)})`,
      );
  }
  const st = Statement.parse({ ...base, rel: pattern.rel, to: node.id });
  return { statements: [st], nodes: [node] };
}
