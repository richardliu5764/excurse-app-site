import { BankEntry, type Aspect } from "@excursed/schema";
import type { z } from "zod";

/* The question bank — the shipped 12 merged with the interview-science 11
   (05-research-interview-science §2.2) into ~20 entries, per 13-council-ai
   §4.2. A bank, not a script: the session policy selects from it; a fixed
   script would repeat the current mistake with better furniture.

   Voice rules baked into every phrasing: one question per turn, no emoji, no
   exclamation marks, the out is always offered ("Either is fine."), warmth via
   specificity, never flattery. Story is first and effectively mandatory; the
   constraints sweep is never skippable (answer or explicitly decline). */

export const STORY_ANCHOR_KEY = "story.anchor";
export const STORY_MINITOUR_KEY = "story.minitour";
export const STORY_NEGATIVE_KEY = "story.negative";
export const PEAK_KEY = "occasion.peak";
export const SAFETY_SWEEP_KEY = "constraints.sweep";

/* Sweep option semantics live here, beside the option strings, because the
   frozen BankEntry schema carries options as plain strings. Picking the none
   option (or answering with only specifics) asserts the WHOLE sweep: aspects
   with no matching selection are recorded as none-stated, so coverage rises
   for every safety aspect from one answered turn. */
export const SAFETY_NONE_OPTION = "Nothing to plan around";
export const SAFETY_OPTION_ASPECT: Readonly<Record<string, Aspect>> = {
  "An allergy": "safety.allergy",
  "A diet — gluten-free, vegetarian, kosher, the works": "safety.diet",
  "Knees, lungs, or stairs to plan around": "safety.mobility",
  "Something medical I should know about, quietly": "safety.medical",
  "Little ones who nap": "safety.child",
};

const raw: z.input<typeof BankEntry>[] = [
  // ---- frame: the practical shape, asked only where trip creation left gaps
  {
    key: "frame.dates",
    kind: "text",
    aspects: ["skeleton.dates"],
    impact: "SKELETON",
    movement: "frame",
    phrasings: ["When are you going — and how fixed are those dates?"],
    placeholder: "the 12th through the 16th, give or take a day",
  },
  {
    key: "frame.lodging",
    kind: "text",
    aspects: ["skeleton.lodging"],
    impact: "SKELETON",
    movement: "frame",
    phrasings: ["Where are you sleeping — already booked, or still an open question?"],
    placeholder: "a small hotel near the old town, Tuesday to Saturday",
  },
  {
    // the missing high-EVPI fact the editorial report found by working
    // backwards from research agendas: everything routes around the anchor.
    key: "frame.fixed_anchor",
    kind: "text",
    aspects: ["skeleton.fixed_anchors"],
    impact: "SKELETON",
    movement: "frame",
    phrasings: [
      "Anything already booked or promised? A reservation, tickets, a person expecting you.",
      "Is anything already fixed — booked, ticketed, or promised to someone?",
    ],
    placeholder: "dinner on the Friday. the cousins expect us Sunday morning.",
  },
  // ---- story: the episodic anchor — highest-density signal we have
  {
    key: STORY_ANCHOR_KEY,
    kind: "story",
    aspects: ["texture.story", "texture.values", "selection.interests"],
    impact: "SELECTION",
    tier: "tar",
    movement: "story",
    audience: ["primary", "invitee"],
    phrasings: [
      "Tell me about a trip you still think about. What's the moment that comes back?",
      "One moment from a past trip you'd want again — what was it?",
    ],
    // this string is doing elicitation work; it stays.
    placeholder: "a tiny counter where the owner kept bringing us things we didn't order",
  },
  {
    key: STORY_MINITOUR_KEY,
    kind: "story",
    aspects: ["texture.story", "texture.home_baseline"],
    impact: "TEXTURE",
    tier: "tar",
    movement: "story",
    phrasings: ["Walk me through that morning.", "Who were you with when that happened?"],
  },
  {
    // the negative CIT probe — dealbreakers surface faster from bad memories
    key: STORY_NEGATIVE_KEY,
    kind: "story",
    aspects: ["selection.vetoes", "texture.story"],
    impact: "SELECTION",
    tier: "tar",
    movement: "story",
    phrasings: ["And a day of travel you'd never repeat — what went wrong?"],
    placeholder: "four hours in a bus queue, and nobody had eaten",
  },
  // ---- occasion: what the trip is for, and the peak to engineer
  {
    key: "occasion.meaning",
    kind: "chips",
    aspects: ["texture.occasion_meaning"],
    impact: "TEXTURE",
    movement: "occasion",
    options: [
      "Celebrate something",
      "Get us away for a while",
      "Bring people back together",
      "Something harder to name",
    ],
    phrasings: [
      "What should this trip do for you — celebrate something, get you away, bring people back together? Or something harder to name?",
    ],
  },
  {
    key: PEAK_KEY,
    kind: "text",
    aspects: ["texture.peak_moment"],
    impact: "TEXTURE",
    tier: "tar",
    movement: "occasion",
    phrasings: ["When it's over, what's the one moment you want to be able to tell someone about?"],
    placeholder: "the kids asleep on the train while the coast went by",
  },
  // ---- rhythm leans: the skeleton of every day
  {
    key: "rhythm.chronotype",
    kind: "pair",
    aspects: ["skeleton.chronotype"],
    impact: "SKELETON",
    movement: "rhythm",
    audience: ["primary", "invitee"],
    options: ["Early mornings", "Late nights"],
    phrasings: ["Early mornings or late nights? Either is fine. I just want your lean."],
  },
  {
    key: "rhythm.energy",
    kind: "pair",
    aspects: ["skeleton.rest_windows"],
    impact: "SKELETON",
    movement: "rhythm",
    audience: ["primary", "invitee"],
    options: ["Still going", "Somewhere quiet with a drink"],
    phrasings: ["By mid-afternoon on a good travel day: still going, or somewhere quiet with a drink?"],
  },
  {
    key: "rhythm.pace",
    kind: "pair",
    aspects: ["skeleton.pace"],
    impact: "SKELETON",
    movement: "rhythm",
    options: ["Most of it", "Just enough"],
    phrasings: ["How much should be decided before you land — most of it, or just enough?"],
  },
  {
    key: "skeleton.breakfast",
    kind: "chips",
    aspects: ["skeleton.breakfast_behavior"],
    impact: "SKELETON",
    movement: "rhythm",
    options: ["A real sit-down", "Coffee in hand, already moving", "Depends who wakes up first"],
    phrasings: ["Breakfast: a real sit-down, or coffee in hand and already moving?"],
  },
  {
    // walking radius in fatigue terms, not enthusiasm terms
    key: "skeleton.walking_radius",
    kind: "chips",
    aspects: ["skeleton.walking_radius"],
    impact: "SKELETON",
    movement: "rhythm",
    options: ["Feet", "Patience", "Blood sugar"],
    phrasings: ["When a day runs long, what gives out first — feet, patience, or blood sugar?"],
  },
  {
    // the budget fossil closed: two shipped versions themed "Money" with no
    // question behind it. SKELETON-class pair, now in the bank.
    key: "skeleton.budget_posture",
    kind: "pair",
    aspects: ["skeleton.budget_posture"],
    impact: "SKELETON",
    tier: "tar",
    movement: "rhythm",
    options: ["The room", "The table"],
    phrasings: ["Spend on the room, or spend on the table? Either is fine. I just want your lean."],
  },
  // ---- tiebreaks: forced choice late, only when the model is genuinely torn
  {
    key: "lean.novelty",
    kind: "pair",
    aspects: ["selection.novelty_lean"],
    impact: "SELECTION",
    movement: "rhythm",
    options: ["The comfortable thing", "The new thing"],
    phrasings: ["Comfort or new? Either is fine. I just want your lean."],
  },
  {
    key: "lean.food_adventurousness",
    kind: "pair",
    aspects: ["selection.food_adventurousness"],
    impact: "SELECTION",
    movement: "rhythm",
    options: ["Hole in the wall", "Somewhere with a coat check"],
    phrasings: ["Your favorite restaurant: a hole in the wall, or somewhere with a coat check?"],
  },
  {
    key: "lean.crowds",
    kind: "pair",
    aspects: ["selection.crowd_tolerance"],
    impact: "SELECTION",
    movement: "rhythm",
    options: ["The famous thing, line and all", "The no-name thing down the street"],
    phrasings: ["The famous thing with the line, or the no-name thing down the street?"],
  },
  {
    key: "lean.meals",
    kind: "pair",
    aspects: ["selection.food_tastes"],
    impact: "SELECTION",
    movement: "rhythm",
    options: ["One perfect meal", "Five small ones"],
    phrasings: ["One perfect meal, or five small ones?"],
  },
  // ---- constraints: framed as care, never bureaucracy; never skippable
  {
    key: SAFETY_SWEEP_KEY,
    kind: "chips",
    aspects: ["safety.allergy", "safety.diet", "safety.mobility", "safety.medical", "safety.child"],
    impact: "SAFETY",
    safety: true,
    movement: "constraints",
    audience: ["primary", "invitee"],
    options: [SAFETY_NONE_OPTION, ...Object.keys(SAFETY_OPTION_ASPECT)],
    phrasings: [
      "Now the practical ones, so nothing goes wrong. Anything I should plan around — food, knees, little ones? Pick what applies and spell out the details.",
      "Last, the practical ones, so nothing goes wrong on your days: anything I should plan around?",
    ],
    placeholder: "peanuts — the serious kind. and grandma's knee on stairs.",
  },
  {
    key: "constraints.veto",
    kind: "text",
    aspects: ["selection.vetoes"],
    impact: "SELECTION",
    movement: "constraints",
    audience: ["invitee"],
    phrasings: ["Anything that would ruin a day for you?"],
    placeholder: "bus tours. crowds before coffee.",
  },
  // ---- children: two playful questions, per the group protocol
  {
    key: "child.food",
    kind: "text",
    aspects: ["selection.food_tastes"],
    impact: "SELECTION",
    movement: "story",
    audience: ["child"],
    phrasings: ["What's the best thing you ever ate on a trip?"],
  },
  {
    key: "child.wish",
    kind: "text",
    aspects: ["selection.interests"],
    impact: "SELECTION",
    movement: "occasion",
    audience: ["child"],
    phrasings: ["If one whole afternoon of the trip were yours, what would we do?"],
  },
];

/* Parsed at module load so a malformed entry fails the build, not a session. */
export const BANK: readonly BankEntry[] = raw.map((e) => BankEntry.parse(e));

const byKey = new Map(BANK.map((e) => [e.key, e]));

export function bankEntry(key: string): BankEntry {
  const entry = byKey.get(key);
  if (!entry) throw new Error(`unknown bank key: ${key}`);
  return entry;
}

/* Deterministic phrasing pick: primary hears the long form, invitees and
   children the short form when a variant exists. Never generated live. */
export function phrasingFor(entry: BankEntry, audience: "primary" | "invitee" | "child"): string {
  if (audience === "primary") return entry.phrasings[0]!;
  return entry.phrasings[entry.phrasings.length - 1]!;
}
