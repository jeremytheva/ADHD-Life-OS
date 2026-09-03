import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('modal initial focus ignores hidden or inert targets and falls back to the dialog', async () => {
  const source = await read('src/common/useModalDialog.js')

  assert.match(
    source,
    /initialTarget && !initialTarget\.disabled && isVisibleFocusable\(initialTarget\)/
  )
  assert.match(source, /initialTarget\.focus\(\)/)
  assert.match(source, /dialogRef\.current\?\.focus\(\)/)
})
