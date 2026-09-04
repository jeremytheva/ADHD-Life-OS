import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('housework room filter hides decorative emoji from assistive technology', async () => {
  const setup = await read('src/components/housework/HouseworkSetup.jsx')

  assert.match(setup, /<span aria-hidden="true">\{room\.icon\}<\/span>/)
  assert.match(setup, /<span>\{room\.label\}<\/span>/)
})
