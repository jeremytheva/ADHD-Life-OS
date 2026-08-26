/* global Buffer, Response, process */

import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import test from 'node:test'
import { createNcbHandler } from '../api/ncb/handler.js'
import { DATA_PROVIDER_CONTRACT_STATES, defineDataProviderContract } from '../api/ncb/dataProviderContract.js'

const originalAuthBaseUrl = process.env.NOCODEBACKEND_AUTH_BASE_URL
const originalDataBaseUrl = process.env.NOCODEBACKEND_DATA_BASE_URL
const originalSecret = process.env.NOCODEBACKEND_SECRET_KEY
const originalInstance = process.env.NOCODEBACKEND_INSTANCE

const verifiedTestContract = defineDataProviderContract({
  state: DATA_PROVIDER_CONTRACT_STATES.VERIFIED,
  evidence: 'Deterministic test fixture only; not provider evidence.',
  operations: {
    list: { verified: true, providerMethod: 'GET', pathTemplate: 'fixture/list/{collection}' },
    get: { verified: true, providerMethod: 'GET', pathTemplate: 'fixture/get/{collection}/{id}' },
    create: { verified: true, providerMethod: 'POST', pathTemplate: 'fixture/create/{collection}' },
    update: { verified: true, providerMethod: 'PUT', pathTemplate: 'fixture/update/{collection}/{id}' },
    delete: { verified: true, providerMethod: 'DELETE', pathTemplate: 'fixture/delete/{collection}/{id}' }
  }
})

const setProviderEnv = () => {
  process.env.NOCODEBACKEND_AUTH_BASE_URL = 'https://ncb.example.test/v1'
  process.env.NOCODEBACKEND_DATA_BASE_URL = 'https://ncb.example.test/provider/'
  process.env.NOCODEBACKEND_SECRET_KEY = 'server-secret'
  process.env.NOCODEBACKEND_INSTANCE = 'test-instance'
}

const restoreEnv = (name, value) => {
  if (value === undefined) delete process.env[name]
  else process.env[name] = value
}

const makeRequest = ({ method = 'GET', path = [], query = {}, headers = {}, body, parsedBody } = {}) => {
  const request = Readable.from(body === undefined ? [] : [Buffer.from(body)])
  request.method = method
  request.query = { path, ...query }
  request.headers = { host: 'app.example.test', ...headers }
  request.socket = {}
  if (parsedBody !== undefined) request.body = parsedBody
  return request
}

const makeResponse = () => ({
  headers: new Map(),
  statusCode: null,
  payload: null,
  setHeader(name, value) { this.headers.set(name.toLowerCase(), value) },
  status(status) { this.statusCode = status; return this },
  json(payload) { this.payload = payload; return this },
  send(payload) { this.payload = payload; return this }
})

const validTask = (overrides = {}) => ({
  id: 'task-1',
  user_id: 'user-1',
  title: 'Write tests',
  description: '',
  due_date: null,
  estimated_duration: 30,
  is_essential: false,
  completed: false,
  project_id: null,
  category: null,
  tags: [],
  ...overrides
})

const sessionResponse = () => new Response(JSON.stringify({ data: { user: { id: 'user-1' } } }), {
  status: 200,
  headers: { 'content-type': 'application/json' }
})

test.after(() => {
  restoreEnv('NOCODEBACKEND_AUTH_BASE_URL', originalAuthBaseUrl)
  restoreEnv('NOCODEBACKEND_DATA_BASE_URL', originalDataBaseUrl)
  restoreEnv('NOCODEBACKEND_SECRET_KEY', originalSecret)
  restoreEnv('NOCODEBACKEND_INSTANCE', originalInstance)
})

test('rejects routes, methods, CSRF failures, and malformed bodies before fetch', async () => {
  setProviderEnv()
  let calls = 0
  const fetchImpl = async () => { calls += 1; throw new Error('must not be called') }
  const handler = createNcbHandler('auth', { fetchImpl })

  for (const request of [
    makeRequest({ path: ['not-allowed'] }),
    makeRequest({ method: 'DELETE', path: ['get-session'] }),
    makeRequest({ method: 'POST', path: ['sign-out'] }),
    makeRequest({ method: 'POST', path: ['sign-in', 'email'], headers: { origin: 'https://app.example.test', 'content-type': 'application/json' }, body: '{bad' })
  ]) {
    const response = makeResponse()
    await handler(request, response)
    assert.ok([400, 403, 404, 405].includes(response.statusCode))
    assert.match(response.payload.error.code, /^NCB_/)
    assert.match(response.payload.error.correlationId, /^[0-9a-f-]{36}$/)
  }
  assert.equal(calls, 0)
})

test('rejects oversized string, buffer, and parsed JSON bodies before fetch', async () => {
  setProviderEnv()
  let calls = 0
  const fetchImpl = async () => { calls += 1; throw new Error('must not be called') }
  const handler = createNcbHandler('auth', { fetchImpl })
  const oversizedJson = JSON.stringify({ email: 'person@example.test', password: 'x'.repeat(32 * 1024) })
  const requestOptions = {
    method: 'POST',
    path: ['sign-in', 'email'],
    headers: { origin: 'https://app.example.test', 'x-forwarded-proto': 'https', 'content-type': 'application/json' }
  }

  for (const parsedBody of [oversizedJson, Buffer.from(oversizedJson), JSON.parse(oversizedJson)]) {
    const response = makeResponse()
    await handler(makeRequest({ ...requestOptions, parsedBody }), response)
    assert.equal(response.statusCode, 413)
    assert.equal(response.payload.error.code, 'NCB_BODY_TOO_LARGE')
  }
  assert.equal(calls, 0)
})

test('fails closed before provider access when the target data contract is unverified', async () => {
  setProviderEnv()
  let calls = 0
  const response = makeResponse()
  await createNcbHandler('data', {
    fetchImpl: async () => { calls += 1; throw new Error('must not be called') }
  })(makeRequest({ path: ['tasks'] }), response)

  assert.equal(response.statusCode, 503)
  assert.equal(response.payload.error.code, 'NCB_PROVIDER_CONTRACT_UNVERIFIED')
  assert.equal(calls, 0)
})

test('fails closed before provider access when required data configuration is missing', async () => {
  setProviderEnv()
  delete process.env.NOCODEBACKEND_INSTANCE
  let calls = 0
  const response = makeResponse()
  await createNcbHandler('data', {
    dataProviderContract: verifiedTestContract,
    fetchImpl: async () => { calls += 1; throw new Error('must not be called') }
  })(makeRequest({ path: ['tasks'] }), response)

  assert.equal(response.statusCode, 503)
  assert.equal(response.payload.error.code, 'NCB_PROVIDER_CONFIG_MISSING')
  assert.equal(calls, 0)
})

test('maps the stable application create route through a verified provider contract without forwarding auth cookies', async () => {
  setProviderEnv()
  let captured
  const fetchImpl = async (url, options) => {
    if (String(url).endsWith('/get-session')) return sessionResponse()
    captured = { url: String(url), options }
    return new Response(JSON.stringify({ data: validTask() }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'set-cookie': 'provider_cookie=unexpected; HttpOnly' }
    })
  }
  const request = makeRequest({
    method: 'POST',
    path: ['tasks'],
    headers: { origin: 'https://app.example.test', 'x-forwarded-proto': 'https', cookie: 'ncb_session=auth-cookie', 'content-type': 'application/json' },
    body: JSON.stringify({ user_id: 'user-1', title: 'Write tests' })
  })
  const response = makeResponse()
  await createNcbHandler('data', { fetchImpl, dataProviderContract: verifiedTestContract })(request, response)

  assert.equal(response.statusCode, 200)
  assert.equal(captured.url, 'https://ncb.example.test/provider/fixture/create/tasks?Instance=test-instance&user_id=user-1')
  assert.equal(captured.options.method, 'POST')
  assert.equal(captured.options.headers.Authorization, 'Bearer server-secret')
  assert.equal(captured.options.headers.Cookie, undefined)
  assert.equal(captured.options.headers.Origin, undefined)
  assert.equal(captured.options.headers.Referer, undefined)
  assert.equal(captured.options.headers['X-Correlation-Id'], undefined)
  assert.equal(JSON.parse(captured.options.body).user_id, 'user-1')
  assert.equal(response.headers.get('set-cookie'), undefined)
})

test('maps application PATCH to the provider method declared by the verified contract', async () => {
  setProviderEnv()
  let captured
  const fetchImpl = async (url, options) => {
    if (String(url).endsWith('/get-session')) return sessionResponse()
    captured = { url: String(url), options }
    return new Response(JSON.stringify({ data: validTask({ title: 'Updated task' }) }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  }
  const response = makeResponse()
  await createNcbHandler('data', { fetchImpl, dataProviderContract: verifiedTestContract })(makeRequest({
    method: 'PATCH',
    path: ['tasks', 'task-1'],
    headers: { origin: 'https://app.example.test', 'x-forwarded-proto': 'https', cookie: 'ncb_session=auth-cookie', 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Updated task' })
  }), response)

  assert.equal(response.statusCode, 200)
  assert.equal(captured.url, 'https://ncb.example.test/provider/fixture/update/tasks/task-1?Instance=test-instance&user_id=user-1')
  assert.equal(captured.options.method, 'PUT')
  assert.equal(captured.options.headers.Cookie, undefined)
})

test('rejects malformed upstream domain records with a structured proxy error', async () => {
  setProviderEnv()
  const fetchImpl = async (url) => String(url).endsWith('/get-session')
    ? sessionResponse()
    : new Response(JSON.stringify({ data: { id: 'task-1', title: 42 } }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
  const response = makeResponse()
  await createNcbHandler('data', { fetchImpl, dataProviderContract: verifiedTestContract })(makeRequest({
    method: 'GET',
    path: ['tasks', 'task-1'],
    headers: { origin: 'https://app.example.test', 'x-forwarded-proto': 'https', cookie: 'ncb_session=auth-cookie' }
  }), response)

  assert.equal(response.statusCode, 502)
  assert.equal(response.payload.error.code, 'NCB_INVALID_RESPONSE')
  assert.match(response.payload.error.correlationId, /^[0-9a-f-]{36}$/)
})

test('rejects cross-user data attempts after session verification without data upstream requests', async () => {
  setProviderEnv()
  const calls = []
  const fetchImpl = async (url) => {
    calls.push(String(url))
    assert.match(String(url), /\/get-session$/)
    return sessionResponse()
  }
  const handler = createNcbHandler('data', { fetchImpl, dataProviderContract: verifiedTestContract })
  const crossUserRequests = [
    makeRequest({ path: ['tasks'], query: { user_id: 'user-2' }, headers: { origin: 'https://app.example.test', 'x-forwarded-proto': 'https', cookie: 'ncb_session=auth-cookie' } }),
    makeRequest({ method: 'POST', path: ['tasks'], headers: { origin: 'https://app.example.test', 'x-forwarded-proto': 'https', cookie: 'ncb_session=auth-cookie', 'content-type': 'application/json' }, body: JSON.stringify({ user_id: 'user-2', title: 'Attempt cross-user create' }) }),
    makeRequest({ path: ['tasks', 'task-2'], query: { user_id: 'user-2' }, headers: { origin: 'https://app.example.test', 'x-forwarded-proto': 'https', cookie: 'ncb_session=auth-cookie' } }),
    makeRequest({ method: 'PATCH', path: ['tasks', 'task-2'], query: { user_id: 'user-2' }, headers: { origin: 'https://app.example.test', 'x-forwarded-proto': 'https', cookie: 'ncb_session=auth-cookie', 'content-type': 'application/json' }, body: JSON.stringify({ title: 'Attempt cross-user update' }) }),
    makeRequest({ method: 'DELETE', path: ['tasks', 'task-2'], query: { user_id: 'user-2' }, headers: { origin: 'https://app.example.test', 'x-forwarded-proto': 'https', cookie: 'ncb_session=auth-cookie' } })
  ]

  for (const request of crossUserRequests) {
    const response = makeResponse()
    await handler(request, response)
    assert.equal(response.statusCode, 403)
    assert.equal(response.payload.error.code, 'NCB_USER_ID_MISMATCH')
  }
  assert.equal(calls.length, crossUserRequests.length)
  assert.ok(calls.every((url) => url.endsWith('/get-session')))
})
