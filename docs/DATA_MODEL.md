# ADHD Life OS — Data Model

**Status:** Current persisted-data baseline  
**System of record:** NoCodeBackend  
**Last reviewed:** 23 August 2026

## 1. Purpose

This document defines the persisted domain entities, ownership rules, relationships, validation expectations, and data-evolution requirements for ADHD Life OS. It describes the current supported model, not speculative future integrations.

NoCodeBackend is the domain-data system of record. Browser code reaches it only through the application-owned same-origin proxy described in [`ARCHITECTURE.md`](ARCHITECTURE.md).

## 2. Data principles

1. **Remote domain data remains authoritative.** Failed NoCodeBackend requests must not silently create browser-local substitutes.
2. **Ownership is explicit.** User-owned records are associated with a stable `user_id` and ownership must not be mutable through ordinary patch payloads.
3. **Identifiers and server-managed timestamps are immutable.** Client forms must not be able to rewrite record identity or creation metadata.
4. **Schemas are contracts.** Create, patch, query, and response shapes are validated independently.
5. **Relationships are explicit.** Foreign identifiers should refer to known collection relationships rather than ad hoc embedded copies where unnecessary.
6. **Schema evolution is controlled.** Changes require compatibility analysis, tests, fixtures/examples where relevant, documentation updates, and a safe migration/backfill approach when existing records are affected.
7. **Derived state should not be persisted without a reason.** Recommendations, rankings, summaries, and transient UI state should normally be computed from source records.

## 3. Current collections

| Collection | Purpose | Ownership / relationships |
| --- | --- | --- |
| `user-preferences` | Day setup, theme, notifications, onboarding and accessibility/module preferences | one logical preference record per `user_id` |
| `tasks` | Actionable work and task metadata used by planning/execution | belongs to `user_id`; may reference `project_id` |
| `projects` | User goals/containers for related tasks | belongs to `user_id` |
| `subtasks` | Smaller steps attached to a task | belongs to `user_id` and `task_id` |
| `routines` | Repeatable multi-step routines | belongs to `user_id` |
| `routine-steps` | Ordered actions within a routine | belongs to `user_id` and `routine_id` |
| `routine-sessions` | Execution/history state for a routine instance | belongs to `user_id` and `routine_id` |
| `housework-tasks` | Home-mode recurring chores | belongs to `user_id` |
| `housework-completions` | Completion history for housework tasks | belongs to `user_id` and `task_id` |
| `inbox-items` | Rapidly captured thoughts/obligations awaiting processing | belongs to `user_id` |

The authoritative runtime schemas are implemented in `src/domains/schemas.js`. This document must change when those persisted contracts materially change.

## 4. Core relationship model

```text
User
├── User Preferences (1 logical record)
├── Projects
│   └── Tasks (optional project relationship)
│       └── Subtasks
├── Routines
│   ├── Routine Steps
│   └── Routine Sessions
├── Housework Tasks
│   └── Housework Completions
└── Inbox Items
```

A task may exist without a project. A subtask must have a parent task. Routine steps/sessions must have a parent routine. Housework completion records must refer to the relevant housework task.

## 5. Common record expectations

Where supported by the provider/schema, persisted records use server-managed identity/timestamp fields and explicit user ownership. Exact fields are governed by runtime schemas rather than this narrative document.

### Immutable or server-controlled concepts

- record identifier;
- owning `user_id` where ownership is established;
- creation timestamp;
- provider-managed fields not explicitly allowed by the application contract.

### Patch behaviour

Patch payloads must:

- contain at least one allowed mutable field;
- reject attempts to change identifiers or ownership;
- reject unknown fields where strict schemas apply;
- validate values using the same domain constraints used for create/form boundaries;
- preserve backward compatibility with existing supported records unless a deliberate migration changes the contract.

## 6. Query contract

Collection queries are allowlisted rather than arbitrary pass-through queries. Current supported filters include documented relationships/status fields such as:

- `user_id`;
- `routine_id`;
- `task_id`;
- supported `status` values.

New filters must be justified by an application use case and added to validation/proxy contract tests. Do not allow arbitrary query parameters simply because NoCodeBackend can accept them.

## 7. Task/execution data

Tasks currently carry metadata used by planning and recommendation behaviour, including contextual dimensions such as energy, duration, interest, aversiveness, location, and other task attributes supported by the schema/UI.

Stage 3 introduces a unified execution engine. At this snapshot, execution eligibility/recommendation behaviour should be treated primarily as domain policy over existing records unless a persisted execution-state contract has been explicitly added.

If start/continue/recovery work requires durable execution state, first decide and document:

- whether state belongs on `tasks`, a dedicated execution/session collection, or another existing entity;
- lifecycle/status values and legal transitions;
- interruption/resumption semantics;
- timestamp requirements;
- stale/deleted-parent behaviour;
- concurrency or duplicate-session behaviour;
- retention/history requirements;
- compatibility for existing records.

Do not introduce persistent execution fields ad hoc in a component.

## 8. Routine data

Routines are separated into definition and execution concepts:

- `routines` define the repeatable routine;
- `routine-steps` define ordered actions;
- `routine-sessions` represent an execution instance/history.

Changes to routine execution should preserve the distinction between reusable definition data and session-specific progress/history.

## 9. Housework data

`housework-tasks` define recurring chores. `housework-completions` preserve completion history separately so completion events do not need to overwrite the task definition. Relationship validation must ensure a completion cannot be treated as belonging to a different user/task without explicit support.

## 10. Inbox data

`inbox-items` are capture-first records. Processing an inbox item into another domain object should use an explicit application workflow. If a future change creates a task/project from an inbox item, partial-success behaviour must be defined so a failed second operation does not silently lose or duplicate the captured item.

## 11. User preferences

`user-preferences` stores durable configuration such as onboarding selections, modules, accessibility/display preferences, and day-setup-related settings supported by the application.

Preference evolution should be backward compatible: absent newly introduced optional fields should resolve to safe defaults rather than requiring destructive migration where possible.

## 12. Validation layers

The intended validation sequence is:

```text
form/input
  -> domain create/patch schema
  -> browser client/repository
  -> proxy request/query validation
  -> NoCodeBackend
  -> proxy/domain response validation
  -> application state
```

Each layer has a distinct role. UI validation improves interaction but does not replace server-boundary validation.

## 13. Data integrity rules

All persisted-feature changes should consider:

- parent records missing/deleted;
- wrong-user relationship identifiers;
- duplicate creation/retry behaviour;
- invalid status transitions;
- stale client data;
- partial success across multiple writes;
- unsupported legacy records;
- optional/null/undefined normalization;
- provider error envelopes and timeouts;
- safe user-facing recovery.

## 14. Migration and compatibility policy

A schema change is not complete when the frontend compiles. The implementation must determine:

1. whether existing provider records remain readable;
2. whether new code can tolerate old records during rollout;
3. whether backfill/migration is required;
4. whether the change is additive, tightening, or breaking;
5. how failed migration/backfill is detected and recovered;
6. which tests demonstrate compatibility;
7. which documentation/decision records must change.

Manual production editing must not be the primary migration strategy for systematic schema changes.

## 15. Retention and deletion

The current repository sources reviewed for this update do not establish a comprehensive product-wide retention/deletion schedule. Do not invent one in implementation. Any feature requiring permanent deletion, archival, recovery windows, or regulatory retention must record the policy before treating it as a settled data contract.

## 16. Future integrations

External calendar/event data and remote AI-derived data are not part of the current persisted model. Before adding them, establish:

- source-of-truth ownership;
- synchronization direction;
- external identifiers;
- conflict resolution;
- deletion propagation;
- offline/retry behaviour;
- privacy/consent requirements;
- data minimisation and retention;
- provider failure semantics.

## 17. Change checklist

When evolving a persisted record or adding a collection:

1. update/introduce the runtime schema in `src/domains/schemas.js`;
2. define ownership and relationship invariants;
3. update service/repository/client behaviour;
4. extend the explicit proxy contract;
5. add create/patch/query/response and failure-state tests;
6. assess existing-record compatibility and migration/backfill needs;
7. update fixtures/examples where applicable;
8. update this document and security/architecture documents if boundaries changed;
9. record a decision if the model materially constrains future implementation;
10. run `npm run validate` and applicable end-to-end tests.
