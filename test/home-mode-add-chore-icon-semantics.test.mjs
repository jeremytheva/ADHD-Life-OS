import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const homeModeTaskContainerSource = readFileSync(
  fileURLToPath(new URL('../src/components/housework/HomeModeTaskContainer.jsx', import.meta.url)),
  'utf8'
);

test('Home mode Add Chores keeps visible action text authoritative and hides its decorative glyph', () => {
  assert.match(
    homeModeTaskContainerSource,
    /<SafeIcon icon=\{FiPlus\} className="w-4 h-4" aria-hidden="true" \/><span>Add Chores<\/span>/
  );
});
