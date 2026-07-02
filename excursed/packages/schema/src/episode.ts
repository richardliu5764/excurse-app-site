import { z } from "zod";
import { EpisodeId, NodeId, IsoDateTime } from "./core.js";

/* Episodes are canonical; the graph is a projection. Every word a traveler
   says, every inbox paste, every observation is an append-only episode, and
   the graph is rebuildable from episodes at any time by re-running extraction.
   Extraction is a cache fill, not ingestion: better models later re-derive a
   better graph from the same stories without re-interviewing anyone, and
   extraction bugs are recoverable instead of permanent corruption of the
   model of a real family. */
export const EPISODE_KINDS = [
  "interview_turn", // one Q/A exchange in the instrument
  "letter", // planner's letter or traveler's reply (Round 2)
  "draft_reaction", // decision_point answer / margin note on a draft (Round 3)
  "inbox_drop", // pasted TikTok/Instagram/YouTube/Maps save
  "observation", // mid-trip event: skip, visited mark, "meltdown at 2pm"
  "afterglow_turn", // post-trip reflection interview
  "composer_note", // the owner's own note about these people
] as const;
export const EpisodeKind = z.enum(EPISODE_KINDS);
export type EpisodeKind = z.infer<typeof EpisodeKind>;

export const Episode = z.object({
  id: EpisodeId,
  kind: EpisodeKind,
  at: IsoDateTime,
  /* Who this episode is about/from. Traveler node id when known; the
     instrument runs before nodes exist, so a local alias is allowed and
     resolved at extraction time. */
  traveler: z.union([NodeId, z.string()]).optional(),
  /* For interview turns: which bank question was asked (bank key), and the
     structured answer if the question kind was chips/scale/pair. */
  question: z.string().optional(),
  structured: z.unknown().optional(),
  /* Verbatim text: the story, the paste, the reply. Never paraphrased. */
  text: z.string().default(""),
  /* Original URL for inbox drops. */
  url: z.string().url().optional(),
  /* Extraction bookkeeping: which extractor run last projected this episode
     into the graph. Absent = not yet extracted. */
  extractedBy: z.string().optional(),
});
export type Episode = z.infer<typeof Episode>;
