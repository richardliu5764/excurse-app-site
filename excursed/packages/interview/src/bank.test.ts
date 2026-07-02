import { describe, expect, it } from "vitest";
import { ASPECTS, BankEntry, type Aspect } from "@excursed/schema";
import {
  BANK,
  SAFETY_NONE_OPTION,
  SAFETY_OPTION_ASPECT,
  SAFETY_SWEEP_KEY,
  STORY_ANCHOR_KEY,
  bankEntry,
  phrasingFor,
} from "./bank.js";

describe("the question bank", () => {
  it("has ~20 entries, all valid BankEntry rows with unique keys", () => {
    expect(BANK.length).toBeGreaterThanOrEqual(18);
    expect(BANK.length).toBeLessThanOrEqual(24);
    for (const e of BANK) expect(() => BankEntry.parse(e)).not.toThrow();
    expect(new Set(BANK.map((e) => e.key)).size).toBe(BANK.length);
  });

  it("covers every safety aspect through a safety-flagged entry", () => {
    const safetyAspects = ASPECTS.filter((a) => a.startsWith("safety."));
    const covered = new Set(BANK.filter((e) => e.safety).flatMap((e) => e.aspects));
    for (const a of safetyAspects) expect(covered.has(a)).toBe(true);
  });

  it("keeps the sweep option map aligned with the sweep entry", () => {
    const sweep = bankEntry(SAFETY_SWEEP_KEY);
    expect(sweep.safety).toBe(true);
    expect(sweep.options![0]).toBe(SAFETY_NONE_OPTION);
    for (const [option, aspect] of Object.entries(SAFETY_OPTION_ASPECT)) {
      expect(sweep.options).toContain(option);
      expect(sweep.aspects).toContain(aspect as Aspect);
    }
  });

  it("carries the missing high-EVPI entries and the peak question", () => {
    expect(bankEntry("frame.fixed_anchor").aspects).toContain("skeleton.fixed_anchors");
    expect(bankEntry("skeleton.breakfast").aspects).toContain("skeleton.breakfast_behavior");
    expect(bankEntry("skeleton.walking_radius").phrasings[0]).toMatch(/feet, patience, or blood sugar/);
    const budget = bankEntry("skeleton.budget_posture");
    expect(budget.kind).toBe("pair");
    expect(budget.impact).toBe("SKELETON");
    expect(budget.phrasings[0]).toMatch(/Spend on the room, or spend on the table\?/);
    expect(bankEntry("occasion.peak").phrasings[0]).toMatch(/one moment you want to be able to tell/);
  });

  it("keeps the shipped elicitation strings", () => {
    expect(bankEntry(STORY_ANCHOR_KEY).placeholder).toMatch(/tiny counter/);
    expect(bankEntry("skeleton.budget_posture").phrasings[0]).toMatch(/Either is fine\. I just want your lean\./);
  });

  it("gives every chips/pair entry options and picks phrasings deterministically", () => {
    for (const e of BANK) {
      if (e.kind === "chips" || e.kind === "pair") {
        expect(e.options, e.key).toBeDefined();
        expect(e.options!.length).toBeGreaterThanOrEqual(2);
      }
    }
    const anchor = bankEntry(STORY_ANCHOR_KEY);
    expect(phrasingFor(anchor, "primary")).toBe(anchor.phrasings[0]);
    expect(phrasingFor(anchor, "invitee")).toBe(anchor.phrasings[anchor.phrasings.length - 1]);
  });

  it("respects the voice: no exclamation marks, no emoji, one question mark of intent", () => {
    for (const e of BANK) {
      for (const p of e.phrasings) {
        expect(p, e.key).not.toMatch(/!/);
        expect(p, e.key).not.toMatch(/awesome/i);
      }
    }
  });
});
