# Deterministic Stage 3 replanning policy

**Date:** 2026-08-25  
**Status:** Accepted

## Context

Stage 3 now separates recommendation, execution-session lifecycle, source completion and reconciliation. Without an explicit policy, each UI surface could independently decide when to recalculate recommendations, causing inconsistent behaviour and unsafe reactions to partial-success states.

## Decision

Replanning is a pure policy decision over explicit lifecycle/reconciliation events.

### Immediate replanning

Recompute recommendations when:

- execution completes and source reconciliation succeeds;
- a source record is confirmed complete;
- execution is cancelled;
- execution context materially changes;
- authoritative domain data is refreshed.

### Replan only after reconciliation

When an execution session is completed but source completion reports `partial_success` or `reconciliation_required`, do not immediately treat the source as fully settled. Reconcile/refresh first, then recompute recommendations from authoritative state.

### No full replanning

- Pausing an execution preserves current execution context.
- Transient **Not now** only excludes/rotates the current recommendation set; it is not itself a durable day-plan replanning event.

## Rationale

The execution engine should rank authoritative current state. Replanning before persistence/reconciliation is settled can recommend work that has actually completed, suppress work that did not complete, or hide a recovery requirement.

## Consequences

- UI surfaces consume one policy rather than inventing trigger rules.
- Partial-success remains visible and recoverable.
- Paused work is not displaced merely because the user temporarily interrupted it.
- A future day-plan engine can reuse these trigger semantics without changing the current execution engine.

## Follow-up

- Integrate the policy only after provider-backed execution sessions are enabled.
- Add browser coverage for completion → reconciliation → next recommendation.
- Define the separate mechanics of how a day plan is mutated; this decision governs **when**, not **how**, replanning occurs.
