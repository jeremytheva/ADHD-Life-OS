# Delivery Guide

## Definition of done

A change is ready when it has a clear issue or pull request scope, focused tests for changed behavior, updated documentation where needed, and passing lint, type-check, test, and production-build commands. Perceptible web UI changes should include a screenshot in the pull request.

## Local delivery loop

1. Install the locked dependency graph with `npm ci`.
2. Start the application with `npm run dev`.
3. Make a small, reviewable change; do not commit `dist/`, `.env` files, or secrets.
4. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
5. Review `git diff --check` and `git status --short`, then use the pull request template to record scope, validation, risk, and rollout notes.

## Environments and configuration

The app uses Vite in development and deployment. Browser traffic uses the same-origin application routes `/api/ncb/data` and `/api/ncb/auth`.

The server/runtime environment must supply exactly:

```text
NOCODEBACKEND_AUTH_BASE_URL=https://app.nocodebackend.com/api/user-auth
NOCODEBACKEND_DATA_BASE_URL=https://api.nocodebackend.com/
NOCODEBACKEND_SECRET_KEY=<server-only secret>
NOCODEBACKEND_INSTANCE=<instance name>
```

Do not deploy `NCB_*` aliases. Browser code may configure only `VITE_DATA_PROXY_URL` and `VITE_AUTH_PROXY_URL`.

The server proxy translates the stable application data contract into NoCodeBackend generated `read/create/update/delete` routes and injects `Instance` and the Bearer credential. Provider route changes therefore belong in the server integration boundary, not in React components or repositories.

Before enabling a newly introduced provider collection, verify its generated API contract against the target NoCodeBackend instance and capture the expected request/response behaviour in repository tests. In particular, `execution-sessions` must remain disabled until its schema and create/read/update capabilities are verified.

## Release and rollback

Build with `npm run build` and deploy the generated `dist/` artifact through the hosting platform. Verify the application shell, authenticated session resolution, one representative generated data read, and one controlled write in the target environment without exposing credentials.

Roll back by redeploying the previously known-good artifact and restoring its matching environment contract if necessary. Do not attempt a browser-side fallback for failed domain-data requests.
