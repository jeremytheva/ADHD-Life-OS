# Today Failure Propagation and Reconciliation

**Date:** 2026-08-22

## Decision

`timelineService.getTimeline()` must propagate retrieval and scheduling failures to its caller. It must not translate those failures into an empty `{ blocks: [], unscheduledTasks: [] }` schedule.

An empty schedule is a valid user state. A failed schedule load is an unavailable-data state. Conflating the two can tell the user they have nothing scheduled when the platform actually failed to retrieve tasks, routines, projects, chores, preferences, or scheduling inputs.

## UI contract

- `TodayView` renders a retryable `LoadErrorState` when timeline generation fails.
- The last operation is not presented as an empty day.
- Task completion from Today is serialized while persistence is active.
- A failed completion is explicitly unconfirmed and safe to retry.
- A successful completion followed by failed Today refresh is described as reconciliation failure so the user does not repeat an already-persisted completion.
- Timeline task action buttons expose accessible names and pending state.

## Verification

The Playwright NoCodeBackend mock supports a one-shot task retrieval failure. The Today recovery scenario triggers that dependency failure through `activityService`, verifies that Today shows an unavailable-data state, retries, and verifies that the Today surface recovers.

## Scope

No scheduling algorithm, activity mapping, NoCodeBackend schema, route, authentication behavior, or persisted data contract is intentionally changed.
