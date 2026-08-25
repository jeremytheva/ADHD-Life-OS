# Canonical source-completion semantics

**Date:** 2026-08-25  
**Status:** Accepted

## Context

The unified execution layer can operate on canonical Activities sourced from tasks, project tasks, routine steps, and housework chores. Completing an execution session does not always mean the underlying source record should receive the same mutation.

Tasks and project tasks are one-off actionable records whose completion is durable domain state. Housework chores are recurring records whose completion advances recurrence and records history. Routine steps are reusable definitions and must not be marked completed as permanent source records when one execution instance finishes.

## Decision

Use one canonical source-completion adapter that maps Activity types to source semantics without embedding domain services inside the generic execution-completion orchestrator.

The current semantics are:

| Activity type | Source-completion behaviour |
| --- | --- |
| `task` | delegate to task completion handler |
| `project_task` | delegate to project-task completion handler so project graph/cache behaviour can reconcile |
| `chore` | delegate to chore completion handler; preserve its domain-specific multi-write semantics |
| `routine_step` | no source-definition mutation required; execution-session completion represents the execution occurrence |
| unknown/unwired type | fail explicitly with `SOURCE_COMPLETION_UNSUPPORTED` |

The adapter accepts injected handlers rather than importing concrete domain services. Composition with task/project/housework services occurs only at the application integration boundary.

## Rationale

This prevents the unified Activity abstraction from erasing important source-domain differences. In particular, routine-step definitions remain reusable and chore completion remains free to maintain recurrence/history rules.

## Consequences

### Positive

- Generic execution completion remains domain-agnostic.
- Reusable routine definitions are not corrupted by one execution occurrence.
- Project-task completion can preserve project-specific cache/reconciliation behaviour.
- Housework retains its own history and recurrence semantics.
- Unsupported integrations fail visibly instead of silently doing nothing.

### Trade-offs

- A composition layer is still required to provide real task/project/chore handlers.
- Routine-session progression remains separate from generic routine-step execution and may require a later integration decision.
- Chore completion remains potentially non-idempotent and must keep explicit partial-success handling.

## Implementation constraints

- Do not mutate a `routine-step` record to mark a generic execution occurrence complete.
- Do not collapse project-task completion into a direct task repository write if doing so bypasses project cache/reconciliation behaviour.
- Do not add retry logic around chore completion until its multi-write idempotency is proven.
- Unknown or unconfigured source types must produce a machine-readable unsupported error.

## Follow-up

1. Wire task completion to `taskService.completeTask`.
2. Wire project-task completion to `projectService.completeTask`.
3. Wire chore completion through an integration that can collect/confirm checklist semantics before calling `houseworkService.completeHouseworkTask`.
4. Decide how generic routine-step execution should interact with an active `routine-session`, without mutating the reusable routine-step definition.
5. Integrate these handlers only after generic execution-session persistence is provider-backed and verified.

## Related

- `src/services/sourceCompletionAdapter.js`
- `src/services/executionCompletionService.js`
- `src/services/activityService.js`
- `src/services/taskService.js`
- `src/services/projectService.js`
- `src/services/houseworkService.js`
