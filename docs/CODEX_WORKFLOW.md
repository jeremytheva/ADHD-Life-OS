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

## Continuation protocol

When asked to `Continue` or `Next`, resume in this order:

1. fix blocking review or required-check failures on the active pull request;
2. satisfy remaining acceptance criteria;
3. finish remaining in-scope branch work;
4. if no implementation is active, select the next dependency-correct outcome from `STATUS.md` and `ROADMAP.md`.

Do not restart solved planning, reopen accepted decisions, or ask the product owner to choose routine implementation steps when the repository determines the answer.

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

After a material delivery-state change, `STATUS.md` should identify:

- current phase/stage;
- current execution gate/state and material missing evidence;
- current implementation thread/PR;
- last completed outcome;
- blocker;
- next dependency-correct action;
- next queued outcome.

If GitHub/provider/deployment evidence conflicts with `STATUS.md`, verify the real system and correct the stale document.

## Validation and release gate

The canonical full repository command is:

```bash
npm run platform:validate
```

It composes dependency audit, executable governance checks, lint, typecheck, Node tests, production build and critical Playwright coverage. Use narrower commands only for diagnosis.

A passing `platform:validate` does **not** prove deployment/provider/runtime state. Before claiming deployment/production readiness, verify the applicable provider contract, environment/configuration, migration/data state, exact deployed commit, runtime readiness, smoke/end-to-end behaviour and recovery/rollback path.

## Completion workflow

1. audit the implementation against every acceptance criterion;
2. verify the relevant integration path rather than code presence alone;
3. run `npm run platform:validate`;
4. resolve blocking review/CI findings at root cause;
5. update only project documents whose meaning changed;
6. ensure `STATUS.md` records the correct gate/evidence/next action;
7. open/update one focused pull request with outcome, scope, evidence, risk, parked work and next action;
8. mark COMPLETE only when acceptance and required real-system evidence support it.

For perceptible UI changes, include appropriate visual/manual accessibility evidence in addition to automated checks.
