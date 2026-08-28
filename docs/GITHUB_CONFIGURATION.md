# GitHub Configuration

## Repository capabilities

Current repository evidence shows:

- default branch: `main`;
- pull requests: enabled;
- GitHub Issues: disabled;
- GitHub Projects: disabled;
- squash, merge-commit and rebase merge methods: available;
- repository auto-merge setting: disabled;
- `main` branch protection: not independently enforced by a repository ruleset;
- repository rulesets: none;
- update-branch support: disabled.

These are external GitHub settings and must not be inferred from repository files. Workflow automation improves the normal delivery path but is not a substitute for branch protection/rulesets against administrator or direct-push bypass.

## Canonical pull-request lifecycle

Repository implementation work follows:

```text
DRAFT → IMPLEMENTING → VALIDATING → READY → MERGEABLE → MERGED
```

The lifecycle combines native GitHub PR state, lifecycle labels, read-only application validation and two trusted default-branch workflows with separate responsibilities.

| Lifecycle state | Repository evidence |
| --- | --- |
| DRAFT | Native GitHub draft PR. New implementation PRs are created as Draft. |
| IMPLEMENTING | `state:implementing`; implementation/audit is not yet declared complete. |
| VALIDATING | `state:validating`; current-head `Application validation` is missing, running or failed. |
| READY | `state:ready`; `lifecycle:implementation-complete` is present and validation passed for the exact current head. |
| MERGEABLE | `state:mergeable`; the finalizer re-confirmed exact-head validation, review/thread state, base freshness and GitHub conflict-free mergeability. |
| MERGED | PR merged using an expected-head guard; `state:merged` records the terminal repository state. |

### Implementation-complete signal

`lifecycle:implementation-complete` is the explicit semantic handoff from implementation to repository enforcement. It may be added only after the implementing agent/project has:

1. audited each in-scope acceptance criterion;
2. completed required implementation and regression coverage;
3. updated PR evidence and affected project state;
4. confirmed there is no known in-scope implementation work remaining.

Any new commit removes this signal automatically. Passing CI alone must never promote incomplete work.

## Readiness controller

`.github/workflows/pr-lifecycle.yml` runs from trusted default-branch workflow code using `pull_request_target` and `workflow_run`. It does not check out or execute pull-request code with its write-capable token.

It owns:

- enforcing Draft status for newly opened/reopened implementation PRs;
- invalidating `lifecycle:implementation-complete` after any new commit;
- preventing manual Ready transitions from bypassing implementation-complete evidence;
- requiring successful `Application validation` for the exact current head;
- moving a qualifying PR to `state:ready`;
- dispatching `pr-lifecycle-ready` with the PR number and exact head SHA for separate merge finalization.

It deliberately stops at READY. It does not call the merge API and therefore does not make its own pending workflow check a prerequisite for completion.

## Merge finalizer

`.github/workflows/pr-merge-finalizer.yml` is triggered by the trusted `pr-lifecycle-ready` repository dispatch. It independently re-reads the live PR and does not rely on dispatch payload alone.

Before MERGEABLE/MERGED it must re-confirm:

- the PR is still open against `main`;
- the dispatch head still equals the current PR head;
- `lifecycle:implementation-complete` is still present;
- `Application validation` succeeded for that exact head;
- no required review decision or unresolved review thread blocks merge;
- the PR branch is not behind current `main`;
- GitHub reports the head as conflict-free/mergeable.

The finalizer intentionally does **not** require aggregate `mergeStateStatus == CLEAN`. A write-capable finalizer is itself a pending workflow while it runs, so using aggregate pending-check state as its own prerequisite creates a circular dependency. Instead, mandatory evidence is checked explicitly and GitHub still enforces any configured repository protections when the guarded merge mutation is attempted.

When all observable gates pass, the finalizer:

1. records `state:mergeable`;
2. merges using GraphQL `expectedHeadOid` so a moved head cannot merge from stale evidence;
3. records `state:merged`;
4. attempts to delete a same-repository source branch after successful merge.

## Pull-request implementation contract

GitHub Issues are currently disabled, so `.github/pull_request_template.md` is the implementation-contract surface until that external setting changes. Each implementation PR should record one observable outcome, scope/exclusions, acceptance evidence, validation, security/data/accessibility implications, documentation changes and parked follow-up work.

If Issues are enabled later, issues should become the normal implementation contracts and PRs should link them using `Closes #<issue-number>` rather than duplicating the full issue body.

## Continuous integration

`.github/workflows/pull-request-validation.yml` runs for pull requests targeting `main`, pushes to `main`, and manual dispatches. It checks out the repository, uses Node.js 24, installs the locked dependency graph and Chromium, then runs:

```bash
npm run platform:validate
```

`platform:validate` includes dependency audit, executable governance validation, zero-warning lint, typecheck, Node tests, production build and critical Playwright coverage.

A successful CI run is repository-validation evidence only. Provider contracts, deployment configuration, exact deployed commit and runtime behaviour require separate evidence.

## External GitHub settings still required

1. **Protect `main` with branch protection or an equivalent ruleset.** Require pull requests and the `Validate application` check; prevent ordinary direct pushes/bypass except narrowly defined recovery administration. Do not make the lifecycle/finalizer workflow itself a required check because that would recreate a circular merge dependency.
2. **Enable GitHub Issues** if issue-level implementation contracts are preferred over the current focused-PR fallback.
3. **Enable repository auto-merge** only if native GitHub auto-merge is later preferred over the guarded finalizer mutation.
4. **Enable update-branch support or equivalent up-to-date enforcement** if GitHub should refresh stale PR branches automatically. Until then, `blocked:base-update` prevents automated merge when a PR is behind `main`.

Branch protection/rulesets remain the highest-priority external configuration gap because workflow automation cannot prohibit every administrator/direct-push bypass.

## Branch/review rule

Before repository merge:

- implementation-complete evidence must still match the current head;
- canonical validation must have passed for the exact current head;
- required review findings/conversations must be resolved;
- the head must be conflict-free and current with `main`;
- affected project state must describe the post-merge re-entry point rather than leaving a closed PR as the active checkpoint;
- no provider/deployment/release gate may be bypassed by describing repository integration as production completion.
