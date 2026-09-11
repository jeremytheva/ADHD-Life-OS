import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

const source = await readFile(new URL('../src/components/inbox/BrainInbox.jsx', import.meta.url), 'utf8')

test('pending inbox conversion owns its item until persistence settles', () => {
  assert.match(source, /const \[convertingIds, setConvertingIds\] = useState\(\(\) => new Set\(\)\)/)
  assert.match(source, /const convertingIdsRef = useRef\(new Set\(\)\)/)
  assert.match(
    source,
    /const handleConvertToTask = async \(item\) => \{\s*if \(deletingIdsRef\.current\.has\(item\.id\) \|\| convertingIdsRef\.current\.has\(item\.id\)\) return\s*convertingIdsRef\.current\.add\(item\.id\)\s*setConvertingIds\(new Set\(convertingIdsRef\.current\)\)[\s\S]*?await inboxService\.convertToTask\(item\.id\)[\s\S]*?finally \{\s*convertingIdsRef\.current\.delete\(item\.id\)\s*setConvertingIds\(new Set\(convertingIdsRef\.current\)\)/
  )

  assert.match(source, /const handleDeleteItem = async \(id\) => \{\s*if \(deletingIdsRef\.current\.has\(id\) \|\| convertingIdsRef\.current\.has\(id\)\) return/)
  assert.match(source, /const handleCategoryChange = async \(id, category\) => \{\s*if \(deletingIdsRef\.current\.has\(id\) \|\| convertingIdsRef\.current\.has\(id\)\) return/)

  assert.match(source, /onClick=\{\(\) => handleConvertToTask\(item\)\}\s*disabled=\{deletingIds\.has\(item\.id\) \|\| convertingIds\.has\(item\.id\)\}\s*aria-busy=\{convertingIds\.has\(item\.id\)\}/)
  assert.match(source, /aria-label=\{convertingIds\.has\(item\.id\) \? `Converting \$\{item\.content\} to task` : `Convert \$\{item\.content\} to task`\}/)
  assert.match(source, /\{convertingIds\.has\(item\.id\) \? 'Converting…' : 'Task'\}/)

  const conversionGuardedControls = source.match(/disabled=\{deletingIds\.has\(item\.id\) \|\| convertingIds\.has\(item\.id\)\}/g) ?? []
  assert.ok(conversionGuardedControls.length >= 5)
})
