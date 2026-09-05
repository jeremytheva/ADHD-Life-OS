import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const routineProgressSource = readFileSync(
  fileURLToPath(new URL('../src/components/routines/RoutineProgress.jsx', import.meta.url)),
  'utf8'
);

test('routine progress hides decorative named control glyphs', () => {
  assert.match(routineProgressSource, /aria-label="Cancel routine session"[\s\S]*?<SafeIcon icon=\{FiX\} className="w-6 h-6" aria-hidden="true" \/>/);
  assert.match(routineProgressSource, /<SafeIcon icon=\{FiSkipForward\} className="w-5 h-5" aria-hidden="true" \/>[\s\S]*?<span>\{actionPending \? 'Saving…' : 'Skip'\}<\/span>/);
  assert.match(routineProgressSource, /<SafeIcon icon=\{FiCheck\} className="w-5 h-5" aria-hidden="true" \/>[\s\S]*?<span>\{actionPending \? 'Saving…' : 'Complete'\}<\/span>/);
});

test('routine progress hides decorative current-step metadata glyphs', () => {
  assert.match(routineProgressSource, /<SafeIcon icon=\{FiClock\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?\{currentStep\.duration_minutes\} min/);
  assert.match(routineProgressSource, /<SafeIcon icon=\{FiAlertCircle\} className="w-4 h-4 text-blue-600" aria-hidden="true" \/>[\s\S]*?<span className="text-blue-600 font-medium">Essential<\/span>/);
});

test('routine progress preserves semantic status glyphs in the all-steps list', () => {
  assert.match(routineProgressSource, /<SafeIcon icon=\{FiSkipForward\} className="w-3 h-3" \/>/);
  assert.match(routineProgressSource, /<SafeIcon icon=\{FiCheck\} className="w-3 h-3" \/>/);
});
