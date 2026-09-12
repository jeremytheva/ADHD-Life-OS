import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/inbox/BrainInbox.jsx', import.meta.url), 'utf8')

test('brain inbox blocks duplicate edit saves while a write is pending', () => {
  assert.match(source, /const \[editPending, setEditPending\] = useState\(false\)/)
  assert.match(source, /const editOwnerRef = useRef\(null\)/)
  assert.match(source, /const submittedEdit = editText\.trim\(\)/)
  assert.match(source, /const handleSaveEdit = async \(id\) => \{[\s\S]*?!submittedEdit[\s\S]*?editOwnerRef\.current !== null[\s\S]*?deletingIdsRef\.current\.has\(id\)[\s\S]*?convertingIdsRef\.current\.has\(id\)[\s\S]*?categoryPendingIdsRef\.current\.has\(id\)[\s\S]*?editOwnerRef\.current = editOwner\s*setEditPending\(true\)[\s\S]*?await inboxService\.updateInboxItem\(id, \{\s*content: submittedEdit/)
  assert.match(source, /finally \{\s*if \(editOwnerRef\.current === editOwner\) \{\s*editOwnerRef\.current = null\s*setEditPending\(false\)\s*\}\s*\}/)
})

test('pending edit owns the editor until its write settles', () => {
  assert.match(source, /const handleStartEdit = \(item\) => \{[\s\S]*?editOwnerRef\.current !== null[\s\S]*?deletingIdsRef\.current\.has\(item\.id\)[\s\S]*?convertingIdsRef\.current\.has\(item\.id\)[\s\S]*?categoryPendingIdsRef\.current\.has\(item\.id\)/)
  assert.match(source, /editOwnerRef\.current\?\.id === id/)
  assert.match(source, /editOwnerRef\.current\?\.id === item\.id/)
  assert.match(source, /className="flex-1 flex gap-2" aria-busy=\{editPending\}/)
  assert.match(source, /onKeyDown=\{\(e\) => e\.key === 'Enter' && handleSaveEdit\(item\.id\)\}[\s\S]*disabled=\{editPending\}/)
  assert.match(source, /disabled=\{editPending \|\| !editText\.trim\(\)\}/)
  assert.match(source, /\{editPending \? 'Saving…' : 'Save'\}/)
  assert.match(source, /type="button"\s*disabled=\{editPending\}\s*onClick=\{\(\) => \{\s*if \(editOwnerRef\.current !== null\) return/)
  assert.match(source, /onClick=\{\(\) => handleStartEdit\(item\)\}[\s\S]{0,300}?disabled=\{[^}]*editPending[^}]*categoryPendingIds\.has\(item\.id\)[^}]*\}/)
})