/* @excursed/graph — the data spine. Episodes are canonical; the graph is a
   rebuildable projection (event sourcing over JSONL-in-git). */
export { JsonlStore, JsonlStoreError, atomicWriteFile } from "./jsonl.js";
export { TripStore, StatementStore, ConstraintGuardError, assertConstraintGuard } from "./trip.js";
export { GraphQuery } from "./query.js";
export { ASPECT_RULES, statementMatchesAspect, statementMatchesPattern, type AspectPattern } from "./aspects.js";
export {
  CheckpointingClient,
  FixtureClient,
  type LlmClient,
  type LlmRequest,
  type CheckpointRecord,
} from "./llm.js";
export {
  EXTRACTOR_SYSTEM,
  EXTRACTION_SCHEMA_NAME,
  CONSTRAINT_SUSPECT_NOTE,
  buildExtractionPrompt,
  parseExtraction,
  applyExtraction,
  runExtraction,
  serializeStatementCompact,
  serializeEpisode,
  ExtractionParseError,
  type ExtractionPrompt,
  type ExtractionResult,
  type ApplyExtractionSummary,
} from "./extractor.js";
export {
  normalizeLabel,
  proposeMerges,
  applyMerges,
  MERGED_NOTE_PREFIX,
  type MergeProposal,
  type ApplyMergesSummary,
} from "./resolve.js";
