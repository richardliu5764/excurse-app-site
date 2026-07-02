# Excurse Overhaul — AI Systems Architect Position Paper

**Seat:** AI Systems Architect (intelligence: interview engine, traveler/trip graph, research agenda, composer, feedback loop)
**Date:** 2026-07-02
**Inputs:** all nine rapporteur reports; the CEO and Chief Architect council papers; direct reading of the app-anatomy interview/schema reconstruction.

---

## 0. Verdict

The intelligence layer of Excurse today is a stage set with perfect props and no machinery behind the wall. The interview v2 is the best-designed elicitation UI I have seen in this category — movements, story questions, an evidence ledger with hunch/pattern/confirmed states, safety weighting, `destination` paths into a proto traveler model, least-evidence-first ordering, and a playback that promises "I never plan from a guess." And then `pi(c.answers)` computes the frame draft and throws it away; "Hand off to research & compose" flips a boolean; the composer is a human with an AI chat window; nothing verifies the result. The good news is structural: the front end already speaks the epistemic language the back end needs (receipts, single_source "Call ahead" chips, dashed provisional cards, decision forks, the ledger's confidence glyphs). The overhaul is not "add AI" — the owner has been simulating the AI system by hand for fifty deploys. The overhaul is to **turn the owner's manual practice into five inspectable machines sharing one data spine**: an interview engine that runs as *correspondence, not chat*; a traveler/trip graph where every statement knows how it was learned; a research agenda derived mechanically from graph gaps; a composer firewalled to cited facts; and a deterministic verifier whose violations become the guide's own "Loose ends." Every piece is solo-dev-sized. The binding constraint is honesty: one shipped sentence — *"Nothing you said is sent to an outside AI"* — is currently false the moment the pipeline uses any frontier API, and fixing that sentence is as much a part of this architecture as any schema.

---

## 1. First principles: what the intelligence must actually do

Strip the product to its irreducible loop:

1. **Understand named people** well enough to compose for them — from a few quiet questions and their own stories, with hard constraints never guessed.
2. **Know what it doesn't know**, and decide rationally whether to *ask the traveler*, *research the world*, or *assume and hedge*.
3. **Research the world against those people** — not "top 10 Durham," but "GF-safe biscuits within a 10-minute stroller walk of the lodging, open Sunday 8am, verified with a citation."
4. **Compose a guide that is both true and beautiful** — grounded facts with last-verified stamps, in a voice no LLM produces by default.
5. **Prove it** — deterministically check every hard constraint against the schedule, because the literature (TravelPlanner: 0.6–4.4% constraint satisfaction for pure LLM agents vs 28–97% neuro-symbolic) says trust cannot be prompted, only checked.
6. **Keep learning** — inbox saves, mid-trip reality, and post-trip reflection update the model of the people, so the second trip starts warm.

Everything below is these six duties as software. The design constraint that shapes all of it: **the traveler's device runs no LLM and holds no API key.** Intelligence lives composer-side, behind the sealed transport the Chief Architect specifies (A7). The traveler-side interview is an *instrument*; the thinking happens at the desk. This is not a limitation to route around — it is the product's privacy posture made architectural.

---

## 2. One spine, five organs

```
                        ┌──────────────────────────────────────────────┐
                        │  EPISODES (canonical, append-only)            │
                        │  interview turns · letters · inbox drops ·    │
                        │  observations · composer notes                │
                        └──────────────┬───────────────────────────────┘
                                       │ extract (LLM, ontology-guided)
                                       ▼
   ┌────────────┐        ┌──────────────────────────────┐       ┌─────────────────┐
   │ TravelerPKG│◀─distill─│  TRIP GRAPH (ETG)            │──gaps─▶│ QUESTION QUEUE  │──▶ follow-up letter
   │ (durable,  │─import──▶│  nodes.jsonl                 │       └─────────────────┘
   │ encrypted) │        │  statements.jsonl             │──gaps─▶┌─────────────────┐
   └────────────┘        │  (provenance·confidence·      │        │ RESEARCH AGENDA │──▶ workers fill
                        │   bi-temporal)                │◀─claims─│ (per-stop forms)│    fixed forms
                        └──────────────┬───────────────┘        └─────────────────┘
                                       │ scoped subgraph serialization
                                       ▼
                        ┌──────────────────────────────┐
                        │ COMPOSER (thesis→themes→      │◀── editorial bible +
                        │ skeleton→prose, cite-or-cut)  │    calibration corpus
                        └──────────────┬───────────────┘
                                       │ draft
                                       ▼
                        ┌──────────────────────────────┐
                        │ VERIFIER (7 deterministic     │──violates──▶ re-plan / research /
                        │ checkers) + 3 editorial gates │              ask / waive / Loose ends
                        └──────────────┬───────────────┘
                                       ▼
                              pack → encrypt → deploy
                                       ▲
                        T-72h/T-24h volatile refresh loop
```

**The load-bearing rule: episodes are canonical; the graph is a projection.** Every word the traveler says, every inbox paste, every observation is an append-only episode. The graph is *rebuildable from episodes at any time* by re-running extraction. This is event sourcing, and it matters for three concrete reasons: (a) extraction models improve — in a year, re-derive a better graph from the same stories without re-interviewing anyone; (b) extraction bugs become recoverable instead of permanent corruption of the model of a real family; (c) the audit trail from any composed sentence back to the traveler's own words is unbroken. The KG report treats extraction as ingestion; I treat it as a *cache fill*. This is my first amendment to the ETG spec.

**Second amendment:** `question` and `researchTask` come *out* of the graph's node inventory. They are workflow, not knowledge — they have lifecycles (pending/asked/answered/declined), owners, and deadlines, and mixing them into `nodes.jsonl` pollutes the model of the world with the to-do list of the pipeline. They live in `agenda/questions.jsonl` and `agenda/research.jsonl`, *referencing* graph aspects. Twelve node kinds, not fourteen. Everything else in the ETG spec — the statement shape with six provenances, bi-temporal timestamps, invalidate-never-delete, JSONL-in-repo, Zod as the single contract — I adopt wholesale. It is correct.

---

## 3. The substrate, made concrete

### 3.1 Statement shape (adopted from the KG report, with one addition)

```ts
type Statement = {
  id: string;                      // st_<ulid>
  from: NodeId; rel: Rel; to: NodeId | Literal;
  provenance: 'stated'|'implied'|'inferred'|'assumed'|'researched'|'observed';
  confidence: number;              // 0..1
  source: SourceRef[];             // episode ids / URLs — NEVER empty
  quote?: string;                  // ← my addition: for stated/implied, the verbatim
                                   //   traveler words. Composition echoes people back
                                   //   to themselves; this field is where voice lives.
  assertedAt: string; invalidatedAt?: string;
  validFrom?: string; validTo?: string;
  supersededBy?: StatementId;
  note?: string;                   // one editorial line
};
```

The `quote` field is not decoration. The anatomy report found the product's strongest moments are when the planner proves it listened ("So I never sell you something you already have at home"). The composer prompt gets `quote` fields verbatim; "why_this_for_you" lines that paraphrase the traveler's own story are the single cheapest way to make a guide feel composed rather than generated.

### 3.2 Node kinds (12)

`traveler, party, trip, day, slot, place, booking, constraint, taste, rhythm, tension, theme` — plus `source` (episodes). Note **`tension`** replaces nothing; it is my second addition, imported from the interview-science report's MI finding: ambivalence (rest ↔ adventure, together ↔ alone) is *data to honor, not resolve*. A tension node links two tastes/rhythms with a `holdsTension` statement; the composer's contract (§6) requires every tension to be visibly honored somewhere in the plan ("structured mornings, unscripted evenings"), and the verifier's coverage check counts unserved tensions the same as unserved tastes.

### 3.3 Two graphs, one schema — with a hard wall

- **Traveler PKG** (`travelers/<household>/`): durable people-facts. Age-encrypted at rest (the architect is right against the KG report here; medical facts about named children get encryption regardless of repo visibility). Trips import *frozen snapshots* of only the edges they need.
- **Trip graph** (`trips/<id>/graph/`): everything trip-scoped. Lives in the private monorepo, diffable, reviewed via `git diff`.
- **Nothing from either graph ever ships.** The deployed bundle carries only compiled guide JSON — and constraint *consequences*, never constraint *labels* ("the corn tortillas are safe," never "GF options for Maya"). The existing manifest-privacy allow-list guard is the right pattern; it gets a sibling: a pack-time lint that greps the compiled bundle for any constraint-node label, traveler medical vocabulary, or PKG identifier and fails the build on a hit.

---

## 4. The interview engine

### 4.1 The correspondence model — my central design decision

Every AI-planner competitor built a chat. Excurse should refuse to. Three forces converge:

1. **Privacy architecture**: no client-side LLM key; a live generative interviewer requires round-tripping every keystroke through a server-side model, destroying both the offline property and the calm.
2. **Interview science**: the adaptive value of an LLM interviewer is concentrated in *which* follow-up to ask, not in real-time banter; LLMs under-ask unprompted, so the ask decision must be a policy gate anyway — which does not need to run in the moment.
3. **The product's soul**: Excurse's voice is a considered letter, not a typing indicator. Black Tomato's elicitation continues *through drafts*; Virtuoso's re-anchor happens in a follow-up call. The masters iterate asynchronously.

So: **the interview is correspondence.** Three rounds, each cheap for the traveler:

- **Round 1 — the instrument** (in-shell, fully local, offline-capable, no LLM): the existing four-movement UI, driven by a question *bank* and a deterministic local policy (§4.2). 7–9 turns, under 5 minutes. Ends with the MI-style summary and the sealed handoff (architect's A7 transport). This preserves everything good about interview v2 and honors the completion-rate cliff.
- **Round 2 — the planner's letter** (composer-side, big model, at most once): full-transcript extraction runs at the desk; the EVPI policy (§4.4) finds the gaps that survive; if — and only if — any question clears the ask threshold, the pipeline drafts a short letter in the planner's voice ("I read your story about the counter in Osaka. Two things before I start placing days…"), containing **at most 3 questions**, delivered through the same channel back into the shell, answered with the same instrument UI. Most trips should need zero or one letter; the letter is the exception path, not the flow.
- **Round 3 — the draft margin**: the first composed draft ships with 2–4 explicit `decision_point` blocks and disclosed leans ("I leaned quiet over famous — say the word and I'll flip it"). Reactions to the draft are elicitation. This is Black Tomato's draft-iteration loop expressed in the product's existing species vocabulary — the `decision_point` block type was always secretly an elicitation instrument.

This resolves the tension the interview-science report leaves open (LLM adaptivity vs question budget vs privacy) without a chat UI, a streaming backend, or a broken promise.

### 4.2 Round 1: the instrument, specified

**State machine** (per session; all local, all deterministic):

```
FRAME ─▶ STORY ─▶ STORY_FOLLOWUP(≤1, template-selected) ─▶ OCCASION ─▶ PEAK
  ─▶ RHYTHM_LEANS(≤2) ─▶ TIEBREAK(pair, ≤2, gated) ─▶ CONSTRAINTS(never skippable)
  ─▶ SUMMARY(read-back; safety verbatim) ─▶ SEAL(handoff) 
Exit rails: skip on any optional · engagement decay (2 consecutive minimal answers
→ jump to CONSTRAINTS → SUMMARY) · budget cap at 9 turns hard.
```

**The question bank** merges the shipped 12 with the interview-science 11 into ~20 bank entries, each carrying: `kind` (chips/scale/pair/story), `aspects[]` (which coverage aspects it feeds), `tier` (Oil/Tar — keep the vocabulary, it's charming and it works), `safety`, `impact_class` (see §4.4), `phrasings[]` (voice-approved variants), `audience` (primary/invitee/child). The interview-science report's inventory is adopted **as a bank, not a script** — the architect's disagreement #5 is correct and I second it formally: shipping 11 fixed questions would repeat the current mistake with better furniture.

Changes to the shipped bank, specifically:

- **Story moves to first position** (currently buried in movement 2 as optional). The episodic anchor is the highest-density signal we have (Stanford: interview transcript ≈ 85% of self test-retest); it must not be skippable-by-default. Placeholder text stays ("a tiny counter where the owner kept bringing us things we didn't order" — that string is doing elicitation work).
- **Add the missing high-EVPI facts** the editorial report found by working backwards from research agendas: *the fixed anchor* ("Anything already booked or promised?"), *breakfast behavior*, *walking radius in minutes not enthusiasm* ("when a day runs long, what gives out first — feet, patience, or blood sugar?"), and **budget posture** — the ledger has themed "Money" for two shipped versions with no question behind it; one pair-kind lean ("Spend on the room, or spend on the table?") plus an optional ceiling closes the fossil.
- **Add the peak question** ("When it's over, what's the one moment you want to tell someone about?") — peak–end engineering needs a target.
- **Local sequencing** stays least-evidence-first within movements (the shipped `di()` heuristic is a legitimate poor-man's information-gain policy and runs offline); the bank's `impact_class` adds a tier so safety and anchor questions always surface before taste refinement.

**Invitees** get the 4-turn variant: short episodic anchor, one rhythm lean, one veto ("anything that would ruin a day for you?"), constraints. Delivered via their own invite link; organizer proxy answers are marked `provenance: stated, source: proxy_<organizer>` at confidence ≤0.5 and generate letter-round questions to the actual person when consequential. Children: 2 playful questions or proxy, per the group protocol.

### 4.3 Extraction: two passes, two models

**Pass A — turn-time tagging (in the instrument, no LLM).** Chips/scales/pairs are already structured; they write statements directly via the bank's `aspects[]` mapping with `provenance: stated, confidence: 0.95`. Story answers are stored raw as episodes; the instrument does *no* NLP. (The shipped code got this division right by accident.)

**Pass B — desk-time extraction (composer-side, frontier model, at handoff and per letter/inbox batch).** One structured-output call per episode batch, ontology-guided, whole-transcript context. The extractor prompt, in full:

```
SYSTEM
You extract knowledge-graph statements about travelers from interview
transcripts, for a private trip-planning system. You are given:
(1) the statement JSON schema and the 12 node kinds with their fields;
(2) the current active statements (compact serialization);
(3) new episodes (verbatim, with ids).

Emit a JSON object {new: Statement[], invalidate: {id, reason}[]}.

Rules — these are hard:
- provenance discipline: 'stated' only for facts the person said in so many
  words (include the verbatim in `quote`); 'implied' for clear entailments
  (quote the entailing text); 'inferred' for your reads of the story —
  confidence ≤ 0.7, always with a `note` explaining the read.
- NEVER emit 'stated' for anything paraphrased. NEVER emit constraint
  statements (allergy/mobility/medical/child) at any provenance other than
  'stated' — if a story implies a constraint, emit an 'inferred' taste/rhythm
  AND flag it in `note` as "constraint-suspect: verify by asking".
- Ladder silently: when a story praises an attribute, also emit the value
  behind it as a separate 'inferred' statement (attribute → consequence →
  value), each with its own confidence. Store the whole ladder.
- Tensions: when the person wants two things that trade off, emit a tension
  node + holdsTension statements. Do not resolve tensions.
- source: every statement cites episode ids. A statement you cannot cite
  does not exist.
- Contradictions: if a new episode contradicts an active statement, add it
  to `invalidate` with the episode id as reason; then emit the replacement.
- Do not invent node kinds or relations. Unmappable material goes into a
  single 'composer-note' statement, verbatim, for the human.
```

Entity resolution after extraction is deterministic first (same kind + normalized name, same external ID), LLM adjudication only for ambiguous merges, and every merge is a diff the owner reviews. Extraction precision gets spot-audited (§10); the provenance discipline is enforced by a validator that rejects `stated` statements without quotes and constraint statements without `stated` provenance — the schema is the guard, not the prompt.

### 4.4 The next-question policy, made computable

The KG report's `score(q) = impact × uncertainty × answerability − askCost` is right but hides the hard part: **impact requires a plan, and at interview time there is no plan.** My resolution, in two stages:

**v1 (ship for Durham): static impact classes.** Every coverage aspect carries a hand-assigned `impact_class` derived from which plan surface it touches:

| impact_class | touches | examples | floor/ceiling |
|---|---|---|---|
| SAFETY (∞) | every relevant slot, non-negotiable | allergy, mobility, child | always asked, never inferred, read back verbatim |
| SKELETON (8) | the shape of every day | dates, lodging, fixed anchors, chronotype, pace, rest windows, budget posture | ask if unknown |
| SELECTION (4) | which venues fill slots | tastes, food adventurousness, novelty lean, vetoes | ask if unknown AND tie-breaking |
| TEXTURE (2) | prose and emphasis | values ladder, home baseline, peak type | infer; confirm by reflection only |
| TRIVIA (0) | nothing downstream | — | never ask |

`score(q) = maxImpact(q.aspects) × (1 − bestConfidence(aspect)) × answerability − askCost(turnIndex)`, with `askCost` rising per turn and jumping when the aspect is researchable instead (never ask what the web knows). This is fully deterministic, runs in the local instrument for Round 1 ordering *and* at the desk for the letter round, and is inspectable — the owner can read exactly why a question was or wasn't asked.

**v2 (post-Durham): slate divergence.** Once `compose --skeleton` is cheap (<$0.10, ~20s), upgrade impact to the INTENT-SIM move: sample K=3 plausible traveler frames from the current graph (filling unknowns from archetype priors), generate a day-skeleton for each, and define `impact(q) =` expected structural diff between skeletons across the plausible answers to q (anchors moved + slots changed). If every plausible answer yields the same skeleton, the question is decoration — don't ask. This is the *plan-delta test* made literal, and it doubles as the **stopping rule**: the letter round ends (or never starts) when no candidate question's plausible answers diverge the skeleton. "A few quiet questions" stops being copy and becomes a theorem about the scorer.

**Stopping rule (all rounds):** stop when (a) no question clears threshold (stability), or (b) budget hit (9/4/3 turns for primary/invitee/letter), or (c) engagement decay — two consecutive minimal answers → summarize and stop, the MI move. **Constraints override stopping in Round 1 only**: the instrument may not seal without the L1 sweep answered or explicitly declined (declines are statements too, and the composer designs around them with disclosed hedges).

### 4.5 Ask / infer / assume — the policy table (normative)

| | mechanism | provenance | surfaced to traveler? |
|---|---|---|---|
| **Ask** | safety always; SKELETON when unknown; SELECTION when tie-breaking; anything the guide would state as fact about *them* | `stated` | in ledger, confirmed at summary |
| **Infer** | values, tensions, tempo, taste texture, group dynamics — from stories, silently laddered | `inferred` ≤0.7 | **yes — inspectable and editable in "You"** (ethical requirement, and corrections are free training data) |
| **Assume** | archetype defaults (family-with-toddler → early dinners, one anchor/day) seeded at trip creation | `assumed` ≤0.5 | only as visible hedges in the guide ("both routes below") |
| **Research** | anything about the world | `researched` | as receipts / verified stamps |

The composer's contract enforces the last mile: it may commit (plain assertion, single pick) only on `stated`/`researched`-backed choices; `inferred` gets confirmed-by-reflection or committed-with-disclosure; `assumed` always hedges (fallback attached, or decision_point offered). This maps one-to-one onto UI the shell already ships — solid vs dashed borders, single_source chips, "your call" forks. **The front end's epistemic vocabulary becomes the back end's output contract.** That is the deepest structural luck in this codebase and the overhaul must treat it as load-bearing.

### 4.6 Group protocol (adopted from interview-science, with one addition)

Separate interviews per adult via per-person invite links; least-misery veto on constraints; average-without-misery on shared meals; fairness rotation with visible attribution on day themes ("Thursday afternoon is Maya's"). My addition: **attribution is a statement** (`day → dedicatedTo → traveler`, provenance `inferred`, from the fairness allocator), so the verifier can check that every traveler with any elicited desire owns at least one attributed moment across the trip — fairness as a checkable property, not a vibe.

---

## 5. The research agenda generator

Purely mechanical derivation — no LLM decides *what* to research; LLMs only *execute* research tasks. Generator rules, run after every graph mutation:

```
R1  ∀ place candidate × ∀ hard constraint of any attending traveler:
    → verify-task(constraint predicate, requires: T1 primary source)
      (serious allergy ⇒ may spawn a phone-call task for the owner)
R2  ∀ slot with a date/time window: → verify-task(opening hours FOR THAT DATE,
    incl. holiday/closure calendars; T1 only)
R3  ∀ consecutive slot pair: → routing-task(travel time, parking, the walk)
    → LEAVE BY computed, stored as a researched statement with inputs cited
R4  ∀ taste/tension with < 2 serving candidate places: → discovery-task
    ("tsukemen near Little Tokyo, quiet room, GF fallback within 200m")
R5  ∀ assumed statement the skeleton leans on: → hedge-task (research the
    fallback) OR promote to question (if it cleared the ask threshold)
R6  ∀ claim past validTo or inside its volatility window at T-72h/T-24h:
    → refresh-task
R7  ∀ major stop: → voice-task (one named human quote, T2 source) and
    two-things-task (Blue Guides depth) — the editorial report's soul budget,
    generated not hoped for
```

Tasks are rows in `agenda/research.jsonl`: `{id, rule, targets, form, status, resultClaimIds}`. Each task's `form` is the editorial report's fixed per-stop-type agenda (restaurant/museum/hike/shop/transition) — workers **fill the form or mark fields UNFOUND; inventing a field value is a validator error, not a style problem.** Results land as atomic claims in `ledger/claims.jsonl` with `sources[], tier, confidence, volatility, last_checked` — and simultaneously as `researched` statements on the graph, so the verifier sees one world. The **T0 rule is absolute**: model memory generates hypotheses and search queries only; a ledger field citing no retrieved source fails validation. This one mechanical rule deletes the documented hallucinated-landmark failure class, and it is enforceable in 20 lines of code.

Worker implementation: a research worker is one agentic LLM call with web-search tools, the form as its output schema, and the tier policy in its system prompt; 30–80 tasks per trip, parallelizable, resumable (tasks are idempotent over the trip directory). No framework — a for-loop with checkpointed calls, per the architect's no-orchestration rule.

---

## 6. The composer

Four passes, each a pure function of the trip directory, each committing its outputs:

**Pass 1 — Thesis.** One sentence per trip and per day, generated from the frame + tensions + occasion, **approved by the owner before research spend** (the cheapest possible point to catch a misread of real people). The thesis is Zinsser's central idea and becomes the day-map caption.

**Pass 2 — Themes + skeleton.** Cluster tastes × candidate places × geography into proposed theme nodes (the GraphRAG community-summary move, one LLM call at this scale); allocate anchors into slots respecting rhythms (protected rest windows), bookings, geography, and the fairness rotation; **rotate tastes across days, never average** (PinnerSage's lesson — a person is several coherent clusters; the shipped palette-named days were always this, done by hand). The skeleton is data, verifiable before any prose exists — run the verifier here first, cheaply, before spending on writing.

**Pass 3 — Prose, per day, firewalled.** For each day, serialize the scoped subgraph into the prompt: the day's slots and places; attending travelers' constraints-as-consequences, tastes, rhythms, tensions **with their `quote` fields**; ledger claims for every place (with tier and last_checked); the thesis; the editorial bible; 4–6 calibration-corpus exemplars as few-shots. The contract inside the prompt:

```
- Every factual sentence cites ledger claim ids in the sidecar. A sentence
  whose claims do not resolve will be cut by the gate, not fixed.
- You may only state as plain fact claims of tier ≤ 2 and fresh. Tier 3 or
  stale ⇒ pattern voice ("expect a wait after noon"). Conflicting ⇒ omit.
- Commit/hedge per the epistemic contract: stated/researched ⇒ commit;
  inferred ⇒ commit-with-disclosure; assumed ⇒ hedge with fallback.
- why_this_for_you: ≤35 words, one non-obvious checkable fact, one sensory
  or temporal particular, one actionable judgment, and where a quote field
  fits, echo the traveler's own words back. Zero banlist hits.
- Transitions are content: the walk, the parking, the view en route, each
  with a researched particular.
- One interlude and at most one named human quote per day, from T2 claims.
- Every tension node must be visibly honored somewhere in this day or
  explicitly deferred to another day (say which, in the sidecar).
```

Output: authoring-schema JSON (the recovered `We()` schema, now formalized in `packages/schema`, doubling as the structured-output constraint — the same Zod file that validates the pipeline constrains the model). Sentence→claim sidecars ship in the trip directory, not the bundle; a compact map survives into the bundle so the refresh pass knows which sentences a changed fact touches.

**Pass 4 — Stamps.** `verified: {status, checked_on}` per block derives from the worst-tier, oldest-checked claim the block's prose leans on — the existing receipts UI renders it with zero shell changes. "Verified as of" is the anti-hallucination differentiator made visible, in voice, per the editorial report's whisper ("checked Tue"), never a dashboard.

**Model separation:** composer and rubric judge are different model lineages (self-preference bias); the slop lint is deterministic and free. Two failed judge cycles on any unit → escalate to the owner with the judge's justification as the edit note. The owner's edits are captured as (before, after) pairs feeding the calibration corpus — the taste flywheel is the moat compounding.

---

## 7. The verifier (where trust actually lives)

The seven checkers from the KG report, adopted as specified — open-hours-for-date, diet (fresh researched backing or flagged fallback), walking/energy budget vs constraints and rhythms, LEAVE-BY feasibility from routed times, child meal cadence, booking coherence, freshness — each ~20–50 lines of TypeScript over graph + ledger + skeleton. Plus two from this seat:

8. **Tension/fairness coverage**: every tension honored, every attributed day present, every elicited taste served ≥1 time or explicitly deferred in the composer sidecar.
9. **Constraint-label leak scan** on the packed bundle (§3.3) — privacy as a checker, not a hope.

Verifier output writes `satisfies`/`violates` statements (provenance `inferred`, source = checker id). Open violations + unexpired cancellation windows **generate "Loose ends"** — the shipped feature becomes the verifier's public face, and "Every loose end is tied. Enjoy the quiet." becomes a sentence the system can only say when it is provably true. That is the whole product philosophy in one wiring decision. The seeded-violation test suite (20 deliberately broken plans, 100% catch required) is release-blocking per the architect's test plan; I add: **the allergen sweep runs adversarially** ("find a way this day poisons this traveler") as a distinct LLM red-team pass whose findings must be either refuted by a checker or fixed — belt and suspenders on the one failure that ends the product.

---

## 8. The feedback loop

- **Inbox**: pastes travel the sealed transport as episodes; the same extractor emits `observed` taste statements *and* candidate slots (`foldedFrom`); folding a save re-runs research rules + verifier on the affected day before the silent redeploy. The inbox stops being a mailto and becomes the continuous implicit-elicitation channel the interview-science report identifies — every TikTok save is a preference edge with a source pointer.
- **Mid-trip observations**: skips, "meltdown at 2pm," a visited-mark pattern — lightweight in-shell events queue as episodes (same consent posture as handoff: nothing leaves without the sealed channel). Observations bi-temporally invalidate assumptions; they never silently rewrite `stated` facts.
- **The afterglow interview**: the CSS mode that never shipped gets its purpose — three questions, post-trip, in the same instrument ("What was the actual best hour?" / "What would you cut?" / "What do you want more of next time?"). Peak–end research says the ending is disproportionately the memory; the afterglow interview is both a gift (closure, in voice) and the highest-quality PKG signal available.
- **Distill**: `excursed distill` proposes trip-graph → PKG promotions; **owner approves every edge** — long-term memory about real people is written by hand or not at all. Second-trip interviews open with warm reflections ("Last time, mornings were yours. Still true?") — durable statements decay in confidence over time (recency decay per the Pinterest lesson) so the system re-confirms rather than fossilizes.

---

## 9. Models, money, and the honesty problem

**Stage → model policy** (lineages deliberately split):

| stage | class | notes |
|---|---|---|
| extraction, letter drafting | frontier, structured output | whole-transcript context; checkpointed |
| research workers | frontier + web search tools | form-constrained; T0 rule in validator |
| skeleton/themes | frontier, cheap mode | must be cheap enough for v2 slate divergence |
| prose composition | frontier, the *best available writer* | few-shot on calibration corpus |
| rubric judge | **different lineage** than composer | anchored CoT; pairwise for voice |
| slop lint, verifier, ER, scorer | no LLM | deterministic, free, fast |

Estimated marginal cost per composed trip at 2026 API pricing: extraction ~$1, research 30–80 agentic tasks ~$10–30, compose+judge loops ~$5–15, refresh passes ~$2 — **$20–50/trip**, noise against the landscape report's $150–600 service price and a rounding error against the owner's time saved. LLM calls are checkpointed (prompt+response committed) so every run is auditable, replayable, and *is* the eval corpus.

**The honesty problem, stated plainly.** The shell ships: *"Nothing you said is sent to an outside AI."* The moment the desk pipeline calls any frontier API over interview episodes, that sentence is false. Options: (a) local models at the desk — today they cannot meet the editorial bar this product exists for; (b) keep the sentence and lie — disqualifying; (c) **rewrite the promise to the true and still-differentiated one**: *"Your words travel sealed, only to your planner. Research and composing happen at the planner's desk, under the planner's keys, and are never used to train anything."* — backed operationally by zero-retention API agreements, no traveler identifiers in prompts where avoidable (party members can be pseudonymized in research tasks; prose composition needs first names only), and THREATMODEL.md naming the model providers as a disclosed trust boundary. I recommend (c) without hedging, plus a standing eval of (a) yearly — the day a local model passes the calibration-corpus judge, the sentence can be restored to its original strength, and that is a genuinely defensible long-term differentiator.

---

## 10. Evals (the pipeline's own interview)

1. **Extraction**: 5 recorded transcripts (start with LA's real one, consented) with hand-labeled gold statements → precision/recall per provenance class; regression on every prompt/model change. Provenance discipline errors (paraphrase marked `stated`) are P0.
2. **Question policy**: replay transcripts turn-by-turn; assert safety-first ordering, budget adherence, and (v2) that plan-delta-negative questions are never asked. The scorer is deterministic — this is a unit test, not an eval.
3. **Verifier**: the 20 seeded-violation plans, 100% catch, release-blocking.
4. **Composer**: calibration corpus as anchors — exemplars must pass the gates, rejects must fail; slop-score per 1,000 words as the canary time series; golden-trip diffs to catch model drift.
5. **End-to-end "trip zero"**: every release composes, verifies, packs, deploys-to-preview, and offline-opens one synthetic trip. Durham is trip one.

---

## 11. Where I disagree with the briefing

1. **The KG report's graph is slightly too big and slightly too authoritative.** `question`/`researchTask` leave the node inventory (workflow ≠ knowledge), and the graph is demoted from source-of-truth to *rebuildable projection over canonical episodes*. Event-sourcing the traveler model is the single cheapest insurance policy in this architecture.
2. **The interview-science report's 7–9-turn budget is right but its inventory placement is wrong on one point**: the episodic story must be first and effectively mandatory, not optional-in-movement-2 as shipped, and not one-of-eleven. Every downstream organ eats from that story.
3. **Against live chat, explicitly.** Both research reports implicitly assume an adaptive LLM interviewer in the loop. The correspondence model (instrument → one letter → draft margins) delivers ~all of the adaptive value at zero client-side privacy cost and is more Excurse than any chat could be. This is the seat's core novel commitment.
4. **EVPI-lite as specified is not computable at interview time** (impact needs a plan that doesn't exist yet). Static impact classes for v1, slate-divergence for v2 — concrete both times, and the stopping rule falls out.
5. **The architect's Phase 3 ordering buries the highest-leverage week.** Transport first, agreed — but extraction + the letter round can run against *hand-built* graphs and the existing question bank in July, before ETG tooling is polished. The correspondence loop should carry a real exchange with a Durham traveler by early August; a pipeline that has never touched a live human before mid-September will spend October discovering its interview is subtly wrong. Sequence intelligence stages by *contact with reality*, not by dependency purity.
6. **"Different model for the judge" needs teeth**: not a different prompt — a different provider lineage, stated in config, tested by the self-preference canary (judge must not systematically prefer composer-lineage outputs on the calibration rejects).
7. **The budget fossil is an interview bug, not a schema stub.** Two shipped versions themed "Money" with no question behind it means composition has been silently assuming budget posture for real trips. It enters the bank as a SKELETON-class pair question now, not in some future taste expansion.

---

## 12. Sequence (against the October 16 Durham deadline)

- **July — the loop closes.** Sealed transport (architect A7); episode store; extractor v1 + provenance validator; frame-draft actually transmitted; letter round runs manually (owner sends the letter the scorer drafts). *A real Durham traveler completes Round 1 and receives a letter by early August.*
- **August — the graph and the agenda.** ETG store + Zod schemas; question bank + static-impact scorer replacing the flat script; research rule generator + worker + ledger + T0 validator; Traveler PKG seeded (encrypted) from LA + Durham interviews.
- **September — compose and verify.** Skeleton pass + verifier (checkers 1–9, seeded-violation suite); editorial bible + calibration corpus authored (owner's highest-ROI writing); prose pass + three gates; Durham composed exclusively through the pipeline, owner's manual path retired only when the pipeline beats it on the verifier scorecard and his own read.
- **October 1–16 — reality hardening.** T-72h/T-24h refresh; inbox-as-episodes live; afterglow interview built (LA family are its first users — a gift and a test); slate-divergence scorer if and only if everything above is boring.

---

## 13. What must survive, from this seat

- The **epistemic UI vocabulary** (receipts, confidence glyphs, dashed provisionality, "in your pocket," "your call," "Call ahead") — it is the pre-built rendering layer for statement provenance; the overhaul's job is to make it *true*.
- The **ledger with hunch/pattern/confirmed + safety ×3 + provenance strings**, and least-evidence-first ordering — interview v2's bones are the v3 policy's bones.
- The **`destination` paths** (frame/person/taste_fingerprint/disposition) — the proto-ontology grows into ETG rather than being replaced.
- The **story-first philosophy and every load-bearing copy string** ("I never plan from a guess," "Either is fine. I just want your lean," the placeholder about the tiny counter) — these are the voice charter's calibration set.
- The **species vocabulary** (anchor/decision_point/backup/freeform) — plans that admit uncertainty; decision_points double as the draft-margin elicitation channel.
- The **`«` redaction sentinel** and the derived wallet — composer output can degrade gracefully and stay single-source-of-truth.
- **Zero client-side LLM, zero telemetry, sealed transport only** — the trust substrate that makes it ethical to ask about a child's allergies at all.

---

*— AI Systems Architect seat, Excurse overhaul council*
