import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/inbox/BrainInbox.jsx', import.meta.url), 'utf8')

test('brain inbox blocks duplicate capture submissions while a save is pending', () => {
  assert.match(source, /const \[capturePending, setCapturePending\] = useState\(false\)/)
  assert.match(source, /const submittedContent = currentInput\.trim\(\)/)
  assert.match(source, /if \(!submittedContent \|\| capturePending\) return/)
  assert.match(source, /setCapturePending\(true\)[\s\S]*await inboxService\.createInboxItem/)
  assert.match(source, /finally \{\s*setCapturePending\(false\)\s*\}/)
})

test('capture input stays stable until the current save resolves', () => {
  assert.match(source, /content: submittedContent/)
  assert.match(source, /disabled=\{capturePending\}/)
  assert.match(source, /disabled=\{capturePending \|\| !currentInput\.trim\(\)\}/)
  assert.match(source, /aria-busy=\{capturePending\}/)
  assert.match(source, /\{capturePending \? 'Saving…' : 'Add'\}/)
})
