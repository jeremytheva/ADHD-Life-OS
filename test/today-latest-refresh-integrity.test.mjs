import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/today/TodayView.jsx', import.meta.url), 'utf8')

test('Today timeline publishes only the latest asynchronous refresh', () => {
  assert.match(source, /const latestTimelineRequestRef = useRef\(0\)/)
  assert.match(source, /const requestId = latestTimelineRequestRef\.current \+ 1/)
  assert.match(source, /latestTimelineRequestRef\.current = requestId/)
  assert.match(source, /if \(requestId !== latestTimelineRequestRef\.current\) return true/)
  assert.match(source, /if \(requestId === latestTimelineRequestRef\.current\) \{\s*setLoading\(false\)/)
})

test('a stale failed refresh cannot replace newer Today state with an error', () => {
  const catchBlock = source.match(/catch \(error\) \{([\s\S]*?)\n\s{4}\} finally/)
  assert.ok(catchBlock, 'expected loadTimeline catch block')
  assert.match(catchBlock[1], /if \(requestId !== latestTimelineRequestRef\.current\) return true/)
  assert.match(catchBlock[1], /setLoadError\(true\)/)
})
