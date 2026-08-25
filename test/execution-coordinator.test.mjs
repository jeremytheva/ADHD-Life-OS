import test from 'node:test'
import assert from 'node:assert/strict'
import { createExecutionCoordinator } from '../src/services/executionCoordinator.js'

const taskActivity = {
  id: 'task:42',
  type: 'task',
  source_id: '42',
  title: 'Prepare weekly report'
}

const routineActivity = {
  id: 'routine_step:r1:s1',
  type: 'routine_step',
  source_id: 's1',
  source_parent_id: 'r1',
  title: 'Brush teeth'
}

const session = {
  id: 'exec-1',
  user_id: 'user-1',
  activity_id: 'task:42',
  activity_type: 'task',
  source_id: '42',
  status: 'in_progress'
}

const buildCoordinator = (overrides = {}) => {
  const calls = []
  const sessionService = {
    async getCurrent() { return overrides.currentSession ?? null },
    async start(userId, activity) { calls.push(['start', userId, activity.id]); return { ...session, user_id: userId, activity_id: activity.id } },
    async pause(value) { calls.push(['pause', value.id]); return { ...value, status: 'paused' } },
    async resume(value) { calls.push(['resume', value.id]); return { ...value, status: 'in_progress' } },
    async cancel(value) { calls.push(['cancel', value.id]); return { ...value, status: 'cancelled' } }
  }
  const routineEntryAdapter = {
    async open(input) { calls.push(['routine', input.routine_id, input.step_id]); return { routine_id: input.routine_id, step_id: input.step_id } }
  }
  const completionService = {
    async complete(value) {
      calls.push(['complete', value.id])
      return overrides.completionOutcome ?? {
        status: 'completed',
        execution_session_completed: true,
        source_completed: true,
        reconciliation_required: false
      }
    }
  }

  return {
    calls,
    coordinator: createExecutionCoordinator({ sessionService, routineEntryAdapter, completionService })
  }
}

test('generic activities start through the execution-session service', async () => {
  const { coordinator, calls } = buildCoordinator()
  const result = await coordinator.start('user-1', taskActivity)

  assert.equal(result.status, 'started')
  assert.equal(result.owner, 'generic_execution_session')
  assert.equal(result.replanning.should_replan, false)
  assert.deepEqual(calls[0], ['start', 'user-1', 'task:42'])
})

test('routine steps route to the existing routine-session entry adapter', async () => {
  const { coordinator, calls } = buildCoordinator()
  const result = await coordinator.start('user-1', routineActivity)

  assert.equal(result.status, 'routed')
  assert.equal(result.owner, 'routine_session')
  assert.equal(result.entry.generic_execution_session_required, false)
  assert.deepEqual(calls, [['routine', 'r1', 's1']])
})

test('current generic execution is exposed as active recovery state', async () => {
  const { coordinator } = buildCoordinator({ currentSession: session })
  const result = await coordinator.getCurrent('user-1')

  assert.equal(result.status, 'active')
  assert.equal(result.owner, 'generic_execution_session')
  assert.equal(result.session.id, 'exec-1')
})

test('pause preserves the current plan while cancellation requests immediate replanning', async () => {
  const { coordinator } = buildCoordinator()
  const paused = await coordinator.pause(session)
  const cancelled = await coordinator.cancel(session)

  assert.equal(paused.replanning.should_replan, false)
  assert.equal(paused.replanning.reason, 'execution_paused')
  assert.equal(cancelled.replanning.should_replan, true)
  assert.equal(cancelled.replanning.mode, 'immediate')
})

test('completion carries reconciliation outcome into the replanning decision', async () => {
  const partial = {
    status: 'partial_success',
    execution_session_completed: true,
    source_completed: false,
    reconciliation_required: true
  }
  const { coordinator } = buildCoordinator({ completionOutcome: partial })
  const result = await coordinator.complete(session)

  assert.equal(result.status, 'partial_success')
  assert.equal(result.replanning.should_replan, true)
  assert.equal(result.replanning.mode, 'after_reconciliation')
})

test('failed completion does not replan as if state changed', async () => {
  const failed = {
    status: 'failed',
    phase: 'execution_session',
    execution_session_completed: false,
    source_completed: false,
    reconciliation_required: false
  }
  const { coordinator } = buildCoordinator({ completionOutcome: failed })
  const result = await coordinator.complete(session)

  assert.equal(result.status, 'failed')
  assert.equal(result.replanning.should_replan, false)
  assert.equal(result.replanning.reason, 'execution_completion_failed')
})
