import { differenceInDays, isPast, isToday, isTomorrow, parseISO } from 'date-fns'
import { taskPriorityModel } from './taskPriorityModel'
import { taskRecommender } from './taskRecommender'

const DEFAULT_USER_STATE = {
  current_energy: 'medium',
  mood: 'neutral'
}

const toUserState = (userState = {}) => ({
  ...DEFAULT_USER_STATE,
  ...userState,
  available_time: userState.available_time || getAvailableTimeFromBlocks(userState.availableTimeBlocks)
})

const getAvailableTimeFromBlocks = (availableTimeBlocks = []) => {
  if (!Array.isArray(availableTimeBlocks) || availableTimeBlocks.length === 0) return undefined
  return Math.max(...availableTimeBlocks.map(block => block.duration || 0)) || undefined
}

const getPriorityLevel = (score) => {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

const getUrgencyReason = (task) => {
  if (!task.due_date) return 'No deadline'

  const dueDate = parseISO(task.due_date)

  if (isPast(dueDate) && !isToday(dueDate)) return 'Overdue'
  if (isToday(dueDate)) return 'Due today'
  if (isTomorrow(dueDate)) return 'Due tomorrow'

  const daysUntilDue = differenceInDays(dueDate, new Date())

  if (daysUntilDue <= 3) return `Due in ${daysUntilDue} days`
  if (daysUntilDue <= 7) return 'Due this week'
  if (daysUntilDue <= 14) return 'Due in 2 weeks'

  return `Due in ${daysUntilDue} days`
}

const withCompatibilityFields = (task, userState = {}) => {
  const priorityScore = taskPriorityModel.calculatePriorityScore(task, userState)
  const urgencyScore = taskPriorityModel.calculateUrgencyScore(task)
  const energyMatchScore = taskPriorityModel.calculateEnergyMatchScore(task, userState)
  const interestScore = taskPriorityModel.calculateInterestScore(task)
  const contextMatchScore = taskPriorityModel.calculateContextMatchScore(task, userState)

  return {
    ...task,
    priority_score: priorityScore,
    urgency_score: urgencyScore,
    energy_match_score: energyMatchScore,
    interest_score: interestScore,
    context_match_score: contextMatchScore,
    priorityScore,
    priorityLevel: getPriorityLevel(priorityScore),
    urgencyReason: getUrgencyReason(task)
  }
}

export const adhdPriorityService = {
  prioritizeTasks(tasks = [], userState = {}) {
    const normalizedUserState = toUserState(userState)

    return tasks
      .map(task => withCompatibilityFields(task, normalizedUserState))
      .sort((a, b) => b.priorityScore - a.priorityScore)
  },

  getRecommendedTasks(tasks = [], userState = {}, limit = 3) {
    const normalizedUserState = toUserState(userState)
    const recommendations = taskRecommender.getRecommendations(tasks, normalizedUserState)

    const recommendedTasks = recommendations.map(recommendation => ({
      ...withCompatibilityFields(recommendation.task, normalizedUserState),
      recommendation_reason: recommendation.reason,
      dopamine_path: recommendation.path,
      recommendationConfidence: recommendation.confidence
    }))

    if (recommendedTasks.length >= limit) {
      return recommendedTasks.slice(0, limit)
    }

    const recommendedIds = new Set(recommendedTasks.map(task => task.id))
    const fallbackTasks = this.prioritizeTasks(tasks, normalizedUserState)
      .filter(task => !recommendedIds.has(task.id))
      .slice(0, limit - recommendedTasks.length)

    return [...recommendedTasks, ...fallbackTasks]
  },

  analyzeTaskLoad(tasks = [], userState = {}) {
    const prioritized = this.prioritizeTasks(tasks, userState)

    return {
      total: tasks.length,
      critical: prioritized.filter(task => task.priorityLevel === 'critical').length,
      high: prioritized.filter(task => task.priorityLevel === 'high').length,
      medium: prioritized.filter(task => task.priorityLevel === 'medium').length,
      low: prioritized.filter(task => task.priorityLevel === 'low').length,
      overdue: prioritized.filter(task => (
        !task.completed &&
        task.due_date &&
        isPast(parseISO(task.due_date)) &&
        !isToday(parseISO(task.due_date))
      )).length,
      dueToday: prioritized.filter(task => (
        task.due_date && isToday(parseISO(task.due_date))
      )).length,
      estimatedTime: tasks.reduce((sum, task) => sum + (task.estimated_duration || 60), 0)
    }
  }
}

export default adhdPriorityService
