import test from 'node:test'
import assert from 'node:assert/strict'
import { createSourceCompletionAdapter } from '../src/services/sourceCompletionAdapter.js'

const session = {
  id: 'session-1',
  status: 'completed'
}

test('task completion delegates to the task handler with canonical source context', async () => {
  let received
  const adapter = createSourceCompletionAdapter({
    task: async (input) => {
      received = input
      return { id: input.source_id, completed: true }
    }
  })

  const result = await adapter.complete({
    activity_type: 'task',
    source_id: '42',
    source_parent_id: null,
    execution_session: session
  })

  assert.equal(received.source_id, '42')
  assert.equal(received.execution_session, session)
  assert.equal(result.completed, true)
})

test('project task completion uses the project-task handler so project caches can reconcile', async () => {
  let called = false
  const adapter = createSourceCompletionAdapter({
    projectTask: async ({ source_id, source_parent_id }) => {
      called = true
      return { id: source_id, project_id: source_parent_id, completed: true }
    }
  })

  const result = await adapter.complete({
    activity_type: 'project_task',
    source_id: 'task-9',
    source_parent_id: 'project-3',
    execution_session: session
  })

  assert.equal(called, true)
  assert.equal(result.project_id, 'project-3')
})

test('chore completion delegates without assuming idempotency or checklist semantics', async () => {
  let received
  const adapter = createSourceCompletionAdapter({
    chore: async (input) => {
      received = input
      return { id: input.source_id, completion_recorded: true }
    }
  })

  await adapter.complete({
    activity_type: 'chore',
    source_id: 'chore-4',
    execution_session: session
  })

  assert.equal(received.source_id, 'chore-4')
  assert.equal(Object.hasOwn(received, 'completedChecklist'), false)
})

test('routine-step completion does not mutate the reusable routine-step definition', async () => {
  const adapter = createSourceCompletionAdapter({})
  const result = await adapter.complete({
    activity_type: 'routine_step',
    source_id: 'step-2',
    source_parent_id: 'routine-1',
    execution_session: session
  })

  assert.equal(result.status, 'not_required')
  assert.equal(result.reason, 'routine_step_is_reusable_definition')
  assert.equal(result.source_parent_id, 'routine-1')
})

test('unknown or unwired source types fail explicitly', async () => {
  const adapter = createSourceCompletionAdapter({})

  await assert.rejects(
    () => adapter.complete({ activity_type: 'task', source_id: '42', execution_session: session }),
    (error) => error.code === 'SOURCE_COMPLETION_UNSUPPORTED' && error.activity_type === 'task'
  )

  await assert.rejects(
    () => adapter.complete({ activity_type: 'mystery', source_id: 'x', execution_session: session }),
    (error) => error.code === 'SOURCE_COMPLETION_UNSUPPORTED' && error.activity_type === 'mystery'
  )
})
