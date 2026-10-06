import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canonicalEnvironmentNames,
  validateBlockerOwnership,
  validateCollectionContract,
  validateEnvironmentContract,
  validateLifecycleWorkflow,
  validateRouteMap
} from '../scripts/governance-rules.mjs'

test('detects unsafe privileged pull_request_target lifecycle automation', () => {
  const failures = validateLifecycleWorkflow(`name: lifecycle
on:
  pull_request_target:
permissions:
  issues: write
jobs:
  metadata:
    runs-on: ubuntu-latest
`)
  assert.ok(failures.some((failure) => failure.includes('pull_request_target')))
  assert.ok(failures.some((failure) => failure.includes('top-level permissions')))
})

test('detects canonical NoCodeBackend environment drift', () => {
  const envExample = canonicalEnvironmentNames.slice(0, -1).map((name) => `${name}=example`).join('\n')
  const providerOperations = canonicalEnvironmentNames.join('\n')
  const failures = validateEnvironmentContract({ envExample, providerOperations })
  assert.ok(failures.some((failure) => failure.includes('NOCODEBACKEND_ADMIN_SECRET_KEY')))
})

test('detects current route-map drift', () => {
  const handler = `const ROUTES = Object.freeze({
    auth: [
      { path: ['sign-in', 'email'], query: emptyQuerySchema, methods: { POST: credentialsSchema } },
      { path: ['get-session'], query: emptyQuerySchema, methods: { GET: z.undefined() } }
    ],
    data: [
      { path: [collectionSchema], query: dataQuerySchema, methods: { GET: z.undefined(), POST: null } },
      { path: [collectionSchema, identifierSchema], query: dataQuerySchema, methods: { GET: z.undefined(), PATCH: null, DELETE: z.undefined() } }
    ]
  })`
  const systemMap = `<!-- ROUTE_MAP_START -->
- \`POST /api/ncb/auth/sign-in/email\`
- \`GET /api/ncb/auth/get-session\`
- \`GET /api/ncb/data/<collection>\`
- \`POST /api/ncb/data/<collection>\`
- \`GET /api/ncb/data/<collection>/<id>\`
- \`PATCH /api/ncb/data/<collection>/<id>\`
<!-- ROUTE_MAP_END -->`
  const failures = validateRouteMap({ handler, systemMap })
  assert.equal(failures.length, 1)
  assert.match(failures[0], /disagree/)
})

test('detects collection drift between code and data model', () => {
  const handler = "const COLLECTIONS = ['tasks', 'projects']"
  const schemas = 'export const domainSchemasByCollection = Object.freeze({ tasks: taskSchema, projects: projectSchema })'
  const dataModel = `## 3. Current logical collections
| Collection | Purpose |
| --- | --- |
| \`tasks\` | Tasks |
## 4. Relationship model`
  const failures = validateCollectionContract({ handler, schemas, dataModel })
  assert.ok(failures.some((failure) => failure.includes('DATA_MODEL')))
})

test('detects competing current blocker headings outside STATUS', () => {
  const failures = validateBlockerOwnership({
    project: '# Project\n## Current blockers\n- duplicate',
    roadmap: '# Roadmap\n## Future',
    systemMap: '# System Map'
  })
  assert.ok(failures.some((failure) => failure.includes('PROJECT')))
})
