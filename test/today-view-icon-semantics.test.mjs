import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const todayViewSource = readFileSync(
  fileURLToPath(new URL('../src/components/today/TodayView.jsx', import.meta.url)),
  'utf8'
);

test('Today view hides the current mode emoji because adjacent text names the active mode', () => {
  assert.match(todayViewSource, /<span className="text-2xl" aria-hidden="true">\{currentMode\.icon\}<\/span>[\s\S]*?\{currentMode\.label\} Mode Active/);
});

test('Today view hides decorative button icons while retaining explicit accessible names', () => {
  assert.match(todayViewSource, /aria-label="Open rewards and progress"[\s\S]*?<SafeIcon icon=\{FiAward\} className="w-5 h-5" aria-hidden="true" \/>/);
  assert.match(todayViewSource, /aria-label="Refresh Today"[\s\S]*?<SafeIcon icon=\{FiRefreshCw\} className="w-5 h-5" aria-hidden="true" \/>/);
});
