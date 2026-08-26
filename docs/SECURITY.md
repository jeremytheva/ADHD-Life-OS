# Security Guide

## Reporting

Report suspected vulnerabilities privately through the repository's GitHub security advisory flow. Do not open a public issue with exploit details, credentials, cookies, or user data.

## Secrets and configuration

Canonical server/runtime NoCodeBackend configuration is:

```text
NOCODEBACKEND_AUTH_BASE_URL
NOCODEBACKEND_DATA_BASE_URL
NOCODEBACKEND_SECRET_KEY
NOCODEBACKEND_INSTANCE
```

`NOCODEBACKEND_SECRET_KEY` is server-only. Never prefix it with `VITE_`, commit real `.env` files, or include secret values in screenshots, logs, issues, pull requests or browser-delivered source. `VITE_*` values are bundled for the browser and must contain only browser-safe configuration such as same-origin proxy paths.

Do not create alternate short aliases for canonical provider configuration. A configured provider base URL is not proof of a physical collection route or method.

## NoCodeBackend trust boundary

The NoCodeBackend handler is deliberately an explicit **application** contract rather than a generic proxy. It enforces route/method allowlists, same-origin checks for state-changing cookie requests, JSON/body-size restrictions, Zod request validation, upstream timeouts, constrained error statuses, and validated data responses.

Physical generated-data behaviour is isolated behind `api/ncb/dataProvider.js` and `api/ncb/dataProviderContract.js`. The production provider registry remains fail-closed until target-instance evidence exists. The browser/application route must never be used as an implicit provider URL.

## Authentication and data separation

Authentication/session requests and generated data requests have different trust requirements.

For a protected application data operation:

1. the application route/query/body is validated;
2. the required provider operation/configuration must be verified;
3. the incoming session cookie is used only with the auth/session provider to resolve the user;
4. browser-supplied `user_id` is rejected when it differs from the verified identity;
5. the server adds/constrains the verified owner identity;
6. the data-provider adapter constructs the generated data request using server-only base, secret and `NOCODEBACKEND_INSTANCE`;
7. the generated data request receives only the server-owned provider headers declared by the adapter.

The generated data API does **not** receive the browser session cookie, Origin, Referer, or application correlation header by default. Future forwarding of any such value requires explicit target-provider evidence and a security review.

A `Set-Cookie` header returned unexpectedly by a generated data endpoint is not relayed to the browser. Session cookies are an auth-boundary concern.

## Ownership boundary

Every enabled data request must resolve the user through the server-side authentication path. A missing, rejected or malformed session is denied; the browser's cached user is never an ownership authority.

Provider-side ownership enforcement remains required where supported. The application proxy is a trust boundary and defence-in-depth layer, not evidence that the upstream provider enforces every invariant atomically.

## Provider-certification boundary

All target-instance generated data operations are currently provider-unverified and therefore fail closed. Evidence requirements are recorded in `NOCODEBACKEND_OPERATIONS.md`.

Generic durable `execution-sessions` has an additional collection-specific gate in `NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md`. Do not encode guessed routes, methods, envelopes, filtering or uniqueness semantics into production behaviour.

## Change checklist

1. Do not weaken route, method, origin/CSRF, body-limit, timeout or schema validation without a documented security review.
2. Keep authentication/data credentials and provider instance server-owned.
3. Do not log secrets, authorization headers, cookies, passwords or sensitive user content.
4. Keep physical provider paths/methods out of browser code.
5. Do not forward auth/browser headers to generated data operations without target-provider evidence.
6. Add deterministic contract tests for changed application/provider mapping behaviour.
7. Verify data routes derive ownership from a trusted session and cannot use browser-supplied identity as authority.
8. Verify each physical provider operation against the real target contract before activation.
9. Use `npm run platform:validate` before merge; treat connected provider/deployment/runtime verification as separate release evidence.
