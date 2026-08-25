import test from 'node:test'
import assert from 'node:assert/strict'
import { createExecutionSessionService } from '../src/services/executionSessionService.js'

const at = (minute) => `2026-08-25T03:${String(minute).padStart(2, '0')}:00.000Z`
const activity = {
  id: 'task:42',
  type: 'task',
  source_id: '42',
  title: 'Prepare weekly report'
}

const fakeAdapter = (seed = []) => {
  let records = structuredClone(seed)
  let nextId = records.length + 1
  return {
    async list(filters = {}) {
      return records.filter((record) => !filters.user_id || record.user_id === filters.user_id)
    },
    async create(record) {
      const created = { id: String(nextId++), created_at: record.started_at, updated_at: record.started_at, ...structuredClone(record) }
      records.push(created)
      return structuredClone(created)
    },
    async update(id, patch, filters = {}) {
      const index = records.findIndex((record) => String(record.id) === String(id) && (!filters.user_id || record.user_id === filters.user_id))
      if (index < 0) throw new Error('not found')
      records[index] = { ...records[index], ...structuredClone(patch), updated_at: patch.completed_at || patch.cancelled_at || patch.resumed_at || patch.paused_at || records[index].updated_at }
      return structuredClone(records[index])
    }
  }
}

test('service starts one provider-agnostic execution session from a canonical activity', async () => {
  const service = createExecutionSessionService(fakeAdapter())
  const session = await service.start('user-1', activity, at(0))

  assert.equal(session.user_id, 'user-1')
  assert.equal(session.activity_id, 'task:42')
  assert.equal(session.source_id, '42')
  assert.equal(session.title_snapshot, 'Prepare weekly report')
  assert.equal(session.status, 'in_progress')
})

test('service rejects a second active session for the same user', async () => {
  const adapter = fakeAdapter([
    { id: '1', user_id: 'user-1', activity_id: 'task:1', source_id: '1', activity_type: 'task', title_snapshot: 'Existing', status: 'paused', started_at: at(0), paused_at: at(1), updated_at: at(1) }
  ])
  const service = createExecutionSessionService(adapter)

  await assert.rejects(
    () => service.start('user-1', activity, at(2)),
    (error) => error.code === 'EXECUTION_SESSION_ALREADY_ACTIVE' && error.session.id === '1'
  )
})

test('service finds the newest active recovery session', async () => {
  const adapter = fakeAdapter([
    { id: '1', user_id: 'user-1', status: 'paused', started_at: at(0), updated_at: at(2) },
    { id: '2', user_id: 'user-1', status: 'in_progress', started_at: at(3), updated_at: at(4) },
    { id: '3', user_id: 'user-1', status: 'completed', started_at: at(0), completed_at: at(5), updated_at: at(5) }
  ])
  const service = createExecutionSessionService(adapter)

  assert.equal((await service.getCurrent('user-1')).id, '2')
})

test('pause resume complete and cancel persist only lifecycle patches through the adapter', async () => {
  const adapter = fakeAdapter()
  const service = createExecutionSessionService(adapter)
  const started = await service.start('user-1', activity, at(0))
  const paused = await service.pause(started, at(5))
  const resumed = await service.resume(paused, at(10))
  const completed = await service.complete(resumed, at(15))

  assert.equal(paused.status, 'paused')
  assert.equal(resumed.status, 'in_progress')
  assert.equal(completed.status, 'completed')
  assert.equal(completed.completed_at, at(15))

  const service2 = createExecutionSessionService(fakeAdapter())
  const second = await service2.start('user-2', { ...activity, id: 'task:84', source_id: '84' }, at(20))
  const cancelled = await service2.cancel(second, at(25))
  assert.equal(cancelled.status, 'cancelled')
  assert.equal(cancelled.cancelled_at, at(25))
})
