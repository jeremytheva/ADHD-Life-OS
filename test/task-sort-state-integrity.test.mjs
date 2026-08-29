import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('TaskList uses one authoritative sort state for ordering and presentation', async () => {
  const source = await read('src/components/tasks/TaskList.jsx')

  assert.match(source, /const \[sortBy, setSortBy\] = useState\('priority'\)/)
  assert.match(source, /setSortBy\(modePrefs\.sortBy \|\| 'priority'\)/)
  assert.match(source, /\[currentMode\.id, modePrefs\.sortBy\]/)
  assert.match(source, /sortTasks\(displayTasks, sortBy\)/)
  assert.doesNotMatch(source, /sortTasks\(displayTasks, modePrefs\.sortBy \|\| sortBy\)/)
  assert.match(source, /showPriority=\{sortBy === 'priority'\}/)
})

test('TaskList exposes one labelled sort control with every existing option', async () => {
  const source = await read('src/components/tasks/TaskList.jsx')

  assert.match(source, /<label htmlFor="task-sort"[^>]*>Sort by:<\/label>/)
  assert.match(source, /<select[\s\S]*id="task-sort"[\s\S]*value=\{sortBy\}[\s\S]*onChange=\{\(event\) => setSortBy\(event\.target\.value\)\}/)
  assert.match(source, /\{ key: 'priority', label: 'Priority' \}/)
  assert.match(source, /\{ key: 'due_date', label: 'Due Date' \}/)
  assert.match(source, /\{ key: 'created', label: 'Recently Added' \}/)
  assert.match(source, /\{ key: 'alphabetical', label: 'A-Z' \}/)
  assert.doesNotMatch(source, /sortOptions\.map\(\(option\) => \(\s*<button/)
})
