import { z } from "zod";

/* Identity. ULIDs keep ids sortable-by-creation, which matters for append-only
   stores that are diffed and merged in git. Prefixes make every id self-describing
   in a grep. */
export const ID_PREFIXES = {
  episode: "ep",
  statement: "st",
  node: "nd",
  question: "qu",
  research: "rt",
  claim: "cl",
  block: "bk",
} as const;
export type IdKind = keyof typeof ID_PREFIXES;

const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/;
export const idSchema = (kind: IdKind) =>
  z
    .string()
    .refine(
      (s) => s.startsWith(ID_PREFIXES[kind] + "_") && ULID_RE.test(s.slice(ID_PREFIXES[kind].length + 1)),
      { message: `expected ${ID_PREFIXES[kind]}_<ULID>` },
    );

export const EpisodeId = idSchema("episode");
export const StatementId = idSchema("statement");
export const NodeId = idSchema("node");
export const QuestionId = idSchema("question");
export const ResearchTaskId = idSchema("research");
export const ClaimId = idSchema("claim");
export const BlockId = idSchema("block");

export type EpisodeId = z.infer<typeof EpisodeId>;
export type StatementId = z.infer<typeof StatementId>;
export type NodeId = z.infer<typeof NodeId>;
export type QuestionId = z.infer<typeof QuestionId>;
export type ResearchTaskId = z.infer<typeof ResearchTaskId>;
export type ClaimId = z.infer<typeof ClaimId>;
export type BlockId = z.infer<typeof BlockId>;

/* Crockford-base32 ULID, no external dependency. Monotonicity within a
   millisecond is not required — ties sort arbitrarily and nothing downstream
   assumes otherwise. */
const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export function ulid(now: number = Date.now(), rand: () => number = Math.random): string {
  let t = now;
  let time = "";
  for (let i = 0; i < 10; i++) {
    time = B32[t % 32] + time;
    t = Math.floor(t / 32);
  }
  let entropy = "";
  for (let i = 0; i < 16; i++) entropy += B32[Math.floor(rand() * 32)];
  return time + entropy;
}
export const mintId = (kind: IdKind, now?: number, rand?: () => number) =>
  `${ID_PREFIXES[kind]}_${ulid(now, rand)}`;

/* Timestamps are ISO-8601 strings everywhere. Bi-temporality lives on the
   statement, not in clever storage. */
export const IsoDateTime = z.string().datetime({ offset: true }).or(z.string().datetime());
export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");
export const Confidence = z.number().min(0).max(1);
