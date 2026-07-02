# Excurse Overhaul Council — Travel Editorial Director Position Paper

**Seat:** Travel Editorial Director (content bar, fact-grounding & freshness policy, anti-slop enforcement, editor-agent rubric, human-in-the-loop editorial governance)
**Date:** 2026-07-02
**Inputs:** all nine rapporteur reports, with deep reads of 09 (editorial craft), 01 (app anatomy / authoring schema), 05 (interview science); the CEO and AI Systems Architect council papers; the shipped product strings.

---

## 0. Verdict

The bar already exists — it is just not written down, and nothing enforces it. The shipped LA guide and the product's own strings ("Every loose end is tied. Enjoy the quiet." / "Either is fine. I just want your lean." / "e.g. a tiny counter where the owner kept bringing us things we didn't order") prove Richard can write at Wildsam grade and has already invented the correct editorial physics: density restraint, epistemic honesty rendered as UI, constraints surfaced as service, days with theses instead of tables. But today the editorial system *is Richard* — the voice lives in his head, the facts live in his chat sessions, and the shell ships the sentence "Verified — findings checked against locals" while no verification of any kind exists in the pipeline. That is the one sin an editorial trust product cannot carry: **the product performs an editorial standard it does not practice.** The overhaul, from this seat, is to extract the standard he has been practicing by hand into three enforceable artifacts — a calibration corpus harvested from the guides he already wrote, an Editorial Bible with per-format specs, and a three-gate editor that no composed word bypasses — so that "composed, verified, in voice" becomes a property of the machine rather than a property of Richard's attention at 4 AM. He stays in the loop at exactly two gates (the flat plan, the final read); everywhere else he must get out of the way, because every sentence he hand-polishes after compose is a sentence the system failed to write, and the failure must be fed back as training data, not silently absorbed.

---

## 1. What "beats Wildsam-quality print" actually means

Wildsam's excellence is voice + human texture + object-quality. Its structural weaknesses are the openings Excurse is built to exploit, and they define the bar:

| Axis | Wildsam / best print | The Excurse bar |
|---|---|---|
| Voice & selection | Superb, human | **Equal** — non-negotiable, gate-enforced (§5) |
| Knows the reader | Nobody | Every "why this" sentence can carry a personal hook from the traveler graph, without ever naming the constraint |
| Practical authority | Thin to none (Wildsam has almost no logistics) | Baedeker-grade: hours, tickets, parking, bathrooms, LEAVE BY — total offline self-sufficiency |
| Freshness | Frozen at print | Per-fact volatility classes, re-verified at T-72h/T-24h, silently redeployed |
| Choreography | Lists, not days | 36-Hours-grade time-of-day narrative where transitions are content |
| Honesty | Implicit | Explicit: per-fact provenance, "checked Tuesday" whispers, hedges only where uncertainty is irreducible |

The one-line bar, which every gate below operationalizes: **every entry must contain something a great print guide could not have known (about you, or about this week), and nothing a great print guide would have cut.**

A definitional correction to the briefing before the specs: the editorial-craft report treats the LA "17-stop Little Tokyo pocket guide" as "the ceiling of acceptable density." I think that framing conflates two formats that need separate specs. A **day plan** is committed choreography — 3–7 stops, clock-anchored, one pick per need, transitions written. A **pocket guide** (the `guides`/after_block species) is a browsable menu for an unscripted wander — 12–20 micro-entries is *correct* there, because the reader is choosing, not being choreographed. The bar and the word budgets differ by format; a pipeline with one spec will either bloat the days or starve the wanders.

---

## 2. The content bar, per unit (normative specs)

These are the specs the composer is prompted with and Gate 1 lints against. Word budgets are not style preferences; they are **usage requirements** — this artifact is read standing on a corner, in sun, tired, one-thumbed. A full day's prose must be consumable in under three minutes.

### 2.1 The trip
- **A title in voice** (never "Los Angeles Trip") and a one-sentence trip thesis a traveler could repeat at dinner.
- **An arc**: the peak moment the interview elicited gets engineered on purpose, and — this seat's hill to die on — **the ending is content**. Peak-end research says the last evening and the departure morning *are* the memory, and guidebooks universally die at the airport. The final evening and the leave-for-the-airport morning get the same editorial investment as the marquee day: a real last dinner pick, the "one more thing on the way" stop, the composed goodbye line. No guide ships whose last block is a bare flight record.
- **The quiet pages held to the same standard**: key_info, lodging card, wallet entries are written in the service register, not pasted from confirmation emails.
- Density: 3–7 committed stops per day + 2–4 trigger-bound fallbacks; at most one pocket guide per neighborhood actually visited.

### 2.2 The day
- **Thesis line** (≤14 words) — the day's central idea; doubles as the day-map caption. The palette-named themes (Golden Hour, Marine Layer, K-Town Neon) are already this done by hand; keep the naming instinct.
- **Shape**: morning/afternoon/evening beats, one anchor everything flexes around, protected rest windows where the graph demands them.
- **Transitions as first-class blocks**: the walk, the parking strategy, the view en route — each with one researched particular and a buffered duration feeding LEAVE BY. Connective tissue is where "composed" lives; it is also where every AI itinerary is silently fake.
- **One interlude** (80–150 words: history fragment, etymology, "what you're looking at") and **at most one named human quote** — the soul budget, hard-capped (§3.4).
- **Total prose budget: ≤650 words** excluding logistics data. Over budget = a curation failure, not an editing task.

### 2.3 The stop
Every stop, regardless of type:
- **The why-sentence, ≤35 words**, with the checkable anatomy: one non-obvious verifiable fact + one sensory or temporal particular + one actionable judgment + (where the graph supports it) the personal hook. It must fail the **entity-swap test**: substitute a rival venue's name and the sentence must become false or absurd. "Charming spot with great coffee" survives the swap; "the roaster's cupping bar opens to the public only Thursdays before ten" does not.
- **One earned fact** — something the average well-read person does not already associate with that category of place (Zinsser's known-attribute rule). No earned fact, no entry.
- **A logistics block, data-shaped, per-field confidence**: hours (with door-close vs kitchen-close), reservation truth, price band, payment quirks, wait pattern, noise/kid/dietary flags keyed to the traveler graph. Rendered as data (Archivo register), never narrated as prose.
- **Body budget**: 40–90 words beyond the why-sentence. Herb Lester proved the miniature; trust it.
- Per-type additions per the editorial report's agendas, adopted: restaurants get what-to-order (two agreeing sources or the chef's own words); museums get "the two things worth standing in front of" with 40 words of context each and dwell time *for this party*; hikes get turnaround rules and leave-by inputs as structured data; shops get hours-confidence as the headline.

### 2.4 The fallback
Written in the same voice, researched to the same standard, and **always bound to a trigger** ("if the line clears 20 minutes," "if the marine layer holds past 11"). An untriggered alternative is hedging; a triggered one is service. The shipped "in your pocket" framing is exactly right — keep the phrase.

### 2.5 The map layer
Labels written in guide voice ("the good bench," "last bathroom before the trail"), never POI-database names; the trek line annotated with narrative waypoints; base map suppressed to near-silence; every day-map captioned with the day thesis. Map labels go through the same lint as prose.

---

## 3. Fact-grounding and freshness policy

I adopt the editorial-craft report's ledger architecture wholesale — atomic claims, `sources[] · tier · confidence · volatility · last_checked`, tiered sources with **T0 = model memory allowed to hypothesize and never to populate a field** — and the AI Architect's enforcement of it as a validator, not a prompt. Nothing to relitigate; that design is correct and it deletes the documented hallucinated-landmark failure class (the fake Peruvian canyon, the Japanese mountain stranding) at the architecture level. This section adds the editorial policy on top: what may *ship*, in what voice, and what must die.

### 3.1 Nothing uncheckable ships — with the sensory carve-out stated precisely
Every factual sentence resolves to ledger claims (cite-or-cut). The tempting loophole is atmosphere: "the room smells of cedar and old paper" is vivid, unverifiable, and exactly what a slop generator invents. Rule: **sensory and atmospheric claims are checkable by sourcing** — a named critic's account, the venue's own materials, a firsthand note from Richard or a traveler. If no source exists, the detail is cut, not kept. A less vivid true guide beats a vivid plausible one every single time; this rule is the whole difference between Excurse and the AI guidebooks on Amazon.

### 3.2 Required tiers by field class
- Hours, closures, tickets, gates, timed entry, **anything touching a serious allergy**: T1 primary only; allergen fields may spawn a phone-call task that lands on Richard's desk. There is no acceptable secondary source for whether the fryer is dedicated.
- What-to-order, editorial judgments, human quotes: T2 (named critics, edited press) or the subject's own words.
- Wait patterns, parking truth, noise: T3 crowd allowed, corroborating only, rendered in pattern voice ("expect a wait after noon"), never as fact.

### 3.3 Freshness: volatility classes + the pre-trip refresh as a product event
Adopt the four volatility classes (stable / slow / medium / volatile) and the T-72h/T-24h re-verify passes riding the existing SW refresh path. Editorial additions:
- **"Verified as of" is per-fact, whispered in voice** ("hours checked Tuesday"), inside the logistics block, never a dashboard or a badge wall. One whisper per block maximum; the receipts UI already knows how to render this.
- Anything volatile still unresolved at T-24h is **rewritten to its fallback or cut** — it does not ship as a hedge.
- The string "Verified — findings checked against locals" is **removed from the product until it is true**, and when restored it must be literally true (a locals-check is a real T2/T3 corroboration pass, or the word "locals" goes). Performing verification you don't do is the fastest way to forfeit the only brand this product has.

### 3.4 The quote rule — the most dangerous task in the pipeline
The Wildsam soul budget (one named human voice per day) is the pipeline's highest-risk editorial task, because LLMs fabricate and mutate quotations at high rates and a fabricated quote from a named living person is a category-worse failure than a wrong opening hour. Hard rules: quotes ship **verbatim, character-for-character**, with URL + retrieval date in the ledger; Gate 2 re-fetches and string-matches every quote; paraphrase is presented as paraphrase ("she has said the recipe hasn't changed since '82") and attributed; if no verifiable human voice exists for a day, **the day ships without one**. One per day is a *cap*, not a quota. Here I explicitly side with the bible's cap over the research report's "one per major stop" — three quotes a day turns soul into wallpaper and triples the fabrication surface.

### 3.5 The hedge budget — authority is the product
A disagreement with the general drift of the briefing: honesty clauses, confidence-conditioned sentence forms, and pattern voice are all correct *per fact*, but applied naively they produce a guide that hedges constantly — and a guide that hedges everything has abdicated the Baedeker seat. Hedging must be **rationed**: at most 2 hedged assertions per day plan, reserved for genuinely irreducible volatility (weather, waits, "hours here wander"). Everything else resolves the other way — **verify harder, or cut the stop**. Low confidence is a research to-do, not a prose register. The verifier should count hedges per day exactly as it counts allergen violations.

---

## 4. Anti-slop enforcement

The dual banlist (travel clichés + AI tells) from the editorial report is adopted as Gate 1's hard fail — *nestled, bustling, hidden gem, vibrant, boasts, eatery, must-see, iconic; delve, "isn't just X — it's Y," rule-of-three benefit lists, symmetric hedging, "it's worth noting."* But an editorial director has to say plainly: **banlists rot.** Models route around word lists while preserving the underlying vacuity; a banlist is a canary, not a fortress. The load-bearing anti-slop mechanisms are structural and cannot be routed around:

1. **The entity-swap test (mechanizable).** For every why-sentence, substitute the name of a same-category rival venue; an LLM check asks "is this sentence still plausibly true?" If yes → non-substitutable fail → regenerate. This is Zinsser's known-attribute rule as an executable test, and it is the single most important quality check in the pipeline.
2. **Specificity density floor**: ≥1 proper noun or number (beyond the venue's name) and ≥1 sensory/temporal particular per 50 words — all of them resolving to ledger claims, so specificity can't be faked with invented particulars.
3. **Superlative scoping**: no superlative without a scope ("best breakfast burrito on this block before 8 a.m." is legal); no "known for" without a source.
4. **Rhythm variance**: flag low sentence-length variance and uniform paragraph shapes — metronomic rhythm is the AI tell no banlist catches.
5. **Structural bans**: no entry opens "VenueName is a…"; no "whether you're X or Y"; humor at Herb Lester frequency (once per day plan, at most).
6. **The firewall itself**: the composer sees ledger facts, the bible, the corpus, and the scoped traveler subgraph — nothing else. Most slop is a model with nothing true to say filling space; a composer that can only style verified particulars has structurally less room to be vacuous.

Track Gate-1 hits per 1,000 words as the canary time series; a rising slop-score after a model or prompt change is a release blocker.

---

## 5. The editor-agent: three gates, amended

Adopt the three-gate architecture (deterministic lint → fact gate → rubric judge, judge on a different model lineage than the composer, anchored to the calibration corpus, pairwise for voice). This seat's amendments:

**Gate 1 — mechanical lint** adds: per-format word budgets from §2 (including the 650-word day cap and 3-minute reading-time budget), hedge-budget count, entity-swap harness dispatch, register tagging check (§7), map-label lint, fallback-has-trigger, ending-exists check (the last day must contain a composed final evening and departure block).

**Gate 2 — fact gate** adds: **verbatim quote re-verification** (re-fetch, string-match); the adversarial allergen sweep ("find a way this day poisons this traveler") as a distinct red-team pass; LEAVE BY arithmetic re-derived from routed times + gate hours + sunset; dwell-time totals vs. day length *for this party's* walking budget.

**Gate 3 — rubric judge** scores 1–4 with anchored exemplars and a one-sentence justification (which doubles as the regeneration instruction). The eight dimensions from the research report stand — non-substitutability, specificity density, voice fidelity (pairwise vs. corpus), judgment presence, personal fit *without naming constraints*, honesty calibration, composed-ness, soul budget — with one structural amendment: **the day, not the entry, is the primary graded unit.** Entry-by-entry grading cannot see choreography — whether the transitions carry content, whether the thesis is legible in the sequence, whether the energy arc respects the rest window, whether the ending lands. Grade days first; drill into entries only where the day fails. Two failed regeneration cycles on any unit → escalate to Richard with the justification attached.

And one governance rule the briefing under-specifies: **no bypass lane.** Every word that ships — including Richard's own hand-written entries, inbox-folded additions, and T-24h refresh rewrites — goes through the gates. His prose will pass; the point is that the pipeline has one door. The moment "Richard wrote it" skips the lint is the moment the standard becomes a person again.

---

## 6. The calibration corpus — harvest before you write

Sharpest disagreement with the briefing's sequencing. Both the editorial report and the CEO paper treat the Editorial Bible + calibration corpus as a writing project to begin. Wrong order. **Richard already wrote the calibration corpus** — it is deployed, encrypted, at richardliu5764.github.io: the Little Tokyo pocket guide, the LA day plans, the why_this_for_you lines, the interview copy, the empty states. Phase one is *extraction, not composition*: pull the 25–40 best existing units out of the shipped LA guide, tag each by format (why-sentence / stop body / transition / interlude / fallback / day thesis / service copy), and annotate *why it works* in one line each. That's a day of work and it anchors everything.

Second move, equally important and absent from the briefing: **every exemplar gets a slop twin** — the same underlying facts rewritten in competent generic-AI register. Nobody naturally writes the rejects, and without rejects the judge has no boundary to learn and pairwise voice grading has no contrast class. Exemplar + slop-twin pairs are the judge's anchors, the composer's negative few-shots, and the regression suite in one artifact. The Bible's prose (voice charter, register rules, per-format specs, personalization grammar, honesty clauses) is then written *around* the corpus, codifying what the examples already demonstrate — a week of Richard's writing, the highest-ROI week in the whole program.

Thereafter the corpus compounds automatically: every edit Richard makes at the final read is captured as a (before, after) pair; accepted pairs graduate into the corpus; the judge re-anchors quarterly. His taste stops being labor and becomes an appreciating asset — this is the editorial moat, and it is the real reason his post-compose edits must flow through the system rather than into the JSON directly.

---

## 7. Personalization grammar and register governance

**Constraints surface as service, never as labels.** "The garden path is flat the whole way" — never "wheelchair-friendly option." "The corn tortillas are safe; the menu marks GF clearly" — never "options for Maya's gluten-free diet." The celebration is referenced once, at the engineered peak, not on every page. Names appear in personalization slots (Now view, attributed days — "Thursday afternoon is Maya's"), sparingly in prose. The pack-time constraint-label leak scan the AI Architect specifies is the enforcement mechanism; from this seat it is also an *editorial* gate: a guide that reads back your medical file is surveillance wearing a nice typeface.

**Three registers, governed.** The product speaks in exactly three voices and every generated string must declare which it is: the **narrator** (Source Serif italic — theses, why-sentences, interludes, empty states; first person, present tense, zero exclamation marks), the **service register** (Inter — logistics prose, instructions, hedges-in-voice), and the **data register** (Archivo — times, codes, prices; never narrated). As AI-generated strings multiply, register drift is the quiet killer: a narrator-voiced error message or a chirpy data label erodes the object-quality faster than any single bad entry. Gate 1 checks the tag; the Bible defines the boundaries. (This also supplies the editorial vote on a design question: the "editorial typestyle" that sets body text in serif erases the narrator register's distinctness and should die.)

---

## 8. Where Richard stays in the loop, and where he gets out of the way

The CEO paper fixes two human touchpoints: thesis approval and final read. I amend the first and defend the second.

**Touchpoint 1 — the flat plan, not just the thesis.** Approving a one-sentence thesis is cheap and abstract; a thesis can be perfect while the slate under it is wrong. Magazines solve this with the flat plan, and so should Excurse: **one screen, one gate — the trip thesis, the day theses, and the slate (every candidate stop as a name + one-line why + which taste/constraint it serves), before deep research spend.** Twenty minutes of Richard's taste at the point of maximum leverage, where a cut costs nothing. This is where he is irreplaceable: which places, in which order, for these people. Approve, strike, or swap — then research runs without him.

**Touchpoint 2 — the final read**, with the judge's scorecard as a heat map, edits captured as corpus pairs. Timeboxed: if the final read routinely exceeds an hour, that is a pipeline defect to fix upstream, not a workload to absorb.

**Exception lane:** two failed judge cycles, conflicting T1 sources on an allergen-adjacent fact, or an allergen phone-call task — these interrupt him; nothing else does.

**Where he must get out of the way**, explicitly, because the atelier economics and the Stage-2 price point depend on it: hours and logistics verification (machines re-check; he never does); fallback and transition drafting (gate-checked compose output); line-editing every entry (his line edits are corpus food, and if he's making many, the corpus or the specs are wrong — fix the system, not the sentence); the T-72h/T-24h refresh (fully automatic, notify-on-anomaly only); and deploys. The measure of success from this seat: **trip N+1 needs less of his ink than trip N**, and the scorecard proves the bar held anyway.

---

## 9. Kill list (editorial)

1. The "Verified — findings checked against locals" string and every other performed-but-unpracticed epistemic claim, until the machinery exists.
2. Vivid unverifiable atmosphere — cut, never kept (§3.1).
3. Hedging as a substitute for research (§3.5's budget makes this enforceable).
4. Quotes without verbatim sources; synthesized "local consensus" voices.
5. The editorial typestyle that erases the narrator register (§7).
6. Any entry whose why-sentence survives the entity swap.
7. Guides that end at a flight record (§2.1).

## 10. What must survive untouched

- **The shipped voice corpus** — "Enjoy the quiet," "I never plan from a guess," "Either is fine. I just want your lean," the tiny-counter placeholder. These strings are the calibration set's spine and the brand.
- **The epistemic UI vocabulary** (receipts, "Call ahead" chips, dashed provisionality, "in your pocket," decision forks) — the pre-built rendering layer for the fact ledger; the overhaul's job is to make it true, never to redesign it.
- **Density restraint and palette-named day theses** — the product already refuses to be a listings site; protect that refusal as compose scales.
- **The wallet derived from confirmations and the `«` redaction sentinel** — single-source-of-truth content patterns; graceful degradation is an editorial virtue.
- **Constraints-as-service personalization** (`why_this_for_you` is the right field; it just needs the grammar of §7 enforced).
- **Offline self-sufficiency as a content requirement** — the Baedeker axis: the bundle must anticipate every practical need, because there is no "just Google it" at 9 p.m. in airplane mode.

## 11. Sequencing, from this seat (against the October 16 Durham deadline)

1. **Now (days):** harvest the calibration corpus from the LA guide + slop twins; remove the untrue verification string.
2. **July:** write the Editorial Bible around the corpus; per-format specs from §2 formalized into the schema; Gate 1 lint running in CI.
3. **August:** fact ledger + tiers + T0 validator live; Gate 2 including quote verification and the allergen red-team; flat-plan gate in the Studio (a markdown file Richard edits is fine).
4. **September:** Gate 3 judge anchored to the corpus; hedge budget and day-level grading; Durham composed end-to-end through the gates — Richard's manual path retires only when the pipeline's scorecard and his own read both say so.
5. **October 1–16:** T-72h/T-24h refresh passes live on Durham; per-fact whispers rendering through the existing receipts UI; the ending of the Durham trip composed as deliberately as its peak.

The taste is proven; the LA guide is the proof. The work is to make the taste survive Richard's absence from any given sentence — corpus, bible, gates, two touchpoints, no bypass lane. Then the quiet the product promises is quiet he gets to keep too.

*— Travel Editorial Director seat, Excurse overhaul council*
