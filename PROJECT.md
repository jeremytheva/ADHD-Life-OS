# ADHD Life OS — Project Control

**Status:** Active development  
**Repository:** `jeremytheva/ADHD-Life-OS`  
**Last materially reviewed:** 5 October 2026

## Purpose

ADHD Life OS is a low-stimulation life-management platform designed to reduce cognitive load and help users move from capture and planning to a clear, achievable next action. It combines tasks, projects, routines, daily planning, Brain Inbox capture, housework workflows, onboarding preferences, accessibility settings, and a unified execution/recommendation direction.

The platform is intended to support executive-function needs without punitive or shame-based patterns. It should favour small next steps, flexible structure, explicit feedback, user agency, and resilient recovery when plans change.

## Target users

People who benefit from lower-friction capture, planning, initiation, continuation and recovery support, including users with executive-function challenges.

## Core outcomes

The platform should enable a user to:

1. capture thoughts and obligations quickly without deciding everything immediately;
2. organise work into tasks, projects, subtasks, routines, and home-management structures;
3. identify a suitable next action using context such as energy, duration, interest, aversiveness, importance, and current execution state;
4. start and continue work with minimal navigation and decision overhead;
5. recover from interruption, partial completion, or changed capacity without losing important state;
6. review the day and adjust plans without punitive overdue behaviour;
7. maintain preferences, accessibility settings, and optional modules across sessions;
8. keep persisted domain data behind a controlled application-owned server boundary.

## Scope

### Implemented foundation

- React/Vite single-page application.
- Tasks, projects, subtasks, routines, routine sessions, housework, Brain Inbox, and user preferences.
- Today/day-planning experience and task recommendation categories including Quick Wins, Momentum Builders, and Brave Frog.
- Onboarding-driven module preferences and accessibility controls.
- Same-origin NoCodeBackend authentication and data proxy boundary.
- Runtime schema validation with structured upstream error handling.
- Unified execution-engine foundation and Stage 3 next-action experience.
- Automated static, unit/contract, build, governance and Playwright validation.
- Repository-managed PR lifecycle controller separating implementation completion, current-head validation, review/mergeability and repository merge.

## Out of scope for the current milestone

- Third-party calendar synchronization.
- Background calendar or task synchronization.
- Remote AI/LLM scheduling or coaching services.
- Browser-local fallback storage for failed NoCodeBackend domain writes.
- Generic durable execution-session persistence before provider certification.

These may become future capabilities only after the relevant product, architecture, privacy, data and provider decisions are recorded.

## Master source binding

Master source release: **2026-10-04**. The Project-level `MASTER_SOURCE_MANIFEST.md` is the authority for active master editions; the repository does not duplicate that manifest.

Active editions adopted by this repository are:

- `AI_FIRST_PLATFORM_DEVELOPMENT_FRAMEWORK.md` 3.2;
- `AI_PLATFORM_DEVELOPMENT_STANDARD.md` 1.5;
- `PROJECT_DOCUMENTATION_STANDARD.md` 1.5;
- `PR_LIFECYCLE_STANDARD.md` 1.1;
- `GITHUB_REFERENCE_GUIDE.md` 1.2;
- `TESTING_VALIDATION_RELEASE_STANDARD.md` 1.2;
- the manifest-designated current editions of `PLATFORM_ENGINEERING_STANDARD.md`, `PLATFORM_DESIGN_PRINCIPLES.md`, `DATA_MODELLING_AND_MIGRATION_STANDARD.md`, `SECURITY_AUTHORIZATION_STANDARD.md`, `OBSERVABILITY_DIAGNOSTICS_STANDARD.md`, `NOCODEBACKEND_REFERENCE_GUIDE.md`, and `VERCEL_REFERENCE_GUIDE.md`.

The older GitHub–Codex software delivery operating standard and prior draft-default/mandatory-hosted-CI editions are historical/superseded inputs, not active project authority.

The repository stores project-specific facts, decisions, implementation state and explicit deviations rather than copying master standards wholesale. If a project-specific rule intentionally differs from a master default, the difference must be recorded here or in an accepted decision before it is treated as authoritative.

## Providers / external systems

| Provider/system | Project role | Current state source |
| --- | --- | --- |
| GitHub | Repository, PR lifecycle metadata, implementation history and supporting diagnostic CI | GitHub + `docs/GITHUB_CONFIGURATION.md` + `STATUS.md` |
| NoCodeBackend | Authentication and persisted domain data | provider evidence + project contract/docs |
| Vercel | Intended deployment platform | Vercel provider state + `STATUS.md`; no project binding currently verified |

## Project-specific exceptions and configuration gaps

- GitHub Issues are currently disabled at repository level, so focused PR bodies remain the implementation-contract fallback until that external setting is enabled.
- Fresh branch-protection/ruleset administration state is not exposed by the currently connected GitHub connector. The latest retained settings evidence (28 September 2026) reported no `main` protection/ruleset. Treat that as dated evidence until reverified through an administrative surface; workflow automation is not a substitute for repository protection.
- Repository auto-merge is disabled. Repository merge remains evidence-based: implementation-complete evidence, sufficient current-head project-owned validation, resolved material review/thread state, conflict-free mergeability and any applicable release evidence must be satisfied.
- Update-branch support is disabled; stale branches are blocked from lifecycle merge until brought current.
- The source tree is mixed JavaScript with TypeScript checking rather than a fully TypeScript codebase.
- The current generic NoCodeBackend proxy contract predates certification of future generic execution sessions; new provider behaviour must not be inferred from that existing contract.
- Project-specific NoCodeBackend configuration intentionally extends the master provider baseline with `NOCODEBACKEND_USER_EMAIL`, `NOCODEBACKEND_USER_SECRET_KEY`, `NOCODEBACKEND_ADMIN_EMAIL`, and `NOCODEBACKEND_ADMIN_SECRET_KEY`. These are server-owned provider administration/certification inputs requested for this project; they do not change runtime credential precedence or prove user/admin provider capability. The implemented auth/data path continues to use `NOCODEBACKEND_SECRET_KEY` unless target-provider evidence supports a contract change.

## Important constraints

1. Browser-delivered code is untrusted and secret-free.
2. Privileged NoCodeBackend access remains behind the application-owned same-origin proxy.
3. Remote domain data is authoritative; failed persistence must not silently become browser-local state.
4. One unified execution engine should own recommendation/execution policy rather than screen-specific alternatives.
5. Durable generic execution remains fail-closed until the real provider contract is certified.
6. Accessibility, interruption recovery and low cognitive load are normal quality requirements, not optional polish.
7. Repository merge is permitted only from current evidence; a new commit invalidates prior implementation-complete/validation evidence.
8. Repository merge does not imply deployment, provider certification or runtime verification.

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
| Canonical full validation | `npm run platform:validate` |
| PR lifecycle | Normal PR by default + lifecycle metadata; native Draft only for genuinely non-reviewable/substantially incomplete work |

## Authority by fact

Use the source that owns the fact rather than a single global ranking:

| Fact | Authority |
| --- | --- |
| Implemented application behaviour, routes and configuration | repository code/configuration |
| Intended domain meaning, invariants and accepted architecture | contracts, `docs/DATA_MODEL.md`, architecture and accepted decisions |
| Live issue/PR/review/merge state | GitHub |
| Deployed NoCodeBackend schema/operations | verified provider evidence |
| Deployed version/runtime identity | deployment platform evidence |
| Stable project identity, scope, inheritance and intentional exceptions | `PROJECT.md` |
| Current objective, active work, scoped blockers, evidence, owner action and next work | `STATUS.md` |
| Future direction/dependencies | `ROADMAP.md` |
| Current implementation/navigation relationships | `SYSTEM_MAP.md` |

`AGENTS.md` defines repository-specific execution behaviour for agents. Prior chat/context is supporting context only.

When sources disagree, investigate the owning fact and correct the stale or regressed source. An accidental code regression does not amend the intended data model or accepted contract.

## Portfolio and execution-capacity model

Project importance and current execution capacity are distinct. This repository may remain portfolio `ACTIVE` while its execution slot is `BUILDING`, `INTEGRATING`, `VERIFYING`, `WAITING`, or `NONE`.

Default implementation WIP controls are a maximum dependent PR stack of **2** and a maximum of **3** ordinary open implementation PRs. Exceeding either limit pauses new overlapping implementation until existing work is validated, reconciled and integrated.

Autonomous continuation must stop inventing work when no roadmap requirement, accepted implementation contract, defect, failed validation, review finding, security/data requirement, documented technical debt, dependency-correct release work or accepted product requirement justifies further work.

## Template-library compatibility

This repository should consume reusable master patterns where they fit, without copying entire master standards or prematurely sharing runtime packages. Prefer reusable repository/GitHub/validation/database/provider/feature/decision templates and stable contracts first; share runtime implementation only after the abstraction is genuinely stable across projects.

## Data/provider governance

ADHD Life OS uses NoCodeBackend, so the domain model and provider representation are deliberately separate:

- `docs/DATA_MODEL.md` is the application/domain authority;
- `database/provider-schema.json` is the machine-readable provider-schema evidence register;
- `docs/NOCODEBACKEND_OPERATIONS.md` is the human-readable provider certification register;
- `database/migrations/` holds controlled provider transition packages;
- no SQL schema is authoritative unless the provider genuinely exposes an executable SQL schema for this project.

## Delivery model

Implementation follows the inherited master standards and the repository-specific workflow in `AGENTS.md`, `docs/CODEX_WORKFLOW.md`, and `docs/GITHUB_CONFIGURATION.md`.

The normal unit of work is one focused outcome producing one focused normal PR. Native GitHub Draft status is reserved for work that genuinely must not be reviewed or merged yet, or is deliberately substantially incomplete. Lifecycle state is recorded in repository/PR metadata rather than relying on the Draft flag. Significant changes pass the relevant project-entry, change, integration, release and completion gates. The project-owned acceptance process remains authoritative; GitHub Actions is supporting diagnostic evidence rather than a duplicate mandatory merge gate. `STATUS.md` records the current material project gate when evidence remains outstanding.

## Owner-facing operational reporting

`AGENTS.md` defines the authoritative ChatGPT/Codex response contract. Detailed implementation evidence stays in the repository and GitHub; routine owner-facing responses default to concise `Done / Next / You` reporting, with `Blocked`, `Problem`, or `Decision needed` added only when materially necessary.

## Current delivery direction

Stage 2 integrity work is complete. Stage 3 is active and aims to turn the existing recommendation/next-action foundation into a durable Start/Continue/Recover execution loop without creating competing engines or unverified provider behaviour.

The live delivery snapshot and immediate dependency-correct work are maintained in [`STATUS.md`](STATUS.md). Intended future direction is maintained separately in [`ROADMAP.md`](ROADMAP.md).

## Authoritative supporting documents

- [`README.md`](README.md) — repository entry point and setup.
- [`AGENTS.md`](AGENTS.md) — repository implementation constraints.
- [`STATUS.md`](STATUS.md) — current state, execution gate and next work.
- [`ROADMAP.md`](ROADMAP.md) — intended milestone/future direction.
- [`SYSTEM_MAP.md`](SYSTEM_MAP.md) — compact implementation relationships.
- [`docs/PRODUCT.md`](docs/PRODUCT.md) — product boundary.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system architecture.
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — data model.
- [`database/README.md`](database/README.md) — provider-schema and migration evidence roles.
- [`database/provider-schema.json`](database/provider-schema.json) — machine-readable provider schema verification state.
- [`database/migrations/README.md`](database/migrations/README.md) — provider migration approval-package contract.
- [`docs/SECURITY.md`](docs/SECURITY.md) — project-specific security boundary.
- [`docs/TESTING.md`](docs/TESTING.md) — project validation strategy.
- [`docs/DELIVERY.md`](docs/DELIVERY.md) — project delivery/release details.
- [`docs/CODEX_WORKFLOW.md`](docs/CODEX_WORKFLOW.md) — continuation, gate and execution workflow.
- [`docs/GITHUB_CONFIGURATION.md`](docs/GITHUB_CONFIGURATION.md) — real GitHub capabilities, lifecycle mapping and remaining enforcement gaps.
- [`docs/DECISIONS/README.md`](docs/DECISIONS/README.md) — decision register.

## Project-level completion rule

A feature or stage is not complete because code exists, a PR merged, or a deployment succeeded. Completion requires the relevant acceptance outcome, integration, validation/provider/runtime evidence, documentation accuracy, explicit classification of remaining blocked/deferred work, and a current `STATUS.md` handoff.
