import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('execution engine consumes canonical activities and returns ranked execution options', async () => {
  const source = await read('src/services/executionEngine.js')

  assert.match(source, /activityService\.getActivities\(\)/)
  assert.match(source, /selectEligibleActivities\(activities, state\)/)
  assert.match(source, /adhdPriorityService\.getRecommendedTasks/)
  assert.match(source, /adhdPriorityService\.prioritizeTasks/)
  assert.match(source, /buildExecutionOption/)
  assert.match(source, /getBestNextAction/)
})

test('brave frog recommendations require essential work when configured as essential-only', async () => {
  const source = await read('src/services/taskRecommender.ts')

  assert.match(source, /const essentialMatch = !config\.is_essential \|\| task\.is_essential === true/)
  assert.doesNotMatch(source, /task\.is_essential \|\| config\.is_essential/)
})
