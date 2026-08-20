# Canonical validation command

- **Status:** Accepted
- **Date:** 2026-08-21

## Decision

Use `npm run validate` as the canonical repository validation command. It runs linting, type checking, the Node test suite, and the production build in order. GitHub Actions runs the same command for pull requests targeting `main` and pushes to `main`.

## Context

The repository previously documented four separate required commands while `npm run build` also ran linting internally. This duplicated work and made it easier for local, Codex, and CI validation behavior to drift.

## Consequences

- `npm run build` performs only the Vite production build.
- `npm run validate` is the complete release-quality local/CI gate.
- Individual commands remain available for diagnosis.
- Browser end-to-end validation remains a separate follow-on capability until its dependency and lockfile are added through a verified install.
