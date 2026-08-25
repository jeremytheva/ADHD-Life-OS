import assert from 'node:assert/strict'
import test from 'node:test'
import { buildProxyCollectionContracts } from '../api/ncb/collectionContracts.js'

const createPayload = {
  user_id: 'user-1',
  activity_id: 'task:task-1',
  activity_type: 'task',
  source_id: 'task-1',
  source_parent_id: null,
  title_snapshot: 'Write the report',
  status: 'in_progress',
  started_at: '2026-08-25T09:00:00.000Z',
  paused_at: null,
  resumed_at: null,
  completed_at: null,
  cancelled_at: null
}

test('disabled capability omits execution sessions from route and schema contracts', () => {
  const contracts = buildProxyCollectionContracts({ executionSessions: false })
  assert.equal(contracts.collections.includes('execution-sessions'), false)
  assert.equal(contracts.schemas['execution-sessions'], undefined)
})

test('enabled capability adds execution sessions route and exact schemas together', () => {
  const contracts = buildProxyCollectionContracts({ executionSessions: true })
  assert.equal(contracts.collections.includes('execution-sessions'), true)
  assert.equal(contracts.createSchemas['execution-sessions'].safeParse(createPayload).success, true)
  assert.equal(contracts.patchSchemas['execution-sessions'].safeParse({
    status: 'paused',
    paused_at: '2026-08-25T09:05:00.000Z'
  }).success, true)
})

test('enabled create contract still rejects invalid initial lifecycle state', () => {
  const contracts = buildProxyCollectionContracts({ executionSessions: true })
  assert.equal(contracts.createSchemas['execution-sessions'].safeParse({
    ...createPayload,
    status: 'paused'
  }).success, false)
})

test('enabled patch contract still rejects identity mutation', () => {
  const contracts = buildProxyCollectionContracts({ executionSessions: true })
  assert.equal(contracts.patchSchemas['execution-sessions'].safeParse({ source_id: 'other' }).success, false)
  assert.equal(contracts.patchSchemas['execution-sessions'].safeParse({ user_id: 'user-2' }).success, false)
})
