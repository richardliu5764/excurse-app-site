# Excurse Overhaul Council — Head of Design & Editorial Voice

**Seat:** Head of Design & Editorial Voice
**Date:** July 2026
**Inputs:** Design-language audit (03), app anatomy (01), evolution archaeology (02), editorial craft research (09), interview science (05), local-first tech (08), landscape (07), and the CEO's position paper (10). The shipped CSS, bundle strings, and fonts, via the beautified sources.

---

## 0. The verdict

Excurse already knows how it wants to feel, and it is right. A quiet paper field guide that happens to be software; a planner who speaks in first-person italic serif and never exclaims; dashed borders that mean *provisional* and status colors that mean *certainty*; empty states written as rewards. This is not a styling layer — it is a worldview, expressed consistently in tokens, type, motion, and copy, by one person, at a level most funded design teams never reach. The council must understand this clearly before proposing anything: **the feeling is the moat.** The landscape research found an empty quadrant — the person-driven finished artifact — and what makes that quadrant defensible is not the crypto or the graph. It is that opening this thing feels like being handed a made object, not shown a screen.

And yet I have to say the harder sentence too: **the product's signature quietness is currently implemented as a defect.** Faint ink fails WCAG in every light palette — worst in the prettiest ones, 2.6:1 in Matcha, in full sun, on a trip, for the parents the interview explicitly plans for. Quiet built out of low contrast is not quiet; it is mumbling. The dark palettes prove the fix costs nothing: 5.6:1 and still serene. The single most important design directive of the overhaul is one sentence: **quiet comes from scale, weight, spacing, and restraint — never from gray.**

The rest of this paper: what must survive (§1), what I am killing in my own house (§2), the evolved system (§3), maps as editorial objects (§4), the interview as conversation design (§5), the voice charter (§6), and my standing role as the person who says no (§7) — including the places I disagree with the CEO and the researchers.

---

## 1. What is already right, and must not be "improved"

I am listing these because overhauls kill by enthusiasm, not malice. These are load-bearing and non-negotiable:

1. **The print vocabulary.** `--paper`, `--ink`, `--line`, `--paper-deep`. Tokens named in the product's own language, byte-identical across all three repos. Any generated token pipeline must emit *these names*.
2. **The semiotics of certainty.** Dashed = provisional, solid = confirmed; amber = call ahead, red = breaking, green = locked; rotated square = your call. This is the design system's one genuinely original idea, and it is about to become *truer* — the fact ledger and the verifier give every dash and every amber chip a real claim behind it. The overhaul's epistemic machinery already has its visual language shipped and waiting. Do not invent a new one.
3. **The three-voice typography.** Inter for the system, condensed Archivo for the artifact/data (clocks, wallet codes — National Park signage), and Source Serif 4 shipped *italic-only* as the narrator. Shipping only the italic is the strongest single act of design intent in the codebase: the serif physically cannot become body text; it exists only as a voice. 135KB total. Keep the discipline; see §3.2 for the one licensed exception.
4. **Motion with manners.** Direction-aware view transitions, the 31-point spring on the wallet sheet, ambient motion reserved for identity moments (the frond's sway), and top-decile reduced-motion coverage. The grammar is right: micro 140ms, state 240ms, transition 420ms, set-piece 700ms.
5. **The copy registers.** System (tracked uppercase), narrator (serif italic, first person), consolation (empty states as achievements). Zero exclamation marks in the entire bundle. "Every loose end is tied. Enjoy the quiet." is the brand, and the interpunct is its punctuation.
6. **The dream/field temperature split.** Planning happens at night in navy and ember; the trip happens in daylight on paper. Emotional temperature as a mode system is storytelling through tokens. Keep it; extend it to afterglow (§3.6).
7. **Empty states, silence, and the Now view's philosophy.** "Nothing scheduled, exactly as planned" is the most strategically important sentence in the product (the CEO is right about this), and it is a *design* sentence: the product is comfortable saying nothing.
8. **The frond.** Icon, splash, loading state — one mark doing three jobs, animated leaf by leaf. It is a brand, not a logo lockup. Leave it alone.
9. **Platform care.** The `--vvh` visualViewport anchor, safe-area discipline, `--fs-input: max(16px,…)`, 48px default tap targets, theme-color synced from computed background. This is invisible craft; it survives whole.

---

## 2. Honest critique — the five sins of my own house

### 2.1 Quiet-as-illegibility (the cardinal sin)
Measured: `--ink-faint` 3.54:1 on paper, 2.64–3.30:1 across the light palettes; Golden Hour's accent 3.82:1 at caption sizes ("LEAVE BY" — the string a traveler reads while walking to a car in sunlight); `--line` at 1.36:1 under functional inputs. The atmosphere is being purchased with the legibility of exactly the text that matters most in the field: times, meta, briefs. **Doctrine going forward: every text-bearing token ≥4.5:1 in every palette, light and dark, enforced by the token pipeline at build time — a palette that cannot pass does not ship.** De-emphasis moves to size, weight, spacing, and case. The dark palettes are the existence proof that this costs no serenity.

### 2.2 The Drift schism
Five hundred lines of borrowed glassmorphism with a hardcoded `#6E5BFF` purple that exists nowhere else in the vocabulary. It is competent, fashionable, and not Excurse. Two design languages is zero design languages. **Cut it entirely.** I will not even salvage the aurora: the dream mode already owns "ambient, nocturnal, alive," and it does it in the house vocabulary (ember on navy). Deleting Drift also deletes a quarter of the theming matrix for free.

### 2.3 The typestyle that murders the narrator
`data-typestyle="editorial"` sets body text in serif — and the italic-serif voice register, the system's best typographic idea, dissolves into the page. A personalization option that defeats the thesis is not personalization; it is entropy. **One typestyle ships.** "Soft" dies with it. Personalization lives where it belongs: palettes (recolor the paper stock, never the typography or the semantics) and content.

### 2.4 Combinatorial hand-patched theming
2 skins × 3 typestyles × 8 palettes × 2 themes × 3 modes, maintained by override cascades, with visible sediment (duplicate `.wcard`, dark-mode counter-patches for hardcoded `#fff`). After §2.2 and §2.3 the matrix collapses to **1 skin × 1 typestyle × N palettes × 2 themes × 4 modes** — and the surviving matrix moves to a build-time pipeline: palettes defined as JSON (six overridable tokens + accent), compiled to CSS layers, every combination contrast-validated and visually snapshotted. Palettes become *data*, which also means a trip's palette can finally ship inside trip data instead of inside the stylesheet. Hand-tuning remains — the pipeline validates; the eye still chooses the hues. Matcha and Golden Hour get re-tuned, not deleted.

### 2.5 Lint in the pocket
Debug HUDs and jank-flash overlays in production CSS; a dead `afterglow` mode styled since June 14 and never set; `tl.` fossil keys; a literal `✓` glyph; sub-44px tap overrides (fitchip 32px, iv-back 34px, timeshift 36px); the Glide mailto exposing the developer's Gmail inside a product whose entire posture is "no machinery visible"; MapLibre attribution shrunk to 8px at 42% opacity against Esri's terms. A made object has no manufacturer's grease pencil marks on it. All of it goes — and afterglow gets wired, not cut (§3.6), because it was always the missing fourth act.

---

## 3. The evolved system

### 3.0 The Paper Rules (the thesis, codified)
Written down, versioned, and cited in every design and prompt review. Draft ten:

1. Paper and ink, named as such. Shadows only for things physically raised.
2. Dashed means provisional. Solid means confirmed. No decorative dashes, ever.
3. Color is certainty, not decoration. Amber verify, red changed, green locked, accent points.
4. The serif italic is the planner speaking. No one else may use it.
5. Quiet comes from scale, weight, spacing, and restraint — never from contrast below 4.5:1.
6. Empty is a reward. Every empty state is written as an achievement.
7. Nothing exclaims. The interpunct separates. Uppercase is tracked and tiny or absent.
8. Motion has manners: identity moments may breathe; everything else is 140–700ms and respects reduced-motion at the token level.
9. Offline is a designed condition, never an error.
10. No machinery on stage. Sources, models, sync, and pipelines exist; the traveler sees their *effects*, in voice.

### 3.1 Color
- Token pipeline as in §2.4. Add `--ink-faint` recalibrated per palette to ≥4.5:1; add `--line-strong` (≥3:1) for functional borders (inputs, checkboxes, the flap ticks); add per-palette `--accent-text` (a text-safe darkened accent for eyebrows like "LEAVE BY") distinct from `--trip-accent` used on fills.
- Status colors are frozen semantics. As the fact ledger arrives, resist the urge to add more: confidence gradations render as *sentence form and dash*, not as new hues. Three status colors is the vocabulary; a fourth is creep.
- Manifest and splash follow palette+theme (dark-launch flash of cream is a broken promise at the front door).

### 3.2 Typography
- Three voices, one exception granted: **the interlude** (the Wildsam-style 80–150-word almanac piece, one per day) may set in Source Serif 4 *upright*, at body size, with a drop-folio ornament. Reading 150 words of italic is punishment; reading them in the system grotesk wastes the moment. The rule that protects the narrator survives intact: *italic* serif remains exclusively first-person planner speech. Upright serif appears only inside the interlude block, which is visually framed (hairline top rule + tracked label "ALMANAC ·" or the day's name) as quoted matter — the guide's marginalia, not its voice. This is a ~20KB font addition and the single biggest print-quality upgrade available.
- Tabular numerals everywhere a time or code appears (already done — keep `.num` sacred).
- The scale stays eight steps. Field mode stays 112.5% base. Large-text stays a one-attribute lever.

### 3.3 Motion
- Tokenize the remaining two-thirds: the spring curve, view-transition durations, stagger steps (`--stagger-row: 65ms`, `--stagger-chip: 34ms`), `cardfan`, `wgrow`. Motion becomes as auditable as color.
- The grammar gets one addition for the overhaul era: **arrival choreography for updates.** When a T-72h refresh lands a changed fact, the change surfaces as a quiet single-line ripple in the affected card (240ms, once) with a dated whisper — never a toast, never a badge. The guide is allowed to have been re-checked; it is not allowed to be excited about it.

### 3.4 The Now view
The Now view is the product's heart during the trip and its design brief is *a good hotel concierge*: present, informed, silent until useful.
- **LEAVE BY is a promise, and promises need engineering.** The midnight/DST wrap bug is a design failure wearing an engineering costume — a wrong LEAVE BY once, and the countdown ring is decoration forever. The ring, the −10min buffer, the timeshift scrubber all stay; they get a correctness contract (real interval math, routing-derived travel time from the pipeline, tz-safe).
- **Silence is a state, designed.** The "nothing scheduled" card keeps its consolation copy and gets the day's remaining shape as a whisper beneath (three ghost words: "dinner at seven"). Enough to reassure, not enough to summon.
- **Nudges (Declarative Web Push) enter under treaty:** at most one per block, LEAVE BY only, opt-in per trip, written in system register ("LEAVE BY 3:40 · Huntington"), no emoji, no re-engagement of any kind, ever. The notification channel is the single easiest place to lose the brand; §7 makes this a standing law.
- Per-viewer participation filtering stays — "the Now view adapts to you" is personalization as service.

### 3.5 The wallet, prep, and the artifact details
- Wallet stays derived from confirmations (single source of truth) and keeps the fan. Real `.pkpass` at compose time extends it. Band colors remain kind-semantics; "policy" gets its own token instead of borrowing ink.
- **Print-quality details program** — the cheap moves that make it an object: a designed title page per trip (frond, trip name in narrator voice, "Composed for the Lius · June 2026"); running-head day labels; the § lodging card treated as a proper specimen sheet; receipts styled as footnotes with dated "checked Tue" whispers; and a **colophon** — an end page in voice ("Composed from your answers and 214 checked facts. Imagery © Esri. Map data © OpenStreetMap.") which *solves the attribution violation by making attribution beautiful* instead of hiding it at 8px. Print books never hid their colophons; neither do we.

### 3.6 Afterglow — the fourth act ships
Styled since June 14, never wired. It becomes the keepsake mode: the trip past-tense, palette shifted one temperature warmer, blocks re-rendered as a diary ("you left by 3:41, as planned"), the one afterglow question ("What was the actual best hour?") asked once, in voice, skippable. Then the guide rests, permanently unlockable. This is the retention loop (the CEO agrees) but I claim it for design: afterglow is where the object earns keepsake status, and keepsake status is why the *next* trip's invite gets opened.

### 3.7 The Studio — same house, different room
The composer's desk-width surface (finally, a desktop layout) is a second *room*, not a second brand: same paper, same ink, workshop temperature. Design positions:
- **The graph never looks like a graph.** No nodes-and-edges diagram anywhere near this product. The traveler model renders as *galley proofs with margin notes*: sentences with provenance marks ("mornings are yours ● confirmed" / "leans quiet over famous ○ my hunch"), editable inline. Same treatment, smaller, appears in the traveler's "You" tab — silent inferences inspectable as prose, correctable in a tap.
- The scorecard heat-map is Studio-only. **No score, gate, tier, or pipeline artifact ever reaches a traveler surface.** The traveler sees dashes, ambers, and "checked Tue" — the effects, in the shipped vocabulary.
- The thesis gate is a designed moment: one sentence in the narrator's serif on an otherwise empty page, approve or rewrite. Taste enters through a door that looks like taste.

---

## 4. Maps as editorial objects

The current map story is one register doing two jobs. Split it:

1. **The Day Map (the workhorse) becomes paper.** A PMTiles vector basemap styled entirely in the trip's tokens — ink lines on paper, water in the palette's coolest neutral, labels *suppressed by default*. Onto this near-silent ground goes the composed layer: the trek line, a dozen chosen points labeled in guide voice ("the good bench", "leave bags here", "last bathroom before the trail"), and a one-line caption that is the day's thesis ("West to the water, dinner where the fog comes in"). This is Herb Lester's insight made interactive: a map is an argument about what matters. And because PMTiles lives in OPFS, *this* map keeps the offline promise the satellite treks currently break — the paper map is the offline-first map, definitionally.
2. **The Trek (the cinema) stays as the set-piece** — satellite, DEM, globe spin, typewriter dwells — an online, theatrical, once-per-day moment, feature-frozen per the CEO (I concur, with the one exception below). Its offline fallback, the SVG sketch, gets promoted from apology to aesthetic: retitle it in voice ("the field sketch"), because a hand-drawn fallback *is* the brand, not a degradation.
3. **Attribution moves to the colophon** (§3.5) plus a compliant, designed on-map credit line — small, ink-faint-at-the-new-contrast, honest.

Where I differ from the CEO's "trek-map scope freeze": the paper day-map is *new* map work and it is not optional polish — it serves the offline promise and the editorial thesis simultaneously, and it should ride the PMTiles engineering already funded in the local-first plan. Freeze the cinema; build the paper.

---

## 5. The interview — conversation design

The interview is the product's first pleasure and the trip's first hour. The science (report 05) is excellent and I adopt its skeleton wholesale: story first, 7–9 turns under five minutes for the organizer, ~4 for invitees, reflections before questions, forced-choice late, constraints as care, summary always, everything skippable. My charge is how it *feels*, so:

### 5.1 Pacing and silence
- **One question per screen, and one breath before it.** After the traveler finishes the story answer, the next screen opens with the reflection alone — the question arrives a beat later (a 600–900ms staged entrance, reduced-motion-safe). The pause is the product listening. No typing-indicator theater, no fake "thinking" spinners; the planner is quiet, not performing effort.
- **Movements, not progress bars.** Keep the four-movement structure ("The bones / The reason / Your taste / The shape") as the only progress signal — a tracked uppercase label, not a percentage. Percentages are forms; movements are conversations.
- **The ledger, not a draft.** The interview-science report suggests "showing the payoff" as a day-skeleton sketching itself mid-interview. **I disagree.** A visible half-formed itinerary anchors the traveler, invites premature negotiation, and turns a conversation into a configurator. The payoff surface stays what it already is — the "What I'm hearing" ledger, in hunch/pattern/confirmed vocabulary — which proves listening without proposing. The plan's first appearance should be the composed guide. Anticipation is the product; don't spoil the reveal.

### 5.2 Warmth mechanics
- Every question after the first opens by proving it heard the last one — a reflection in narrator register, specific, never flattering ("Nobody looked at a clock that night — noted.").
- Ambivalence is honored aloud: "Part of you wants every hour spoken for; part wants to cancel everything. I can plan for both — mornings shaped, evenings loose." Tensions become design features of the plan, and the traveler hears that *during* the interview.
- The constraints sweep keeps its care-framing and adds the verbatim read-back as a designed moment: constraints render in the same solid-border, confirmed-green treatment the guide will use — the first appearance of the certainty vocabulary, teaching it before the trip needs it.
- The closing summary is the emotional peak and gets the room it deserves: full-screen, narrator serif, the MI-style hand-back, then the handoff line. **And the handoff must be true before the button exists** — I co-sign the CEO's kill of handoff theater without reservation. A trust product may never animate a promise it cannot keep.

### 5.3 The question bank is written, not generated
The EVPI machinery chooses *which* question and *when to stop*; it does not get to write questions at runtime. Every question in the bank is authored by a human in the house voice, reviewed like product copy, versioned in the Editorial Bible. "What's abundant where you live that you'd never travel for?" is a better question than any model will improvise under a sampling temperature, and "Either is fine. I just want your lean." must appear character-for-character. **Principle: the machine selects; a person wrote every sentence the traveler ever reads twice.** (Reflections are the licensed exception — they are generated, but they are constrained to the reflection grammar in §6 and linted like everything else.)

### 5.4 The invitee interview is gift-shaped
Four turns, ninety seconds, opened from the invite link with the key already in the fragment: one short episodic anchor, one rhythm lean, one veto, constraints. It must feel like being asked your preferences by a good host, not onboarded by an app — no account, no name-typing if the organizer already named you ("You're Maya, if I have it right?"). Children get the playful two-question version. The organizer never speaks for adults who can speak.

---

## 6. The voice charter (the guide the Editorial Bible builds on)

The editorial-craft report's Bible outline (09 §II) is adopted as written — banlists, entry anatomies, personalization grammar, honesty clauses. This section is the layer above it: the registers and the laws, for every string in the product, human- or machine-written.

**The three registers (frozen):**
1. **System** — Inter, tracked uppercase, telegraphic. "LEAVE BY 3:40". Never a full sentence. Never uppercase shouting outside the eyebrow idiom (the bare "LOADING" string dies; the frond alone is the loading state).
2. **Narrator** — serif italic, first person, present tense, calm certainty. The planner. Speaks at thresholds (splash, interview, handoff, summaries, day theses) and in margins ("our read ·"). Never inside logistics. Never mentions AI, models, sources, sync, or research as machinery; it says "I checked" and the receipt carries the date.
3. **Consolation** — the empty-state register. Every empty state names an achievement or a peace, never an absence. ("Nothing saved yet" is banned; "Ready when you are" is the pattern.)

**Guide prose** (the composed content) is a fourth surface with its own bible (09): second person, opinionated-but-calm, why-sentences ≤35 words, one interlude and one quoted human per day, constraints as service never labels, uncertainty in voice ("Hours here wander; if the gate's shut, the bakery two doors up opens at 7").

**Laws that bind all registers, enforced by the Gate-1 lint:**
- No exclamation marks. No emoji. No "awesome," no "amazing," no "delve."
- The interpunct `·` is the separator; em-dash for asides, one per paragraph.
- Numerals for times, prices, distances; tabular figures.
- The traveler is named at most once per surface, at the right moment. Celebrations are referenced once per guide, where they land hardest.
- The planner never apologizes for the world ("Sorry! That's closed") — it re-plans ("The gate's shut Mondays, so Tuesday it is; the fallback holds.").
- Errors stay in character and say what to do next ("That code didn't open it. Try again.").
- Notifications use system register only, and only for LEAVE BY (§3.4).
- Nothing in the product ever asks for a rating, a share, a review, or a streak. (This is a voice law, not just a product law: the voice never wants anything from you.)

**The calibration corpus is a design deliverable.** The 20–30 exemplary/acceptable/reject entries, plus the existing product strings as the north-star set, get curated by this seat with the owner. Every human edit to composed prose feeds it. Voice fidelity in Gate 3 is judged pairwise against *this corpus* — meaning the voice is protected by an artifact, not a vibe.

**Naming debt:** Glide, TL, and `tl.` die everywhere user-visible and in storage keys (with migration). One product, one name, one voice.

---

## 7. Guarding the quiet — the standing office of No

The council will, with the best intentions, propose engagement. The graph will make suggestions possible; the Worker will make messages possible; the service ambition will make upsells thinkable. So the last deliverable of this seat is a permanent instrument:

**The Quiet Test.** Every proposed traveler-facing feature must answer four questions, in writing, before design begins:
1. Does it ask anything of the traveler? (Attention, input, decision, guilt.) If yes, what does it *give back within the same breath*, and is the exchange in the traveler's favor?
2. Can it interrupt? If yes, it needs a treaty (frequency cap, opt-in, register, and a named human who approved it).
3. Does it make the machinery visible? If yes, redesign until only the effect shows.
4. Would it survive being printed? (A field guide can hold a map, a footnote, a colophon, a wallet pocket. It cannot hold a notification badge, a chat bubble, a progress gamification, or a "3 friends are viewing." When in doubt, ask the paper.)

**Pre-emptive rulings on creep I can already see coming:**
- **No chat surface, ever.** The interview is a conversation with a shape and an end. An open chat box turns the planner into a chatbot and the artifact into a session. If mid-trip re-planning arrives someday, it arrives as the decision-point idiom (options, pros/cons, "your call"), not a text field.
- **No collaborative presence.** Shared trips may sync state (encrypted, LWW, invisible); they may never show cursors, avatars, activity feeds, or "Maya checked off sunscreen."
- **No dashboards for travelers.** Verification confidence, graph contents, refresh history — all of it surfaces as the existing epistemic vocabulary (dash, amber, receipt whisper) or not at all.
- **No badges, streaks, points, confetti, or celebratory modals.** The reward for using the product is the trip.
- **No seasonal/marketing surfaces inside a trip.** The guide belongs to the traveler; it is not inventory space, and (per the CEO, permanently) never carries a commission link.
- **The nudge treaty (§3.4) is a constitution, not a default.** Any second notification type requires this seat's sign-off and a re-read of this section.

**Disagreements with the council, on the record:** I part with the CEO only in emphasis — the paper day-map is new map investment worth funding now (§4), and afterglow is not merely the retention loop but the artifact's fourth act, so its craft budget should match the splash, not a settings page. I part with the interview scientists on mid-interview plan previews (§5.1) and on runtime question generation (§5.3). I part with the design audit's suggestion that Drift's aurora might be promoted: it dies whole (§2.2). And I add one thing no report asked for: the upright-serif interlude license (§3.2), because the soul budget deserves a reading face.

---

## 8. Sequencing (this seat's deliverables, aligned to the CEO's cut)

1. **Now (pure writing, zero code):** The Paper Rules v1; the voice charter above folded into the Editorial Bible; the calibration corpus started (the existing strings are already collected in the audits); the interview question bank v3 authored in-voice against the 05 spec.
2. **With foundation triage:** token pipeline spec (palette JSON schema, contrast gates, the four new tokens: recalibrated `--ink-faint`, `--line-strong`, `--accent-text`, `--status-policy`); kill list executed (Drift, typestyles, debug matter, sub-44px overrides, `✓` glyph, mailto).
3. **With the loop closing:** interview v3 conversational UX (pacing, reflections, movements, summary moment); the "You"/Studio prose-graph treatment; handoff moment designed *after* transport exists.
4. **With PMTiles work:** the paper day-map style (tokens → MapLibre style JSON), label voice rules, day-thesis captions, the colophon.
5. **Then:** afterglow, the print-quality details program, `.pkpass` visual spec, nudge treaty implementation.
6. **Always:** the Quiet Test applied to every council proposal, starting with this cycle's.

---

## 9. Closing

The archaeology found something rare: a product whose smallest parts — a dashed border, an interpunct, an italic — all say the same sentence. The overhaul's danger is not that the new machinery will fail; it is that it will succeed loudly. Graphs, verifiers, pipelines, push channels, and service revenue all generate pressure to show themselves, and every one of them must be dressed in paper and taught to whisper before it enters the traveler's pocket.

Fix the gray that pretends to be quiet. Cut the second religion. License the almanac its upright serif. Make the maps argue. Let the interview breathe. Ship the fourth act. And keep the only rule that has ever mattered here: the product never wants anything from you.

Enjoy the quiet. That's not a tagline; it's the spec.
