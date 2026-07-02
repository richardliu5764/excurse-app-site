/* Shared builders for colocated tests; not exported from the package index.
   A hand-built trip: Maya (pseudonym "Kestrel", celiac — a serious allergy)
   and Ben, one dated day with two windowed slots, a candidate restaurant, a
   lonely taste. Every rule in the brief's test matrix fires on this graph. */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  mintId,
  type Claim,
  type Episode,
  type GraphNode,
  type NodeId,
  type Statement,
} from "@excursed/schema";
import { TripStore } from "@excursed/graph";

export const NOW = "2026-07-01T12:00:00.000Z";

let tick = 0;
const stamp = (): number => 1_750_000_000_000 + tick++;
export const nid = (): NodeId => mintId("node", stamp());

export function tmpTripDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "excursed-agenda-"));
}

export function stmt(partial: Partial<Statement> & Pick<Statement, "from" | "rel" | "to">): Statement {
  const st = {
    id: mintId("statement", stamp()),
    provenance: "stated",
    confidence: 0.95,
    source: [{ episode: mintId("episode", stamp()) }],
    assertedAt: NOW,
    ...partial,
  } as Statement;
  if ((st.provenance === "stated" || st.provenance === "implied") && st.quote === undefined) {
    st.quote = "verbatim words";
  }
  return st;
}

export function claim(partial: Partial<Claim> & Pick<Claim, "about" | "field">): Claim {
  return {
    id: mintId("claim", stamp()),
    predicate: "hours(2026-10-11) = 08:00-14:00",
    sentence: "Open 8am to 2pm.",
    tier: "T1",
    confidence: 0.9,
    volatility: "seasonal",
    sources: [{ url: "https://example.com/hours", kind: "web", retrievedAt: NOW }],
    lastCheckedAt: NOW,
    ...partial,
  } as Claim;
}

export interface TripFixture {
  store: TripStore;
  maya: NodeId; // traveler with label "Maya" and pseudonym "Kestrel"
  ben: NodeId;
  celiac: NodeId; // hard allergy constraint
  trip: NodeId;
  day: NodeId; // 2026-10-11
  slotMorning: NodeId; // anchor, 09:00-11:00, scheduled at museum
  slotLunch: NodeId; // anchor, 12:00-13:30, scheduled at diner
  museum: NodeId;
  diner: NodeId; // restaurant candidate
  tsukemen: NodeId; // lonely taste (zero serving candidates)
}

export function buildTrip(dir: string = tmpTripDir()): TripFixture {
  const store = TripStore.open(dir);

  const maya: GraphNode = { id: nid(), kind: "traveler", label: "Maya", createdAt: NOW, role: "primary", pseudonym: "Kestrel" };
  const ben: GraphNode = { id: nid(), kind: "traveler", label: "Ben", createdAt: NOW, role: "invitee", pseudonym: "Heron" };
  const celiac: GraphNode = { id: nid(), kind: "constraint", label: "gluten-free (celiac)", createdAt: NOW, category: "allergy", severity: "hard" };
  const trip: GraphNode = { id: nid(), kind: "trip", label: "Durham weekend", createdAt: NOW, destination: "Durham, NC", startDate: "2026-10-10", endDate: "2026-10-12" };
  const day: GraphNode = { id: nid(), kind: "day", label: "Sunday", createdAt: NOW, date: "2026-10-11" };
  const slotMorning: GraphNode = { id: nid(), kind: "slot", label: "morning anchor", createdAt: NOW, window: { start: "09:00", end: "11:00" }, species: "anchor" };
  const slotLunch: GraphNode = { id: nid(), kind: "slot", label: "lunch", createdAt: NOW, window: { start: "12:00", end: "13:30" }, species: "anchor" };
  const museum: GraphNode = { id: nid(), kind: "place", label: "Museum of Life and Science", createdAt: NOW, category: "museum" };
  const diner: GraphNode = { id: nid(), kind: "place", label: "Rise Biscuits", createdAt: NOW, category: "restaurant" };
  const tsukemen: GraphNode = { id: nid(), kind: "taste", label: "tsukemen", createdAt: NOW, polarity: "likes", ladder: "attribute" };

  store.nodes.appendMany([maya, ben, celiac, trip, day, slotMorning, slotLunch, museum, diner, tsukemen]);
  store.statements.appendMany([
    stmt({ from: maya.id, rel: "hasConstraint", to: celiac.id, quote: "Maya can't have gluten, it's celiac" }),
    stmt({ from: maya.id, rel: "hasTaste", to: tsukemen.id, quote: "the best meal of my life was tsukemen" }),
    stmt({ from: day.id, rel: "partOf", to: trip.id, provenance: "observed" }),
    stmt({ from: slotMorning.id, rel: "partOf", to: day.id, provenance: "observed" }),
    stmt({ from: slotLunch.id, rel: "partOf", to: day.id, provenance: "observed" }),
    stmt({ from: slotMorning.id, rel: "scheduledAt", to: museum.id, provenance: "observed" }),
    stmt({ from: slotLunch.id, rel: "scheduledAt", to: diner.id, provenance: "observed" }),
    stmt({ from: diner.id, rel: "candidateFor", to: slotLunch.id, provenance: "observed" }),
  ]);

  return {
    store,
    maya: maya.id,
    ben: ben.id,
    celiac: celiac.id,
    trip: trip.id,
    day: day.id,
    slotMorning: slotMorning.id,
    slotLunch: slotLunch.id,
    museum: museum.id,
    diner: diner.id,
    tsukemen: tsukemen.id,
  };
}

export function episodeRow(partial: Partial<Episode> = {}): Episode {
  return {
    id: mintId("episode", stamp()),
    kind: "interview_turn",
    at: NOW,
    text: "story text",
    ...partial,
  } as Episode;
}
