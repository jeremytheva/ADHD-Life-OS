import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('task load attention messages are exposed as a native list', async () => {
  const analysis = await read('src/components/tasks/TaskLoadAnalysis.jsx')

  assert.match(analysis, /<ul className="text-xs text-amber-800 list-disc pl-4">/)
  assert.match(analysis, /\{overdue > 0 && <li>You have \{overdue\} overdue task/)
  assert.match(analysis, /\{critical > 0 && <li>\{critical\} critical task/)
  assert.doesNotMatch(analysis, /<div>• You have/)
  assert.doesNotMatch(analysis, /<div>• \{critical\}/)
})
