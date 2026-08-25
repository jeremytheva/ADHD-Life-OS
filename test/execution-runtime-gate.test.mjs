import test from 'node:test'
import assert from 'node:assert/strict'
import { createExecutionRuntime } from '../src/services/executionRuntime.js'

const recommendation = {
  id: 'task:42',
  type: 'task',
  source_id: '42',
  title: 'Prepare weekly report'
}

test('runtime fails closed when no verified coordinator is supplied', async () => {
  const runtime = createExecutionRuntime()
  assert.equal(runtime.available, false)
  assert.deepEqual(await runtime.getState(), {
    available: false,
    reason: 'execution_provider_unavailable',
    mode: 'unavailable',
    can_start: false,
    message: 'Execution tracking is not available yet. Your recommendation is still safe to review.'
  })
  assert.equal(runtime.start, undefined)
})

test('runtime rejects partial coordinator contracts', async () => {
  const runtime = createExecutionRuntime({ coordinator: { getCurrent: async () => null } })
  assert.equal(runtime.available, false)
  assert.equal((await runtime.getState()).can_start, false)
})

test('verified runtime projects coordinator state for the UI', async () => {
  const calls = []
  const coordinator = {
    async getCurrent(userId) { calls.push(['getCurrent', userId]); return { status: 'idle', owner: null, session: null } },
    async start(userId, activity, at) { calls.push(['start', userId, activity, at]); return { status: 'started' } },
    async pause(session, at) { calls.push(['pause', session, at]); return { status: 'paused' } },
    async resume(session, at) { calls.push(['resume', session, at]); return { status: 'resumed' } },
    async cancel(session, at) { calls.push(['cancel', session, at]); return { status: 'cancelled' } },
    async complete(session, at) { calls.push(['complete', session, at]); return { status: 'completed' } }
  }

  const runtime = createExecutionRuntime({ coordinator })
  const state = await runtime.getState({ userId: 'user-1', recommendation })

  assert.equal(runtime.available, true)
  assert.equal(state.available, true)
  assert.equal(state.presentation.mode, 'startable')
  assert.equal(state.presentation.primary_action, 'start')
  assert.deepEqual(calls[0], ['getCurrent', 'user-1'])
})

test('runtime delegates lifecycle mutations only when coordinator is complete', async () => {
  const calls = []
  const coordinator = {
    async getCurrent() { return { status: 'idle', session: null } },
    async start(userId, activity, at) { calls.push(['start', userId, activity.id, at]); return { status: 'started' } },
    async pause(session, at) { calls.push(['pause', session.id, at]); return { status: 'paused' } },
    async resume(session, at) { calls.push(['resume', session.id, at]); return { status: 'resumed' } },
    async cancel(session, at) { calls.push(['cancel', session.id, at]); return { status: 'cancelled' } },
    async complete(session, at) { calls.push(['complete', session.id, at]); return { status: 'completed' } }
  }

  const runtime = createExecutionRuntime({ coordinator })
  await runtime.start({ userId: 'user-1', activity: recommendation, at: 'start' })
  await runtime.pause({ session: { id: 's1' }, at: 'pause' })
  await runtime.resume({ session: { id: 's1' }, at: 'resume' })
  await runtime.complete({ session: { id: 's1' }, at: 'complete' })

  assert.deepEqual(calls, [
    ['start', 'user-1', 'task:42', 'start'],
    ['pause', 's1', 'pause'],
    ['resume', 's1', 'resume'],
    ['complete', 's1', 'complete']
  ])
})
