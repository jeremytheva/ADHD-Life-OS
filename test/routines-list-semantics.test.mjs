import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Routines exposes the current routine collection as one labelled semantic list', async () => {
  const source = await read('src/components/routines/RoutineList.jsx')

  assert.match(source, /role="list"/)
  assert.match(source, /aria-label="Routines"/)
  assert.match(source, /routines\.map\(\(routine, index\) =>/)
  assert.match(source, /<motion\.div\s+role="listitem"\s+key=\{routine\.id\}/)
})
