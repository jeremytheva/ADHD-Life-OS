import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('onboarding load failures preserve saved-state uncertainty and expose retry recovery', () => {
  assert.match(appSource, /import LoadErrorState from '\.\/common\/LoadErrorState'/)
  assert.match(appSource, /const \[onboardingLoadError, setOnboardingLoadError\] = useState\(false\)/)
  assert.match(appSource, /\.catch\(\(error\) => \{[\s\S]*setOnboardingLoadError\(true\)[\s\S]*\}\)/)
  assert.doesNotMatch(appSource, /\.catch\(\(error\) => \{[\s\S]*setShowOnboarding\(true\)[\s\S]*\}\)/)
  assert.match(appSource, /saved onboarding state has not been replaced/)
  assert.match(appSource, /onRetry=\{retryOnboardingLoad\}/)
  assert.match(appSource, /setOnboardingCheckAttempt\(\(attempt\) => attempt \+ 1\)/)
})
