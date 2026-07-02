import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { CONSTRAINT_ALLOWED_PROVENANCE, CONSTRAINT_REL } from "@excursed/schema";
import { ConstraintGuardError, TripStore } from "./trip.js";
import { constraintNode, episode, stmt, tasteNode, tmpTripDir, traveler, T0 } from "./testkit.js";

describe("TripStore", () => {
  it("open() lays out the trip directory per TRIP_LAYOUT", () => {
    const dir = tmpTripDir();
    const store = TripStore.open(dir);
    for (const sub of ["graph", "agenda", "ledger", "runs"]) {
      expect(fs.existsSync(path.join(dir, sub))).toBe(true);
    }
    store.episodes.append(episode());
    expect(fs.existsSync(path.join(dir, "episodes.jsonl"))).toBe(true);
  });

  it("guard: rejects hasConstraint statements at any provenance other than stated", () => {
    const store = TripStore.open(tmpTripDir());
    const ana = traveler("Ana");
    const gf = constraintNode("gluten-free", "allergy");
    store.nodes.appendMany([ana, gf]);

    for (const provenance of ["implied", "inferred", "assumed", "researched", "observed"] as const) {
      const bad = stmt({
        from: ana.id,
        rel: CONSTRAINT_REL,
        to: gf.id,
        provenance,
        confidence: 0.5,
        quote: "we mostly skip bread",
      });
      expect(() => store.statements.append(bad)).toThrow(ConstraintGuardError);
      expect(() => store.statements.append(bad)).toThrow(
        new RegExp(`'${CONSTRAINT_REL}'.*'${CONSTRAINT_ALLOWED_PROVENANCE}'`),
      );
    }
    expect(store.statements.loadAll()).toEqual([]);

    // stated + quote is the one allowed doorway
    store.statements.append(
      stmt({ from: ana.id, rel: CONSTRAINT_REL, to: gf.id, quote: "Maya is celiac — that one is medical, not a preference" }),
    );
    expect(store.statements.loadAll()).toHaveLength(1);
  });

  it("guard: zod rejects stated/implied without a verbatim quote, surfaced readably", () => {
    const store = TripStore.open(tmpTripDir());
    const ana = traveler("Ana");
    const coffee = tasteNode("proper coffee");
    const noQuote = stmt({ from: ana.id, rel: "hasTaste", to: coffee.id });
    delete noQuote.quote;
    expect(() => store.statements.append(noQuote)).toThrow(/provenance 'stated' requires a verbatim quote/);
  });

  it("invalidate sets invalidatedAt + supersededBy and never deletes", () => {
    const store = TripStore.open(tmpTripDir());
    const ana = traveler("Ana");
    const coffee = tasteNode("proper coffee");
    const st = store.statements.append(stmt({ from: ana.id, rel: "hasTaste", to: coffee.id }));
    const replacement = store.statements.append(
      stmt({ from: ana.id, rel: "hasTaste", to: coffee.id, quote: "actually I quit coffee this spring" }),
    );

    const updated = store.invalidate(st.id, "contradicted by later episode", replacement.id, T0);
    expect(updated.invalidatedAt).toBe(T0);
    expect(updated.supersededBy).toBe(replacement.id);
    expect(updated.note).toContain("invalidated: contradicted by later episode");

    const all = store.statements.loadAll();
    expect(all).toHaveLength(2); // never deletes
    expect(all.find((s) => s.id === st.id)?.invalidatedAt).toBe(T0);

    expect(() => store.invalidate(st.id, "twice")).toThrow(/already invalidated/);
    expect(() => store.invalidate("st_00000000000000000000000000", "missing")).toThrow(/not found/);
  });

  it("markExtracted stamps only the requested episodes", () => {
    const store = TripStore.open(tmpTripDir());
    const [a, b] = store.episodes.appendMany([episode(), episode()]);
    expect(store.markExtracted([a!.id], "xr_1")).toBe(1);
    const all = store.episodes.loadAll();
    expect(all.find((e) => e.id === a!.id)?.extractedBy).toBe("xr_1");
    expect(all.find((e) => e.id === b!.id)?.extractedBy).toBeUndefined();
  });
});
