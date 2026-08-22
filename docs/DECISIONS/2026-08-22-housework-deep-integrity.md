# Housework deep integrity

Date: 2026-08-22
Status: Accepted

## Decision

Housework completion and multi-chore setup must only present confirmed success after the corresponding write succeeds. User-entered checklist state must remain available after a failed completion. Multi-record setup must remove each confirmed persisted chore from the retry selection immediately so a later failure cannot make retry duplicate already-created chores.

A partial setup save may refresh the underlying checklist while leaving the setup modal open. Only the remaining unsaved templates stay selected.

## Consequences

- Chore detail completion failures are visible and retryable.
- Completion celebration is persistence-gated.
- Completion and close controls are serialized during persistence.
- Housework setup is duplicate-safe across mid-sequence failures.
- Partial setup success refreshes the checklist without discarding unsaved selections.
- This is application-level recovery; it does not introduce backend transactions.
