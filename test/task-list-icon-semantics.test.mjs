import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const taskListSource = readFileSync(
  fileURLToPath(new URL('../src/components/tasks/TaskList.jsx', import.meta.url)),
  'utf8'
);

test('task list hides decorative control icons while retaining visible labels', () => {
  assert.match(taskListSource, /<SafeIcon icon=\{FiBookOpen\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?<span>Templates<\/span>/);
  assert.match(taskListSource, /<SafeIcon icon=\{FiPlus\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?<span>Add Task<\/span>/);
  assert.match(taskListSource, /aria-label="Filter tasks by timeframe"[\s\S]*?<SafeIcon icon=\{FiFilter\} className="w-5 h-5 text-slate-600" aria-hidden="true" \/>/);
});

test('task list hides the current mode emoji because adjacent text names the mode', () => {
  assert.match(taskListSource, /<span className="text-2xl" aria-hidden="true">\{currentMode\.icon\}<\/span>[\s\S]*?Viewing \{currentMode\.label\} Tasks/);
});
