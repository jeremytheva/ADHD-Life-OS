import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Chore Detail exposes required items as one heading-labelled semantic list', async () => {
  const source = await read('src/components/housework/ChoreDetailView.jsx')

  assert.match(source, /const requiredItemsHeadingId = useId\(\)/)
  assert.match(source, /<h3 id=\{requiredItemsHeadingId\}[^>]*>What You'll Need<\/h3>/)
  assert.match(source, /<ul[^>]*aria-labelledby=\{requiredItemsHeadingId\}/)
  assert.match(source, /task\.required_items\.map\(\(item, index\) => <li key=\{index\}/)
  assert.doesNotMatch(source, /task\.required_items\.map\(\(item, index\) => <span key=\{index\}/)
})
