import { test, expect } from '@playwright/test'

const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body)
})

const createRoutineStatsMock = async (page, {
  delayHistoryLoad = false,
  failHistoryLoad = false
} = {}) => {
  await page.clock.setFixedTime(new Date('2026-09-01T12:00:00.000Z'))

  let currentUser = null
  const preferencesByUser = new Map()
  let historyShouldFail = failHistoryLoad
  let releaseHistoryLoad

  const historyLoadGate = delayHistoryLoad
    ? new Promise((resolve) => { releaseHistoryLoad = resolve })
    : null

  const routineFor = (userId) => ({
    id: 'routine-stats-test',
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
    id: 'routine-stats-step-1',
    user_id: userId,
    routine_id: 'routine-stats-test',
    name: 'Drink water',
    description: 'Have a glass of water.',
    duration_minutes: 2,
    order_index: 0,
    is_essential: true,
    preferred_time: null,
    created_at: '2026-08-28T00:00:00.000Z'
  })

  const completedSessionFor = (userId) => ({
    id: 'routine-stats-session',
    user_id: userId,
    routine_id: 'routine-stats-test',
    routine_name: 'Morning reset',
    started_at: '2026-08-29T08:00:00.000Z',
    current_step_index: 1,
    completed_steps: [{
      step_index: 0,
      step_id: 'routine-stats-step-1',
      completed_at: '2026-08-29T08:10:00.000Z'
    }],
    status: 'completed',
    total_steps: 1,
    completed_at: '2026-08-29T08:10:00.000Z',
    created_at: '2026-08-29T08:00:00.000Z'
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
      if (historyLoadGate) await historyLoadGate
      if (historyShouldFail) {
        return json(route, { error: { code: 'MOCK_ROUTINE_HISTORY_FAILED' } }, 503)
      }
      return json(route, [completedSessionFor(userId)])
    }

    if (method === 'GET') return json(route, [])

    return json(route, { error: { code: 'MOCK_DATA_ROUTE_NOT_FOUND', path, method } }, 404)
  })

  return {
    releaseHistoryLoad: () => releaseHistoryLoad?.(),
    allowHistorySuccess: () => { historyShouldFail = false }
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

test('Routine Statistics keeps dialog ownership through loading and timeframe changes', async ({ page }) => {
  const mock = await createRoutineStatsMock(page, { delayHistoryLoad: true })
  await registerAndSkipSetup(page, 'routine-stats-loading@example.test')
  await page.getByRole('link', { name: 'Routines' }).click()

  const trigger = page.getByRole('button', { name: 'Stats' })
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Routine Statistics Morning reset' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toBeFocused()
  await expect(dialog).toHaveAttribute('aria-busy', 'true')
  await expect(dialog.getByText('Loading statistics...')).toBeVisible()

  mock.releaseHistoryLoad()

  await expect(dialog.getByText('Total Completions')).toBeVisible()
  await expect(dialog).toHaveAttribute('aria-busy', 'false')
  await expect(dialog).toBeFocused()
  await expect(dialog.getByRole('button', { name: '30 days' })).toHaveAttribute('aria-pressed', 'true')
  await expect(dialog.getByRole('progressbar', { name: 'Completion progress for Aug 29, 2026' })).toHaveAttribute('aria-valuenow', '100')

  const sevenDays = dialog.getByRole('button', { name: '7 days' })
  await sevenDays.click()
  await expect(sevenDays).toHaveAttribute('aria-pressed', 'true')
  await expect(sevenDays).toBeFocused()
  await expect(dialog.getByText('Total Completions')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('Routine Statistics exposes retrieval failure and recovers in the same dialog', async ({ page }) => {
  const mock = await createRoutineStatsMock(page, { failHistoryLoad: true })
  await registerAndSkipSetup(page, 'routine-stats-retry@example.test')
  await page.getByRole('link', { name: 'Routines' }).click()

  await page.getByRole('button', { name: 'Stats' }).click()

  const dialog = page.getByRole('dialog', { name: 'Routine Statistics Morning reset' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('alert')).toContainText('We couldn’t load routine statistics')
  await expect(dialog.getByText('No data available yet')).toHaveCount(0)

  mock.allowHistorySuccess()
  await dialog.getByRole('button', { name: 'Try again' }).click()

  await expect(dialog.getByText('Total Completions')).toBeVisible()
  await expect(dialog.getByRole('alert')).toHaveCount(0)
})
