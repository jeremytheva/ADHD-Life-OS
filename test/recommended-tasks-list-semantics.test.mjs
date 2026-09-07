import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('RecommendedTasks exposes recommendations as one labelled native list while preserving buttons', async () => {
  const source = await read('src/components/tasks/RecommendedTasks.jsx')

  assert.match(source, /id="recommended-tasks-heading"/)
  assert.match(source, /<motion\.ul\s+aria-labelledby="recommended-tasks-heading"/)
  assert.match(source, /tasks\.map\(\(task, index\) =>/)
  assert.match(source, /<motion\.li\s+key=\{task\.id\}/)
  assert.match(source, /<button\s+type="button"/)
  assert.doesNotMatch(source, /role="list"/)
  assert.doesNotMatch(source, /role="listitem"/)
})
