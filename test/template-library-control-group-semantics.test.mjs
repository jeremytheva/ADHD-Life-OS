import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Template Library exposes labelled groups for category and view controls', async () => {
  const source = await read('src/components/templates/TemplateLibrary.jsx')

  assert.match(source, /role="group" aria-label="Template category filters"/)
  assert.match(source, /aria-pressed=\{selectedCategory === category\}/)
  assert.match(source, /role="group" aria-label="Template view"/)
  assert.match(source, /aria-label="Grid view"[\s\S]*?aria-pressed=\{viewMode === 'grid'\}/)
  assert.match(source, /aria-label="List view"[\s\S]*?aria-pressed=\{viewMode === 'list'\}/)
})
