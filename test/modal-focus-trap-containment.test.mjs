import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('modal focus trapping recaptures forward and reverse Tab when focus is outside the active dialog', async () => {
  const source = await read('src/common/useModalDialog.js')

  assert.match(source, /event\.shiftKey && \(active === first \|\| !dialog\.contains\(active\)\)/)
  assert.match(source, /!event\.shiftKey && \(active === last \|\| !dialog\.contains\(active\)\)/)
  assert.match(source, /last\.focus\(\)/)
  assert.match(source, /first\.focus\(\)/)
})
