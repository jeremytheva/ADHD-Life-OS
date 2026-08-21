# Project Detail Recovery Semantics

Date: 2026-08-22
Status: Accepted

## Context

The Projects overview now distinguishes load failures from genuine empty data and surfaces failed project mutations. `ProjectDetailView` still used console-only errors for detail refreshes and task/subtask writes. This created three integrity risks:

1. A failed detail refresh could leave stale data on screen without telling the user.
2. A failed task/subtask mutation could appear to do nothing with no recovery guidance.
3. Completion celebrations could be shown even when the application could not confirm refreshed persisted state after the write.

## Decision

`ProjectDetailView` must treat write failure and post-write reconciliation failure as different states.

- Initial/detail refresh failures keep the last known project snapshot visible, mark it as potentially stale, and provide an explicit retry action.
- Failed writes preserve the relevant form/item context and provide user-visible operation feedback.
- If a write succeeds but the subsequent project refresh fails, the UI reports partial success and tells the user that the persisted change may already exist.
- Completion celebrations are shown only after both the write and the subsequent project-detail refresh succeed.
- The normal empty-task state is suppressed while the current detail snapshot is known to be stale.

## Consequences

This avoids false success messaging and distinguishes uncertain reconciliation from confirmed write failure. It also gives users a safe recovery path without changing service contracts, backend schemas, routes, or persisted data models.
