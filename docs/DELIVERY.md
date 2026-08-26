# Delivery Guide

## Definition of done

A change is ready when it has one clear implementation outcome, focused coverage for changed behaviour, updated documentation where meaning changed, and the relevant execution gates satisfied with evidence.

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

## Work-in-progress and scope control

Default to one primary implementation thread for this repository. Parallel implementation is appropriate only when dependency analysis shows the work is genuinely independent and will not conflict in shared architecture, state, schema, routing, provider or trust-boundary code.

When new work is discovered:

1. determine whether it is required for active acceptance criteria/root-cause correction;
2. keep required work in scope and explain why;
3. park non-required work with enough context to recover it later;
4. return to the active outcome.

## Continuation and re-entry

A continuation request resumes current delivery state rather than restarting planning. Prefer, in order: blocking PR/CI findings, incomplete acceptance criteria, remaining active-branch scope, then the next dependency-correct outcome in `STATUS.md`/`ROADMAP.md`.

`STATUS.md` is the compact re-entry source and must expose the material current execution gate when evidence is outstanding.

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

## Local delivery loop

1. Install with `npm ci`.
2. Read `PROJECT.md`, `STATUS.md` and relevant system/architecture/data context.
3. Confirm the active implementation contract and overlap state.
4. Implement the smallest complete correction/slice.
5. Use narrow checks while diagnosing.
6. Run `npm run platform:validate` before completion/review.
7. Update only project documents whose meaning changed.
8. Record gate evidence, risks, parked work and next action in the pull request/status handoff.

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

A release is not complete at merge or build. Where deployment applies:

1. identify the exact intended commit/version;
2. verify provider/configuration/migration prerequisites;
3. deploy to the intended environment;
4. confirm readiness and runtime logs;
5. run representative smoke/end-to-end behaviour;
6. confirm auth and safe representative persistence where appropriate;
7. record limitations and recovery/rollback path;
8. update `STATUS.md` with the real release/verification state.

Roll back by redeploying a known-good compatible version where safe. Prefer roll-forward when schema/provider/data changes make rollback unsafe. Never create browser-side persistence as an emergency fallback for failed authoritative domain writes.
