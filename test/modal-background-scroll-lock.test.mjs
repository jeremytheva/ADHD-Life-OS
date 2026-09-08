import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('shared modal ownership locks background scrolling until the final modal closes', async () => {
  const source = await read('src/common/useModalDialog.js')

  assert.match(source, /bodyOverflowBeforeModal = document\.body\.style\.overflow/)
  assert.match(source, /document\.body\.style\.overflow = 'hidden'/)
  assert.match(source, /if \(modalStack\.length > 0 \|\| bodyOverflowBeforeModal === null\) return/)
  assert.match(source, /document\.body\.style\.overflow = bodyOverflowBeforeModal/)
  assert.match(source, /lockDocumentScroll\(\)\s*\n\s*modalStack\.push\(dialogRef\)/)
  assert.match(source, /modalStack\.splice\(index, 1\)\s*\n\s*unlockDocumentScroll\(\)/)
})