# Execution presentation contract

Date: 2026-08-25  
Status: Accepted

## Context

The Today next-action panel currently presents recommendations but does not yet expose durable Start/Continue controls. Stage 3 now has lower-level contracts for execution ownership, lifecycle, persistence adapters, completion reconciliation, source completion, replanning, and coordination.

If JSX derives execution state directly from those contracts, UI behaviour can drift from domain semantics and failure states can be presented incorrectly.

## Decision

Introduce a pure execution-presentation projection that converts recommendation/current-execution/latest-result inputs into explicit UI modes and actions.

Supported modes include:

- `idle`;
- `startable`;
- `active`;
- `paused`;
- `routine_routed`;
- `execution_error`;
- `reconciliation_required`.

The projection determines primary and secondary action identifiers, but performs no persistence and imports no UI components or provider code.

Routine recommendations expose `open_routine`; generic task/project-task/chore recommendations expose `start`. Active generic sessions prevent starting another item. Partial-success completion blocks new execution until reconciliation is resolved.

## Consequences

- Today can remain a rendering/invocation layer rather than a lifecycle-policy layer.
- Failure and partial-success states cannot silently collapse to idle/startable UI.
- Routine and generic execution ownership stay visible to presentation code.
- Copy and visual treatment can evolve without changing persistence rules.

## Follow-up

1. Verify the NoCodeBackend generic execution-session provider contract.
2. Compose the production execution coordinator.
3. Wire Today to this projection and coordinator.
4. Add browser coverage for idle → start → pause/continue → complete and reconciliation-required paths.
