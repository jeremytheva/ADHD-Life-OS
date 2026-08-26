# ADHD Life OS — NoCodeBackend Operations

**Status:** Current provider-operation register  
**Last materially reviewed:** 26 August 2026  
**Application boundary:** `/api/ncb/{auth,data}`  
**Physical data-provider contract:** **UNVERIFIED for the target ADHD Life OS instance**

## 1. Purpose

This file records the boundary between stable ADHD Life OS application operations and the physical NoCodeBackend API generated for the target database instance.

The application contract is intentionally provider-independent. A browser route such as:

```text
PATCH /api/ncb/data/tasks/<id>
```

does **not** prove that NoCodeBackend accepts `PATCH /tasks/<id>` or any other matching physical path. The server adapter must map the application operation to a provider operation that has target-instance evidence.

## 2. Stable application data contract

| Application operation | Same-origin route | Application method | Provider operation state |
| --- | --- | --- | --- |
| List collection | `/api/ncb/data/<collection>` | GET | UNVERIFIED |
| Get record | `/api/ncb/data/<collection>/<id>` | GET | UNVERIFIED |
| Create record | `/api/ncb/data/<collection>` | POST | UNVERIFIED |
| Update record | `/api/ncb/data/<collection>/<id>` | PATCH | UNVERIFIED |
| Delete record | `/api/ncb/data/<collection>/<id>` | DELETE | UNVERIFIED |

These same-origin routes are application contracts. `api/ncb/dataProviderContract.js` is the only place that should translate them into physical provider paths and methods.

## 3. Current physical-provider state

`api/ncb/dataProviderContract.js` is deliberately `UNVERIFIED` and contains no production physical operation mapping.

Until target-instance evidence is recorded:

- the application data proxy returns `NCB_PROVIDER_CONTRACT_UNVERIFIED`;
- it does not fall back to the same path/method used by the browser;
- it does not guess a generated NoCodeBackend route family;
- it does not send browser auth cookies, Origin or Referer to the generated data API;
- it does not claim reads or writes are provider verified.

This is a fail-closed migration from the previous implicit mapping, which treated the application path as the provider path without target-instance evidence.

## 4. Provider configuration contract

Server/runtime configuration uses:

```text
NOCODEBACKEND_AUTH_BASE_URL
NOCODEBACKEND_DATA_BASE_URL
NOCODEBACKEND_SECRET_KEY
NOCODEBACKEND_INSTANCE
```

The repository example uses the current canonical service bases:

```text
NOCODEBACKEND_AUTH_BASE_URL=https://app.nocodebackend.com/api/user-auth
NOCODEBACKEND_DATA_BASE_URL=https://api.nocodebackend.com/
```

The instance and secret remain deployment-specific and server-only.

A base URL is not evidence of an operation route. The target instance's generated API/Swagger remains authoritative for physical data paths, methods, filtering and envelopes.

## 5. Evidence available from the reusable provider reference

The reusable NoCodeBackend reference contains provider evidence from another project showing:

```text
GET /read/<collection>?Instance=<instance>
Authorization: Bearer <server secret>
```

and an envelope containing a `data` array. It also records a create/update/delete route family used by prior project work.

That evidence is useful for certification design, but it is **not** target-instance certification for ADHD Life OS. The repository therefore does not copy those physical write routes into production code.

## 6. Data request security contract

Before a generated data request is made, the application server must:

1. validate the same-origin application route, method, query and body;
2. confirm that the target provider operation is recorded as verified;
3. validate required server configuration, including `NOCODEBACKEND_INSTANCE`;
4. resolve the authenticated user through the auth/session boundary;
5. constrain ownership to the server-verified user;
6. map the application operation through the verified provider contract;
7. send only provider-required server-owned headers and validated data;
8. validate the provider response before returning it to the browser.

Generated data calls must not receive the browser's auth cookie merely because it was needed to establish the application session.

## 7. Evidence required to mark an operation VERIFIED

For each physical operation record:

- target NoCodeBackend instance;
- generated endpoint/path or path template;
- HTTP method;
- required headers;
- required `Instance`/query behaviour;
- request body shape where applicable;
- success response envelope;
- relevant filtering semantics;
- representative success evidence;
- relevant failure evidence;
- date/source of verification.

Do not record secret values or production personal data.

## 8. Target-instance certification sequence

1. Open the target ADHD Life OS NoCodeBackend generated API/Swagger.
2. Capture the exact read/list contract for one existing supported collection.
3. Verify record lookup semantics rather than assuming an item URL.
4. Capture create/update/delete routes and methods only where those operations are enabled.
5. Verify whether update is PUT, PATCH or another generated method.
6. Verify filtering used for ownership and relationships.
7. Verify response envelopes and field types.
8. Update deterministic contract fixtures/tests.
9. Update `api/ncb/dataProviderContract.js` with only the operations supported by that evidence.
10. Run `npm run platform:validate` and connected-provider certification before changing provider state to APPLICATION VERIFIED.

## 9. Execution-session dependency

The future `execution-sessions` collection follows the same boundary. Its logical model and dedicated certification harness are defined in `NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md`.

The general provider operation contract should be certified before the new collection is activated so Stage 3 does not build durable execution state on an unverified transport assumption.
