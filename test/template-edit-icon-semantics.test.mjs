import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Template Edit hides redundant action icons while retaining template type artwork', async () => {
  const source = await read('src/components/templates/TemplateEditModal.jsx')

  assert.match(source, /aria-label="Close template editor"[^>]*>\s*<SafeIcon icon=\{FiX\} aria-hidden="true"/)
  assert.match(source, /<SafeIcon icon=\{FiPlus\} aria-hidden="true"[^>]*\/>Add Step/)
  assert.match(source, /aria-label=\{`Remove step \$\{index \+ 1\}`\}[^>]*>\s*<SafeIcon icon=\{FiTrash2\} aria-hidden="true"/)
  assert.match(source, /<SafeIcon icon=\{FiSave\} aria-hidden="true"[^>]*\/>\{isApplying \? 'Applying…' : 'Apply Template'\}/)

  assert.match(source, /<SafeIcon icon=\{isRoutine \? FiRefreshCw : FiCheckSquare\} className=/)
  assert.doesNotMatch(source, /<SafeIcon icon=\{isRoutine \? FiRefreshCw : FiCheckSquare\} aria-hidden="true"/)
})
