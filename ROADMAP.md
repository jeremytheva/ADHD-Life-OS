# ADHD Life OS — Roadmap

**Last materially reviewed:** 27 August 2026  
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
- zero-warning ESLint validation enforced by the canonical platform gate.

### Temporary backend deferral

Provider-dependent implementation is intentionally paused from 27 August 2026 while additional NoCodeBackend information is gathered.

This is a **priority deferral**, not evidence that the provider contract is complete. Existing fail-closed provider boundaries remain in place and no speculative backend routes, methods, schemas or persistence behaviour should be introduced while the deferral is active.

The preserved provider-dependent sequence remains:

1. certify the real provider operations and `execution-sessions` capability;
2. add exact durable application integration from that evidence;
3. implement recovery and reconciliation semantics;
4. verify the integrated durable execution loop.

### Current independent work while backend is deferred

Work may continue where it does not depend on unverified provider behaviour. Current priority order is:

1. **Responsive application shell and navigation**
   - make core navigation usable on phone-width screens;
   - preserve desktop navigation behaviour;
   - maintain keyboard and focus recovery semantics;
   - add narrow-screen browser coverage.

2. **Frontend accessibility and interaction integrity**
   - audit keyboard reachability, focus management, labels and transient UI state;
   - improve shared interaction patterns rather than isolated cosmetic fixes;
   - add regression coverage for material behaviour changes.

3. **Client-side cognitive-load reduction**
   - reduce unnecessary choices, visual competition and initiation friction in existing implemented workflows;
   - prefer clearer defaults and progressive disclosure without restricting user capability;
   - keep changes independent of provider-specific persistence.

4. **Repository quality and maintainability**
   - continue focused, evidence-backed cleanup where it reduces future implementation risk;
   - preserve the zero-warning lint gate and canonical validation contract;
   - avoid broad refactors without a concrete user or delivery outcome.

These independent improvements do **not** satisfy the durable execution requirements below. Stage 3 remains open until the provider-dependent execution loop can be completed and verified.

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

- NoCodeBackend/provider activation work while the temporary backend deferral is active;
- external calendar/event synchronization;
- richer analytics and longitudinal insight;
- remote AI/LLM assistance;
- broader background automation;
- advanced cross-device conflict semantics beyond the verified execution-session contract;
- expanded productivity-service integrations.

## Future / optional

No later stage is treated as committed merely because a capability appears in the deferred list. Future milestones should be defined from product outcomes and dependencies when Stage 3 approaches closure.

## Dependencies

- Real provider-dependent execution work still requires verified NoCodeBackend evidence and is currently intentionally deferred.
- Production-readiness claims require an actual deployment target, environment configuration and runtime verification; no ADHD Life OS Vercel project is currently linked in the connected account.
- New external integrations require explicit architecture, privacy, ownership and failure-semantics review before activation.

## Roadmap rule

Preserve planned/deferred work during cleanup, but do not let it displace the current active priority. While backend work is deferred, continue only with work that is genuinely independent of unverified provider behaviour. Update this file when intended future direction changes materially; update `STATUS.md` when actual current state changes.
