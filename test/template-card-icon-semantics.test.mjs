import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const templateCardSource = readFileSync(
  fileURLToPath(new URL('../src/components/templates/TemplateCard.jsx', import.meta.url)),
  'utf8'
);

test('template card hides decorative apply control and menu glyphs', () => {
  assert.match(templateCardSource, /<SafeIcon icon=\{isApplied \? FiCheck : FiPlus\} className="w-4 h-4" aria-hidden="true" \/>/);
  assert.match(templateCardSource, /<SafeIcon icon=\{FiChevronDown\} className="w-3 h-3" aria-hidden="true" \/>/);
  assert.match(templateCardSource, /<SafeIcon icon=\{FiPlus\} className="w-4 h-4" aria-hidden="true" \/><span>Apply Directly<\/span>/);
  assert.match(templateCardSource, /<SafeIcon icon=\{FiEdit3\} className="w-4 h-4" aria-hidden="true" \/><span>Edit Before Applying<\/span>/);
});

test('template card hides decorative status, duration, and preview glyphs', () => {
  assert.match(templateCardSource, /<SafeIcon icon=\{FiCheck\} className="w-3 h-3" aria-hidden="true" \/>Applied/);
  assert.match(templateCardSource, /<SafeIcon icon=\{FiClock\} className="w-3 h-3" aria-hidden="true" \/><span>\{totalDuration\} min<\/span>/);
  assert.match(templateCardSource, /<SafeIcon icon=\{FiEye\} className="w-4 h-4" aria-hidden="true" \/>Preview/);
  assert.match(templateCardSource, /aria-label=\{`Preview \$\{templateName\}`\}[\s\S]*?<SafeIcon icon=\{FiEye\} className="w-4 h-4" aria-hidden="true" \/>/);
});

test('template card hides decorative template-type glyphs within explicitly grouped template sections', () => {
  assert.match(templateCardSource, /<SafeIcon icon=\{isRoutine \? FiRefreshCw : FiCheckSquare\} className=\{`w-5 h-5 \$\{isRoutine \? 'text-purple-600' : 'text-green-600'\}`\} aria-hidden="true" \/>/);
});
