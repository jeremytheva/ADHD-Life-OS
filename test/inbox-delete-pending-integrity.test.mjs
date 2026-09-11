import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Brain Inbox gives each delete request exclusive ownership of its item until persistence settles', async () => {
  const source = await read('src/components/inbox/BrainInbox.jsx')

  assert.match(source, /const \[deletingIds, setDeletingIds\] = useState\(\(\) => new Set\(\)\)/)
  assert.match(source, /const deletingIdsRef = useRef\(new Set\(\)\)/)
  assert.match(
    source,
    /const handleDeleteItem = async \(id\) => \{\s*if \(deletingIdsRef\.current\.has\(id\) \|\| convertingIdsRef\.current\.has\(id\)\) return\s*deletingIdsRef\.current\.add\(id\)\s*setDeletingIds\(new Set\(deletingIdsRef\.current\)\)[\s\S]*?await inboxService\.deleteInboxItem\(id\)[\s\S]*?finally \{\s*deletingIdsRef\.current\.delete\(id\)\s*setDeletingIds\(new Set\(deletingIdsRef\.current\)\)/
  )

  assert.match(source, /if \(editPending \|\| deletingIdsRef\.current\.has\(item\.id\) \|\| convertingIdsRef\.current\.has\(item\.id\)\) return/)
  assert.match(source, /if \(!submittedEdit \|\| editPending \|\| deletingIdsRef\.current\.has\(id\) \|\| convertingIdsRef\.current\.has\(id\)\) return/)
  assert.match(source, /const handleCategoryChange = async \(id, category\) => \{\s*if \(deletingIdsRef\.current\.has\(id\) \|\| convertingIdsRef\.current\.has\(id\)\) return/)
  assert.match(source, /const handleConvertToTask = async \(item\) => \{\s*if \(deletingIdsRef\.current\.has\(item\.id\) \|\| convertingIdsRef\.current\.has\(item\.id\)\) return/)

  const guardedDeleteButtons = source.match(/onClick=\{\(\) => handleDeleteItem\(item\.id\)\}[\s\S]{0,260}?disabled=\{deletingIds\.has\(item\.id\) \|\| convertingIds\.has\(item\.id\)\}[\s\S]{0,160}?aria-busy=\{deletingIds\.has\(item\.id\)\}/g) ?? []
  assert.equal(guardedDeleteButtons.length, 2)

  const deletingLabels = source.match(/aria-label=\{deletingIds\.has\(item\.id\) \? `Deleting \$\{item\.content\}` : `Delete \$\{item\.content\}`\}/g) ?? []
  assert.equal(deletingLabels.length, 2)
})
