# ADHD Life OS — Decision Register

**Purpose:** Index consequential product, architecture, data, security, testing, and delivery decisions that constrain future implementation.  
**Last materially reviewed:** 26 August 2026

## How to use this register

Create a decision record when a choice materially affects future implementation, compatibility, data ownership, security, provider integration, architecture, product behaviour, or delivery controls.

Do **not** create a decision record for routine implementation details already governed by inherited master standards or repository conventions.

Each decision record should contain:

- title;
- date;
- status (`Proposed`, `Accepted`, `Superseded`, `Deprecated`);
- context/problem;
- decision;
- options considered;
- rationale;
- consequences/trade-offs;
- follow-up work;
- links to superseding/superseded decisions where applicable.

Accepted decisions remain authoritative until explicitly superseded. Do not silently reverse them in code or a pull request.

## Naming convention

Use:

```text
YYYY-MM-DD-short-decision-name.md
```

## Current indexed decisions

The directory contains decisions covering areas including:

- GitHub Actions / Node runtime updates;
- dependency-audit outcomes;
- lazy modal feature loading;
- list load/error-state behaviour;
- project statistics caching;
- route code splitting;
- core mutation feedback and workflow integrity;
- Stage 3 execution-engine direction and related implementation decisions;
- cognitive-load and execution-continuity controls for AI-assisted delivery (`2026-08-26-cognitive-load-execution-continuity.md`);
- master-standard inheritance, canonical `platform:validate`, required continuity documents and canonical NoCodeBackend configuration (`2026-08-26-platform-validation-and-standards-inheritance.md`);
- fail-closed separation of stable application data operations from target-instance NoCodeBackend physical routes/methods (`2026-08-26-fail-closed-data-provider-contract.md`).

The earlier `2026-08-21-validation-command.md` decision is retained as historical evidence and marked **Superseded**; `npm run validate` remains an application subset, not the canonical full repository gate.

Because the folder is the authoritative register, inspect the directory directly before making a change that may conflict with an accepted decision.

## Decision categories

| Category | Typical trigger |
| --- | --- |
| Product | User-facing rule or scope boundary that future features must preserve. |
| Architecture | Dependency direction, runtime boundary, provider pattern, state model, or major technical structure. |
| Data | Entity shape, ownership, lifecycle, migration, retention, synchronization, or source-of-truth choice. |
| Security | Authentication, authorization, secret handling, rate limiting, logging, trust-boundary change. |
| UX/accessibility | Consequential interaction rule shared across workflows. |
| Testing/release | Validation policy or release gate that implementation must follow. |
| Delivery/governance | Continuation, decision escalation, WIP, scope, re-entry, evidence, gate or stopping rules. |
| Provider/integration | External service contract, adapter pattern, failure model, or synchronization rule. |

## Decision template

```markdown
# <Decision title>

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Superseded | Deprecated

## Context

What problem, constraint, or ambiguity requires a durable decision?

## Decision

State the chosen approach clearly.

## Options considered

### A. <Option>

Summary, advantages, disadvantages.

### B. <Option>

Summary, advantages, disadvantages.

## Rationale

Why was the selected option preferred?

## Consequences

### Positive

- Consequence

### Trade-offs / risks

- Consequence

## Implementation constraints

- Rule future work must preserve.

## Follow-up

- Required issue/documentation/migration/test work.

## Related

- `PROJECT.md`
- `STATUS.md`
- relevant issue/PR/decision
```

## Decisions likely to be required next

Create these only when implementation reaches them and evidence is sufficient:

1. external calendar synchronization provider/source-of-truth/conflict/consent behaviour;
2. remote AI service data-sharing/provider abstraction and advisory-versus-state-changing policy;
3. cross-device conflict semantics beyond the verified execution-session contract;
4. any provider-specific execution-session uniqueness/concurrency posture that requires a material application architecture decision after certification.

Do not pre-decide these in documentation before the product/technical evidence exists.

## Superseding a decision

When a decision changes:

1. create a new decision record;
2. explain the new evidence/constraint;
3. mark the previous record `Superseded`;
4. link both directions;
5. update affected architecture/data/security/product documents;
6. capture implementation work in a focused GitHub issue or pull-request implementation contract when Issues are unavailable.

Historical decisions remain in the repository for auditability.
