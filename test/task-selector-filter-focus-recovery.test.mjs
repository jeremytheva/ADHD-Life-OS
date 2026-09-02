import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('closing recommendation filters from within returns focus to the disclosure control', async () => {
  const selector = await read('src/components/tasks/TaskSelector.jsx')

  assert.match(selector, /useRef/)
  assert.match(selector, /const filterToggleRef = useRef\(null\)/)
  assert.match(selector, /ref=\{filterToggleRef\}/)
  assert.match(selector, /aria-expanded=\{showFilters\}/)
  assert.match(selector, /aria-controls="task-selector-filters"/)
  assert.match(selector, /const handleCloseFilters = \(\) => \{\s*setShowFilters\(false\)\s*filterToggleRef\.current\?\.focus\(\)\s*\}/)
  assert.match(selector, /aria-label="Hide recommendation filters"\s*onClick=\{handleCloseFilters\}/)
})
