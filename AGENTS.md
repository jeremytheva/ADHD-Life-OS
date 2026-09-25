# Repository Guidance for Agents

## Authority and inheritance

This repository inherits the current Project Master AI-first platform development framework and associated engineering, design, documentation, testing/release, data, security, observability, provider and pull-request lifecycle standards supplied by the product owner where applicable. This file records repository-specific execution rules and constraints.

Repository-specific requirements override inherited defaults only where the difference is explicit and documented.

Authoritative project state is in `PROJECT.md`, `STATUS.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/NOCODEBACKEND_OPERATIONS.md`, `ROADMAP.md`, `SYSTEM_MAP.md`, accepted decisions, current GitHub state, and current provider/deployment evidence where applicable. Chat history is supporting context, not project state.

The documentation baseline deliberately uses the repository's established `docs/` structure: `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, and `docs/DECISIONS/` satisfy the architecture/data/decision requirements. Do not create duplicate root-level `ARCHITECTURE.md`, `DATA_MODEL.md`, or `DECISIONS/` copies merely to mirror a generic template.

## Required project-entry sequence

Whenever an AI agent begins or resumes work, including scheduled/supervisory execution:

1. Read `AGENTS.md`.
2. Read `PROJECT.md`.
3. Read `STATUS.md`.
4. Review relevant architecture, data, system-map, roadmap and accepted decision documentation.
5. Inspect the current repository implementation, tests, package scripts and configuration relevant to the objective.
6. Inspect open pull requests and their current checks/review state before creating new implementation work.
7. Inspect relevant issues/tasks where available; while GitHub Issues remain disabled, treat focused PR bodies and `STATUS.md` as the implementation-contract fallback.
8. Determine the highest-priority dependency-correct actionable work from current evidence.
9. Check for existing branches, PRs, issues, TODO/state documentation or partially implemented work before creating anything new.

Do not infer project state from stale documentation when current repository, GitHub, provider or deployment evidence contradicts it. Correct stale durable state when the contradiction is material.

## Autonomous continuation contract

`Continue`, `Next`, scheduled execution, supervisory execution, or equivalent instructions mean:

> Continue the highest-priority dependency-correct work that can safely be completed autonomously.

Do not stop merely because one task or PR has finished. After completing a task:

1. validate it with the applicable evidence gate;
2. update durable project state where its meaning changed;
3. determine the next dependency-correct task;
4. continue if it can be performed safely.

Continue until a valid stop/escalation condition is reached.

If the highest-priority item is blocked, record the blocker and automatically continue with the next dependency-correct unblocked item. A blocker is a stop condition only when it prevents all useful progress that can safely be performed within current scope and repository guidance.

### Valid stop or escalation conditions

Stop and require product-owner involvement only when:

- a genuine product or business decision is required;
- required credentials or external access are unavailable;
- an irreversible or destructive operation requires approval;
- conflicting requirements cannot be resolved from repository evidence;
- a security, privacy, legal or compliance decision requires owner authority;
- an external dependency prevents all useful dependency-correct work;
- no actionable work remains.

Minor implementation choices, refactoring decisions, test repairs, documentation updates, routine PR state transitions and equivalent engineering decisions should not normally require escalation.

### Whole-system rule

Before applying a local fix:

- inspect the surrounding architecture and affected integration path;
- determine whether the symptom represents a broader integration or state problem;
- avoid duplicate abstractions, conflicting conventions or temporary workarounds where an existing system should be repaired;
- prefer the smallest effective correction while preserving sound existing work.

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

## Pull-request lifecycle

GitHub is the repository enforcement and collaboration layer, but repository-owned acceptance evidence and lifecycle metadata are the source of truth for autonomous delivery.

The lifecycle vocabulary remains:

```text
DRAFT → IMPLEMENTING → VALIDATING → READY → MERGEABLE → MERGED
```

`DRAFT` is a lifecycle concept, not the default native GitHub PR state.

- Create normal, reviewable PRs for autonomous project work.
- Use a native GitHub Draft PR only when the change genuinely must not be reviewed or merged yet, or substantial implementation is deliberately incomplete.
- Record routine lifecycle state in PR/repository metadata such as `state:implementing`, `state:validating`, `state:ready`, `state:mergeable`, `state:merged`, blocker labels and the implementation-complete signal rather than relying on the GitHub Draft flag.
- Before creating a PR, search open PRs, visible branches, implementation contracts, `STATUS.md` and partially implemented code for equivalent work. Reuse or repair appropriate existing work rather than create a competing branch.
- Keep one focused outcome per PR. When GitHub Issues are unavailable, the PR body is the implementation contract and must contain explicit scope, exclusions and observable acceptance criteria.
- Continue implementation and corrective commits on the same PR while they remain in scope.
- Any new commit invalidates prior completion/validation evidence that no longer applies to the current head.
- `npm run platform:validate` is the canonical project-owned repository validation gate where applicable. Record the actual evidence in the PR/repository.
- GitHub Actions is supporting diagnostic evidence and an optional execution environment for the validation contract, not a duplicate mandatory acceptance gate. A GitHub Actions failure blocks merge only when it reveals a substantive implementation, test, security, data-integrity, build, migration or release defect. Runner, billing, queue, permission or other CI-infrastructure failure alone does not make an otherwise valid PR unmergeable.
- Do not add `lifecycle:implementation-complete` until the implementation has been audited criterion by criterion, the PR evidence is current, and no known in-scope implementation work remains.
- MERGEABLE requires sufficient current-head project-owned validation, no unresolved material review conversation, no merge conflict, no material blocker, and any applicable runtime/deployment evidence required by the change.
- A merged PR proves repository integration only. Deployment/provider/runtime gates remain separate.
- If repository automation still assumes native Draft PRs or mandatory GitHub Actions success, treat that as an implementation/configuration gap to reconcile. Do not reinterpret the owner's newer normal-PR and repository-owned-validation policy to match legacy automation.
## Cognitive load and execution continuity

### Externalise state

- Do not rely on chat/model memory or an unstated plan as the only record of current work.
- Use repository files, accepted decisions, pull requests, checks and `STATUS.md` as durable state.
- Before implementation-complete handoff, update `STATUS.md` to the checkpoint that should be true after the PR merges. Do not leave a soon-to-be-closed PR as the default branch's active re-entry target.
- After a material delivery-state change, ensure the next action is explicit.

### Continuation priority

When resuming, use this order:

1. blocking material review or validation findings on the active PR;
2. unsatisfied acceptance criteria;
3. remaining in-scope active-branch work;
4. lifecycle evidence required to progress an otherwise complete PR;
5. the next dependency-correct item in `STATUS.md`/`ROADMAP.md`.

Do not restart solved planning, reopen accepted decisions, or ask the product owner to choose routine technical work when repository evidence determines the answer.

### Human decision threshold

Proceed autonomously for low-risk, reversible, technically clear choices consistent with accepted architecture/standards. Escalate only genuinely unresolved decisions that materially affect product behaviour/scope, future-constraining architecture, destructive/irreversible data, privacy/security/permissions, external cost/commitment, or another consequential boundary.

### Work-in-progress and scope parking

- Default to one primary implementation thread for this repository.
- Parallelise only genuinely independent, explicitly parallel-safe work.
- Park useful out-of-scope discoveries instead of following them immediately.
- Once acceptance criteria, required validation, safety and documentation are satisfied, further improvement is new scope unless needed for the root-cause correction.

## State maintenance

`STATUS.md` is the durable execution handoff and must remain machine-readable and human-readable.

After material changes, update it to reflect, where applicable:

- current phase, stage and evidence gate;
- execution state and active/next objective;
- completed work and known partial work;
- concrete next actions in dependency order;
- PR/issue/branch references when they remain useful after merge;
- validation state and last verified commit;
- blockers and deferred dependencies;
- owner decisions genuinely required;
- technical debt discovered or explicitly parked;
- provider/deployment/runtime state where relevant.

Clearly distinguish `implemented`, `project validated`, optional `CI diagnostic state`, `deployed`, `runtime verified`, and `production verified`. Do not populate `PASS` or `VERIFIED` without evidence; use `NOT_RUN`, `PENDING`, `UNVERIFIED` or `NOT_APPLICABLE` instead.

Chat history must never be treated as the authoritative project record.

## Scheduled supervisory entry

The repository must remain safe to enter with an instruction equivalent to:

> Inspect this project's authoritative state and continue the highest-priority dependency-correct actionable implementation work.

A scheduled/supervisory agent should be able to determine from repository and GitHub evidence:

- where the project currently is;
- what work is already active;
- the current objective;
- what has already been validated or failed;
- the next dependency-correct action;
- whether autonomous work can safely continue;
- the exact reason to stop when it cannot.

If one of these cannot be answered, improving durable state is itself dependency-correct work.

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
- GitHub Actions may execute the canonical validation, but a green Actions badge is not itself the acceptance policy and an infrastructure-only Actions failure is not a material validation failure.

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
- GitHub Issues are currently disabled at repository level. Until that setting is changed, use one focused PR body as the implementation contract; do not pretend an issue exists.
- Use a normal PR by default. Use native Draft only for genuinely non-reviewable or deliberately substantially incomplete work.
- Before declaring implementation complete, ensure the project-owned validation contract is satisfied and the PR explains outcome, scope, risk, validation, documentation and parked follow-up work.
- Add `lifecycle:implementation-complete` only after the final in-scope audit. Lifecycle metadata should describe the real implementation state even when CI or workflow automation is unavailable.
- Treat current lifecycle workflows that still enforce native Draft or GitHub-Actions-only progression as legacy automation to be reconciled, not as authority to override this policy.
## Reporting

Detailed implementation state and evidence belong in the repository: `STATUS.md`, the active PR or issue, validation evidence, decisions and relevant project documentation. ChatGPT/Codex responses should reference that durable state instead of repeating it.

### Default owner-facing response

For routine implementation, continuation, review, merge, deployment and status work, the final response should normally contain only:

```text
Done
- <important completed outcome>
- <important completed outcome if needed>

Next
- <single next action or next work item>

You
- Nothing required.
```

If owner action is required:

```text
Done
- <completed outcome>

Next
- <what the project will do after the dependency is resolved>

You
- <specific action required from Jeremy>
```

If information is required:

```text
Done
- <completed work so far>

Next
- <what can proceed once the information is available>

You
- Provide: <specific information>
```

### Response rules

- **Done:** include only material outcomes, usually 1–3 bullets. Do not list every file changed, command run, reasoning step, minor refactor or routine PR metadata.
- **Next:** state the single best next action. Choose it autonomously from repository priority/dependency information. If that item is blocked, move to the next valid unblocked item unless the blocker prevents all useful progress.
- **You:** always include this section. Use exactly `You\n- Nothing required.` when owner intervention is unnecessary. When action is necessary, state the exact action, credential, configuration, decision or information required.
- Add **Blocked** only for a genuine blocker, **Problem** only when work failed or a material defect was discovered, and **Decision needed** only when owner judgment is genuinely required and repository conventions cannot safely resolve it.
- Do not routinely include executive summaries, validation tables, file-by-file change lists, command transcripts, PR histories, acceptance matrices, background explanations, large future-work lists or generic recommendations.
- When all required validation passes, summarize it as a material outcome such as `Implementation and required validation completed.` Detailed commands/results stay in repository evidence.
- When a PR progresses normally, summarize the outcome and next item rather than reproducing lifecycle history.
- When asked for project status, default to the same concise `Done / Next / You` structure. Provide a full project report only when explicitly requested.
- Surface technical detail only when something failed, there is a genuine blocker, the owner asks for detail, or a consequential decision is required.

### Owner-intervention threshold

Require owner involvement only when needed for credentials/secrets the agent cannot access, external account configuration, billing/subscription changes, destructive or irreversible decisions, unresolved product decisions with materially different outcomes, unavailable third-party approvals, or physical/manual verification unavailable to project tooling.

Normal coding, testing, issue management, PR progression, documentation updates, dependency sequencing and routine architecture decisions should continue autonomously.
