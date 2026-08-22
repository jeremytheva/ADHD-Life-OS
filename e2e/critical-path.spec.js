import { test, expect } from '@playwright/test'

const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body)
})

const surfaceBrowserErrors = (page) => {
  page.on('console', (message) => {
    if (message.type() === 'error') console.error(`[browser console] ${message.text()}`)
  })
  page.on('pageerror', (error) => console.error(`[browser pageerror] ${error.name}: ${error.message}`))
}

const taskCardHeading = (page, title) => page
  .locator('[id^="task-task-"]')
  .getByRole('heading', { name: title, exact: true })

const createMockNcb = async (page) => {
  let currentUser = null
  const usersByEmail = new Map()
  const preferencesByUser = new Map()
  const tasksByUser = new Map()
  let nextId = 1
  let failTaskCreateCount = 0
  let failTaskLoadCount = 0
  const emptyCollections = new Set([
    'projects',
    'subtasks',
    'routines',
    'routine-steps',
    'routine-sessions',
    'housework-tasks',
    'housework-completions',
    'inbox-items'
  ])

  const userForEmail = (email) => {
    if (!usersByEmail.has(email)) {
      usersByEmail.set(email, { id: `user-${usersByEmail.size + 1}`, email })
    }
    return usersByEmail.get(email)
  }

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
      currentUser = userForEmail(email)
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

    if (path === 'tasks' && method === 'GET') {
      if (failTaskLoadCount > 0) {
        failTaskLoadCount -= 1
        return json(route, { error: { code: 'MOCK_TASK_LOAD_FAILURE' } }, 503)
      }
      return json(route, tasksByUser.get(userId) ?? [])
    }

    if (path === 'tasks' && method === 'POST') {
      if (failTaskCreateCount > 0) {
        failTaskCreateCount -= 1
        return json(route, { error: { code: 'MOCK_TASK_CREATE_FAILURE' } }, 503)
      }

      const now = new Date().toISOString()
      const record = {
        id: `task-${nextId++}`,
        ...request.postDataJSON(),
        user_id: userId,
        created_at: now,
        updated_at: now
      }
      tasksByUser.set(userId, [...(tasksByUser.get(userId) ?? []), record])
      return json(route, record)
    }

    if (emptyCollections.has(path) && method === 'GET') return json(route, [])

    return json(route, { error: { code: 'MOCK_DATA_ROUTE_NOT_FOUND', path, method } }, 404)
  })

  return {
    failNextTaskCreate: () => { failTaskCreateCount += 1 },
    failNextTaskLoad: () => { failTaskLoadCount += 1 }
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

test('critical path persists onboarding and tasks across reload and sign-in', async ({ page }) => {
  surfaceBrowserErrors(page)
  await createMockNcb(page)
  const email = 'first@example.test'
  const taskTitle = 'Persisted browser task'

  await registerAndSkipSetup(page, email)

  await page.getByRole('link', { name: 'Tasks' }).click()
  await page.getByRole('button', { name: 'Add Task' }).click()
  await page.getByLabel('Title *').fill(taskTitle)
  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(taskCardHeading(page, taskTitle)).toBeVisible()

  await page.reload()
  await expect(taskCardHeading(page, taskTitle)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Skip Setup' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Switch Profile' }).click()
  await expect(page).toHaveURL(/\/login/)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('browser-test-password')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.getByRole('link', { name: 'Tasks' }).click()
  await expect(taskCardHeading(page, taskTitle)).toBeVisible()
})

test('a second authenticated user does not receive the first user task', async ({ page }) => {
  surfaceBrowserErrors(page)
  await createMockNcb(page)
  const taskTitle = 'Owner-only task'

  await registerAndSkipSetup(page, 'owner@example.test')
  await page.getByRole('link', { name: 'Tasks' }).click()
  await page.getByRole('button', { name: 'Add Task' }).click()
  await page.getByLabel('Title *').fill(taskTitle)
  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(taskCardHeading(page, taskTitle)).toBeVisible()

  await page.getByRole('button', { name: 'Switch Profile' }).click()
  await page.goto('/register')
  await page.getByLabel('Email').fill('other@example.test')
  await page.getByLabel('Password').fill('browser-test-password')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await page.getByRole('button', { name: 'Skip Setup' }).click()
  await page.getByRole('link', { name: 'Tasks' }).click()

  await expect(taskCardHeading(page, taskTitle)).toHaveCount(0)
})

test('task failures preserve create input and distinguish load failure from empty data', async ({ page }) => {
  surfaceBrowserErrors(page)
  const mock = await createMockNcb(page)
  const taskTitle = 'Retry-safe browser task'

  await registerAndSkipSetup(page, 'recovery@example.test')
  await page.getByRole('link', { name: 'Tasks' }).click()

  mock.failNextTaskCreate()
  await page.getByRole('button', { name: 'Add Task' }).click()
  await page.getByLabel('Title *').fill(taskTitle)
  await page.getByRole('button', { name: 'Create', exact: true }).click()

  await expect(page.getByText('We couldn’t create that task. The task form is still open and your entries have not been discarded.')).toBeVisible()
  await expect(page.getByLabel('Title *')).toHaveValue(taskTitle)
  await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeEnabled()

  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(taskCardHeading(page, taskTitle)).toBeVisible()

  mock.failNextTaskLoad()
  await page.getByRole('button', { name: 'Due Today' }).click()
  await expect(page.getByRole('heading', { name: 'We couldn’t load your tasks' })).toBeVisible()
  await expect(page.getByText('No tasks found')).toHaveCount(0)

  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByText('No tasks found')).toBeVisible()
  await page.getByRole('button', { name: 'All Tasks' }).click()
  await expect(taskCardHeading(page, taskTitle)).toBeVisible()
})

test('Today surfaces timeline retrieval failure and recovers on retry', async ({ page }) => {
  surfaceBrowserErrors(page)
  const mock = await createMockNcb(page)

  await registerAndSkipSetup(page, 'today-recovery@example.test')
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Refresh Today' })).toBeVisible()

  mock.failNextTaskLoad()
  await page.getByRole('button', { name: 'Refresh Today' }).click()

  await expect(page.getByRole('heading', { name: 'We couldn’t load your day' })).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
})
