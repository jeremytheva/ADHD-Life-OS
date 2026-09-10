import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const routineFormSource = readFileSync(
  fileURLToPath(new URL('../src/components/routines/RoutineForm.jsx', import.meta.url)),
  'utf8'
);

const taskFormSource = readFileSync(
  fileURLToPath(new URL('../src/components/tasks/TaskForm.jsx', import.meta.url)),
  'utf8'
);

test('routine form control glyphs are decorative beside authoritative action names', () => {
  assert.match(
    routineFormSource,
    /aria-label=\{`Close \$\{title\}`\}[\s\S]*?<SafeIcon icon=\{FiX\} className="w-5 h-5" aria-hidden="true" \/>/
  );
  assert.match(
    routineFormSource,
    /<SafeIcon icon=\{FiPlus\} className="w-4 h-4" aria-hidden="true" \/>[\s\S]*?<span>Add Step<\/span>/
  );
  assert.match(
    routineFormSource,
    /aria-label=\{`Remove step \$\{index \+ 1\}`\}[\s\S]*?<SafeIcon icon=\{FiTrash2\} className="w-4 h-4" aria-hidden="true" \/>/
  );
});

test('task form close action keeps its explicit name while hiding the decorative glyph', () => {
  assert.match(
    taskFormSource,
    /aria-label="Close task form"[\s\S]*?<SafeIcon icon=\{FiX\} className="w-5 h-5" aria-hidden="true" \/>/
  );
});