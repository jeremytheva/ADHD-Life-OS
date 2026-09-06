import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const dashboardSource = readFileSync(
  fileURLToPath(new URL('../src/components/gamification/GamificationDashboard.jsx', import.meta.url)),
  'utf8'
);

test('gamification dashboard hides decorative metric icons while preserving explicit labels', () => {
  assert.match(dashboardSource, /<SafeIcon icon=\{FiTrendingUp\} className="w-5 h-5 text-purple-600" aria-hidden="true" \/>[\s\S]*?>Level<\/span>/);
  assert.match(dashboardSource, /<SafeIcon icon=\{FiStar\} className="w-5 h-5 text-yellow-600" aria-hidden="true" \/>[\s\S]*?>Points<\/span>/);
  assert.match(dashboardSource, /<span className="text-xl" aria-hidden="true">🔥<\/span>[\s\S]*?>Streak<\/span>/);
  assert.match(dashboardSource, /<SafeIcon icon=\{FiAward\} className="w-5 h-5 text-green-600" aria-hidden="true" \/>[\s\S]*?>Badges<\/span>/);
});

test('gamification dashboard hides decorative dialog chrome and compact streak glyphs', () => {
  assert.match(dashboardSource, /<span className="text-lg" aria-hidden="true">🔥<\/span>[\s\S]*?>Day Streak<\/div>/);
  assert.match(dashboardSource, /<SafeIcon icon=\{FiAward\} className="w-8 h-8" aria-hidden="true" \/>[\s\S]*?id="gamification-progress-title"/);
  assert.match(dashboardSource, /aria-label="Close progress"[\s\S]*?<SafeIcon icon=\{FiX\} className="w-6 h-6" aria-hidden="true" \/>/);
});

test('gamification dashboard hides achievement artwork while preserving achievement names', () => {
  assert.match(dashboardSource, /className="text-3xl mb-2 text-center" aria-hidden="true">\{achievement\.icon\}<\/div>[\s\S]*?\{achievement\.name\}/);
  assert.match(dashboardSource, /className="text-4xl mb-3 text-center" aria-hidden="true">\{achievement\.icon\}<\/div>[\s\S]*?\{achievement\.name\}/);
  assert.match(dashboardSource, /className="text-4xl mb-3 text-center grayscale" aria-hidden="true">[\s\S]*?\{achievement\.icon\}[\s\S]*?<\/div>[\s\S]*?\{achievement\.name\}/);
});
