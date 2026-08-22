# Project partial-success recovery

Date: 2026-08-22
Status: Accepted

## Context

Project workflows include multi-record writes that are not transactional at the UI/service layer. Quick Capture can create a project and then several tasks. Project templates can create a project, tasks, and subtasks sequentially. A failure after some writes have succeeded leaves persisted partial state.

Retrying the original operation without knowing what already persisted can duplicate projects, tasks, or subtasks. Separately, a successful write followed by a failed project-list refresh must not be reported as a failed write.

## Decision

1. Multi-record operations track confirmed persisted progress.
2. Quick Capture returns only unsaved items to the capture modal after a partial failure. Already-saved tasks are removed from the retry set.
3. The Quick Capture project identifier is retained locally so a refresh failure does not cause a duplicate Quick Capture project on retry.
4. Project template partial failures close the template picker, refresh/open the partially created project when possible, report the exact confirmed task/subtask counts, and explicitly warn against reapplying the template.
5. `loadProjects()` returns a boolean reconciliation result. Callers distinguish write failure from write success followed by refresh failure.
6. Successful writes with failed reconciliation are reported as already persisted; users are instructed to reload before repeating the same operation.

## Consequences

- Retry behavior avoids duplicating confirmed Quick Capture tasks.
- Template partial state is explicit rather than silently treated as all-or-nothing.
- Project overview mutations no longer misclassify post-write refresh failures as failed writes.
- This does not provide database transactions or rollback. True atomic multi-record writes would require backend transaction support.
