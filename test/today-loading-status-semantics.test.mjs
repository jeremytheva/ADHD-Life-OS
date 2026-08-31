import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const todaySource = readFileSync(
  fileURLToPath(new URL('../src/components/today/TodayView.jsx', import.meta.url)),
  'utf8'
);

test('Today loading state is announced without exposing its decorative spinner', () => {
  assert.match(todaySource, /Loading your day\.\.\./);
  assert.match(todaySource, /role="status"/);
  assert.match(todaySource, /aria-live="polite"/);
  assert.match(todaySource, /aria-atomic="true"/);
  assert.match(todaySource, /aria-busy="true"/);
  assert.match(
    todaySource,
    /icon=\{FiRefreshCw\}[\s\S]*?animate-spin[\s\S]*?aria-hidden="true"/
  );
});
