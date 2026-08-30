import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Quick Capture exposes captured tasks as one labelled ordered list', async () => {
  const source = await read('src/components/projects/QuickCaptureModal.jsx')

  assert.match(source, /id="quick-capture-items-heading"/)
  assert.match(source, /<ol aria-labelledby="quick-capture-items-heading" className="space-y-3">/)
  assert.match(source, /<motion\.li[\s\S]*?key=\{`\$\{item\}-\$\{index\}`\}/)
  assert.match(source, /aria-label=\{`Remove \$\{item\}`\}/)
  assert.match(source, /aria-hidden="true"[\s\S]*?\{index \+ 1\}/)
})
