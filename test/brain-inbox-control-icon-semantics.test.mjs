import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Brain Inbox hides decorative control icons while retaining control text and names', async () => {
  const source = await read('src/components/inbox/BrainInbox.jsx')

  assert.match(
    source,
    /<SafeIcon icon=\{FiInbox\} aria-hidden="true" className="w-4 h-4" \/>\s*<span>Capture Mode<\/span>/
  )
  assert.match(
    source,
    /<SafeIcon icon=\{FiTag\} aria-hidden="true" className="w-4 h-4" \/>\s*<span>Organize Mode<\/span>/
  )
  assert.match(
    source,
    /<SafeIcon icon=\{FiPlus\} aria-hidden="true" className="w-5 h-5" \/>\s*<span className="font-medium">\{capturePending \? 'Saving…' : 'Add'\}<\/span>/
  )
  assert.match(
    source,
    /aria-label=\{`Edit \$\{item\.content\}`\}[\s\S]{0,220}<SafeIcon icon=\{FiEdit3\} aria-hidden="true"/
  )
  assert.match(
    source,
    /<span>Ready to organize\?<\/span>\s*<SafeIcon icon=\{FiArrowRight\} aria-hidden="true"/
  )
  assert.match(
    source,
    /<SafeIcon icon=\{FiZap\} aria-hidden="true" className="w-3 h-3" \/>\s*<span>Task<\/span>/
  )
  assert.match(
    source,
    /aria-label=\{`Remove category from \$\{item\.content\}`\}[\s\S]{0,180}<SafeIcon icon=\{FiTag\} aria-hidden="true"/
  )

  const hiddenTrashIcons = source.match(/<SafeIcon icon=\{FiTrash2\} aria-hidden="true"/g) ?? []
  assert.equal(hiddenTrashIcons.length, 2)
})
