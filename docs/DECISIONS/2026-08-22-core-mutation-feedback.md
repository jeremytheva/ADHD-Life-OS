# Core mutation failure feedback

Date: 2026-08-22

## Decision

Core workflow write failures must be visible to the user and must not imply that an operation succeeded when persistence failed.

Projects and Housework now reuse the shared `OperationErrorState` introduced for Routines. Project create/update failures keep their forms open, quick-capture/template failures keep their modal context available, and failed delete/archive operations leave the visible project state unchanged until a confirmed refresh succeeds. Housework complete/snooze failures leave the chore and due date unchanged and display recovery guidance.

## Rationale

Console-only errors create false success states and force users to reconstruct unsaved work. Preserving the current interaction context reduces data-loss risk and cognitive load while keeping service and persistence contracts unchanged.

## Scope

This decision governs user-facing recovery behavior only. It does not change NoCodeBackend contracts, authentication, persisted schemas, or optimistic-update policy elsewhere in the application.
