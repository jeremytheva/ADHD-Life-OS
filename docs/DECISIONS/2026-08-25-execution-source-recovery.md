# Execution source recovery policy

Date: 2026-08-25  
Status: Accepted

## Context

A durable execution session may outlive or diverge from its source record. Between Start and a later Continue/Complete action, the source task, project task, chore, or other activity may be deleted, completed elsewhere, archived, cancelled, or replaced by stale client data.

Blindly resuming or completing the recovered session could create duplicate completion, mutate the wrong source, or report success against an unavailable source.

## Decision

Recovered generic execution sessions must be reconciled against authoritative source state before resume or completion is enabled.

The recovery policy distinguishes:

- `recoverable` — source identity is intact and source remains active;
- `source_missing` — source no longer exists;
- `source_mismatch` — loaded source identity does not match the persisted session;
- `source_completed_elsewhere` — source was already completed outside this session;
- `source_closed` — source is archived/cancelled or otherwise terminal;
- `none` — no active/paused execution requires recovery.

Missing, mismatched, externally completed, archived, or cancelled sources fail closed: resume and source completion are disabled until an explicit reconciliation/cancel path is chosen.

## Reliability rules

- Never complete the source again when it is already completed elsewhere.
- Never infer a new source identity from title text or display metadata.
- Preserve the execution session/history even when the source disappears.
- Use authoritative refresh before acting on an identity mismatch.
- Keep reconciliation actions separate from ordinary completion so partial-success semantics remain explicit.

## Follow-up

1. Compose this policy when provider-backed current-session recovery is activated.
2. Add source loading by canonical activity/source reference.
3. Extend the execution presentation contract with source-recovery states.
4. Add explicit reconciliation behaviour for `source_completed_elsewhere`.
5. Add Playwright coverage for deleted/completed-elsewhere source recovery.
