# Excurse Overhaul Council — Red-Team Skeptic Position Paper

**Seat:** Red-Team Skeptic
**Date:** 2026-07-02
**Inputs read:** 01-app-anatomy, 02-evolution, 03-design, 04-engineering, 05-interview-science, 06-knowledge-graphs, 07-landscape, 08-localfirst, 09-editorial, and council papers 10–15.

---

## 0. Posture

My job is to be the only person in this room who is paid to notice that **the council has produced roughly 300,000 words of planning for a product with four users, all of whom share a last name.** Everything below follows from taking that fact seriously rather than politely ignoring it.

I will attack the current app where it deserves it (it does, in three specific places), attack the overhaul where it deserves it (nearly everywhere), and end with the shortest path that honors the owner's actual ask — which, read carefully, is a request for *depth and first principles*, not a request for *volume of construction*.

---

## 1. The steelman: Excurse is already close to right, and this overhaul smells like procrastination

Let me make the strongest case for doing almost nothing, because nobody else on this council has, and if this case can't be beaten point-by-point, the overhaul shouldn't happen.

**1.1 The product already worked, end to end, under real conditions.** In June a real family took a real trip to Los Angeles carrying a hand-composed, encrypted, offline field guide with a QR wallet that admitted them to the Huntington. Fifty deploys in eleven days — including 4 AM ones — is not evidence of a broken pipeline; it is evidence of a *live editorial loop that kept up with a trip in progress*. No competitor described in the landscape report has ever delivered that artifact to anyone. The thing every council paper calls "the missing factory" produced the only output anyone has praised.

**1.2 The famous "broken core loop" is a one-day bug, not a mandate.** Yes, "Hand off to research & compose" sets a boolean and discards the frame-draft. That is genuinely broken — the drafts are encrypted under a device key on the traveler's phone and the composer literally cannot read them. But the fix is a transport, and the *minimum viable transport* is a share-sheet export of a JSON blob, or a 50-line Worker that accepts sealed POSTs. Estimating this at "Phase 1, July, monorepo first" is how a one-day bug becomes a one-month project.

**1.3 The quality came from the human, and the overhaul proposes to dilute the human.** The LA guide was good because Richard — a person with taste, who knows his family — composed it, with AI as a drafting assistant. Every council paper implicitly assumes the pipeline will preserve that quality while automating the composition. There is no evidence for this and considerable evidence against it (the editorial report's own catalog of AI-travel slop and hallucinated canyons). The verifier can check opening hours. Nothing in the seven checkers or three gates checks *soul*, except the owner's final read — which is the entire current quality system, working fine.

**1.4 The user research sample is zero.** Nine rapporteur reports, six council seats, and not one sentence of evidence about what the LA travelers actually thought. Did anyone open the trek map offline? Did anyone use the timeshift scrubber? Did the interview delight or annoy? Did the Now view's LEAVE BY save a single departure? The whole overhaul is justified by code archaeology and literature review. The cheapest research available to this project — asking four family members five questions about a trip they took two weeks ago — has not been done. That should embarrass us.

**1.5 The next deadline does not require any of this.** Durham is October 16–19, a family trip to a city the family knows ("Back in Durm"). Richard could compose it by hand, with the current tools, in a weekend or two. The overhaul is not on the critical path of any real commitment. That is precisely the condition under which solo developers rebuild their tooling instead of using it — the most respectable form of procrastination there is, and I say that with sympathy, because the tooling *is* fun to design. The council papers read like they were fun to write.

**1.6 The council's unanimity is itself a red flag.** Six seats, one shared briefing, and every seat endorses the interview→graph→research→verify→compose pipeline with amendments at the margins. That is not six independent confirmations; it is one thesis echoing through six prompts. The only genuinely adversarial pressure this plan has faced is this paper.

If the council cannot answer 1.3 and 1.4 concretely, the correct decision is: fix the three real bugs, ship Durham by hand, and revisit in November.

---

## 2. What is actually broken (the short list, in honesty)

The steelman above is strong but not airtight. Three clusters of findings are real, severe, and cheap to fix — and I want them fixed regardless of what happens to the grand plan:

1. **Safety-relevant privacy leaks, live today.** The plaintext trip registry in public JS (family name, cities, *future travel dates* — a burglary-relevant disclosure), the Huntington order number in a public commit message, the gmail mailto, git history retaining all past ciphertexts, and a shared PBKDF2 salt across all trips with lowercased passphrases and publicly downloadable ciphertext. This is the one place where the current app betrays its own thesis ("private by construction") and it needs fixing this week, in place, with no architecture.
2. **The frozen flagship service worker.** Static cache name + cache-first index.html means installed users are pinned to June 21 forever, and every app's activate step nukes sibling trips' caches on the shared origin. Both are fixable *in the shipped repos*: one corrected sw.js (any byte change un-freezes installed clients) with a stamped cache, SWR shell, and prefix-scoped deletion. Days, not phases.
3. **No source of truth.** The compiled-artifacts-only situation means the product dies with the laptop and cannot be audited. Recovering the source into a private repo with the deploy script and a lockfile is custody work, not overhaul work. (Note the trap hidden here, though — see §3.1.)

Everything else in the CRITICAL/HIGH lists — Argon2id, envelope v2, fragment invites, PMTiles, one-origin migration, pkpass, push — is an *improvement*, not a *break*, and improvements must earn their place under §4's tests.

---

## 3. Failure modes of the overhaul, named precisely

### 3.1 The rewrite trap, disguised as "recovery"

The architect's paper says "recover and refactor, don't rewrite" — a sentiment I'd applaud except that **there is no source code**. "Recovery" means reconstructing a working codebase from a 7,210-line beautified minified bundle (2,500 lines of which is the cinematic trek map, with a label-placement cost optimizer and a jank classifier). That *is* a rewrite, wearing archaeology's clothes. Beautified Preact+signals output does not refactor back into maintainable source; names are gone, module boundaries are gone, and the golden-E2E lock the architect proposes will verify the happy path while a hundred small behaviors (viewport scar tissue, iOS quirks, the `«` sentinel, the ct-diff hot-swap) silently regress. The honest framing is: **the traveler shell is a rewrite whether we like it or not, so it must be scoped like one** — which means it does NOT happen concurrently with a new crypto envelope, a new origin, a new map stack, and a new AI pipeline in a single summer.

Two mitigations, if the council insists: (a) keep shipping the *existing compiled bundle* as the production shell for Durham while the rewrite proceeds with no deadline pressure; (b) rewrite in strict feature-parity slices with the beautified bundle as the executable spec, trek map last (or honestly: consider whether 2,500 lines of cinematic globe tour is load-bearing at all — see §4.8).

### 3.2 Ontology astronautics

Twelve-to-fourteen node types, ~25 relations, six provenance classes, confidence scores, bi-temporal four-timestamp edges, invalidate-never-delete, an EVPI-lite question scorer, event-sourced episodes with graph-as-cache. For a corpus that currently consists of **at most a dozen interview transcripts, ever**.

The tell is buried in the interview-science report itself: the Stanford result the council keeps citing shows that a *raw two-hour narrative transcript* lets an LLM model a person at 85% of their own test-retest reliability. That result argues **against** the graph as a personalization mechanism, not for it: the transcript IS the densest user model, and modern context windows hold every interview this product will conduct for years, verbatim, simultaneously. The graph adds value in exactly one place — **deterministic verification** (a checker cannot grep a story for "gluten-free"; it needs a structured constraint) — and that requires perhaps three node types (constraint, place, slot) and one edge shape, not fourteen.

The maintenance question nobody answered: who tends this garden? Bi-temporal invalidation is a *discipline*, not a data structure; every stale `validTo`, every unresolved contradiction, every wrongly-inferred taste edge is now a bug in a second codebase that only one person can read. Knowledge graphs in solo projects die the same death as wikis: enthusiastically populated in month one, silently rotting by month four, quietly bypassed ("I'll just paste the transcript") by month six — at which point the pipeline's provenance guarantees are theater. Prediction, falsifiable: if the full 12-node ETG ships, by the second post-Durham trip Richard will be composing from transcripts and hand-editing the guide JSON, and the graph will be a decorative intermediate artifact.

Build the **constraint ledger** (hard constraints + places + verifiable claims, with sources). Defer the taste/rhythm/disposition ontology until the blind test in §4.2 says the transcript isn't enough.

### 3.3 Interview theater

The current v2 interview is beautiful and has been completed by approximately one person, its author's family. Twelve questions in four titled "movements" with an animated evidence ledger sits exactly at the boundary where the science report says completion craters (65% at 4–8 questions, 42% at 15+). Now the council proposes *more* apparatus: letter rounds, follow-up EVPI-gated probes, afterglow interviews, separate interviews for every family member including children. Picture the actual invitee: a grandmother, or a brother-in-law who was promised "you don't have to do anything." He opens a link and is asked to narrate a formative travel memory in a dark navy "dream mode" with a serif narrator voice telling him "a story tells me more than a checklist ever could." There is a real chance he finds this precious, or creepy, or simply long — and no chance we currently know which, because **no non-author adult has ever been observed taking this interview**.

The subtler theater: "I never plan from a guess — only from what you confirm here" is a promise the pipeline structurally cannot keep (research, defaults, and archetype seeds are all guesses) and shouldn't make. Epistemic honesty in the UI is the product's best idea; epistemic *overclaiming* in the copy is its most dangerous one.

Cheap fix: cap the invitee interview at 4 turns (the science report's own number), make the primary interview 7–9 with the existing script, and run §4.3's live test before building any scorer.

### 3.4 Confidently-wrong research at scale (the stamped-hallucination problem)

The editorial pipeline's tier system (model memory = T0, never a source) correctly kills the *hallucinated landmark* class. It does not kill — and partially worsens — the *confidently stale citation* class. T1 "primary sources" for restaurant hours are routinely wrong: websites lag reality, Google hours are crowd-noise, and the venues most worth visiting (Herb Lester's whole thesis) are exactly the flaky ones. A "verified as of July 9" stamp on hours that changed July 20 is *more* dangerous than an honest hedge, because the entire visual language of the product (solid borders, green confirmed, receipts) teaches the traveler to stop double-checking. The plan's own answer — phone-call verification tasks — will not happen; a solo developer will not call seventeen venues per trip, and we should stop pretending otherwise in specs.

Required countermeasures, cheaper than the pipeline: volatility-class hedging *in the prose voice* ("locks up whenever the surf is good — call first" is both true and more charming than a stamp), the T-72h refresh treated as the *primary* verification event rather than a bonus, and a standing rule that any fact the verifier cannot re-check within 72h of use ships with the amber chip, not the green one.

### 3.5 Second-system effect, already visible in the fossil record

This codebase's own history warns us: afterglow mode styled-but-never-wired since June 14, a budget theme with no question, the Drift skin, interview v1→v2 in seven hours, four naming eras of unmigrated storage keys. Design has *always* outrun shipping here. The council proposal — five organs, ten CLI verbs, three editorial gates, two graphs, a Studio, push notifications, pkpass — is that same tendency granted a company's vocabulary. The failure mode is not that none of it gets built; it's that **all of it gets half-built**, and Durham ships at 4 AM on October 15 through the old path anyway, now with a half-migrated crypto envelope in between.

### 3.6 Migration self-harm

Moving to `excurse.app` on Workers/R2 abandons installed PWAs and localStorage on the old origin — every checkmark, outfit, and visited mark the LA family created. The council answers "freeze la/durm as keepsakes," which is right, but notice what it concedes: the shiny one-origin benefits accrue only to *future* trips, while the *actual bugs* (cache nuking, frozen SW) are fixable on the existing origin in days. New-origin migration is therefore a convenience purchase, not a repair, and should be priced as one. Similarly, per-trip repos were universally condemned by the rapporteurs, but the model has unlisted virtues: blast-radius isolation, the git history as the trip's edit diary, the trip as a self-contained keepsake that can never be broken by someone else's deploy. The actual sin was one shared *origin* plus overzealous cache deletion — fixable without abandoning the model.

### 3.7 Business cosplay

The landscape report's $150–600/trip atelier arithmetic is well-researched and entirely beside the point. There is no evidence anyone outside the family wants this; taking money to compose trips for strangers converts "my brother-in-law's allergy" into *product liability for a stranger's anaphylaxis* under an artifact that says "verified"; and the empty-quadrant argument cuts both ways (quadrants are sometimes empty because nobody can make money standing in them — Journy died there). Nothing about pricing should influence a single architectural decision this year, and to the architect's credit, paper 11 says the same. I flag it so it stays said.

---

## 4. Proposal-by-proposal: the cheapest falsifying test

The council should adopt a standing rule: **no proposal graduates from paper to code until its falsification test has been run and survived.** Here is the test for each major proposal, most expensive proposal first.

| # | Council proposal | Cheapest falsifying test | Kill condition |
|---|---|---|---|
| 4.1 | **Full ETG knowledge graph (12–14 node types, bi-temporal)** | Take the Durham interview transcripts. Compose one day-draft from the *raw transcripts pasted into the composer prompt* and one from a *hand-built graph serialization* of the same content. Richard blind-picks, twice. Half a day. | Transcript version wins or ties → build only the constraint ledger; the taste/rhythm ontology is dead. |
| 4.2 | **EVPI-lite next-question scorer** | Run the existing static 12-question script on 3 mock travelers; for each answer, ask "did this change the plan?" (the plan-delta test the science report itself proposes). One afternoon. | If ≥9 of 12 static questions pass plan-delta anyway, the scorer buys nothing yet — enforce a hard question cap instead. |
| 4.3 | **Interview v3 apparatus (letters, movements, ledger)** | Have TWO non-author adults (one invitee-tier, one primary-tier) take the *current* v2 interview, timed, then ask three questions: how long did it feel, what would you cut, did anything feel like the app was performing at you? One evening. | Either participant bails or calls it long/precious → cut to 7–9 primary / 4 invitee before any new machinery. |
| 4.4 | **Seven deterministic verifiers** | Retro-run the checkers *as a manual checklist* against the shipped LA guide — data that exists today. Count true violations vs false alarms. One day. | Precision below ~70% → gates will be waived into noise; redesign checks before coding them. (Conversely: any true violation found in LA is the single best pro-overhaul evidence available — the council should want this number.) |
| 4.5 | **LLM editor-judge (anchored rubric, different lineage)** | Judge 20 existing LA entries; compare verdicts against Richard's own accept/edit/reject. One day. | Agreement < 80% (the literature's own bar) → the judge is decoration; keep slop-lint (deterministic, free) and the human read. |
| 4.6 | **Envelope v2 + Argon2id + fragment-key invites** | Threat-check, not code: rotate to a 4-word diceware passphrase and per-trip salt under the *current* v1 envelope (a packer flag). Estimate offline-attack cost. One hour of arithmetic. | If diceware+PBKDF2-600k already prices out the realistic adversary (it does — ~10^15 guesses at 270ms-class cost), envelope v2 is UX work (zero-typing invites), not security work, and should be scheduled as UX. |
| 4.7 | **PMTiles + OPFS offline maps (10–60MB per trip)** | First: ask the LA family if anyone opened the trek map in airplane mode (the SVG sketch fallback exists and may have quietly sufficed). Then hand-build ONE Durham extract and side-load it on one iPhone over hotel-grade wifi. Two days. | Nobody used maps offline, or the OPFS download fails/annoys on a real family phone → ship the sketch fallback as the offline answer; PMTiles becomes a someday. |
| 4.8 | **Rewriting the 2,500-line cinematic trek map** | Same family question, plus: show two travelers the cinematic tour vs a static editorial map with the route drawn. Which do they *reopen*? | If the cinema is watched once and never again, feature-parity rewrite of it is the single largest waste in the plan; replace with the static map + sketch. |
| 4.9 | **One-origin migration to excurse.app / Workers+R2** | Ship the corrected sw.js + prefix-scoped cache deletion to the *existing* origin first. Wait one week. | If updates now propagate and trips stop clobbering each other, migration is deferred convenience — do it when the traveler shell rewrite (§3.1) ships anyway, not before Durham. |
| 4.10 | **Declarative Web Push LEAVE-BY nudges** | Ask each family member: "would you tap Allow Notifications for a website?" Then test one scheduled push on Richard's own phone. One hour. | Any hesitation → the feature contradicts "asks nothing of the traveler"; LEAVE BY stays in-app. |
| 4.11 | **Sealed-transport Worker dropbox** | Try the dumbest transport first: interview completion offers the iOS share sheet with an encrypted blob addressed to the composer. One day. | If share-sheet delivery works for a family-scale product, the Worker is an upgrade, not a prerequisite — build it when a non-family traveler exists. |
| 4.12 | **Calibration corpus + Editorial Bible** | None needed. This is the one proposal that is cheap, human, compounding, and useful even if every other proposal dies. Do it first. | — |

---

## 5. What must survive — including things the council wants to kill

The obvious keeps (voice and copy registers; paper design tokens and epistemic visual language; WebCrypto envelope discipline — non-extractable keys, no telemetry, no third-party JS; the derived single-source wallet; offline-first posture; the `«` sentinel; interview v2's bones and its story-first instinct) are well covered by other seats. I add three unfashionable ones:

1. **The manual composition path, permanently.** Not as a bridge to be "retired when the pipeline beats it" (architect §Phase 3) but as the *product's definition of quality*, forever available. The pipeline is an assistant to Richard's read, never a replacement for it. Retirement language should be struck from the plan.
2. **The trip-as-keepsake deploy model.** Whatever the hosting substrate becomes, a trip must remain a self-contained frozen artifact that no future deploy, migration, or shell upgrade can break. la-fieldguide working untouched in 2031 is a feature the one-origin design must reproduce, not an embarrassment to migrate away from.
3. **Smallness as a property.** 48KB gzipped shell, zero accounts, zero server state, a product that fits in one person's head. Every council proposal should be taxed against this budget explicitly.

---

## 6. The shortest path that honors the ask

The owner asked for first-principles depth and gave full liberty. Liberty includes the liberty to conclude that the right overhaul is small, sequenced by evidence, and mostly about *closing the loop and keeping custody* — not building the cathedral. Concretely:

**Week 1 — Repairs, in place, no architecture (≈5 days).**
Corrected flagship sw.js (stamped cache, SWR, prefix-scoped deletion) + same prefix-scoping patch to la/durm. Strip the mailto and the plaintext registry details from the bundle; move trip metadata behind the veil. Squash/purge public git histories; rotate the LA passphrase to diceware; per-trip salts in the packer. Remove the dead Durham→LA ciphertext wiring and the handoff button that pretends. Recover source into a private repo with lockfile, deploy script, and one golden E2E — custody, not rewrite.

**Week 2 — Close the loop with the dumbest transport that works (≈3 days).**
Interview answers actually reach the composer (share-sheet sealed blob first; 50-line Worker only if the share sheet fails the family test). Run tests 4.3 (two real adults take the interview) and 4.7/4.8 (ask the LA family what they actually used). This is the entire "broken core loop" fixed, plus the project's first user research, inside two weeks.

**July–August — The manual pipeline, instrumented (evenings-scale).**
Author the calibration corpus and Editorial Bible from LA's best entries (4.12 — highest ROI in the whole plan). Compose Durham *by hand, with AI assistance, through the existing tools* — but keep the transcript, keep a flat JSONL fact ledger with sources and tiers, and run the seven checks as a printed checklist (4.4). Every automation candidate must first exist as a manual step that demonstrably caught a real error on Durham. Run the graph-vs-transcript blind test (4.1) on Durham's own material.

**September — Automate only what hurt.**
Whichever manual steps consumed real hours or caught real errors get code, gated by their §4 tests. My prediction of what survives: the constraint ledger + hours/diet/LEAVE-BY checkers, slop-lint, the T-72h refresh, and the transport. My prediction of what dies or defers: the full ETG, the EVPI scorer, the judge, push, pkpass, PMTiles, the origin migration.

**October — Durham ships.** By hand if necessary, proudly. The pipeline shadows; it does not gate. Post-trip: the afterglow conversation with the family *is* the next research input, and the November review decides — with Durham's evidence — whether the traveler-shell rewrite and the deeper pipeline are earned.

Total new construction before Durham: roughly three weeks of work, not three months. Everything the council designed remains on the shelf, improved by having testable kill conditions attached. If the tests keep passing, build it all with my blessing — the plan is thoughtful. But the burden of proof sits with the cathedral, not with the working chapel.

---

## 7. Closing

The most dangerous sentence in the briefing is "Do not feel constrained by anything already done," because the thing already done is the only part of this project that has ever touched a user and worked. The spirit of Excurse — a quiet, hand-made guide for named people, that asks nothing — is currently protected by exactly one mechanism: one person with taste reads every word before it ships. The overhaul's job is to give that person custody of his source, a working inbox, a fact checklist, and honest copy — and to prove, one falsification test at a time, that anything grander deserves to exist.

*— Red-Team Skeptic seat*
