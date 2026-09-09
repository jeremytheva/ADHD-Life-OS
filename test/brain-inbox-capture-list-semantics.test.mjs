import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Brain Inbox exposes captured thoughts as one labelled semantic list', async () => {
  const source = await read('src/components/inbox/BrainInbox.jsx')

  assert.match(source, /role="list" aria-label="Captured thoughts"/)
  assert.match(source, /items\.map\(\(item, index\) =>/)
  assert.match(source, /<motion\.div\s+role="listitem"\s+key=\{item\.id\}/)
  assert.match(source, /aria-hidden="true"\s+className="flex items-center justify-center w-6 h-6 bg-purple-100/)
})

test('deleting a captured thought returns focus to the persistent capture input', async () => {
  const source = await read('src/components/inbox/BrainInbox.jsx')

  assert.match(source, /const inputRef = useRef\(null\)/)
  assert.match(source, /ref=\{inputRef\}/)
  assert.match(source, /const handleDeleteItem = async \(id\) => \{[\s\S]*?setItems\(prev => prev\.filter\(item => item\.id !== id\)\)\s*inputRef\.current\?\.focus\(\)/)
  assert.match(source, /onClick=\{\(\) => handleDeleteItem\(item\.id\)\}/)
})
