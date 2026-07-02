# Handoff — Excurse overhaul build

**Status as of 2026-07-02 ~05:15 UTC.** A prior session ran a 21-agent review council to
completion (results pushed) and then started an implementation build workflow, which was
**stopped mid-flight by explicit user request** ("stop, there is another agent running on this
already") — not because of a failure. This directory is **uncommitted, untracked work** (`git
status` shows `excursed/` as `??`) sitting on top of the pushed council-record commit. Nothing
here has been pushed. Treat it as a draft to inspect, fix, and either keep or discard.

## Read first

`/home/user/excurse-app-site/docs/overhaul/19-FINAL-BLUEPRINT.md` is the spec this code
implements — it's committed and pushed (commit `98321d4` on
`claude/project-review-overhaul-acl9y4`). `docs/overhaul/13-council-ai.md` is the more detailed
"AI Systems Architect" spec the packages below were built from (spine = append-only episodes;
five organs = interview, graph, agenda, compose, verify). `docs/overhaul/20-gaps.md` lists 13
unresolved gaps in the blueprint itself, several of which are open questions for the human owner
(actual trip dates, party device census, consent posture) — not implementation gaps.

## What exists, package by package

Monorepo at `excursed/` (npm workspaces, ESM, TypeScript strict). Root `package.json` scripts:
`npm run typecheck`, `npm run test` (vitest), `npm run excursed` (CLI, not yet wired).

| package | state | typecheck | tests |
|---|---|---|---|
| `packages/schema` | **complete** — the single Zod contract every other package imports (`@excursed/schema`). Core ids/ULIDs, 12 node kinds, statements with 6 provenances + provenance-conditioned validation (quote required for stated/implied, confidence caps for inferred/assumed), episodes, interview bank/scorer types, agenda rows (R1–R7), ledger claims with the T0-rule shape, guide/bundle output schema, trip directory layout constants. | ✅ clean | (no tests — pure types/schema) |
| `packages/graph` | **complete per its build agent** — JSONL append-only store, `TripStore` with the hard guard (rejects non-`stated` `hasConstraint`), `GraphQuery` (coverage, bestConfidence per aspect), `LlmClient` interface + checkpointing/fixture wrappers, extractor (Pass B prompt + parser + apply), deterministic entity resolver. | ✅ clean | ✅ all passing |
| `packages/agenda` | files written, build agent was mid-verification when stopped — **treat as unverified but it typechecks and its own tests pass now**. R1–R7 rule derivation, per-stop-type forms with `UNFOUND`, research worker harness, T-72h/T-24h refresh driver. | ✅ clean | ✅ all passing |
| `packages/interview` | files written, same caveat as agenda. Question bank, deterministic scorer (impact × uncertainty × answerability − askCost), Round-1 session state machine, letter/invitee modules. | ✅ clean | ❌ **3 failing tests** — see below |
| `packages/compose` | **empty** — only `src/` exists, no files. Spec: `docs/overhaul/13-council-ai.md` §6 (four passes: thesis → skeleton → prose → stamps, plus sloplint + editorial bible). |  — | — |
| `packages/verify` | **empty** — only `src/` exists, no files. Spec: §7, 9 checkers + the 20-seeded-violation release-blocking test suite. |  — | — |
| `packages/cli` | **empty** — only `src/` exists, no files. Spec: command surface (`init/interview/extract/agenda/research/compose/verify/pack/status`) + `fixtures/trip-zero` + the end-to-end test proving the packed envelope decrypts under the *already-deployed* shell's crypto (`{v:1, kdf:"PBKDF2-SHA256", iter:600000, salt, nonce, ct}`, AES-256-GCM). Nothing here yet. |  — | — |

## The one known bug to fix first

`packages/interview/src/session.test.ts` fails 3/80 tests against `session.ts`. Root cause looks
like a bank/test mismatch: the test drives `occasion.meaning` expecting a `text`-kind answer, but
`bank.ts` declares that entry as `kind: "chips"`. Either the bank entry's kind is wrong or the
test's input shape is wrong — 10 minutes with `packages/interview/src/bank.ts` and
`session.test.ts:104-142` side by side will show which. This package's build agent was killed
before it could fix this (was still in "Organs" phase, mid self-verification loop) — it is not a
regression from stopping, it's a pre-existing bug in what was generated.

## What's not started

- `compose`, `verify`, `cli` packages — zero code.
- Nothing has been run end-to-end. No `trip-zero` fixture exists yet.
- No commit has been made for any of this — it's all working-tree state.

## How to resume the build (optional — this may be superseded by other work)

The build was driven by a `Workflow` script that fans out one agent per package against the specs
above, with strict conventions (no new npm deps beyond `zod`; workspace deps like
`@excursed/schema`; vitest colocated tests; typecheck+test must be green before an agent returns).
The script that generated `schema`/`graph`/`agenda`/`interview` is saved at:

```
/root/.claude/projects/-home-user-excurse-app-site-excursed/39e57f04-4217-524f-bfc9-7ff5893fe172/workflows/scripts/excursed-build-wf_8274f72e-f1c.js
```

It can be re-invoked with `Workflow({scriptPath: "...", resumeFromRunId: "wf_8274f72e-f1c"})` —
completed agent calls (schema is baked in as pre-existing; graph/agenda/interview already ran)
return cached results instantly; only `compose`/`verify`/`cli` and the final integration/hardening
phases would run fresh. Read the script before resuming — it embeds the full brief for each
remaining package inline (search for `organ('compose'`, `organ('verify'`, and the
`Integration`/`Harden` phase agent calls). Whether to resume this exact workflow, rewrite it, or
take a different approach is a judgment call for whoever picks this up — it is not committed
anywhere, so discarding it entirely and starting over is also a completely safe option.

## Constraints that matter if you keep building

- **Never break the live shell's crypto.** The three deployed repos (`la-fieldguide`,
  `durm-guide`, this one's already-shipped `trip-data.enc`) decrypt with a specific envelope
  (`{v:1, kdf:"PBKDF2-SHA256", iter:600000, salt, nonce, ct}`, AES-256-GCM via WebCrypto). Any
  `pack` command in the new pipeline must produce byte-compatible output, or explicitly version to
  a v2 envelope with a migration path — see `docs/overhaul/15-council-security.md` and
  `19-FINAL-BLUEPRINT.md` §7 for the security seat's ruling on this.
- **Constraint statements only at `provenance: "stated"`.** This is enforced in
  `packages/schema/src/statement.ts` (zod-level: quote required) and again in
  `packages/graph/src/trip.ts` (store-level: rejects non-stated `hasConstraint`). Don't relax
  either guard — it's the allergy-safety backstop the whole verifier design leans on.
- **T0 rule for research claims**: a claim citing no retrieved source is invalid
  (`packages/schema/src/ledger.ts`, `superRefine`). This is what prevents hallucinated hours/facts
  from ever reaching a traveler.
- **`la-fieldguide` and `durm-guide` were never touched** by any of this work — only
  `excurse-app-site` has changes (the pushed `docs/overhaul/` commit, and this uncommitted
  `excursed/` directory).
