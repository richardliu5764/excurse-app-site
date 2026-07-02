import { describe, expect, it } from "vitest";
import { FixtureClient, GraphQuery } from "@excursed/graph";
import type { ResearchTaskRow } from "@excursed/schema";
import { executeTask, parseFormFill, WorkerValidationError, type FetchedDoc, type SearchClient } from "./worker.js";
import { unknownFieldIssues } from "./forms.js";
import { r1ConstraintVerify, r2HoursForDate, runRules } from "./rules.js";
import { NOW, buildTrip, type TripFixture } from "./testkit.js";

const RETRIEVED_AT = "2026-07-01T13:00:00.000Z";

function fakeSearch(docs: readonly FetchedDoc[]): SearchClient {
  const byUrl = new Map(docs.map((d) => [d.url, d]));
  return {
    search: (_query: string) => Promise.resolve(docs.map((d) => ({ url: d.url, title: d.title ?? d.url }))),
    fetch: (url: string) => {
      const doc = byUrl.get(url);
      return doc ? Promise.resolve(doc) : Promise.reject(new Error(`no fixture for ${url}`));
    },
  };
}

const HOURS_DOC: FetchedDoc = {
  url: "https://risebiscuits.example/hours",
  title: "Rise Biscuits — Hours",
  text: "Sunday October 11: open 8:00am to 2:00pm. Kitchen closes 1:30pm.",
  retrievedAt: RETRIEVED_AT,
};

function hoursTask(t: TripFixture): ResearchTaskRow {
  const tasks = r2HoursForDate(GraphQuery.fromStore(t.store), [], { now: NOW });
  const task = tasks.find((x) => x.targets.includes(t.diner))!;
  t.store.research.appendMany([task]);
  return task;
}

const filled = (sources: unknown, extra: Record<string, unknown> = {}): string =>
  JSON.stringify({
    fields: {
      hours_for_date: {
        predicate: "hours(2026-10-11) = 08:00-14:00",
        sentence: "Open Sunday 8am to 2pm; the kitchen closes at 1:30.",
        tier: "T1",
        confidence: 0.9,
        volatility: "seasonal",
        validFrom: "2026-10-11",
        validTo: "2026-10-11",
        sources,
        ...extra,
      },
    },
  });

describe("executeTask happy path", () => {
  it("appends claims to the ledger, mirrors researched statements, resolves the task", async () => {
    const t = buildTrip();
    const task = hoursTask(t);
    const llm = new FixtureClient([
      JSON.stringify(["rise biscuits durham hours sunday"]),
      filled([{ url: HOURS_DOC.url, excerpt: "open 8:00am to 2:00pm" }]),
    ]);

    const result = await executeTask(t.store, task, llm, fakeSearch([HOURS_DOC]), { now: NOW });
    expect(result.status).toBe("done");
    expect(result.claimIds).toHaveLength(1);

    const claims = t.store.claims.loadAll();
    expect(claims).toHaveLength(1);
    const claim = claims[0]!;
    expect(claim.field).toBe("hours_for_date");
    expect(claim.tier).toBe("T1");
    expect(claim.about).toEqual(task.targets);
    expect(claim.taskId).toBe(task.id);
    // retrievedAt comes from the fetcher, not the model
    expect(claim.sources[0]!.retrievedAt).toBe(RETRIEVED_AT);

    // mirrored onto the graph as a researched statement citing the claim
    const mirrored = t.store.statements.loadAll().filter((s) => s.provenance === "researched");
    expect(mirrored).toHaveLength(1);
    expect(mirrored[0]!.from).toBe(t.diner); // targets[0]: the place the fact is about
    expect(mirrored[0]!.rel).toBe("hasProperty");
    expect(mirrored[0]!.source).toEqual([{ claim: claim.id }]);

    const row = t.store.research.loadAll().find((r) => r.id === task.id)!;
    expect(row.status).toBe("done");
    expect(row.resultClaimIds).toEqual([claim.id]);
    expect(row.resolvedAt).toBe(NOW);

    // prompt shape: tier policy + T0 rule live in the system prompt
    expect(llm.calls[0]!.system).toContain("T0 rule");
    expect(llm.calls[0]!.system).toContain("T1");
    expect(llm.calls[1]!.prompt).toContain(HOURS_DOC.url);
  });

  it("all-UNFOUND fill resolves the task as unfound with zero claims", async () => {
    const t = buildTrip();
    const task = hoursTask(t);
    const llm = new FixtureClient([
      JSON.stringify(["rise biscuits hours"]),
      JSON.stringify({ fields: { hours_for_date: "UNFOUND" } }),
    ]);
    const result = await executeTask(t.store, task, llm, fakeSearch([HOURS_DOC]), { now: NOW });
    expect(result.status).toBe("unfound");
    expect(t.store.claims.loadAll()).toHaveLength(0);
    expect(t.store.research.loadAll().find((r) => r.id === task.id)!.status).toBe("unfound");
  });
});

describe("T0 rule and form validation", () => {
  it("rejects a sourceless claim: task stays pending with an error note", async () => {
    const t = buildTrip();
    const task = hoursTask(t);
    const llm = new FixtureClient([JSON.stringify(["rise biscuits hours"]), filled([])]);
    const result = await executeTask(t.store, task, llm, fakeSearch([HOURS_DOC]), { now: NOW });

    expect(result.status).toBe("rejected");
    expect(result.errors.join(" ")).toContain("T0");
    expect(t.store.claims.loadAll()).toHaveLength(0);
    expect(t.store.statements.loadAll().filter((s) => s.provenance === "researched")).toHaveLength(0);

    const row = t.store.research.loadAll().find((r) => r.id === task.id)!;
    expect(row.status).toBe("pending");
    expect(row.brief).toContain("[worker-rejected");
    // identity (first brief line) unchanged ⇒ rules do not re-create it
    expect(runRules(t.store, { now: NOW }).filter((x) => x.rule === "R2_hours_for_date" && x.targets.includes(t.diner))).toHaveLength(0);
  });

  it("rejects a claim citing an un-retrieved url (invented source)", async () => {
    const t = buildTrip();
    const task = hoursTask(t);
    const llm = new FixtureClient([
      JSON.stringify(["rise biscuits hours"]),
      filled([{ url: "https://model-memory.example/imagined" }]),
    ]);
    const result = await executeTask(t.store, task, llm, fakeSearch([HOURS_DOC]), { now: NOW });
    expect(result.status).toBe("rejected");
    expect(result.errors.join(" ")).toContain("un-retrieved");
    expect(t.store.claims.loadAll()).toHaveLength(0);
  });

  it("rejects a claim with no tier assigned", () => {
    const t = buildTrip();
    const task = hoursTask(t);
    const json = JSON.stringify({
      fields: {
        hours_for_date: {
          predicate: "hours",
          sentence: "Open.",
          sources: [{ url: HOURS_DOC.url }],
        },
      },
    });
    expect(() => parseFormFill(json, task, [HOURS_DOC], NOW)).toThrowError(WorkerValidationError);
    try {
      parseFormFill(json, task, [HOURS_DOC], NOW);
    } catch (e) {
      expect((e as WorkerValidationError).issues.join(" ")).toContain("tier");
    }
  });

  it("rejects an invented field: a value for a field not on the form", () => {
    const t = buildTrip();
    const task = hoursTask(t);
    const json = JSON.stringify({
      fields: {
        secret_menu: {
          predicate: "x",
          sentence: "y",
          tier: "T3",
          sources: [{ url: HOURS_DOC.url }],
        },
      },
    });
    expect(() => parseFormFill(json, task, [HOURS_DOC], NOW)).toThrowError(/not on the restaurant form/);
  });

  it("rejects T2 evidence on a T1-required field (hours, closures, allergens)", () => {
    const t = buildTrip();
    const task = hoursTask(t);
    const json = filled([{ url: HOURS_DOC.url }], { tier: "T2" });
    expect(() => parseFormFill(json, task, [HOURS_DOC], NOW)).toThrowError(/requires a T1 primary source/);
  });

  it("R1 serious-allergy task rejects a dietary_capability answer below T1", () => {
    const t = buildTrip();
    const task = r1ConstraintVerify(GraphQuery.fromStore(t.store), [], { now: NOW }).find((x) =>
      x.targets.includes(t.diner),
    )!;
    const json = JSON.stringify({
      fields: {
        dietary_capability: {
          predicate: "gf(dedicated_fryer) = unknown",
          sentence: "A forum thread says the fryer is shared.",
          tier: "T3",
          sources: [{ url: HOURS_DOC.url }],
        },
      },
    });
    expect(() => parseFormFill(json, task, [HOURS_DOC], NOW)).toThrowError(/T1/);
  });

  it("unknownFieldIssues flags only fields off the form; UNFOUND is always legal", () => {
    expect(unknownFieldIssues("restaurant", ["hours_for_date", "noise_level"])).toHaveLength(0);
    expect(unknownFieldIssues("restaurant", ["vibe_score"])).toHaveLength(1);
    const t = buildTrip();
    const task = hoursTask(t);
    const fill = parseFormFill(JSON.stringify({ fields: { noise_level: "UNFOUND" } }), task, [], NOW);
    expect(fill.claims).toHaveLength(0);
    expect(fill.unfoundFields).toEqual(["noise_level"]);
  });

  it("garbled model JSON rejects instead of crashing the harness", async () => {
    const t = buildTrip();
    const task = hoursTask(t);
    const llm = new FixtureClient(["not json at all"]);
    const result = await executeTask(t.store, task, llm, fakeSearch([HOURS_DOC]), { now: NOW });
    expect(result.status).toBe("rejected");
    expect(t.store.research.loadAll().find((r) => r.id === task.id)!.status).toBe("pending");
  });

  it("refuses to execute a non-pending task", async () => {
    const t = buildTrip();
    const task = hoursTask(t);
    t.store.research.amend((r) => (r.id === task.id ? { ...r, status: "done" } : r));
    const done = t.store.research.loadAll().find((r) => r.id === task.id)!;
    await expect(executeTask(t.store, done, new FixtureClient([]), fakeSearch([]))).rejects.toThrow(/not 'pending'/);
  });
});
