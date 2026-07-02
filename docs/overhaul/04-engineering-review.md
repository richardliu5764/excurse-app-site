# Excurse — Staff Engineering Review of Shipped Artifacts

**Scope.** Everything observable in the three deployed repos under `/home/user`: `la-fieldguide` (LA family trip, ~50 deploys June 12–23 2026), `durm-guide` ("Back in Durm", single deploy June 14), and `excurse-app-site` (flagship multi-trip shell, 3 deploys June 21–23). No source repo exists in any of them — only compiled Vite output, service workers, fonts, icons, and `trip-data.enc`. Findings below are verified against the actual bytes (beautified bundles in `undefined/beautified/` and scratchpad), git history, and a PBKDF2 benchmark. Ranked by severity.

---

## Executive summary

The product's three promises are: **private**, **offline-first**, and **calm**. The shipped engineering currently breaks the first two in ways that are invisible until the worst moment:

1. The flagship shell (`excurse-app-site`) **can never update itself** for a returning visitor — its service worker is byte-identical across deploys and serves `index.html` cache-first out of a permanently-named cache.
2. All three apps live on the **same origin** (`richardliu5764.github.io`), and each service worker's activate step **deletes every cache on the origin except its own**. Opening one trip destroys the other trips' offline caches. The multi-trip future is architecturally at war with the repo-per-trip present.
3. **Privacy leaks around the encryption, not through it.** The ciphertext is solid AES-GCM; meanwhile trip names, family identity, cities, and real future travel dates sit in the plaintext JS bundle, and a public commit message contains a reservation order number verbatim. The same PBKDF2 salt is reused across every trip, and passphrases are lowercased before derivation.
4. **The source of truth does not exist anywhere but the developer's machine.** ~50 deploys of compiled artifacts, zero source commits, zero tests, zero CI. Bus factor is exactly one laptop.

None of these are hard to fix. All of them should be fixed before the next trip ships.

---

## Severity: CRITICAL

### C1. `excurse-app-site` service worker permanently freezes the shell for returning visitors

`/home/user/excurse-app-site/sw.js` uses a **static cache name** (`excurse-v1`) and routes **everything except `*.enc` through `cacheFirst`** — including `index.html`, which is not content-hashed:

```js
const CACHE = "excurse-v1";
...
e.respondWith(url.pathname.endsWith(".enc") ? networkFirst(req) : cacheFirst(req));
```

The update chain is dead at every link:

- `index.html` is served cache-first → the cached copy (referencing old hashed asset names) is returned forever; the network is never consulted.
- The only thing that could invalidate the cache is a byte-change to `sw.js` (browsers re-fetch the SW script and compare). **Verified: `git show <sha>:sw.js | md5sum` is `86ca191b…` for all three deploys** (`d40e7e9`, `9a46544`, `b9925d6`) while `index.html` changed each time. The SW never updates, the cache name never rotates, the activate sweep never fires.
- Result: any traveler who opened the site once on June 21 is frozen on the June 21 shell until they manually clear site data. New hashed assets pushed on June 23 are unreachable garbage to them.

Note the irony: the *older* `la-fieldguide`/`durm-guide` worker got this right (per-deploy cache stamp substituted by `deploy.sh`). The flagship regressed.

**Fix:** stamp the cache name per deploy (as la/durm do), serve `index.html`/manifest with stale-while-revalidate or network-first, and keep hashed assets cache-first. Better: adopt one canonical `sw.js` shared by all shells so this class of drift can't recur.

### C2. Cross-trip cache annihilation on the shared GitHub Pages origin

All three repos deploy as **project sites on one origin**: `richardliu5764.github.io/{la-fieldguide,durm-guide,excurse-app-site}`. Service worker *registrations* are scoped per path, but **CacheStorage, localStorage, and IndexedDB are origin-scoped**. Every one of these workers does an origin-wide sweep on activate:

```js
// la/durm sw.js
for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
// excurse sw.js
keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
```

`caches.keys()` returns **all caches for the origin**, not for this SW's scope. Concretely:

- Traveler has `durm-guide` fully cached for an offline weekend. They tap the `la-fieldguide` icon once; its SW activates (with `skipWaiting` + `clients.claim`, so immediately) and deletes `excurse-20260614032819` (durm's cache) and `excurse-v1` (the shell's cache). Durm is now **dead in airplane mode**, and per C1 the excurse shell can't even repopulate correctly.
- Every deploy of any one trip re-runs the massacre.

This is the single most dangerous bug for the product's core promise: it fails silently, offline, mid-trip, for exactly the multi-trip travelers the new shell is courting.

**Fix (tactical):** namespace cache names per app (`excurse:la:{stamp}`) and only delete caches matching your own prefix. **Fix (structural):** stop sharing an origin — one origin per trip (custom domain subdomains: `la.excurse.app`) or one origin for everything with trips as data, not as repos. The origin is the real isolation boundary for SW caches, storage, *and* the crypto material below; the current layout has three apps in one apartment all holding the master key and occasionally burning each other's furniture.

### C3. No source of truth: the product exists only as compiled artifacts + one laptop

- All three repos contain **only build output**. There is no `src/`, no `package.json`, no lockfile, no `scripts/deploy.sh` (referenced by the SW comment but never committed), no tests, no CI, no build provenance.
- `la-fieldguide` has ~50 commits titled `deploy YYYYMMDD-HHMM`; the git pack is **45 MB for a ~1.5 MB site** because every deploy re-commits fresh hashed bundles and ciphertext. History is write-only noise: you cannot diff behavior between deploys, bisect a regression, or review what an AI assistant changed.
- If the developer's machine is lost, **the entire product — source, deploy pipeline, trip plaintext, and passphrases — is unrecoverable.** The deployed JS is minified and unowned.
- There is also no way to audit what was shipped: with an AI-heavy workflow, unreviewable compiled blobs are exactly where a mistake (or a poisoned dependency) hides.

**Fix:** a private source monorepo (app + composer pipeline + per-trip content dirs), lockfile committed, deploys produced by CI (GitHub Actions → Pages artifact) so every deployed byte traces to a source commit. Trip repos, if kept, become pure deploy targets with `force-push single-commit` history (or Pages deployments from CI without git history at all), killing the 45 MB pack problem.

---

## Severity: HIGH

### H1. Privacy leaks *around* the encryption

The envelope itself is fine; the metadata is not:

- **Plaintext trip registry inside the public bundle.** `assets/index-51ocJsMQ.js` hardcodes: `id: la-2026-06, name: "Liu's Angeles", start: 2026-06-20, end: 2026-06-24, where: "Los Angeles", blurb: "Family days across Little Tokyo…"` and `"Back in Durm" … Durham, NC … "A reunion weekend"`. Anyone who finds the URL — no passphrase — learns the family name, where they'll be, and **exact future dates** (a burglary/stalking window). There is even a `manifest privacy` allow-list guard (`zr()`) in the code — but the allow-listed fields *are* the leak.
- **Commit messages leak reservation plaintext.** Commit `0c969b7` in `la-fieldguide` spells out: Huntington reservation, *4 tickets, 1:00 PM entry, order W7Y-VSD-LP5Z*, and that the QR scans to the order number. GitHub Pages on the free tier requires **public** repos; if these are public, the git history is a plaintext diary of exactly what the encryption protects. Even if private today, the deploy habit is the hazard.
- **Git history retains every past `trip-data.enc`** — ciphertext under old (possibly weaker/rotated) passphrases remains fetchable forever.
- The developer's personal email is hardcoded in the bundle (`mailto:richardliu5764@gmail.com` for the inbox handoff) — harvestable, and it names the operator.
- Titles/manifests: `durm-guide` announces "Back in Durm" in `<title>`, manifest, and `apple-mobile-web-app-title` — trip identity visible to anyone probing URLs, browser history sync, etc.

**Fix:** the trip registry must live *inside* the encrypted bundle (or in a second, separately-keyed `atlas.enc`); commit messages become content-free (`deploy <stamp>`); history gets squashed/rotated; shells stay generically branded until unlock. Decide explicitly: the threat model should state that *existence, name, dates, and destination of a trip are secrets*, and then enforce it — right now the ciphertext protects the itinerary while the wrapper gives away the headline.

### H2. Crypto envelope: shared salt, lowercased passphrases, one key for everything

Envelope: `{v:1, kdf: PBKDF2-SHA256, iter:600000, salt, nonce, ct}` → AES-256-GCM, key derived non-extractable. The good: authenticated encryption, WebCrypto, 600k iterations (benchmarked ~270 ms on a desktop core → roughly 0.5–1.5 s on a phone; acceptable as a one-time unlock cost). The bad:

- **All three trips share the identical salt** (`O/IGickSf0woYu9XLwbgtA==` in la, durm, *and* excurse `trip-data.enc`). Salt reuse means one precomputed dictionary attacks every trip at once, forever. It's clearly deliberate — see H3 — but it converts PBKDF2's main defense into a constant.
- **Passphrase normalization destroys entropy**: `e.trim().toLowerCase().replace(/\s+/g,'-')`. Case is erased before derivation. Friendly for typing on a phone; also friendly for hashcat. A GPU does on the order of thousands of PBKDF2-SHA256@600k guesses/sec — human phrases like `golden hour` do not survive, and **the ciphertext is publicly downloadable** by anyone with the URL (no auth in front of the `.enc`), so offline attack is the default assumption.
- **One passphrase ≈ one key for all trips** (same salt + shared key slot, below): compromise once, read everything, including future trips.
- AES-GCM with a random 96-bit nonce per encryption is fine at this volume; not a concern.

**Fix:** fresh random salt per trip (per *edition*, even); keep normalization but compensate with generated passphrases of guaranteed entropy (e.g. 4–5 diceware words printed on the invitation — still calm, still human); per-trip keys; consider a v2 envelope with Argon2id via WASM when the source pipeline exists (WebCrypto has no memory-hard KDF). Optionally HKDF a per-trip subkey from (master passphrase, tripId) if one-passphrase UX must stay.

### H3. Key persistence & local data: "remember me" is plaintext-equivalent at rest, and storage is shared across trips

After unlock, the derived CryptoKey is stored via structured clone into IndexedDB (`tl-keys` DB, single slot `trip` — `fn(i)` at unlock). Consequences:

- **Non-extractable ≠ protected.** Any XSS on the origin, any code with origin access, or device forensics (browsers persist the key material in the profile's LevelDB) can decrypt the trip. That is a *reasonable* convenience trade-off for this product — but it must be a stated one, and it interacts badly with C2: three separately-deployed apps share the one origin that holds the key.
- **Single shared key slot** `tl-keys/trip` on a shared origin: unlocking trip B overwrites trip A's stored key. The code even anticipates the fallout: `"stored bundle decrypt failed (key rotated?) — falling to Veil"`. A traveler who last opened the other trip gets re-prompted for the passphrase — possibly offline, mid-trip. The shared salt (H2) looks like a workaround for exactly this: same salt + same passphrase → same key → collisions don't hurt. The crypto was weakened to paper over a storage-keying bug. Key the slot by trip id instead.
- **Interview answers — the most sensitive data in the product** (serious allergies, a young child, limited mobility, dates, party) — are stored in `localStorage` under `tl.plan.*`. In the older la bundle this is **plaintext JSON**. In the excurse bundle it's AES-GCM-encrypted… with a device key stored in IndexedDB `excurse/keys/draft-device-key` **on the same origin** — encryption theater against any attacker who can read localStorage in the first place. It does help against casual backup scraping, nothing more. Also: la's plaintext copies are still sitting in travelers' browsers today; nothing migrates or clears them.
- `tl.inbox.queue` (pasted TikTok/IG/Maps saves) and `tl.identity.*` (who you are) are plaintext localStorage, shared origin-wide across all trips.

**Fix:** per-trip key slots; wrap the trip key with a device key held in IndexedDB as a *non-extractable* AES key (not raw bytes); a "Forget this device" action; migrate/clear legacy plaintext `tl.plan.*`; and accept-and-document the XSS boundary — which argues for a strict CSP (currently **no CSP at all** on any shell) and zero third-party script (currently true — keep it true).

### H4. "Offline-first" is only offline-sometimes: no precache, and maps/images are never offline

- **Neither SW precaches anything at install.** The install handler is `skipWaiting()` only. Caches fill lazily per fetch. A traveler who opens the guide once at home has cached only what they touched: if they never opened a trek, `maplibre-gl-*.js` (1.03 MB / 272 KB gz) may be absent offline. The bundle does schedule a maplibre prefetch **6 seconds** after boot — good instinct, but it silently loses to a closed tab, and nothing verifies completeness.
- **After a la/durm deploy, the activate sweep leaves the new cache empty.** Sequence: SW updates → old cache wiped → traveler goes offline before re-browsing → navigation SWR finds no hit, races a dead network, returns `Response.error()`. **Deploying during a trip can brick the trip.** (~50 deploys in 11 days on la-fieldguide means this window was open constantly.)
- **Map tiles are cross-origin and deliberately never cached** (`url.origin !== location.origin → return`). Basemap is Esri World Imagery + AWS terrarium elevation. In airplane mode the "trek" renders route lines on a void. The offline map — arguably the product's flagship moment — does not exist. (Also: Esri World Imagery has licensing/attribution terms worth checking, and every pan leaks approximate trip location to Esri/AWS.)
- Day-header images (`p.image` from trip data) are `<img loading=lazy>`; if those are remote URLs they're also blank offline (unverifiable without plaintext; data-URIs would be fine).
- No `navigator.storage.persist()` request anywhere — caches and IndexedDB (including the stored key and the cached ciphertext) are **evictable under storage pressure**, and iOS is aggressive. The one graceful touch: the veil correctly says "You're offline and nothing is cached yet, open once with signal."

**Fix:** a build-time precache manifest (Workbox or 30 lines by hand) installed *before* activation, so a deploy atomically replaces a complete cache with a complete cache; keep the old cache until the new one is fully populated. Pre-bundled offline tile pack for the trip's bounding box (PMTiles is ideal: one HTTP-range-served file per trip, same-origin, cacheable, works with MapLibre) or at minimum runtime-cache tiles with an LRU cap. Inline day images or cache them. Call `navigator.storage.persist()` after unlock.

---

## Severity: MEDIUM

### M1. Layered caches fight each other on trip-data freshness (la/durm)

The app has its own bundle logic: IDB-cached envelope + `fetch(url, {cache:'no-store'})` refresh (`sn/cn/on`), comparing `ct` to detect updates. But `fetch` from the page **still goes through the SW**, and la/durm's SW routes `trip-data.enc` through **stale-while-revalidate** — so the app's "fresh" fetch is answered instantly from SW cache. The app compares the SW-stale copy to its IDB copy, sees "no change", and the *actual* refresh lands in SW cache only after the fact. Net effect: an itinerary fix (a changed LEAVE-BY time!) can take **two or three app opens** to surface. In excurse-app-site the SW is network-first for `.enc`, so only there does the app-layer logic behave as designed. Pick one owner for `.enc` freshness — the app layer, with the SW passing `.enc` through or network-first — and delete the other path.

### M2. Deploy race breaks lazily-loaded chunks in live sessions

`skipWaiting` + `clients.claim` + cache wipe while an old page is running: the old page later demands its old hashed chunk (`maplibre-gl-OLD.js`) → cache miss (wiped) → network 404 (deploy replaced it on Pages). Map dies until a manual reload. Standard fix: don't `skipWaiting` unconditionally — let the waiting worker activate on next navigation, or keep N-1 caches, or prompt ("A newer edition is ready").

### M3. PWA installability and platform quirks

- **`la-fieldguide` and `durm-guide` manifests have no `icons` at all** (`{"name":…,"start_url":"./",…}`). Chrome/Android will not offer install, and any fallback install gets a generic icon. Only the excurse manifest carries icons.
- excurse reuses the same `icon-512.png` for `purpose: "maskable"` and `"any"` — maskable crops ~20%; the mark likely gets clipped on Android.
- `apple-mobile-web-app-capable` is the deprecated meta (fine to keep, but add `mobile-web-app-capable`); `black-translucent` status bar means content underlaps the clock — presumably handled by `viewport-fit=cover` + safe-area CSS, unverified.
- iOS-specific: each project-path app installed to the home screen is its own web app but **shares the origin storage** — all the C2/H3 collisions apply to installed apps too.
- `?v=47679bf8` icon cache-busting in la/durm HTML is vestigial: the per-deploy cache makes it redundant, and excurse (where it *would* matter, per C1) doesn't use it. Symptomatic of copy-paste divergence across three shells.

### M4. Repo-per-trip + hand deploys don't scale and are already cross-wired

- The multi-trip shell hardcodes the trip registry in the compiled bundle — adding a trip means **rebuilding and redeploying the shell**, not adding data.
- The shell's Durham entry has no `bundle` field, so its unlock veil falls back to the default `trip-data.enc` — i.e., **the shell's Durham trip points at the LA ciphertext** (excurse's `trip-data.enc` is byte-different from durm's real one; a Durham passphrase against it just fails). The two-worlds problem (multi-trip shell vs. per-trip repos) is visible in the shipped bytes.
- Three shells at three versions of the same app (la ≠ durm ≠ excurse bundles; the tl/ Glide relic still deployed under `la-fieldguide/tl/` with its own fonts and no SW) — every fix must be manually re-derived three or four times. The SW regression in C1 is what that process produces.
- 45 MB git pack after one trip's iteration (see C3); at ten trips × 50 deploys this model is measured in gigabytes of dead compiled blobs.
- `deploy.sh` is invisible, so secret handling is unauditable — but note the passphrase (or plaintext trip JSON) necessarily transits the dev machine and likely shell history/env. The commit-message leak (H1) proves process, not tooling, is the current control.

**Direction:** one shell, one origin, trips as encrypted data files (`/trips/<id>.enc`) + one tiny signed/encrypted atlas index; per-trip URLs are routes, not repos. Per-trip *editions* of the shell stop existing; the C1/C2 class of bug becomes unrepresentable.

### M5. No supply-chain or integrity story

The GCM tag authenticates the *data*; nothing authenticates the *app*. Whoever can push to a repo (or a stolen `gh` token, or a Pages misconfig) ships JavaScript that captures passphrases on unlock. That's true of all web crypto — but the mitigation is boring hygiene the project currently has none of: 2FA + branch protection, CI-built artifacts from reviewed source (C3), CSP + no external script, SRI where applicable, and minimal repo count (M4). Worth stating in a THREATMODEL.md so future decisions (e.g., "should there be a backend?") answer to it.

### M6. The interview → composer pipeline has no transport

"Hand off to research & compose" sets `handed_off: true` in local state — nothing else. `Research… runs off your phone` is honest about privacy but the answers **never reach the composer** except: the traveler physically shows the developer, or the Glide inbox's `navigator.share`/`mailto:richardliu5764@gmail.com` clipboard dump (plaintext email of personal data — allergies, kids, dates — through mail providers). For the current "developer is in the room" workflow this is fine; as a product loop it's a stub, and the mailto path contradicts the privacy posture. The eventual answer (an E2E-encrypted dropbox: traveler encrypts the interview frame to the composer's public key, POSTs a blob to a dumb store) can preserve "nothing you said is sent to an outside AI" while actually delivering the data. Design it with the knowledge-graph work, not after it.

---

## Severity: LOW

- **Comment drift:** la/durm `sw.js` header says "network-first with a short timeout" while the code does SWR (the later inline comment is correct). In a project with AI-generated changes, stale comments are landmines.
- **Dead code:** the `endsWith("sw.js") → networkFirst` branch is nearly unreachable (SW script fetches bypass the fetch handler); the `/classic/` scope carve-out references a deployment that doesn't exist in any repo.
- **Unlock input:** `autocomplete="current-password"` on a bare input outside a `<form>` with no username field — password managers will inconsistently offer to save the trip code. Wrap it in a form with a hidden username (trip id) to make "remember in iCloud Keychain" reliable; that materially reduces pressure to persist keys locally (H3).
- **`excurse` SW offline fallback paths are wrong for project sites:** `caches.match("/")` / `"/index.html"` — on `…github.io/excurse-app-site/` those URLs are never cached (la/durm correctly use relative `"index.html"` / `"./"`). Only bites deep-link navigations, but it's a one-line fix.
- **`networkFirst` (both SWs) treats non-`ok` responses as success** for the caller: a 404/500 for `.enc` is returned to the app rather than falling back to the cached ciphertext. The app layer tolerates it (checks `r.ok` / first-byte `{`), but the SW contract is sloppy.
- **la/durm SW `raceNet` timeout doesn't abort the losing fetch** — harmless bandwidth waste; `AbortController` with a cloned request would be tidier (the comment about non-reconstructible navigation requests only applies to `new Request(req, init)`, not to `fetch(req, {signal})`).
- **Bundle weights are actually healthy:** index 48 KB gz, CSS 25 KB gz, fonts ~132 KB total (three variable families — consider whether Archivo earns its slot), maplibre 272 KB gz lazy + prefetch. The 1 MB map engine is the only heavyweight and it's already split. Biggest wins are not size but *completeness* offline (H4).
- **Debug backdoors** (`?debug`, `localStorage.dmDebug`) ship to travelers — benign HUD, but undocumented surface.

---

## What's genuinely good (keep it)

- The la/durm SW's *design intent* is right and unusually well-reasoned for a solo project: per-deploy cache stamps, SWR so "a weak signal never blocks boot", instant-from-cache navigations, relative-path correctness for subpath hosting.
- WebCrypto usage is idiomatic: AES-256-GCM, random nonces, non-extractable keys, 600k iterations (measured ~270 ms/derive on desktop — the phone cost is a fine one-time toll).
- App-layer resilience is thoughtful: IDB envelope cache with `ct`-diff refresh, graceful "open once with signal" veil, `manifest privacy` allow-list guard (right instinct, wrong boundary), zero third-party JS, zero telemetry, no API keys in any bundle.
- Gzipped payloads are lean; maplibre is code-split and background-prefetched.

## Top 10 actions, in order

1. Fix `excurse-app-site` SW (stamped cache, SWR shell) — travelers are frozen **today** (C1).
2. Prefix-scope every SW's cache deletion; stop cross-trip annihilation (C2).
3. Stand up the private source monorepo + CI deploys; stop committing unreviewable blobs (C3).
4. Purge/squash git history (reservation plaintext, old ciphertexts); make commit messages content-free (H1).
5. Move trip names/dates/places out of the plaintext bundle into encrypted data (H1).
6. Per-trip random salts + generated diceware passphrases; per-trip key slots keyed by trip id (H2/H3).
7. Precache manifest at install; atomic cache swap; `navigator.storage.persist()` (H4).
8. Offline map tiles per trip (PMTiles bounding-box pack, same-origin) (H4).
9. Unify on one shell + one origin, trips as data files; retire per-trip shell forks and the `tl/` relic (M4).
10. Single owner for `.enc` freshness (app layer), SW passes `.enc` through; add CSP; write THREATMODEL.md (M1/M5).

The through-line: almost every defect comes from *three divergent hand-deployed copies of one app sharing one origin with no source of truth*. Collapse that — one source repo, one shell, one origin, trips as encrypted data — and C1, C2, C3, M1, M2, M4 stop being possible categories of bug, which is the only kind of fix that honors "Enjoy the quiet."
