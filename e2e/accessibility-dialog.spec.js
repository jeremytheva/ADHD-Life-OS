import { test, expect } from '@playwright/test'

const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body)
})

const createMockNcb = async (page, { includeProject = false } = {}) => {
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

    if (includeProject && path === 'projects' && method === 'GET') {
      return json(route, [{ id: 'project-accessibility', user_id: userId, title: 'Accessibility Test Project' }])
    }

    if (includeProject && (path === 'tasks' || path === 'subtasks') && method === 'GET') {
      return json(route, [])
    }

    if (method === 'GET') return json(route, [])

    return json(route, { error: { code: 'MOCK_DATA_ROUTE_NOT_FOUND', path, method } }, 404)
  })
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

test('Accessibility Settings owns focus and restores its trigger on Escape', async ({ page }) => {
  await createMockNcb(page)
  await registerAndSkipSetup(page, 'accessibility-dialog@example.test')

  const trigger = page.getByRole('button', { name: 'Accessibility' })
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Accessibility Settings' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Close accessibility settings without saving' })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('Reward Shop owns focus and restores its shell trigger on Escape', async ({ page }) => {
  await createMockNcb(page)
  await registerAndSkipSetup(page, 'reward-shop-dialog@example.test')

  const trigger = page.getByRole('button', { name: /Reward Shop/ })
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Reward Shop' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Close Reward Shop' })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('Progress dashboard owns focus and restores its shell trigger on Escape', async ({ page }) => {
  await createMockNcb(page)
  await registerAndSkipSetup(page, 'progress-dialog@example.test')

  const trigger = page.getByRole('button', { name: /Level \d+/ })
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Your Progress' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Close progress' })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('Project Form owns focus, exposes grouped choices, and restores its trigger on Escape', async ({ page }) => {
  await createMockNcb(page)
  await registerAndSkipSetup(page, 'project-dialog@example.test')
  await page.getByRole('link', { name: 'Projects' }).click()

  const trigger = page.getByRole('button', { name: 'New Project' })
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'New Project' })
  await expect(dialog).toBeVisible()
  await expect(page.getByLabel('Project Title *')).toBeFocused()
  await expect(page.getByRole('group', { name: 'Choose Color' })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Choose Icon' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Blue' })).toHaveAttribute('aria-pressed', 'true')

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('Quick Capture owns focus, exposes optional-panel state, and restores its trigger on Escape', async ({ page }) => {
  await createMockNcb(page)
  await registerAndSkipSetup(page, 'quick-capture-dialog@example.test')
  await page.getByRole('link', { name: 'Projects' }).click()

  const trigger = page.getByRole('button', { name: 'Quick Capture', exact: true })
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Quick Task Capture' })
  const taskInput = page.getByLabel('Type a task and press Enter')
  await expect(dialog).toBeVisible()
  await expect(taskInput).toBeFocused()

  await taskInput.fill('Call dentist')
  await taskInput.press('Enter')

  const organizationToggle = page.getByRole('button', { name: 'Organization Options (Optional)' })
  await expect(organizationToggle).toHaveAttribute('aria-expanded', 'false')
  await organizationToggle.click()
  await expect(organizationToggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#quick-capture-organization-options')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('Project Detail and nested Task Form preserve top-most modal ownership and focus restoration', async ({ page }) => {
  await createMockNcb(page, { includeProject: true })
  await registerAndSkipSetup(page, 'project-task-dialog@example.test')
  await page.getByRole('link', { name: 'Projects' }).click()

  const detailTrigger = page.getByRole('button', { name: 'View details for Accessibility Test Project' })
  await detailTrigger.focus()
  await page.keyboard.press('Enter')

  const detailDialog = page.getByRole('dialog', { name: 'Accessibility Test Project' })
  const detailShell = page.locator('[role="dialog"][aria-labelledby="project-detail-title"]')
  await expect(detailDialog).toBeVisible()
  await expect(detailDialog).toBeFocused()

  const taskTrigger = page.getByRole('button', { name: 'Add Task', exact: true })
  await taskTrigger.click()

  const taskDialog = page.getByRole('dialog', { name: 'Add Task' })
  await expect(taskDialog).toBeVisible()
  await expect(page.getByLabel('Task Title *')).toBeFocused()
  await expect(page.getByLabel('Description')).toBeVisible()
  await expect(page.getByLabel('Estimated Time (minutes)')).toBeVisible()
  await expect(detailShell).toHaveAttribute('aria-hidden', 'true')

  await page.keyboard.press('Escape')
  await expect(taskDialog).toHaveCount(0)
  await expect(detailDialog).toBeVisible()
  await expect(detailShell).not.toHaveAttribute('aria-hidden', 'true')
  await expect(taskTrigger).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(detailDialog).toHaveCount(0)
  await expect(detailTrigger).toBeFocused()
})
