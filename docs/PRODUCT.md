# Product Overview

ADHD Life-OS is a low-stimulation life-management MVP for organizing tasks, routines, projects, inbox captures, timelines, housework, modes, and accessibility preferences. The product prioritizes supportive language, manageable next actions, and flexible daily structure rather than punitive overdue states.

## Current behavior

- Users can work with Today/day planning, tasks, projects, routines, housework, Brain Inbox, onboarding, modes, templates, progress/rewards, and accessibility experiences in the React application.
- Task prioritization supports metadata such as energy, duration, interest, aversiveness, and location to generate Quick Wins, Momentum Builders, and Brave Frog recommendations.
- The Today experience exposes the current timeline and next-action guidance; there is no separate user-facing Timeline module.
- Brain Inbox is implemented. It must not be labelled as a future or coming-soon capability.
- Authentication and domain data requests use explicit, same-origin NoCodeBackend proxy contracts. Failed domain-data requests return structured errors rather than silently replacing data with browser storage.
- Optional navigation modules are driven by saved onboarding preferences, while core navigation remains available.
- The in-app Features view is a product-status surface: active capabilities are presented as available now, while roadmap items are informational placeholders only.

## Planned capabilities and non-promises

The current roadmap supports placeholders for these inactive areas:

- durable Start / Pause / Continue / Recover focus sessions;
- external calendar and event synchronization;
- richer analytics and longitudinal insight;
- optional remote AI/LLM scheduling or coaching assistance;
- broader background automation;
- selected productivity-service integrations.

Planned capability cards must not behave like active controls, imply that an integration is connected, or promise a release date. Durable generic execution remains inactive until the real provider contract is certified. External integrations require explicit architecture, privacy, ownership and failure-semantics review before activation.

Habit Tracking is not part of the current committed/deferred roadmap and must not be presented as a promised coming-soon feature unless the roadmap is explicitly changed.

## Product principles

1. Reduce cognitive load with clear hierarchy and small next steps.
2. Preserve user agency through adjustable preferences and flexible workflows.
3. Use encouraging, non-shaming language.
4. Protect user data through minimal exposure and validated service boundaries.
5. Make accessibility and responsive interaction part of normal product quality.
6. Clearly distinguish implemented capability from roadmap intent.
