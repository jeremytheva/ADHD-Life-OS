# GitHub Configuration

## Repository capabilities

Current repository evidence shows:

- default branch: `main`;
- pull requests: enabled;
- GitHub Issues: disabled;
- GitHub Projects: disabled;
- squash, merge-commit and rebase merge methods: available;
- repository auto-merge setting: disabled;
- `main` branch protection: disabled;
- repository rulesets: none;
- update-branch support: disabled.

These are real external GitHub settings and must not be inferred from repository files. Where a setting remains disabled, this document records it as an explicit configuration gap rather than claiming repository automation replaces it.

## Canonical pull-request lifecycle

Repository implementation work follows:

```text
DRAFT → IMPLEMENTING → VALIDATING → READY → MERGEABLE → MERGED
```

The lifecycle combines native GitHub PR state, labels, the read-only application-validation workflow and the privileged base-branch lifecycle controller.

| Lifecycle state | Repository evidence |
| --- | --- |
| DRAFT | Native GitHub draft PR. New implementation PRs are created as Draft. |
| IMPLEMENTING | `state:implementing`; implementation/audit is not yet declared complete. |
| VALIDATING | `state:validating`; current-head `Application validation` is missing, running or failed. |
| READY | `state:ready`; `lifecycle:implementation-complete` is present and validation passed for the exact current head. |
| MERGEABLE | `state:mergeable`; no blocking review state/thread, merge conflict or stale-base state remains and GitHub reports a clean merge. |
| MERGED | PR merged using an expected-head guard; `state:merged` records the terminal repository state. |

### Implementation-complete signal

`lifecycle:implementation-complete` is not a convenience label. It is the explicit evidence that the implementing agent/project has:

1. audited each in-scope acceptance criterion;
2. completed required implementation and regression coverage;
3. updated the PR evidence and affected project state;
4. confirmed there is no known in-scope implementation work remaining.

Any new commit removes this signal automatically. This prevents a validation pass from turning a partially implemented Draft PR into a merge candidate.

## Lifecycle controller

`.github/workflows/pr-lifecycle.yml` runs from trusted default-branch workflow code using `pull_request_target` and `workflow_run`. It does not check out or execute PR code with its write-capable token.

It is responsible for repository-enforceable transitions and guards:

- enforce Draft status for newly opened/reopened implementation PRs;
- invalidate `lifecycle:implementation-complete` after any new commit;
- prevent manual Ready transitions from bypassing the implementation-complete signal;
- require a successful `Application validation` run for the exact current head;
- inspect current review decision and unresolved review threads;
- detect GitHub merge conflicts and a base branch that is behind;
- require GitHub's merge state to be clean;
- merge only with GraphQL `expectedHeadOid` protection so a moved head cannot be merged from stale evidence;
- keep provider/deployment/runtime verification outside repository-merge claims.

The controller deliberately does not infer product acceptance from CI. The implementation-complete label is the project/agent handoff from implementation to automated repository enforcement.

## Pull-request implementation contract

GitHub Issues are currently disabled, so `.github/pull_request_template.md` is the normal implementation-contract surface until that external setting is changed. Each implementation PR must record:

- one observable outcome;
- in-scope and out-of-scope boundaries;
- acceptance-criterion evidence;
- actual validation performed;
- security/data/accessibility implications;
- documentation changes;
- parked follow-up work;
- provider/deployment limitations where applicable.

If GitHub Issues are enabled later, issues should become the normal implementation contracts and PRs should link them using `Closes #<issue-number>` rather than duplicating the full issue body.

## Continuous integration

`.github/workflows/pull-request-validation.yml` runs for pull requests targeting `main`, pushes to `main`, and manual dispatches. It:

1. checks out the repository;
2. uses Node.js 24;
3. installs the lockfile-defined dependency graph with `npm ci`;
4. installs Chromium for Playwright;
5. runs the canonical full repository gate:

```bash
npm run platform:validate
```

`platform:validate` includes dependency audit, executable governance validation, application lint/typecheck/tests/build and critical-path Playwright coverage.

A successful CI run is repository-validation evidence only. Provider contracts, deployment configuration, exact deployed commit and runtime behaviour require their own evidence.

## External GitHub settings still required

The workflow controller improves repository-managed delivery but cannot prevent every bypass while the following GitHub settings remain disabled:

1. **Enable branch protection or an equivalent ruleset for `main`.** Require pull requests and the `Validate application` check; prevent direct pushes/bypass except narrowly defined recovery administration.
2. **Enable GitHub Issues** if the project wants issue-level implementation contracts rather than the current PR-contract fallback.
3. **Enable repository auto-merge** if native GitHub auto-merge is preferred later. The current controller does not depend on this setting; it uses a guarded merge mutation after all repository-enforceable gates pass.
4. **Enable/update branch support or equivalent up-to-date-branch enforcement** if GitHub should update stale PR branches automatically. Until then, `blocked:base-update` deliberately prevents lifecycle auto-merge when the PR is behind `main`.

Branch protection/rulesets are the highest-priority external gap because workflow automation alone cannot prohibit an administrator or direct push from bypassing the PR path.

## Branch/review rule

Before merge:

- the implementation-complete signal must represent a current criterion audit;
- validation must have passed for the exact current head;
- required review findings/conversations must be resolved;
- the PR must remain cleanly mergeable against `main`;
- project state must be updated when delivery meaning changed;
- no external/provider/release gate may be bypassed by relabelling repository integration as production completion.
