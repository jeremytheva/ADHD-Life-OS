import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const taskLoadSource = readFileSync(
  fileURLToPath(new URL('../src/components/tasks/TaskLoadAnalysis.jsx', import.meta.url)),
  'utf8'
);

test('task load hides the decorative time icon while retaining the visible estimate label', () => {
  assert.match(
    taskLoadSource,
    /<SafeIcon icon=\{FiClock\} className="w-4 h-4 text-blue-600" aria-hidden="true" \/>[\s\S]*?<span className="text-sm text-blue-900 font-medium">Estimated Time<\/span>/
  );
});

test('task load hides the decorative warning icon while retaining warning text', () => {
  assert.match(
    taskLoadSource,
    /<SafeIcon icon=\{FiAlertCircle\} className="w-4 h-4 text-amber-600 mt-0.5" aria-hidden="true" \/>[\s\S]*?You have \{overdue\} overdue task[\s\S]*?critical task/
  );
});
