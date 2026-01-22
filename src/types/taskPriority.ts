/**
 * Task Priority System - Type Definitions
 * ADHD-optimized task metadata and prioritization types
 */

export type EnergyLevel = 'low' | 'medium' | 'high'
export type LocationTag = string // Free-form location tags
export type ItemTag = string // Available items/tools

/**
 * Task Priority Metadata
 * Optional fields that enhance task prioritization
 */
export interface TaskPriorityMetadata {
  // Energy & Effort
  energy_required?: EnergyLevel
  
  // Time
  time_required?: number // minutes
  
  // Context
  location?: LocationTag
  available_items?: ItemTag[]
  
  // Motivation
  interest_level?: number // 1-5 scale
  aversiveness?: number // 1-5 scale (how much you dread it)
  
  // Behavioral
  completion_history?: {
    attempts: number
    completions: number
    last_attempt?: string // ISO date
    last_completion?: string // ISO date
  }
}

/**
 * User Current State
 * Context about user's current situation
 */
export interface UserState {
  current_energy?: EnergyLevel
  available_time?: number // minutes
  current_location?: LocationTag
  available_items?: ItemTag[]
  mood?: 'motivated' | 'neutral' | 'struggling'
}

/**
 * Task with Priority Data
 */
export interface PrioritizedTask {
  id: string
  title: string
  description?: string
  due_date?: string
  is_essential?: boolean
  estimated_duration?: number
  
  // Priority metadata
  priority_metadata?: TaskPriorityMetadata
  
  // Calculated scores
  priority_score?: number // 0-100
  urgency_score?: number // 0-100
  energy_match_score?: number // 0-100
  interest_score?: number // 0-100
  context_match_score?: number // 0-100
  
  // Recommendation metadata
  recommendation_reason?: string
  dopamine_path?: 'quick_win' | 'momentum' | 'brave_frog'
}

/**
 * Scoring Weights Configuration
 * User can adjust these to personalize recommendations
 */
export interface ScoringWeights {
  urgency: number // Default: 0.30
  energy_match: number // Default: 0.25
  interest: number // Default: 0.20
  context_match: number // Default: 0.15
  completion_likelihood: number // Default: 0.10
}

/**
 * Task Filter Criteria
 */
export interface TaskFilterCriteria {
  max_time?: number // "I have X minutes"
  energy_level?: EnergyLevel // "I'm low/medium/high energy"
  location?: LocationTag // "I'm at home/office/café"
  required_items?: ItemTag[] // "I have my laptop"
  min_interest?: number // Only show tasks I find interesting
  exclude_aversive?: boolean // Hide dreaded tasks
}

/**
 * Task Recommendation
 */
export interface TaskRecommendation {
  task: PrioritizedTask
  score: number
  path: 'quick_win' | 'momentum' | 'brave_frog'
  reason: string
  confidence: number // 0-1
}

/**
 * Dopamine Path Configuration
 */
export interface DopaminePathConfig {
  quick_win: {
    max_time: number // 15 minutes
    max_energy: EnergyLevel // low
    min_interest: number // 3
  }
  momentum: {
    max_time: number // 45 minutes
    energy_range: [EnergyLevel, EnergyLevel] // medium-high
    min_interest: number // 2
  }
  brave_frog: {
    min_aversiveness: number // 3
    is_essential: boolean // true
    microform_time: number // Break into 10-min chunks
  }
}

/**
 * User Feedback on Recommendation
 */
export interface RecommendationFeedback {
  task_id: string
  was_helpful: boolean
  was_completed: boolean
  actual_energy_used?: EnergyLevel
  actual_time_used?: number
  notes?: string
  timestamp: string
}