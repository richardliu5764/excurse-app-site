# The Excurse Overhaul — Council Record

**July 2, 2026.** Full critical review and overhaul blueprint for Excurse, produced by a 21-agent
council: four code archaeologists reconstructing the shipped system from its deployed bundles,
five first-principles researchers working the open literature, eight executive seats arguing the
overhaul, two competing synthesis chairs, a final judge, and a completeness critic auditing the
result. The deployed repos (`la-fieldguide`, `durm-guide`, this one) contain only compiled,
encrypted artifacts — everything here was reconstructed from those artifacts plus primary research.

## Read this first

- **[19-FINAL-BLUEPRINT.md](./19-FINAL-BLUEPRINT.md)** — the definitive, merged overhaul plan.
  One sentence: *keep the guide, build the studio, make every shipped promise checkably true, and
  prove it all on Durham — through a pipeline that must earn each organ with a cheap falsification
  test before that organ becomes code.*
- **[20-gaps.md](./20-gaps.md)** — the completeness critic's ranked audit of the blueprint itself
  (13 gaps, G1–G13, each with a one-line fix). Read it alongside the blueprint; several gaps are
  owner questions only you can answer (trip dates, party device census, consent posture).

## The corpus

| # | Document | Seat / charge |
|---|----------|---------------|
| 01 | [App anatomy](./01-app-anatomy.md) | Full reconstruction of the shipped app: every screen, the trip-data schema, the interview as implemented (it computes a frame draft and discards it), crypto/PIN flow |
| 02 | [Evolution & variants](./02-evolution-and-variants.md) | Glide → TL → Excurse across the three deploy repos; what is per-trip vs shared; the deploy model |
| 03 | [Design language](./03-design-language.md) | The design system reconstructed and critiqued: paper palette, epistemic UI vocabulary, voice |
| 04 | [Engineering review](./04-engineering-review.md) | Ranked defects: frozen service worker, cache strategy divergence, shared salt, plaintext registry, source-custody risk |
| 05 | [Interview science](./05-research-interview-science.md) | Preference elicitation, episodic probes, adaptive questioning, stopping rules, group protocols |
| 06 | [Knowledge graphs](./06-research-knowledge-graphs.md) | Traveler/trip ontology, statement provenance & confidence, extraction from conversation, graph-gap-driven questioning |
| 07 | [Landscape](./07-research-landscape.md) | 2026 market: AI planners, editorial guides, bespoke services; the empty person×artifact quadrant |
| 08 | [Local-first tech](./08-research-localfirst-tech.md) | PMTiles offline maps, iOS PWA reality, Argon2id/HPKE/URL-fragment keys, hosting |
| 09 | [Editorial craft](./09-research-editorial-craft.md) | What makes guidebook writing great; fact-grounding tiers; per-stop research forms; anti-slop |
| 10 | [CEO](./10-council-ceo.md) | Product thesis; scope ruling; the one loop that must become 10× better |
| 11 | [Chief Architect](./11-council-architect.md) | Target architecture: source custody, sealed transport, trip bundle format, migration that never breaks live trips |
| 12 | [Head of Design](./12-council-design.md) | The evolved design system; interview conversational UX; guarding the quiet |
| 13 | [AI Systems Architect](./13-council-ai.md) | **The centerpiece spec**: one spine (episodes) five organs (interview / graph / agenda / composer / verifier), correspondence-model interview, static-impact question scorer, T0 rule |
| 14 | [Editorial Director](./14-council-editorial.md) | The content bar per stop/day/trip; freshness policy; the editor-agent rubric |
| 15 | [Security & Privacy](./15-council-security.md) | Honest threat model; envelope v2; what the AI pipeline may see; the one false shipped sentence |
| 16 | [Operations](./16-council-operator.md) | Everything costed in solo-maintainer hours; leverage-per-effort ranking; do-not-build list |
| 17 | [Red-Team Skeptic](./17-council-skeptic.md) | The steelman for the current system; overhaul failure modes; the falsification test attached to every bet |
| 18 | [Blueprint A (bold)](./18-blueprint-A.md) · [Blueprint B (pragmatic)](./18-blueprint-B.md) | The two competing syntheses the judge merged |
| 19 | [**Final blueprint**](./19-FINAL-BLUEPRINT.md) | The merged ruling: bold thesis where cheap, pragmatic sequencing everywhere, skeptic's tests attached |
| 20 | [Gaps](./20-gaps.md) | The completeness critic's audit of 19 |

## The reference implementation

The blueprint's AI core is implemented in [`/excursed`](../../excursed/) in this repository — the
pipeline monorepo (schema · graph · interview · agenda · compose · verify · cli) with a fully
offline synthetic **trip zero** exercising interview → extract → agenda → research → compose →
verify → pack end-to-end, packing to the exact encrypted envelope the deployed shell already
decrypts. See [`excursed/README.md`](../../excursed/README.md).

## Standing laws (from the blueprint)

1. **The falsification rule** — no proposal graduates from paper to code until its cheapest
   falsification test has been run and survived.
2. **Fail-soft is constitutional** — every component degrades to "slightly stale," never to
   "broken"; zero telemetry, zero third-party JS, zero accounts, machine-enforced.
3. **The human read is permanent** — exactly two human touchpoints per trip (flat-plan gate,
   final read); nothing ships that the composer has not read.
