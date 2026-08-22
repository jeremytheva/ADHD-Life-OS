import { activityService } from './activityService'
import { adhdPriorityService } from './adhdPriorityService'
import {
  buildExecutionOption,
  normalizeExecutionState,
  selectEligibleActivities
} from '../domain/execution/executionPolicy'

const DEFAULT_LIMIT = 3

const dedupeById = (items = []) => {
  const seen = new Set()
  return items.filter((item) => {
    const id = item?.id
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

export const executionEngine = {
  rankActivities(activities = [], userState = {}, options = {}) {
    const state = normalizeExecutionState(userState)
    const limit = Math.max(1, Number(options.limit) || DEFAULT_LIMIT)
    const eligible = selectEligibleActivities(activities, state)

    if (eligible.length === 0) {
      return {
        state,
        candidate_count: 0,
        recommendations: []
      }
    }

    const pathwayRecommendations = adhdPriorityService.getRecommendedTasks(
      eligible,
      state,
      Math.max(limit, DEFAULT_LIMIT)
    )

    const recommendationById = new Map(
      pathwayRecommendations.map((item) => [item.id, item])
    )

    const fallback = adhdPriorityService.prioritizeTasks(eligible, state)
    const rankedActivities = dedupeById([
      ...pathwayRecommendations,
      ...fallback
    ]).slice(0, limit)

    return {
      state,
      candidate_count: eligible.length,
      recommendations: rankedActivities.map((activity, index) => (
        buildExecutionOption(
          activity,
          recommendationById.get(activity.id) || activity,
          state,
          index + 1
        )
      ))
    }
  },

  async getNextActions(userState = {}, options = {}) {
    const activities = await activityService.getActivities()
    return this.rankActivities(activities, userState, options)
  },

  async getBestNextAction(userState = {}, options = {}) {
    const result = await this.getNextActions(userState, { ...options, limit: 1 })
    return result.recommendations[0] || null
  }
}

export default executionEngine
