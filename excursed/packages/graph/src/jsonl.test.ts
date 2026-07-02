import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { Episode } from "@excursed/schema";
import { JsonlStore, JsonlStoreError } from "./jsonl.js";
import { episode, tmpTripDir } from "./testkit.js";

const open = () => {
  const dir = tmpTripDir();
  return { dir, store: new JsonlStore<Episode>(path.join(dir, "episodes.jsonl"), Episode) };
};

describe("JsonlStore", () => {
  it("round-trips append -> loadAll", () => {
    const { store } = open();
    const a = episode({ text: "first" });
    const b = episode({ kind: "inbox_drop", text: "second", url: "https://example.com/x" });
    store.append(a);
    store.appendMany([b]);
    expect(store.loadAll()).toEqual([a, b]);
  });

  it("loadAll on a missing file is empty, not an error", () => {
    const { store } = open();
    expect(store.loadAll()).toEqual([]);
  });

  it("rejects invalid records on append with a readable message", () => {
    const { store } = open();
    expect(() => store.append({ ...episode(), id: "not-an-id" } as Episode)).toThrow(JsonlStoreError);
    expect(() => store.append({ ...episode(), id: "not-an-id" } as Episode)).toThrow(/expected ep_<ULID>/);
    expect(store.loadAll()).toEqual([]); // nothing written on failure
  });

  it("rejects corrupt and schema-invalid lines on read, citing the line number", () => {
    const { store } = open();
    store.append(episode());
    fs.appendFileSync(store.file, "{not json\n");
    expect(() => store.loadAll()).toThrow(/:2: corrupt line/);

    const good = episode();
    fs.writeFileSync(store.file, JSON.stringify(good) + "\n" + JSON.stringify({ ...good, kind: "nope" }) + "\n");
    expect(() => store.loadAll()).toThrow(/:2: kind/);
  });

  it("writes atomically: no temp files left behind, trailing newline kept", () => {
    const { store } = open();
    store.appendMany([episode(), episode()]);
    const dir = path.dirname(store.file);
    expect(fs.readdirSync(dir).filter((f) => f.endsWith(".tmp"))).toEqual([]);
    expect(fs.readFileSync(store.file, "utf8").endsWith("\n")).toBe(true);
  });

  it("applies schema defaults on the way in", () => {
    const { store } = open();
    const { text: _drop, ...noText } = episode();
    store.append(noText as Episode);
    expect(store.loadAll()[0]!.text).toBe("");
  });

  it("amend marks records in place and preserves count", () => {
    const { store } = open();
    const [a, b] = store.appendMany([episode(), episode()]);
    const changed = store.amend((ep) => (ep.id === a!.id ? { ...ep, extractedBy: "run-1" } : ep));
    expect(changed).toBe(1);
    const all = store.loadAll();
    expect(all).toHaveLength(2);
    expect(all[0]!.extractedBy).toBe("run-1");
    expect(all[1]).toEqual(b);
  });
});
