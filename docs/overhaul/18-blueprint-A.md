# EXCURSE — OVERHAUL BLUEPRINT (A)
### Synthesis Chair ruling document · Council of eight · 2026-07-02

This blueprint is the binding synthesis of the rapporteur briefing and the eight council positions (papers 10–17). Where seats disagreed, the disagreement is named and ruled on inline, marked **RULING**. The chair's bias, per charter, is toward the boldest coherent reinvention the evidence supports — with the operator's arithmetic and the skeptic's falsification discipline adopted as risk controls, not as vetoes on ambition.

The one-line summary of the whole document: **keep the guide, build the studio, and make every shipped promise checkably true — with Durham (Oct 16) as the acceptance test.**

---

## 0 · Chair's rulings on the contested questions

Before the blueprint proper, the ten places the council split, and how this document rules. Every later section conforms to these.

**R1 — Rewrite vs. repair-in-place vs. consolidation.** Architect: consolidate, don't rewrite. Skeptic: repair in place, defer new origin. Operator: source likely exists on the laptop (sw.js comments reference `scripts/deploy.sh` in a private repo), so "reconstruction" is a false premise. **RULING: Operator's correction is adopted as fact-to-verify on Day 1.** Push the laptop source repo to private GitHub, diff a fresh build against deployed bundles. If it matches (expected), the architect's consolidation plan proceeds on the freed ~2 weeks. Only if the diff fails does bundle-recovery begin — and then the skeptic's warning holds: no concurrent new-crypto/new-origin/new-pipeline work during recovery. The new origin migration DOES happen (against the skeptic) because it retires five shipped bug classes in one stroke and the live-trip risk is nil: nothing is live between June 24 and October 16.

**R2 — Knowledge graph scope.** KG researcher + AI seat: full ETG (~14 node types, bi-temporal statements). Skeptic: ontology astronautics; transcript may beat graph; build a constraint ledger only. **RULING: Build the ETG spine, but staged and falsifiable.** Phase 1 ships the statement store with the *load-bearing* node types (traveler, party, trip, constraint, place, booking, episode, tension) — this is the skeptic's "constraint ledger" wearing the full schema, ~500–800 lines. The taste/rhythm ontology is admitted only after running the skeptic's falsification test during Durham composition: one day composed from raw-transcript-in-prompt vs. one from graph serialization, blind pick. Episodes are canonical and the graph is a rebuildable projection (AI seat's event-sourcing amendment), so losing this bet costs nothing — the transcripts remain the source of truth either way. This is the bold-and-safe resolution: the schema exists in full on paper, code is earned node-type by node-type.

**R3 — "Verified" stamps vs. stamped hallucination.** Editorial: verified-as-of stamps as the differentiator. Skeptic: stamps train travelers to stop double-checking; worse than honest hedges when stale. **RULING: Both, by volatility class.** A fact may carry a "checked Tuesday" receipt **only if** its volatility class guarantees a re-check inside its staleness window (stable: checked once; medium: re-verified T-72h; volatile: re-verified T-24h or rewritten to fallback/cut). Anything that cannot be re-checked on schedule is expressed as an in-voice hedge from the editorial hedge budget (≤2/day) — "locks up whenever the surf is good — call first." The untrue shipped string "Verified — findings checked against locals" is removed in week 1 and may return only when literally true.

**R4 — Gate-3 rubric judge.** Editorial: three gates, no bypass. Operator + skeptic: a judge anchored to a one-trip corpus overfits; premature. **RULING: Gates 1–2 now, Gate 3 after two real trips.** Richard's final read is Gate 3 for 2026 — and per the skeptic, the owner's read is *never* retired at any scale; the future judge assists it.

**R5 — EVPI question scorer.** Interview science + KG seats: EVPI-gated policy. AI seat: EVPI-as-specified is not computable (impact needs a plan that doesn't exist yet); fix with static impact classes. Skeptic: defer entirely; cap the existing script. **RULING: AI seat's two-stage design.** v1 = deterministic static impact classes (SAFETY ∞ / SKELETON 8 / SELECTION 4 / TEXTURE 2) × uncertainty × answerability − rising askCost, enforcing the 7–9-turn budget as code. It is ~a day of work over the existing question bank and makes "a few quiet questions" an enforced property, which the skeptic's hard cap alone does not (a cap doesn't choose *which* questions to drop). v2 slate-divergence waits for the skeptic's plan-delta evidence test.

**R6 — Envelope v2 timing.** Security: fragment keys early, ranked above Argon2id. Operator: September. Skeptic: after Durham; diceware + per-trip salts suffice under v1. **RULING: Split the security work by harm-per-day.** Week 1: metadata purge, history squash, key rotation to generated diceware, per-trip salts via packer flag, false-promise rewrite (no architecture, per skeptic). Envelope v2 (fragment-key invites, per-trip IDB slots, Argon2id fallback wrap, AAD binding) lands in September as UX work as much as crypto work — Durham invites ship as zero-typing fragment links. This satisfies security's ranking (metadata first) and operator's calendar simultaneously.

**R7 — Design token pipeline.** Design seat: full generated contrast-validated pipeline. Operator: industrializing an 8-palette matrix for an audience of one; shrink instead. **RULING: Shrink first, script second.** The matrix collapses to 1 skin × 1 typestyle × 4 palettes × 2 themes × 4 modes (Drift dies, alternate typestyles die, palettes cut to the four best). A ~200-line build script validates every text token at ≥4.5:1 and emits the CSS layers — that is the "pipeline," proportionate to the matrix that remains. The Ten Paper Rules are codified as a written doctrine regardless.

**R8 — pkpass, push nudges, sync/CRDTs.** Localfirst + CEO: attractive, cheap-ish. Operator + skeptic: do-not-build before Durham; push adds runtime server dependence to a zero-server product. **RULING: all three on the do-NOT-build list through Q1** (§8.4). The wallet already renders QR. Declarative Web Push is the first candidate *after* Durham because it degrades soft (a missed nudge ≠ a broken guide).

**R9 — User evidence.** Skeptic alone: nobody has asked the LA family anything; no non-author adult has taken the interview. **RULING: adopted verbatim, week 1.** Two instrumented actions: a 20-minute debrief with the LA travelers (what did you actually open, offline, mid-trip? what did you ignore?) and two non-author adults through the current interview v2. Cost: hours. Every seat's plan quietly assumes answers to these questions; get them before the pipeline hardens around guesses.

**R10 — The manual composition path.** CEO/architect: retire when the pipeline wins on the scorecard. Skeptic: never retire; it *is* the quality system. **RULING: the skeptic wins on wording, the CEO on structure.** The pipeline exists to make the owner's taste cheaper to apply, not to replace it. Permanently: two human touchpoints minimum (flat-plan gate, final read — editorial seat's amendment replacing the thesis-only gate). "Retire the manual path" is struck from the plan; "retire manual *transport and verification drudgery*" is what ships.

---

## 1 · Product thesis & spirit (one page)

**Excurse is a private atelier that composes a verified, beautiful, offline field guide for named travelers.** It interviews you like a friend, researches like a fact-checker, writes like an editor, and then asks nothing of you.

It is not an AI trip-planner. Every funded competitor is a conversational booking funnel monetizing commissions — structurally incapable of composing *for a person* rather than *toward inventory*. Human advisors deliver taste but their artifact is a PDF and a WhatsApp thread. Editorial guides (Wildsam, Herb Lester) deliver voice and object-quality but know nobody's name. On the two axes that organize the market — inventory↔person, tool↔artifact — the person-driven finished artifact quadrant is empty. Excurse is Wildsam, if Wildsam knew your name and your flight time.

**The spirit, stated as commitments the code must keep:**

1. **Composed, not generated.** A guide is written for named people by a composer who interviewed them. AI is the studio staff; taste and final read are human, permanently (R10).
2. **Quiet.** The product never exclaims, never gamifies, never interrupts except to say LEAVE BY. Empty states are rewards. "Every loose end is tied. Enjoy the quiet." is a sentence the system may only utter when provably true.
3. **Private by construction.** Client-side encryption, no accounts, no telemetry, no third-party JS. This is not a feature bullet; it is the license to ask about allergies, a young child, and what a family is celebrating. Every privacy sentence shipped must be checkably true (§7).
4. **Works in airplane mode, asks nothing.** Offline is a free default forever (Wanderlog's paywalled offline is the cautionary tale). The bundle anticipates every practical need — the Baedeker axis — because there is no Google fallback at 30,000 feet.
5. **Honest about what it knows.** The epistemic UI (hunch/pattern/confirmed, dashed provisionality, receipts, "Call ahead") is the product's one original interface idea. The overhaul's central act is making it *true*: every rendered certainty backed by a provenance-carrying statement, every hedge earned.
6. **A keepsake.** A trip is a permanent, self-contained encrypted artifact. la-fieldguide still opening in 2031 is a feature every architecture decision must reproduce.

**What the overhaul is:** the second half of the founding. The traveler-facing guide is the best-crafted trip UI anyone has shipped; the studio that makes it does not exist — the interview discards its output, the handoff sets a boolean, the transport is a mailto to a Gmail address, nothing verifies an allergy or an opening hour, and the privacy promise leaks in the plaintext wrapper. Stop polishing the guide. Build the studio. Close interview → graph → research → verify → compose → encrypt → deploy as a real pipeline with exactly two human touchpoints, on a foundation that cannot silently break a family's phone mid-trip.

**Staged ambition (CEO, adopted):** personal atelier now — ten real trips through the real loop, Durham first; then invite-only boutique service at $150–600/trip with gift guides (honeymoons, reunions) as the wedge; then, at most, an atelier network of vetted composers. Never self-serve-first. Never commission revenue — the moat is precisely that commission-funded incumbents cannot follow without abandoning their revenue engine. The skeptic's liability warning is logged as a precondition on stage 2: no paying strangers until the verification machinery has run clean on ≥10 trips and a lawyer has read the allergy language.

---

## 2 · The traveler experience, end-to-end

The traveler's arc has five acts. Acts 2–4 are ~90% shipped and are *kept*; act 1 and act 5 are the overhaul.

**Act 1 — The invitation (new).** A traveler receives a link from someone who loves them: `https://excurse.app/t/{slug}#k=…`. Tap → the guide opens. No passphrase to type — the 256-bit content key rides the URL fragment, never touches any server, is stripped via `history.replaceState` and re-wrapped under a PIN of their choosing (Excalidraw pattern; §7). The passphrase survives only as a spoken-aloud fallback ("if the link ever dies, the phrase is *copper-kettle-thursday*"). Before unlock, the shell knows nothing and says nothing: the trip registry lives inside the crypto boundary as `atlas-entry.enc` (§7). The invitation is the product's trust ceremony: a link that asks nothing back.

**Act 2 — The interview (rebuilt as a correspondence, §4.1).** For the primary traveler: 7–9 quiet turns, under five minutes, one question per screen with a listening beat — reflection first, question a breath later (design seat). Story-first ("Tell me about a day from a past trip you still think about"), the safety sweep framed as care and never skippable, "Either is fine. I just want your lean." surviving character-for-character. Invitees get ~4 turns. The only mid-interview payoff surface is the "What I'm hearing" ledger with hunch ○ / pattern ◐ / confirmed ● marks — explicitly no plan previews (they anchor and spoil the reveal). Closing: a full-screen narrator-serif summary read back in the confirmed-green vocabulary. Answers leave the device **sealed** — HPKE-encrypted to the composer's key — and the copy says exactly that: "Your answers travel sealed. Only your planner can open them." Days later, at most one "planner's letter" arrives with ≤3 follow-ups (R5's Round 2). The traveler never chats with a bot.

**Act 3 — The guide (kept, hardened).** Everything shipped stays: Now/Days/Wallet/Prep/You; the tz-aware Now view comfortable with silence ("Nothing scheduled, exactly as planned"); LEAVE BY with countdown ring (midnight/DST wrap bug fixed under test); the wallet derived entirely from block confirmations with the fused §-sectioned lodging card; decision-point forks ("your call"), backups "in your pocket" with `activates_when` triggers; the cinematic Day Trek, scope-frozen, with its SVG fallback promoted from apology to first-class "field sketch." **New under the same surface:** every receipt, confidence chip, and dashed border is now backed by a real statement with provenance and a last-checked date — the epistemic UI becomes true rather than performed. **New capability:** the paper day-map — a PMTiles extract of the trip footprint (10–60MB) downloaded into OPFS on first unlock, styled entirely in trip tokens, a dozen labels in guide voice ("the good bench," "last bathroom before the trail"). Offline maps stop being blank; the offline promise finally includes the maps.

**Act 4 — Mid-trip (kept, made honest).** Glide-inbox pastes (TikTok/Maps saves) go through the sealed transport as episodes, not through a mailto. Draft answers to decision points flow the same way. Silent T-72h/T-24h refreshes ride the SW's network-first `.enc` path: hours re-verified, volatile facts patched or rewritten to fallbacks, the traveler never sees machinery — the guide is just *never wrong about Tuesday*. Loose ends are generated from open verifier violations plus unexpired cancellation windows, so ticking the last one is a true statement about the world.

**Act 5 — Afterglow (finally wired).** The mode styled since June 14 ships: after the return flight, the guide turns past-tense — a keepsake diary rendering of the trip as it happened — and asks at most three skippable questions built on the peak-end rule ("What's the one moment you've already told someone about?"). Answers seal to the composer and, with per-edge owner approval, promote to the durable Traveler PKG — so the second trip's interview starts warm at 4 turns instead of 9. This is the compounding moat; it currently has no data source. (Timeboxed post-Durham per operator; the *transport* for it exists from week 1.)

**What the traveler is never shown:** a chat surface, a graph, a score, a gate, a pipeline artifact, a second notification type, a badge, or a request for feedback beyond afterglow's three questions. The design seat's Quiet Test (§6) is a standing office of No.

---

## 3 · The composer (Richard) experience, end-to-end

The composer's product is a CLI called `excursed` over a per-trip directory in the private monorepo. No daemon, no database, no orchestration framework; git diff is the review UI; every stage is a pure, re-runnable verb (architect). The operator's framing is binding: **three separated loops** — shell deploys via CI (rare), trip composition via pipeline verbs, content iteration via local hot-reload preview on pre-encryption JSON — so the 50-deploys-in-11-days pattern (content iteration in production, at 4AM, because no local preview existed) never recurs. Target: **three production deploys per trip** — initial, T-72h, T-24h.

**A trip, start to finish (~4 attention-hours, ≤2 days wall-clock):**

1. **`excursed new durham-2026-10`** — scaffolds the trip directory: `episodes/`, `graph/`, `ledger/`, `agenda/`, `drafts/`, `guide/`, `trip.config.json`.
2. **Invites out.** `excursed invite --traveler mom` mints a fragment-key link. Travelers interview on their phones (Act 2); sealed episodes land in the R2 drop; `excursed pull` decrypts them locally into `episodes/`.
3. **`excursed extract`** — one ontology-guided structured-output call per episode batch; statements with provenance labels and turn-ID citations land in `graph/statements.jsonl` (§4.2). Checkpointed; re-runnable as models improve (episodes are canonical).
4. **`excursed ask`** — the question scorer (R5) reports remaining information gaps worth a planner's letter. Richard writes/edits the ≤3 follow-ups in the house voice (the question bank is *written, not generated* — design seat), seals, sends.
5. **`excursed agenda`** — the research agenda derives mechanically from graph gaps (§4.3): constraint verifications needing T1 citations, hours-for-actual-dates, routing/LEAVE-BY inputs, taste-discovery tasks, the soul budget (one named human quote per day). Research workers fill fixed per-stop-type forms or write UNFOUND — never invent. The fact ledger fills with cited, tiered, volatility-classed atomic claims.
6. **HUMAN TOUCHPOINT #1 — the flat-plan gate** (editorial seat, replacing thesis-only approval): one screen — trip thesis, day theses, the full slate (each stop: name, one-line why, which taste/constraint it serves). Twenty minutes of taste at maximum leverage, *before* prose is spent. Richard edits by deleting lines and writing one-line reasons; the pipeline treats his edits as instructions.
7. **`excursed compose`** — four firewalled passes (§4.4): skeleton (verified before any prose), per-day prose from scoped subgraph + ledger with cite-or-cut sentence sidecars, stamps derived last. Composer firewalled to ledger facts; model memory is tier-0 and can never populate a field.
8. **`excursed verify`** — the seven deterministic checkers + tension coverage + constraint-label leak scan (§4.5). Violations must pass or be explicitly waived with a reason string that lands in git history. Gate 1 (lint) and Gate 2 (claim re-extraction, quote re-fetch, adversarial allergen sweep, LEAVE-BY arithmetic) run here.
9. **HUMAN TOUCHPOINT #2 — the final read.** Timeboxed, on the local preview, with the verifier scorecard as a heat-map margin. Every edit Richard makes is captured as a (before, after) pair feeding the calibration corpus — his taste compounds into the system with zero extra effort.
10. **`excursed pack && excursed deploy`** — Zod-validates against the formalized We() authoring schema, runs the pack-time leak lint, encrypts under the trip content key, uploads to `/t/{slug}/`, invalidates. Refresh crons re-run verify-and-patch at T-72h/T-24h; the worst failure mode of a dead cron is a slightly stale guide, never a broken one.

**During the live trip:** no dashboards. A synthetic canary trip is unlocked end-to-end by scheduled CI every 6 hours during trip windows; `wrangler tail` on the drop Worker; ntfy alerts to Richard's phone. Monitoring stays synthetic forever — zero telemetry is the brand (operator).

**Everywhere else, Richard gets out of the way** (editorial seat): logistics verification, fallback drafting, line-editing to the Bible, refresh runs, and deploys are the machine's. His two touchpoints are where taste lives; the pipeline's purpose is to make those twenty minutes and that final read the *whole job*.

---

## 4 · The AI core

Five machines on one data spine. The front end already speaks the exact epistemic language a rigorous back end needs to emit (AI seat) — the job is to build the back end that makes it true.

### 4.1 Interview engine — the correspondence model

**Not chat.** Three rounds, all adaptive intelligence at the composer's desk, preserving privacy and the epistolary calm:

- **Round 1 (device, offline, no client LLM):** the existing v2 instrument re-scripted to the science — 7–9 turns primary, ~4 invitee. Order: episodic anchor first (densest signal — the Stanford result says narrative transcript is the best user model known), occasion + intended-peak question ("the one moment you want to tell someone about" — peak-end engineering), two rhythm leans, late forced-choice tie-breakers, constraints sweep framed as care (always explicit, never inferred, read back verbatim, interview cannot end without it), MI-style closing summary. Question *selection and stopping* are governed by the v1 scorer (R5); every sentence the traveler reads was human-written and versioned in the Editorial Bible. New question admitted: **budget posture** — the "Money" ledger theme has shipped questionless for two versions while composition silently assumed it (AI seat); one pair-type lean fixes this.
- **Round 2 (sealed letter):** at most one planner's letter with ≤3 scorer-flagged follow-ups. LLMs under-ask unprompted — ask-vs-infer is an explicit policy gate, not emergent behavior: *specification uncertainty* (only the traveler knows) → ask; *model uncertainty* (the world knows) → research; neither → default and hedge.
- **Round 3 (in the draft):** decision_point blocks in the first guide edition double as the elicitation channel — "your call" forks are questions wearing itinerary clothes.

**Extractor contract (enforced by validator, not prompt):** `stated` requires a verbatim `quote`; constraints may only ever be `stated`; ladders (attribute→consequence→value) stored whole — values transfer across trips, attributes don't; ambivalence stored as first-class `tension` nodes to be honored in composition, never resolved. Two-pass design: structured answers (chips/scales/pairs) write statements locally with no NLP at all; whole-transcript frontier extraction runs at the desk.

### 4.2 The Excurse Trip Graph (ETG)

**Storage:** plain diffable JSON in the trip directory — `nodes.jsonl` + `statements.jsonl`, Zod schemas, in-memory indexes, git as version history. Explicitly no Neo4j, no RDF, no triplestore at <5k statements/trip. ~500–800 lines of owned code (graphiti-core evaluated and declined: repo-as-database fit wins).

**Node types (Phase 1, per R2):** `traveler, party, trip, day, slot, place, booking, constraint, tension, episode` — plus `taste, rhythm, theme` admitted after the falsification test. `question` and `researchTask` are evicted to workflow agenda files (AI seat amendment) — they are work items, not knowledge. Place nodes anchor identity to OSM id + Wikidata QID + Google Place ID; constraint vocabulary borrows OSM tags (`diet:gluten_free`, `wheelchair=yes`); shapes borrow schema.org names (Trip/subTrip/itinerary/Reservation). Borrow vocabulary, never machinery.

**The statement — the heart of the system:**

```json
{
  "id": "st_0192",
  "subject": "traveler:maya",
  "predicate": "has_constraint",
  "object": "constraint:gluten_free_celiac",
  "provenance": "stated",                     // stated|implied|inferred|assumed|researched|observed
  "confidence": 1.0,
  "quote": "Maya can't have gluten — it's celiac, not a preference.",
  "sources": [{"kind": "interview_turn", "ref": "ep_003#t4"}],   // never empty
  "assertedAt": "2026-07-14T19:02:00Z",
  "invalidatedAt": null,
  "validFrom": "2026-07-14",
  "validTo": null,
  "scope": "durable"                           // durable → PKG-promotable | trip
}
```

Bi-temporal four-timestamp pattern (Zep/Graphiti): contradictions and mid-trip observations **invalidate and supersede, never delete**. World facts (opening hours, GF menus) are the *same shape* with `provenance:"researched"` and `validTo` for staleness — one schema unifies interview extraction and research, and the verifier consumes both. Archetype defaults enter as explicit low-confidence `assumed` edges that either get asked about (if consequential) or hedged around in prose.

**Event sourcing (binding):** every interview turn, letter, inbox paste, and observation is an append-only episode; the graph is a projection re-derivable by re-running extraction. Insurance against extraction bugs, a free upgrade path as models improve, and the hedge that makes R2's staging costless.

**Two graphs, one schema:** the per-trip graph, and a persistent private **Traveler PKG** that never deploys and never leaves the composer's machine (medical and child data never ship). Post-trip, `excursed distill` proposes durable-edge promotions with recency decay; each requires per-edge owner approval. Pinterest lessons apply: travelers are multi-interest clusters — **rotate tastes across days, never average them**.

### 4.3 Research pipeline — the fact ledger

**Agenda derivation is mechanical (7 rules):** (1) every place touching a hard constraint → cited verification task, T1-source-required; (2) every dated slot → hours-for-actual-dates; (3) every movement → routing for LEAVE BY inputs; (4) unserved tastes → discovery tasks; (5) consequential `assumed` edges → verify-or-hedge tasks; (6) volatility → refresh tasks on schedule; (7) the soul budget → one named-human-quote task + "two things worth knowing" per major stop (Wildsam/Blue Guides).

**The atomic claim:**

```json
{
  "claim": "Guglhupf bakery: dedicated GF prep area confirmed by owner reply",
  "sources": [{"url": "https://…", "tier": 1, "fetchedAt": "2026-09-28"}],
  "tier": 1,                    // T1 primary | T2 edited press | T3 crowd | T0 model memory
  "confidence": 0.95,
  "volatility": "medium",       // stable | medium (T-72h recheck) | volatile (T-24h)
  "lastChecked": "2026-09-28",
  "status": "verified"          // verified | UNFOUND | stale | struck
}
```

**The T0 rule, absolute:** model memory may generate hypotheses and search queries; it may **never populate a ledger field**. A 20-line validator enforces it. This single rule kills the documented failure class — the fake Andean canyon, the invented Christmas market, the Japan stranding. Serious-allergy fields require T1 primary sources and may spawn phone-call tasks; per the skeptic's realism check, a phone-call task the solo composer won't make is resolved by the R3 ruling — no stamp, hedge or cut instead. Research workers fill **fixed per-stop-type agendas** (restaurant/museum/hike/shop/**transition** — parking, bathrooms, the walk, the view en route are researched as rigorously as stops; connective tissue is where "composed for you" lives) or mark UNFOUND. Pseudonymized by construction: tasks carry constraint IDs, never children's names (§7).

### 4.4 Composer — four firewalled passes

1. **Flat plan** (thesis + day theses + slate) → human gate #1.
2. **Skeleton:** taste-rotated day themes (theme ≈ community summary over tastes×places), blocks with time_windows — **verified before any prose is written**. Ordering errors caught here cost nothing; caught in prose they cost a rewrite.
3. **Prose, per day, GraphRAG-lite:** scoped subgraph + relevant ledger claims serialized into the writer prompt with corpus few-shots; **cite-or-cut** — every sentence emits a sidecar mapping claims to sources; uncited vivid details are cut, including atmosphere (sensory claims are checkable only by sourcing — critic, venue, firsthand — or they die). The epistemic contract maps 1:1 onto the shipped UI: `stated/researched` ⇒ commit (solid); `inferred` ⇒ disclose (in-voice attribution); `assumed` ⇒ hedge (dashed, "Call ahead"). Personalization grammar enforced: constraints surface as **service, never labels** — "the corn tortillas are safe," never "GF options for Maya."
4. **Derivation:** wallet from confirmations (kept), LEAVE BY from routing claims, receipts and verified-as-of stamps per R3, loose ends from open violations. The `«` sentinel keeps graceful degradation.

Output validates against the **formalized We() authoring schema** — the shipped adapter's contract (days/blocks: anchor|planned_item|decision_point|backup|freeform; time_window, participation, why_this_for_you, confirmation, logistics, location, sources/verified, options+pros/cons, activates_when; guides, key_info, outfits, packing, open_loops) captured in versioned Zod. The schema is kept, not replaced; it is the best-designed part of the current system and the front end already renders it.

### 4.5 Verifier — the hard gate

TravelPlanner's number is the most important in the research: pure LLM agents satisfy all constraints 0.6–4.4% of the time; neuro-symbolic checking lifts it to 28–97%. **Composition without deterministic verification is malpractice in this product.** Seven TypeScript checkers, run after every compose pass and every refresh:

1. **Hours:** every dated slot inside verified opening hours for its actual date.
2. **Diet/allergen:** every food block × every constrained traveler participating → a T1-cited claim; adversarial sweep (search prose for allergen vocabulary near uncited venues).
3. **Walking/energy budget:** day totals vs. body_access and energy_arc statements.
4. **LEAVE-BY feasibility:** arithmetic re-derived from routing claims; midnight/DST-safe (kills the shipped wrap bug class).
5. **Meal cadence:** child/rest constraints → maximum gaps enforced.
6. **Booking coherence:** every confirmation references a real ledger claim; wallet derivable.
7. **Freshness:** no volatile claim past its window at deploy time.

Plus: **tension/fairness coverage** (every tension node honored somewhere; group day-themes rotate with visible attribution — "Thursday is Maya's"), and the **pack-time leak scan** (build fails on constraint labels, medical vocabulary, or any new third-party origin in the bundle — the manifest allow-list guard promoted to a lint). Violations write `satisfies/violates` statements back into the graph; open violations *are* the loose-ends source. Release-blocking test: 20 seeded violations, 100% catch. Skeptic's calibration test adopted: the seven checks run first as a manual checklist against the shipped LA guide — any true violation found is the best pro-overhaul evidence available; precision <70% means thresholds get tuned before gates can be waived into noise.

**Honesty prerequisite (AI seat, non-negotiable):** the shipped strings "Nothing you said is sent to an outside AI" / "No raw answers leave the device" become lies the moment this pipeline calls a frontier API. Week 1, they are rewritten to the true, still-differentiated claim: *"Your answers travel sealed — only your planner can open them. They're never used to train anything."* Backed by zero-retention API agreements, pseudonymized research tasks, and providers named as a disclosed trust boundary in THREATMODEL.md. Composer and judge run on different model lineages. Marginal cost ~$20–50/trip.

---

## 5 · Target technical architecture & migration

### 5.1 Target state

- **One private source monorepo + CI.** `apps/shell` (Preact+signals, kept — 48KB gz, fit for purpose), `packages/schema` (Zod: authoring schema, ETG, envelope), `packages/etg`, `packages/pipeline` (excursed verbs), `packages/sw` (generated worker), `packages/tokens` (build-time palette validation), `trips/<id>/` (content, gitignored where sensitive per §7), `infra/` (Workers, crons). Golden E2E (Playwright) including an **airplane-mode test as a merge gate**: build → install → unlock → kill network → every tab + day map must render.
- **One origin:** `excurse.app` on Cloudflare Workers static assets + R2 (Pages is maintenance-mode; Workers gives unmetered static requests, zero-egress R2, and the custom headers GitHub Pages can't — immutable caching, future pkpass MIME). Trips at `/t/{slug}/` with ~96-bit anti-enumeration slugs (the real capability rides in the fragment key). One shell upgrade serves all trips; pooled storage quota; the cross-trip cache-war and frozen-shell bug classes become **unrepresentable**.
- **One canonical generated service worker** (spec = la/durm's design intent, which had already solved this): build-time precache manifest; **atomic cache swap** — new cache fully populated before old dropped (closes the offline-dead-window); per-deploy stamped names; **prefix-scoped deletion only**; pass-through for `*.enc` (the app layer's ct-diff owns freshness — no more SWR-defeats-no-store); no unconditional skipWaiting (no more 404'd lazy maplibre chunks mid-session); `navigator.storage.persist()` requested on first unlock.
- **Offline maps:** per-trip PMTiles extract (`pmtiles extract --bbox --maxzoom=15`, 10–60MB, $0 marginal from free daily OSM builds) served on-origin, downloaded whole into OPFS on first unlock with progress in-voice ("Laying in your maps — 40 seconds on hotel wifi"). SWs can't cache range requests; OPFS is the proven pattern (makinacorpus plugin). Glyphs/sprites precached. No-basemap fallback (trek lines over neutral grid) for eviction. On-origin tiles are also a privacy feature (§7). The satellite trek stays online-only, scope-frozen, with the SVG field-sketch as its offline face.
- **Sealed transport:** ~50-line write-only Worker → R2. Clients HPKE-seal (X25519) interview episodes, inbox saves, afterglow answers to the composer's public key; infrastructure sees only ciphertext; client queues and retries — **fail-soft is a law**: nothing a traveler needs mid-trip may depend on a live server. The zero-runtime-server property is the crown operational jewel (operator) and every component must preserve it.
- **Envelope v2 (§7 for detail):** random per-trip content key, fragment invites, PIN re-wrap, Argon2id (hash-wasm in a Worker) diceware fallback wrap, per-trip salts and per-trip IDB key slots, AAD binding `{tripId, edition}`, v1 reader retained. iOS 26 opens home-screen sites as web apps by default — install friction is now Share → Add to Home Screen; local state remains a cache over re-fetchable ciphertext (eviction-safe by construction).

### 5.2 Migration — never breaks a live trip

The calendar is a gift: **nothing is live between June 24 and October 16.** Sequenced so every step leaves all existing guides working:

1. **Day 1:** push laptop source to private GitHub; diff fresh build vs. deployed bundles (R1). Custody first, everything else second.
2. **Week 1, in place, on existing origins (no architecture):** ship new SW *bytes* to excurse-app-site — the byte-change itself un-freezes installed clients (the frozen worker means only a changed sw.js can rescue them); stamped cache + SWR + prefix-scoped deletion to all three repos; strip mailto, plaintext trip registry, debug HUD CSS; squash public histories (reservation number, old ciphertexts, 45MB pack); rotate LA to a generated diceware passphrase with a per-trip salt via packer flag; remove the cross-wired Durham→LA-ciphertext entry; remove the theatrical "Hand off" button until transport exists (a trust product may never animate a promise it cannot keep — design seat); rewrite the two false privacy sentences; move the started `excursed/` scaffold **out of the public artifact repo** into the monorepo (operator's landmine).
3. **Weeks 2–4:** stand up excurse.app + canonical SW + CI with golden E2E captured against the *deployed* app before any refactor (behavior lock). Deploy the LA guide to `/t/{slug}/` as the first tenant and regression-proof it against the old origin.
4. **Old origins become keepsakes, not corpses:** la-fieldguide and durm-guide stay up frozen — patched SWs only — honoring trip-as-keepsake (skeptic's unlisted virtue, adopted: blast-radius isolation and history-as-diary are reproduced at the new origin via per-trip export/archive bundles — a self-contained directory a trip can be frozen into forever). A quiet in-voice card in old shells points travelers to the new home; nothing ever redirects forcibly.
5. **Durham never touches the old world:** composed exclusively through the pipeline at the new origin; invites are fragment links; the October trip is the acceptance test, and the fallback (skeptic's insurance) is explicit — if the pipeline isn't ready at code freeze (Oct 3), Durham ships hand-composed *through the new origin and packer* with the manual checklists; only the AI verbs degrade, never the traveler experience.

Known correctness bugs (midnight wrap, name-substring wallet matching, dual-source loose-end state) are fixed under unit tests during week 2–4 refactoring — silent mid-trip failure classes get tests first, features never.

---

## 6 · Design & editorial system

### 6.1 Design: industrialize the thesis, kill the dilutions

The paper worldview — print tokens, keylines not shadows, dashed=provisional, color=certainty, three-voice typography, motion with manners — is correct, coherent, and *is* the moat's visible surface. It is kept and enforced; nothing is restyled.

- **The doctrine, written:** *quiet comes from scale, weight, spacing, and restraint — never from gray.* The **Ten Paper Rules** (dashed=provisional; color=certainty; italic serif=the planner only; empty=reward; no machinery on stage; offline is a designed condition; one question per screen; nothing exclaims; the traveler is never asked to configure; would it survive being printed?) are cited in every design review and embedded in every generation prompt.
- **Contrast is a defect, not an aesthetic:** the signature faint ink fails WCAG in every light palette (2.6–3.5:1), worst at exactly the LEAVE BY caption a parent reads in sunlight; dark palettes prove serenity at 5.6:1. The token build script (R7) hard-gates every text token ≥4.5:1 in every palette, adds `--line-strong` and text-safe `--accent-text`.
- **Matrix collapse (R7):** Drift aurora-glass dies (two design languages is zero design languages); the editorial typestyle dies (body-serif erases the narrator register — the system's best idea defeated by its own option); palettes cut to four, hand-fixed; modes stay four (shape/dream/field/**afterglow**, finally wired).
- **One licensed exception:** daily interludes set in Source Serif 4 **upright** as framed almanac-quoted matter; italic remains exclusively the planner's first person. ~20KB for the biggest print-quality upgrade available.
- **Maps in two registers:** the new PMTiles paper day-map speaks guide voice in trip tokens (labels are editorial arguments, not POI-database strings); the satellite trek is the frozen cinematic set-piece. MapLibre/Esri/OSM attribution moves from 8px-hidden (a compliance risk) to a **designed colophon end-page** — attribution made beautiful instead of buried.
- **Print-quality details program:** composed title page ("Composed for the Lius · June 2026"), receipts as dated footnote whispers, the § lodging specimen card, afterglow as the keepsake fourth act with craft budget matching the splash.
- **Manufacturing marks leave the shipped object:** debug HUD/jank CSS, dead stubs, `tl.` fossils (migrated then cleared), literal ✓ glyph → drawn mark, sub-44px tap overrides raised.
- **The Quiet Test, standing:** every traveler-facing proposal documents what it asks of the traveler, its interruption treaty, its machinery visibility, and whether it survives printing. Pre-emptive rulings against chat surfaces, presence, dashboards, badges, streaks, and any second notification type are adopted as law.
- **The graph is rendered as prose, never as a graph:** galley sentences with provenance marks ("mornings are yours ● confirmed"), editable inline in "You" and in the Studio. No node diagram ever reaches a traveler.

### 6.2 Editorial: extraction, not invention

The bar exists — it lives in Richard's head and his shipped LA guide. The system's job is to extract and enforce it.

- **Harvest before writing (editorial + skeptic, unanimous, cheapest-highest-ROI item):** pull the 25–40 best units from the shipped LA guide as the **calibration corpus**, tagged by format, annotated why-it-works, each given a **slop twin** (same facts, competent generic-AI register) so judges have boundaries. The Editorial Bible is written *around* this corpus. Richard's final-read edits feed it as (before, after) pairs forever.
- **The Bible (7 sections):** voice charter calibrated on shipped strings; dual banlist (travel clichés: nestled/bustling/hidden gem; AI tells: delve/"isn't just X—it's Y"/rule-of-three/symmetric hedging — Zinsser operationalized: high-probability phrasing is slop by definition); per-format entry specs with word budgets (why-sentence ≤35 words passing the entity-swap test; day prose ≤650 words — a 3-minute standing read; **pocket-guide and day-plan are separate formats** with separate density specs, or days bloat and wanders starve); personalization grammar (service, never labels); honesty clauses + **hedge budget ≤2/day** (R3 — authority is the product; everything else is verify-harder-or-cut); map-label style; register law.
- **Three registers governed:** italic-serif narrator / Inter service / Archivo data. Every AI-generated string declares its register; Gate 1 checks it. Notifications, if ever, are LEAVE-BY-only, system register.
- **Structural editorial rules:** every entry needs one non-"known-attribute" fact; one quoted **named** human voice per day maximum (a cap, not a quota), verbatim, string-matched against a re-fetched source — an LLM-mutated quote from a living person is category-worse than a wrong hour; no verifiable voice → the day ships without one. Transitions researched as stops. **The ending is engineered:** the final evening and departure morning get investment equal to the marquee day; Gate 1 fails any guide whose last block is a bare flight record (peak-end rule — the last morning *is* the memory).
- **Gates:** Gate 1 deterministic lint (banlists, budgets, hedge count, register tags, format specs); Gate 2 fact gate (claim re-extraction from composed prose to catch parametric-memory smuggling — VeriScore-style; quote re-fetch; allergen sweep; LEAVE-BY arithmetic); Gate 3 = Richard's read now, anchored CoT judge on a different lineage after two real trips (R4), grading the **day** as the primary unit — choreography is invisible entry-by-entry. No bypass lane, including for Richard's own prose.

---

## 7 · Security & privacy

Governing sentence (THREATMODEL.md v1, week 1): **"The existence, name, dates, and destination of a trip are secrets."** The posture is true at the center and false at the edges; the overhaul finishes the boundary. Priorities strictly by harm-per-day (security seat's own ranking, which puts metadata above cryptography).

**Tier 1 — the metadata bypass (week 1, no architecture):**
- Purge plaintext trip registry from public JS ("Liu's Angeles," a named family's empty-house dates June 20–24, cities, blurbs) — the crypto protects the itinerary while the wrapper gives away the headline.
- Squash public git histories: reservation order W7Y-VSD-LP5Z in a commit message, all historical ciphertexts, the 45MB pack. Deploy script enforces content-free commit messages.
- Rotate the LA key (human-phrase ciphertext is permanently attackable in history otherwise); per-trip salts via packer flag — the shared salt (a deliberate weakening papering over the single IDB key-slot bug) dies with the slot bug it excused.
- Strip the hardcoded Gmail; kill the mailto path.
- Rewrite the two false privacy sentences (§4.5) — brand-fatal if left to be discovered.

**Tier 2 — transport (week 1–2):** sealed HPKE-to-composer Worker (§5.1). The most intimate data in the product currently rides plaintext email; this is the most important absent control. Zero-knowledge to infrastructure; composer is a *disclosed trusted reader*: "Your planner can read your trip. Strangers cannot."

**Tier 3 — envelope v2 (September, R6):**
- Random 256-bit per-trip content key in the invite fragment; never sent to any server; stripped and PIN-re-wrapped locally. Removes human memory from the entropy path entirely — the root fix for the dictionary-attack class, stronger than any KDF upgrade.
- Passphrase demoted to generated-diceware fallback wrap under **Argon2id** (hash-wasm in a Web Worker; 64MiB/t=3, 19MiB fallback; PBKDF2-600k is the FIPS-only floor and GPU-weak).
- Per-trip IDB key slots (the non-extractable-CryptoKey fast path is the *strongest* part of current UX crypto — kept, corrected to per-trip; the briefing's "PIN re-wrap in localStorage" description was wrong and the seat's correction is noted).
- AES-GCM AAD binds `{tripId, edition}` so ciphertext swaps fail loudly. v1 reader retained forever (keepsakes must open in 2031).
- Trip registry moves inside the boundary as per-trip `atlas-entry.enc`; before unlock the shell knows nothing and says nothing.

**Tier 4 — boundary hygiene (with the origin move):**
- **On-origin PMTiles is a privacy feature ranked above Argon2id** (security seat): cross-origin Esri/AWS tile fetches currently leak live approximate location and the itinerary's attention pattern to third parties *during the trip*. On-origin tiles end it and enable a strict CSP with `connect-src 'self'` — zero-third-party-JS becomes an enforced policy instead of an accident of restraint.
- Unified at-rest boundary: everything the traveler enters encrypts under the trip content key (ends the split where allergies get device-key theater while identity/packing/inbox sit plaintext); legacy `tl.*` migrates then clears; **"Forget this device"** deletes all keys and state.
- Pack-time leak lint (constraint labels, medical vocabulary, new origins) as a build failure.

**Standing policy (proportionality rulings, adopted):** PIN is a courtesy curtain, not a boundary; no accounts, no ratchets, no sync-by-default; revocation = re-key + re-invite; no Geolocation API — a "you are here" dot, if ever, computes strictly on-device; person/constraint statements in trip graphs age-encrypted at rest on the composer's machine too, not just the PKG; a scripted **"forget me"** path (PKG scrub, graph scrub, recompose, delete sealed drops) makes privacy a verb; PKG promotion is consent-gated per edge; future pkpass files ship *inside* the encrypted bundle via blob URL, never hosted plaintext.

**Kept absences (the strongest controls):** zero third-party JS, zero telemetry, zero API keys in the client, no accounts, no server state a traveler depends on. Machine-enforced from here on.

---

## 8 · Sequenced roadmap

Budget honesty (operator, binding): naive council sum = 90–110 solo-dev days; realistically available before Durham ≈ 50–55. The plan fits because of R1 (source push saves ~2 weeks) and §8.4 (do-not-build saves ~20 days). Durham departs **October 16**; code freeze **October 3**.

### 8.1 Week 1 (July 2–9) — custody, safety, transport, evidence

| Day | Work |
|---|---|
| 1 | Push laptop source repo to private GitHub; diff fresh build vs. deployed bundles. Move `excursed/` scaffold out of the public repo. |
| 1–2 | Security triage: history squash ×3 repos, LA key rotation (diceware + per-trip salt), purge registry/Gmail/debug CSS, content-free-commit rule, THREATMODEL.md v1, rewrite the two false privacy sentences, remove "checked against locals," remove the theatrical Hand-off button, fix cross-wired Durham entry. |
| 2–3 | In-place SW rescue: new stamped SWR worker bytes to excurse-app-site (un-freezes installed clients); prefix-scoped cache deletion to all three; verify on a real installed iPhone. |
| 3–4 | Sealed transport: HPKE client sealing + ~50-line write-only Worker → R2; `excursed pull` decryption verb. The mailto dies. The core loop has a pipe. |
| 4–5 | **User evidence (R9):** LA-family debrief (what was actually used, offline, mid-trip); two non-author adults through interview v2, observed. Findings memo circulated before any interview code is written. |
| 5 | Begin corpus harvest: first 15 units from the LA guide extracted and annotated. |

### 8.2 Month 1 (July) — foundation + the loop, ugly

- **Weeks 2–3, foundation fortnight:** monorepo structure around the pushed source; CI with golden E2E (behavior-locked against deployed app) + airplane-mode merge gate; excurse.app on Workers+R2; canonical generated SW with atomic precache swap; LA guide live at `/t/{slug}/` as tenant #1; unit tests over the midnight/DST, wallet-matching, loose-end bugs, then fixes.
- **Weeks 3–5, close the loop ugly (CLI-as-Studio):** ETG Phase-1 store (statements + 8 node types, Zod, event-sourced over episodes); extractor with checkpointed calls and the validator-enforced provenance contract; question scorer v1 (static impact classes) re-sequencing the *existing* v2 question bank to 7–9 turns, + the budget-lean question; research agenda derivation + fact ledger with the T0 validator; compose passes 1–2 (flat plan, skeleton); verifier checkers 1–4 (hours, diet, walking, LEAVE-BY) + manual-checklist calibration run against the shipped LA guide.
- **Editorial in parallel (zero code, highest leverage):** calibration corpus to 25–40 units with slop twins; Editorial Bible v1; Ten Paper Rules; register law.
- **Milestone (~Aug 8):** a real Durham traveler completes Round 1 on their phone; sealed episodes land; extraction produces a statement file Richard can read as galley prose; one planner's letter goes out. *Contact with reality before the tooling is polished, not after.*

### 8.3 Quarter 1 (through October) — harden, compose Durham, freeze

- **August:** compose passes 3–4 (per-day prose w/ cite-or-cut, derivations); verifier checkers 5–7 + tension coverage + leak scan + 20-seeded-violation gate; Gates 1–2; local hot-reload preview on pre-encryption JSON + throwaway preview slugs (the anti-4AM loop); token build script + matrix collapse (Drift/typestyles die, 4 palettes contrast-fixed); PMTiles pipeline + OPFS download + paper day-map style + colophon.
- **September:** envelope v2 complete (fragment invites, per-trip slots, Argon2id fallback, AAD, atlas-entry.enc, unified at-rest boundary, Forget-this-device); CSP + pack-time lints; Durham invites reissued as fragment links; **Durham composed exclusively through the pipeline** — flat-plan gate ~Sep 8, first full edition ~Sep 19, run the R2 graph-vs-transcript falsification test and the R5 plan-delta check during this composition; synthetic canary trip + CI unlock cron + ntfy alerts; refresh crons (T-72h/T-24h) rehearsed against a preview slug.
- **October 1–3:** final read (touchpoint #2), scorecard heat-map, on-device airplane-mode rehearsal in the actual travel party's hands. **Code freeze Oct 3.**
- **Oct 3–16:** content-only — editorial passes, refresh runs, canary watch. Three production deploys: initial, T-72h, T-24h.
- **Post-Durham (late Oct–Dec):** afterglow wired (3-question peak-end interview, timeboxed); `distill` + consent-gated PKG promotion; corpus fed with Durham (before, after) pairs; retrospective → decide Gate-3 judge, EVPI v2, push nudges from the do-not-build list on *evidence earned*, per the standing rule: **no proposal graduates from paper to code until its cheapest falsification test has been run and survived** (skeptic, adopted as council law).

### 8.4 The do-NOT-build list (binding through Durham)

1. Bundle reconstruction from beautified JS (unless the Day-1 diff fails).
2. Full generated design-token pipeline beyond the ~200-line validator script (matrix is shrunk instead).
3. `.pkpass` / Apple Developer cert lifecycle (the wallet already renders QR).
4. Push notifications / Declarative Web Push (first candidate post-Durham; must fail soft).
5. Gate-3 rubric judge and eval harness (before two real trips exist).
6. CRDTs, sync, Automerge/Yjs, shared editing (itinerary is single-author; traveler state is per-user; encrypted LWW blobs later if ever).
7. Multi-tenant / atelier-network scaffolding, billing, accounts (build for an atelier of one).
8. Live-chat interviewer or any client-side LLM.
9. Further Day-Trek investment (scope-frozen; only PMTiles gets map budget, because it serves the offline promise).
10. EVPI v2 slate-divergence scorer (until the plan-delta test shows v1 wastes questions).
11. Taste/rhythm ETG node types in code (until the graph-vs-transcript test is won — schema stays on paper).
12. App Clips, native anything.
13. New visual skins, palettes, or typestyles.
14. Afterglow before Durham ships (transport for it exists; the mode waits its timebox).

---

## 9 · Open questions for the owner

**Decisions needed in week 1:**
1. **Source custody:** does the private source repo on your laptop build to (approximately) the deployed bundles? Push it Day 1 — everything else sequences off this. If pieces are missing, which?
2. **Passphrase rotation:** rotating the LA key breaks the family's existing unlock. Are you comfortable re-inviting them (a one-line message with the new phrase or, later, a fragment link), and is there anyone else holding the current passphrase?
3. **Domain + infra:** confirm `excurse.app` (or choose the name — this also decides whether the Glide/TL naming debt gets one final migration) and a Cloudflare account under which email. Budget ceiling stands at <$100/yr fixed + ~$30/trip LLM.
4. **Frontier provider(s):** which vendor(s) may see *pseudonymized* interview content under zero-retention terms? This gets written into THREATMODEL.md and the rewritten privacy copy — your name is on the promise.
5. **LA-family debrief consent:** may we run the 20-minute debrief and mine the LA trip (guide text, interview transcripts) as the calibration corpus and test fixtures? It contains your family's data; the corpus lives in the private repo only.

**Decisions needed by August:**
6. **Durham travelers and the interview:** who is the party, and will they actually do a 7–9-turn phone interview plus one letter? If not, Durham's interview falls back to you as proxy — which changes what the pipeline can prove.
7. **The flat-plan gate as your job description:** the blueprint holds you to two touchpoints and *removes* you from line-editing logistics, fallback drafting, and refresh runs. Is that a contract you'll keep, or should touchpoint scope be renegotiated now rather than violated in September?
8. **Hedge-budget sign-off:** ≤2 hedged assertions per day, verify-or-cut for everything else, no "verified" stamp without a scheduled re-check. This will sometimes cut stops you love. Confirm the trade.
9. **Keepsake policy for the old repos:** freeze la-fieldguide/durm-guide with patched SWs and a pointer card (recommended), or archive them entirely once export bundles exist?

**Direction needed by year-end (no code depends on these yet):**
10. **The ambition:** is stage 2 (paying strangers, $150–600/trip, gift wedge) a real intention that should shape 2027 planning, or is Excurse a permanent gift to people you love? Both are honorable; they diverge at liability (allergy language, insurance), at the Gate-3 judge, and at whether the Editorial Bible must teach a voice that isn't yours.
11. **The correspondence cadence:** one planner's letter with ≤3 follow-ups is the ruling. If travelers turn out to *enjoy* the interview (the LA debrief will hint), do you want a longer-form optional "second sitting" as a designed object, or does quiet win even when the traveler is chatty?
12. **What does afterglow keep?** The post-trip mode will hold photos-adjacent memory prose and the peak question. Decide how much of the trip's *actual history* (edits, weather, what was skipped) the keepsake should honestly record — the diary question is an editorial stance, not a technical one.

---

*Filed by the synthesis chair. Papers 01–17 govern where this document is silent; this document governs where they conflict.*
