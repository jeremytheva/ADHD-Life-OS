import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('mobile navigation contains forward and reverse Tab focus while its overlay is open', async () => {
  const [layoutSource, modalSource] = await Promise.all([
    read('src/components/Layout.jsx'),
    read('src/common/useModalDialog.js')
  ])

  assert.match(modalSource, /export const getFocusableElements =/)
  assert.match(layoutSource, /getFocusableElements\(navigation\)/)
  assert.match(layoutSource, /event\.shiftKey && \(active === first \|\| !navigation\.contains\(active\)\)/)
  assert.match(layoutSource, /!event\.shiftKey && \(active === last \|\| !navigation\.contains\(active\)\)/)
  assert.match(layoutSource, /ref=\{mobileNavigationRef\}/)
  assert.match(layoutSource, /tabIndex=\{-1\}/)
})
