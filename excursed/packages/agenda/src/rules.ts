import {
  ASPECTS,
  type Aspect,
  type Claim,
  type GraphNode,
  type NodeId,
  type ResearchTaskRow,
  type Statement,
  type TravelerNode,
} from "@excursed/schema";
import { GraphQuery, statementMatchesAspect, type TripStore } from "@excursed/graph";
import { formForPlace } from "./forms.js";
import { claimNeedsRefresh, refreshTaskFor, type RefreshHorizon } from "./refresh.js";
import { existingKeys, isoNow, makeTask, taskKey, type RuleOptions } from "./tasks.js";

export { taskKey, type RuleOptions } from "./tasks.js";

/* The research agenda generator, master spec §5: purely mechanical
   derivation. No LLM decides WHAT to research; these rules derive the agenda
   from graph gaps after every mutation, and LLMs only execute the tasks.

   Pseudonym discipline: briefs go to research workers (external LLM + web
   search), so they carry traveler pseudonyms NEVER labels/names, and
   constraint briefs carry the predicate, not the person — "kitchen can do
   fully gluten-free prep", not "for Maya". */

function label(graph: GraphQuery, id: NodeId): string {
  return graph.node(id)?.label ?? id;
}

/* Traveler identity never reaches a brief: pseudonym if the interview set
   one, else an opaque handle derived from the node id. */
export function pseudonymFor(t: TravelerNode): string {
  return t.pseudonym ?? `traveler-${t.id.slice(-6)}`;
}

/* A brief-safe display name: travelers pseudonymized, everything else labeled. */
function briefName(graph: GraphQuery, id: NodeId): string {
  const node = graph.node(id);
  if (node === undefined) return id;
  return node.kind === "traveler" ? pseudonymFor(node) : node.label;
}

type PlaceN = Extract<GraphNode, { kind: "place" }>;
type SlotN = Extract<GraphNode, { kind: "slot" }>;
type ConstraintN = Extract<GraphNode, { kind: "constraint" }>;

/* Candidate places: anything an active candidateFor/scheduledAt/lodgesAt
   statement puts in play. Places merely mentioned are not researched. */
function candidatePlaces(graph: GraphQuery): PlaceN[] {
  const ids = new Set<string>();
  for (const st of graph.activeStatements()) {
    if (st.rel === "candidateFor" && graph.node(st.from)?.kind === "place") ids.add(st.from);
    if ((st.rel === "scheduledAt" || st.rel === "lodgesAt") && typeof st.to === "string" && graph.node(st.to)?.kind === "place") {
      ids.add(st.to);
    }
  }
  return graph.nodesByKind("place").filter((p) => ids.has(p.id));
}

/* The predicate, not the person. Constraint labels describe the condition
   ("gluten-free (celiac)", "limited walking"), never the traveler. */
function constraintPredicate(c: ConstraintN): string {
  switch (c.category) {
    case "allergy":
    case "diet":
      return `kitchen can do fully ${c.label}-safe prep (dedicated prep, menu marking, staff allergen literacy)`;
    case "mobility":
      return `step-free access and pacing compatible with ${c.label} (entrance, bathroom, seating truth)`;
    case "child":
      return `suitability for ${c.label} (high chairs, stroller path, pace, noise)`;
    case "medical":
      return `environment is safe given ${c.label} (verify against the venue's own information)`;
    case "schedule":
    case "budget":
    case "other":
      return `compatibility with the hard constraint: ${c.label}`;
  }
}

/* R1 — ∀ candidate place × ∀ hard constraint of any attending traveler:
   verify-task requiring a T1 primary source. Serious allergy additionally
   spawns a phone-call owner action: the venue's own words, not its website. */
export function r1ConstraintVerify(
  graph: GraphQuery,
  existing: readonly ResearchTaskRow[],
  opts: RuleOptions = {},
): ResearchTaskRow[] {
  const now = opts.now ?? isoNow();
  const keys = existingKeys(existing);
  const out: ResearchTaskRow[] = [];

  const heldConstraintIds = new Set<string>();
  for (const st of graph.activeStatements()) {
    if (st.rel === "hasConstraint" && typeof st.to === "string") heldConstraintIds.add(st.to);
  }
  const hard = graph.nodesByKind("constraint").filter((c) => heldConstraintIds.has(c.id) && c.severity === "hard");

  for (const place of candidatePlaces(graph)) {
    for (const c of hard) {
      const brief =
        `Verify at "${place.label}": ${constraintPredicate(c)}. ` +
        `T1 primary source required (the venue's own allergen/accessibility page, posted policy, or a firsthand primary account).`;
      const task = makeTask(
        "R1_constraint_verify",
        formForPlace(place),
        [place.id, c.id],
        brief,
        now,
        c.category === "allergy" ? `phone-call: confirm "${c.label}" handling directly with ${place.label}` : undefined,
      );
      if (!keys.has(taskKey(task))) {
        keys.add(taskKey(task));
        out.push(task);
      }
    }
  }
  return out;
}

/* Slot → its day's date via partOf; slots not yet placed on a day have no
   date and generate no R2 task. */
function slotDate(graph: GraphQuery, slot: SlotN): string | undefined {
  for (const st of graph.statementsAbout(slot.id)) {
    if (st.rel === "partOf" && st.from === slot.id && typeof st.to === "string") {
      const day = graph.node(st.to);
      if (day?.kind === "day") return day.date;
    }
  }
  return undefined;
}

function slotPlace(graph: GraphQuery, slot: SlotN): PlaceN | undefined {
  for (const st of graph.statementsAbout(slot.id)) {
    if (st.rel === "scheduledAt" && st.from === slot.id && typeof st.to === "string") {
      const place = graph.node(st.to);
      if (place?.kind === "place") return place;
    }
  }
  return undefined;
}

/* R2 — ∀ slot with a date/time window: opening hours FOR THAT DATE, including
   holiday/closure calendars; T1 only. */
export function r2HoursForDate(
  graph: GraphQuery,
  existing: readonly ResearchTaskRow[],
  opts: RuleOptions = {},
): ResearchTaskRow[] {
  const now = opts.now ?? isoNow();
  const keys = existingKeys(existing);
  const out: ResearchTaskRow[] = [];
  for (const slot of graph.nodesByKind("slot")) {
    if (slot.window === undefined) continue;
    const date = slotDate(graph, slot);
    const place = slotPlace(graph, slot);
    if (date === undefined || place === undefined) continue;
    const brief =
      `Opening hours for "${place.label}" on ${date} (window ${slot.window.start}-${slot.window.end}): ` +
      `day-of-week quirks, kitchen-close vs door-close, holiday and closure calendars for that exact date. T1 primary source only.`;
    // place first: mirrored researched statements hang off targets[0], and
    // hours are a fact about the place, not the slot.
    const task = makeTask("R2_hours_for_date", formForPlace(place), [place.id, slot.id], brief, now);
    if (!keys.has(taskKey(task))) {
      keys.add(taskKey(task));
      out.push(task);
    }
  }
  return out;
}

/* R3 — ∀ consecutive slot pair (same day, ordered by window start): routing
   task — travel time, parking, the walk; the worker computes LEAVE BY and it
   lands as a researched statement with inputs cited. */
export function r3Routing(
  graph: GraphQuery,
  existing: readonly ResearchTaskRow[],
  opts: RuleOptions = {},
): ResearchTaskRow[] {
  const now = opts.now ?? isoNow();
  const keys = existingKeys(existing);
  const out: ResearchTaskRow[] = [];

  const byDay = new Map<string, SlotN[]>();
  for (const slot of graph.nodesByKind("slot")) {
    if (slot.window === undefined) continue;
    for (const st of graph.statementsAbout(slot.id)) {
      if (st.rel === "partOf" && st.from === slot.id && typeof st.to === "string" && graph.node(st.to)?.kind === "day") {
        const list = byDay.get(st.to) ?? [];
        list.push(slot);
        byDay.set(st.to, list);
      }
    }
  }

  for (const slots of byDay.values()) {
    slots.sort((a, b) => (a.window!.start < b.window!.start ? -1 : a.window!.start > b.window!.start ? 1 : 0));
    for (let i = 0; i + 1 < slots.length; i++) {
      const a = slots[i]!;
      const b = slots[i + 1]!;
      const fromName = slotPlace(graph, a)?.label ?? a.label;
      const toName = slotPlace(graph, b)?.label ?? b.label;
      const brief =
        `Routing from "${fromName}" to "${toName}": travel time by realistic mode, parking strategy ` +
        `(structure names, prices, validation), and the walk itself. Compute LEAVE BY for arrival by ${b.window!.start}, citing every input.`;
      const task = makeTask("R3_routing", "transition", [a.id, b.id], brief, now);
      if (!keys.has(taskKey(task))) {
        keys.add(taskKey(task));
        out.push(task);
      }
    }
  }
  return out;
}

/* Distinct places currently serving a taste/tension: servesTaste and
   candidateFor point at tastes; honorsTension at tensions. A slot serving one
   counts through its scheduled place. */
function servingPlaceCount(graph: GraphQuery, targetId: NodeId): number {
  const places = new Set<string>();
  for (const st of graph.activeStatements()) {
    if (typeof st.to !== "string" || st.to !== targetId) continue;
    if (st.rel !== "servesTaste" && st.rel !== "candidateFor" && st.rel !== "honorsTension") continue;
    const from = graph.node(st.from);
    if (from?.kind === "place") places.add(from.id);
    if (from?.kind === "slot") {
      const place = slotPlace(graph, from);
      if (place !== undefined) places.add(place.id);
    }
  }
  return places.size;
}

/* R4 — ∀ elicited taste/tension with < 2 serving candidate places: discovery
   task. Vetoes (polarity 'avoids') need no candidates — they prune, not fill. */
export function r4Discovery(
  graph: GraphQuery,
  existing: readonly ResearchTaskRow[],
  opts: RuleOptions = {},
): ResearchTaskRow[] {
  const now = opts.now ?? isoNow();
  const keys = existingKeys(existing);
  const out: ResearchTaskRow[] = [];
  const dest = graph.nodesByKind("trip")[0]?.destination;
  const where = dest === undefined ? "near the trip's geography" : `in ${dest}`;

  const elicited = new Set<string>();
  for (const st of graph.activeStatements()) {
    if ((st.rel === "hasTaste" || st.rel === "holdsTension") && typeof st.to === "string") elicited.add(st.to);
  }

  for (const taste of graph.nodesByKind("taste")) {
    if (!elicited.has(taste.id) || taste.polarity === "avoids") continue;
    if (servingPlaceCount(graph, taste.id) >= 2) continue;
    const brief =
      `Discovery: find at least 2 candidate places ${where} serving the taste "${taste.label}". ` +
      `For each: name, address, what makes it non-substitutable, and one recent signal it is open.`;
    const task = makeTask("R4_discovery", "generic", [taste.id], brief, now);
    if (!keys.has(taskKey(task))) {
      keys.add(taskKey(task));
      out.push(task);
    }
  }

  for (const tension of graph.nodesByKind("tension")) {
    if (!elicited.has(tension.id)) continue;
    if (servingPlaceCount(graph, tension.id) >= 2) continue;
    const [aId, bId] = tension.betweenIds;
    const brief =
      `Discovery: find at least 2 candidate places ${where} honoring the tension "${tension.label}" ` +
      `(between "${label(graph, aId)}" and "${label(graph, bId)}") — candidates that credibly serve both sides.`;
    const task = makeTask("R4_discovery", "generic", [tension.id], brief, now);
    if (!keys.has(taskKey(task))) {
      keys.add(taskKey(task));
      out.push(task);
    }
  }
  return out;
}

const SKELETON_ASPECTS: readonly Aspect[] = ASPECTS.filter((a) => a.startsWith("skeleton."));

function describeStatement(graph: GraphQuery, st: Statement): string {
  const subject = briefName(graph, st.from);
  const object = typeof st.to === "string" ? `"${briefName(graph, st.to)}"` : `${st.to.key}=${JSON.stringify(st.to.value)}`;
  return `${subject} ${st.rel} ${object}`;
}

/* R5 — ∀ assumed statement the skeleton leans on: hedge task (research the
   fallback). Promotion to a question when the ask threshold clears is the
   interview package's move, not this one's. */
export function r5Hedge(
  graph: GraphQuery,
  existing: readonly ResearchTaskRow[],
  opts: RuleOptions = {},
): ResearchTaskRow[] {
  const now = opts.now ?? isoNow();
  const keys = existingKeys(existing);
  const out: ResearchTaskRow[] = [];
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

  for (const st of graph.activeStatements()) {
    if (st.provenance !== "assumed") continue;
    if (!SKELETON_ASPECTS.some((a) => statementMatchesAspect(st, a, nodeById))) continue;
    const targets: NodeId[] = [st.from];
    if (typeof st.to === "string" && graph.node(st.to) !== undefined) targets.push(st.to);
    const brief =
      `Hedge: the skeleton leans on the ASSUMED statement [${describeStatement(graph, st)}]. ` +
      `Research the fallback: what is the plan if this assumption fails, and what would confirm or refute it.`;
    const task = makeTask("R5_hedge", "generic", targets, brief, now);
    if (!keys.has(taskKey(task))) {
      keys.add(taskKey(task));
      out.push(task);
    }
  }
  return out;
}

/* R6 — refresh. Predicate + task shape live in refresh.ts; this wrapper keeps
   rules.ts total over R1–R7. Without a horizon it only sweeps claims already
   past validTo; the T-72h/T-24h drivers call through refresh.ts. */
export function r6Refresh(
  graph: GraphQuery,
  existing: readonly ResearchTaskRow[],
  claims: readonly Claim[],
  opts: RuleOptions & { horizon?: RefreshHorizon } = {},
): ResearchTaskRow[] {
  const now = opts.now ?? isoNow();
  const keys = existingKeys(existing);
  const out: ResearchTaskRow[] = [];
  for (const claim of claims) {
    if (!claimNeedsRefresh(claim, now, opts.horizon)) continue;
    const task = refreshTaskFor(graph, claim, now, opts.horizon);
    if (!keys.has(taskKey(task))) {
      keys.add(taskKey(task));
      out.push(task);
    }
  }
  return out;
}

/* Major stops: places an anchor slot is scheduled at. Backups and freeform
   slots do not earn the soul budget. */
function majorStops(graph: GraphQuery): PlaceN[] {
  const ids = new Set<string>();
  for (const slot of graph.nodesByKind("slot")) {
    if (slot.species !== "anchor") continue;
    const place = slotPlace(graph, slot);
    if (place !== undefined) ids.add(place.id);
  }
  return graph.nodesByKind("place").filter((p) => ids.has(p.id));
}

/* R7 — ∀ major stop: voice-task (one named human quote, T2 source) and
   two-things-task (Blue Guides depth) — the soul budget, generated not hoped
   for. Two tasks per stop; the brief first line keeps their identities apart. */
export function r7VoiceAndDepth(
  graph: GraphQuery,
  existing: readonly ResearchTaskRow[],
  opts: RuleOptions = {},
): ResearchTaskRow[] {
  const now = opts.now ?? isoNow();
  const keys = existingKeys(existing);
  const out: ResearchTaskRow[] = [];
  for (const place of majorStops(graph)) {
    const form = formForPlace(place);
    const briefs = [
      `Voice: one named human quote about "${place.label}" — owner, chef, critic, or named regular, with name and source. T2 editorial source required; anonymous reviews do not count.`,
      `Depth: the two things worth knowing at "${place.label}" — specific works/rooms/dishes/spots, ~40 words of context each (Blue Guides depth), chosen to reward standing in front of them.`,
    ];
    for (const brief of briefs) {
      const task = makeTask("R7_voice_and_depth", form, [place.id], brief, now);
      if (!keys.has(taskKey(task))) {
        keys.add(taskKey(task));
        out.push(task);
      }
    }
  }
  return out;
}

/* Run after every graph mutation: derive all rules, append only tasks whose
   identity is new. Returns exactly what was appended. */
export function runRules(store: TripStore, opts: RuleOptions = {}): ResearchTaskRow[] {
  const now = opts.now ?? isoNow();
  const graph = GraphQuery.fromStore(store);
  const existing = store.research.loadAll();
  const claims = store.claims.loadAll();
  const o = { now };
  const fresh = [
    ...r1ConstraintVerify(graph, existing, o),
    ...r2HoursForDate(graph, existing, o),
    ...r3Routing(graph, existing, o),
    ...r4Discovery(graph, existing, o),
    ...r5Hedge(graph, existing, o),
    ...r6Refresh(graph, existing, claims, o),
    ...r7VoiceAndDepth(graph, existing, o),
  ];
  store.research.appendMany(fresh);
  return fresh;
}
