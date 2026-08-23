# ADHD Life OS — Project Control

**Status:** Active development  
**Repository:** `jeremytheva/ADHD-Life-OS`  
**Last reviewed:** 23 August 2026

## Purpose

ADHD Life OS is a low-stimulation life-management platform designed to reduce cognitive load and help users move from capture and planning to a clear, achievable next action. The current MVP combines tasks, projects, routines, daily planning, Brain Inbox capture, housework workflows, onboarding preferences, accessibility settings, and an emerging unified execution engine.

The platform is intended to support executive-function needs without punitive or shame-based patterns. It should favour small next steps, flexible structure, explicit feedback, user agency, and resilient recovery when plans change.

## Product outcomes

The platform should enable a user to:

1. capture thoughts and obligations quickly without deciding everything immediately;
2. organise work into tasks, projects, subtasks, routines, and home-management structures;
3. identify a suitable next action using context such as energy, duration, interest, aversiveness, importance, and current execution state;
4. start and continue work with minimal navigation and decision overhead;
5. recover from interruption, partial completion, or changed capacity without losing state;
6. review the day and adjust plans without punitive overdue behaviour;
7. maintain preferences, accessibility settings, and optional modules across sessions;
8. keep persisted domain data behind a controlled application-owned server boundary.

## Current product scope

### Implemented foundation

- React/Vite single-page application.
- Tasks, projects, subtasks, routines, routine sessions, housework, Brain Inbox, and user preferences.
- Today/day-planning experience and task recommendation categories including Quick Wins, Momentum Builders, and Brave Frog.
- Onboarding-driven module preferences and accessibility controls.
- Same-origin NoCodeBackend authentication and data proxy boundary.
- Runtime schema validation with structured upstream error handling.
- Unified execution-engine foundation and Stage 3 next-action experience.
- Automated lint, typecheck, unit/contract test, build, and Playwright capabilities.

### Explicitly not promised by the current MVP

- Third-party calendar synchronization.
- Background calendar or task synchronization.
- Remote AI/LLM scheduling or coaching services.
- Browser-local fallback storage for failed NoCodeBackend domain writes.

These may be future capabilities only after architecture, privacy, data, and product decisions are recorded.

## Product principles

1. **Reduce cognitive load.** Prefer one clear action over dense choice sets.
2. **Support initiation.** Optimise the path from intention to starting.
3. **Preserve agency.** Recommendations guide; users retain control.
4. **Avoid shame mechanics.** Do not use punitive overdue language or coercive streak patterns.
5. **Make state visible.** Loading, success, partial success, failure, and recovery states must be explicit.
6. **Design for interruption.** Workflows must tolerate context switching and incomplete sessions.
7. **Accessibility is core quality.** Keyboard, focus, readable layout, reduced motion, contrast, responsive behaviour, and clear labels are part of normal acceptance criteria.
8. **Protect the data boundary.** Client code must not bypass the application-owned proxy or expose server credentials.
9. **Prefer root-cause fixes.** Avoid isolated workarounds when a state, architecture, data, or validation problem is responsible.
10. **Keep documentation executable.** Project documents must reflect implemented behaviour and guide subsequent AI/Codex work.

## Technology baseline

| Area | Current baseline |
| --- | --- |
| Frontend | React 18 |
| Build/runtime | Vite 8 |
| Routing | React Router 7 |
| Language | JavaScript + TypeScript checking |
| Validation | Zod |
| Styling | Tailwind/PostCSS plus application CSS |
| Motion | Framer Motion |
| Persistence | NoCodeBackend via application-owned proxy |
| Backend-for-frontend | `api/ncb/` allowlisted handlers |
| Unit/contract testing | Node `node:test` |
| End-to-end testing | Playwright |
| Package manager | npm with committed `package-lock.json` |
| Required validation | `npm run validate` |

## System-of-record hierarchy

1. Repository code/configuration — implemented behaviour.
2. `AGENTS.md` — persistent implementation rules.
3. `PROJECT.md` — project purpose, scope, principles, and control model.
4. `STATUS.md` — current delivery state and next action.
5. `docs/PRODUCT.md` — product behaviour and boundaries.
6. `docs/ARCHITECTURE.md` — system structure and runtime boundaries.
7. `docs/DATA_MODEL.md` — persisted entities and data contracts.
8. `docs/SECURITY.md` — security and privacy controls.
9. `docs/TESTING.md` — validation expectations.
10. `docs/DECISIONS/` — accepted consequential decisions.
11. GitHub issues/PRs — implementation contracts and delivery evidence.

If sources conflict, do not silently reconcile them. Identify the conflict and update the incorrect or obsolete source as part of the relevant change.

## Delivery model

Work follows the GitHub–Codex operating model used by this project:

```text
Repository state
  -> outcome-based stage/milestone
  -> one focused implementation issue
  -> Codex implementation
  -> tests + build + evidence
  -> pull request review/audit
  -> merge
  -> STATUS.md and affected documents updated
```

The normal unit of implementation is one GitHub issue producing one focused pull request. Large architectural or product changes must be decomposed before implementation.

## Current delivery direction

Stage 2 integrity work has been closed and Stage 3 has begun. The Stage 3 foundation establishes a unified execution engine and integrates a next-action decision experience into Today. Subsequent Stage 3 work should deepen initiation, continuation, recovery, and cross-workflow execution behaviour without creating competing recommendation engines.

The live delivery snapshot and immediate next action are maintained in [`STATUS.md`](STATUS.md).

## Authoritative supporting documents

- [`README.md`](README.md) — repository entry point and setup.
- [`AGENTS.md`](AGENTS.md) — implementation constraints.
- [`STATUS.md`](STATUS.md) — current state and next action.
- [`docs/PRODUCT.md`](docs/PRODUCT.md) — product boundary.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system architecture.
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — data model.
- [`docs/SECURITY.md`](docs/SECURITY.md) — security requirements.
- [`docs/TESTING.md`](docs/TESTING.md) — validation requirements.
- [`docs/DELIVERY.md`](docs/DELIVERY.md) — delivery/release process.
- [`docs/DECISIONS/README.md`](docs/DECISIONS/README.md) — decision register.

## Definition of project-level progress

A feature or stage is not considered complete solely because code exists. Completion requires:

- observable product behaviour matching the intended outcome;
- applicable acceptance criteria demonstrated;
- `npm run validate` passing;
- appropriate regression and contract coverage;
- security/data/accessibility implications resolved;
- affected documentation updated;
- no unresolved in-scope blocking review findings;
- follow-up work captured separately rather than hidden in the completed scope.
