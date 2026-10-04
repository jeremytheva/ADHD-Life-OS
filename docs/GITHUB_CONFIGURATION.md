# GitHub Configuration

**Last reconciled:** 5 October 2026

## Evidence boundary

GitHub owns live repository, pull-request, review and merge state. Repository files describe the adopted operating contract but do not establish external GitHub settings by themselves.

Fresh connected evidence on 5 October 2026 confirms:

- default branch: `main`;
- pull requests: enabled;
- GitHub Issues: disabled;
- merge commits, squash merges and rebase merges: enabled;
- repository auto-merge setting: disabled;
- update-branch support: disabled;
- the connected account has repository administrator access.

The currently connected GitHub interface does **not** expose branch-protection/ruleset or repository Actions-administration settings. The latest retained administrative evidence from 28 September 2026 reported no `main` branch protection/ruleset. Treat that as dated evidence, not a fresh claim. Reverify those settings through an administrative surface when available.

Connector/account authorization and a workflow run's `GITHUB_TOKEN` permissions are separate facts. A connector write failure does not prove a workflow-token restriction, and a workflow-token restriction does not prove the connected account lacks repository access.

## Adopted pull-request policy

Ordinary autonomous work follows:

```text
IMPLEMENTING → VALIDATING → READY → MERGEABLE → MERGED
```

`BLOCKED` is an overlay, not a replacement lifecycle. Native GitHub Draft is exceptional and reserved for deliberately incomplete or non-reviewable work. Pending validation alone is not a Draft reason.

Direct authorised repository operations are the primary autonomous write path. Workflow labels, readiness dispatch and merged-branch cleanup are optional supporting automation; failure to update advisory metadata must not manufacture a project failure or prevent an otherwise authorised evidence-based merge.

## Semantic evidence

`lifecycle:implementation-complete` records that the implementation contract has been audited and no known in-scope implementation work remains. `lifecycle:validation-complete` records sufficient project-owned validation for the exact current head.

A successful canonical `Application validation` run may supply the validation-complete signal. Trusted alternate validation may also justify it when hosted CI is unavailable or failing only for infrastructure reasons. Any new commit invalidates stale completion/validation evidence.

READY requires current implementation and validation evidence. MERGEABLE additionally requires resolved material findings/review conversations, a current conflict-free head, no material blocker, and any applicable provider/deployment/runtime evidence required by the change.

Repository merge proves integration only. It does not imply deployed, runtime verified, provider verified, production verified or project complete.

## Application validation workflow

`.github/workflows/pull-request-validation.yml` runs the repository-owned `npm run platform:validate` contract for pull requests targeting `main`, pushes to `main`, and manual dispatches.

The workflow defaults top-level permissions to none. Its validation job receives only `contents: read` and `pull-requests: read`; it checks out the candidate, installs the locked dependency graph and Chromium, and executes the canonical repository gate.

Hosted CI is supporting execution/diagnostic evidence unless an active repository protection explicitly makes a check mandatory. A substantive defect found by any check still blocks acceptance. An empty/zero-step wrapper or infrastructure-only failure is unavailable execution evidence, not an application failure.

## Lifecycle metadata workflow

`.github/workflows/pr-lifecycle.yml` uses `pull_request` for ordinary PR metadata and trusted `workflow_run` events to observe canonical validation. It does not use `pull_request_target` to obtain write permissions and it does not check out or execute PR-controlled code in write-capable metadata jobs.

Permissions are scoped per job. Label synchronisation is best-effort:

- label creation/add/remove refusal produces a warning rather than project-validation failure;
- replacement state is added before older state labels are removed;
- failed replacement preserves the existing useful lifecycle state;
- same-repository write capability may enrich metadata, while forks or Dependabot/read-only tokens are allowed to remain without optional labels;
- validation evidence remains project-owned even when the metadata workflow cannot write it;
- readiness dispatch failure does not block direct authorised repository operations.

## Merge finalizer

`.github/workflows/pr-merge-finalizer.yml` is optional supporting automation triggered by `pr-lifecycle-ready`. Responsibility and authority are separated by job:

- **gate:** read-only exact-head, base-freshness, semantic-label, review-thread and mergeability checks;
- **mark-mergeable:** advisory `state:mergeable` metadata using issue-label write permission only;
- **merge:** exact-head guarded merge with `expectedHeadOid` and only the write permissions required to merge;
- **mark-merged:** advisory terminal metadata;
- **cleanup:** best-effort branch deletion after merge.

Branch cleanup re-reads the merged PR and only attempts deletion for a same-repository source branch that differs from both the base and default `main` branch. If cleanup cannot be performed, the branch is preserved and the workflow warns.

The finalizer intentionally does not treat aggregate `mergeStateStatus` or optional metadata jobs as independent acceptance gates. GitHub still enforces any active repository protection when the merge mutation is attempted.

## Implementation contract

GitHub Issues are currently disabled, so the focused pull-request body is the repository implementation-contract fallback. It should record one observable outcome, scope/exclusions, acceptance evidence, validation, security/data/accessibility implications, affected documentation and parked follow-up work.

If Issues are enabled later, an issue may become the primary implementation contract and the PR should link it rather than duplicate the full history.

## External administration to reverify

When an administrative surface is available, recheck:

1. `main` branch protection/rulesets and bypass policy;
2. repository Actions permission defaults and fork/Dependabot workflow restrictions;
3. conversation-resolution/review requirements;
4. whether issue tracking should be enabled;
5. whether update-branch or native auto-merge is desired.

Do not broaden workflow write permissions or weaken repository protection merely to make advisory labels or cleanup succeed.

## Branch/review rule

Before repository merge:

- implementation-complete evidence must still match the current head;
- sufficient project-owned validation must match the current head;
- material review findings/conversations must be resolved;
- the branch must be current with `main` and conflict-free;
- applicable provider, migration, deployment and runtime evidence must be satisfied for the change;
- `STATUS.md` must describe the truthful post-merge re-entry point;
- optional lifecycle labels or branch cleanup must not be mistaken for acceptance evidence.
