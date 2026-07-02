import { format, parseISO } from 'date-fns'
import { SchedulingEngine } from './schedulingEngine'
import { adhdPriorityService } from './adhdPriorityService'
import { userService } from './userService'
import { taskService } from './taskService'
import { routineService } from './routineService'

export const timelineService = {
  async getTimeline(date) {
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      
      // Get user preferences
      const preferences = await userService.getPreferences()
      
      // Get tasks (prioritized)
      const allTasks = await taskService.getTasks()
      const prioritizedTasks = adhdPriorityService.prioritizeTasks(allTasks, preferences)
      
      // Get routines
      const routines = await routineService.getRoutines()
      
      // Extract routine steps
      const routineSteps = routines
        .filter(r => r.is_active)
        .flatMap(routine => 
          (routine.routine_steps || []).map(step => ({
            ...step,
            repeat_pattern: routine.repeat_pattern
          }))
        )
      
      // Create scheduling engine
      const scheduler = new SchedulingEngine(
        preferences,
        prioritizedTasks.filter(t => !t.completed),
        routineSteps,
        [] // events
      )
      
      // Generate schedule
      const schedule = scheduler.generateSchedule(date)
      
      return schedule
    } catch (error) {
      console.error('Error generating timeline:', error)
      return { blocks: [], unscheduledTasks: [] }
    }
  }
}