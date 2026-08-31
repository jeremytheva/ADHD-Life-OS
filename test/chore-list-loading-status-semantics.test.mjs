import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const choreListSource = readFileSync(
  fileURLToPath(new URL('../src/components/housework/ChoreChecklist.jsx', import.meta.url)),
  'utf8'
);

test('Chore list loading state is announced without exposing its decorative spinner', () => {
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
