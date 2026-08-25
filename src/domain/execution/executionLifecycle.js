const EXECUTION_STATUSES = Object.freeze(['in_progress', 'paused', 'completed', 'cancelled'])

const asDate = (value) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error('A valid execution timestamp is required.')
  return date
}

const iso = (value) => asDate(value).toISOString()

const requireActivity = (activity = {}) => {
  if (!activity.id) throw new Error('An activity id is required to start execution.')
  return activity
}

export const isExecutionStatus = (status) => EXECUTION_STATUSES.includes(status)

export const startExecution = (activity, startedAt = new Date()) => {
  const source = requireActivity(activity)
  const timestamp = iso(startedAt)

  return {
    activity_id: String(source.id),
    activity_type: source.type || source.source_type || 'task',
    source_id: String(source.source_id || source.id),
    source_parent_id: source.source_parent_id || null,
    title_snapshot: source.title || source.name || 'Untitled activity',
    status: 'in_progress',
    started_at: timestamp,
    resumed_at: null,
    paused_at: null,
    completed_at: null,
    cancelled_at: null
  }
}

export const pauseExecution = (session, pausedAt = new Date()) => {
  if (session?.status !== 'in_progress') throw new Error('Only an in-progress execution can be paused.')
  return { ...session, status: 'paused', paused_at: iso(pausedAt) }
}

export const resumeExecution = (session, resumedAt = new Date()) => {
  if (session?.status !== 'paused') throw new Error('Only a paused execution can be resumed.')
  return { ...session, status: 'in_progress', resumed_at: iso(resumedAt), paused_at: null }
}

export const completeExecution = (session, completedAt = new Date()) => {
  if (!['in_progress', 'paused'].includes(session?.status)) throw new Error('Only an active execution can be completed.')
  return { ...session, status: 'completed', completed_at: iso(completedAt), paused_at: null }
}

export const cancelExecution = (session, cancelledAt = new Date()) => {
  if (!['in_progress', 'paused'].includes(session?.status)) throw new Error('Only an active execution can be cancelled.')
  return { ...session, status: 'cancelled', cancelled_at: iso(cancelledAt), paused_at: null }
}

export const getExecutionRecoveryAction = (session) => {
  if (!session) return 'start'
  if (session.status === 'paused') return 'continue'
  if (session.status === 'in_progress') return 'resume_current'
  return 'start'
}

export const executionStatuses = EXECUTION_STATUSES
