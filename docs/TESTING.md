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

Use narrower commands when diagnosing or certifying a specific boundary:

```bash
npm run validate:governance
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run validate
npm run certify:ncb-read -- --collection=<collection>
npm run certify:execution-sessions -- --mode=read
```

`npm run validate` remains the application static/unit/build subset. `npm run platform:validate` is the canonical full repository gate. Provider certification commands are separate connected-evidence tools and are not automatically run by CI because they require target-provider access and server credentials.

## Evidence boundaries

A passing `platform:validate` means only that its declared automated checks passed. It does not by itself prove:

- a NoCodeBackend capability exists in the real target instance;
- a test-only provider contract matches the target generated API;
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
- unverified provider operation;
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

External provider capability is tracked separately from adapter code:

| Capability | Code implemented | Provider verified | Application verified |
| --- | --- | --- | --- |
| Auth application boundary | Yes | Deployment/target evidence still required for release | Deterministic application tests |
| Stable data application boundary | Yes | N/A — application-owned contract | Deterministic application tests |
| Physical NoCodeBackend data operations | Fail-closed registry/adapter + read certification tooling implemented | **No — target contract pending** | No connected-provider verification |
| Generic `execution-sessions` | Certification tooling only | No | No |

`api/ncb/dataProviderContract.js` is intentionally UNVERIFIED in production. Tests must not change that registry merely to exercise physical mapping.

## Provider-adapter contract coverage

`test/ncb-data-provider-contract.test.mjs` and `test/ncb-handler-contract.test.mjs` protect the separation between application and provider contracts.

Required coverage includes:

- production data operations fail before any provider call while the physical contract is unverified;
- missing `NOCODEBACKEND_INSTANCE` or other required server configuration fails closed;
- a clearly labelled test-only contract can map stable application operations to different provider paths/methods;
- `Instance` is server-owned and cannot be supplied by the browser;
- the server-held Bearer credential is applied to generated data requests;
- browser auth cookies, Origin, Referer and application correlation headers are not forwarded to generated data calls by default;
- an unexpected generated-data `Set-Cookie` is not relayed to the browser;
- session-derived ownership still rejects cross-user requests before a data provider request;
- malformed 2xx provider records remain structured upstream-response errors.

These tests prove adapter and trust-boundary behaviour only. The paths in injected test contracts are fixtures, not NoCodeBackend evidence.

## Read-only target-provider certification

`scripts/certify-ncb-read.mjs` turns the first provider-certification step into a deterministic connected check without writing provider data.

Run it only with an exact URL taken from the target instance's generated API/Swagger:

```bash
NOCODEBACKEND_SECRET_KEY='<server secret>' \
NOCODEBACKEND_INSTANCE='<target instance>' \
NOCODEBACKEND_CERT_READ_URL='<exact generated read URL including Instance>' \
npm run certify:ncb-read -- --collection=tasks
```

Optionally set `NOCODEBACKEND_CERT_USER_ID` and include the exact same `user_id` filter in the supplied URL to verify ownership filtering.

The command verifies:

- the URL contains the configured target instance;
- only the Bearer credential and JSON `Accept` header are sent;
- the provider returns a successful JSON array or `data` array envelope;
- every returned record satisfies the selected application domain schema;
- returned ownership matches the certification user when that check is enabled.

Its output deliberately redacts query values and secrets. A pass establishes evidence for the exact exercised read/list operation only; it does not automatically alter the production provider registry or claim application/runtime verification.

Regression coverage for this harness lives in `test/ncb-provider-read-certification.test.mjs` and must remain credential-free.

## Target-provider certification

Before a physical operation is marked VERIFIED in `api/ncb/dataProviderContract.js`, capture the target-instance evidence described in `NOCODEBACKEND_OPERATIONS.md`.

At minimum verify:

- generated path/template;
- provider HTTP method;
- required `Instance`/query behaviour;
- required headers;
- request body where applicable;
- success envelope;
- filtering used by the application;
- representative failure behaviour.

Create/update/delete must not inherit route/method assumptions from another NoCodeBackend instance. Generic execution-session capability must not advance until both the general physical operation contract and the `execution-sessions` collection contract are certified.

## Proxy contract coverage

For `api/ncb/` changes, cover rejected routes/methods/origins, malformed/oversized payloads, canonical server configuration, provider-contract state, session-derived ownership, provider request mapping, response validation, safe error translation, auth-cookie handling where applicable and correlation IDs.

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
