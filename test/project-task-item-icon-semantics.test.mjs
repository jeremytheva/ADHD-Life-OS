import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const taskItemSource = readFileSync(
  fileURLToPath(new URL('../src/components/projects/TaskItem.jsx', import.meta.url)),
  'utf8'
);

test('project task item keeps icon-only actions named while hiding their decorative glyphs', () => {
  assert.match(taskItemSource, /aria-label=\{`Complete task: \$\{task\.title\}`\}[\s\S]*?<SafeIcon icon=\{FiCheck\} className="w-5 h-5" aria-hidden="true" \/>/);
  assert.match(taskItemSource, /aria-label=\{`Delete task: \$\{task\.title\}`\}[\s\S]*?<SafeIcon icon=\{FiTrash2\} className="w-4 h-4" aria-hidden="true" \/>/);
});

test('project task item hides decorative status and metadata icons while retaining text', () => {
  assert.match(taskItemSource, /<SafeIcon icon=\{FiStar\} className="w-3 h-3" aria-hidden="true" \/>[\s\S]*?Essential/);
  assert.match(taskItemSource, /<SafeIcon icon=\{FiClock\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?\{task\.estimated_duration\} min/);
});

test('project task item hides decorative disclosure and add icons while retaining visible action text', () => {
  assert.match(taskItemSource, /icon=\{expanded \? FiChevronDown : FiChevronRight\}[\s\S]*?aria-hidden="true"[\s\S]*?\{expanded \? 'Hide' : 'Show'\} Subtasks/);
  assert.match(taskItemSource, /<SafeIcon icon=\{FiPlus\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?Add Subtasks/);
});
