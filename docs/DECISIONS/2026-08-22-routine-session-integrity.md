# Routine session integrity and recovery

Date: 2026-08-22
Status: Accepted

## Context

Routine execution persists session initialization, step completion/skipping, final completion, and cancellation through separate service operations. Previously, failures were logged only to the console. Initialization failure could render no visible recovery UI, failed step writes could leave the user uncertain whether the routine advanced, and failed final completion had no explicit retry state.

## Decision

1. Routine session initialization failure remains visible and retryable; no empty/null UI is used as a failure state.
2. Step complete/skip actions are serialized with an action-pending guard to prevent duplicate writes.
3. Failed complete/skip operations explicitly state that the step was not advanced.
4. Final routine completion only closes the modal and triggers the completion callback after persistence succeeds.
5. Failed final completion leaves the session open and exposes an explicit retry action.
6. Failed cancellation leaves the session active and visible.
7. The elapsed step timer updates once per second while a step is active and is cleaned up on step change/unmount.

## Consequences

- Routine execution no longer silently disappears on initialization failure.
- Duplicate step writes from repeated clicks are prevented.
- Completion success UI is tied to confirmed persistence.
- Users can recover from final-completion and cancellation failures without losing session context.
