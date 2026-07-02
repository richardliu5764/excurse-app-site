# Editorial & Content Craft — Research Report
## Research Lead: Editorial & Content Craft, Excurse Overhaul
### Deliverables: (A) analysis of what makes guidebook writing great, (B) an Editorial Bible outline for Excurse, (C) a research-pipeline design for the "research & compose" stage, (D) quality-evaluation machinery an editor-agent can run.

---

## 0. Framing: what Excurse is competing with

Excurse is not competing with TripAdvisor, Wanderlog, or ChatGPT-planned itineraries. Its stated spirit — "a hand-made field guide composed for named people you know, that works in airplane mode and asks nothing of the traveler" — puts it in the lineage of **Wildsam, Herb Lester, Monocle, the Blue Guides, and the NYT's 36 Hours**, not the lineage of AI trip-planner SaaS. That lineage has a 190-year-old craft tradition (Baedeker, 1830s) with well-understood failure modes and well-understood excellence. The core finding of this research: **every quality those publishers achieve with human editors can be decomposed into checkable, promptable, verifiable properties** — which means an AI research-and-compose pipeline can be engineered toward that bar rather than hoped toward it.

The bar has two independent axes, and the pipeline must treat them as separate systems:

1. **Trustworthiness of fact** (Baedeker's axis): hours, closures, reservations, prices, distances, "leave by" times. This is a *data engineering* problem — grounding, sourcing, freshness, confidence metadata, verify-before-trip passes.
2. **Quality of prose and curation** (Wildsam's axis): voice, selection, the "why this place" sentence, sense of place, restraint. This is an *editorial* problem — a voice bible, per-format specs, banned-pattern linting, and an editor-agent with rubrics.

AI travel content fails publicly on both axes today (hallucinated landmarks, "hidden gem" slop), and the failure modes are documented well enough to be engineered against. Details below.

---

# PART I — THE CRAFT: what makes guidebook writing great

## 1.1 The five schools, and what each contributes

### Baedeker / Blue Guides — the authority school
- Karl Baedeker's explicit aim: **free the traveler from having to look for information anywhere outside the guide** — routes, transport, tipping, prices, sights, walks. Total self-sufficiency. This maps exactly onto Excurse's offline-first constraint: the encrypted bundle *is* the Baedeker; there is no "just Google it" fallback at 9pm in airplane mode. Every practical fact the traveler will need must be anticipated and included.
- Baedeker invented **graded judgment** (the star system) — the guide as "arbiter of taste." The lesson is not stars; it's that the guide takes positions. It says *skip this*, *this is the one worth the detour*, *order this dish*. An entry without a judgment is a listing, not a guide.
- The Blue Guides added **specialist depth with context**: art, architecture, archaeology "along with the history and context necessary to understand them," written by named specialists. Lesson: depth is selective. You don't annotate everything; you annotate the two things at each stop that reward knowing.
- The later Companion Guides evolution: away from anonymous conciseness toward **a personal, named voice** going deeper into background. Authority + personality is the modern synthesis.

### Wildsam — the soul school
- Taylor Bruce's field guides "explore via prose and personalities, mixing historical anecdotes, **local interviews**, literary memoir and hand-drawn maps, all in service of a deep understanding of place." A pitmaster, a barrel raiser, a fishing guide — the guide believes **the best way to know a city is to meet its people**.
- Structural lesson: Wildsam *interleaves formats* — best-of lists sit next to essays, interviews, almanac miscellany, and hand-drawn maps. The practical and the soulful are not separated into "front matter" and "listings"; they braid.
- For Excurse: an AI cannot conduct local interviews, but it can do the moral equivalent — surface **quoted human testimony** (a chef's own words from a profile, a founder's origin story, a line from a local critic's review, an oral-history fragment) rather than synthesizing an anonymous consensus blob. One real quoted sentence from a named human beats three paragraphs of AI summary. The pipeline should have a research task type: *find one human voice per major stop*.

### Herb Lester — the wit-and-specificity school
- "Witty, pretty, curious and opinionated." They "seek out the well-used and much-loved... the extraordinary as well as the everyday — old bookshops and new coffee shops, park benches and dive bars, hat shops and haberdashers." Research is done "in-house or with trusted locals," including **reading old guidebooks**.
- Two lessons. First, **the everyday is guide-worthy**: a good bench, the right corner store, where to stand at golden hour. Excurse's "Marine Layer" and "K-Town Neon" day themes already understand this. Second, **each entry is a miniature with one idea** — Herb Lester entries run 40–80 words and each earns its place with one concrete, surprising, checkable detail, often historical. That is the target compression for Excurse stop notes.

### Monocle — the discernment school
- "Quirky, opinionated and revealing... informed but informal." Crucially: **"they will not list a hundred places to eat, but they will focus on what is best for any occasion."** Curation density: fewer entries, each fully trusted. Grand hotels next to family bistros — the mix is the point, and the register never changes between them.
- Lesson for Excurse: the guide never hedges its own curation ("another popular option is..."). If it's in the guide, it's the pick. Alternatives appear only as structured fallbacks ("if the wait is long → walk two doors down to X"), which is service, not hedging.

### 36 Hours — the choreography school
- The column's durable formula: a numbered, clock-anchored itinerary (Friday 4 p.m. → Sunday noon) where **time-of-day is the organizing narrative**, every stop has an address and price, transitions are written as movement ("walk three blocks east through..."), and a map pinpoints every stop. "Careful research, insider knowledge, and a sense of fun... with an eye to getting the most out of a short trip."
- This is Excurse's closest structural ancestor: day plans with treks, LEAVE BY times, a "Now" view keyed to time of day. The craft lesson: **transitions are content**. The sentence that gets you from stop 4 to stop 5 ("cut through the plaza; the fountain is worth the extra two minutes") is where a guide feels composed rather than assembled. The pipeline should research *the connective tissue* (the walk, the parking, the view en route), not just the stops.

## 1.2 The prose craft itself (Zinsser + working travel editors)

William Zinsser's travel-writing chapter in *On Writing Well* reduces to two principles that translate directly into pipeline rules:

1. **Style: "If a phrase comes to you easily, look at it with deep suspicion"** — it's probably a travel cliché woven so tightly into the genre you must make special effort to avoid it. (For an LLM, "comes easily" = high token probability. AI slop *is* Zinsser's easy phrase, at scale. The countermeasure is a hard banlist + a rewrite pass that demands low-probability specifics.)
2. **Substance: "Be intensely selective... eliminate every fact that is a known attribute."** Don't say the sea had waves and the sand was white; shores tend to be scattered with rocks and flown over by seagulls. Your task is to find **the central idea of the place**. (Pipeline translation: every entry must contain at least one fact the average well-read person does *not* already associate with that category of place. A taqueria entry that could describe any taqueria fails.)

Working travel editors' consensus (World Nomads, Secrets of Paris, CIEP, pitchtravelwrite.com): clichés are "the bane of a travel editor's existence"; nothing "screams amateur" more. The named banlist from these sources: *nestled, bustling, hidden gem, off the beaten path, breathtaking, quaint, charming, vibrant, a feast for the senses, something for everyone, best-kept secret, mecca for, galore, beckon, atop, eatery, land of contrasts, rich tapestry*. And: "a personal response to a place is always more memorable than generic description" — concrete details ("a pattern, a texture, a sound, a smell") are "the building blocks; without them your article is lifeless."

## 1.3 The "why this place" sentence — anatomy

The single highest-leverage editorial unit in the entire product. Every stop in an Excurse guide should carry one sentence that answers *why this place, for you, now*. Studying Wildsam/Herb Lester/Monocle/36 Hours entries, the great ones share a formula worth encoding:

> **[Specific, checkable, non-obvious fact] + [sensory or human particular] + [implicit judgment / what to do with it]** — and optionally **[the personal hook: why it's on *your* itinerary]**.

- Weak (AI-slop): "This charming eatery is a hidden gem offering an array of delicious Japanese dishes."
- Strong (Herb Lester grade): "The Yamazaki family has pulled fresh tofu here since 1970; go before 11 a.m., when the yuba is still warm."
- Excurse grade (adds the personal hook from interview data): "Warm yuba before 11 — gentle on the stomach, ten quiet minutes off the main drag, and back on the route before the museum opens."

Properties an editor-agent can check mechanically: contains a proper noun or number not in the venue's name; contains at least one sensory or temporal particular; contains an actionable judgment (a verb of instruction); contains zero banlist phrases; under ~35 words; where relevant, references a traveler constraint from the interview graph.

## 1.4 Maps as narrative

Herb Lester's illustrated maps and Wildsam's hand-drawn maps are not lower-fidelity Google Maps; they are **arguments about what matters** — a dozen chosen points, labeled in the guide's voice, with everything else suppressed. 36 Hours maps "pinpoint every stop on your itinerary" — the map is the itinerary's table of contents. Excurse already has LineString treks on MapLibre; the editorial upgrade is:
- Map labels written in guide voice ("the good bench," "leave bags here"), not POI database names.
- The trek line annotated with narrative waypoints (golden-hour timing, "steep block," "last bathroom before the trail").
- Deliberate suppression: base map styled to near-silence so the composed layer reads as the hand-drawn layer.
- Each day-map gets a one-line caption — the day's thesis ("West to the water, dinner where the fog comes in").

## 1.5 Curation density — the numbers

Observed densities in the reference publishers: Monocle ~50–100 entries per city book (explicitly *not* "a hundred places to eat"); Herb Lester ~20–40 per map; 36 Hours ~12–16 stops per weekend; Wildsam ~similar list density plus essays. For a personal trip guide the right density is 36-Hours-scale: **3–7 committed stops per day plus 2–4 structured fallbacks**, each fallback attached to a specific failure ("if the line at X exceeds 20 min," "if it rains," "if the kid melts down"). Curation confidence is expressed by *what is omitted*. The existing la-fieldguide "17 stops" Little Tokyo pocket guide is at the ceiling of acceptable density for a half-day module.

---

# PART II — THE EXCURSE EDITORIAL BIBLE (outline, ready to be written out in full)

This is the document the compose-agent is prompted with and the editor-agent grades against. Proposed structure:

## Section 1 — Voice charter
- **Register**: quiet, editorial, second person, present tense. The voice of a knowledgeable friend who has already done the worrying. Never salesy, never exclamatory, never itinerary-brochure. Existing product strings ("Enjoy the quiet," "Nothing scheduled, exactly as planned") are the calibration set — collect them as the voice's north-star corpus.
- **Stance**: opinionated but calm. One pick per need. Judgments stated as fact-adjacent ("the back room is better"), not hyped ("you'll LOVE").
- **Person & address**: travelers are named people; the guide may address them by name in personalization slots but the base prose is "you." The guide never refers to itself, never says "we recommend," never mentions AI, research, or sources in prose (sources live in metadata/provenance UI).
- **Humor**: dry, rare, Herb Lester-frequency (once a day-plan, at most).
- **Sentence mechanics**: median sentence < 18 words; no more than one em-dash per paragraph; no rule-of-three lists in prose; contractions allowed; Oxford comma; numerals for times, prices, distances.

## Section 2 — The banlist and pattern-lint (see Part IV for enforcement)
- Word banlist (travel clichés): nestled, bustling, hidden gem, vibrant, quaint, charming, breathtaking, boasts, offers, eatery, foodie, must-see/must-visit, iconic, world-class, something for everyone, feast for the senses, rich history/tapestry, beckons, whether you're X or Y.
- AI-tell banlist (from AI-detection literature): delve, robust, pivotal, comprehensive, holistic, nuanced, "it's important to note," "it's worth mentioning," "in the realm of," furthermore/moreover as paragraph openers, "isn't just X — it's Y" constructions, symmetrical both-sides framing ("while X, it also Y"), triadic benefit lists, uniform paragraph lengths, hedging ("generally speaking").
- Structural bans: no entry may open with the venue's name + "is a"; no superlative without a scope ("best breakfast burrito *on this block before 8 a.m.*" is legal); no "known for" without a source.

## Section 3 — Entry anatomy (per-format specs)
Every content object has a spec: required fields, word budget, and its "why" sentence.
- **Stop (restaurant/café/bar)**: why-sentence (≤35 w) · what to order (specific dishes, sourced) · logistics block (hours w/ confidence, reservation state, price band, wait pattern, payment quirks, noise/kid/dietary flags keyed to traveler graph) · one human voice (quote) where available · fallback pointer.
- **Stop (museum/garden/sight)**: why-sentence · the two things worth knowing (Blue Guides depth: one artwork/room/tree to actually stand in front of, with 40 words of context) · ticket/QR + timed-entry facts · time-to-allot for *this party* (adjusted for limited-walking/child flags) · bathroom/bench/shade note.
- **Stop (hike/walk/trek)**: why-sentence · distance, gain, surface, exposure · leave-by logic and its inputs (sunset, gate hours, parking fill time) · turnaround rule · water/bathroom truth · conditions-to-check-day-of list.
- **Stop (shop)**: why-sentence · the one thing to look at · price honesty · hours confidence (shops are the flakiest category — see freshness tiers).
- **Transition**: the connective sentence between stops (walk/drive/park), one useful particular, duration with buffer.
- **Day plan**: thesis line (the day's central idea, Zinsser) · shape (morning/afternoon/evening beats) · the one anchor that everything flexes around · weather/energy pivots.
- **Interlude** (Wildsam DNA): 80–150-word almanac piece per day or neighborhood — a history fragment, a local's quote, an etymology, a "what you're looking at" — the soul budget. One per day, never more.
- **Fallbacks**: always attached to a trigger condition, written in the same voice, researched to the same standard.

## Section 4 — Personalization grammar
How interview-derived traveler facts surface in prose without feeling surveilled: constraints appear as *service*, never as *labels*. ("The garden path is flat the whole way" — not "wheelchair-suitable option for Dana.") Rules for name use, for celebration references (once, at the right moment, not on every page), for dietary handling (the guide has pre-checked; it says "the menu marks GF clearly; the corn tortillas are safe," not "options for gluten-free diets available").

## Section 5 — Honesty clauses
- The guide states uncertainty plainly when confidence is low: "Hours here wander; if the gate's shut, the bakery two doors up opens at 7." Uncertainty in voice, not in error bars.
- No fabricated specifics, ever: a vivid detail that can't be sourced is cut, not kept. (This is the single rule that separates the product from AI-slop guidebooks on Amazon.)
- Prices/waits dated implicitly by the verify pass; anything unverifiable framed as pattern ("expect a wait after noon") not fact ("25-minute wait").

## Section 6 — Map & caption style
Label voice, suppression rules, trek annotation vocabulary, day-map thesis captions (per §1.4).

## Section 7 — The calibration corpus
20–30 exemplar entries (hand-polished, one per format × quality level: exemplary / acceptable / reject-with-reason) shipped alongside the bible. Few-shot material for the compose-agent and grading anchors for the editor-agent. This corpus is the highest-ROI artifact the human owner can curate; rubric research consistently shows concrete anchored examples beat abstract rubric language for judge consistency.

---

# PART III — THE RESEARCH PIPELINE ("research & compose" stage design)

## 3.1 Architecture overview

Five stages, with the key principle from grounding literature: **generation and verification are one loop, not two steps** — every composed claim must trace to a retrieved, dated source, and unsupported claims are regenerated or cut, not shipped.

```
Interview graph ──▶ (1) TRIP THESIS & SLATE     candidate stops per day-shape, from
                        (curator-agent)          traveler constraints + destination scan
                              │
                    (2) RESEARCH AGENDAS         one structured agenda per candidate,
                        (per stop type)          fanned out to research workers
                              │
                    (3) FACT LEDGER              every finding stored as an atomic,
                        (grounding layer)        sourced, dated, confidence-scored fact
                              │
                    (4) COMPOSE                  editorial bible + calibration corpus
                        (writer-agent)           + ledger facts only; cite-or-cut
                              │
                    (5) EDIT & VERIFY GATE       slop-lint → fact re-check → rubric
                        (editor-agent)           grade → human owner review
                              │
                    ──▶ trip-data build ──▶ encrypt ──▶ deploy
                              ▲
                    (6) PRE-TRIP REFRESH (T-72h/T-24h): re-verify volatile facts, redeploy
```

## 3.2 Stage 1 — Trip thesis & slate (where knowledge-graph thinking pays off)

The interview already elicits constraints (allergies, gluten-free, young child, limited walking, afternoon rest, early/late chronotype, comfort-vs-new, occasion). Materialize these as a small **traveler/trip graph**: nodes = travelers, constraints, preferences, occasion, dates, anchors (booked flights/hotels/one fixed reservation); edges = applies-to, conflicts-with, matters-most. Two uses:
1. **Slate filtering is graph-constraint satisfaction**: every candidate stop must be checked against every hard constraint (severe allergy = hard; "lean toward comfort" = soft weight). A stop that violates a hard constraint never reaches research, saving budget.
2. **The thesis sentence**: the curator-agent writes one sentence per day and one for the trip ("Slow mornings, one big thing a day, dinner early, everything within a 15-minute drive of the hotel") — Zinsser's "central idea," derived from the graph, approved by the owner *before* research spend. This is the cheapest possible point to catch a mis-read of the travelers.

## 3.3 Stage 2 — Structured research agendas per stop type

The core anti-slop move: **replace "write about X" with "answer these questions about X, with sources."** Each stop type has a fixed agenda; a research worker fills it or marks fields UNFOUND (never invents). Agendas below are the recommended v1 set.

**Restaurant / café / bar**
- Existence & identity: still open? (two independent recent signals) · same ownership/chef as the coverage you're citing? · exact name/address (chains & similarly-named traps)
- Practical: hours incl. day-of-week quirks & kitchen-close vs door-close · reservation platform + realistic lead time + walk-in truth · price band w/ example dish prices · payment quirks (cash-only, no tipping) · wait pattern by hour · noise level · kid tolerance (high chairs, pace) · dietary ground truth (GF: dedicated fryer? menu marking? staff literacy — for a *serious allergy*, the agenda requires a primary source: the restaurant's own allergen page or a firsthand account, and flags for a phone-call verification task)
- Editorial: what to order (≥2 sources agreeing, or chef's own statement) · the one-sentence why (what makes it non-substitutable) · one human voice (owner/chef/critic quote, with name and source) · founded-when/by-whom if it matters · best table/seat/time
- Risk register: recent closure/renovation/move signals · health-grade events · "went viral recently" flag (queue distortion)

**Museum / garden / attraction**
- Tickets: timed entry? sell-out pattern · QR/wallet format · free days (crowd warning) · member/reciprocal quirks
- Practical: hours + last-entry + section closures (galleries under renovation *right now* — primary source only) · realistic dwell time for this party size/mobility · stroller/wheelchair path truth · food inside vs nearby · bag rules · parking/drop-off
- Editorial: the two things (specific works/rooms/specimens with 40-word context each, Blue Guides style) · one history fragment for the interlude · photo/golden-hour note
- Risk: special-event closures on the trip dates (primary-source calendar check is mandatory)

**Hike / walk / trek**
- Route: distance, elevation, surface, shade/exposure, official map vs actual trailhead · seasonal/weather closure patterns · gate & parking-lot hours (the classic "car locked in" failure) · parking fill time on the relevant weekday
- Safety & comfort: bathrooms (truth, not map symbols) · water · cell coverage · turnaround rule ("if you're not at the bench by 10:40...") · conditions-to-check-day-of (surf, heat, fire, marine layer)
- Editorial: why this route over the adjacent famous one · the moment (the view, the tree, the tide pool) with timing · leave-by inputs (sunset/gate/traffic) as structured data for the LEAVE BY engine

**Shop / market**
- Hours confidence is the headline (small shops are the most volatile category — see 3.5 tiers; default to "call it soft") · the one thing to look at · price honesty · card minimums · owner story if there is one (Herb Lester fuel)

**Neighborhood / drive / transition**
- The narrative fact of the walk between stops · parking strategy as a researched fact (structure names, prices, validation) · the "cut through here" particulars · safety-at-night honesty where relevant

Each agenda field carries: `answer · sources[] · source_tier · last_checked · confidence · volatility_class · verify_before_trip?`

## 3.4 Stage 3 — The fact ledger (grounding layer)

Every research finding is stored as an **atomic claim** — the unit the factuality literature (VeriScore, Claimify, molecular-facts work) has converged on: decompose into self-contained, decontextualized claims and verify each against retrieved evidence. Ledger record:

```json
{
  "claim": "Kane's gate on Entrance Rd is locked at sunset year-round",
  "stop_id": "...", "field": "gate_hours",
  "sources": [{"url": "...", "tier": 1, "retrieved": "2026-07-01", "quote": "..."}],
  "source_tier": 1,            // see tiers below
  "confidence": 0.92,
  "volatility": "medium",      // stable | slow | medium | volatile
  "last_checked": "2026-07-01",
  "verify_before_trip": true,
  "status": "verified"          // found | corroborated | verified | stale | conflicting | unfound
}
```

**Source tiers** (retrieval policy prefers up-tier, and the composer may not state as fact anything below tier 2 without hedging voice):
- **T1 — primary**: the venue's own site/reservation system/social account; official park/museum/transit pages; structured APIs (Google Places for hours/open-state, OpenTable/Resy for reservation reality, park alerts feeds). Required for: hours, closures, tickets, allergens, gates.
- **T2 — edited coverage**: named critics, serious local press, the publisher canon (Eater, LA Times, Infatuation, etc.). Required for: what-to-order, editorial judgments, human-voice quotes.
- **T3 — crowd**: review aggregates, Reddit, forums. Allowed for: wait patterns, parking truth, "is it loud," corroboration. Never sole-source for a practical fact.
- **T0 — model memory**: allowed only to *generate hypotheses and search queries*, never to populate a ledger field. (This one rule eliminates the entire hallucinated-landmark failure class documented in 2025–26 incidents: the fake "Sacred Canyon of Humantay" trek in Peru, the invented Buckingham Palace Christmas market, the nonexistent "Kuak Skyride" a couple drove 400 km to ride.)

**Grounding mechanics** (from current practice): stamp every retrieved chunk with fetch date and let the model see the date so staleness is flagged rather than hidden; require the composer to cite each claim to a ledger id; run an automatic post-pass that parses citations, confirms each maps to a real ledger fact, and regenerates or cuts any sentence whose claims don't resolve ("cite-or-cut"). Google's Maps Grounding Lite / Gemini Maps grounding (MCP-exposed places+hours+routes) is the natural T1 API backbone; commercial bias in aggregator answers is a documented problem, so editorial *judgments* must never come from T1/T3 — only facts do.

**Conflict handling**: when two sources disagree (site says open Mondays, Google says closed), the claim gets `status: conflicting`, is excluded from prose as fact, and spawns a verification task (phone call, or check the venue's most recent social post — the best "is it really open" signal for small venues).

## 3.5 Freshness strategy — volatility classes and the pre-trip refresh

Freshness is "the silent failure mode of grounding": stale facts read as confident and correct. Guidebook publishing's answer was the 2–3-year revision cycle (Lonely Planet) — hopeless for hours and closures, which is exactly why print guides ceded practical authority to Google. Excurse can do what print never could: **re-verify per-trip, per-date**.

Volatility classes drive re-check schedules:
- **stable** (address, what the building is, history): check once at research time.
- **slow** (menu shape, price band, what-to-order): check at research time; re-check if research is >60 days before the trip.
- **medium** (hours, reservation lead times, exhibition schedules): verify at compose; re-verify at **T-72h**.
- **volatile** (day-of closures, weather-dependent conditions, strike/permit/wildfire alerts, "chef on vacation" social posts): re-verify at **T-24h**; anything still unresolved gets rewritten into hedged voice or swapped to fallback.

**The pre-trip refresh is a first-class product event**, enabled by the existing architecture: the service worker already stale-while-revalidates `trip-data.enc`, so a T-72h/T-24h automated pass (re-run only `verify_before_trip: true` ledger claims → patch facts → re-run affected sentences through compose+lint → rebuild → re-encrypt → redeploy) silently updates the guide the traveler already installed. This closes the loop print guides never could, and it's the single strongest differentiator vs. both print craft and AI slop. Surface it quietly in-product: a per-fact "checked Tue" whisper in logistics blocks, in voice, not a dashboard.

**Confidence + last-checked metadata per fact** is also the honesty mechanism: the composer chooses sentence form based on it (T1 + fresh → plain assertion; T3 or stale → pattern-voice: "expect," "usually," "if the gate's shut...").

## 3.6 Stage 4 — Compose

- Inputs: editorial bible + calibration corpus (few-shot) + trip thesis + the stop's ledger facts *only* (the composer is firewalled from open web and from its own parametric memory for facts — it may only style what the ledger contains).
- Every sentence carries claim-ids in a sidecar (not in the artifact); the shipping trip-data keeps a compact provenance map so future refresh passes know which sentences to touch when a fact changes.
- Composition order: day thesis → anchor stop → transitions → remaining stops → interlude → fallbacks. Transitions and fallbacks are composed with the same care (Part I lesson: connective tissue is where composed-ness lives).

## 3.7 Interview-side implications (handoff note to the interview/product leads)

The research agendas define what the interview must elicit. Beyond current questions, the highest-value additions discovered by working backwards from the agendas: the *one fixed anchor* ("is anything already booked?"), the party's realistic walking radius in minutes not enthusiasm, breakfast behavior (the most under-planned meal), the "one thing that would make this trip a failure," and — Wildsam's move — one *story* question per traveler ("tell me about the best meal of your last trip") which yields taste vectors no checklist question reaches. The product already knows this ("A story tells me more than a checklist ever could"); the pipeline should parse those stories into graph edges (taste, pace, tolerance) rather than leaving them as vibes.

---

# PART IV — QUALITY EVALUATION: the editor-agent

Three gates, cheapest first. Findings from the LLM-as-judge literature applied throughout: judges hit ~80–90% agreement with humans when rubrics are concrete and anchored with examples; direct scoring with chain-of-thought outperforms elaborate rubric machinery; pairwise comparison beats absolute scoring for style; known biases (verbosity, position, self-preference) mean the editor-agent should be a different model/prompt lineage than the composer and should grade against the calibration corpus, not in a vacuum.

## Gate 1 — Mechanical lint (deterministic, zero-LLM, runs in CI)
- Banlist scan (travel clichés + AI tells, §II.2) — hard fail.
- Structural lint: entry word budgets; sentence-length distribution (flag if variance is low — uniform rhythm is an AI tell); em-dash density; rule-of-three prose lists; "isn't just X, it's Y" regex; every stop has a why-sentence, a logistics block, and ≥1 T1-sourced practical fact; every superlative has a scope; every fallback has a trigger.
- Provenance lint: every factual sentence resolves to ledger claims; no claim below required tier for its field; no `conflicting`/`stale` claim asserted plainly; every `verify_before_trip` fact is scheduled.

## Gate 2 — Fact gate (retrieval-backed, VeriScore-style)
- Re-extract atomic claims from the *composed prose* (not the ledger — this catches facts the composer smuggled in from parametric memory) and verify each against the ledger + fresh retrieval. Unsupported → cut/regenerate. This is the standard extract→retrieve→verify pipeline from the factuality literature, run in reverse as a smuggling detector.
- Cross-checks: LEAVE BY arithmetic vs. researched drive times + gate hours + sunset; dwell-time totals vs. day length; every hard constraint in the traveler graph tested against every stop (allergen sweep is a dedicated adversarial pass: "find a way this day poisons this traveler").

## Gate 3 — Editorial rubric (LLM judge, CoT, anchored)
Scored per entry and per day against calibration anchors; each dimension 1–4 with exemplar anchors, plus a required one-sentence justification (which doubles as the revision instruction):
1. **Non-substitutability** — could this why-sentence describe any other venue in the category? (Zinsser's known-attribute test.)
2. **Specificity density** — proper nouns, numbers, sensory particulars per 50 words.
3. **Voice fidelity** — pairwise: "which of these two reads more like the calibration corpus?"
4. **Judgment presence** — does the entry take a position and give an instruction?
5. **Personal fit** — does the day honor the graph (pace, rest, chronotype, occasion) *without naming the constraints*?
6. **Honesty calibration** — are hedges present exactly where confidence is low and absent where it's high?
7. **Composed-ness** — do transitions carry content; does the day have a thesis a reader could repeat?
8. **Soul budget** — is there one human voice and one interlude, and no more?
Fail → targeted regeneration with the judge's justification as the edit note; two failed cycles → escalate to the human owner with a diff.

**Human-owner review** stays in the loop at exactly two points (matching solo-dev economics): thesis approval before research spend, and final read of the composed guide with the editor-agent's scorecard as a review heat-map. Everything else is automated.

## Regression & taste maintenance
- Keep every human edit the owner makes to composed prose as a (before, after) pair — this is free training signal for the calibration corpus and the judge anchors.
- Periodically run the composer against 3–5 frozen "golden trips" and diff judge scores to catch prompt/model drift.
- Track a slop-score time series (Gate 1 hit rate per 1,000 words) as the canary metric.

---

# PART V — SUMMARY OF RECOMMENDATIONS (priority order)

1. **Write the Editorial Bible + 20–30-entry calibration corpus first.** Highest leverage, pure writing work, everything downstream consumes it. The existing product strings already define the voice; extend them.
2. **Build the fact ledger with tiered sources, volatility classes, and `confidence + last_checked` per claim.** Forbid model memory as a source (T0 rule). This single architectural decision eliminates the documented AI-travel failure class.
3. **Adopt structured research agendas per stop type** (restaurant/museum/hike/shop/transition specs in §3.3) — replace "research X" with "answer this form about X, with sources, or mark UNFOUND."
4. **Ship the pre-trip refresh (T-72h/T-24h)** riding the existing SW stale-while-revalidate + redeploy path. It is the feature print guides structurally could not have and AI planners don't bother with.
5. **Run the three-gate editor**: deterministic slop-lint → claim-smuggling fact gate → anchored CoT rubric judge (different model lineage than composer; pairwise for voice).
6. **Research the connective tissue** — transitions, parking, bathrooms, leave-by inputs, fallback triggers — with the same rigor as stops; it's where "composed for you" lives.
7. **One human voice + one interlude per day** — the Wildsam soul budget, sourced and quoted, never synthesized.
8. **Feed interview stories into the traveler graph** as taste/pace edges; approve a one-sentence trip thesis with the owner before any research spend.

---

## Sources

Craft & publishers:
- Wildsam: [Front Porch Republic — The Power of Place: Wildsam Field Guides](https://www.frontporchrepublic.com/2023/02/the-power-of-place-wildsam-field-guides/); [Offsite interview with founder Taylor Bruce](https://medium.com/the-offsite-collection/offsite-interview-series-a-conversation-with-taylor-bruce-founder-of-wildsam-field-guides-79a7ec522e43); [Yes& Agency on Wildsam](https://yesandagency.com/work/wildsam-field-guides/)
- Herb Lester: [About Us](https://www.herblester.com/pages/our-guides); [herblester.com](https://www.herblester.com/)
- Monocle: [Monocle Travel Guide Series (Gestalten)](https://us.gestalten.com/collections/the-monocle-travel-guide-series/travel-books); [Monocle city guides](https://monocle.com/travel-guides/)
- Baedeker/Blue Guides: [Baedeker — Wikipedia](https://en.wikipedia.org/wiki/Baedeker); [Blue Guides — Wikipedia](https://en.wikipedia.org/wiki/Blue_Guides); [History of the Blue Guides](https://www.blueguides.com/about/history-of-the-blue-guides/); [Guide book — Wikipedia](https://en.wikipedia.org/wiki/Guide_book); [ResearchGate — Baedeker, perceived inventor of the formal guidebook](https://www.researchgate.net/publication/291903014)
- 36 Hours: [NYT 36 Hours USA & Canada (Ireland, ed.)](https://www.amazon.com/New-York-Times-Hours-Canada/dp/3836554895)
- Prose craft: [Rolf Potts — Zinsser, "Writing About Places"](https://rolfpotts.com/zinsser-travel-article/); [On Writing Well summaries (Shortform)](https://www.shortform.com/blog/on-writing-well-book/); [World Nomads — clichés to avoid](https://www.worldnomads.com/create/learn/writing/how-to-avoid-cliches-in-travel-writing); [Secrets of Paris — travel-writing clichés](https://secretsofparis.com/commentary/make-hemingway-proud-how-to-avoid-travel-writing-cliches/); [pitchtravelwrite — Ditch the Travel Clichés](https://www.pitchtravelwrite.com/cliches.html); [CIEP — travel editors on words](https://www.ciep.uk/resource/travel-editors-on-why-words-can-take-us-places.html)

AI failure modes:
- [Futurism — AI hallucinating landmarks endangers tourists](https://futurism.com/artificial-intelligence/ai-hallucination-landmarks-tourists); [Frommer's — AI hallucinates crucial travel info](https://www.frommers.com/tips/news/ai-hallucinates-crucial-travel-info-wrong-mistakes-like-this-can-be-dangerous-to-a-business/); [Travel Off Path — fake AI guidebooks on Amazon](https://www.traveloffpath.com/ai-generated-travel-guides/); [Rick Steves blog — AI trip planning caution](https://blog.ricksteves.com/insights/artificial-intelligence/)
- AI-writing tells: [Pangram — spotting AI writing patterns](https://www.pangram.com/blog/comprehensive-guide-to-spotting-ai-writing-patterns); [HumanizeThisAI — AI writing patterns](https://humanizethisai.com/blog/what-are-ai-writing-patterns); [Antislop framework (arXiv 2510.15061)](https://arxiv.org/pdf/2510.15061)

Grounding, factuality, evaluation:
- [Google Maps Grounding Lite](https://developers.google.com/maps/ai/grounding-lite); [Gemini Maps grounding](https://ai.google.dev/gemini-api/docs/maps-grounding); [Towards Data Science — grounding with fresh web data](https://towardsdatascience.com/grounding-llms-with-fresh-web-data-to-reduce-hallucinations/); [Firecrawl — LLM grounding guide](https://www.firecrawl.dev/blog/llm-grounding)
- [VeriScore (arXiv 2406.19276)](https://arxiv.org/pdf/2406.19276); [Molecular Facts (arXiv 2406.20079)](https://arxiv.org/pdf/2406.20079); [VeriFastScore (arXiv 2505.16973)](https://arxiv.org/pdf/2505.16973); [Fact-checking & factuality review (arXiv 2508.03860)](https://arxiv.org/pdf/2508.03860)
- LLM-as-judge: [Evidently — complete guide](https://www.evidentlyai.com/llm-guide/llm-as-a-judge); [Eugene Yan — evaluating LLM-evaluators](https://eugeneyan.com/writing/llm-evaluators/); [Confident AI guide](https://www.confident-ai.com/blog/why-llm-as-a-judge-is-the-best-llm-evaluation-method)
- Lonely Planet update economics: [Lonely Planet support — guidebook info](https://support.lonelyplanet.com/hc/en-us/articles/218157937-General-guidebook-information); [George Dunford — how to become an LP author](https://medium.com/@georged/how-to-become-a-lonely-planet-author-ab7e0868a1be)
