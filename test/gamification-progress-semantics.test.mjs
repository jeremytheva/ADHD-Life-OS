import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Gamification progress meters expose authoritative progress semantics', async () => {
  const source = await read('src/components/gamification/GamificationDashboard.jsx')

  assert.equal((source.match(/role="progressbar"/g) || []).length, 3)
  assert.equal((source.match(/aria-label="Level progress"/g) || []).length, 2)
  assert.match(source, /aria-valuemax=\{stats\.xp_to_next_level\}/)
  assert.match(source, /aria-valuenow=\{stats\.xp\}/)
  assert.match(source, /aria-valuetext=\{`\$\{stats\.xp\} of \$\{stats\.xp_to_next_level\} XP`\}/)
  assert.match(source, /aria-label=\{`\$\{achievement\.name\} progress`\}/)
  assert.match(source, /aria-valuemax=\{progress\.target\}/)
  assert.match(source, /aria-valuenow=\{progress\.current\}/)
})

test('Sidebar progress control includes the XP value represented by its visual meter', async () => {
  const source = await read('src/components/Layout.jsx')

  assert.match(
    source,
    /aria-label=\{`Open progress\. Level \$\{stats\.level\}, \$\{stats\.points\} points, \$\{stats\.xp\} of \$\{stats\.xp_to_next_level\} XP\$\{stats\.current_streak > 0 \? `, \$\{stats\.current_streak\}-day streak` : ''\}`\}/
  )
  assert.match(
    source,
    /className="w-full bg-purple-200 rounded-full h-1\.5 overflow-hidden" aria-hidden="true"/
  )
})
