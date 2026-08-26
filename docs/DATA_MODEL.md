# ADHD Life OS — Data Model

**Status:** Current logical persisted-data baseline  
**Intended persistence provider:** NoCodeBackend  
**Physical provider operations:** Target-instance unverified  
**Last materially reviewed:** 26 August 2026

## 1. Purpose

This document defines the canonical persisted domain entities, ownership rules, relationships, validation expectations, provider mapping constraints and active data-evolution state for ADHD Life OS.

The application domain model is authoritative. NoCodeBackend is the intended persistence substrate; browser code reaches persistence only through the application-owned same-origin boundary described in [`ARCHITECTURE.md`](ARCHITECTURE.md).

Logical domain collections and physical NoCodeBackend operation routes are separate concerns. A domain entity may be established in the application model while the exact target-instance generated API operation remains provider-unverified.

## 2. Data principles

1. **Remote domain data remains authoritative when connected persistence is enabled.** Failed or unverified provider requests must not silently create browser-local substitutes.
2. **Ownership is explicit.** User-owned records are associated with stable `user_id`; browser input is not ownership authority.
3. **Identifiers/server-managed fields are protected.** Ordinary patches must not rewrite identity or protected metadata.
4. **Schemas are application contracts.** Create, patch, query and response shapes are validated independently.
5. **Relationships are deliberate.** Optional relationships remain optional unless a real business invariant requires otherwise.
6. **Schema evolution is migration-safe.** Existing records/consumers must be considered before cutover or contraction.
7. **Derived state is not persisted without reason.** Recommendations/rankings/summaries remain derived unless durability has an explicit product/system purpose.
8. **Provider state is not inferred.** An application collection or route is not evidence of a physical provider endpoint/method.
9. **Physical operation evidence is centralized.** Target provider paths/methods/filtering/envelopes are recorded in [`NOCODEBACKEND_OPERATIONS.md`](NOCODEBACKEND_OPERATIONS.md) and encoded only in `api/ncb/dataProviderContract.js` after verification.

## 3. Current logical collections

| Collection | Purpose | Ownership / relationships |
| --- | --- | --- |
| `user-preferences` | Day setup, theme, notifications, onboarding and accessibility/module preferences | one logical preference record per `user_id` |
| `tasks` | Actionable work and planning/execution metadata | belongs to `user_id`; may reference `project_id` |
| `projects` | Goals/containers for related tasks | belongs to `user_id` |
| `subtasks` | Smaller steps attached to a task | belongs to `user_id` and `task_id` |
| `routines` | Repeatable routine definitions | belongs to `user_id` |
| `routine-steps` | Ordered actions within a routine | belongs to `user_id` and `routine_id` |
| `routine-sessions` | Routine-specific execution/history state | belongs to `user_id` and `routine_id` |
| `housework-tasks` | Recurring home chores | belongs to `user_id` |
| `housework-completions` | Housework completion history | belongs to `user_id` and `task_id` |
| `inbox-items` | Capture-first thoughts/obligations | belongs to `user_id` |

Authoritative application runtime schemas are in `src/domains/schemas.js`.

The table above is not a certification matrix for the physical NoCodeBackend generated API. Current target physical operation state is **UNVERIFIED** until the target instance is inspected.

## 4. Relationship model

```text
User
├── User Preferences
├── Projects
│   └── Tasks (project optional)
│       └── Subtasks
├── Routines
│   ├── Routine Steps
│   └── Routine Sessions
├── Housework Tasks
│   └── Housework Completions
└── Inbox Items
```

A task may exist without a project. Subtasks require a parent task. Routine steps/sessions require a parent routine. Housework completion records refer to the relevant housework task.

## 5. Ownership and identifiers

Where supported by the provider/schema, records use provider/application-managed identifiers/timestamps plus explicit user ownership.

Protected concepts include:

- record identifier;
- owning `user_id` once established;
- creation timestamp;
- provider instance;
- provider-managed fields not explicitly allowed by the application contract.

Patch payloads must reject unknown/protected fields where strict schemas apply and preserve compatibility unless a deliberate migration changes the contract.

The browser cannot select `NOCODEBACKEND_INSTANCE`; it is server-owned configuration used only by the provider adapter.

## 6. Query contract

Collection queries are allowlisted at the application boundary, not arbitrary pass-through provider queries. Current application filters include supported fields such as `user_id`, `routine_id`, `task_id` and supported status values.

Application query support does not prove the target provider supports the same filter syntax. A filter may be used in connected persistence only after the corresponding provider behaviour is verified and recorded.

## 7. Task and execution data

Tasks carry contextual metadata used by planning/recommendation behaviour, including dimensions such as energy, duration, interest, aversiveness and location where supported by the schema/UI.

The unified execution engine is domain policy over current records. Generic durable execution state is **not yet a current persisted collection**.

### Planned `execution-sessions`

Status: **PLANNED / PROVIDER UNVERIFIED**

The logical provider contract is defined in [`NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md`](NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md). It is additive and must not be treated as active until:

1. the general target data-operation contract needed by the collection is provider verified;
2. the real provider structure exists;
3. exact fields/routes/methods/envelopes/filtering are certified;
4. provider uniqueness/concurrency capability is classified;
5. application schemas/proxy/repository ownership behaviour is implemented and tested;
6. this document is updated from planned to current persisted state.

Routine-specific `routine-sessions` remain a separate logical domain and must not be silently replaced by generic execution sessions.

## 8. Data integrity expectations

Persisted-feature changes should consider:

- missing/deleted parents;
- wrong-user relationship identifiers;
- duplicate creation/retry behaviour;
- invalid state transitions;
- stale client data;
- partial success across multiple writes;
- unsupported legacy records;
- optional/null/undefined normalization;
- provider error envelopes/timeouts;
- unverified physical operation behaviour;
- recoverable user-visible failure.

Execution-session completion and source task/chore/routine completion are separate operations until a specific reconciliation contract proves otherwise.

## 9. Validation and persistence flow

```text
form/input
  → domain create/patch schema
  → browser repository/client
  → stable application proxy route/query validation
  → physical provider-operation verification
      ├─ UNVERIFIED / missing config → explicit fail-closed error
      └─ VERIFIED
          → trusted auth-session ownership resolution
          → provider adapter mapping
          → server-owned Instance + Bearer credential
          → NoCodeBackend generated data API
          → proxy/domain response validation
          → application state
```

UI validation improves interaction but does not replace trusted-boundary validation. Test fixtures can prove mapping/validation logic but do not make the target physical operation VERIFIED.

## 10. Migration lifecycle

Use the inherited migration lifecycle where a physical/provider schema changes:

```text
EXPAND
  → COMPATIBLE APPLICATION
  → BACKFILL
  → VERIFY
  → CUT OVER
  → OBSERVE
  → CONTRACT
```

Before cutover, verify relevant record counts, nullability, relationships, uniqueness, transformed values, restartability and application compatibility. Before contraction/removal, prove no active consumer requires the old representation.

### Current migration state

The provider-boundary correction is an application integration hardening change: it removes an unverified implicit physical mapping and fails closed until target evidence exists.

`execution-sessions` remains at **PLANNED / pre-EXPAND provider creation**. No destructive migration or backfill is currently justified because no generic execution-session records are established.

## 11. User preferences

`user-preferences` stores durable onboarding/module/accessibility/day-setup configuration at the logical application level. New optional preference fields should normally resolve to safe defaults for older records rather than forcing destructive migration.

Physical provider read/write behaviour for this collection remains subject to the provider-operation register.

## 12. Inbox multi-write behaviour

Processing an `inbox-item` into another domain object must preserve explicit partial-success/retry semantics so a failed second operation does not silently lose or duplicate the captured source item.

Do not describe this persistence flow as connected-provider verified until both required physical writes are certified.

## 13. Retention and deletion

No comprehensive product-wide retention/deletion schedule is currently established. Do not invent one in implementation. Features requiring permanent deletion, archival, recovery windows or regulatory retention require an explicit policy decision before being treated as settled data behaviour.

Provider delete support is additionally unverified until the target generated operation is certified.

## 14. Future integrations

External calendar/event data and remote AI-derived data are not current persisted domains. Before adding them establish source-of-truth ownership, sync direction, external identifiers, conflicts, deletion propagation, retry/offline behaviour, privacy/consent, minimisation/retention and provider failure semantics.

## 15. Persisted-change protocol

When evolving a persisted record or adding a collection:

1. identify the canonical domain outcome/model;
2. inspect `docs/NOCODEBACKEND_OPERATIONS.md` for the physical operation evidence required;
3. verify the real target provider capability/contract before enabling new physical behaviour;
4. define ownership, relationships and invariants;
5. update/introduce runtime schemas;
6. update repository/client and stable application proxy behaviour;
7. update the provider registry only with evidenced physical operations;
8. add application/provider mapping, ownership, response and failure coverage;
9. assess compatibility and migration/backfill stage;
10. update this document and other affected project records;
11. record a decision when the model/integration materially constrains future capability;
12. run `npm run platform:validate`;
13. perform connected-provider validation before claiming provider/application verification;
14. do not claim deployment/runtime verification without the corresponding external evidence.
