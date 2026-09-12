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

test('Today preserves the established surface while timeline refreshes', () => {
  assert.match(todaySource, /const \[hasLoaded, setHasLoaded\] = useState\(false\)/);
  assert.match(todaySource, /setHasLoaded\(true\)/);
  assert.match(todaySource, /if \(loading && !hasLoaded\) return/);
  assert.match(todaySource, /if \(loadError && !hasLoaded\) return/);
  assert.match(todaySource, /aria-busy=\{loading \|\| taskMutationPending\}/);
  assert.match(todaySource, /Refreshing Today\.\.\./);
  assert.match(todaySource, /We couldn’t refresh your day/);
  assert.match(todaySource, /Your existing Today view is still available/);
});

test('Today keeps mutation refresh failure recovery specific to the completed task', () => {
  assert.match(
    todaySource,
    /if \(!refreshed\) \{[\s\S]*?setLoadError\(false\)[\s\S]*?The task was completed, but Today could not refresh/
  );
});
