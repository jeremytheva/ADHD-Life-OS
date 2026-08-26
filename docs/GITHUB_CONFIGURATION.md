# GitHub Configuration

## Repository capabilities

Current repository evidence shows:

- default branch: `main`;
- pull requests: enabled;
- GitHub Issues: disabled;
- GitHub Projects: disabled;
- squash, merge-commit and rebase merge methods: available;
- auto-merge: disabled.

Issue-form files may remain in `.github/ISSUE_TEMPLATE/` as reusable configuration, but they are not an active intake mechanism while repository Issues are disabled.

## Pull requests

`.github/pull_request_template.md` is the normal implementation-contract surface when no issue exists. Pull requests should record the outcome, contained scope, validation/evidence, security/data/accessibility impact, documentation changes, parked follow-up work and next action.

Keep one focused implementation outcome per pull request. Do not use a pull request's merge state as evidence of deployment or runtime verification.

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

## Branch/review rule

Before merge:

- resolve required CI/review findings at root cause;
- confirm the pull request remains within its implementation contract;
- update project state when delivery meaning changed;
- do not bypass an unsatisfied external/provider/release gate by relabelling work complete.
