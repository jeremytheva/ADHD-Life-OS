import { test, expect } from '@playwright/test'

const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body)
})

const createModeMock = async (page) => {
  let currentUser = null
  const preferencesByUser = new Map()

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

    if (method === 'GET') return json(route, [])
    return json(route, { error: { code: 'MOCK_DATA_ROUTE_NOT_FOUND', path, method } }, 404)
  })
}

const register = async (page, email = 'mode-switcher@example.test') => {
  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('browser-test-password')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page.getByRole('button', { name: 'Skip Setup' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip Setup' }).click()
  await expect(page).toHaveURL(/\/$/)
}

test('Mode Switcher supports keyboard navigation, selection and focus restoration', async ({ page }) => {
  await createModeMock(page)
  await register(page)

  const allTrigger = page.getByRole('button', { name: 'All', exact: true })
  await allTrigger.click()

  const menu = page.getByRole('menu', { name: 'Available contexts' })
  await expect(menu).toBeVisible()

  const allOption = menu.getByRole('menuitemradio', { name: /All/ })
  const workOption = menu.getByRole('menuitemradio', { name: /Work/ })
  await expect(allOption).toHaveAttribute('aria-checked', 'true')
  await expect(allOption).toBeFocused()

  await page.keyboard.press('ArrowDown')
  await expect(workOption).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(menu).toHaveCount(0)
  const workTrigger = page.getByRole('button', { name: 'Work', exact: true })
  await expect(workTrigger).toBeFocused()

  await workTrigger.click()
  const reopenedMenu = page.getByRole('menu', { name: 'Available contexts' })
  await expect(reopenedMenu.getByRole('menuitemradio', { name: /Work/ })).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('Escape')

  await expect(reopenedMenu).toHaveCount(0)
  await expect(workTrigger).toBeFocused()
})

test('Mode Switcher Escape closes the nested menu before mobile navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await createModeMock(page)
  await register(page, 'mode-switcher-mobile@example.test')

  const openNavigation = page.getByRole('button', { name: 'Open navigation' })
  await openNavigation.click()

  const mobileNavigation = page.getByRole('complementary', { name: 'Mobile application navigation' })
  await expect(mobileNavigation).toBeVisible()

  const modeTrigger = mobileNavigation.getByRole('button', { name: 'All', exact: true })
  await modeTrigger.click()
  const menu = mobileNavigation.getByRole('menu', { name: 'Available contexts' })
  await expect(menu).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(mobileNavigation).toBeVisible()
  await expect(modeTrigger).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(mobileNavigation).toHaveCount(0)
  await expect(openNavigation).toBeFocused()
})
