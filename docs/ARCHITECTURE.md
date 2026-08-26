# ADHD Life OS — Architecture

**Status:** Current architecture baseline  
**Last materially reviewed:** 26 August 2026

## 1. Purpose

This document defines the current system structure, trust boundaries, dependency direction, runtime data flow, and extension rules for ADHD Life OS. Product intent is defined in [`PRODUCT.md`](PRODUCT.md); persisted entities are defined in [`DATA_MODEL.md`](DATA_MODEL.md); security requirements are defined in [`SECURITY.md`](SECURITY.md); the compact navigational view is [`../SYSTEM_MAP.md`](../SYSTEM_MAP.md).

## 2. System context

ADHD Life OS is currently a React single-page application served by Vite. The browser handles presentation and interaction, while NoCodeBackend is the intended remote authentication and domain-persistence provider. The browser does **not** talk directly to privileged NoCodeBackend endpoints. All privileged traffic passes through application-owned same-origin handlers under `api/ncb/`.

```text
User
  -> React/Vite SPA
      -> UI/components/pages
      -> contexts + services + domain policy
      -> browser data/auth clients
          -> stable same-origin /api/ncb/{auth,data}
              -> application route + validation boundary
                  -> provider contract/adapter
                      -> NoCodeBackend
```

## 3. Runtime components

| Component | Responsibility |
| --- | --- |
| `src/App.jsx` / routing | Application shell, route composition, lazy-loaded feature boundaries. |
| `src/pages/` | Route-level user experiences. |
| `src/components/` | Reusable visual/interaction components. |
| `src/contexts/` | Cross-cutting client state and provider-level coordination. |
| `src/domain/` and `src/domains/` | Domain policy, schemas, execution/recommendation rules, and domain boundaries. |
| `src/services/` | Application behaviours and orchestration over domain/infrastructure capabilities. |
| `src/infrastructure/` | Browser-side adapters and infrastructure-facing concerns. |
| `src/config/` | Browser-safe configuration only. |
| `src/types/` | Shared type definitions used by checked JS/TS code. |
| `api/ncb/handler.js` | Same-origin application API, request validation, session ownership and safe response boundary. |
| `api/ncb/dataProvider.js` | Server-only translation from application data operations to certified physical provider requests. |
| `api/ncb/dataProviderContract.js` | Target-instance provider operation registry; fail-closed while physical operations are unverified. |
| `test/` | Deterministic Node behaviour/contract tests. |
| `e2e/` | Playwright critical-journey tests. |

## 4. Architectural principles

### 4.1 Browser code is untrusted and secret-free

Anything under `src/` is browser-delivered code. It must not contain server credentials, privileged API keys, or assumptions that hidden UI equals authorization.

### 4.2 The application-owned API boundary is mandatory

Browser auth and data requests use stable same-origin `/api/ncb/auth/*` and `/api/ncb/data/*` contracts. These are **application** contracts, not claims about physical provider routes. `api/ncb/` is not a generic reverse proxy. Routes, methods, query parameters, payload sizes, ownership, and response shapes remain explicitly constrained.

### 4.3 Physical provider contracts require evidence

A browser/application route must never be copied to the provider simply because the names look compatible. Provider URL paths, HTTP methods, `Instance` behaviour, filters and envelopes belong in the server-side provider contract and are enabled only from target-instance evidence.

If a required physical data operation is not verified, the application fails closed rather than guessing a provider route.

### 4.4 Runtime validation occurs at boundaries

External/user-provided data and upstream NoCodeBackend responses are untrusted. Zod schemas in the domain layer define supported shapes. New persisted capabilities require schema, repository/client, proxy-contract, provider-contract, test, and documentation changes together.

### 4.5 Domain policy must not be duplicated in presentation code

Execution eligibility, recommendation, validation, and other consequential behavioural rules should live in domain/application layers and be reused by pages/components. UI code may format or present a result but should not create a competing policy implementation.

### 4.6 Explicit failure is preferable to silent fallback

A remote persistence, authentication or provider-certification failure must be represented as a structured error or deliberate recoverable state. Domain writes must not silently become browser-local records because an upstream request failed.

### 4.7 Accessibility and low cognitive load are architecture concerns

Loading, empty, error, recovery, keyboard/focus, reduced-motion, and responsive states are not optional visual polish. Shared components and state boundaries should make these behaviours consistent across features.

## 5. Frontend dependency direction

Preferred dependency flow:

```text
pages/components
    -> contexts/application services
        -> domain policy + schemas
            -> infrastructure/browser clients
                -> stable /api/ncb/* application contract
```

Provider route families and provider secrets do not belong in the frontend dependency graph.

Avoid components calling privileged external services directly, pages embedding data-shape validation ad hoc, duplicated recommendation/execution scoring, services importing presentation components, or domain logic depending on Vite/browser globals when a pure function is possible.

## 6. Data flow

### 6.1 Read path

```text
UI requests data
  -> service/repository
  -> browser client
  -> /api/ncb/data/<allowlisted application operation>
  -> application request validation
  -> provider-operation contract check
  -> trusted auth-session / ownership resolution
  -> server-only provider request mapping
  -> NoCodeBackend generated data API
  -> upstream response validation
  -> structured result/error
  -> service/domain interpretation
  -> UI state
```

If the provider-operation contract is unverified or required provider configuration is absent, the request stops before any auth/data provider call.

### 6.2 Write path

Writes follow the same application route model but require independently validated create/patch payloads. The application method does not dictate the provider method: for example, an application `PATCH` may map to a provider `PUT` if and only if the target generated contract proves that mapping.

Client-supplied ownership identifiers, record identifiers, provider instance and server-managed timestamps must not become mutable merely because they appear in a form/request.

### 6.3 Authentication path

Authentication requests use `/api/ncb/auth/*`. Session/authentication behaviour remains behind the same application-owned boundary. The incoming auth cookie may be forwarded to the auth provider as required for session resolution.

The auth cookie is **not** forwarded from the application server to the generated data API by default. Authentication and data-provider authorization are separate boundaries.

## 7. NoCodeBackend provider integration

Canonical server/runtime configuration is:

```text
NOCODEBACKEND_AUTH_BASE_URL
NOCODEBACKEND_DATA_BASE_URL
NOCODEBACKEND_SECRET_KEY
NOCODEBACKEND_INSTANCE
```

The repository example identifies the provider service bases but does not infer physical data operation routes from them.

The data boundary has three distinct contracts:

```text
Browser/repository application operation
        ↓
api/ncb/handler.js validation + ownership
        ↓
api/ncb/dataProviderContract.js verified physical mapping
        ↓
api/ncb/dataProvider.js URL/method/headers/Instance construction
        ↓
NoCodeBackend generated data API
```

`dataProviderContract.js` is currently `UNVERIFIED` for the target ADHD Life OS instance. This is intentional. Deterministic tests inject a clearly labelled test-only verified contract to prove translation/security behaviour without pretending the fixture is provider certification.

Target operation evidence and certification state are maintained in [`NOCODEBACKEND_OPERATIONS.md`](NOCODEBACKEND_OPERATIONS.md).

## 8. Execution-engine direction

Stage 3 introduces a unified execution layer. Task startability and next-action selection should converge on one reusable policy rather than being calculated independently by Today, project views, routines, or future modes.

The execution layer should:

- determine whether a candidate is currently executable;
- evaluate contextual metadata consistently;
- select/rank a suitable next action;
- expose reason/context needed by UI without presentation coupling;
- support start/continue/recovery state as Stage 3 deepens;
- remain deterministic enough for focused tests.

Generic durable execution persistence remains blocked until both the general physical data-provider contract and the collection-specific contract in [`NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md`](NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md) are certified against the real target instance.

## 9. State management

Cross-cutting client state belongs in contexts only when multiple routes/features genuinely need coordinated access. Feature-local transient state should remain local where possible.

Persisted domain state must be distinguished from UI state, derived state, session/runtime state, and durable remote records in NoCodeBackend. Do not use local storage as an implicit substitute for failed or unverified remote domain persistence.

## 10. External integrations

### Current

- NoCodeBackend auth application boundary: implemented, deployment/provider runtime unverified.
- NoCodeBackend data application boundary: implemented.
- NoCodeBackend physical data-operation contract: target-instance unverified and fail-closed.
- GitHub repository/CI: active.

### Intended deployment provider

- Vercel, but no ADHD Life OS project is currently linked in the connected account; production binding/runtime state is therefore unverified.

### Planned but not enabled

- external calendar/event synchronization;
- remote AI/LLM services;
- broader productivity-service integrations.

Any new external provider requires explicit review of authentication, privacy, data ownership, failure handling, rate limits, observability, and adapter/trust-boundary placement.

## 11. Error and recovery model

The application should distinguish validation failure, authentication/session failure, authorization/access failure, missing/invalid provider configuration, unverified provider contract, provider failure, network/timeout failure, legitimate empty result, stale/deleted referenced record, and partial success across related operations.

Provider-contract/configuration failures use safe structured errors such as `NCB_PROVIDER_CONTRACT_UNVERIFIED` and `NCB_PROVIDER_CONFIG_MISSING` rather than silently falling through to an assumed provider request.

Errors crossing the proxy boundary should use safe correlation identifiers. Secrets, passwords, cookies, authorization headers, and sensitive user content must not be logged.

## 12. Deployment and validation model

The production build is a Vite SPA plus application-owned API handlers. Deployment must provide server/runtime NoCodeBackend configuration separately from browser-safe Vite configuration.

Canonical repository validation is:

```bash
npm run platform:validate
```

This proves the declared repository checks only. Test-only provider contracts prove adapter behaviour, not connected NoCodeBackend capability. Release/production claims additionally require applicable target-provider, configuration, migration, deployed-commit, runtime and smoke evidence.

## 13. Architectural constraints and debt

Current constraints to preserve or resolve deliberately:

- mixed JavaScript/TypeScript checking rather than a fully TypeScript source tree;
- NoCodeBackend remains the intended persistence provider;
- physical data operations for the target instance require certification before connected persistence is enabled;
- current app is primarily browser-driven with a narrow backend-for-frontend boundary;
- external calendar/AI integrations remain deferred;
- Stage 3 durable execution semantics remain provider-blocked and should not be duplicated through feature-specific fallbacks.

Technical debt is not automatically a reason to refactor. Refactoring should be tied to a concrete reliability, maintainability, performance, security or product outcome.

## 14. Extension protocol

Before adding a new persisted collection, external integration, cross-cutting execution rule, or privileged API operation:

1. establish the user/system outcome;
2. inspect existing domain, system-map and adapter boundaries;
3. check the relevant master/project standards and accepted decisions;
4. verify target provider behaviour rather than infer it;
5. update the provider-operation register/contract when physical behaviour changes;
6. define/update schemas, ownership and relationship rules;
7. add the smallest stable application API contract required;
8. implement service/domain behaviour;
9. integrate UI without duplicating policy;
10. add unit/contract and applicable end-to-end coverage;
11. run `npm run platform:validate`;
12. update only architecture/data/security/testing/status/decision records whose meaning changed;
13. do not advance release/completion state without required external evidence.

## 15. Related decisions

Consequential architecture decisions are indexed in [`DECISIONS/README.md`](DECISIONS/README.md). New decisions should not be buried only in pull-request descriptions or chat history.
