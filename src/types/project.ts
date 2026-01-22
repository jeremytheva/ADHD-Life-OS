/**
 * Project and Task Hierarchy Types
 * Multi-level structuring for organizing tasks into projects
 */

export type ProjectStatus = 'active' | 'completed' | 'archived' | 'on-hold'
export type ProjectColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'yellow' | 'red' | 'teal'

export interface Subtask {
  id: string
  task_id: string
  title: string
  description?: string
  order_index: number
  is_completed: boolean
  completed_at?: string
  estimated_duration?: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id?: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
  estimated_duration?: number
  is_essential: boolean
  completed_at?: string
  order_index: number
  subtasks?: Subtask[]
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description?: string
  color: ProjectColor
  icon?: string
  status: ProjectStatus
  goal?: string
  target_date?: string
  order_index: number
  tasks?: Task[]
  created_at: string
  updated_at: string
}

export interface ProjectStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  total_subtasks: number
  completed_subtasks: number
  completion_percentage: number
  estimated_time_remaining: number
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: string
  color: ProjectColor
  icon: string
  tasks: Array<{
    title: string
    description?: string
    estimated_duration?: number
    is_essential?: boolean
    subtasks?: Array<{
      title: string
      description?: string
      estimated_duration?: number
    }>
  }>
}