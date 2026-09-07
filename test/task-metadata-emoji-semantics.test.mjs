import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Task metadata keeps decorative emoji out of accessible names', async () => {
  const source = await read('src/components/tasks/TaskMetadataForm.jsx')

  assert.match(source, /level === 'low'[\s\S]*?<span aria-hidden="true">🔋<\/span> Low/)
  assert.match(source, /level === 'medium'[\s\S]*?<span aria-hidden="true">⚡<\/span> Medium/)
  assert.match(source, /level === 'high'[\s\S]*?<span aria-hidden="true">🚀<\/span> High/)
  assert.match(source, /aria-label=\{`Interest level \$\{level\} of 5`\}[\s\S]*?<span aria-hidden="true">\{'❤️'\.repeat\(level\)\}<\/span>/)
  assert.match(source, /aria-label=\{`Aversiveness \$\{level\} of 5`\}[\s\S]*?<span aria-hidden="true">\{'😓'\.repeat\(level\)\}<\/span>/)
  assert.match(source, /<span aria-hidden="true">💡<\/span> <strong>Tip:<\/strong>/)
  assert.match(source, /aria-pressed=\{metadata\.energy_required === level\}/)
  assert.match(source, /aria-pressed=\{metadata\.interest_level === level\}/)
  assert.match(source, /aria-pressed=\{metadata\.aversiveness === level\}/)
})
