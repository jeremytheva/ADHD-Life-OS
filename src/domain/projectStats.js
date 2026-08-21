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
