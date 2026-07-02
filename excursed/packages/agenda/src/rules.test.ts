import { describe, expect, it } from "vitest";
import { GraphQuery } from "@excursed/graph";
import { mintId, type GraphNode } from "@excursed/schema";
import {
  r1ConstraintVerify,
  r2HoursForDate,
  r3Routing,
  r4Discovery,
  r5Hedge,
  r7VoiceAndDepth,
  runRules,
} from "./rules.js";
import { NOW, buildTrip, nid, stmt } from "./testkit.js";

describe("rule derivation over a hand-built trip graph", () => {
  it("R1: candidate place × hard constraint ⇒ verify task; serious allergy ⇒ phone-call ownerAction", () => {
    const t = buildTrip();
    const graph = GraphQuery.fromStore(t.store);
    const tasks = r1ConstraintVerify(graph, [], { now: NOW });
    // two candidate places (museum scheduled, diner scheduled+candidate) × one hard constraint
    expect(tasks).toHaveLength(2);
    const dinerTask = tasks.find((x) => x.targets.includes(t.diner))!;
    expect(dinerTask.rule).toBe("R1_constraint_verify");
    expect(dinerTask.form).toBe("restaurant");
    expect(dinerTask.targets).toContain(t.celiac);
    // constraint brief carries the predicate, not the person
    expect(dinerTask.brief).toContain("gluten-free (celiac)-safe prep");
    expect(dinerTask.brief).toContain("T1 primary source");
    expect(dinerTask.ownerAction).toContain("phone-call");
  });

  it("R1: soft constraints and unheld constraints generate nothing", () => {
    const t = buildTrip();
    const soft: GraphNode = { id: nid(), kind: "constraint", label: "prefers aisle seats", createdAt: NOW, category: "other", severity: "soft" };
    const unheld: GraphNode = { id: nid(), kind: "constraint", label: "shellfish", createdAt: NOW, category: "allergy", severity: "hard" };
    t.store.nodes.appendMany([soft, unheld]);
    t.store.statements.append(stmt({ from: t.maya, rel: "hasConstraint", to: soft.id, quote: "I like aisle seats" }));
    const tasks = r1ConstraintVerify(GraphQuery.fromStore(t.store), [], { now: NOW });
    expect(tasks.every((x) => x.targets.includes(t.celiac))).toBe(true);
  });

  it("R2: dated, windowed slot with a scheduled place ⇒ hours-for-date task naming the exact date", () => {
    const t = buildTrip();
    const tasks = r2HoursForDate(GraphQuery.fromStore(t.store), [], { now: NOW });
    expect(tasks).toHaveLength(2); // both slots are windowed, dated, and placed
    const lunch = tasks.find((x) => x.targets.includes(t.slotLunch))!;
    expect(lunch.rule).toBe("R2_hours_for_date");
    expect(lunch.brief).toContain("2026-10-11");
    expect(lunch.brief).toContain("Rise Biscuits");
    expect(lunch.brief).toContain("T1");
    expect(lunch.targets).toEqual([t.diner, t.slotLunch]);
  });

  it("R3: consecutive slots on the same day ⇒ one routing task with LEAVE BY", () => {
    const t = buildTrip();
    const tasks = r3Routing(GraphQuery.fromStore(t.store), [], { now: NOW });
    expect(tasks).toHaveLength(1);
    expect(tasks[0]!.rule).toBe("R3_routing");
    expect(tasks[0]!.form).toBe("transition");
    expect(tasks[0]!.targets).toEqual([t.slotMorning, t.slotLunch]);
    expect(tasks[0]!.brief).toContain("LEAVE BY");
    expect(tasks[0]!.brief).toContain("12:00"); // arrival window of the later slot
  });

  it("R4: elicited taste with < 2 serving candidates ⇒ discovery task; served tastes stay quiet", () => {
    const t = buildTrip();
    let tasks = r4Discovery(GraphQuery.fromStore(t.store), [], { now: NOW });
    expect(tasks).toHaveLength(1);
    expect(tasks[0]!.rule).toBe("R4_discovery");
    expect(tasks[0]!.targets).toEqual([t.tsukemen]);
    expect(tasks[0]!.brief).toContain("tsukemen");
    expect(tasks[0]!.brief).toContain("Durham, NC");

    // two serving candidate places silence the rule
    const p1 = t.diner;
    const p2: GraphNode = { id: nid(), kind: "place", label: "Ramen shop", createdAt: NOW, category: "restaurant" };
    t.store.nodes.append(p2);
    t.store.statements.appendMany([
      stmt({ from: p1, rel: "servesTaste", to: t.tsukemen, provenance: "observed" }),
      stmt({ from: p2.id, rel: "candidateFor", to: t.tsukemen, provenance: "observed" }),
    ]);
    tasks = r4Discovery(GraphQuery.fromStore(t.store), [], { now: NOW });
    expect(tasks).toHaveLength(0);
  });

  it("R4: a held tension with < 2 honoring candidates fires too", () => {
    const t = buildTrip();
    const quiet: GraphNode = { id: nid(), kind: "taste", label: "quiet rooms", createdAt: NOW, polarity: "likes", ladder: "attribute" };
    const tension: GraphNode = { id: nid(), kind: "tension", label: "novelty vs quiet", createdAt: NOW, betweenIds: [t.tsukemen, quiet.id] };
    t.store.nodes.appendMany([quiet, tension]);
    t.store.statements.append(stmt({ from: t.maya, rel: "holdsTension", to: tension.id, provenance: "inferred", confidence: 0.6 }));
    const tasks = r4Discovery(GraphQuery.fromStore(t.store), [], { now: NOW });
    const tensionTask = tasks.find((x) => x.targets[0] === tension.id);
    expect(tensionTask).toBeDefined();
    expect(tensionTask!.brief).toContain("novelty vs quiet");
  });

  it("R5: assumed statement the skeleton leans on ⇒ hedge task", () => {
    const t = buildTrip();
    t.store.statements.append(
      stmt({
        from: t.maya,
        rel: "hasProperty",
        to: { key: "walking_radius", value: "15 minutes" },
        provenance: "assumed",
        confidence: 0.5,
        source: [{ checker: "archetype-defaults" }],
      }),
    );
    const tasks = r5Hedge(GraphQuery.fromStore(t.store), [], { now: NOW });
    expect(tasks).toHaveLength(1);
    expect(tasks[0]!.rule).toBe("R5_hedge");
    expect(tasks[0]!.brief).toContain("ASSUMED");
    expect(tasks[0]!.brief).toContain("walking_radius");
    // pseudonym, never the label
    expect(tasks[0]!.brief).toContain("Kestrel");
    expect(tasks[0]!.brief).not.toContain("Maya");
  });

  it("R7: anchor-slot stops ⇒ one voice task + one depth task each", () => {
    const t = buildTrip();
    const tasks = r7VoiceAndDepth(GraphQuery.fromStore(t.store), [], { now: NOW });
    expect(tasks).toHaveLength(4); // 2 major stops × (voice + depth)
    const dinerBriefs = tasks.filter((x) => x.targets[0] === t.diner).map((x) => x.brief);
    expect(dinerBriefs.some((b) => b.startsWith("Voice:"))).toBe(true);
    expect(dinerBriefs.some((b) => b.startsWith("Depth:"))).toBe(true);
    expect(tasks.every((x) => x.rule === "R7_voice_and_depth")).toBe(true);
  });
});

describe("runRules", () => {
  it("appends derived tasks and is idempotent across re-runs", () => {
    const t = buildTrip();
    const first = runRules(t.store, { now: NOW });
    expect(first.length).toBeGreaterThan(0);
    expect(t.store.research.loadAll()).toHaveLength(first.length);

    const second = runRules(t.store, { now: "2026-07-02T09:00:00.000Z" });
    expect(second).toHaveLength(0);
    expect(t.store.research.loadAll()).toHaveLength(first.length);
  });

  it("pseudonym discipline: no brief ever contains a traveler label", () => {
    const t = buildTrip();
    // an assumed skeleton statement pointing AT a traveler exercises briefName
    t.store.statements.append(
      stmt({
        from: t.ben,
        rel: "hasProperty",
        to: { key: "budget_posture", value: "mid" },
        provenance: "assumed",
        confidence: 0.4,
        source: [{ checker: "archetype-defaults" }],
      }),
    );
    const tasks = runRules(t.store, { now: NOW });
    for (const task of tasks) {
      expect(task.brief).not.toContain("Maya");
      expect(task.brief).not.toContain("Ben");
    }
  });

  it("a rejected task (error note on later brief lines) is not re-created", () => {
    const t = buildTrip();
    const first = runRules(t.store, { now: NOW });
    const victim = first[0]!;
    t.store.research.amend((row) =>
      row.id === victim.id ? { ...row, brief: `${row.brief}\n[worker-rejected ${NOW}] T0 violation` } : row,
    );
    const second = runRules(t.store, { now: NOW });
    expect(second).toHaveLength(0);
  });

  it("new graph facts derive only the new tasks", () => {
    const t = buildTrip();
    const first = runRules(t.store, { now: NOW });
    const taste: GraphNode = { id: mintId("node"), kind: "taste", label: "old-growth trees", createdAt: NOW, polarity: "likes", ladder: "value" };
    t.store.nodes.append(taste);
    t.store.statements.append(stmt({ from: t.maya, rel: "hasTaste", to: taste.id, quote: "I just want to stand under something old" }));
    const second = runRules(t.store, { now: NOW });
    expect(second).toHaveLength(1);
    expect(second[0]!.rule).toBe("R4_discovery");
    expect(second[0]!.targets).toEqual([taste.id]);
    expect(t.store.research.loadAll()).toHaveLength(first.length + 1);
  });
});
