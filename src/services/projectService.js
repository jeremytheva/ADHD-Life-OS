import { repositories } from '../infrastructure/nocodebackend/repositories'
import { requireAuthenticatedUser } from '../infrastructure/nocodebackend/errors'
import { getDatabaseUserId } from './authStorage'
import { taskService } from './taskService'
import { projectFormSchema, subtaskFormSchema } from '../domains/schemas'
import { validateFormSubmission } from '../domains/validation'
const userId = () => requireAuthenticatedUser(getDatabaseUserId())

export const projectService = {
  async getProjects() {
    const id = userId()
    const [projects, tasks, subtasks] = await Promise.all([repositories.projects.list({ user_id: id }), repositories.tasks.list({ user_id: id }), repositories.subtasks.list({ user_id: id })])
    return projects.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)).map((project) => ({ ...project, tasks: tasks.filter((task) => task.project_id === project.id).map((task) => ({ ...task, subtasks: subtasks.filter((subtask) => subtask.task_id === task.id) })) }))
  },
  async getProject(projectId) { return (await this.getProjects()).find((project) => project.id === projectId) ?? null },
  async createProject(projectData) {
    const data = validateFormSubmission(projectFormSchema, projectData, 'Invalid project submission.')
    const id = userId(); const projects = await repositories.projects.list({ user_id: id })
    return repositories.projects.create({ user_id: id, title: data.title, description: data.description || '', color: data.color || 'blue', icon: data.icon || '📁', status: 'active', goal: data.goal || '', target_date: data.target_date || null, mode: data.mode || null, category: data.category || null, tags: data.tags || [], order_index: Math.max(-1, ...projects.map((project) => project.order_index ?? 0)) + 1 })
  },
  async updateProject(projectId, updates) { return repositories.projects.update(projectId, { ...updates, updated_at: new Date().toISOString() }, { user_id: userId() }) },
  async deleteProject(projectId) { return repositories.projects.remove(projectId, { user_id: userId() }) },
  async getProjectStats(projectId) {
    const project = await this.getProject(projectId); if (!project) return null
    const tasks = project.tasks; const subtasks = tasks.flatMap((task) => task.subtasks); const doneTasks = tasks.filter((task) => task.completed || task.status === 'completed').length; const doneSubtasks = subtasks.filter((task) => task.is_completed).length
    return { total_tasks: tasks.length, completed_tasks: doneTasks, pending_tasks: tasks.length - doneTasks, total_subtasks: subtasks.length, completed_subtasks: doneSubtasks, completion_percentage: tasks.length + subtasks.length ? Math.round(((doneTasks + doneSubtasks) / (tasks.length + subtasks.length)) * 100) : 0, estimated_time_remaining: tasks.filter((task) => !task.completed && task.status !== 'completed').reduce((sum, task) => sum + (task.estimated_duration || 30), 0) }
  },
  async createTask(projectId, taskData) { return taskService.createTask({ ...taskData, project_id: projectId }) },
  async updateTask(taskId, updates) { return taskService.updateTask(taskId, updates) }, async deleteTask(taskId) { return taskService.deleteTask(taskId) }, async completeTask(taskId) { return taskService.completeTask(taskId) },
  async createSubtask(taskId, subtaskData) { const data = validateFormSubmission(subtaskFormSchema, subtaskData, 'Invalid subtask submission.'); return repositories.subtasks.create({ user_id: userId(), task_id: taskId, title: data.title, description: data.description || '', estimated_duration: data.estimated_duration || null, is_completed: false, order_index: data.order_index ?? 0 }) },
  async completeSubtask(subtaskId) { return this.updateSubtask(subtaskId, { is_completed: true, completed_at: new Date().toISOString() }) },
  async uncompleteSubtask(subtaskId) { return this.updateSubtask(subtaskId, { is_completed: false, completed_at: null }) },
  async updateSubtask(subtaskId, updates) { return repositories.subtasks.update(subtaskId, { ...updates, updated_at: new Date().toISOString() }, { user_id: userId() }) },
  async deleteSubtask(subtaskId) { return repositories.subtasks.remove(subtaskId, { user_id: userId() }) }
}
