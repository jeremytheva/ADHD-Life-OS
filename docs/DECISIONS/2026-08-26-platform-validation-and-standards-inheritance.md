# Adopt master standards by inheritance and use platform validation

**Date:** 2026-08-26  
**Status:** Accepted

## Context

The product owner supplied updated master AI-first development, project-documentation and testing/release standards. The repository already contained strong local delivery controls, but several gaps remained:

- project documents did not explicitly declare master-standard inheritance;
- `ROADMAP.md` and `SYSTEM_MAP.md` were absent;
- `STATUS.md` did not expose the current mandatory execution gate;
- `npm run validate` covered application checks but not executable governance, dependency audit and critical browser validation in one canonical entry point;
- NoCodeBackend server configuration still used project-specific short aliases instead of the canonical master naming family.

The repository should adopt the master rules without copying entire master documents into the project.

## Decision

1. Project documents inherit the supplied master standards and record only project-specific facts, constraints, deviations and implementation state.
2. `ROADMAP.md` and `SYSTEM_MAP.md` become durable project continuity documents.
3. `STATUS.md` exposes the current material execution gate, gate state and missing evidence.
4. `npm run platform:validate` becomes the canonical full repository validation command.
5. `npm run validate` remains the narrower application lint/typecheck/test/build subset for diagnosis and composition.
6. Executable governance checks enforce reliable mechanical rules such as required project-document presence, canonical provider configuration names and obvious secret-boundary violations.
7. NoCodeBackend runtime configuration uses the canonical `NOCODEBACKEND_*` naming family; alternate short aliases are removed because no deployed ADHD Life OS Vercel environment exists that requires a compatibility migration.
8. Provider/deployment/runtime evidence remains separate from repository validation and must not be inferred from a passing CI run.

## Options considered

### A. Copy master standards into this repository

Rejected. It would duplicate rules, create drift and violate the master documentation inheritance model.

### B. Keep current repository rules unchanged

Rejected. It would leave explicit master requirements unenforced and retain configuration/documentation divergence.

### C. Adopt by inheritance and automate high-value mechanical rules — Selected

Keeps project documentation concise while making important reusable rules executable.

## Rationale

This approach preserves the current architecture and project-specific delivery controls while reducing cross-session ambiguity and preventing future configuration/documentation drift. It also separates what CI can prove from provider/deployment evidence that requires direct external verification.

## Consequences

### Positive

- one obvious full validation entry point;
- master/project documentation responsibilities are clearer;
- continuation state is easier to recover;
- canonical provider naming is enforceable;
- ROADMAP and SYSTEM_MAP protect intended direction and change-location understanding;
- CI can detect a useful class of governance regressions automatically.

### Trade-offs / risks

- `platform:validate` is slower than the application-only subset because it includes dependency audit and Playwright;
- automation cannot prove subjective architecture intent, real provider capability, production configuration or runtime behaviour;
- project documents must continue to be maintained when their meaning changes.

## Evidence boundary

Repository automation may prove mechanical compliance and checked-in behaviour only. Direct provider/deployment/runtime evidence remains required for the release gate. In particular, a passing `platform:validate` must not change `PROVIDER UNVERIFIED`, `DEPLOYED`, or `RUNTIME VERIFIED` states without separate evidence from the relevant external system.

## Implementation constraints

- Do not make `platform:validate` imply production verification.
- Do not encode provider route/method/envelope assumptions into governance validation.
- Do not recreate deprecated NoCodeBackend aliases.
- Do not duplicate master-standard prose across project files; reference/inherit it and store only project-specific application.
- Preserve historical decision records and mark them Superseded rather than deleting them.

## Follow-up

- Run the new canonical validation in CI and resolve any failures at root cause.
- After merge, resume Stage 3 at the real NoCodeBackend `execution-sessions` provider-certification gate.
- When a Vercel project is eventually established, verify environment configuration, exact deployed commit and runtime behaviour before changing deployment state to VERIFIED.

## Related

- `PROJECT.md`
- `STATUS.md`
- `ROADMAP.md`
- `SYSTEM_MAP.md`
- `docs/TESTING.md`
- `docs/DELIVERY.md`
- `docs/DECISIONS/2026-08-21-validation-command.md`
