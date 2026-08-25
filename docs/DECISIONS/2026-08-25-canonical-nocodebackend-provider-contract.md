# Canonical NoCodeBackend provider contract

Date: 2026-08-25  
Status: Accepted

## Context

The repository previously used `NCB_API_BASE_URL` and `NCB_SECRET_KEY` and constructed both authentication and domain-data requests from one combined upstream base. That model did not represent the current provider integration contract, which separates authentication and generated data APIs and requires an explicit instance identifier.

The browser-facing application API should remain stable and provider-agnostic. React components and repositories should not need to know NoCodeBackend generated route families.

## Decision

1. The canonical server/runtime environment contract is exactly:
   - `NOCODEBACKEND_AUTH_BASE_URL`
   - `NOCODEBACKEND_DATA_BASE_URL`
   - `NOCODEBACKEND_SECRET_KEY`
   - `NOCODEBACKEND_INSTANCE`
2. Deprecated `NCB_*` environment aliases are not supported.
3. Authentication and data provider bases are configured independently.
4. The browser continues to call the same-origin application-owned `/api/ncb/auth` and `/api/ncb/data` contracts.
5. Inside the server trust boundary, application data operations are translated to NoCodeBackend generated route families:
   - collection GET -> `read/{collection}`;
   - collection POST -> `create/{collection}`;
   - item PATCH -> `update/{collection}/{id}` using provider PUT;
   - item DELETE -> `delete/{collection}/{id}`;
   - item GET -> filtered `read/{collection}` with the item identifier.
6. `NOCODEBACKEND_INSTANCE` is injected by the server on generated data requests.
7. Ownership, CSRF, body-size, timeout, schema validation, response validation, safe error and correlation-ID protections remain application-owned and are not delegated to browser code.
8. `execution-sessions` remains outside the collection allowlist until its target-instance schema and generated API are verified.

## Consequences

- Provider-specific URL and method semantics are isolated in `api/ncb/providerContract.js`.
- Existing browser services/repositories retain a stable API contract.
- Development and deployed server environments must provide all four canonical variables.
- A deployment using the old `NCB_*` variables will fail closed with `NCB_SERVICE_UNAVAILABLE` until its environment is migrated.
- Live target-instance verification remains required before claiming the migrated provider contract is production-certified.
