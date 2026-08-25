import {
  cancelExecution,
  completeExecution,
  pauseExecution,
  resumeExecution,
  startExecution
} from '../domain/execution/executionLifecycle'

const ACTIVE_STATUSES = new Set(['in_progress', 'paused'])

const requireAdapter = (adapter) => {
  if (!adapter || typeof adapter.list !== 'function' || typeof adapter.create !== 'function' || typeof adapter.update !== 'function') {
    throw new Error('An execution-session persistence adapter with list/create/update is required.')
  }
  return adapter
}

const sortNewest = (sessions = []) => [...sessions].sort((a, b) => {
  const left = new Date(a.updated_at || a.started_at || 0).getTime()
  const right = new Date(b.updated_at || b.started_at || 0).getTime()
  return right - left
})

export const createExecutionSessionService = (persistenceAdapter) => {
  const adapter = requireAdapter(persistenceAdapter)

  const listActive = async (userId) => {
    if (!userId) throw new Error('A user id is required.')
    const sessions = await adapter.list({ user_id: userId })
    return sortNewest(sessions.filter((session) => ACTIVE_STATUSES.has(session.status)))
  }

  const getCurrent = async (userId) => {
    const active = await listActive(userId)
    return active[0] || null
  }

  const assertNoActiveSession = async (userId) => {
    const active = await listActive(userId)
    if (active.length > 0) {
      const error = new Error('An execution session is already active.')
      error.code = 'EXECUTION_SESSION_ALREADY_ACTIVE'
      error.session = active[0]
      throw error
    }
  }

  const updateLifecycle = async (session, transition, at) => {
    if (!session?.id) throw new Error('A persisted execution session id is required.')
    const next = transition(session, at)
    const { id, user_id: _userId, created_at: _createdAt, ...patch } = next
    return adapter.update(id, patch, { user_id: session.user_id })
  }

  return Object.freeze({
    listActive,
    getCurrent,

    async start(userId, activity, startedAt = new Date()) {
      if (!userId) throw new Error('A user id is required.')
      await assertNoActiveSession(userId)
      const lifecycle = startExecution(activity, startedAt)
      return adapter.create({ user_id: userId, ...lifecycle })
    },

    async pause(session, pausedAt = new Date()) {
      return updateLifecycle(session, pauseExecution, pausedAt)
    },

    async resume(session, resumedAt = new Date()) {
      return updateLifecycle(session, resumeExecution, resumedAt)
    },

    async complete(session, completedAt = new Date()) {
      return updateLifecycle(session, completeExecution, completedAt)
    },

    async cancel(session, cancelledAt = new Date()) {
      return updateLifecycle(session, cancelExecution, cancelledAt)
    }
  })
}

export default createExecutionSessionService
