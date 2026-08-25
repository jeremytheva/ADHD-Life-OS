# Execution coordinator boundary

Date: 2026-08-25  
Status: Accepted

## Context

Stage 3 now has separate contracts for recommendation entry routing, generic execution-session lifecycle, provider-agnostic session persistence, completion reconciliation, source completion, and replanning triggers. Wiring these independently from Today would make the UI responsible for domain orchestration and increase the risk that routine, generic-session, partial-success, and replanning rules diverge.

The generic `execution-sessions` provider collection is still unverified, so the application cannot yet construct a production persistence adapter or expose durable Start/Continue behaviour.

## Decision

Introduce a provider-agnostic execution coordinator as the single orchestration boundary for UI integration.

The coordinator:

- resolves Activity ownership before start;
- routes routine steps into the existing routine-session lifecycle;
- routes task/project-task/chore activities into the injected generic execution-session service;
- exposes current-session recovery state;
- coordinates pause, resume, cancel, and completion;
- carries completion reconciliation results into the deterministic replanning policy;
- does not import NoCodeBackend repositories, provider routes, or browser storage.

The Today UI should call this coordinator rather than directly composing the lower-level Stage 3 services.

## Consequences

### Positive

- Today receives one orchestration API instead of duplicating domain rules.
- Routine sessions and generic execution sessions keep distinct durable ownership.
- Completion partial-success semantics remain consistent with Stage 2 reliability rules.
- Replanning decisions are attached to lifecycle outcomes at one boundary.
- The production provider adapter can be introduced later without changing the UI contract materially.

### Constraints

- A production coordinator instance must not be created until the generic execution-session provider adapter is verified.
- `start` and `resume` preserve the current execution context and do not trigger recommendation replacement.
- A failed execution-session completion must not trigger replanning.
- Routine-entry routing requires an adapter into the existing routine UI/session flow.

## Follow-up

1. Verify/create the NoCodeBackend `execution-sessions` provider structure.
2. Implement the exact repository/provider adapter.
3. Compose a production coordinator instance.
4. Add a Today UI projection for idle/active/paused/routine-routed/partial-success states.
5. Add Start/Continue/Pause/Complete/Cancel controls through the coordinator.
6. Add Playwright coverage for start → recover → complete and partial-success flows.
