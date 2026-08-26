# ADHD Life OS — Data Model

**Status:** Current persisted-data baseline  
**System of record:** NoCodeBackend  
**Last materially reviewed:** 26 August 2026

## 1. Purpose

This document defines the canonical persisted domain entities, ownership rules, relationships, validation expectations, provider mapping constraints and active data-evolution state for ADHD Life OS.

The application domain model is authoritative. NoCodeBackend is the current persistence substrate; browser code reaches it only through the application-owned same-origin proxy described in [`ARCHITECTURE.md`](ARCHITECTURE.md).

## 2. Data principles

1. **Remote domain data remains authoritative.** Failed provider requests must not silently create browser-local substitutes.
2. **Ownership is explicit.** User-owned records are associated with stable `user_id`; browser input is not ownership authority.
3. **Identifiers/server-managed fields are protected.** Ordinary patches must not rewrite identity or protected metadata.
4. **Schemas are contracts.** Create, patch, query and response shapes are validated independently.
5. **Relationships are deliberate.** Optional relationships remain optional unless a real business invariant requires otherwise.
6. **Schema evolution is migration-safe.** Existing records/consumers must be considered before cutover or contraction.
7. **Derived state is not persisted without reason.** Recommendations/rankings/summaries remain derived unless durability has an explicit product/system purpose.
8. **Provider state is not inferred.** A planned collection/route is not part of the data model until the provider contract is verified and application mapping is implemented.

## 3. Current persisted collections

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

Authoritative runtime schemas are in `src/domains/schemas.js`.

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
- provider-managed fields not explicitly allowed by the application contract.

Patch payloads must reject unknown/protected fields where strict schemas apply and preserve compatibility unless a deliberate migration changes the contract.

## 6. Query contract

Collection queries are allowlisted, not arbitrary pass-through provider queries. Current application filters include supported fields such as `user_id`, `routine_id`, `task_id` and supported status values.

New filtering behaviour requires an application use case, validation/proxy contract coverage and real provider verification when provider semantics matter.

## 7. Task and execution data

Tasks carry contextual metadata used by planning/recommendation behaviour, including dimensions such as energy, duration, interest, aversiveness and location where supported by the schema/UI.

The unified execution engine is domain policy over current records. Generic durable execution state is **not yet a current persisted collection**.

### Planned `execution-sessions`

Status: **PLANNED / PROVIDER UNVERIFIED**

The logical provider contract is defined in [`NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md`](NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md). It is additive and must not be treated as active until:

1. the real provider structure exists;
2. exact fields/routes/methods/envelopes/filtering are certified;
3. provider uniqueness/concurrency capability is classified;
4. application schemas/proxy/repository ownership behaviour is implemented and tested;
5. this document is updated from planned to current persisted state.

Routine-specific `routine-sessions` remain separate and authoritative for routine execution history.

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
- recoverable user-visible failure.

Execution-session completion and source task/chore/routine completion are separate operations until a specific reconciliation contract proves otherwise.

## 9. Validation flow

```text
form/input
  → domain create/patch schema
  → browser repository/client
  → proxy request/query validation
  → trusted ownership/session boundary
  → NoCodeBackend
  → proxy/domain response validation
  → application state
```

UI validation improves interaction but does not replace trusted-boundary validation.

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

`execution-sessions` is at **PLANNED / pre-EXPAND provider creation**. No destructive migration or backfill is currently justified because no generic execution-session records exist.

## 11. User preferences

`user-preferences` stores durable onboarding/module/accessibility/day-setup configuration. New optional preference fields should normally resolve to safe defaults for older records rather than forcing destructive migration.

## 12. Inbox multi-write behaviour

Processing an `inbox-item` into another domain object must preserve explicit partial-success/retry semantics so a failed second operation does not silently lose or duplicate the captured source item.

## 13. Retention and deletion

No comprehensive product-wide retention/deletion schedule is currently established. Do not invent one in implementation. Features requiring permanent deletion, archival, recovery windows or regulatory retention require an explicit policy decision before being treated as settled data behaviour.

## 14. Future integrations

External calendar/event data and remote AI-derived data are not current persisted domains. Before adding them establish source-of-truth ownership, sync direction, external identifiers, conflicts, deletion propagation, retry/offline behaviour, privacy/consent, minimisation/retention and provider failure semantics.

## 15. Persisted-change protocol

When evolving a persisted record or adding a collection:

1. identify the canonical domain outcome/model;
2. verify the real provider capability/contract where required;
3. define ownership, relationships and invariants;
4. update/introduce runtime schemas;
5. update repository/client and explicit proxy behaviour;
6. add request/response/ownership/failure coverage;
7. assess compatibility and migration/backfill stage;
8. update this document and other affected project records;
9. record a decision when the model materially constrains future capability;
10. run `npm run platform:validate`;
11. do not claim provider/application/runtime verification without the corresponding evidence.
