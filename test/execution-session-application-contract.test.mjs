import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  executionSessionCreateSchema,
  executionSessionPatchSchema,
  executionSessionSchema
} from '../src/domains/executionSessionSchemas.js'
import { providerCapabilities } from '../src/config/providerCapabilities.js'
import { proxyCollectionContracts } from '../api/ncb/collectionContracts.js'

const validRecord = {
  id: 'session-1',
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
  cancelled_at: null,
  created_at: '2026-08-25T09:00:00.000Z',
  updated_at: '2026-08-25T09:00:00.000Z'
}

test('execution session response schema accepts the documented generic lifecycle shape', () => {
  assert.equal(executionSessionSchema.safeParse(validRecord).success, true)
})

test('create contract permits only a newly in-progress generic execution session', () => {
  const create = { ...validRecord }
  delete create.id
  delete create.created_at
  delete create.updated_at
  assert.equal(executionSessionCreateSchema.safeParse(create).success, true)
  assert.equal(executionSessionCreateSchema.safeParse({ ...create, status: 'paused' }).success, false)
  assert.equal(executionSessionCreateSchema.safeParse({ ...create, activity_type: 'routine_step' }).success, false)
})

test('patch contract cannot mutate ownership, source identity, activity identity, or title snapshot', () => {
  assert.equal(executionSessionPatchSchema.safeParse({ status: 'paused', paused_at: '2026-08-25T09:05:00.000Z' }).success, true)
  for (const forbidden of [
    { user_id: 'user-2' },
    { activity_id: 'task:other' },
    { activity_type: 'chore' },
    { source_id: 'other' },
    { source_parent_id: 'other' },
    { title_snapshot: 'Changed title' }
  ]) {
    assert.equal(executionSessionPatchSchema.safeParse(forbidden).success, false)
  }
})

test('execution sessions remain disabled in the live proxy contract until certification flips the capability', () => {
  assert.equal(providerCapabilities.executionSessions, false)
  assert.equal(proxyCollectionContracts.collections.includes('execution-sessions'), false)
  assert.equal(proxyCollectionContracts.schemas['execution-sessions'], undefined)
  assert.equal(proxyCollectionContracts.createSchemas['execution-sessions'], undefined)
  assert.equal(proxyCollectionContracts.patchSchemas['execution-sessions'], undefined)
})

test('prepared repository is registered only through the capability gate', async () => {
  const registry = await readFile(new URL('../src/infrastructure/nocodebackend/repositories.js', import.meta.url), 'utf8')
  assert.equal(registry.includes('executionSessions'), true)
  assert.equal(registry.includes('providerCapabilities.executionSessions'), true)
  assert.equal(registry.includes('createExecutionSessionRepository'), true)
})
