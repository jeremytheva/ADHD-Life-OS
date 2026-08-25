#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import process from 'node:process'

export const REQUIRED_EXECUTION_SESSION_FIELDS = Object.freeze([
  'id',
  'user_id',
  'activity_id',
  'activity_type',
  'source_id',
  'title_snapshot',
  'status',
  'started_at'
])

const fail = (message, code = 'EXECUTION_ACTIVATION_NOT_READY') => {
  const error = new Error(message)
  error.code = code
  throw error
}

export const validateExecutionCertificationEvidence = (evidence = {}) => {
  if (evidence.status !== 'pass') fail('Certification evidence does not have status=pass.')
  if (evidence.collection !== 'execution-sessions') fail('Certification evidence is not for execution-sessions.')
  if (evidence.mode !== 'read-write') fail('Execution-session certification must include read/write verification.')
  for (const stage of ['read', 'create', 'update']) {
    if (evidence?.[stage]?.status !== 'pass') fail(`Certification stage ${stage} did not pass.`)
  }

  const expected = new Set(Array.isArray(evidence.expected_fields) ? evidence.expected_fields : [])
  const missing = REQUIRED_EXECUTION_SESSION_FIELDS.filter((field) => !expected.has(field))
  if (missing.length) fail(`Certification evidence did not verify required fields: ${missing.join(', ')}`)

  return Object.freeze({
    certified: true,
    collection: evidence.collection,
    mode: evidence.mode,
    required_fields_verified: true,
    cleanup_status: evidence?.cleanup?.status || null
  })
}

export const inspectExecutionActivationSource = async ({ root = new URL('../', import.meta.url) } = {}) => {
  const read = (relative) => readFile(new URL(relative, root), 'utf8')
  const [capabilities, contracts, repositories, runtime, browserGuard] = await Promise.all([
    read('src/config/providerCapabilities.js'),
    read('api/ncb/collectionContracts.js'),
    read('src/infrastructure/nocodebackend/repositories.js'),
    read('src/services/productionExecutionRuntime.js'),
    read('e2e/execution-capability-gate.spec.js')
  ])

  const capabilityDisabled = /executionSessions\s*:\s*false/.test(capabilities)
  const capabilityEnabled = /executionSessions\s*:\s*true/.test(capabilities)
  const checks = Object.freeze({
    conditional_proxy_contract: contracts.includes("execution-sessions") && contracts.includes('executionSessions'),
    gated_repository_registration: repositories.includes('providerCapabilities.executionSessions') && repositories.includes('executionSessions'),
    production_runtime_composed: runtime.includes('repositories.executionSessions') && runtime.includes('createProductionExecutionRuntime'),
    fail_closed_browser_guard: browserGuard.includes('ExecutionControls') && browserGuard.includes('Start this'),
    capability_disabled: capabilityDisabled,
    capability_enabled: capabilityEnabled
  })

  return checks
}

export const assessExecutionActivationReadiness = async ({ evidence, mode = 'preflight', root } = {}) => {
  const certification = validateExecutionCertificationEvidence(evidence)
  const source = await inspectExecutionActivationSource({ root })
  const structuralKeys = [
    'conditional_proxy_contract',
    'gated_repository_registration',
    'production_runtime_composed',
    'fail_closed_browser_guard'
  ]
  const structuralFailures = structuralKeys.filter((key) => !source[key])
  if (structuralFailures.length) fail(`Activation structure is incomplete: ${structuralFailures.join(', ')}`)

  if (mode === 'preflight' && !source.capability_disabled) {
    fail('Preflight expects executionSessions to remain false until cut-over.')
  }
  if (mode === 'cutover' && !source.capability_enabled) {
    fail('Cut-over verification expects executionSessions to be true.')
  }
  if (!['preflight', 'cutover'].includes(mode)) fail(`Unsupported readiness mode: ${mode}`)

  return Object.freeze({
    status: 'pass',
    mode,
    certification,
    source,
    ready_to_enable: mode === 'preflight',
    activated: mode === 'cutover'
  })
}

const parseArgs = (argv = []) => {
  let evidencePath = null
  let mode = 'preflight'
  for (const arg of argv) {
    if (arg.startsWith('--evidence=')) evidencePath = arg.slice('--evidence='.length).trim()
    else if (arg.startsWith('--mode=')) mode = arg.slice('--mode='.length).trim()
    else if (arg) fail(`Unknown argument: ${arg}`, 'INVALID_ARGUMENT')
  }
  if (!evidencePath) fail('Provide --evidence=<provider-certification-report.json>.', 'INVALID_ARGUMENT')
  return { evidencePath, mode }
}

const main = async () => {
  try {
    const { evidencePath, mode } = parseArgs(process.argv.slice(2))
    const evidence = JSON.parse(await readFile(evidencePath, 'utf8'))
    const report = await assessExecutionActivationReadiness({ evidence, mode })
    console.log(JSON.stringify(report, null, 2))
  } catch (error) {
    console.error(JSON.stringify({ status: 'fail', code: error.code || 'EXECUTION_ACTIVATION_NOT_READY', message: error.message }, null, 2))
    process.exitCode = 1
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main()
