import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { URL } from 'node:url'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('ChoreDetailView claims completion ownership synchronously before persistence', async () => {
  const source = await read('src/components/housework/ChoreDetailView.jsx')

  assert.match(source, /const completionPendingRef = useRef\(false\)/)
  assert.match(source, /const handleComplete = async \(\) => \{[\s\S]*?if \(completionPendingRef\.current \|\| showCelebration\) return[\s\S]*?completionPendingRef\.current = true[\s\S]*?setCompleting\(true\)[\s\S]*?await houseworkService\.completeHouseworkTask/)
})

test('ChoreDetailView blocks close and checklist changes while completion owns persistence', async () => {
  const source = await read('src/components/housework/ChoreDetailView.jsx')

  assert.match(source, /const handleClose = \(\) => \{[\s\S]*?if \(completionPendingRef\.current \|\| showCelebration\) return[\s\S]*?onClose\(\)/)
  assert.match(source, /onClick=\{handleClose\}/)
  assert.match(source, /const handleToggleChecklistItem = \(index\) => \{[\s\S]*?if \(completionPendingRef\.current \|\| closeLocked\) return/)
})

test('ChoreDetailView releases completion ownership only after a failed write so retry remains safe', async () => {
  const source = await read('src/components/housework/ChoreDetailView.jsx')

  assert.match(source, /catch \(error\) \{[\s\S]*?completionPendingRef\.current = false[\s\S]*?setCompleting\(false\)[\s\S]*?return/)
  assert.doesNotMatch(source, /setShowCelebration\(true\)[\s\S]*?completionPendingRef\.current = false/)
})
