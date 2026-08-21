import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateProjectStats } from '../src/services/projectService.js'

test('project stats are calculated from an already-loaded project graph', () => {
  const stats = calculateProjectStats({
    id: 'project-1',
    tasks: [
      {
        id: 'task-1',
        status: 'completed',
        estimated_duration: 20,
        subtasks: [
          { id: 'subtask-1', is_completed: true },
          { id: 'subtask-2', is_completed: false }
        ]
      },
      {
        id: 'task-2',
        status: 'active',
        completed: false,
        estimated_duration: 45,
        subtasks: []
      }
    ]
  })

  assert.deepEqual(stats, {
    total_tasks: 2,
    completed_tasks: 1,
    pending_tasks: 1,
    total_subtasks: 2,
    completed_subtasks: 1,
    completion_percentage: 50,
    estimated_time_remaining: 45
  })
})

test('project stats handle projects with no tasks', () => {
  assert.deepEqual(calculateProjectStats({ id: 'empty', tasks: [] }), {
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    total_subtasks: 0,
    completed_subtasks: 0,
    completion_percentage: 0,
    estimated_time_remaining: 0
  })
})

test('project stats return null when no project is available', () => {
  assert.equal(calculateProjectStats(null), null)
})
