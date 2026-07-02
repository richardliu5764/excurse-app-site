import { describe, expect, it } from "vitest";
import { claimNeedsRefresh, runRefresh, tasksForRefresh } from "./refresh.js";
import { r6Refresh } from "./rules.js";
import { GraphQuery } from "@excursed/graph";
import { buildTrip, claim } from "./testkit.js";

// Trip day is 2026-10-11; these clocks sit at the two driver horizons.
const AT_72H = "2026-10-09T09:00:00.000Z";
const AT_24H = "2026-10-10T12:00:00.000Z";
const FAR_OUT = "2026-09-01T12:00:00.000Z";

describe("claimNeedsRefresh", () => {
  it("a claim past validTo needs refresh at any horizon, even none", () => {
    const c = claim({ about: ["nd_01HZZZZZZZZZZZZZZZZZZZZZZZ"], field: "hours_for_date", validTo: "2026-06-01" });
    expect(claimNeedsRefresh(c, "2026-07-01T00:00:00Z")).toBe(true);
    expect(claimNeedsRefresh(c, "2026-07-01T00:00:00Z", "72h")).toBe(true);
  });

  it("seasonal/weekly claims fire at 72h, daily at 24h, static never", () => {
    const about = ["nd_01HZZZZZZZZZZZZZZZZZZZZZZZ"];
    const seasonal = claim({ about, field: "hours_for_date", volatility: "seasonal", validFrom: "2026-10-11", validTo: "2026-10-11" });
    const daily = claim({ about, field: "conditions_day_of", volatility: "daily", validFrom: "2026-10-11", validTo: "2026-10-11" });
    const stat = claim({ about, field: "the_move", volatility: "static", validFrom: "2026-10-11", validTo: "2026-10-11" });

    expect(claimNeedsRefresh(seasonal, AT_72H, "72h")).toBe(true);
    expect(claimNeedsRefresh(seasonal, FAR_OUT, "72h")).toBe(false); // not inside the window yet
    expect(claimNeedsRefresh(seasonal, AT_72H, "24h")).toBe(false); // wrong horizon

    expect(claimNeedsRefresh(daily, AT_24H, "24h")).toBe(true);
    expect(claimNeedsRefresh(daily, AT_72H, "24h")).toBe(false); // still 2 days out
    expect(claimNeedsRefresh(daily, AT_24H, "72h")).toBe(false);

    expect(claimNeedsRefresh(stat, AT_24H, "24h")).toBe(false);
    expect(claimNeedsRefresh(stat, AT_72H, "72h")).toBe(false);
  });

  it("superseded claims never refresh; their successor carries the burden", () => {
    const c = claim({
      about: ["nd_01HZZZZZZZZZZZZZZZZZZZZZZZ"],
      field: "hours_for_date",
      validTo: "2026-06-01",
      supersededBy: "cl_01HZZZZZZZZZZZZZZZZZZZZZZZ",
    });
    expect(claimNeedsRefresh(c, "2026-07-01T00:00:00Z", "72h")).toBe(false);
  });

  it("dateless volatile claims qualify at their horizon (they rot on wall-clock time)", () => {
    const c = claim({ about: ["nd_01HZZZZZZZZZZZZZZZZZZZZZZZ"], field: "wait_pattern", volatility: "weekly" });
    expect(claimNeedsRefresh(c, FAR_OUT, "72h")).toBe(true);
    expect(claimNeedsRefresh(c, FAR_OUT, "24h")).toBe(false);
  });
});

describe("tasksForRefresh / runRefresh", () => {
  it("derives R6 tasks from due claims, appends them, and is idempotent", () => {
    const t = buildTrip();
    t.store.claims.append(
      claim({ about: [t.diner], field: "hours_for_date", volatility: "seasonal", validFrom: "2026-10-11", validTo: "2026-10-11" }),
    );

    const due = tasksForRefresh(t.store, AT_72H, "72h");
    expect(due).toHaveLength(1);
    expect(due[0]!.rule).toBe("R6_refresh");
    expect(due[0]!.form).toBe("restaurant"); // form derived from the about-place's category
    expect(due[0]!.targets).toEqual([t.diner]);
    expect(due[0]!.brief).toContain("Refresh [72h]");
    expect(due[0]!.brief).toContain("Rise Biscuits");

    const appended = runRefresh(t.store, AT_72H, "72h");
    expect(appended).toHaveLength(1);
    expect(runRefresh(t.store, AT_72H, "72h")).toHaveLength(0); // idempotent
    expect(t.store.research.loadAll()).toHaveLength(1);

    // the 24h horizon is a distinct identity: a daily re-check may follow a 72h one
    t.store.claims.amend((c) => ({ ...c, volatility: "daily" }));
    expect(runRefresh(t.store, AT_24H, "24h")).toHaveLength(1);
  });

  it("r6Refresh (rules-facing wrapper) sees expired claims without a horizon", () => {
    const t = buildTrip();
    t.store.claims.append(claim({ about: [t.diner], field: "hours_for_date", validTo: "2026-06-01" }));
    const graph = GraphQuery.fromStore(t.store);
    const tasks = r6Refresh(graph, [], t.store.claims.loadAll(), { now: "2026-07-01T00:00:00Z" });
    expect(tasks).toHaveLength(1);
    expect(tasks[0]!.brief).toContain("Refresh [expired]");
  });
});
