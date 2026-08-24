# Transient Not-Now Execution Feedback

**Date:** 2026-08-24  
**Status:** Accepted  
**Stage:** 3 — Unified ADHD Execution Engine

## Context

The Stage 3 next-action experience can rank and present realistic activities, but a user may correctly decide that a recommendation is not suitable right now even when it remains technically eligible.

Persisting that interaction immediately as task state or recommendation history would introduce a new durable execution-state contract before the product has defined defer, block, retry, history, retention, or replanning semantics.

## Decision

The first execution-feedback behaviour is a session-local **Not now** exclusion.

When a user marks a recommendation Not now:

- the selected canonical Activity is excluded from subsequent recommendations in the current `NextActionPanel` instance;
- the source task/routine step/project task/chore is not modified;
- no NoCodeBackend write is performed;
- no browser storage is used to persist the feedback;
- the exclusion can be explicitly reset through the UI;
- reloading/remounting the experience clears the exclusion.

`executionEngine` accepts an explicit list of activity IDs to exclude for this ranking request. The engine remains responsible for ranking the remaining eligible Activities.

## Options considered

### A. Persist Not now immediately

Rejected for this slice. It would require an agreed durable state model, lifecycle, retention policy, source-entity mapping and replanning semantics.

### B. Mutate the source task status

Rejected. “Not now” is not equivalent to blocked, deferred, cancelled, archived, or completed.

### C. Keep Not now transient and reversible

Accepted. It reduces immediate cognitive load without changing domain truth or prematurely creating persistence semantics.

## Rationale

This is the smallest complete Stage 3 feedback loop that preserves user agency and prevents repeated presentation of an unsuitable recommendation during the current interaction while keeping derived recommendation state separate from durable domain state.

It also creates an explicit boundary for later implementation: durable defer/block/replanning behaviour must be designed separately rather than inferred from this transient interaction.

## Consequences

### Positive

- users can reject a recommendation without changing the underlying task;
- recommendation ranking remains centralised in the unified execution engine;
- no new schema or migration is required;
- no feedback history is retained without a defined product purpose;
- the interaction is reversible.

### Trade-offs / limits

- the exclusion is intentionally lost when the panel is remounted or the page is reloaded;
- the system does not yet learn from repeated Not now choices;
- the system does not yet distinguish durable defer, blocked, wrong-context, or unavailable-until states;
- automatic replanning is still out of scope.

## Implementation constraints

Future work must not reinterpret transient Not now exclusions as persisted user intent without a new decision.

Durable execution state must define, at minimum:

- which entity owns the state;
- legal lifecycle transitions;
- timestamps/duration;
- refresh and cross-session behaviour;
- stale/deleted source handling;
- multi-device/concurrency behaviour where relevant;
- whether the state triggers replanning;
- retention/history requirements.

## Follow-up

The next Stage 3 slice should decide and implement the first genuinely durable execution state only when required for a concrete start/continue/defer/block/recovery workflow.

## Related

- `docs/DECISIONS/2026-08-22-unified-execution-engine-foundation.md`
- `src/services/executionEngine.js`
- `src/components/today/NextActionPanel.jsx`
