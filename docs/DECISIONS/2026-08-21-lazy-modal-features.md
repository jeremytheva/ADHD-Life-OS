# Lazy-load modal-only application features

## Context

Route-level code splitting reduced the previous ~815 kB monolithic JavaScript bundle to shared chunks of roughly 325 kB and 306 kB plus small route chunks. Several optional features were still imported eagerly by authenticated surfaces even though they render only after a user opens a modal.

`Layout` eagerly imported Mode Preferences, Accessibility Settings, Gamification Dashboard, and Reward Shop. `TodayView` also eagerly imported Gamification Dashboard.

## Decision

Load these modal-only features with `React.lazy` and render them inside a `Suspense` boundary only when requested. Keep the sidebar controls and Today landing experience eager.

The suspense fallback is an accessible modal-style loading state so the interaction has visible feedback while a feature chunk loads.

## Consequences

- Modal implementations are excluded from first-paint JavaScript when the bundler can isolate them.
- Opening one of these features may incur a one-time chunk request.
- Route URLs, persistence, authentication, and service behavior are unchanged.
- Source-contract tests protect the lazy import boundary.
