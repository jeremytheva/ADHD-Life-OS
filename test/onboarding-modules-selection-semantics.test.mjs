import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Onboarding optional modules expose one labelled stateful button group', async () => {
  const source = await read('src/components/onboarding/steps/ModulesStep.jsx')

  assert.match(source, /role="group" aria-label="Optional modules"/)
  assert.match(source, /type="button"[\s\S]*?aria-pressed=\{isEnabled\}/)
  assert.match(source, /const isEnabled = enabledModules\.includes\(module\.id\)/)
  assert.match(source, /onClick=\{\(\) => !module\.comingSoon && toggleModule\(module\.id\)\}/)
})
