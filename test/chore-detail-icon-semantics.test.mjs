import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const choreDetailSource = readFileSync(
  fileURLToPath(new URL('../src/components/housework/ChoreDetailView.jsx', import.meta.url)),
  'utf8'
);

test('Chore Detail hides decorative metadata and section glyphs while visible text remains authoritative', () => {
  assert.match(choreDetailSource, /<SafeIcon icon=\{FiClock\} className="w-4 h-4" aria-hidden="true" \/><span className="text-sm font-medium">Duration<\/span>/);
  assert.match(choreDetailSource, /<SafeIcon icon=\{FiCalendar\} className="w-4 h-4" aria-hidden="true" \/><span className="text-sm font-medium">Frequency<\/span>/);
  assert.match(choreDetailSource, /<SafeIcon icon=\{FiPackage\} className="w-5 h-5 text-slate-600" aria-hidden="true" \/><h3 id=\{requiredItemsHeadingId\}[^>]*>What You'll Need<\/h3>/);
  assert.match(choreDetailSource, /<SafeIcon icon=\{FiList\} className="w-5 h-5 text-slate-600" aria-hidden="true" \/><h3 id=\{stepsHeadingId\}[^>]*>Steps<\/h3>/);
  assert.match(choreDetailSource, /<SafeIcon icon=\{FiTrendingUp\} className="w-4 h-4 text-purple-600" aria-hidden="true" \/><span className="text-sm font-medium text-purple-900">Your Progress<\/span>/);
});

test('Chore Detail keeps control state authoritative while hiding redundant glyphs', () => {
  assert.match(choreDetailSource, /aria-label="Close chore details"[\s\S]*?<SafeIcon icon=\{FiX\} className="w-6 h-6" aria-hidden="true" \/>/);
  assert.match(choreDetailSource, /aria-pressed=\{Boolean\(checklistState\[index\]\)\}[\s\S]*?<SafeIcon icon=\{FiCheck\} className="w-4 h-4 text-white" aria-hidden="true" \/>/);
  assert.match(choreDetailSource, /<SafeIcon icon=\{FiCheck\} className="w-5 h-5" aria-hidden="true" \/>Mark as Complete/);
  assert.match(choreDetailSource, /role="status" aria-live="polite"[\s\S]*?className="text-8xl mb-4" aria-hidden="true">✨<\/motion\.div>[\s\S]*?Great job!/);
});

test('Chore Detail preserves the room emoji because no equivalent room label is exposed beside the title', () => {
  assert.match(choreDetailSource, /<span className="text-4xl">\{getRoomIcon\(task\.room\)\}<\/span>/);
});
