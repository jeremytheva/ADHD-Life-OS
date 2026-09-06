import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Template Library hides decorative control and field icons', async () => {
  const source = await read('src/components/templates/TemplateLibrary.jsx')

  assert.match(source, /aria-label="Close template library"[^>]*>\s*<SafeIcon icon=\{FiX\} aria-hidden="true"/)
  assert.match(source, /<SafeIcon icon=\{FiSearch\} aria-hidden="true"[^>]*\/>\s*<input[^>]*aria-label="Search templates"/)
  assert.match(source, /<SafeIcon icon=\{FiFilter\} aria-hidden="true"[^>]*\/>\s*<select[^>]*aria-label="Template type"/)
  assert.match(source, /aria-label="Grid view"[^>]*aria-pressed=\{viewMode === 'grid'\}[^>]*>\s*<SafeIcon icon=\{FiGrid\} aria-hidden="true"/)
  assert.match(source, /aria-label="List view"[^>]*aria-pressed=\{viewMode === 'list'\}[^>]*>\s*<SafeIcon icon=\{FiList\} aria-hidden="true"/)
})
