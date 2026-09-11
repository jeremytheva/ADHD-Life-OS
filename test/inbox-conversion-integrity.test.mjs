import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Brain Inbox reuses one in-flight task conversion per source item', async () => {
  const source = await read('src/services/inboxService.js')

  assert.match(source, /const conversionByItemId = new Map\(\)/)
  assert.match(source, /const existingConversion = conversionByItemId\.get\(itemId\)/)
  assert.match(source, /if \(existingConversion\) return existingConversion/)
  assert.match(source, /const conversion = Promise\.resolve\(\)/)
  assert.match(source, /conversionByItemId\.set\(itemId, conversion\)/)
  assert.match(source, /return conversion/)
})

test('Brain Inbox clears conversion ownership after either success or failure', async () => {
  const source = await read('src/services/inboxService.js')

  assert.match(
    source,
    /\.finally\(\(\) => \{\s+conversionByItemId\.delete\(itemId\)\s+\}\)/
  )
  assert.match(
    source,
    /const task = await taskService\.createTask[\s\S]*await this\.deleteInboxItem\(itemId\)[\s\S]*return task/
  )
})
