# ADHD Life OS — Architecture

**Status:** Current architecture baseline  
**Last reviewed:** 23 August 2026

## 1. Purpose

This document defines the current system structure, trust boundaries, dependency direction, runtime data flow, and extension rules for ADHD Life OS. It is authoritative for architecture assumptions that affect implementation. Product intent is defined in [`PRODUCT.md`](PRODUCT.md); persisted entities are defined in [`DATA_MODEL.md`](DATA_MODEL.md); security requirements are defined in [`SECURITY.md`](SECURITY.md).

## 2. System context

ADHD Life OS is currently a React single-page application served by Vite. The browser handles presentation and interaction, while NoCodeBackend provides remote authentication and domain persistence. The browser does **not** talk directly to privileged NoCodeBackend endpoints. All privileged traffic passes through application-owned same-origin handlers under `api/ncb/`.

```text
User
  -> React/Vite SPA
      -> UI/components/pages
      -> contexts + services + domain policy
      -> browser data/auth clients
          -> same-origin /api/ncb/{auth,data}
              -> allowlisted application handler
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
| `src/infrastructure/` | Client-side adapters and infrastructure-facing concerns. |
| `src/config/` | Browser-safe configuration only. |
| `src/types/` | Shared type definitions used by checked JS/TS code. |
| `api/ncb/` | Backend-for-frontend trust boundary and NoCodeBackend proxy contract. |
| `test/` | Deterministic Node behaviour/contract tests. |
| `e2e/` | Playwright critical-journey tests. |

## 4. Architectural principles

### 4.1 Browser code is untrusted and secret-free

Anything under `src/` is browser-delivered code. It must not contain server credentials, privileged API keys, or assumptions that hidden UI equals authorization.

### 4.2 The application-owned API boundary is mandatory

Browser auth and data requests must use same-origin `/api/ncb/auth/*` and `/api/ncb/data/*` contracts. `api/ncb/` is not a generic reverse proxy. Routes, methods, query parameters, payload sizes, and response shapes remain explicitly constrained.

### 4.3 Runtime validation occurs at boundaries

External/user-provided data and upstream NoCodeBackend responses must be treated as untrusted. Zod schemas in the domain layer define supported shapes. New persisted capabilities require schema, repository/client, proxy-contract, test, and documentation changes together.

### 4.4 Domain policy must not be duplicated in presentation code

Execution eligibility, recommendation, validation, and other consequential behavioural rules should live in domain/application layers and be reused by pages/components. UI code may format or present a result but should not create a competing policy implementation.

### 4.5 Explicit failure is preferable to silent fallback

A remote persistence or authentication failure must be represented as a structured error or deliberate recoverable state. Domain writes must not silently become browser-local records because an upstream request failed.

### 4.6 Accessibility and low cognitive load are architecture concerns

Loading, empty, error, recovery, keyboard/focus, reduced-motion, and responsive states are not optional visual polish. Shared components and state boundaries should make these behaviours consistent across features.

## 5. Frontend dependency direction

Preferred dependency flow:

```text
pages/components
    -> contexts/application services
        -> domain policy + schemas
            -> infrastructure/browser clients
                -> /api/ncb/*
```

Avoid:

- components calling privileged external services directly;
- pages embedding data-shape validation ad hoc;
- duplicated recommendation or execution scoring in multiple screens;
- services importing presentation components;
- domain logic depending on Vite/browser globals when a pure function is possible.

## 6. Data flow

### 6.1 Read path

```text
UI requests data
  -> service/repository
  -> browser client
  -> /api/ncb/data/<allowlisted operation>
  -> request validation
  -> server-only authorization added
  -> NoCodeBackend
  -> upstream response validation
  -> structured result/error
  -> service/domain interpretation
  -> UI state
```

### 6.2 Write path

Writes follow the same route but require independently validated create/patch payloads. Client-supplied ownership identifiers, record identifiers, and server-managed timestamps must not become mutable merely because they appear in a form payload.

### 6.3 Authentication path

Authentication requests use `/api/ncb/auth/*`. Session/authentication behaviour must remain behind the same application-owned boundary and must not require browser access to server secrets.

## 7. Execution-engine direction

Stage 3 introduces a unified execution layer. The architecture intent is that task startability and next-action selection converge on one reusable policy rather than being calculated independently by Today, project views, routines, or future modes.

The execution layer should evolve around these responsibilities:

- determine whether a candidate is currently executable;
- evaluate contextual metadata consistently;
- select or rank a suitable next action;
- expose reason/context needed by the UI without presentation-specific coupling;
- support start/continue/recovery state as Stage 3 deepens;
- remain deterministic enough for focused unit tests.

If execution state becomes persisted rather than derived/transient, record that decision and update [`DATA_MODEL.md`](DATA_MODEL.md) before treating the schema as established.

## 8. State management

Cross-cutting client state belongs in contexts only when multiple routes/features genuinely need coordinated access. Feature-local transient state should remain local where possible.

Persisted domain state must be distinguished from:

- UI state (open modal, selected tab, temporary input);
- derived state (recommendations, filtered lists, summary counts);
- session/runtime state (current execution candidate if not yet persisted);
- durable remote records in NoCodeBackend.

Do not use local storage as an implicit substitute for failed remote domain persistence.

## 9. External integrations

### Current

- NoCodeBackend authentication.
- NoCodeBackend domain data.

### Planned but not enabled

- external calendar/event synchronization;
- remote AI/LLM services;
- broader productivity-service integrations.

Any new external provider requires explicit review of authentication, privacy, data ownership, failure handling, rate limits, observability, and whether it belongs behind an application-owned adapter/API boundary.

## 10. Error and recovery model

The application should distinguish at least:

- validation failure;
- authentication/session failure;
- authorization/access failure where applicable;
- unavailable/missing configuration;
- upstream/provider failure;
- network/timeout failure;
- empty legitimate result;
- stale or deleted referenced record;
- partial success when multiple related operations are involved.

Errors crossing the proxy boundary should be structured and use safe correlation identifiers. Secrets, passwords, cookies, authorization headers, and user-sensitive content must not be logged.

## 11. Deployment model

The production build is a Vite SPA plus application-owned API handlers. Deployment must provide server/runtime NoCodeBackend variables separately from browser-exposed Vite configuration.

Canonical validation before release is:

```bash
npm run validate
```

Playwright critical-path checks should be run where the change affects a supported end-to-end journey.

## 12. Architectural constraints and debt

Current constraints to preserve or resolve deliberately:

- mixed JavaScript/TypeScript checking rather than a fully TypeScript source tree;
- NoCodeBackend remote contract as the persistence provider;
- current app is primarily browser-driven with a narrow backend-for-frontend boundary;
- external calendar/AI integrations remain deferred;
- Stage 3 execution semantics are still being deepened and should not be duplicated in new feature-specific engines.

Technical debt is not automatically a reason to refactor. Refactoring should be tied to a concrete reliability, maintainability, performance, or product outcome.

## 13. Extension protocol

Before adding a new persisted collection, external integration, cross-cutting execution rule, or privileged API operation:

1. establish the user/system outcome;
2. inspect existing domain and adapter boundaries;
3. record a decision if the change constrains future architecture;
4. define/update schemas and data ownership rules;
5. add the smallest explicit proxy/API contract required;
6. implement service/domain behaviour;
7. integrate the UI without duplicating policy;
8. add unit/contract and applicable end-to-end coverage;
9. run `npm run validate`;
10. update architecture, data, security, testing, and status documents where their assumptions changed.

## 14. Related decisions

Consequential architecture decisions are indexed in [`DECISIONS/README.md`](DECISIONS/README.md). New decisions should not be buried only in pull-request descriptions or chat history.
