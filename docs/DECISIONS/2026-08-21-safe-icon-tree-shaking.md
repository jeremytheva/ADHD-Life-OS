# SafeIcon must remain tree-shakeable

## Context

The production build remained split into two relatively large shared JavaScript chunks after route-level code splitting. `src/common/SafeIcon.jsx` imported the entire `react-icons/fi` namespace and dynamically resolved icons by string name. Dynamic namespace lookup prevents the bundler from proving which Feather icons are unused, so the complete icon set can be retained in shared application code.

Repository callers already pass concrete icon components to `SafeIcon` through the `icon` prop.

## Decision

`SafeIcon` accepts explicit icon components only and imports only its fallback `FiAlertTriangle` icon. Name-based dynamic lookup is removed.

A source-contract test scans application source for `SafeIcon` callers using a `name` prop and fails validation if that legacy pattern is reintroduced.

## Consequences

- Feather icons can be tree-shaken according to actual imports.
- The shared application bundle should no longer retain the complete icon namespace solely for `SafeIcon`.
- New callers must import the required icon and pass it through `icon={...}`.
- A missing/undefined icon still renders the existing alert-triangle fallback.
