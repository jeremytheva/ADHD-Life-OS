import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildDataProviderRequest,
  DataProviderContractError
} from '../api/ncb/dataProvider.js'
import {
  DATA_PROVIDER_CONTRACT_STATES,
  dataProviderContract,
  defineDataProviderContract,
  operationKeyForRequest
} from '../api/ncb/dataProviderContract.js'

const env = {
  NOCODEBACKEND_DATA_BASE_URL: 'https://provider.example.test/root/',
  NOCODEBACKEND_SECRET_KEY: 'server-secret',
  NOCODEBACKEND_INSTANCE: 'target-instance'
}

const verifiedContract = defineDataProviderContract({
  state: DATA_PROVIDER_CONTRACT_STATES.VERIFIED,
  evidence: 'Test-only provider fixture.',
  operations: {
    list: { verified: true, providerMethod: 'GET', pathTemplate: 'reads/{collection}' },
    get: { verified: true, providerMethod: 'GET', pathTemplate: 'reads/{collection}/{id}' },
    create: { verified: true, providerMethod: 'POST', pathTemplate: 'creates/{collection}' },
    update: { verified: true, providerMethod: 'PUT', pathTemplate: 'updates/{collection}/{id}' },
    delete: { verified: true, providerMethod: 'DELETE', pathTemplate: 'deletes/{collection}/{id}' }
  }
})

test('production data-provider contract is unverified until target-instance evidence exists', () => {
  assert.equal(dataProviderContract.state, DATA_PROVIDER_CONTRACT_STATES.UNVERIFIED)
  assert.ok(Object.values(dataProviderContract.operations).every((operation) => operation.verified === false))
})

test('application operations map to stable provider operation keys', () => {
  assert.equal(operationKeyForRequest('GET', false), 'list')
  assert.equal(operationKeyForRequest('GET', true), 'get')
  assert.equal(operationKeyForRequest('POST', false), 'create')
  assert.equal(operationKeyForRequest('PATCH', true), 'update')
  assert.equal(operationKeyForRequest('DELETE', true), 'delete')
  assert.equal(operationKeyForRequest('POST', true), null)
})

test('verified contract controls provider path and method while instance and credentials remain server-owned', () => {
  const request = buildDataProviderRequest({
    appMethod: 'PATCH',
    collection: 'tasks',
    id: 'task 1',
    query: { user_id: 'user-1' },
    body: { title: 'Updated' },
    contract: verifiedContract,
    env
  })

  assert.equal(request.operationKey, 'update')
  assert.equal(request.method, 'PUT')
  assert.equal(String(request.url), 'https://provider.example.test/root/updates/tasks/task%201?Instance=target-instance&user_id=user-1')
  assert.deepEqual(request.headers, {
    Accept: 'application/json',
    Authorization: 'Bearer server-secret',
    'Content-Type': 'application/json'
  })
  assert.deepEqual(JSON.parse(request.body), { title: 'Updated' })
})

test('unverified operation fails closed instead of falling back to application route shape', () => {
  assert.throws(
    () => buildDataProviderRequest({ appMethod: 'GET', collection: 'tasks', contract: dataProviderContract, env }),
    (error) => error instanceof DataProviderContractError && error.code === 'NCB_PROVIDER_CONTRACT_UNVERIFIED'
  )
})

test('missing instance fails closed even with an otherwise verified contract', () => {
  assert.throws(
    () => buildDataProviderRequest({
      appMethod: 'GET',
      collection: 'tasks',
      contract: verifiedContract,
      env: { ...env, NOCODEBACKEND_INSTANCE: '' }
    }),
    (error) => error instanceof DataProviderContractError && error.code === 'NCB_PROVIDER_CONFIG_MISSING'
  )
})
