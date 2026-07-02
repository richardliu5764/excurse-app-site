import { z } from "zod";
import { Confidence } from "./core.js";

/* Impact classes make "a few quiet questions" a theorem about the scorer
   instead of copy. Every coverage aspect carries a hand-assigned class derived
   from which plan surface it touches. SAFETY is modeled as Infinity at scoring
   time; serialized as the string sentinel here. */
export const IMPACT_CLASSES = {
  SAFETY: Number.POSITIVE_INFINITY, // allergy, mobility, child — always asked, never inferred
  SKELETON: 8, // dates, lodging, fixed anchors, chronotype, pace, rest, budget posture
  SELECTION: 4, // tastes, food adventurousness, novelty lean, vetoes
  TEXTURE: 2, // values ladder, home baseline, peak type — infer; confirm by reflection
  TRIVIA: 0, // never ask
} as const;
export const ImpactClass = z.enum(["SAFETY", "SKELETON", "SELECTION", "TEXTURE", "TRIVIA"]);
export type ImpactClass = z.infer<typeof ImpactClass>;

/* Coverage aspects: the things the plan needs to know. The scorer asks per
   aspect "what is the best confidence the graph currently has?", and the bank
   maps questions to the aspects they feed. */
export const ASPECTS = [
  // SAFETY
  "safety.allergy",
  "safety.diet",
  "safety.mobility",
  "safety.medical",
  "safety.child",
  // SKELETON
  "skeleton.dates",
  "skeleton.lodging",
  "skeleton.fixed_anchors",
  "skeleton.chronotype",
  "skeleton.pace",
  "skeleton.rest_windows",
  "skeleton.budget_posture",
  "skeleton.breakfast_behavior",
  "skeleton.walking_radius",
  // SELECTION
  "selection.food_tastes",
  "selection.food_adventurousness",
  "selection.novelty_lean",
  "selection.interests",
  "selection.vetoes",
  "selection.crowd_tolerance",
  // TEXTURE
  "texture.values",
  "texture.occasion_meaning",
  "texture.peak_moment",
  "texture.home_baseline",
  "texture.story",
] as const;
export const Aspect = z.enum(ASPECTS);
export type Aspect = z.infer<typeof Aspect>;

export const QUESTION_KINDS = ["story", "chips", "scale", "pair", "text"] as const;
export const QuestionKind = z.enum(QUESTION_KINDS);
export type QuestionKind = z.infer<typeof QuestionKind>;

/* A bank entry, not a script line. The policy selects from the bank; shipping
   a fixed script would repeat the current mistake with better furniture. */
export const BankEntry = z.object({
  key: z.string(), // stable, e.g. "story.anchor"
  kind: QuestionKind,
  aspects: z.array(Aspect).min(1),
  impact: ImpactClass,
  /* Oil questions lubricate (cheap, warm); Tar questions stick (heavier, only
     when the score justifies). The shipped vocabulary — it works. */
  tier: z.enum(["oil", "tar"]).default("oil"),
  safety: z.boolean().default(false),
  audience: z.array(z.enum(["primary", "invitee", "child"])).default(["primary"]),
  /* Voice-approved phrasings; the instrument picks one. Never generated live. */
  phrasings: z.array(z.string()).min(1),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(), // for chips/pair
  movement: z.enum(["frame", "story", "occasion", "rhythm", "constraints"]),
});
export type BankEntry = z.infer<typeof BankEntry>;

/* Round-1 instrument state machine. All local, all deterministic. */
export const SESSION_PHASES = [
  "FRAME",
  "STORY",
  "STORY_FOLLOWUP",
  "OCCASION",
  "PEAK",
  "RHYTHM_LEANS",
  "TIEBREAK",
  "CONSTRAINTS",
  "SUMMARY",
  "SEAL",
] as const;
export const SessionPhase = z.enum(SESSION_PHASES);
export type SessionPhase = z.infer<typeof SessionPhase>;

export const TURN_BUDGETS = { primary: 9, invitee: 4, letter: 3 } as const;

export const AspectCoverage = z.record(z.string(), Confidence);
export type AspectCoverage = z.infer<typeof AspectCoverage>;
