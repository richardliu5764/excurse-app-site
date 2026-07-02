import * as fs from "node:fs";
import * as path from "node:path";
import {
  TRIP_LAYOUT,
  Episode,
  GraphNode,
  Statement,
  QuestionRow,
  ResearchTaskRow,
  Claim,
  CONSTRAINT_REL,
  CONSTRAINT_ALLOWED_PROVENANCE,
  type EpisodeId,
  type StatementId,
} from "@excursed/schema";
import { JsonlStore } from "./jsonl.js";

/* The one non-negotiable epistemic rule, enforced where writes happen (the
   prompt asks; the store refuses). Cites CONSTRAINT_REL /
   CONSTRAINT_ALLOWED_PROVENANCE so this guard and the schema comment can
   never drift apart. */
export class ConstraintGuardError extends Error {
  constructor(readonly statementId: string, readonly provenance: string) {
    super(
      `statement ${statementId}: '${CONSTRAINT_REL}' statements must have provenance ` +
        `'${CONSTRAINT_ALLOWED_PROVENANCE}' (got '${provenance}'). A story that implies a ` +
        `constraint yields an inferred taste plus a "constraint-suspect: verify by asking" note, ` +
        `never a constraint.`,
    );
    this.name = "ConstraintGuardError";
  }
}

export function assertConstraintGuard(st: Statement): void {
  if (st.rel === CONSTRAINT_REL && st.provenance !== CONSTRAINT_ALLOWED_PROVENANCE) {
    throw new ConstraintGuardError(st.id, st.provenance);
  }
}

export class StatementStore extends JsonlStore<Statement> {
  override appendMany(items: readonly Statement[]): Statement[] {
    for (const st of items) assertConstraintGuard(st);
    return super.appendMany(items);
  }
}

const iso = (): string => new Date().toISOString();

export class TripStore {
  readonly episodes: JsonlStore<Episode>;
  readonly nodes: JsonlStore<GraphNode>;
  readonly statements: StatementStore;
  readonly questions: JsonlStore<QuestionRow>;
  readonly research: JsonlStore<ResearchTaskRow>;
  readonly claims: JsonlStore<Claim>;
  readonly runsDir: string;

  private constructor(readonly dir: string) {
    this.episodes = new JsonlStore(path.join(dir, TRIP_LAYOUT.episodes), Episode);
    this.nodes = new JsonlStore(path.join(dir, TRIP_LAYOUT.nodes), GraphNode);
    this.statements = new StatementStore(path.join(dir, TRIP_LAYOUT.statements), Statement);
    this.questions = new JsonlStore(path.join(dir, TRIP_LAYOUT.questions), QuestionRow);
    this.research = new JsonlStore(path.join(dir, TRIP_LAYOUT.research), ResearchTaskRow);
    this.claims = new JsonlStore(path.join(dir, TRIP_LAYOUT.claims), Claim);
    this.runsDir = path.join(dir, TRIP_LAYOUT.checkpoints);
  }

  static open(dir: string): TripStore {
    const store = new TripStore(dir);
    for (const rel of [
      TRIP_LAYOUT.episodes,
      TRIP_LAYOUT.nodes,
      TRIP_LAYOUT.statements,
      TRIP_LAYOUT.questions,
      TRIP_LAYOUT.research,
      TRIP_LAYOUT.claims,
    ]) {
      fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    }
    fs.mkdirSync(store.runsDir, { recursive: true });
    return store;
  }

  /* Invalidate, never delete: the record stays in the file with
     invalidatedAt set and the reason appended to its note. */
  invalidate(statementId: StatementId, reason: string, supersededBy?: StatementId, now: string = iso()): Statement {
    let updated: Statement | undefined;
    this.statements.amend((st) => {
      if (st.id !== statementId) return st;
      if (st.invalidatedAt) {
        throw new Error(`statement ${statementId} is already invalidated (at ${st.invalidatedAt})`);
      }
      const marker = `invalidated: ${reason}`;
      const next: Statement = {
        ...st,
        invalidatedAt: now,
        note: st.note ? `${st.note} | ${marker}` : marker,
      };
      if (supersededBy !== undefined) next.supersededBy = supersededBy;
      updated = next;
      return next;
    });
    if (!updated) throw new Error(`statement ${statementId} not found in ${this.statements.file}`);
    return updated;
  }

  /* Extraction bookkeeping: which extractor run last projected each episode.
     Re-extraction with a better model just overwrites the marker. */
  markExtracted(episodeIds: readonly EpisodeId[], runId: string): number {
    const wanted = new Set<string>(episodeIds);
    return this.episodes.amend((ep) => (wanted.has(ep.id) ? { ...ep, extractedBy: runId } : ep));
  }
}
