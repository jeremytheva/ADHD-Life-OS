import assert from 'node:assert/strict'
import test from 'node:test'
import { loadOnboardingState } from '../src/services/onboardingState.js'

test('completed onboarding preferences enable saved modules without reopening setup', async () => {
  const state = await loadOnboardingState(async () => ({
    enabledModules: ['tasks', 'routines', 'inbox'],
    progress: { isComplete: true }
  }))

  assert.deepEqual(state, { enabledModules: ['tasks', 'routines', 'inbox'], showOnboarding: false })
})

test('missing or incomplete onboarding preferences start setup with safe module defaults', async () => {
  assert.deepEqual(await loadOnboardingState(async () => null), { enabledModules: [], showOnboarding: true })
  assert.deepEqual(await loadOnboardingState(async () => ({ progress: { isComplete: false } })), {
    enabledModules: [], showOnboarding: true
  })
})
