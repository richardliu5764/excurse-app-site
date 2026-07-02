# Excurse Overhaul Council — Head of Operations / Pragmatist Position Paper

**Seat:** Head of Operations / The Pragmatist
**Date:** July 2, 2026
**Inputs:** All nine rapporteur reports; council papers 10–15; direct inspection of the three deployed repos and the in-tree `excursed/` pipeline scaffold.
**Charge:** Own reality. Cost everything in solo-maintainer hours. Make composing a trip a 30-minute mechanical joy. Say what does not get built.

---

## 0. Verdict

The council has produced a beautiful plan that, summed naively, costs 90–110 focused solo-dev days against a calendar that has roughly 70 before Back in Durm departs on October 16 — and that's assuming Richard does nothing else with his life. The plan is right in shape and over-subscribed in scope. My job in this paper is three things: (1) correct one expensive factual error the council inherited — the source code is not lost, and we should not spend 2–3 weeks reconstructing it from a beautified bundle; (2) put a day-cost and a leverage rank on every proposal so the cuts are explicit instead of discovered in September; (3) specify the operating model — deploy, preview, QA, monitoring — that turns the 50-deploys-in-11-days grind into roughly three deploys per trip and five minutes a day of live-trip attention. The one-sentence operator verdict: **the product's biggest operational asset is that it needs no servers at runtime — protect that property fanatically, close the loop with the fewest moving parts that can survive Richard being asleep, and cut everything that doesn't ship Durham.**

---

## 1. Operating reality

**Team:** one person, high AI leverage, demonstrated willingness to deploy at 4 AM (which is itself an ops smell — see §6).

**Calendar:** July 2 → October 16 is 15 weeks ≈ 75 weekdays. A realistic sustained budget for a solo builder with a life is **60–70 focused days**, and the last two weeks before departure must be reserved for content, not code. So the real engineering budget is **~50–55 days**. Every seat's sequencing assumes it gets its full ask; they cannot all be right.

**Runtime dependency profile (the crown jewel):** today, once a traveler has opened the guide once, *nothing* Richard operates needs to be up. Static files, client-side crypto, offline cache. There is no on-call because there is nothing to be on call for. The overhaul adds exactly two server components (the ciphertext dropbox Worker; later a push scheduler) — both must be designed so their *failure loses nothing*: the client queues and retries, and the guide itself never depends on them. If any proposal makes a live trip depend on a running service, this seat vetoes it.

**Money:** fixed costs post-overhaul are a domain (~$15/yr) and Cloudflare free tier (Workers static assets unmetered, R2 10GB free, Workers 100k req/day — a family trip generates hundreds). LLM cost per composed trip $20–50 (AI seat's estimate, which I accept). Total: **under $100/year fixed + ~$30/trip marginal.** The Apple Developer $99/yr for .pkpass is the only recurring cost on the table I'd decline this year (§7).

**What already exists in-tree:** an `excursed/` pipeline monorepo scaffold (packages: schema, graph, interview, agenda, compose, verify, cli; Zod + vitest + tsx) has been started inside `excurse-app-site/`, plus an empty `docs/overhaul/`. Good — but it's sitting inside a *public deploy artifact repo*. First housekeeping act: move it to the private monorepo before anything real (prompts, transcripts, traveler data, fixtures with real names) lands in it. A pipeline fixture with a real allergy in a public repo would be the exact class of leak the security seat is trying to retire.

---

## 2. The correction: the source is not lost

The engineering review ("no source of truth... the product is unrecoverable if the laptop dies") and the architect's plan (§2: "No source exists... vendor the beautified bundle... 2–3 AI-assisted weeks and it is not optional") both treat source recovery as a project. But the deployed artifacts themselves say otherwise:

```
la-fieldguide/sw.js:5:  20260623024138 is substituted by scripts/deploy.sh. */
durm-guide/sw.js:5:     20260614032819 is substituted by scripts/deploy.sh. */
```

There is a private source repo with a `scripts/deploy.sh` on Richard's laptop. The archaeologists could only see the public deploy artifacts; the council then planned as if the artifacts were all that exists. They are not.

**Consequences, in order of importance:**

1. **The bus-factor fix is one hour, not three weeks.** `git remote add origin <private GitHub repo> && git push`, today, before lunch, before any council debate. This is the single highest leverage-per-effort action in the entire program: existential risk retired for ~0.1 days.
2. **The architect's "recover source from beautified bundle" line item (10–15 days) is deleted** and replaced with "restructure the existing source into the monorepo layout" (2–3 days). The golden-E2E-lock idea survives — it's good practice for the refactor regardless — but as a 2-day item, not a phase.
3. **The budget I free up here (~2 weeks) is what makes the rest of this paper's calendar honest.** Most of my ranking below only fits because this correction exists.

(If I'm wrong — if the laptop source has rotted or diverged from the deployed bundles — the architect's vendoring plan is the correct fallback, and we find that out on day one for free by diffing a fresh local build against the deployed hashes. Either way we know by Friday.)

---

## 3. The cost ledger

Every material council proposal, costed in focused solo-dev days (AI-assisted; I've costed at the speed the 50-deploys-in-11-days history demonstrates Richard actually works). "Deps" = what must land first.

| # | Proposal (seat) | Days | Deps | Operator notes |
|---|---|---|---|---|
| L1 | Push laptop source to private GitHub + CI skeleton (typecheck/build) | 0.5 | — | Do today. |
| L2 | Security week: squash public histories, rotate LA key, purge Gmail/registry strings, THREATMODEL.md v1, fix the two false privacy sentences (security §9.1–2) | 2 | — | No architecture needed. |
| L3 | Sealed transport: HPKE-to-composer-pubkey → ~50-line Worker → R2; kill mailto (architect A7) | 2 | L1 | The single feature that makes the product real. Client must queue-and-retry so Worker downtime loses nothing. |
| L4 | Monorepo restructure: existing source + `excursed/` scaffold into one private repo, layout per architect §2 | 2–3 | L1 | Not the 2–3 week reconstruction — see §2. |
| L5 | Single origin `/t/{slug}/` on CF Workers static assets + R2; kill repo-per-trip | 3 | L4 | Kills five bug classes in one stroke (frozen SW, cache wars, plaintext registry, rebuild-per-trip, version skew). |
| L6 | Canonical generated SW: precache manifest, atomic cache swap, prefix-scoped deletion (architect A3) | 2–3 | L5 | Includes Playwright airplane-mode test as the CI gate. |
| L7 | Golden E2E lock on the shell (unlock, Now math at fixed clock, wallet derivation, offline open) | 2 | L4 | Insurance for every refactor after it. |
| L8 | Envelope v2: fragment-key invites, per-trip salts + IDB slots, Argon2id fallback wrap, PIN re-wrap, v1 reader (architect A4, security §9.4+7) | 3–4 | L4 | Zero-typing invites are also an *ops* win: no more passphrase support conversations. |
| L9 | ETG store: JSONL + Zod + in-memory indexes, ~800 owned lines (KG report) | 3–4 | L4 | Scaffold already exists; resist gold-plating. |
| L10 | Extractor v1 + provenance validator + episode store | 3–4 | L3, L9 | Checkpoint every LLM call from day one — it's free and it *is* the eval corpus. |
| L11 | Interview v3: question bank + static-impact scorer + stopping rule (AI seat's "not computable EVPI" correction) | 4–5 | L10 | Correspondence model, not live chat — endorsed hard in §8. |
| L12 | Research agenda generator + worker + fact ledger + T0 validator | 5–6 | L9 | The forms-or-UNFOUND discipline is cheap to build, expensive to skip. |
| L13 | Composer: thesis → skeleton → per-day prose firewalled to ledger | 4–5 | L12 | |
| L14 | Verifier: 7 deterministic checkers + seeded-violation suite | 4–5 | L9 | Highest trust-per-dollar in the pipeline; no LLM, no flake, runs in CI forever. |
| L15 | Editorial gates 1–2: slop-lint in CI + claim re-extraction vs ledger | 2–3 | L12 | Gate 1 is a regex/banlist day. |
| L16 | Editorial gate 3: anchored rubric judge, different lineage, self-preference canary | 2–3 | L15 + corpus | Defer until 2+ trips have flowed (§7). |
| L17 | Editorial Bible + 20–30-entry calibration corpus (editorial/design seats) | 5–8 | — | Pure writing, fully parallel, zero code deps. Richard's evenings. |
| L18 | Pack + deploy CLI verbs: compile→encrypt→pmtiles→precache manifest→wrangler; content-free commit stamps enforced | 2 | L5, L6 | This is where the 30-minute trip lives. |
| L19 | PMTiles + OPFS offline maps + no-basemap fallback | 3–5 | L5 | Serves the core offline promise; after loop closure, before Durham. |
| L20 | Fix Now-view midnight/DST math with Temporal + property tests | 1–2 | L7 | Small, real, mid-trip failure class. |
| L21 | Design kill list: delete Drift skin, editorial typestyle, debug HUDs, sub-44px overrides, mailto | 1 | L4 | *Deletion*, not construction. Cheap and shrinks the test matrix. |
| L22 | Contrast fixes: recalibrate `--ink-faint`/`--line`/accent tokens against WCAG | 1–2 | L21 | Do by hand for a reduced palette set — not a pipeline (§7, §8). |
| L23 | Generated contrast-validated token *pipeline*, 8 palettes × modes (design seat) | 4–6 | L22 | Cut for 2026 — shrink the matrix instead. |
| L24 | Declarative Web Push "LEAVE BY" nudges + cron Worker | 2–3 | L5 | Defer (§7). |
| L25 | .pkpass wallet passes ($99/yr + cert lifecycle) | 1–2 + $99/yr | — | Defer (§7). |
| L26 | Afterglow mode (design/CEO seats) | 3–5 | — | Timebox to 2 days post-Durham-compose or defer (§7). |
| L27 | Traveler PKG, age-encrypted, distill-with-approval | 2–3 | L9 | Cheap, compounding; do in September. |
| L28 | Pre-trip refresh T-72h/T-24h as scheduled CI + alert | 1–2 | L18 | The differentiator; also the live-trip monitoring backbone (§6). |
| L29 | Eval harness: recorded-transcript replay, golden-trip diffs | 3–4 | L10 | Start as "checkpointed calls + 5 assertions," grow organically. |
| L30 | LWW sync worker / CRDTs / co-editing | — | — | Not built. Local-first report agrees. |

**Sum of everything: ~75–95 days.** Budget: ~50–55. The cuts in §7 remove ~20 days; the §2 correction removes ~12 more. That is the whole game.

---

## 4. The operator's cut: ranked by leverage-per-effort

**Tier 1 — do this week, no debate (5–6 days total).**
1. **L1** Push the source. (0.5d) The ratio here is effectively infinite.
2. **L2** Security week items: history squash, key rotation, Gmail/registry purge, THREATMODEL.md, fix the false privacy sentences. (2d) These are reputation landmines in a trust product, and none require architecture.
3. **L3** Sealed transport Worker. (2d) Until this exists the product is a UI animation; after it exists, every other pipeline stage has something real to eat. Highest-leverage *feature* in the program (architect agrees; I agree with the architect).

**Tier 2 — the foundation fortnight (10–12 days).**
4. **L4 + L5 + L6 + L7** Monorepo, single origin, canonical SW, golden E2E. This retires the two most dangerous shipped bugs (frozen shell, cross-trip cache massacre) and the rebuild-shell-per-trip tax simultaneously. Note the compounding: after this, *every* subsequent item deploys through CI with previews instead of hand-pushed artifact commits.
5. **L21 + L20** Design deletions and the midnight-math fix ride along — they're small and the E2E net is already up.

**Tier 3 — close the loop, ugly (July–August, ~20 days).**
6. **L9 → L10 → L11 → L12 → L13 → L14 → L15 → L18** in dependency order, with the AI seat's "contact with reality" amendment: a real Durham traveler completes the interview and receives the letter by early August, even if extraction is half-manual that week. A CLI is the Studio. `git diff trips/durham-2026-10` is the review UI. No web dashboard gets built in 2026.
7. **L17** (Bible + corpus) runs in parallel the entire time because it costs no code and everything downstream consumes it. This is Richard's evening work while CI runs.

**Tier 4 — hardening for Durham (September, ~10 days).**
8. **L8** envelope v2 + fragment invites (the Durham travelers should never type a passphrase).
9. **L19** PMTiles offline maps. 10. **L28** refresh crons. 11. **L27** Traveler PKG. 12. **L22** contrast fixes on a reduced palette set.

**Tier 5 — only if September is boring.** L16 (rubric judge), L26 (afterglow, timeboxed), L29 (fuller evals), L24/L25 (push, pkpass).

---

## 5. The 30-minute trip: target operating model

The la-fieldguide log — 50 deploys in 11 days, some at 4 AM — is not a work-ethic story; it's a tooling indictment. Root cause: **content iteration happened in production** because (a) shell and content were coupled at deploy time (the Huntington QR commit proves it: one reservation = one shell deploy), (b) there was no local preview that rendered real trip data, and (c) "deploy" was the only way to see the guide on a phone.

The target model separates three loops that today are one loop:

**Loop A — shell development (rare, post-overhaul ~monthly).** PR → CI (typecheck, unit, golden E2E incl. airplane-mode Playwright) → merge → deploy shell to the single origin. Travelers get it via the atomic-swap SW. Content never rides along.

**Loop B — trip composition (per trip, mostly machine time).**
- `excursed new-trip durham-2026-10` — scaffolds the trip directory, mints slug + content key into `.secrets/`, prints the invite link. *2 minutes.*
- Interview happens asynchronously via the correspondence model; episodes arrive through the dropbox Worker; `extract`/`ask` run on arrival.
- `excursed research` runs unattended (overnight is fine — it's checkpointed and resumable).
- `excursed compose && excursed verify` loop until the scorecard is clean.
- Richard's *attention* is spent at exactly two human gates (editorial seat is right): approve the one-line thesis, and the final read with the scorecard heat-map. That's the CEO's "four hours of attention" — taste, not mechanics.
- **The mechanical residue — scaffold, keys, pack, deploy, invite — is the 30 minutes.** That's the promise this seat owns, and the ledger above says it's buildable by September.

**Loop C — content iteration (the old 50-deploy grind, now local).** `excursed preview` runs the shell dev server against the *pre-encryption* trip JSON with hot reload — no crypto, no deploy, no cache in the inner loop — plus `excursed preview --phone` deploys to a throwaway preview slug (`/t/preview-{hash}/`, auto-expiring) for on-device checks. Expected production deploys per trip: **three** (initial, T-72h refresh, T-24h refresh), all via `excursed deploy`, which stamps versions and enforces content-free commit messages mechanically. Nobody hand-pushes artifacts ever again, and nothing interesting happens at 4 AM.

---

## 6. CI, QA, and monitoring live trips

**CI (GitHub Actions on the private monorepo):**
- Every PR: typecheck, unit (crypto round-trips, time math property tests, verifier seeded-violations), golden E2E, **airplane-mode Playwright** (install SW → go offline → unlock → render Now/Days/map fallback). Offline is the product promise; it gets a merge-blocking gate, not a manual ritual.
- Every content pack: schema validation, verifier clean-or-waived, Gate 1 slop-lint, **pack-time privacy lint** (security L—: no plaintext names/dates/emails outside the crypto boundary; bundle-origin diff). Cheap, deterministic, catches the 0c969b7 class forever.
- GH Pages mirror: exists only as a CI target (architect's disagreement #6 — I co-sign; a hand-maintained mirror recreates the three-divergent-copies disease).

**Monitoring live trips — the privacy-compatible way.** Excurse ships zero telemetry, and that stays. Therefore all monitoring is **synthetic**:
- A scheduled CI job (every 6h during any trip's live window, daily otherwise) fetches the shell, checks the precache manifest hashes, and unlocks a permanent **canary trip** (synthetic content, real pipeline, real crypto) end-to-end. If the canary can't unlock offline, Richard knows before a traveler does.
- `wrangler tail`/logpush on the dropbox Worker for error rates only (it sees ciphertext; there's nothing else to log).
- Alerting: a free push channel to Richard's phone (ntfy.sh or plain email) for canary failure, refresh-job failure, or Worker 5xx. This is the entire "pager." Expected pages per year: single digits, because the runtime is static files.
- **T-72h/T-24h refresh (L28) doubles as live-trip QA:** the cron re-verifies volatile claims, opens a PR with the content diff, and Richard's five-minute morning check during a live trip is reading that diff. If Richard is unreachable, the failure mode is a slightly stale guide — never a broken one. That asymmetry is the whole ops design.
- `excursed status <trip>`: stale volatile claims, open verifier violations, unexpired cancellation windows, refresh due-dates. One command answers "is Durham healthy?"

**Key/secret ops:** content keys and passphrases live in `.secrets/` (gitignored) mirrored to a password manager; the composer's HPKE private key likewise. Losing the laptop now costs a restore, not the product.

---

## 7. Not built in 2026 (the list this seat exists to write)

1. **Source reconstruction from the beautified bundle** — superseded by §2. (Saves 10–15 days.)
2. **The generated token pipeline (L23).** The design seat wants to industrialize 8 palettes × 2 themes × 3 modes × typestyles. Operator counter: **shrink the matrix** — one skin (Drift dies, all seats agree), one typestyle, and *three* shipped palettes hand-fixed for contrast. Industrialize when there's a second composer. (Saves 4–6 days; L21+L22 deliver the user-visible benefit for 2–3.)
3. **.pkpass Apple Wallet (L25).** $99/yr, a WWDR cert lifecycle, and a signing pipeline for a QR code the derived wallet already renders offline. Revisit when a paying stranger asks.
4. **Declarative Web Push nudges (L24).** The first server component whose *failure a traveler would notice mid-trip*. The Now view's LEAVE BY ring already carries the value. Post-Durham experiment at most.
5. **Gate 3 rubric judge + eval harness build-out (L16, most of L29) before two real trips exist.** Judges anchored to a corpus of one trip overfit to that trip. Gates 1–2 + Richard's read are the 2026 bar; checkpointed calls mean the eval corpus accretes for free in the meantime.
6. **Sync, CRDTs, Automerge, co-editing (L30).** Local-first report already said no; I'm making it binding. Per-traveler local state + redeploy-as-LWW covers every observed need.
7. **Any multi-tenant/service scaffolding** — accounts, dashboards, pricing surfaces, a web Studio. The atelier-of-one CLI *is* the service infrastructure until trip ten (CEO and architect concur).
8. **Further trek-map investment.** Scope-frozen per the CEO; PMTiles is the only exception because it serves the offline promise, not the cinema.
9. **Live-chat interviewer.** The AI seat's correspondence model wins on ops grounds alone: no streaming infra, no session state, no availability window, and the traveler-facing surface stays static. The most operationally elegant decision any seat made.
10. **Afterglow (L26)** — designed, loved, and deferred to the week after Durham's guide ships, timeboxed at two days. It's the retention loop for a product that doesn't yet have its acquisition loop closed.

---

## 8. Where I disagree with the council (on the record)

1. **With the engineering report and architect on source recovery** — see §2. Verify against the laptop on day one; don't schedule archaeology for a thing that exists.
2. **With the design seat on the token pipeline** — industrializing an 8-palette matrix for an audience of one composer is building the factory before the second customer. Shrink, don't automate. (I accept the contrast *fixes* unconditionally — 2.6:1 body text is a defect, not a style.)
3. **With the CEO's "weeks 1–2" framing** — the sealed transport (L3) belongs in week one *alongside* foundation triage, not after it. It's two days, it has no dependency on the monorepo, and every week it doesn't exist, interview data keeps flowing over mailto. The security seat's "items 1–3 are this week regardless" is the correct tempo; I extend it to the transport.
4. **With the AI seat's cost estimate, mildly** — $20–50/trip is right for API spend, but the honest per-trip cost line for a future service must include the refresh crons' compute (trivial) and Richard's 4 attention-hours (not trivial — at any defensible rate it dominates). Price the service on attention-hours, not tokens.
5. **With everyone's silence on the canary trip** — five seats specify verification of *composition*; none specifies verification of *the running product during a live trip*. The synthetic canary (§6) is two days of work and is the difference between "we test before deploy" and "we'd know within six hours if a Safari update broke unlock while the family is in Durham."
6. **With the implicit assumption that Durham is the deadline for everything.** Durham is the deadline for the *loop* (Tiers 1–4). It is explicitly not the deadline for the judge, afterglow, push, pkpass, or design industrialization — and writing that down now is what prevents the October crunch from eating the editorial pass, which is the part the family will actually notice.

---

## 9. What must survive (operator's addendum to the common list)

- **Zero-runtime-server architecture.** Static files + client crypto means no on-call, no uptime SLO, no 3 AM pages. Every new component must fail soft.
- **The non-extractable CryptoKey fast path and ciphertext-as-cache** — local loss costs one re-download, never data. This is an ops property as much as a security one.
- **Trips as immutable-ish artifacts with git history as the edit diary** — kept via per-trip export/archive even after repo-per-trip dies.
- **Zero telemetry** — monitoring stays synthetic forever; it's cheaper *and* it's the brand.
- **The existing SW's design intent from la/durm** (stamped caches, SWR) as the spec for the canonical worker.
- **The 50-deploy work ethic**, pointed at content instead of at deployment mechanics.

---

## 10. The calendar (operator's cut, July 2 → October 16)

| Window | Ships |
|---|---|
| **Week 1 (Jul 2–8)** | L1 source pushed; L2 security week; L3 sealed transport live; laptop-vs-deployed diff settles §2. |
| **Weeks 2–3** | L4–L7 monorepo, single origin, canonical SW, golden E2E; L20–L21 ride along. First CI-gated deploy. |
| **Weeks 4–8 (Jul–early Aug)** | Loop closes ugly: L9–L15, L18. Real Durham traveler interviewed by ~Aug 8. L17 Bible/corpus in parallel throughout. |
| **Weeks 9–12 (Aug–early Sep)** | L12–L14 harden; Durham research + first composed draft through verifier + gates 1–2; L8 envelope v2; invites reissued as fragment links. |
| **Weeks 13–14 (mid-Sep)** | L19 PMTiles offline; L27 PKG; L22 contrast; L28 refresh crons + canary monitoring live. |
| **Weeks 15–16 (Oct 1–16)** | **Code freeze Oct 3.** Content only: final editorial pass, T-72h/T-24h refreshes, on-device rehearsal in airplane mode. Durham departs on a guide that was composed, verified, packed, and deployed in three commands. |

Slack: ~8 unallocated days across the calendar. They will be consumed. That's what they're for.

---

## 11. Closing

The romance of this product is that it asks nothing of the traveler. The discipline of this overhaul must be that it asks almost nothing of the operator: no servers to nurse, no dashboards to check, no 4 AM deploys — a pipeline that runs while Richard sleeps and spends his waking hours only where taste lives. The council's vision fits in the calendar if and only if the cuts in §7 hold and the correction in §2 is real. Check the laptop first. Push the source today. Close the loop ugly. Ship Durham through it. Everything else is Tier 5.

*— Head of Operations / Pragmatist seat, Excurse overhaul council*
