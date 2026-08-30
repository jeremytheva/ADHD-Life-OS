import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Brain Inbox exposes Capture and Organize modes as a labelled stateful control group', async () => {
  const source = await read('src/components/inbox/BrainInbox.jsx')

  assert.match(source, /role="group" aria-label="Brain inbox mode"/)
  assert.match(source, /type="button"\s+aria-pressed=\{mode === 'capture'\}/)
  assert.match(source, /type="button"\s+aria-pressed=\{mode === 'organize'\}/)
  assert.match(source, /onClick=\{\(\) => setMode\('capture'\)\}/)
  assert.match(source, /onClick=\{\(\) => setMode\('organize'\)\}/)
})
