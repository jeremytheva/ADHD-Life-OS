import { test, expect } from '@playwright/test'

const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body)
})

const completedOnboarding = {
  selectedRoles: [],
  customRoles: [],
  enabledModules: ['tasks', 'routines', 'housework', 'inbox'],
  uiStyle: 'visual',
  preferences: {
    showEncouragement: true,
    enableSoundEffects: false,
    useTimers: true,
    breakReminders: true,
    celebrateSmallWins: true
  },
  progress: {
    currentStep: 5,
    totalSteps: 6,
    completedSteps: ['welcome', 'roles', 'modules', 'style', 'preferences', 'completion'],
    isComplete: true
  }
}

const installAuthenticatedFeatureMock = async (page) => {
  const user = { id: 'feature-user', email: 'features@example.test' }
  const preferences = {
    id: 'prefs-feature-user',
    user_id: user.id,
    wake_time: '07:00',
    sleep_time: '22:00',
    work_start_time: null,
    work_end_time: null,
    theme: 'low-stim',
    notifications_enabled: true,
    onboarding: completedOnboarding
  }

  await page.route('**/api/ncb/auth/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api/ncb/auth/', '')
    if (path === 'get-session') return json(route, { user })
    return json(route, { data: null })
  })

  await page.route('**/api/ncb/data/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname.replace('/api/ncb/data/', '')
    if (path.startsWith('user-preferences')) return json(route, [preferences])
    return json(route, [])
  })
}

test('Features distinguishes implemented capabilities from planned placeholders', async ({ page }) => {
  await installAuthenticatedFeatureMock(page)
  await page.goto('/features')

  await expect(page.getByRole('heading', { name: 'Features', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Available now' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Planned', exact: true })).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Brain Inbox' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Focus sessions' })).toBeVisible()
  await expect(page.getByText('Planned · not active yet').first()).toBeVisible()
  await expect(page.getByText('Current milestone')).toBeVisible()
  const plannedSection = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Planned', exact: true }) })
  await expect(plannedSection.getByRole('button')).toHaveCount(0)
})

test('Features remains reachable from phone navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await installAuthenticatedFeatureMock(page)
  await page.goto('/')

  const openNavigation = page.getByRole('button', { name: 'Open navigation' })
  await openNavigation.click()
  await page.getByRole('link', { name: 'Features' }).click()

  await expect(page).toHaveURL(/\/features$/)
  await expect(page.getByRole('heading', { name: 'Features', exact: true })).toBeVisible()
  await expect(openNavigation).toBeVisible()
})
