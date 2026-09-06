import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const subtaskListSource = readFileSync(
  fileURLToPath(new URL('../src/components/projects/SubtaskList.jsx', import.meta.url)),
  'utf8'
);

test('subtask collection exposes list semantics', () => {
  assert.match(subtaskListSource, /<ul className="space-y-2 mb-3" aria-label="Subtasks">[\s\S]*?<motion\.li[\s\S]*?<\/motion\.li>[\s\S]*?<\/ul>/);
});

test('subtask icon-only controls retain names while hiding decorative glyphs', () => {
  assert.match(subtaskListSource, /aria-label=\{`\$\{subtask\.is_completed \? 'Mark incomplete' : 'Mark complete'\}: \$\{subtask\.title\}`\}[\s\S]*?<SafeIcon icon=\{FiCheck\} className="w-3 h-3 text-white" aria-hidden="true" \/>/);
  assert.match(subtaskListSource, /aria-label=\{`Delete subtask: \$\{subtask\.title\}`\}[\s\S]*?<SafeIcon icon=\{FiTrash2\} className="w-4 h-4" aria-hidden="true" \/>/);
});

test('subtask metadata and add actions hide decorative glyphs while retaining text', () => {
  assert.match(subtaskListSource, /<SafeIcon icon=\{FiClock\} className="w-3 h-3" aria-hidden="true" \/>[\s\S]*?\{subtask\.estimated_duration\} min/);
  assert.match(subtaskListSource, /<SafeIcon icon=\{FiPlus\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?Add/);
  assert.match(subtaskListSource, /<SafeIcon icon=\{FiPlus\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?Add Another Subtask/);
});
