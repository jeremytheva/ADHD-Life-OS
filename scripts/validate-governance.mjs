#!/usr/bin/env node

import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const requiredFiles = [
  'AGENTS.md',
  'PROJECT.md',
  'STATUS.md',
  'README.md',
  'ROADMAP.md',
  'SYSTEM_MAP.md',
  'docs/ARCHITECTURE.md',
  'docs/DATA_MODEL.md',
  'docs/SECURITY.md',
  'docs/TESTING.md',
  'docs/CODEX_WORKFLOW.md',
  'docs/NOCODEBACKEND_OPERATIONS.md',
  'docs/DECISIONS/README.md',
  '.github/workflows/pull-request-validation.yml',
  '.github/workflows/pr-lifecycle.yml',
  '.github/workflows/pr-merge-finalizer.yml',
  'api/ncb/dataProvider.js',
  'api/ncb/dataProviderContract.js'
]
const duplicateDocumentationPaths = [
  'ARCHITECTURE.md',
  'DATA_MODEL.md',
  'DECISIONS'
]
const canonicalEnvironmentNames = [
  'NOCODEBACKEND_AUTH_BASE_URL',
  'NOCODEBACKEND_DATA_BASE_URL',
  'NOCODEBACKEND_SECRET_KEY',
  'NOCODEBACKEND_INSTANCE'
]
const deprecatedEnvironmentNames = [
  ['NCB_', 'API_BASE_URL'].join(''),
  ['NCB_', 'SECRET_KEY'].join(''),
  ['NCB_', 'EXECUTION_SESSIONS_READ_URL'].join(''),
  ['NCB_', 'EXECUTION_SESSIONS_CREATE_URL'].join(''),
  ['NCB_', 'EXECUTION_SESSIONS_UPDATE_URL_TEMPLATE'].join(''),
  ['NCB_', 'EXECUTION_SESSIONS_UPDATE_METHOD'].join(''),
  ['NCB_', 'EXECUTION_SESSIONS_DELETE_URL_TEMPLATE'].join(''),
  ['NCB_', 'CERT_USER_ID'].join('')
]
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage', '.vercel'])
const textExtensions = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.md', '.json', '.yml', '.yaml', '.example'])
const failures = []

const exists = async (relativePath) => {
  try {
    await access(path.join(root, relativePath))
    return true
  } catch {
    return false
  }
}

const walk = async (directory = root) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(absolute))
    else if (textExtensions.has(path.extname(entry.name)) || entry.name === '.env.example') files.push(absolute)
  }
  return files
}

for (const requiredFile of requiredFiles) {
  if (!await exists(requiredFile)) failures.push(`Missing required project document/control: ${requiredFile}`)
}

for (const duplicatePath of duplicateDocumentationPaths) {
  if (await exists(duplicatePath)) {
    failures.push(`Duplicate documentation path ${duplicatePath} should not exist; use the established docs/ canonical location instead.`)
  }
}

const envExample = await readFile(path.join(root, '.env.example'), 'utf8')
for (const name of canonicalEnvironmentNames) {
  if (!new RegExp(`^${name}=`, 'm').test(envExample)) failures.push(`.env.example is missing canonical environment variable ${name}`)
}

const status = await readFile(path.join(root, 'STATUS.md'), 'utf8')
if (!status.startsWith('---\n')) failures.push('STATUS.md must begin with YAML front matter.')
const frontMatterEnd = status.indexOf('\n---\n', 4)
if (frontMatterEnd < 0) failures.push('STATUS.md YAML front matter must have a closing delimiter.')
const statusFrontMatter = frontMatterEnd >= 0 ? status.slice(4, frontMatterEnd) : ''

const requiredStatusPatterns = [
  [/^project:\s*\S.+$/m, 'project'],
  [/^portfolio_state:\s*ACTIVE$/m, 'portfolio_state: ACTIVE'],
  [/^phase:\s*\S.+$/m, 'phase'],
  [/^stage:\s*\S.+$/m, 'stage'],
  [/^gate:\s*(Project Entry|Change|Integration|Release|Completion)$/m, 'canonical gate'],
  [/^execution_state:\s*(READY|IMPLEMENTING|VALIDATING|BLOCKED|COMPLETE|MAINTENANCE)$/m, 'execution_state'],
  [/^current_work:\s*$/m, 'current_work'],
  /^\s{2}objective:\s*.+$/m,
  /^\s{2}issue:\s*(null|\d+)$/m,
  /^\s{2}pr:\s*(null|\d+)$/m,
  /^\s{2}branch:\s*.+$/m,
  [/^next_actions:\s*$/m, 'next_actions'],
  [/^blockers:\s*(\[\])?\s*$/m, 'blockers'],
  [/^requires_owner_decision:\s*(true|false)$/m, 'requires_owner_decision'],
  [/^owner_decision:\s*$/m, 'owner_decision'],
  [/^validation:\s*$/m, 'validation'],
  /^\s{2}governance:\s*(PASS|FAIL|NOT_RUN|NOT_APPLICABLE)$/m,
  /^\s{2}lint:\s*(PASS|FAIL|NOT_RUN|NOT_APPLICABLE)$/m,
  /^\s{2}typecheck:\s*(PASS|FAIL|NOT_RUN|NOT_APPLICABLE)$/m,
  /^\s{2}tests:\s*(PASS|FAIL|NOT_RUN|NOT_APPLICABLE)$/m,
  /^\s{2}build:\s*(PASS|FAIL|NOT_RUN|NOT_APPLICABLE)$/m,
  /^\s{2}ci:\s*(PASS|FAIL|PENDING|NOT_RUN|NOT_APPLICABLE)$/m,
  /^\s{2}runtime:\s*(VERIFIED|UNVERIFIED|NOT_APPLICABLE)$/m,
  [/^last_verified_commit:\s*(null|[0-9a-f]{7,40})$/m, 'last_verified_commit'],
  [/^last_updated:\s*\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/m, 'ISO-8601 last_updated']
]

for (const requirement of requiredStatusPatterns) {
  const pattern = Array.isArray(requirement) ? requirement[0] : requirement
  const label = Array.isArray(requirement) ? requirement[1] : pattern.toString()
  if (!pattern.test(statusFrontMatter)) failures.push(`STATUS.md front matter is missing or invalid: ${label}`)
}

if (!/Current gate\s*[:|]/i.test(status)) failures.push('STATUS.md must expose the current execution gate in its human-readable handoff.')
if (!/Gate state\s*[:|]/i.test(status)) failures.push('STATUS.md must expose the current gate state in its human-readable handoff.')
if (!/Autonomous continuation entry answers/i.test(status)) failures.push('STATUS.md must answer scheduled autonomous re-entry questions.')

const agentGuidance = await readFile(path.join(root, 'AGENTS.md'), 'utf8')
for (const requiredFragment of [
  'Required project-entry sequence',
  'Autonomous continuation contract',
  'scheduled execution',
  'Valid stop or escalation conditions',
  'Whole-system rule',
  'DRAFT',
  'IMPLEMENTING',
  'VALIDATING',
  'READY',
  'MERGEABLE',
  'MERGED',
  'lifecycle:implementation-complete',
  'State maintenance',
  'Scheduled supervisory entry'
]) {
  if (!agentGuidance.includes(requiredFragment)) failures.push(`AGENTS.md must document autonomous/delivery control: ${requiredFragment}`)
}

const lifecycleWorkflow = await readFile(path.join(root, '.github/workflows/pr-lifecycle.yml'), 'utf8')
for (const requiredFragment of ['pull_request_target', 'workflow_run', 'lifecycle:implementation-complete', 'repos/$REPO/dispatches', 'pr-lifecycle-ready', 'pull-request-validation.yml']) {
  if (!lifecycleWorkflow.includes(requiredFragment)) failures.push(`PR lifecycle workflow is missing readiness marker ${requiredFragment}`)
}
if (lifecycleWorkflow.includes('mergePullRequest')) {
  failures.push('PR lifecycle readiness workflow must not merge directly; merge finalization must run separately.')
}

const mergeFinalizer = await readFile(path.join(root, '.github/workflows/pr-merge-finalizer.yml'), 'utf8')
for (const requiredFragment of ['repository_dispatch', 'pr-lifecycle-ready', 'lifecycle:implementation-complete', 'pull-request-validation.yml', 'reviewThreads', 'compare/main...', 'git/ref/heads/main', 'expectedHeadOid', 'mergePullRequest']) {
  if (!mergeFinalizer.includes(requiredFragment)) failures.push(`PR merge finalizer is missing enforcement marker ${requiredFragment}`)
}
if (mergeFinalizer.includes('mergeStateStatus')) {
  failures.push('PR merge finalizer must not depend on aggregate mergeStateStatus because its own pending check can self-block finalization.')
}

const validationWorkflow = await readFile(path.join(root, '.github/workflows/pull-request-validation.yml'), 'utf8')
if (!validationWorkflow.includes('npm run platform:validate')) {
  failures.push('Pull-request/main CI must invoke the canonical npm run platform:validate entry point.')
}

const providerContract = await readFile(path.join(root, 'api/ncb/dataProviderContract.js'), 'utf8')
if (!providerContract.includes("UNVERIFIED: 'UNVERIFIED'")) {
  failures.push('Data-provider contract must retain an explicit UNVERIFIED state.')
}

const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const platformValidate = packageJson.scripts?.['platform:validate'] ?? ''
for (const requiredFragment of ['npm audit', 'validate:governance', 'npm run validate', 'test:e2e']) {
  if (!platformValidate.includes(requiredFragment)) failures.push(`platform:validate must include ${requiredFragment}`)
}

const files = await walk()
for (const absolute of files) {
  const relative = path.relative(root, absolute).replaceAll(path.sep, '/')
  const content = await readFile(absolute, 'utf8')
  for (const deprecated of deprecatedEnvironmentNames) {
    if (content.includes(deprecated)) failures.push(`Deprecated NoCodeBackend environment alias ${deprecated} remains in ${relative}`)
  }

  const browserDelivered = relative === 'index.html' || relative.startsWith('src/') || relative.startsWith('public/')
  if (browserDelivered && content.includes('NOCODEBACKEND_SECRET_KEY')) {
    failures.push(`Server-only NoCodeBackend secret name appears in browser-delivered source: ${relative}`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) process.stderr.write(`governance: ${failure}\n`)
  process.exitCode = 1
} else {
  process.stdout.write('Governance validation passed.\n')
}