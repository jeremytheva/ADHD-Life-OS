import { test, expect } from '@playwright/test'

const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body)
})

const createTodayMock = async (page) => {
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
    const collection = path.split('?')[0]
    const method = request.method()
    const userId = currentUser?.id

    if (!userId) return json(route, { error: { code: 'NCB_AUTH_REQUIRED' } }, 401)

    if (collection === 'user-preferences' && method === 'GET') {
      const record = preferencesByUser.get(userId)
      return json(route, record ? [record] : [])
    }

    if (collection === 'user-preferences' && method === 'POST') {
      const record = { id: `prefs-${userId}`, ...request.postDataJSON() }
      preferencesByUser.set(userId, record)
      return json(route, record)
    }

    if (collection.startsWith('user-preferences/') && method === 'PATCH') {
      const record = { ...preferencesByUser.get(userId), ...request.postDataJSON() }
      preferencesByUser.set(userId, record)
      return json(route, record)
    }

    if (collection === 'tasks' && method === 'GET') {
      return json(route, Array.from({ length: 5 }, (_, index) => ({
        id: `today-unscheduled-${index + 1}`,
        user_id: userId,
        title: `Unscheduled task ${index + 1}`,
        description: '',
        due_date: null,
        estimated_duration: 1440,
        is_essential: false,
        completed: false,
        mode: null,
        project_id: null,
        category: null,
        tags: []
      })))
    }

    if (method === 'GET') return json(route, [])
    return json(route, { error: { code: 'MOCK_DATA_ROUTE_NOT_FOUND', path, method } }, 404)
  })
}

const registerAndSkipSetup = async (page) => {
  await page.goto('/register')
  await page.getByLabel('Email').fill('today-unscheduled@example.test')
  await page.getByLabel('Password').fill('browser-test-password')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page.getByRole('button', { name: 'Skip Setup' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip Setup' }).click()
  await expect(page).toHaveURL(/\/$/)
}

test('Today progressively discloses a long unscheduled-task list', async ({ page }) => {
  await createTodayMock(page)
  await registerAndSkipSetup(page)

  const section = page.getByRole('region', { name: 'Unscheduled Tasks' })
  await expect(section).toBeVisible()
  await expect(section.getByText('5 tasks are waiting outside today’s schedule.')).toBeVisible()

  const reviewTasks = section.getByRole('button', { name: 'Review unscheduled tasks' })
  await expect(reviewTasks).toHaveAttribute('aria-expanded', 'false')
  await expect(reviewTasks).toHaveAttribute('aria-controls', 'today-unscheduled-task-details')

  const taskItems = section.locator('#today-unscheduled-task-list li')
  await expect(taskItems).toHaveCount(0)
  await expect(section.getByText('Unscheduled task 1')).toHaveCount(0)

  await reviewTasks.click()
  await expect(section.getByRole('button', { name: 'Hide unscheduled tasks' })).toHaveAttribute('aria-expanded', 'true')
  await expect(taskItems).toHaveCount(3)
  await expect(taskItems.nth(0)).toContainText('Unscheduled task 1')
  await expect(taskItems.nth(2)).toContainText('Unscheduled task 3')
  await expect(section.getByText('Unscheduled task 4')).toHaveCount(0)

  const showMore = section.getByRole('button', { name: 'Show 2 more' })
  await expect(showMore).toHaveAttribute('aria-expanded', 'false')
  await expect(showMore).toHaveAttribute('aria-controls', 'today-unscheduled-task-list')
  await showMore.click()

  await expect(taskItems).toHaveCount(5)
  await expect(taskItems.nth(3)).toContainText('Unscheduled task 4')
  await expect(taskItems.nth(4)).toContainText('Unscheduled task 5')

  const showLess = section.getByRole('button', { name: 'Show less' })
  await expect(showLess).toHaveAttribute('aria-expanded', 'true')
  await showLess.click()

  await expect(taskItems).toHaveCount(3)
  await expect(section.getByText('Unscheduled task 4')).toHaveCount(0)

  await section.getByRole('button', { name: 'Hide unscheduled tasks' }).click()
  await expect(taskItems).toHaveCount(0)
  await expect(section.getByRole('button', { name: 'Review unscheduled tasks' })).toHaveAttribute('aria-expanded', 'false')
})
