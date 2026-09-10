import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/onboarding/OnboardingFlow.jsx', import.meta.url), 'utf8')

test('onboarding does not advance until progress persistence succeeds', () => {
  const saveIndex = source.indexOf('const savedData = await onboardingService.saveProgress(updatedData)')
  const advanceIndex = source.indexOf('setCurrentStep(currentStep + 1)')

  assert.ok(saveIndex > -1, 'progress save should be awaited')
  assert.ok(advanceIndex > saveIndex, 'step advancement must happen only after the save resolves')
  assert.match(source, /We could not confirm that this setup step was saved/)
  assert.match(source, /<OperationErrorState message=\{operationError\}/)
})

test('onboarding load failure blocks setup changes until saved progress can be retried', () => {
  assert.match(source, /const \[isLoadingProgress, setIsLoadingProgress\] = useState\(true\)/)
  assert.match(source, /const \[loadError, setLoadError\] = useState\(''\)/)
  assert.match(source, /Nothing has been replaced\. Try again before continuing setup\./)
  assert.match(source, /<LoadErrorState[\s\S]*onRetry=\{loadOnboardingProgress\}/)
  assert.match(source, /isLoadingProgress \? \([\s\S]*\) : loadError \? \([\s\S]*<LoadErrorState/)
})

test('completion and skip failures remain recoverable in the open onboarding flow', () => {
  assert.match(source, /await onboardingService\.completeOnboarding\(updatedData\)/)
  assert.match(source, /We could not confirm that setup was completed/)
  assert.match(source, /await onboardingService\.skipOnboarding\(\)/)
  assert.match(source, /We could not confirm that setup was skipped/)
  assert.match(source, /aria-busy=\{isLoadingProgress \|\| pendingAction !== null\}/)
  assert.match(source, /role="status"[\s\S]*Saving setup progress…/)
})
