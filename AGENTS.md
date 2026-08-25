# Repository Guidance for Agents

## Scope and workflow

- Keep changes small, reviewable, and within the issue or pull request scope. Do not mix refactors, dependency upgrades, generated output, or unrelated formatting with a focused change.
- Read the relevant implementation, tests, and documentation before editing. Preserve the existing React, JavaScript, and TypeScript conventions.
- Update documentation and tests when a user-visible behavior, API contract, validation rule, security boundary, or contributor workflow changes.
- Do not commit secrets, real credentials, `.env` files, production data, or generated `dist/` output. Use placeholders in examples.
- Run `npm run validate` before declaring implementation complete. Use the individual lint, typecheck, test, and build commands when isolating a failure.

## React and Vite

- This is a React 18 application built and served with Vite. Keep browser code under `src/`; use the existing Vite aliases and scripts rather than adding another build tool.
- Prefer functional components and hooks. Keep components focused, use accessible native controls and labels, and preserve low-stimulation, keyboard-friendly interactions.
- Do not access secrets or server-only environment variables from `src/`. `VITE_*` values are exposed to the browser.
- Keep runtime validation at boundaries. Browser form data and proxy responses use the Zod schemas in `src/domains/schemas.js`; update the schemas and their contract tests when changing persisted record shapes.

## npm and validation

- The committed `package-lock.json` is authoritative. In CI and reproducible local installs, use `npm ci`; use `npm install` only when intentionally changing dependencies and commit the resulting lockfile.
- Do not hand-edit `package-lock.json`. Avoid dependency changes unless they are required and reviewed for security and compatibility.
- The canonical required check is `npm run validate`, which runs lint, typecheck, tests, and the production build in order. The individual commands remain `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

## NoCodeBackend proxy and security

- All NoCodeBackend traffic must go through the same-origin, allowlisted handlers in `api/ncb/`. Do not add a generic path proxy, expose `NOCODEBACKEND_SECRET_KEY`, or send backend credentials from the browser.
- The canonical server/runtime environment contract is exactly `NOCODEBACKEND_AUTH_BASE_URL`, `NOCODEBACKEND_DATA_BASE_URL`, `NOCODEBACKEND_SECRET_KEY`, and `NOCODEBACKEND_INSTANCE`. Do not introduce or restore `NCB_*` aliases.
- The canonical provider bases are `https://app.nocodebackend.com/api/user-auth` for authentication and `https://api.nocodebackend.com/` for generated data APIs unless a deployment explicitly supplies equivalent provider endpoints.
- Browser configuration may use only the proxy URL variables (`VITE_AUTH_PROXY_URL` and `VITE_DATA_PROXY_URL`).
- Preserve route allowlists, method allowlists, request-size limits, origin/CSRF checks, request and response validation, upstream timeouts, and structured error/correlation-ID behavior. Add or update handler contract tests for changes to this trust boundary.
- The application-owned data API is provider-agnostic. Translate its GET/POST/PATCH/DELETE collection contract to verified NoCodeBackend generated `read/create/update/delete` routes inside the server boundary rather than leaking provider paths into browser code.
- Never log authorization headers, cookies, passwords, secrets, or personally identifiable user content. Treat upstream responses as untrusted until validated.

## Tests and pull requests

- Add focused `node:test` coverage in `test/` for behavior and contracts. Tests must be deterministic and must not require real NoCodeBackend credentials or network access.
- Add browser end-to-end coverage only through a reviewed, lockfile-backed test dependency and keep the critical authenticated journey deterministic.
- Use GitHub Issue Forms and the pull request template. Explain behavior, risk, validation, and documentation changes in pull requests.
- Before requesting review, inspect `git diff --check` and `git status --short`; commit only intentional files.
