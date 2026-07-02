# EXCURSE — THE FINAL BLUEPRINT
### Merged ruling of Blueprints A and B under the Skeptic's discipline · Final Judge · July 2, 2026

This document supersedes blueprints A and B. Where they agreed (which is most places), the shared position is adopted without comment. Where they diverged, the merge rule was fixed in advance and applied without exception: **take the bold thesis where it is cheap, take the pragmatic sequencing everywhere, and keep the skeptic's falsification test attached to every major bet.** Papers 01–17 govern where this document is silent; this document governs where anything conflicts.

The whole plan in one sentence: **keep the guide, build the studio, make every shipped promise checkably true, and prove it all on Durham (October 16) — through a pipeline that must earn each of its organs with a cheap test before that organ becomes code.**

Hard constraints, binding: ~50–55 focused solo-dev days between now and October 16. Code freeze **October 3**. Fixed costs <$100/yr; marginal LLM cost ~$20–50/trip. Nothing live between June 24 and October 16 — the calendar is a gift; spend it.

---

## 0 · The three standing laws

Everything below conforms to these. They are the merge, distilled.

**LAW 1 — The falsification rule (skeptic, adopted as constitution).** No proposal graduates from paper to code until its cheapest falsification test has been run and survived. Every major bet in this blueprint carries its test and kill condition inline, marked **⚖**. The burden of proof sits with the cathedral, not the working chapel.

**LAW 2 — Fail-soft is constitutional (operator).** Once a guide is unlocked, no server is needed. Every new component must degrade to "slightly stale," never to "broken." Anything a traveler would miss mid-trip if a Worker dies is rejected at design time. Zero telemetry, zero third-party JS, zero accounts — machine-enforced from here on, not accidents of restraint.

**LAW 3 — The human read is permanent (skeptic over architect, both chairs concurring).** The pipeline exists to make Richard's taste cheaper to apply, never to replace it. Exactly two human touchpoints per trip — the flat-plan gate and the final read — and nothing ships to a traveler that Richard has not read. "Retire the manual path" is struck from the record; what retires is manual *transport and verification drudgery*.

---

## 1 · Product thesis & spirit (one page)

**Excurse is a private atelier that composes a verified, beautiful, offline field guide for named travelers. It interviews you like a friend, researches like a fact-checker, writes like an editor — and then asks nothing of you.**

Not an app you plan trips *in*; an artifact composed *for* you. Every funded competitor is a conversational booking funnel monetizing commissions — structurally incapable of composing for a person rather than toward inventory. Editorial guides (Wildsam, Herb Lester) have voice and object-quality but know nobody's name. On the two axes that organize the market — inventory↔person, tool↔artifact — the person-driven finished-artifact quadrant is empty. **Excurse is Wildsam, if Wildsam knew your name and your flight time.** (The skeptic's caution stands in the margin: quadrants are sometimes empty because nobody can make money standing in them. Fine — see the business ruling below; no architectural decision this year depends on the quadrant paying.)

**The spirit, stated as commitments the code must keep:**

1. **Composed, not generated.** Written for named people by a composer who interviewed them. AI is studio staff; taste and final read are human, permanently (Law 3).
2. **Quiet.** Never exclaims, never gamifies, never interrupts except to say LEAVE BY. Empty states are rewards. "Every loose end is tied. Enjoy the quiet." may only be uttered when provably true.
3. **Private by construction.** Client-side encryption, no accounts, no telemetry, no third-party JS. This is the license to ask about allergies, a young child, and what a family is celebrating. Every privacy sentence shipped must be checkably true (§7).
4. **Works in airplane mode, asks nothing.** Offline is a free default forever. The bundle anticipates every practical need, because there is no Google at 30,000 feet.
5. **Honest about what it knows.** The epistemic UI (hunch/pattern/confirmed, dashed provisionality, receipts, "Call ahead") is the product's one original interface idea. The overhaul's central act is making it *true*: every rendered certainty backed by a provenance-carrying statement, every hedge earned.
6. **A keepsake.** A trip is a permanent, self-contained encrypted artifact. la-fieldguide still opening in 2031 is a feature every architecture decision must reproduce.

**What the overhaul is:** the second half of the founding. The traveler-facing guide is the best-crafted trip UI anyone ships; the studio that makes it does not exist — the interview discards its output, the handoff sets a boolean, the transport is a mailto, nothing verifies an allergy or an opening hour, and the privacy promise leaks in the plaintext wrapper. Stop polishing the guide. Build the studio: interview → episodes → graph → research → verify → compose → read → encrypt → deploy, with exactly two human touchpoints — and repair the shipped edges that contradict the center (frozen service worker, cache wars, plaintext registry announcing an empty house, shared salt, promises the code can't keep).

**The steelman, answered rather than ignored (skeptic §1).** The product already worked end-to-end for a real family; the quality came from the human; the user-research sample is zero; Durham doesn't strictly *require* any of this. All true. The blueprint's answers: the human stays in charge forever (Law 3); user evidence is gathered in week 2 before any interview code is written (§8); Durham's fallback is explicit — it ships hand-composed through the new packer if the pipeline isn't ready, and the pipeline shadows rather than gates until it earns trust; and the three genuinely-broken things (privacy leaks, frozen SW, no source custody) are fixed in week 1 regardless of everything else. The overhaul earns the rest test by test.

**Business ruling (B over A, pragmatic):** monetization is deferred entirely in 2026. The goal is the loop, proven on Durham plus 2–3 *gifted* trips for people Richard knows. No stranger's money, therefore no stranger's allergies, until the loop has survived three real trips and the liability question (§9 Q7) has a real answer. Never commission revenue — permanent. A's staged ambition (personal atelier → invite-only boutique at $150–600/trip with gift guides as the wedge → at most a vetted atelier network) is retained *as direction only*; it shapes zero code this year.

---

## 2 · The traveler experience, end to end

Five acts. Acts 2–4 are ~90% shipped and are **kept**; changes are marked ▸.

**Act 0 — The invitation.** A message from someone who loves you: *"I made you something for Durham."* One link. ▸ From September (envelope v2): the link carries a random 256-bit content key in its URL fragment (`#k=…`, Excalidraw pattern — never reaches any server), stripped via `history.replaceState` and re-wrapped under a PIN of the traveler's choosing. No passphrase to type, ever; the generated diceware phrase survives only as a spoken-aloud fallback. Until then: the passphrase screen, unchanged. Before unlock the shell knows nothing and says nothing — ▸ the trip registry moves inside the crypto boundary (`atlas-entry.enc`); the public page is a frond and a sentence.

**Act 1 — The interview (the anticipation act).** For the primary traveler: 7–9 quiet turns under five minutes, one question per screen with a listening beat — reflection first, question a breath later. Four movements, not progress bars. Story-first ("A story tells me more than a checklist ever could"), leans late ("Either is fine. I just want your lean." survives character-for-character), the safety sweep framed as care, never skippable, read back in confirmed green. The "What I'm hearing" ledger (hunch ○ / pattern ◐ / confirmed ●) is the only payoff surface — no mid-interview plan previews. Closing: a full-screen narrator-serif summary the traveler confirms. ▸ Invitees get ~4 turns, honoring "you don't have to do anything." ▸ Answers leave the device **sealed** — HPKE-encrypted to the composer's key — and the copy says exactly that: *"Your answers travel sealed. Only your planner can open them. They're never used to train anything."* ▸ Days later, at most one **planner's letter** with ≤3 follow-ups, epistolary, not chat. Round 3 is the draft itself: decision_point blocks ("your call") are questions wearing itinerary clothes. The traveler never chats with a bot.

**⚖ Interview reality test (skeptic 4.3), runs week 2 before any new interview code:** two non-author adults (one invitee-tier, one primary-tier) take the *current* v2 interview, timed and observed. Kill condition: either bails or calls it long/precious → cut to 7–9/4 with the existing script before any new machinery; the epistemic overclaim "I never plan from a guess" is rewritten regardless (the pipeline structurally cannot keep it).

**Act 2 — The guide arrives.** *"Durham is ready."* Tabs unchanged: **Now / Days / Wallet / Prep / You.** Days keep their theses ("Golden Hour"); blocks keep their species (anchor / planned / decision fork / backup "in your pocket" / freeform); `why_this_for_you` reads as service, never label — *"the corn tortillas are safe,"* never "GF options for Maya." ▸ Every commitment is now backed by the fact ledger: receipts render as dated whispers ("checked Tuesday") **only when earned** (§4.6); single-source facts keep the amber "Call ahead" chip; ≤2 hedged assertions per day, in voice. ▸ The final evening and departure morning get marquee-day investment — the guide no longer dies at a bare flight record (peak-end rule).

**Act 3 — On the ground.** The Now view kept whole: tz-aware current/next/meanwhile, per-viewer participation, LEAVE BY = start − travel − 10 with the countdown ring, the timeshift scrubber, "Nothing scheduled, exactly as planned." ▸ Under a correctness contract: midnight/DST wrap fixed and pinned by golden tests — one wrong LEAVE BY and the ring is decoration forever. Wallet: card fan, QR passes, §-sectioned lodging card, all derived solely from block confirmations. ▸ Offline becomes whole: the **paper day-map** — a PMTiles extract of the trip footprint (10–60MB) downloaded into OPFS on first unlock with a progress whisper ("Laying in your maps — 40 seconds on hotel wifi"), styled entirely in trip tokens, a dozen labels in guide voice ("the good bench," "last bathroom before the trail"). The cinematic satellite trek stays as-shipped, scope-frozen, online-only; its SVG fallback is promoted from apology to first-class "field sketch." ▸ Silent T-72h/T-24h refreshes ride the existing ct-diff hot-swap: the guide opened Thursday morning was re-verified Wednesday night, wordlessly. ▸ Inbox saves (TikTok/Maps pastes) go through the sealed transport; the mailto dies. Worst mid-trip server failure: a slightly stale guide, never a broken one (Law 2).

**⚖ Maps test (skeptic 4.7/4.8), runs in the week-2 LA debrief:** did anyone open a map in airplane mode? Did anyone rewatch the cinematic tour? Then hand-build ONE Durham extract and side-load it on one real iPhone over hotel-grade wifi. Kill condition: nobody used maps offline or the OPFS download annoys on a family phone → the field sketch *is* the offline answer and PMTiles becomes a someday (freeing ~4 days in September). Either way the trek stays scope-frozen.

**Act 4 — Afterglow (new, small, post-Durham).** The week after return, the guide turns past-tense — the mode styled since June 14, finally wired. At most three skippable questions in the planner's voice, built on the peak-end rule (*"What's the moment you'll still be telling people about in a year?"*). Answers seal to the composer and, with per-edge owner approval, promote to the durable Traveler PKG — the second trip's interview starts warm at 4 turns instead of 9. This is the compounding moat; it is also timeboxed post-Durham, because the *transport* for it exists from week 1 and the mode can wait its turn.

**What the traveler never sees:** a chat surface, a graph, a score, a gate, a pipeline artifact, a model name, a badge, a streak, a second notification type, or a request to rate anything. The design seat's **Quiet Test** stands as a permanent office of No: every future traveler-facing proposal must document what it asks of the traveler, its interruption treaty, its machinery visibility, and whether it would survive being printed.

---

## 3 · The composer (Richard) experience, end to end

Today: interview answers marooned in localStorage, composition in a chat window, 50 hand deploys in 11 days including 4 AM pushes — content iteration in production because there was no local preview. Target: **a trip costs ~4 hours of attention and 3 production deploys** (initial, T-72h, T-24h), with taste applied at exactly the two points of maximum leverage.

**The Studio is a CLI (`excursed`) and git diff is the review UI.** No daemon, no database, no orchestration framework. One private monorepo; each trip is a directory:

```
trips/durham-2026-10/
  episodes/          # append-only: interview turns, letters, inbox pastes, observations
  graph/             # nodes.jsonl + statements.jsonl (projection — rebuildable)
  agenda/            # open questions + research tasks (workflow files, not graph)
  ledger/            # facts.jsonl — atomic claims w/ sources, tier, volatility
  plan/              # thesis.md, slate.md, skeleton.json
  guide/             # composed trip.json (pre-encryption) + prose sidecars
  editions/          # packed trip-data.enc history
```

**The verbs**, each a pure, re-runnable stage over that directory:

```
pull        # collect sealed drops from R2, decrypt to episodes/
extract     # episodes → statements (provenance-labeled, quoted, validated)
ask         # question policy: what's still worth asking? → letter draft or "stop"
agenda      # derive research tasks mechanically from graph gaps (7 rules)
research    # fill fixed per-stop-type forms; UNFOUND is a legal answer; T0 rule enforced
plan        # thesis + day theses + slate → one flat-plan screen        [GATE 1: Richard]
compose     # skeleton → verify skeleton → per-day prose, cite-or-cut
verify      # 7 deterministic checkers + leak scan → scorecard; violations → loose ends
lint        # editorial Gate 1: banlists, budgets, registers, hedge count
factcheck   # editorial Gate 2: claim re-extraction, quote re-fetch, allergen sweep
preview     # local hot-reload shell over pre-encryption JSON            [GATE 2: Richard]
pack        # encrypt (v2 envelope), redaction sentinel, bundle leak lint
deploy      # push edition to /t/{slug}/ via CI; stamps SW manifest
refresh     # T-72h/T-24h: re-verify volatile ledger facts → patch → pack → deploy
archive     # emit a fully self-contained frozen keepsake bundle
distill     # post-trip: propose durable edges to Traveler PKG, per-edge approval
```

**Exactly two human gates (Law 3):**

- **Gate 1 — the flat plan** (~20 minutes): one screen — trip thesis, day theses, the full slate, each candidate stop as name + one-line why + which taste/constraint it serves — approved *before* research spend and prose. Richard edits by deleting lines and writing one-line reasons; the pipeline treats his edits as instructions. Any allergen-critical phone calls the agenda demands are **scheduled into this session** — not left to a fictional agent (skeptic's realism check; if the call won't happen, the fact gets no stamp: hedge or cut).
- **Gate 2 — the final read** (timeboxed, ~90 minutes): the composed guide in the local preview with the verifier/lint scorecard as a heat-map so attention lands on weak days first. Every edit is captured as a (before, after) pair feeding the calibration corpus — taste compounds into the system with zero extra effort. **Permanent.**

Everywhere else — logistics verification, fallback drafting, line-editing to the banlists, refresh runs, deploys — the machinery runs and Richard stays out of the way.

**Three separated iteration loops (operator, binding),** so 50-deploys-in-11-days never recurs: shell changes deploy via CI (rare); trip composition runs through the verbs; content tweaks iterate in the **local preview** against pre-encryption JSON, with throwaway preview slugs when a phone check is needed.

**Live-trip operations without telemetry:** a permanent synthetic canary trip that scheduled CI unlocks end-to-end every 6 hours during trip windows; `wrangler tail` on the drop Worker; ntfy alerts to Richard's phone. A Safari update that breaks unlock is discovered by the operator, not the family. Monitoring stays synthetic forever — zero telemetry is the brand.

---

## 4 · The AI core — five machines on one data spine

The front end already speaks the exact epistemic language a rigorous back end needs to emit. The job is to build the back end that makes it true. Each machine carries its falsification test.

### 4.1 Episodes are canonical; the graph is a projection

Every interview turn, planner's letter, inbox paste, mid-trip observation, and afterglow answer is an **append-only episode** (JSONL: id, kind, traveler, trip, timestamp, prompt_id, verbatim content, transport ref). The graph is rebuildable by re-running extraction over episodes — insurance against extraction bugs, a free upgrade path as models improve, and the thing that makes every ontology deferral costless: ontology deferred is not ontology lost.

### 4.2 The Excurse Trip Graph (ETG) — split by its consumer

Plain diffable JSONL in the trip directory (`nodes.jsonl` + `statements.jsonl`), Zod schemas, in-memory indexes, git as version history. Explicitly no Neo4j, no RDF, no triplestore at <5k statements/trip. ~500–800 lines of owned code (graphiti-core evaluated and declined).

**Built now — the verifier-consumed spine** (justified independent of any composition-quality claim, because a checker cannot grep a story for "gluten-free"): `traveler, party, trip, day, slot, place, booking, constraint, claim, episode, tension`. **Deferred behind the blind test:** `taste, rhythm, theme` — the full schema exists on paper; code is earned node-type by node-type. **Evicted to `agenda/` workflow files:** `question`, `researchTask` — work items, not knowledge.

**The statement — the heart of the system:**

```jsonc
{ "id": "st_0917",
  "sub": "tv_maya", "pred": "has_constraint", "obj": "cn_gluten_celiac",
  "provenance": "stated",        // stated | implied | inferred | assumed | researched | observed
  "confidence": 0.98,
  "quote": "she's celiac — it's not a preference thing",   // REQUIRED when provenance=stated
  "sources": ["ep_0412#t3"],     // never empty: episode turns or URLs
  "assertedAt": "2026-07-14", "invalidatedAt": null,        // bi-temporal (Zep/Graphiti)
  "validFrom": null, "validTo": null,
  "supersedes": null,            // contradictions invalidate+supersede, never delete
  "scope": "trip" }              // durable → PKG-promotable | trip
```

**Hard invariants, enforced by a validator, never a prompt:** `stated` requires a verbatim quote; `constraint` statements may **only** be `stated` — always asked, read back verbatim, the interview cannot end without them; archetype defaults enter as explicit low-confidence `assumed` edges (asked about if consequential, hedged around if not); ladders (attribute→consequence→value) stored whole — values transfer across trips, attributes don't; `tension` is first-class (rest-vs-adventure) — composition must **honor** tensions, never resolve them; world facts (hours, GF menus) are the same statement shape with `provenance: researched` and `validTo` staleness — one schema for interview truth and researched truth, and the verifier consumes both.

**Two graphs, one schema:** the per-trip graph, and the persistent, encrypted **Traveler PKG** that never deploys and never leaves the composer's machine. Medical and child data never ship; `trip-data.enc` contains only the compiled guide. `distill` promotes durable edges post-trip with per-edge owner approval and recency decay. Place identity anchors to OSM id + Wikidata QID + Google Place ID; constraint vocabulary borrows OSM tags; shapes borrow schema.org names. Borrow vocabulary, never machinery. Pinterest lesson: travelers are multi-interest clusters — **rotate tastes across days, never average them.**

**⚖ Graph-vs-transcript blind test (skeptic 4.1), runs during Durham composition (~Aug, half a day):** compose one Durham day from raw transcripts pasted into the composer prompt, and one from a graph serialization of the same content. Richard blind-picks, twice. Kill condition: transcript wins or ties → the taste/rhythm/theme ontology is dead; only the constraint spine survives; composition quotes the transcript directly forever. (The Stanford result — a raw two-hour narrative transcript models a person at 85% of their own test-retest reliability — argues the transcript may well win. Losing this bet costs nothing: episodes are canonical.)

**⚖ Maintenance prediction, logged for the November review (skeptic §3.2):** if by the second post-Durham trip Richard is composing from transcripts and hand-editing guide JSON, the graph beyond the constraint spine is a decorative intermediate artifact and gets deleted, not defended.

### 4.3 The interview engine — correspondence, not chat

**The instrument is authored; the policy is code.** The v2 question bank — four movements, chips/scale/pair/story kinds, safety ×3 weighting — is kept and trimmed; every string human-written and versioned in the Editorial Bible. One new question admitted: **budget posture** (the "Money" ledger theme has shipped questionless for two versions while composition silently assumed it) — one authored pair-lean.

**Question policy (deterministic v1 — the AI seat's design; EVPI v2 is not computable and stays on paper):**

```
score(q) = impact(q) × uncertainty(q) × answerability(q) − askCost(n, researchable)
  impact:       SAFETY ∞ · SKELETON 8 · SELECTION 4 · TEXTURE 2   (static classes)
  uncertainty:  1 − max confidence of statements q would produce
  answerability: story > attribute for novices
  askCost:      rises with question count; rises further if the answer is researchable
                (specification uncertainty → ask; model uncertainty → research/default)
stop when: no candidate clears threshold, OR budget hit (7–9 primary / 4 invitee)
never stop while: any SAFETY slot is empty
```

This makes "a few quiet questions" an *enforced property* (a hard cap alone doesn't choose which questions to drop) and doubles as the assumption ledger: whatever wasn't asked is visible as `assumed` edges the composer must hedge. Ask-vs-infer is an explicit policy gate, not emergent LLM behavior (LLMs under-ask unprompted).

**Extraction contract, two-pass:** structured answers (chips/scales/pairs) write statements locally, deterministically — no NLP, works offline. Whole-transcript frontier extraction runs at the desk: one ontology-guided structured-output call per episode batch, checkpointed, provenance-labeled, turn-ID-cited, rejected by the validator on any invariant breach.

**Groups:** each traveler interviewed separately (organizers misreport their own families; children have real influence). Aggregation: constraints by least-misery veto; shared meals average-without-misery; day themes by fairness rotation with visible attribution ("Thursday is Maya's").

**⚖ Question-scorer test (skeptic 4.2), one afternoon before scorer v2 is ever considered:** run the static bank on 3 mock travelers; for each answer ask "did this change the plan?" Kill condition: if ≥9 of 12 static questions pass plan-delta anyway, the v2 slate-divergence scorer buys nothing — the hard cap plus v1 suffices.

### 4.4 The research pipeline — the fact ledger

**Agenda derived mechanically from graph gaps (7 rules):** (1) every place touching a hard constraint → verification task requiring a **T1 citation** (serious allergies: primary sources; any phone-call task is scheduled into Gate 1 or the fact gets no stamp); (2) every dated slot → hours verified for the actual dates; (3) every transition → routing for LEAVE BY, plus parking/bathrooms/the view en route — connective tissue is a first-class researched content class; this is where "composed for you" lives; (4) unserved tastes → discovery tasks (post-blind-test; until then from transcript directly); (5) every consequential `assumed` edge → verify-or-hedge; (6) volatility classes → the T-72h/T-24h refresh schedule; (7) the soul budget — at most one named human quote + "the two things worth knowing" per major stop.

**The atomic claim:**

```jsonc
{ "id": "fc_2201", "place": "pl_guglhupf",
  "claim": "dedicated gluten-free prep area; no shared fryer",
  "sources": [{ "url": "…", "tier": "T1", "fetched": "2026-09-28" }],
  "tier": "T1",                  // T1 primary · T2 edited press · T3 crowd · T0 model memory
  "confidence": 0.95,
  "volatility": "medium",        // stable | medium (T-72h recheck) | volatile (T-24h)
  "last_checked": "2026-09-28",
  "status": "verified" }         // verified | UNFOUND | stale | struck
```

**The T0 rule, absolute:** model memory may generate hypotheses and search queries; it may **never** populate a ledger field. A ~20-line validator enforces it. This single rule kills the documented hallucinated-landmark class (the fake Andean canyon, the invented Christmas market, the Japan stranding). Research workers fill **fixed per-stop-type forms** (restaurant / museum / hike / shop / transition) or mark **UNFOUND** — never invent. Tasks are pseudonymized by construction: constraint IDs, never children's names, cross the API boundary.

### 4.5 The composer — four firewalled passes

1. **Thesis + slate** → Gate 1 (the flat plan).
2. **Skeleton:** taste-rotated day themes, blocks with time_windows — **verified before any prose is written.** Ordering errors caught here cost nothing; caught in prose they cost a rewrite.
3. **Prose, per day, GraphRAG-lite:** scoped subgraph + ledger claims + transcript quotes serialized into the writer prompt with corpus few-shots. **Cite-or-cut:** every factual sentence emits a sidecar mapping claims to sources; a sentence that can't cite is cut — including atmosphere (sensory claims are checkable only by sourcing, or they die). Two formats, two specs: *day plan* = committed choreography, ≤650 words, 3–7 stops + 2–4 trigger-bound fallbacks; *pocket guide* = browsable miniatures, 40–80 words each. The why-sentence is lintable: non-obvious checkable fact + sensory/temporal particular + actionable judgment, ≤35 words, passes the entity-swap test. The epistemic contract maps 1:1 onto the shipped UI: `stated/researched` ⇒ solid commit · `inferred` ⇒ disclosed in voice ("I'm guessing you'd rather…") · `assumed` ⇒ dashed hedge · single-source ⇒ amber "Call ahead." Constraints surface as **service, never labels.**
4. **Derivation:** wallet from confirmations (kept), LEAVE BY from routing claims, receipts per §4.6, loose ends from open violations, `«` sentinel for anything unfilled.

Output validates against the **formalized We() authoring schema** — the shipped adapter's contract captured in versioned Zod. It is the best-designed part of the current system and the front end already renders it: kept, not replaced. Composer is firewalled to ledger facts; model memory is T0 and can never populate a field. Composer and judge run on different model lineages.

### 4.6 The verifier — the brand, in code

TravelPlanner's number is the most important in the research: pure LLM agents satisfy constraints 0.6–4.4% of the time; neuro-symbolic checking lifts it to 28–97%. **Composition without deterministic verification is malpractice in this product.** Seven TypeScript checkers, run after every compose pass and every refresh:

1. **Hours** — every dated slot inside verified opening hours for its actual date.
2. **Diet/allergen** — every food block × every constrained participating traveler → a T1-cited claim; plus an adversarial sweep (allergen vocabulary near uncited venues).
3. **Walking/energy** — day totals vs. body_access and energy_arc statements.
4. **LEAVE-BY feasibility** — arithmetic re-derived from routing claims; midnight/DST-safe.
5. **Meal/nap cadence** — child/rest constraints → maximum gaps enforced.
6. **Booking coherence** — every confirmation references a real ledger claim; wallet derivable.
7. **Freshness** — no volatile claim past its window at deploy time.

Plus **tension/fairness coverage** (every tension honored somewhere; day themes rotate with visible attribution) and the **pack-time leak scan** (build fails on constraint labels, medical vocabulary, or any new third-party origin in the bundle). Violations write `satisfies/violates` statements back into the graph and **literally generate "Loose ends"** — so "Every loose end is tied. Enjoy the quiet." becomes a sentence the system can only emit when provably true. Waivers require a reason string that lands in git history.

**Earned stamps (the R3/R8 merger):** a fact may render a "checked Tuesday" receipt **only if** it is T1-sourced **and** re-verified inside its volatility window (stable: once; medium: T-72h; volatile: T-24h). Anything that can't be re-checked on schedule renders as hedged in-voice prose ("locks up whenever the surf is good — call first") or is rewritten to its fallback — the skeptic's stamped-hallucination warning built into the rendering rule. The hedge budget (≤2/day) prevents the opposite failure. The T-72h/T-24h refresh is the **primary verification event** of every trip, not a bonus. The untrue shipped string "Verified — findings checked against locals" is deleted in week 1 and may return only when literally true.

**⚖ Verifier calibration test (skeptic 4.4), runs week 2–3 before the checkers are code:** the seven checks as a manual printed checklist against the already-shipped LA guide. Count true violations vs. false alarms. Kill condition: precision below ~70% → redesign checks before coding them (waived gates decay into noise). Conversely: any true violation found in the LA guide is the single best pro-overhaul evidence available — we should *want* this number. Release-blocking eval once coded: 20 seeded violations, 100% catch; an adversarial allergen red-team pass is release-blocking for any trip with a serious allergy.

**Editorial gates:** **Gate 1 lint** (deterministic, free) — dual banlists (travel clichés: nestled/bustling/hidden-gem; AI tells: delve/"isn't just X—it's Y"/rule-of-three/symmetric hedging — Zinsser operationalized: high-probability phrasing is slop by definition), word budgets, register tags (every generated string declares narrator/service/data), hedge count ≤2/day, last-block-isn't-a-bare-flight-record check. **Gate 2 fact** — claims re-extracted from composed prose and matched against the ledger (catches parametric-memory smuggling, VeriScore-style); named-human quotes re-fetched and string-matched verbatim (an LLM-mutated quote from a living person is category-worse than a wrong hour; no verifiable source → the day ships without a quote; one per day is a cap, not a quota). **Gate 3 = Richard, permanently** — the anchored-CoT judge on a different lineage is built only after two real trips' (before, after) corpus exists, and even then it assists the read, never replaces it. No bypass lane, including for Richard's own prose.

**⚖ Judge test (skeptic 4.5), gates any future Gate-3 automation:** judge 20 existing LA entries; compare against Richard's own accept/edit/reject. Kill condition: agreement <80% → the judge is decoration; keep slop-lint and the human read.

**Honesty prerequisite, non-negotiable:** the shipped strings "Nothing you said is sent to an outside AI" / "No raw answers leave the device" become lies the moment this pipeline calls a frontier API. Week 1 they are rewritten to the true, still-differentiated claim (§7), backed by zero-retention API agreements, pseudonymized tasks, and providers named as a disclosed trust boundary in THREATMODEL.md.

---

## 5 · Target architecture & migration — never breaks a live trip

### 5.1 Target state (end of Q1)

```
PRIVATE monorepo (GitHub) ──CI──▶ excurse.app (Cloudflare Workers static assets + R2)
  packages/shell        (Preact+signals shell — recovered source, kept; 48KB gz)
  packages/excursed     (pipeline CLI — moved OUT of the public repo immediately)
  packages/schemas      (Zod: authoring schema from We(), ETG, envelope, ledger)
  packages/sw           (ONE generated service worker)
  packages/tokens       (~100–200-line build-time contrast lint)
  trips/<id>/           (episodes/graph/ledger/plan/guide/editions — never public)
  infra/                (drop Worker, refresh crons, canary)

excurse.app/
  /                       frond + one sentence (knows nothing before unlock)
  /t/{~96-bit slug}/      atlas-entry.enc + trip-data.enc + assets
  /t/{slug}/tiles.pmtiles PMTiles trip extract (range requests → OPFS)
  /drop                   ~50-line write-only Worker → R2 (sealed HPKE blobs in)

richardliu5764.github.io/la-fieldguide/   FROZEN KEEPSAKE (patched once, never migrated)
richardliu5764.github.io/durm-guide/      retired after Durham ships on excurse.app
```

**Kept wholesale:** Preact + signals + no-router state machine; the We() authoring schema formalized in Zod; the derived wallet; the epistemic UI; the IDB non-extractable-CryptoKey fast path (corrected to per-trip slots); ciphertext-as-cache (local loss costs one re-download + one unlock — exactly right for iOS eviction); zero third-party JS, zero telemetry, no accounts.

**The one canonical generated service worker** (spec = la/durm's design intent, which had already solved this on paper): build-time precache manifest; **atomic cache swap** — new cache fully populated before old dropped (closes the offline-dead-window); per-deploy stamped names; **prefix-scoped deletion only** (closes the cross-trip cache war); pass-through for `*.enc` (the app layer's ct-diff owns freshness — closes SWR-defeats-no-store); no unconditional skipWaiting (no more 404'd lazy maplibre chunks mid-session); `navigator.storage.persist()` on first unlock. Playwright **airplane-mode test as a merge gate**: build → install → unlock → kill network → every tab + day map must render.

**Offline maps (if the ⚖ maps test passes):** `pmtiles extract --bbox --maxzoom=15` at pack time ($0 marginal from free daily OSM builds), OPFS download on first unlock (SWs can't cache range requests — makinacorpus pattern), glyphs/sprites precached, no-basemap "field sketch" fallback for eviction. On-origin tiles are also a privacy feature (§7) — they end the live location leak to Esri/AWS and enable `connect-src 'self'`.

**Sealed transport:** clients HPKE-seal (X25519) interview episodes, inbox saves, and afterglow answers to the composer's public key; a ~50-line write-only Worker drops them in R2; infrastructure sees only ciphertext; client queues and retries. **⚖ Transport minimalism check (skeptic 4.11), noted not blocking:** the Worker is ~2 days and both chairs ruled for it; but if it slips or misbehaves in week 1, the fallback is the dumbest transport that works — interview completion offers the iOS share sheet with the sealed blob addressed to the composer. Family-scale delivery must never wait on infrastructure.

**Envelope v2 (September, §7 for detail):** random per-trip content key in the invite fragment; PIN re-wrap; generated-diceware fallback wrap under Argon2id (hash-wasm in a Worker; 64MiB/t=3, 19MiB fallback); per-trip IDB key slots; AES-GCM AAD binding `{tripId, edition}` so ciphertext swaps fail loudly; composer recovery wrap; **v1 reader retained forever** (keepsakes must open in 2031). **⚖ Envelope timing test (skeptic 4.6), already run — one hour of arithmetic:** diceware + per-trip salt under the current v1 envelope already prices out the realistic ciphertext attacker (~10^15 guesses at 270ms-class cost). Therefore envelope v2 is scheduled as **UX work** (zero-typing invites for Durham), not emergency security work — which is exactly why it sits in September and the salt/diceware rotation sits in week 1.

### 5.2 Migration — sequenced so installed PWAs never strand

The pragmatic sequencing (B + skeptic 4.9) governs; the bold consolidation still happens, for Durham onward.

- **Phase 0 (week 1, in place, existing origins — no architecture).** Ship new SW *bytes* to excurse-app-site — the byte-change itself un-freezes every installed client; stamped caches + SWR + atomic swap + prefix-scoped deletion; patch la/durm activate steps (ends the cache wars). Strip the mailto, plaintext trip registry, cross-wired Durham→LA entry, debug HUD CSS, and the two false privacy sentences; delete the theatrical "Hand off" button until transport is live (a trust product may never animate a promise it cannot keep). Squash public git histories (reservation order number, historical ciphertexts, 45MB pack); re-key LA with generated diceware + per-trip salt via packer flag (retiring the shared salt and the single-IDB-slot bug it papered over); re-issue to the family. Push laptop source to private GitHub Day 1 and diff a fresh build against deployed bundles — **only if the diff fails does any reconstruction get scheduled, and then only for the divergent files, and never concurrently with new crypto/origin/pipeline work** (the skeptic's rewrite-trap warning is honored as the contingency plan's shape). Move the `excursed/` scaffold out of the public repo immediately. Verify SW fixes on a real installed iPhone, then **wait a week and watch** (skeptic 4.9): if updates propagate and trips stop clobbering each other, the origin migration proceeds as scheduled convenience, correctly priced.
- **Phase 1 (August).** Stand up excurse.app on Workers + R2 with the canonical SW and CI (golden E2E captured against the *deployed* app before any refactor — behavior lock). Deploy a **private copy of the LA guide as staging tenant #1** for regression-proofing and as the permanent canary substrate. The public la-fieldguide is never migrated. Durham is composed and deployed **only** to `/t/{slug}/` on the new origin — it never touches the old world.
- **Phase 2 (September).** Envelope v2 on the new origin; Durham invites go out as zero-typing fragment links; refresh crons rehearsed against a preview slug.
- **Phase 3 (post-Durham).** la-fieldguide formally frozen: one final deploy stamping it an archive edition, then never touched again — a quiet in-voice card points to the new home; nothing ever redirects forcibly. durm-guide retired (re-issued as a keepsake export if the family wants). The keepsake property is reproduced for every future trip via `excursed archive` — a fully self-contained static bundle no future deploy can break. The per-trip-repo model's unlisted virtues (blast-radius isolation, git-history-as-diary, trip-as-keepsake) are thereby reproduced, not abandoned.

**Known-bug fix list riding Phases 0–1, each landing with a golden test first:** midnight/DST end-wrap in Now; name-substring wallet matching → id-based; dual-source loose-end done state unified; storage namespace un-hardcoded from `la-2026-06`; legacy `tl.*` keys migrated then cleared. Silent mid-trip failure classes get tests first, features never.

---

## 6 · Design & editorial system

### 6.1 Design: industrialize the thesis, kill the dilutions

The paper worldview — print tokens, keylines not shadows, dashed=provisional, color=certainty, three-voice typography, motion with manners — is correct, coherent, and *is* the moat's visible surface. Kept and enforced; nothing is restyled.

- **Doctrine, written:** *quiet comes from scale, weight, spacing, and restraint — never from gray.* The **Ten Paper Rules** (dashed = provisional · color = certainty · italic serif = the planner alone · empty states are rewards · no machinery on stage · offline is a designed condition · keylines not shadows · quiet ≠ gray · one mark, three jobs · the traveler is never asked to manage anything) are codified as an artifact cited in every design review and embedded in every generation prompt.
- **Contrast is a defect, not an aesthetic:** the signature faint ink fails WCAG in every light palette (2.6–3.5:1), worst at exactly the LEAVE BY caption a parent reads in sunlight; the dark palettes prove serenity survives 5.6:1. Fix by hand; then a **~100–200-line build-time contrast lint** fails CI below 4.5:1 for any text token in any surviving palette; add `--line-strong` and text-safe `--accent-text`. The full generated token pipeline is do-not-build (shrink first, script the check, stop).
- **Matrix collapse:** Drift aurora-glass dies (two design languages is zero design languages); both alternate typestyles die (body serif erases the narrator register — the system's best idea defeated by its own option); palettes cut to the four best, hand-fixed; modes stay four (shape/dream/field/afterglow, the last finally wired post-Durham). Also dies: debug HUD/jank CSS, the dead budget-theme stub, `tl.` fossils (migrated then cleared), the literal ✓ glyph (→ drawn mark), sub-44px tap overrides (raised to 44px+).
- **Kept:** the token vocabulary (--paper/--ink/--line/--paper-deep); three-voice typography (Inter system · Archivo data · Source Serif 4 *italic-only* narrator, self-hosted); the motion grammar (direction-aware view transitions, the wallet spring, top-decile reduced-motion coverage); the platform scar tissue (--vvh, safe-areas, anti-zoom inputs).
- **One licensed exception:** daily interludes may set in Source Serif 4 **upright** as framed almanac-quoted matter; italic remains exclusively the planner's first person. ~20KB for the biggest print-quality upgrade available.
- **Maps in two registers:** the PMTiles paper day-map speaks guide voice in trip tokens (labels are editorial arguments, not POI strings); the satellite trek is the frozen cinematic set-piece; its SVG fallback is the "field sketch." MapLibre/Esri/OSM attribution moves from 8px-hidden to a **designed colophon end-page** — attribution made beautiful instead of buried, retiring a compliance risk.
- **Print-quality program (small, phased):** composed title page ("Composed for the Lius · October 2026"), receipts as dated footnote whispers, the § lodging specimen card, afterglow as the keepsake fourth act with craft budget matching the splash.
- **The graph renders as prose, never as a graph:** galley sentences with provenance marks ("mornings are yours ●"), editable inline in "You" and in the Studio. No node diagram ever reaches a traveler. The **Quiet Test** stands (§2).

### 6.2 Editorial: extraction, not invention

The bar exists — in Richard's head and the shipped LA guide. The system's job is to extract and enforce it. **⚖ This is the one proposal with no falsification test needed (skeptic 4.12): cheap, human, compounding, useful even if every other proposal dies. It starts in week 1.**

- **Harvest before writing:** pull the 25–40 best units from the shipped LA guide as the **calibration corpus**, tagged by format, annotated why-it-works, each given a **slop twin** (same facts, competent generic-AI register) so graders have boundaries. The Editorial Bible is written *around* this corpus. Richard's Gate-2 edits feed it as (before, after) pairs forever — the studio's compounding asset.
- **The Bible (7 sections):** voice charter calibrated on shipped strings (three registers with lint-enforced laws; zero exclamation marks; interpunct separators; the planner never apologizes or mentions machinery); dual banlists; per-format entry specs with word budgets (why-sentence ≤35 words + entity-swap test; day prose ≤650 words — a 3-minute standing read; pocket-guide and day-plan are separate formats with separate density specs, or days bloat and wanders starve); personalization grammar (service, never labels); honesty clauses + hedge budget ≤2/day; map-label style; register law.
- **Structural rules:** every entry needs one non-known-attribute fact; one quoted **named** human voice per day maximum, verbatim, re-fetched and string-matched; transitions researched as stops; **the ending is engineered** — final evening and departure morning get marquee investment; Gate-1 lint fails any guide whose last block is a bare flight record.

---

## 7 · Security & privacy

**Governing sentence (THREATMODEL.md v1, week 1):** *The existence, name, dates, and destination of a trip are secrets.* The crypto has been protecting the itinerary while the wrapper gave away the headline — a named family, away from home, on exact future dates, in public JS and a public commit message. Priorities strictly by harm-per-day, which puts metadata above cryptography.

**Tier 1 — metadata triage (week 1, no architecture, days of work):** squash public git histories (reservation order W7Y-VSD-LP5Z, historical ciphertexts, the 45MB pack); purge the plaintext trip registry and the Gmail mailto from the bundle; re-key LA (diceware + per-trip salt via packer flag — the shared salt `O/IGickSf0woYu9XLwbgtA==` dies with the slot bug it excused); content-free commit messages enforced in the deploy script; delete "Verified — checked against locals," "Nothing you said is sent to an outside AI," and "No raw answers leave the device"; commit THREATMODEL.md.

**The honest promise (replaces the false ones, in voice):** *"Your answers travel sealed — only your planner can open them. He uses private tools at his desk to research and compose, under agreements that nothing is kept or used to train anything. Strangers can't read your trip. Neither can we — until you hand us the key."* Backed by zero-retention API terms; pseudonymized research tasks (constraint IDs, never children's names, cross the API boundary); providers named as a disclosed trust boundary. The composer is a **trusted reader** by design — "Your planner can read your trip. Strangers cannot." — no pretense otherwise.

**Tier 2 — sealed transport (week 1, ~2 days):** HPKE-to-composer Worker (§5.1). The most intimate data in the product currently rides plaintext email; this is the most important absent control. Zero-knowledge to infrastructure; fails soft (client queue + retry); share-sheet fallback if the Worker slips.

**Tier 3 — envelope v2 (September, as UX work per the ⚖ arithmetic in §5.1):** fragment content keys (removing human memory from the entropy path entirely — the root fix for the dictionary-attack class, stronger than any KDF upgrade); passphrase demoted to generated-diceware fallback wrap under Argon2id; per-trip IDB key slots (the non-extractable-CryptoKey fast path is the strongest part of current UX crypto — kept, corrected); AAD binding `{tripId, edition}`; atlas-entry.enc inside the boundary; v1 reader forever.

**Tier 4 — boundary hygiene (with the origin move):** on-origin PMTiles ends the live location + attention-pattern leak to Esri/AWS during the trip and enables a strict CSP with `connect-src 'self'` — zero-third-party-JS becomes an *enforced* policy; unified at-rest boundary (everything the traveler enters encrypts under the trip content key — ending the split where allergies get device-key theater while identity/packing/inbox sit in plaintext localStorage); legacy `tl.*` migrated then cleared; **"Forget this device"** deletes all keys and state; pack-time leak lint (constraint labels, medical vocabulary, new origins) as a build failure.

**Standing policy:** PIN is a courtesy curtain, not a boundary; revocation = re-key + re-invite; no accounts, no ratchets, no sync-by-default; no Geolocation API ever — a "you are here" dot, if ever, computes strictly on-device; person/constraint statements age-encrypted at rest on the composer's machine too; a scripted **"forget me"** path (PKG scrub, graph scrub, recompose, delete sealed drops) makes privacy a verb; PKG promotion is consent-gated per edge; any future pkpass ships *inside* the encrypted bundle via blob URL, never hosted plaintext. Smallness is a budget every proposal is taxed against.

---

## 8 · Sequenced roadmap

Budget honesty: council sum = 90–110 days; available ≈ 50–55. The plan fits because of the Day-1 source push (~2 weeks saved) and the do-not-build list (~20 days saved). If availability turns out to be 30 days, cuts come from September polish (PMTiles, design consolidation, envelope v2's Argon2id half) before anything in weeks 1–3 — the loop beats the polish, and **Durham ships through the new packer even if only the AI verbs degrade to manual.**

### Week 1 (July 2–9) — custody, truth, transport [~5 days]
1. **Day 1:** push laptop source to private GitHub; build; diff against deployed bundles (highest leverage-per-effort action in the program; contingency per §5.2 if it fails). Move `excursed/` out of the public repo.
2. **Security triage** (§7 Tier 1) + delete the theatrical Hand-off button + fix the cross-wired Durham entry. (~2d)
3. **SW repair in place** (§5.2 Phase 0) + one Playwright airplane-mode golden test; verify on a real installed iPhone; start the one-week propagation watch. (~1.5d)
4. **Sealed transport:** HPKE client sealing + 50-line drop Worker + `excursed pull`. The mailto dies; the core loop has a pipe. (~2d, overlaps)
5. **Begin the corpus harvest** — first units extracted and annotated (writing work, interleaves with everything).

### Weeks 2–3 (July 10–23) — evidence before code [~9 days]
6. **⚖ User research, before any new interview code:** LA-family 20-minute debrief — what did they actually open, offline, mid-trip; did anyone open a map in airplane mode; did anyone rewatch the trek; what did they screenshot anyway. Two non-author adults take the current v2 interview, timed, observed. Findings memo re-ranks the whole Q1 backlog. (1d, hours of it)
7. **⚖ Manual verifier calibration:** the 7 checks as a printed checklist against the shipped LA guide; record precision and any true violations. (1d)
8. **Calibration corpus to 25–40 units + Editorial Bible v1 + Ten Paper Rules + register law.** (2–3d, interleaved)
9. **Foundation:** monorepo structure, CI, Zod schemas (We() authoring schema, ETG statement schema, envelope), golden E2E suite locking shell behavior against the deployed app, local hot-reload preview over pre-encryption JSON — the anti-4AM loop. (~5d)

### Late July – August — close the loop ugly [~20 days]
10. **ETG spine** (episodes store, statements.jsonl, validator invariants, spine node types) + two-pass extractor with checkpointed calls. (4d)
11. **Question policy v1** over the trimmed authored bank (+ the budget-posture question); correspondence Round-2 letter flow. **⚖ Run the plan-delta test** on 3 mock travelers along the way. (3d)
12. **Research agenda (7 rules) + fact ledger + T0 validator + per-stop-type forms.** (4d)
13. **Composer passes 1–4 + verifier (7 checkers + tension coverage + leak scan) + Gates 1–2 lint/factcheck**; seeded-violation eval (20/20). CLI is the Studio; git diff is review. (7d)
14. **Single origin live:** excurse.app on Workers + R2, `/t/{slug}/`, generated SW, atlas-entry.enc; private LA copy as staging tenant + canary substrate. (2–3d)
15. **Milestone — ~Aug 8: a real Durham traveler completes Round 1 on their phone through the sealed transport and receives a planner's letter.** Contact with reality before the tooling is polished, not after.
16. **⚖ Run the graph-vs-transcript blind test** on a Durham day → decide the taste/rhythm ontology. (0.5d)

### September — harden, verify, compose [~15 days]
17. **Envelope v2** (fragment invites, Argon2id fallback, per-trip slots, AAD); Durham invites re-issued as zero-typing links. (3d)
18. **PMTiles paper day-map + OPFS + field-sketch fallback + strict CSP** — *only if the week-2 maps test passed*; otherwise the field sketch ships as the offline answer and these 4 days go to the loop. (4d)
19. **Design consolidation** (kill Drift/typestyles, 4 palettes contrast-fixed, contrast lint, tap targets, colophon). (3d)
20. **Refresh machinery** (`excursed refresh` at T-72h/T-24h; volatility classes; earned receipts) + synthetic canary + ntfy alerts. (3d)
21. **Durham composed end-to-end through the pipeline** (interleaved): flat-plan gate ~Sep 8 (allergen phone calls scheduled into the session); research; compose; verify green or explicitly waived; first full edition ~Sep 19; final read with heat-map, edits captured as corpus pairs.

### October 1–16 — freeze and ship
22. **Oct 1–3:** final read (touchpoint #2); on-device airplane-mode rehearsal in the actual travel party's hands. **Code freeze Oct 3.** Content only thereafter.
23. **Trip window (Oct 16–19):** canary every 6h, `wrangler tail`, T-72h and T-24h refresh deploys. **Three production deploys total.**
24. **Explicit fallback, pre-committed:** if the pipeline isn't ready at freeze, Durham ships hand-composed *through the new origin and packer* with the manual checklists — only the AI verbs degrade, never the traveler experience. By hand if necessary, proudly.

### Post-Durham (late Oct – Dec)
25. Family debrief #2 (the afterglow conversation *is* the next research input). Afterglow mode wired (timeboxed). `distill` + consent-gated PKG promotion. Corpus fed with Durham pairs. la-fieldguide frozen as archive edition. **November review, with Durham's evidence in hand:** decide the Gate-3 judge (⚖ 4.5), EVPI v2 (⚖ 4.2), push nudges, pkpass, the taste ontology (⚖ 4.1 result + the maintenance prediction), and the 2027 plan — every graduation gated by its test, per Law 1.

### THE DO-NOT-BUILD LIST (2026) — binding; revisited only with a passed falsification test
- ✗ Bundle reconstruction of the shell (source exists; contingency only, scoped as a rewrite if ever)
- ✗ Full generated design-token pipeline (shrink + ~100–200-line lint instead)
- ✗ Taste/rhythm/theme ontology in code before the blind test is won (schema stays on paper)
- ✗ EVPI slate-divergence scorer v2 before the plan-delta test shows v1 wastes questions
- ✗ Gate-3 rubric judge / eval harness before two trips' corpus exists and 80% agreement is shown
- ✗ .pkpass / Apple Developer cert lifecycle (the wallet already renders QR; waits for a second family who asks)
- ✗ Push notifications / Declarative Web Push (first 2027 candidate; must fail soft; must pass "would you tap Allow?")
- ✗ CRDTs, sync, presence, co-editing (encrypted LWW blobs later, if sharing ever lands)
- ✗ Multi-tenant / atelier scaffolding, billing, accounts, strangers' trips, strangers' allergies
- ✗ Live-chat interviewer or any client-side LLM (correspondence is policy, not a stopgap)
- ✗ Any further trek-map investment (scope-frozen signature piece; only PMTiles gets map budget, and only if its test passes)
- ✗ Any new runtime-server dependence that doesn't fail soft
- ✗ App Clips, native anything, Geolocation API
- ✗ New skins, palettes, or typestyles
- ✗ Migrating finished trips off their origins (keepsakes are frozen)
- ✗ Afterglow before Durham ships (its transport exists from week 1; the mode waits its timebox)

---

## 9 · Open questions for the owner

**Week 1:**
1. **Source custody:** does the laptop repo build to (approximately) the deployed bundles? Push it Day 1 — everything sequences off this. If pieces are missing, which?
2. **LA re-key consent:** rotating the key breaks the family's existing unlock. Comfortable re-inviting them? Anyone else holding the current passphrase?
3. **Domain + infra:** confirm `excurse.app` (or choose — this also decides whether the Glide/TL naming debt gets one final migration) and the Cloudflare account. Budget ceiling: <$100/yr fixed + ~$20–50/trip LLM.
4. **Trusted-reader framing:** comfortable being *named* as the planner who can read sealed answers? The honest promise requires a person, not a "we."
5. **Frontier providers:** which vendors, under which zero-retention terms, may see *pseudonymized* interview content? Written into THREATMODEL.md and the rewritten copy — your name is on the promise. Composer/judge lineage-splitting acceptable at the stated cost?
6. **LA-family debrief + corpus consent:** may we run the 20-minute debrief and mine the LA guide/transcripts as calibration corpus and test fixtures? (Private repo only.)

**By August:**
7. **Durham travelers:** who is the party, who is the Round-1 primary, and will one of them be the early-August guinea pig? If not, the interview falls back to you as proxy — which changes what the pipeline can prove.
8. **The two-touchpoint contract:** the blueprint removes you from line-editing logistics, fallback drafting, and refresh runs. Will you keep that contract, or should touchpoint scope be renegotiated now rather than violated in September?
9. **Phone-call honesty:** allergen-critical venue calls are scheduled into your Gate-1 session. Will you actually make them, or should "phone-verified" be a tier that simply doesn't exist? (The skeptic bets you won't call; the schema should match reality.)
10. **Hedge-budget sign-off:** ≤2 hedged assertions/day, verify-or-cut for everything else, no stamp without a scheduled re-check. This will sometimes cut stops you love. Confirm the trade.
11. **Availability:** the roadmap assumes ~50 focused days. What does July–October really look like, and if it's 30, the pre-answer stands: September polish slips first; the loop beats the polish.

**By year-end (no code depends on these):**
12. **The ambition:** is the invite-only boutique (paying strangers, $150–600, gift wedge) a real 2027 intention, or is Excurse a permanent gift to people you love? Both honorable; they diverge at liability (allergy language, LLC, insurance), the Gate-3 judge, and whether the Bible must teach a voice that isn't yours.
13. **Keepsake policy:** freeze la-fieldguide/durm-guide with patched SWs and a pointer card (recommended), or archive entirely once export bundles exist?
14. **Afterglow's one question — approve the wording;** it is the only thing Excurse will ever ask a traveler after a trip: *"What's the moment you'll still be telling people about in a year?"*
15. **The diary question:** how much of the trip's *actual history* (edits, weather, what was skipped) should the keepsake honestly record? An editorial stance, not a technical one.

---

*Filed by the Final Judge. Merge rule applied throughout: bold thesis where cheap, pragmatic sequencing everywhere, a falsification test on every bet. The most dangerous sentence in the brief remains "do not feel constrained by anything already done" — because the thing already done is the only part of this project that has ever touched a user and worked. This blueprint constrains itself accordingly: the voice, the paper, the crypto center, the quiet, and the human read are load-bearing and permanent; everything else must pass its test.*
