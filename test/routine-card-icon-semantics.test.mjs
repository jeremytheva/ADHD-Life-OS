import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const routineCardSource = readFileSync(
  fileURLToPath(new URL('../src/components/routines/RoutineCard.jsx', import.meta.url)),
  'utf8'
);

test('routine card hides decorative identity and named action glyphs', () => {
  assert.match(routineCardSource, /<SafeIcon icon=\{FiRefreshCw\} className="w-6 h-6 text-purple-600 mt-1" aria-hidden="true" \/>/);
  assert.match(routineCardSource, /aria-label=\{`Edit routine: \$\{routine\.name\}`\}[\s\S]*?<SafeIcon icon=\{FiEdit2\} className="w-4 h-4" aria-hidden="true" \/>/);
  assert.match(routineCardSource, /aria-label=\{`Delete routine: \$\{routine\.name\}`\}[\s\S]*?<SafeIcon icon=\{FiTrash2\} className="w-4 h-4" aria-hidden="true" \/>/);
});

test('routine card hides decorative metadata and labelled action glyphs', () => {
  assert.match(routineCardSource, /<SafeIcon icon=\{FiClock\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?\{totalDuration\} min total/);
  assert.match(routineCardSource, /<SafeIcon icon=\{FiBarChart2\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?<span>Stats<\/span>/);
  assert.match(routineCardSource, /<SafeIcon icon=\{FiPlay\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?<span>Start<\/span>/);
});
