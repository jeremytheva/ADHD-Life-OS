import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const inboxSource = readFileSync(
  fileURLToPath(new URL('../src/components/inbox/BrainInbox.jsx', import.meta.url)),
  'utf8'
)

test('brain inbox capture claims synchronous ownership before persistence', () => {
  assert.match(inboxSource, /const captureOwnerRef = useRef\(null\)/)
  assert.match(
    inboxSource,
    /const submittedContent = currentInput\.trim\(\)\s*if \(!submittedContent \|\| captureOwnerRef\.current !== null\) return\s*\s*const captureOwner = Symbol\('brain-inbox-capture'\)\s*captureOwnerRef\.current = captureOwner\s*setCapturePending\(true\)[\s\S]*?await inboxService\.createInboxItem/
  )
  assert.match(
    inboxSource,
    /finally \{\s*if \(captureOwnerRef\.current === captureOwner\) \{\s*captureOwnerRef\.current = null\s*setCapturePending\(false\)\s*\}\s*\}/
  )
})

test('brain inbox edit claims synchronous per-item ownership and blocks competing item writes', () => {
  assert.match(inboxSource, /const editOwnerRef = useRef\(null\)/)
  assert.match(
    inboxSource,
    /const submittedEdit = editText\.trim\(\)[\s\S]*?editOwnerRef\.current !== null[\s\S]*?const editOwner = \{ id \}\s*editOwnerRef\.current = editOwner\s*setEditPending\(true\)[\s\S]*?await inboxService\.updateInboxItem\(id, \{\s*content: submittedEdit\s*\}\)/
  )
  assert.match(inboxSource, /editOwnerRef\.current\?\.id === id/)
  assert.match(inboxSource, /editOwnerRef\.current\?\.id === item\.id/)
  assert.match(
    inboxSource,
    /finally \{\s*if \(editOwnerRef\.current === editOwner\) \{\s*editOwnerRef\.current = null\s*setEditPending\(false\)\s*\}\s*\}/
  )
})

test('brain inbox preserves pending input against same-tick field and cancel changes', () => {
  assert.match(inboxSource, /if \(captureOwnerRef\.current === null\) setCurrentInput\(e\.target\.value\)/)
  assert.match(inboxSource, /if \(editOwnerRef\.current === null\) setEditText\(e\.target\.value\)/)
  assert.match(inboxSource, /if \(editOwnerRef\.current !== null\) return\s*setEditingId\(null\)/)
})
