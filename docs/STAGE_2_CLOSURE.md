# Stage 2 Closure Register — Core Workflow Integrity

**Date:** 2026-08-22
**Status:** Complete

## Scope completed

Stage 2 establishes consistent failure, retry, reconciliation, partial-success, and destructive-action semantics across the platform's core persisted workflows.

### Today

- Timeline generation failures propagate to the UI instead of being converted into a false empty day.
- Timeline retrieval failures render an explicit retryable load state.
- Today task-completion writes are serialized.
- Failed completion remains explicitly unconfirmed and safe to retry.
- Successful completion followed by failed timeline reconciliation is reported as partial success rather than a failed write.
- Browser coverage deliberately injects a timeline dependency failure and verifies recovery through retry.

### Projects

- Overview load failures are distinct from an empty portfolio.
- Create/update/delete/archive failures are user-visible.
- Successful writes followed by failed refresh are identified as reconciliation failures.
- Project statistics are computed from the already-loaded graph rather than reloading the full graph per project.
- Project detail task/subtask operations preserve recovery state and gate celebration on confirmed reconciliation.
- Quick Capture is duplicate-safe after partial persistence.
- Project-template partial application is explicitly surfaced and not presented as safe to reapply.

### Brain Inbox

- Load failures are distinct from an empty inbox.
- Failed capture/edit/delete/category/conversion operations are visible.
- Failed capture/edit operations preserve entered text.

### Routines

- List create/update/delete/template failures preserve recovery context.
- Routine-session initialization is retryable.
- Complete/skip/cancel/final-complete operations are serialized and user-visible on failure.
- Session close/completion callbacks occur only after confirmed persistence.

### Housework

- List failures are distinct from an all-caught-up state.
- Complete/snooze failures preserve the existing chore state.
- Chore-detail completion preserves checklist progress after failure and gates celebration on confirmed persistence.
- Setup is duplicate-safe after partial multi-record creation.

### Tasks

- Preference/task retrieval failures are distinct from an empty task list.
- Create/template/complete/delete failures are user-visible.
- Create input is retained on failed persistence.
- Successful writes followed by failed list refresh are reported as reconciliation failures.
- Task deletion requires confirmation and task writes are serialized.
- Browser coverage deliberately injects failed task persistence and failed task retrieval to verify retry behavior.

## Cross-cutting controls

- Shared accessible load-error and operation-error components.
- Node 24 validation pipeline.
- Locked dependency installation and blocking moderate-or-higher dependency audit.
- Lint, typecheck, Node tests, Vite production build, Chromium installation and Playwright critical/failure-path coverage.
- Server-verified identity and NoCodeBackend trust boundary remain unchanged by Stage 2.

## Validation evidence

The Today closure correction passed the full repository validation pipeline on 2026-08-22, including locked dependency installation, zero-vulnerability audit, lint, typecheck, Node tests, production build, Chromium setup, and all four Playwright critical/failure-path scenarios. The exact final documentation commit remains subject to the same PR validation gate before merge.

## Deferred beyond Stage 2

These items are not blockers for core-workflow-integrity closure and belong to later delivery work:

- Production Vercel binding and live production smoke verification.
- Broader browser coverage for every domain-specific failure permutation.
- Stage 3 unified ADHD execution/replanning engine.
- External calendar and intelligence integrations.

## Closure outcome

Stage 2 Core Workflow Integrity is complete. Subsequent implementation should proceed under Stage 3 unless a regression reopens a Stage 2 acceptance criterion.
