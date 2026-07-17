# Testing and Validation

## Required commands

Run these commands before opening a pull request:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Use `npm ci` to install the exact lockfile-defined dependencies. `npm run build` includes linting, but it remains a separate required CI step so failures are easy to identify.

## Coverage types

Tests use Node's built-in `node:test` runner and live in `test/`. `npm test` runs the complete checked-in suite, and pull-request validation runs that exact command after linting and type-checking. Do not call a real NoCodeBackend environment or use real credentials in tests.

- **Unit and behavioural coverage** executes application logic with controlled fakes. Use it for state transitions, such as session verification retries, authentication events, and loading saved onboarding preferences. These tests should assert observable inputs and outputs rather than implementation details.
- **Contract coverage** keeps lightweight checks around boundaries and architecture that are expensive to exercise end-to-end, including proxy allowlists, request/response validation, and canonical persistence paths. Contract tests complement, rather than replace, behavioural tests.
- **Component coverage** renders React in a browser-like environment and interacts through accessible controls. Add a component test utility only when a user interaction, effect lifecycle, focus behavior, or rendered error state cannot be covered meaningfully by unit/behavioural tests. Keep component tests focused; retain Node tests for pure logic and proxy contracts.

When a change affects more than one category, add the smallest useful coverage at each relevant layer. For example, a new authentication error state should have a deterministic state-transition test; add a component interaction test when the visible retry control itself changes.

## Proxy contract coverage

For handler changes, cover rejected routes/methods/origins, malformed or oversized payloads, upstream request shaping, response validation, error codes/statuses, cookies as applicable, and correlation IDs. The proxy is a security boundary, not merely a transport helper.

## Manual checks

For UI changes, exercise keyboard navigation, labels, focus, responsive layout, reduced motion, contrast, and the relevant low-stimulation experience. Include a screenshot for perceptible application changes in the pull request.
