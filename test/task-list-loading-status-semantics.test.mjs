import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const taskListSource = readFileSync(
  fileURLToPath(new URL('../src/components/tasks/TaskList.jsx', import.meta.url)),
  'utf8'
);

test('Task list loading state is announced without exposing its decorative spinner', () => {
  assert.match(taskListSource, /Loading tasks\.\.\./);
  assert.match(taskListSource, /role="status"/);
  assert.match(taskListSource, /aria-live="polite"/);
  assert.match(taskListSource, /aria-atomic="true"/);
  assert.match(taskListSource, /aria-busy="true"/);
  assert.match(
    taskListSource,
    /animate-spin[\s\S]*?aria-hidden="true"[\s\S]*?Loading tasks\.\.\./
  );
});
