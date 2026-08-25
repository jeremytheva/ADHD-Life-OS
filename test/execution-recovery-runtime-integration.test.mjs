import assert from 'node:assert/strict'
import test from 'node:test'
import { deriveExecutionPresentation } from '../src/domain/execution/executionPresentation.js'
import { createExecutionRuntime } from '../src/services/executionRuntime.js'
import { createExecutionCoordinator } from '../src/services/executionCoordinator.js'

const session = {
  id: 'session-1',
  user_id: 'user-1',
  activity_id: 'task:task-1',
  activity_type: 'task',
  source_id: 'task-1',
  source_parent_id: null,
  title_snapshot: 'Recovered task',
  status: 'paused',
  started_at: '2026-08-25T00:00:00.000Z'
}

const currentExecution = { status: 'active', owner: 'generic_execution_session', session }

test('missing recovered source blocks continue and offers safe cancellation', () => {
  const presentation = deriveExecutionPresentation({
    currentExecution,
    recoveryAssessment: {
      status: 'assessed',
      recovery: { mode: 'source_missing', message: 'Source missing.' }
    }
  })

  assert.equal(presentation.mode, 'source_recovery_required')
  assert.equal(presentation.primary_action, 'cancel')
  assert.equal(presentation.can_start_another, false)
})

test('completed-elsewhere source exposes execution-only reconciliation', () => {
  const presentation = deriveExecutionPresentation({
    currentExecution,
    recoveryAssessment: {
      status: 'assessed',
      recovery: { mode: 'source_completed_elsewhere', message: 'Already complete.' }
    }
  })

  assert.equal(presentation.mode, 'reconciliation_required')
  assert.equal(presentation.primary_action, 'reconcile_execution')
})

test('runtime assesses authoritative source before deriving active controls', async () => {
  let assessed = 0
  const coordinator = {
    getCurrent: async () => currentExecution,
    start: async () => null,
    pause: async () => null,
    resume: async () => null,
    cancel: async () => null,
    complete: async () => null
  }
  const recoveryService = {
    async assess(value) {
      assessed += 1
      assert.equal(value.id, 'session-1')
      return { status: 'assessed', recovery: { mode: 'source_closed', message: 'Closed.' } }
    }
  }

  const runtime = createExecutionRuntime({ coordinator, recoveryService })
  const state = await runtime.getState({ userId: 'user-1' })

  assert.equal(assessed, 1)
  assert.equal(state.presentation.mode, 'source_recovery_required')
  assert.equal(state.presentation.primary_action, 'cancel')
})

test('coordinator reconciles completed-elsewhere source without source completion adapter', async () => {
  let sessionCompletes = 0
  let sourceCompletes = 0
  const sessionService = {
    getCurrent: async () => session,
    complete: async (value) => {
      sessionCompletes += 1
      return { ...value, status: 'completed', completed_at: '2026-08-25T01:00:00.000Z' }
    }
  }
  const completionService = {
    async complete() {
      sourceCompletes += 1
      return { status: 'completed' }
    }
  }
  const coordinator = createExecutionCoordinator({
    sessionService,
    completionService,
    routineEntryAdapter: { open: async () => ({ path: '/routines' }) }
  })

  const result = await coordinator.reconcileCompletedSource(session)

  assert.equal(result.status, 'reconciled')
  assert.equal(result.source_completed_elsewhere, true)
  assert.equal(sessionCompletes, 1)
  assert.equal(sourceCompletes, 0)
  assert.equal(result.replanning.should_replan, true)
  assert.equal(result.replanning.mode, 'immediate')
})
