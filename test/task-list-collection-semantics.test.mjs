import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('TaskList exposes rendered tasks as one labelled list while preserving focusable task groups', async () => {
  const source = await read('src/components/tasks/TaskList.jsx')

  assert.match(source, /id="task-list-heading"/)
  assert.match(source, /role="list" aria-labelledby="task-list-heading"/)
  assert.match(source, /tasks\.map\(\(task, index\) =>/)
  assert.match(source, /<motion\.div\s+key=\{task\.id\}\s+role="listitem"/)
  assert.match(source, /id=\{`task-\$\{task\.id\}`\}\s+role="group"/)
  assert.match(source, /aria-label=\{`Task: \$\{task\.title\}`\}/)
  assert.match(source, /tabIndex=\{-1\}/)
})
