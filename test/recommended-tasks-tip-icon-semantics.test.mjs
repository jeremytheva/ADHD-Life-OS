import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const recommendedTasksSource = readFileSync(
  fileURLToPath(new URL('../src/components/tasks/RecommendedTasks.jsx', import.meta.url)),
  'utf8'
);

test('recommended tasks tip hides its decorative emoji while retaining the visible guidance text', () => {
  assert.match(
    recommendedTasksSource,
    /<span\s+aria-hidden="true">💡<\/span> These tasks are optimal for your current time and energy level/
  );
});
