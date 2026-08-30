import { test, expect } from '@playwright/test'

const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body)
})

const createTaskSortMock = async (page) => {
  let currentUser = null
  const preferencesByUser = new Map()

  await page.route('**/api/ncb/auth/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname.replace('/api/ncb/auth/', '')

    if (path === 'get-session') return json(route, { user: currentUser })
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

    if (path === 'tasks' && method === 'GET') {
      return json(route, [
        {
          id: 'task-zulu', user_id: userId, title: 'Zulu task', description: '', due_date: '2026-09-01',
          created_at: '2026-08-02T00:00:00.000Z', estimated_duration: 30, is_essential: true,
          completed: false, mode: null, project_id: null, category: null, tags: []
        },
        {
          id: 'task-alpha', user_id: userId, title: 'Alpha task', description: '', due_date: '2026-09-05',
          created_at: '2026-08-01T00:00:00.000Z', estimated_duration: 30, is_essential: false,
          completed: false, mode: null, project_id: null, category: null, tags: []
        },
        {
          id: 'task-mike', user_id: userId, title: 'Mike task', description: '', due_date: '2026-09-03',
          created_at: '2026-08-03T00:00:00.000Z', estimated_duration: 30, is_essential: false,
          completed: false, mode: null, project_id: null, category: null, tags: []
        }
      ])
    }

    if (method === 'GET') return json(route, [])
    return json(route, { error: { code: 'MOCK_DATA_ROUTE_NOT_FOUND', path, method } }, 404)
  })
}

const registerAndSkipSetup = async (page) => {
  await page.goto('/register')
  await page.getByLabel('Email').fill('task-sort@example.test')
  await page.getByLabel('Password').fill('browser-test-password')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page.getByRole('button', { name: 'Skip Setup' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip Setup' }).click()
  await expect(page).toHaveURL(/\/$/)
}

const taskTitles = (page) => page.locator('[id^="task-task-"] h3')

test('Tasks selected sort value and actual ordering stay aligned', async ({ page }) => {
  await createTaskSortMock(page)
  await registerAndSkipSetup(page)
  await page.getByRole('link', { name: 'Tasks' }).click()

  const sort = page.getByLabel('Sort by:')
  await expect(sort).toHaveValue('priority')

  await sort.selectOption('alphabetical')
  await expect(sort).toHaveValue('alphabetical')
  await expect(taskTitles(page)).toHaveText(['Alpha task', 'Mike task', 'Zulu task'])

  await sort.selectOption('due_date')
  await expect(sort).toHaveValue('due_date')
  await expect(taskTitles(page)).toHaveText(['Zulu task', 'Mike task', 'Alpha task'])

  await sort.selectOption('created')
  await expect(sort).toHaveValue('created')
  await expect(taskTitles(page)).toHaveText(['Mike task', 'Zulu task', 'Alpha task'])
})

test('Recommended task keyboard activation transfers focus to the matching task region', async ({ page }) => {
  await createTaskSortMock(page)
  await registerAndSkipSetup(page)
  await page.getByRole('link', { name: 'Tasks' }).click()

  const recommendations = page.getByRole('heading', { name: 'Recommended Right Now' }).locator('..').locator('..')
  const recommendation = recommendations.getByRole('button').filter({ hasText: 'Zulu task' })
  const target = page.getByRole('group', { name: 'Task: Zulu task' })

  await expect(recommendation).toBeVisible()
  await recommendation.focus()
  await recommendation.press('Enter')
  await expect(target).toBeFocused()
})
