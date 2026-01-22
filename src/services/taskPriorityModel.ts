import { 
  PrioritizedTask, 
  UserState, 
  ScoringWeights,
  EnergyLevel,
  TaskPriorityMetadata
} from '../types/taskPriority'
import { differenceInDays, parseISO, isToday, isTomorrow, isPast } from 'date-fns'

/**
 * ADHD Task Priority Model
 * Scores tasks based on multiple factors optimized for ADHD brains
 */

const DEFAULT_WEIGHTS: ScoringWeights = {
  urgency: 0.30,
  energy_match: 0.25,
  interest: 0.20,
  context_match: 0.15,
  completion_likelihood: 0.10
}

// Energy level numeric values for calculations
const ENERGY_VALUES: Record<EnergyLevel, number> = {
  low: 1,
  medium: 2,
  high: 3
}

export class TaskPriorityModel {
  private weights: ScoringWeights

  constructor(weights?: Partial<ScoringWeights>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights }
  }

  /**
   * Calculate overall priority score for a task
   */
  calculatePriorityScore(
    task: PrioritizedTask,
    userState?: UserState
  ): number {
    const urgency = this.calculateUrgencyScore(task)
    const energyMatch = this.calculateEnergyMatchScore(task, userState)
    const interest = this.calculateInterestScore(task)
    const contextMatch = this.calculateContextMatchScore(task, userState)
    const completionLikelihood = this.calculateCompletionLikelihoodScore(task)

    const weightedScore = 
      (urgency * this.weights.urgency) +
      (energyMatch * this.weights.energy_match) +
      (interest * this.weights.interest) +
      (contextMatch * this.weights.context_match) +
      (completionLikelihood * this.weights.completion_likelihood)

    return Math.round(weightedScore)
  }

  /**
   * Urgency Score (0-100)
   * Based on due date and essential flag
   */
  calculateUrgencyScore(task: PrioritizedTask): number {
    let score = 50 // Base score for tasks without due date

    if (task.due_date) {
      const dueDate = parseISO(task.due_date)
      
      if (isPast(dueDate) && !isToday(dueDate)) {
        score = 95 // Past due (but no shame!)
      } else if (isToday(dueDate)) {
        score = 90 // Due today
      } else if (isTomorrow(dueDate)) {
        score = 80 // Due tomorrow
      } else {
        const daysUntilDue = differenceInDays(dueDate, new Date())
        if (daysUntilDue <= 3) score = 70
        else if (daysUntilDue <= 7) score = 60
        else if (daysUntilDue <= 14) score = 50
        else score = 40
      }
    }

    // Essential tasks get +20 boost
    if (task.is_essential) {
      score = Math.min(100, score + 20)
    }

    return score
  }

  /**
   * Energy Match Score (0-100)
   * How well task energy requirement matches user's current energy
   */
  calculateEnergyMatchScore(
    task: PrioritizedTask,
    userState?: UserState
  ): number {
    if (!task.priority_metadata?.energy_required || !userState?.current_energy) {
      return 50 // Neutral if no data
    }

    const taskEnergy = ENERGY_VALUES[task.priority_metadata.energy_required]
    const userEnergy = ENERGY_VALUES[userState.current_energy]

    // Perfect match
    if (taskEnergy === userEnergy) {
      return 100
    }

    // Task requires less energy than available (good!)
    if (taskEnergy < userEnergy) {
      return 85
    }

    // Task requires more energy (less ideal)
    const energyGap = taskEnergy - userEnergy
    if (energyGap === 1) return 60
    if (energyGap === 2) return 30

    return 30
  }

  /**
   * Interest Score (0-100)
   * Based on interest level and aversiveness
   */
  calculateInterestScore(task: PrioritizedTask): number {
    const metadata = task.priority_metadata

    if (!metadata) {
      return 50 // Neutral
    }

    let score = 50

    // Interest level boost (1-5 scale)
    if (metadata.interest_level) {
      score = 20 + (metadata.interest_level * 16) // Maps 1-5 to 36-100
    }

    // Aversiveness penalty (1-5 scale)
    if (metadata.aversiveness) {
      const penalty = metadata.aversiveness * 10
      score = Math.max(10, score - penalty)
    }

    return score
  }

  /**
   * Context Match Score (0-100)
   * How well task context matches user's current situation
   */
  calculateContextMatchScore(
    task: PrioritizedTask,
    userState?: UserState
  ): number {
    if (!task.priority_metadata || !userState) {
      return 50 // Neutral
    }

    let matches = 0
    let total = 0

    // Time match
    if (task.priority_metadata.time_required && userState.available_time) {
      total++
      if (task.priority_metadata.time_required <= userState.available_time) {
        matches++
      }
    }

    // Location match
    if (task.priority_metadata.location && userState.current_location) {
      total++
      if (task.priority_metadata.location === userState.current_location) {
        matches++
      }
    }

    // Available items match
    if (task.priority_metadata.available_items && userState.available_items) {
      total++
      const hasAllItems = task.priority_metadata.available_items.every(
        item => userState.available_items?.includes(item)
      )
      if (hasAllItems) {
        matches++
      }
    }

    if (total === 0) return 50 // No context data

    return Math.round((matches / total) * 100)
  }

  /**
   * Completion Likelihood Score (0-100)
   * Based on task characteristics and history
   */
  calculateCompletionLikelihoodScore(task: PrioritizedTask): number {
    let score = 70 // Optimistic base score

    const metadata = task.priority_metadata

    // Short tasks more likely to complete
    const duration = task.estimated_duration || metadata?.time_required || 60
    if (duration <= 10) score += 20
    else if (duration <= 30) score += 10
    else if (duration > 90) score -= 20

    // High interest tasks more likely to complete
    if (metadata?.interest_level && metadata.interest_level >= 4) {
      score += 15
    }

    // Very aversive tasks less likely to complete
    if (metadata?.aversiveness && metadata.aversiveness >= 4) {
      score -= 25
    }

    // History-based adjustment
    if (metadata?.completion_history) {
      const { attempts, completions } = metadata.completion_history
      if (attempts > 0) {
        const completionRate = completions / attempts
        if (completionRate > 0.7) score += 10
        else if (completionRate < 0.3) score -= 15
      }
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Update weights based on user preference
   */
  updateWeights(newWeights: Partial<ScoringWeights>): void {
    this.weights = { ...this.weights, ...newWeights }
  }

  /**
   * Get current weights
   */
  getWeights(): ScoringWeights {
    return { ...this.weights }
  }
}

export const taskPriorityModel = new TaskPriorityModel()