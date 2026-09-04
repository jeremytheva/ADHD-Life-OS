import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('priority badge exposes its urgency reason beyond pointer-only title text', async () => {
  const priorityBadge = await read('src/components/tasks/PriorityBadge.jsx')

  assert.match(priorityBadge, /urgencyReason && <span className="sr-only">\. \{urgencyReason\}<\/span>/)
})
