# NoCodeBackend Execution Session Contract

**Status:** Provider contract prepared; provider capability not yet certified  
**Purpose:** Define the exact provider-side structure and evidence required before generic Start → Continue → Recover state is enabled.

## 1. Boundary

Stage 3 has a unified recommendation/execution direction, but `main` does not currently contain a verified generic execution-session provider capability. The application must therefore remain fail-closed until the target NoCodeBackend instance contains the required structure and its generated API has been certified.

This document defines the logical contract. It does **not** assert that NoCodeBackend has already created the table, generated these exact routes, or supports provider-atomic uniqueness. Exact provider URLs and envelopes must be captured from the target instance rather than inferred.

## 2. Required collection

Create one provider collection/table:

```text
execution-sessions
```

This is generic execution state for canonical Activities. It must not replace `routine-sessions`, which remains the authoritative routine-specific execution lifecycle.

## 3. Required logical fields

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | provider managed | Unique execution-session identifier. |
| `user_id` | yes | Owning authenticated user. |
| `activity_id` | yes | Canonical Activity identifier used by the execution engine. |
| `activity_type` | yes | `task`, `project_task`, `routine_step`, or `chore`. |
| `source_id` | yes | Underlying domain record identifier. |
| `source_parent_id` | no | Parent project/routine identifier when applicable. |
| `title_snapshot` | yes | Display snapshot captured at start for recovery context. |
| `status` | yes | `in_progress`, `paused`, `completed`, or `cancelled`. |
| `started_at` | yes | ISO timestamp when execution began. |
| `paused_at` | no | Most recent pause timestamp. |
| `resumed_at` | no | Most recent resume timestamp. |
| `completed_at` | no | Completion timestamp. |
| `cancelled_at` | no | Cancellation timestamp. |
| `created_at` | provider/application managed | Record creation timestamp. |
| `updated_at` | provider/application managed | Last modification timestamp. |

Map these logical fields to the closest supported NoCodeBackend column types and record any exact-name/type differences before application cut-over.

## 4. Lifecycle invariants

Allowed transitions:

```text
no session -> in_progress
in_progress -> paused
paused -> in_progress
in_progress -> completed
paused -> completed
in_progress -> cancelled
paused -> cancelled
```

Terminal sessions (`completed`, `cancelled`) must not resume.

Completing an execution session does not itself complete the source task/chore/routine occurrence. Source-domain completion remains a separate write with the platform's explicit partial-success and reconciliation semantics.

## 5. Ownership invariant

All application reads and writes must be constrained to the authenticated server-verified `user_id` through the application-owned trust boundary.

The browser must never establish ownership merely by submitting a `user_id` value.

Provider certification proves the generated data contract. Application ownership enforcement remains a separate required proxy/repository test before production activation.

## 6. Active-session invariant

The initial Stage 3 model permits at most one non-terminal generic execution session per user.

Provider-atomic uniqueness has not been certified. Until it is, the application must use compensating controls:

1. load current non-terminal sessions for the authenticated user;
2. refuse Start when another active/paused generic session exists;
3. serialize Start mutations;
4. classify provider duplicate/conflict responses explicitly when available;
5. upgrade to provider-atomic enforcement only after verified capability evidence exists.

Do not describe this invariant as provider-atomic until that is demonstrated.

## 7. Required provider operations

Before application activation, verify the generated provider API supports:

- read/list execution sessions;
- create one execution session;
- update one execution session by identifier;
- sufficient filtering for current/non-terminal retrieval, or a safe server-side fallback when filtering is insufficient;
- deletion only if later required by product/data policy.

The repository must not guess route families or response envelopes. Capture the exact generated URLs from the target NoCodeBackend instance.

## 8. Certification command

The repository includes a fail-closed certification command:

```bash
npm run certify:execution-sessions
```

### Read-only mode — default

Set:

```text
NCB_EXECUTION_SESSIONS_READ_URL=<exact generated read URL>
NOCODEBACKEND_SECRET_KEY=<server-only provider secret>
```

`NCB_SECRET_KEY` is also accepted for compatibility with the repository's current runtime configuration.

Then run:

```bash
npm run certify:execution-sessions
```

Read mode performs no provider mutation. It requires a successful JSON response whose data is an array, and validates every returned execution-session record against the logical contract.

### Full create/update certification

Full mode deliberately requires explicit write confirmation:

```text
NCB_EXECUTION_SESSIONS_READ_URL=<exact generated read URL>
NCB_EXECUTION_SESSIONS_CREATE_URL=<exact generated create URL>
NCB_EXECUTION_SESSIONS_UPDATE_URL_TEMPLATE=<exact update URL containing {id}>
NCB_CERT_USER_ID=<test/certification user id>
NOCODEBACKEND_SECRET_KEY=<server-only provider secret>
```

Optional cleanup deletion:

```text
NCB_EXECUTION_SESSIONS_DELETE_URL_TEMPLATE=<exact delete URL containing {id}>
```

Run:

```bash
npm run certify:execution-sessions -- --mode=full --confirm-write
```

The full certification path:

1. verifies read;
2. creates a temporary `in_progress` task execution session;
3. verifies `in_progress -> paused`;
4. verifies `paused -> in_progress`;
5. terminalizes the test session as `cancelled`;
6. optionally deletes the test record when an exact delete endpoint is supplied.

If a transition fails after creation, the tool attempts to cancel the created record and reports its id for manual cleanup. It never logs the provider secret.

## 9. Evidence required before activation

- [ ] `execution-sessions` exists in the target NoCodeBackend database.
- [ ] Exact provider field names/types match this contract or mappings are documented.
- [ ] Exact generated read URL captured.
- [ ] Exact generated create URL captured.
- [ ] Exact generated update URL/template captured.
- [ ] Read certification passes.
- [ ] Full create/pause/resume/cancel certification passes.
- [ ] Returned response envelope and field types are captured in tests/fixtures.
- [ ] Provider filtering behaviour is captured if the application will rely on it.
- [ ] Provider uniqueness/concurrency capability is explicitly classified as verified or unavailable.
- [ ] Application proxy ownership tests prove cross-user reads/writes are rejected before activation.

## 10. Application cut-over sequence

Only after provider evidence passes:

1. add execution-session record/create/patch schemas;
2. add `execution-sessions` to the explicit server collection allowlist;
3. add the execution-session repository/provider adapter;
4. enforce authenticated ownership at the existing trust boundary;
5. add schema, proxy, ownership, lifecycle, filtering and response-contract tests;
6. compose durable Start/Pause/Continue/Complete/Cancel through the execution coordinator/runtime;
7. integrate Today Start/Continue/Recover;
8. preserve fail-closed recovery when source records are stale, missing, completed elsewhere, or otherwise non-executable;
9. preserve explicit partial-success/reconciliation behaviour across execution-session and source-domain writes;
10. add critical Playwright coverage;
11. update `docs/DATA_MODEL.md`, `docs/ARCHITECTURE.md`, `STATUS.md`, and relevant decisions.

## 11. Migration stance

This is additive. Existing users have no generic execution-session records, so no destructive data migration is required.

Provider structure must be created and certified before the application treats the capability as available. Absence or failed certification must leave production behaviour unchanged and unavailable rather than falling back to browser persistence.

## 12. Out of scope for the first durable slice

- recommendation-history storage;
- learned preference/duration history;
- automatic replanning history;
- multiple concurrent generic active sessions;
- external calendar linkage;
- remote AI/LLM execution state.

These remain separate future product/data decisions.
