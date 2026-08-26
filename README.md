# ADHD Life-OS MVP

ADHD Life-OS is a React and Vite life-management platform designed for supportive, low-stimulation task, routine, project, inbox, home-management and next-action workflows.

## Current behaviour

- **Tasks and prioritisation:** create and organise tasks; optional energy, duration, interest, aversiveness, location and item metadata informs Quick Wins, Momentum Builders and Brave Frog recommendations.
- **Planning workflows:** projects/subtasks, routines/routine sessions, daily planning, Brain Inbox capture, templates and Home-mode housework checklists.
- **Personalisation:** onboarding roles/modules plus accessibility preferences including font size, contrast, reduced motion, focus mode, dyslexic font and line spacing.
- **Execution direction:** one unified execution/recommendation policy feeds the Today next-action experience. Durable generic Start/Continue/Recover remains provider-blocked until the real NoCodeBackend execution-session contract is certified.
- **Data and authentication:** browser requests use same-origin, allowlisted NoCodeBackend auth/data proxy routes. Server-only credentials stay behind that trust boundary; failures return explicit structured errors instead of silently creating browser-local domain records.

## Planned integrations and limits

External calendar/event synchronisation, background synchronisation, remote AI/LLM assistance and broader productivity integrations are deferred. See [`ROADMAP.md`](ROADMAP.md) and [`STATUS.md`](STATUS.md) for intended direction versus actual state.

## Documentation

- [Project control](PROJECT.md) — purpose, scope, inheritance, constraints and source-of-truth rules.
- [Current status](STATUS.md) — current stage, execution gate, blockers and next dependency-correct work.
- [Roadmap](ROADMAP.md) — intended milestone/future direction.
- [System map](SYSTEM_MAP.md) — compact implementation relationships and change-location guide.
- [Product overview](docs/PRODUCT.md) — current product behaviour and boundaries.
- [Architecture](docs/ARCHITECTURE.md) — current system/trust/provider structure.
- [Data model](docs/DATA_MODEL.md) — canonical entities, relationships and migration rules.
- [Security guide](docs/SECURITY.md) — project-specific trusted boundary and secret handling.
- [Testing guide](docs/TESTING.md) — validation layers and canonical command.
- [Delivery guide](docs/DELIVERY.md) — project delivery/release details.
- [Codex workflow](docs/CODEX_WORKFLOW.md) — gates, continuation and completion workflow.
- [Decision register](docs/DECISIONS/README.md) — consequential accepted decisions.

## Getting started

### Prerequisites

- Node.js 20 or later and npm.
- A NoCodeBackend environment for live authentication/data interaction. Automated tests do not require real credentials or network access.

### Install and run

```bash
git clone <repository-url>
cd ADHD-Life-OS
npm ci
npm run dev
```

Open `http://localhost:5173`.

## Configure the NoCodeBackend boundary

Browser-visible same-origin paths default to:

```text
/api/ncb/auth
/api/ncb/data
```

Optional browser-safe overrides:

```text
VITE_AUTH_PROXY_URL
VITE_DATA_PROXY_URL
```

Canonical server/runtime configuration:

```text
NOCODEBACKEND_AUTH_BASE_URL
NOCODEBACKEND_DATA_BASE_URL
NOCODEBACKEND_SECRET_KEY
NOCODEBACKEND_INSTANCE
```

Never expose `NOCODEBACKEND_SECRET_KEY` through `VITE_*`, commit real `.env` files, or bypass the explicit proxy handlers. Supply exact verified upstream bases; do not infer provider route families from related endpoints.

The currently allowlisted domain collections are documented in [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md).

## Development and validation

The canonical full repository check is:

```bash
npm run platform:validate
```

It composes dependency audit, executable governance checks, lint, typecheck, Node tests, production build and the critical Playwright suite.

Narrower commands remain available for diagnosis:

```bash
npm run validate:governance
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run validate
```

`platform:validate` proves only the checks declared by the repository. Provider, deployment and production-runtime verification remain separate evidence states.

## Contributing

Read [`AGENTS.md`](AGENTS.md), [`docs/CODEX_WORKFLOW.md`](docs/CODEX_WORKFLOW.md) and [`docs/TESTING.md`](docs/TESTING.md). Keep one focused implementation outcome per pull request, preserve project documentation/state, add regression coverage for meaningful defects and never include secrets or user data.

GitHub Issues are currently unavailable for this repository, so a focused pull-request body may serve as the implementation contract when no issue can be created.

## License and support

This project is licensed under the MIT License. Report security vulnerabilities privately as described in the [security guide](docs/SECURITY.md).
