# Execution entry ownership

**Date:** 2026-08-25  
**Status:** Accepted

## Context

The unified Activity model allows tasks, project tasks, chores and routine steps to participate in one recommendation engine. That does not mean every source type should share the same durable execution-session mechanism.

Routine execution already has a provider-backed `routine-sessions` lifecycle with explicit initialization, step completion/skipping, final completion, cancellation, serialization and retry behaviour. Starting a second generic execution session for a recommended routine step would create two durable lifecycles for one occurrence and ambiguous recovery semantics.

## Decision

Execution entry is routed by canonical Activity type:

- `task`, `project_task`, and `chore` use the generic execution-session lifecycle once that provider contract is verified and enabled;
- `routine_step` routes into the existing routine-session flow using `source_parent_id` as `routine_id` and `source_id` as `step_id`;
- routine-step entry does not create a generic execution session;
- unknown or malformed activity types fail explicitly rather than falling back to a guessed execution owner.

## Consequences

- Recommendation remains unified while persistence semantics remain domain-correct.
- Existing routine-session recovery/integrity behaviour is preserved.
- Stage 3 avoids duplicate session records and contradictory completion state for routines.
- The Today UI can use one entry-routing policy when Start/Continue is wired.

## Follow-up

- Wire routine-step recommendations to the existing routine execution UI when Today execution entry is implemented.
- Confirm whether a recommended routine step should open at the exact step or at the routine's current recoverable step; preserve the routine-session service as authority.
- Generic execution-session persistence remains required for task/project-task/chore Start/Continue/Recover.
