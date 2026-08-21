import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('layout keeps modal-only features behind lazy imports', async () => {
  const layout = await read('src/components/Layout.jsx')

  assert.match(layout, /const ModePreferences = lazy\(\(\) => import\(['"]\.\/mode\/ModePreferences['"]\)\)/)
  assert.match(layout, /const AccessibilitySettings = lazy\(\(\) => import\(['"]\.\/accessibility\/AccessibilitySettings['"]\)\)/)
  assert.match(layout, /const GamificationDashboard = lazy\(\(\) => import\(['"]\.\/gamification\/GamificationDashboard['"]\)\)/)
  assert.match(layout, /const RewardShop = lazy\(\(\) => import\(['"]\.\/gamification\/RewardShop['"]\)\)/)

  assert.doesNotMatch(layout, /import GamificationDashboard from ['"]\.\/gamification\/GamificationDashboard['"]/)
  assert.doesNotMatch(layout, /import RewardShop from ['"]\.\/gamification\/RewardShop['"]/)
  assert.match(layout, /<Suspense fallback=\{<ModalLoadingFallback \/>\}>/)
})

test('Today keeps its optional gamification dashboard behind a lazy import', async () => {
  const today = await read('src/components/today/TodayView.jsx')

  assert.match(today, /const GamificationDashboard = lazy\(\(\) => import\(['"]\.\.\/gamification\/GamificationDashboard['"]\)\)/)
  assert.doesNotMatch(today, /import GamificationDashboard from ['"]\.\.\/gamification\/GamificationDashboard['"]/)
  assert.match(today, /<Suspense fallback=\{<ModalLoadingFallback \/>\}>/)
})
