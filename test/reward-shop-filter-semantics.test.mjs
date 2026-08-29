import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Reward Shop exposes category filters as a labelled stateful control group', async () => {
  const source = await read('src/components/gamification/RewardShop.jsx')

  assert.match(source, /role="group"/)
  assert.match(source, /aria-label="Filter rewards by category"/)
  assert.match(source, /aria-pressed=\{selectedCategory === cat\.id\}/)
  assert.match(source, /onClick=\{\(\) => setSelectedCategory\(cat\.id\)\}/)
})
