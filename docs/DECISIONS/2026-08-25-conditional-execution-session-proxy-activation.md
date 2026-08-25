# Conditional Execution-Session Proxy Activation

**Status:** Accepted  
**Date:** 2026-08-25

## Context

The execution-session repository, runtime, recovery policy, and UI composition are prepared but intentionally disabled until live NoCodeBackend certification succeeds. A post-certification change should not require editing route allowlists and validation maps independently because partial activation could expose an unvalidated provider path.

## Decision

The server proxy derives its data collection allowlist and request/response schemas from one `proxyCollectionContracts` object.

`execution-sessions` is included only when `providerCapabilities.executionSessions === true`. When enabled, its route visibility, response schema, create schema, and patch schema are added together as one capability. When disabled, none of those contracts are present.

The production capability remains `false` until live target-instance certification is complete.

## Consequences

- proxy route activation and Zod contract activation cannot drift independently;
- existing collections continue to use the established global domain schemas;
- execution-session create/patch rules retain their stricter dedicated contracts;
- the live application remains fail-closed today;
- post-certification cut-over is reduced to a small explicit capability change plus certified provider evidence and validation.

## Stacked-test correction

Earlier preactivation coverage asserted that the production repository registry contained no `executionSessions` entry. That became stale once the central capability registry intentionally exposed `repositories.executionSessions` as `null` while disabled. The regression assertion now checks the actual invariant: the capability is false, the repository is capability-gated, and the live proxy contract omits `execution-sessions`.
