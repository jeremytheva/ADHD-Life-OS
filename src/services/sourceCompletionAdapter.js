const HANDLER_BY_TYPE = Object.freeze({
  task: 'task',
  project_task: 'projectTask',
  chore: 'chore'
})

const unsupported = (activityType) => {
  const error = new Error(`Source completion is not supported for activity type: ${activityType || 'unknown'}`)
  error.code = 'SOURCE_COMPLETION_UNSUPPORTED'
  error.activity_type = activityType || null
  return error
}

export const createSourceCompletionAdapter = (handlers = {}) => Object.freeze({
  async complete(input = {}) {
    const activityType = input.activity_type

    if (activityType === 'routine_step') {
      return {
        status: 'not_required',
        reason: 'routine_step_is_reusable_definition',
        source_id: input.source_id,
        source_parent_id: input.source_parent_id || null
      }
    }

    const handlerName = HANDLER_BY_TYPE[activityType]
    const handler = handlerName ? handlers[handlerName] : null
    if (typeof handler !== 'function') throw unsupported(activityType)

    return handler({
      source_id: input.source_id,
      source_parent_id: input.source_parent_id || null,
      execution_session: input.execution_session
    })
  }
})

export const sourceCompletionHandlerTypes = HANDLER_BY_TYPE

export default createSourceCompletionAdapter
