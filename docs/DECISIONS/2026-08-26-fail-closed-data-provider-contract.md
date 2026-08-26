# Fail closed on unverified NoCodeBackend data operations

**Date:** 2026-08-26  
**Status:** Accepted

## Context

The application exposes stable same-origin data routes such as `/api/ncb/data/tasks` and `/api/ncb/data/tasks/<id>`. The existing server handler previously derived the NoCodeBackend target by appending that same application path to `NOCODEBACKEND_DATA_BASE_URL` and using the browser-facing HTTP method.

That behaviour was protected by deterministic tests, but the tests used a fabricated provider URL. They proved the application's assumed transport shape, not the target ADHD Life OS NoCodeBackend contract.

The reusable provider evidence available to the project shows that generated NoCodeBackend data APIs can use operation-specific routes, an `Instance` query parameter, and provider methods that differ from the application's same-origin method. It also states that browser authentication cookies should not be forwarded to the generated data API without provider evidence.

The target ADHD Life OS instance is not currently accessible through a connected authenticated tool, so its generated data API cannot yet be certified directly.

## Decision

Separate the stable application data contract from the physical NoCodeBackend contract.

1. Browser and repository code retain the current application-owned list/get/create/update/delete routes.
2. `api/ncb/dataProviderContract.js` becomes the explicit physical provider-operation registry.
3. The production registry remains `UNVERIFIED` until target-instance evidence exists.
4. An unverified operation fails closed with `NCB_PROVIDER_CONTRACT_UNVERIFIED`; the server never falls back to the application path/method as an assumed provider path/method.
5. `api/ncb/dataProvider.js` owns physical URL/method construction, server-owned `Instance`, provider credentials and provider request headers.
6. Generated data requests do not receive browser auth cookies, Origin, Referer or an application correlation header unless future target-provider evidence explicitly requires one.
7. Authentication/session verification remains a separate auth-provider call used to establish application ownership before a verified data operation.
8. Deterministic tests may inject a clearly labelled verified fixture contract to prove adapter behaviour, but fixture routes are not provider evidence.

## Options considered

### A. Keep mirroring application paths to the provider

Rejected. This preserves an unverified transport assumption and allows tests to create false confidence.

### B. Hardcode the route family seen in another NoCodeBackend project

Rejected. Reusable provider evidence is useful for certification but does not prove the generated contract for the ADHD Life OS instance.

### C. Explicit provider registry with fail-closed default — Selected

Preserves the application API while preventing provider assumptions from becoming runtime behaviour.

## Consequences

### Positive

- provider-specific paths and methods are isolated from UI/repository code;
- target-instance evidence has one durable home;
- an application PATCH can later map to a provider PUT without changing browser callers;
- `NOCODEBACKEND_INSTANCE` becomes a server-owned part of generated data requests;
- auth cookies remain confined to the auth/session boundary;
- tests distinguish an application contract from provider certification.

### Trade-offs / risks

- remote data operations intentionally fail closed until the target provider contract is certified;
- target-instance access is now an explicit prerequisite for restoring connected data operation;
- each provider operation must be individually recorded before it can be enabled.

These trade-offs are preferable to presenting unverified persistence as functional.

## Implementation constraints

- Do not mark the registry VERIFIED from documentation examples or another project instance.
- Do not expose physical provider paths to browser code.
- Do not add a generic arbitrary-path proxy.
- Do not forward the browser session cookie to generated data endpoints by default.
- Keep ownership derived from the authenticated server-side session.
- Validate provider responses before returning domain data.
- Update `docs/NOCODEBACKEND_OPERATIONS.md` whenever physical provider evidence changes.

## Follow-up

1. Obtain authenticated access to the target ADHD Life OS NoCodeBackend instance.
2. Capture target generated API/Swagger evidence.
3. Certify existing collection reads and required writes.
4. Populate only verified operations in `api/ncb/dataProviderContract.js`.
5. Then certify and activate the new `execution-sessions` capability.

## Related

- `api/ncb/handler.js`
- `api/ncb/dataProvider.js`
- `api/ncb/dataProviderContract.js`
- `docs/NOCODEBACKEND_OPERATIONS.md`
- `docs/NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md`
- `STATUS.md`
