import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ACTIVE_CAPABILITIES,
  CORE_ONBOARDING_CAPABILITIES,
  OPTIONAL_ONBOARDING_CAPABILITIES,
  PLANNED_CAPABILITIES,
  NAVIGABLE_CAPABILITIES
} from '../src/config/productCapabilities.js'
import { navigationConfig } from '../src/config/navigation.js'

test('implemented capability catalogue reflects current app routes and onboarding state', () => {
  const activeIds = new Set(ACTIVE_CAPABILITIES.map((capability) => capability.id))
  const optionalIds = new Set(OPTIONAL_ONBOARDING_CAPABILITIES.map((capability) => capability.id))
  const navigationPaths = new Set(NAVIGABLE_CAPABILITIES.map((capability) => capability.navigation.path))

  for (const id of ['today', 'tasks', 'routines', 'projects', 'housework', 'inbox']) {
    assert.ok(activeIds.has(id), `${id} should be active`)
  }

  assert.deepEqual([...CORE_ONBOARDING_CAPABILITIES.map((capability) => capability.id)].sort(), ['projects', 'routines', 'tasks', 'today'])
  assert.deepEqual([...optionalIds].sort(), ['housework', 'inbox'])
  assert.ok(navigationPaths.has('/inbox'))
  assert.ok(navigationPaths.has('/housework'))
  assert.ok(!activeIds.has('habits'))
  assert.ok(!activeIds.has('timeline'))
})

test('planned placeholders match the current roadmap categories without pretending to be active routes', () => {
  const plannedIds = PLANNED_CAPABILITIES.map((capability) => capability.id).sort()

  assert.deepEqual(plannedIds, [
    'ai-assistant',
    'automations',
    'calendar-sync',
    'focus-sessions',
    'insights',
    'integrations'
  ])

  for (const capability of PLANNED_CAPABILITIES) {
    assert.equal(capability.status, 'planned')
    assert.equal(capability.navigation, undefined)
    assert.match(capability.detail, /not active|inactive|deferred|planned|verification/i)
  }
})


test('feature status view is always reachable without making planned capabilities navigable', () => {
  const featureNavigation = navigationConfig.find((item) => item.path === '/features')
  assert.deepEqual(featureNavigation, { path: '/features', label: 'Features', modes: ['all'], core: true })

  for (const capability of PLANNED_CAPABILITIES) {
    assert.ok(!navigationConfig.some((item) => item.path === capability.navigation?.path && item.path !== undefined))
  }
})
