import * as path from "node:path";
import { TRIP_LAYOUT, ulid } from "@excursed/schema";
import { atomicWriteFile } from "./jsonl.js";

/* The only surface through which model output enters the pipeline. Everything
   LLM-dependent takes this interface injected, so tests script it and no code
   path in this repo ever holds an API key. */
export interface LlmRequest {
  system: string;
  prompt: string;
  /** which output contract the caller will validate against, e.g. "extraction.v1" */
  schemaName: string;
  maxTokens?: number;
}

export interface LlmClient {
  complete(req: LlmRequest): Promise<string>;
}

export interface CheckpointRecord {
  id: string;
  at: string;
  request: LlmRequest;
  response: string;
}

/* Every LLM call becomes a committed artifact in <trip>/runs/<ulid>.json:
   auditable (what exactly did we ask, what came back) and replayable (feed
   the recorded responses to a FixtureClient to re-run a pipeline offline). */
export class CheckpointingClient implements LlmClient {
  constructor(
    private readonly inner: LlmClient,
    private readonly tripDir: string,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  async complete(req: LlmRequest): Promise<string> {
    const response = await this.inner.complete(req);
    const record: CheckpointRecord = { id: ulid(), at: this.now(), request: req, response };
    atomicWriteFile(
      path.join(this.tripDir, TRIP_LAYOUT.checkpoints, `${record.id}.json`),
      JSON.stringify(record, null, 2) + "\n",
    );
    return response;
  }
}

/* Deterministic test double: scripted responses in call order, or a function
   of the request. Records every request for prompt-shape assertions. */
export class FixtureClient implements LlmClient {
  readonly calls: LlmRequest[] = [];
  private cursor = 0;

  constructor(private readonly script: readonly string[] | ((req: LlmRequest) => string)) {}

  complete(req: LlmRequest): Promise<string> {
    this.calls.push(req);
    if (typeof this.script === "function") return Promise.resolve(this.script(req));
    const next = this.script[this.cursor++];
    if (next === undefined) {
      return Promise.reject(new Error(`FixtureClient script exhausted after ${this.script.length} call(s)`));
    }
    return Promise.resolve(next);
  }
}
