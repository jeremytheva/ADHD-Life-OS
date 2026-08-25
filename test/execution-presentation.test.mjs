import test from 'node:test'
import assert from 'node:assert/strict'
import { deriveExecutionPresentation } from '../src/domain/execution/executionPresentation.js'

const taskRecommendation = {
  id: 'task:42',
  type: 'task',
  source_id: '42',
  title: 'Prepare weekly report'
}

const routineRecommendation = {
  id: 'routine_step:r1:s1',
  type: 'routine_step',
  source_id: 's1',
  source_parent_id: 'r1',
  title: 'Brush teeth'
}

const activeSession = {
  id: 'exec-1',
  status: 'in_progress',
  title_snapshot: 'Prepare weekly report'
}

test('generic recommendation becomes a startable presentation', () => {
  const result = deriveExecutionPresentation({ recommendation: taskRecommendation })

  assert.equal(result.mode, 'startable')
  assert.equal(result.owner, 'generic_execution_session')
  assert.equal(result.primary_action, 'start')
  assert.equal(result.primary_label, 'Start this')
})

test('routine recommendation routes the primary action into the routine flow', () => {
  const result = deriveExecutionPresentation({ recommendation: routineRecommendation })

  assert.equal(result.mode, 'startable')
  assert.equal(result.owner, 'routine_session')
  assert.equal(result.primary_action, 'open_routine')
})

test('active execution blocks starting another activity and exposes pause/complete/cancel', () => {
  const result = deriveExecutionPresentation({
    currentExecution: { status: 'active', owner: 'generic_execution_session', session: activeSession }
  })

  assert.equal(result.mode, 'active')
  assert.equal(result.primary_action, 'continue')
  assert.equal(result.can_start_another, false)
  assert.deepEqual(result.secondary_actions, ['pause', 'complete', 'cancel'])
})

test('paused execution presents continue without discarding the session', () => {
  const result = deriveExecutionPresentation({
    currentExecution: { status: 'active', owner: 'generic_execution_session', session: { ...activeSession, status: 'paused' } }
  })

  assert.equal(result.mode, 'paused')
  assert.equal(result.primary_action, 'continue')
  assert.deepEqual(result.secondary_actions, ['complete', 'cancel'])
})

test('partial success blocks new starts until reconciliation', () => {
  const result = deriveExecutionPresentation({
    latestResult: {
      status: 'partial_success',
      owner: 'generic_execution_session',
      outcome: { reconciliation_required: true }
    }
  })

  assert.equal(result.mode, 'reconciliation_required')
  assert.equal(result.primary_action, 'refresh_status')
  assert.equal(result.can_start_another, false)
})

test('failed mutation exposes retry without presenting a false idle state', () => {
  const result = deriveExecutionPresentation({
    currentExecution: { status: 'active', owner: 'generic_execution_session', session: activeSession },
    latestResult: { status: 'failed', owner: 'generic_execution_session' }
  })

  assert.equal(result.mode, 'execution_error')
  assert.equal(result.primary_action, 'retry_current')
  assert.equal(result.can_start_another, false)
})

test('no recommendation or active execution is idle', () => {
  assert.deepEqual(deriveExecutionPresentation(), {
    mode: 'idle',
    owner: null,
    primary_action: null,
    primary_label: null,
    can_start_another: true
  })
})
