const requireSessionService = (service) => {
  if (!service || typeof service.complete !== 'function') {
    throw new Error('An execution-session service with complete is required.')
  }
  return service
}

const requireSourceAdapter = (adapter) => {
  if (!adapter || typeof adapter.complete !== 'function') {
    throw new Error('A source-completion adapter with complete is required.')
  }
  return adapter
}

const failure = (phase, error) => ({
  status: 'failed',
  phase,
  execution_session_completed: false,
  source_completed: false,
  reconciliation_required: false,
  error
})

const partialSuccess = (executionSession, error) => ({
  status: 'partial_success',
  phase: 'source_completion',
  execution_session_completed: true,
  source_completed: false,
  reconciliation_required: true,
  execution_session: executionSession,
  error
})

export const createExecutionCompletionService = ({ sessionService, sourceCompletionAdapter }) => {
  const sessions = requireSessionService(sessionService)
  const sources = requireSourceAdapter(sourceCompletionAdapter)

  return Object.freeze({
    async complete(session, completedAt = new Date()) {
      let completedSession

      try {
        completedSession = await sessions.complete(session, completedAt)
      } catch (error) {
        return failure('execution_session', error)
      }

      try {
        const source = await sources.complete({
          activity_type: completedSession.activity_type,
          source_id: completedSession.source_id,
          source_parent_id: completedSession.source_parent_id || null,
          execution_session: completedSession
        })

        return {
          status: 'completed',
          phase: 'complete',
          execution_session_completed: true,
          source_completed: true,
          reconciliation_required: false,
          execution_session: completedSession,
          source
        }
      } catch (error) {
        return partialSuccess(completedSession, error)
      }
    }
  })
}

export default createExecutionCompletionService
