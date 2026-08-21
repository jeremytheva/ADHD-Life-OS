# Testing and Validation

## Required commands

Use the canonical validation command before opening a pull request:

```bash
npm run validate
```

It runs the required checks in order:

```text
lint -> typecheck -> tests -> production build
```

The individual commands remain available when diagnosing a specific failure:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Use `npm ci` to install the exact lockfile-defined dependencies. `npm run build` now performs only the production Vite build; `npm run validate` is the authoritative complete validation command.

GitHub Actions runs `npm run validate` for pull requests targeting `main`, pushes to `main`, and manual workflow dispatches so the default branch is continuously checked after merge as well as before merge. The workflow also performs a moderate-or-higher dependency audit, installs Chromium, and runs the critical-path Playwright suite.

## Coverage types

Tests use Node's built-in `node:test` runner and live in `test/`. `npm test` runs the complete checked-in suite. Do not call a real NoCodeBackend environment or use real credentials in tests.

- **Unit and behavioural coverage** executes application logic with controlled fakes. Use it for state transitions, such as session verification retries, authentication events, and loading saved onboarding preferences. These tests should assert observable inputs and outputs rather than implementation details.
- **Contract coverage** keeps lightweight checks around boundaries and architecture that are expensive to exercise end-to-end, including proxy allowlists, request/response validation, canonical persistence paths, and route-loading boundaries. Contract tests complement, rather than replace, behavioural tests.
- **Component coverage** renders React in a browser-like environment and interacts through accessible controls. Add a component test utility only when a user interaction, effect lifecycle, focus behavior, or rendered error state cannot be covered meaningfully by unit/behavioural tests. Keep component tests focused; retain Node tests for pure logic and proxy contracts.
- **Browser end-to-end coverage** uses Playwright/Chromium to prove the critical authenticated user journey against controlled same-origin NCB HTTP responses without weakening the server-side NoCodeBackend trust boundary.

When a change affects more than one category, add the smallest useful coverage at each relevant layer. For example, a new authentication error state should have a deterministic state-transition test; add a component interaction test when the visible retry control itself changes.

## Route-loading regression coverage

`test/route-code-splitting.test.mjs` protects the application loading boundary: Today remains eager as the authenticated landing route, while Tasks, Routines, Projects, Housework, Inbox, and Settings remain route-level lazy imports. It also prevents reintroducing the ineffective dynamic `taskService` import in `inboxService`.

## Proxy contract coverage

For handler changes, cover rejected routes/methods/origins, malformed or oversized payloads, upstream request shaping, response validation, error codes/statuses, cookies as applicable, and correlation IDs. The proxy is a security boundary, not merely a transport helper.

## Manual checks

For UI changes, exercise keyboard navigation, labels, focus, responsive layout, reduced motion, contrast, and the relevant low-stimulation experience. Include a screenshot for perceptible application changes in the pull request.
