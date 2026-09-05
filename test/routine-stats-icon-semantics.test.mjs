import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const routineStatsSource = readFileSync(
  fileURLToPath(new URL('../src/components/routines/RoutineStats.jsx', import.meta.url)),
  'utf8'
);

test('routine statistics hides the decorative close glyph', () => {
  assert.match(routineStatsSource, /aria-label="Close routine statistics"[\s\S]*?<SafeIcon icon=\{FiX\} className="w-6 h-6" aria-hidden="true" \/>/);
});

test('routine statistics hides decorative metric glyphs beside explicit labels', () => {
  assert.match(routineStatsSource, /<SafeIcon icon=\{FiTrendingUp\} className="w-4 h-4 text-purple-600" aria-hidden="true" \/>[\s\S]*?Total Completions/);
  assert.match(routineStatsSource, /<SafeIcon icon=\{FiActivity\} className="w-4 h-4 text-green-600" aria-hidden="true" \/>[\s\S]*?Completion Rate/);
  assert.match(routineStatsSource, /<SafeIcon icon=\{FiClock\} className="w-4 h-4 text-blue-600" aria-hidden="true" \/>[\s\S]*?Avg\. Time/);
  assert.match(routineStatsSource, /<SafeIcon icon=\{FiAward\} className="w-4 h-4 text-orange-600" aria-hidden="true" \/>[\s\S]*?Current Streak/);
});

test('routine statistics hides decorative history and empty-state calendar glyphs', () => {
  assert.match(routineStatsSource, /<SafeIcon icon=\{FiCalendar\} className="w-5 h-5" aria-hidden="true" \/>[\s\S]*?Recent Completions/);
  assert.match(routineStatsSource, /<SafeIcon icon=\{FiCalendar\} className="w-12 h-12 text-slate-300 mx-auto mb-4" aria-hidden="true" \/>[\s\S]*?No data available yet/);
});
