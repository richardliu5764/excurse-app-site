# Excurse — Evolution & Variants: A Product History Across Three Deployments

**Role:** Product Historian
**Sources examined:** `/home/user/excurse-app-site`, `/home/user/la-fieldguide`, `/home/user/durm-guide` (full git histories), plus beautified copies of all four shipped JS bundles at `/tmp/claude-0/-home-user/39e57f04-4217-524f-bfc9-7ff5893fe172/scratchpad/beautified/` (`app-index.js`, `la-index.js`, `durm-index.js`, `tl-index.js`).

---

## 1. Executive summary

The three repos are **not three products** — they are **one continuously evolving shell codebase, frozen at three different moments and pointed at different trip payloads**:

| Repo | Shell generation | Bundle | Deployed | Trip payload |
|---|---|---|---|---|
| `durm-guide` | mid-June single-trip Excurse shell | `index-DtBlYME4.js` (112 KB) | once, 2026-06-14 03:38 | Back in Durm (33 KB `.enc`) |
| `la-fieldguide` | June-23 multi-trip Excurse shell + interview **v1** | `index-B3NHvKFD.js` (125 KB) | 50 deploys, 06-12 → 06-23 02:41 | Liu's Angeles (104 KB `.enc`) |
| `excurse-app-site` | June-23 flagship shell + interview **v2** (movements, ledger, knowledge-schema destinations) | `index-51ocJsMQ.js` (138 KB) | 3 deploys, 06-21 23:34 → 06-23 09:45 | **the same LA trip**, re-encrypted (104 KB `.enc`) |

Two older generations survive as fossils inside `la-fieldguide` history: **"Field Guide" (classic/)** — a no-build vanilla-HTML passphrase gate with a 1.3 MB `trip.enc` — and **"Glide" (tl/)** — a 63 KB Vite bundle, no maps, no crypto fast-path, still shipped today at `la-fieldguide/tl/` behind a redirect.

The hardest evidence of the "one codebase" claim: `durm-guide/assets/index-DtBlYME4.js` is **byte-identical (sha256 b18507ec…)** to the bundle `la-fieldguide` served from June 14 until the June 21 deploy replaced it. Durm is simply the LA shell of that week plus a different `trip-data.enc` and a re-titled `index.html`/manifest.

---

## 2. The four naming eras (archaeology)

Naming strata, oldest → newest, all recoverable from shipped artifacts:

### Era 0 — "Field Guide" / `fg` (pre-repo → removed 2026-06-13 20:46)
- Survives only in git history as `classic/` (present from la-fieldguide's first commit 06-12 04:05; deleted at commit `9b721a3`).
- Vanilla single-page app: inline CSS, system fonts (`Iowan Old Style`, Georgia), cream palette `#FBF1E3`, its **own service worker** with cache `fg-0a434c8512` and a hand-listed `ASSETS` array.
- Data file was **`trip.enc`** (1,314,555 bytes — enormous; almost certainly embeds images/tickets in the ciphertext), alongside an early 72 KB `trip-data.enc`.
- The la-fieldguide GitHub repo is still named for this era: its README title is `# fg`.
- The root of la-fieldguide also carried a stray `trip.enc` (1.3 MB) until the same 06-13 cleanup commit.

### Era 1 — "Glide" / `tl/` (still shipped as a fossil)
- `la-fieldguide/tl/`: 63 KB bundle `index-BmIuRFhh.js`, own fonts, manifest `{"name":"Glide"}`. `tl/index.html` is a one-line meta-refresh: *"Excurse moved here"* → `../`.
- The Glide bundle's settings screen shows a two-way style toggle **`Glide` | `Classic ↗`**, and the Classic link points to `../` — i.e. in Glide's original hosting layout, **classic Field Guide lived at the root and Glide lived in a subdirectory**. The current layout (Excurse at root) inverted that.
- Glide-era unlock copy: *"The plan is sealed. The family passphrase opens it."* — warmer, family-specific; lodging is literally called *"The Airbnb"*.
- What Glide already had (all confirmed in `tl-index.js` strings): Now view (Good morning/afternoon/evening; "Nothing scheduled, exactly as planned"), Days with LEAVE-BY times, Loose ends ("Every loose end is tied. Enjoy the quiet."), Wallet (no QR rendering), packing + outfits ("Your outfits"), the **Glide inbox** (paste TikTok/IG/YouTube/Maps saves; export queue via `mailto:richardliu5764@gmail.com?subject=Glide%20inbox%20queue`), per-traveler identity, theme palettes (Golden Hour, Marine Layer, K-Town Neon already present as **palette names**, not day names), same PBKDF2/AES-GCM envelope decrypt.
- What Glide lacked: maplibre/treks, QR codes, IndexedDB key fast-path, satellite/terrain, multi-trip anything.

### Era 2 — "TL" (a name that never shipped a UI, but owns all the storage)
- Every bundle including today's flagship namespaces persistence under **`tl.`**: `tl.inbox.queue`, `tl.identity.<tripId>`, `tl.<tripId>.seen.<x>.<y>`, `tl.plan.<tripId>` (encrypted plan drafts), `tl.atlas.drafts`, and IndexedDB database **`tl-keys`** (store `k`). "TL" is plausibly the internal predecessor name between Field Guide and Glide/Excurse ("tl" = the directory Glide shipped in). Practically: **the storage schema has never been migrated**, so `tl.` prefixes are load-bearing compatibility, three renames later.

### Era 3 — "Excurse" (root shells, all three repos)
- Manifest/app title "Excurse" (la, app-site) — but durm's manifest is trip-branded ("Back in Durm") while running the identical Excurse bundle, showing that **app identity itself is per-trip config**.
- Excurse-era unlock copy: *"A private itinerary, for invited travelers only."*, input placeholder `unlock code` (Glide's "family passphrase" generalized to strangers-you-invite).
- Even the flagship still leaks earlier eras: the inbox export is titled **"Glide inbox queue"** and mails the developer directly; storage is all `tl.`.

---

## 3. Timeline reconstruction (from 54 commits across three repos)

- **Pre 06-12:** Field Guide (classic) and Glide (tl) exist elsewhere; root/tl layout inverted at some point.
- **06-12 04:05** — la-fieldguide first commit already contains all three generations side-by-side: root Excurse shell, `tl/` Glide (with redirect already in place), `classic/` Field Guide (with both `trip.enc` and `trip-data.enc`).
- **06-12 → 06-13:** ~40 deploys in ~40 hours (several at 4–6 AM), pure iteration bursts on the single-trip Excurse shell; commit messages are bare `deploy YYYYMMDD-HHMM` stamps.
- **06-13 20:46 (`9b721a3`):** spring cleaning — `classic/` deleted entirely, root `trip.enc` dropped. `tl/` kept (redirect + assets + Glide manifest) so previously-installed Glide PWAs still resolve.
- **06-14 03:38:** `durm-guide` created in a single commit — *"Back in Durm — initial encrypted bundle + Glide shell"*. Note the developer still **called the shell "Glide"** in prose even though it's the Excurse bundle; sw cache stamp `excurse-20260614032819`.
- **06-15 18:19 (`0c969b7`):** the one richly-written commit — Huntington reservation added: real order number `W7Y-VSD-LP5Z`, 4 tickets, 1:00 PM entry, QR embedded on the wallet card (qr passthrough in wallet builder, `<img>` render, `.wqr` style), day block keeps a pointer + parking logistics "to avoid duplication", SW stamp bumped. This is the clearest sample of the content-editing workflow: **trip facts live in `trip-data.enc`; features live in the bundle; both redeploy together.**
- **06-21 14:31 (`a86afab`):** "Little Tokyo pocket guide expanded (17 stops, map links, parking fix)" — replaces `index-DtBlYME4.js` (the durm-frozen build) with the next shell generation.
- **06-21 23:34:** `excurse-app-site` created the same night — new flagship home (adds `.nojekyll`, a real manifest with description/orientation/categories/maskable icon, a **new simplified sw.js**).
- **06-22 → 06-23:** the "atlas + interview" era lands. la-fieldguide's final deploy (06-23 02:41) ships multi-trip atlas + interview v1; excurse-app-site's final deploy (06-23 09:45, seven hours later) ships interview v2. Since then, silence (as of 2026-07-01).

Deploy mechanics (identical across repos): commits stamped `deploy YYYYMMDD-HHMM`; la/durm `sw.js` contains the literal comment *"20260623024138 is substituted by **scripts/deploy.sh**"* — i.e. there is a **private source repo with a deploy script** that builds Vite output, stamps the SW cache name, cache-busts icons (`?v=47679bf8` in la/durm), and force-pushes only compiled artifacts into these public-pages repos. No source, no scripts, no CI ships with them; READMEs are 2-line all-rights-reserved notices ("# fg", "# bidurm").

---

## 4. Bundle-by-bundle feature matrix

Sizes: tl 63 KB → durm 112 KB → la 125 KB → app 138 KB (plus lazily-loaded maplibre 1,034,473 bytes in all three roots — same size, different hash per build).

| Feature | tl (Glide) | durm (06-14) | la (06-23 02:41) | app (06-23 09:45) |
|---|---|---|---|---|
| Now / Days / Loose ends / Wallet / Packing+outfits / Inbox / You | ✅ | ✅ | ✅ | ✅ |
| Theme palettes (7: Paper, LA Summer, Pacific, Golden Hour, Marine Layer, Matcha, K-Town Neon) | ✅ (partial list) | ✅ | ✅ | ✅ |
| Map treks (maplibre, LineString day journeys, satellite/terrain, map debug overlay, `dmDebugGrid`) | ❌ | ✅ | ✅ | ✅ |
| Wallet QR rendering | ❌ | ✅ | ✅ | ✅ |
| IndexedDB key fast-path (skip unlock on relaunch) | ❌ | ✅ | ✅ | ✅ (+ named failure paths: "falling to Veil") |
| Tab bar (field mode) | (Glide layout) | Now·Days·Wallet·**Plan**·You | Now·Days·Wallet·**Prep**·You | Now·Days·Wallet·**Prep**·You |
| Multi-trip atlas ("All trips", trip tiles, "Plan a new trip", drafts) | ❌ | ❌ | ✅ | ✅ |
| Plan/Explore mode toggle (`shape`/`dream`/`field` data-modes) | ❌ | ❌ (CSS present, JS not wired) | ✅ | ✅ |
| Interview | ❌ | ❌ | **v1: 5 flat questions** | **v2: 12 questions, 4 movements, ledger, playback** |
| "Drift" alternate UI style ("aurora glass") | ❌ | ❌ | ✅ | ✅ |
| Unlock copy | "family passphrase" | "invited travelers only" | same | same |

Notable fossils:
- The CSS in **all three root repos — including durm's June-14 build — already styles four data-modes: `shape`, `dream`, `field`, and `afterglow`**. Durm's JS wires none of them; la/app wire shape/dream/field; **`afterglow` (evidently a post-trip mode) has never been wired in any shipped JS**. Design was running ahead of code by a week-plus.
- `index.html` ships `data-mode="field"` as the static default in all three.

---

## 5. Interview v1 → v2: the single biggest product delta

**LA (v1), shipped 06-23 02:41** — flat array of 5 questions (`companions`, `soul`, `pace`, `delight`, `guardrails`), each just `{id, kind, ask, aside, options}`. Kinds: chips / scale / text. Completion: "Done — I have your taste and your guardrails." with "Revisit my answers" / "Keep planning". No model of the traveler beyond raw answers.

**Flagship (v2), shipped 7 hours later** — a structured elicitation system. Each of 12 questions carries:

- **`movement`** 0–3, titled *The bones → The reason → Your taste → The shape* (the interview is composed like music, asked in movement order);
- **`theme`** (crew, safety, soul, delight, home, pace, rhythm, novelty, guardrails, budget — budget defined in labels but has no question yet, another design-ahead-of-code fossil);
- **`tier`**: `Oil` vs `Tar` (an internal severity/stickiness taxonomy — safety facts are Tar: "Facts, not preferences — I plan hard around these");
- **`destination`** — a dotted path into a nascent **traveler/trip knowledge schema**: `frame.party`, `frame.soul`, `frame.dials.pace`, `frame.guardrails`, `person.dietary`, `person.body_access`, `disposition.daily_rhythm`, `disposition.novelty_appetite`, `taste_fingerprint.delight_patterns`, `taste_fingerprint.evidence_episode`, `taste_fingerprint.tradeoff`, `taste_fingerprint.home_baseline`. This is exactly the embryo of the knowledge-graph direction the owner asked about — four entities (frame / person / disposition / taste_fingerprint) already named in shipped code;
- new question **kinds**: `story` (free-prose evidence: "Tell me about one trip moment you still think about" — "A story tells me more than a checklist ever could") and `pair` (forced tradeoff: "The unforgettable meal / plain room, perfect food" vs "The room you never want to leave / good food, magic setting" — "Either is fine. I just want your lean");
- brand-new v2 questions: dietary restrictions, mobility/energy/age constraints, past-trip story, food-vs-room pair, **home baseline** ("What's abundant where you live that you'd never travel for?" — "So I never sell you something you already have at home"), daily rhythm, comfort-vs-novelty scale.

v2 adds an **evidence ledger** ("What I'm hearing"): every answer becomes a claim with state **hunch ○ / pattern ◐ / confirmed ●**, computed by theme-weighted scoring (safety answers weight 3), each with provenance (`from: <question>`). A **playback phase** precedes handoff: *"Here's what I'm hearing. Did I get you right? … Tap anything to fix it. I never plan from a guess — only from what you confirm here."* Question sequencing is adaptive (`di()`): earliest incomplete movement first, tie-broken toward the least-covered theme. Output is a `frame-draft-v1` object.

**Privacy plumbing (v2):** plan drafts are AES-GCM-encrypted at rest in localStorage (`tl.plan.<id>`, `enc:` prefix) under a device key generated and held in IndexedDB (`excurse` DB → `keys` → `draft-device-key`). Trip summaries pass an **allow-list privacy check** — `manifest privacy: TripSummary carries non-allow-listed field(s)` throws if any field beyond `[id,name,start,end,status,accent,palette,bundle,blurb,where]` leaks into the atlas layer.

**The handoff is theater (today).** "Hand off to research & compose" only flips local state to a `flywheel` phase rendering four stages — Interview ("Done — I have your taste and your guardrails.") → Research ("Runs off your phone, against your own doctrine. No raw answers leave the device." / done: "Verified — findings checked against locals.") → Compose ("Selects, sequences and shapes the trip author-time." / done: "Cut — days shaped, fair to everyone, routed.") → Ready ("Your composed trip lands here as a private bundle."). Nothing is transmitted anywhere; the developer must manually harvest the (device-key-encrypted!) draft. The copy *"Nothing you said is sent to an outside AI"* is true because nothing is sent at all. The word **"doctrine"** (the author-side composition ruleset) appears only in la + app bundles.

Copy tightening v1→v2 (voice discipline): "Explore somewhere new"→"Somewhere new"; "Get away"→"Just get away"; "So I **can** keep everyone served"→"So I keep everyone served"; "I**'ll** leave real gaps"→"I leave real gaps"; "the taste I**'ll** measure"→"the taste I measure". The assistant's voice moves from future-tense promise to present-tense fact.

---

## 6. Per-trip config vs shared code (what actually varies)

**Shared bit-identical across repos:** all three variable fonts, both icons (sha-identical), the maplibre chunk (same size, per-build hash only).

**Per-trip, outside the bundle:** `trip-data.enc` (the content); `index.html` `<title>` + `apple-mobile-web-app-title` (Excurse vs "Back in Durm"); manifest name/description.

**Per-trip, INSIDE the compiled bundle (the awkward part):**
- The **atlas registry is hardcoded** in la/app bundles as a compiled array: `{id: "la-2026-06", name: "Liu's Angeles", start/end, status: "live", accent: "#A05A22", palette: "la-summer", bundle: "trip-data.enc", where: "Los Angeles", blurb: "Family days across Little Tokyo, the eastside and the coast."}` and `{id: "durham-2026-10", name: "Back in Durm", status: "planning", palette: "pacific", where: "Durham, NC", blurb: "A reunion weekend, still taking shape."}` (note: Durham trip dated **2026-10-16→19** — the next real trip is already scheduled). User-created drafts merge from `tl.atlas.drafts` localStorage.
- The default storage namespace is the compiled constant `la-2026-06` (`var Rt = \`la-2026-06\``), reassigned when a trip opens.
- Default bundle URL `trip-data.enc` compiled in.

So today "per-trip config" is smeared across three layers: encrypted payload, HTML/manifest titles, and literals compiled into shared JS. Adding a trip currently means **rebuilding the shell**.

**Crypto envelope (identical schema all repos):** `{v:1, kdf:"PBKDF2-SHA256", iter:600000, salt, nonce, ct}` → AES-GCM-256; unlock code normalized `trim().toLowerCase().replace(/\s+/g,"-")`. After successful unlock, the **non-extractable derived CryptoKey is persisted in IndexedDB** (`tl-keys`/`k`/`trip`) — that's the relaunch fast-path (no PIN mechanism exists in any shipped bundle; failure falls back to the passphrase screen, internally named **"the Veil"**). ⚠️ Historian's note: **all three trips share the exact same salt** (`O/IGickSf0woYu9XLwbgtA==`) with different nonces — the packer reuses a fixed salt (and likely the same passphrase→same key across trips). la and app-site `.enc` are the same 104,251 bytes with different nonce/ct: same LA content re-encrypted per deploy. Durm's is 33,235 bytes (a lighter, still-planning trip).

---

## 7. Service workers: three generations, and a regression at the tip

1. **classic/sw.js** (`fg-0a434c8512`): precache-all with a hand-maintained ASSETS list; special-cases `trip.enc`.
2. **la/durm sw.js** (byte-identical logic, different stamps `excurse-20260623024138` / `excurse-20260614032819`): the most sophisticated. Per-deploy stamped cache name substituted by `scripts/deploy.sh`; old caches swept on activate; hashed assets cache-first; **navigations + `trip-data.enc` + manifest stale-while-revalidate** (serve cached instantly, refresh in background); `sw.js` itself network-first; first-load network capped at 3.5 s via `Promise.race` (with a written rationale for racing instead of AbortController on navigation requests); `/classic/` carve-out ("the classic edition runs its own worker") kept even after classic/ was deleted.
3. **excurse-app-site sw.js**: a **simpler rewrite** — constant cache name `excurse-v1`, cache-first for everything same-origin except `*.enc` (network-first), no timeout, no SWR, no deploy stamp. Git shows sw.js **unchanged across all three flagship deploys** while `index.html` changed every time. Consequence: an installed flagship client caches `index.html` cache-first under a never-rotating cache name; since sw.js bytes never change, no update event ever fires, so **installed users are pinned to the June-21 shell forever — only trip content (`.enc`, network-first) refreshes**. The la/durm worker had already solved exactly this with the stamped cache + SWR; the flagship regressed, presumably a fresh-scaffold worker that never got the deploy.sh treatment. This is the single most consequential mechanical defect to fix in any overhaul, and a lesson: the deploy tooling's guarantees lived in the *old* repo's script, not in the shell itself.

---

## 8. What the repo-per-trip model implies (observed consequences)

- **A trip is an artifact, not a row.** Each repo is a complete, self-hosting, offline-capable, encrypted keepsake: shell + fonts + map engine + ciphertext. Nothing expires when a server dies; the git history *is* the trip's edit history (50 deploys of the LA trip read like a diary of a guide being polished right up to and during travel days, including 4 AM sessions).
- **Privacy by architecture:** GitHub sees only ciphertext + generic shell; content secrecy = passphrase secrecy. But the compiled-in atlas already leaks metadata the payload encrypts — trip names, cities, dates, blurbs ("Liu's Angeles", "Family days across Little Tokyo…") sit in plaintext JS in a public-pages repo, directly against the spirit of the `TripSummary` privacy allow-list one abstraction level up.
- **Version skew is permanent:** durm-guide still serves the June-14 shell — travelers on different trips run different app generations forever unless every trip repo is redeployed. The flagship's hardcoded atlas points at its *own* `trip-data.enc` for LA and nothing for Durham, so the "multi-trip" shell still can't actually open the Durham trip — cross-repo trips aren't wired.
- **Shell and content are coupled at deploy time:** the Huntington-QR commit needed a feature change (wallet QR rendering) *and* a content change (`trip-data.enc`) in one deploy; the repo-per-trip model made that atomic, which is genuinely nice.
- **Naming debt compounds:** repo names (`fg`, `bidurm`) and storage prefixes (`tl.`) fossilize each era because installed PWAs and localStorage can't be renamed without migration. Any overhaul that changes storage keys must ship a migration or orphan travelers' seen-marks, identity, and cached keys.
- **excurse-app-site is the intended convergence point:** richest manifest (with the mission statement: "Plan and explore private itineraries — listens once, plans offline, walks the days with you."), the atlas, the interview flywheel, and the same LA trip re-hosted — the shape of a single multi-trip home replacing per-trip repos, half-migrated: distribution (per-trip repos), the atlas (hardcoded), and the handoff (manual) are all still awaiting the mechanism that the interview v2 schema (`frame` / `person` / `disposition` / `taste_fingerprint`) clearly anticipates.

---

## Appendix A — Era markers cheat-sheet

| Marker | Era | Where seen |
|---|---|---|
| `fg-…` SW cache, `trip.enc`, Iowan Old Style, `# fg` README | Field Guide | classic/ (deleted 06-13), repo name |
| `Glide` manifest, "family passphrase", "Classic ↗", mailto "Glide inbox queue" | Glide | tl/ (still shipped); inbox mailto in ALL bundles incl. flagship |
| `tl.` localStorage, `tl-keys` IndexedDB, `tl/` path | TL | every bundle, today |
| `excurse-…` SW cache, "invited travelers only", Veil, shape/dream/field/afterglow, Drift | Excurse | all three roots |

## Appendix B — Key line references (beautified copies)

- Atlas seed + `TripSummary` allow-list: `app-index.js` ~5204–5260
- Interview v2 question schema: `app-index.js` ~5510–5675; ledger/evidence scoring ~5677–5740; adaptive selection `di()` ~5745; `frame-draft-v1` ~5780
- Draft encryption at rest: `app-index.js` ~5430–5510
- Crypto envelope + key fast-path: `app-index.js` ~1473–1553; unlock persists key at ~6538
- Root mode machine (shape/dream/field, Veil fallbacks): `app-index.js` ~7127–7205
- Interview v1: `la-index.js` ~5435–5470
- Glide unlock copy: `tl-index.js` ~2876; Classic link ~2820
