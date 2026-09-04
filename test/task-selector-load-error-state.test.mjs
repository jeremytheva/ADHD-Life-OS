import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('task selector keeps load failures distinct from a valid empty recommendation state', async () => {
  const source = await read('src/components/tasks/TaskSelector.jsx')

  assert.match(source, /import LoadErrorState from '\.\.\/\.\.\/common\/LoadErrorState'/)
  assert.match(source, /const \[loadError, setLoadError\] = useState\(false\)/)
  assert.match(source, /setLoading\(true\)\s+setLoadError\(false\)/)
  assert.match(source, /catch \(error\) \{[\s\S]*setLoadError\(true\)/)
  assert.match(source, /if \(loadError\) \{[\s\S]*<LoadErrorState[\s\S]*onRetry=\{loadTasksAndRecommendations\}/)
  assert.match(source, /No recommendations right now/)
})
