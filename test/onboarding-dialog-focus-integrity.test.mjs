import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { URL } from 'node:url'

const source = await readFile(
  new URL('../src/components/onboarding/OnboardingFlow.jsx', import.meta.url),
  'utf8'
)

test('onboarding blocking flow uses the shared modal focus contract', () => {
  assert.match(source, /import useModalDialog from '\.\.\/\.\.\/common\/useModalDialog'/)
  assert.match(source, /const dialogRef = useModalDialog\(\)/)
  assert.match(source, /ref=\{dialogRef\}/)
  assert.match(source, /role="dialog"/)
  assert.match(source, /aria-modal="true"/)
  assert.match(source, /aria-labelledby="onboarding-step-title"/)
  assert.match(source, /tabIndex=\{-1\}/)
  assert.match(source, /id="onboarding-step-title"/)
})

test('onboarding exposes its step progress semantically', () => {
  assert.match(source, /role="progressbar"/)
  assert.match(source, /aria-label="Onboarding progress"/)
  assert.match(source, /aria-valuemin=\{1\}/)
  assert.match(source, /aria-valuemax=\{totalSteps\}/)
  assert.match(source, /aria-valuenow=\{currentStep \+ 1\}/)
  assert.match(source, /aria-valuetext=\{`Step \$\{currentStep \+ 1\} of \$\{totalSteps\}`\}/)
})
