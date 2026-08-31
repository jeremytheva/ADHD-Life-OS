import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Routine Statistics exposes key metrics as semantic name-value pairs', async () => {
  const source = await read('src/components/routines/RoutineStats.jsx')

  assert.match(source, /<dl className="grid grid-cols-2 md:grid-cols-4 gap-4">/)
  assert.equal((source.match(/<dt className=/g) || []).length, 4)
  assert.equal((source.match(/<dd className=/g) || []).length, 4)
  assert.match(source, /<dt[^>]*>[\s\S]*?Total Completions[\s\S]*?<\/dt>[\s\S]*?<dd[^>]*>[\s\S]*?stats\.total_completions[\s\S]*?<\/dd>/)
  assert.match(source, /<dt[^>]*>[\s\S]*?Completion Rate[\s\S]*?<\/dt>[\s\S]*?<dd[^>]*>[\s\S]*?stats\.completion_rate[\s\S]*?<\/dd>/)
  assert.match(source, /<dt[^>]*>[\s\S]*?Avg\. Time[\s\S]*?<\/dt>[\s\S]*?<dd[^>]*>[\s\S]*?stats\.average_completion_time[\s\S]*?<\/dd>/)
  assert.match(source, /<dt[^>]*>[\s\S]*?Current Streak[\s\S]*?<\/dt>[\s\S]*?<dd[^>]*>[\s\S]*?stats\.current_streak[\s\S]*?<\/dd>/)
})
