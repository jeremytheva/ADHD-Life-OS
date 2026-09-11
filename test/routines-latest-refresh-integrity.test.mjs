import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/routines/RoutineList.jsx', import.meta.url), 'utf8')

test('routines publish only the latest asynchronous refresh', () => {
  assert.match(source, /const latestRoutineRequestRef = useRef\(0\)/)
  assert.match(source, /const requestId = latestRoutineRequestRef\.current \+ 1/)
  assert.match(source, /latestRoutineRequestRef\.current = requestId/)
  assert.match(source, /if \(requestId !== latestRoutineRequestRef\.current\) return true/)
  assert.match(source, /if \(requestId === latestRoutineRequestRef\.current\) \{\s*setLoading\(false\)/)
})

test('stale routine refreshes cannot publish routines or load errors', () => {
  const staleGuardIndex = source.indexOf('if (requestId !== latestRoutineRequestRef.current) return true')
  const routinesIndex = source.indexOf('setRoutines(filteredData)')

  assert.ok(staleGuardIndex > -1, 'expected a stale-request guard')
  assert.ok(routinesIndex > staleGuardIndex, 'routines must publish only after the stale-request guard')

  const catchBlock = source.match(/catch \(error\) \{([\s\S]*?)\n\s{4}\} finally/)
  assert.ok(catchBlock, 'expected loadRoutines catch block')
  assert.match(catchBlock[1], /if \(requestId !== latestRoutineRequestRef\.current\) return true/)
  assert.match(catchBlock[1], /setLoadError\(true\)/)
})
