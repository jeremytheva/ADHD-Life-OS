import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const choreListSource = readFileSync(
  fileURLToPath(new URL('../src/components/housework/ChoreChecklist.jsx', import.meta.url)),
  'utf8'
);

test('Chore list initial loading state is announced without exposing its decorative spinner', () => {
  assert.match(choreListSource, /if \(loading && !hasLoaded\)/);
  assert.match(choreListSource, /Loading your chores\.\.\./);
  assert.match(choreListSource, /role="status"/);
  assert.match(choreListSource, /aria-live="polite"/);
  assert.match(choreListSource, /aria-atomic="true"/);
  assert.match(choreListSource, /aria-busy="true"/);
  assert.match(
    choreListSource,
    /animate-spin[\s\S]*?aria-hidden="true"[\s\S]*?Loading your chores\.\.\./
  );
});

test('Chore list subsequent refresh state preserves the established checklist surface', () => {
  assert.match(choreListSource, /className="space-y-6" aria-busy=\{loading \|\| mutationPending\}/);
  assert.match(choreListSource, /Refreshing chores\.\.\./);
});

test('Chore list refresh failures preserve established context and expose focused recovery', () => {
  assert.match(choreListSource, /if \(loadError && !hasLoaded\)/);
  assert.match(choreListSource, /loadError && hasLoaded && !operationError/);
  assert.match(choreListSource, /title="We couldn’t refresh your chores"/);
  assert.match(choreListSource, /Your current chore list is still shown and may be out of date/);
  assert.match(choreListSource, /onRetry=\{retryLoad\}/);
});
