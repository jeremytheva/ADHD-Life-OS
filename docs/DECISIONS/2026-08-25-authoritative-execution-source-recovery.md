# Authoritative execution-source recovery

Date: 2026-08-25  
Status: Accepted

## Context

A persisted generic execution session can survive while its underlying task, project task, or chore changes independently. The execution layer therefore needs a trusted way to reload the current source and decide whether Continue or Complete is still valid.

## Decision

1. Recovered generic execution sessions resolve their authoritative source through an injected source resolver keyed by `activity_type` and canonical source identifiers.
2. The resolver supports `task`, `project_task`, and `chore` only. Routine steps remain owned by the existing routine-session lifecycle.
3. Resolver handlers own provider/domain loading and return a canonical Activity or `null` when the source no longer exists.
4. A recovery service composes source loading with `assessExecutionSourceRecovery(...)`.
5. Source-loading failure fails closed: Continue and Complete remain unavailable and the execution session is left unchanged for retry.
6. A missing source, source identity mismatch, completed-elsewhere source, archived source, or cancelled source must never be treated as recoverable active work.
7. A source completed elsewhere routes to execution reconciliation rather than duplicate source completion.
8. Terminal execution sessions do not reload their source because no continuation action is required.

## Consequences

- Today does not need to embed source-resolution or stale-state rules.
- Provider outages cannot make stale execution appear safely resumable.
- Cross-device or external completion cannot trigger duplicate completion writes through the execution layer.
- The same recovery policy can be reused by browser UI, diagnostics, and later replanning integration.
