# Cognitive-load and execution-continuity controls

**Date:** 2026-08-26  
**Status:** Accepted

## Context

ADHD Life OS is intentionally designed to reduce cognitive load for users, but the delivery process is also vulnerable to analogous failure modes: context loss across sessions, excessive decision escalation, branching into adjacent work, too many concurrent implementation threads, repeated replanning, stale state after interruption, and overengineering after the agreed outcome is already complete.

The repository already externalises substantial state through code, documentation, pull requests, tests, accepted decisions and `STATUS.md`. However, the controls for continuation, work-in-progress, human decision thresholds, scope parking, re-entry and stopping conditions were previously implicit or incomplete.

Because the project is developed through AI-assisted GitHub workflows, these are delivery-reliability concerns. A capable agent can still produce poor project outcomes if it repeatedly reconstructs context, asks unnecessary questions, follows every discovered branch of work, or continues improving after the implementation contract is satisfied.

## Decision

The repository will use explicit cognitive-load and execution-continuity controls as part of its normal delivery model.

### 1. Externalise state

Important implementation and delivery state must live in repository sources, accepted decisions, pull requests, checks and `STATUS.md`. Chat history or model memory must not be the sole recovery mechanism.

### 2. Deterministic continuation

A request to continue means resume from the most specific active state available:

1. blocking review or CI findings;
2. unsatisfied acceptance criteria;
3. remaining active-branch scope;
4. the next dependency-ordered outcome.

Continuation must not restart repository analysis, regenerate accepted plans, or reopen settled decisions without new evidence.

### 3. Minimum necessary human decision rule

Human review is reserved for genuinely consequential unresolved decisions. Low-risk, reversible implementation choices that are consistent with accepted architecture and product rules should be resolved automatically using repository evidence, established conventions, sensible defaults, and preserved configurability.

Escalation is required when an unresolved choice materially changes product scope, future-constraining architecture, destructive or irreversible data behaviour, security/privacy/permission policy, external cost or commitment, or another consequential boundary that cannot be inferred safely.

### 4. Work-in-progress limit

The repository defaults to one primary implementation thread. Additional work may proceed in parallel only when it is genuinely independent and explicitly considered parallel-safe.

### 5. Scope parking

Useful discoveries outside the current outcome are captured as follow-up work and then parked. Discovery does not automatically expand the active implementation contract.

### 6. Re-entry checkpoint

`STATUS.md` maintains a compact checkpoint containing the current stage, primary implementation thread, current PR where relevant, last completed outcome, current blocker, next action and next queued outcome.

### 7. Definition of enough

Once the agreed outcome and acceptance criteria are satisfied, required validation passes, blocking defects are resolved and affected documentation is current, additional refinement is new scope unless required for the root-cause correction or safety.

### 8. Exception-based reporting

Routine progress should remain concise. Blockers, failures, consequential decisions, scope changes and stage transitions receive explicit attention.

### 9. Next-action handoff

Material state changes should end with an explicit next action so the workflow does not return to an ambiguous idle state.

## Options considered

### A. Keep the controls implicit

Rely on existing GitHub structure and general engineering discipline without adding specific continuation or cognitive-load rules.

**Advantages:** less documentation.  
**Disadvantages:** inconsistent behaviour across model sessions; repeated replanning and unnecessary escalation remain likely.

### B. Require human approval for most implementation decisions

Treat frequent user confirmation as the main safeguard against AI deviation.

**Advantages:** maximum direct oversight.  
**Disadvantages:** creates decision bottlenecks, increases interruption cost, and makes the user the synchronous state/decision engine for routine reversible work.

### C. Explicit bounded autonomy with durable state — selected

Use strong external state, deterministic continuation, bounded autonomous decisions, selective escalation, WIP limits, scope parking and explicit stopping conditions.

**Advantages:** reduces context loss and decision burden while preserving human authority over consequential choices; aligns the delivery model with the product's executive-function principles.  
**Disadvantages:** requires disciplined maintenance of `STATUS.md` and clear distinction between reversible implementation details and consequential decisions.

## Rationale

The project already demonstrates that both software delivery and ADHD-supportive product design benefit from clear context, external memory, bounded choices, visible state, recoverable interruption and explicit next actions. Applying the same control architecture to the development workflow improves reliability without weakening validation or governance.

The selected model also avoids the false choice between fully autonomous agents and constant human approval. It provides autonomy for routine reversible implementation decisions while retaining explicit human authority over material product, architecture, data, security and external-commitment boundaries.

## Consequences

### Positive

- New sessions can resume from durable repository state rather than reconstructing chat history.
- A simple instruction to continue has a deterministic interpretation.
- Trivial implementation choices no longer create unnecessary human decision load.
- Scope creep is captured without being lost or immediately followed.
- Concurrent work is constrained to genuinely parallel-safe slices.
- Delivery has an explicit stopping condition that prevents acceptance criteria from turning into open-ended redesign.
- Status reporting becomes more useful for interruption recovery.

### Trade-offs / risks

- `STATUS.md` must be kept current when delivery state materially changes.
- Agents must distinguish reversible implementation detail from consequential policy decisions accurately.
- WIP limits may reduce apparent parallel throughput, but they are expected to improve completion rate and reduce merge/re-entry cost.
- Parked follow-up work still needs a durable capture location when GitHub Issues are unavailable.

## Implementation constraints

- `AGENTS.md` is the authoritative agent-level statement of these controls.
- `docs/CODEX_WORKFLOW.md` defines continuation and decision-escalation behaviour.
- `docs/DELIVERY.md` defines WIP, scope parking, re-entry and the definition of enough.
- `STATUS.md` provides the compact re-entry checkpoint.
- Future workflow changes must not reintroduce routine human approval as a substitute for clear repository state and reversible defaults.
- No agent may treat a closed or unmerged PR, chat summary, or planned capability as implemented production behaviour.

## Follow-up

- Apply these rules to future Stage 3 implementation work.
- Keep the `STATUS.md` checkpoint current after material merges, blockers and stage changes.
- If GitHub Issues are re-enabled, use them as the durable parking location for out-of-scope follow-up work.
- Review these controls if they create unnecessary process or fail to prevent repeated context/rework problems.

## Related

- `AGENTS.md`
- `PROJECT.md`
- `STATUS.md`
- `docs/CODEX_WORKFLOW.md`
- `docs/DELIVERY.md`
- `docs/DECISIONS/README.md`
