import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const taskCardSource = readFileSync(
  fileURLToPath(new URL('../src/components/tasks/TaskCard.jsx', import.meta.url)),
  'utf8'
);

test('task card keeps icon-only actions named while hiding their decorative glyphs', () => {
  assert.match(taskCardSource, /aria-label=\{`Complete \$\{task\.title\}`\}[\s\S]*?<SafeIcon icon=\{FiCheck\} className="w-5 h-5" aria-hidden="true" \/>/);
  assert.match(taskCardSource, /aria-label=\{`Delete \$\{task\.title\}`\}[\s\S]*?<SafeIcon icon=\{FiTrash2\} className="w-4 h-4" aria-hidden="true" \/>/);
});

test('task card hides decorative metadata icons while retaining visible metadata text', () => {
  assert.match(taskCardSource, /<SafeIcon icon=\{FiClock\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?\{task\.estimated_duration\} min/);
  assert.match(taskCardSource, /icon=\{isOverdue \? FiAlertCircle : FiClock\}[\s\S]*?aria-hidden="true"[\s\S]*?Due \{format\(parseISO\(task\.due_date\), 'MMM d'\)\}/);
});
