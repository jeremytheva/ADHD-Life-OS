# Execution Session Activation Runbook

**Status:** Prepared; provider capability remains disabled  
**Scope:** Stage 3 generic execution sessions (`task`, `project_task`, `chore`)

## Purpose

This runbook defines the controlled activation sequence for `execution-sessions` after the target NoCodeBackend instance has the required table and generated API contract.

Activation is evidence-driven. The existence of application code or a capability flag is not provider certification.

## 1. Provider prerequisite

Create the `execution-sessions` collection/table according to `docs/NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md`.

Do not enable the application capability yet.

## 2. Run live certification

Use the canonical four-variable NoCodeBackend environment and the write fixtures documented by the provider certification harness.

The certification must include read, create, and update behaviour and must explicitly verify at least:

- `id`
- `user_id`
- `activity_id`
- `activity_type`
- `source_id`
- `title_snapshot`
- `status`
- `started_at`

Example:

```bash
npm run verify:nocodebackend -- \
  --collection=execution-sessions \
  --write \
  --cleanup \
  --create-fixture=/path/to/execution-session-create.json \
  --update-fixture=/path/to/execution-session-update.json \
  --expect-fields=id,user_id,activity_id,activity_type,source_id,title_snapshot,status,started_at \
  > execution-sessions-certification.json
```

The resulting JSON is the activation evidence. Do not store provider secrets in the report or repository.

## 3. Run activation preflight

With the capability still disabled:

```bash
npm run verify:execution-activation -- \
  --evidence=execution-sessions-certification.json \
  --mode=preflight
```

Preflight must report `status: pass` and `ready_to_enable: true`.

It verifies both provider evidence and repository structure:

- execution-session certification is `read-write`;
- read/create/update all passed;
- required fields were explicitly verified;
- conditional proxy contracts exist;
- repository registration is capability-gated;
- production runtime composition exists;
- browser fail-closed coverage exists;
- `providerCapabilities.executionSessions` is still `false`.

## 4. Cut-over change

Only after preflight passes:

1. change `providerCapabilities.executionSessions` from `false` to `true`;
2. make no unrelated architecture or provider changes in the same cut-over;
3. retain the certified schema shape unless the live evidence requires an explicit documented correction.

The capability switch activates together:

- execution-session repository registration;
- execution-session proxy collection/schema exposure;
- production execution runtime composition;
- Today execution controls.

## 5. Verify activated source state

After changing the capability:

```bash
npm run verify:execution-activation -- \
  --evidence=execution-sessions-certification.json \
  --mode=cutover
```

This must report `status: pass` and `activated: true`.

## 6. Required validation

Run the complete application validation baseline:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Add/enable lifecycle browser coverage for:

- Start;
- Pause;
- Continue after reload;
- Complete;
- Stop/cancel;
- completed-elsewhere reconciliation;
- source missing/closed recovery;
- provider write failure;
- partial-success completion/reconciliation.

## 7. Deployment verification

Before declaring the capability production-ready:

- confirm the deployed environment contains the canonical NoCodeBackend variables;
- confirm no deprecated `NCB_*` aliases are required;
- verify authenticated read/create/update through the deployed application boundary;
- smoke-test Start → Pause → Continue → Complete;
- verify a second authenticated user cannot read or mutate the first user's execution session;
- verify correlation-safe errors for provider failures.

## 8. Rollback

If activation validation fails:

1. set `providerCapabilities.executionSessions` back to `false`;
2. redeploy;
3. leave provider records intact unless a separate migration decision requires cleanup;
4. preserve certification and failure evidence;
5. correct the provider/application contract before attempting activation again.

Disabling the capability is the application rollback. It must not require destructive provider-data rollback.
