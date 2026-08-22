import {
  PrioritizedTask,
  UserState,
  TaskRecommendation,
  DopaminePathConfig,
  TaskFilterCriteria,
  EnergyLevel
} from '../types/taskPriority'
import { taskPriorityModel } from './taskPriorityModel'

/**
 * ADHD Task Recommender
 * Suggests optimal next tasks based on dopamine paths and user state
 */

const DOPAMINE_PATHS: DopaminePathConfig = {
  quick_win: {
    max_time: 15,
    max_energy: 'low',
    min_interest: 3
  },
  momentum: {
    max_time: 45,
    energy_range: ['medium', 'high'],
    min_interest: 2
  },
  brave_frog: {
    min_aversiveness: 3,
    is_essential: true,
    microform_time: 10
  }
}

const ENERGY_VALUES: Record<EnergyLevel, number> = {
  low: 1,
  medium: 2,
  high: 3
}

export class TaskRecommender {
  /**
   * Get top 3 task recommendations across different dopamine paths
   */
  getRecommendations(
    tasks: PrioritizedTask[],
    userState?: UserState
  ): TaskRecommendation[] {
    const scoredTasks = tasks.map(task => ({
      ...task,
      priority_score: taskPriorityModel.calculatePriorityScore(task, userState),
      urgency_score: taskPriorityModel.calculateUrgencyScore(task),
      energy_match_score: taskPriorityModel.calculateEnergyMatchScore(task, userState),
      interest_score: taskPriorityModel.calculateInterestScore(task),
      context_match_score: taskPriorityModel.calculateContextMatchScore(task, userState)
    }))

    const recommendations: TaskRecommendation[] = []

    const quickWin = this.getQuickWinRecommendation(scoredTasks, userState)
    if (quickWin) recommendations.push(quickWin)

    const momentum = this.getMomentumRecommendation(scoredTasks, userState)
    if (momentum) recommendations.push(momentum)

    const braveFrog = this.getBraveFrogRecommendation(scoredTasks, userState)
    if (braveFrog) recommendations.push(braveFrog)

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }

  private getQuickWinRecommendation(
    tasks: PrioritizedTask[],
    userState?: UserState
  ): TaskRecommendation | null {
    const config = DOPAMINE_PATHS.quick_win

    const candidates = tasks.filter(task => {
      const duration = task.estimated_duration || task.priority_metadata?.time_required || 60
      const energy = task.priority_metadata?.energy_required || 'medium'
      const interest = task.priority_metadata?.interest_level || 3

      return (
        duration <= config.max_time &&
        ENERGY_VALUES[energy] <= ENERGY_VALUES[config.max_energy] &&
        interest >= config.min_interest
      )
    })

    if (candidates.length === 0) return null

    const best = candidates.reduce((a, b) =>
      (a.priority_score || 0) > (b.priority_score || 0) ? a : b
    )

    return {
      task: best,
      score: best.priority_score || 0,
      path: 'quick_win',
      reason: '⚡ Quick win! Fast completion = instant dopamine',
      confidence: this.calculateConfidence(best, userState)
    }
  }

  private getMomentumRecommendation(
    tasks: PrioritizedTask[],
    userState?: UserState
  ): TaskRecommendation | null {
    const config = DOPAMINE_PATHS.momentum

    const candidates = tasks.filter(task => {
      const duration = task.estimated_duration || task.priority_metadata?.time_required || 60
      const energy = task.priority_metadata?.energy_required || 'medium'
      const interest = task.priority_metadata?.interest_level || 2

      const [minEnergy, maxEnergy] = config.energy_range
      const energyValue = ENERGY_VALUES[energy]

      return (
        duration <= config.max_time &&
        energyValue >= ENERGY_VALUES[minEnergy] &&
        energyValue <= ENERGY_VALUES[maxEnergy] &&
        interest >= config.min_interest
      )
    })

    if (candidates.length === 0) return null

    const best = candidates.reduce((a, b) => {
      const aScore = (a.priority_score || 0) + (a.energy_match_score || 0) * 0.3
      const bScore = (b.priority_score || 0) + (b.energy_match_score || 0) * 0.3
      return aScore > bScore ? a : b
    })

    return {
      task: best,
      score: best.priority_score || 0,
      path: 'momentum',
      reason: '🎯 Momentum builder! Good match for your current energy',
      confidence: this.calculateConfidence(best, userState)
    }
  }

  private getBraveFrogRecommendation(
    tasks: PrioritizedTask[],
    userState?: UserState
  ): TaskRecommendation | null {
    const config = DOPAMINE_PATHS.brave_frog

    const candidates = tasks.filter(task => {
      const aversiveness = task.priority_metadata?.aversiveness || 0
      const essentialMatch = !config.is_essential || task.is_essential === true
      return aversiveness >= config.min_aversiveness && essentialMatch
    })

    if (candidates.length === 0) return null

    const best = candidates.reduce((a, b) =>
      (a.urgency_score || 0) > (b.urgency_score || 0) ? a : b
    )

    return {
      task: best,
      score: (best.priority_score || 0) * 0.8,
      path: 'brave_frog',
      reason: `🐸 Brave frog! Just ${config.microform_time} minutes to start`,
      confidence: this.calculateConfidence(best, userState) * 0.7
    }
  }

  filterTasks(
    tasks: PrioritizedTask[],
    criteria: TaskFilterCriteria
  ): PrioritizedTask[] {
    return tasks.filter(task => {
      const metadata = task.priority_metadata

      if (criteria.max_time) {
        const duration = task.estimated_duration || metadata?.time_required || 60
        if (duration > criteria.max_time) return false
      }

      if (criteria.energy_level && metadata?.energy_required) {
        if (ENERGY_VALUES[metadata.energy_required] > ENERGY_VALUES[criteria.energy_level]) {
          return false
        }
      }

      if (criteria.location && metadata?.location) {
        if (metadata.location !== criteria.location) return false
      }

      if (criteria.required_items && metadata?.available_items) {
        const hasAllItems = metadata.available_items.every(
          item => criteria.required_items?.includes(item)
        )
        if (!hasAllItems) return false
      }

      if (criteria.min_interest && metadata?.interest_level) {
        if (metadata.interest_level < criteria.min_interest) return false
      }

      if (criteria.exclude_aversive && metadata?.aversiveness) {
        if (metadata.aversiveness >= 3) return false
      }

      return true
    })
  }

  private calculateConfidence(
    task: PrioritizedTask,
    userState?: UserState
  ): number {
    let confidence = 0.5

    if (userState) {
      confidence += 0.2
    }

    if (task.priority_metadata) {
      const metadata = task.priority_metadata
      let metadataFields = 0
      const totalFields = 6

      if (metadata.energy_required) metadataFields++
      if (metadata.time_required) metadataFields++
      if (metadata.location) metadataFields++
      if (metadata.interest_level) metadataFields++
      if (metadata.aversiveness !== undefined) metadataFields++
      if (metadata.completion_history) metadataFields++

      confidence += (metadataFields / totalFields) * 0.3
    }

    return Math.min(1, confidence)
  }

  getBestRecommendation(
    tasks: PrioritizedTask[],
    userState?: UserState
  ): TaskRecommendation | null {
    const recommendations = this.getRecommendations(tasks, userState)
    return recommendations.length > 0 ? recommendations[0] : null
  }

  getPathRecommendations(
    tasks: PrioritizedTask[],
    path: 'quick_win' | 'momentum' | 'brave_frog',
    userState?: UserState,
    limit: number = 5
  ): TaskRecommendation[] {
    const scoredTasks = tasks.map(task => ({
      ...task,
      priority_score: taskPriorityModel.calculatePriorityScore(task, userState),
      urgency_score: taskPriorityModel.calculateUrgencyScore(task),
      energy_match_score: taskPriorityModel.calculateEnergyMatchScore(task, userState),
      interest_score: taskPriorityModel.calculateInterestScore(task),
      context_match_score: taskPriorityModel.calculateContextMatchScore(task, userState)
    }))

    let recommendations: TaskRecommendation[] = []

    switch (path) {
      case 'quick_win':
        recommendations = this.getAllQuickWins(scoredTasks, userState)
        break
      case 'momentum':
        recommendations = this.getAllMomentumTasks(scoredTasks, userState)
        break
      case 'brave_frog':
        recommendations = this.getAllBraveFrogs(scoredTasks, userState)
        break
    }

    return recommendations.slice(0, limit)
  }

  private getAllQuickWins(tasks: PrioritizedTask[], userState?: UserState): TaskRecommendation[] {
    const config = DOPAMINE_PATHS.quick_win
    return tasks
      .filter(task => {
        const duration = task.estimated_duration || task.priority_metadata?.time_required || 60
        const energy = task.priority_metadata?.energy_required || 'medium'
        const interest = task.priority_metadata?.interest_level || 3
        return (
          duration <= config.max_time &&
          ENERGY_VALUES[energy] <= ENERGY_VALUES[config.max_energy] &&
          interest >= config.min_interest
        )
      })
      .map(task => ({
        task,
        score: task.priority_score || 0,
        path: 'quick_win' as const,
        reason: '⚡ Quick win!',
        confidence: this.calculateConfidence(task, userState)
      }))
      .sort((a, b) => b.score - a.score)
  }

  private getAllMomentumTasks(tasks: PrioritizedTask[], userState?: UserState): TaskRecommendation[] {
    const config = DOPAMINE_PATHS.momentum
    return tasks
      .filter(task => {
        const duration = task.estimated_duration || task.priority_metadata?.time_required || 60
        const energy = task.priority_metadata?.energy_required || 'medium'
        const interest = task.priority_metadata?.interest_level || 2
        const [minEnergy, maxEnergy] = config.energy_range
        const energyValue = ENERGY_VALUES[energy]
        return (
          duration <= config.max_time &&
          energyValue >= ENERGY_VALUES[minEnergy] &&
          energyValue <= ENERGY_VALUES[maxEnergy] &&
          interest >= config.min_interest
        )
      })
      .map(task => ({
        task,
        score: task.priority_score || 0,
        path: 'momentum' as const,
        reason: '🎯 Momentum builder!',
        confidence: this.calculateConfidence(task, userState)
      }))
      .sort((a, b) => b.score - a.score)
  }

  private getAllBraveFrogs(tasks: PrioritizedTask[], userState?: UserState): TaskRecommendation[] {
    const config = DOPAMINE_PATHS.brave_frog
    return tasks
      .filter(task => {
        const aversiveness = task.priority_metadata?.aversiveness || 0
        const essentialMatch = !config.is_essential || task.is_essential === true
        return aversiveness >= config.min_aversiveness && essentialMatch
      })
      .map(task => ({
        task,
        score: (task.priority_score || 0) * 0.8,
        path: 'brave_frog' as const,
        reason: '🐸 Brave frog!',
        confidence: this.calculateConfidence(task, userState) * 0.7
      }))
      .sort((a, b) => b.score - a.score)
  }
}

export const taskRecommender = new TaskRecommender()
