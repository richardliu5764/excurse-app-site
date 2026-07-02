import {
  SESSION_PHASES,
  TURN_BUDGETS,
  mintId,
  type BankEntry,
  type EpisodeId,
  type NodeId,
  type QuestionRow,
  type SessionPhase,
} from "@excursed/schema";
import { GraphQuery, type TripStore } from "@excursed/graph";
import {
  BANK,
  PEAK_KEY,
  SAFETY_NONE_OPTION,
  SAFETY_OPTION_ASPECT,
  SAFETY_SWEEP_KEY,
  STORY_ANCHOR_KEY,
  STORY_MINITOUR_KEY,
  STORY_NEGATIVE_KEY,
  bankEntry,
} from "./bank.js";
import { score, type ScoredQuestion } from "./scorer.js";
import { passAWrite, STATED_CONFIDENCE } from "./passa.js";

/* Round 1 — the instrument. All local, all deterministic, no LLM anywhere in
   this file: the thinking happens at the desk (Pass B), the instrument only
   sequences bank questions and records clicks as stated statements.

   FRAME ─▶ STORY ─▶ STORY_FOLLOWUP(≤1) ─▶ OCCASION ─▶ PEAK ─▶ RHYTHM_LEANS(≤2)
   ─▶ TIEBREAK(≤2, gated) ─▶ CONSTRAINTS(never skippable) ─▶ SUMMARY ─▶ SEAL
   Exit rails: skip on any optional · engagement decay (2 consecutive minimal
   answers → CONSTRAINTS → SUMMARY) · hard budget per TURN_BUDGETS. */

export type Audience = "primary" | "invitee" | "child";

/* A story answer under this many characters is "thin": the follow-up template
   switches to the negative CIT probe (dealbreakers surface faster from bad
   memories than good ones). */
export const STORY_THIN_CHARS = 120;
/* A typed answer under this many characters counts as minimal engagement. */
export const MINIMAL_TEXT_CHARS = 15;
export const DECAY_LIMIT = 2;
/* TIEBREAK pairs are gated: asked only when the score still clears this after
   the ask-cost of a late turn — forced choice for genuine ties, never filler. */
export const TIEBREAK_THRESHOLD = 1;
export const CHILD_TURN_BUDGET = 2;

export class SealGuardError extends Error {
  constructor() {
    super(
      "cannot SEAL: the safety sweep has not been answered or explicitly declined. " +
        "Constraints override stopping in Round 1 — declines are statements too.",
    );
    this.name = "SealGuardError";
  }
}

export type AnswerInput =
  | { kind: "chips"; selected: string[]; text?: string }
  | { kind: "pair"; choice: string }
  | { kind: "scale"; value: number }
  | { kind: "text"; text: string }
  | { kind: "story"; text: string }
  | { kind: "skip" }
  | { kind: "decline" };

export interface AnswerOutcome {
  episodeId: EpisodeId | null;
  statementIds: string[];
  nodeIds: string[];
  minimal: boolean;
  phase: SessionPhase;
}

export interface SessionState {
  readonly store: TripStore;
  readonly travelerId: NodeId;
  readonly travelerLabel: string;
  readonly audience: Audience;
  readonly budget: number;
  /** children answer playful questions; their constraints arrive by proxy */
  readonly safetyRequired: boolean;
  readonly now: () => string;
  phase: SessionPhase;
  turnIndex: number;
  askedKeys: string[];
  currentKey: string | null;
  /** scorer output at ask time, persisted onto the QuestionRow for audit */
  currentScore: ScoredQuestion | null;
  consecutiveMinimal: number;
  safetyAnswered: boolean;
  decayed: boolean;
  lastStoryLength: number;
  phaseAsked: Record<SessionPhase, number>;
  episodeIds: EpisodeId[];
  /** the traveler's words, collected for the MI-style read-back */
  echoes: string[];
  /** safety answers, read back verbatim — never summarized */
  safetyEchoes: string[];
  declinedKeys: string[];
}

/* Per-audience phase turn caps — the shape of each variant. The invitee
   4-turn variant: short anchor, one rhythm lean, veto + sweep. */
const PHASE_CAPS: Record<Audience, Record<SessionPhase, number>> = {
  primary: {
    FRAME: 2,
    STORY: 1,
    STORY_FOLLOWUP: 1,
    OCCASION: 1,
    PEAK: 1,
    RHYTHM_LEANS: 2,
    TIEBREAK: 2,
    CONSTRAINTS: 2,
    SUMMARY: 0,
    SEAL: 0,
  },
  invitee: {
    FRAME: 0,
    STORY: 1,
    STORY_FOLLOWUP: 0,
    OCCASION: 0,
    PEAK: 0,
    RHYTHM_LEANS: 1,
    TIEBREAK: 0,
    CONSTRAINTS: 2,
    SUMMARY: 0,
    SEAL: 0,
  },
  child: {
    FRAME: 0,
    STORY: 1,
    STORY_FOLLOWUP: 0,
    OCCASION: 1,
    PEAK: 0,
    RHYTHM_LEANS: 0,
    TIEBREAK: 0,
    CONSTRAINTS: 0,
    SUMMARY: 0,
    SEAL: 0,
  },
};

const BUDGETS: Record<Audience, number> = {
  primary: TURN_BUDGETS.primary,
  invitee: TURN_BUDGETS.invitee,
  child: CHILD_TURN_BUDGET,
};

export interface StartSessionOpts {
  travelerLabel: string;
  /** pass an existing traveler node id; otherwise one is minted */
  travelerId?: NodeId;
  audience?: Audience;
  now?: () => string;
}

export function startSession(store: TripStore, opts: StartSessionOpts): SessionState {
  const audience = opts.audience ?? "primary";
  const now = opts.now ?? (() => new Date().toISOString());
  let travelerId = opts.travelerId;
  if (travelerId === undefined) {
    const node = store.nodes.append({
      id: mintId("node"),
      kind: "traveler",
      label: opts.travelerLabel,
      createdAt: now(),
      role: audience,
    });
    travelerId = node.id;
  }
  const phaseAsked = Object.fromEntries(SESSION_PHASES.map((p) => [p, 0])) as Record<
    SessionPhase,
    number
  >;
  return {
    store,
    travelerId,
    travelerLabel: opts.travelerLabel,
    audience,
    budget: BUDGETS[audience],
    safetyRequired: audience !== "child",
    now,
    phase: "FRAME",
    turnIndex: 0,
    askedKeys: [],
    currentKey: null,
    currentScore: null,
    consecutiveMinimal: 0,
    safetyAnswered: false,
    decayed: false,
    lastStoryLength: Number.POSITIVE_INFINITY,
    phaseAsked,
    episodeIds: [],
    echoes: [],
    safetyEchoes: [],
    declinedKeys: [],
  };
}

const phaseIndex = (p: SessionPhase): number => SESSION_PHASES.indexOf(p);

function safetyTurnsNeeded(state: SessionState): number {
  if (!state.safetyRequired || state.safetyAnswered) return 0;
  return BANK.filter(
    (e) => e.safety && e.audience.includes(state.audience) && !state.askedKeys.includes(e.key),
  ).length;
}

function candidatesFor(state: SessionState): BankEntry[] {
  const open = BANK.filter(
    (e) => e.audience.includes(state.audience) && !state.askedKeys.includes(e.key),
  );
  switch (state.phase) {
    case "FRAME":
      return open.filter((e) => e.movement === "frame");
    case "STORY":
      // the episodic anchor — first and effectively mandatory. Children get
      // their own playful story-movement question instead.
      return state.audience === "child"
        ? open.filter((e) => e.movement === "story")
        : open.filter((e) => e.key === STORY_ANCHOR_KEY);
    case "STORY_FOLLOWUP": {
      // template-selected, ≤1: thin story → the negative CIT probe.
      const key = state.lastStoryLength < STORY_THIN_CHARS ? STORY_NEGATIVE_KEY : STORY_MINITOUR_KEY;
      return open.filter((e) => e.key === key);
    }
    case "OCCASION":
      return open.filter((e) => e.movement === "occasion" && e.key !== PEAK_KEY);
    case "PEAK":
      return open.filter((e) => e.key === PEAK_KEY);
    case "RHYTHM_LEANS":
      return open.filter((e) => e.movement === "rhythm" && e.impact === "SKELETON");
    case "TIEBREAK":
      return open.filter((e) => e.movement === "rhythm" && e.impact !== "SKELETON");
    case "CONSTRAINTS":
      // After engagement decay only the safety sweep survives — the MI move
      // is to stop pushing, not to squeeze in optional constraint questions.
      return open.filter((e) => e.movement === "constraints" && (!state.decayed || e.safety));
    default:
      return [];
  }
}

/* Least-evidence-first within the movement, safety/anchor before taste: the
   scorer's impact classes do the tiering, coverage does the evidence. */
export function nextQuestion(state: SessionState): BankEntry | null {
  if (state.currentKey !== null) {
    return bankEntry(state.currentKey); // asked but unanswered — same question
  }
  const coverage = GraphQuery.fromStore(state.store).coverage();

  for (;;) {
    if (state.phase === "SUMMARY" || state.phase === "SEAL") return null;

    const overBudget = state.turnIndex >= state.budget;
    const mustReserve =
      state.budget - state.turnIndex <= safetyTurnsNeeded(state) &&
      phaseIndex(state.phase) < phaseIndex("CONSTRAINTS");
    if (overBudget || mustReserve) {
      // Budget is hard for everything except the safety sweep, which may not
      // be left behind: constraints override stopping in Round 1 only.
      if (safetyTurnsNeeded(state) > 0) {
        state.phase = "CONSTRAINTS";
      } else if (overBudget) {
        state.phase = "SUMMARY";
        continue;
      }
    }

    const cap = PHASE_CAPS[state.audience][state.phase];
    let picked: { entry: BankEntry; scored: ScoredQuestion } | null = null;
    if (state.phaseAsked[state.phase] < cap) {
      const mandatory = state.phase === "CONSTRAINTS" || state.phase === "STORY";
      let best: { entry: BankEntry; scored: ScoredQuestion } | null = null;
      for (const entry of candidatesFor(state)) {
        const scored = score(entry, coverage, state.turnIndex);
        if (!mandatory && scored.score <= 0) continue;
        if (state.phase === "TIEBREAK" && scored.score < TIEBREAK_THRESHOLD) continue;
        if (best === null || scored.score > best.scored.score) best = { entry, scored };
      }
      picked = best;
    }
    if (picked === null) {
      state.phase = SESSION_PHASES[phaseIndex(state.phase) + 1]!;
      continue;
    }
    state.currentKey = picked.entry.key;
    state.currentScore = picked.scored;
    return picked.entry;
  }
}

function kindMatches(entry: BankEntry, input: AnswerInput): boolean {
  if (input.kind === "skip" || input.kind === "decline") return true;
  if (entry.kind === "story" || entry.kind === "text") {
    return input.kind === "story" || input.kind === "text";
  }
  return entry.kind === input.kind;
}

function episodeText(input: AnswerInput): string {
  switch (input.kind) {
    case "chips":
      return [input.selected.join(", "), input.text?.trim()].filter(Boolean).join(" — ");
    case "pair":
      return input.choice;
    case "scale":
      return String(input.value);
    case "text":
    case "story":
      return input.text;
    case "skip":
      return "(skipped)";
    case "decline":
      return "(declined)";
  }
}

export function answer(state: SessionState, input: AnswerInput): AnswerOutcome {
  if (state.currentKey === null) {
    throw new Error("answer() called with no pending question — call nextQuestion() first");
  }
  const entry = bankEntry(state.currentKey);
  if (!kindMatches(entry, input)) {
    throw new Error(`bank entry ${entry.key} is kind '${entry.kind}', got answer kind '${input.kind}'`);
  }
  if (input.kind === "skip" && entry.safety) {
    throw new Error(`${entry.key}: constraints are never skippable — answer or explicitly decline`);
  }
  const now = state.now();

  const episode = state.store.episodes.append({
    id: mintId("episode"),
    kind: "interview_turn",
    at: now,
    traveler: state.travelerId,
    question: entry.key,
    structured: input.kind === "text" || input.kind === "story" ? undefined : input,
    text: episodeText(input),
  });
  state.episodeIds.push(episode.id);
  const source = [{ episode: episode.id }];

  const statementIds: string[] = [];
  const nodeIds: string[] = [];
  const write = (w: { statements: { id: string }[]; nodes: { id: string }[] }): void => {
    for (const id of w.statements.map((s) => s.id)) statementIds.push(id);
    for (const id of w.nodes.map((n) => n.id)) nodeIds.push(id);
  };

  let minimal = false;
  let status: QuestionRow["status"] = "answered";

  switch (input.kind) {
    case "skip":
      minimal = true;
      status = "expired";
      // a skipped anchor counts as the thinnest possible story: the follow-up
      // template falls back to the negative CIT probe
      if (entry.key === STORY_ANCHOR_KEY) state.lastStoryLength = 0;
      break;
    case "decline": {
      // Declines are statements too: the composer designs around them with
      // disclosed hedges. Recorded as observed behavior (no verbatim words
      // exist, and hasConstraint is stated-only), so safety coverage stays
      // honest at zero — the declined QuestionRow is what stops re-asking.
      status = "declined";
      state.declinedKeys.push(entry.key);
      const st = state.store.statements.append({
        id: mintId("statement"),
        from: state.travelerId,
        rel: "hasProperty",
        to: { key: "declined", value: entry.key },
        provenance: "observed",
        confidence: 1,
        source,
        assertedAt: now,
        note: "declined: design around this with a disclosed hedge",
      });
      statementIds.push(st.id);
      if (entry.safety) {
        state.safetyAnswered = true;
        state.safetyEchoes.push("You chose not to answer the practical sweep. I will plan around that, and say so.");
      }
      break;
    }
    case "chips": {
      if (entry.safety) {
        const detail = input.text?.trim();
        const positives = input.selected.filter((o) => SAFETY_OPTION_ASPECT[o] !== undefined);
        for (const aspect of entry.aspects) {
          const option = positives.find((o) => SAFETY_OPTION_ASPECT[o] === aspect);
          if (option !== undefined) {
            const w = passAWrite({
              aspect,
              travelerId: state.travelerId,
              value: detail !== undefined && detail !== "" ? `${option}: ${detail}` : option,
              quote: option,
              source,
              now,
              ...(detail !== undefined && detail !== "" ? { note: detail } : {}),
            });
            state.store.nodes.appendMany(w.nodes);
            state.store.statements.appendMany(w.statements);
            write(w);
          } else {
            // Answering the sweep asserts the whole sweep: unmentioned
            // categories are none-stated (soft node — never a hard constraint).
            const w = passAWrite({
              aspect,
              travelerId: state.travelerId,
              value: "none",
              quote: input.selected.length > 0 ? input.selected.join(", ") : SAFETY_NONE_OPTION,
              source,
              now,
              negative: true,
            });
            state.store.nodes.appendMany(w.nodes);
            state.store.statements.appendMany(w.statements);
            write(w);
          }
        }
        state.safetyAnswered = true;
        for (const o of positives) {
          state.safetyEchoes.push(detail !== undefined && detail !== "" ? `${o} — ${detail}` : o);
        }
        if (positives.length === 0) state.safetyEchoes.push(SAFETY_NONE_OPTION);
      } else {
        for (const option of input.selected) {
          for (const aspect of entry.aspects) {
            const w = passAWrite({
              aspect,
              travelerId: state.travelerId,
              value: option,
              quote: option,
              source,
              now,
            });
            state.store.nodes.appendMany(w.nodes);
            state.store.statements.appendMany(w.statements);
            write(w);
          }
          state.echoes.push(option);
        }
      }
      break;
    }
    case "pair": {
      if (entry.options !== undefined && !entry.options.includes(input.choice)) {
        throw new Error(`${entry.key}: '${input.choice}' is not one of the offered options`);
      }
      for (const aspect of entry.aspects) {
        const w = passAWrite({
          aspect,
          travelerId: state.travelerId,
          value: input.choice,
          quote: input.choice,
          source,
          now,
        });
        state.store.nodes.appendMany(w.nodes);
        state.store.statements.appendMany(w.statements);
        write(w);
      }
      state.echoes.push(input.choice);
      break;
    }
    case "scale": {
      for (const aspect of entry.aspects) {
        const w = passAWrite({
          aspect,
          travelerId: state.travelerId,
          value: input.value,
          quote: String(input.value),
          source,
          now,
        });
        state.store.nodes.appendMany(w.nodes);
        state.store.statements.appendMany(w.statements);
        write(w);
      }
      state.echoes.push(String(input.value));
      break;
    }
    case "text":
    case "story": {
      // Stored raw; the instrument does NO NLP. Pass B reads it at the desk.
      const trimmed = input.text.trim();
      minimal = trimmed.length < MINIMAL_TEXT_CHARS;
      if (entry.movement === "story" && entry.key === STORY_ANCHOR_KEY) {
        state.lastStoryLength = trimmed.length;
      }
      if (trimmed.length > 0) {
        state.echoes.push(trimmed.length > 90 ? `${trimmed.slice(0, 90)}…` : trimmed);
      }
      break;
    }
  }

  state.store.questions.append({
    id: mintId("question"),
    bankKey: entry.key,
    aspects: [...entry.aspects],
    impact: entry.impact,
    travelerId: state.travelerId,
    status,
    round: "instrument",
    ...(state.currentScore !== null && Number.isFinite(state.currentScore.score)
      ? { score: state.currentScore.score }
      : {}),
    createdAt: now,
    resolvedAt: now,
  });

  state.askedKeys.push(entry.key);
  state.phaseAsked[state.phase] += 1;
  state.turnIndex += 1;
  state.currentKey = null;
  state.currentScore = null;

  state.consecutiveMinimal = minimal ? state.consecutiveMinimal + 1 : 0;
  if (state.consecutiveMinimal >= DECAY_LIMIT && phaseIndex(state.phase) < phaseIndex("CONSTRAINTS")) {
    // The MI move: stop pushing, sweep constraints, summarize.
    state.decayed = true;
    state.phase = safetyTurnsNeeded(state) > 0 ? "CONSTRAINTS" : "SUMMARY";
  }

  return { episodeId: episode.id, statementIds, nodeIds, minimal, phase: state.phase };
}

/* MI-style read-back: collect the threads and hand them back in the
   traveler's own words. Safety is read back verbatim, never summarized. */
export function summary(state: SessionState): string {
  const lines: string[] = ["Here's what I heard."];
  for (const echo of state.echoes) lines.push(`— ${echo}`);
  if (state.safetyEchoes.length > 0) {
    lines.push("The practical ones, read back exactly:");
    for (const echo of state.safetyEchoes) lines.push(`— ${echo}`);
  }
  lines.push("I'll go research and compose. You can correct any of this in You.");
  return lines.join("\n");
}

export function seal(state: SessionState): void {
  if (state.safetyRequired && !state.safetyAnswered) throw new SealGuardError();
  state.phase = "SEAL";
}
