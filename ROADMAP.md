# ADHD Life OS — Roadmap

**Last materially reviewed:** 5 October 2026  
**Current milestone:** Stage 3 — execution and next-action experience

This roadmap records intended direction. Current implementation state and blockers belong in [`STATUS.md`](STATUS.md).

## Completed foundation

### Stage 2 — Core workflow integrity

Status: **COMPLETE**

The reliability baseline for existing workflows is closed. Loading, empty, failed-write, retry, partial-success, destructive-action, retained-input and critical browser-path behaviour were hardened before Stage 3 began.

## Current milestone

### Stage 3 — Execution and next-action experience

Objective: move from recommendation to a coherent, durable execution loop that helps a user start, continue, recover and reconcile work with minimal cognitive overhead.

#### Implemented foundation

- unified execution/recommendation policy;
- Today next-action experience;
- reversible session-local **Not now** feedback;
- cognitive-load and execution-continuity delivery controls;
- fail-closed execution-session provider contract and certification harness;
- zero-warning ESLint validation enforced by the canonical platform gate;
- responsive authenticated application shell with tested phone-width navigation and keyboard dismissal/focus recovery.

### Provider dependency sequence

Durable generic execution remains dependent on verified NoCodeBackend capability. This roadmap preserves the dependency order without using the roadmap as a live blocker or work-queue document:

1. certify the real provider operations and `execution-sessions` capability;
2. add exact durable application integration from that evidence;
3. implement recovery and reconciliation semantics;
4. verify the integrated durable execution loop.

Provider absence must remain fail-closed. Do not introduce speculative backend routes, methods, schemas or persistence behaviour to advance the roadmap.

### Independent-work rule

Work that does not depend on provider behaviour may proceed only when supported by a concrete roadmap requirement, accepted implementation contract, defect, failed validation, review finding, security/data requirement or documented technical debt. This roadmap does not maintain a standing queue of speculative accessibility, cognitive-load or cleanup tasks merely to keep the project active.

The current objective, scoped blockers, owner actions and whether any independent work is actually justified belong in `STATUS.md`.

#### Stage 3 exit conditions

Stage 3 should not close until the platform demonstrates:

1. one authoritative execution eligibility/recommendation policy;
2. a clear next-action experience;
3. reversible lightweight recommendation feedback;
4. a low-friction durable start/continue path;
5. interruption and recovery behaviour;
6. explicit source-completion/reconciliation semantics;
7. deterministic contract and critical browser tests;
8. documentation aligned with implemented execution behaviour.

## Deferred

The following are intentionally deferred until the Stage 3 execution loop is stable or explicitly reprioritized:

- external calendar/event synchronization;
- richer analytics and longitudinal insight;
- remote AI/LLM assistance;
- broader background automation;
- advanced cross-device conflict semantics beyond the verified execution-session contract;
- expanded productivity-service integrations.

## Future / optional

No later stage is treated as committed merely because a capability appears in the deferred list. Future milestones should be defined from product outcomes and dependencies when Stage 3 approaches closure.

## Dependencies

- Real provider-dependent execution work requires verified NoCodeBackend evidence before durable activation.
- Production-readiness claims require an actual deployment target, environment configuration and runtime verification. Live deployment state belongs in `STATUS.md`/deployment-provider evidence rather than this roadmap.
- New external integrations require explicit architecture, privacy, ownership and failure-semantics review before activation.

## Roadmap rule

Preserve planned/deferred work during cleanup, but do not use the roadmap as a current blocker list or implementation queue. Update this file when intended future direction changes materially; update `STATUS.md` when actual current state, blockers, evidence or owner action changes.
