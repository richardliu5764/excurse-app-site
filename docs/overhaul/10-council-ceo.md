# Excurse Overhaul Council — CEO / Product Visionary Position Paper

**Seat:** CEO / Product Visionary
**Date:** July 2026
**Inputs:** All nine rapporteur reports (01–09), read in full or in depth where they bear on strategy; the shipped artifacts themselves via the archaeology reports.

---

## 0. The verdict, stated plainly

The thesis is right. The execution is inverted.

Excurse sits in a genuinely empty quadrant — the **person-driven finished artifact** — surrounded by three crowded ones (inventory-driven booking funnels, person-neutral organizer tools, human services that deliver PDFs). The landscape research confirms what the product's own strings intuit: nobody else ships a finished, private, beautiful, offline thing made for named people, and the funded incumbents are *structurally unable* to follow us here without abandoning commission revenue. That is a real moat, and it is ours to lose.

But here is the uncomfortable truth the council must start from: **Excurse's core loop does not exist.** "Hand off to research & compose" sets a local boolean. "Plan from this" computes a frame-draft and throws it away. The inbox transports saves by `mailto:` to Richard's Gmail. The product's central promise — *a few quiet questions, then I research and compose it* — is currently a UI animation. The actual composition happens off-stage, by hand, in Richard's chat sessions, and is then hand-deployed fifty times in eleven days, sometimes at 4 AM.

Meanwhile, the last mile is gold-plated: a 2,500-line cinematic map tour with a label-placement cost optimizer and a jank classifier; two complete visual skins; seven hand-tuned palettes in light and dark; a 31-point spring curve on the wallet sheet. This is craft I admire and want to protect — but it is craft spent on the mile competitors can't even see, while the mile that *is* the product (understanding in → verified artifact out) runs on vibes, clipboard, and email.

The overhaul, in one sentence: **stop polishing the guide and build the studio that makes the guide.** Everything else in this paper is elaboration.

---

## 1. What Excurse IS (the one sentence, post-overhaul)

> **Excurse is a private atelier that composes a verified, beautiful, offline field guide for named travelers — it interviews you like a friend, researches like a fact-checker, writes like an editor, and then asks nothing of you.**

Shorter, for the front door (keep the current line — it's already right):

> *"A field guide, composed for you."*

Three words in that long sentence are load-bearing and must survive every future pivot debate:

- **Atelier**, not platform. The unit of value is one trip for specific people, made with taste. We scale craft, not seats.
- **Verified**, not generated. Every venue, hour, and route in a shipped guide traces to a ground-truth source with a "verified as of" stamp. In a market where AI planners strand couples on Japanese mountains and invent Peruvian canyons, *verification is the brand*, the way "it just works offline" is Wanderlog's most-resented paywall and our free default.
- **Asks nothing**, not engages. Every competitor maximizes engagement. Excurse's radical position is the inverse: the traveler receives a finished thing and is left alone. "Nothing scheduled, exactly as planned" is the most strategically important sentence in the product.

What Excurse is **not**, permanently: not a booking engine (no commissions, ever — it dissolves the moat), not a chatbot, not a collaborative planning canvas, not a SaaS with dashboards, not a creator platform.

---

## 2. Is the product thesis right? Yes — with one correction

The briefing and landscape research validate the four pillars: composed-not-planned, private-by-construction, offline-as-promise, editorial voice. I endorse all four without reservation. The Chase/Virtuoso data (60% of Gen Z/millennials want an advisor; $50k+ bookings +63%) says the demand for composed-for-you travel is real, growing, and *young* — and every human service under-delivers the artifact. Wildsam proves people pay $20 for a paper guide that doesn't know their name. We are a strict superset of both.

**The correction:** the thesis as currently built treats the *traveler-facing app* as the product. It is not. The product is the **composition system** — interview → traveler graph → research → verification → prose → encrypted artifact — and the app is its output format. This distinction sounds academic; it is the entire overhaul. A beautiful shell with a broken pipeline is a demo. A real pipeline with the current shell is a business. The archaeology makes this vivid: three repos, one codebase frozen at three moments, trip literals compiled into shared JS, no source of truth anywhere, and a composer (Richard) whose "tooling" is an email inbox and a deploy script that lives only on one laptop.

I also want to name the deepest asset explicitly, because it's easy to miss under the bugs: **the epistemic spine already runs through everything.** The interview grades evidence hunch/pattern/confirmed. The design system encodes provisionality in dashed borders and confidence in status colors. The guide marks single-source facts with "Call ahead" chips. The wallet derives from confirmations. This is one idea — *plans are claims with uncertainty, and the product is honest about it* — expressed independently in the interview, the CSS, and the schema. No competitor has this idea at all. The knowledge-graph overhaul is not a new direction; it is this idea finally given a data structure.

---

## 3. Scope of ambition: atelier now, service next, product maybe never

I am making a scoping decision, not listing options.

**Stage 1 — Personal atelier (now → ~10 real trips).** Excurse is Richard's instrument for composing trips for people he knows. The goal of this stage is singular: make the loop real and make it fast. Success metric: **a new trip goes from finished interview to deployed, verified, encrypted guide in under two days of wall-clock time with under four hours of Richard's attention** — versus the current mode of hand-composition plus ~50 deploys. Ten real trips through the real pipeline is worth more than any amount of market analysis.

**Stage 2 — Invite-only boutique service (after the loop is proven).** "A field guide, composed for you," N trips per month, referral-only, priced $150–600 per trip (anchored: Journy charged $25–50/travel-day for a form-based intake and a mediocre deliverable; Wildsam gets $20 for print that knows nobody; Black Tomato starts at $2,000/person). The **gift** is the wedge sub-market — a composed honeymoon/reunion/anniversary guide is a near-perfect premium gift, and the invite-link-with-key-in-fragment flow (tap → it opens → set a PIN) is literally a gift-unwrapping interaction. Stage 2 exists to answer one question: do strangers value this at craft prices? It funds itself while answering.

**Stage 3 — Product (conditional, and probably the atelier network, not self-serve).** If Stage 2 proves the loop with strangers, scale by adding vetted composers using Excurse's pipeline — Virtuoso's network shape with Wildsam's editorial bar, revenue share per guide. Self-serve compose is where slop gravity, verification cost, and support burden live; it is the *last* resort, not the roadmap. I am explicitly rejecting "raise money and race Mindtrip." Their $22M bought a booking funnel; our moat is that we don't have one.

**Kill-signals to monitor** (quarterly, honestly): ChatGPT/Gemini shipping artifact-quality offline private trip documents; an editorial brand partnering with an AI shop for personalized guides. Neither has happened; both are watchable.

---

## 4. The north-star experience — traveler

The traveler's arc, end-state:

1. **The invitation.** A link arrives from someone who loves you. You tap it. The guide opens — no passphrase to type (key in the URL fragment, per the local-first research; stripped and re-wrapped under a PIN you choose in one gesture). It feels like being handed a wrapped gift, because it is one.
2. **The interview, if you're the organizer** (or a 4-question version if you're invited): seven to nine quiet questions, under five minutes, one per screen, each one proving it heard the last. It opens with a story ("tell me about a trip you still think about"), not a checklist. It asks about the one moment you want to tell someone about. It never ends without allergies, mobility, and the child's rhythm — read back verbatim. It feels like the trip's first pleasure, because anticipation *is* part of the vacation. Then: "I research and compose it." And — this is the overhaul — that sentence becomes true.
3. **The guide.** Days with theses, not tables. LEAVE BY times computed from real routing. A wallet where the Huntington QR just scans. "Why this, for you" sentences that could not describe any other place and never name your constraints out loud (gluten-free surfaces as a great bakery, not a warning label). One quoted human voice per day. Fallbacks with triggers, in your pocket. A map that works in airplane mode over the canyon (PMTiles in OPFS — currently the treks go blank offline, which breaks our single most sacred promise).
4. **During.** The Now view, the countdown ring, the nudge. And crucially: silence when silence is right. "Nothing scheduled, exactly as planned."
5. **After.** The designed-but-never-wired **afterglow** mode finally ships, and it is one question, not a survey: *"What was the actual best hour?"* The answer feeds the durable traveler graph. **Second-trip quality is the retention engine and the moat** — the next interview is shorter because Excurse already knows you, in a graph no competitor can see because it never left the composer's custody. The guide itself remains, permanently unlockable, a keepsake.

Everything in this arc is either already built (3, 4 — genuinely excellent), designed but unwired (5), or researched with a spec ready (1, 2). Nothing here is speculative.

## 5. The north-star experience — Richard, the composer

This is the missing product. Today the composer's experience is: read a mailto email, chat with an AI somewhere, hand-edit JSON, run deploy.sh at 4 AM, fifty times. The end-state is **the Studio** — a desk-width (finally, a reason for desktop) private surface, never deployed, where the pipeline runs:

1. **Intake.** Interview transcripts arrive over a real transport (a ~50-line Worker accepting ciphertext blobs — the fragment key doubles as the envelope key; the Gmail mailto dies). Each turn becomes an episode node; one structured-output extraction pass turns turns into graph statements with provenance (stated/implied/inferred/assumed) and confidence, per the KG report's schema.
2. **The graph as workbench.** The Excurse Trip Graph — plain diffable JSONL in the trip's private repo, ~14 node types, every edge a statement with sources and bi-temporal validity. Richard sees what is known, what is assumed, and what is stale. Silent inferences are inspectable here *and* editable by the traveler in "You" — trust through transparency on both sides of the glass.
3. **Thesis gate (human touchpoint #1).** The system proposes a one-sentence trip thesis and day theses. Richard approves or rewrites before a dollar of research spend. This is where taste enters.
4. **Research runs itself.** The agenda derives mechanically from the graph: every place touching a hard constraint gets a cited verification; every dated slot gets verified hours; LEAVE BY comes from routing; serious-allergy fields demand primary sources or spawn a phone-call task. Model memory is tier-0: allowed to hypothesize, never to populate a ledger field. Results land as `researched` statements with staleness windows.
5. **Compose, then gates.** Prose is composed per-day from scoped subgraph serialization, firewalled to ledger facts, in the voice defined by the Editorial Bible and calibrated against the 20–30-entry corpus. Then three gates: deterministic slop-lint → claim re-extraction fact gate (catches parametric smuggling) → anchored rubric judge, different model lineage. Then the seven symbolic checkers (hours, diet, walking budget, LEAVE BY feasibility, meal cadence, bookings, freshness) — because the TravelPlanner result (LLM agents satisfy constraints 0.6–4.4% of the time unaided vs. up to 97% neuro-symbolically) is the single most important number in the research corpus.
6. **Final read (human touchpoint #2).** Richard reads the composed guide with the scorecard as a heat map. His edits are captured as (before, after) pairs feeding the calibration corpus — the taste asset compounds.
7. **One-command ship.** Encrypt, deploy to one origin at /t/{slug}, atomic cache swap, invite links minted. T-72h and T-24h refresh jobs re-verify volatile claims and silently redeploy — the feature print structurally couldn't have and AI planners don't bother with.

Two touchpoints of human attention per trip. That is the 10x, and it is also the Stage 2 unit economics.

---

## 6. The ONE loop that must become 10x better

**Interview → graph → research → verify → compose → encrypt → deploy → afterglow → (richer graph).**

It must go from *theatrical* (today: the handoff transmits nothing) to *two days, four hours of attention, zero unverified facts*. I will not call this "10x better" — you cannot 10x a loop that doesn't close. Call it what it is: closing the loop is the overhaul; everything else on the roadmap is either in service of this loop or on the kill list.

Corollary — the loop's data spine is the graph, and I endorse the KG report's restraint completely: JSONL + Zod + ~700 lines of owned code, git as the version history, no Neo4j, no RDF, no graphiti dependency. The graph is not a technology bet; it is the interview's memory, the research agenda's generator, the verifier's input, the composer's context, and the second-trip moat, in one structure. That's why it wins the "first principles" question the owner asked.

---

## 7. Kill list (features and postures that dilute)

1. **The handoff theater.** Ship nothing that pretends. Until transport exists, the button should not exist. Broken promises in a trust product are compounding debt.
2. **The Drift "aurora glass" skin.** ~500 lines of a borrowed design language with a foreign purple. One skin. The thesis is paper; commit.
3. **Typestyle and palette sprawl.** Three typestyles → one (the editorial typestyle that erases the serif narrator register dies first). Palettes survive only through a generated, contrast-validated token pipeline; the 2.6:1 faint inks get fixed — the dark palettes prove quiet is achievable at 5.6:1. Quiet may not mean illegible.
4. **The mailto inbox and the hardcoded Gmail.** Replaced by the ciphertext-drop Worker in the Studio plan.
5. **Repo-per-trip and the shared-origin cache wars.** One origin, one shell, trips as encrypted data files at unguessable slugs. This kills, in one stroke: the frozen-SW regression, the cross-trip cache destruction, the trip-registry-in-plaintext-JS leak, the rebuild-shell-per-trip tax, and the version skew. Keep the *keepsake* idea by offering a per-trip export/archive — the git-history-as-trip-diary sentiment is lovely; it just can't be the deployment architecture.
6. **Crypto debt as brand risk.** Shared PBKDF2 salt across all trips, normalized passphrases, reservation numbers in public commit messages, plaintext interview answers in the la build, ciphertext history in public git. Purge histories, per-trip salts, Argon2id via hash-wasm, envelope v2 with fragment-key invites. Privacy is our license to ask intimate questions; it must be true, not aspirational.
7. **Trek-map scope freeze.** It is the signature cinematic moment and it stays — but it is *done*. No further investment until the loop closes. (The exception: PMTiles offline tiles, which serve the offline promise, not the cinema.)
8. **The interview's breadth ambition.** Twelve questions in four movements was a heroic v2, but the science says 7–9 turns for the primary, ~4 for invitees, EVPI-gated, story-first, with progressive profiling doing the rest. Fewer, better questions; the graph carries the burden across trips.
9. **"Budget" theme stub and any other design-runs-ahead-of-code fossils** — either wire them or cut them; afterglow gets wired (it's the retention loop), budget gets asked properly or removed.

---

## 8. What must survive the overhaul untouched

- **The voice.** First-person, present-tense, zero exclamation marks, empty states as rewards. "Enjoy the quiet." is the brand. The Editorial Bible's job is to protect this register as generation scales, not to reinvent it.
- **The paper design system** — tokens, keylines, dashed-provisional grammar, the three-voice typography (italic-only serif as the narrator is a stroke of identity).
- **The epistemic UI**: hunch/pattern/confirmed, "Call ahead" chips, receipts, decision-point forks. This becomes the *visible surface of the fact ledger* — the overhaul makes it truer, never removes it.
- **Wallet derived from confirmations** — single-source-of-truth pattern; extend it (real .pkpass at compose time), don't replace it.
- **"Either is fine. I just want your lean."** — the best line in the interview and scientifically correct (late forced-choice for tie-breaking). Keep the whole ask-permission-to-have-an-opinion posture.
- **Client-side encryption, zero third-party JS, zero telemetry, no accounts.** The posture, hardened.
- **Offline-first as a free default.** Never a tier. Wanderlog's angriest users are our proof.
- **The Now view's philosophy** — time-aware, per-viewer, and comfortable with silence.
- **Invite-only privacy as product, not gate.** "A private itinerary, for invited travelers only" stays on the door.

---

## 9. Sequencing (CEO's cut — what I'd fund, in order)

1. **Week 1–2: Foundation triage.** Private source monorepo + CI (the bus-factor situation is an existential risk, not a chore); one origin with /t/{slug}; fix the frozen SW with atomic precache; purge public git histories. (Engineering report items; ~1 week of the local-first report's migration plan.)
2. **Weeks 2–4: Close the loop, ugly.** Ciphertext transport Worker; interview answers → graph extraction; graph → research agenda → fact ledger; compose against the existing We() schema; deploy. The first trip through the real pipeline can have a plain Studio — a CLI is acceptable. *The loop closing is the milestone, not the Studio's beauty.*
3. **Parallel, pure writing: Editorial Bible + calibration corpus.** Highest-leverage artifact in the entire program; costs no code; everything downstream consumes it.
4. **Weeks 4–8: Verification gates + PMTiles offline maps + crypto v2 + interview v3** (EVPI-gated, 7–9 turns, story-first, per the interview-science spec).
5. **Then: afterglow + durable traveler PKG + the Durham trip composed end-to-end through the new pipeline** as the acceptance test — it's already on the books for October 2026. **Back in Durm is the deadline the overhaul actually has.**

---

## 10. Closing

Richard built the artifact first and the factory never. That was the right instinct for finding the soul — nobody discovers "Enjoy the quiet" by building pipelines — and the soul is found: the voice, the paper, the epistemic honesty, the gift-shaped privacy. The archaeology proves the taste is real; the research proves the market's empty quadrant is real; the engineering review proves the current foundation cannot carry either.

So the overhaul is not a pivot. It is the second half of the founding: build the studio the guide deserves, make the verification the brand, let the graph remember, and keep asking nothing of the traveler. Ten real trips through a real loop, then let strangers pay for it.

The quiet is the product. Now build the machine that composes it.
