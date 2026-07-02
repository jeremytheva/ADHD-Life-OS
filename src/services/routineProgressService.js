import { supabase, isSupabaseEnabled } from '../config/supabase'
import { getCurrentUserId } from './authStorage'
import {
  getUserScopedCollection,
  setUserScopedCollection
} from './storageService'

// Mock storage keys
const MOCK_PROGRESS_KEY = 'adhd_lifeos_routine_progress'
const MOCK_HISTORY_KEY = 'adhd_lifeos_routine_history'


// Mock data helpers
const getUserProgress = (userId) => getUserScopedCollection(MOCK_PROGRESS_KEY, userId)

const setUserProgress = (userId, progress) => {
  setUserScopedCollection(MOCK_PROGRESS_KEY, userId, progress)
}

const getUserHistory = (userId) => getUserScopedCollection(MOCK_HISTORY_KEY, userId)

const setUserHistory = (userId, history) => {
  setUserScopedCollection(MOCK_HISTORY_KEY, userId, history)
}

const isSupabaseConfigured = () => {
  return isSupabaseEnabled
}

export const routineProgressService = {
  // Start a routine session
  async startRoutine(routineId, routine) {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No user logged in')

    const session = {
      id: Date.now().toString(),
      user_id: userId,
      routine_id: routineId,
      routine_name: routine.name,
      started_at: new Date().toISOString(),
      current_step_index: 0,
      completed_steps: [],
      status: 'in_progress',
      total_steps: routine.routine_steps?.length || 0
    }

    if (!isSupabaseConfigured()) {
      const progress = getUserProgress(userId)
      progress.push(session)
      setUserProgress(userId, progress)
      return session
    }

    // TODO: Supabase implementation
    return session
  },

  // Get active routine session
  async getActiveSession(routineId) {
    const userId = getCurrentUserId()
    if (!userId) return null

    if (!isSupabaseConfigured()) {
      const progress = getUserProgress(userId)
      return progress.find(
        p => p.user_id === userId && 
             p.routine_id === routineId && 
             p.status === 'in_progress'
      ) || null
    }

    // TODO: Supabase implementation
    return null
  },

  // Complete a step
  async completeStep(sessionId, stepIndex, stepId) {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No user logged in')

    if (!isSupabaseConfigured()) {
      const progress = getUserProgress(userId)
      const session = progress.find(
        p => p.id === sessionId && p.user_id === userId
      )

      if (!session) throw new Error('Session not found')

      session.completed_steps.push({
        step_index: stepIndex,
        step_id: stepId,
        completed_at: new Date().toISOString()
      })
      session.current_step_index = stepIndex + 1
      session.updated_at = new Date().toISOString()

      setUserProgress(userId, progress)
      return session
    }

    // TODO: Supabase implementation
    return null
  },

  // Skip a step
  async skipStep(sessionId, stepIndex, stepId) {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No user logged in')

    if (!isSupabaseConfigured()) {
      const progress = getUserProgress(userId)
      const session = progress.find(
        p => p.id === sessionId && p.user_id === userId
      )

      if (!session) throw new Error('Session not found')

      session.completed_steps.push({
        step_index: stepIndex,
        step_id: stepId,
        skipped: true,
        completed_at: new Date().toISOString()
      })
      session.current_step_index = stepIndex + 1
      session.updated_at = new Date().toISOString()

      setUserProgress(userId, progress)
      return session
    }

    // TODO: Supabase implementation
    return null
  },

  // Complete entire routine
  async completeRoutine(sessionId) {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No user logged in')

    if (!isSupabaseConfigured()) {
      const progress = getUserProgress(userId)
      const sessionIndex = progress.findIndex(
        p => p.id === sessionId && p.user_id === userId
      )

      if (sessionIndex === -1) throw new Error('Session not found')

      const session = progress[sessionIndex]
      session.status = 'completed'
      session.completed_at = new Date().toISOString()

      // Move to history
      const history = getUserHistory(userId)
      history.push(session)
      setUserHistory(userId, history)

      // Remove from active progress
      progress.splice(sessionIndex, 1)
      setUserProgress(userId, progress)

      return session
    }

    // TODO: Supabase implementation
    return null
  },

  // Cancel routine
  async cancelRoutine(sessionId) {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('No user logged in')

    if (!isSupabaseConfigured()) {
      const progress = getUserProgress(userId)
      const filtered = progress.filter(
        p => !(p.id === sessionId && p.user_id === userId)
      )
      setUserProgress(userId, filtered)
      return true
    }

    // TODO: Supabase implementation
    return true
  },

  // Get routine history
  async getRoutineHistory(routineId, limit = 30) {
    const userId = getCurrentUserId()
    if (!userId) return []

    if (!isSupabaseConfigured()) {
      const history = getUserHistory(userId)
      return history
        .filter(h => h.user_id === userId && h.routine_id === routineId)
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
        .slice(0, limit)
    }

    // TODO: Supabase implementation
    return []
  },

  // Get routine statistics
  async getRoutineStats(routineId, days = 30) {
    const userId = getCurrentUserId()
    if (!userId) return null

    if (!isSupabaseConfigured()) {
      const history = getUserHistory(userId)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const recentSessions = history.filter(
        h => h.user_id === userId && 
             h.routine_id === routineId &&
             new Date(h.completed_at) >= cutoffDate
      )

      const totalSessions = recentSessions.length
      const completedSteps = recentSessions.reduce(
        (sum, session) => sum + session.completed_steps.filter(s => !s.skipped).length,
        0
      )
      const skippedSteps = recentSessions.reduce(
        (sum, session) => sum + session.completed_steps.filter(s => s.skipped).length,
        0
      )

      return {
        total_completions: totalSessions,
        completion_rate: totalSessions > 0 
          ? ((completedSteps / (completedSteps + skippedSteps)) * 100).toFixed(1)
          : 0,
        average_completion_time: this.calculateAverageTime(recentSessions),
        current_streak: this.calculateStreak(recentSessions),
        last_completed: recentSessions.length > 0 
          ? recentSessions[0].completed_at 
          : null
      }
    }

    // TODO: Supabase implementation
    return null
  },

  // Calculate average completion time
  calculateAverageTime(sessions) {
    if (sessions.length === 0) return 0

    const totalMinutes = sessions.reduce((sum, session) => {
      const start = new Date(session.started_at)
      const end = new Date(session.completed_at)
      return sum + (end - start) / 1000 / 60
    }, 0)

    return Math.round(totalMinutes / sessions.length)
  },

  // Calculate completion streak
  calculateStreak(sessions) {
    if (sessions.length === 0) return 0

    // Sort by completion date (newest first)
    const sorted = [...sessions].sort(
      (a, b) => new Date(b.completed_at) - new Date(a.completed_at)
    )

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const session of sorted) {
      const sessionDate = new Date(session.completed_at)
      sessionDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor(
        (currentDate - sessionDate) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === streak) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (diffDays > streak) {
        break
      }
    }

    return streak
  }
}