# Execution-session application contract before provider activation

Date: 2026-08-25  
Status: Accepted

## Context

Stage 3 now has a provider contract and certification harness for generic execution sessions, but the target NoCodeBackend `execution-sessions` table has not yet been certified. The application still benefits from defining its exact validation and repository shape before live activation, provided that doing so cannot expose an unsupported runtime path.

## Decision

1. Define strict execution-session response, create, and patch schemas before provider activation.
2. Generic execution-session activity types are `task`, `project_task`, and `chore`; `routine_step` remains owned by the existing routine-session lifecycle.
3. New sessions may only be created as `in_progress`.
4. Patch input may change only lifecycle status/timestamps; ownership, activity identity, source identity, parent identity, and `title_snapshot` are immutable through the generic patch contract.
5. Prepare a dedicated `executionSessionRepository` implementing `list`, `get`, `create`, and `update` with request/response validation.
6. Do not export that repository through the production repository registry yet.
7. Do not add `execution-sessions` to the server proxy collection allowlist yet.
8. Automated tests must enforce both non-activation conditions.
9. Provider certification remains the gate for adding the collection to the proxy, composing the production session service/runtime, and exposing durable Today controls.

## Consequences

- The application contract can be reviewed and tested independently of provider setup.
- Provider certification can compare the real response shape directly against a pre-existing strict application contract.
- Accidental production activation before certification fails closed at the proxy boundary.
- Routine execution cannot accidentally migrate into the generic session model.

## Activation criteria

Activation requires captured evidence that the target provider supports the documented execution-session read/create/update cycle and returns records compatible with the strict application schema. Any mismatch must update the provider contract and application schema deliberately before the allowlist is changed.
