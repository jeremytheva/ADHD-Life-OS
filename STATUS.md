# ADHD Life OS — Current Status

**Snapshot date:** 28 August 2026  
**Last materially reviewed:** 28 August 2026  
**Default branch:** `main`  
**Last verified main implementation commit:** `5c1ed22` — PR #112, nested-safe Project Detail dialog  
**Overall status:** Active development / backend work intentionally deferred  
**Current phase/stage:** Stage 3 — execution and next-action experience

## Current objective

Continue product and repository improvements that are genuinely independent of unverified backend behaviour while additional NoCodeBackend information is gathered.

The Projects modal chain is now complete through keyboard entry, nested Task Form ownership and Project Detail parent restoration. The active accessibility rollout has moved to Routines, starting with the stable New/Edit Routine form before the more complex multi-state Routine Progress flow.

## AI execution gate

| Gate field | Current value |
| --- | --- |
| Current gate | CHANGE |
| Gate state | READY for backend-independent work |
| Backend/provider state | DEFERRED / UNVERIFIED |
| Current restriction | Do not introduce, infer or activate physical NoCodeBackend routes, methods, schemas or durable execution behaviour until provider work is explicitly resumed with real target evidence. |

## Re-entry checkpoint

| State | Current value |
| --- | --- |
| Current stage | Stage 3 — execution and next-action experience |
| Primary implementation thread | Frontend accessibility — core workflow modal rollout |
| Active application PR | PR #113 — `fix: make Routine Form an accessible dialog` |
| Last completed outcome | PR #112 merged — Project Detail now has stack-aware parent dialog ownership; nested Task Form Escape/focus behavior and ProjectCard focus restoration are browser-tested |
| Current blocker | None for backend-independent frontend work |
| Deferred dependency | NoCodeBackend/provider certification pending additional provider information |
| Next action | Validate PR #113, address any CI/review finding, and merge if clean |
| Next queued outcome | Continue the core overlay audit with Housework Setup / Chore Detail, while treating Routine Progress as a larger structural modal-state refactor rather than a simple hook attachment |

If this checkpoint conflicts with GitHub, deployment or later provider evidence, verify the authoritative source and update this file rather than reconstructing state from chat history.

## Completed

- Stage 2 core workflow integrity formally closed.
- Stage 3 unified recommendation policy, Today next-action experience and transient **Not now** feedback are merged.
- Cognitive-load/execution-continuity controls and master AI-platform standards are merged.
- `npm run platform:validate` is the canonical repository validation gate.
- Canonical `NOCODEBACKEND_*` configuration naming is merged.
- Fail-closed physical provider operation boundaries and provider-certification tooling are preserved for later use.
- PR #98 merged — isolated loader dependencies stabilized; warning count reduced to five.
- PR #99 merged — `TaskList` preference-first/task-loader dependencies corrected; warning count reduced to three.
- PR #100 merged — `RoutineProgress` lifecycle effects made dependency-safe; final-step automatic-completion race fixed; lint reached zero warnings.
- PR #101 merged — zero-warning lint is enforced by CI.
- PR #102 merged — responsive authenticated shell, phone-width navigation drawer, Escape/focus recovery and skip-to-content coverage.
- PR #104 merged — reusable `useModalDialog` contract introduced and applied to New/Edit Task.
- PR #105 merged — Accessibility Settings uses the shared dialog contract.
- PR #106 merged — Reward Shop uses the shared dialog contract.
- PR #107 merged — Your Progress uses the shared dialog contract and conditional hook activation.
- PR #108 merged — New/Edit Project uses the shared dialog contract with associated fields/grouped choices.
- PR #109 merged — Quick Capture uses the shared dialog contract with optional-panel state.
- PR #110 merged — Projects-specific Add/Edit Task uses the shared dialog contract.
- PR #111 merged — ProjectCard provides a semantic keyboard-operable Project Detail entry point.
- PR #112 merged — `useModalDialog` now supports top-most nested modal ownership; Project Detail uses semantic parent dialog ownership and full parent → child → parent → opener focus restoration is browser-tested.

## Active

### PR #113 — Routine Form dialog accessibility

Current branch: `fix/routine-form-dialog-accessibility`

In scope:

- expose New/Edit Routine as a labelled semantic modal dialog;
- reuse stack-aware `useModalDialog` for initial focus, containment, Escape and opener restoration;
- place initial focus on Name;
- associate Name, Description and Repeat Pattern labels with their controls;
- give repeated step-name/duration controls deterministic accessible names;
- label remove-step icon buttons;
- verify Routines → Add Routine → dynamic steps → Escape → Add Routine focus restoration in Playwright;
- keep routine/step persistence, Routine Progress, Routine Statistics, templates and provider/backend behaviour unchanged.

### Accessibility audit findings

The post-Projects audit identified remaining high-value modal surfaces in Routines and Housework.

- **Routine Form:** single stable dialog shell; clear semantic/label gaps; selected as the smallest core-workflow correction.
- **Routine Progress:** important but structurally larger because loading, load-error, finishing and active-step states render different overlay shells. A safe fix should establish one stable dialog ownership model rather than attaching a ref to a shell that is replaced across states.
- **Routine Statistics:** similar loading/content shell transition and therefore should be corrected deliberately rather than mechanically.
- **Housework Setup:** single stable shell and a strong next candidate, but Escape/close must preserve its existing `saving` lockout.
- **Chore Detail:** single stable shell and strong candidate; Escape must preserve its existing completion/celebration lockout.
- Secondary Template and Mode overlays remain lower priority until core workflow surfaces are complete or explicitly parked.

## Backend / provider work — intentionally deferred

**State:** PROVIDER UNVERIFIED / TEMPORARILY DEFERRED.

Required provider evidence remains preserved in repository documentation. While deferred:

- keep fail-closed provider mappings in place;
- do not substitute another project's NoCodeBackend contract;
- do not use browser persistence as fake durable execution;
- do not claim durable cross-reload/cross-device execution recovery;
- do not let provider uncertainty block independent frontend, accessibility, testing or maintainability work.

## Known defects

No known application defect currently overrides the accessibility/interaction-integrity audit. Provider-backed operations unavailable without a verified physical contract remain intentional fail-closed behaviour.

## Technical debt / quality state

- ESLint is clean and CI enforces **0 warnings**.
- Mixed JavaScript/TypeScript checking remains an accepted current constraint.
- Responsive shell/navigation coverage is merged for desktop and phone-width paths.
- The shared modal/focus contract is verified across Task Form, Accessibility Settings, Reward Shop, Your Progress, Project Form, Quick Capture, Projects Task Form and nested-safe Project Detail.
- Routine Form is active in PR #113; remaining Routines/Housework overlays are audited but not yet production-corrected.
- Production deployment is not configured or verified for ADHD Life OS in the connected Vercel account.
- `src/domain/` and `src/domains/` naming overlap remains an architectural hygiene observation only.

## Partial / planned preserved work

- Closed Stage 3 execution lifecycle/recovery branches remain design evidence only; they are not merged capability.
- Provider-certification and durable execution-session tooling remain available for later backend resumption.
- External calendar synchronization, remote AI/LLM assistance, richer analytics, broader background automation and additional productivity integrations remain deferred.

## Provider / deployment status

| System / capability | State | Evidence / implication |
| --- | --- | --- |
| GitHub repository | VERIFIED | `jeremytheva/ADHD-Life-OS`, default branch `main`; PR #112 merged as `5c1ed22` |
| Canonical validation | VERIFIED | Dependency audit + governance + zero-warning lint + typecheck + Node tests + production build + Playwright |
| Shared modal interaction contract | IMPLEMENTED / ROLLING OUT | Projects/global chain is verified; Routines and Housework core overlays are the current rollout |
| Stable application data API | APPLICATION VERIFIED | Same-origin routes and domain contracts remain deterministic application boundaries |
| Physical NoCodeBackend adapter | IMPLEMENTED / DEFERRED | Fail-closed registry/adapter is merged; production mapping remains unverified |
| Generic `execution-sessions` | IMPLEMENTED TOOLING / DEFERRED | Provider capability remains unverified |
| Vercel | NOT CONFIGURED / UNVERIFIED | No ADHD Life OS production project binding is currently established |

## Recent important decisions

- Human-in-the-loop does not mean human-in-every-loop; safe reversible choices are resolved automatically.
- Backend/provider work is intentionally paused until additional NoCodeBackend information is available.
- One primary implementation thread is maintained; discoveries outside active scope are parked.
- Zero lint warnings are a CI contract.
- Modal accessibility is being corrected through focused workflow-by-workflow rollout.
- Nested modal keyboard handling belongs to the top-most mounted modal; parent opener state survives child ownership.
- Multi-state overlays should receive a stable ownership design instead of a superficial per-render hook attachment.

## Next dependency-correct work

### While backend remains deferred

1. complete, validate and merge PR #113 Routine Form dialog accessibility;
2. take the smallest safe Housework core overlay correction, preserving write/celebration lockouts;
3. design and implement stable dialog ownership for Routine Progress / Routine Statistics rather than treating their changing shells as static modals;
4. close the current accessibility slice when high-value core interaction gaps are addressed or explicitly parked;
5. continue client-side cognitive-load reduction after that boundary;
6. preserve zero-warning lint and canonical validation.

### When backend work is resumed

Resume from existing provider evidence tooling: inspect target Swagger/OpenAPI, certify exact operations, record redacted evidence, enable only evidenced mappings, certify writes and `execution-sessions`, then implement durable execution recovery/reconciliation.

## Stage 3 exit conditions

Stage 3 remains open until the platform demonstrates authoritative execution policy, a clear next-action experience, reversible feedback, durable start/continue, interruption/recovery, source reconciliation, deterministic/browser tests and aligned documentation.

The temporary backend deferral does not remove or weaken these exit conditions.
