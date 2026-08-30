import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('TaskSelector exposes recommendations as one labelled semantic list', async () => {
  const source = await read('src/components/tasks/TaskSelector.jsx')

  assert.match(source, /id="task-selector-recommendations-heading"/)
  assert.match(source, /role="list"\s+aria-labelledby="task-selector-recommendations-heading"/)
  assert.match(source, /recommendations\.map\(\(rec, index\) =>/)
  assert.match(source, /<motion\.div\s+role="listitem"\s+key=\{rec\.task\.id\}/)
})
