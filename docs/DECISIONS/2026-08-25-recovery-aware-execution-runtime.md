# Recovery-Aware Execution Runtime

**Status:** Accepted  
**Date:** 2026-08-25

## Context

A persisted execution session is not sufficient evidence that Continue or Complete remains safe. Its underlying task/project-task/chore may have been deleted, completed elsewhere, archived, cancelled, or changed between sessions.

## Decision

`executionRuntime.getState()` must assess the authoritative source of any recovered active/paused generic execution session before deriving controls.

Recovery states project into the UI as follows:

- recoverable source → normal active/paused controls;
- missing or closed source → block Continue/Complete and offer safe execution cancellation;
- source identity mismatch or source-load failure → block mutation and offer authoritative refresh;
- source completed elsewhere → do not invoke source completion again; instead complete/reconcile only the saved execution session, then replan.

The production runtime resolves the source through the canonical Activity graph so task, project-task, and chore semantics remain aligned with the execution engine.

## Reliability consequences

- recovered sessions cannot blindly resume against stale domain state;
- duplicate source completion is avoided when another device/workflow already completed the item;
- reconciliation remains explicit and produces immediate replanning after the execution session is closed;
- source-load failure fails closed and preserves the durable execution state;
- the logic remains provider-agnostic and can be tested before `execution-sessions` is activated.

## Provider impact

None. The execution-session provider capability remains disabled and the server proxy allowlist remains unchanged.
