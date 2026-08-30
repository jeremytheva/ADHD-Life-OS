import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('TaskSelector exposes recommendation confidence as labelled progress', async () => {
  const source = await read('src/components/tasks/TaskSelector.jsx')

  assert.match(source, /id=\{`task-selector-confidence-label-\$\{rec\.task\.id\}`\}>Match Confidence<\/span>/)
  assert.match(source, /role="progressbar"\s+aria-labelledby=\{`task-selector-confidence-label-\$\{rec\.task\.id\}`\}/)
  assert.match(source, /aria-valuemin=\{0\}/)
  assert.match(source, /aria-valuemax=\{100\}/)
  assert.match(source, /aria-valuenow=\{Math\.round\(rec\.confidence \* 100\)\}/)
})
