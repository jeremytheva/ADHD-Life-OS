import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Gamification section controls expose one named selection group', async () => {
  const source = await read('src/components/gamification/GamificationDashboard.jsx')

  assert.match(source, /role="group"\s+aria-label="Progress section"/)
  assert.match(source, /\['overview', 'achievements', 'stats'\]\.map\(tab =>/)
  assert.match(source, /aria-pressed=\{selectedTab === tab\}/)
  assert.match(source, /onClick=\{\(\) => setSelectedTab\(tab\)\}/)
})
