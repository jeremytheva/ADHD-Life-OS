import assert from 'node:assert/strict'
import test from 'node:test'
import { createAuthSessionController } from '../src/contexts/authSessionController.js'

const createHarness = ({ getCurrentUser, unauthorized = () => false } = {}) => {
  const updates = []
  let active = true
  let clears = 0
  const controller = createAuthSessionController({
    auth: { getCurrentUser, isUnauthorizedError: unauthorized },
    isActive: () => active,
    updateState: (update) => updates.push(update),
    clearAuthState: () => { clears += 1 },
    logError: () => {}
  })
  return { controller, updates, get clears () { return clears }, deactivate: () => { active = false } }
}

test('session verification authenticates a returned user and starts only once', async () => {
  let calls = 0
  const user = { id: 'user-1', email: 'person@example.com' }
  const harness = createHarness({ getCurrentUser: async () => { calls += 1; return user } })

  await harness.controller.startVerification()
  await harness.controller.startVerification()

  assert.equal(calls, 1)
  assert.deepEqual(harness.updates, [
    { status: 'initializing', error: null },
    { user, status: 'authenticated' }
  ])
})

test('an auth event wins over an older session verification response', async () => {
  let resolveSession
  const pendingSession = new Promise((resolve) => { resolveSession = resolve })
  const harness = createHarness({ getCurrentUser: () => pendingSession })

  const verification = harness.controller.verifySession()
  const signedInUser = { id: 'user-2', email: 'new@example.com' }
  harness.controller.handleAuthStateChange('SIGNED_IN', { user: signedInUser })
  resolveSession({ id: 'user-1', email: 'old@example.com' })

  await verification
  assert.deepEqual(harness.updates.at(-1), { user: signedInUser, error: null, status: 'authenticated' })
  assert.equal(harness.updates.some((update) => update.user?.id === 'user-1'), false)
})

test('retry exposes non-authentication errors and recovers on a later success', async () => {
  const networkError = new Error('Network unavailable')
  let attempt = 0
  const harness = createHarness({
    getCurrentUser: async () => {
      attempt += 1
      if (attempt === 1) throw networkError
      return { id: 'user-3', email: 'retry@example.com' }
    }
  })

  await harness.controller.verifySession()
  await harness.controller.verifySession()

  assert.equal(harness.clears, 1)
  assert.deepEqual(harness.updates.slice(0, 3), [
    { status: 'initializing', error: null },
    { error: networkError, status: 'error' },
    { status: 'initializing', error: null }
  ])
  assert.deepEqual(harness.updates.at(-1), {
    user: { id: 'user-3', email: 'retry@example.com' }, status: 'authenticated'
  })
})

test('an unauthorized verification clears cached identity and becomes anonymous', async () => {
  const unauthorizedError = Object.assign(new Error('Expired session'), { status: 401 })
  const harness = createHarness({
    getCurrentUser: async () => { throw unauthorizedError },
    unauthorized: (error) => error.status === 401
  })

  await harness.controller.verifySession()

  assert.equal(harness.clears, 1)
  assert.deepEqual(harness.updates.at(-1), { status: 'anonymous' })
})
