import type { Aspect, GraphNode, NodeKind, Rel, Statement } from "@excursed/schema";

/* The declared aspect → graph-pattern mapping. This is the bridge the
   next-question scorer stands on: `bestConfidence(aspect)` is "max confidence
   over active statements matching any of these patterns", so the interview
   package can compute score(q) = impact × (1 − bestConfidence) without ever
   parsing prose. Patterns are (rel, node-kind/category) as per the brief;
   `propertyKey` covers aspects that live as hasProperty literals rather than
   dedicated node kinds (dates, budget posture, walking radius, ...). Pass A
   turn-time tagging and the Pass B extractor both write these shapes. */
export type AspectPattern = {
  rel: Rel;
  /** kind of the target node (statement.to resolved) */
  toKind?: NodeKind;
  /** category field on the target node (constraint/rhythm/place categories) */
  category?: string;
  /** taste polarity on the target node */
  polarity?: "likes" | "avoids";
  /** taste ladder depth on the target node */
  ladder?: "attribute" | "consequence" | "value";
  /** for rel=hasProperty: the literal key that feeds this aspect */
  propertyKey?: string;
};

export const ASPECT_RULES: Record<Aspect, readonly AspectPattern[]> = {
  // SAFETY — constraint nodes by category; only 'stated' ever reaches the store.
  "safety.allergy": [{ rel: "hasConstraint", toKind: "constraint", category: "allergy" }],
  "safety.diet": [{ rel: "hasConstraint", toKind: "constraint", category: "diet" }],
  "safety.mobility": [{ rel: "hasConstraint", toKind: "constraint", category: "mobility" }],
  "safety.medical": [{ rel: "hasConstraint", toKind: "constraint", category: "medical" }],
  "safety.child": [{ rel: "hasConstraint", toKind: "constraint", category: "child" }],
  // SKELETON
  "skeleton.dates": [{ rel: "hasProperty", propertyKey: "dates" }],
  "skeleton.lodging": [
    { rel: "lodgesAt", toKind: "place" },
    { rel: "hasProperty", propertyKey: "lodging" },
  ],
  "skeleton.fixed_anchors": [
    { rel: "hasProperty", propertyKey: "fixed_anchor" },
    { rel: "books" },
  ],
  "skeleton.chronotype": [{ rel: "hasRhythm", toKind: "rhythm", category: "chronotype" }],
  "skeleton.pace": [{ rel: "hasRhythm", toKind: "rhythm", category: "pace" }],
  "skeleton.rest_windows": [{ rel: "hasRhythm", toKind: "rhythm", category: "rest" }],
  "skeleton.budget_posture": [
    { rel: "hasConstraint", toKind: "constraint", category: "budget" },
    { rel: "hasProperty", propertyKey: "budget_posture" },
  ],
  "skeleton.breakfast_behavior": [
    { rel: "hasRhythm", toKind: "rhythm", category: "meals" },
    { rel: "hasProperty", propertyKey: "breakfast_behavior" },
  ],
  "skeleton.walking_radius": [
    { rel: "hasRhythm", toKind: "rhythm", category: "energy" },
    { rel: "hasProperty", propertyKey: "walking_radius" },
  ],
  // SELECTION — taste nodes carry no category, so food_tastes/interests share
  // the base pattern (any elicited taste raises both) and the sharper facts
  // ride hasProperty literals written by the chips/scale/pair questions.
  "selection.food_tastes": [{ rel: "hasTaste", toKind: "taste", polarity: "likes" }],
  "selection.food_adventurousness": [{ rel: "hasProperty", propertyKey: "food_adventurousness" }],
  "selection.novelty_lean": [{ rel: "hasProperty", propertyKey: "novelty_lean" }],
  "selection.interests": [{ rel: "hasTaste", toKind: "taste" }],
  "selection.vetoes": [{ rel: "hasTaste", toKind: "taste", polarity: "avoids" }],
  "selection.crowd_tolerance": [{ rel: "hasProperty", propertyKey: "crowd_tolerance" }],
  // TEXTURE — the laddered value is its own statement, so depth is queryable.
  "texture.values": [{ rel: "hasTaste", toKind: "taste", ladder: "value" }],
  "texture.occasion_meaning": [{ rel: "hasProperty", propertyKey: "occasion_meaning" }],
  "texture.peak_moment": [{ rel: "hasProperty", propertyKey: "peak_moment" }],
  "texture.home_baseline": [{ rel: "hasProperty", propertyKey: "home_baseline" }],
  "texture.story": [
    { rel: "hasProperty", propertyKey: "story" },
    { rel: "holdsTension", toKind: "tension" },
  ],
};

export function statementMatchesPattern(
  st: Statement,
  pattern: AspectPattern,
  nodeById: ReadonlyMap<string, GraphNode>,
): boolean {
  if (st.rel !== pattern.rel) return false;
  if (pattern.propertyKey !== undefined) {
    return typeof st.to === "object" && st.to.key === pattern.propertyKey;
  }
  if (pattern.toKind === undefined && pattern.category === undefined && pattern.polarity === undefined && pattern.ladder === undefined) {
    return true;
  }
  if (typeof st.to !== "string") return false;
  const node = nodeById.get(st.to);
  if (!node) return false;
  if (pattern.toKind !== undefined && node.kind !== pattern.toKind) return false;
  if (pattern.category !== undefined && !("category" in node && node.category === pattern.category)) return false;
  if (pattern.polarity !== undefined && !(node.kind === "taste" && node.polarity === pattern.polarity)) return false;
  if (pattern.ladder !== undefined && !(node.kind === "taste" && node.ladder === pattern.ladder)) return false;
  return true;
}

export function statementMatchesAspect(
  st: Statement,
  aspect: Aspect,
  nodeById: ReadonlyMap<string, GraphNode>,
): boolean {
  return ASPECT_RULES[aspect].some((p) => statementMatchesPattern(st, p, nodeById));
}
