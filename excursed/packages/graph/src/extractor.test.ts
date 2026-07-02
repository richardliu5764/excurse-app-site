import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildExtractionPrompt,
  parseExtraction,
  runExtraction,
  ExtractionParseError,
  EXTRACTOR_SYSTEM,
  EXTRACTION_SCHEMA_NAME,
  CONSTRAINT_SUSPECT_NOTE,
} from "./extractor.js";
import { CheckpointingClient, FixtureClient } from "./llm.js";
import { TripStore } from "./trip.js";
import { GraphQuery } from "./query.js";
import { episode, stmt, tasteNode, tmpTripDir, traveler, T0 } from "./testkit.js";

describe("buildExtractionPrompt", () => {
  it("carries the spec's hard rules and all three inputs", () => {
    const ana = traveler("Ana");
    const coffee = tasteNode("proper coffee");
    const active = [stmt({ from: ana.id, rel: "hasTaste", to: coffee.id, quote: "the owner kept bringing us things" })];
    const ep = episode({ question: "story.anchor", traveler: ana.id });
    const { system, prompt, schemaName } = buildExtractionPrompt(active, [ep]);

    expect(system).toBe(EXTRACTOR_SYSTEM);
    // provenance discipline, constraint-suspect rule, laddering, tensions, cite-or-not-exist
    expect(system).toContain("'stated' only for facts the person said in so many");
    expect(system).toContain("NEVER emit constraint");
    expect(system).toContain('"constraint-suspect: verify by asking"');
    expect(system).toContain("Ladder silently");
    expect(system).toContain("Do not resolve tensions");
    expect(system).toContain("A statement you cannot cite\n  does not exist");

    expect(schemaName).toBe(EXTRACTION_SCHEMA_NAME);
    expect(prompt).toContain("## Statement schema and node kinds");
    expect(prompt).toContain("## Current active statements (compact)");
    expect(prompt).toContain(active[0]!.id);
    expect(prompt).toContain('"the owner kept bringing us things"');
    expect(prompt).toContain("## New episodes (verbatim)");
    expect(prompt).toContain(`[${ep.id}]`);
    expect(prompt).toContain(ep.text);
  });
});

describe("parseExtraction", () => {
  const ana = traveler("Ana");
  const ep = episode({ traveler: ana.id });

  it("re-mints local node ids and rewires statement endpoints", () => {
    const out = parseExtraction(
      JSON.stringify({
        nodes: [
          { id: "t1", kind: "taste", label: "market breakfasts", polarity: "likes", ladder: "attribute" },
          { id: "t2", kind: "taste", label: "slow mornings", polarity: "likes", ladder: "value" },
          { id: "x1", kind: "tension", label: "markets vs sleep", betweenIds: ["t1", "t2"] },
        ],
        new: [
          {
            from: ana.id,
            rel: "hasTaste",
            to: "t1",
            provenance: "stated",
            confidence: 0.95,
            quote: "we always find the market first",
            source: [{ episode: ep.id }],
          },
          {
            from: ana.id,
            rel: "holdsTension",
            to: "x1",
            provenance: "inferred",
            confidence: 0.9,
            note: "wants markets and sleep",
            source: [{ episode: ep.id }],
          },
        ],
      }),
      { now: T0 },
    );
    expect(out.nodes).toHaveLength(3);
    const [t1, , x1] = out.nodes;
    expect(t1!.id).toMatch(/^nd_/);
    expect(out.new[0]!.to).toBe(t1!.id);
    expect(out.new[0]!.assertedAt).toBe(T0);
    expect(out.new[1]!.to).toBe(x1!.id);
    expect(x1!.kind === "tension" && x1.betweenIds[0]).toBe(t1!.id);
    expect(out.new[1]!.confidence).toBe(0.7); // inferred cap clamped, not rejected
    expect(out.invalidate).toEqual([]);
  });

  it("demotes a constraint-suspect to an inferred taste + note — never a constraint", () => {
    const out = parseExtraction(
      JSON.stringify({
        nodes: [{ id: "c1", kind: "constraint", label: "gluten", category: "allergy", severity: "hard" }],
        new: [
          {
            from: ana.id,
            rel: "hasConstraint",
            to: "c1",
            provenance: "inferred",
            confidence: 0.9,
            note: "she said they mostly skip bread",
            source: [{ episode: ep.id }],
          },
        ],
      }),
      { now: T0 },
    );
    const st = out.new[0]!;
    expect(st.rel).toBe("hasTaste");
    expect(st.provenance).toBe("inferred");
    expect(st.confidence).toBeLessThanOrEqual(0.7);
    expect(st.note).toContain(CONSTRAINT_SUSPECT_NOTE);
    expect(st.note).toContain("skip bread");
    const node = out.nodes[0]!;
    expect(node.kind).toBe("taste");
    expect(node.note).toContain(CONSTRAINT_SUSPECT_NOTE);
    expect(node.note).toContain("suspected allergy");
    expect(out.nodes.some((n) => n.kind === "constraint")).toBe(false);
  });

  it("keeps a stated constraint intact", () => {
    const out = parseExtraction(
      JSON.stringify({
        nodes: [{ id: "c1", kind: "constraint", label: "celiac", category: "allergy" }],
        new: [
          {
            from: ana.id,
            rel: "hasConstraint",
            to: "c1",
            provenance: "stated",
            confidence: 0.98,
            quote: "Maya is celiac",
            source: [{ episode: ep.id }],
          },
        ],
      }),
      { now: T0 },
    );
    expect(out.new[0]!.rel).toBe("hasConstraint");
    expect(out.nodes[0]!.kind).toBe("constraint");
  });

  it("rejects statements without sources or without required quotes", () => {
    expect(() =>
      parseExtraction(
        JSON.stringify({
          new: [{ from: ana.id, rel: "hasTaste", to: ana.id, provenance: "stated", confidence: 0.9, quote: "x", source: [] }],
        }),
      ),
    ).toThrow(ExtractionParseError);

    expect(() =>
      parseExtraction(
        JSON.stringify({
          new: [{ from: ana.id, rel: "hasTaste", to: ana.id, provenance: "stated", confidence: 0.9, source: [{ episode: ep.id }] }],
        }),
      ),
    ).toThrow(/requires a verbatim quote/);

    expect(() => parseExtraction("the model rambled instead of emitting JSON")).toThrow(/not valid JSON/);
  });

  it("accepts fenced JSON (models will fence no matter what you ask)", () => {
    const out = parseExtraction("```json\n" + JSON.stringify({ new: [], nodes: [], invalidate: [] }) + "\n```");
    expect(out).toEqual({ new: [], nodes: [], invalidate: [] });
  });
});

describe("scripted extraction flow into the store", () => {
  it("FixtureClient response lands in the store, marks episodes, checkpoints the run", async () => {
    const dir = tmpTripDir();
    const store = TripStore.open(dir);
    const ana = store.nodes.append(traveler("Ana"));
    const prior = store.statements.append(
      stmt({ from: ana.id, rel: "hasProperty", to: { key: "budget_posture", value: "save" }, quote: "we keep it cheap" }),
    );
    const ep = store.episodes.append(episode({ traveler: ana.id, text: "honestly, this trip we want to splurge on meals" }));

    const scripted = JSON.stringify({
      nodes: [{ id: "taste-1", kind: "taste", label: "splurge meals", polarity: "likes" }],
      new: [
        {
          from: ana.id,
          rel: "hasProperty",
          to: { key: "budget_posture", value: "spend on the table" },
          provenance: "stated",
          confidence: 0.95,
          quote: "this trip we want to splurge on meals",
          source: [{ episode: ep.id }],
        },
        {
          from: ana.id,
          rel: "hasTaste",
          to: "taste-1",
          provenance: "inferred",
          confidence: 0.6,
          note: "splurge read from the same line",
          source: [{ episode: ep.id }],
        },
      ],
      invalidate: [{ id: prior.id, reason: ep.id }],
    });
    const fixture = new FixtureClient([scripted]);
    const client = new CheckpointingClient(fixture, dir, () => T0);

    const summary = await runExtraction(store, client, { now: T0, runId: "xr_test" });
    expect(summary).toMatchObject({ runId: "xr_test", appendedStatements: 2, appendedNodes: 1, invalidated: 1, markedEpisodes: 1 });

    // the prompt the model saw contained the prior statement and the episode
    expect(fixture.calls).toHaveLength(1);
    expect(fixture.calls[0]!.prompt).toContain(prior.id);
    expect(fixture.calls[0]!.prompt).toContain(ep.id);

    // graph state: contradiction invalidated, replacement active
    const q = GraphQuery.fromStore(store);
    expect(q.bestConfidence("skeleton.budget_posture")).toBe(0.95);
    const all = store.statements.loadAll();
    expect(all.find((s) => s.id === prior.id)?.invalidatedAt).toBeDefined();
    expect(q.activeStatements()).toHaveLength(2);
    expect(store.episodes.loadAll()[0]!.extractedBy).toBe("xr_test");

    // checkpoint: prompt + response committed under runs/, replayable
    const runFiles = fs.readdirSync(path.join(dir, "runs")).filter((f) => f.endsWith(".json"));
    expect(runFiles).toHaveLength(1);
    const record = JSON.parse(fs.readFileSync(path.join(dir, "runs", runFiles[0]!), "utf8"));
    expect(record.request.system).toBe(EXTRACTOR_SYSTEM);
    expect(record.response).toBe(scripted);
    expect(record.at).toBe(T0);

    // idempotent: nothing left to extract
    expect(await runExtraction(store, client)).toBeNull();
  });
});
