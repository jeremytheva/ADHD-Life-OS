import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('routine card controls expose names and explicit non-submit behaviour', async () => {
  const routineCard = await read('src/components/routines/RoutineCard.jsx')

  assert.match(routineCard, /aria-label=\{`Edit routine: \$\{routine\.name\}`\}/)
  assert.match(routineCard, /aria-label=\{`Delete routine: \$\{routine\.name\}`\}/)
  assert.match(routineCard, /<button\s+type="button"\s+onClick=\{onEdit\}/)
  assert.match(routineCard, /<button\s+type="button"\s+onClick=\{onDelete\}/)
  assert.match(routineCard, /<button\s+type="button"\s+onClick=\{onViewStats\}/)
  assert.match(routineCard, /<button\s+type="button"\s+onClick=\{onStart\}/)
})
