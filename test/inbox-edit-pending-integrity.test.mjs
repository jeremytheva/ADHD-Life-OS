import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/inbox/BrainInbox.jsx', import.meta.url), 'utf8')

test('brain inbox blocks duplicate edit saves while a write is pending', () => {
  assert.match(source, /const \[editPending, setEditPending\] = useState\(false\)/)
  assert.match(source, /const submittedEdit = editText\.trim\(\)/)
  assert.match(source, /if \(!submittedEdit \|\| editPending\) return/)
  assert.match(source, /setEditPending\(true\)[\s\S]*await inboxService\.updateInboxItem\(id, \{\s*content: submittedEdit/)
  assert.match(source, /finally \{\s*setEditPending\(false\)\s*\}/)
})

test('pending edit owns the editor until its write settles', () => {
  assert.match(source, /className="flex-1 flex gap-2" aria-busy=\{editPending\}/)
  assert.match(source, /onKeyDown=\{\(e\) => e\.key === 'Enter' && handleSaveEdit\(item\.id\)\}[\s\S]*disabled=\{editPending\}/)
  assert.match(source, /disabled=\{editPending \|\| !editText\.trim\(\)\}/)
  assert.match(source, /\{editPending \? 'Saving…' : 'Save'\}/)
  assert.match(source, /type="button"\s*disabled=\{editPending\}\s*onClick=\{\(\) => \{/)
})
