# Execution controls UI boundary

Date: 2026-08-25  
Status: Accepted

## Context

Stage 3 now has a pure presentation contract for execution modes and action identifiers, but Today still lacks a reusable rendering layer for Start/Continue/Pause/Complete/Cancel and recovery states.

The generic execution-session provider remains unverified, so mounting a live durable Start action in Today would be premature.

## Decision

Introduce a presentation-only `ExecutionControls` component that renders the already-derived execution presentation state and invokes injected callbacks.

The component:

- imports no provider, repository, coordinator, or persistence service;
- accepts `presentation`, optional recommendation context, busy state, and action callbacks;
- renders active/paused context, primary actions, secondary lifecycle actions, execution-error feedback, and reconciliation-required feedback;
- disables actions while an operation is pending;
- is not mounted into the production Today flow until a verified production coordinator exists.

## Consequences

- UI styling and accessibility can advance independently of provider setup.
- The component cannot accidentally persist or invent execution state.
- Action serialization is represented in the UI contract before live writes are enabled.
- Today integration becomes a composition task rather than another lifecycle-policy implementation.

## Follow-up

1. Verify/create the NoCodeBackend `execution-sessions` provider contract.
2. Add the exact provider adapter and production coordinator composition.
3. Mount `ExecutionControls` in Today using `deriveExecutionPresentation`.
4. Wire action callbacks through the coordinator.
5. Add Playwright coverage for busy, failure, reconciliation, pause/continue, and completion states.
