import fs from 'node:fs'
import { URL } from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'

const source = fs.readFileSync(
  new URL('../src/components/routines/RoutineCard.jsx', import.meta.url),
  'utf8'
)

test('routine cards expose active status without relying on the toggle icon', () => {
  assert.match(source, /icon=\{routine\.is_active \? FiToggleRight : FiToggleLeft\}/)
  assert.match(source, /aria-hidden="true"/)
  assert.match(source, /\{routine\.is_active \? 'Active routine' : 'Inactive routine'\}/)
  assert.match(source, /<span className="sr-only">/)
})
