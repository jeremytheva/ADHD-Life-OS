import { test, expect } from '@playwright/test'

const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body)
})

const setupMockNcb = async (page) => {
  let currentUser = null
  let preferences = null

  await page.route('**/api/ncb/auth/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname.replace('/api/ncb/auth/', '')

    if (path === 'get-session') return json(route, { user: currentUser })
    if (path === 'sign-up/email' || path === 'sign-in/email') {
      const { email } = request.postDataJSON()
      currentUser = { id: 'user-execution-gate', email }
      return json(route, { user: currentUser, session: { user: currentUser } })
    }
    if (path === 'sign-out') {
      currentUser = null
      return json(route, { data: null })
    }
    return json(route, { error: { code: 'MOCK_AUTH_ROUTE_NOT_FOUND' } }, 404)
  })

  await page.route('**/api/ncb/data/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace('/api/ncb/data/', '')
    const method = request.method()

    if (!currentUser) return json(route, { error: { code: 'NCB_AUTH_REQUIRED' } }, 401)

    if (path === 'user-preferences' && method === 'GET') return json(route, preferences ? [preferences] : [])
    if (path === 'user-preferences' && method === 'POST') {
      preferences = { id: 'prefs-execution-gate', ...request.postDataJSON(), user_id: currentUser.id }
      return json(route, preferences)
    }
    if (path.startsWith('user-preferences/') && method === 'PATCH') {
      preferences = { ...preferences, ...request.postDataJSON() }
      return json(route, preferences)
    }

    if (method === 'GET') return json(route, [])
    return json(route, { error: { code: 'MOCK_DATA_ROUTE_NOT_FOUND', path, method } }, 404)
  })
}

const registerAndSkipSetup = async (page) => {
  await page.goto('/register')
  await page.getByLabel('Email').fill('execution-gate@example.test')
  await page.getByLabel('Password').fill('browser-test-password')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page.getByRole('button', { name: 'Skip Setup' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip Setup' }).click()
  await expect(page).toHaveURL(/\/$/)
}

test('Today remains recommendation-only while execution sessions are not certified', async ({ page }) => {
  await setupMockNcb(page)
  await registerAndSkipSetup(page)

  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What should I do now?' })).toBeVisible()

  await expect(page.locator('[data-execution-mode]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Start this' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Continue' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Complete' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Stop' })).toHaveCount(0)

  await expect(page.getByLabel('Energy now')).toBeVisible()
  await expect(page.getByLabel('Time available')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Recheck now' })).toHaveCount(0)
})
