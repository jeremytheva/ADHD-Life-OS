# Testing and Validation

## Canonical validation entry point

Use the full project validation command before review/completion:

```bash
npm run platform:validate
```

It composes the repository's declared checks:

```text
dependency audit
  → executable governance validation
  → lint
  → typecheck
  → Node unit/behaviour/contract tests
  → production build
  → critical-path Playwright tests
```

The governance check verifies high-value mechanical rules including required project documents, canonical NoCodeBackend environment names, removal of deprecated provider aliases, current execution-gate fields in `STATUS.md`, and obvious browser exposure of the server-only secret name.

Use narrower commands when diagnosing a failure:

```bash
npm run validate:governance
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run validate
```

`npm run validate` remains the application static/unit/build subset. `npm run platform:validate` is the canonical full repository gate.

## Evidence boundaries

A passing `platform:validate` means only that its declared automated checks passed. It does not by itself prove:

- a NoCodeBackend capability exists in the real target instance;
- production environment configuration is correct;
- a migration/backfill was applied;
- a merged commit is deployed;
- a deployment is runtime healthy;
- a user journey works against production providers.

Use explicit evidence states such as **IMPLEMENTED**, **PROVIDER VERIFIED**, **APPLICATION VERIFIED**, **DEPLOYED**, **RUNTIME VERIFIED**, and **COMPLETE** rather than treating them as interchangeable.

## CI

GitHub Actions runs `npm run platform:validate` for pull requests targeting `main`, pushes to `main`, and manual workflow dispatches. CI installs the locked dependency graph and Chromium before running the canonical command.

Required CI failures should block merge until diagnosed at root cause. Do not repeatedly rerun a failure without determining whether it is code, test, configuration, environment or provider related.

## Coverage types

Tests use Node's built-in `node:test` runner in `test/`, plus Playwright in `e2e/`. Automated repository tests must not require real production credentials or mutable production data.

- **Static/governance coverage** protects project/document/config/architecture conventions that can be expressed mechanically.
- **Unit/behavioural coverage** tests domain rules, state transitions, validation, mapping and error translation with controlled inputs.
- **Integration/contract coverage** tests connected application boundaries such as proxy request shaping, session/ownership behaviour and provider-response validation without claiming live-provider verification.
- **Browser end-to-end coverage** proves critical user journeys across the real application layers using controlled same-origin responses.
- **Connected provider/runtime verification** is separate release evidence when the capability depends on an external system.

Use the smallest useful coverage at each relevant layer rather than relying on E2E tests alone.

## Regression rule

When fixing a meaningful defect, add regression coverage where practical for the class of failure. A manual retest alone is insufficient for recurring or critical behaviour unless automation is genuinely impractical and the limitation is documented.

## Failure-path validation

Critical paths should test applicable failures, including:

- missing/invalid configuration;
- unauthenticated or unauthorised access;
- ownership mismatch;
- invalid input;
- upstream/provider failure;
- malformed upstream success;
- timeout/conflict;
- stale or missing related records;
- partial success and retry/reconciliation.

## Authentication and authorization

A successful sign-in acknowledgement without a valid session is not successful auth. Validate session retrieval and protected behaviour where auth changes.

Authorization evidence should cover unauthenticated denial, ownership/permission denial, valid owner access, protected-field rejection and browser-supplied identity/role spoofing where relevant. Client-side visibility is not authorization evidence.

## Provider capability evidence

External provider capability should be tracked separately:

| Capability | Code implemented | Provider verified | Application verified |
| --- | --- | --- | --- |
| Existing NoCodeBackend auth/data proxy | Yes | Project-dependent/current provider evidence required for release | Contract-tested locally |
| Generic `execution-sessions` | Certification tooling only | No | No |

The generic execution-session capability must not advance until real provider certification passes.

## Proxy contract coverage

For `api/ncb/` changes, cover rejected routes/methods/origins, malformed/oversized payloads, canonical server configuration, session-derived ownership, upstream request shaping, response validation, safe error translation, cookies where applicable and correlation IDs.

## Release/runtime validation

Before a production-ready claim, verify the applicable combination of:

- provider contract;
- configuration/environment;
- migration/data state;
- exact deployment commit;
- deployment success/readiness;
- runtime logs;
- representative smoke/end-to-end flow;
- security/error paths;
- rollback/roll-forward approach.

The connected Vercel account currently has no ADHD Life OS project binding, so production deployment/runtime evidence is not currently available.

## Accessibility and browser checks

For perceptible UI changes, validate relevant keyboard use, focus, labels, semantic structure, contrast, error association, responsive behaviour and reduced motion. Use representative supported browser/device coverage proportional to risk.
