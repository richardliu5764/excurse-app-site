import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { TripStore } from "@excursed/graph";
import type { ConstraintNode } from "@excursed/schema";
import { SAFETY_SWEEP_KEY, STORY_NEGATIVE_KEY } from "./bank.js";
import { SealGuardError, answer, nextQuestion, seal, startSession, summary } from "./session.js";

const tmpStore = (): TripStore =>
  TripStore.open(fs.mkdtempSync(path.join(os.tmpdir(), "excursed-interview-")));

const clock = (): (() => string) => {
  let i = 0;
  return () => new Date(Date.UTC(2026, 0, 1, 0, 0, i++)).toISOString();
};

describe("primary session, replayed turn by turn", () => {
  it("runs the canonical flow: frame → story → follow-up → occasion → peak → leans → constraints, within budget", () => {
    const store = tmpStore();
    const state = startSession(store, { travelerLabel: "Riley", now: clock() });

    // FRAME (≤2): least-evidence-first among the frame questions
    expect(nextQuestion(state)!.key).toBe("frame.dates");
    answer(state, { kind: "text", text: "October 12 through 16, fixed — school break." });
    expect(nextQuestion(state)!.key).toBe("frame.lodging");
    answer(state, { kind: "text", text: "Booked already: a small hotel near the old town." });

    // STORY: the anchor, first and effectively mandatory
    expect(nextQuestion(state)!.key).toBe("story.anchor");
    answer(state, {
      kind: "story",
      text:
        "There was a tiny counter in Osaka where the owner kept bringing us things we didn't order. " +
        "We stayed three hours and nobody looked at a clock once.",
    });

    // STORY_FOLLOWUP: story was rich → mini-tour, not the negative probe
    expect(nextQuestion(state)!.key).toBe("story.minitour");
    answer(state, { kind: "text", text: "We had walked all morning and just sat down at the first open door." });

    // OCCASION then PEAK
    expect(nextQuestion(state)!.key).toBe("occasion.meaning");
    answer(state, { kind: "chips", selected: ["Bring people back together"] });
    expect(nextQuestion(state)!.key).toBe("occasion.peak");
    answer(state, { kind: "text", text: "All four of us at one table, no phones, everyone still talking." });

    // RHYTHM_LEANS (≤2)
    expect(nextQuestion(state)!.key).toBe("rhythm.chronotype");
    answer(state, { kind: "pair", choice: "Early mornings" });
    expect(nextQuestion(state)!.key).toBe("rhythm.energy");
    answer(state, { kind: "pair", choice: "Somewhere quiet with a drink" });

    // one turn left — the budget rail reserves it for the safety sweep
    expect(nextQuestion(state)!.key).toBe(SAFETY_SWEEP_KEY);
    answer(state, { kind: "chips", selected: ["An allergy"], text: "peanuts, the serious kind" });

    expect(nextQuestion(state)).toBeNull();
    expect(state.turnIndex).toBe(9);
    expect(state.phase).toBe("SUMMARY");

    // Pass A wrote stated statements for every click, none for prose
    const statements = store.statements.loadAll();
    const stated = statements.filter((s) => s.provenance === "stated");
    for (const s of stated) {
      expect(s.confidence).toBe(0.95);
      expect(s.quote).toBeDefined();
    }
    const occasion = stated.find((s) => typeof s.to === "object" && s.to.key === "occasion_meaning");
    expect(occasion?.quote).toBe("Bring people back together");

    // the sweep asserts the whole sweep: 1 hard allergy + 4 soft none-stated
    const constraints = store.nodes.loadAll().filter((n): n is ConstraintNode => n.kind === "constraint");
    expect(constraints.filter((c) => c.severity === "hard")).toHaveLength(1);
    expect(constraints.find((c) => c.severity === "hard")?.category).toBe("allergy");
    expect(constraints.filter((c) => c.severity === "soft" && c.label === "none stated")).toHaveLength(4);

    // stories live as raw episodes; the instrument does no NLP
    const episodes = store.episodes.loadAll();
    expect(episodes).toHaveLength(9);
    expect(episodes.every((e) => e.extractedBy === undefined)).toBe(true);

    // question rows audit every ask with the scorer's number
    const rows = store.questions.loadAll();
    expect(rows).toHaveLength(9);
    expect(rows.every((r) => r.round === "instrument" && r.status === "answered")).toBe(true);
    expect(rows.filter((r) => r.bankKey !== SAFETY_SWEEP_KEY).every((r) => typeof r.score === "number")).toBe(true);

    // MI-style read-back with safety verbatim
    const text = summary(state);
    expect(text).toMatch(/Here's what I heard\./);
    expect(text).toMatch(/read back exactly/);
    expect(text).toMatch(/An allergy — peanuts, the serious kind/);
    expect(text).toMatch(/correct any of this in You/);

    expect(() => seal(state)).not.toThrow();
    expect(state.phase).toBe("SEAL");
  });

  it("selects the negative CIT probe when the story runs thin", () => {
    const store = tmpStore();
    const state = startSession(store, { travelerLabel: "Riley", now: clock() });
    answer(state, { kind: "text", text: String(nextQuestion(state)!.key) === "frame.dates" ? "June, flexible dates." : "x" });
    answer(state, { kind: "text", text: "Nothing booked yet at all." });
    expect(nextQuestion(state)!.key).toBe("story.anchor");
    answer(state, { kind: "story", text: "The beach was nice, that one time." });
    expect(nextQuestion(state)!.key).toBe(STORY_NEGATIVE_KEY);
  });

  it("may not seal without the safety sweep answered or explicitly declined", () => {
    const store = tmpStore();
    const state = startSession(store, { travelerLabel: "Riley", now: clock() });
    nextQuestion(state);
    answer(state, { kind: "text", text: "October 12 through 16, fixed." });
    expect(() => seal(state)).toThrow(SealGuardError);
  });

  it("treats declines as statements and lets the session seal on them", () => {
    const store = tmpStore();
    const state = startSession(store, { travelerLabel: "Riley", now: clock() });
    // burn through to the sweep
    let q = nextQuestion(state);
    while (q !== null && q.key !== SAFETY_SWEEP_KEY) {
      answer(state, q.kind === "pair" ? { kind: "pair", choice: q.options![0]! } : { kind: "text", text: "A long enough answer to not be minimal." });
      q = nextQuestion(state);
    }
    expect(q!.key).toBe(SAFETY_SWEEP_KEY);
    answer(state, { kind: "decline" });

    const declined = store.statements.loadAll().find((s) => s.provenance === "observed");
    expect(declined).toBeDefined();
    expect(declined!.to).toEqual({ key: "declined", value: SAFETY_SWEEP_KEY });
    expect(store.questions.loadAll().some((r) => r.bankKey === SAFETY_SWEEP_KEY && r.status === "declined")).toBe(true);
    expect(() => seal(state)).not.toThrow();
  });

  it("never allows skipping the safety sweep", () => {
    const store = tmpStore();
    const state = startSession(store, { travelerLabel: "Riley", now: clock() });
    let q = nextQuestion(state);
    while (q !== null && q.key !== SAFETY_SWEEP_KEY) {
      answer(state, q.kind === "pair" ? { kind: "pair", choice: q.options![0]! } : { kind: "text", text: "A long enough answer to not be minimal." });
      q = nextQuestion(state);
    }
    expect(() => answer(state, { kind: "skip" })).toThrow(/never skippable/);
  });

  it("decays after two consecutive minimal answers: jump to constraints, then summary", () => {
    const store = tmpStore();
    const state = startSession(store, { travelerLabel: "Riley", now: clock() });
    nextQuestion(state);
    answer(state, { kind: "text", text: "idk" });
    nextQuestion(state);
    const out = answer(state, { kind: "text", text: "whatever" });
    expect(out.minimal).toBe(true);
    expect(state.decayed).toBe(true);
    expect(state.phase).toBe("CONSTRAINTS");
    expect(nextQuestion(state)!.key).toBe(SAFETY_SWEEP_KEY);
    answer(state, { kind: "chips", selected: [] }); // empty selection = nothing to plan around
    expect(nextQuestion(state)).toBeNull();
    expect(state.phase).toBe("SUMMARY");
    expect(state.turnIndex).toBe(3); // stopped early — the MI move, not the budget
  });

  it("skips optional questions on request and counts them toward decay", () => {
    const store = tmpStore();
    const state = startSession(store, { travelerLabel: "Riley", now: clock() });
    const q = nextQuestion(state)!;
    expect(q.safety).toBe(false);
    const out = answer(state, { kind: "skip" });
    expect(out.minimal).toBe(true);
    expect(out.statementIds).toHaveLength(0);
    expect(store.questions.loadAll()[0]!.status).toBe("expired");
  });
});
