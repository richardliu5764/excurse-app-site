import type { Claim, ResearchTaskRow, Volatility } from "@excursed/schema";
import { GraphQuery, type TripStore } from "@excursed/graph";
import { formForPlace } from "./forms.js";
import { existingKeys, isoNow, makeTask, taskKey } from "./tasks.js";

/* R6 driver — facts rot at known speeds (ledger volatility classes), so
   refresh is scheduled mechanically: run tasksForRefresh at T-72h and T-24h
   before the trip and whenever a claim's validTo has passed. The task brief's
   first line embeds the claim id + horizon tag, so each claim earns at most
   one refresh task per horizon (idempotent across re-runs). */

export type RefreshHorizon = "72h" | "24h";
export const HORIZON_HOURS: Record<RefreshHorizon, number> = { "72h": 72, "24h": 24 };

/* Which volatility classes are re-checked at which horizon (editorial-craft
   freshness tiers): hours regimes and weekly programming at T-72h; day-of
   facts (closures, weather-dependent operation) at T-24h. Static facts are
   only re-checked when explicitly expired. */
export const VOLATILITY_HORIZON: Record<Volatility, RefreshHorizon | undefined> = {
  static: undefined,
  seasonal: "72h",
  weekly: "72h",
  daily: "24h",
};

function dateOf(nowIso: string): string {
  return nowIso.slice(0, 10);
}

/* A claim needs refresh when (a) the world it describes has expired — past
   validTo — regardless of horizon, or (b) we are inside `horizon` of the date
   the claim is FOR (validFrom, else validTo) and its volatility class is due
   at that horizon. Dateless volatile claims qualify at their horizon: they
   rot on wall-clock time, not trip time. Superseded claims never refresh —
   their successor carries the freshness burden. */
export function claimNeedsRefresh(claim: Claim, now: string, horizon?: RefreshHorizon): boolean {
  if (claim.supersededBy !== undefined) return false;
  if (claim.validTo !== undefined && claim.validTo < dateOf(now)) return true;
  if (horizon === undefined) return false;
  if (VOLATILITY_HORIZON[claim.volatility] !== horizon) return false;
  const eventDate = claim.validFrom ?? claim.validTo;
  if (eventDate === undefined) return true;
  const nowMs = Date.parse(now);
  const startMs = Date.parse(`${eventDate}T00:00:00Z`);
  const endMs = Date.parse(`${eventDate}T23:59:59Z`);
  if (endMs < nowMs) return false; // already behind us and not past validTo
  return startMs - nowMs <= HORIZON_HOURS[horizon] * 3_600_000;
}

export function refreshTaskFor(
  graph: GraphQuery,
  claim: Claim,
  now: string,
  horizon?: RefreshHorizon,
): ResearchTaskRow {
  const tag = horizon ?? "expired";
  const primary = graph.node(claim.about[0]!);
  const place = primary?.kind === "place" ? primary : undefined;
  const about = primary?.label ?? claim.about[0]!;
  const brief =
    `Refresh [${tag}] claim ${claim.id}: re-check "${claim.predicate}" (field ${claim.field}) about "${about}".` +
    `\nPrevious finding: ${claim.sentence} (tier ${claim.tier}, last checked ${claim.lastCheckedAt}). ` +
    `Confirm, correct, or mark UNFOUND with a fresh retrieved source.`;
  return makeTask("R6_refresh", formForPlace(place), [...claim.about], brief, now);
}

/* Compute (do not append) the refresh tasks due at `horizon`, deduped against
   the store's existing tasks. */
export function tasksForRefresh(store: TripStore, now: string = isoNow(), horizon?: RefreshHorizon): ResearchTaskRow[] {
  const graph = GraphQuery.fromStore(store);
  const keys = existingKeys(store.research.loadAll());
  const out: ResearchTaskRow[] = [];
  for (const claim of store.claims.loadAll()) {
    if (!claimNeedsRefresh(claim, now, horizon)) continue;
    const task = refreshTaskFor(graph, claim, now, horizon);
    if (!keys.has(taskKey(task))) {
      keys.add(taskKey(task));
      out.push(task);
    }
  }
  return out;
}

export function runRefresh(store: TripStore, now: string = isoNow(), horizon?: RefreshHorizon): ResearchTaskRow[] {
  const fresh = tasksForRefresh(store, now, horizon);
  store.research.appendMany(fresh);
  return fresh;
}
