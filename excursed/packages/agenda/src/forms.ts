import { UNFOUND, type FormKind, type PlaceNode } from "@excursed/schema";

/* Fixed per-stop-type research agendas, derived from the editorial-craft
   report §3.3 ("replace 'write about X' with 'answer these questions about X,
   with sources'"). The field list IS the anti-slop contract: a worker fills
   the form or marks fields UNFOUND; a value for a field not on the form, or a
   field value citing no retrieved source, is a validator error — never a
   style problem. Field names double as hasProperty literal keys when claims
   are mirrored onto the graph, so they are snake_case and stable. */
export const FORM_FIELDS: Record<FormKind, readonly string[]> = {
  restaurant: [
    "still_open", // two independent recent signals; same ownership/chef as cited coverage
    "hours_for_date",
    "kitchen_close", // kitchen-close vs door-close
    "reservation_policy", // platform + realistic lead time + walk-in truth
    "price_posture", // band with example dish prices
    "payment_quirks", // cash-only, no tipping
    "wait_pattern", // by hour
    "noise_level",
    "kid_tolerance", // high chairs, pace
    "stroller_access",
    "dietary_capability", // ground truth: dedicated prep? menu marking? staff literacy
    "what_to_order", // >=2 sources agreeing, or chef's own statement
    "the_move", // the one-sentence why: what makes it non-substitutable
    "named_quote", // owner/chef/critic, with name and source
    "best_seat_or_time",
    "risk_signals", // closure/renovation/move, health-grade events, went-viral flag
  ],
  cafe: [
    "still_open",
    "hours_for_date",
    "price_posture",
    "payment_quirks",
    "wait_pattern",
    "noise_level",
    "stroller_access",
    "dietary_capability",
    "the_move",
    "named_quote",
    "risk_signals",
  ],
  museum: [
    "hours_for_date",
    "last_entry",
    "timed_entry", // sell-out pattern
    "ticket_format", // QR/wallet
    "free_days", // crowd warning
    "section_closures", // galleries under renovation RIGHT NOW — primary source only
    "dwell_time", // realistic, for this party size/mobility
    "stroller_access", // path truth, not map symbols
    "food_inside_or_nearby",
    "bag_rules",
    "parking_dropoff",
    "the_two_things", // Blue Guides depth: specific works/rooms, ~40 words context each
    "history_fragment", // for the interlude
    "photo_or_golden_hour",
    "special_event_closures", // trip dates; primary-source calendar check mandatory
  ],
  hike: [
    "route_stats", // distance, elevation, surface, shade/exposure
    "trailhead_truth", // official map vs actual trailhead
    "seasonal_closure_pattern",
    "gate_hours", // the classic car-locked-in failure
    "parking_fill_time", // on the relevant weekday
    "bathrooms_truth",
    "water",
    "cell_coverage",
    "turnaround_rule",
    "conditions_day_of", // surf, heat, fire, marine layer
    "why_this_route", // over the adjacent famous one
    "the_moment", // the view, the tree, the tide pool — with timing
    "leave_by_inputs", // sunset/gate/traffic as structured data for the LEAVE BY engine
  ],
  park: [
    "hours_for_date",
    "gate_hours",
    "bathrooms_truth",
    "water",
    "shade_exposure",
    "stroller_access",
    "the_moment",
    "conditions_day_of",
  ],
  shop: [
    "hours_for_date",
    "hours_confidence", // the headline — small shops are the most volatile category
    "the_one_thing", // to look at
    "price_honesty",
    "card_minimums",
    "owner_story", // Herb Lester fuel
  ],
  venue: [
    "hours_for_date",
    "event_schedule",
    "ticket_policy",
    "seating_truth",
    "noise_level",
    "stroller_access",
    "named_quote",
    "risk_signals",
  ],
  lodging: [
    "checkin_checkout",
    "parking_strategy",
    "breakfast_truth", // the most under-planned meal
    "kid_setup", // crib, high chair, quiet hours
    "stroller_access",
    "noise_level",
    "neighborhood_walk", // what is actually within the party's walking radius
  ],
  transition: [
    "travel_time",
    "leave_by", // computed, with inputs cited
    "parking_strategy", // structure names, prices, validation
    "the_walk", // the narrative fact of the walk between stops
    "cut_throughs",
    "safety_at_night", // honesty where relevant
  ],
  generic: ["still_open", "hours_for_date", "price_posture", "the_move", "named_quote"],
};

export function fieldsForForm(kind: FormKind): readonly string[] {
  return FORM_FIELDS[kind];
}

export function isFormField(kind: FormKind, field: string): boolean {
  return FORM_FIELDS[kind].includes(field);
}

/* Fields where T1 (primary source) is required, per the tier policy: hours,
   closures, tickets, gates, allergens. A T2/T3 answer here is rejected, not
   hedged — the composer's pattern voice is for soft facts, not safety/hours. */
export const T1_REQUIRED_FIELDS: ReadonlySet<string> = new Set([
  "hours_for_date",
  "kitchen_close",
  "last_entry",
  "gate_hours",
  "timed_entry",
  "ticket_policy",
  "section_closures",
  "special_event_closures",
  "seasonal_closure_pattern",
  "dietary_capability",
]);

/* Place category → form kind. Total over PlaceNode's category enum so a new
   category is a compile error here, not a silent 'generic'. */
export const PLACE_CATEGORY_FORM: Record<PlaceNode["category"], FormKind> = {
  restaurant: "restaurant",
  cafe: "cafe",
  museum: "museum",
  park: "park",
  hike: "hike",
  shop: "shop",
  venue: "venue",
  lodging: "lodging",
  transit: "transition",
  other: "generic",
};

export function formForPlace(place: Pick<PlaceNode, "category"> | undefined): FormKind {
  return place === undefined ? "generic" : PLACE_CATEGORY_FORM[place.category];
}

/* Field-name validation shared by the worker parser: values for fields not on
   the form are invented structure and reject the whole fill. */
export function unknownFieldIssues(kind: FormKind, filledFields: readonly string[]): string[] {
  return filledFields
    .filter((f) => !isFormField(kind, f))
    .map((f) => `field '${f}' is not on the ${kind} form (fill the form or mark ${UNFOUND}; never invent)`);
}
