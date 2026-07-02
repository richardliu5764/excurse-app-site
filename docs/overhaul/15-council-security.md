# Council Position Paper — Security & Privacy Lead

**Seat:** Security & Privacy Lead, Excurse overhaul council
**Date:** 2026-07-02
**Inputs:** app-anatomy (01), evolution (02), engineering review (04), local-first tech (08), plus the CEO (10), Architect (11), and AI (13) council papers.
**Charge:** own the trust story. Threat-model honestly, critique the shipped crypto, design the target, decide what the AI pipeline may see, and keep all of it proportionate — this is a family field guide, not Signal.

---

## 0. Verdict

Excurse's privacy posture is its license to exist. No commission-funded competitor can ethically ask "does anyone have a serious allergy, is there a young child, what are you celebrating" — Excurse can, *because* the answers are encrypted client-side, there are no accounts, no telemetry, and no third-party JavaScript. That posture is real in the shipped bytes and it is the moat.

But today the posture is **true at the center and false at the edges**. The AES-GCM envelope is idiomatic and sound; meanwhile the plaintext wrapper announces, to anyone who loads a public URL, that the Liu family is away from home June 20–24 with a child, in Los Angeles — the single most burglary-useful fact the product holds, leaked *outside* the encryption it built. A public commit message carries a reservation order number. All three trips share one PBKDF2 salt (a deliberate workaround for a storage-keying bug — crypto weakened to paper over an engineering defect, which is the most instructive failure in the whole codebase). The only transport for the most intimate data in the product is a plaintext `mailto:` to the developer's Gmail. And the shell ships a sentence — *"Nothing you said is sent to an outside AI"* — that becomes a lie the moment the compose pipeline calls a frontier API.

The fix is not more cryptography. It is **finishing the boundary**: put every secret on the right side of the line that already exists, replace human-memorable entropy with random keys delivered in URL fragments, build one sealed transport, and rewrite the promises so every shipped sentence is true. All of it is solo-dev-sized. Most of it is days, not weeks.

One correction to my own charge: the briefing describes "an optional PIN re-wrap cached in localStorage." The flagship shell has no PIN at all — the fast path persists the derived **non-extractable** CryptoKey in IndexedDB. That is *better* than a PIN-wrapped key in localStorage would be, and the instinct to preserve it should shape the target design (§4).

---

## 1. The threat model, written down honestly

Nobody has written down who this protects from whom. That absence is why the salt got shared and the trip registry got compiled into public JS: without a stated model, every convenience wins. Here is the model I propose Excurse adopt verbatim into `THREATMODEL.md`.

### 1.1 Assets, ranked by real-world harm

| # | Asset | Where it lives today | Harm if exposed |
|---|-------|----------------------|-----------------|
| A1 | **Trip existence + metadata**: family name, destination city, exact future dates ("away from home June 20–24") | Plaintext in the public JS bundle; commit messages; repo names | Burglary targeting, stalking. Highest *practical* harm, currently least protected. |
| A2 | **Interview intimacies**: serious allergies, a young child's existence and rhythms, mobility limits, what's being celebrated or escaped | localStorage (plaintext in la build; device-key-encrypted in flagship); would transit `mailto:` in plaintext | Medical privacy of named children; emotional privacy ("just get away" can mean a hard year). This is the ethically heaviest data. |
| A3 | **Itinerary content**: where these people will physically be, hour by hour | trip-data.enc (well protected); *leaks via cross-origin tile fetches* (§6) | Real-time location prediction for anyone who obtains it during the trip window. |
| A4 | **Reservations/credentials**: QR codes, order numbers, lodging door codes in key_info | Inside the envelope (good); order W7Y-VSD-LP5Z in a public commit message (bad) | Ticket theft, lodging access. |
| A5 | **The Traveler PKG** (composer-side): durable facts about named people across trips | Doesn't exist yet; drafts sit in localStorage awaiting manual harvest | The compounding asset and the compounding liability. Must be born encrypted. |
| A6 | **Inbox saves**: TikTok/Maps pastes revealing tastes, sometimes a child's school-week schedule | Plaintext localStorage + plaintext mailto | Low-grade but continuous profile leakage. |

### 1.2 Adversaries, in scope

1. **The crawling internet.** GitHub Pages is public; assume every byte of every repo, including git history, is indexed forever. This adversary already won twice (trip registry, commit 0c969b7).
2. **The nosy or hostile acquaintance with the URL** — a coworker who saw the link over a shoulder, an ex, an uninvited relative. Can download the ciphertext and run an **offline dictionary attack at GPU speed, forever**. This is the adversary the KDF choice is actually about.
3. **A lost, stolen, or borrowed phone.** Post-unlock, the guide is one tap away. The primary control here is the *OS lock screen*, not our crypto — be honest about that.
4. **The hosting/CDN platform** (GitHub, Cloudflare) and network observers. See ciphertext, slugs, access patterns, IPs. Accepted and documented, not defended against.
5. **Third-party AI providers**, once the pipeline is real. See whatever the composer sends. A *disclosed, contractual* trust boundary (§5), never a silent one.
6. **Map-tile providers** (today: Esri, AWS). Currently see, per traveler, a live feed of which neighborhoods the family is looking at, when. Under-appreciated and fixable (§6).

### 1.3 Trusted, explicitly

- **The composer (Richard).** He writes the trip; he can read the trip. Excurse is not zero-trust and must not pretend to be — the honest promise is *"Your planner can read your trip. Strangers cannot."* That sentence, in the product's voice, is stronger than any false claim of zero knowledge.
- **The travelers with each other.** A trip key is shared among the invited party; revocation of one traveler means re-keying (acceptable at family scale, §4.5).
- **The traveler's own device and OS.** No defense against a compromised phone is attempted. Proportionality.

### 1.4 Out of scope, explicitly

Nation-states, forensic seizure, malicious composer, compromised endpoints, traffic-analysis resistance. Writing these down is what *keeps the product calm* — every future "should we add X?" security debate gets answered by this list.

---

## 2. Critique of the shipped crypto — graded, not scolded

### What is genuinely good (keep, and say so out loud)

- **AES-256-GCM via WebCrypto, non-extractable keys, idiomatic use.** No hand-rolled primitives anywhere. Rare and commendable.
- **Zero third-party JS, zero telemetry, zero API keys, no accounts.** The strongest privacy property in the product is the code that doesn't exist.
- **The non-extractable CryptoKey fast path in IndexedDB.** Passphrase-once UX where the persisted object *cannot be exported as bytes* even by same-origin code. This is a better design than most "remember me" schemes and better than the localStorage PIN re-wrap the briefing assumed.
- **Ciphertext-as-cache architecture.** Losing local state costs one re-download and one unlock, never data. Exactly right for iOS eviction reality.
- **The manifest-privacy allow-list guard.** Wrong layer (the registry it guards is itself the leak), but the *instinct* — enforce at runtime that trip content can't cross into the unencrypted zone — is the right pattern and gets promoted to a build-time lint in the target (§5.4).

### What is broken, in order of actual severity

1. **The metadata bypass (A1).** Trip names, the family surname, cities, and real future dates sit in plaintext public JS; a reservation order number sits in a public commit message; git history retains every historical ciphertext. The envelope protects the itinerary while the wrapper gives away the headline. **The threat model must state: the existence, name, dates, and destination of a trip are secrets** — then the registry moves inside the crypto boundary (Architect's `atlas-entry.enc`, which I endorse), commit messages become content-free stamps, and la-fieldguide's history is squashed.
2. **The shared salt** (`O/IGickSf0woYu9XLwbgtA==` across all three trips). One precomputed dictionary attacks every trip at once, forever, including future ones. The engineering review's diagnosis is right and important: this was a *workaround for the single shared IndexedDB key slot* — a storage bug fixed by weakening the crypto. The two must be retired together (per-trip salts *and* per-trip key slots), and the lesson institutionalized: **crypto parameters are never the place to fix a storage bug.**
3. **Human-memorable entropy against an offline attacker.** Ciphertext is publicly downloadable with no auth in front of it, passphrases are lowercased/normalized before derivation, and PBKDF2-SHA256 is not memory-hard — thousands of guesses/sec/GPU. A phrase like `golden-hour` does not survive an evening. The fix is **not primarily a stronger KDF — it is removing the human from the entropy path** (random 256-bit content keys, §4.1). Argon2id is the right upgrade for the *fallback* wrap, but if the overhaul shipped fragment keys with PBKDF2 fallback intact, 90% of the risk would already be gone. Sequence accordingly.
4. **One key for everything.** Same salt + one shared key slot + (likely) one passphrase ≈ compromise once, read every trip, past and future. Per-trip keys are non-negotiable in v2.
5. **The plaintext transport.** `mailto:richardliu5764@gmail.com` carrying the inbox queue — and, in the intended flow, interview material — through Google in plaintext, with the address itself hardcoded in the shipped bundle. This isn't a weak control; it is the *absence* of the product's most important control. (§5.1.)
6. **The inconsistent at-rest boundary.** Interview answers device-key-encrypted; identity, packing, visited marks, inbox queue plaintext — on the same origin, describing the same people. And the device-key scheme deserves a precise verdict, not the briefing's "theater": encrypting with a key stored adjacent in the same origin's IDB **does nothing against same-origin code** (there is none — no third-party JS) **but does defeat casual disk/backup/localStorage-dump disclosure.** Weak, not worthless. Still: replace it with one boundary — everything traveler-entered encrypts under the trip content key (§4.4).
7. **No CSP, anywhere.** The zero-third-party-JS property — which the fragment-key design will *depend on* — is currently an accident of restraint, not a policy. One header makes it enforced (§4.6).
8. **AES-GCM nonce discipline is implicit.** Fresh-salt-per-encryption currently sidesteps nonce reuse; v2 must make freshness explicit per edition and bind context via AAD (§4.2).

---

## 3. What the crypto is *for* — the proportionality ruling

Before the target design, the ruling that scopes it. Excurse protects a family's trip from the internet, from acquaintances, and from data-hungry intermediaries. It does not protect family members from each other, the traveler from the composer, or anyone from a seized phone. Therefore:

- **No accounts, no auth server, no per-traveler cryptographic identity.** A trip is a shared capability, like a house key. Per-traveler *personalization* stays client-side and cosmetic (as today); per-traveler *access revocation* = re-key + re-invite, a composer action, acceptable at ≤10 travelers.
- **The PIN (when added) is a courtesy curtain, not a cryptographic boundary.** Against a stolen unlocked phone it buys minutes; the OS lock screen is the real control. Ship it for the shared-device case (a kid borrowing a parent's phone), wrap it in Argon2id-light with a strike counter, and never oversell it in copy.
- **No Signal-grade machinery.** No ratchets, no per-message forward secrecy, no key transparency. The threat model doesn't ask for them and the calm can't afford them.

---

## 4. Target design

### 4.1 Envelope v2: random content key, fragment invites, layered wraps

Adopt the Excalidraw pattern, as the local-first report recommends and the Architect specifies (A4). I add the precise key hierarchy and the honesty notes.

**Key hierarchy per trip:**

```
CK  = random 256-bit AES-GCM content key            (generated by the packer)
 ├─ delivery wrap: none — CK travels in the invite URL fragment  #k=<base64url>
 ├─ passphrase wrap: Argon2id(diceware, per-trip salt) ⊕ CK      (in envelope, fallback)
 ├─ PIN wrap: Argon2id-light(PIN, device salt) ⊕ CK              (device-local only, optional)
 └─ recovery wrap: HPKE-seal(CK → composer X25519 pubkey)        (composer-side, mints new links)
```

- **Invite = tap a link.** `https://excurse.app/t/marfa-x7Qk…#k=…`. Fragments never leave the browser — the host, CDN, and logs never see the key; link-preview fetchers request without the fragment. On open: read fragment → `history.replaceState` to strip it → import CK **non-extractable** → store in a **per-trip** IDB slot (`excurse:key:{tripId}`) → offer PIN. Zero typing. The gift-unwrapping interaction the CEO paper wants *is* the security upgrade.
- **Passphrase demoted to fallback**, generated 4–5-word diceware per trip (survives the existing lowercase/dash normalization by construction — keep the friendly normalization), printed on the physical invitation. The Veil stays for people who got the words verbally.
- **Fragment threat notes, documented in voice, not hidden:** the key rides in the message that carries the link (iMessage/Signal: fine; email: weaker — say so on the composer's send screen, not to the traveler); it sits in browser history until replaceState and in the sender's outbox forever; it would be readable by any third-party JS *which is why CSP (§4.6) is a dependency of this design, not a nicety*; scrub fragments from any future error reporting before such reporting exists.
- **v1 reader retained** for frozen keepsake trips. No forced migration of the LA family mid-memory.

### 4.2 Envelope hygiene

- `{v:2, wraps:[…], nonce, aad, ct}`; **fresh nonce per encryption, always**, checked by the packer (refuse to emit a repeated (CK, nonce) pair — keep a per-trip nonce log in the private repo).
- **AAD binds context:** `aad = {tripId, edition, schemaVersion}`. A ciphertext copied between slugs, or an old edition replayed against a new shell, fails authentication instead of decrypting confusingly. Cheap, idiomatic, prevents a whole class of quiet mix-ups the multi-repo era already demonstrated (the shell's Durham entry serving LA ciphertext would have failed *loudly*).
- **CK is stable across editions** (invite links keep working for silent T-72h/T-24h refreshes); nonce rotates per edition. **Re-key only for revocation** or suspected link leakage — a composer command that mints new links for everyone (`excursed rekey <trip>`), acceptable friction at family scale.
- **Argon2id** via hash-wasm in a Web Worker for the passphrase and PIN wraps: 64 MiB/t=3/p=1, falling back to 19 MiB/t=2 on WASM memory failure. 200–500 ms once per trip is imperceptible. But note the priority inversion I insist on: **fragment keys first, Argon2id second.** A random 256-bit CK makes KDF hardness matter only for the fallback path.

### 4.3 Per-trip key slots and the fast path

Keep the non-extractable-CryptoKey-in-IDB fast path — it is the best part of the current design. Changes: per-trip slots keyed by tripId (retiring the shared `tl-keys/trip` slot and its shared-salt workaround together); "Re-lock guide" deletes that trip's slot only; a new **"Forget this device"** action deletes all keys, all local state, and unregisters the SW — one calm sentence, one destructive button, for the borrowed-phone and end-of-relationship cases.

### 4.4 One at-rest boundary traveler-side

Everything the traveler creates — identity, interview drafts, packing additions, visited marks, inbox queue — encrypts under the trip CK in IDB. One boundary, one sentence to explain it: *"Everything you tell this guide is sealed with the same key that seals the guide."* Legacy plaintext `tl.*` keys migrate on first v2 unlock, then clear. The la build's plaintext interview answers are a shipped bug; migration must scrub them.

### 4.5 Metadata protection — closing the bypass

- **Registry inside the boundary.** Delete the hardcoded atlas array. Each trip ships `atlas-entry.enc` under its CK; "Your trips" renders only locally-unlocked trips; before unlock the shell knows nothing and says nothing. The allow-list guard's promise finally becomes true.
- **Slugs are capabilities-lite.** `/t/{slug}/` needs enough entropy to defeat enumeration (~64–96 bits is plenty given content is ciphertext and the key is in the fragment); the slug *will* appear in CDN logs and browser history — accepted, documented. Don't spend the 128 bits the local-first report suggests on the slug if it makes links uglier; the fragment carries the real secret.
- **Git hygiene, one-time:** squash la-fieldguide (kills the 45 MB pack, all historical ciphertexts, and commit 0c969b7's reservation plaintext), content-free commit messages henceforth (`deploy <stamp>` only — enforced by the deploy script, since process already failed once), **rotate the LA passphrase/key** because its ciphertext lineage was public under a human phrase, and purge the Gmail address from the shipped bundle.
- **Host-side:** GitHub repos go private-or-frozen; new origin on Workers/R2 where headers, and therefore CSP, are controllable.

### 4.6 CSP and supply chain

Ship on the new origin from day one:

```
default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self';
img-src 'self' blob: data:; connect-src 'self'; worker-src 'self';
manifest-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'
```

`connect-src 'self'` is achievable **only after PMTiles moves tiles to own-origin** (§6) — another reason maps and privacy ship together. Supply chain: the moment a source monorepo exists, a lockfile, `npm ci` in CI, and a **pack-time bundle diff** (new third-party origin appearing in the bundle fails the build). The fragment-key design's safety rests on "no foreign JS, ever"; make that a machine-checked invariant, not a vibe.

---

## 5. What the AI pipeline sees — the intimacy boundary

This is the part of my charge that most needs a ruling rather than a mechanism, because the mechanism (Architect A7) is right and I endorse it: interview frames and inbox saves are **HPKE-sealed client-side to the composer's X25519 public key** (pubkey ships in the bundle — it's public by definition) and POSTed to a ~50-line Worker that writes ciphertext to R2, read only at the composer's desk. The mailto dies. My additions:

### 5.1 Transport specifics

- Worker is **write-only** (no read-back endpoint), size-capped (~256 KB), lightly rate-limited, returns only 200/413/429. It sees IP and timing metadata — disclosed in THREATMODEL.md, not defended against.
- Sealed payloads carry `{tripId, kind: interview|inbox, turnIds}` **inside** the seal; outside is only the slug (routing). Trip-scoped at last — the current queue isn't even that.
- Composer decrypts at the desk with a key that lives in the OS keychain / password manager, never in the repo.

### 5.2 The desk rules (where transcripts live)

Interview transcripts are the most intimate object in the product — the Stanford result the interview-science report cites is exactly why: a narrative transcript is the densest model of a person we know how to make. Desk handling:

1. **At rest:** raw episodes and the Traveler PKG are age-encrypted in the private monorepo, key outside the repo. I side with the Architect against the KG report here, and go one further: this applies to *trip* graphs' person/constraint statements too, not just the durable PKG — "private repo" is one leaked token away from public.
2. **Third-party AI calls:** zero-retention/no-training API agreements only; providers named in THREATMODEL.md as a disclosed trust boundary. **Research tasks are pseudonymized by construction** — the research agenda derives from the graph, and a hotel's GF menu question needs `traveler:t3, constraint:gluten_free`, never "Maya Liu, age 6." Prose composition needs first names only. Make pseudonymization the pipeline's *default serialization*, not a discipline.
3. **The pack-time privacy lint** (AI council's proposal — I endorse and want it in CI): grep the compiled bundle for constraint labels, medical vocabulary, PKG identifiers; fail the build on a hit. Shipped guides carry constraint *consequences* ("the corn tortillas here are safe"), never constraint *labels*.
4. **A real deletion story.** A traveler who says "forget me" gets a script, not a promise: PKG statements deleted, trip graphs scrubbed, affected guides recomposed and redeployed, sealed drops in R2 deleted. Ten lines of code that make "private" a verb.
5. **Promotion to the PKG is consent-shaped:** post-trip learnings promote only with owner approval (per the KG report), and anything a traveler marked as skipped/withdrawn in the interview never promotes.

### 5.3 Fixing the false sentence

The shell ships *"Nothing you said is sent to an outside AI"* and *"No raw answers leave the device."* Both become false the moment the loop is real. I endorse the AI council's option (c) — rewrite to the true promise — and offer the copy, in voice:

> *"Your answers travel sealed — only your planner can open them. Research and composing happen at the planner's desk, under the planner's keys, and are never used to train anything. Nothing about you is sold, shared, or kept longer than your trip needs."*

And the deeper honest sentence, somewhere quiet in "You":

> *"Your planner can read your trip. Strangers cannot. That's the whole arrangement."*

Every shipped privacy claim gets a corresponding line in THREATMODEL.md that makes it checkable. Copy review becomes part of security review; in this product they are the same discipline.

---

## 6. Location privacy during the trip

The quiet finding nobody else's paper centers: **Excurse currently leaks live approximate location to Esri and Amazon.** The trek map fetches satellite and terrain tiles cross-origin, per traveler, per view — a feed of "this IP is looking at these three blocks of Little Tokyo at 9:40 AM," correlated across the whole itinerary window, to two third parties, from a product whose tagline is *private*. Also: those requests fail in airplane mode, so the leak doesn't even buy reliability.

**PMTiles from own origin + OPFS pre-download is therefore a privacy feature wearing a maps costume.** After first unlock, tile reads are local; online reads are range requests to Excurse's own origin; `connect-src 'self'` becomes enforceable; third parties see nothing. The local-first report justifies this on offline grounds; I co-sign it on privacy grounds and would rank it above Argon2id in the migration order for that reason. (Attribution to OSM stays, rendered legibly — the design report's Esri-attribution-shrinking concern dissolves when Esri leaves the product.)

Other rulings:

- **Geolocation API: don't.** The Now view is time-based and better for it. If a "you are here" dot ever ships, position is computed and consumed strictly on-device, never transmitted, never logged, and the permission prompt is explained in voice first.
- **Declarative Web Push "LEAVE BY" nudges:** payloads transit Apple's push service and the scheduling Worker. Compose-time-known and minimal by policy: *"Time to head out."* — never venue names, never addresses. The itinerary detail lives in the app the notification opens. The Worker holds subscriptions + send times only; opt-in per traveler at unlock.
- **`.pkpass` files** carry signed *plaintext* (name, reservation code). Ship them inside the encrypted bundle and emit client-side via blob URL — never as hosted static files, even behind the slug.

---

## 7. Disagreements and corrections, on the record

1. **With the briefing's charge:** there is no PIN-in-localStorage in the flagship; the IDB non-extractable CryptoKey fast path is what exists, and it's the *strongest* part of the current UX crypto. The overhaul should keep it, per-trip, not replace it with a PIN scheme.
2. **With the engineering review's "diceware as the fix":** diceware is the *fallback*, not the fix. The fix is removing human memory from the entropy path entirely (fragment keys). Agreeing with the Architect here.
3. **With "protection theater":** the device-key encryption of interview answers is weak (defeats disk/backup dumps only), not theater. Precision matters because the honest grade — "weak, replace" — teaches the right lesson; "theater" teaches cynicism.
4. **With the local-first report's 128-bit slugs:** capability lives in the fragment; slugs need anti-enumeration entropy (~64–96 bits) and legibility. Spend the beauty budget on the link people will actually see.
5. **With any instinct to sequence Argon2id early:** it's the most legible "security upgrade" and nearly the least urgent. History purge, metadata boundary, transport, per-trip salts/slots, fragment invites, PMTiles-origin move all outrank it in harm reduced per day of work.
6. **With the KG report's plaintext-graph-in-private-repo:** person and constraint statements get at-rest encryption in trip graphs too, not only in the PKG.
7. **A note of restraint to the whole council:** every proposal in every paper should pass the question "does this add a promise we must keep forever?" No accounts, no sync-by-default, no telemetry-for-quality — the product's security posture is mostly made of *absences*, and absences are the cheapest controls to maintain.

---

## 8. THREATMODEL.md — the skeleton to commit

```
1. What Excurse protects (assets A1–A6, ranked)
2. From whom (adversaries 1–6) — and from whom it does not (out-of-scope list)
3. Trust anchors: the composer, the party, the device OS, named AI providers (zero-retention)
4. Boundaries:
   - encrypted: trip content, atlas entries, traveler-entered state, sealed drops, PKG, pkpass
   - plaintext-by-design: shell code, slugs (CDN logs), push subscription metadata, Worker IP logs
   - the sentence that governs new features: "existence, name, dates, destination of a trip are secrets"
5. Key hierarchy diagram (CK + four wraps) and rotation/revocation procedure
6. Every shipped privacy claim, quoted, with the mechanism that makes it true
7. Deletion procedure ("forget me") and "Forget this device"
8. Incident notes: 0c969b7 reservation leak; shared salt; plaintext registry — kept as history, not shame
```

## 9. Migration order (security-critical path, solo-dev days)

| # | Action | Effort | Retires |
|---|--------|--------|---------|
| 1 | Squash la-fieldguide history; rotate LA key; purge Gmail + registry from bundle; content-free commits enforced by deploy script | 0.5–1 d | A1 live leaks, 0c969b7 |
| 2 | THREATMODEL.md v1 + rewrite the two false privacy sentences | 0.5 d | the honesty debt |
| 3 | Sealed transport (HPKE → Worker → R2), kill mailto | 1–2 d | A2/A6 plaintext exfil |
| 4 | Envelope v2: fragment invites, per-trip salts + IDB slots, AAD, PIN wrap; v1 reader kept | 2–3 d | shared salt, dictionary attacks, one-key-for-everything |
| 5 | One at-rest boundary + legacy `tl.*` migration + "Forget this device" | 1 d | inconsistent boundary |
| 6 | PMTiles own-origin + OPFS; CSP with `connect-src 'self'` | with the maps work | tile-location leak, foreign-JS class |
| 7 | Argon2id (hash-wasm worker) for passphrase/PIN wraps | 0.5–1 d | GPU-friendly fallback |
| 8 | Pack-time privacy lint + bundle-origin diff in CI | 0.5 d | label leakage, supply-chain drift |

Items 1–3 are *this week* regardless of everything else the council decides. They require no architecture.

---

## 10. What must survive the overhaul

- Client-side encryption of all trip content; no accounts; no telemetry; no third-party JS (now enforced, not accidental).
- The non-extractable CryptoKey fast path — passphrase-once, per-trip in v2.
- Ciphertext-as-cache: local loss costs one re-download and one unlock, never data.
- "Re-lock guide," joined by "Forget this device."
- The allow-list-guard instinct, promoted to build-time lints.
- Privacy expressed in the product's own voice — upgraded from aspiration to fact, sentence by checkable sentence.
- The invitation as the trust ceremony: a link from someone who loves you, that opens into something made for you, that asks nothing back. Every mechanism in this paper exists to keep that moment true.

— Security & Privacy Lead
