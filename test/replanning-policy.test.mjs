import test from 'node:test'
import assert from 'node:assert/strict'
import { decideReplanning } from '../src/domain/execution/replanningPolicy.js'

test('completion triggers immediate replanning when reconciliation succeeded', () => {
  assert.deepEqual(decideReplanning({ event: 'execution_completed', outcome: { status: 'completed' } }), {
    should_replan: true,
    reason: 'execution_completed',
    mode: 'immediate'
  })
})

test('partial success defers replanning until reconciliation', () => {
  assert.deepEqual(decideReplanning({ event: 'execution_completed', outcome: { status: 'partial_success', reconciliation_required: true } }), {
    should_replan: true,
    reason: 'source_partial_success',
    mode: 'after_reconciliation'
  })
})

test('pause preserves current execution context', () => {
  assert.deepEqual(decideReplanning({ event: 'execution_paused' }), {
    should_replan: false,
    reason: 'execution_paused',
    mode: 'none'
  })
})

test('transient not-now rotates options without declaring a full replan', () => {
  assert.deepEqual(decideReplanning({ event: 'not_now' }), {
    should_replan: false,
    reason: 'transient_not_now',
    mode: 'none'
  })
})

test('context change always causes immediate replanning', () => {
  assert.deepEqual(decideReplanning({ event: 'execution_paused', contextChanged: true }), {
    should_replan: true,
    reason: 'context_changed',
    mode: 'immediate'
  })
})
