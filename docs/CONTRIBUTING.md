# Contributing

## Start here

Before meaningful work, read `AGENTS.md`, `PROJECT.md`, `STATUS.md`, and the relevant `SYSTEM_MAP.md`, architecture, data-model and decision context. Confirm the current implementation thread before creating another branch or plan.

GitHub Issues are disabled for this repository. Use one focused pull-request body as the implementation contract when no issue exists, and keep unrelated discoveries parked as follow-up work.

## Development setup

```bash
npm ci
npm run dev
```

Use the lockfile-defined dependency graph. Live authentication/data interaction requires a configured NoCodeBackend environment; automated unit/contract tests do not require real provider credentials.

## Contribution expectations

- Keep one focused outcome per pull request.
- Use functional React components, accessible native interactions, and the established low-stimulation experience.
- Validate browser input and provider responses through existing domain/trust-boundary schemas rather than accepting arbitrary objects.
- Keep server credentials out of browser code and preserve the same-origin explicit NoCodeBackend proxy boundary.
- Use the canonical `NOCODEBACKEND_*` server configuration names documented in `.env.example`; do not introduce short aliases.
- Verify new provider behaviour against the real provider contract instead of inferring routes, methods, envelopes or capabilities.
- Add regression/contract coverage for changed behaviour and update only documentation whose meaning changed.
- Do not commit generated artifacts, hand-edited lockfiles, `.env` files, secrets or user data.

## Validation

Before requesting review, run:

```bash
npm run platform:validate
```

Use narrower commands only to diagnose failures. A passing repository validation does not prove live provider, deployment or production-runtime state; record those evidence states separately when relevant.

## Review expectations

Reviewers should verify that:

- the requested outcome and scope are clear;
- applicable project-entry/change/integration gates are evidenced;
- behaviour, code and documentation agree;
- tests cover changed contracts and failure paths;
- accessibility/security/data boundaries are not weakened;
- provider or deployment claims are supported by direct evidence;
- unrelated improvements remain separate rather than expanding the pull request.
