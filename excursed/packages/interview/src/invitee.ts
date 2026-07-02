import {
  mintId,
  type EpisodeId,
  type GraphNode,
  type NodeId,
  type QuestionRow,
  type Statement,
} from "@excursed/schema";
import type { TripStore } from "@excursed/graph";
import { SAFETY_OPTION_ASPECT, bankEntry } from "./bank.js";
import { passAWrite } from "./passa.js";
import { startSession, type SessionState, type StartSessionOpts } from "./session.js";

/* Invitees get the 4-turn variant through their own invite link: short
   episodic anchor, one rhythm lean, one veto, constraints (13-council-ai
   §4.2). Children get two playful questions, or a proxy. The state machine is
   the same instrument — only the phase caps and budget differ (session.ts). */

export function startInviteeSession(store: TripStore, opts: Omit<StartSessionOpts, "audience">): SessionState {
  return startSession(store, { ...opts, audience: "invitee" });
}

export function startChildSession(store: TripStore, opts: Omit<StartSessionOpts, "audience">): SessionState {
  return startSession(store, { ...opts, audience: "child" });
}

/* Organizer proxy answers: provenance 'stated' (the organizer did state it),
   source {proxy: organizer}, confidence capped at 0.5 — the booking adult is
   an unreliable proxy for their own family. Consequential proxies (SAFETY or
   SKELETON impact) spawn a letter-round question to the actual person. */
export const PROXY_MAX_CONFIDENCE = 0.5;

export interface ProxyAnswerInput {
  /** traveler node of the organizer doing the answering */
  organizerId: NodeId;
  /** traveler node the answer is about */
  subjectId: NodeId;
  bankKey: string;
  /** the answer in the organizer's words (an option text, or free text) */
  value: string;
  confidence?: number;
  now?: string;
}

export interface ProxyAnswerResult {
  episodeId: EpisodeId;
  statements: Statement[];
  nodes: GraphNode[];
  spawnedLetterQuestion: QuestionRow | null;
}

export function proxyAnswer(store: TripStore, input: ProxyAnswerInput): ProxyAnswerResult {
  const entry = bankEntry(input.bankKey);
  const now = input.now ?? new Date().toISOString();
  const confidence = Math.min(input.confidence ?? PROXY_MAX_CONFIDENCE, PROXY_MAX_CONFIDENCE);

  const episode = store.episodes.append({
    id: mintId("episode"),
    kind: "interview_turn",
    at: now,
    traveler: input.subjectId,
    question: entry.key,
    structured: { proxy: input.organizerId, value: input.value },
    text: input.value,
  });

  // A proxy answer that is a recognized sweep option lands on that one safety
  // aspect; anything else feeds every aspect the entry declares.
  const sweepAspect = entry.safety ? SAFETY_OPTION_ASPECT[input.value] : undefined;
  const aspects = sweepAspect !== undefined ? [sweepAspect] : entry.aspects;

  const statements: Statement[] = [];
  const nodes: GraphNode[] = [];
  for (const aspect of aspects) {
    const w = passAWrite({
      aspect,
      travelerId: input.subjectId,
      value: input.value,
      quote: input.value,
      source: [{ proxy: input.organizerId }],
      now,
      confidence,
      note: `proxy: answered by ${input.organizerId}`,
    });
    store.nodes.appendMany(w.nodes);
    store.statements.appendMany(w.statements);
    statements.push(...w.statements);
    nodes.push(...w.nodes);
  }

  let spawned: QuestionRow | null = null;
  if (entry.impact === "SAFETY" || entry.impact === "SKELETON") {
    spawned = store.questions.append({
      id: mintId("question"),
      bankKey: entry.key,
      aspects: [...entry.aspects],
      impact: entry.impact,
      travelerId: input.subjectId,
      status: "pending",
      round: "letter",
      createdAt: now,
    });
  }

  return { episodeId: episode.id, statements, nodes, spawnedLetterQuestion: spawned };
}
