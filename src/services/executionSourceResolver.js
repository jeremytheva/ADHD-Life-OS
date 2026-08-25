const HANDLER_BY_TYPE = Object.freeze({
  task: 'task',
  project_task: 'projectTask',
  chore: 'chore'
})

const unsupported = (activityType) => {
  const error = new Error(`Execution source resolution is not supported for activity type: ${activityType || 'unknown'}`)
  error.code = 'EXECUTION_SOURCE_UNSUPPORTED'
  error.activity_type = activityType || null
  return error
}

/**
 * Resolve the authoritative source Activity for a recovered generic execution
 * session. Handlers own provider/domain loading and must return either a
 * canonical Activity or null when the source no longer exists.
 */
export const createExecutionSourceResolver = (handlers = {}) => Object.freeze({
  async resolve(session = {}) {
    const activityType = session.activity_type
    const handlerName = HANDLER_BY_TYPE[activityType]
    const handler = handlerName ? handlers[handlerName] : null

    if (typeof handler !== 'function') throw unsupported(activityType)

    return handler({
      source_id: session.source_id,
      source_parent_id: session.source_parent_id || null,
      activity_id: session.activity_id,
      execution_session: session
    })
  }
})

export const executionSourceResolverHandlerTypes = HANDLER_BY_TYPE

export default createExecutionSourceResolver
