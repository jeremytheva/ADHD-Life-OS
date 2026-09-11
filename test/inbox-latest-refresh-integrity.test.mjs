import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/inbox/BrainInbox.jsx', import.meta.url), 'utf8')

test('brain inbox publishes only the latest asynchronous refresh', () => {
  assert.match(source, /const latestLoadRequestRef = useRef\(0\)/)
  assert.match(source, /const requestId = latestLoadRequestRef\.current \+ 1/)
  assert.match(source, /latestLoadRequestRef\.current = requestId/)
  assert.match(source, /if \(requestId !== latestLoadRequestRef\.current\) return true/)
  assert.match(source, /if \(requestId === latestLoadRequestRef\.current\) \{\s*setLoading\(false\)/)
})

test('stale inbox refreshes cannot publish items or load errors', () => {
  const staleGuardIndex = source.indexOf('if (requestId !== latestLoadRequestRef.current) return true')
  const itemsIndex = source.indexOf('setItems(data)')

  assert.ok(staleGuardIndex > -1, 'expected a stale-request guard')
  assert.ok(itemsIndex > staleGuardIndex, 'inbox items must publish only after the stale-request guard')

  const catchBlock = source.match(/catch \(error\) \{([\s\S]*?)\n\s{4}\} finally/)
  assert.ok(catchBlock, 'expected loadItems catch block')
  assert.match(catchBlock[1], /if \(requestId !== latestLoadRequestRef\.current\) return true/)
  assert.match(catchBlock[1], /setLoadError\(error\)/)
})
