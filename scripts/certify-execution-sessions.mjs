#!/usr/bin/env node

import process from 'node:process'
import { pathToFileURL, URL } from 'node:url'

const ACTIVITY_TYPES = new Set(['task', 'project_task', 'routine_step', 'chore'])
const SESSION_STATUSES = new Set(['in_progress', 'paused', 'completed', 'cancelled'])
const UPDATE_METHODS = new Set(['PATCH', 'PUT'])

export class CertificationError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'CertificationError'
    this.code = code
    this.details = details
  }
}

const isIdentifier = (value) =>
  (typeof value === 'string' && value.length > 0) ||
  (typeof value === 'number' && Number.isFinite(value))

const isTimestamp = (value) =>
  typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value))

export const validateExecutionSessionRecord = (record) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new CertificationError('NCB_CERT_INVALID_RECORD', 'Execution-session response is not an object.')
  }

  const requiredIdentifiers = ['id', 'user_id', 'activity_id', 'source_id']
  for (const field of requiredIdentifiers) {
    if (!isIdentifier(record[field])) {
      throw new CertificationError('NCB_CERT_INVALID_RECORD', `Execution-session field ${field} is missing or invalid.`, { field })
    }
  }

  if (!ACTIVITY_TYPES.has(record.activity_type)) {
    throw new CertificationError('NCB_CERT_INVALID_RECORD', 'Execution-session activity_type is invalid.', { field: 'activity_type' })
  }
  if (typeof record.title_snapshot !== 'string' || record.title_snapshot.trim().length === 0) {
    throw new CertificationError('NCB_CERT_INVALID_RECORD', 'Execution-session title_snapshot is missing or invalid.', { field: 'title_snapshot' })
  }
  if (!SESSION_STATUSES.has(record.status)) {
    throw new CertificationError('NCB_CERT_INVALID_RECORD', 'Execution-session status is invalid.', { field: 'status' })
  }
  if (!isTimestamp(record.started_at)) {
    throw new CertificationError('NCB_CERT_INVALID_RECORD', 'Execution-session started_at is missing or invalid.', { field: 'started_at' })
  }

  for (const field of ['paused_at', 'resumed_at', 'completed_at', 'cancelled_at', 'created_at', 'updated_at']) {
    if (record[field] !== undefined && record[field] !== null && !isTimestamp(record[field])) {
      throw new CertificationError('NCB_CERT_INVALID_RECORD', `Execution-session field ${field} is not a valid timestamp.`, { field })
    }
  }

  if (record.source_parent_id !== undefined && record.source_parent_id !== null && !isIdentifier(record.source_parent_id)) {
    throw new CertificationError('NCB_CERT_INVALID_RECORD', 'Execution-session source_parent_id is invalid.', { field: 'source_parent_id' })
  }

  return record
}

const normalizeUrl = (value, label, { template = false } = {}) => {
  if (!value) throw new CertificationError('NCB_CERT_CONFIG_MISSING', `${label} is required.`)
  const candidate = template ? value.replaceAll('{id}', 'certification-id') : value
  let url
  try {
    url = new URL(candidate)
  } catch {
    throw new CertificationError('NCB_CERT_CONFIG_INVALID', `${label} must be an absolute HTTP(S) URL.`)
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new CertificationError('NCB_CERT_CONFIG_INVALID', `${label} must use HTTP or HTTPS.`)
  }
  if (template && !value.includes('{id}')) {
    throw new CertificationError('NCB_CERT_CONFIG_INVALID', `${label} must contain an {id} placeholder.`)
  }
  return value
}

const normalizeUpdateMethod = (value) => {
  if (!value) throw new CertificationError('NCB_CERT_CONFIG_MISSING', 'updateMethod is required for full certification.')
  const normalized = value.toUpperCase()
  if (!UPDATE_METHODS.has(normalized)) {
    throw new CertificationError('NCB_CERT_CONFIG_INVALID', 'updateMethod must be PATCH or PUT.')
  }
  return normalized
}

const extractPayloadData = (payload) =>
  payload && typeof payload === 'object' && Object.hasOwn(payload, 'data') ? payload.data : payload

const extractSingleRecord = (payload, operation) => {
  const data = extractPayloadData(payload)
  const record = Array.isArray(data) ? data.length === 1 ? data[0] : null : data
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new CertificationError('NCB_CERT_INVALID_ENVELOPE', `${operation} did not return one execution-session record.`)
  }
  return validateExecutionSessionRecord(record)
}

const requestJson = async ({ fetchImpl, url, secret, method = 'GET', body }) => {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${secret}`
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetchImpl(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    })
  } catch (error) {
    throw new CertificationError('NCB_CERT_NETWORK_FAILED', `Provider ${method} request failed before receiving a response.`, {
      cause: error instanceof Error ? error.message : String(error)
    })
  }

  const text = await response.text()
  if (!response.ok) {
    throw new CertificationError('NCB_CERT_HTTP_FAILED', `Provider ${method} request returned HTTP ${response.status}.`, {
      status: response.status
    })
  }

  if (!text) {
    throw new CertificationError('NCB_CERT_INVALID_JSON', `Provider ${method} response was empty.`)
  }

  try {
    return { status: response.status, payload: JSON.parse(text) }
  } catch {
    throw new CertificationError('NCB_CERT_INVALID_JSON', `Provider ${method} response was not valid JSON.`)
  }
}

const requestNoContent = async ({ fetchImpl, url, secret, method }) => {
  let response
  try {
    response = await fetchImpl(url, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${secret}`
      }
    })
  } catch (error) {
    throw new CertificationError('NCB_CERT_NETWORK_FAILED', `Provider ${method} request failed before receiving a response.`, {
      cause: error instanceof Error ? error.message : String(error)
    })
  }
  if (!response.ok) {
    throw new CertificationError('NCB_CERT_HTTP_FAILED', `Provider ${method} request returned HTTP ${response.status}.`, {
      status: response.status
    })
  }
  return { status: response.status }
}

export const certifyReadContract = async ({ fetchImpl = globalThis.fetch, readUrl, secret }) => {
  normalizeUrl(readUrl, 'readUrl')
  if (!secret) throw new CertificationError('NCB_CERT_CONFIG_MISSING', 'Provider secret is required.')

  const response = await requestJson({ fetchImpl, url: readUrl, secret })
  const data = extractPayloadData(response.payload)
  if (!Array.isArray(data)) {
    throw new CertificationError('NCB_CERT_INVALID_ENVELOPE', 'Read response must expose an array directly or through a data property.')
  }
  data.forEach(validateExecutionSessionRecord)

  return {
    operation: 'read',
    passed: true,
    http_status: response.status,
    envelope: Object.hasOwn(response.payload ?? {}, 'data') ? 'data-array' : 'array',
    record_count: data.length
  }
}

const replaceId = (template, id) => template.replaceAll('{id}', encodeURIComponent(String(id)))

const makeCertificationRecord = (userId, now) => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return {
    user_id: userId,
    activity_id: `certification-task-${suffix}`,
    activity_type: 'task',
    source_id: `certification-source-${suffix}`,
    title_snapshot: `Execution-session certification ${suffix}`,
    status: 'in_progress',
    started_at: now()
  }
}

export const certifyFullContract = async ({
  fetchImpl = globalThis.fetch,
  readUrl,
  createUrl,
  updateUrlTemplate,
  updateMethod,
  deleteUrlTemplate,
  secret,
  userId,
  now = () => new Date().toISOString()
}) => {
  normalizeUrl(readUrl, 'readUrl')
  normalizeUrl(createUrl, 'createUrl')
  normalizeUrl(updateUrlTemplate, 'updateUrlTemplate', { template: true })
  if (deleteUrlTemplate) normalizeUrl(deleteUrlTemplate, 'deleteUrlTemplate', { template: true })
  const verifiedUpdateMethod = normalizeUpdateMethod(updateMethod)
  if (!secret) throw new CertificationError('NCB_CERT_CONFIG_MISSING', 'Provider secret is required.')
  if (!isIdentifier(userId)) throw new CertificationError('NCB_CERT_CONFIG_MISSING', 'A certification user id is required for write verification.')

  const evidence = [await certifyReadContract({ fetchImpl, readUrl, secret })]
  const createPayload = makeCertificationRecord(userId, now)
  let created

  try {
    const createResponse = await requestJson({ fetchImpl, url: createUrl, secret, method: 'POST', body: createPayload })
    created = extractSingleRecord(createResponse.payload, 'Create')
    evidence.push({ operation: 'create', passed: true, http_status: createResponse.status, record_id: String(created.id) })

    const pausedAt = now()
    const pausedResponse = await requestJson({
      fetchImpl,
      url: replaceId(updateUrlTemplate, created.id),
      secret,
      method: verifiedUpdateMethod,
      body: { status: 'paused', paused_at: pausedAt }
    })
    const paused = extractSingleRecord(pausedResponse.payload, 'Pause update')
    if (paused.status !== 'paused') throw new CertificationError('NCB_CERT_TRANSITION_FAILED', 'Pause update did not return paused status.')
    evidence.push({ operation: 'pause', passed: true, http_status: pausedResponse.status, method: verifiedUpdateMethod })

    const resumedAt = now()
    const resumedResponse = await requestJson({
      fetchImpl,
      url: replaceId(updateUrlTemplate, created.id),
      secret,
      method: verifiedUpdateMethod,
      body: { status: 'in_progress', resumed_at: resumedAt }
    })
    const resumed = extractSingleRecord(resumedResponse.payload, 'Resume update')
    if (resumed.status !== 'in_progress') throw new CertificationError('NCB_CERT_TRANSITION_FAILED', 'Resume update did not return in_progress status.')
    evidence.push({ operation: 'resume', passed: true, http_status: resumedResponse.status, method: verifiedUpdateMethod })

    const cancelledAt = now()
    const cancelledResponse = await requestJson({
      fetchImpl,
      url: replaceId(updateUrlTemplate, created.id),
      secret,
      method: verifiedUpdateMethod,
      body: { status: 'cancelled', cancelled_at: cancelledAt }
    })
    const cancelled = extractSingleRecord(cancelledResponse.payload, 'Cancel update')
    if (cancelled.status !== 'cancelled') throw new CertificationError('NCB_CERT_TRANSITION_FAILED', 'Cleanup update did not return cancelled status.')
    evidence.push({ operation: 'cancel', passed: true, http_status: cancelledResponse.status, method: verifiedUpdateMethod })

    if (deleteUrlTemplate) {
      const deleted = await requestNoContent({
        fetchImpl,
        url: replaceId(deleteUrlTemplate, created.id),
        secret,
        method: 'DELETE'
      })
      evidence.push({ operation: 'delete', passed: true, http_status: deleted.status })
    }
  } catch (error) {
    if (created?.id) {
      try {
        await requestJson({
          fetchImpl,
          url: replaceId(updateUrlTemplate, created.id),
          secret,
          method: verifiedUpdateMethod,
          body: { status: 'cancelled', cancelled_at: now() }
        })
      } catch {
        // Preserve the original certification failure. The caller receives the
        // created record id in evidence so cleanup can be completed manually.
      }
    }
    if (error instanceof CertificationError) {
      error.details = { ...error.details, created_record_id: created?.id ? String(created.id) : null }
    }
    throw error
  }

  return { passed: true, mode: 'full', evidence }
}

const parseArgs = (argv) => {
  const mode = argv.find((arg) => arg.startsWith('--mode='))?.split('=')[1] ?? 'read'
  return { mode, confirmWrite: argv.includes('--confirm-write') }
}

const main = async () => {
  const { mode, confirmWrite } = parseArgs(process.argv.slice(2))
  if (!['read', 'full'].includes(mode)) {
    throw new CertificationError('NCB_CERT_CONFIG_INVALID', 'Mode must be read or full.')
  }

  const secret = process.env.NOCODEBACKEND_SECRET_KEY ?? process.env.NCB_SECRET_KEY
  const common = {
    readUrl: process.env.NCB_EXECUTION_SESSIONS_READ_URL,
    secret
  }

  const result = mode === 'read'
    ? await certifyReadContract(common)
    : (() => {
        if (!confirmWrite) {
          throw new CertificationError('NCB_CERT_WRITE_CONFIRMATION_REQUIRED', 'Full certification writes provider test data. Re-run with --confirm-write.')
        }
        return certifyFullContract({
          ...common,
          createUrl: process.env.NCB_EXECUTION_SESSIONS_CREATE_URL,
          updateUrlTemplate: process.env.NCB_EXECUTION_SESSIONS_UPDATE_URL_TEMPLATE,
          updateMethod: process.env.NCB_EXECUTION_SESSIONS_UPDATE_METHOD,
          deleteUrlTemplate: process.env.NCB_EXECUTION_SESSIONS_DELETE_URL_TEMPLATE,
          userId: process.env.NCB_CERT_USER_ID
        })
      })()

  process.stdout.write(`${JSON.stringify({ certification: 'passed', ...result }, null, 2)}\n`)
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isCli) {
  main().catch((error) => {
    const failure = error instanceof CertificationError
      ? { code: error.code, message: error.message, details: error.details }
      : { code: 'NCB_CERT_UNEXPECTED', message: error instanceof Error ? error.message : String(error) }
    process.stderr.write(`${JSON.stringify({ certification: 'failed', error: failure }, null, 2)}\n`)
    process.exitCode = 1
  })
}
