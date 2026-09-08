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

test('top-most modal recaptures focus that moves outside without requiring a Tab keypress', async () => {
  const source = await read('src/common/useModalDialog.js')

  assert.match(source, /const handleFocusIn = \(event\) =>/)
  assert.match(source, /!dialog \|\| !isTopModal\(dialogRef\) \|\| dialog\.contains\(event\.target\)/)
  assert.match(source, /focusDialogEntryPoint\(\)/)
  assert.match(source, /document\.addEventListener\('focusin', handleFocusIn\)/)
  assert.match(source, /document\.removeEventListener\('focusin', handleFocusIn\)/)
})
