# EXCURSE — OVERHAUL BLUEPRINT (B)
## Synthesis Chair's ruling document · July 2, 2026

Prepared from the rapporteur briefing and eight council position papers:
app-anatomy (01), evolution (02), design (03), engineering (04), interview-science (05),
knowledge-graphs (06), landscape (07), local-first tech (08), editorial craft (09),
and council seats CEO (10), Architect (11), Design (12), AI (13), Editorial (14),
Security (15), Operator (16), Skeptic (17).

Governing bias, per charter: **maximum leverage per solo-maintainer hour; protect what
already works.** The hard constraint that shapes every ruling below: Richard has roughly
**50–55 focused solo-dev days** between now and the Durham departure on **October 16, 2026**
(Operator's count, unchallenged by any seat). The council's summed asks are 90–110 days.
This document is where the cuts happen.

---

## CHAIR'S RULINGS — where seats disagreed, and how it was decided

These rulings govern everything below. Each names the disagreement and the decision.

**R1 — Source recovery.** Architect budgeted 2–3 weeks to reconstruct the shell from the
beautified bundle; Operator proved (sw.js comments referencing `scripts/deploy.sh`) that a
private source repo exists on Richard's laptop; Skeptic called reconstruction a rewrite trap.
**Ruling: Operator wins.** Day one: push the laptop repo to private GitHub, build it, diff the
output against the deployed bundles. Only if the diff fails does any reconstruction work get
scheduled — and then only for the specific divergent files. This single correction frees ~2 weeks.

**R2 — Knowledge graph scope.** KG seat and AI seat specified the full ~14-node bi-temporal
ETG; Skeptic argued the Stanford result cuts the other way (the raw transcript is the densest
user model) and demanded a falsification test, conceding only a constraint ledger.
**Ruling: split the graph by its consumer.** Build now, as code: (a) **episodes as canonical
events** (append-only transcript/paste/observation store — cheap, and it's insurance either way);
(b) the **constraint-and-fact spine**: traveler, party, constraint, place, booking, claim —
the node types a *deterministic verifier* consumes. These are justified independent of any
composition-quality claim. The taste/rhythm/theme ontology is built **only after** the Skeptic's
test runs on Durham: compose one day from raw transcript in-prompt vs. one from a hand-built
graph serialization, blind pick. Because episodes are canonical and the graph is a projection
(AI seat's event-sourcing amendment), deferring the ontology costs nothing — it can be derived
retroactively from the same episodes. The statement schema (provenance, confidence, bi-temporal,
quotes) is adopted in full from day one, because the verifier and the honesty program need it
regardless of ontology size.

**R3 — Single origin vs. fix-in-place.** Architect/Local-first/Security want one origin at
`/t/{slug}/` now; Skeptic says the two SW bugs are fixable in days on the existing origin and
per-trip repos have unweighed virtues (keepsake, blast-radius isolation).
**Ruling: both, sequenced.** Week 1 fixes the shipped SWs *in place* (stamped caches, SWR,
prefix-scoped deletion) because installed users are frozen **today** and any migration must not
strand them. The single origin (`excurse.app`, Workers + R2, trips as encrypted data) is built in
August **for Durham onward**. Finished trips are never migrated: `la-fieldguide` is patched,
then frozen forever as a keepsake at its URL — the Skeptic's "still working untouched in 2031"
property becomes explicit policy, reproduced for future trips via a per-trip export/archive.

**R4 — Envelope v2 timing.** Security wanted fragment-key invites early; Operator scheduled
September; Skeptic deferred everything but salts past Durham.
**Ruling: two-stage.** Week 1, via a packer flag only: per-trip random salts + generated
diceware passphrases + rotate the LA key + purge public git history (this prices out the
realistic ciphertext attacker under the existing v1 envelope — Skeptic and Security agree on
this floor). Envelope v2 proper (random 256-bit content key in the invite URL fragment,
Argon2id fallback wrap, per-trip IDB key slots, AAD binding `{tripId, edition}`) ships in
September so Durham invitations are zero-typing links. v1 reader retained forever.

**R5 — Interview machinery.** Interview-science and KG seats specified an EVPI scorer; AI seat
showed EVPI-as-specified isn't computable (impact needs a plan that doesn't exist yet) and
proposed static impact classes; Skeptic said cap the existing script and defer all scoring.
**Ruling: AI seat's v1.** The question policy is a **deterministic static-impact scorer**
(SAFETY ∞ / SKELETON 8 / SELECTION 4 / TEXTURE 2 × uncertainty × answerability − rising
askCost) over the *existing, human-written* v2 question bank, with a hard budget: 7–9 turns
primary, ~4 invitee, safety questions never skippable and always read back. The
slate-divergence EVPI v2 is built only if a plan-delta test on three mock travelers shows the
static policy wastes questions. Every sentence the traveler reads stays human-written (Design
seat's rule); the machinery only chooses *which* authored question, and *when to stop*.

**R6 — Design industrialization.** Design seat wanted a generated contrast-validated token
pipeline; Operator called it automation for an audience of one and said shrink the matrix.
**Ruling: shrink, then lint.** Kill Drift, kill the two alternate typestyles, cut to ~4
palettes (hand-fix their faint inks to ≥4.5:1 using the dark palettes' proof that quiet
survives contrast). Then add a **~100-line build-time contrast check** that fails CI if any
text token in any surviving palette drops below 4.5:1 — the Design seat's hard gate at the
Operator's price. The full pipeline is do-not-build for 2026.

**R7 — Editorial gates.** Editorial seat specified three gates; Operator and Skeptic called the
Gate-3 rubric judge premature before two real trips exist.
**Ruling: Gates 1–2 in code, Richard is Gate 3.** Deterministic slop/structure/provenance lint
(Gate 1) and the claim re-extraction fact gate + verbatim quote re-fetch + adversarial allergen
sweep (Gate 2) ship for Durham. The anchored CoT judge is built only after the calibration
corpus has at least two trips' worth of (before, after) pairs in it. The manual final read is
**permanent** — see R10.

**R8 — "Verified as of" stamps.** Editorial wants stamps rendered through the receipts UI;
Skeptic warns stamped hallucination is worse than honest hedging because it trains travelers to
stop double-checking.
**Ruling: stamps are earned, not sprayed.** A fact may render a "checked Tuesday" receipt
**only if** it is T1-sourced **and** re-verified inside its volatility window (stable: once;
medium: T-72h; volatile: T-24h). Anything volatile that can't be re-checked renders as hedged
in-voice prose ("locks up whenever the surf is good — call first") or is rewritten to its
fallback. The Editorial seat's hedge budget (≤2 hedged assertions per day) prevents the
opposite failure. The T-72h/T-24h refresh — riding the existing SWR path on `trip-data.enc` —
is the **primary verification event** of every trip. The shipped string
"Verified — findings checked against locals" is deleted in week 1 until it is literally true.

**R9 — pkpass, push nudges, CRDTs, multi-tenancy.** Local-first seat researched them well;
Operator and Skeptic cut them. **Ruling: all four on the do-not-build list for 2026.**
Declarative Web Push is the first candidate to graduate in 2027 (fail-soft, compose-time
payloads); pkpass waits for a second family who asks; CRDTs wait for a co-editing need that
does not exist; multi-tenancy waits for a second composer.

**R10 — "Retire the manual path."** Architect said retire it when the pipeline wins on the
scorecard; Skeptic said never — the human read *is* the quality system.
**Ruling: Skeptic wins, permanently.** The pipeline's job is to make Richard's read cheaper and
better-informed (scorecard as heat-map), never to replace it. Nothing ships to a traveler that
Richard has not read. This is written into the product thesis, not just the roadmap.

**R11 — User evidence.** Only the Skeptic noticed nobody has asked the LA family anything.
**Ruling: adopted as a week-2 gate.** Before the interview engine gets a line of new code:
(a) debrief the four LA travelers — what did they open, what did they ignore, did the offline
promise hold, what did they screenshot anyway; (b) two non-author adults take the current v2
interview while Richard watches silently. Findings can re-rank the whole Q1 backlog. Standing
rule adopted from the Skeptic: **no proposal graduates from paper to code until its cheapest
falsification test has run and survived.**

**R12 — The false privacy sentences.** No disagreement — every seat flagged it.
"Nothing you said is sent to an outside AI" and "No raw answers leave the device" are rewritten
in week 1 to the true, still-differentiated claim (sealed to the planner's desk; see §7),
backed by THREATMODEL.md and zero-retention API terms. A trust product may never animate a
promise it cannot keep — the same rule deletes the theatrical "Hand off" button until the
transport behind it exists (which is also week 1).

**R13 — Business path.** CEO wants the $150–600 invite-only atelier proven on ten trips;
Skeptic calls it cosplay and flags allergy liability under a "verified" stamp.
**Ruling: defer monetization entirely in 2026.** The 2026 goal is the loop, proven on Durham
plus 2–3 *gifted* trips for people Richard knows (the gift is also the landscape seat's wedge).
No stranger's money, and therefore no stranger's allergies, until (a) the loop has survived
three real trips and (b) the liability question (open question Q7, §9) has a real answer.
Never commission revenue — that ruling from the landscape research is permanent.

---

# 1 · PRODUCT THESIS & SPIRIT — one page

**Excurse is a private atelier that composes a verified, beautiful, offline field guide for
named travelers. It interviews you like a friend, researches like a fact-checker, writes like
an editor — and then asks nothing of you.**

**What it is.** Not an app you plan trips *in*; an artifact composed *for* you. Each trip is a
finished, self-contained, encrypted object — a field guide that knows your name, your child's
nap, your flight time, and your lean — delivered as a link from someone who loves you, opening
into a quiet paper document that works in airplane mode and never asks for an account, a
rating, or your attention. The landscape research located this precisely: on the axes
inventory↔person and tool↔artifact, the person-driven finished artifact quadrant is **empty**.
Every funded competitor is a conversational booking funnel structurally biased toward sellable
inventory; every editorial guide is beautiful but doesn't know anyone's name. Excurse is
"Wildsam, if Wildsam knew your name and your flight time."

**Why it can't be copied.** Three locks, one structural. *Taste*: the voice, the paper design
system, the epistemic UI (hunch/pattern/confirmed, dashed provisionality, receipts) express one
original idea — plans are made of knowledge with uncertainty, and the guide should say so.
*Intimacy*: client-side encryption, zero telemetry, no accounts are what make it *ethical* to
ask about allergies, a young child, mobility, and what a family is celebrating — no
commission-funded incumbent can ask those questions without it being surveillance.
*Craft with verification*: composed prose firewalled to a cited fact ledger, deterministically
checked against the travelers' own constraints, refreshed at T-72h and T-24h — the thing print
guides structurally couldn't do and AI planners demonstrably don't do (TravelPlanner: 0.6–4.4%
unaided constraint satisfaction). The structural lock: incumbents cannot follow without
abandoning commission revenue.

**The spirit, stated so it can be defended.** Quiet is the product. The traveler is never
asked to manage anything; empty states are rewards ("Every loose end is tied. Enjoy the
quiet."); the machinery never appears on stage; the planner speaks first-person, present tense,
without exclamation marks, and never apologizes or mentions a model. Privacy is a posture, not
a feature bullet. Offline is free forever. Every trip remains a keepsake — a sealed object at a
permanent URL that will still open in 2031.

**What the overhaul is.** Not a pivot — the second half of the founding. The traveler-facing
half is the best-crafted trip UI anyone ships; the composer-facing half is a boolean, a
mailto, and Richard's chat history. The overhaul builds the **studio**: interview → episodes →
graph → research → verify → compose → read → encrypt → deploy, as a real pipeline with exactly
two human touchpoints — and repairs the places where the shipped edges contradict the center
(the frozen service worker, the cache wars, the plaintext trip registry announcing an empty
house, the shared salt, the promises the code can't keep).

**What it is not, permanently.** Not a chat product. Not a booking funnel. Not self-serve. Not
telemetered. Not commission-funded. The composer's read is never retired; the pipeline assists
taste, it does not simulate it.

**The 2026 acceptance test.** "Back in Durm," October 16–19, composed end-to-end through the
new studio — a real traveler through the correspondence interview by early August, the flat
plan approved on one screen, verification gates green, three production deploys (initial,
T-72h, T-24h) instead of fifty, and a family in Durham holding a guide that is true.

---

# 2 · THE TRAVELER EXPERIENCE, END TO END

The traveler's arc has five acts. Almost everything here already exists and is **kept**; the
overhaul's changes are marked ▸.

**Act 0 — The invitation.** A message from someone you love: *"I made you something for
Durham."* One link. ▸ The link carries a random content key in its URL fragment (`#k=…`,
Excalidraw pattern — the fragment never reaches any server). Tap → the guide opens → you're
invited to set a 4-digit PIN for next time. **No passphrase to type, ever** (v2, September).
Until then: the passphrase screen ("the Veil"), unchanged, with a generated diceware phrase.
Before unlock, the shell knows nothing and says nothing — ▸ the trip registry moves inside the
crypto boundary (per-trip `atlas-entry.enc`), so the public page is a frond and a sentence.

**Act 1 — First open (the anticipation act).** The splash: *Composed for the Lius · October
2026*, narrator serif, the frond. The interview, if you're the primary traveler: 7–9 questions
in the four movements (The bones / The reason / Your taste / The shape), one question per
screen, a listening beat before each — reflection first, question a breath later. Story-first
("A story tells me more than a checklist ever could"), leans late ("Either is fine. I just want
your lean."), safety asked plainly and read back in confirmed green, everything else skippable.
The ledger — "What I'm hearing," hunch ○ / pattern ◐ / confirmed ● — is the only payoff
surface; no plan previews mid-interview (Design seat's anchoring rule). Closing: a full-screen
narrator-voice summary you confirm. ▸ Invitees get ~4 questions, honoring "you don't have to do
anything." ▸ Answers are **sealed and sent** — the flywheel screen ("research & compose") is
finally telling the truth. ▸ New honest promise on the consent screen: *"Your answers travel
sealed — only your planner can open them. They're never used to train anything."*
▸ Round 2, days later, arrives as a **planner's letter** — at most three follow-up questions in
an epistolary register, not a chat. Round 3 is the draft itself: decision_point blocks
("your call") are how the guide keeps asking.

**Act 2 — The guide arrives.** A quiet note: *"Durham is ready."* The same link now opens the
composed field guide. Tabs unchanged: **Now / Days / Wallet / Prep / You.** Days carry their
theses ("Golden Hour"); blocks keep their species (anchor / planned / decision fork / backup
"in your pocket" / freeform); `why_this_for_you` reads as service, never label — *"the corn
tortillas are safe,"* not "GF options for Maya." ▸ Every commitment in the guide is now backed
by the fact ledger: receipts show dated whispers ("checked Tuesday") only when earned (R8);
single-source facts keep their amber "Call ahead" chips; ≤2 hedged assertions per day, in
voice. ▸ The final evening and departure morning are composed with marquee-day investment —
the guide no longer dies at a flight record (peak-end rule, Editorial seat).

**Act 3 — On the ground.** The Now view, kept whole: tz-aware current/next/meanwhile,
per-viewer participation, LEAVE BY = start − travel − 10, the countdown ring, the timeshift
scrubber, "Nothing scheduled, exactly as planned." ▸ With a correctness contract: the
midnight/DST wrap bug fixed and pinned by golden tests — one wrong LEAVE BY and the ring is
decoration forever. Wallet: the card fan, QR passes, the §-sectioned lodging card — all still
derived solely from block confirmations. ▸ Offline becomes whole: the day map is a new **paper
map** — PMTiles trip extract (10–60MB) downloaded into OPFS on first unlock with a progress
whisper, styled entirely in trip tokens, a dozen labels in guide voice ("the good bench,"
"last bathroom before the trail"). The cinematic satellite trek is kept as-shipped,
scope-frozen, as the online set-piece; its SVG fallback is promoted from apology to
"field sketch." ▸ Silent T-72h/T-24h refreshes ride the existing ct-diff hot-swap: the guide a
traveler opens Thursday morning was re-verified Wednesday night, wordlessly. ▸ Inbox saves
(TikTok/Maps pastes) go through the same sealed transport — the mailto dies. Mid-trip, the
worst failure mode of any server is a *slightly stale* guide, never a broken one: after first
unlock, no server is needed at all.

**Act 4 — Afterglow (new, small).** The week after return, the guide turns past-tense — the
styled-since-June afterglow mode finally wired. One skippable question in the planner's voice
(*"What's the moment you'll still be telling people about in a year?"*) — the peak-end signal
that makes the *next* trip start warm. Then the trip settles into a keepsake: sealed at its
URL, permanent. ▸ Timeboxed post-Durham (Operator); the diary rendering can follow in 2027.

**What the traveler never sees:** a graph, a score, a gate, a pipeline, a model name, a
notification other than (someday) LEAVE BY, a request to rate anything. The Design seat's
**Quiet Test** stands as a permanent office of No: every future traveler-facing proposal must
document what it asks of the traveler, its interruption treaty, its machinery visibility, and
whether it would survive being printed.

---

# 3 · THE COMPOSER (RICHARD) EXPERIENCE, END TO END

Today: interview answers marooned in localStorage, composition in a chat window, 50 hand
deploys in 11 days including 4 AM pushes — content iteration in production because there was no
local preview. Target: **a trip costs ~4 hours of Richard's attention and 3 deploys**, with his
taste applied at exactly the two points where it has maximum leverage.

**The Studio is a CLI, and git diff is the review UI** (Architect + Operator, unopposed). No
daemon, no database, no orchestration framework. One private monorepo; each trip is a
directory:

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

**The verbs** (`excursed <verb>`, each a pure, re-runnable stage over that directory):

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
pack        # encrypt (v2 envelope), pkpass-less wallet, redaction sentinel, bundle lint
deploy      # push edition to /t/{slug}/ via CI; stamps SW manifest
refresh     # T-72h/T-24h: re-verify volatile ledger facts → patch → pack → deploy
distill     # post-trip: propose durable edges to Traveler PKG, per-edge approval
```

**Exactly two human gates**, per the Editorial seat's amendment (which the chair adopts over
the CEO's thesis-only version):

- **Gate 1 — the flat plan** (~20 minutes): one screen with the trip thesis, day theses, and
  the full slate — every candidate stop as name + one-line why + which taste/constraint it
  serves — approved *before* research spend. Taste at maximum leverage, before sunk cost.
- **Gate 2 — the final read** (timeboxed, ~90 minutes): the composed guide in the local
  preview, with the verifier/lint scorecard rendered as a heat-map so his attention lands on
  the weak days first. Every edit he makes is captured as a (before, after) pair feeding the
  calibration corpus. **This gate is permanent** (R10).

Everywhere else — logistics verification, fallback drafting, line-editing to the banlists,
refresh runs, deploys — the machinery runs and Richard stays out of the way.

**Three separated iteration loops** (Operator), so 50-deploys-in-11-days never recurs:
shell changes deploy via CI (rare); trip composition runs through the verbs; content tweaks
iterate in the **local preview** against pre-encryption JSON, with throwaway preview slugs when
a phone check is needed. Target per trip: **three** production deploys — initial, T-72h, T-24h.

**Live-trip operations without telemetry** (Operator, adopted whole): a permanent synthetic
canary trip that scheduled CI unlocks end-to-end every 6 hours during live-trip windows;
`wrangler tail` on the drop Worker; ntfy/email alerts to Richard's phone; the refresh cron
doubling as QA. A Safari update that breaks unlock is discovered by the operator, not the
family. Fixed costs stay under ~$100/yr (domain + Cloudflare free tier); marginal LLM cost
~$20–50/trip with composer and judge on different model lineages.

**Correspondence, not chat** (AI seat, unopposed): Round 1 is the local deterministic
instrument (no client-side LLM, works offline); Round 2 is at most one planner's letter with
≤3 policy-gated follow-ups through the sealed transport; Round 3 is decision_points in the
draft. All adaptive intelligence runs at the desk. This preserves privacy, the epistolary calm,
and the honest promise.

---

# 4 · THE AI CORE — schemas and policies

Five machines on one data spine. The spine first.

## 4.1 Episodes are canonical; the graph is a projection

Every interview turn, planner's letter, inbox paste, mid-trip observation, and afterglow answer
is an **append-only episode**:

```jsonc
// episodes/2026-07-14-interview-r1.jsonl (one per line)
{ "id": "ep_0412", "kind": "interview_turn",     // letter | inbox_paste | observation | afterglow
  "traveler": "tv_maya", "trip": "durham-2026-10",
  "at": "2026-07-14T19:22:04-04:00",
  "prompt_id": "q_taste_story_v2",               // which authored question
  "content": { "text": "...verbatim answer..." },
  "transport": "sealed_drop:r2/ab12…" }
```

The graph is **rebuildable by re-running extraction over episodes** — insurance against
extraction bugs and a free upgrade path as models improve (AI seat). This is also what makes
ruling R2 cheap: ontology deferred is not ontology lost.

## 4.2 The Excurse Trip Graph (ETG) — plain JSONL, owned code, no graph DB

Per the KG seat, with the AI seat's three amendments and the R2 scope cut. `nodes.jsonl` +
`statements.jsonl` per trip; Zod schemas; in-memory indexes; ~500–800 lines owned; git history
is the version history. **Node types now** (verifier-consumed spine): `traveler, party, trip,
day, slot, place, booking, constraint, claim, episode, tension`. **Deferred behind the R2
test:** `taste, rhythm, theme` (episodes retain the raw signal meanwhile; composition quotes
the transcript directly). Evicted from the graph into `agenda/` workflow files: `question`,
`researchTask` (AI seat's amendment — they're work items, not knowledge).

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
  "supersedes": null }           // contradictions invalidate+supersede, never delete
```

**Hard invariants, enforced by a validator, not a prompt** (AI seat):
- `stated` requires a verbatim `quote`.
- `constraint` statements may **only** be `stated` (never inferred) — hard constraints are
  always asked, read back verbatim, and the interview cannot end without them
  (interview-science, unanimous).
- Archetype defaults enter as explicit `assumed` edges — asked about if consequential, hedged
  around in composition if not.
- Ladders (attribute→consequence→value), when the extractor finds them, are stored whole;
  values transfer across trips, attributes don't.
- `tension` is first-class (rest-vs-adventure): composition must **honor** tensions, never
  resolve them (Motivational Interviewing finding).
- World facts (hours, GF menus) are the same statement shape with `provenance: researched` and
  `validTo` staleness — one schema for interview truth and researched truth.

**Two graphs, one schema:** the per-trip graph (in the trip directory), and the persistent,
encrypted **Traveler PKG** that never deploys and never leaves the composer's machine.
`distill` promotes trip learnings to the PKG only with **per-edge owner approval** and recency
decay. Medical and child data never ship anywhere; the encrypted `trip-data.enc` contains
only the compiled guide. Identity anchors on places: OSM id + Wikidata QID + Google Place ID.

## 4.3 The interview engine

**The instrument is authored; the policy is code.** The v2 question bank — four movements,
chips/scale/pair/story kinds, Oil/Tar tiers, safety ×3 weighting — is kept and trimmed, every
string human-written and versioned in the Editorial Bible ("Either is fine. I just want your
lean." survives character-for-character).

**Question policy (deterministic v1, per R5):**

```
score(q) = impact(q) × uncertainty(q) × answerability(q) − askCost(n, researchable)
  impact:      SAFETY ∞ · SKELETON 8 · SELECTION 4 · TEXTURE 2   (static classes)
  uncertainty: 1 − max confidence of statements q would produce
  answerability: can this traveler answer it well? (story > attribute for novices)
  askCost:     rises with question count; rises further if the answer is researchable
               (specification uncertainty → ask; model uncertainty → research/default)
stop when: no candidate scores above threshold, OR budget hit (7–9 primary / 4 invitee)
never stop while: any SAFETY slot is empty
```

This makes "a few quiet questions" an *enforced property* and doubles as the assumption ledger:
whatever wasn't asked is visible as `assumed` edges the composer must hedge. Sequencing:
episodic story first (densest signal — Stanford result), silent laddering, policy-gated
follow-ups, leans late, constraints sweep framed as care, MI-style closing summary read back.
Ask-vs-infer is an explicit gate, not emergent LLM behavior (LLMs under-ask unprompted).

**Extraction contract:** two-pass. Structured answers (chips/scales/pairs) write statements
locally, deterministically — no NLP, works offline. Whole-transcript extraction (stories,
letters) runs at the desk: one ontology-guided structured-output call per episode batch, must
label provenance and cite turn IDs, output rejected by the validator on any invariant breach.
Checkpointed so re-runs are cheap.

**Groups:** each traveler interviewed separately (organizers misreport their own family
dynamics; children have real influence). Aggregation policy: constraints by least-misery veto;
shared meals average-without-misery; day themes by fairness rotation with visible attribution
("Thursday is Maya's").

## 4.4 The research pipeline

**Agenda derived mechanically from graph gaps** — seven rules (KG + AI seats):
1. Every place touching a hard constraint → verification task requiring a **T1 citation**
   (serious allergies: primary sources; may spawn a phone-call task — which, per the Skeptic,
   must be *scheduled into Richard's Gate-1 session*, not left to a fictional agent).
2. Every dated slot → hours verified for the actual dates.
3. Every transition → routing researched; LEAVE BY computed, plus parking/bathrooms/the view
   en route — connective tissue is a first-class researched content class (36 Hours lesson).
4. Unserved tastes → discovery tasks (post-R2-test; until then, from transcript directly).
5. Every `assumed` edge that survived the interview → hedging note for the composer.
6. Volatility classes → the T-72h/T-24h refresh schedule.
7. Soul budget: at most one named human quote + "the two things worth knowing" per major stop.

**Fixed per-stop-type research forms** (restaurant / museum / hike / shop / transition), filled
or marked **UNFOUND** — never invented. Results land in the **fact ledger**:

```jsonc
{ "id": "fc_2201", "place": "pl_mateo_gf_bakery",
  "claim": "dedicated gluten-free kitchen; no shared fryer",
  "sources": [{ "url": "…", "tier": "T1", "fetched": "2026-09-28" }],
  "tier": "T1",                  // T1 primary · T2 edited press · T3 crowd · T0 model memory
  "confidence": 0.95,
  "volatility": "medium",        // stable | medium | volatile → recheck schedule
  "last_checked": "2026-09-28" }
```

**The T0 rule, absolute:** model memory may generate hypotheses and search queries; it may
**never** populate a ledger field. A ~20-line validator enforces it. This single rule kills the
documented hallucinated-landmark failure class (fake Peru canyon, Japan stranding, invented
Christmas market).

## 4.5 The composer

Four firewalled passes (AI seat), with the Editorial seat's format discipline:

1. **Thesis + slate** → Gate 1 (the flat plan, §3).
2. **Skeleton**: day themes + block sequence, taste-rotated across days (PinnerSage: people are
   multi-interest clusters — rotate, never average). **The skeleton is verified before any
   prose is written** — cheap to fix a day-shape, expensive to fix 650 words.
3. **Prose**, per-day, from a scoped serialization of that day's subgraph + ledger facts +
   transcript quotes (GraphRAG-lite). **Cite-or-cut**: every factual sentence carries a sidecar
   pointing at ledger claims; a sentence that can't cite is cut. Two formats, two specs
   (Editorial): *day plan* = committed choreography, ≤650 words, 3–7 stops + 2–4
   trigger-bound fallbacks; *pocket guide* = browsable miniatures, 40–80 words each. The
   why-sentence anatomy is lintable: non-obvious checkable fact + sensory/temporal particular +
   actionable judgment + optional interview hook, ≤35 words, passes the entity-swap test.
4. **Stamps & degradation**: verified-as-of receipts derived (earned per R8), `«` sentinel for
   anything unfilled, epistemic contract mapped one-to-one onto the shipped UI —
   stated/researched ⇒ solid commit · inferred ⇒ disclosed ("I'm guessing you'd rather…") ·
   assumed ⇒ dashed hedge · single-source ⇒ amber "Call ahead."

## 4.6 The verifier — the brand, in code

Deterministic TypeScript checkers, run after every compose pass and every refresh; violations
are written back as statements and **literally generate "Loose ends"** — so "Every loose end is
tied. Enjoy the quiet." becomes a sentence the system can only emit when provably true.

1. Open-hours vs. actual slot times · 2. Diet/allergen coverage at every food block ·
3. Walking/energy budget vs. stated limits and energy_arc · 4. LEAVE-BY feasibility from
routing · 5. Child meal/nap cadence · 6. Booking coherence (wallet ↔ blocks ↔ dates) ·
7. Freshness (no volatile fact past its window) — plus the AI seat's two extras: tension/
fairness coverage across days, and a **pack-time leak scan** that fails the build if constraint
labels or medical vocabulary appear in the bundle outside sanctioned fields.

**Calibration duties before trust** (Skeptic, adopted): the seven checks run first as a manual
printed checklist against the already-shipped LA guide. Any true violation found is the best
pro-overhaul evidence available; precision below ~70% means thresholds get fixed before the
gates can block anything (waived gates decay into noise). Release-blocking eval: 20 seeded
violations, 100% catch. An adversarial allergen red-team pass is release-blocking for any trip
with a serious allergy.

**Editorial gates** (per R7): Gate 1 lint — dual banlists (travel clichés: nestled/bustling/
hidden-gem…; AI tells: delve/"isn't just X—it's Y"/rule-of-three/symmetric hedging), word
budgets, register tags (every generated string declares narrator/service/data), hedge count
≤2/day, last-block-isn't-a-bare-flight-record check. Gate 2 fact — claims re-extracted from
composed prose and matched against the ledger (catches parametric-memory smuggling,
VeriScore-style); named-human quotes re-fetched and string-matched verbatim (an LLM-mutated
quote from a living person is category-worse than a wrong hour — no verifiable source, the day
ships without a quote; one per day is a **cap**, not a quota). Gate 3 = Richard, permanently.

---

# 5 · TARGET TECHNICAL ARCHITECTURE & MIGRATION — never breaking a live trip

## 5.1 Target state (end of Q1)

```
PRIVATE monorepo (GitHub) ──CI──▶ excurse.app (Cloudflare Workers static assets + R2)
  packages/shell        (Preact+signals shell — recovered source, kept)
  packages/excursed     (pipeline CLI — moved OUT of the public repo immediately)
  packages/schemas      (Zod: authoring schema from We(), ETG, envelope, ledger)
  packages/sw           (ONE generated service worker)
  trips/<id>/           (episodes/graph/ledger/plan/guide/editions — never public)

excurse.app/
  /                       frond + one sentence (knows nothing before unlock)
  /t/{128-bit-slug}/      atlas-entry.enc + trip-data.enc + assets
  /t/{slug}/tiles.pmtiles PMTiles trip extract (10–60MB, range requests → OPFS)
  /drop                   ~50-line write-only Worker → R2 (sealed HPKE blobs in)

richardliu5764.github.io/la-fieldguide/   FROZEN KEEPSAKE (patched once, never migrated)
richardliu5764.github.io/durm-guide/      retired after Durham ships on excurse.app
```

**Kept wholesale:** Preact + signals + no-router state machine (48KB gz, fit for purpose); the
authoring schema recovered from `We()` — formalized in Zod as the composer's structured-output
contract, not replaced; the derived wallet; the epistemic UI; the IDB non-extractable-CryptoKey
fast path (per-trip slots now); ciphertext-as-cache (local loss costs one re-download + one
unlock — exactly right for iOS eviction); zero third-party JS, zero telemetry, no accounts.

**The one canonical service worker** (spec = la/durm's design intent, generated): build-time
precache manifest; **atomic cache swap** (new cache fully populated before old dropped — closes
the offline-dead-window); prefix-scoped deletion (`excurse-{tripslug}-{stamp}` — closes the
cross-trip cache war); pass-through for `*.enc` (the app layer owns freshness — closes the
SWR-defeats-no-store bug); no unconditional skipWaiting; Playwright **airplane-mode test as a
merge gate**.

**Offline maps:** `pmtiles extract` of the trip footprint at pack time; OPFS download on first
unlock (SWs can't cache range requests — makinacorpus plugin pattern); glyphs/sprites
precached; no-basemap "field sketch" fallback for eviction. Ends both the blank-map failure
and the live location leak to Esri/AWS (§7). The satellite trek stays online-only by design.

**Runtime-server independence is a constitutional property** (Operator): once a guide is
unlocked, no server is needed. Every new component must fail soft — the drop Worker outage
queues sealed blobs client-side and retries; a refresh cron failure means a slightly stale
guide, never a broken one. Anything a traveler would miss mid-trip if a Worker dies is
rejected at design time.

## 5.2 Migration plan — live trips never break

Constraint honored throughout: **installed PWAs pinned to the old origin keep working forever.**

- **Phase 0 (week 1, in place, existing origin).** Ship new SW *bytes* to excurse-app-site —
  the byte-change itself un-freezes every installed user (their frozen SW updates on next
  online visit because the browser diffs sw.js bytes); the new worker uses stamped caches +
  SWR + prefix-scoped deletion. Patch la/durm workers' activate steps to prefix-scoped
  deletion (ends the cache wars). Remove the mailto, the plaintext trip registry, the
  cross-wired Durham entry, and the two false privacy sentences. Squash public git histories
  (reservation plaintext, historical ciphertexts, 45MB pack); re-encrypt the LA trip with a
  fresh diceware passphrase + per-trip salt and re-issue to the family. Rotate nothing else.
- **Phase 1 (August).** Stand up excurse.app; deploy the same shell there; Durham composed
  and deployed **only** to `/t/{slug}/` on the new origin. The old origin serves legacy trips
  untouched. No traveler is migrated — only new trips land on the new origin.
- **Phase 2 (September).** Envelope v2 on the new origin (fragment invites; v1 reader kept, so
  the re-issued LA passphrase still opens the keepsake). Durham invites go out as zero-typing
  fragment links.
- **Phase 3 (post-Durham).** la-fieldguide formally frozen: one final deploy stamping it as an
  archive edition, then the repo is never touched again. durm-guide retired (its trip
  re-issued as a keepsake export on the new origin if the family wants it). The keepsake
  property — "opens untouched in 2031" — is reproduced for every future trip via
  `excursed archive`, which emits a fully self-contained static bundle.

**Known-bug fix list riding Phase 0–1** (from app-anatomy, all with golden tests as they land):
midnight/DST end-wrap in Now; name-substring wallet matching → id-based; dual-source loose-end
done state unified; storage namespace default un-hardcoded from `la-2026-06`; legacy `tl.*`
keys migrated then cleared.

---

# 6 · DESIGN & EDITORIAL SYSTEM

**Doctrine (Design seat, adopted verbatim):** *quiet comes from scale, weight, spacing, and
restraint — never from gray.* And its editorial twin (Zinsser, via the Editorial seat):
*distrust any phrase that comes easily; cut every known-attribute fact.*

**The Ten Paper Rules** are codified as a written artifact cited in every design review and
every generation prompt: dashed = provisional · color = certainty (amber/red/green are
epistemic) · italic serif = the planner alone · empty states are rewards · no machinery on
stage · offline is a designed condition, not a degradation · keylines, not shadows · quiet ≠
gray · one mark (the frond), three jobs · the traveler is never asked to manage anything.

**Consolidation (per R6):**
- **Dies:** the Drift aurora-glass skin (~500 lines, foreign purple — two design languages is
  zero design languages); the editorial typestyle (body serif erases the narrator register)
  and the third typestyle; palettes beyond four survivors; the debug HUD/jank-flash CSS;
  the dead budget-theme stub; the `tl.` fossils; the literal `✓` glyph (→ drawn mark);
  sub-44px tap overrides (fitchip/le-chev/iv-back/timeshift brought to 44px+).
- **Fixed:** `--ink-faint` and friends hand-tuned to ≥4.5:1 in all surviving palettes (the
  dark palettes prove 5.6:1 quiet is achievable); `--line-strong` added under functional
  inputs; text-safe `--accent-text` variants (Golden Hour's LEAVE-BY caption must survive
  sunlight); a ~100-line build-time contrast lint fails CI below 4.5:1.
- **Kept:** the byte-identical token vocabulary (--paper/--ink/--line/--paper-deep); the
  three-voice typography (Inter system · Archivo 75% data · Source Serif 4 **italic-only**
  narrator, 135KB self-hosted); dream/field emotional temperatures; the motion grammar
  (direction-aware view transitions, the 31-point wallet spring, top-decile reduced-motion
  coverage); the platform scar tissue (--vvh, safe-areas, fs-input anti-zoom, 48px taps).
- **One licensed exception:** the daily interlude may set in Source Serif **upright** as
  framed "almanac" quoted matter — italic remains exclusively the planner's first person.
- **Print-quality program (small, phased):** designed title page ("Composed for the Lius ·
  June 2026"); receipts as dated footnote whispers; a colophon end-page that makes Esri/OSM
  attribution *beautiful* instead of 8px-at-42% (also retiring the compliance risk); afterglow
  as the keepsake fourth act, post-Durham.
- **Maps as two registers:** the new PMTiles paper day-map speaks guide voice and trip tokens;
  the satellite trek stays the frozen cinematic set-piece; its SVG fallback becomes the
  "field sketch."

**The Editorial Bible + calibration corpus — highest-ROI artifact, started week 1** (every
seat converged here; the Skeptic called it the one proposal worth doing even if everything
else dies). Per the Editorial seat's correction, it is **harvested before written**: extract
the 25–40 best units from the shipped LA guide, tagged by format, annotated why-they-work, and
give each a **slop twin** — the same facts in competent generic-AI register — so graders have
boundaries. Around this corpus: the voice charter (three registers with lint-enforced laws —
narrator/service/data, zero exclamation marks, interpunct separators, the planner never
apologizes or mentions machinery); the dual banlists; per-format entry specs with word
budgets; the personalization grammar (constraints surface as service, never labels); honesty
clauses with the hedge budget; map-label style. Richard's Gate-2 edits feed the corpus as
(before, after) pairs forever — the studio's compounding asset.

**Interview as conversation, not form** (Design seat, adopted): one question per screen, a
listening beat, movements not progress bars, the ledger as the sole payoff surface, no
mid-interview plan previews, ambivalence reflected aloud, constraints read back in confirmed
green, a full-screen narrator-serif closing summary. The graph renders as **prose with
provenance marks** ("mornings are yours ●"), editable in "You" — never as a node diagram.

---

# 7 · SECURITY & PRIVACY

**Governing sentence (THREATMODEL.md v1, week 1):** *The existence, name, dates, and
destination of a trip are secrets.* The crypto has been protecting the itinerary while the
wrapper gave away the headline — a named family, away from home, on exact future dates, in
public JS and a public commit message.

**Week-1 triage (no architecture, days of work — Security + Skeptic agree):**
squash public git histories (reservation order number W7Y-VSD-LP5Z, historical ciphertexts);
purge the Gmail mailto and the plaintext trip registry from the bundle; re-key the LA trip
(diceware + per-trip salt via a packer flag — retiring the shared salt
`O/IGickSf0woYu9XLwbgtA==` and the storage bug it papered over); content-free commit messages
enforced in the deploy script; delete "Verified — checked against locals," "Nothing you said
is sent to an outside AI," and "No raw answers leave the device"; commit THREATMODEL.md.

**The honest promise (replaces the false ones, in voice):**
*"Your answers travel sealed — only your planner can open them. He uses private tools at his
desk to research and compose, under agreements that nothing is kept or used to train anything.
Strangers can't read your trip. Neither can we — until you hand us the key."*
Backed by: zero-retention API terms; research tasks pseudonymized by construction (constraint
IDs, never children's names, cross the API boundary); providers named as a disclosed trust
boundary in THREATMODEL.md. The composer is a **trusted reader** by design — "Your planner can
read your trip. Strangers cannot." — no pretense otherwise (Security seat's proportionality
ruling, adopted).

**Sealed transport (week 1, ~2 days):** interview frames and inbox saves HPKE-encrypted
client-side to the composer's X25519 public key, POSTed to a ~50-line write-only Worker → R2.
Zero-knowledge to infrastructure; kills the mailto; fails soft (client-side queue + retry).
This is the control whose absence currently defines the product.

**Envelope v2 (September, per R4):** random 256-bit per-trip content key in the invite URL
fragment (never sent to any server; stripped via history.replaceState; re-wrapped locally
under a traveler PIN) — removing human memory from the entropy path entirely, which is the
root fix for dictionary attack against public ciphertext. Passphrase demoted to a generated-
diceware fallback wrap. Argon2id (hash-wasm in a Worker, 64MiB/t=3, 19MiB fallback) for
passphrase/PIN wraps. AES-GCM AAD binds `{tripId, edition}` so ciphertext swaps fail loudly.
Per-trip IDB key slots. Composer recovery wrap. v1 reader kept forever.

**Boundary unification:** everything the traveler enters encrypts under the trip content key
(today: allergies device-key "encrypted" with the key adjacent in the same IDB, while
identity/packing/inbox sit in plaintext localStorage). Legacy `tl.*` migrated then cleared.
A "Forget this device" action deletes all keys and state. Trip registry moves inside the
crypto boundary (`atlas-entry.enc`); slugs carry ~64–96 bits anti-enumeration entropy (the
real capability rides in the fragment).

**Privacy as engineering, not vibes:** PMTiles-on-origin ends the live location leak to
Esri/AWS and enables a strict CSP with `connect-src 'self'` — zero-third-party-JS becomes an
*enforced* policy instead of an accident of restraint. Pack-time bundle lint fails the build
on constraint labels, medical vocabulary, or any new third-party origin (the manifest
allow-list guard instinct, promoted to build time). Person/constraint statements in trip
directories are age-encrypted at rest on the composer's machine, not just the PKG. A scripted
"forget me" path: PKG scrub, graph scrub, recompose, delete sealed drops. `distill` to the PKG
is consent-shaped: per-edge approval. No Geolocation API, ever — if a "you are here" dot ever
exists, it computes strictly on-device.

**Proportionality rulings kept as policy:** PIN is a courtesy curtain, not a boundary;
revocation = re-key + re-invite; no accounts, no ratchets, no sync-by-default; smallness is a
budget every proposal is taxed against.

---

# 8 · SEQUENCED ROADMAP

Calendar: ~50–55 solo-dev days, July 2 → October 16. Code freeze **October 3** — the final
fortnight is content-only. Durham is the acceptance test for the **loop** (transport → graph
spine → research/ledger → compose → verify → Richard's read → 3 deploys), explicitly **not**
for the judge, afterglow polish, push, or pkpass.

## Week 1 (July 2–9) — custody, truth, transport  [~5 days]
1. **Push the laptop source repo to private GitHub; build; diff against deployed bundles.**
   (0.5d — highest leverage-per-effort action in the program. Fallback to targeted
   reconstruction only if the diff fails.) Move `excursed/` scaffold OUT of the public
   excurse-app-site repo into the monorepo immediately.
2. **Security triage** (§7 week-1 list): history squash, LA re-key with per-trip salt +
   diceware, registry/mailto/false-sentences purge, THREATMODEL.md, content-free commit rule.
   Delete the theatrical "Hand off" flywheel until transport is live. (~2d)
3. **SW repair in place** (§5.2 Phase 0): new bytes to excurse-app-site (stamped caches, SWR,
   atomic swap, prefix-scoped deletion); patch la/durm activate steps. One Playwright
   airplane-mode golden test. (~1.5d)
4. **Sealed transport**: HPKE client sealing + 50-line drop Worker + `excursed pull`.
   The core loop has a pipe. (~2d, overlaps)

## Weeks 2–3 (July 10–23) — evidence, foundation  [~9 days]
5. **User research (R11), before new interview code:** LA family debrief; two non-author
   adults take the v2 interview observed. Re-rank backlog on findings. (1d)
6. **Calibration corpus + Editorial Bible v1**, harvested from the LA guide with slop twins.
   Writing work, zero code, compounding forever. (2–3d, interleaves with everything)
7. **Foundation:** monorepo structure, CI, Zod schemas (authoring schema formalized from
   `We()`, ETG statement schema, envelope), golden E2E suite locking shell behavior,
   local hot-reload preview over pre-encryption JSON. (~5d)
8. **Manual verifier calibration:** the 7 checks as a printed checklist against the shipped
   LA guide; record precision; fix known time-math bugs found along the way. (1d)

## Month 1 close → Month 2 (late July – August) — close the loop ugly  [~20 days]
9. **ETG spine** (episodes store, statements.jsonl, validator, R2-scoped node types) +
   two-pass extractor with checkpointed calls. (4d)
10. **Question policy v1** (static impact classes, budgets, stop rule) over the trimmed
    authored bank; correspondence Round-2 letter flow. (3d)
11. **Research agenda + fact ledger + T0 validator + per-stop-type forms.** (4d)
12. **Composer passes 1–4 + verifier (7 checkers + leak scan) + Gates 1–2 lint/factcheck**;
    seeded-violation eval (20/20). CLI is the Studio; git diff is review. (7d)
13. **Single origin live** (excurse.app on Workers+R2, `/t/{slug}/`, generated SW,
    atlas-entry.enc). (2–3d)
14. **Milestone — ~Aug 8: a real Durham traveler completes Round 1 through the sealed
    transport and receives a planner's letter.** Contact with reality before polish.
15. **Run the R2 falsification test** on a Durham day (transcript-in-prompt vs. graph
    serialization, blind pick) → decide taste/rhythm ontology. (0.5d)

## Month 3 (September) — harden, verify, refresh  [~15 days]
16. **Envelope v2** (fragment invites, Argon2id fallback, per-trip IDB slots, AAD). Durham
    invites re-issued as zero-typing links. (3d)
17. **PMTiles paper day-map + OPFS download + field-sketch fallback**; strict CSP. (4d)
18. **Design consolidation** (kill Drift/typestyles, 4 palettes contrast-fixed, contrast
    lint, tap targets, colophon/attribution). (3d)
19. **Refresh machinery** (`excursed refresh` cron at T-72h/T-24h; volatility classes wired;
    earned receipts per R8). Synthetic canary trip + alerts. (3d)
20. **Durham composed end-to-end through the pipeline**: Gate 1 flat-plan session; research;
    compose; verify green or explicitly waived; Gate 2 final read with heat-map, edits
    captured as corpus pairs. (interleaved through September)

## October 1–16 — freeze and ship
21. **Oct 3: code freeze.** Content only: final editorial pass, refresh runs, on-device
    airplane-mode rehearsal in Durham conditions, family invites out.
22. **Trip window:** canary every 6h, `wrangler tail`, T-72h and T-24h refresh deploys.
    Three production deploys total.
23. **Post-trip:** family debrief #2; afterglow question (timeboxed build); `distill` with
    per-edge approval; la-fieldguide formally frozen as archive edition; write the
    2027 plan from evidence.

## DO-NOT-BUILD LIST (2026) — enforced, revisited only with a falsification test
- ✗ Bundle-reconstruction of the shell (source exists; R1)
- ✗ Design token *pipeline* (shrink + lint instead; R6)
- ✗ Taste/rhythm/theme ontology before the R2 blind test passes
- ✗ EVPI slate-divergence scorer v2 before the plan-delta test shows v1 wastes questions (R5)
- ✗ Gate-3 rubric judge before two trips' corpus exists (R7)
- ✗ .pkpass / Apple Developer cert (the wallet already renders QR; R9)
- ✗ Push nudges / Declarative Web Push (2027 candidate; R9)
- ✗ CRDTs, sync, presence, co-editing (LWW blobs *if* sharing ever lands; R9)
- ✗ Multi-tenant/atelier scaffolding, payments, strangers' trips (R13)
- ✗ Live-chat interviewer (correspondence model is policy, not a stopgap)
- ✗ Any further trek-map investment (scope-frozen signature piece)
- ✗ Any new runtime-server dependence that doesn't fail soft
- ✗ App Clips, native apps, Geolocation API
- ✗ Migrating finished trips off their origins (keepsakes are frozen, R3)

---

# 9 · OPEN QUESTIONS FOR THE OWNER

1. **Does the laptop source repo build clean, and does its output match the deployed
   bundles?** The entire Week-1 plan keys off R1. If the diff fails, which files diverge?
2. **Domain and identity:** is `excurse.app` (or similar) available and wanted? The single
   origin needs a name that can appear on a title page. Also: keep "Excurse," or is the
   fourth renaming still ahead? (Naming debt fossilizes — see `tl.*`.)
3. **The Durham travelers:** who exactly is invited, who is the Round-1 primary, and will one
   of them agree to be the early-August guinea pig for the correspondence interview?
4. **LA family debrief consent:** may we ask them the R11 questions, and re-issue their
   keepsake under the new key? (Their old passphrase dies in the re-key.)
5. **Trusted-reader framing:** are you comfortable being *named* in the product as the
   planner who can read sealed answers ("only your planner can open them")? The honest
   promise requires a person, not a "we."
6. **Which frontier providers, under which terms?** The rewritten promise depends on
   zero-retention agreements. Which vendors' terms are you willing to name in
   THREATMODEL.md, and is composer/judge lineage-splitting acceptable at ~$20–50/trip?
7. **Liability posture before any paid trip (2027 question, asked now):** a guide that
   states "the corn tortillas are safe" to a stranger's celiac child is a different legal
   object than one made for family. LLC? Disclaimer language in-voice? Insurance? This gates
   R13's future, not this year's work.
8. **The trek map's true value:** the LA debrief should ask specifically whether anyone
   watched the cinematic tour more than once. It is scope-frozen either way, but the answer
   prices every future "signature moment" proposal.
9. **Hours honesty:** the phone-call verification tasks for allergen-critical venues — will
   you actually make those calls in the Gate-1 session, or should the pipeline treat
   "phone-verified" as a tier that simply doesn't exist? (The Skeptic bets you won't call;
   the schema should match reality.)
10. **Afterglow's one question:** approve the wording — it is the only thing Excurse will
    ever ask a traveler after a trip, and it should be perfect:
    *"What's the moment you'll still be telling people about in a year?"*
11. **Budget, finally:** the "Money" ledger theme has shipped for two versions with no
    question behind it — composition has been silently assuming budget posture. Should the
    interview ask (one authored pair-question in movement 4), or is budget always a
    composer-known fact for invited trips?
12. **The 4 AM problem:** the roadmap assumes ~50 focused days. What does your actual
    July–October availability look like, and what in this blueprint gets cut *first* if it's
    30? (Chair's pre-answer: §8 items 17–19 slip before anything in weeks 1–3 does; the
    loop beats the polish; Durham ships through the pipeline even if the pipeline is ugly.)

---

*Filed by the Synthesis Chair. Sources: council papers 01–17 at `/home/user/undefined/` and
`/tmp/claude-0/-home-user/39e57f04-4217-524f-bfc9-7ff5893fe172/scratchpad/`. The bias held:
leverage per solo-maintainer hour, and protection of what already works — the voice, the
paper, the crypto center, the quiet.*
