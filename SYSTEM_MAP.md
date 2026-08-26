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
          → stable same-origin /api/ncb/auth/*
          → stable same-origin /api/ncb/data/*
              → api/ncb/handler.js application trust boundary
                  → auth provider path
                  → dataProviderContract.js target operation evidence
                      → dataProvider.js physical request mapping
                          → NoCodeBackend generated data API
```

## Authentication

```text
UI/auth context
  → browser auth client
  → /api/ncb/auth/*
  → route/method/body/origin validation
  → server-only NoCodeBackend auth configuration
  → incoming auth cookie forwarded to auth provider when required
  → NoCodeBackend session/auth response
  → session identity returned to application
```

## Domain data

```text
Page/component
  → service/repository
  → browser data client
  → /api/ncb/data/* application operation
  → application route/query/body validation
  → target provider-operation contract check
      ├─ unverified/missing config → fail closed before provider access
      └─ verified
          → trusted auth-session identity resolution
          → ownership constraint
          → dataProvider.js physical URL/method mapping
              → server-owned Instance + Bearer credential
              → no browser auth cookie / Origin / Referer by default
              → NoCodeBackend generated data API
          → response schema validation
          → application state
```

The browser/repository route and HTTP method are not provider-route evidence. Physical provider mappings live only in `api/ncb/dataProviderContract.js` and are currently UNVERIFIED for the target ADHD Life OS instance.

See [`docs/NOCODEBACKEND_OPERATIONS.md`](docs/NOCODEBACKEND_OPERATIONS.md) for provider-operation evidence state.

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

Generic durable execution sessions remain provider-blocked until both the general physical data operation contract and `docs/NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md` are certified against the real target instance.

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

See [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) for invariants and logical persisted shapes. Physical provider operation mapping is separate from the domain model.

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
  → connected provider/deployment verification when applicable
  → STATUS.md handoff
```

Deterministic injected provider fixtures prove adapter behaviour only; they do not advance provider-verification state.

## Current external dependencies

- **NoCodeBackend:** intended auth/data provider. Physical target data operations and execution-session capability require real provider certification.
- **GitHub:** implementation source of truth, CI and pull-request history.
- **Vercel:** no ADHD Life OS project is currently linked in the connected account, so production deployment remains unverified/unconfigured.

## Change-location guide

| Requirement | First places to inspect |
| --- | --- |
| User-facing workflow | `src/pages/`, `src/components/`, relevant service/domain policy |
| Recommendation/execution policy | execution/domain modules, not presentation-only code |
| Persisted shape | `src/domains/schemas.js`, repository/client, proxy, `docs/DATA_MODEL.md` |
| Stable browser data operation | `src/infrastructure/nocodebackend/`, `api/ncb/handler.js` |
| Physical provider data route/method | `api/ncb/dataProviderContract.js`, `api/ncb/dataProvider.js`, `docs/NOCODEBACKEND_OPERATIONS.md` |
| Auth/session | auth context/client + `/api/ncb/auth/*` + proxy contract tests |
| Authorization/ownership | `api/ncb/handler.js` + domain relationship rules/tests |
| Provider certification | `docs/NOCODEBACKEND_OPERATIONS.md`, target Swagger/API evidence, provider contract tests |
| Release/CI | `package.json`, `.github/workflows/`, `docs/TESTING.md`, `docs/DELIVERY.md` |
| Project direction/current state | `ROADMAP.md` / `STATUS.md` |
