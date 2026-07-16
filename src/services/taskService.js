import { isBefore, isValid, parseISO, startOfToday } from 'date-fns'
import { repositories } from '../infrastructure/nocodebackend/repositories'
import { requireAuthenticatedUser } from '../infrastructure/nocodebackend/errors'
import { getDatabaseUserId } from './authStorage'
import { taskFormSchema } from '../domains/schemas'
import { validateFormSubmission } from '../domains/validation'

const userId = () => requireAuthenticatedUser(getDatabaseUserId())
const today = () => new Date().toISOString().slice(0, 10)
const completed = (task) => task.completed || task.status === 'completed'
const matches = (task, filters) => {
  const due = task.due_date?.slice(0, 10)
  if (filters.status === 'active' && completed(task)) return false
  if (filters.status === 'completed' && !completed(task)) return false
  if (filters.mode && task.mode !== filters.mode) return false
  if (filters.project_id && task.project_id !== filters.project_id) return false
  if (filters.timeframe === 'today') return due === today()
  if (filters.timeframe === 'upcoming') return due > today()
  if (filters.timeframe === 'completed') return completed(task)
  return filters.timeframe !== 'overdue' || (due && isValid(parseISO(due)) && isBefore(parseISO(due), startOfToday()) && !completed(task))
}

export const taskService = {
  async getTasks(filter = {}) {
    const filters = typeof filter === 'string' ? { timeframe: filter, status: filter === 'completed' ? 'completed' : 'active' } : { status: 'active', timeframe: 'all', ...filter }
    const tasks = await repositories.tasks.list({ user_id: userId() })
    return tasks.filter((task) => matches(task, filters)).sort((a, b) => String(a.due_date ?? '').localeCompare(String(b.due_date ?? '')))
  },
  async createTask(taskData) {
    const data = validateFormSubmission(taskFormSchema, taskData, 'Invalid task submission.')
    return repositories.tasks.create({ user_id: userId(), title: data.title, description: data.description || '', due_date: data.due_date || null, estimated_duration: data.estimated_duration || 30, is_essential: data.is_essential || false, completed: false, mode: data.mode || null, project_id: data.project_id || null, category: data.category || null, tags: data.tags || [] })
  },
  async updateTask(taskId, updates) { return repositories.tasks.update(taskId, { ...updates, updated_at: new Date().toISOString() }, { user_id: userId() }) },
  async deleteTask(taskId) { return repositories.tasks.remove(taskId, { user_id: userId() }) },
  async completeTask(taskId) { return this.updateTask(taskId, { completed: true, status: 'completed', completed_at: new Date().toISOString() }) }
}
