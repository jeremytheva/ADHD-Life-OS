import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('ChoreDetailView exposes checklist progress semantics from authoritative counts', async () => {
  const source = await read('src/components/housework/ChoreDetailView.jsx')

  assert.match(source, /role="progressbar"/)
  assert.match(source, /aria-label="Chore checklist progress"/)
  assert.match(source, /aria-valuemin=\{0\}/)
  assert.match(source, /aria-valuemax=\{totalCount\}/)
  assert.match(source, /aria-valuenow=\{completedCount\}/)
  assert.match(source, /aria-valuetext=\{`\$\{completedCount\} of \$\{totalCount\} steps complete`\}/)
})
