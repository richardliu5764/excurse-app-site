# Excurse — Complete App Anatomy (flagship shell, `excurse-app-site`)

Source: beautified Vite bundle `beautified/app-index.js` (7,210 lines, read in full), `beautified/app-style.css` (5,100 lines, structural skim), plus `excurse-app-site/sw.js`, `index.html`, `trip-data.enc`. The app is **Preact + @preact/signals** (first ~2,250 lines are the framework runtime), no router, no external state library. One lazily-loaded companion chunk: `maplibre-gl-B2VbC6cG.js` (~1MB), prefetched 6s after boot.

---

## 1. Top-level architecture & navigation state machine

Root component `Yi()` holds four pieces of state: `tripId`, `mode` (`plan` | `explore`), `trip` (decrypted, in memory only), `viewer` (party-member id). There is no URL routing at all — everything is component state, so deep links/refresh always restart at the Atlas.

Screen graph:

```
Atlas "Your trips" (Ur)  ──open──▶  ModeBar (Ji: Trips | Plan / Explore)
                                       ├─ mode=plan    → Plan/Interview (wi)
                                       └─ mode=explore → Veil unlock (Ni) → Splash (Hi)
                                                          → Tab shell (qi):
                                                            Now (or) · Days (sr) · [Wallet sheet dr]
                                                            · Prep (Cr) · You (kr)
                                                            + Day-Trek map overlay (er)
```

`document.documentElement[data-mode]` tracks context — `shape` (atlas), `dream` (plan mode, dark indigo `#161826`), `field` (explore, paper/white, font-size bumped to 112.5%). CSS also defines an unused-by-JS `afterglow` mode (post-trip warm palette — designed, never wired).

### Trip registry (the manifest problem)
`jr` is a **hardcoded array baked into the JS bundle**:

- `la-2026-06` "Liu's Angeles", Jun 20–24 2026, `status:live`, `bundle:"trip-data.enc"`, accent `#A05A22`, palette `la-summer`, blurb "Family days across Little Tokyo, the eastside and the coast."
- `durham-2026-10` "Back in Durm", Oct 16–19 2026, `status:planning`, **no bundle**, palette `pacific`, "A reunion weekend, still taking shape."

User-created drafts are appended from `localStorage["tl.atlas.drafts"]`. A genuinely clever guard, `zr()` ("manifest privacy"), **throws at runtime if a TripSummary carries any field outside the allow-list** `[id,name,start,end,status,accent,palette,bundle,blurb,where]` — a structural guarantee that no trip *content* ever leaks into the unencrypted shell layer. But the registry itself requires a rebuild+redeploy per trip; the shell is not data-driven.

Atlas UI: brand fern glyph + "Excurse *by RL*", "Your trips / Pick one to walk it, or start one to plan it.", tiles with status pill (Ready/Planning/Draft), where, name, dates, blurb, CTA "Walk the days →" / "Keep planning →", and a "+ Plan a new trip" tile ("A few quiet questions, then I research and compose it.") which names a draft and jumps into the interview.

---

## 2. Crypto, unlock, and session model

### Bundle envelope
`trip-data.enc` is JSON: `{"v":1,"kdf":"PBKDF2-SHA256","iter":600000,"salt":b64,"nonce":b64,"ct":b64}`.

### Unlock (Veil, `Ni`)
1. `cn()` loads the envelope: IndexedDB cache (`tl-keys` DB, store `k`, key `bundle:<url>`) first — with a background 4s-timeout refresh — else Cache API match, else network fetch (8s timeout, `cache:no-store`, sniffs first char `{` and logs non-JSON bodies). Fetched envelopes are written back to IDB.
2. Passphrase is normalized (`trim().toLowerCase().replace(/\s+/g,'-')`) → PBKDF2-SHA256 @600k iterations → **AES-GCM-256, non-extractable, `decrypt`-only** CryptoKey.
3. AES-GCM decrypt → JSON → `Ge()` normalizer → app.
4. **The CryptoKey object itself is persisted to IndexedDB** (`tn('trip', key)`). This is the "fast path": on the next explore entry, stored key + cached envelope decrypt silently with no passphrase; a fresh envelope is also fetched and **hot-swapped if `ct` differs** (live plan updates without user action). Failure messages distinguish "key rotated?" vs offline. `Re-lock guide` in **You** deletes the stored key and reloads. Note: the passphrase is never stored; the non-extractable key can't be exported by script. There is **no PIN re-wrap in this flagship shell** — that exists only in the older/classic bundle (`classic/` edition, linked from You).
5. Offline with nothing cached → "You're offline and nothing is cached yet, open once with signal."

Copy: "A private itinerary, for invited travelers only." Error: "That code didn't open it. Try again." (with CSS shake).

### Plan-draft encryption (separate system)
Interview state is encrypted **at rest** with a per-device random AES-GCM-256 key (`draft-device-key` in IDB `excurse/keys`), stored as `localStorage["tl.plan.<tripId>"] = "enc:"+b64(iv‖ct)`, debounced 400ms, with legacy plaintext fallback on read. (Inconsistency: packing items, inbox queue, identity, checkmarks are all *plaintext* localStorage — see §10.)

### Service worker (`sw.js`)
`excurse-v1` cache. `skipWaiting` + `clients.claim`; deletes older caches on activate. Same-origin GETs only: `*.enc` → **network-first** (fresh plan lands, cached ciphertext as fallback); everything else → **cache-first** with navigation falling back to cached shell. Cross-origin (map tiles) never cached. Versioning = bump the cache constant; assets are content-hashed. "Check for updates" in You is just `location.reload()`.

---

## 3. The trip-data schema (both layers)

`Ge()` accepts either the runtime shape (`{meta, days, …}`) directly or the **authoring shape**, adapted by `We()` — so the composer AI's output format is fully recoverable from the adapter:

### Authoring schema (what the composing AI emits)
```jsonc
{
  "trip": {
    "title", "dates": {"start","end"},
    "frame": { "party":[{"id","name"}], "tz", "palette", "soul" },
    "days": [{
      "date", "image", "image_credit",
      "theme", "cluster", "energy_arc",          // → briefing{theme, geography, energy}
      "blocks": [{
        "id", "type",     // anchor | planned_item | decision_point | backup | freeform
        "title",
        "time_window": {"start","end"},          // "HH:MM"
        "participation": ["personId"],           // default: whole party
        "why_this_for_you", "heads_up", "outfit",
        "confirmation": {"number", "details":[{"label","value"}]},
        "logistics": {"travel_from_prev" /* "NN min …" parsed */, "parking", "entry"},
        "constraints": {"leave_by"},
        "location": {"coords":[lat,lng], "address", "maps_query", "phone",
                     "from":{"name","coords"}, "to":{...}},   // legs → flight arcs
        "sources": ["label"], "verified": {"status","checked_on"},
        // decision_point only:
        "decide_by", "options":[{"title","suspected_fit","pros":[],"cons":[],"location"}],
        // backup only:  "activates_when"
        // freeform only: "suggestions": ["key fact shown on card"]
      }]
    }],
    "guides": [{ "after_block": blockId,          // "here if you need it" pocket list
                 "entries":[{"name","hours","line","why","location","kind"}] }],
    "key_info": [{"kind":"address"|"note", "label","value","related",
                  "group":"lodging", "coords"}],
    "outfits":  [{"id","label","count","why"}],
    "packing":  [{"category","items":[{"item","reason"}]}],
    "open_loops":[{"id","task","deadline","unblocks","done"/"status","note"}]
  }
}
```

### Runtime schema (what the UI consumes)
`meta{name,tz,start,end,accent,soul,party}`, `lodging{name,coords}` (from lodging key_info coords), `days[{date,image,imageCredit,briefing,blocks}]`, `wallet[]`, `packing{demands,checklist}`, `loose_ends[]`, `inbox:[]`, `cut_list:[]` (both always empty — schema ahead of implementation).

Per-block runtime: `species`, `start/end`, `who[]`, `booked` (anchor or has confirmation number), `logistics{travel_min,drive,park,entry}`, `coords`, `leg{from,to}`, `links{map (Apple), map_g (Google), phone, wallet_ref}`, `receipts{confidence: solid|single_source|struck, sources[{label,checked_at}]}`, `decision{prompt,decide_by,options[{our_read,tradeoffs{plus,minus}}]}`, `backup{activates_when}`, `key_fact`, `options_guide`.

Notable adapter details:

- **Redaction sentinel**: `J()` drops any string containing `«` — unfilled template placeholders from the composer silently vanish instead of rendering.
- Palette→accent map `Ie`: la-summer `#A05A22`, golden-hour `#B0541F`, pacific `#2F6B4D`, marine-layer `#43677B`, matcha `#4E6628`, ktown-neon `#A82568`, paper `#2F6B8A`.
- `verified.status: "single-source"|"unconfirmed"` → confidence `single_source` (UI renders a "Call ahead" phone chip and a `single` card treatment).
- **Wallet is derived, not authored**: every block with a confirmation number/details becomes a pass, grouped by code; kind classified by title regex (`lands|flies|flight`→flight, `rental|car`→car, `airbnb|check into|lodg`→stay, else ticket). Multi-day flights renamed "X · flights", multi-day car → "The rental car". All stay passes + lodging-group key_info are **fused into one synthesized "w-lodging" card** with `§Where` (address, apple-maps link), per-stay sections, and `§Codes & access` (keypad/wifi rows). Remaining key_info become `policy`/`other` cards.
- Loose-end kind classified from task text (`book|reserve`→book, `call|phone`→call, `confirm|check|verify|decide|poll|lock`→decide, `buy|ticket|pack`→buy).

---

## 4. Explore shell (`qi`) & personalization

Tab bar: **Now · Days · [wallet button] · Prep · You**. Navigation uses the **View Transitions API** with directional slide (`data-navdir`) or shared-element **morph** (`mn()` sets `viewTransitionName` on the clicked element; `hn()` cleans up), reduced-motion honored, 1.25s safety timeout.

**Splash (`Hi`)**: procedurally-generated fern fronds (5 hand-drawn bezier archetypes; each leaf "uncoils" by rotating control points with an eased coil angle; seeded mulberry32 RNG; 41 leaves in three depth layers) around the trip name, dates ("June 20 to 24"), and either "Welcome, ‹name›" or the picker "Who's traveling today?". A fallback veil (`Ui`) asks "Who's holding this phone? — Names, checklists and the Now view adapt to you. Change anytime in You."

**Identity model**: `viewer` = party-member id in `localStorage["tl.identity.<tripId>"]`. Everything personal is keyed `tl.<tripId>.<viewerId>.<key>`: packing checks (`pk.*`), outfit items (`fit2.<demand>.<slot>`), user packing adds (`pkuser.<cat>`), loose-end checks (`le.*`); guide-entry "visited" marks are `tl.<trip>.seen.<blockId>.<name>`. Global prefs are `tl.theme|palette|typestyle|ts|uistyle`. Legacy `tl.` prefix everywhere = the Glide/TL heritage.

**You (`kr`)**: viewing-as switcher; appearance System/Light/Dark; 7 palettes (Paper, LA Summer, Pacific, Golden Hour, Marine Layer, Matcha, K-Town Neon — each with a dark variant in CSS); type style Display/Editorial/Soft (swaps display face treatment); text size Default/Large; **UI style Excurse vs "Drift"** — a full second skin ("aurora glass: the light drifts with your palette") implemented as ~500 lines of `html[data-style="drift"]` overrides with animated gradient sky layers; **Edition → `classic/`** (the legacy shell ships alongside in the same repo); this-device: Re-lock guide, Check for updates, a viewport-metrics debug readout (`wr`); map-debug-overlay toggle with charmingly honest hint text about framerate cost.

`Er()` applies all prefs as `data-*` attributes and syncs `<meta theme-color>` to the computed body background. Quirk: the trip accent custom property is only applied when palette=paper and light mode.

Also: `--vvh` visual-viewport hack with an iOS-standalone minimum-scale nudge loop (checks 24 times × 150ms and momentarily rewrites the viewport meta to force a reflow) — hard-won iOS PWA scar tissue.

---

## 5. Now view (`or`) — the temporal engine

A 1s-tick signal (`Ot`) drives re-render. `jt()` converts now into trip-timezone `{date,time,hour}` via `Intl.DateTimeFormat('en-CA')` parts. Greeting: Good morning/afternoon/evening + viewer name.

Trip phase `Pt`: **before** → "N DAYS OUT" hero, "your trip is taking shape", plus `ar` "get ahead" rails: top-3 undone loose ends by due date, "Ready in your wallet" (the viewer's flight pass, matched by *name inclusion in the pass title*), and packing progress bar. **after** → "Welcome home. ‹trip›, in the books."

**during** — `It()` scans days/blocks (skipping `backup`, blocks without start; end defaults to start+60min):
- `current`: started, not ended, **viewer participates** (`who` includes viewer or is everyone)
- `next`: first future participating block
- `meanwhile`: nearest block the viewer is *not* in — rendered as "meanwhile · 4:00 PM · Nap window (just Dad)"

Hero card (tap → jump to that block in Days, morphing): **LEAVE BY HH:MM** (start − parsed `travel_min` − 10min buffer) when the block is upcoming; a countdown ring (`rr`, fraction of a 3-hour window); big clock; "in 2h 15m" / "happening now" / "earlier today" / "coming up"; title, key_fact, why-this-for-you (serif voice), getting-there row. A `timeshift` control (‹ · ›, "back to now") steps an offset through the flattened whole-trip schedule — you can walk the plan forward/backward from Now. Below: the current block's wallet pass peek, and "later today" (next ≤3 same-day blocks).

No candidate block → **"Open evening. / Nothing scheduled, exactly as planned."** — the product's thesis in one empty state.

---

## 6. Days (`sr`) & block cards (`En`)

Day chips D1…Dn (morph transition + scroll reset, "dayroll" animation). Day header: optional hero image, "Day N", long date, voice theme line ("Golden Hour"), geography+energy meta row, and "Show the day's trek" (only if ≥2 mappable stops).

Blocks render on a rail (`railnode` variants for decision/backup) as `<details>` cards (a global click handler animates all details open/close with WAAPI height tweens):

- meta row: anchor **lock icon**; decision **"your call · N options · by Fri"** fork-tag; backup **"in your pocket · ‹activates_when›"**; time range "10:00 AM–1:00 PM"; who ("everyone" / "just you" / "you + Maya" via `xn`); "· booked ✓".
- body: `why_this_for_you` as a tappable clamped **voiceline** (expands with height animation); Heads up / Getting there / Parking / Entry / Wear sections; decision options with "our read · …", "+ pros", "− cons"; action chips **Apple Maps / Google Maps / Call** (becomes accent-colored "**Call ahead · ‹phone›**" when confidence is `single_source`) / confirmation-code chip that opens the wallet; **receipts footer** "from: LA Conservancy · … " with a `struck` state showing check date.
- past blocks (tz-aware, end<now) get dimmed `past` class; backups render as ghosts.
- `On` — the **options guide flap**: "here if you need it · 17 ideas" / "3/17 checked off", each entry with a visited tick, name, hours, one-liner, why, Map link. This is the Little Tokyo pocket-guide mechanic, persisted per block.

---

## 7. The Day Trek map (`er`) — ~2,500 lines, the crown jewel

`Bn()` compiles a day into an ordered stop list: dedupes consecutive identical coords; `decision_point` options with coords become a **fork** waypoint at the centroid with labeled branches; `location.from/to` legs become **arc** annotations (`dir: in|out`) for flights; lodging is prepended/appended as "From/Back to the ‹home base›" unless the day starts/ends with an arc.

Map: **MapLibre GL, lazy-imported**, style built inline — Esri World Imagery satellite raster + AWS Terrarium raster-DEM terrain (exaggeration 0.18), globe projection, dark void, sky/fog. Non-interactive during the show.

**Cinematic choreography** — a phase list compiled per day: `intro` (slow globe spin under the "Day N" title card) → optional `approach` (fly to origin, draw the flight arc while panning) → `dive` (staged zoom cascade 4→12.2 then tilt to pitch 45) → per stop: `ride` (quadratic-bezier trail `Q()` drawn progressively at ~30fps with a chasing camera easing through checkpoint frames), `arrive`, `dwell` (label bubble appears and **typewrites** the title at 34ms/char, then minimizes), forks get `fork-in`/`fork-out` with dashed branch lines animated in/out, flights flatten-zoom-draw a dashed great-arc → `finale` settles to a bounds-fit final camera. Before playing, a **tile pre-warm tour** jumps the camera through every planned framing ("mapping your day… 43%") so playback never stutters on tile loads. Tap anywhere = skip: `finishAll()` draws every trail/marker instantly and frees the camera (all gestures re-enabled, "Open in Google Maps" directions chip appears — origin/waypoints/destination deep link).

Rendering details worth stealing: 3-layer line treatment (blur glow, translucent white casing, gradient core using `line-progress` interpolation seeded from `--trip-accent`); a **label-placement optimizer** (16 candidate offsets per bubble, cost = off-screen penalty ×50 + pairwise overlap area ×1.5, falls back to a mini pill with directional arrow attribute) re-run on every `moveend`; safe-area-aware top margin measured via a probe div.

**Resilience**: not online / <2 stops / WebGL context lost >3.5s / load >12s / any exception → an **SVG "offline sketch"** fallback: the same stops as a quadratic path animated by `stroke-dashoffset`, positioned bubbles, footnote "offline sketch · satellite view needs signal". Reduced-motion jumps straight to the finished map. Visibility change/pagehide stop all rafs/timers.

**Debug rig**: `?debug` or `localStorage.dmDebug` → HUD (phase log, fps EWMA, worst frame, tile-wait cap hits) plus a **jank classifier** flagging ZOOMREV / ZOOMJUMP / PITCHJUMP / BEARJUMP / DOTSNAP / DOTREV / HITCH with a red "⚡ CUT" flash; opt-in red-void + tile-boundary grid; `window.__dm` console API (`frame(i)`, `tipOf(i)`, camera constants). A settings toggle in You explains it in plain English. This is a developer who was fighting camera jank empirically.

---

## 8. Wallet (`dr`/`ur`)

Bottom sheet over any tab. Cards sorted flight < stay < car < ticket < other < policy, colored edge band per kind (Drift skin varies band art per kind). Tap to expand (accordion, one active): big confirmation code (monospace, tap-to-copy with "· copied", only when it looks like a code `/^[A-Z0-9-]{4,16}$/i`, otherwise rendered as a note), rows with `§Section` headers (Where / stay names / Codes & access), label/value rows, note rows, chips Call / Apple Maps / Google Maps (Google URL re-derived by parsing the Apple `?q=`). Deep-linked from Now hero, block cards, and the pre-trip flight peek. QR codes exist in the la-fieldguide classic edition, not in this shell's code.

---

## 9. Prep (`Cr`) — Packing · Loose ends · Backups · Inbox

Segmented control with count badges (packing total, open loose ends, backup count).

**Packing (`_r`)** — two-layer model:
1. "**Outfits the trip asks for**" — `packing.demands` (from authored `outfits[]`, each with count ×N and a voice `reason`). Each demand expands into slot rows — top / bottom / shoes / socks / extras with **recommended counts** (`rec`: shoes always 1, extras 0, others = outfit count). You add your own garment chips per slot (tap chip → × to remove); stored per viewer.
2. "**The checklist**" — the authored categories (minus any "Cloth*" category, which is replaced by the synthesized "Clothes · your outfits" whose items are exactly the garments you built above — the "Build outfits above, or add items below" loop). System items carry a spark icon ("suggested by your planner") + reason; users append their own per category. Progress ("14 of 31 packed", % bar) is shared with the Now pre-trip rail.

**Loose ends (`vr`/`yr`)**: sorted by due; done = authored `done`/`status` OR local per-viewer check; long labels/notes expand with animated height; due chips "by 06-18"; done items collapse into "Done · N, tap to review"; empty state **"Every loose end is tied. Enjoy the quiet."**

**Backups (`br`)**: every `backup` block across all days as ghost cards ("in your pocket · day 3 · ‹activates_when›"), tap → morph-jump to the day. Empty: "No backups in your pocket for this trip."

**Inbox (`xr`)** — the save-folding flow as actually implemented: paste box ("paste a link or place name…"), **Queue it** appends to `localStorage["tl.inbox.queue"]` (global, *not* per-trip); **Send to planner** → `navigator.share` or `mailto:richardliu5764@gmail.com?subject=Glide inbox queue…`; **Copy** puts "INBOX QUEUE:\n…" on the clipboard. Copy verbatim: "Easily fold TikTok, Instagram, YouTube or Maps saves into your itinerary… **Send to planner** moves it off this phone and into the planner's inbox, where the next plan update fact-checks and places it. Nothing gets lost between updates." Tagged "**live sync: coming soon**". `trip.inbox` is always `[]` from the normalizer — so the loop is: traveler emails a text queue → owner's AI folds it in → new `.enc` deploy. The Glide name and the owner's gmail are hardcoded in the shipped bundle.

---

## 10. The Interview (Plan mode, `wi`) — exact content and mechanics

Four **movements** (`ri`): 0 "The bones", 1 "The reason", 2 "Your taste", 3 "The shape". Twelve questions (`$`), each with: `kind` (chips single/multi, 1–10 `scale`, forced-choice `pair`, freeform `story`), a `tier` (**"Oil" / "Tar"** — an internal weighting vocabulary), `safety` and `optional` flags, and — the proto-knowledge-graph — a **`destination` path** naming where the answer lands in a structured traveler/trip model:

| id | movement | kind | destination | ask | aside |
|---|---|---|---|---|---|
| companions | 0 | chips multi (Oil) | `frame.party` | Who's coming along? | "So I keep everyone served, not just the loudest vote." (+ free text "someone else") |
| diet | 0 | chips multi, **safety** (Tar) | `person.dietary` | Anything anyone can't eat? | "Facts, not preferences — I plan hard around these." (No restrictions / A serious allergy / Vegetarian / Vegan / Halal / Kosher / Gluten-free + "spell it out") |
| access | 0 | chips multi, **safety**, optional (Tar) | `person.body_access` | Anything to plan around — mobility, energy, age? | "A stroller, a bad knee, a toddler who naps. I'll respect the floor." (Nothing in particular / A young child / Limited walking / Needs rest in the afternoon / Stairs are hard) |
| reason | 1 | chips single (Oil) | `frame.soul` | What's this trip really for? | "Your answer steers everything and is never shown back to you." (Just get away / Reconnect / Celebrate something / Recharge / Somewhere new) |
| delight | 2 | chips multi (Tar) | `taste_fingerprint.delight_patterns` | When a place really lands for you, what usually did it? | "This is the taste I measure every option against." (The food / The room and the vibe / The people / The craft of it / The quiet / A good story) |
| past | 2 | story, optional (Tar) | `taste_fingerprint.evidence_episode` | Tell me about one trip moment you still think about. | "A story tells me more than a checklist ever could." placeholder: "a tiny counter where the owner kept bringing us things we didn't order" |
| pair_food_room | 2 | pair (Oil) | `taste_fingerprint.tradeoff` | Two good nights — which is more you? | "Either is fine. I just want your lean." (The unforgettable meal — plain room, perfect food / The room you never want to leave — good food, magic setting / "Can't pick — both are me") |
| home_baseline | 2 | story, optional (Tar) | `taste_fingerprint.home_baseline` | What's abundant where you live that you'd never travel for? | "So I never sell you something you already have at home." |
| pace | 3 | scale 1–10 (Oil) | `frame.dials.pace` | How full do you like your days? | Loose ↔ Packed; "I leave real gaps at the loose end, and pack more at the other." |
| rhythm | 3 | chips single (Tar) | `disposition.daily_rhythm` | When are you most alive on a trip? | (Early mornings / Slow mornings, big evenings / All-day steady / Late nights) "I'll put the good stuff where your energy is." |
| novelty | 3 | scale 1–10 (Oil) | `disposition.novelty_appetite` | Comfort, or the new thing? | Familiar ↔ Adventurous |
| guardrails | 3 | story, optional (Oil) | `frame.guardrails` | Anything that's a hard yes or a hard no? | "A must-do, a never-again. I'll treat these as rails." |

**Sequencing (`di`)**: one question on screen at a time; asks the first unanswered question movement-by-movement, but *within movements 2–3* sorts candidates by **ascending theme-evidence count** — it deliberately probes the themes it knows least about first. Optional questions are skippable (`__skipped__` sentinel). Single-choice inputs auto-advance after a 300ms beat; multi/story require Continue ("That's everything" on the last). Back button and a live progress track.

**The Ledger — "What I'm hearing"** (`li`, sheet `xi`): every answered question becomes an entry with a **confidence state** — safety questions or themes with weighted evidence ≥3 → ● *confirmed*; ≥2 → ◐ *pattern*; else ○ *a hunch* (safety answers count ×3). Entries carry provenance ("from: Anything anyone can't eat"). Grouped under human names: Who's coming / Must plan around / The reason / What you love / Already have at home / Pace & energy / Your rhythm / Comfort vs new / Rails / Money (budget theme is named but **no budget question exists yet**). Tapping any entry jumps back to that question.

**Playback phase (`Si`)**: "Here's what I'm hearing. Did I get you right?" / "Tap anything to fix it. **I never plan from a guess — only from what you confirm here.**" Safety group visually hardened. Actions: **Plan from this** / Keep talking.

**Frame draft (`pi`)**: builds `{party, dietary, access, soul: "A trip to reconnect, for Partner + Kids.", occasion, delight, pace, novelty, rhythm, guardrails, stories:{home,past}, version:"frame-draft-v1"}` — **but the result is computed and immediately discarded** (`pi(c.answers)` return value unused). Only the raw answers persist (encrypted locally).

**Flywheel (`Ci`)**: stage list Interview ✓ → Research → Compose → Ready with states done/running/waiting. Copy is explicit about the architecture: *"Research and compose run author-time, off this device, against your doctrine — then the finished trip returns here, encrypted. Nothing you said is sent to an outside AI."* The **"Hand off to research & compose"** button sets `handed_off: true` in local state and shows "I'll let you know the moment your trip is ready to open." — **there is no transport whatsoever**: no email, no share, no upload of the interview answers. The handoff is a promise the code cannot yet keep; the owner presumably reads answers off the device or re-elicits them. For a live trip, plan mode opens directly at the flywheel in the all-done state with "Open in Explore".

---

## 11. Clever things (worth preserving in any overhaul)

1. **Manifest-privacy allow-list that throws** — content can't leak into the unencrypted layer by accident.
2. **Persisted non-extractable CryptoKey** = passphrase-once UX with a real "re-lock", without ever storing a secret string.
3. **Network-first ciphertext / cache-first shell** SW split + `ct`-diff hot-swap = silent plan updates that still work in airplane mode.
4. **Wallet derived from block confirmations** (single source of truth) + the synthesized lodging card with §sections.
5. **`«` redaction sentinel** — composer templates degrade invisibly.
6. The **ledger/confidence model** (hunch/pattern/confirmed, safety ×3, provenance strings) and **least-evidence-first question ordering** — a real, if embryonic, epistemic model of the traveler.
7. `destination` paths on questions — the skeleton of a traveler knowledge graph (`frame` / `person` / `taste_fingerprint` / `disposition`) already in production vocabulary, matching the owner's knowledge-graph instinct.
8. **Now's participation-aware current/next/meanwhile** + LEAVE BY (travel+buffer) + the timeshift scrubber.
9. The whole **trek choreography**: tile pre-warm tour, bezier trail with camera chase, label-placement cost optimizer, typewriter dwell, jank-classifier HUD, and the SVG offline sketch fallback — graceful degradation at every layer.
10. Species vocabulary (anchor / decision_point / backup / freeform) — a plan that admits uncertainty and carries contingencies "in your pocket".
11. Per-viewer personalization entirely client-side via namespaced localStorage — zero backend, still multi-user per phone.
12. Two complete skins (Excurse / Drift) and a designed-but-unwired `afterglow` post-trip mode.
13. iOS PWA viewport scar-tissue (`--vvh`, minimum-scale nudge) and global `<details>` height animation.

## 12. Broken / fragile / unfinished (targets for the overhaul)

1. **The core loop has two manual gaps**: interview handoff transports nothing (frame draft literally discarded; `handed_off` is a local boolean), and inbox "sync" is mailto/share to a hardcoded gmail. The product's central promise — interview → research → compose → encrypted bundle returns — has no pipe.
2. **Trip registry baked into the JS bundle** — adding a trip = rebuild+redeploy the shell; the Durham trip has no bundle path; default storage trip id `la-2026-06` is a module constant.
3. **No routing/deep links**; refresh loses place. No error boundary (errors only `console.error`).
4. **Encryption boundary is inconsistent**: interview answers are encrypted at rest, but identity, packing items the user types, visited marks, and the inbox queue (potentially sensitive URLs) are plaintext localStorage; the inbox queue isn't even trip-scoped.
5. **Midnight/DST fragility**: default block end = start+60 wraps modulo 24h (a 23:30 block "ends" at 00:30 < start, breaking current/past logic); LEAVE BY clamps at 00:00; `nr()` mixes UTC date math with wall-clock minute diffs — countdown drifts across DST boundaries; `It()` assumes blocks are chronologically sorted.
6. **Name-based matching**: pre-trip wallet peek finds "your flight" by checking the pass title contains the viewer's first name; wallet_ref↔pass joins are raw string equality on confirmation codes (merged lodging cards can orphan a block's code chip).
7. `cut_list` and `trip.inbox` are always-empty schema stubs; `budget` theme named but never asked; `hint: 5` on scales unused (scale starts at "tap to choose"); vestigial second Vite preload chunk.
8. **Loose-end done-state is dual-source** (authored flag vs local check): un-checking something the author marked done is impossible.
9. Online trek leaks the day's coordinates to Esri/AWS tile servers (inherent to satellite tiles; worth an explicit privacy stance); pre-warm tour is tile-hungry on cellular.
10. Owner PII (gmail) and the legacy "Glide" name ship inside the bundle; `classic/` legacy app rides along in every deploy.
11. Draft trips can be created but never deleted/renamed in UI; interview has no way to attach *where/when* (dates/destination) — drafts are titled but destination-less (`where: "Somewhere new"`).
12. Single-viewer-per-device assumption for checkmark namespacing is fine, but nothing syncs across a couple's two phones — every phone is an island.
13. Accessibility: interview auto-advance (300ms) can yank focus; the map show has no non-visual narrative; voicelines are `<button>`s with only `aria-expanded`.

## 13. Voice & design system (for continuity)

Fonts: Inter (UI, `.num` tabular), Source Serif 4 italic (`.voice` — every "planner speaking" line), Archivo (`.display`). Paper/ink token palette with 7 trip palettes × dark variants; modes shape/dream/field(/afterglow). Motion vocabulary: 0.14/0.24/0.42/0.7s, one ease (`.2,.8,.2,1`). The planner's voice is consistently first-person, calm, anti-salesy: "I never plan from a guess", "So I never sell you something you already have at home", "Enjoy the quiet." Any overhaul should treat this voice + the species/receipts/ledger vocabulary as the brand.
