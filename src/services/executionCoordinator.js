import { resolveExecutionEntry } from '../domain/execution/executionEntry.js'
import { decideReplanning } from '../domain/execution/replanningPolicy.js'

const requireMethod = (value, method, label) => {
  if (!value || typeof value[method] !== 'function') {
    throw new Error(`${label} with ${method} is required.`)
  }
  return value
}

const asResult = (status, values = {}) => Object.freeze({ status, ...values })

export const createExecutionCoordinator = ({
  sessionService,
  routineEntryAdapter,
  completionService
} = {}) => {
  const sessions = requireMethod(sessionService, 'getCurrent', 'An execution-session service')
  const completion = requireMethod(completionService, 'complete', 'An execution-completion service')

  const routeRoutine = async (entry, activity) => {
    const routines = requireMethod(routineEntryAdapter, 'open', 'A routine-entry adapter')
    const routed = await routines.open({
      routine_id: entry.routine_id,
      step_id: entry.step_id,
      activity
    })

    return asResult('routed', {
      owner: 'routine_session',
      entry,
      routine: routed,
      replanning: decideReplanning({ event: 'execution_paused' })
    })
  }

  return Object.freeze({
    async getCurrent(userId) {
      const session = await sessions.getCurrent(userId)
      return session
        ? asResult('active', { owner: 'generic_session', session })
        : asResult('idle', { owner: null, session: null })
    },

    async start(userId, activity, startedAt = new Date()) {
      const entry = resolveExecutionEntry(activity)

      if (entry.owner === 'routine_session') {
        return routeRoutine(entry, activity)
      }

      requireMethod(sessions, 'start', 'An execution-session service')
      const session = await sessions.start(userId, activity, startedAt)
      return asResult('started', {
        owner: 'generic_session',
        entry,
        session,
        replanning: decideReplanning({ event: 'execution_paused' })
      })
    },

    async pause(session, pausedAt = new Date()) {
      requireMethod(sessions, 'pause', 'An execution-session service')
      const next = await sessions.pause(session, pausedAt)
      return asResult('paused', {
        owner: 'generic_session',
        session: next,
        replanning: decideReplanning({ event: 'execution_paused' })
      })
    },

    async resume(session, resumedAt = new Date()) {
      requireMethod(sessions, 'resume', 'An execution-session service')
      const next = await sessions.resume(session, resumedAt)
      return asResult('resumed', {
        owner: 'generic_session',
        session: next,
        replanning: decideReplanning({ event: 'execution_paused' })
      })
    },

    async cancel(session, cancelledAt = new Date()) {
      requireMethod(sessions, 'cancel', 'An execution-session service')
      const next = await sessions.cancel(session, cancelledAt)
      return asResult('cancelled', {
        owner: 'generic_session',
        session: next,
        replanning: decideReplanning({ event: 'execution_cancelled' })
      })
    },

    async complete(session, completedAt = new Date()) {
      const outcome = await completion.complete(session, completedAt)
      return asResult(outcome.status, {
        owner: 'generic_session',
        outcome,
        replanning: decideReplanning({ event: 'execution_completed', outcome })
      })
    },

    contextChanged() {
      return asResult('context_changed', {
        replanning: decideReplanning({ contextChanged: true })
      })
    },

    notNow() {
      return asResult('not_now', {
        replanning: decideReplanning({ event: 'not_now' })
      })
    }
  })
}

export default createExecutionCoordinator
