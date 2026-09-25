# Codex Workflow

## Project entry

Before meaningful implementation:

1. read `AGENTS.md`, `PROJECT.md` and `STATUS.md`;
2. inspect the relevant `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `SYSTEM_MAP.md`, `ROADMAP.md` and accepted decisions rather than rereading unrelated documents;
3. inspect current implementation, callers, tests, package scripts and configuration;
4. check current GitHub PR/branch state for overlapping work;
5. confirm provider/deployment identity when the outcome depends on external state;
6. identify the current implementation contract and dependency-correct outcome.

The project-entry gate passes only when the work location, current state and authoritative evidence are understood.

## Change gate

Before editing:

- identify the observable user/system outcome;
- identify existing implementation and affected layers;
- classify partial/planned/deprecated/legacy work before changing or removing it;
- check master/project standards and project-specific exceptions;
- check duplicate/conflicting implementation;
- identify the verified root cause or required capability;
- choose the smallest complete architecturally consistent correction.

Whole-system analysis is required; speculative unrelated changes are not.

## Pull-request lifecycle

The normal implementation lifecycle is represented by repository/PR metadata:

```text
DRAFT → IMPLEMENTING → VALIDATING → READY → MERGEABLE → MERGED
```

`DRAFT` is a lifecycle concept. Open a normal GitHub PR by default; use native Draft only when the work genuinely must not be reviewed or merged yet, or substantial implementation is deliberately incomplete.

### IMPLEMENTING / VALIDATING

- Keep the PR body as the implementation contract while repository Issues remain disabled.
- Continue all in-scope implementation and review corrections on the same PR.
- Keep scope singular and park separate discoveries.
- Do not add `lifecycle:implementation-complete` while known in-scope work remains.
- Every new commit invalidates completion/validation evidence that no longer applies.
- Run the project-owned validation required by the change. `npm run platform:validate` is the canonical full repository gate where applicable.
- GitHub Actions may execute the validation contract and provide useful diagnostics, but GitHub Actions success is not a separate mandatory merge condition. Infrastructure-only CI failures do not block an otherwise sufficiently validated PR; substantive failures do.

### Implementation-complete handoff

Only after a criterion-by-criterion audit confirms the implementation is complete:

1. update the PR body with current acceptance and validation evidence;
2. update affected project documentation/status so it describes the post-merge re-entry state;
3. confirm no known blocking in-scope review finding remains;
4. add `lifecycle:implementation-complete` and the appropriate lifecycle metadata.

### READY / MERGEABLE / MERGED

A PR is READY when implementation is complete and sufficient project-owned validation covers the current head. It is MERGEABLE when material review threads are resolved, the branch is conflict-free/current enough for safe integration, no material blocker remains, and any release/runtime evidence required by the change is satisfied.

Current GitHub lifecycle workflows may provide automation for these transitions. If they still require native Draft state or GitHub-Actions-only success, treat that as a repository automation gap to reconcile rather than redefining the owner's policy.

Repository merge is not deployment/provider/runtime completion.
## Continuation protocol

When asked to `Continue` or `Next`, resume in this order:

1. fix blocking material review or validation failures on the active pull request;
2. satisfy remaining acceptance criteria;
3. finish remaining in-scope branch work;
4. if implementation is complete but the PR has not progressed, reconcile lifecycle evidence/labels/checks rather than starting new work;
5. if no implementation is active, select the next dependency-correct outcome from `STATUS.md` and `ROADMAP.md`;
6. if the highest-priority item is blocked, record/defer it and continue the next valid unblocked item unless the blocker prevents all useful progress.

Do not restart solved planning, reopen accepted decisions, or ask the product owner to choose routine implementation steps when repository evidence determines the answer.

## Decision escalation

Proceed autonomously when a choice is technical, reversible, low-risk, consistent with accepted architecture/standards, or materially equivalent to other implementation options.

Escalate only genuinely unresolved choices that materially affect:

- product purpose, scope or user-facing policy;
- future-constraining architecture;
- destructive/irreversible data behaviour;
- authentication, authorisation, privacy or security posture;
- external cost, provider commitment, legal/compliance posture or another consequential boundary.

When safe work can continue around a consequential unresolved decision, record/park it and continue independent scope.

## Integration gate

Before describing work as integrated, verify the applicable real path:

```text
caller / UI
  → service/domain behaviour
  → auth/session + ownership policy
  → repository/client
  → application-owned proxy/provider adapter
  → configuration/provider
  → validated response
  → visible/reconciled state
```

No required layer should remain only mocked, placeholder, disconnected or assumed. Provider-dependent capability is not integrated merely because a local adapter exists.

## Work-in-progress and scope control

- Maintain one primary implementation thread by default.
- Parallel work must be genuinely independent and explicitly parallel-safe.
- Useful discoveries that are not required for the active acceptance criteria/root-cause correction are parked as follow-up work.
- Stop expanding once the Definition of Enough is met.

## Re-entry and state handoff

`STATUS.md` should identify:

- current phase/stage;
- current execution gate/state and material missing evidence;
- current implementation thread or next primary thread;
- last completed outcome;
- blocker/deferred dependency;
- next dependency-correct action;
- next queued outcome.

Before adding `lifecycle:implementation-complete`, update `STATUS.md` to the state that should be true **after the PR merges**. This prevents the default branch from immediately treating a closed PR as the active checkpoint.

If GitHub/provider/deployment evidence conflicts with `STATUS.md`, verify the real system and correct the stale document.

## Validation and release gate

The canonical full repository command is:

```bash
npm run platform:validate
```

It composes dependency audit, executable governance checks, lint, typecheck, Node tests, production build and critical Playwright coverage. Use narrower commands only for diagnosis.

A passing `platform:validate` does **not** prove deployment/provider/runtime state. GitHub Actions may be one execution environment for this command, but its infrastructure status is supplementary diagnostic evidence rather than a duplicate merge gate. Before claiming deployment/production readiness, verify the applicable provider contract, environment/configuration, migration/data state, exact deployed commit, runtime readiness, smoke/end-to-end behaviour and recovery/rollback path.

## Completion workflow

1. audit the implementation against every acceptance criterion;
2. verify the relevant integration path rather than code presence alone;
3. run the applicable project-owned validation, including `npm run platform:validate` for the canonical full repository gate;
4. resolve blocking material review/validation findings at root cause;
5. update only project documents whose meaning changed;
6. ensure `STATUS.md` records the truthful post-merge gate/evidence/next action;
7. update one focused normal PR with outcome, scope, evidence, risk, parked work and next action;
8. add `lifecycle:implementation-complete` only after the in-scope audit is complete;
9. progress Ready → Mergeable → Merged from current repository evidence; use GitHub automation when it supports the policy, but do not treat CI infrastructure as the acceptance authority;
10. mark project/capability COMPLETE only when all applicable repository, provider, deployment and runtime evidence supports it;
11. return the concise owner-facing response defined in `AGENTS.md`; keep detailed engineering evidence in the repository/PR.

For perceptible UI changes, include appropriate visual/manual accessibility evidence in addition to automated checks.
