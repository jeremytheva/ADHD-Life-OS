# Canonical validation command

- **Status:** Superseded
- **Date:** 2026-08-21
- **Superseded by:** `2026-08-26-platform-validation-and-standards-inheritance.md`

## Decision

Use `npm run validate` as the canonical repository validation command. It runs linting, type checking, the Node test suite, and the production build in order. GitHub Actions runs the same command for pull requests targeting `main` and pushes to `main`.

## Context

The repository previously documented four separate required commands while `npm run build` also ran linting internally. This duplicated work and made it easier for local, Codex, and CI validation behavior to drift.

## Consequences at the time

- `npm run build` performs only the Vite production build.
- `npm run validate` became the application static/unit/build gate.
- Individual commands remain available for diagnosis.
- Browser end-to-end validation was initially separate.

## Supersession

The master Testing, Validation & Release Standard later established a canonical full repository entry point that also covers executable governance, dependency/security checks and critical browser validation. `npm run validate` remains a useful subset, while `npm run platform:validate` is now the canonical full gate.
