# Excurse Overhaul — Chief Architect / Staff Engineer Position Paper

**Seat:** Chief Architect / Staff Engineer
**Date:** 2026-07-02
**Inputs:** All nine rapporteur reports (app anatomy, evolution, design, engineering, interview science, knowledge graphs, landscape, local-first tech, editorial craft), plus direct reading of the beautified bundles and shipped repos.

---

## 0. Verdict

Excurse is a product with exceptional instincts implemented as a prototype wearing a product's clothes. The traveler-facing artifact is genuinely excellent — the calmest, most crafted trip UI I have seen shipped by anyone, solo or funded — and the client architecture (static hosting, client-side AES-GCM, offline-first SW, zero third-party JS, zero telemetry) is not just defensible but *ahead of the industry*, which has since moved toward exactly this shape. But three facts disqualify the current system from being called an architecture:

1. **There is no source of truth.** Three repos of minified build output, ~50 opaque "deploy" commits, no `src/`, no lockfile, no CI, no tests. The product exists only on one laptop. Every other decision is downstream of fixing this.
2. **The core loop is theater.** The interview — the soul of the product, the thing the owner explicitly wants built from first principles — computes a `frame-draft-v1` and throws it away. "Hand off to research & compose" flips a local boolean. The only data path from traveler to composer is a plaintext `mailto:` of the owner's Gmail. The product's central pipeline (interview → graph → research → compose → deploy) is currently a human reading a screen over someone's shoulder.
3. **The deployment topology breaks the two promises.** Three apps on one shared origin whose service workers annihilate each other's caches; a flagship SW that can never update itself; maps that are blank in airplane mode; trip names, family identity, and exact future travel dates in plaintext public JS; one PBKDF2 salt shared across every trip; a reservation order number in a public commit message. "Private" and "offline-first" are both, today, conditionally false.

The good news: almost every defect traces to a single root cause — *three divergent hand-deployed copies of one app on one origin with no source repo* — and the fix is a consolidation, not a rewrite. The traveler-facing shell should be preserved nearly wholesale. The overhaul budget belongs to the invisible half: the source monorepo, the pipeline-as-software, the transport, the crypto envelope, and the deploy/offline machinery.

One scheduling fact shapes everything: **the LA trip ended June 24 (it is now a keepsake); the Durham trip departs October 16.** There are no travelers on the road today. We have a ~14-week window in which nothing is live, and a hard, real deadline that forces the new pipeline to compose an actual trip end-to-end. Durham is the forcing function. Everything below is sequenced against it.

---

## 1. Architectural thesis

Ten decisions, stated up front. Rationale and detail follow.

| # | Decision |
|---|---|
| A1 | **One private source monorepo** (`excurse`) containing shell, pipeline, schemas, and trip content. CI builds every deployed byte from a reviewed commit. |
| A2 | **One origin, one shell, trips as data.** `excurse.app` on Cloudflare Workers static assets + R2; trips at `/t/{128-bit-slug}/` as encrypted files, never as repos or shell rebuilds. GitHub Pages repos become frozen keepsakes, then redirects. |
| A3 | **One canonical service worker**, generated per deploy: build-time precache manifest, atomic cache swap (new cache fully populated before old is dropped), prefix-scoped deletion, network-first for `*.enc`, no unconditional `skipWaiting`. |
| A4 | **Envelope v2:** random 256-bit per-trip content key; key delivered in the invite URL fragment (`#k=`, Excalidraw pattern); passphrase becomes a *fallback wrap* via Argon2id with per-trip random salt; local PIN re-wrap; per-trip key slots in IndexedDB. v1 reader retained. |
| A5 | **The pipeline becomes a CLI** (`excursed`) of pure, re-runnable stages over a per-trip directory: `interview-serve → extract → ask → research → compose → verify → edit-gate → pack → deploy`. Git diff is the review UI. |
| A6 | **The Excurse Trip Graph (ETG)** as specified by the knowledge-graphs report — plain JSONL property graph with first-class statements (provenance, confidence, bi-temporal) — is the data spine of the pipeline. Own the ~800 lines; do not adopt graphiti/Neo4j/RDF. |
| A7 | **A real transport, zero-knowledge preserved:** interview frames and inbox saves are encrypted client-side to the composer's X25519 public key (HPKE/age-style; pubkey ships in the bundle — it's public) and POSTed to a ~50-line Worker that writes ciphertext to R2. Kills the mailto. This is the single highest-leverage feature in the overhaul. |
| A8 | **Offline maps via PMTiles + OPFS:** `pmtiles extract` as a pack-stage step, background download on first unlock, existing SVG-sketch fallback retained for eviction. Cross-origin Esri/Terrarium tiles remain for the *cinematic* trek only, with an honest offline degrade. |
| A9 | **Schema as a versioned contract:** the authoring schema, runtime schema, ETG, and envelope get Zod definitions in `packages/schema`, semver'd; the packer stamps `schema_version` + `min_shell`; the shell supports current and previous major and self-heals when behind. |
| A10 | **Tests where the product can die silently:** time math, crypto round-trips, SW offline behavior, the verifier, and the adapter — property tests and Playwright-in-airplane-mode as CI gates, plus a pipeline eval harness replaying recorded interviews. |

And one meta-decision: **build for an atelier of one.** The landscape report's service path ($150–600/trip) is plausible, but nothing in this architecture should speculate on multi-tenancy. Trips-as-data + pipeline-as-CLI is exactly the shape that scales to a boutique service later *without* building accounts, dashboards, or a backend database now. The only server components permitted are dumb ciphertext relays and a push scheduler — both stateless Workers.

---

## 2. The source monorepo (A1)

```
excurse/                      # private GitHub repo — THE product
├── apps/
│   └── guide/                # traveler shell (Preact + signals; recovered then refactored)
│       ├── src/
│       └── e2e/              # Playwright: offline, unlock, update, deep-link suites
├── packages/
│   ├── schema/               # Zod: authoring schema, runtime schema, ETG statements, envelope v1/v2, atlas
│   ├── etg/                  # graph store (JSONL), extractor prompts, entity resolution,
│   │                         #   question policy (EVPI-lite), coverage model
│   ├── verify/               # the 7 deterministic checkers + time/geo math (Temporal-based)
│   ├── compose/              # research agendas, fact ledger, per-day GraphRAG-lite composer,
│   │                         #   editorial gates (slop lint, claim re-extraction, rubric judge)
│   ├── crypto/               # envelope v1/v2, argon2id worker (hash-wasm), fragment-invite,
│   │                         #   HPKE seal-to-composer
│   └── sw/                   # ONE service worker source + precache-manifest generator
├── tools/
│   └── excursed/             # the composer CLI; wraps pipeline stages; wrangler deploy
├── workers/
│   ├── dropbox/              # ~50 lines: POST ciphertext → R2 (interview frames, inbox)
│   └── nudge/                # later: Declarative Web Push scheduler (cron)
├── trips/
│   └── durham-2026-10/       # per-trip working directory (see §5.1)
├── travelers/                # persistent Traveler PKG — age-encrypted at rest (see §5.5)
├── design/
│   ├── tokens/               # generated, contrast-validated token pipeline (per design report)
│   └── calibration/          # the 20–30-entry editorial corpus (per editorial report)
└── .github/workflows/        # CI: typecheck, test, e2e-offline, build, wrangler deploy
```

**Recovering the source.** No source exists; the beautified 7,210-line bundle is fully legible (the anatomy report reconstructed the entire schema and state machine from it). The pragmatic path, in order:

1. Vendor the beautified bundle as `apps/guide/src/legacy/` and get it building under Vite + Preact with byte-*similar* output (not byte-identical — hashed names will differ).
2. Lock behavior with golden E2E tests recorded against the currently deployed app (unlock flow, Now math at fixed clock, wallet derivation from the real LA trip JSON, trek fallback).
3. Refactor modules out of `legacy/` incrementally — crypto first (it must change for v2), SW second (deleted and replaced by `packages/sw`), Now-view time math third (it must be fixed).

This is 2–3 AI-assisted weeks and it is not optional. Do not rewrite the shell from scratch: the anatomy report's "clever things" list (wallet derivation, redaction sentinel, viewport scar tissue, trek phase compiler, View Transitions choreography) is exactly the kind of accumulated correctness a rewrite loses.

**Trip plaintext in git.** Trip working directories (graphs, ledgers, drafts) live in the private monorepo — a private repo is an acceptable boundary for itinerary drafts, and diffability is the pipeline's review UI. Two exceptions: the **Traveler PKG** (`travelers/`) contains durable medical facts about named children and is age-encrypted at rest, key held outside the repo; and **passphrases/content keys** never enter git at all (a local `.secrets/` in `.gitignore`, mirrored to a password manager). `THREATMODEL.md` at the repo root states all boundaries explicitly, including the one nobody has written down: *the existence, name, dates, and destination of a trip are secrets.*

**Git hygiene for the legacy repos:** squash `la-fieldguide` history to one commit (killing the 45 MB pack, all historical ciphertexts, and commit `0c969b7`'s reservation plaintext — order number, party size, entry time), rewrite commit messages to content-free stamps, and rotate the LA passphrase since its ciphertext lineage was public.

---

## 3. Hosting, distribution, and the service worker (A2, A3)

### 3.1 Topology

- **Primary:** `excurse.app` (or similar apex) on Cloudflare Workers static assets. Shell at root; each trip is a data directory `/t/{slug}/` containing `atlas-entry.enc`, `trip-data.enc`, `trip.pmtiles`, `media/`, and later `*.pkpass`. Large blobs in R2 (zero egress). Slugs are 128-bit random; they gate *discovery* of what is already ciphertext.
- **Why Workers over staying on Pages:** header control (pkpass MIME, immutable caching, CSP as a header, noindex), first-class range requests for PMTiles, and the two Workers (dropbox, nudge) live on the same platform and deploy. GitHub Pages remains a break-glass mirror — the client stays host-agnostic.
- **The trip registry moves inside the crypto boundary.** The hardcoded atlas array is deleted. Each trip ships an `atlas-entry.enc` (name, dates, city, blurb, accent — encrypted under the same trip content key); the shell's "Your trips" view is populated from locally-unlocked trips only. Before unlock, the shell knows nothing and says nothing. This makes the anatomy report's `TripSummary` allow-list guard finally true instead of ironic. Adding a trip = uploading files; the shell never rebuilds for content.

### 3.2 One service worker, generated

The flagship SW regression (static `excurse-v1` cache, cache-first `index.html`, byte-identical across deploys → returning visitors frozen forever) and the origin-wide cache massacre are the two most dangerous shipped bugs. The replacement, in `packages/sw`, is one source file with these properties:

1. **Build-time precache manifest**: the Vite plugin emits the full hashed-asset list + shell entry points into the SW source (so the SW bytes change every deploy — the update trigger — and install populates a *complete* cache before activation).
2. **Atomic swap**: install writes to `excurse:shell:{buildstamp}`; activate deletes only caches matching `excurse:shell:*` other than its own. Trip data caches are `excurse:trip:{slug}` and are never touched by shell activation. The deploy-mid-trip brick window closes.
3. **Freshness ownership**: the SW is *pass-through* for `*.enc` — the app layer's existing IDB envelope + `ct`-diff logic is the single owner of trip freshness (resolving the M1 layered-cache fight). Shell navigations are stale-while-revalidate.
4. **No unconditional `skipWaiting`**: the waiting worker activates on next navigation, or via an in-voice prompt ("A newer edition is ready."). Kills the lazy-chunk 404 race.
5. `navigator.storage.persist()` requested after first unlock.

On the shared `richardliu5764.github.io` origin during migration, cache names get an app prefix and deletion is prefix-scoped *immediately* (Phase 0) so the three legacy apps stop burning each other's furniture.

### 3.3 Legacy URLs never break

- **la-fieldguide** (trip completed): one final deploy — fixed SW, scoped cache deletion, mailto removed, history squashed — then frozen as a keepsake. This is where the CSS's never-wired **afterglow** mode finally earns its keep: the shell detects `now > end` and renders the archive register. Later, an interstitial offers the new home.
- **durm-guide**: same freeze treatment; Durham-the-trip ships on the new origin. The flagship's cross-wired Durham entry (pointing at LA ciphertext) dies with the hardcoded atlas.
- **excurse-app-site**: the C1 freeze bug means installed users *cannot* be reached by a normal deploy — but changing `sw.js` bytes is exactly the one thing that does reach them (browsers re-fetch the SW script on navigation and compare bytes). Phase 0 ships a new SW there that rotates the cache and converts the shell to SWR. That is the whole fix, and it is urgent because every day adds more permanently-frozen visitors.

---

## 4. Crypto and privacy (A4, A7)

### 4.1 Envelope v2

```jsonc
{
  "v": 2,
  "nonce": "...",                      // fresh per encryption, always
  "ct": "...",                         // AES-256-GCM under the trip CONTENT KEY (random 256-bit)
  "wraps": [
    { "type": "fragment" },            // content key arrives via invite URL #k=..., never stored here
    { "type": "passphrase",            // fallback: diceware words printed on the invitation
      "kdf": "argon2id", "m": 65536, "t": 3, "p": 1,
      "salt": "<per-trip random>",     // NEVER shared across trips again
      "wrapped_key": "..." },
    { "type": "recovery",              // composer escrow wrap (X25519), so a lost link ≠ lost trip
      "recipient": "<composer pubkey id>", "wrapped_key": "..." }
  ],
  "schema_version": "2.0",             // authoring/runtime schema semver (see §6)
  "min_shell": "2026.09"               // shell self-heals if older
}
```

- **Invite = tap a link.** `https://excurse.app/t/durham-x7Qk…#k=<base64url>`; the shell reads the fragment, strips it via `history.replaceState`, re-wraps the content key under a locally-chosen PIN (Argon2id light profile, strike counter), and stores it in a **per-trip** IDB slot (`excurse:key:{tripId}` — the shared `tl-keys/trip` slot and its shared-salt workaround are retired together; the engineering report is right that the crypto was weakened to paper over a storage-keying bug). Fragment keys travel in iMessage/Signal fine; the threat model documents the email-weakness honestly.
- **Passphrase demoted, not deleted.** Generated 4–5-word diceware per trip (survives the existing lowercase/dash normalization by construction), printed on the invitation, wrapping the same content key. The Veil stays for people who got the words verbally.
- Argon2id via hash-wasm in a Web Worker (~200–500 ms once); WASM memory failure falls back to the 19 MiB profile. v1 (PBKDF2) reader kept for frozen keepsake trips.
- **Consistent boundary at rest:** interview drafts, identity, packing adds, and inbox queue all move under the same per-trip content-key encryption in IDB (ending the current split where allergies are encrypted but the queue naming a child's school-week saves is plaintext). Legacy plaintext `tl.plan.*` keys are migrated then cleared. A "Forget this device" action deletes keys + local state.
- **CSP** header (same-origin script only, no inline) on the new origin — the honest mitigation for "non-extractable key ≠ protected against XSS," paired with the already-true zero-third-party-JS rule.

### 4.2 The transport (the missing organ)

Design principle: *the traveler's words leave the device only as ciphertext addressed to the composer.*

- Shell bundles the composer's **X25519 public key** (public by definition; fine in plaintext JS).
- "Hand off to research & compose" now: serializes the interview episode log + frame-draft (the object currently computed and discarded), seals it HPKE-style to the composer key, `POST /drop/{tripSlug}` to the dropbox Worker, which writes the blob to R2 and returns a receipt id. Offline: queue in IDB, background retry; the flywheel UI the shell already renders becomes *true*.
- The Glide inbox uses the same channel (sealed save-items instead of `mailto:richardliu5764@gmail.com` — the hardcoded Gmail leaves the bundle entirely).
- Composer side: `excursed inbox pull` decrypts drops into `trips/{id}/episodes/` and runs the extractor. The Worker never sees plaintext; it has no auth beyond the unguessable slug + rate limiting, because the payload is sealed anyway.
- This is ~50 lines of Worker + ~150 lines of client and it converts the product from a demo into a loop. It ships in Phase 1, before any knowledge-graph sophistication, because every later stage is starved without it.

---

## 5. The pipeline as software (A5, A6)

### 5.1 Per-trip working directory

```
trips/durham-2026-10/
├── trip.yaml                 # id, slug, dates, party refs, thesis (owner-approved one-liner)
├── episodes/                 # source nodes: interview turns, inbox drops, composer notes
├── graph/
│   ├── nodes.jsonl           # ETG nodes (~14 kinds, per KG report §4)
│   └── statements.jsonl      # first-class statements: provenance/confidence/bi-temporal
├── ledger/claims.jsonl       # atomic world-claims: sources[], tier T0–T3, volatility, last_checked
├── agenda/                   # research tasks (derived, mechanical) + question queue (EVPI-scored)
├── draft/                    # composed guide JSON + prose, per-day; verifier scorecards
├── assets/                   # day images, QR payloads, pmtiles bbox spec
└── out/                      # packed artifacts: trip-data.enc, atlas-entry.enc, trip.pmtiles
```

### 5.2 Stages (each a pure, re-runnable CLI verb)

| Verb | What it does | Human in loop? |
|---|---|---|
| `excursed interview` | Serves/ingests the in-shell interview; each exchange lands as an episode via the transport | traveler |
| `excursed extract` | Ontology-guided structured-output extraction → statements with provenance + turn IDs; deterministic entity resolution; contradictions invalidate bi-temporally | no |
| `excursed ask` | Coverage model + EVPI-lite scorer emits next questions (and the stopping decision); doubles as the assumption ledger | no |
| `excursed research` | Derives the agenda mechanically (hard-constraint verification with citations, hours-for-actual-dates, LEAVE-BY from routing, taste-discovery); agents fill fixed per-stop-type forms or mark UNFOUND; results merge as `researched` statements / T-tiered claims | no |
| `excursed compose` | Thesis → themes (taste×place clustering) → skeleton → per-day scoped-subgraph prose, firewalled to ledger claims (cite-or-cut) | owner approves thesis |
| `excursed verify` | The 7 deterministic checkers (hours, diet, walking/energy, LEAVE-BY feasibility, meal cadence, bookings, freshness) write `satisfies`/`violates` statements; loop until clean or waived (waivers are statements) | no |
| `excursed edit` | Three gates: slop-lint (banlists) → claim re-extraction vs ledger (catches parametric-memory smuggling) → anchored rubric judge (different model lineage) | owner reads with scorecard heat-map |
| `excursed pack` | Compile authoring→runtime JSON, encrypt (envelope v2), `pmtiles extract` for the trip footprint, precache manifest, atlas entry | no |
| `excursed deploy` | wrangler upload + tag; `refresh --volatile` re-verifies volatile claims at T-72h/T-24h and silently redeploys | no |
| `excursed distill` | Post-trip: propose promotions from trip graph → Traveler PKG | owner approves every edge |

Design rules that keep this a solo-dev system, not an enterprise fantasy:

- **Every stage is a function of the trip directory** — no daemon, no queue, no database. `git diff trips/durham-2026-10` after any stage *is* the review.
- **LLM calls are checkpointed** (prompt + response committed alongside outputs) so runs are auditable and replayable — this is also the eval corpus (§7).
- **The graph is an instrument, not the product.** The traveler never sees it; only compiled guide JSON ships, encrypted. The one place graph metadata surfaces traveler-side is the existing epistemic UI (receipts, "Call ahead" chips, dashed provisional cards) and the "You" pane, where silent inferences must be inspectable and editable — the interview-science report is right that this is an ethical requirement, not a feature.
- **Model-memory is tier-0** (editorial report's rule): allowed to hypothesize and generate queries, never to populate a ledger field. This single rule kills the hallucinated-landmark failure class that is the existential risk for this product category.

### 5.3 What I'm deliberately not building

- No graph database, no embeddings store, no RAG infra beyond scoped subgraph serialization. At <5k statements/trip the KG report's JSONL + in-memory indexes verdict is correct.
- No orchestration framework. The pipeline is a CLI with stages; the "agent" is a loop inside a stage.
- No traveler accounts, no server-side profile. The Traveler PKG lives with the composer, encrypted; the transport is one-way sealed drops.

### 5.4 Interview budget as an architectural constraint

The interview-science numbers (completion craters past ~8 questions; target 7–9 turns primary / ~4 invitee) become *code*: the `ask` scorer's `askCost` term rises per question and the stopping rule is enforced, not aspirational. The current v2 interview's 12 questions are a ceiling, not a target — the EVPI gate should typically end earlier, and safety constraints keep their impact floor (always asked, read back verbatim, never inferred). This is the concrete meaning of "a few quiet questions."

### 5.5 Traveler PKG

`travelers/` holds one graph per household, same statement schema, age-encrypted at rest (medical facts about named children do not sit plaintext in any repo, private or not). Trips import frozen snapshots of the edges they need; `distill` promotes learnings back only with explicit owner approval. Repeat trips start warm — this is the compounding asset the landscape report identifies as the moat, and it never leaves the composer's machine.

---

## 6. Bundle format & schema versioning (A9)

The authoring schema recovered from the `We()` adapter is genuinely good — block species (anchor/planned_item/decision_point/backup/freeform), derived wallet, receipts with confidence, `why_this_for_you`, `activates_when` — and becomes the formal contract:

- `packages/schema` defines **authoring** (composer output), **runtime** (UI input), **ETG**, **envelope**, and **atlas** shapes in Zod; generated JSON Schema doubles as the LLM structured-output constraint for the composer — the same file that validates the pipeline constrains the model. One source of truth for the contract.
- Semver: additive fields = minor; meaning changes = major. The packer stamps `schema_version` and `min_shell` in the envelope's *authenticated* metadata; the shell supports current + previous major and, if a bundle demands a newer shell, forces its own SW update before rendering (closing the version-skew hole that repo-per-trip fossilized — durm still serves a June-14 shell today).
- The adapter (`We()`-descendant) remains the single seam between authoring and runtime, and gets the golden-fixture treatment: the real LA trip JSON is the regression corpus.
- Known adapter bugs fixed at the seam, with tests: midnight wrap (`end = start+60 mod 24h` breaks late-night blocks), DST handling (move all time math to `Temporal`/tz-aware interval logic), name-substring wallet matching (match on `personId`, which participation already carries), dual-source loose-end done state (single owner: viewer-local state, derived display).

---

## 7. Testing strategy (A10)

Testing effort goes where failures are silent and mid-trip, not toward coverage theater:

| Layer | Technique | Gate |
|---|---|---|
| Time math (Now, LEAVE BY, phases) | Property tests (fast-check) across midnight/DST/tz boundaries with a frozen clock; the known wrap bug becomes the first regression test | CI |
| Crypto | Round-trip vectors v1+v2, wrap/unwrap matrix (fragment/passphrase/PIN/recovery), v1→v2 migration, tampered-ct rejection | CI |
| Adapter/schema | Golden fixtures (real LA trip + synthetic edge trips); Zod validation of every pipeline artifact | CI |
| Service worker | Playwright: install → airplane mode → full app renders (Now, Days, Wallet, trek fallback); deploy-mid-session → no 404s; two trips cached → opening one leaves the other intact | CI, release-blocking |
| Verifier | Seeded-violation suite: 20 deliberately broken plans (closed venue, GF violation, infeasible LEAVE BY…) — the verifier must catch 100%; TravelPlanner-style results say this is where trust lives | CI |
| Pipeline | Eval harness replaying recorded interview transcripts → graph snapshots diffed; extraction precision spot-audits; editorial gates run against the calibration corpus (exemplars pass, rejects fail) | pre-compose |
| Design tokens | Contrast validation in the token build (fails on <4.5:1 text, per the design report's measured failures) | CI |
| Release | "Trip zero": every release candidate composes, packs, deploys-to-preview, and offline-opens one synthetic trip end-to-end | release |

---

## 8. Migration sequence (no traveler ever stranded)

**Phase 0 — Stop the bleeding (this week, in the shipped repos, no monorepo needed)**
1. New `sw.js` to excurse-app-site: stamped cache, SWR shell, prefix-scoped deletion. (Byte-change is itself the un-freezing mechanism for installed users.)
2. Prefix-scope cache deletion in la/durm SWs; remove mailto from the flagship bundle (string patch is acceptable this once).
3. Squash la-fieldguide history; content-free commit messages henceforth; rotate the LA passphrase.
4. Point the flagship's Durham atlas entry at nothing (remove it) rather than at the LA ciphertext.

**Phase 1 — Foundation (July): monorepo + transport**
Source recovery per §2 with golden E2E lock; CI; `packages/schema`; the dropbox Worker + sealed handoff/inbox (the loop closes here — even before the graph exists, interview answers finally *arrive*).

**Phase 2 — New home (August): origin + SW + crypto v2 + offline maps**
`excurse.app` on Workers/R2; canonical SW with precache + atomic swap; envelope v2 with fragment invites, per-trip salts/slots, Argon2id; storage-boundary cleanup + legacy key migration; PMTiles pack stage + OPFS download + no-basemap fallback; CSP; freeze la/durm as afterglow keepsakes.

**Phase 3 — The pipeline (September): ETG + research + verify + compose**
`excursed` verbs land in dependency order: extract → ask → research/ledger → verify → compose → edit gates → pack/deploy. Calibration corpus authored (highest-ROI human artifact). Dry-run on a synthetic trip, then **compose Durham through the pipeline exclusively** — the owner's manual path is retired only when the pipeline beats it on the verifier scorecard and his own read.

**Phase 4 — Durham hardening + delight (October 1–16)**
T-72h/T-24h volatile refresh wired; Declarative Web Push LEAVE-BY nudges (opt-in, compose-time payloads, cron Worker); `.pkpass` if time allows (explicitly cuttable). Durham travels on the new system; LA family gets fragment-invite links to their keepsake.

**Explicitly deferred:** sync of shared traveler state (encrypted LWW blobs via the same Worker pattern, when a real trip demands it), CRDTs (Automerge 3 only if concurrent co-editing ever becomes real — the local-first report is right that today's conflict surface doesn't justify it), App Clips, multi-tenant anything.

---

## 9. Where I disagree with the briefing

1. **"Full liberty" ≠ rewrite.** The owner's mandate invites a blank page; I decline it for the traveler shell. The anatomy and design reports document thousands of lines of hard-won correctness (viewport scar tissue, wallet derivation, motion choreography, the epistemic UI). Overhaul the invisible half; *recover and refactor* the visible half.
2. **Diceware-as-primary (engineering report) is the wrong default.** Fragment-key invites make the passphrase a fallback wrap. Zero typing is the spirit of the product; generated diceware survives only on the printed invitation.
3. **The KG report's "graph unencrypted-but-private in the repo" is too loose for the PKG.** Trip drafts in a private repo, fine; durable medical facts about named children get at-rest encryption regardless of repo visibility.
4. **The landscape report's service ambitions must not leak into the architecture.** No multi-tenant scaffolding, no pricing-shaped features. The correct preparation for a future atelier is exactly the discipline already chosen: trips as data, pipeline as CLI, zero server state.
5. **The interview-science 11-item inventory should not be hardcoded as v3.** It's an excellent question *bank*; the EVPI scorer chooses from it dynamically. Shipping it as a fixed 11-question flow would repeat the current mistake (a beautiful static script) with better questions.
6. **Local-first report's "keep GH Pages as mirror" — yes, but automated or not at all.** A hand-maintained mirror recreates the three-divergent-copies disease that caused half the critical bugs. The mirror is a CI target or it doesn't exist.
7. **One skin.** Drift ("aurora glass") is charming and doubles the theming test matrix while diluting the thesis (design report agrees). It goes. The combinatorial theming debt (2×3×8×2×3) gets rebuilt as a generated, contrast-validated token pipeline or the palette count shrinks.

---

## 10. What must survive the overhaul, verbatim

- The **traveler experience**: Now/Days/Wallet/Prep/You, the trek's cinematic tour and SVG offline sketch, the interview's movements and voice, empty states as rewards.
- The **derived wallet** (confirmations → passes, fused lodging card) — single-source-of-truth done right.
- The **epistemic UI vocabulary** — receipts, solid/single_source/struck, dashed provisional borders, "Call ahead" chips, decision forks — this is the pre-built rendering layer for the knowledge graph's provenance model; the overhaul's biggest gift is that the front end already speaks the back end's future language.
- The **design token system and three-voice typography**; the copy registers; zero exclamation marks.
- **Zero third-party JS, zero telemetry, no accounts** — the trust substrate that makes intimate interview questions ethically possible (landscape report's sharpest observation).
- WebCrypto idioms (AES-256-GCM, non-extractable keys), the IDB envelope cache with ct-diff hot-swap, the redaction sentinel, per-viewer keyed local state.
- The la/durm SW's *design intent* (stamped caches, SWR, relative-path correctness) — it becomes the canonical worker's spec.
- The **repo-as-keepsake** idea, deliberately: a finished trip frozen at a URL, edit history as the trip's diary, now with an afterglow mode that finally ships.

---

*— Chief Architect seat, Excurse overhaul council*
