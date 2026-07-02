import { describe, expect, it } from "vitest";
import { applyMerges, normalizeLabel, proposeMerges, MERGED_NOTE_PREFIX } from "./resolve.js";
import { GraphQuery } from "./query.js";
import { TripStore } from "./trip.js";
import { placeNode, stmt, tasteNode, tmpTripDir, traveler } from "./testkit.js";

describe("normalizeLabel", () => {
  it("casefolds, strips diacritics and punctuation, collapses whitespace", () => {
    expect(normalizeLabel("Café Olé!")).toBe("cafe ole");
    expect(normalizeLabel("  L'Étoile   du   Nord ")).toBe("letoile du nord");
    expect(normalizeLabel("MERCADO — San Miguel")).toBe("mercado san miguel");
  });
});

describe("proposeMerges", () => {
  it("merges same kind + normalized label, keeping the older node", () => {
    const a = placeNode("Café Olé", { createdAt: "2026-06-01T00:00:00Z" });
    const b = placeNode("cafe ole!", { createdAt: "2026-06-02T00:00:00Z" });
    const proposals = proposeMerges([a, b]);
    expect(proposals).toEqual([{ keep: a.id, drop: b.id, reason: expect.stringContaining('place "cafe ole"') }]);
  });

  it("merges places sharing an external id even when labels differ", () => {
    const a = placeNode("The Standard Grill", { osm: "node/123" });
    const b = placeNode("Standard Grill NYC", { osm: "node/123" });
    const proposals = proposeMerges([a, b]);
    expect(proposals).toEqual([{ keep: a.id, drop: b.id, reason: "shared external id: osm node/123" }]);
  });

  it("never merges across kinds and dedupes multi-key matches", () => {
    const tasteCoffee = tasteNode("coffee");
    const placeCoffee = placeNode("Coffee");
    expect(proposeMerges([tasteCoffee, placeCoffee])).toEqual([]);

    const a = placeNode("Café Olé", { osm: "node/9" });
    const b = placeNode("cafe ole", { osm: "node/9" });
    expect(proposeMerges([a, b])).toHaveLength(1); // label + osm both hit, one proposal
  });
});

describe("applyMerges", () => {
  it("rewrites statement endpoints via superseding statements, never deleting", () => {
    const store = TripStore.open(tmpTripDir());
    const ana = store.nodes.append(traveler("Ana"));
    const keep = store.nodes.append(placeNode("Café Olé"));
    const drop = store.nodes.append(placeNode("cafe ole"));
    const taste = store.nodes.append(tasteNode("proper coffee"));
    const st = store.statements.append(
      stmt({ from: drop.id, rel: "servesTaste", to: taste.id, provenance: "inferred", confidence: 0.6, note: "from the story" }),
    );
    const untouched = store.statements.append(stmt({ from: ana.id, rel: "hasTaste", to: taste.id, quote: "good coffee matters" }));

    const proposals = proposeMerges(store.nodes.loadAll());
    expect(proposals).toEqual([{ keep: keep.id, drop: drop.id, reason: expect.any(String) }]);

    const summary = applyMerges(store, proposals, "2026-07-02T00:00:00.000Z");
    expect(summary).toEqual({ merged: 1, rewrittenStatements: 1 });

    const all = store.statements.loadAll();
    expect(all).toHaveLength(3); // original, its superseder, untouched
    const old = all.find((s) => s.id === st.id)!;
    expect(old.invalidatedAt).toBeDefined();
    expect(old.supersededBy).toBeDefined();
    const next = all.find((s) => s.id === old.supersededBy)!;
    expect(next.from).toBe(keep.id);
    expect(next.to).toBe(taste.id);
    expect(next.provenance).toBe("inferred"); // provenance/sources survive the rewrite
    expect(next.note).toContain("entity-merge");
    expect(all.find((s) => s.id === untouched.id)).toEqual(untouched);

    // dropped node is marked, filtered from kind queries, and stays on disk
    const q = GraphQuery.fromStore(store);
    expect(q.nodesByKind("place").map((n) => n.id)).toEqual([keep.id]);
    expect(store.nodes.loadAll().find((n) => n.id === drop.id)?.note).toContain(`${MERGED_NOTE_PREFIX}${keep.id}`);

    // resolver converges: nothing further to merge
    expect(proposeMerges(store.nodes.loadAll())).toEqual([]);
  });

  it("resolves merge chains to the ultimate keeper", () => {
    const store = TripStore.open(tmpTripDir());
    const a = store.nodes.append(placeNode("Trattoria da Enzo", { createdAt: "2026-06-01T00:00:00Z", osm: "node/1" }));
    const b = store.nodes.append(placeNode("Da Enzo al 29", { createdAt: "2026-06-02T00:00:00Z", osm: "node/1", wikidata: "Q7" }));
    const c = store.nodes.append(placeNode("da enzo AL 29", { createdAt: "2026-06-03T00:00:00Z" }));
    const taste = store.nodes.append(tasteNode("roman classics"));
    store.statements.append(stmt({ from: c.id, rel: "servesTaste", to: taste.id, provenance: "inferred", confidence: 0.5 }));

    // b→a (osm) and c→b (label): the statement on c must land on a
    applyMerges(store, proposeMerges(store.nodes.loadAll()));
    const q = GraphQuery.fromStore(store);
    expect(q.nodesByKind("place").map((n) => n.id)).toEqual([a.id]);
    const active = q.activeStatements().filter((s) => s.rel === "servesTaste");
    expect(active).toHaveLength(1);
    expect(active[0]!.from).toBe(a.id);
  });
});
