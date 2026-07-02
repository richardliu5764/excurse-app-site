/* @excursed/interview — correspondence, not chat. Round 1 is a fully local
   deterministic instrument over a question bank; Round 2 is at most one
   letter, drafted at the desk; no LLM ever runs in the traveler's shell. */
export {
  BANK,
  bankEntry,
  phrasingFor,
  STORY_ANCHOR_KEY,
  STORY_MINITOUR_KEY,
  STORY_NEGATIVE_KEY,
  PEAK_KEY,
  SAFETY_SWEEP_KEY,
  SAFETY_NONE_OPTION,
  SAFETY_OPTION_ASPECT,
} from "./bank.js";
export {
  score,
  aspectClass,
  ANSWERABILITY,
  ASK_COST_PER_TURN,
  RESEARCHABLE_COST,
  type ScoredQuestion,
  type ScoreBreakdown,
  type AspectTerm,
} from "./scorer.js";
export { passAWrite, STATED_CONFIDENCE, type PassAWrite, type PassAOpts } from "./passa.js";
export {
  startSession,
  nextQuestion,
  answer,
  summary,
  seal,
  SealGuardError,
  STORY_THIN_CHARS,
  MINIMAL_TEXT_CHARS,
  DECAY_LIMIT,
  TIEBREAK_THRESHOLD,
  CHILD_TURN_BUDGET,
  type Audience,
  type SessionState,
  type StartSessionOpts,
  type AnswerInput,
  type AnswerOutcome,
} from "./session.js";
export {
  needsLetter,
  selectLetterQuestions,
  buildLetterPrompt,
  draftLetter,
  LETTER_MAX_QUESTIONS,
  LETTER_ASK_THRESHOLD,
  LETTER_SCHEMA_NAME,
  LETTER_SYSTEM,
  type LetterSelection,
  type LetterOpts,
} from "./letter.js";
export {
  startInviteeSession,
  startChildSession,
  proxyAnswer,
  PROXY_MAX_CONFIDENCE,
  type ProxyAnswerInput,
  type ProxyAnswerResult,
} from "./invitee.js";
