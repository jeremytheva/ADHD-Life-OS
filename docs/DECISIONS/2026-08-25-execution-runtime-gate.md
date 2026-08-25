# Execution runtime activation gate

Date: 2026-08-25  
Status: Accepted

## Context

Stage 3 now has recommendation, entry-routing, lifecycle, coordinator, presentation, and execution-controls contracts. The generic `execution-sessions` provider collection is still not verified in the target NoCodeBackend instance.

Mounting a Start action before a complete persistence coordinator exists would imply durable execution tracking that the runtime cannot currently guarantee.

## Decision

Execution UI activation is fail-closed.

A production execution runtime is considered available only when it receives a coordinator implementing the complete current-session and lifecycle contract: `getCurrent`, `start`, `pause`, `resume`, `cancel`, and `complete`.

If any part of that contract is absent:

- the runtime reports `available: false`;
- it exposes no mutation methods;
- it reports `can_start: false`;
- recommendation browsing can continue independently;
- Today must not expose a durable Start/Continue control through this runtime.

The runtime itself remains provider-agnostic. Provider verification and composition happen outside this boundary.

## Consequences

- UI integration can be added without accidentally enabling fake persistence.
- Incomplete provider wiring cannot partially activate execution controls.
- Recommendation functionality remains usable while execution persistence is unavailable.
- Production activation becomes an explicit composition step after provider verification.

## Follow-up

1. Create and verify the NoCodeBackend `execution-sessions` collection/API.
2. Add the exact schema/proxy/repository adapter.
3. Compose the verified execution-session service and execution coordinator.
4. Supply that coordinator to `createExecutionRuntime`.
5. Mount execution controls in Today only when the runtime reports available.
6. Add browser coverage for unavailable and available runtime states.
