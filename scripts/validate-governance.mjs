#!/usr/bin/env node

import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const requiredFiles = [
  'PROJECT.md',
  'STATUS.md',
  'ROADMAP.md',
  'SYSTEM_MAP.md',
  'docs/ARCHITECTURE.md',
  'docs/DATA_MODEL.md',
  'docs/NOCODEBACKEND_OPERATIONS.md',
  'docs/DECISIONS/README.md',
  '.github/workflows/pull-request-validation.yml',
  '.github/workflows/pr-lifecycle.yml',
  '.github/workflows/pr-merge-finalizer.yml',
  'api/ncb/dataProvider.js',
  'api/ncb/dataProviderContract.js'
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

const envExample = await readFile(path.join(root, '.env.example'), 'utf8')
for (const name of canonicalEnvironmentNames) {
  if (!new RegExp(`^${name}=`, 'm').test(envExample)) failures.push(`.env.example is missing canonical environment variable ${name}`)
}

const status = await readFile(path.join(root, 'STATUS.md'), 'utf8')
if (!/Current gate\s*[:|]/i.test(status)) failures.push('STATUS.md must expose the current execution gate.')
if (!/Gate state\s*[:|]/i.test(status)) failures.push('STATUS.md must expose the current gate state.')

const agentGuidance = await readFile(path.join(root, 'AGENTS.md'), 'utf8')
for (const requiredFragment of ['DRAFT', 'IMPLEMENTING', 'VALIDATING', 'READY', 'MERGEABLE', 'MERGED', 'lifecycle:implementation-complete']) {
  if (!agentGuidance.includes(requiredFragment)) failures.push(`AGENTS.md must document PR lifecycle control ${requiredFragment}`)
}

const lifecycleWorkflow = await readFile(path.join(root, '.github/workflows/pr-lifecycle.yml'), 'utf8')
for (const requiredFragment of ['pull_request_target', 'workflow_run', 'lifecycle:implementation-complete', 'repository_dispatch', 'pr-lifecycle-ready', 'pull-request-validation.yml']) {
  if (!lifecycleWorkflow.includes(requiredFragment)) failures.push(`PR lifecycle workflow is missing readiness marker ${requiredFragment}`)
}
if (lifecycleWorkflow.includes('mergePullRequest')) {
  failures.push('PR lifecycle readiness workflow must not merge directly; merge finalization must run separately.')
}

const mergeFinalizer = await readFile(path.join(root, '.github/workflows/pr-merge-finalizer.yml'), 'utf8')
for (const requiredFragment of ['repository_dispatch', 'pr-lifecycle-ready', 'lifecycle:implementation-complete', 'pull-request-validation.yml', 'reviewThreads', 'compare/main...', 'expectedHeadOid', 'mergePullRequest']) {
  if (!mergeFinalizer.includes(requiredFragment)) failures.push(`PR merge finalizer is missing enforcement marker ${requiredFragment}`)
}
if (mergeFinalizer.includes('mergeStateStatus')) {
  failures.push('PR merge finalizer must not depend on aggregate mergeStateStatus because its own pending check can self-block finalization.')
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
