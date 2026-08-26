# ADHD Life OS — Roadmap

**Last materially reviewed:** 26 August 2026  
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
- fail-closed execution-session provider contract and certification harness.

#### Dependency-correct remaining work

1. **Provider certification**
   - create the real NoCodeBackend `execution-sessions` structure;
   - capture exact generated field/route/method/envelope behaviour;
   - run read and full certification;
   - classify filtering and uniqueness/concurrency capability.

2. **Durable application integration**
   - add exact execution-session schemas after certification;
   - extend the explicit proxy allowlist;
   - add repository/provider adapter and ownership enforcement;
   - compose Start/Pause/Continue/Complete/Cancel through the execution runtime.

3. **Recovery and reconciliation**
   - recover interrupted execution safely;
   - distinguish execution-session completion from source-domain completion;
   - make partial-success and retry/reconciliation behaviour explicit;
   - handle stale, missing or externally completed source records safely.

4. **Critical-path verification**
   - add deterministic contract/ownership/lifecycle tests;
   - add Playwright coverage for Start → Continue/Recover → Complete;
   - verify the integrated user-visible execution loop.

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

The following are intentionally deferred until the Stage 3 execution loop is stable:

- external calendar/event synchronization;
- richer analytics and longitudinal insight;
- remote AI/LLM assistance;
- broader background automation;
- advanced cross-device conflict semantics beyond the verified execution-session contract;
- expanded productivity-service integrations.

## Future / optional

No later stage is treated as committed merely because a capability appears in the deferred list. Future milestones should be defined from product outcomes and dependencies when Stage 3 approaches closure.

## Dependencies

- Real provider-dependent execution work is blocked on verified NoCodeBackend evidence.
- Production-readiness claims require an actual deployment target, environment configuration and runtime verification; no ADHD Life OS Vercel project is currently linked in the connected account.
- New external integrations require explicit architecture, privacy, ownership and failure-semantics review before activation.

## Roadmap rule

Preserve planned/deferred work during cleanup, but do not let it displace the current dependency-correct milestone. Update this file when intended future direction changes materially; update `STATUS.md` when actual current state changes.
