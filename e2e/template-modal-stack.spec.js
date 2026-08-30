import { test, expect } from '@playwright/test'

const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body)
})

const createTemplateMock = async (page) => {
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

    if (path === 'tasks' && method === 'GET') return json(route, [])
    if (method === 'GET') return json(route, [])

    return json(route, { error: { code: 'MOCK_DATA_ROUTE_NOT_FOUND', path, method } }, 404)
  })
}

const registerAndOpenTemplates = async (page, email) => {
  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('browser-test-password')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page.getByRole('button', { name: 'Skip Setup' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip Setup' }).click()
  await expect(page).toHaveURL(/\/$/)

  await page.getByRole('link', { name: 'Tasks' }).click()
  await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible()

  const templatesTrigger = page.getByRole('button', { name: 'Templates', exact: true })
  await templatesTrigger.click()

  const library = page.getByRole('dialog', { name: 'Template Library' })
  await expect(library).toBeVisible()
  await expect(library).toBeFocused()

  return { library, templatesTrigger }
}

test('Template dialogs preserve focus through Library → Preview → Edit and back', async ({ page }) => {
  await createTemplateMock(page)
  const { library, templatesTrigger } = await registerAndOpenTemplates(page, 'template-stack@example.test')

  await expect(library.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
  await expect(library.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'true')
  await expect(library.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'false')

  const previewTrigger = library.getByRole('button', { name: 'Preview' }).first()
  await previewTrigger.click()

  const preview = page.getByRole('dialog', { name: 'ADHD-Friendly Morning Routine' })
  await expect(preview).toBeVisible()
  await expect(preview).toBeFocused()

  const editTrigger = preview.getByRole('button', { name: 'Edit First' })
  await editTrigger.click()

  const editor = page.getByRole('dialog', { name: 'Edit Template Before Applying' })
  await expect(editor).toBeVisible()
  await expect(editor).toBeFocused()
  await expect(preview).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(editor).toHaveCount(0)
  await expect(preview).toBeVisible()
  await expect(editTrigger).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(preview).toHaveCount(0)
  await expect(library).toBeVisible()
  await expect(previewTrigger).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(library).toHaveCount(0)
  await expect(templatesTrigger).toBeFocused()
})

test('Direct Edit keeps its menu opener connected for focus restoration', async ({ page }) => {
  await createTemplateMock(page)
  const { library } = await registerAndOpenTemplates(page, 'template-direct-edit@example.test')

  const applyTrigger = library.getByRole('button', { name: 'Apply' }).first()
  await applyTrigger.click()
  await expect(applyTrigger).toHaveAttribute('aria-expanded', 'true')

  const editMenuItem = library.getByRole('menuitem', { name: 'Edit Before Applying' }).first()
  await editMenuItem.click()

  const editor = page.getByRole('dialog', { name: 'Edit Template Before Applying' })
  await expect(editor).toBeVisible()
  await expect(editor).toBeFocused()
  await expect(editMenuItem).toHaveCount(1)

  await page.keyboard.press('Escape')
  await expect(editor).toHaveCount(0)
  await expect(editMenuItem).toBeFocused()
})

test('Outside dismissal of the Apply menu restores focus to its trigger', async ({ page }) => {
  await createTemplateMock(page)
  const { library } = await registerAndOpenTemplates(page, 'template-outside-dismiss@example.test')

  const applyTrigger = library.getByRole('button', { name: 'Apply' }).first()
  await applyTrigger.click()
  await expect(applyTrigger).toHaveAttribute('aria-expanded', 'true')
  await expect(library.getByRole('menuitem', { name: 'Apply Directly' }).first()).toBeFocused()

  await page.locator('div.fixed.inset-0.z-10').click({ position: { x: 5, y: 5 } })

  await expect(applyTrigger).toHaveAttribute('aria-expanded', 'false')
  await expect(applyTrigger).toBeFocused()
})
