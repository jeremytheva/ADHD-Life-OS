import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildExecutionOption,
  getInitiationGuidance,
  isExecutionCandidate,
  normalizeExecutionState,
  selectEligibleActivities
} from '../src/domain/execution/executionPolicy.js'

test('execution state normalizes usable time and context', () => {
  assert.deepEqual(
    normalizeExecutionState({
      current_energy: 'low',
      available_time: '20',
      current_location: 'home',
      available_items: ['laptop']
    }),
    {
      current_energy: 'low',
      available_time: 20,
      current_location: 'home',
      available_items: ['laptop'],
      mood: 'neutral'
    }
  )
})

test('terminal, wrong-location, unavailable-item and overlong normal work are excluded', () => {
  const state = { available_time: 20, current_location: 'home', available_items: ['phone'] }

  assert.equal(isExecutionCandidate({ id: 'done', status: 'completed' }, state), false)
  assert.equal(isExecutionCandidate({ id: 'office', priority_metadata: { location: 'office' } }, state), false)
  assert.equal(isExecutionCandidate({ id: 'laptop', required_items: ['laptop'] }, state), false)
  assert.equal(isExecutionCandidate({ id: 'long', estimated_duration: 60 }, state), false)
})

test('aversive work can remain eligible when there is enough time for a bounded micro-start', () => {
  const activity = {
    id: 'frog',
    title: 'Submit difficult form',
    estimated_duration: 60,
    priority_metadata: { aversiveness: 4 }
  }

  assert.equal(isExecutionCandidate(activity, { available_time: 10 }), true)
  assert.equal(isExecutionCandidate(activity, { available_time: 5 }), false)
})

test('eligible activity selection preserves source order before ranking', () => {
  const activities = [
    { id: 'a', estimated_duration: 10 },
    { id: 'b', status: 'archived', estimated_duration: 5 },
    { id: 'c', estimated_duration: 15 }
  ]

  assert.deepEqual(
    selectEligibleActivities(activities, { available_time: 20 }).map((item) => item.id),
    ['a', 'c']
  )
})

test('brave frog guidance gives a small explicit start instead of pretending the full task fits', () => {
  const activity = { id: 'frog', title: 'Tax paperwork', estimated_duration: 90 }
  const guidance = getInitiationGuidance(activity, 'brave_frog', { available_time: 15 })

  assert.equal(guidance.start_minutes, 10)
  assert.match(guidance.start_action, /Tax paperwork for 10 minutes only/)
})

test('execution options preserve provenance and distinguish full-fit from micro-start', () => {
  const activity = {
    id: 'project_task:project-1:task-2',
    type: 'project_task',
    source_id: 'task-2',
    source_parent_id: 'project-1',
    title: 'Prepare proposal',
    estimated_duration_minutes: 45,
    is_essential: true
  }

  const option = buildExecutionOption(
    activity,
    {
      dopamine_path: 'brave_frog',
      priorityScore: 82,
      recommendationConfidence: 0.7,
      recommendation_reason: 'Important and avoided'
    },
    { available_time: 15 },
    1
  )

  assert.equal(option.rank, 1)
  assert.equal(option.activity_type, 'project_task')
  assert.equal(option.source_id, 'task-2')
  assert.equal(option.source_parent_id, 'project-1')
  assert.equal(option.path, 'brave_frog')
  assert.equal(option.fits_available_time, false)
  assert.equal(option.start_minutes, 10)
})
