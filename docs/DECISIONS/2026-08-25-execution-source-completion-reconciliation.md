# Execution source-completion reconciliation

**Date:** 2026-08-25  
**Status:** Accepted

## Context

Stage 3 separates a generic execution session from the underlying source record. A user may execute a task, project task, routine step, or housework chore through the same execution lifecycle.

Completing the execution session and completing the source record are therefore separate persistence operations. They cannot be treated as one implicit success.

This matters especially for housework, where source completion currently creates a completion-history record and then updates the recurring housework task. That source operation is itself multi-write and may require reconciliation if only part succeeds.

## Decision

Execution-session completion is persisted first. Source-domain completion is attempted only after the execution session is confirmed completed.

The orchestration returns one of three explicit outcomes:

- `completed` — execution session and source completion both succeeded;
- `failed` — execution-session completion failed, so source completion was not attempted;
- `partial_success` — execution session completed but source completion failed or could not be confirmed.

A `partial_success` outcome must set `reconciliation_required: true` and retain the completed execution-session context.

The generic orchestration layer must not automatically retry source completion because some source workflows may be non-idempotent or may have partially succeeded before returning an error.

## Rationale

This ordering preserves the execution event as the first durable fact while preventing a failed session write from causing an unrelated source mutation.

It also preserves the Stage 2 rule that successful persistence plus failed follow-up work is not reported as total failure or total success.

## Consequences

### Positive

- User-visible completion can distinguish full success from partial success.
- Source completion is never attempted when the execution-session write failed.
- Domain-specific partial-write behaviour can be handled without weakening the generic execution contract.
- Future reconciliation tooling has a persisted execution-session reference to work from.

### Trade-offs

- A completed execution session can temporarily coexist with an incomplete source record.
- Domain-specific source adapters must define safe completion and reconciliation behaviour.
- Automatic source retries are intentionally prohibited until idempotency is proven for that source type.

## Implementation constraints

- `executionCompletionService` depends on an execution-session service and an injected source-completion adapter.
- It must not import task, project, routine, or housework services directly.
- Source adapters receive `activity_type`, `source_id`, optional `source_parent_id`, and the completed execution session.
- Errors from source completion must be preserved in the partial-success result for safe diagnostics.
- UI must not display ordinary success/celebration for `partial_success`.
- Replanning must not assume the source item is complete until source completion is confirmed.

## Follow-up

1. Define source-completion adapters for supported canonical Activity types.
2. Preserve existing domain-specific failure semantics, particularly multi-write housework completion.
3. Add Today completion UI only after generic execution-session persistence is live.
4. Add reconciliation handling before automatic replanning consumes completion outcomes.

## Related

- `src/services/executionCompletionService.js`
- `src/services/executionSessionService.js`
- `src/domain/execution/executionLifecycle.js`
- `src/services/taskService.js`
- `src/services/projectService.js`
- `src/services/houseworkService.js`
- `docs/DECISIONS/2026-08-24-execution-session-lifecycle-boundary.md`
