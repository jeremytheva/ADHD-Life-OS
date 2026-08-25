const unsupported = (activity) => {
  const error = new Error(`Execution entry is not supported for activity type: ${activity?.type || activity?.source_type || 'unknown'}`)
  error.code = 'EXECUTION_ENTRY_UNSUPPORTED'
  error.activity_type = activity?.type || activity?.source_type || null
  return error
}

/**
 * Decide which durable execution system owns the recommended Activity.
 *
 * Routine steps already have an established provider-backed routine-session
 * lifecycle. They therefore route into that flow instead of creating a second
 * generic execution session for the same occurrence.
 */
export const resolveExecutionEntry = (activity = {}) => {
  const activityType = activity.type || activity.source_type

  if (activityType === 'routine_step') {
    if (!activity.source_parent_id || !activity.source_id) throw unsupported(activity)

    return Object.freeze({
      owner: 'routine_session',
      action: 'open_routine',
      activity_type: 'routine_step',
      routine_id: String(activity.source_parent_id),
      step_id: String(activity.source_id),
      generic_execution_session_required: false
    })
  }

  if (['task', 'project_task', 'chore'].includes(activityType)) {
    if (!activity.id || !activity.source_id) throw unsupported(activity)

    return Object.freeze({
      owner: 'generic_execution_session',
      action: 'start_or_continue',
      activity_type: activityType,
      activity_id: String(activity.id),
      source_id: String(activity.source_id),
      source_parent_id: activity.source_parent_id ? String(activity.source_parent_id) : null,
      generic_execution_session_required: true
    })
  }

  throw unsupported(activity)
}
