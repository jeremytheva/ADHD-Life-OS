import { deriveExecutionPresentation } from '../domain/execution/executionPresentation.js'

const REQUIRED_COORDINATOR_METHODS = ['getCurrent', 'start', 'pause', 'resume', 'cancel', 'complete']

const hasCoordinatorContract = (coordinator) => (
  coordinator && REQUIRED_COORDINATOR_METHODS.every((method) => typeof coordinator[method] === 'function')
)

const unavailable = (reason = 'execution_provider_unavailable') => Object.freeze({
  available: false,
  reason,
  mode: 'unavailable',
  can_start: false,
  message: 'Execution tracking is not available yet. Your recommendation is still safe to review.'
})

export const createExecutionRuntime = ({ coordinator } = {}) => {
  if (!hasCoordinatorContract(coordinator)) {
    return Object.freeze({
      available: false,
      reason: 'execution_provider_unavailable',
      async getState() {
        return unavailable()
      }
    })
  }

  return Object.freeze({
    available: true,
    reason: null,

    async getState({ userId, recommendation = null, latestResult = null } = {}) {
      if (!userId) throw new Error('A user id is required to load execution state.')
      const currentExecution = await coordinator.getCurrent(userId)
      return Object.freeze({
        available: true,
        reason: null,
        presentation: deriveExecutionPresentation({ recommendation, currentExecution, latestResult }),
        currentExecution
      })
    },

    async start({ userId, activity, at } = {}) {
      if (!userId) throw new Error('A user id is required to start execution.')
      return coordinator.start(userId, activity, at)
    },

    async pause({ session, at } = {}) {
      return coordinator.pause(session, at)
    },

    async resume({ session, at } = {}) {
      return coordinator.resume(session, at)
    },

    async cancel({ session, at } = {}) {
      return coordinator.cancel(session, at)
    },

    async complete({ session, at } = {}) {
      return coordinator.complete(session, at)
    }
  })
}

export const executionRuntimeRequirements = REQUIRED_COORDINATOR_METHODS

export default createExecutionRuntime
