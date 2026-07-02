import {
  ASPECTS,
  type Aspect,
  type AspectCoverage,
  type GraphNode,
  type NodeId,
  type NodeKind,
  type Statement,
} from "@excursed/schema";
import { statementMatchesAspect } from "./aspects.js";
import { MERGED_NOTE_PREFIX } from "./resolve.js";
import type { TripStore } from "./trip.js";

/* Read-side projection over loaded nodes + statements. Deliberately a plain
   in-memory object: trip graphs are hundreds of rows, not millions, and the
   store on disk stays the single source of truth. */
export class GraphQuery {
  private readonly nodeById: Map<string, GraphNode>;

  constructor(
    readonly nodes: readonly GraphNode[],
    readonly statements: readonly Statement[],
  ) {
    this.nodeById = new Map(nodes.map((n) => [n.id, n]));
  }

  static fromStore(store: TripStore): GraphQuery {
    return new GraphQuery(store.nodes.loadAll(), store.statements.loadAll());
  }

  node(id: NodeId): GraphNode | undefined {
    return this.nodeById.get(id);
  }

  /* Bi-temporal read: not invalidated (belief time) and, when a date is
     given, valid for that date (world time — seasonal hours etc.). */
  activeStatements(onDate?: string): Statement[] {
    return this.statements.filter((st) => {
      if (st.invalidatedAt) return false;
      if (onDate !== undefined) {
        if (st.validFrom !== undefined && st.validFrom > onDate) return false;
        if (st.validTo !== undefined && st.validTo < onDate) return false;
      }
      return true;
    });
  }

  statementsAbout(nodeId: NodeId, onDate?: string): Statement[] {
    return this.activeStatements(onDate).filter(
      (st) => st.from === nodeId || (typeof st.to === "string" && st.to === nodeId),
    );
  }

  /* Nodes merged away by the entity resolver are excluded — they keep their
     line in the file but no longer count as members of their kind. */
  nodesByKind<K extends NodeKind>(kind: K): Extract<GraphNode, { kind: K }>[] {
    return this.nodes.filter(
      (n): n is Extract<GraphNode, { kind: K }> =>
        n.kind === kind && !(n.note !== undefined && n.note.startsWith(MERGED_NOTE_PREFIX)),
    );
  }

  /* What the interview scorer consumes: score(q) uses 1 − bestConfidence. */
  bestConfidence(aspect: Aspect, onDate?: string): number {
    let best = 0;
    for (const st of this.activeStatements(onDate)) {
      if (st.confidence > best && statementMatchesAspect(st, aspect, this.nodeById)) {
        best = st.confidence;
      }
    }
    return best;
  }

  coverage(onDate?: string): AspectCoverage {
    const out: AspectCoverage = {};
    for (const aspect of ASPECTS) out[aspect] = this.bestConfidence(aspect, onDate);
    return out;
  }
}
