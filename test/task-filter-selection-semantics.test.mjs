import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('TaskList exposes timeframe filters as a labelled stateful control group', async () => {
  const source = await read('src/components/tasks/TaskList.jsx')

  assert.match(source, /role="group"/)
  assert.match(source, /aria-label="Filter tasks by timeframe"/)
  assert.match(source, /aria-pressed=\{filter === filterOption\.key\}/)
  assert.match(source, /onClick=\{\(\) => setFilter\(filterOption\.key\)\}/)
})
