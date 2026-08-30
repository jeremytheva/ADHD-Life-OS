import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Settings theme label is programmatically associated with the theme select', async () => {
  const source = await read('src/components/settings/Settings.jsx')

  assert.match(source, /htmlFor="app-theme"/)
  assert.match(source, /id="app-theme"/)
})
