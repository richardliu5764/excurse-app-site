import {
  TURN_BUDGETS,
  type Aspect,
  type AspectCoverage,
  type BankEntry,
  type Statement,
} from "@excursed/schema";
import { serializeStatementCompact, type LlmClient, type LlmRequest } from "@excursed/graph";
import { BANK, phrasingFor } from "./bank.js";
import { score, type ScoredQuestion } from "./scorer.js";

/* Round 2 — the planner's letter (13-council-ai §4.1/§4.4). Runs at the desk
   AFTER extraction, against post-extraction coverage: only gaps that survive
   the whole-transcript read earn a question. Most trips need zero letters;
   the letter is the exception path, not the flow. Selection is the same
   deterministic scorer as Round 1; only the drafting of prose is an LLM call,
   through the injected client, checkpointed by whoever wraps it. */

export const LETTER_MAX_QUESTIONS = TURN_BUDGETS.letter;
/* Below this, default-and-disclose instead of asking: with impact classes
   8/4/2 a threshold of 3 admits SKELETON gaps and strong SELECTION gaps and
   never lets TEXTURE trigger a letter (texture is inferred, confirmed by
   reflection in the draft, not asked by mail). SAFETY gaps score ∞. */
export const LETTER_ASK_THRESHOLD = 3;
export const LETTER_SCHEMA_NAME = "letter.v1";

export const LETTER_SYSTEM = [
  "You draft the planner's letter for a private trip-planning system.",
  "It is correspondence, not chat: one considered letter in the planner's voice.",
  "Rules — these are hard:",
  "- Open by proving you read their story: echo one of the quoted fragments",
  "  verbatim, in quotation marks. Never paraphrase a quote.",
  "- Weave in ONLY the questions given, at most one per paragraph, keeping each",
  "  question's intent and its offered options intact. Never add questions.",
  "- No exclamation marks, no emoji, no 'awesome'. Warmth is specificity.",
  "- Offer the out: any question may be answered with 'you decide'.",
  "- Close with what happens next: you research, you compose, they rest.",
  "Output plain text only: the letter, ready to send.",
].join("\n");

export interface LetterSelection {
  entry: BankEntry;
  score: number;
  scored: ScoredQuestion;
}

export interface LetterOpts {
  researchableAspects?: ReadonlySet<Aspect>;
  /** bank keys already asked/declined — from questions.jsonl; declines are
      honored here: a declined sweep is never re-asked by mail */
  excludeKeys?: readonly string[];
  audience?: "primary" | "invitee" | "child";
}

/* Greedy under the ask threshold: pick the best-scoring entry, mark its
   aspects as covered so no second question chases the same gap, repeat with
   rising ask cost. Deterministic and inspectable end to end. */
export function selectLetterQuestions(coverage: AspectCoverage, opts: LetterOpts = {}): LetterSelection[] {
  const audience = opts.audience ?? "primary";
  const excluded = new Set(opts.excludeKeys ?? []);
  const working: AspectCoverage = { ...coverage };
  const picked: LetterSelection[] = [];

  for (let turn = 0; picked.length < LETTER_MAX_QUESTIONS; turn++) {
    let best: LetterSelection | null = null;
    for (const entry of BANK) {
      if (!entry.audience.includes(audience)) continue;
      if (excluded.has(entry.key)) continue;
      if (picked.some((p) => p.entry.key === entry.key)) continue;
      const scored = score(entry, working, turn, opts.researchableAspects);
      if (scored.score < LETTER_ASK_THRESHOLD) continue;
      if (best === null || scored.score > best.score) {
        best = { entry, score: scored.score, scored };
      }
    }
    if (best === null) break;
    picked.push(best);
    for (const aspect of best.entry.aspects) working[aspect] = 1;
  }
  return picked;
}

export function needsLetter(coverage: AspectCoverage, opts: LetterOpts = {}): boolean {
  return selectLetterQuestions(coverage, opts).length > 0;
}

/* Graph excerpts ride along so the letter can echo the traveler's own words:
   only statements carrying a quote are included — the letter has no business
   citing anything the traveler didn't say. */
export function buildLetterPrompt(
  selected: readonly LetterSelection[],
  excerpts: readonly Statement[],
): LlmRequest {
  if (selected.length === 0 || selected.length > LETTER_MAX_QUESTIONS) {
    throw new Error(`a letter carries 1 to ${LETTER_MAX_QUESTIONS} questions, got ${selected.length}`);
  }
  const quoted = excerpts.filter((st) => st.quote !== undefined);
  const lines: string[] = [];
  lines.push("TRAVELER GRAPH EXCERPTS (their own words — echo, never paraphrase):");
  for (const st of quoted) lines.push(serializeStatementCompact(st));
  if (quoted.length === 0) lines.push("(none on file)");
  lines.push("");
  lines.push(`QUESTIONS THAT SURVIVED EXTRACTION (weave in all ${selected.length}, in order):`);
  selected.forEach((sel, i) => {
    const options =
      sel.entry.options !== undefined ? ` [options: ${sel.entry.options.join(" / ")}]` : "";
    lines.push(`${i + 1}. (${sel.entry.key}) ${phrasingFor(sel.entry, "primary")}${options}`);
  });
  return { system: LETTER_SYSTEM, prompt: lines.join("\n"), schemaName: LETTER_SCHEMA_NAME };
}

export async function draftLetter(
  client: LlmClient,
  selected: readonly LetterSelection[],
  excerpts: readonly Statement[],
): Promise<string> {
  return client.complete(buildLetterPrompt(selected, excerpts));
}
