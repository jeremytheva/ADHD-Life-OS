import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/inbox/BrainInbox.jsx', import.meta.url), 'utf8')

test('pending inbox category persistence owns its item until the write settles', () => {
  assert.match(source, /const \[categoryPendingIds, setCategoryPendingIds\] = useState\(\(\) => new Set\(\)\)/)
  assert.match(source, /const categoryPendingIdsRef = useRef\(new Set\(\)\)/)
  assert.match(
    source,
    /const handleCategoryChange = async \(id, category\) => \{[\s\S]*?categoryPendingIdsRef\.current\.has\(id\)[\s\S]*?categoryPendingIdsRef\.current\.add\(id\)[\s\S]*?setCategoryPendingIds\(new Set\(categoryPendingIdsRef\.current\)\)[\s\S]*?await inboxService\.updateInboxItem\(id, \{ category \}\)[\s\S]*?finally \{\s*categoryPendingIdsRef\.current\.delete\(id\)\s*setCategoryPendingIds\(new Set\(categoryPendingIdsRef\.current\)\)/
  )

  assert.match(source, /const handleDeleteItem = async \(id\) => \{[\s\S]*?categoryPendingIdsRef\.current\.has\(id\)/)
  assert.match(source, /const handleStartEdit = \(item\) => \{[\s\S]*?categoryPendingIdsRef\.current\.has\(item\.id\)/)
  assert.match(source, /const handleSaveEdit = async \(id\) => \{[\s\S]*?categoryPendingIdsRef\.current\.has\(id\)/)
  assert.match(source, /const handleConvertToTask = async \(item\) => \{[\s\S]*?categoryPendingIdsRef\.current\.has\(item\.id\)/)

  assert.match(source, /aria-label=\{`Choose category for \$\{item\.content\}`\}\s*aria-busy=\{categoryPendingIds\.has\(item\.id\)\}/)
  assert.match(source, /\{categoryPendingIds\.has\(item\.id\) && \(\s*<p className="mt-2 text-xs text-slate-500" role="status">Saving category…<\/p>/)
  assert.match(source, /aria-label=\{categoryPendingIds\.has\(item\.id\) \? `Removing category from \$\{item\.content\}` : `Remove category from \$\{item\.content\}`\}/)

  const categoryOwnedControls = source.match(/disabled=\{[^}]*categoryPendingIds\.has\(item\.id\)[^}]*\}/g) ?? []
  assert.ok(categoryOwnedControls.length >= 6)
})
