import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('modal close restores focus only to a connected visible enabled opener', async () => {
  const source = await read('src/common/useModalDialog.js')

  assert.match(
    source,
    /opener\?\.isConnected && isProgrammaticallyFocusable\(opener\)/
  )
  assert.match(source, /if \(!activeDialog \|\| activeDialog\.contains\(opener\)\) opener\.focus\(\)/)
})
