import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const source = await read('src/components/housework/ChoreChecklist.jsx')

test('chore list blocks refresh, filter, and detail navigation from crossing an active mutation boundary', () => {
  assert.match(source, /const retryLoad = \(\) => \{\s*if \(pendingActionRef\.current\) return/)
  assert.match(source, /const handleFilterChange = \(value\) => \{\s*if \(pendingActionRef\.current\) return/)
  assert.match(source, /const handleOpenTask = \(task\) => \{\s*if \(pendingActionRef\.current\) return/)
})

test('rendered mutation state disables refresh, filters, and chore detail navigation', () => {
  assert.match(source, /onClick=\{retryLoad\}\s*disabled=\{mutationPending\}/)
  assert.match(source, /onClick=\{\(\) => handleFilterChange\(value\)\}\s*disabled=\{mutationPending\}/)
  assert.match(source, /onClick=\{\(\) => handleOpenTask\(task\)\}\s*disabled=\{mutationPending\}/)
})

test('chore writes still use the synchronous mutation owner', () => {
  assert.match(source, /const pendingActionRef = useRef\(null\)/)
  assert.match(source, /const claimMutation = \(action\) => \{\s*if \(pendingActionRef\.current\) return false\s*pendingActionRef\.current = action/)
  assert.match(source, /if \(!claimMutation\(`complete:\$\{taskId\}`\)\) return/)
  assert.match(source, /if \(!claimMutation\(`snooze:\$\{taskId\}`\)\) return/)
})
