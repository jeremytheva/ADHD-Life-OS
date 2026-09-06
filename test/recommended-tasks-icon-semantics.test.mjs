import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const recommendedTasksSource = readFileSync(
  fileURLToPath(new URL('../src/components/tasks/RecommendedTasks.jsx', import.meta.url)),
  'utf8'
);

test('recommended tasks heading and duration icons are decorative', () => {
  assert.match(
    recommendedTasksSource,
    /<SafeIcon icon=\{FiZap\} className="w-5 h-5 text-blue-600" aria-hidden="true" \/>[\s\S]*?Recommended Right Now/
  );
  assert.match(
    recommendedTasksSource,
    /<SafeIcon icon=\{FiClock\} className="w-3 h-3" aria-hidden="true" \/>[\s\S]*?\{task\.estimated_duration \|\| 60\} min/
  );
});

test('recommended task metadata separator remains presentation-only', () => {
  assert.match(
    recommendedTasksSource,
    /<span aria-hidden="true">•<\/span>[\s\S]*?<span>\{task\.urgencyReason\}<\/span>/
  );
});

test('recommended task hint emoji remains presentation-only', () => {
  assert.match(
    recommendedTasksSource,
    /<span aria-hidden="true">💡<\/span> These tasks are optimal for your current time and energy level/
  );
});
