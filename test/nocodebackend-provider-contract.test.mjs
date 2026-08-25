import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildAuthTarget,
  buildDataTarget,
  getNoCodeBackendConfig,
  missingNoCodeBackendEnv
} from '../api/ncb/providerContract.js'

const env = {
  NOCODEBACKEND_AUTH_BASE_URL: 'https://app.nocodebackend.com/api/user-auth',
  NOCODEBACKEND_DATA_BASE_URL: 'https://api.nocodebackend.com/',
  NOCODEBACKEND_SECRET_KEY: 'server-secret',
  NOCODEBACKEND_INSTANCE: '54026_rating'
}

test('requires the four canonical server-only NoCodeBackend variables', () => {
  assert.equal(getNoCodeBackendConfig(env).instance, '54026_rating')
  assert.deepEqual(missingNoCodeBackendEnv({}), [
    'NOCODEBACKEND_AUTH_BASE_URL',
    'NOCODEBACKEND_DATA_BASE_URL',
    'NOCODEBACKEND_SECRET_KEY',
    'NOCODEBACKEND_INSTANCE'
  ])
})

test('builds auth targets from the dedicated authentication base', () => {
  const target = buildAuthTarget(['sign-in', 'email'], {}, env)
  assert.equal(String(target.url), 'https://app.nocodebackend.com/api/user-auth/sign-in/email')
  assert.equal(target.secretKey, 'server-secret')
})

test('maps collection reads to generated read routes and injects Instance', () => {
  const target = buildDataTarget(['products'], 'GET', { user_id: 'user-1' }, env)
  assert.equal(String(target.url), 'https://api.nocodebackend.com/read/products?Instance=54026_rating&user_id=user-1')
  assert.equal(target.method, 'GET')
  assert.equal(target.operation, 'read')
})

test('maps item reads to read filters without inventing a REST item route', () => {
  const target = buildDataTarget(['tasks', 'task-1'], 'GET', { user_id: 'user-1' }, env)
  assert.equal(String(target.url), 'https://api.nocodebackend.com/read/tasks?Instance=54026_rating&id=task-1&user_id=user-1')
  assert.equal(target.itemRead, true)
})

test('maps create, patch, and delete to generated provider route families', () => {
  const create = buildDataTarget(['tasks'], 'POST', { user_id: 'user-1' }, env)
  const update = buildDataTarget(['tasks', 'task-1'], 'PATCH', { user_id: 'user-1' }, env)
  const remove = buildDataTarget(['tasks', 'task-1'], 'DELETE', { user_id: 'user-1' }, env)

  assert.equal(String(create.url), 'https://api.nocodebackend.com/create/tasks?Instance=54026_rating&user_id=user-1')
  assert.equal(create.method, 'POST')
  assert.equal(String(update.url), 'https://api.nocodebackend.com/update/tasks/task-1?Instance=54026_rating&user_id=user-1')
  assert.equal(update.method, 'PUT')
  assert.equal(String(remove.url), 'https://api.nocodebackend.com/delete/tasks/task-1?Instance=54026_rating&user_id=user-1')
  assert.equal(remove.method, 'DELETE')
})

test('rejects incomplete or invalid provider configuration', () => {
  assert.equal(buildDataTarget(['tasks'], 'GET', {}, { ...env, NOCODEBACKEND_INSTANCE: '' }), null)
  assert.equal(buildAuthTarget(['get-session'], {}, { ...env, NOCODEBACKEND_AUTH_BASE_URL: 'javascript:bad' }), null)
})
