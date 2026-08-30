import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Onboarding UI styles expose one labelled stateful button group', async () => {
  const source = await read('src/components/onboarding/steps/UIStyleStep.jsx')

  assert.match(source, /role="group" aria-label="Interface style"/)
  assert.match(source, /type="button"\s+aria-pressed=\{isSelected\}/)
  assert.match(source, /const isSelected = selectedStyle === style\.id/)
  assert.match(source, /onClick=\{\(\) => setSelectedStyle\(style\.id\)\}/)
})
