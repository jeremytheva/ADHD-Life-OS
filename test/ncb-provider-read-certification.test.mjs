import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ProviderReadCertificationError,
  certifyProviderRead
} from '../scripts/certify-ncb-read.mjs'

const response = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  async text() { return JSON.stringify(payload) }
})

const task = (overrides = {}) => ({
  id: 'task-1',
  user_id: 'user-1',
  title: 'Certification task',
  ...overrides
})

test('certifies an exact target-instance read contract without forwarding browser credentials', async () => {
  let request
  const result = await certifyProviderRead({
    collection: 'tasks',
    readUrl: 'https://api.nocodebackend.com/read/tasks?Instance=adhd-life-os&user_id=user-1',
    secret: 'server-secret',
    instance: 'adhd-life-os',
    expectedUserId: 'user-1',
    fetchImpl: async (url, options) => {
      request = { url, options }
      return response({ status: 'success', data: [task()] })
    }
  })

  assert.equal(request.options.method, 'GET')
  assert.deepEqual(request.options.headers, {
    Accept: 'application/json',
    Authorization: 'Bearer server-secret'
  })
  assert.equal(request.url.searchParams.get('Instance'), 'adhd-life-os')
  assert.equal(request.url.searchParams.get('user_id'), 'user-1')
  assert.equal(result.envelope, 'data-array')
  assert.equal(result.record_count, 1)
  assert.equal(result.application_schema, 'passed')
  assert.equal(result.ownership_filter, 'passed')
  assert.deepEqual(result.endpoint.query_keys, ['Instance', 'user_id'])
  assert.equal(JSON.stringify(result).includes('server-secret'), false)
  assert.equal(JSON.stringify(result).includes('user-1'), false)
})

test('accepts a direct array envelope when target evidence shows that shape', async () => {
  const result = await certifyProviderRead({
    collection: 'tasks',
    readUrl: 'https://provider.example/read/tasks?Instance=adhd-life-os',
    secret: 'secret',
    instance: 'adhd-life-os',
    fetchImpl: async () => response([task()])
  })

  assert.equal(result.envelope, 'array')
  assert.equal(result.ownership_filter, 'not_checked')
})

test('fails before provider access when the URL instance does not match runtime configuration', async () => {
  let called = false
  await assert.rejects(
    certifyProviderRead({
      collection: 'tasks',
      readUrl: 'https://provider.example/read/tasks?Instance=wrong-instance',
      secret: 'secret',
      instance: 'adhd-life-os',
      fetchImpl: async () => { called = true; return response([]) }
    }),
    (error) => error instanceof ProviderReadCertificationError && error.code === 'NCB_READ_CERT_INSTANCE_MISMATCH'
  )
  assert.equal(called, false)
})

test('requires the exact ownership filter when a certification user is supplied', async () => {
  await assert.rejects(
    certifyProviderRead({
      collection: 'tasks',
      readUrl: 'https://provider.example/read/tasks?Instance=adhd-life-os&user_id=someone-else',
      secret: 'secret',
      instance: 'adhd-life-os',
      expectedUserId: 'user-1',
      fetchImpl: async () => response([])
    }),
    (error) => error instanceof ProviderReadCertificationError && error.code === 'NCB_READ_CERT_OWNERSHIP_FILTER_MISSING'
  )
})

test('rejects provider records that do not satisfy the application domain schema', async () => {
  await assert.rejects(
    certifyProviderRead({
      collection: 'tasks',
      readUrl: 'https://provider.example/read/tasks?Instance=adhd-life-os',
      secret: 'secret',
      instance: 'adhd-life-os',
      fetchImpl: async () => response({ data: [{ id: 'task-1', user_id: 'user-1' }] })
    }),
    (error) => error instanceof ProviderReadCertificationError && error.code === 'NCB_READ_CERT_DOMAIN_INVALID'
  )
})

test('rejects a filtered response containing another users record', async () => {
  await assert.rejects(
    certifyProviderRead({
      collection: 'tasks',
      readUrl: 'https://provider.example/read/tasks?Instance=adhd-life-os&user_id=user-1',
      secret: 'secret',
      instance: 'adhd-life-os',
      expectedUserId: 'user-1',
      fetchImpl: async () => response({ data: [task({ user_id: 'user-2' })] })
    }),
    (error) => error instanceof ProviderReadCertificationError && error.code === 'NCB_READ_CERT_OWNERSHIP_MISMATCH'
  )
})

test('rejects non-array success envelopes', async () => {
  await assert.rejects(
    certifyProviderRead({
      collection: 'tasks',
      readUrl: 'https://provider.example/read/tasks?Instance=adhd-life-os',
      secret: 'secret',
      instance: 'adhd-life-os',
      fetchImpl: async () => response({ status: 'success', data: task() })
    }),
    (error) => error instanceof ProviderReadCertificationError && error.code === 'NCB_READ_CERT_ENVELOPE_INVALID'
  )
})
