import { assessExecutionSourceRecovery } from '../domain/execution/executionSourceRecovery.js'

const requireResolver = (resolver) => {
  if (!resolver || typeof resolver.resolve !== 'function') {
    throw new Error('An execution source resolver with resolve is required.')
  }
  return resolver
}

export const createExecutionRecoveryService = ({ sourceResolver } = {}) => {
  const sources = requireResolver(sourceResolver)

  return Object.freeze({
    async assess(session) {
      if (!session || !['in_progress', 'paused'].includes(session.status)) {
        return {
          status: 'not_required',
          source_activity: null,
          recovery: assessExecutionSourceRecovery({ session, sourceActivity: null })
        }
      }

      let sourceActivity
      try {
        sourceActivity = await sources.resolve(session)
      } catch (error) {
        return {
          status: 'failed',
          source_activity: null,
          recovery: {
            mode: 'source_resolution_failed',
            recovery_required: true,
            can_resume: false,
            can_complete: false,
            suggested_action: 'retry_source',
            message: 'The source item could not be verified. Keep the execution session unchanged and retry authoritative source loading.'
          },
          error
        }
      }

      return {
        status: 'assessed',
        source_activity: sourceActivity,
        recovery: assessExecutionSourceRecovery({ session, sourceActivity })
      }
    }
  })
}

export default createExecutionRecoveryService
