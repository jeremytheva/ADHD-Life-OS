import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Today exposes each non-empty time-of-day block collection as a labelled list', async () => {
  const source = await read('src/components/today/TodayView.jsx')

  assert.match(source, /id=\{`today-\$\{group\.key\}-heading`\}/)
  assert.match(source, /role="list" aria-labelledby=\{`today-\$\{group\.key\}-heading`\}/)
  assert.match(source, /group\.blocks\.map\(\(block, index\) =>/)
  assert.match(source, /<div role="listitem" key=\{`\$\{block\.ref_type\}-\$\{block\.ref_id\}-\$\{index\}`\}>/)
  assert.match(source, /<BlockCard block=\{block\} onComplete=\{handleCompleteTask\}/)
})
