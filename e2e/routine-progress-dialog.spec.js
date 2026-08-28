import { test, expect } from '@playwright/test'

const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body)
})

const createRoutineMock = async (page, {
  delaySessionLoad = false,
  delayCancellation = false
} = {}) => {
  let currentUser = null
  const preferencesByUser = new Map()
  let session = null
  let cancellationWrites = 0
  let releaseSessionLoad
  let releaseCancellation

  const sessionLoadGate = delaySessionLoad
    ? new Promise((resolve) => { releaseSessionLoad = resolve })
    : null
  const cancellationGate = delayCancellation
    ? new Promise((resolve) => { releaseCancellation = resolve })
    : null

  const routineFor = (userId) => ({
    id: 'routine-dialog-test',
    user_id: userId,
    name: 'Morning reset',
    description: 'A calm start to the day.',
    repeat_pattern: 'daily',
    is_active: true,
    mode: null,
    category: null,
    tags: [],
    created_at: '2026-08-28T00:00:00.000Z'
  })

  const stepFor = (userId) => ({
    id: 'routine-dialog-step-1',
    user_id: userId,
    routine_id: 'routine-dialog-test',
    name: 'Drink water',
    description: 'Have a glass of water.',
    duration_minutes: 2,
    order_index: 0,
    is_essential: true,
    preferred_time: null,
    created_at: '2026-08-28T00:00:00.000Z'
  })

  await page.route('**/api/ncb/auth/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname.replace('/api/ncb/auth/', '')

    if (path === 'get-session') return json(route, { user: currentUser })
    if (path === 'sign-out') {
      currentUser = null
      return json(route, { data: null })
    }
    if (path === 'sign-up/email' || path === 'sign-in/email') {
      const { email } = request.postDataJSON()
      currentUser = { id: `user-${email}`, email }
      return json(route, { user: currentUser, session: { user: currentUser } })
    }

    return json(route, { error: { code: 'MOCK_AUTH_ROUTE_NOT_FOUND' } }, 404)
  })

  await page.route('**/api/ncb/data/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace('/api/ncb/data/', '')
    const method = request.method()
    const userId = currentUser?.id

    if (!userId) return json(route, { error: { code: 'NCB_AUTH_REQUIRED' } }, 401)

    if (path === 'user-preferences' && method === 'GET') {
      const record = preferencesByUser.get(userId)
      return json(route, record ? [record] : [])
    }

    if (path === 'user-preferences' && method === 'POST') {
      const record = { id: `prefs-${userId}`, ...request.postDataJSON() }
      preferencesByUser.set(userId, record)
      return json(route, record)
    }

    if (path.startsWith('user-preferences/') && method === 'PATCH') {
      const record = { ...preferencesByUser.get(userId), ...request.postDataJSON() }
      preferencesByUser.set(userId, record)
      return json(route, record)
    }

    if (path === 'routines' && method === 'GET') {
      return json(route, [routineFor(userId)])
    }

    if (path === 'routine-steps' && method === 'GET') {
      return json(route, [stepFor(userId)])
    }

    if (path === 'routine-sessions' && method === 'GET') {
      if (sessionLoadGate) await sessionLoadGate
      return json(route, session?.status === 'in_progress' ? [session] : [])
    }

    if (path === 'routine-sessions' && method === 'POST') {
      session = {
        id: 'routine-dialog-session',
        ...request.postDataJSON(),
        created_at: '2026-08-28T00:00:00.000Z'
      }
      return json(route, session)
    }

    if (path === 'routine-sessions/routine-dialog-session' && method === 'PATCH') {
      const patch = request.postDataJSON()
      if (patch.status === 'cancelled') {
        cancellationWrites += 1
        if (cancellationGate) await cancellationGate
      }
      session = { ...session, ...patch }
      return json(route, session)
    }

    if (method === 'GET') return json(route, [])

    return json(route, { error: { code: 'MOCK_DATA_ROUTE_NOT_FOUND', path, method } }, 404)
  })

  return {
    releaseSessionLoad: () => releaseSessionLoad?.(),
    releaseCancellation: () => releaseCancellation?.(),
    cancellationWrites: () => cancellationWrites
  }
}

const registerAndSkipSetup = async (page, email) => {
  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('browser-test-password')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page.getByRole('button', { name: 'Skip Setup' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip Setup' }).click()
  await expect(page).toHaveURL(/\/$/)
}

test('Routine Progress keeps one focused dialog from loading into the active step', async ({ page }) => {
  const mock = await createRoutineMock(page, { delaySessionLoad: true })
  await registerAndSkipSetup(page, 'routine-progress-loading@example.test')
  await page.getByRole('link', { name: 'Routines' }).click()

  const trigger = page.getByRole('button', { name: 'Start' })
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Morning reset routine session' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toBeFocused()
  await expect(dialog).toHaveAttribute('aria-busy', 'true')
  await expect(dialog.getByText('Loading routine...')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeVisible()
  await expect(dialog).toBeFocused()

  mock.releaseSessionLoad()

  await expect(dialog.getByRole('heading', { name: 'Drink water' })).toBeVisible()
  await expect(dialog).toHaveAttribute('aria-busy', 'false')
  await expect(dialog).toBeFocused()
  await expect(dialog.getByRole('progressbar', { name: 'Routine progress' })).toHaveAttribute('aria-valuenow', '0')
})

test('Routine Progress Escape cancels through persistence and stays locked while cancellation is pending', async ({ page }) => {
  const mock = await createRoutineMock(page, { delayCancellation: true })
  await registerAndSkipSetup(page, 'routine-progress-cancel@example.test')
  await page.getByRole('link', { name: 'Routines' }).click()

  const trigger = page.getByRole('button', { name: 'Start' })
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Morning reset routine session' })
  await expect(dialog.getByRole('heading', { name: 'Drink water' })).toBeVisible()
  await expect(dialog).toBeFocused()

  let confirmationCount = 0
  page.on('dialog', async (nativeDialog) => {
    confirmationCount += 1
    expect(nativeDialog.message()).toContain('Are you sure you want to cancel this routine?')
    await nativeDialog.accept()
  })

  await page.keyboard.press('Escape')
  await expect.poll(() => mock.cancellationWrites()).toBe(1)
  await expect(dialog).toHaveAttribute('aria-busy', 'true')

  await page.keyboard.press('Escape')
  await expect(dialog).toBeVisible()
  await expect.poll(() => confirmationCount).toBe(1)
  await expect.poll(() => mock.cancellationWrites()).toBe(1)

  mock.releaseCancellation()

  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})
