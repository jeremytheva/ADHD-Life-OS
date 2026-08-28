# ADHD Life OS — Project Control

**Status:** Active development  
**Repository:** `jeremytheva/ADHD-Life-OS`  
**Last materially reviewed:** 28 August 2026

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

## Master standards inherited

This project inherits the current master sources supplied by the product owner, including:

- `AI_FIRST_PLATFORM_DEVELOPMENT_FRAMEWORK.md`;
- `AI_PLATFORM_DEVELOPMENT_STANDARD.md`;
- `PR_LIFECYCLE_STANDARD.md`;
- `PLATFORM_ENGINEERING_STANDARD.md` where separately available;
- `PLATFORM_DESIGN_PRINCIPLES.md` where separately available;
- `PROJECT_DOCUMENTATION_STANDARD.md`;
- `TESTING_VALIDATION_RELEASE_STANDARD.md`;
- `DATA_MODELLING_AND_MIGRATION_STANDARD.md` where separately available;
- applicable provider guides for GitHub, Vercel and NoCodeBackend;
- the current GitHub–Codex software delivery operating standard where it does not conflict with newer master lifecycle governance.

The repository stores project-specific facts, decisions, implementation state and deviations rather than copying the master standards wholesale. If a project-specific rule intentionally differs from a master default, the difference must be explicit and documented before it is treated as authoritative.

## Providers / external systems

| Provider/system | Project role | Current state source |
| --- | --- | --- |
| GitHub | Repository, PR lifecycle, CI and implementation history | GitHub + `docs/GITHUB_CONFIGURATION.md` + `STATUS.md` |
| NoCodeBackend | Authentication and persisted domain data | provider evidence + project contract/docs |
| Vercel | Intended deployment platform | Vercel provider state + `STATUS.md`; no project binding currently verified |

## Project-specific exceptions and configuration gaps

- GitHub Issues are currently disabled at repository level, so focused PR bodies remain the implementation-contract fallback until that external setting is enabled.
- `main` branch protection/rulesets are currently disabled; `.github/workflows/pr-lifecycle.yml` manages repository-enforceable transitions but cannot prevent every administrative/direct-push bypass. This is an explicit GitHub configuration gap, not an accepted substitute for branch protection.
- Repository auto-merge is disabled. The lifecycle controller instead performs a guarded merge mutation only after current-head validation, implementation-complete evidence, review/thread checks and clean mergeability are satisfied.
- Update-branch support is disabled; stale branches are blocked from lifecycle merge until brought current.
- The source tree is mixed JavaScript with TypeScript checking rather than a fully TypeScript codebase.
- The current generic NoCodeBackend proxy contract predates certification of future generic execution sessions; new provider behaviour must not be inferred from that existing contract.

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
| PR lifecycle | Draft + lifecycle labels + GitHub Actions controller |

## Source-of-truth hierarchy

Use the real current system rather than chat memory. For this project:

1. repository code/configuration — implemented behaviour;
2. provider/deployment/GitHub configuration state where the fact is external;
3. `AGENTS.md` — persistent repository implementation rules;
4. `PROJECT.md` — project identity, scope, inheritance and constraints;
5. `STATUS.md` — actual current delivery state, active gate and next action;
6. `docs/ARCHITECTURE.md` — intended current architecture;
7. `docs/DATA_MODEL.md` — canonical data model and physical mapping constraints;
8. `ROADMAP.md` — intended future direction;
9. `SYSTEM_MAP.md` — compact system navigation map;
10. `docs/DECISIONS/` — consequential accepted decisions;
11. GitHub PRs/CI/lifecycle state — implementation contracts and detailed validation/merge evidence;
12. prior chat/context — supporting context only.

When sources disagree, investigate and correct the stale/incorrect source rather than silently choosing one.

## Delivery model

Implementation follows the inherited master standards and the repository-specific workflow in `AGENTS.md`, `docs/CODEX_WORKFLOW.md`, and `docs/GITHUB_CONFIGURATION.md`.

The normal unit of work is one focused outcome producing one focused Draft PR. Significant changes pass the relevant project-entry, change, integration, release and completion gates. PRs progress through `DRAFT → IMPLEMENTING → VALIDATING → READY → MERGEABLE → MERGED`; the project/agent supplies the implementation-complete evidence and GitHub enforces the repository-observable gates it can verify. `STATUS.md` records the current material project gate when evidence remains outstanding.

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
- [`docs/SECURITY.md`](docs/SECURITY.md) — project-specific security boundary.
- [`docs/TESTING.md`](docs/TESTING.md) — project validation strategy.
- [`docs/DELIVERY.md`](docs/DELIVERY.md) — project delivery/release details.
- [`docs/CODEX_WORKFLOW.md`](docs/CODEX_WORKFLOW.md) — continuation, gate and execution workflow.
- [`docs/GITHUB_CONFIGURATION.md`](docs/GITHUB_CONFIGURATION.md) — real GitHub capabilities, lifecycle mapping and remaining enforcement gaps.
- [`docs/DECISIONS/README.md`](docs/DECISIONS/README.md) — decision register.

## Project-level completion rule

A feature or stage is not complete because code exists, a PR merged, or a deployment succeeded. Completion requires the relevant acceptance outcome, integration, validation/provider/runtime evidence, documentation accuracy, explicit classification of remaining blocked/deferred work, and a current `STATUS.md` handoff.
