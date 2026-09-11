import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/housework/ChoreChecklist.jsx', import.meta.url), 'utf8')

test('chores publish only the latest asynchronous refresh', () => {
  assert.match(source, /const latestTaskRequestRef = useRef\(0\)/)
  assert.match(source, /const requestId = latestTaskRequestRef\.current \+ 1/)
  assert.match(source, /latestTaskRequestRef\.current = requestId/)
  assert.match(source, /if \(requestId !== latestTaskRequestRef\.current\) return true/)
  assert.match(source, /if \(requestId === latestTaskRequestRef\.current\) \{\s*setLoading\(false\)/)
})

test('stale chore refreshes cannot publish tasks or load errors', () => {
  const staleGuardIndex = source.indexOf('if (requestId !== latestTaskRequestRef.current) return true')
  const tasksIndex = source.indexOf('setTasks(data)')

  assert.ok(staleGuardIndex > -1, 'expected a stale-request guard')
  assert.ok(tasksIndex > staleGuardIndex, 'tasks must publish only after the stale-request guard')

  const catchBlock = source.match(/catch \(error\) \{([\s\S]*?)\n\s{4}\} finally/)
  assert.ok(catchBlock, 'expected loadTasks catch block')
  assert.match(catchBlock[1], /if \(requestId !== latestTaskRequestRef\.current\) return true/)
  assert.match(catchBlock[1], /setLoadError\(true\)/)
})
