import test from 'node:test'
import assert from 'node:assert/strict'
import {
  cancelExecution,
  completeExecution,
  getExecutionRecoveryAction,
  pauseExecution,
  resumeExecution,
  startExecution
} from '../src/domain/execution/executionLifecycle.js'

const activity = {
  id: 'task:42',
  type: 'task',
  source_id: '42',
  title: 'Prepare weekly report'
}

const at = (minute) => `2026-08-24T08:${String(minute).padStart(2, '0')}:00.000Z`

test('execution lifecycle starts from a canonical activity without mutating it', () => {
  const before = structuredClone(activity)
  const session = startExecution(activity, at(0))

  assert.deepEqual(activity, before)
  assert.equal(session.activity_id, 'task:42')
  assert.equal(session.source_id, '42')
  assert.equal(session.title_snapshot, 'Prepare weekly report')
  assert.equal(session.status, 'in_progress')
  assert.equal(session.started_at, at(0))
})

test('execution lifecycle supports pause and continue recovery', () => {
  const started = startExecution(activity, at(0))
  const paused = pauseExecution(started, at(5))
  const resumed = resumeExecution(paused, at(10))

  assert.equal(paused.status, 'paused')
  assert.equal(paused.paused_at, at(5))
  assert.equal(getExecutionRecoveryAction(paused), 'continue')
  assert.equal(resumed.status, 'in_progress')
  assert.equal(resumed.resumed_at, at(10))
  assert.equal(resumed.paused_at, null)
  assert.equal(getExecutionRecoveryAction(resumed), 'resume_current')
})

test('completion and cancellation are terminal lifecycle outcomes', () => {
  const started = startExecution(activity, at(0))
  const completed = completeExecution(started, at(15))
  const cancelled = cancelExecution(startExecution(activity, at(20)), at(25))

  assert.equal(completed.status, 'completed')
  assert.equal(completed.completed_at, at(15))
  assert.equal(cancelled.status, 'cancelled')
  assert.equal(cancelled.cancelled_at, at(25))
  assert.throws(() => pauseExecution(completed, at(30)))
  assert.throws(() => resumeExecution(cancelled, at(30)))
})

test('recovery defaults to start when no resumable execution exists', () => {
  assert.equal(getExecutionRecoveryAction(null), 'start')
  assert.equal(getExecutionRecoveryAction({ status: 'completed' }), 'start')
  assert.equal(getExecutionRecoveryAction({ status: 'cancelled' }), 'start')
})
