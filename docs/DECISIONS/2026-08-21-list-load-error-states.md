# Distinguish list load failures from genuine empty states

## Context

Several core ADHD Life OS lists caught initial backend failures, logged the exception, and then rendered their normal empty-state messaging. This could tell a user “No routines found” or “All caught up!” when the application had actually failed to retrieve persisted data.

For a personal operating system, an unavailable backend must not look like data loss or successful completion.

## Decision

Core list surfaces maintain an explicit load-error state separate from loading and empty data. Initial retrieval failures render a reusable accessible `LoadErrorState` with a user-safe explanation and a retry action.

The first implementation covers Routines and Housework. Additional domain lists should adopt the same pattern as they are hardened.

## Consequences

- Empty states are shown only after a successful retrieval returns no matching records.
- Retrieval failures provide a clear retry path without claiming persisted data was removed.
- Error details remain in diagnostics/console rather than being exposed directly to the user.
- The persisted schema and NoCodeBackend API contracts are unchanged.
