import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const source = await read('src/components/today/TodayView.jsx')

test('Today task completion claims synchronous ownership before persistence', () => {
  assert.match(source, /const pendingTaskRef = useRef\(null\)/)
  assert.match(source, /const handleCompleteTask = async \(blockId, taskId\) => \{\s*if \(pendingTaskRef\.current\) return\s*pendingTaskRef\.current = taskId\s*setOperationError\(null\)\s*setPendingTaskId\(taskId\)\s*const acceptedTaskId = taskId/)
  assert.match(source, /await taskService\.completeTask\(acceptedTaskId\)/)
  assert.doesNotMatch(source, /const handleCompleteTask = async \(blockId, taskId\) => \{\s*if \(pendingTaskId\) return/)
})

test('only the accepted completion releases the Today mutation boundary', () => {
  assert.match(source, /finally \{\s*if \(pendingTaskRef\.current === acceptedTaskId\) \{\s*pendingTaskRef\.current = null\s*setPendingTaskId\(null\)/)
})

test('rendered pending state remains an accessible UI signal and disables competing task buttons', () => {
  assert.match(source, /const taskMutationPending = pendingTaskId !== null/)
  assert.match(source, /aria-busy=\{loading \|\| taskMutationPending\}/)
  assert.match(source, /Completing task\.\.\./)
  assert.match(source, /pending=\{block\.ref_type === 'task' && taskMutationPending\}/)
})
