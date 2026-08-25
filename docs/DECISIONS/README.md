# ADHD Life OS — Decision Register

**Purpose:** Index consequential product, architecture, data, security, testing, and delivery decisions that constrain future implementation.  
**Last reviewed:** 23 August 2026

## How to use this register

Create a decision record when a choice materially affects future implementation, compatibility, data ownership, security, provider integration, architecture, or product behaviour.

Do **not** create a decision record for routine implementation details already governed by repository conventions.

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

Example:

```text
2026-08-23-persist-execution-session-state.md
```

## Current indexed decisions

The repository currently contains decision records covering areas including:

- GitHub Actions / Node runtime updates;
- dependency-audit outcomes;
- lazy modal feature loading;
- list load/error-state behaviour;
- project statistics caching;
- route code splitting;
- the canonical validation command;
- core mutation feedback;
- housework integrity;
- project-detail recovery;
- project partial-success behaviour;
- Stage 3 execution-engine direction and related implementation decisions recorded during recent delivery work.

Because the folder is the authoritative register, contributors should inspect the directory directly before making a change that may conflict with an accepted decision.

## Decision categories

Use these informal categories in the title/body when helpful:

| Category | Typical trigger |
| --- | --- |
| Product | A user-facing rule or scope boundary that future features must preserve. |
| Architecture | Dependency direction, runtime boundary, provider pattern, state model, or major technical structure. |
| Data | Entity shape, ownership, lifecycle, migration, retention, synchronization, or source-of-truth choice. |
| Security | Authentication, authorization, secret handling, rate limiting, logging, trust-boundary change. |
| UX/accessibility | A consequential interaction rule shared across workflows. |
| Testing/release | Validation policy or release gate that implementation must follow. |
| Provider/integration | External service contract, adapter pattern, failure model, or synchronization rule. |

## Decision template

Use this structure for new records:

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

The following should become decision records **only when implementation reaches them**:

1. **Persisted execution state:** whether Stage 3 start/continue/recovery state belongs on tasks, a dedicated session entity, or remains transient/derived.
2. **External calendar synchronization:** provider boundary, source of truth, conflict resolution, consent, and deletion behaviour.
3. **Remote AI services:** what data may leave the application, provider abstraction, consent/privacy, failure modes, and whether outputs are advisory or state-changing.
4. **Cross-device conflict semantics:** required only if the platform introduces concurrent mutation/synchronization behaviour beyond the current provider contract.

Do not pre-decide these in documentation before the product/technical evidence exists.

## Superseding a decision

When a decision changes:

1. create a new decision record;
2. explain the new evidence/constraint;
3. mark the previous record `Superseded`;
4. link both directions;
5. update affected architecture/data/security/product documents;
6. capture implementation work in a focused GitHub issue.

Historical decisions should remain in the repository for auditability.
