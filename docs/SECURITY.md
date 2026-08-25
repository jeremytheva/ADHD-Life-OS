# Security Guide

## Reporting

Report suspected vulnerabilities privately through the repository's GitHub security advisory flow. Do not open a public issue with exploit details, credentials, cookies, or user data.

## Secrets and configuration

The canonical server/runtime NoCodeBackend contract is:

- `NOCODEBACKEND_AUTH_BASE_URL`
- `NOCODEBACKEND_DATA_BASE_URL`
- `NOCODEBACKEND_SECRET_KEY`
- `NOCODEBACKEND_INSTANCE`

These values are server/runtime-only. Never restore deprecated `NCB_*` aliases, prefix a secret with `VITE_`, commit `.env` files, or include real values in screenshots, logs, issues, or pull requests. Values prefixed `VITE_` are bundled for the browser and are not secret.

The expected provider bases are `https://app.nocodebackend.com/api/user-auth` for authentication and `https://api.nocodebackend.com/` for generated data APIs. Environment overrides must remain server-side and use equivalent trusted provider endpoints.

## NoCodeBackend trust boundary

The NoCodeBackend handler is deliberately an explicit application contract rather than a generic proxy. It enforces route/method allowlists, same-origin checks for state-changing cookie requests, JSON and body-size restrictions, Zod request validation, upstream timeouts, constrained error statuses, and validated data responses. It forwards only required credentials and approved headers, while preserving correlation IDs for support.

Browser data operations remain application-owned. Inside the server trust boundary, collection GET/POST/PATCH/DELETE operations are translated to the verified NoCodeBackend generated `read/create/update/delete` route families. `NOCODEBACKEND_INSTANCE` is injected server-side and is not accepted as arbitrary browser routing input.

Every data request first resolves the user from the configured NoCodeBackend authentication service using the incoming session cookie and server-held credential. A missing, rejected, or malformed session is denied; the browser's cached user is never an ownership authority. The handler rejects client-supplied `user_id` values that differ from the verified session identity, supplies the verified identity when it is omitted, and attaches that identity to list and item requests.

NoCodeBackend deployments must therefore guarantee that session retrieval validates the supplied session cookie and returns the authenticated user object with a stable `id`. Generated data endpoints must honor ownership filters/checks for reads and writes. The proxy's filter is defense in depth, not a replacement for upstream authorization.

## Change checklist

1. Do not weaken route, method, origin/CSRF, body-limit, timeout, or schema validation without a documented threat-model review.
2. Keep authentication/data configuration and Bearer credentials server-side.
3. Do not log secrets, authorization headers, cookies, passwords, or sensitive user content.
4. Add contract tests for a changed proxy route, generated-provider mapping, or validation rule.
5. Verify data routes derive ownership from a trusted session and cannot use a browser-supplied identity.
6. Keep `execution-sessions` disabled until its provider schema and generated API are verified.
7. Use `npm ci` for the lockfile-defined dependency graph and review dependency changes deliberately.
