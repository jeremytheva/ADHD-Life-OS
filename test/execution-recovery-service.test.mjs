import test from 'node:test'
import assert from 'node:assert/strict'
import { createExecutionRecoveryService } from '../src/services/executionRecoveryService.js'

const activeSession = {
  status: 'paused',
  activity_id: 'task:task-1',
  activity_type: 'task',
  source_id: 'task-1',
  source_parent_id: null
}

test('active matching source is recoverable', async () => {
  const service = createExecutionRecoveryService({
    sourceResolver: { resolve: async () => ({ id: 'task:task-1', source_id: 'task-1', status: 'active' }) }
  })
  const result = await service.assess(activeSession)
  assert.equal(result.status, 'assessed')
  assert.equal(result.recovery.mode, 'recoverable')
  assert.equal(result.recovery.can_resume, true)
})

test('missing source is returned as a recovery state rather than an exception', async () => {
  const service = createExecutionRecoveryService({ sourceResolver: { resolve: async () => null } })
  const result = await service.assess(activeSession)
  assert.equal(result.status, 'assessed')
  assert.equal(result.recovery.mode, 'source_missing')
  assert.equal(result.recovery.can_resume, false)
})

test('completed-elsewhere source requests reconciliation and prevents duplicate completion', async () => {
  const service = createExecutionRecoveryService({
    sourceResolver: { resolve: async () => ({ id: 'task:task-1', source_id: 'task-1', status: 'completed' }) }
  })
  const result = await service.assess(activeSession)
  assert.equal(result.recovery.mode, 'source_completed_elsewhere')
  assert.equal(result.recovery.suggested_action, 'reconcile_execution')
  assert.equal(result.recovery.can_complete, false)
})

test('source load failure fails closed and preserves execution state for retry', async () => {
  const error = new Error('provider unavailable')
  const service = createExecutionRecoveryService({
    sourceResolver: { resolve: async () => { throw error } }
  })
  const result = await service.assess(activeSession)
  assert.equal(result.status, 'failed')
  assert.equal(result.error, error)
  assert.equal(result.recovery.mode, 'source_resolution_failed')
  assert.equal(result.recovery.can_resume, false)
  assert.equal(result.recovery.can_complete, false)
})

test('terminal execution does not load its source', async () => {
  let calls = 0
  const service = createExecutionRecoveryService({
    sourceResolver: { resolve: async () => { calls += 1; return null } }
  })
  const result = await service.assess({ ...activeSession, status: 'completed' })
  assert.equal(result.status, 'not_required')
  assert.equal(result.recovery.mode, 'none')
  assert.equal(calls, 0)
})
