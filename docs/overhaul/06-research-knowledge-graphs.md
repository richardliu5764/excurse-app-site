# Knowledge Representation for Excurse: Modeling the Traveler and the Trip as a Graph

**Research lead report — Knowledge Graphs track**
**Date: 2026-07-02**

---

## 0. Executive summary

Excurse's core loop — *quiet interview → research → composed private field guide* — is today held together by prose: an interview transcript that an AI reads, researches against, and turns into a hand-feeling guide. That works for one trip at a time because a human-plus-AI keeps the whole picture in their head. It does not scale to (a) longer interviews, (b) multi-trip memory of the same travelers, (c) principled decisions about *what to ask next* and *what to research*, or (d) mechanical verification that the composed guide actually honors every constraint ("gluten-free", "young child", "limited walking", "LEAVE BY 4:40 to make golden hour").

The recommendation of this report is a small, opinionated **property graph with first-class statements** — call it the **Excurse Trip Graph (ETG)** — stored as plain, diffable JSON in the trip repo (no graph database), with:

- **~14 node types** (Traveler, Party, Trip, Day, Slot, Place, Booking, Constraint, Taste, Rhythm, Theme, Question, ResearchTask, Source) borrowed where possible from schema.org, OSM tags, and Wikidata IDs rather than invented;
- **statements (edges) carrying provenance, confidence, and bi-temporal validity** — every edge knows whether it was *stated, implied, inferred, assumed, researched,* or *observed*, how sure we are, which interview turn or source it came from, and whether it has been superseded (the Graphiti/Zep pattern);
- a **coverage-and-EVPI-driven question policy**: the graph itself decides the next interview question by finding the highest-(impact × uncertainty) missing or assumed edge — this is what makes "a few quiet questions" possible instead of a 40-item form;
- a **research agenda derived mechanically from the graph**: every consequential slot that is under-specified or unverified becomes a research task; researched facts return as world-claims with citations and get attached to Place/Booking nodes;
- **graph-guided composition with a symbolic verifier**: the guide is composed section-by-section from subgraphs (GraphRAG-lite, scoped retrieval per Day), then every hard constraint is *checked deterministically* against the schedule (opening hours, walking budgets, meal timing, LEAVE BY feasibility) — the neuro-symbolic pattern that took travel-planning success rates from ~3% to ~28–97% in benchmarks;
- a **persistent, private Traveler PKG** that lives with the composer (never shipped), so the second trip for the same family starts warm.

This is implementable by one developer: it is JSON + Zod schemas + LLM structured-output extraction + ~500 lines of deterministic checks, not an enterprise semantic-web stack. Section 4 gives a concrete schema; Section 5 the lifecycle; Section 6 the next-question algorithm; Section 7 the verifier; Section 8 storage and code shape.

---

## 1. Why a graph at all (first principles)

Start from what the product must *do* with knowledge, not from the technology:

1. **Remember people, not sessions.** "Names, checklists and the Now view adapt to you." A family is a set of persistent individuals with allergies, gaits, bedtimes, and tastes that outlive any single trip. That is a *personal knowledge graph* problem — a user-centered graph of entities personally related to the user, an active research area with its own surveys and agenda ([PKG research agenda](https://www.researchgate.net/publication/336110714_Personal_Knowledge_Graphs_A_Research_Agenda), [PKG ecosystem survey](https://arxiv.org/pdf/2304.09572), [comprehensive PKG survey](https://www.researchgate.net/publication/373048455_A_comprehensive_survey_of_personal_knowledge_graphs)).
2. **Turn a story into structure without losing the story.** The interview philosophy — "A story tells me more than a checklist ever could" — means most knowledge arrives as narrative and must be *extracted*, with a pointer back to the sentence it came from, because inference from stories is fallible and must remain auditable.
3. **Know what it doesn't know.** "Either is fine. I just want your lean" is an elicitation move. Choosing the next quiet question well is formally a value-of-information problem; the state that makes it computable is a structured model of what is known/assumed/missing.
4. **Compose under constraints and prove it.** A field guide that sends a gluten-free child on a 4-mile walk to a closed restaurant destroys the entire promise. LLMs alone are demonstrably bad at this: on the TravelPlanner benchmark, GPT-4-class agents satisfied all constraints in only ~0.6–4.4% of cases, while neuro-symbolic pipelines (LLM translates → solver/verifier checks) reach 27.9% and up to ~97% with formal verification ([TravelPlanner](https://osu-nlp-group.github.io/TravelPlanner/), [benchmark analysis](https://www.emergentmind.com/topics/travelplanner-benchmark), [ChinaTravel](https://arxiv.org/html/2412.13682v1), [SLTP symbolic agent](https://doi.org/10.3390/electronics15020422)). Constraints must therefore exist as machine-checkable objects, not adjectives in a prompt.
5. **Evolve during the trip.** Glide-inbox pastes ("fold this TikTok into Thursday") and reality ("the museum was closed") arrive mid-trip. Facts need to be *invalidated, not overwritten*, so the guide can change without amnesia — the bi-temporal pattern from agent-memory systems ([Zep temporal KG paper](https://arxiv.org/abs/2501.13956), [Graphiti](https://github.com/getzep/graphiti)).

A flat JSON blob can hold answers 1–2; only a graph with statement-level metadata cleanly supports 3–5. Equally important is what to *reject*: Excurse does not need OWL reasoning, SPARQL, triplestores, or embeddings-at-scale. The graph for one trip is a few hundred nodes. The value is in the *discipline of the schema and the metadata on edges*, not in graph infrastructure.

---

## 2. Prior art: what to borrow

### 2.1 Tourism and travel ontologies

- **schema.org** is the highest-value borrow because it's pragmatic and maps to real web data. Relevant types: [`Trip`](https://schema.org/Trip) (with `itinerary` → ordered `ItemList` of `Place`, `subTrip`/`partOfTrip` for day-level nesting), [`TouristTrip`](https://schema.org/TouristTrip) (adds `touristType` — an audience descriptor like "family with small children"), [`TouristAttraction`](https://schema.org/TouristAttraction), `TouristDestination`, `Event` (start/end, location), `FoodEstablishment`, `LodgingReservation`/`FoodEstablishmentReservation`/`EventReservation` (reservation number, `reservationFor`, under `Reservation` — this is exactly the wallet/QR model), `OpeningHoursSpecification`, `GeoCoordinates`. The community discussion introducing these types explicitly models a multi-day trip as a `TouristTrip` with per-day `Trip` nodes via `subTrip` ([schema.org issue #1810](https://github.com/schemaorg/schemaorg/issues/1810)). **Borrow the names and shapes; do not adopt JSON-LD ceremony.**
- **Academic tourism ontologies** — [Harmonise](https://www.researchgate.net/publication/268424060_Tourism_ontology_and_semantic_management_system_State-of-The-Arts_analysis) (an EU RDF mediation ontology for B2B interchange of accommodation/events), DERI Innsbruck's **OnTour** (OWL-DL for accommodation, location, gastronomy), the **Mondeca** tourism ontology (~1000 WTO-thesaurus concepts), and newer [ontology-driven tourism KGs](https://open-research-europe.ec.europa.eu/articles/5-1) — are useful mainly as *checklists of what a complete model covers* (accommodation classes, event taxonomies, gastronomy attributes, transport). None models the *traveler* well; they model supply, not people. Lesson: the supply side is a solved vocabulary problem; the demand side (person, party, taste, constraint, rhythm) is where Excurse must design.
- **OpenStreetMap tags + Wikidata** are the practical grounding layer for Place nodes: `amenity=*`, `cuisine=*`, `wheelchair=yes/limited/no`, `opening_hours=*`, `diet:gluten_free=yes`, and the [`wikidata=*` tag](https://wiki.openstreetmap.org/wiki/Key:wikidata) that links a POI to a stable Wikidata QID ([OSM Map Features](https://wiki.openstreetmap.org/wiki/Map_features)). A Place node in the ETG should carry `osm_id`, `wikidata_qid`, and/or a Google Place ID as *external identity anchors*, so that "the Huntington" is the same node across research passes, trips, and years.

### 2.2 Taste graphs from recommender systems

- **Pinterest's Taste Graph** organizes thousands of interests into a *hierarchy by level of specificity*, assigns interests to items with scores, and aggregates per-user signals **boosted by recency and frequency** ([Taste Graph part 1](https://medium.com/pinterest-engineering/taste-graph-part-1-assigning-interests-to-pins-9158b4c25906)). Lessons: tastes need (a) a small controlled vocabulary arranged general→specific ("food" → "noodles" → "tsukemen"), (b) weights, (c) decay.
- **PinnerSage** shows users are *multi-interest*: represent a person as several coherent clusters, never one average ([PinnerSage](https://arxiv.org/pdf/2007.03634)). For Excurse: a traveler node should link to *multiple* Taste nodes ("K-Town neon nightlife" *and* "quiet gardens"), and the day-composer should deliberately rotate among them (this is literally what the themed days — "Golden Hour", "Marine Layer", "K-Town Neon" — already do by hand).
- **Airbnb's embeddings** distinguish short-term (session clicks) vs long-term (booking history) interest and fall back to *type-level* (cohort) representations for cold start ([survey of these systems](https://eugeneyan.com/writing/patterns-for-personalization/)). For Excurse the analog: per-trip tastes vs persistent tastes, and sensible *defaults by traveler archetype* ("family with a 4-year-old") explicitly marked as `assumed` until confirmed.
- Group work matters too: group-tour recommenders build **group collaborative KGs** merging members' preferences and stress that individual constraints and preference aggregation are usually the missing piece ([group tour recommender](https://pmc.ncbi.nlm.nih.gov/articles/PMC11784895/), [group personality/preference study](https://link.springer.com/article/10.1007/s11257-023-09361-2)). Excurse's Party node with per-member constraints and a `deference` structure (who defers to whom, whose constraint is a veto) is the right shape.

### 2.3 LLM-era graph practice

- **Extraction from conversation.** The now-standard pipeline: process the dialogue (ideally jointly, not turn-by-turn) with an LLM constrained by an ontology, emit subject–relation–object triples *with source turn indices*, then do entity resolution/deduplication ([triples from dialogue](https://arxiv.org/pdf/2412.18364), [LLM KG-construction survey](https://arxiv.org/html/2510.20345v1), [SGMem](https://arxiv.org/html/2509.21212v1), [Mem0](https://arxiv.org/pdf/2504.19413)). Ontology-guided extraction (give the model the allowed node/edge types as a JSON schema and force structured output) dramatically improves consistency over open-ended triple extraction.
- **Temporal/versioned graphs.** [Zep/Graphiti](https://arxiv.org/abs/2501.13956) is the reference design: three layers (raw *episodes* → extracted *semantic entity* graph → *community* summaries); every fact-edge carries **four timestamps** (`created_at`, `expired_at` for system time; `valid_at`, `invalid_at` for world time); on ingesting new information the system searches for contradicting facts and **invalidates rather than deletes** them ([Graphiti overview](https://help.getzep.com/graphiti/getting-started/overview), [Neo4j writeup](https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/)). Graphiti also lets you **define custom entity/edge types as Pydantic models** — prescribed ontology plus emergent extras — which is exactly the posture ETG should take ([custom entity types](https://help.getzep.com/graphiti/core-concepts/custom-entity-and-edge-types)). Excurse can either use graphiti-core directly or (recommended, §8) copy the pattern into ~200 lines of its own code.
- **Statement-level metadata.** The semantic-web answer is **RDF-star** (annotate an edge with confidence/provenance/time without reification blowup) plus **PROV-O** for derivation chains ([Ontotext RDF-star](https://www.ontotext.com/knowledgehub/fundamentals/what-is-rdf-star/), [provenance patterns](https://www.w3.org/community/rdf-dev/2022/01/26/provenance-in-rdf-star/), [metaphacts provenance](https://blog.metaphacts.com/citation-needed-provenance-with-rdf-star)). Excurse should adopt the *concept* (every statement is annotatable) in plain JSON: the edge object simply *has* `provenance`, `confidence`, `source`, `valid_from/valid_to` fields.
- **GraphRAG / graph-guided generation.** Microsoft's GraphRAG builds an entity graph from text, clusters it into communities (Leiden), summarizes each community, and answers "global" questions from community summaries and "local" questions from entity neighborhoods ([GraphRAG](https://microsoft.github.io/graphrag/), [MS Research blog](https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/), [GraphRAG survey](https://arxiv.org/pdf/2501.13958)). At Excurse's scale full GraphRAG is overkill, but the two ideas that transfer directly: (1) **scoped subgraph retrieval per composition unit** — compose Day 3 from Day 3's slots + linked places + party constraints + relevant tastes, serialized compactly into the prompt; (2) **community summaries ≈ trip themes** — the "Golden Hour"/"Marine Layer" theme nodes are hand-made community summaries; the composer can propose them by clustering the taste+place graph.
- **Uncertainty-driven questioning.** The ask-or-assume decision is formalized as **expected value of (perfect) information**: quantify how much a candidate question would change downstream decisions, net of the cost of asking ([Structured Uncertainty guided Clarification / SAGE-Agent](https://arxiv.org/html/2511.08798v1), [active-learning preference elicitation](https://dl.acm.org/doi/10.1145/3412841.3442013), [usage-related elicitation questions](https://arxiv.org/pdf/2111.13463), [EVOI in preference elicitation](https://www.researchgate.net/publication/331662608_Preference_Elicitation_Strategy_for_Conversational_Recommender_System)). Two findings matter for Excurse's voice: questions grounded in *usage/story* ("What does a good slow morning look like for you?") outperform attribute checklists in both signal and experience; and asking should be *gated on consequence* — only ask when the answer would change the plan.

---

## 3. Design principles for the Excurse Trip Graph

1. **Two graphs, one schema.** A persistent **Traveler PKG** per person/household (lives only with the composer, never deployed) and a per-trip **Trip Graph** (a working document in the trip repo). A trip *imports* frozen snapshots of traveler facts it needs; post-trip, confirmed learnings flow back.
2. **Statements are first-class.** Every edge is an object with `provenance`, `confidence`, `source`, and bi-temporal fields. Nothing is ever silently overwritten; contradictions invalidate.
3. **Small prescribed ontology, open extension.** ~14 node types, ~25 edge types, `tags: string[]` and `attrs: {}` everywhere for the long tail. Resist adding types until the third time you need one.
4. **Borrow identity, not machinery.** Node kinds named after schema.org; places anchored to OSM/Wikidata/Google IDs; constraint/diet/accessibility vocab from OSM tag values (`diet:gluten_free`, `wheelchair=limited`). No RDF, no triplestore.
5. **Plain files, git history.** The graph is JSON in the repo; `git log` *is* the version history; PR-style diffs are the review UI for a solo composer. The encrypted deployed bundle contains only the *compiled guide*, never the raw graph.
6. **The graph is an instrument, not the product.** It exists to (a) pick the next quiet question, (b) emit the research agenda, (c) feed the composer scoped context, (d) verify the result. The traveler never sees it; the editorial voice remains prose.

---

## 4. The schema (concrete)

### 4.1 Node types

| Kind | Borrowed from | Key fields (beyond `id`, `kind`, `label`, `tags`, `attrs`) |
|---|---|---|
| `traveler` | schema:Person | name, role (adult/child), birthYear≈, homeBase |
| `party` | — | memberIds, decisionStyle (`consensus`/`leader:travelerId`), vetoHolders |
| `trip` | schema:TouristTrip | destination(s), dateRange, occasion (`celebrate`/`get-away`/`reunion`), touristType, lodgingPlaceId |
| `day` | schema:Trip (subTrip) | date, themeId?, energyBudget (`low`/`steady`/`big`), anchorSlotIds |
| `slot` | schema:Event | dayId, window {start?, end?, flexibility}, kind (`meal`/`visit`/`trek`/`rest`/`travel`/`open`), placeId?, leaveBy?, fallbackSlotId? |
| `place` | schema:Place + OSM | geo, address, osmId?, wikidataQid?, googlePlaceId?, category (OSM-style: `amenity=restaurant`, `cuisine=korean`), openingHours?, priceLevel?, accessibility {wheelchair?, stroller?, walkFromParkingMin?}, dietSupport {glutenFree?: `yes`/`limited`/`no`/`unknown`} |
| `booking` | schema:Reservation | slotId, placeId, ref#, status, qrAssetId?, cancellationPolicy?, cost? |
| `constraint` | — | holderId (traveler/party), type (`allergy`/`diet`/`mobility`/`schedule`/`budget`/`sensory`/`medical`/`custom`), severity (`hard`/`strong`/`soft`), predicate (machine-checkable, see §7), text |
| `taste` | Pinterest-style | holderId, topic (controlled vocab path, e.g. `food/noodles/tsukemen`), valence (−1..1), intensity, persistentVsTrip |
| `rhythm` | — | holderId, pattern (`early-riser`/`late-night`/`afternoon-rest`/`slow-mornings`/`one-anchor-per-day`…), params (e.g. restWindow "13:30–15:00") |
| `theme` | ≈GraphRAG community | name ("Golden Hour"), dayIds, tasteIds it serves, editorial one-liner |
| `question` | — | targets (edge/slot it would resolve), status (`pending`/`asked`/`answered`/`declined`), phrasing, score (see §6) |
| `researchTask` | — | targets, query, status, resultClaimIds |
| `source` | ≈Graphiti episode / PROV-O | type (`interview-turn`/`glide-inbox`/`web`/`composer-note`/`observation`), pointer (turnId/url/inboxItemId), capturedAt, excerpt |

### 4.2 Edge (statement) shape — the heart of the design

```ts
type Statement = {
  id: string;                     // st_<ulid>
  from: NodeId; rel: string; to: NodeId | Literal;
  // epistemic metadata (the RDF-star / Graphiti part):
  provenance: 'stated'            // traveler said it (quote available)
            | 'implied'           // clearly entailed by what they said
            | 'inferred'          // model's read of the story
            | 'assumed'           // archetype default, unconfirmed
            | 'researched'        // from a cited external source
            | 'observed';         // happened during the trip (inbox, check-in)
  confidence: number;             // 0..1
  source: SourceId[];             // interview turn(s), url(s) — never empty
  // bi-temporal (Zep/Graphiti four-timestamp pattern):
  assertedAt: string;             // when it entered the graph
  invalidatedAt?: string;         // system time it was retracted/superseded
  validFrom?: string; validTo?: string;  // when it holds in the world
  supersededBy?: StatementId;
  note?: string;                  // one editorial line, keeps the story attached
};
```

Core relations (~25): `memberOf`, `holdsConstraint`, `hasTaste`, `hasRhythm`, `defersTo`, `travelsOn` (traveler→trip), `partOf` (day→trip, slot→day), `at` (slot→place), `bookedAs` (slot→booking), `near`, `servesTaste` (place/theme→taste), `satisfies`/`violates` (slot/place→constraint — *written by the verifier, provenance `inferred` with checker name as source*), `mentions` (source→node), `answeredBy` (question→source), `groundsTo` (place→external ID claim), `foldedFrom` (slot→glide-inbox source).

**Worked example** (from the interview line "Maya can't do gluten, and honestly she fades hard by 2pm"):

```jsonc
{ "from": "trav_maya", "rel": "holdsConstraint", "to": "cons_gf",
  "provenance": "stated", "confidence": 0.98, "source": ["turn_014"], "assertedAt": "..." }
{ "from": "trav_maya", "rel": "hasRhythm", "to": "rhy_afternoon_rest",
  "provenance": "implied", "confidence": 0.85, "source": ["turn_014"],
  "note": "“fades hard by 2pm” → protect 13:30–15:00" }
{ "from": "party_liu", "rel": "hasTaste", "to": "taste_low_key_dinners",
  "provenance": "assumed", "confidence": 0.4, "source": ["archetype_family_young_child"] }
```

The third statement is precisely the kind of edge that either gets *asked about* (if consequential) or *carried as an assumption* the composer may hedge around.

### 4.3 World-claims vs person-claims

Facts about places ("Huntington closes 17:00 Tue", "Kinjiro has a dedicated GF fryer: source URL") are the same `Statement` shape with `provenance: 'researched'`, attached to Place nodes. This unifies the whole system: interview extraction and research both just add statements; the verifier consumes both kinds; staleness checks (`validTo` on opening hours, "verified 2026-06-28") fall out of the same temporal fields.

---

## 5. Lifecycle: transcript → graph → agenda → guide

### Stage A — Interview ingestion (continuous, per turn-batch)
1. Append each interview exchange as a `source` node (episode).
2. Run the **extractor**: one LLM call with the ETG ontology as a JSON schema (structured output), the last N turns plus current graph summary, instructed to emit new/updated statements *with provenance labels and source turn IDs*, and to flag contradictions with existing statement IDs. (This is the ontology-guided pattern from the [KG-construction survey](https://arxiv.org/html/2510.20345v1) + [Graphiti custom types](https://help.getzep.com/graphiti/core-concepts/custom-entity-and-edge-types).)
3. **Entity resolution**: deterministic first (same name+kind, same external ID), LLM adjudication only for ambiguous merges. Contradictions invalidate the older statement (`invalidatedAt`, `supersededBy`), never delete.
4. On trip creation, **seed from archetype**: instantiate `assumed` statements from the party's touristType (family-with-toddler defaults: early dinners, stroller access matters, one anchor/day). Assumptions are fuel for Stage B, not truth.

### Stage B — Gap analysis & the next quiet question (see §6)
After each extraction pass, score the graph for gaps; emit at most a handful of `question` nodes; the interviewer agent phrases the top one in Excurse's voice. The interview *ends* when no remaining question clears the ask-threshold — which is how "a few quiet questions" stays a promise, not a hope.

### Stage C — Research agenda
Mechanically derive `researchTask` nodes:
- every Place candidate touching a `hard` constraint → verify the constraint predicate (GF menu, step-free entry) *with citation*;
- every `slot` with a time window → verify opening hours/closures for the actual date; compute `leaveBy` from geometry (routing) and note it as a researched statement;
- every `taste` with no serving places yet → discovery task ("tsukemen near Little Tokyo, quiet room, GF-friendly fallback within 200m");
- every `assumed` statement the composer intends to lean on → either promote to a question (if cheap to ask) or research a hedge (fallback option).
Research results come back as `researched` statements with URLs in `source` and `validTo` for perishables. The research agent's output is thus *merged into the same graph*, not a separate document — this is what lets the verifier see it.

### Stage D — Composition (graph-guided generation)
1. **Theme proposal**: cluster tastes×places×days; propose `theme` nodes (the community-summary move from [GraphRAG](https://microsoft.github.io/graphrag/), done with one LLM call at this scale).
2. **Skeleton**: place anchors into slots respecting rhythms (rest windows, early mornings), booking fixed-points, and geography (cluster by neighborhood per day).
3. **Verify** (§7). Violations either re-plan the slot or emit a research/ask task. Loop until clean or consciously waived (waivers recorded as statements).
4. **Compose prose per unit**: for each Day/section, serialize its scoped subgraph (slots + places + the party's constraints/tastes/rhythms + researched claims + editorial notes) into the prompt; the writer produces the field-guide prose, wallet entries, treks. Because `note` fields carry the traveler's own words, the output can echo the story back ("you said mornings are yours — this one starts slow").
5. **Compile** to the deployed artifact: the existing trip-data JSON → encrypted `trip-data.enc`. The graph itself stays in the repo (or a private companion repo), unencrypted-but-private, as the composer's working memory.

### Stage E — During and after the trip
- Glide-inbox pastes become `source` nodes → same extractor → new candidate slots (`foldedFrom` edges), with the verifier re-run on the affected day before the update ships.
- Observations ("skipped the garden, kids melted down") become `observed` statements; they *invalidate* assumptions (bi-temporal, reversible) and are gold for the next trip.
- Post-trip, a distillation pass proposes which trip-graph statements to promote into the persistent Traveler PKG (human-approved, since this is long-term memory about real people).

---

## 6. How the graph decides what to ask next

Maintain a **coverage model**: for each node type, a short list of *decision-relevant aspects* (party: any hard constraints per member? decision style? occasion?; per traveler: diet, mobility, rhythm, 1–3 tastes, comfort-vs-novelty lean; trip: dates, lodging, non-negotiables, budget posture). For every aspect, its status is `answered` / `assumed(confidence)` / `unknown`.

Score every candidate question (EVPI-lite, following [SAGE-Agent](https://arxiv.org/html/2511.08798v1) and classic [EVOI elicitation](https://www.researchgate.net/publication/331662608_Preference_Elicitation_Strategy_for_Conversational_Recommender_System)):

```
score(q) = impact(q) × uncertainty(q) × answerability(q) − askCost
```

- **impact**: how many planned slots/days would change if the answer flips? (Count graph edges downstream of the aspect. A hard-constraint aspect touching every meal slot has huge impact; "favorite color" ~0.) Hard-constraint aspects get an impact floor — safety items are always asked, never assumed.
- **uncertainty**: 1 − confidence of the best current statement; `unknown` = 1.0; `stated` ≈ 0.
- **answerability**: can a human answer this warmly in one breath? Prefer story-shaped prompts over attribute checklists (per the [usage-question finding](https://arxiv.org/pdf/2111.13463)): not "rate your walking tolerance 1–5" but "when a day runs long, what usually gives out first — feet, patience, or blood sugar?"
- **askCost**: rises with each question already asked this session (protects "a few quiet questions"); also rises for questions answerable by research instead (never ask what the web knows).

Ask the top question; batch at most 2–3 per exchange; stop when max score < threshold. Declined questions get `status: declined` and their aspects fall back to hedged assumptions — which the composer then designs around (fallbacks, options) rather than betting on. **This same scorer is the interview's stopping rule and the assumption ledger for composition.**

---

## 7. The symbolic verifier (what makes the guide trustworthy)

Constraints carry machine-checkable `predicate`s evaluated against the schedule + researched world-claims. Initial checker set (each ~20–50 lines of TypeScript):

1. **Open-hours**: every `slot.at(place)` window ⊆ place opening hours *for that date* (holiday-aware; fail if hours unverified for date).
2. **Diet**: every meal slot for a party containing `diet:gluten_free(hard)` must be at a place with `dietSupport.glutenFree ∈ {yes, limited-with-note}` backed by a `researched` statement < 60 days old, or have a flagged fallback.
3. **Mobility/energy**: sum walking distance per day (from trek LineStrings + inter-slot routing) ≤ holder's budget; `afternoon_rest` rhythm ⇒ no scheduled slot in the protected window, or an explicit waiver.
4. **LEAVE BY feasibility**: departure time = next slot start − routed travel time − buffer; verify stated `leaveBy` values instead of trusting composition.
5. **Meal cadence with a young child**: max gap between food opportunities ≤ N hours across 11:00–19:00.
6. **Booking coherence**: every booking's slot matches its reservation datetime; QR asset exists in wallet; cancellation deadlines surfaced as loose-ends.
7. **Freshness**: any `researched` statement past `validTo` (or older than policy) that a slot depends on → re-research task.

Verifier output is written back as `satisfies`/`violates` statements (provenance `inferred`, source = checker id), so the composer prompt can honestly say *why* each choice is safe — and the "Loose ends" view can be generated from open violations and unexpired cancellation windows. This is the neuro-symbolic division of labor the travel-planning literature shows is necessary ([TravelPlanner](https://osu-nlp-group.github.io/TravelPlanner/), [SLTP](https://doi.org/10.3390/electronics15020422)).

---

## 8. Storage & implementation shape

- **Format**: one directory, e.g. `graph/` in the trip repo: `nodes.jsonl`, `statements.jsonl`, `sources/` (transcript turns, inbox items), append-friendly, diffable. A tiny loader builds in-memory indexes (by node, by relation, active-only view = statements with no `invalidatedAt`). At <5k statements per trip, in-memory is instant; no Neo4j, no vector DB (embed only if/when place-discovery search needs it).
- **Schemas**: Zod (TS) definitions are the single source of truth — they generate (a) the JSON schema handed to the LLM extractor as its output contract, (b) runtime validation, (c) types for the verifier and compiler. This mirrors Graphiti's Pydantic-typed ontology pattern.
- **IDs**: `kind_slug` for stable human-authored nodes (`trav_maya`, `place_huntington`), ULIDs for statements. External anchors (`wikidata_qid`, `osmId`, `googlePlaceId`) required on any place the verifier must check.
- **Option**: adopt `graphiti-core` outright if a hosted graph + built-in invalidation is wanted; but at solo-dev, one-trip-at-a-time scale, owning ~500–800 lines (extractor prompt, merge/invalidate, coverage scorer, 7 checkers, subgraph serializer) is simpler, fully offline, and keeps the repo-as-database aesthetic of the project. Revisit if Excurse ever becomes multi-tenant.
- **Privacy**: the Traveler PKG lives outside all trip repos (local to the composer; encrypted at rest if synced). Trip repos contain the trip graph only if the repo is private; the *deployed* bundle contains only compiled guide content, encrypted as today. Statements about children and medical constraints never appear in deployed artifacts except as their operational consequences ("this menu is safe").

---

## 9. Risks and honest caveats

- **Extraction quality**: LLM triple extraction over-infers; mitigate with the provenance discipline (force the model to label `stated` vs `inferred` and quote the turn), and keep the human-composer review of graph diffs in the loop — at this scale that review is minutes, and it *is* the editorial craft.
- **Ontology creep**: the failure mode of every semantic-travel project since Harmonise. The 14-types/25-relations budget is a feature; extensions go in `attrs` until proven recurring.
- **Over-formalization vs voice**: the graph must never become the product. Prose composes *from* it; the `note` fields exist so the traveler's own words survive the round-trip.
- **Assumption liability**: `assumed` edges are useful but must be visibly hedged in output when unconfirmed (offer choices rather than commit) — the EVPI gate decides ask vs hedge, but hedging is the default, asking is the exception.
- **World-data staleness**: opening hours and GF menus rot; the `validTo`/freshness checker turns this from a silent failure into a research task.

---

## 10. Sources

**Personal knowledge graphs**: [PKG: A Research Agenda](https://www.researchgate.net/publication/336110714_Personal_Knowledge_Graphs_A_Research_Agenda) · [Ecosystem for PKGs — survey & roadmap](https://arxiv.org/pdf/2304.09572) · [Comprehensive PKG survey](https://www.researchgate.net/publication/373048455_A_comprehensive_survey_of_personal_knowledge_graphs) · [PKG for recommendation](https://www.researchgate.net/publication/361827593_PKG_A_Personal_Knowledge_Graph_for_Recommendation)

**Tourism ontologies & vocabularies**: [schema.org/Trip](https://schema.org/Trip) · [schema.org/TouristTrip](https://schema.org/TouristTrip) · [schema.org/TouristAttraction](https://schema.org/TouristAttraction) · [schema.org itinerary property](https://schema.org/itinerary) · [schemaorg issue #1810 (TouristTrip design)](https://github.com/schemaorg/schemaorg/issues/1810) · [Tourism ontology state-of-the-art (Harmonise, OnTour/DERI, Mondeca)](https://www.researchgate.net/publication/268424060_Tourism_ontology_and_semantic_management_system_State-of-The-Arts_analysis) · [Ontology-driven tourism KG](https://open-research-europe.ec.europa.eu/articles/5-1) · [OSM Map Features](https://wiki.openstreetmap.org/wiki/Map_features) · [OSM Key:amenity](https://wiki.openstreetmap.org/wiki/Key:amenity) · [OSM Key:wikidata](https://wiki.openstreetmap.org/wiki/Key:wikidata)

**Taste graphs / rec-sys**: [Pinterest Taste Graph](https://medium.com/pinterest-engineering/taste-graph-part-1-assigning-interests-to-pins-9158b4c25906) · [PinnerSage](https://arxiv.org/pdf/2007.03634) · [Patterns for personalization (Airbnb et al.)](https://eugeneyan.com/writing/patterns-for-personalization/) · [KG-based recommender survey](https://www.mdpi.com/2078-2489/12/6/232) · [Group tour recommender](https://pmc.ncbi.nlm.nih.gov/articles/PMC11784895/) · [Group tourism personality study](https://link.springer.com/article/10.1007/s11257-023-09361-2)

**LLM-era graph practice**: [Zep temporal KG for agent memory](https://arxiv.org/abs/2501.13956) · [Graphiti (GitHub)](https://github.com/getzep/graphiti) · [Graphiti overview docs](https://help.getzep.com/graphiti/getting-started/overview) · [Graphiti custom entity/edge types](https://help.getzep.com/graphiti/core-concepts/custom-entity-and-edge-types) · [Neo4j on Graphiti](https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/) · [Mem0](https://arxiv.org/pdf/2504.19413) · [SGMem](https://arxiv.org/html/2509.21212v1) · [Triples from dialogue](https://arxiv.org/pdf/2412.18364) · [LLM KG-construction survey](https://arxiv.org/html/2510.20345v1) · [Microsoft GraphRAG project](https://www.microsoft.com/en-us/research/project/graphrag/) · [GraphRAG blog](https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/) · [microsoft/graphrag](https://github.com/microsoft/graphrag) · [Graph-RAG survey](https://arxiv.org/pdf/2501.13958)

**Uncertainty, provenance, elicitation**: [RDF-star fundamentals](https://www.ontotext.com/knowledgehub/fundamentals/what-is-rdf-star/) · [RDF-star provenance patterns](https://www.w3.org/community/rdf-dev/2022/01/26/provenance-in-rdf-star/) · [Provenance with RDF-star (metaphacts)](https://blog.metaphacts.com/citation-needed-provenance-with-rdf-star) · [Structured-uncertainty clarification / EVPI (SAGE-Agent)](https://arxiv.org/html/2511.08798v1) · [Active learning for preference elicitation](https://dl.acm.org/doi/10.1145/3412841.3442013) · [Usage-related elicitation questions](https://arxiv.org/pdf/2111.13463) · [Preference elicitation strategy for CRS](https://www.researchgate.net/publication/331662608_Preference_Elicitation_Strategy_for_Conversational_Recommender_System)

**Neuro-symbolic travel planning**: [TravelPlanner benchmark](https://osu-nlp-group.github.io/TravelPlanner/) · [TravelPlanner analysis](https://www.emergentmind.com/topics/travelplanner-benchmark) · [ChinaTravel](https://arxiv.org/html/2412.13682v1) · [SLTP symbolic travel-planning agent](https://doi.org/10.3390/electronics15020422) · [TripScore](https://arxiv.org/html/2510.09011)
