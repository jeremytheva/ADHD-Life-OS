# Route-level code splitting

Date: 2026-08-21

## Context

The Vite 8 production build emitted two related performance warnings:

- the primary JavaScript bundle was approximately 815 kB minified (~200 kB gzip), above Vite's 500 kB warning threshold;
- `inboxService` dynamically imported `taskService` even though `taskService` was already statically imported elsewhere, so the dynamic import could not create a separate chunk.

`src/App.jsx` statically imported every authenticated feature page, which meant users downloaded Tasks, Routines, Projects, Housework, Inbox, and Settings code before navigating to those routes.

## Decision

Keep the Today route eager because it is the authenticated landing experience. Lazy-load secondary authenticated routes with `React.lazy` and `Suspense` using the existing loading screen as the route fallback.

Make the Inbox-to-Task dependency explicit with a normal static import. Route-level splitting, rather than a service-level dynamic import that is defeated elsewhere in the graph, owns the feature loading boundary.

## Validation

The change must preserve the blocking repository pipeline, including the critical-path Playwright tests. The production build output will be used to verify that the initial JavaScript payload is split into route chunks and that the ineffective dynamic-import warning is removed.

## Follow-up

If a shared vendor/application chunk remains above the warning threshold after route splitting, investigate dependency-level/manual chunking separately rather than coupling it to this behavioural change.
