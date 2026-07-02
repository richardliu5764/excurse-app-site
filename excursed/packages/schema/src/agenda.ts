import { z } from "zod";
import { QuestionId, ResearchTaskId, NodeId, ClaimId, IsoDateTime } from "./core.js";
import { Aspect, ImpactClass } from "./interview.js";

/* Workflow, not knowledge. Questions and research tasks have lifecycles,
   owners and deadlines; they reference graph aspects and nodes but live
   outside nodes.jsonl so the model of the world stays clean of the pipeline's
   to-do list. */

export const QuestionRow = z.object({
  id: QuestionId,
  bankKey: z.string(),
  aspects: z.array(Aspect).min(1),
  impact: ImpactClass,
  travelerId: NodeId.optional(),
  status: z.enum(["pending", "asked", "answered", "declined", "expired"]).default("pending"),
  round: z.enum(["instrument", "letter", "draft_margin"]),
  score: z.number().optional(), // scorer output at queue time, for auditability
  createdAt: IsoDateTime,
  resolvedAt: IsoDateTime.optional(),
});
export type QuestionRow = z.infer<typeof QuestionRow>;

/* Research rules R1–R7. No LLM decides what to research; these rules derive
   the agenda mechanically from graph gaps after every mutation. LLMs only
   execute tasks. */
export const RESEARCH_RULES = [
  "R1_constraint_verify", // place × hard constraint → verify (T1 primary source)
  "R2_hours_for_date", // dated slot → opening hours for that date, incl. closures
  "R3_routing", // consecutive slots → travel time, parking, the walk; LEAVE BY
  "R4_discovery", // taste/tension with <2 serving candidates → find candidates
  "R5_hedge", // assumed statement the skeleton leans on → research the fallback
  "R6_refresh", // claim past validTo or volatile at T-72h/T-24h → re-check
  "R7_voice_and_depth", // major stop → one named human quote + two-things depth
] as const;
export const ResearchRule = z.enum(RESEARCH_RULES);
export type ResearchRule = z.infer<typeof ResearchRule>;

/* Fixed per-stop-type research forms. Workers fill the form or mark fields
   UNFOUND; inventing a field value is a validator error, not a style problem. */
export const FORM_KINDS = ["restaurant", "cafe", "museum", "hike", "park", "shop", "venue", "lodging", "transition", "generic"] as const;
export const FormKind = z.enum(FORM_KINDS);
export type FormKind = z.infer<typeof FormKind>;

export const UNFOUND = "UNFOUND" as const;

export const ResearchTaskRow = z.object({
  id: ResearchTaskId,
  rule: ResearchRule,
  form: FormKind,
  /* What this task is about: place/slot/constraint/taste node ids. */
  targets: z.array(NodeId).min(1),
  /* The concrete brief a worker receives, e.g. "GF-safe biscuits within a
     10-minute stroller walk of the lodging, open Sunday 8am". Composed by the
     generator from graph context; contains pseudonyms, never real names. */
  brief: z.string().min(1),
  status: z.enum(["pending", "running", "done", "unfound", "escalate_owner"]).default("pending"),
  /* Serious-allergy verifies may spawn a phone-call task for the owner. */
  ownerAction: z.string().optional(),
  resultClaimIds: z.array(ClaimId).default([]),
  createdAt: IsoDateTime,
  resolvedAt: IsoDateTime.optional(),
});
export type ResearchTaskRow = z.infer<typeof ResearchTaskRow>;
