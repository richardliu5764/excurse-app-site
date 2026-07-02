import { describe, expect, it } from "vitest";
import { ASPECTS, type Aspect, type AspectCoverage } from "@excursed/schema";
import { bankEntry } from "./bank.js";
import { ANSWERABILITY, ASK_COST_PER_TURN, RESEARCHABLE_COST, aspectClass, score } from "./scorer.js";

const zero = (): AspectCoverage => Object.fromEntries(ASPECTS.map((a) => [a, 0]));
const full = (): AspectCoverage => Object.fromEntries(ASPECTS.map((a) => [a, 1]));

describe("aspectClass", () => {
  it("maps aspect prefixes to impact classes", () => {
    expect(aspectClass("safety.allergy")).toBe("SAFETY");
    expect(aspectClass("skeleton.dates")).toBe("SKELETON");
    expect(aspectClass("selection.vetoes")).toBe("SELECTION");
    expect(aspectClass("texture.story")).toBe("TEXTURE");
  });
});

describe("score", () => {
  it("gives an uncovered safety question infinite score at any turn", () => {
    const s = score(bankEntry("constraints.sweep"), zero(), 8);
    expect(s.score).toBe(Number.POSITIVE_INFINITY);
    expect(s.breakdown.impactClass).toBe("SAFETY");
  });

  it("pins fully-covered safety to zero impact instead of NaN (∞ × 0)", () => {
    const s = score(bankEntry("constraints.sweep"), full(), 0);
    expect(Number.isNaN(s.score)).toBe(false);
    expect(s.score).toBe(0);
  });

  it("computes impact × uncertainty × answerability − askCost, inspectably", () => {
    const cov = zero();
    cov["skeleton.chronotype"] = 0.5;
    const s = score(bankEntry("rhythm.chronotype"), cov, 2);
    // SKELETON(8) × 0.5 × pair(1) − 2 turns of ask cost
    expect(s.score).toBeCloseTo(8 * 0.5 * 1 - ASK_COST_PER_TURN * 2);
    expect(s.breakdown.aspect).toBe("skeleton.chronotype");
    expect(s.breakdown.bestConfidence).toBe(0.5);
    expect(s.breakdown.answerability).toBe(ANSWERABILITY.pair);
    expect(s.breakdown.terms).toHaveLength(1);
  });

  it("scores by the argmax aspect when a question feeds several", () => {
    const s = score(bankEntry("story.anchor"), zero(), 0);
    // texture aspects contribute 2, selection.interests contributes 4
    expect(s.breakdown.aspect).toBe("selection.interests");
    expect(s.score).toBeCloseTo(4 * 1 * ANSWERABILITY.story);
  });

  it("rises in cost per turn", () => {
    const early = score(bankEntry("rhythm.energy"), zero(), 0).score;
    const late = score(bankEntry("rhythm.energy"), zero(), 6).score;
    expect(early - late).toBeCloseTo(6 * ASK_COST_PER_TURN);
  });

  it("jumps the ask cost when the deciding aspect is researchable — never ask what the web knows", () => {
    const researchable = new Set<Aspect>(["skeleton.dates"]);
    const s = score(bankEntry("frame.dates"), zero(), 0, researchable);
    expect(s.breakdown.researchable).toBe(true);
    expect(s.breakdown.askCost).toBe(RESEARCHABLE_COST);
    expect(s.score).toBeLessThan(0);
    const plain = score(bankEntry("frame.dates"), zero(), 0);
    expect(plain.score).toBeGreaterThan(0);
  });

  it("never lets a covered question outrank an uncovered one of the same class", () => {
    const cov = zero();
    cov["skeleton.chronotype"] = 0.95;
    const covered = score(bankEntry("rhythm.chronotype"), cov, 0).score;
    const uncovered = score(bankEntry("rhythm.energy"), cov, 0).score;
    expect(uncovered).toBeGreaterThan(covered);
  });
});
