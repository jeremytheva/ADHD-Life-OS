import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveExecutionEntry } from '../src/domain/execution/executionEntryRouting.js'

test('routine steps route into the existing routine-session lifecycle', () => {
  assert.deepEqual(resolveExecutionEntry({
    id: 'routine_step:r1:s1',
    type: 'routine_step',
    source_id: 's1',
    source_parent_id: 'r1'
  }), {
    owner: 'routine_session',
    action: 'open_routine',
    activity_type: 'routine_step',
    routine_id: 'r1',
    step_id: 's1',
    generic_execution_session_required: false
  })
})

test('tasks use the generic execution-session lifecycle', () => {
  assert.deepEqual(resolveExecutionEntry({ id: 'task:42', type: 'task', source_id: '42' }), {
    owner: 'generic_execution_session',
    action: 'start_or_continue',
    activity_type: 'task',
    activity_id: 'task:42',
    source_id: '42',
    source_parent_id: null,
    generic_execution_session_required: true
  })
})

test('project tasks and chores remain eligible for generic execution sessions', () => {
  assert.equal(resolveExecutionEntry({ id: 'project_task:p1:t1', type: 'project_task', source_id: 't1', source_parent_id: 'p1' }).owner, 'generic_execution_session')
  assert.equal(resolveExecutionEntry({ id: 'chore:c1', type: 'chore', source_id: 'c1' }).owner, 'generic_execution_session')
})

test('malformed or unknown activities fail explicitly', () => {
  assert.throws(() => resolveExecutionEntry({ type: 'routine_step', source_id: 's1' }), error => error.code === 'EXECUTION_ENTRY_UNSUPPORTED')
  assert.throws(() => resolveExecutionEntry({ id: 'habit:1', type: 'habit', source_id: '1' }), error => error.code === 'EXECUTION_ENTRY_UNSUPPORTED')
})
