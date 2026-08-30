import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Chore Detail exposes checklist step controls as one named group', async () => {
  const source = await read('src/components/housework/ChoreDetailView.jsx')

  assert.match(source, /const stepsHeadingId = useId\(\)/)
  assert.match(source, /<h3 id=\{stepsHeadingId\} className="font-medium text-slate-900">Steps<\/h3>/)
  assert.match(source, /role="group"/)
  assert.match(source, /aria-labelledby=\{stepsHeadingId\}/)
})

test('Chore Detail retains authoritative pressed-state and completion guards', async () => {
  const source = await read('src/components/housework/ChoreDetailView.jsx')

  assert.match(source, /aria-pressed=\{Boolean\(checklistState\[index\]\)\}/)
  assert.match(source, /onClick=\{\(\) => handleToggleChecklistItem\(index\)\}/)
  assert.match(source, /disabled=\{closeLocked\}/)
  assert.match(source, /if \(closeLocked\) return/)
})
