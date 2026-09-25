# Delivery Guide

## Definition of done

A change is ready for repository merge when it has one clear implementation outcome, focused coverage for changed behaviour, updated documentation where meaning changed, and the relevant execution gates satisfied with evidence.

The canonical full repository check is:

```bash
npm run platform:validate
```

Passing repository validation does not by itself prove provider, deployment or production runtime state.

## Definition of enough

A change is complete enough to stop expanding when:

- the agreed observable outcome is delivered;
- every in-scope acceptance criterion is satisfied or explicitly not applicable;
- required validation passes;
- no blocking functional, security, data-integrity, accessibility or regression defect remains;
- affected documentation reflects implemented state;
- useful but non-required improvements are parked separately.

Once these conditions are met, further refinement is new scope unless necessary to correct a discovered root cause or make the implementation safe.

## Pull-request delivery lifecycle

Implementation delivery uses the lifecycle vocabulary:

```text
DRAFT → IMPLEMENTING → VALIDATING → READY → MERGEABLE → MERGED
```

`DRAFT` is a logical lifecycle concept. Normal autonomous work should open as a standard reviewable PR. Use native GitHub Draft only when the change genuinely must not be reviewed or merged yet, or substantial implementation is deliberately incomplete.

- **IMPLEMENTING:** in-scope work or completion audit remains.
- **VALIDATING:** required project-owned evidence is missing, running or has exposed a substantive failure.
- **READY:** implementation-complete evidence exists and sufficient current-head project-owned validation is recorded.
- **MERGEABLE:** material review findings are resolved, mergeability/conflict state is acceptable, no material blocker remains, and any applicable release/runtime evidence is satisfied.
- **MERGED:** the validated implementation is integrated into the intended branch.

Lifecycle state should be recorded in repository/PR metadata rather than depending on the native Draft flag.

`npm run platform:validate` remains the canonical full repository validation gate where applicable. GitHub Actions may execute that contract and provide diagnostics, but it is not a duplicate mandatory acceptance gate. An Actions failure blocks merge only when it reveals a substantive implementation, security, data-integrity, test, build, migration or release defect; runner, billing, queue, permission or other CI-infrastructure failure alone does not.

The project/implementing agent owns the semantic decision that the implementation contract is complete. Record that handoff only after criterion-by-criterion audit and current repository evidence. Current lifecycle workflows may automate transitions, but legacy automation that still forces native Draft or GitHub-Actions-only progression is an implementation gap to reconcile, not a reason to change the policy.
## Work-in-progress and scope control

Default to one primary implementation thread for this repository. Parallel implementation is appropriate only when dependency analysis shows the work is genuinely independent and will not conflict in shared architecture, state, schema, routing, provider or trust-boundary code.

When new work is discovered:

1. determine whether it is required for active acceptance criteria/root-cause correction;
2. keep required work in scope and explain why;
3. park non-required work with enough context to recover it later;
4. return to the active outcome.

## Continuation and re-entry

A continuation request resumes current delivery state rather than restarting planning. Prefer, in order: blocking material PR/review/validation findings, incomplete acceptance criteria, remaining active-branch scope, lifecycle evidence required to progress an otherwise complete PR, then the next dependency-correct outcome in `STATUS.md`/`ROADMAP.md`. If the highest-priority item is blocked, record/defer it and continue the next valid unblocked item unless the blocker prevents all useful progress.

`STATUS.md` is the compact re-entry source. Before implementation-complete handoff it should describe the **post-merge** checkpoint that will be true if the PR merges, rather than leaving the current PR recorded as active after it closes.

## Execution gates

For meaningful work:

1. **Project entry** — confirm repository/current state and authoritative project/provider/deployment sources.
2. **Change** — verify desired outcome, existing implementation, dependencies, standards, conflicts and root cause/required capability.
3. **Integration** — prove all applicable real layers are connected; do not treat placeholders/mocks/assumptions as integration.
4. **Release** — verify automated checks plus applicable provider/config/migration/deployment/runtime evidence.
5. **Completion** — prove acceptance, classify remaining work, update project state and identify next dependency-correct work.

If a gate cannot pass, do not advance the work state beyond evidence. Record the blocker and continue safe independent work where possible.

## Human decision threshold

Resolve low-risk reversible technical choices autonomously from repository evidence, accepted architecture and inherited standards. Require product-owner direction only for genuinely unresolved consequential choices such as product scope/behaviour, future-constraining architecture, destructive data, privacy/security posture, external commitments/cost or comparable material trade-offs.

Routine PR state transitions, validation retries, mergeability checks and repository merge do not require product-owner intervention when the implementation contract and mandatory gates are already satisfied.

## Repository delivery loop

1. Read `PROJECT.md`, `STATUS.md` and relevant system/architecture/data context.
2. Confirm the active implementation contract and overlap state.
3. Create/reuse one focused normal PR; use native Draft only for genuinely non-reviewable or deliberately substantially incomplete work.
4. Implement the smallest complete correction/slice.
5. Use narrow checks while diagnosing.
6. Run the applicable project-owned validation, including `npm run platform:validate` for the canonical full repository gate.
7. Update only project documents whose meaning changed; make `STATUS.md` a truthful post-merge re-entry checkpoint.
8. Audit every acceptance criterion and update PR evidence.
9. Add `lifecycle:implementation-complete` only when no in-scope work remains.
10. Progress READY → MERGEABLE → MERGED from current repository evidence; use GitHub lifecycle automation when it supports the policy.
11. If a blocker affects only one path, record it and continue the next dependency-correct unblocked work.

## GitHub configuration boundary

Repository workflow automation currently exists alongside external GitHub configuration gaps documented in `docs/GITHUB_CONFIGURATION.md`.

Most importantly, `main` has no repository ruleset at present. Workflow automation governs its own merge path but cannot guarantee that every administrator/direct push uses that path. Branch protection or an equivalent ruleset remains the preferred independent enforcement boundary.

GitHub Issues, repository auto-merge and update-branch support are also currently disabled. These are tracked as explicit configuration states rather than being inferred from repository code.

When branch protection is added, protect the pull-request/review path and other material repository controls. Do not make GitHub Actions status a mandatory merge condition merely to duplicate the project-owned validation contract; use it as supporting diagnostic evidence.

## Owner-facing reporting

The detailed delivery record belongs in the PR, `STATUS.md`, validation evidence and relevant repository documentation. Routine ChatGPT/Codex responses follow the authoritative concise response contract in `AGENTS.md`: `Done / Next / You`, with `Blocked`, `Problem`, or `Decision needed` only when materially necessary.

Do not reproduce validation command lists, lifecycle history, file-by-file changes or acceptance matrices in chat when work completed normally.
## Environments and configuration

Browser requests use same-origin `/api/ncb/data` and `/api/ncb/auth` routes. Browser-safe overrides are `VITE_DATA_PROXY_URL` and `VITE_AUTH_PROXY_URL`.

Canonical server/runtime NoCodeBackend configuration is:

```text
NOCODEBACKEND_AUTH_BASE_URL
NOCODEBACKEND_DATA_BASE_URL
NOCODEBACKEND_SECRET_KEY
NOCODEBACKEND_INSTANCE
```

Do not create alternate short aliases for these concepts. Exact upstream base/provider contract values must be verified rather than inferred.

The connected Vercel account currently has no ADHD Life OS project binding. Therefore production environment variables, deployed commit and runtime behaviour remain **UNVERIFIED** until a deployment project is deliberately established and checked.

## Release and rollback

A repository merge is not a release. Where deployment applies:

1. identify the exact intended commit/version;
2. verify provider/configuration/migration prerequisites;
3. deploy to the intended environment;
4. confirm readiness and runtime logs;
5. run representative smoke/end-to-end behaviour;
6. confirm auth and safe representative persistence where appropriate;
7. record limitations and recovery/rollback path;
8. update `STATUS.md` with the real release/verification state.

Roll back by redeploying a known-good compatible version where safe. Prefer roll-forward when schema/provider/data changes make rollback unsafe. Never create browser-side persistence as an emergency fallback for failed authoritative domain writes.
