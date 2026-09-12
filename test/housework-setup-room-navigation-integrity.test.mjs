import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('HouseworkSetup room navigation consults synchronous save ownership', async () => {
  const source = await read('src/components/housework/HouseworkSetup.jsx')
  const handler = source.match(/const handleRoomChange = \(room\) => \{[\s\S]*?\n  \}/)?.[0] ?? ''

  assert.match(handler, /if \(saveInFlightRef\.current \|\| saving\) return/)
  assert.match(handler, /setSelectedRoom\(room\)/)
  assert.match(source, /onClick=\{\(\) => handleRoomChange\('all'\)\}/)
  assert.match(source, /onClick=\{\(\) => handleRoomChange\(room\.value\)\}/)
})
