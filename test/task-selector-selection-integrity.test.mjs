import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Task Selector exposes accessible stateful recommendation controls', async () => {
  const source = await read('src/components/tasks/TaskSelector.jsx')

  assert.match(source, /aria-label="Recommendation path"/)
  assert.match(source, /aria-pressed=\{selectedPath === option\.value\}/)

  assert.match(source, /id="task-selector-energy-label"/)
  assert.match(source, /aria-labelledby="task-selector-energy-label"/)
  assert.match(source, /aria-pressed=\{userState\.current_energy === level\}/)

  assert.match(source, /id="task-selector-time-label"/)
  assert.match(source, /aria-labelledby="task-selector-time-label"/)
  assert.match(source, /aria-pressed=\{userState\.available_time === time\}/)

  assert.match(source, /id="task-selector-mood-label"/)
  assert.match(source, /aria-labelledby="task-selector-mood-label"/)
  assert.match(source, /aria-pressed=\{userState\.mood === mood\.value\}/)

  assert.match(source, /aria-expanded=\{showFilters\}/)
  assert.match(source, /aria-controls="task-selector-filters"/)
  assert.match(source, /id="task-selector-filters"/)
  assert.match(source, /aria-label=\{showFilters \? 'Hide recommendation filters' : 'Show recommendation filters'\}/)
  assert.match(source, /aria-label="Hide recommendation filters"/)

  assert.match(source, /htmlFor="task-selector-location"/)
  assert.match(source, /id="task-selector-location"/)
  assert.equal((source.match(/role="group"/g) || []).length >= 4, true)
})
