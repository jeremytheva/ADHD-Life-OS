# Production Execution Runtime Composition Boundary

**Status:** Accepted  
**Date:** 2026-08-25

## Context

Stage 3 now has an execution coordinator, presentation contract, UI controls, a prepared execution-session repository, and a false-by-default provider capability gate. The remaining application-side risk was that production Today had no single composition path connecting these layers, which would make post-certification activation require another broad UI/service wiring change.

## Decision

Today always receives one `productionExecutionRuntime` object.

That runtime is composed from the production execution-session repository only when the repository exists behind the certified provider capability. While `providerCapabilities.executionSessions` is false, `repositories.executionSessions` is `null`, so production composition returns the existing fail-closed unavailable runtime.

The production runtime composes:

- execution-session persistence service;
- canonical source completion handlers;
- completion/reconciliation service;
- routine-entry routing adapter;
- execution coordinator;
- execution runtime presentation boundary.

Routine navigation remains a UI responsibility. The service returns a `/routines` route intent plus routine/step identifiers; `NextActionPanel` performs navigation through React Router.

## Consequences

- Today can use the final runtime seam now without exposing Start/Continue while persistence is disabled.
- Post-certification activation is reduced to the provider capability/proxy/schema cut-over rather than another Today integration project.
- Task and project-task source completion share the existing task completion semantics.
- Chore completion preserves the existing housework completion/history semantics.
- Routine steps continue to use the established routine-session lifecycle rather than generic execution-session persistence.

## Remaining activation gate

This decision is not provider certification. Generic execution remains unavailable until the target NoCodeBackend `execution-sessions` contract is created, certified, added to the proxy/schema boundary, and the capability is explicitly enabled.
