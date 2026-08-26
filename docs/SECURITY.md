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

Do not create alternate short aliases for canonical provider configuration. Exact upstream bases and provider contracts must be verified rather than inferred.

## NoCodeBackend trust boundary

The NoCodeBackend handler is deliberately an explicit contract rather than a generic proxy. It enforces route/method allowlists, same-origin checks for state-changing cookie requests, JSON/body-size restrictions, Zod request validation, upstream timeouts, constrained error statuses, and validated data responses. It forwards only required credentials and approved headers while preserving safe correlation IDs for support.

Every data request first resolves the user through the server-side authentication path using the incoming session cookie and server-held credential. A missing, rejected or malformed session is denied; the browser's cached user is never an ownership authority. The handler rejects client-supplied `user_id` values that differ from verified session identity, supplies verified identity when omitted, and constrains allowlisted reads/writes accordingly.

Provider-side ownership enforcement remains required. The application proxy is a trust boundary and defence-in-depth layer, not evidence that the upstream provider enforces every invariant automatically.

## Provider-certification boundary

Generic durable `execution-sessions` must remain disabled until the target NoCodeBackend instance and generated API are certified against `NOCODEBACKEND_EXECUTION_SESSION_CONTRACT.md`. Do not encode guessed routes, methods, envelopes, filtering or uniqueness semantics into production behaviour.

## Change checklist

1. Do not weaken route, method, origin/CSRF, body-limit, timeout or schema validation without a documented security review.
2. Keep authentication/data credentials server-only.
3. Do not log secrets, authorization headers, cookies, passwords or sensitive user content.
4. Add contract tests for changed proxy/configuration behaviour.
5. Verify data routes derive ownership from a trusted session and cannot use browser-supplied identity as authority.
6. Verify new provider behaviour against the real provider contract before activation.
7. Use `npm run platform:validate` before merge; treat deployment/provider/runtime verification as separate release evidence.
