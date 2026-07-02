import { z } from "zod";
import { ClaimId, ResearchTaskId, NodeId, IsoDateTime, IsoDate, Confidence } from "./core.js";

/* Atomic claims about the world, with sources, tiers and freshness. The T0
   rule is absolute: model memory generates hypotheses and search queries only;
   a claim citing no retrieved source fails validation. This one mechanical
   rule deletes the hallucinated-landmark failure class. */

export const SOURCE_TIERS = {
  T1: "primary", // the venue itself: official site, phone call, posted hours
  T2: "editorial", // named human, reputable editorial, recent first-person report
  T3: "aggregate", // review aggregates, forums, model-suggested-then-found
} as const;
export const SourceTier = z.enum(["T1", "T2", "T3"]);
export type SourceTier = z.infer<typeof SourceTier>;

/* How fast a fact rots, driving R6 refresh windows. */
export const Volatility = z.enum([
  "static", // an address, what a museum is
  "seasonal", // hours regimes, trail conditions
  "weekly", // specials, exhibitions
  "daily", // closures, weather-dependent operation
]);
export type Volatility = z.infer<typeof Volatility>;

export const ClaimSource = z.object({
  url: z.string().url().optional(),
  kind: z.enum(["web", "phone", "in_person", "document"]).default("web"),
  title: z.string().optional(),
  retrievedAt: IsoDateTime,
  excerpt: z.string().optional(), // the retrieved words the claim rests on
});
export type ClaimSource = z.infer<typeof ClaimSource>;

export const Claim = z
  .object({
    id: ClaimId,
    /* Which node(s) this claim is about — usually a place. */
    about: z.array(NodeId).min(1),
    /* Structured predicate + human sentence. The predicate is what checkers
       read; the sentence is what the composer may cite. */
    predicate: z.string(), // e.g. "hours(2026-10-11) = 08:00-14:00"
    sentence: z.string(),
    field: z.string(), // form field this fills, e.g. "hours_for_date"
    tier: SourceTier,
    confidence: Confidence,
    volatility: Volatility.default("seasonal"),
    sources: z.array(ClaimSource).min(1),
    lastCheckedAt: IsoDateTime,
    validFrom: IsoDate.optional(),
    validTo: IsoDate.optional(),
    taskId: ResearchTaskId.optional(),
    /* Set when a later check contradicts this claim; never delete. */
    supersededBy: ClaimId.optional(),
  })
  .superRefine((c, ctx) => {
    const hasRetrieved = c.sources.some((s) => s.url || s.kind !== "web");
    if (!hasRetrieved) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "T0 rule: claim cites no retrieved source" });
    }
  });
export type Claim = z.infer<typeof Claim>;

/* Composer firewall thresholds: plain fact requires tier ≤ T2 and fresh;
   T3 or stale speaks in pattern voice ("expect a wait after noon");
   conflicting claims are omitted. */
export const PLAIN_FACT_MAX_TIER: SourceTier = "T2";
