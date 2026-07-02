# 20 — Completeness Critic: Gaps in the Final Blueprint
### Reviewed: 19-FINAL-BLUEPRINT.md closely; 03–18 skimmed; 01–02 sought and not found · July 2, 2026

The blueprint is unusually disciplined — falsification tests, do-not-build list, owner questions, honest day-budgets. But a plan this self-aware earns a harder audit. Below: what is missing, hand-waved, asserted-without-source, or silently assumed, ranked by how badly it can hurt. One-line fix each.

---

## Ranked gaps

**G1 — The entire program hangs on an unverified date.** "Durham departs October 16" first appears in the architect paper (11, §"one scheduling fact") with no citation, no source in any repo, and no owner confirmation; every deadline (code freeze Oct 3, week-by-week roadmap, "the calendar is a gift") is derived from it, yet §9's owner questions ask *who* the party is (Q7) but never *whether the trip and its dates are real*.
**Fix:** Add owner question #0 — "Confirm Back-in-Durm exists, its exact dates, and the party" — and state the roadmap as offsets from T-departure so it survives a date change.

**G2 — The rewritten privacy promise rests on an unverified vendor claim.** Week 1 ships copy saying answers are processed "under agreements that nothing is kept or used to train anything," backed by "zero-retention API agreements" — but no report checked whether zero-data-retention terms are actually available to a solo developer at standard API tiers (typically: no-training by default, but ~30-day abuse-monitoring retention; true ZDR is an enterprise/sales-negotiated tier). The blueprint would replace one false privacy sentence with another.
**Fix:** Verify each candidate provider's actual API retention/ZDR terms in week 1 *before* rewriting the copy, and word the promise to what the signed tier literally guarantees.

**G3 — Nobody books anything: the reservation workflow is missing.** The wallet is a flagship feature ("derived solely from block confirmations," QR passes, booking-coherence checker), yet no verb, gate, or time budget covers *making* reservations, receiving confirmation emails, parsing them into ledger claims, or minting QR payloads — the "~4 hours of attention per trip" excludes what was plausibly the most manual part of LA.
**Fix:** Add a `bookings` intake step (forward/paste confirmation → ledger claim + wallet derivation) to §3's verbs and schedule booking labor into the Gate-1 session alongside the phone calls.

**G4 — Prompt injection into a safety-critical pipeline is never mentioned.** Research workers browse untrusted web pages, the inbox ingests TikTok/Instagram/Maps content, and travelers type free text — all of it flows into LLM calls that populate the fact ledger that drives the *allergen* checker; the T0 rule stops model memory but does nothing about a venue page (or pasted caption) that says "dedicated GF fryer" adversarially or by SEO sloppiness, and no threat-model line, checker, or red-team item covers instruction injection or poisoned sources.
**Fix:** Add injection hardening to §4.4/§7 — research outputs constrained to fixed forms, source snapshots stored with every T1 allergen claim, and human eyes on the snapshot for any hard-constraint fact.

**G5 — No composer-side disaster recovery.** The HPKE private key ("OS keychain, never in the repo"), the Traveler PKG ("never leaves the composer's machine"), and un-pushed trip directories have zero backup story; a lost laptop in September makes every sealed drop permanently undecryptable and destroys the traveler model the "compounding moat" depends on — the engineering review's own C3 ("unrecoverable if the laptop dies") was fixed for source code and silently not for keys and data.
**Fix:** Add to §7 standing policy: paper/passphrase escrow of the composer key + encrypted off-machine backup of `trips/` and the PKG, done in week 1 with the transport.

**G6 — `research` is the least-executable verb in the plan.** "Frontier + web search tools," "30–80 agentic tasks ~$10–30": no named search/data provider, no cost verification, and — worse — the Hours checker requires per-date opening hours whose only named structured source (Google Places, in 09 §3.2's T1 list) has ToS that forbid caching/redistributing place details, i.e., shipping Places-derived hours inside trip-data.enc is likely a license violation nobody examined.
**Fix:** Write the one-page source map — per fact-class provider (venue sites, official feeds, OSM) with ToS + cost check — before the L12 build, treating Places as a pointer, never a shippable value.

**G7 — Composing Durham itself has no day budget.** September's ~15 days are all machinery; item 21 ("Durham composed end-to-end… interleaved") hides the first-ever run of an unproven pipeline — real research, phone calls, Gate 1, prose review, final read — which will not cost the steady-state "4 hours of attention," and the budget-honesty section never prices it.
**Fix:** Reserve 5–8 explicit content days in September for Durham composition, taken from polish (PMTiles/design consolidation) if the calendar fights back.

**G8 — The governing corpus is dangling.** The constitution says "Papers 01–17 govern where this document is silent," but 01-app-anatomy and 02-evolution are absent from the record (the skeptic cites reading them; they're nowhere on disk) and 07-landscape sits misfiled outside the reports directory — the blueprint delegates authority to documents that can't currently be consulted.
**Fix:** Recover and re-commit 01, 02, and 07 into the canon (they also likely contain the only provenance for G1's October 16), or strike the governance clause.

**G9 — A ⚖ test is reported as "already run" that no one ran.** The envelope-timing test — the sole justification for demoting envelope v2 from security work to September UX work — is marked "already run — one hour of arithmetic," but its source is the skeptic's own inline assertion "(it does — ~10^15 guesses at 270ms-class cost)" with no recorded calculation; the blueprint's proudest discipline (Law 1) is violated by its first applied instance.
**Fix:** Actually run and commit the one-hour arithmetic (diceware entropy × per-trip salt × PBKDF2-600k cost model) in week 1 before the schedule relies on its conclusion.

**G10 — Interview session mechanics are unspecified.** The instrument and question policy are well-specced, but nothing defines mid-interview abandonment, resume across days/devices, retakes, duplicate sealed submissions, or episode idempotency — real failure modes for a 7–9-turn flow on a family member's phone, and "engagement decay" only handles the in-session case.
**Fix:** Add a short session contract to §4.3: local draft persistence, resumable sessions, content-hashed episode IDs so `pull` dedupes, and an explicit partial-submission policy.

**G11 — The device matrix is one iPhone.** Phase 0 verification, the airplane-mode rehearsal, and the OPFS side-load test all name "a real installed iPhone"; the engineering review's Android findings (no manifest icons on la/durm, maskable icon clipping, install banner never offered) don't surface in the blueprint, and nobody asks what phones the Durham party actually carries.
**Fix:** Add "party device census" to owner Q7 and one Android device to every real-device checkpoint; fix the manifests in Phase 0.

**G12 — Legal handling of other people's medical and child data is deferred past the moment it starts.** Sealed collection of allergies, mobility limits, and children's details from non-household adults begins in early August, but the only legal treatment is Q12 ("by year-end, no code depends on these") about *commercial* liability — data-protection obligations (and simple informed-consent hygiene) exist for gifts too, and no report touched them.
**Fix:** Before the first sealed interview, write a one-page consent-and-retention note (what's collected, who reads it, deletion via "forget me") shown at interview start — it's also good product copy.

**G13 — Live-trip operations assume a composer at a desk, but Richard is probably on the trip.** Canary alerts, `wrangler tail`, T-24h refresh review, and incident response all route to Richard's phone while he is — on the historical pattern of la-fieldguide — traveling with the party; there is no runbook for "the operator is in the field," and Law 3's human sign-off collides with an automated T-24h refresh he may have no laptop for.
**Fix:** Add a traveling-composer runbook to §3: pre-authorized refresh policy (auto-apply logistics-only diffs, hold prose), alert thresholds worth interrupting a vacation for, and "do nothing, guide stays stale-but-whole" as the default.

---

## Owner-ask scorecard (was the explicit ask honored?)

- **Critical review of existing work:** strong (03, 04, 12 §2 self-critique) — no gap.
- **Interview mechanics down to details:** strong on instrument/policy (05, 13 §4); gapped on session mechanics (G10) and the fact that the actual question strings and letter templates remain unwritten deliverables.
- **Knowledge-graph structure:** strong (06, 13 §3, statement schema) and honestly hedged by the blind test — no gap beyond entity-resolution mechanics being one line ("ER: deterministic") in a cost table.
- **First-principles research:** strong breadth (05–09), with two soft spots: the week-2 "user evidence" is n=2 adults + one family debrief yet is billed as re-ranking the whole backlog, and market/positioning claims (the "empty quadrant") are argued from secondary sources only — both acknowledged-ish, neither fatal.

Filed by the Completeness Critic.
