import { repositories } from '../infrastructure/nocodebackend/repositories'
import { requireAuthenticatedUser } from '../infrastructure/nocodebackend/errors'
import { getDatabaseUserId } from './authStorage'
import { taskService } from './taskService'
import { projectFormSchema, subtaskFormSchema } from '../domains/schemas'
import { validateFormSubmission } from '../domains/validation'

const userId = () => requireAuthenticatedUser(getDatabaseUserId())
const projectGraphCache = new Map()

export const calculateProjectStats = (project) => {
  if (!project) return null

  const tasks = project.tasks ?? []
  const subtasks = tasks.flatMap((task) => task.subtasks ?? [])
  const doneTasks = tasks.filter((task) => task.completed || task.status === 'completed').length
  const doneSubtasks = subtasks.filter((subtask) => subtask.is_completed).length
  const totalItems = tasks.length + subtasks.length

  return {
    total_tasks: tasks.length,
    completed_tasks: doneTasks,
    pending_tasks: tasks.length - doneTasks,
    total_subtasks: subtasks.length,
    completed_subtasks: doneSubtasks,
    completion_percentage: totalItems
      ? Math.round(((doneTasks + doneSubtasks) / totalItems) * 100)
      : 0,
    estimated_time_remaining: tasks
      .filter((task) => !task.completed && task.status !== 'completed')
      .reduce((sum, task) => sum + (task.estimated_duration || 30), 0)
  }
}

const cacheProjects = (projects) => {
  projectGraphCache.clear()
  for (const project of projects) projectGraphCache.set(project.id, project)
  return projects
}

const invalidateProjectCache = () => projectGraphCache.clear()

export const projectService = {
  async getProjects() {
    const id = userId()
    const [projects, tasks, subtasks] = await Promise.all([
      repositories.projects.list({ user_id: id }),
      repositories.tasks.list({ user_id: id }),
      repositories.subtasks.list({ user_id: id })
    ])

    const projectGraph = projects
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((project) => ({
        ...project,
        tasks: tasks
          .filter((task) => task.project_id === project.id)
          .map((task) => ({
            ...task,
            subtasks: subtasks.filter((subtask) => subtask.task_id === task.id)
          }))
      }))

    return cacheProjects(projectGraph)
  },

  async getProject(projectId) {
    const cached = projectGraphCache.get(projectId)
    if (cached) return cached
    return (await this.getProjects()).find((project) => project.id === projectId) ?? null
  },

  async createProject(projectData) {
    const data = validateFormSubmission(projectFormSchema, projectData, 'Invalid project submission.')
    const id = userId()
    const projects = await repositories.projects.list({ user_id: id })
    const project = await repositories.projects.create({
      user_id: id,
      title: data.title,
      description: data.description || '',
      color: data.color || 'blue',
      icon: data.icon || '📁',
      status: 'active',
      goal: data.goal || '',
      target_date: data.target_date || null,
      mode: data.mode || null,
      category: data.category || null,
      tags: data.tags || [],
      order_index: Math.max(-1, ...projects.map((project) => project.order_index ?? 0)) + 1
    })
    invalidateProjectCache()
    return project
  },

  async updateProject(projectId, updates) {
    const project = await repositories.projects.update(
      projectId,
      { ...updates, updated_at: new Date().toISOString() },
      { user_id: userId() }
    )
    invalidateProjectCache()
    return project
  },

  async deleteProject(projectId) {
    const result = await repositories.projects.remove(projectId, { user_id: userId() })
    invalidateProjectCache()
    return result
  },

  async getProjectStats(projectId) {
    const project = projectGraphCache.get(projectId) ?? await this.getProject(projectId)
    return calculateProjectStats(project)
  },

  async createTask(projectId, taskData) {
    const task = await taskService.createTask({ ...taskData, project_id: projectId })
    invalidateProjectCache()
    return task
  },

  async updateTask(taskId, updates) {
    const task = await taskService.updateTask(taskId, updates)
    invalidateProjectCache()
    return task
  },

  async deleteTask(taskId) {
    const result = await taskService.deleteTask(taskId)
    invalidateProjectCache()
    return result
  },

  async completeTask(taskId) {
    const task = await taskService.completeTask(taskId)
    invalidateProjectCache()
    return task
  },

  async createSubtask(taskId, subtaskData) {
    const data = validateFormSubmission(subtaskFormSchema, subtaskData, 'Invalid subtask submission.')
    const subtask = await repositories.subtasks.create({
      user_id: userId(),
      task_id: taskId,
      title: data.title,
      description: data.description || '',
      estimated_duration: data.estimated_duration || null,
      is_completed: false,
      order_index: data.order_index ?? 0
    })
    invalidateProjectCache()
    return subtask
  },

  async completeSubtask(subtaskId) {
    return this.updateSubtask(subtaskId, {
      is_completed: true,
      completed_at: new Date().toISOString()
    })
  },

  async uncompleteSubtask(subtaskId) {
    return this.updateSubtask(subtaskId, { is_completed: false, completed_at: null })
  },

  async updateSubtask(subtaskId, updates) {
    const subtask = await repositories.subtasks.update(
      subtaskId,
      { ...updates, updated_at: new Date().toISOString() },
      { user_id: userId() }
    )
    invalidateProjectCache()
    return subtask
  },

  async deleteSubtask(subtaskId) {
    const result = await repositories.subtasks.remove(subtaskId, { user_id: userId() })
    invalidateProjectCache()
    return result
  }
}
