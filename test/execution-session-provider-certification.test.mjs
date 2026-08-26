import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CertificationError,
  certifyFullContract,
  certifyReadContract,
  validateExecutionSessionRecord
} from '../scripts/certify-execution-sessions.mjs'

const makeRecord = (overrides = {}) => ({
  id: 'session-1',
  user_id: 'user-1',
  activity_id: 'activity-1',
  activity_type: 'task',
  source_id: 'task-1',
  title_snapshot: 'Certification task',
  status: 'in_progress',
  started_at: '2026-08-26T00:00:00.000Z',
  ...overrides
})

const jsonResponse = (payload, status = 200) => new Response(JSON.stringify(payload), {
  status,
  headers: { 'Content-Type': 'application/json' }
})

test('read certification accepts a data-array envelope and validates returned records', async () => {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, options })
    return jsonResponse({ status: 'success', data: [makeRecord()] })
  }

  const result = await certifyReadContract({
    fetchImpl,
    readUrl: 'https://provider.example/read/execution-sessions',
    secret: 'test-secret'
  })

  assert.equal(result.passed, true)
  assert.equal(result.envelope, 'data-array')
  assert.equal(result.record_count, 1)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].options.method, 'GET')
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-secret')
})

test('read certification fails closed when the provider envelope is not an array', async () => {
  await assert.rejects(
    () => certifyReadContract({
      fetchImpl: async () => jsonResponse({ status: 'success', data: { id: 'not-a-list' } }),
      readUrl: 'https://provider.example/read/execution-sessions',
      secret: 'test-secret'
    }),
    (error) => error instanceof CertificationError && error.code === 'NCB_CERT_INVALID_ENVELOPE'
  )
})

test('record validation rejects an unknown execution status', () => {
  assert.throws(
    () => validateExecutionSessionRecord(makeRecord({ status: 'mystery' })),
    (error) => error instanceof CertificationError && error.code === 'NCB_CERT_INVALID_RECORD'
  )
})

test('full certification verifies create and pause/resume/cancel transitions without guessing route shapes', async () => {
  const calls = []
  let currentRecord
  const timestamps = [
    '2026-08-26T00:00:00.000Z',
    '2026-08-26T00:01:00.000Z',
    '2026-08-26T00:02:00.000Z',
    '2026-08-26T00:03:00.000Z'
  ]
  let timestampIndex = 0

  const fetchImpl = async (url, options) => {
    calls.push({ url: String(url), options })

    if (options.method === 'GET') return jsonResponse({ status: 'success', data: [] })

    const body = options.body ? JSON.parse(options.body) : undefined
    if (options.method === 'POST') {
      currentRecord = makeRecord({
        id: 'provider-session-42',
        user_id: body.user_id,
        activity_id: body.activity_id,
        activity_type: body.activity_type,
        source_id: body.source_id,
        title_snapshot: body.title_snapshot,
        status: body.status,
        started_at: body.started_at
      })
      return jsonResponse({ status: 'success', data: currentRecord }, 201)
    }

    if (options.method === 'PATCH') {
      currentRecord = { ...currentRecord, ...body }
      return jsonResponse({ status: 'success', data: currentRecord })
    }

    throw new Error(`Unexpected method ${options.method}`)
  }

  const result = await certifyFullContract({
    fetchImpl,
    readUrl: 'https://provider.example/read/execution-sessions',
    createUrl: 'https://provider.example/create/execution-sessions',
    updateUrlTemplate: 'https://provider.example/update/execution-sessions/{id}',
    secret: 'test-secret',
    userId: 'user-1',
    now: () => timestamps[timestampIndex++]
  })

  assert.equal(result.passed, true)
  assert.deepEqual(result.evidence.map((item) => item.operation), ['read', 'create', 'pause', 'resume', 'cancel'])
  assert.equal(currentRecord.status, 'cancelled')
  assert.equal(calls.filter((call) => call.options.method === 'PATCH').length, 3)
  assert.equal(calls[2].url, 'https://provider.example/update/execution-sessions/provider-session-42')
})

test('full certification reports the created record id if a later transition fails', async () => {
  let currentRecord
  let patchCount = 0

  const fetchImpl = async (_url, options) => {
    if (options.method === 'GET') return jsonResponse({ data: [] })
    const body = options.body ? JSON.parse(options.body) : undefined
    if (options.method === 'POST') {
      currentRecord = makeRecord({
        id: 'provider-session-failed',
        user_id: body.user_id,
        activity_id: body.activity_id,
        activity_type: body.activity_type,
        source_id: body.source_id,
        title_snapshot: body.title_snapshot,
        status: body.status,
        started_at: body.started_at
      })
      return jsonResponse({ data: currentRecord }, 201)
    }
    if (options.method === 'PATCH') {
      patchCount += 1
      if (patchCount === 1) return jsonResponse({ error: 'provider failed' }, 500)
      currentRecord = { ...currentRecord, ...body }
      return jsonResponse({ data: currentRecord })
    }
    throw new Error('Unexpected request')
  }

  await assert.rejects(
    () => certifyFullContract({
      fetchImpl,
      readUrl: 'https://provider.example/read/execution-sessions',
      createUrl: 'https://provider.example/create/execution-sessions',
      updateUrlTemplate: 'https://provider.example/update/execution-sessions/{id}',
      secret: 'test-secret',
      userId: 'user-1',
      now: () => '2026-08-26T00:00:00.000Z'
    }),
    (error) =>
      error instanceof CertificationError &&
      error.code === 'NCB_CERT_HTTP_FAILED' &&
      error.details.created_record_id === 'provider-session-failed'
  )

  assert.equal(patchCount, 2, 'cleanup should attempt to terminalize the created certification session')
})
