# Today execution runtime seam

Date: 2026-08-25  
Status: Accepted

## Context

Stage 3 now has execution controls and a fail-closed runtime gate, but the generic NoCodeBackend execution-session provider is still unverified. Today should be prepared for execution integration without exposing non-durable Start/Continue behaviour.

## Decision

`NextActionPanel` accepts an optional execution runtime and user id. Execution controls are rendered only when the supplied runtime explicitly reports `available: true` and a user id exists.

The current production `TodayView` does not supply an execution runtime. Therefore the existing recommendation experience remains unchanged until provider verification and production composition are complete.

When a runtime is supplied:

- the panel passes the canonical `selected.activity` into execution start/routing;
- active/paused state is loaded through the runtime;
- lifecycle actions are serialized while a mutation is pending;
- successful immediate replanning requests refresh recommendations;
- execution failures remain explicit and do not mutate recommendation state optimistically;
- reconciliation-required state is preserved through the execution presentation contract.

## Consequences

- Today has a tested integration seam ready for provider activation.
- No fake Start button is exposed before durable persistence exists.
- UI code does not reconstruct source activity identity from display-only fields.
- Provider activation remains one explicit composition change rather than a UI rewrite.

## Follow-up

1. Verify NoCodeBackend `execution-sessions`.
2. Add the provider schema/proxy/repository adapter.
3. Compose the production execution coordinator/runtime.
4. Inject that runtime and authenticated database user id from Today.
5. Add Playwright coverage for Start, Pause, Continue, Complete, failure, and reconciliation states.
