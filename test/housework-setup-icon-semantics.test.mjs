import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const houseworkSetupSource = readFileSync(
  fileURLToPath(new URL('../src/components/housework/HouseworkSetup.jsx', import.meta.url)),
  'utf8'
)

test('housework setup hides decorative icons when text or control semantics carry the meaning', () => {
  assert.match(houseworkSetupSource, /<SafeIcon icon=\{FiHome\} className="w-6 h-6" aria-hidden="true" \/>/)
  assert.match(houseworkSetupSource, /aria-label="Close housework setup"[\s\S]*?<SafeIcon icon=\{FiX\} className="w-6 h-6" aria-hidden="true" \/>/)
  assert.match(houseworkSetupSource, /aria-pressed=\{isSelected\}[\s\S]*?\{isSelected && <SafeIcon icon=\{FiCheck\} className="w-3 h-3 text-white" aria-hidden="true" \/>\}[\s\S]*?\{template\.title\}/)
  assert.match(houseworkSetupSource, /<SafeIcon icon=\{FiHome\} className="w-3 h-3" aria-hidden="true" \/>\{template\.room\.replace\('_', ' '\)\}/)
  assert.match(houseworkSetupSource, /<SafeIcon icon=\{FiPlus\} className="w-5 h-5" aria-hidden="true" \/>Add \{selectedTasks\.size\} Task/)
})
