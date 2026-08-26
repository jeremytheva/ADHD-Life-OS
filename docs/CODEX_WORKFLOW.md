# Codex Workflow

## Before editing

1. Read `AGENTS.md` and any more-specific `AGENTS.md` in the target directory tree.
2. Inspect the existing implementation, related tests, package scripts, documentation, accepted decisions, and current `STATUS.md` checkpoint.
3. Identify the current implementation contract and continue it when one exists instead of creating a replacement plan.
4. Define the smallest coherent scope and identify required checks before changing files.
5. Confirm whether the proposed work is the repository's primary active implementation thread or is explicitly parallel-safe.

## Continuation protocol

When asked to continue, do not treat the instruction as a new planning exercise. Resume in this order:

1. fix blocking review findings or failing required checks on the active pull request;
2. satisfy any remaining acceptance criteria in the active implementation contract;
3. finish remaining in-scope work on the active branch;
4. if no implementation is active, select the next dependency-ordered outcome recorded in `STATUS.md` or the repository control documents.

Do not ask the user to choose between implementation steps when repository evidence already determines the next safe action. Do not reopen accepted decisions or reproduce a roadmap merely because a new model/session is continuing the work.

## Decision escalation

Before asking for a human decision, determine whether the choice is already resolved by code, documentation, an accepted decision, established repository convention, or a safe reversible default.

### Proceed autonomously

Proceed and use the simplest coherent option when the choice is:

- low-risk and reversible;
- consistent with accepted architecture and product rules;
- an implementation detail with materially equivalent alternatives;
- a conventional default that preserves future configurability;
- recoverable without destructive migration or external commitment.

### Escalate

Escalate only when a genuinely unresolved choice materially affects:

- product purpose, scope, or user-facing policy;
- architecture that meaningfully constrains future work;
- destructive or irreversible data behaviour;
- authentication, authorisation, privacy, or security policy;
- external cost, commitment, provider dependency, or legal/compliance posture.

If work can safely continue around an unresolved consequential decision, park that decision explicitly and continue independent in-scope work rather than blocking everything.

## Implementation rules

- Make the minimum coherent change; do not mix cleanup or dependency upgrades with unrelated work.
- Maintain one primary implementation thread by default. Start parallel work only when dependency analysis shows it is genuinely independent and will not create avoidable conflicts in shared architecture, state, schema, routing, or trust-boundary code.
- Follow React/Vite conventions and use existing validation schemas and service boundaries.
- Treat `api/ncb/` as a security-sensitive trust boundary. Never expose secrets through Vite variables or introduce an unrestricted proxy.
- Add deterministic tests and documentation when changing visible behavior, data contracts, security behavior, or contributor workflows.
- When useful out-of-scope work is discovered, capture it as follow-up context and return to the current outcome. Discovery alone does not expand scope.
- Prefer root-cause corrections, but stop expanding once the agreed outcome is complete. Improvements beyond the acceptance criteria become new scope unless required to correct the root cause safely.

## Re-entry and state handoff

Before ending a material implementation session or after changing delivery state, make sure the durable repository state is sufficient for another model/session to resume without reconstructing chat history. `STATUS.md` should identify:

- current stage;
- current implementation thread or pull request;
- last completed outcome;
- current blocker;
- next action;
- next queued outcome after that action.

If GitHub state and `STATUS.md` disagree, verify GitHub and correct the stale document.

## Completion workflow

1. Review the implementation against every acceptance criterion and stop adding unrelated improvements once the definition of enough is met.
2. Run `git diff --check`.
3. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` (or the canonical `npm run validate` when appropriate).
4. For perceptible web UI changes, capture a screenshot after manual verification.
5. Review `git status --short`; commit only intended files with an imperative message.
6. Update affected documentation and the re-entry checkpoint when delivery state materially changes.
7. Open or update a pull request using the repository template and record scope, checks, risks, documentation, parked follow-up work, and the next action.
