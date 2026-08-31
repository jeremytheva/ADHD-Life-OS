import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Routine Statistics exposes Recent Completions as a heading-labelled semantic list', async () => {
  const source = await read('src/components/routines/RoutineStats.jsx')

  assert.match(source, /const recentHistoryHeadingId = `routine-stats-recent-history-heading-\$\{routine\.id\}`/)
  assert.match(source, /id=\{recentHistoryHeadingId\}/)
  assert.match(source, /role="list"\s+aria-labelledby=\{recentHistoryHeadingId\}/)
  assert.match(source, /history\.map\(\(session, index\) => \{[\s\S]*?<motion\.div\s+key=\{session\.id\}\s+role="listitem"/)
})
