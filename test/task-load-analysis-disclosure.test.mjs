import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/tasks/TaskLoadAnalysis.jsx', import.meta.url), 'utf8')

test('Task Load keeps a compact actionable summary visible by default', () => {
  assert.match(source, /<h2 id="task-load-heading"[^>]*>Task Load<\/h2>/)
  assert.match(source, /\{total\} active task/)
  assert.match(source, /need\$\{attentionCount === 1 \? 's' : ''\} attention/)
})

test('Task Load progressively discloses detailed metrics without removing them', () => {
  assert.match(source, /<details className="group">/)
  assert.match(source, /<summary[^>]*>[\s\S]*View load details[\s\S]*<\/summary>/)
  assert.match(source, />Total Tasks<\/div>/)
  assert.match(source, />Critical<\/div>/)
  assert.match(source, />High<\/div>/)
  assert.match(source, />Overdue<\/div>/)
  assert.match(source, />Due Today<\/div>/)
  assert.match(source, />Estimated Time<\/span>/)
})
