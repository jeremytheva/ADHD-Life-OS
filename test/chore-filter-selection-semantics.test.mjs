import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('ChoreChecklist exposes its timeframe filter as a labelled stateful button group', async () => {
  const source = await read('src/components/housework/ChoreChecklist.jsx')

  assert.match(source, /className="flex gap-2" role="group" aria-label="Filter chores"/)
  assert.match(source, /type="button"[\s\S]*?aria-pressed=\{filter === value\}/)
  assert.match(source, /setFilter\(value\)/)
  assert.match(source, /value === 'today' \? 'Ready Now' : 'All Chores'/)
})

test('ChoreChecklist keeps established controls mounted while filter-driven data refreshes', async () => {
  const source = await read('src/components/housework/ChoreChecklist.jsx')

  assert.match(source, /const \[hasLoaded, setHasLoaded\] = useState\(false\)/)
  assert.match(source, /setTasks\(data\)[\s\S]*?setHasLoaded\(true\)/)
  assert.match(source, /if \(loading && !hasLoaded\)/)
  assert.match(source, /className="space-y-6" aria-busy=\{loading\}/)
  assert.match(source, /loading && \([\s\S]*?role="status"[\s\S]*?aria-live="polite"[\s\S]*?Refreshing chores\.\.\./)
})
