# 03 — Design Language Review: Excurse

*Design-critic report. Sources: `excurse-app-site/assets/style-DG-tE1bK.css` (beautified to 5,100 lines at `undefined/beautified/app-style.css`; lines ~4,370–5,100 are vendored MapLibre styles), `assets/index-51ocJsMQ.js` (beautified at `undefined/beautified/app-index.js`, 8,782 lines), `index.html`, `manifest.webmanifest`, `sw.js`, the three variable fonts, the app icon, and token comparison against `la-fieldguide` and `durm-guide`.*

---

## 1. The aesthetic thesis

**Excurse is styled as a quiet paper field guide that happens to be software.** The thesis is legible in the token names themselves — `--paper`, `--paper-deep`, `--ink`, `--ink-soft`, `--ink-faint`, `--line`. This is not a "design system palette" naming scheme (primary/secondary/surface); it is a *print* vocabulary. Everything else follows from it:

- **Print semantics on screen.** Hairline 1.5px rules, uppercase letter-spaced section labels with a small accent tick and a rule that fades to transparent (`.seclbl:before/:after`), keylined cards instead of shadowed ones, dashed borders for provisional matter, a serif-italic "voice" for marginalia. Shadows are reserved for things that are *physically raised* — bottom sheets, the fanned wallet cards, the FAB.
- **Atmosphere, not decoration.** The seven trip palettes are named after weather and light, not colors: Paper, LA Summer, Pacific, Golden Hour, Marine Layer, Matcha, K-Town Neon. Each is a full recolor of the paper/ink/line system (light + dark), with a single `--trip-accent` doing all the pointing.
- **One voice, three registers** (see §3): a system register (Inter, uppercase micro-labels), a data register (tabular numerals, condensed Archivo for clocks and confirmation codes), and a narrator register (Source Serif 4 *italic only* — the planner speaking in the margins).
- **Calm as a feature.** The copy never exclaims. Empty states are the reward, not the failure: "Every loose end is tied. Enjoy the quiet." / "Nothing scheduled, exactly as planned." The brand mark is a palm frond (terracotta on cream, animated with a 6s idle sway on the splash), not a logo lockup.

This is a coherent, unusually confident thesis for a solo project, and — crucially — it is the *same* system in all three repos: `:root` tokens in `la-fieldguide`, `durm-guide`, and `excurse-app-site` are byte-identical. The design system genuinely exists; it isn't retrofitted marketing language.

**Verdict up front:** execution is ~85% consistent and often excellent (motion, voice, theming architecture, reduced-motion coverage). The three real weaknesses: (1) the signature "faint ink" fails WCAG contrast across every palette, worst in the prettiest ones; (2) the theming matrix has combinatorially exploded (2 UI styles × 3 typestyles × 8 palettes × 2 themes × 3 live modes), maintained by hand-written override cascades; (3) the alternate "Drift / aurora glass" skin is a second, borrowed design language (glassmorphism + a hardcoded purple that exists nowhere else in the system) that dilutes the thesis.

---

## 2. Token architecture

### 2.1 Color

Core neutrals (default "Paper"):

| Token | Value | Role |
|---|---|---|
| `--paper` | `#FAF7F2` | ground (also theme-color, manifest bg) |
| `--paper-deep` | `#F1ECE2` | recessed surfaces (sheets, seg tracks, freeform cards, flaps) |
| `--ink` | `#1C1915` | primary text |
| `--ink-soft` | `#575046` | secondary text |
| `--ink-faint` | `#8B8276` | tertiary/meta text, inactive tabs |
| `--line` | `#DCD5C9` | hairlines and keylines |
| `--trip-accent` | per-trip (default `#2F6B8A`) | the only pointing color |
| `--call-ahead` | `#9A6A1B` | amber status (verify/act) |
| `--breaking` | `#AE352C` | red status (changed/removed) |
| `--confirmed` | `#2F6B4D` | green status (locked) |

Notable decisions:
- **Status colors are semantic-only.** Amber/red/green never decorate; they mark *epistemic state* of information ("call ahead", "breaking", "confirmed"), matching the planner ledger's hunch/pattern/confirmed taxonomy in the JS. Color = certainty is a genuinely original move for a travel app.
- **`--bg`/`--fg` indirection** lets modes and palettes swap grounds without touching components. `data-mode="field"` uses pure `#fff`/`#111009` (max sunlight legibility outdoors — a field-guide decision), while the atlas/"shape" mode uses paper. `data-mode="dream"` (the interview/planner) goes dark navy `#161826` with a dedicated ember accent `#E27840` — planning happens at night, in a different emotional temperature. That mode/light mapping (field=daylight paper, dream=evening ember) is storytelling through tokens.
- Palettes override six tokens each (`--bg --fg --ink-faint --ink-soft --line --paper-deep --trip-accent`), light and dark. 15 palette blocks total, all hand-tuned rather than generated — hue-shifted neutrals per palette (e.g. Marine Layer's cool gray-blues) rather than one gray ramp, which is why they feel like paper stocks rather than filters.
- `color-mix(in srgb, …)` is used extensively (drift skin, interview controls, atlas tiles) — modern, token-relative, but with no fallback for older WebViews.

### 2.2 Type scale & spacing

```
--fs-caption .75rem   --fs-meta .8125rem   --fs-body .9375rem   --fs-emph 1.0625rem
--fs-title  1.25rem   --fs-day  1.5rem     --fs-display 2rem    --fs-clock 2.75rem
--fs-input  max(16px, var(--fs-meta))          ← prevents iOS focus-zoom; smart
--lh-tight 1.2   --lh-body 1.45
--s1..--s7: 4 / 8 / 12 / 16 / 24 / 40 / 64px   ← 8-ish scale with a 12
--tap 48px       --r-card 12px  --r-sheet 20px  --r-chip 999px
```

- In field mode `html { font-size: 112.5% }` (base 18px), so body text renders ~16.9px and the day headline ~2.1rem ≈ 38px. "Large" text pref pushes field mode to 126%. Because the whole scale is rem-based, one attribute rescales everything — a clean accessibility lever.
- The scale is small (8 steps) and every component uses it; I found almost no rogue font sizes outside the day-map bubbles (0.66–0.82rem micro-labels) and the debug HUD (9.5px monospace).
- Spacing tokens are used with real discipline; ad-hoc px values appear mostly in optical corrections (chevron sizes, -26px FAB overhang, wallet fan offsets).

### 2.3 Motion tokens & z-index

```
--t-micro .14s  --t-state .24s  --t-trans .42s  --t-set .7s
--ease-out: cubic-bezier(.2,.8,.2,1)   --ease-cam: cubic-bezier(.45,0,.15,1)
--z-thread 10  --z-pocket 50  --z-overlay 60  --z-veil 100
```

Named z-index tiers ("pocket", "veil") continue the object metaphor. Reduced-motion collapses the duration tokens to 0/80ms *at the token level* — the cheapest correct way to do it.

---

## 3. Typography: the three-voice system

| Font | File | Role |
|---|---|---|
| **Inter** variable (100–900) | 48KB woff2 | `--font-ui`: labels, body, meta, tab bar. `.num` forces `tabular-nums` for every time and code. |
| **Archivo** variable | 35KB | `--font-display` at **`font-stretch: 75%`** + weight 600: headlines, clocks, `bigcode` wallet confirmation numbers. Semi-condensed = map lettering / National Park signage. |
| **Source Serif 4** *italic-only* variable | 52KB | `--font-voice`: the narrator. `.voice` class = serif + italic, applied to voicelines, day themes ("Golden Hour"), splash title (weight **620** — a fractional-weight flex only a variable font allows), ledger and playback titles, the brand word, empty-state consolations. |

Total self-hosted font payload ≈ 135KB, `font-display: swap`, declared inline in the HTML shell so they start fetching before the JS bundle parses. This is a disciplined, deliberate pairing: **upright grotesk for the system, condensed grotesk for the artifact/data, italic serif for the human voice.** Shipping *only the italic* of the serif is the strongest single signal of design intent in the codebase — the serif is never allowed to be body text; it exists purely as a voice register.

Two alternate typestyles are offered in settings:
- `data-typestyle="editorial"`: display AND `--font-ui` become Georgia/Iowan Old Style — a full serif book mode — with `.num` and `.tabbar` pinned back to Inter (for tabular figures and tab legibility).
- `data-typestyle="soft"`: `ui-rounded`/SF Pro Rounded everywhere, radii bumped (cards 18px, sheets 26px).

Critique: the typestyles are a charming personalization, but they're implemented as override patches (six-selector lists repeated three times for the display treatment at lines 1329–1354), and "editorial" quietly changes reading texture app-wide while the serif *voice* register stops being distinct (serif voice inside serif body loses its contrast — the narrator disappears into the page).

---

## 4. Component language

The component inventory reads as one object-world: *pocket, wallet, flap, rail, veil, ledger, atlas*.

- **Shell**: single centered 560px column; no app bar — instead a fixed 52px top strip of the background blurred (`backdrop-filter: blur(12px)` with a fade mask) so content scrolls "under the sky". Brand is a small right-aligned serif-italic word with a tiny tracked "by co" sub-mark hanging off its baseline.
- **Tab bar**: fixed, but anchored via `top: var(--vvh, 100dvh); transform: translateY(-100%)` — pinned to a JS-maintained `visualViewport` height variable rather than `bottom: 0`. This sidesteps the iOS keyboard/URL-bar `100vh` bugs; there's even a hidden 1px probe element measuring `env(safe-area-inset-bottom)` at runtime. Center **wallet FAB**: 58px circle, accent, 3px bg ring, -26px overhang — the one deliberately "app-like" element.
- **Now hero**: keylined card; tracked accent "LEAVE BY" eyebrow; 2.75rem tabular clock; SVG countdown ring whose `stroke-dashoffset` ticks with a 1s *linear* transition (a clock should not ease — right call). "Meanwhile" ghost row beneath.
- **Day rail**: 1.5px vertical rule with node glyphs encoding meaning — circle = stop, **rotated square = decision point**, dotted circle = backup. Combined with the border language (solid = confirmed, **dashed = provisional** — `.card.single`, `.backupghost`, `.emptystate`, `.flap`, `.atile.new` are all dashed; `.card.past` fades to 55%), the CSS carries a real semiotics of certainty. This is the design system's most original idea and it is applied consistently.
- **Cards** are native `<details>` with styled summaries, CSS-drawn chevrons, and `::details-content` opacity transitions — semantic HTML doing the interaction work.
- **Flap**: indented dashed-left-border aside on `--paper-deep` — literally a fold-out flap in a guidebook, holding the pocket-guide entries with tick-off checkboxes (checked = strikethrough + 50% fade, "seen").
- **Wallet sheet**: `--paper-deep` bottom sheet, 20px top radius, spring entrance via a 31-point `linear()` easing curve (real overdamped spring, `@supports`-gated), 72px bottom border to hide rubber-band overscroll. Cards **fan** like a physical card wallet: stacked with `margin-top: calc(-1*var(--s7) + 14px)` peeking only their color band + name, expanding on tap with a staggered `cardfan` entrance (40ms per index). Band color encodes kind (accent = ticket, green = stay, amber = car, gray = policy). Codes render in condensed Archivo at display size; tapping copies and turns the code `--confirmed` green with "· copied".
- **Interview ("dream" mode)**: progress track, uppercase move labels, the question in large type with 40/80ms staggered `ivrise` entrances, chips/scale-bars/pair-cards as answer inputs (scale = 10 tappable bars, pair = two option cards + "Either is fine. I just want your lean."), a floating "ledger" chip opening a bottom sheet where every captured fact is graded *hunch / pattern / confirmed* with colored glyphs. The dark navy + ember treatment separates planning-time from trip-time perfectly.
- **Atlas ("shape" mode)**: trip tiles with 4px accent edge, status pills (LIVE/PLANNING/DRAFT via `color-mix` tints), dashed "A new trip" tile, 2-col grid ≥520px. The one place `@media (hover:hover)` styles exist.
- **Day map**: full-screen cinematic — dark ground `#141b28`, satellite tiles, route drawn as blurred accent halo + bright core stroke (`stroke-dasharray: 1` animated), paper-colored title card with radial vignette and serif-italic day name, tracked uppercase date, pill "away" markers, an offline SVG fallback sketch ("offline sketch · satellite view needs signal"). MapLibre attribution is restyled to near-invisible 8px (attribution-compliance risk worth noting).
- **Veil** (passphrase gate) and **splash**: radial bg glow behind the box, serif-italic 2.2–3.2rem title, shake animation on wrong code ("That code didn't open it. Try again."), animated frond growing leaf-by-leaf (`--d` per-leaf delays, back/fore leaf layers in `color-mix` tints of the accent) then swaying ±1.6° forever. The frond is the icon, the splash, and the loading state — a real brand mark.

---

## 5. Motion system

- **Grammar**: micro-interactions 140ms; state 240ms; transitions 420ms; set-pieces 700ms+. Press feedback is uniformly `:active { transform: scale(.94–.97) }` on chips/tabs/buttons — tactile without hover dependence.
- **Navigation** uses the View Transitions API with direction awareness: `data-navdir="forward|backward"` drives iOS-style push/pop (`translate(100%)` in over a `-30%` parallax under-slide, 0.46s `cubic-bezier(.32,.72,0,1)`), and `data-morph` drives shared-element morphs (`morph` 0.62s, `morphday` 0.95s with the day headline scaling between list and detail). Entrance animations are explicitly suppressed during transitions (`html[data-navdir] .heroin { animation: none }`) — someone actually debugged double-animation, rare care.
- **Choreography**: day view "roll" staggers brief → theme → meta → rail rows (65ms/row, capped at 7); interview staggers question elements and answer chips (34ms/index); wallet fans cards. Ambient motion is reserved for identity moments only (frond sway; drift aurora at 26s/34s).
- **Reduced motion** is handled in *five* separate blocks: token zeroing, frond static-render, view-transition kill (`animation: none !important` on old/new), wallet/hero/details opt-outs, interview fallback to a 120ms fade, day-map bubble opt-out. This is top-decile reduced-motion coverage; most production apps do far less.

Critique: durations/easings for view transitions, `linear()` spring, `cardfan`, `wgrow` (0.56s) are hardcoded rather than tokenized — the motion *tokens* cover only a third of actual motion. Fine today; a liability for the overhaul.

---

## 6. Editorial voice

The copy is a load-bearing part of the design system, in three registers:

- **System register** (Inter, tracked uppercase): "LEAVE BY", "READY IN YOUR WALLET", "GETTING THERE", "PREP, IN ONE PLACE".
- **Narrator register** (serif italic, first person — the planner): "A few quiet questions, then I research and compose it." / "A story tells me more than a checklist ever could." / "I'll put the good stuff where your energy is." / "I never plan from a guess — only from what you confirm here." / "Done — I have your taste and your guardrails." / "I'm off to research and compose."
- **Consolation register** (empty states as achievements): "Every loose end is tied. Enjoy the quiet." / "Nothing scheduled, exactly as planned." / "Nothing yet — we just started." / "Ready when you are." / "Welcome home."

Traits: no exclamation points anywhere in the bundle; interpuncts (`·`) as the universal separator; em-dash cadence; concrete nouns ("Loose ends", "The bones", "The quiet", "Your rhythm", "Walk the days"); questions in the interview are conversational and human-scaled ("Anything anyone can't eat?", "When are you most alive on a trip?", "What's abundant where you live that you'd never travel for?" — that last one is an exceptional prompt). Privacy is expressed *in voice*, not legalese: "Runs off your phone, against your own doctrine. No raw answers leave the device." Even error copy stays in character ("That code didn't open it. Try again."). The epistemics leak charmingly into UI: ledger items are "a hunch / a pattern / confirmed"; "our read ·" prefixes the planner's opinion on options; "Verified — findings checked against locals."

Weak spots: a handful of strings break register — "LOADING" (bare uppercase), `dm-hud` debug text, "aurora glass: the light drifts with your palette" (settings poetry that oversells), and the Glide-era mailto ("Glide%20inbox%20queue" to richardliu5764@gmail.com) which exposes plumbing in a product that otherwise hides all machinery.

---

## 7. Dark mode, responsive, platform

- **Dark** is `data-theme="dark"` per palette (not `prefers-color-scheme` in CSS) — JS resolves system/user pref (`Er()` at app-index.js:6173), sets the attribute, then syncs `<meta theme-color>` from the *computed body background* on the next frame, so the iOS status bar always matches the current palette. Elegant. Dark palettes are hand-tuned (lifted faint inks, `--call-ahead` brightened to `#E6A84F`), not inverted — and dark faint text actually *passes* contrast (5.6:1) where light fails.
- **Safe areas**: `viewport-fit=cover`, `env(safe-area-inset-*)` in 15+ places (page bottom padding, tab bar, sheets, day-map close/actions/note, veil top). The `--vvh` visualViewport variable + probe element is the most robust fixed-chrome approach available for iOS PWAs.
- **Offline**: SW caches shell cache-first, `.enc` network-first; fonts self-hosted; the map has a designed offline fallback state. Offline is a *designed condition*, not an error.
- **Desktop is a phone simulator**: one 560px column, `hover:hover` styles only on atlas tiles, FAB/thumb idioms unchanged. Consistent with the spirit (a phone in your pocket on a trip), but the atlas/planning surface — which owners use at a desk — deserves a real ≥900px layout in the overhaul.

---

## 8. Accessibility audit

**Genuinely good:**
- Global `:focus-visible { outline: 2px solid var(--trip-accent); offset 2px }`.
- `button { min-height: var(--tap) /* 48px */ }` as a *global default* — tap targets are opt-out, not opt-in.
- `--fs-input: max(16px, …)` kills iOS focus zoom.
- Native `<details>/<summary>`, real checkboxes with `accent-color`, ARIA where it matters: `role=tablist/tab` + `aria-selected` (tab bar, segments, day chips), `aria-pressed` (settings toggles), `role=dialog` + `aria-modal`, `role=progressbar` with value attrs, `role=status`, 26 `aria-label`s, `aria-hidden` on decorative SVG.
- Reduced-motion coverage (§5). Forced-colors support exists only in vendored MapLibre CSS — the app itself has no `forced-colors` handling.

**Failures (measured, WCAG 2.1 AA = 4.5:1 small text / 3:1 large & UI):**

| Pair | Ratio | Verdict |
|---|---|---|
| `--ink` on paper / white | 16.4 / 19.1 | pass AAA |
| `--ink-soft` on paper | 7.4 | pass AAA |
| `--trip-accent` #2F6B8A on paper | 5.5 | pass AA |
| white on accent (chips, FAB) | 4.5–5.9 all palettes | pass AA |
| `--breaking`, `--confirmed` on paper | 5.9 | pass |
| `--call-ahead` #9A6A1B on paper | **4.41** | fail AA small (used at caption size for "call ahead"/due labels) |
| **`--ink-faint` on paper** | **3.54** | **fail** — and this token carries greetings-subs, meta rows, times, briefs, captions, inactive tabs |
| ink-faint, LA Summer light | **2.90** | fail |
| ink-faint, Golden Hour light | **2.72** | fail |
| ink-faint, Marine Layer light | **2.69** | fail |
| ink-faint, Matcha light | **2.64** | fail (below even 3:1 large-text floor) |
| ink-faint, Pacific / K-Town light | 3.27 / 3.30 | fail |
| Golden Hour accent #C2571B on bg | **3.82** | fail at caption sizes ("LEAVE BY", section labels) |
| `--line` on paper | 1.36 | borders far below the 3:1 non-text minimum (keylines are aesthetic, but keyline-only inputs suffer) |

The pattern: **the product's signature quietness is implemented as low contrast**, and the most atmospheric palettes are the least legible — in sunlight, on a trip, for the "Parents" the interview explicitly plans for. Dark palettes prove it's fixable: their faint inks sit at 5.6:1 and still feel quiet. Quiet should come from scale, weight, and spacing — not from gray.

**Other gaps:** tap-target *overrides* below 44px (`.fitchip-main`/`-x` 32px, `.le-chev` 32px, `.rowdel` 32px, `.iv-back` 34px, `.modetoggle button` 34px, `.timeshift button` 36px, `.le-more` min-height 0); check glyph drawn with a literal `"✓"` content character (font-dependent rendering) in the flap ticks; copied-code feedback is color+text but likely not announced (only one `role=status` found); horizontally scrolling `.seg`/`.daychips` hide scrollbars with no affordance; no skip link (moot in a single-column app but the day map traps are unverified).

---

## 9. Consistency audit — where execution falls short of the thesis

1. **The Drift skin is a second religion.** `data-style="drift"` (~500 lines, css lines 2829–3373) restyles *everything*: aurora gradient backgrounds animating at 26s/34s, glassmorphism (`backdrop-filter: saturate(1.5) blur(16px)`), floating pill tab bar, glow shadows, and a **hardcoded `#6E5BFF` purple** blended into every gradient — a hue that exists nowhere in the field-guide vocabulary. It's fashionable iOS glass, competently done, but it abandons paper/ink/print semantics entirely (keylines→glass, dashes remain but read as noise on blur). Two full design languages in one 147KB stylesheet is the clearest "full liberty" question for the overhaul: pick one, or make Drift a per-trip *palette-level* mood rather than a parallel system.
2. **Combinatorial theming debt.** 2 UI styles × 3 typestyles × 8 palettes (light+dark) × 3 live modes × large-text ≈ hundreds of states, all maintained through hand-written attribute-override cascades with no build-time generation. Symptoms already visible: `.wcard` is defined twice with conflicting fan offsets (lines 906–920 vs 1355–1366 — the later block wins; sedimentary CSS from rapid iteration), triple-repeated six-selector typestyle lists, and dark-mode patch rules for hardcoded whites (`.ivchip.on { color:#fff }` needs `[data-theme=dark]` counter-patches because it bypasses `--on-accent`).
3. **Token leaks.** Day-map UI uses literal hexes (`#f4ede2`, `#14110d8c`, `#b7ac9b`, `#141b28`) instead of tokens; a dozen ad-hoc shadow rgbas exist beside the single `--shadow-sheet` token; motion outside the four duration tokens is hardcoded; wallet band "policy/other" categories borrow ink tokens as category colors (semantic drift: ink = text, not "policy").
4. **Dead and debug matter ships to travelers.** `data-mode="afterglow"` is fully styled and never set by the JS (vestigial or future post-trip mode); `.dm-hud`, `.dm-jank-flash` (red screen-border FPS flash), `.dm-cross` crosshair, and `dmDebugGrid` are developer instrumentation living in the production stylesheet and bundle; legacy `tl.` localStorage keys and the Glide mailto remain.
5. **Editorial typestyle self-conflict** (§3): switching body to serif erases the serif-voice register's distinctiveness — the system's best typographic idea defeated by its own personalization option.
6. **MapLibre attribution** restyled to 8px at 42% opacity, attribution button hidden — check tile-provider terms (Esri World Imagery requires visible attribution).
7. **Manifest is single-theme** (`#FAF7F2` background regardless of palette/dark) — dark-mode PWA launch flashes cream.

---

## 10. Recommendations for the overhaul

1. **Codify the thesis, then generate the system.** Write the ten rules down (paper/ink vocabulary; dashed = provisional; color = certainty; serif italic = the planner's voice; shadows = physically raised; empty = reward; no exclamation marks). Then move palettes/typestyles/modes to a build-time token pipeline (JSON → CSS layers) so every combination is generated and contrast-validated instead of hand-patched.
2. **Fix faint ink globally.** Target ≥4.5:1 for every text-bearing token in every palette (light faints need to darken ~1.5 steps; Golden Hour accent needs a text-safe variant). Add a `--line-strong` for functional borders (inputs, checkboxes) at ≥3:1. The dark palettes are the proof this costs no atmosphere.
3. **Resolve the Drift schism** — either promote its ambience into the core system as palette-level "weather" (the aurora idea is good; the glass and purple are not Excurse) or cut it.
4. **Tokenize motion fully** (springs, VT durations, stagger steps) and keep the exemplary reduced-motion discipline.
5. **Sweep the pocket lint**: dead `afterglow`, duplicate `.wcard`, debug overlays behind a build flag, `tl.` keys, Glide mailto, `✓` glyph → inline SVG, sub-44px overrides.
6. **Give planning a desk.** The interview/compose surface deserves a real wide layout; the field guide can stay a 560px pocket column forever.
7. **Protect the voice** — the copy *is* the brand. As the interview grows an AI knowledge-graph backend, keep every generated string inside the three registers, and keep the narrator in first person, quiet, and never exclamatory.

**Bottom line:** Excurse already has what most funded products never achieve — a thesis (a private, hand-made paper field guide), tokens named in its own language, typography that enacts its voice, motion with manners, and copy that carries the brand. The overhaul should not replace this language; it should *industrialize* it: generated theming, contrast-safe quiet, one skin, and the same serenity at every one of its several hundred possible states.
