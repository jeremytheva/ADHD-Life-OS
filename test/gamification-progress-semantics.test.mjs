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
