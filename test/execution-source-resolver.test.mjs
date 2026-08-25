import test from 'node:test'
import assert from 'node:assert/strict'
import { createExecutionSourceResolver } from '../src/services/executionSourceResolver.js'

const session = {
  activity_id: 'task:task-1',
  activity_type: 'task',
  source_id: 'task-1',
  source_parent_id: null
}

test('task source resolution forwards the canonical source reference', async () => {
  let received
  const resolver = createExecutionSourceResolver({
    task: async (input) => {
      received = input
      return { id: 'task:task-1', source_id: 'task-1', type: 'task', status: 'active' }
    }
  })

  const result = await resolver.resolve(session)
  assert.equal(result.source_id, 'task-1')
  assert.equal(received.source_id, 'task-1')
  assert.equal(received.activity_id, 'task:task-1')
  assert.equal(received.execution_session, session)
})

test('project task resolution preserves its parent project reference', async () => {
  let received
  const resolver = createExecutionSourceResolver({
    projectTask: async (input) => { received = input; return null }
  })

  const projectSession = {
    ...session,
    activity_id: 'project_task:project-1:task-2',
    activity_type: 'project_task',
    source_id: 'task-2',
    source_parent_id: 'project-1'
  }
  assert.equal(await resolver.resolve(projectSession), null)
  assert.equal(received.source_parent_id, 'project-1')
})

test('chore source resolution remains a distinct handler boundary', async () => {
  const resolver = createExecutionSourceResolver({
    chore: async ({ source_id }) => ({ id: `chore:${source_id}`, source_id, type: 'chore', status: 'active' })
  })
  const result = await resolver.resolve({ ...session, activity_id: 'chore:chore-1', activity_type: 'chore', source_id: 'chore-1' })
  assert.equal(result.type, 'chore')
})

test('routine steps cannot enter the generic execution source resolver', async () => {
  const resolver = createExecutionSourceResolver({})
  await assert.rejects(
    resolver.resolve({ ...session, activity_type: 'routine_step' }),
    (error) => error.code === 'EXECUTION_SOURCE_UNSUPPORTED'
  )
})

test('unwired generic activity types fail explicitly instead of looking recoverable', async () => {
  const resolver = createExecutionSourceResolver({})
  await assert.rejects(
    resolver.resolve(session),
    (error) => error.code === 'EXECUTION_SOURCE_UNSUPPORTED'
  )
})
