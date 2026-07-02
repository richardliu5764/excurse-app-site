import { z } from "zod";
import { NodeId, StatementId, EpisodeId, ClaimId, IsoDateTime, IsoDate, Confidence } from "./core.js";

/* Every statement knows how it was learned. This is the epistemic spine:
   - stated:     the person said it in so many words (quote required)
   - implied:    a clear entailment of what they said (quote required)
   - inferred:   a read of their story; confidence capped at 0.7
   - assumed:    an archetype default seeded at trip creation; capped at 0.5
   - researched: a claim about the world with retrieved sources
   - observed:   behavior (inbox saves, skips, visited marks, mid-trip events)
   The composer's contract keys off this field: commit on stated/researched,
   disclose on inferred, hedge on assumed. */
export const PROVENANCES = ["stated", "implied", "inferred", "assumed", "researched", "observed"] as const;
export const Provenance = z.enum(PROVENANCES);
export type Provenance = z.infer<typeof Provenance>;

export const RELS = [
  // people
  "memberOf", // traveler → party
  "attends", // traveler → trip | day | slot
  "hasConstraint", // traveler → constraint
  "hasTaste", // traveler → taste
  "hasRhythm", // traveler → rhythm
  "holdsTension", // traveler → tension
  "proxyFor", // traveler → traveler (organizer answered for them)
  // structure
  "partOf", // day → trip, slot → day
  "dedicatedTo", // day → traveler (fairness attribution)
  "hasTheme", // day | trip → theme
  // placement
  "scheduledAt", // slot → place
  "candidateFor", // place → slot | taste (unplaced idea)
  "books", // booking → place, booking → slot
  "lodgesAt", // trip → place
  // meaning
  "servesTaste", // place | slot → taste
  "honorsTension", // slot | day → tension
  "servesConstraint", // place → constraint (verified safe/suitable)
  "foldedFrom", // slot | place → source episode (inbox save)
  // verification
  "satisfies", // slot | day | trip → constraint | tension | taste (checker output)
  "violates", // slot | day | trip → constraint | tension | taste (checker output)
  // literals hang off nodes
  "hasProperty", // node → literal {key, value}
] as const;
export const Rel = z.enum(RELS);
export type Rel = z.infer<typeof Rel>;

export const Literal = z.object({
  key: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  unit: z.string().optional(),
});
export type Literal = z.infer<typeof Literal>;

/* Sources: episode ids for things people said/did; claim ids or URLs for
   things research found; checker ids for verifier output. NEVER empty —
   a statement that cannot be cited does not exist. */
export const SourceRef = z.union([
  z.object({ episode: EpisodeId }),
  z.object({ claim: ClaimId }),
  z.object({ url: z.string().url() }),
  z.object({ checker: z.string() }),
  z.object({ proxy: NodeId }),
]);
export type SourceRef = z.infer<typeof SourceRef>;

export const Statement = z
  .object({
    id: StatementId,
    from: NodeId,
    rel: Rel,
    to: z.union([NodeId, Literal]),
    provenance: Provenance,
    confidence: Confidence,
    source: z.array(SourceRef).min(1),
    /* For stated/implied: the verbatim traveler words. Composition echoes
       people back to themselves; this field is where voice lives. */
    quote: z.string().optional(),
    assertedAt: IsoDateTime,
    /* Bi-temporal: assertedAt/invalidatedAt track belief; validFrom/validTo
       track the world (e.g. seasonal hours). Invalidate, never delete. */
    invalidatedAt: IsoDateTime.optional(),
    validFrom: IsoDate.optional(),
    validTo: IsoDate.optional(),
    supersededBy: StatementId.optional(),
    note: z.string().optional(),
  })
  .superRefine((st, ctx) => {
    if ((st.provenance === "stated" || st.provenance === "implied") && !st.quote) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `provenance '${st.provenance}' requires a verbatim quote`,
      });
    }
    if (st.provenance === "inferred" && st.confidence > 0.7) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "inferred confidence is capped at 0.7" });
    }
    if (st.provenance === "assumed" && st.confidence > 0.5) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "assumed confidence is capped at 0.5" });
    }
  });
export type Statement = z.infer<typeof Statement>;

/* The one non-negotiable epistemic rule, enforced by schema-level validation in
   the graph store (it needs node context, so it lives beyond zod): hasConstraint
   statements must be provenance 'stated' — a story that implies a constraint
   yields an inferred taste plus a "constraint-suspect: verify by asking" note,
   never a constraint. Exported here so every organ cites one definition. */
export const CONSTRAINT_REL: Rel = "hasConstraint";
export const CONSTRAINT_ALLOWED_PROVENANCE: Provenance = "stated";
