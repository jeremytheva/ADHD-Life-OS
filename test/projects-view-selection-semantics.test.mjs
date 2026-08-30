import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('ProjectsList exposes grid and list views as one labelled stateful control group', async () => {
  const source = await read('src/components/projects/ProjectsList.jsx')

  assert.match(source, /role="group"/)
  assert.match(source, /aria-label="Project view"/)
  assert.match(source, /aria-label="Grid view" aria-pressed=\{viewMode === 'grid'\}/)
  assert.match(source, /aria-label="List view" aria-pressed=\{viewMode === 'list'\}/)
  assert.match(source, /onClick=\{\(\) => setViewMode\('grid'\)\}/)
  assert.match(source, /onClick=\{\(\) => setViewMode\('list'\)\}/)
})