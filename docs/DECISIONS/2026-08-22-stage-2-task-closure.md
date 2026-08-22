# Stage 2 Task Workflow Closure

**Date:** 2026-08-22

## Decision

The Tasks workflow is part of the Stage 2 core-workflow integrity boundary and must follow the same recovery semantics already established for Projects, Brain Inbox, Routines, and Housework.

A task retrieval failure must never render as a genuine empty task list. Task create, complete, delete, and template writes must distinguish a failed write from a successful write followed by failed reconciliation. Destructive task deletion requires explicit confirmation, and task mutation controls are serialized while persistence is in flight.

## Recovery contract

- Preference-loading and task-loading failures render a retryable `LoadErrorState`.
- A failed create leaves the task form open and preserves the entered values.
- A successful create followed by failed list refresh closes the form and warns against creating the task again until the list reloads.
- A failed complete/delete operation does not imply that persisted state changed.
- A successful complete/delete followed by failed list refresh is reported as reconciliation failure rather than write failure.
- Task delete requires user confirmation.
- Complete/delete buttons for the affected task are disabled while its write is active.
- Task form close/cancel/submit controls are disabled while create persistence is active.

## Browser verification

The critical-path Playwright mock supports one-shot task create and task load failures. The Stage 2 closure scenario verifies that a failed create preserves entered text, succeeds on retry without re-entry, and that a subsequent failed list load renders a recovery state rather than `No tasks found`, then restores the persisted task after retry.

## Scope

No NoCodeBackend schema, route, authentication behavior, priority algorithm, persisted task schema, or task service interface is intentionally changed.
