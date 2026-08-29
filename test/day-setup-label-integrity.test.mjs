import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Day Setup labels are programmatically associated with each time control', async () => {
  const source = await read('src/components/settings/DaySetup.jsx')

  for (const id of [
    'day-setup-wake-time',
    'day-setup-sleep-time',
    'day-setup-work-start-time',
    'day-setup-work-end-time'
  ]) {
    assert.match(source, new RegExp(`htmlFor="${id}"`))
    assert.match(source, new RegExp(`id="${id}"`))
  }
})
