# Research Report — Local-First Technology Foundation for Excurse

**Role:** Research Lead, Local-First Technology
**Date:** 2026-07-02
**Scope:** Offline maps (PMTiles/Protomaps), PWA on iOS 18/26, client-side crypto, local-first sync (CRDTs), static hosting patterns — with concrete recommendations and migration costs for Excurse.

---

## 0. Executive summary

Excurse's instincts are already correct for 2026: static hosting, client-side encryption, offline-first service worker, no accounts, no backend. The state of the art has moved in Excurse's direction, not away from it. Five headline findings:

1. **Offline maps are a solved problem for exactly this shape of product.** PMTiles (Protomaps) gives a single static file per trip region, served from any static host via HTTP range requests, read natively by MapLibre GL. A city-scale trip extract is 2–70 MB. For true airplane-mode use, download the whole extract into OPFS (Origin Private File System) — there's an MIT MapLibre plugin that does precisely this.
2. **iOS is friendlier to Excurse than it has ever been.** iOS 26 opens home-screen-added sites as web apps *by default*; Safari 18.4+ has Declarative Web Push (no service worker needed), Screen Wake Lock, and a real Storage API with `persist()`. The 7-day eviction threat applies to Safari-tab usage, not installed home-screen apps in practice — but the design should still treat local storage as a cache over re-fetchable encrypted data (which Excurse already does).
3. **Crypto: PBKDF2-600k is defensible but dated.** OWASP now puts Argon2id first (min 19 MiB / t=2 / p=1; recommended 64 MiB / t=3). WebCrypto has no Argon2, but small WASM implementations (hash-wasm, openpgpjs/argon2id) run a one-time unlock in 100–400 ms on mobile. Bigger UX win: adopt the **key-in-URL-fragment invite pattern** (Excalidraw model) — a random 256-bit key in `#fragment` that never reaches any server, so invited travelers never type a passphrase; keep passphrase + PIN as fallbacks wrapping the *same* content key.
4. **Do not adopt CRDTs yet.** Excurse's data has almost no concurrent-edit conflict surface: the itinerary is compose-time authored (a re-deploy *is* last-write-wins), and traveler state (checklists, packing claims) is naturally per-user. If collaborative co-editing arrives later, Automerge 3 (Aug 2025: 10–100× memory reduction, JSON-native, same file format) is the fit for trip documents; Yjs wins only if bundle size is paramount.
5. **Hosting: consolidate to one origin, trips as subpaths.** Per-trip repos duplicate the shell, fragment service-worker scope, and make shell upgrades N deploys. Cloudflare Workers static assets (Pages is now maintenance-mode; Workers has full parity) + R2 for large blobs (zero egress, 10 GB free) is the strongest free-tier target; GitHub Pages remains a fine mirror (1 GB/site, 100 GB/mo soft cap, but no header control).

---

## 1. Offline maps for the web: PMTiles / Protomaps

### 1.1 What it is and why it fits Excurse

PMTiles is a single-file archive of a tile pyramid designed for static storage. A MapLibre client fetches *byte ranges* of the file over HTTP — no tile server, no API key, no per-request billing. The `pmtiles` JS library registers a custom protocol with MapLibre GL (`addProtocol`), after which a style source is just `pmtiles://https://…/trip.pmtiles`. It works from S3, Cloudflare R2, GitHub Pages, or any CDN that supports range requests. ([Protomaps docs](https://docs.protomaps.com/pmtiles/), [MapLibre integration](https://docs.protomaps.com/pmtiles/maplibre), [Simon Willison's walkthrough](https://til.simonwillison.net/gis/pmtiles))

Cost model: **$0 marginal.** Protomaps publishes free daily planet builds at `build.protomaps.com` / `maps.protomaps.com/builds` (OpenStreetMap-derived, ODbL attribution required). You extract your region once at compose time; hosting is your static host's bandwidth.

### 1.2 Trip-sized extracts

The `pmtiles extract` CLI cuts a sub-archive from the planet build by bbox or arbitrary GeoJSON region, and can cap `--maxzoom`:

```bash
pmtiles extract https://build.protomaps.com/20260601.pmtiles la-trip.pmtiles \
  --bbox=-118.52,33.90,-118.10,34.20 --maxzoom=15
```

Observed sizes ([docs](https://docs.protomaps.com/pmtiles/cli), [community reports](https://www.antoniogioia.com/protomaps-open-source-single-file-maps)):

| Extract | Size |
|---|---|
| Hamburg city | ~2 MB |
| Berlin, all zooms (z0–15) | ~68 MB |
| Puglia region (z≤14) | ~200 MB |
| Planet z0–6 (context layer) | ~60 MB |

Each zoom level roughly doubles file size; z14–15 dominate. **A trip footprint (a metro area plus day-trip corridors as a GeoJSON multipolygon, maxzoom 15) lands in the 10–60 MB band** — squarely inside the 10–100 MB range the offline plugin authors recommend for reliable mobile downloads. Extraction from the remote planet file is fast (range requests only), so it slots into the existing compose/deploy pipeline as one CLI step.

For street-level detail beyond OSM basemap (e.g., the 17-stop Little Tokyo pocket guide), overlay data stays in the encrypted trip JSON as GeoJSON — it does not belong in the tiles.

### 1.3 Making tiles work in airplane mode

This is the one genuinely non-obvious part. A service worker **cannot usefully cache range requests** with the Cache API (each range is a distinct partial response; MapLibre's access pattern is sparse). Three viable patterns, per the PMTiles maintainer discussion ([protomaps/PMTiles#588](https://github.com/protomaps/PMTiles/discussions/588)):

1. **Download the whole extract into OPFS** and read it locally. This is what [`makinacorpus/maplibre-offline-pmtiles`](https://github.com/makinacorpus/maplibre-offline-pmtiles) (MIT, TypeScript, v2.1.1) does: `downloadMap()` with progress events and AbortSignal, storage in OPFS ("near-native performance for very large files, without the memory overhead of IndexedDB"), `getStorageUsage()`, quota-error events. Caveat: it does not cache glyphs/sprites — those must be precached by the service worker or shipped as local assets (Excurse already self-hosts fonts, so this is one more precache entry).
2. Subpyramid extraction (multiple small per-area PMTiles files) — useful for user-selected regions in generic map apps; unnecessary for Excurse, where the region is known at compose time.
3. Individual tile caching — only for a few hundred tiles; wrong fit.

**Recommendation:** Pattern 1. On first unlock (post-decrypt, on Wi-Fi ideally), the app offers/starts a background download of `trip.pmtiles` into OPFS with a quiet progress affordance ("Preparing your maps for the road — 34 MB"). Online, MapLibre reads the remote file via range requests immediately, so the map is never blocked on the download. OPFS is supported in Safari 17+; storage quota on iOS is now up to ~60% of disk per origin (§2.2), so a 10–60 MB file is comfortable.

### 1.4 Style, glyphs, attribution

Use `protomaps/basemaps` styles (light/dark/white themes, easily tinted to Excurse's editorial palette), self-hosted glyph PBFs for Excurse's fonts, and OSM attribution in the map corner. maplibre-gl stays lazily loaded exactly as today; the `pmtiles` protocol adapter is ~30 KB.

---

## 2. PWA on iOS 18 / 26

### 2.1 What changed (and it's good news)

- **iOS 26 (shipped fall 2025): every site added to the Home Screen opens as a web app by default** — standalone chrome, own storage partition, no Safari UI. The "Open as Web App" toggle exists but defaults on. Install friction is now: Share sheet → Add to Home Screen. That's it. ([mjtsai roundup](https://mjtsai.com/blog/2025/10/03/web-apps-in-ios-26/), [Mobiloud 2026 guide](https://www.mobiloud.com/blog/progressive-web-apps-ios))
- **Safari 18.4 (iOS 18.4, spring 2025): Declarative Web Push** — push notifications *without a service worker*: the push payload is a standardized JSON the OS renders directly; no penalty for a SW failing to display; more battery- and privacy-friendly. Available to home-screen web apps on iOS/iPadOS 18.4+. Classic Web Push (VAPID) has worked for installed web apps since iOS 16.4. ([WebKit: Meet Declarative Web Push](https://webkit.org/blog/16535/meet-declarative-web-push/), [Safari 18.4 release notes](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/))
- Also landed: Screen Wake Lock (useful for a "following the trek" map screen), Badging API for installed apps.

### 2.2 Storage reality

- Per-origin quota for Safari/WebKit is now **up to ~60% of total disk** ([WebKit storage policy update](https://webkit.org/blog/14403/updates-to-storage-policy/)). Older writeups still cite a ~50 MB Cache API cap; treat that figure as historical, but verify at runtime with `navigator.storage.estimate()` and keep the *Cache API* payload small (shell only), putting large blobs (PMTiles) in **OPFS**.
- The **Storage API is fully supported since Safari 17**: `navigator.storage.persist()` requests exemption from eviction. On iOS it is not an absolute guarantee (Apple grants it heuristically — [Firtman's caveat](https://medium.com/@firt/there-is-no-persistent-storage-api-on-ios-and-you-dont-have-control-of-that-unfortunately-because-361adb5e9dc0)), so call it, but don't depend on it.
- The infamous **7-day script-storage eviction** applies to origins "with no user interaction in the last seven days of Safari use" — in practice it targets browser-tab usage; installed home-screen web apps have their own partition and are used during the trip window anyway. Still, the correct architecture (which Excurse already has) is: **everything local is a cache over a re-fetchable encrypted artifact.** Losing local state must cost one passphrase/PIN re-entry and one re-download, never data.
- Design consequence for maps: if OPFS is evicted mid-trip offline, the map degrades to no-basemap (trek lines over a neutral grid from trip JSON). Ship that fallback rendering deliberately.

### 2.3 Push, "LEAVE BY" nudges, and Live Activities

- **There is no web API for Live Activities / Dynamic Island, and none announced through iOS 26.** The honest alternatives, in ascending cost:
  1. **In-app "Now" view + Screen Wake Lock** (already Excurse's soul; zero cost).
  2. **Declarative Web Push** for time-critical nudges ("LEAVE BY 4:40 — golden hour at Griffith"). Needs a sender: a scheduled Cloudflare Worker (cron triggers) holding VAPID keys and the push subscriptions travelers opt into at unlock. Payloads can be pre-computed at compose time (the itinerary is known!), so the Worker is a dumb scheduler that never sees trip content beyond notification text — or even that can be pre-encrypted per Declarative Web Push's JSON with minimal copy ("Time to head out"). This is the single biggest "feels alive" win available to a PWA in 2026.
  3. A **companion App Clip** for true Live Activities: App Clips launch from a URL with no install (50 MB digital-invocation limit, 15 MB for QR/NFC), but require an Apple Developer account, Xcode, App Store review, and a parent app. For a solo dev whose product is a website, this is a maintenance tax out of proportion to the payoff. **Not recommended now**; revisit only if travelers demand lock-screen countdowns. ([Apple App Clip docs](https://developer.apple.com/documentation/appclip/choosing-the-right-functionality-for-your-app-clip))

### 2.4 Apple Wallet passes (.pkpass)

Real Wallet passes are feasible and match the "hand-made field guide" feeling (Huntington admission living next to boarding passes):

- Generation: [`passkit-generator`](https://github.com/alexandercerutti/passkit-generator) (Node, actively maintained, runs in Cloudflare Workers too). Requires an **Apple Developer Program membership ($99/yr)**, a Pass Type ID certificate, and the **WWDR G4** intermediate cert. Signing happens at *compose time* on the developer machine — passes are static files.
- Distribution: serve `.pkpass` with MIME `application/vnd.apple.pkpass` from static hosting; tapping it in Safari opens the Add-to-Wallet sheet. No server needed unless you want pass updates (that requires the pass web service protocol — skip it; trips are short-lived).
- Privacy note: pass contents (name, reservation code) are signed *plaintext* inside the pkpass — they sit outside the encryption envelope. Acceptable for tickets; keep them out of the public repo by hosting behind the unguessable trip slug, or wrap the pkpass itself inside the encrypted bundle and emit it client-side via a blob URL download (works in Safari).
- The existing in-app QR wallet remains the offline-guaranteed path; Wallet passes are an additive nicety. **Verdict: adopt, low effort, at compose time only.**

---

## 3. Client-side crypto

### 3.1 KDF: Argon2id over PBKDF2

- Current envelope: PBKDF2-SHA256, 600k iterations — exactly OWASP's floor *for FIPS-constrained systems*. The [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) now ranks **Argon2id first** (minimum m=19 MiB, t=2, p=1; stronger profile m=64 MiB, t=3, p=1). PBKDF2 is not memory-hard; GPU rigs chew through human passphrases at 600k iterations far faster than through Argon2id at 64 MiB.
- WebCrypto still has **no Argon2** — use WASM: [`hash-wasm`](https://www.npmjs.com/package/hash-wasm) (mature, tiny per-algorithm modules) or [`openpgpjs/argon2id`](https://github.com/openpgpjs/argon2id/) (RFC 9106, tuned for bundle size). Benchmarks: ~10 ms/iteration at 8 MB, ~390 ms at 256 MB; a 64 MiB/t=3 unlock is roughly 200–500 ms on a modern iPhone — imperceptible for a once-per-trip unlock. Run it in a **Web Worker** to keep the unlock animation smooth; on memory-constrained mobile Safari, catch WASM memory failures and fall back to m=19 MiB/t=2.
- **Envelope v2:** `{v:2, kdf:"argon2id", m,t,p, salt, nonce, ct}`; keep the v1 PBKDF2 path for already-deployed trips. Fresh random salt *and* nonce on every re-deploy (AES-GCM nonce reuse under the same key is catastrophic; re-deriving with a fresh salt sidesteps it entirely).

### 3.2 The bigger win: key-in-URL-fragment invites (Excalidraw pattern)

The passphrase is a UX tax and the weakest link (human-memorable entropy). The state-of-practice pattern ([Excalidraw's E2EE writeup](https://plus.excalidraw.com/blog/end-to-end-encryption)):

- Generate a random 256-bit **content key** per trip. Encrypt trip-data with it directly (no KDF in the hot path).
- The invite link is `https://…/t/marfa-june#k=<base64url-key>`. **URL fragments are never sent in HTTP requests** — the host, CDN, and any logs never see the key. On open, the app reads the fragment, immediately strips it via `history.replaceState`, and re-wraps the content key locally under the traveler's chosen PIN (Excurse's existing PIN re-wrap slot).
- Passphrase becomes a *fallback wrap*: the same content key additionally wrapped by Argon2id(passphrase) stored in the envelope, for travelers who received the words verbally or lost the link.
- Threat-model deltas to document honestly: the fragment key lives in the shared message (Signal/iMessage — fine; email — weaker), in browser history until replaced, and would be exposed to any third-party JS (Excurse ships none — keep it that way; also scrub fragments from any future error reporting, cf. [Sentry fragment-scrubbing](https://romain-clement.net/articles/sentry-url-fragments/)). Link previews are safe: preview fetchers request the URL without the fragment.

This turns the invite into: tap link → guide opens, already yours → set a 4-digit PIN. Zero typing. That *is* the spirit of the product.

### 3.3 Odds and ends

- Keep AES-256-GCM via WebCrypto (correct choice; hardware-accelerated).
- Consider chunked encryption (per-day or 64 KB AEAD chunks with a streaming format) only if trip-data grows past a few MB with embedded images; today's single-blob design is simpler and fine.
- PIN wrap: a 4–6 digit PIN has ~13–20 bits of entropy; its only job is local convenience. Wrap with Argon2id at the light profile and store a strike counter; on N failures, fall back to the full key. This is already broadly what Excurse does — just upgrade the KDF.

---

## 4. Local-first sync (if trips become collaborative)

### 4.1 State of the field, 2025–26

- **Automerge 3** (Aug 2025) rearchitected around its compressed columnar format at runtime: **10×–100× memory reduction** (Moby Dick paste: 700 MB → 1.3 MB), massive load-time wins, same file format as v2, JSON-document model, Peritext rich text, `automerge-repo` for storage/sync plumbing, WASM-based (~300 KB+). ([Automerge 3.0 announcement](https://automerge.org/blog/automerge-3/))
- **Yjs** remains the ecosystem king for collaborative text (Tiptap, Hocuspocus), no WASM, smallest bundles, but its update log grows and its model is shared-types rather than plain JSON. ([2026 comparisons](https://www.pkgpulse.com/guides/yjs-vs-automerge-vs-loro-crdt-libraries-2026), [crdt-benchmarks](https://github.com/dmonad/crdt-benchmarks))
- **Loro** is the fast newcomer (Rust/WASM) worth watching but younger.
- Counter-current worth heeding: several teams have publicly *walked back* from CRDTs where their data wasn't actually concurrently edited ([PowerSync/Cinapse postmortem](https://powersync.com/blog/why-cinapse-moved-away-from-crdts-for-sync)) — CRDTs are for merging concurrent edits to *shared* state, and they cost bundle size, history growth, and conceptual load.

### 4.2 Applied to Excurse: the conflict surface is tiny

Partition the data honestly:

| Data | Writers | Conflict potential | Right mechanism |
|---|---|---|---|
| Itinerary/guide content | Composer (Richard + AI) | None (single author) | Re-deploy = LWW. Version field in envelope; SW picks up new `trip-data.enc` via stale-while-revalidate (already built) |
| Per-traveler state (checklists done, outfits, "You") | One traveler, own devices | Same-user multi-device only | LWW key-value with timestamps, synced as an encrypted blob |
| Shared traveler state (packing claims: "I've got sunscreen"; loose-end assignment) | Multiple travelers | Low — small sets, rare true concurrency | LWW-map with per-key timestamps, or a tiny OR-set; does **not** require Automerge/Yjs |
| Glide inbox (pasted saves) | Multiple travelers | Append-only | Grow-only set — trivially mergeable |

**Recommendation: no CRDT library now.** Build a minimal sync layer when sharing is needed: each device periodically PUTs its encrypted per-traveler delta blob to a keyspace (Cloudflare Worker + KV/R2, key = trip-slug/traveler-id/device-id) and GETs peers' blobs; merge client-side with per-key LWW + grow-only sets. The server stores only ciphertext (content-key-encrypted — the invite key doubles as the sync encryption key), preserving the zero-knowledge posture. This is ~200 lines of client code and a ~50-line Worker.

**Trigger for revisiting CRDTs:** the day two travelers can *edit the same free-form list or note offline simultaneously* (e.g., co-editing a day plan). Then choose **Automerge 3** — JSON-document model maps 1:1 to trip JSON, encrypted update blobs sync through the same dumb Worker, and its Git-like history even suits a "what changed in your guide" digest. Yjs only if the 300 KB WASM (lazy-loadable, like maplibre) proves unacceptable.

---

## 5. Static hosting patterns

### 5.1 Per-trip repo vs. per-trip subpath

Current: one repo (= one origin/subdomain) per trip. Costs observed: shell bundle duplicated per trip (~50 deploys on la-fieldguide alone), fixes must be re-deployed N times, each origin has separate SW + storage, and the multi-trip "All trips" shell fights the one-repo-per-trip layout.

**Move to: one origin, one deploy pipeline, trips at `/t/{unguessable-slug}/`.**

- One service worker at root scope handles the shell for all trips; per-trip assets (`trip-data.enc`, `{slug}.pmtiles`, pkpass) are content-addressed and cached on unlock.
- One shell upgrade ships to every trip at once (SW stale-while-revalidate already handles rollout).
- Same-origin storage is shared across trips — already handled by prefixed keys (`tl.` legacy shows the discipline exists); quota is pooled, which *helps* (one 60%-of-disk budget).
- Privacy: slugs are 128-bit random; the repo/bucket listing is not public; robots/noindex headers. Trip content remains encrypted regardless — the slug only gates *discovery* of ciphertext.
- Keep the option of a vanity per-trip *path* name in the invite (slug can be `marfa-x7Qk9…`).

### 5.2 Host choice

| | GitHub Pages | Cloudflare Workers (static assets) + R2 |
|---|---|---|
| Price | Free | Free tier: static asset requests **free/unmetered**; 100k Worker invocations/day; R2 10 GB storage, **zero egress** |
| Site size | 1 GB/site (soft), 100 GB/mo bandwidth (soft), 10 builds/hr | Effectively unbounded for this use (R2 for pmtiles) |
| Custom headers | **No** (no Cache-Control control, no COOP/COEP, no MIME overrides) | Full control (`_headers`, immutable caching, `application/vnd.apple.pkpass`) |
| Range requests (PMTiles) | Works (CDN-backed) | First-class (R2/Workers documented PMTiles target) |
| Dynamic bits later (push scheduler, sync Worker, pass service) | Impossible | Same platform, same deploy |
| Atomic deploys, previews | Weak | Built-in |

Note: **Cloudflare Pages is in maintenance mode** — as of 2025–26 Cloudflare directs new projects to **Workers with static assets**, which reached full parity (static hosting, SPA routing, custom domains) and is where all investment goes. ([Cloudflare migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/), [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits))

**Recommendation:** Cloudflare Workers static assets on an Excurse apex domain; `trip-data.enc` + PMTiles + pkpass in R2 (or as static assets while small); GitHub stays as the source-of-truth monorepo with CI deploy (wrangler). Optionally keep a GH Pages mirror as a break-glass fallback — the client is host-agnostic by design.

---

## 6. Consolidated recommendations & migration costs

Priority-ordered; effort in solo-dev days, assuming AI-assisted development.

| # | Recommendation | Why | Effort | Risk |
|---|---|---|---|---|
| 1 | **Monorepo + single origin on Cloudflare Workers, trips at `/t/{slug}/`** | Kills N-deploy tax; enables headers, R2, future Workers | 2–3 d (pipeline + SW scope rework + redirects from old repos) | Low; old URLs redirect |
| 2 | **PMTiles per trip: `pmtiles extract` in compose pipeline + `maplibre-offline-pmtiles` OPFS download on unlock** | True offline maps, $0, on-brand ("works in airplane mode") | 3–4 d (pipeline step, style theming, glyphs precache, no-basemap fallback) | Medium: OPFS eviction edge cases; mitigated by graceful degrade + re-download |
| 3 | **Crypto v2: random content key + `#k=` fragment invites; Argon2id (hash-wasm, 64 MiB/t=3, worker thread) for passphrase/PIN wraps; v1 fallback** | Removes passphrase typing (the whole invite UX), upgrades KDF to OWASP-first | 2–3 d incl. envelope migration + history/fragment hygiene | Low; well-trodden pattern (Excalidraw) |
| 4 | **Declarative Web Push "LEAVE BY" nudges via scheduled Worker** (opt-in at unlock) | Only 2026-real substitute for Live Activities; makes the guide feel alive | 2–3 d (VAPID, subscription storage in KV, cron Worker, compose-time schedule emission) | Medium: first backend component; keep payloads content-minimal |
| 5 | **Compose-time `.pkpass` generation (passkit-generator)** for reservations, delivered from behind the slug or from inside the encrypted bundle | Tickets where travelers expect them; static, no pass-update service | 1–2 d + $99/yr Apple Developer | Low |
| 6 | **Defer CRDTs; when sharing lands, ship encrypted LWW-blob sync via a tiny Worker** (per-traveler blobs, grow-only inbox) | Matches actual conflict surface; preserves zero-knowledge | 2–3 d when needed | Low |
| 7 | Revisit **Automerge 3** only when true concurrent co-editing of shared lists/notes is a requirement | JSON model + encrypted update sync fit; 300 KB lazy WASM | 5+ d when triggered | Medium |
| — | Explicit non-recommendations: **App Clip companion** (review + native tax ≫ payoff), **hosted tile APIs** (key management, cost, privacy leak of trip location), **accounts/backend database** (against the spirit) | | | |

**Sequencing note:** items 1–3 are the foundation overhaul and compound (single origin makes OPFS quota, SW scope, and fragment invites cleaner); 4–5 are delight layers; 6–7 are contingent.

---

## Sources

- Protomaps/PMTiles: [PMTiles concepts](https://docs.protomaps.com/pmtiles/), [MapLibre plugin](https://docs.protomaps.com/pmtiles/maplibre), [CLI/extract](https://docs.protomaps.com/pmtiles/cli), [basemap downloads/daily builds](https://docs.protomaps.com/basemaps/downloads), [PMTiles repo](https://github.com/protomaps/pmtiles), [offline discussion #588](https://github.com/protomaps/PMTiles/discussions/588), [maplibre-offline-pmtiles](https://github.com/makinacorpus/maplibre-offline-pmtiles), [Simon Willison TIL](https://til.simonwillison.net/gis/pmtiles), [Antonio Gioia on Protomaps](https://www.antoniogioia.com/protomaps-open-source-single-file-maps), [Eric Samson: No Server, No Problem](https://ericsamson.com/writing/tech/pmtiles/)
- iOS/PWA: [Web Apps in iOS 26 (mjtsai roundup)](https://mjtsai.com/blog/2025/10/03/web-apps-in-ios-26/), [WebKit: Meet Declarative Web Push](https://webkit.org/blog/16535/meet-declarative-web-push/), [WebKit Safari 18.4 features](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/), [WebKit storage policy updates](https://webkit.org/blog/14403/updates-to-storage-policy/), [MDN storage quotas & eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria), [Firtman on iOS persistent storage](https://medium.com/@firt/there-is-no-persistent-storage-api-on-ios-and-you-dont-have-control-of-that-unfortunately-because-361adb5e9dc0), [Mobiloud PWA iOS 2026](https://www.mobiloud.com/blog/progressive-web-apps-ios), [MagicBell PWA iOS limitations 2026](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)
- Wallet/App Clips: [passkit-generator](https://github.com/alexandercerutti/passkit-generator) (+ [certificates wiki](https://github.com/alexandercerutti/passkit-generator/wiki/Generating-Certificates)), [Apple: App Clip functionality](https://developer.apple.com/documentation/appclip/choosing-the-right-functionality-for-your-app-clip), [Adapptor App Clips guide](https://www.adapptor.com.au/blog/mastering-apple-app-clips-a-developer-s-guide-with-a-completed-example)
- Crypto: [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [hash-wasm](https://www.npmjs.com/package/hash-wasm), [openpgpjs/argon2id](https://github.com/openpgpjs/argon2id/), [antelle argon2-browser benchmarks](https://antelle.net/argon2-browser/), [Excalidraw E2EE blog](https://plus.excalidraw.com/blog/end-to-end-encryption), [Sentry fragment scrubbing](https://romain-clement.net/articles/sentry-url-fragments/)
- CRDTs: [Automerge 3.0](https://automerge.org/blog/automerge-3/), [Yjs vs Automerge vs Loro 2026](https://www.pkgpulse.com/guides/yjs-vs-automerge-vs-loro-crdt-libraries-2026), [crdt-benchmarks](https://github.com/dmonad/crdt-benchmarks), [Cinapse: moving away from CRDTs](https://powersync.com/blog/why-cinapse-moved-away-from-crdts-for-sync), [Loro benchmarks](https://loro.dev/docs/performance)
- Hosting: [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/), [Pages→Workers migration](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/), [R2 pricing (zero egress)](https://developers.cloudflare.com/r2/pricing/), [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
