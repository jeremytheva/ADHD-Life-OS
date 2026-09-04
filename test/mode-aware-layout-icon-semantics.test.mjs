import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const modeAwareLayoutSource = readFileSync(
  fileURLToPath(new URL('../src/components/mode/ModeAwareLayout.jsx', import.meta.url)),
  'utf8'
);

test('mode-aware layout hides the decorative mode icon while retaining visible mode text', () => {
  assert.match(
    modeAwareLayoutSource,
    /<span className="text-2xl" aria-hidden="true">\{currentMode\.icon\}<\/span>/
  );
  assert.match(modeAwareLayoutSource, /\{currentMode\.label\} Mode/);
  assert.match(modeAwareLayoutSource, /Showing only \{currentMode\.label\.toLowerCase\(\)\}-related items/);
});
