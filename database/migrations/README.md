# Provider Migration Packages

Create a directory here only for a real provider/schema transition.

Use:

```text
database/migrations/<migration-name>/
├── migration-plan.md
├── before.json
├── after.json
├── backfill-plan.md
└── verification.md
```

For irreversible or production-impacting transitions, the package must establish before owner approval:

- the change and affected provider resources;
- existing-data scope;
- current and proposed schema/provider representation;
- constraint and uniqueness changes;
- backup/snapshot evidence;
- restore/recovery evidence;
- backfill algorithm and restartability;
- duplicate/conflict handling;
- dry-run results where possible;
- rollback or roll-forward path;
- post-migration verification;
- the exact irreversible operation;
- the owner approval required.

Migration history is append-only evidence. Do not rewrite a completed migration package to make later provider state look as though it always existed.

No migration is currently active. Generic `execution-sessions` remains pre-provisioning / provider-unverified.
