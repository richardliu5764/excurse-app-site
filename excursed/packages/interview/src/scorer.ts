import {
  IMPACT_CLASSES,
  type Aspect,
  type AspectCoverage,
  type BankEntry,
  type ImpactClass,
  type QuestionKind,
} from "@excursed/schema";

/* score(q) = maxImpact(q.aspects) × (1 − bestConfidence) × answerability
              − askCost(turnIndex, researchable)
   (13-council-ai §4.4, v1: static impact classes). Fully deterministic and
   inspectable — the breakdown is returned so the owner can read exactly why a
   question was or wasn't asked. */

/* How likely a turn of this kind is to produce a usable answer. Clicks are
   near-free; free text costs the traveler effort and sometimes yields little. */
export const ANSWERABILITY: Readonly<Record<QuestionKind, number>> = {
  chips: 1,
  pair: 1,
  scale: 0.95,
  text: 0.75,
  story: 0.6,
};

/* Gentle enough that a TEXTURE question (impact 2) can still clear zero in
   the middle turns, steep enough that nothing optional survives past ~turn 12
   — the budget rail lands first. */
export const ASK_COST_PER_TURN = 0.15;
/* "Never ask what the web knows": when the deciding aspect is researchable the
   ask cost jumps past any finite impact term, so the question can only survive
   if it is SAFETY (infinite impact — and safety is never researchable). */
export const RESEARCHABLE_COST = 100;

export function aspectClass(aspect: Aspect): ImpactClass {
  const prefix = aspect.slice(0, aspect.indexOf("."));
  switch (prefix) {
    case "safety":
      return "SAFETY";
    case "skeleton":
      return "SKELETON";
    case "selection":
      return "SELECTION";
    case "texture":
      return "TEXTURE";
    default:
      return "TRIVIA";
  }
}

export interface AspectTerm {
  aspect: Aspect;
  impactClass: ImpactClass;
  impact: number;
  bestConfidence: number;
  uncertainty: number;
  /** impact × uncertainty, with the ∞ × 0 = NaN case pinned to 0 (fully
      covered safety contributes nothing rather than poisoning the score) */
  product: number;
}

export interface ScoreBreakdown {
  bankKey: string;
  /** the aspect that decided the score (argmax of impact × uncertainty) */
  aspect: Aspect;
  impactClass: ImpactClass;
  impact: number;
  bestConfidence: number;
  uncertainty: number;
  answerability: number;
  askCost: number;
  researchable: boolean;
  terms: AspectTerm[];
}

export interface ScoredQuestion {
  score: number;
  breakdown: ScoreBreakdown;
}

const EMPTY: ReadonlySet<Aspect> = new Set();

export function score(
  q: BankEntry,
  coverage: AspectCoverage,
  turnIndex: number,
  researchableAspects: ReadonlySet<Aspect> = EMPTY,
): ScoredQuestion {
  const terms: AspectTerm[] = q.aspects.map((aspect) => {
    const impactClass = aspectClass(aspect);
    const impact = IMPACT_CLASSES[impactClass];
    const bestConfidence = coverage[aspect] ?? 0;
    const uncertainty = 1 - bestConfidence;
    const product = uncertainty === 0 ? 0 : impact * uncertainty;
    return { aspect, impactClass, impact, bestConfidence, uncertainty, product };
  });
  let best = terms[0]!;
  for (const t of terms) if (t.product > best.product) best = t;

  const answerability = ANSWERABILITY[q.kind];
  const researchable = researchableAspects.has(best.aspect);
  const askCost = ASK_COST_PER_TURN * turnIndex + (researchable ? RESEARCHABLE_COST : 0);
  const impactTerm = best.product === 0 ? 0 : best.product * answerability;

  return {
    score: impactTerm - askCost,
    breakdown: {
      bankKey: q.key,
      aspect: best.aspect,
      impactClass: best.impactClass,
      impact: best.impact,
      bestConfidence: best.bestConfidence,
      uncertainty: best.uncertainty,
      answerability,
      askCost,
      researchable,
      terms,
    },
  };
}
