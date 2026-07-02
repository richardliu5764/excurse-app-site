import { z } from "zod";
import { NodeId, IsoDate, IsoDateTime } from "./core.js";

/* The twelve node kinds. Questions and research tasks are deliberately NOT
   node kinds — they are workflow with lifecycles and owners, and they live in
   the agenda store referencing graph aspects (see agenda.ts). The graph models
   the world; the agenda models the pipeline's to-do list. */
export const NODE_KINDS = [
  "traveler",
  "party",
  "trip",
  "day",
  "slot",
  "place",
  "booking",
  "constraint",
  "taste",
  "rhythm",
  "tension",
  "theme",
] as const;
export const NodeKind = z.enum(NODE_KINDS);
export type NodeKind = z.infer<typeof NodeKind>;

const base = {
  id: NodeId,
  label: z.string().min(1),
  createdAt: IsoDateTime,
  note: z.string().optional(),
};

export const TravelerNode = z.object({
  ...base,
  kind: z.literal("traveler"),
  role: z.enum(["primary", "invitee", "child"]).default("primary"),
  /* Pseudonym used in research-task prompts so real names never reach research
     workers; prose composition receives first names only. */
  pseudonym: z.string().optional(),
  birthYear: z.number().int().optional(),
});

export const PartyNode = z.object({
  ...base,
  kind: z.literal("party"),
  travelerIds: z.array(NodeId).min(1),
});

export const TripNode = z.object({
  ...base,
  kind: z.literal("trip"),
  destination: z.string(),
  startDate: IsoDate.optional(),
  endDate: IsoDate.optional(),
  occasion: z.string().optional(),
  /* One sentence; composer Pass 1 output, owner-approved before research spend. */
  thesis: z.string().optional(),
});

export const DayNode = z.object({
  ...base,
  kind: z.literal("day"),
  date: IsoDate,
  thesis: z.string().optional(),
});

export const SlotNode = z.object({
  ...base,
  kind: z.literal("slot"),
  /* Window is local time, HH:MM. Slots without windows are unplaced candidates. */
  window: z.object({ start: z.string(), end: z.string() }).optional(),
  species: z.enum(["anchor", "decision_point", "backup", "freeform"]).default("anchor"),
});

export const PlaceNode = z.object({
  ...base,
  kind: z.literal("place"),
  category: z.enum(["restaurant", "cafe", "museum", "park", "hike", "shop", "venue", "lodging", "transit", "other"]).default("other"),
  address: z.string().optional(),
  coords: z.object({ lat: z.number(), lon: z.number() }).optional(),
  external: z
    .object({
      osm: z.string().optional(),
      wikidata: z.string().optional(),
      website: z.string().url().optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

export const BookingNode = z.object({
  ...base,
  kind: z.literal("booking"),
  status: z.enum(["idea", "held", "booked", "cancelled"]).default("idea"),
  confirmation: z.string().optional(),
  /* Free-cancellation deadline; unexpired windows surface in Loose ends. */
  cancelBy: IsoDateTime.optional(),
});

/* Hard constraints are never guessed. The extractor is forbidden (by validator,
   not by prompt alone) from emitting constraint statements at any provenance
   other than 'stated'. */
export const ConstraintNode = z.object({
  ...base,
  kind: z.literal("constraint"),
  category: z.enum(["allergy", "diet", "mobility", "medical", "child", "schedule", "budget", "other"]),
  severity: z.enum(["hard", "strong", "soft"]).default("hard"),
});

export const TasteNode = z.object({
  ...base,
  kind: z.literal("taste"),
  polarity: z.enum(["likes", "avoids"]).default("likes"),
  /* Laddered values: attribute → consequence → value. Depth recorded so the
     composer can echo the value, not just the attribute. */
  ladder: z.enum(["attribute", "consequence", "value"]).default("attribute"),
});

export const RhythmNode = z.object({
  ...base,
  kind: z.literal("rhythm"),
  category: z.enum(["chronotype", "pace", "rest", "meals", "energy", "other"]).default("other"),
});

/* Ambivalence is data to honor, not resolve. A tension links two tastes/rhythms;
   the composer must visibly honor every tension somewhere, and the verifier
   counts unserved tensions the same as unserved tastes. */
export const TensionNode = z.object({
  ...base,
  kind: z.literal("tension"),
  betweenIds: z.tuple([NodeId, NodeId]),
});

export const ThemeNode = z.object({
  ...base,
  kind: z.literal("theme"),
});

export const GraphNode = z.discriminatedUnion("kind", [
  TravelerNode,
  PartyNode,
  TripNode,
  DayNode,
  SlotNode,
  PlaceNode,
  BookingNode,
  ConstraintNode,
  TasteNode,
  RhythmNode,
  TensionNode,
  ThemeNode,
]);
export type GraphNode = z.infer<typeof GraphNode>;
export type TravelerNode = z.infer<typeof TravelerNode>;
export type PlaceNode = z.infer<typeof PlaceNode>;
export type SlotNode = z.infer<typeof SlotNode>;
export type ConstraintNode = z.infer<typeof ConstraintNode>;
