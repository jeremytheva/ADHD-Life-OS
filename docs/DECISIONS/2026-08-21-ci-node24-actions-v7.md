# CI runtime and GitHub Actions upgrade

Date: 2026-08-21

## Context

GitHub Actions emitted deprecation warnings because `actions/checkout@v4` and `actions/setup-node@v4` target an older Node action runtime. The application validation workflow also explicitly tested the repository on Node 20.

By August 2026, current major versions of both official actions are v7, and the project build toolchain (Vite 8) supports Node 24.

## Decision

- Upgrade `actions/checkout` from v4 to v7.
- Upgrade `actions/setup-node` from v4 to v7.
- Run repository validation on Node 24.
- Keep the existing npm lockfile cache, dependency audit, canonical validation, Chromium installation, and Playwright critical-path gate unchanged.

## Rationale

This removes deprecated action-runtime warnings and keeps the repository's tested Node runtime on a supported line without changing application behavior or production configuration.

## Validation

The upgraded workflow must successfully execute the same full gate on GitHub-hosted runners. Source-contract tests guard against accidental rollback to the deprecated action/runtime configuration.
