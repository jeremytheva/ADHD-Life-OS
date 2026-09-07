import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Onboarding restores semantic focus context after step changes', async () => {
  const source = await read('src/components/onboarding/OnboardingFlow.jsx')

  assert.match(source, /import React, \{ useEffect, useRef, useState \} from 'react'/)
  assert.match(source, /const stepTitleRef = useRef\(null\)/)
  assert.match(source, /const previousStepRef = useRef\(currentStep\)/)
  assert.match(source, /if \(previousStepRef\.current !== currentStep\) \{[\s\S]*?stepTitleRef\.current\?\.focus\(\)[\s\S]*?\}/)
  assert.match(source, /<h2[\s\S]*?id="onboarding-step-title"[\s\S]*?ref=\{stepTitleRef\}[\s\S]*?tabIndex=\{-1\}/)
  assert.match(source, /<button[\s\S]*?type="button"[\s\S]*?onClick=\{handleSkipAll\}[\s\S]*?>[\s\S]*?Skip Setup/)
})
