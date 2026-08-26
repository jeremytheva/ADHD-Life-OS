# Repository Guidance for Agents

## Scope and workflow

- Keep changes small, reviewable, and within the issue or pull request scope. Do not mix refactors, dependency upgrades, generated output, or unrelated formatting with a focused change.
- Read the relevant implementation, tests, and documentation before editing. Preserve the existing React, JavaScript, and TypeScript conventions.
- Update documentation and tests when a user-visible behavior, API contract, validation rule, security boundary, or contributor workflow changes.
- Do not commit secrets, real credentials, `.env` files, production data, or generated `dist/` output. Use placeholders in examples.
- Run `npm run validate` before declaring implementation complete. Use the individual lint, typecheck, test, and build commands when isolating a failure.

## Cognitive load and execution continuity

The delivery process must reduce context loss, decision overload, branching, restart cost, and unnecessary human interruption. Treat these as reliability concerns, not personal workflow preferences.

### Externalise state

- Do not rely on chat history, model memory, or an unstated implementation plan as the only record of current work.
- Use repository files, accepted decisions, pull-request bodies, checks, and `STATUS.md` as durable state.
- After a material delivery-state change, ensure the authoritative status or implementation contract identifies what changed and what happens next.

### Continuation protocol

When the instruction is to continue implementation, resume from the most specific active state available in this order:

1. unresolved blocking review or CI findings on the active pull request;
2. unsatisfied acceptance criteria in the active implementation contract;
3. remaining in-scope work on the active branch or pull request;
4. the next dependency-ordered Ready outcome recorded in `STATUS.md` or the repository control documents.

Do not restart repository analysis, regenerate an already accepted roadmap, reopen settled decisions, or ask which task to do next when the repository state determines the answer.

### Minimum necessary human decision rule

Human-in-the-loop does not mean human-in-every-loop. Before escalating a decision, check whether it can be resolved safely from repository evidence, an accepted decision, existing conventions, a reversible default, or preserved configurability.

Proceed without interruption when a decision is low-risk, reversible, consistent with accepted architecture, and does not materially constrain future product behaviour. Escalate when a decision materially changes product scope, architecture direction, destructive or irreversible data behaviour, security/privacy/permission policy, external cost or commitment, or another consequential boundary that is genuinely unresolved.

When several implementation options are materially equivalent, choose the simplest option consistent with the repository and record the rationale only when it is consequential.

### Work-in-progress limit

- Default to one primary implementation thread for this repository.
- Additional discoveries belong in the implementation contract, backlog, follow-up section, or status queue rather than becoming active work immediately.
- Parallel work is allowed only when it is genuinely independent and explicitly considered parallel-safe. Avoid parallel changes to the same central state model, schema, router, trust boundary, or shared component.

### Scope parking

Discovering a worthwhile improvement is not permission to implement it. Capture out-of-scope work with enough context to recover it later, then return to the current outcome. Do not allow a five-minute correction to expand into an unbounded platform redesign.

### Re-entry checkpoint

Use the compact checkpoint in `STATUS.md` to recover after interruption or context loss. At minimum it should identify the current stage, active implementation thread, last completed outcome, blocker, next action, and the next queued outcome. If the checkpoint conflicts with code or GitHub state, verify the current repository and update the stale source rather than guessing.

### Definition of enough

Once the agreed acceptance criteria are satisfied, required validation passes, no blocking defect remains, and required documentation is current, additional improvement is new scope unless it is necessary to correct a discovered root cause. See `docs/DELIVERY.md`.

## React and Vite

- This is a React 18 application built and served with Vite. Keep browser code under `src/`; use the existing Vite aliases and scripts rather than adding another build tool.
- Prefer functional components and hooks. Keep components focused, use accessible native controls and labels, and preserve low-stimulation, keyboard-friendly interactions.
- Do not access secrets or server-only environment variables from `src/`. `VITE_*` values are exposed to the browser.
- Keep runtime validation at boundaries. Browser form data and proxy responses use the Zod schemas in `src/domains/schemas.js`; update the schemas and their contract tests when changing persisted record shapes.

## npm and validation

- The committed `package-lock.json` is authoritative. In CI and reproducible local installs, use `npm ci`; use `npm install` only when intentionally changing dependencies and commit the resulting lockfile.
- Do not hand-edit `package-lock.json`. Avoid dependency changes unless they are required and reviewed for security and compatibility.
- The canonical required check is `npm run validate`, which runs lint, typecheck, tests, and the production build in order. The individual commands remain `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

## NoCodeBackend proxy and security

- All NoCodeBackend traffic must go through the same-origin, allowlisted handlers in `api/ncb/`. Do not add a generic path proxy, expose `NCB_SECRET_KEY`, or send backend credentials from the browser.
- Only `NCB_API_BASE_URL` and `NCB_SECRET_KEY` belong in the server/runtime environment. Browser configuration may use only the proxy URL variables (`VITE_AUTH_PROXY_URL` and `VITE_DATA_PROXY_URL`).
- Preserve route allowlists, method allowlists, request-size limits, origin/CSRF checks, request and response validation, upstream timeouts, and structured error/correlation-ID behavior. Add or update handler contract tests for changes to this trust boundary.
- Never log authorization headers, cookies, passwords, secrets, or personally identifiable user content. Treat upstream responses as untrusted until validated.

## Tests and pull requests

- Add focused `node:test` coverage in `test/` for behavior and contracts. Tests must be deterministic and must not require real NoCodeBackend credentials or network access.
- Add browser end-to-end coverage only through a reviewed, lockfile-backed test dependency and keep the critical authenticated journey deterministic.
- Use GitHub Issue Forms and the pull request template. Explain behavior, risk, validation, and documentation changes in pull requests.
- Before requesting review, inspect `git diff --check` and `git status --short`; commit only intentional files.
