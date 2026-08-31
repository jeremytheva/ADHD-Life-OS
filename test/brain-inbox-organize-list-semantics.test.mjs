import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Brain Inbox exposes To Organize as a heading-labelled semantic list', async () => {
  const source = await read('src/components/inbox/BrainInbox.jsx')

  assert.match(source, /id="brain-inbox-to-organize-heading"/)
  assert.match(source, /role="list"\s+aria-labelledby="brain-inbox-to-organize-heading"/)
  assert.match(source, /uncategorizedItems\.map\(\(item, index\) => \(\s*<motion\.div\s+role="listitem"/s)
})

test('Brain Inbox exposes each populated organized category as a labelled semantic list', async () => {
  const source = await read('src/components/inbox/BrainInbox.jsx')

  assert.match(source, /const categoryHeadingId = `brain-inbox-organized-\$\{cat\.value\}-heading`/)
  assert.match(source, /id=\{categoryHeadingId\}/)
  assert.match(source, /role="list"\s+aria-labelledby=\{categoryHeadingId\}/)
  assert.match(source, /catItems\.map\(\(item, index\) => \(\s*<motion\.div\s+role="listitem"/s)
})
