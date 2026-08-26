# ADHD Life OS — System Map

**Last materially reviewed:** 26 August 2026

This file is a compact navigation map for whole-system analysis. Architectural detail belongs in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md); current delivery state belongs in [`STATUS.md`](STATUS.md).

```text
User
  → React/Vite application
      → Today / Tasks / Projects / Routines / Housework / Brain Inbox / Settings
      → contexts + application services
      → domain policy + Zod schemas
          → unified execution/recommendation engine
          → task/project/routine/housework/inbox domain rules
      → browser auth/data clients
          → same-origin /api/ncb/auth/*
          → same-origin /api/ncb/data/*
              → api/ncb explicit trust-boundary handler
                  → NoCodeBackend authentication upstream
                  → NoCodeBackend data upstream
```

## Authentication

```text
UI/auth context
  → browser auth client
  → /api/ncb/auth/*
  → route/method/body/origin validation
  → server-only NoCodeBackend auth configuration
  → NoCodeBackend session/auth response
  → session identity returned to application
```

## Domain data

```text
Page/component
  → service/repository
  → browser data client
  → /api/ncb/data/*
  → trusted session identity resolution
  → ownership/query/payload validation
  → server-only NoCodeBackend data configuration
  → upstream record
  → response schema validation
  → application state
```

## Execution and next action

```text
Current domain records + execution context
  → eligibility policy
  → unified execution engine
  → recommendation + reason
  → Today decision panel
  → user action
  → source-domain write / future execution-session write
  → reconciliation
  → optional replanning
```

Generic durable execution sessions remain provider-blocked until `docs/NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md` is certified against the real target instance.

## Persistence domains

```text
User
  ├─ user-preferences
  ├─ projects
  │   └─ tasks
  │       └─ subtasks
  ├─ routines
  │   ├─ routine-steps
  │   └─ routine-sessions
  ├─ housework-tasks
  │   └─ housework-completions
  └─ inbox-items
```

See [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) for invariants and physical mapping.

## Validation and delivery

```text
Implementation
  → npm run platform:validate
      → dependency audit
      → governance checks
      → lint
      → typecheck
      → Node tests
      → production build
      → Playwright critical path
  → pull request review
  → merge
  → deployment/runtime verification when applicable
  → STATUS.md handoff
```

## Current external dependencies

- **NoCodeBackend:** current auth/data provider; execution-session capability still requires real provider certification.
- **GitHub:** implementation source of truth, CI and pull-request history.
- **Vercel:** no ADHD Life OS project is currently linked in the connected account, so production deployment remains unverified/unconfigured.

## Change-location guide

| Requirement | First places to inspect |
| --- | --- |
| User-facing workflow | `src/pages/`, `src/components/`, relevant service/domain policy |
| Recommendation/execution policy | execution/domain modules, not presentation-only code |
| Persisted shape | `src/domains/schemas.js`, repository/client, proxy, `docs/DATA_MODEL.md` |
| Auth/session | auth context/client + `/api/ncb/auth/*` + proxy contract tests |
| Authorization/ownership | `api/ncb/` trust boundary + domain relationship rules/tests |
| Provider change | provider contract/adapter + config + security/data docs |
| Release/CI | `package.json`, `.github/workflows/`, `docs/TESTING.md`, `docs/DELIVERY.md` |
| Project direction/current state | `ROADMAP.md` / `STATUS.md` |
