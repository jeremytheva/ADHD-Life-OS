import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('brain inbox inputs and category choices expose programmatic context', async () => {
  const source = await read('src/components/inbox/BrainInbox.jsx')

  assert.match(source, /aria-label="Capture a thought"/)
  assert.match(source, /aria-label=\{`Edit inbox item: \$\{item\.content\}`\}/)
  assert.match(source, /role="group"[\s\S]*?aria-label=\{`Choose category for \$\{item\.content\}`\}/)
})
