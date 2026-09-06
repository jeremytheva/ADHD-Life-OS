import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const templatePreviewSource = readFileSync(
  fileURLToPath(new URL('../src/components/templates/TemplatePreview.jsx', import.meta.url)),
  'utf8'
)

test('template preview keeps its named close control while hiding the decorative close glyph', () => {
  assert.match(templatePreviewSource, /aria-label="Close template preview"[\s\S]*?<SafeIcon icon=\{FiX\} className="w-5 h-5" aria-hidden="true" \/>/)
})

test('template preview hides decorative metadata glyphs while preserving visible metadata text', () => {
  assert.match(templatePreviewSource, /<SafeIcon icon=\{FiTag\} className="w-4 h-4 text-slate-500" aria-hidden="true" \/>[\s\S]*?\{template\.category\}/)
  assert.match(templatePreviewSource, /<SafeIcon icon=\{FiClock\} className="w-4 h-4 text-slate-500" aria-hidden="true" \/>[\s\S]*?\{totalDuration\} minutes total/)
  assert.match(templatePreviewSource, /<SafeIcon icon=\{FiRefreshCw\} className="w-4 h-4 text-slate-500" aria-hidden="true" \/>[\s\S]*?\{template\.repeat_pattern\}/)
  assert.match(templatePreviewSource, /<SafeIcon icon=\{FiCheckSquare\} className="w-5 h-5 text-blue-600" aria-hidden="true" \/>[\s\S]*?This is an essential task/)
})

test('template preview hides decorative action glyphs while retaining explicit button text', () => {
  assert.match(templatePreviewSource, /<SafeIcon icon=\{FiEdit3\} className="w-4 h-4" aria-hidden="true" \/>Edit First/)
  assert.match(templatePreviewSource, /<SafeIcon icon=\{FiPlus\} className="w-4 h-4" aria-hidden="true" \/>\{isApplying \? 'Applying…' : 'Apply Now'\}/)
})
