# NoCodeBackend Provider Certification

**Purpose:** Verify the target NoCodeBackend generated API before application code enables a new provider capability.

## Safety model

`npm run verify:nocodebackend` is **read-only by default**.

It uses the canonical server environment:

```text
NOCODEBACKEND_AUTH_BASE_URL
NOCODEBACKEND_DATA_BASE_URL
NOCODEBACKEND_SECRET_KEY
NOCODEBACKEND_INSTANCE
```

The command never prints the secret. Write verification requires explicit `--write`; cleanup deletion requires explicit `--cleanup` in addition to `--write`.

## Read-only certification

Verify an existing collection first:

```bash
npm run verify:nocodebackend -- \
  --collection=tasks \
  --filter=user_id=<test-user-id> \
  --expect-fields=id,user_id,title
```

Expected outcome:

- generated `read/{collection}` responds successfully;
- `Instance` is injected from the canonical environment;
- the provider response contains a collection array;
- expected fields are checked when at least one record is returned.

An empty collection proves route/envelope availability but cannot prove field shape.

## Write-cycle certification

Use write verification only against a controlled test record. Supply separate create and update JSON fixtures:

```bash
npm run verify:nocodebackend -- \
  --collection=<collection> \
  --write \
  --cleanup \
  --create-fixture=/path/to/create.json \
  --update-fixture=/path/to/update.json \
  --expect-fields=id,user_id,status
```

The harness performs, in order:

1. collection read;
2. create;
3. update using the created provider id;
4. delete only when `--cleanup` is present.

If `--cleanup` is omitted, the report identifies the created record id so it can be removed deliberately later.

## Certifying `execution-sessions`

Do not run this until the `execution-sessions` table/collection exists in the target NoCodeBackend instance and its columns have been created according to `docs/NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md`.

Copy the example fixtures before use and replace `REPLACE_WITH_TEST_USER_ID` with a dedicated test user's database id:

```text
scripts/fixtures/execution-session-create.example.json
scripts/fixtures/execution-session-update.example.json
```

Then run:

```bash
npm run verify:nocodebackend -- \
  --collection=execution-sessions \
  --write \
  --cleanup \
  --create-fixture=/path/to/execution-session-create.json \
  --update-fixture=/path/to/execution-session-update.json \
  --expect-fields=id,user_id,activity_id,activity_type,source_id,title_snapshot,status,started_at
```

The initial certification is sufficient to proceed with application integration only when:

- read succeeds;
- create returns a durable provider id;
- update returns the same provider id;
- required fields survive the provider round trip with compatible types;
- cleanup succeeds when requested;
- the exact response envelope matches the assumptions captured by repository tests.

## What this does not certify

This direct provider harness does not by itself certify:

- browser/session ownership enforcement through `/api/ncb/`;
- cross-user access denial;
- production Vercel environment binding;
- concurrent one-active-session enforcement;
- UI Start/Pause/Continue/Complete behaviour.

Those are separate application and deployment certification steps after the provider table itself is proven.
