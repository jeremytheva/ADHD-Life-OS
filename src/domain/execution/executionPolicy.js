const TERMINAL_STATUSES = new Set(['completed', 'archived', 'cancelled'])
const BRAVE_FROG_START_MINUTES = 10

const normalizeList = (value) => (
  Array.isArray(value) ? value.filter(Boolean).map(String) : []
)

export const normalizeExecutionState = (state = {}) => ({
  current_energy: state.current_energy || 'medium',
  available_time: Number.isFinite(Number(state.available_time)) && Number(state.available_time) > 0
    ? Number(state.available_time)
    : null,
  current_location: state.current_location || null,
  available_items: normalizeList(state.available_items),
  mood: state.mood || 'neutral'
})

const getDuration = (activity = {}) => (
  Number(activity.estimated_duration_minutes ?? activity.estimated_duration ?? activity.priority_metadata?.time_required) || 60
)

const getAversiveness = (activity = {}) => (
  Number(activity.aversiveness ?? activity.priority_metadata?.aversiveness) || 0
)

const getLocation = (activity = {}) => (
  activity.priority_metadata?.location || activity.location || null
)

const getRequiredItems = (activity = {}) => normalizeList(
  activity.priority_metadata?.available_items || activity.required_items
)

const hasRequiredItems = (requiredItems, availableItems) => (
  requiredItems.length === 0 || requiredItems.every((item) => availableItems.includes(item))
)

export const isExecutionCandidate = (activity = {}, rawState = {}) => {
  const state = normalizeExecutionState(rawState)
  const status = String(activity.status || '').toLowerCase()

  if (activity.completed || TERMINAL_STATUSES.has(status)) return false

  const requiredLocation = getLocation(activity)
  if (requiredLocation && state.current_location && requiredLocation !== state.current_location) {
    return false
  }

  const requiredItems = getRequiredItems(activity)
  if (state.available_items.length > 0 && !hasRequiredItems(requiredItems, state.available_items)) {
    return false
  }

  if (state.available_time !== null) {
    const duration = getDuration(activity)
    const canMicroStart = getAversiveness(activity) >= 3 && state.available_time >= Math.min(BRAVE_FROG_START_MINUTES, duration)
    if (duration > state.available_time && !canMicroStart) return false
  }

  return true
}

export const getInitiationGuidance = (activity = {}, path = 'priority', rawState = {}) => {
  const state = normalizeExecutionState(rawState)
  const duration = getDuration(activity)

  if (path === 'brave_frog') {
    const startMinutes = Math.min(BRAVE_FROG_START_MINUTES, duration, state.available_time || BRAVE_FROG_START_MINUTES)
    return {
      start_minutes: Math.max(1, startMinutes),
      start_action: `Start ${activity.title || 'this task'} for ${Math.max(1, startMinutes)} minutes only.`
    }
  }

  if (path === 'quick_win') {
    return {
      start_minutes: Math.min(duration, 5),
      start_action: `Begin the first visible step of ${activity.title || 'this task'} now.`
    }
  }

  return {
    start_minutes: Math.min(duration, 10),
    start_action: `Open what you need and work on ${activity.title || 'this task'} for the next ${Math.min(duration, 10)} minutes.`
  }
}

export const buildExecutionOption = (activity, recommendation = {}, rawState = {}, rank = 1) => {
  const path = recommendation.dopamine_path || recommendation.path || 'priority'
  const guidance = getInitiationGuidance(activity, path, rawState)
  const duration = getDuration(activity)
  const state = normalizeExecutionState(rawState)

  return {
    rank,
    activity_id: activity.id,
    activity_type: activity.type || activity.source_type || 'task',
    source_id: activity.source_id || activity.id,
    source_parent_id: activity.source_parent_id || null,
    title: activity.title,
    path,
    score: recommendation.priorityScore ?? recommendation.priority_score ?? recommendation.score ?? 0,
    confidence: recommendation.recommendationConfidence ?? recommendation.confidence ?? null,
    reason: recommendation.recommendation_reason || recommendation.reason || 'Best current priority match',
    estimated_duration_minutes: duration,
    fits_available_time: state.available_time === null || duration <= state.available_time,
    ...guidance,
    activity
  }
}

export const selectEligibleActivities = (activities = [], state = {}) => (
  activities.filter((activity) => isExecutionCandidate(activity, state))
)
