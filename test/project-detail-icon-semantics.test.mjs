import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const projectDetailSource = readFileSync(
  fileURLToPath(new URL('../src/components/projects/ProjectDetailView.jsx', import.meta.url)),
  'utf8'
);

test('project detail hides decorative identity and explicitly named close glyphs', () => {
  assert.match(projectDetailSource, /<span className="text-4xl" aria-hidden="true">\{project\.icon\}<\/span>/);
  assert.match(projectDetailSource, /aria-label="Close project details"[\s\S]*?<SafeIcon icon=\{FiX\} className="w-6 h-6" aria-hidden="true" \/>/);
});

test('project detail hides decorative metadata and action glyphs while retaining visible text', () => {
  assert.match(projectDetailSource, /<SafeIcon icon=\{FiClock\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?hours remaining/);
  assert.match(projectDetailSource, /<SafeIcon icon=\{FiTarget\} className="w-5 h-5 text-blue-600" aria-hidden="true" \/>[\s\S]*?Project Goal/);
  assert.match(projectDetailSource, /<SafeIcon icon=\{FiCalendar\} className="w-5 h-5 text-purple-600" aria-hidden="true" \/>[\s\S]*?Target Date:/);
  assert.match(projectDetailSource, /<SafeIcon icon=\{FiPlus\} className="w-5 h-5" aria-hidden="true" \/>[\s\S]*?Add Task/);
});

test('project detail task-state and empty-state glyphs are decorative beside explicit text', () => {
  assert.match(projectDetailSource, /icon=\{FiAlertCircle\}[\s\S]*?aria-hidden="true"[\s\S]*?To Do \(\{pendingTasks\.length\}\)/);
  assert.match(projectDetailSource, /icon=\{FiCheckCircle\} className="w-5 h-5 text-green-600" aria-hidden="true"[\s\S]*?Completed \(\{completedTasks\.length\}\)/);
  assert.match(projectDetailSource, /className="w-5 h-5 text-green-600 flex-shrink-0"[\s\S]*?aria-hidden="true"[\s\S]*?line-through/);
  assert.match(projectDetailSource, /<SafeIcon icon=\{FiPlus\} className="w-8 h-8 text-blue-600" aria-hidden="true" \/>[\s\S]*?No tasks yet/);
});
