# Repository Guidance for Agents

## Authority and inheritance

This repository inherits the current master AI-first platform development, engineering, design, documentation, testing/release and provider standards supplied by the product owner. This file records only repository-specific execution rules and constraints.

Authoritative project state is in `PROJECT.md`, `STATUS.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/NOCODEBACKEND_OPERATIONS.md`, `ROADMAP.md`, `SYSTEM_MAP.md`, accepted decisions, current GitHub state, and current provider/deployment evidence where applicable. Chat history is supporting context, not project state.

## Scope and workflow

- Keep changes focused, reviewable, and within the current implementation contract. Do not mix unrelated refactors, dependency upgrades, generated output, or formatting with a focused change.
- Read the relevant implementation, tests, documentation and accepted decisions before editing.
- Check for overlapping PRs/branches before creating a competing implementation.
- Preserve existing React, JavaScript/TypeScript-checking, domain and proxy conventions unless a documented decision changes them.
- Update only the documentation whose meaning changed.
- Do not commit secrets, real credentials, `.env` files, production data, or generated `dist/` output.

## Mandatory execution gates

For meaningful work, treat the inherited gates as required state transitions rather than reminders.

### Project entry

Before significant implementation, establish where the work belongs and what sources are authoritative. Review `PROJECT.md`, `STATUS.md` and the relevant architecture/data/system-map/decision context; confirm active GitHub work and provider/deployment identity when the task depends on them.

### Change

Before changing the system, identify the desired outcome, current implementation/callers, dependencies, affected layers, partial/planned/legacy work, conflicts and the verified root cause or required capability.

### Integration

Do not call work integrated while a required caller, route, service/domain layer, auth/ownership rule, repository/provider adapter, configuration, UI path, migration, test or diagnostic boundary remains disconnected, mocked, placeholder or assumed.

### Release

Do not call work deployed or production-ready without the applicable automated validation, provider/config/migration evidence, exact deployed commit, runtime readiness, representative smoke/end-to-end evidence, and recovery/rollback understanding.

### Completion

Do not mark a capability/stage complete until acceptance is satisfied, real-system evidence supports the claim, remaining work is explicitly classified, project documentation is current, and the next dependency-correct action is known.

If a gate cannot pass, record the missing evidence/dependency, continue safe independent work, keep `STATUS.md` current when material, and do not advance the work state beyond the evidence.

## Cognitive load and execution continuity

### Externalise state

- Do not rely on chat/model memory or an unstated plan as the only record of current work.
- Use repository files, accepted decisions, pull requests, checks and `STATUS.md` as durable state.
- After a material delivery-state change, ensure the next action is explicit.

### Continuation protocol

On `Continue` or `Next`, resume in this order:

1. blocking review/CI findings on the active PR;
2. unsatisfied acceptance criteria;
3. remaining in-scope active-branch work;
4. the next dependency-correct item in `STATUS.md`/`ROADMAP.md`.

Do not restart solved planning, reopen accepted decisions, or ask the product owner to choose routine technical work when repository evidence determines the answer.

### Human decision threshold

Proceed autonomously for low-risk, reversible, technically clear choices consistent with accepted architecture/standards. Escalate only genuinely unresolved decisions that materially affect product behaviour/scope, future-constraining architecture, destructive/irreversible data, privacy/security/permissions, external cost/commitment, or another consequential boundary.

### Work-in-progress and scope parking

- Default to one primary implementation thread for this repository.
- Parallelise only genuinely independent, explicitly parallel-safe work.
- Park useful out-of-scope discoveries instead of following them immediately.
- Once acceptance criteria, required validation, safety and documentation are satisfied, further improvement is new scope unless needed for the root-cause correction.

## React and Vite

- This is a React 18 application built with Vite. Keep browser code under `src/`; use existing aliases/scripts rather than adding another build system.
- Prefer focused functional components/hooks and accessible native controls.
- Do not access secrets or server-only environment variables from `src/`. `VITE_*` values are browser-visible.
- Keep Zod/runtime validation at trust boundaries; update schemas and contract tests when persisted shapes change.

## npm and validation

- The committed `package-lock.json` is authoritative. Use `npm ci` for reproducible installs; change dependencies only deliberately and commit the generated lockfile.
- Do not hand-edit `package-lock.json`.
- The canonical full repository check is `npm run platform:validate`.
- `npm run platform:validate` includes dependency audit, governance checks, lint, typecheck, Node tests, production build and critical Playwright coverage.
- Use `npm run validate`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, or `npm run test:e2e` individually when isolating a failure.
- Do not claim runtime/provider verification merely because `platform:validate` passes.

## NoCodeBackend application and provider boundaries

- All privileged NoCodeBackend traffic must go through the same-origin, allowlisted handlers in `api/ncb/`. Do not add a generic path proxy or send backend credentials from the browser.
- Browser/repository routes under `/api/ncb/data/*` are stable **application** operations. They are not evidence that NoCodeBackend exposes the same physical path or HTTP method.
- Physical generated-data mapping belongs only in `api/ncb/dataProviderContract.js` and `api/ncb/dataProvider.js`.
- The production data-provider registry must remain `UNVERIFIED` until the target ADHD Life OS generated API/Swagger provides evidence for the relevant operation. Do not mark it verified from another project, a test fixture, or a generic documentation example.
- A test may inject a clearly labelled verified fixture contract to prove translation/security behaviour. Test fixture paths/methods must never be described as provider certification.
- Canonical server/runtime variables are `NOCODEBACKEND_AUTH_BASE_URL`, `NOCODEBACKEND_DATA_BASE_URL`, `NOCODEBACKEND_SECRET_KEY`, and `NOCODEBACKEND_INSTANCE`. Do not introduce alternate short aliases for these concepts.
- `NOCODEBACKEND_INSTANCE` and the Bearer secret are server-owned provider inputs. The browser cannot override them.
- Browser configuration may use only browser-safe proxy-path variables such as `VITE_AUTH_PROXY_URL` and `VITE_DATA_PROXY_URL`.
- Resolve authenticated ownership through the auth/session boundary before an enabled generated-data request.
- Do not forward browser auth cookies, Origin, Referer or application correlation headers to generated data operations unless target-provider evidence explicitly requires them.
- Do not relay `Set-Cookie` from generated data responses; cookie handling belongs to the auth boundary.
- Preserve route/method allowlists, request-size limits, origin/CSRF checks, request/response validation, timeouts and structured correlation-ID errors.
- Never log authorization headers, cookies, passwords, secrets, or sensitive user content.
- Record target provider evidence/state in `docs/NOCODEBACKEND_OPERATIONS.md`.
- Generic `execution-sessions` remains fail-closed until both general data operations and the collection-specific provider contract pass certification.

## Tests and pull requests

- Add focused deterministic `node:test` coverage for behaviour/contracts. Tests must not require real provider credentials or mutable production data.
- Add/maintain Playwright coverage for critical cross-layer user journeys.
- GitHub Issues are currently unavailable; when no issue can be created, use one focused pull-request body as the implementation contract.
- Before review, ensure the full validation gate passes and the PR explains outcome, scope, risk, validation, documentation and parked follow-up work.
