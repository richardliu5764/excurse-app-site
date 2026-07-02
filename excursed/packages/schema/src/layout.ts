/* Trip directory layout. Everything is JSONL-in-git: append-only, diffable,
   reviewed with `git diff`. The graph is a projection of episodes; agenda and
   ledger are working stores; the guide + sidecar are composer output. */
export const TRIP_LAYOUT = {
  episodes: "episodes.jsonl",
  nodes: "graph/nodes.jsonl",
  statements: "graph/statements.jsonl",
  questions: "agenda/questions.jsonl",
  research: "agenda/research.jsonl",
  claims: "ledger/claims.jsonl",
  guide: "compose/guide.json",
  sidecar: "compose/citations.json",
  checkpoints: "runs", // every LLM call: prompt+response committed, replayable
} as const;

/* Traveler PKG layout (per household, encrypted at rest — medical facts about
   named children get encryption regardless of repo visibility). Trips import
   frozen snapshots of only the edges they need. */
export const PKG_LAYOUT = {
  nodes: "pkg/nodes.jsonl",
  statements: "pkg/statements.jsonl",
} as const;
