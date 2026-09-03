import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('modal focus trapping excludes disabled, negative-tabindex, hidden, inert, and non-rendered controls', async () => {
  const source = await read('src/common/useModalDialog.js')

  assert.match(source, /element\.disabled/)
  assert.match(source, /element\.tabIndex < 0/)
  assert.match(source, /element\.closest\('\[hidden\], \[aria-hidden="true"\], \[inert\]'\)/)
  assert.match(source, /window\.getComputedStyle\(element\)/)
  assert.match(source, /style\.display !== 'none'/)
  assert.match(source, /style\.visibility !== 'hidden'/)
  assert.match(source, /element\.getClientRects\(\)\.length > 0/)
  assert.match(source, /\.filter\(isVisibleFocusable\)/)
})
