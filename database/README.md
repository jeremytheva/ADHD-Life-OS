# Database / Provider Schema Controls

ADHD Life OS uses NoCodeBackend rather than an application-owned SQL database.

Authority is intentionally separated:

- `docs/DATA_MODEL.md` — canonical application/domain model.
- `provider-schema.json` — machine-readable target-provider schema evidence.
- `docs/NOCODEBACKEND_OPERATIONS.md` — human-readable physical operation and certification evidence.
- `migrations/` — controlled provider/schema transition packages.

`provider-schema.json` must remain `UNVERIFIED` until evidence from the real ADHD Life OS NoCodeBackend target instance is captured. Do not populate it from application assumptions, another project, test fixtures, or generic provider documentation.

No `schema.sql` is authoritative for this repository. If a SQL export is ever added for reference, it must be clearly labelled reference-only unless NoCodeBackend actually exposes it as the executable schema for this project.

Provider/schema changes must update the domain model, provider evidence, migration package where applicable, validation and material project status together.
