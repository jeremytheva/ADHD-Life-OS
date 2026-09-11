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
    /const handleConvertToTask = async \(item\) => \{[\s\S]*?convertingIdsRef\.current\.has\(item\.id\)[\s\S]*?convertingIdsRef\.current\.add\(item\.id\)\s*setConvertingIds\(new Set\(convertingIdsRef\.current\)\)[\s\S]*?await inboxService\.convertToTask\(item\.id\)[\s\S]*?finally \{\s*convertingIdsRef\.current\.delete\(item\.id\)\s*setConvertingIds\(new Set\(convertingIdsRef\.current\)\)/
  )

  assert.match(source, /const handleDeleteItem = async \(id\) => \{[\s\S]*?convertingIdsRef\.current\.has\(id\)/)
  assert.match(source, /const handleCategoryChange = async \(id, category\) => \{[\s\S]*?convertingIdsRef\.current\.has\(id\)/)

  assert.match(source, /onClick=\{\(\) => handleConvertToTask\(item\)\}[\s\S]{0,320}?disabled=\{[^}]*convertingIds\.has\(item\.id\)[^}]*\}[\s\S]{0,160}?aria-busy=\{convertingIds\.has\(item\.id\)\}/)
  assert.match(source, /aria-label=\{convertingIds\.has\(item\.id\) \? `Converting \$\{item\.content\} to task` : `Convert \$\{item\.content\} to task`\}/)
  assert.match(source, /\{convertingIds\.has\(item\.id\) \? 'Converting…' : 'Task'\}/)

  const conversionGuardedControls = source.match(/disabled=\{[^}]*convertingIds\.has\(item\.id\)[^}]*\}/g) ?? []
  assert.ok(conversionGuardedControls.length >= 5)
})
