# Execution session lifecycle boundary

**Date:** 2026-08-24  
**Status:** Accepted

## Context

Stage 3 now has a canonical Activity abstraction, a unified recommendation engine, a Today next-action experience, and transient Not now feedback. The next product capability is Start → Continue → Recover.

The existing persisted domain model does not provide a generic execution-session record. `routine-sessions` is specifically tied to routine definitions and routine steps. `tasks` describes source work and its terminal completion state, but does not represent a cross-domain execution attempt. Activities can also originate from project tasks, routine steps, and housework chores.

The NoCodeBackend proxy intentionally allowlists collections and validates every request/response. Introducing a new remote collection in application code before the provider schema exists would make the repository contract claim support that has not been verified.

## Decision

Define the execution lifecycle as a domain contract before adding persistence.

The generic lifecycle is:

```text
start -> in_progress
in_progress -> paused
paused -> in_progress
in_progress|paused -> completed
in_progress|paused -> cancelled
```

The domain session carries stable references back to the canonical Activity and its source record. Lifecycle helpers must be pure and must not mutate source activities.

Durable persistence will use a dedicated generic execution-session concept rather than overloading `tasks` or `routine-sessions`, but the remote collection/schema is **not** added to the proxy or repository until the NoCodeBackend provider structure has been created and verified.

## Options considered

### A. Add execution fields directly to tasks

Rejected. The unified Activity model includes non-task sources and task fields would not represent routine-step or chore execution consistently.

### B. Reuse routine-sessions

Rejected. The existing schema requires routine-specific identifiers and step progress. Broadening it would weaken an established domain boundary.

### C. Persist generic sessions in browser storage

Rejected. Browser storage is not the system of record for domain execution state and would create cross-device and recovery inconsistencies.

### D. Define the lifecycle now and add a dedicated provider-backed session contract after provider verification

Accepted. This establishes legal transitions and recovery semantics without inventing remote capabilities.

## Consequences

### Positive

- Start/continue/recovery semantics can be tested independently of UI and provider code.
- Source activities remain unchanged by execution-state transitions.
- A future provider-backed session can support tasks, project tasks, routine steps, and chores uniformly.
- The NoCodeBackend allowlist remains truthful to verified provider capabilities.

### Trade-offs / risks

- Cross-reload/cross-device recovery is not available until the provider collection exists.
- The Today UI should not claim durable Start/Continue behaviour before persistence is wired.
- Completion of an execution session and completion of its source domain record remain separate operations whose transaction/partial-success behaviour must be designed.

## Implementation constraints

- Do not store generic execution sessions in localStorage/sessionStorage as a substitute for provider persistence.
- Do not add an `execution-sessions` route to the NoCodeBackend proxy until the provider collection and exact fields are verified.
- Do not reinterpret task `status` as execution-session state.
- Preserve explicit `activity_id`, `activity_type`, `source_id`, and optional `source_parent_id` references.
- Terminal session states are `completed` and `cancelled`; they cannot be paused or resumed.
- UI integration must surface persistence failures rather than pretending a durable execution started.

## Follow-up

1. Create/verify the generic execution-session collection in NoCodeBackend.
2. Add its exact Zod record/create/patch schemas.
3. Add it to the proxy collection allowlist and repository map.
4. Add ownership/query/response contract tests.
5. Implement `executionSessionService` against the repository.
6. Wire Today Start/Continue/Recover UI only after persistence is verified.
7. Define source-completion partial-success semantics before completing source records from execution sessions.

## Related

- `src/domain/execution/executionLifecycle.js`
- `src/services/executionEngine.js`
- `src/services/activityService.js`
- `docs/DATA_MODEL.md`
- `docs/DECISIONS/2026-08-22-unified-execution-engine-foundation.md`
- `docs/DECISIONS/2026-08-24-transient-not-now-feedback.md`
