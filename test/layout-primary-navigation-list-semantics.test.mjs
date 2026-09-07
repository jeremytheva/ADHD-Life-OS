import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Layout exposes primary navigation links as a native list', async () => {
  const source = await read('src/components/Layout.jsx')

  assert.match(source, /<nav aria-label="Primary navigation"/)
  assert.match(source, /<ul className="space-y-1">/)
  assert.match(source, /visibleNavItems\.map\(\(item\) =>/)
  assert.match(source, /<li key=\{item\.path\}>/)
  assert.match(source, /<NavLink\s+to=\{item\.path\}/)
  assert.doesNotMatch(source, /role="list"/)
  assert.doesNotMatch(source, /role="listitem"/)
})
