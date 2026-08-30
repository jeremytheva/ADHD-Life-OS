import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Housework Setup exposes selectable chores as one labelled stateful group', async () => {
  const source = await read('src/components/housework/HouseworkSetup.jsx')

  assert.match(source, /role="group" aria-label="Select housework tasks"/)
  assert.match(source, /aria-pressed=\{isSelected\}/)
  assert.match(source, /onClick=\{\(\) => handleToggleTask\(globalIndex\)\}/)
})
