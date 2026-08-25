import test from 'node:test'
import assert from 'node:assert/strict'
import { assessExecutionSourceRecovery } from '../src/domain/execution/executionSourceRecovery.js'

const session = {
  id: 's1',
  source_id: '42',
  status: 'paused',
  title_snapshot: 'Prepare weekly report'
}

const source = {
  id: '42',
  source_id: '42',
  status: 'active',
  title: 'Prepare weekly report'
}

test('active source remains recoverable', () => {
  assert.deepEqual(assessExecutionSourceRecovery({ session, sourceActivity: source }), {
    mode: 'recoverable',
    recovery_required: false,
    can_resume: true,
    can_complete: true,
    suggested_action: 'continue',
    message: null
  })
})

test('missing source blocks resume and completion', () => {
  const state = assessExecutionSourceRecovery({ session, sourceActivity: null })
  assert.equal(state.mode, 'source_missing')
  assert.equal(state.can_resume, false)
  assert.equal(state.can_complete, false)
  assert.equal(state.suggested_action, 'cancel_execution')
})

test('source completed elsewhere requires reconciliation rather than duplicate completion', () => {
  const state = assessExecutionSourceRecovery({
    session,
    sourceActivity: { ...source, status: 'completed', completed: true }
  })
  assert.equal(state.mode, 'source_completed_elsewhere')
  assert.equal(state.recovery_required, true)
  assert.equal(state.suggested_action, 'reconcile_execution')
})

test('archived or cancelled source cannot be resumed', () => {
  for (const status of ['archived', 'cancelled']) {
    const state = assessExecutionSourceRecovery({ session, sourceActivity: { ...source, status } })
    assert.equal(state.mode, 'source_closed')
    assert.equal(state.can_resume, false)
    assert.equal(state.can_complete, false)
  }
})

test('source identity mismatch fails closed', () => {
  const state = assessExecutionSourceRecovery({ session, sourceActivity: { ...source, id: '99', source_id: '99' } })
  assert.equal(state.mode, 'source_mismatch')
  assert.equal(state.suggested_action, 'refresh_source')
})

test('terminal execution sessions require no recovery decision', () => {
  const state = assessExecutionSourceRecovery({ session: { ...session, status: 'completed' }, sourceActivity: source })
  assert.equal(state.mode, 'none')
  assert.equal(state.recovery_required, false)
})
