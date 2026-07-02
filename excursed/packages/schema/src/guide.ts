import { z } from "zod";
import { BlockId, ClaimId, NodeId, IsoDate, IsoDateTime } from "./core.js";

/* The authoring schema: composer output, verifier input, and — packed and
   encrypted — the only thing that ever ships to a traveler's device. The
   deployed bundle carries constraint CONSEQUENCES, never constraint labels
   ("the corn tortillas are safe", never "GF options for Maya"); the pack-time
   leak scan enforces this. */

export const VerifiedStamp = z.object({
  status: z.enum(["verified", "call_ahead", "provisional"]),
  checkedOn: IsoDate,
});
export type VerifiedStamp = z.infer<typeof VerifiedStamp>;

/* Species vocabulary — plans that admit uncertainty. decision_points double
   as the draft-margin elicitation channel. */
export const BlockSpecies = z.enum(["anchor", "decision_point", "backup", "freeform", "interlude", "transition"]);
export type BlockSpecies = z.infer<typeof BlockSpecies>;

export const GuideBlock = z.object({
  id: BlockId,
  species: BlockSpecies,
  slotId: NodeId.optional(), // back-reference into the trip graph (not shipped)
  title: z.string(),
  window: z.object({ start: z.string(), end: z.string() }).optional(),
  leaveBy: z.string().optional(), // computed by R3 routing, never guessed
  place: z
    .object({
      name: z.string(),
      address: z.string().optional(),
      coords: z.object({ lat: z.number(), lon: z.number() }).optional(),
      mapsUrl: z.string().url().optional(),
    })
    .optional(),
  /* ≤35 words; one non-obvious checkable fact, one sensory or temporal
     particular, one actionable judgment; echoes the traveler's own words
     where a quote field fits. */
  whyThisForYou: z.string().optional(),
  prose: z.string(),
  verified: VerifiedStamp.optional(),
  /* For decision_point: the disclosed lean and its alternative. */
  fork: z
    .object({
      lean: z.string(),
      alternative: z.string(),
      disclosure: z.string(), // "I leaned quiet over famous — say the word and I'll flip it"
    })
    .optional(),
  /* For backup: what this is a fallback for. */
  fallbackFor: BlockId.optional(),
  wallet: z
    .object({
      label: z.string(),
      qr: z.string().optional(), // payload; « sentinel redacts in derived wallet
      confirmation: z.string().optional(),
    })
    .optional(),
});
export type GuideBlock = z.infer<typeof GuideBlock>;

export const GuideDay = z.object({
  date: IsoDate,
  title: z.string(), // the palette-named day: "Golden Hour", "K-Town Neon"
  thesis: z.string(),
  dedicatedTo: z.string().optional(), // first name only — "Thursday afternoon is Maya's"
  blocks: z.array(GuideBlock),
});
export type GuideDay = z.infer<typeof GuideDay>;

export const LooseEnd = z.object({
  id: z.string(),
  text: z.string(),
  severity: z.enum(["blocking", "attend", "gentle"]),
  dueBy: IsoDateTime.optional(),
  /* Which checker or cancellation window produced this. Loose ends are the
     verifier's public face: "Every loose end is tied. Enjoy the quiet." is a
     sentence the system may only emit when provably true. */
  origin: z.string(),
});
export type LooseEnd = z.infer<typeof LooseEnd>;

export const Guide = z.object({
  schema: z.literal("excurse.guide.v3"),
  tripTitle: z.string(),
  destination: z.string(),
  thesis: z.string(),
  travelers: z.array(z.object({ name: z.string(), role: z.enum(["primary", "invitee", "child"]) })),
  days: z.array(GuideDay).min(1),
  looseEnds: z.array(LooseEnd).default([]),
  packing: z.array(z.object({ label: z.string(), forTraveler: z.string().optional() })).default([]),
  composedAt: IsoDateTime,
  refreshedAt: IsoDateTime.optional(),
});
export type Guide = z.infer<typeof Guide>;

/* Sentence→claim sidecar: stays in the trip directory, never ships whole. A
   compact block→claims map survives into the bundle so the refresh pass knows
   which prose a changed fact touches. */
export const CitationSidecar = z.record(BlockId, z.array(ClaimId));
export type CitationSidecar = z.infer<typeof CitationSidecar>;
