import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('routine card step preview exposes its visible sequence as an ordered list', async () => {
  const routineCard = await read('src/components/routines/RoutineCard.jsx')

  assert.match(routineCard, /<ol className="space-y-1">/)
  assert.match(routineCard, /<li\s+key=\{step\.id\}/)
  assert.doesNotMatch(routineCard, /\{index \+ 1\}\. \{step\.name\}/)
})
