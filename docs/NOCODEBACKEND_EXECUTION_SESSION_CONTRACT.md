# NoCodeBackend Execution Session Contract

**Status:** Proposed provider contract for Stage 3  
**Purpose:** Define the exact provider-side structure required before generic Start → Continue → Recover state is enabled in production.

## 1. Why this contract exists

The Stage 3 execution lifecycle now has a domain contract, but the current verified NoCodeBackend schema does not contain a generic execution-session collection. The application must therefore define and verify the provider shape before enabling persistent Start / Continue / Recover behaviour.

NoCodeBackend documentation confirms that tables/columns are created in the database workspace and REST endpoints are generated from that schema. The application should use that normal provider workflow rather than attempting to create an unverified collection implicitly from browser code.

## 2. Required collection

Create one new provider collection/table:

```text
execution-sessions
```

This collection is for generic execution state across canonical Activity types. It must not replace the existing `routine-sessions` collection, which remains specific to routine execution.

## 3. Required logical fields

The provider table should support the following logical contract. Map each field to the closest supported NoCodeBackend column type in the dashboard and record the exact generated API shape before application cut-over.

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | provider managed | Unique execution-session identifier. |
| `user_id` | yes | Owning authenticated user. |
| `activity_id` | yes | Canonical Activity identifier used by the execution engine. |
| `activity_type` | yes | Canonical activity type such as `task`, `project_task`, `routine_step`, or `chore`. |
| `source_id` | yes | Underlying domain record identifier. |
| `source_parent_id` | no | Parent project/routine identifier where applicable. |
| `title_snapshot` | yes | Human-readable title captured at start for recovery display if the source later becomes unavailable. |
| `status` | yes | `in_progress`, `paused`, `completed`, or `cancelled`. |
| `started_at` | yes | ISO timestamp when execution began. |
| `paused_at` | no | Most recent pause timestamp. |
| `resumed_at` | no | Most recent resume timestamp. |
| `completed_at` | no | Completion timestamp. |
| `cancelled_at` | no | Cancellation timestamp. |
| `created_at` | provider/application managed | Record creation timestamp. |
| `updated_at` | provider/application managed | Last modification timestamp. |

## 4. Lifecycle invariants

Application code must enforce the following state transitions:

```text
no session -> in_progress
in_progress -> paused
paused -> in_progress
in_progress -> completed
paused -> completed
in_progress -> cancelled
paused -> cancelled
```

Terminal sessions (`completed`, `cancelled`) must not be resumed.

The generic execution session does not mark the source task/chore/routine step complete by itself. Source-domain completion remains a separate domain write and must preserve the platform's existing persistence/reconciliation semantics.

## 5. Ownership invariant

All execution-session reads and writes must be constrained to the authenticated server-verified `user_id` through the application-owned NoCodeBackend proxy.

The browser must never be trusted to establish ownership merely by sending `user_id`.

## 6. Active-session invariant

The initial Stage 3 contract should permit **at most one non-terminal generic execution session per user**.

Because provider-level uniqueness/conditional-write capability has not yet been verified for this collection, the first implementation must use application-level compensating controls:

1. load the user's non-terminal execution sessions;
2. refuse creation when another active/paused session exists;
3. serialize Start actions in the UI/service;
4. classify duplicate/conflict responses explicitly if the provider can surface them;
5. revisit atomic enforcement if the provider exposes a verified uniqueness/transaction capability.

Do not claim this invariant is provider-atomic until that capability is verified.

## 7. Required generated API capability

Before repository code is enabled, verify the provider-generated documentation for `execution-sessions` supports the operations required by the application:

- create one session;
- list/read sessions for the authenticated user;
- update one session by identifier;
- filter sufficiently to retrieve non-terminal/current sessions, or retrieve user sessions and filter within the trusted application layer;
- delete only if the product later establishes a deletion requirement.

NoCodeBackend's current documentation describes generated create/read/update/delete APIs from defined tables, but the exact route/method/envelope for this project instance must be verified from its generated API documentation before coding against it.

## 8. Provider verification evidence required

Record the following evidence before enabling persistence:

- [ ] `execution-sessions` exists in the target NoCodeBackend database.
- [ ] Exact provider table/column names match this logical contract or documented mappings exist.
- [ ] Generated API documentation exposes create/read/update operations.
- [ ] Authenticated create succeeds with a test record.
- [ ] Authenticated read returns the created record.
- [ ] Authenticated update can move `in_progress -> paused -> in_progress`.
- [ ] Invalid/unknown status handling is understood.
- [ ] Record ownership cannot be used to read/update another user's session through the application proxy.
- [ ] Response envelope and field types are captured in repository tests/fixtures.
- [ ] Provider filtering behaviour is captured if used.

## 9. Application cut-over sequence

After the provider contract is verified:

1. add `executionSessionSchema`, create schema, and patch schema to `src/domains/schemas.js`;
2. add `execution-sessions` to the explicit `api/ncb/handler.js` collection allowlist;
3. add `repositories.executionSessions`;
4. add an `executionSessionService` that owns Start/Pause/Resume/Complete/Cancel persistence;
5. enforce authenticated ownership at the existing server trust boundary;
6. add tests for schema, proxy request validation, response validation, ownership, and lifecycle transitions;
7. integrate Today with persistent Start / Continue / Recover actions;
8. handle source records that are stale, deleted, completed elsewhere, or no longer executable;
9. preserve explicit partial-success semantics if source completion succeeds but execution-session reconciliation fails;
10. update `docs/DATA_MODEL.md`, `docs/ARCHITECTURE.md`, `STATUS.md`, and the decision register.

## 10. Migration stance

This is an additive provider change. Existing users have no execution-session records and therefore require no destructive migration.

The application must remain compatible with the absence of execution-session data during rollout. The provider table should be created and verified before application code treats it as available.

## 11. Out of scope for the first persistent slice

Do not include these in the initial provider contract:

- recommendation-history storage;
- automatic replanning history;
- learned preference/duration history;
- concurrent multiple active sessions;
- external calendar linkage;
- remote AI/LLM execution state.

Those should be introduced only by separate product/data decisions when there is a concrete consuming feature.
