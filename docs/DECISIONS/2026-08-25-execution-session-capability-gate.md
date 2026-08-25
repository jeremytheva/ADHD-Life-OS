# Execution-session capability gate

**Status:** Accepted  
**Date:** 25 August 2026

## Context

The Stage 3 execution-session schema, repository and runtime contracts are prepared, but the target NoCodeBackend `execution-sessions` table has not yet been certified against its generated read/create/update API.

Application code therefore needs one explicit activation boundary rather than scattered comments or ad hoc checks.

## Decision

Use `src/config/providerCapabilities.js` as the central application capability registry.

`executionSessions` remains `false` until live target-instance certification is complete.

While false:

- `repositories.executionSessions` is `null`;
- the server proxy continues to reject `execution-sessions` because it is absent from the collection allowlist;
- the fail-closed execution runtime remains unavailable in production;
- recommendation-only behaviour continues normally.

After certification, activation must be performed as one reviewed change that:

1. flips `executionSessions` to `true`;
2. adds the certified execution-session schema to the server proxy contract;
3. adds `execution-sessions` to the explicit collection allowlist;
4. verifies ownership and response-envelope tests;
5. composes the production execution runtime;
6. adds browser lifecycle coverage.

## Rationale

A single capability flag reduces the risk of partial activation, where a repository or UI becomes available before the server/provider contract is ready. It also makes the current disabled state executable and testable rather than relying on documentation alone.

## Consequences

- The prepared repository is discoverable in the production registry but is `null` while disabled.
- The server remains the final trust/activation boundary.
- Live certification remains mandatory; the flag is not itself evidence that the provider is ready.
