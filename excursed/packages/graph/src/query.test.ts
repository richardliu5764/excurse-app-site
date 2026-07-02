import { describe, expect, it } from "vitest";
import { ASPECTS } from "@excursed/schema";
import { GraphQuery } from "./query.js";
import { ASPECT_RULES } from "./aspects.js";
import { constraintNode, rhythmNode, stmt, tasteNode, tensionNode, traveler, T0 } from "./testkit.js";

/* Hand-built mini graph: one traveler, a stated allergy, a chronotype, three
   tastes at different ladder depths/polarities, a tension, and two literals. */
function mini() {
  const ana = traveler("Ana");
  const allergy = constraintNode("no shellfish", "allergy");
  const lark = rhythmNode("up with the sun", "chronotype");
  const coffee = tasteNode("proper coffee", "likes", "attribute");
  const crowds = tasteNode("crowded famous spots", "avoids", "attribute");
  const unhurried = tasteNode("feeling unrushed", "likes", "value");
  const tension = tensionNode("rest vs adventure", [crowds.id, coffee.id]);

  const stAllergy = stmt({ from: ana.id, rel: "hasConstraint", to: allergy.id, quote: "shellfish will send me to the ER" });
  const stLark = stmt({ from: ana.id, rel: "hasRhythm", to: lark.id, confidence: 0.9, quote: "I'm useless after 9pm" });
  const stCoffee = stmt({ from: ana.id, rel: "hasTaste", to: coffee.id, provenance: "inferred", confidence: 0.6, note: "read of the Osaka story" });
  const stCrowds = stmt({ from: ana.id, rel: "hasTaste", to: crowds.id, provenance: "inferred", confidence: 0.65, note: "veto read" });
  const stValue = stmt({ from: ana.id, rel: "hasTaste", to: unhurried.id, provenance: "inferred", confidence: 0.5, note: "laddered value" });
  const stTension = stmt({ from: ana.id, rel: "holdsTension", to: tension.id, provenance: "inferred", confidence: 0.6, note: "wants both" });
  const stBudget = stmt({ from: ana.id, rel: "hasProperty", to: { key: "budget_posture", value: "spend on the table" }, quote: "spend on the table, always" });
  const stSeasonal = stmt({
    from: ana.id,
    rel: "hasProperty",
    to: { key: "walking_radius", value: 20, unit: "min" },
    provenance: "observed",
    confidence: 0.8,
    source: [{ checker: "pedometer" }],
    validFrom: "2026-07-01",
    validTo: "2026-07-31",
  });
  const stDead = stmt({ from: ana.id, rel: "hasTaste", to: coffee.id, provenance: "inferred", confidence: 0.7, invalidatedAt: T0, note: "superseded read" });

  const nodes = [ana, allergy, lark, coffee, crowds, unhurried, tension];
  const statements = [stAllergy, stLark, stCoffee, stCrowds, stValue, stTension, stBudget, stSeasonal, stDead];
  return { ana, allergy, coffee, crowds, q: new GraphQuery(nodes, statements), stDead, stSeasonal, stCoffee };
}

describe("GraphQuery", () => {
  it("activeStatements drops invalidated and respects world-time validity", () => {
    const { q, stDead, stSeasonal } = mini();
    const active = q.activeStatements();
    expect(active.map((s) => s.id)).not.toContain(stDead.id);
    expect(active).toHaveLength(8);
    expect(q.activeStatements("2026-07-15").map((s) => s.id)).toContain(stSeasonal.id);
    expect(q.activeStatements("2026-08-02").map((s) => s.id)).not.toContain(stSeasonal.id);
  });

  it("statementsAbout sees both endpoints; nodesByKind filters by kind", () => {
    const { q, coffee, ana } = mini();
    const about = q.statementsAbout(coffee.id);
    expect(about).toHaveLength(1); // invalidated read excluded
    expect(about[0]!.from).toBe(ana.id);
    expect(q.nodesByKind("taste")).toHaveLength(3);
    expect(q.nodesByKind("constraint").map((n) => n.label)).toEqual(["no shellfish"]);
  });

  it("bestConfidence follows the declared aspect mapping", () => {
    const { q } = mini();
    expect(q.bestConfidence("safety.allergy")).toBe(0.95);
    expect(q.bestConfidence("safety.diet")).toBe(0); // category-scoped, allergy does not bleed over
    expect(q.bestConfidence("skeleton.chronotype")).toBe(0.9);
    expect(q.bestConfidence("skeleton.budget_posture")).toBe(0.95); // via hasProperty literal
    expect(q.bestConfidence("selection.food_tastes")).toBe(0.6); // likes only
    expect(q.bestConfidence("selection.vetoes")).toBe(0.65); // avoids only
    expect(q.bestConfidence("selection.interests")).toBe(0.65); // any taste
    expect(q.bestConfidence("texture.values")).toBe(0.5); // ladder=value only
    expect(q.bestConfidence("texture.story")).toBe(0.6); // holdsTension pattern
    expect(q.bestConfidence("skeleton.walking_radius")).toBe(0.8);
  });

  it("coverage() reports every aspect, zeros included, and the mapping is total", () => {
    const { q } = mini();
    const cov = q.coverage();
    expect(Object.keys(cov).sort()).toEqual([...ASPECTS].sort());
    expect(cov["skeleton.dates"]).toBe(0);
    // every aspect has at least one declared pattern — the scorer depends on it
    for (const aspect of ASPECTS) expect(ASPECT_RULES[aspect].length).toBeGreaterThan(0);
  });
});
