import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const onboardingService = await readFile('src/services/onboardingService.js', 'utf8')
const onboardingFlow = await readFile('src/components/onboarding/OnboardingFlow.jsx', 'utf8')
const layout = await readFile('src/components/Layout.jsx', 'utf8')
const app = await readFile('src/App.jsx', 'utf8')

test('onboarding resumes normalized saved progress from the six-step flow', () => {
  assert.match(onboardingService, /export const ONBOARDING_TOTAL_STEPS = 6/)
  assert.match(onboardingService, /totalSteps: ONBOARDING_TOTAL_STEPS/)
  assert.match(onboardingService, /Math\.min\(maximumStep, Math\.max\(0, Math\.trunc\(requestedStep\)\)\)/)
  assert.match(onboardingService, /new Set\(Array\.isArray\(candidate\.progress\.completedSteps\)/)
  assert.match(onboardingFlow, /onboardingService\.getOnboardingData\(\)/)
  assert.match(onboardingFlow, /Math\.min\(totalSteps - 1, Math\.max\(0, onboardingData\.progress\.currentStep\)\)/)
  assert.match(onboardingFlow, /new Set\(\[\.\.\.onboardingData\.progress\.completedSteps/)
})

test('optional navigation entries use canonical enabled modules while core entries remain available', () => {
  assert.match(app, /getUserPreferences\(user\)/)
  assert.match(app, /<Layout enabledModules=\{enabledModules\}>/)
  assert.match(layout, /module: 'tasks'/)
  assert.match(layout, /module: 'routines'/)
  assert.match(layout, /module: 'housework'/)
  assert.match(layout, /module: 'inbox'/)
  assert.match(layout, /!item\.module \|\| enabledModules\.includes\(item\.module\)/)
  assert.match(layout, /path: '\/', icon: FiCalendar, label: 'Today', modes: \['all'\]/)
  assert.match(layout, /path: '\/settings', icon: FiSettings, label: 'Settings', modes: \['all'\]/)
})
