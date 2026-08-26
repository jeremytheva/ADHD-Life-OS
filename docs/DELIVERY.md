# Delivery Guide

## Definition of done

A change is ready when it has a clear issue or pull request scope, focused tests for changed behavior, updated documentation where needed, and passing lint, type-check, test, and production-build commands. Perceptible web UI changes should include a screenshot in the pull request.

## Definition of enough

A change is complete enough to stop expanding when:

- the agreed observable outcome is delivered;
- every in-scope acceptance criterion is satisfied or explicitly not applicable;
- required validation passes;
- no blocking functional, security, data-integrity, accessibility, or regression defect remains;
- affected documentation reflects the implemented state;
- any useful but non-required improvement has been parked as follow-up work.

Once these conditions are met, further refinement is new scope unless it is necessary to correct a discovered root cause or make the implementation safe. Do not convert a focused issue into a broader redesign merely because additional improvements are possible.

## Work-in-progress and scope control

Default to one primary implementation thread for the repository. Parallel implementation should be used only when the work is dependency-independent and unlikely to create conflicts in shared architecture, state, schema, routing, or trust-boundary code.

When new work is discovered during implementation:

1. determine whether it is required for the active acceptance criteria or root-cause correction;
2. if required, keep it in the active scope and explain why;
3. if not required, capture it as parked follow-up work with enough context to recover later;
4. return to the active outcome.

## Continuation and re-entry

A continuation request resumes the current delivery state; it does not restart planning. Prefer, in order: unresolved PR/CI findings, incomplete acceptance criteria, remaining active-branch scope, then the next dependency-ordered outcome.

`STATUS.md` is the compact re-entry source. After material delivery changes it should identify the current stage, active implementation thread, last completed outcome, blocker, next action, and next queued outcome. If that checkpoint conflicts with GitHub or code, verify the repository and correct the stale checkpoint rather than reconstructing state from memory.

## Human decision threshold

Use repository evidence and safe defaults to minimise unnecessary human interruption. Low-risk, reversible implementation details should be resolved autonomously when existing architecture and product rules make the choice clear.

Require explicit human direction when an unresolved decision materially changes product scope, future-constraining architecture, destructive or irreversible data behaviour, security/privacy/permission policy, external cost or commitment, or another consequential boundary that cannot be inferred safely.

## Local delivery loop

1. Install the locked dependency graph with `npm ci`.
2. Start the application with `npm run dev`.
3. Make a small, reviewable change; do not commit `dist/`, `.env` files, or secrets.
4. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
5. Review `git diff --check` and `git status --short`, then use the pull request template to record scope, validation, risk, rollout notes, parked follow-up work, and the next action.

## Environments and configuration

The app uses Vite in development and deployment. The data and auth APIs are same-origin routes: `/api/ncb/data` and `/api/ncb/auth`. Server/runtime configuration supplies `NCB_API_BASE_URL` and `NCB_SECRET_KEY`; browser code may configure only `VITE_DATA_PROXY_URL` and `VITE_AUTH_PROXY_URL`.

## Release and rollback

Build with `npm run build` and deploy the generated `dist/` artifact through the hosting platform. Verify the application shell, authentication state, and a representative data request after deployment without exposing credentials. Roll back by redeploying the previously known-good artifact; do not attempt a browser-side fallback for failed domain-data requests.
