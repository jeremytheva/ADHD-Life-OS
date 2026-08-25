import test from 'node:test'
import assert from 'node:assert/strict'
import { createExecutionCompletionService } from '../src/services/executionCompletionService.js'

const session = {
  id: 'session-1',
  user_id: 'user-1',
  activity_id: 'task:42',
  activity_type: 'task',
  source_id: '42',
  source_parent_id: null,
  status: 'in_progress',
  started_at: '2026-08-25T05:00:00.000Z'
}

const completedSession = {
  ...session,
  status: 'completed',
  completed_at: '2026-08-25T05:15:00.000Z'
}

test('source completion starts only after execution-session completion succeeds', async () => {
  const calls = []
  const service = createExecutionCompletionService({
    sessionService: {
      async complete() {
        calls.push('session')
        return completedSession
      }
    },
    sourceCompletionAdapter: {
      async complete(input) {
        calls.push('source')
        assert.equal(input.source_id, '42')
        return { id: '42', completed: true }
      }
    }
  })

  const result = await service.complete(session)
  assert.deepEqual(calls, ['session', 'source'])
  assert.equal(result.status, 'completed')
  assert.equal(result.execution_session_completed, true)
  assert.equal(result.source_completed, true)
  assert.equal(result.reconciliation_required, false)
})

test('session persistence failure prevents source completion', async () => {
  let sourceCalled = false
  const service = createExecutionCompletionService({
    sessionService: {
      async complete() {
        throw Object.assign(new Error('session write failed'), { code: 'SESSION_WRITE_FAILED' })
      }
    },
    sourceCompletionAdapter: {
      async complete() {
        sourceCalled = true
      }
    }
  })

  const result = await service.complete(session)
  assert.equal(sourceCalled, false)
  assert.equal(result.status, 'failed')
  assert.equal(result.phase, 'execution_session')
  assert.equal(result.execution_session_completed, false)
  assert.equal(result.source_completed, false)
})

test('source failure after session completion is explicit partial success', async () => {
  const sourceError = Object.assign(new Error('source completion failed'), {
    code: 'SOURCE_COMPLETION_FAILED'
  })
  const service = createExecutionCompletionService({
    sessionService: {
      async complete() {
        return completedSession
      }
    },
    sourceCompletionAdapter: {
      async complete() {
        throw sourceError
      }
    }
  })

  const result = await service.complete(session)
  assert.equal(result.status, 'partial_success')
  assert.equal(result.phase, 'source_completion')
  assert.equal(result.execution_session_completed, true)
  assert.equal(result.source_completed, false)
  assert.equal(result.reconciliation_required, true)
  assert.equal(result.execution_session.id, 'session-1')
  assert.equal(result.error, sourceError)
})

test('source adapter receives canonical source references from persisted session', async () => {
  let input
  const routineStepSession = {
    ...completedSession,
    activity_type: 'routine_step',
    source_id: 'step-9',
    source_parent_id: 'routine-3'
  }
  const service = createExecutionCompletionService({
    sessionService: { async complete() { return routineStepSession } },
    sourceCompletionAdapter: { async complete(value) { input = value; return { ok: true } } }
  })

  await service.complete(routineStepSession)
  assert.equal(input.activity_type, 'routine_step')
  assert.equal(input.source_id, 'step-9')
  assert.equal(input.source_parent_id, 'routine-3')
  assert.equal(input.execution_session.status, 'completed')
})
