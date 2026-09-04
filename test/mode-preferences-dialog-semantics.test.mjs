import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const source = readFileSync(
  fileURLToPath(new URL('../src/components/mode/ModePreferences.jsx', import.meta.url)),
  'utf8'
);

test('mode preferences exposes a named modal dialog and labelled close control', () => {
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby="mode-preferences-title"/);
  assert.match(source, /<h2 id="mode-preferences-title"/);
  assert.match(source, /aria-label="Close mode preferences"/);
  assert.match(source, /icon=\{FiX\}[\s\S]*?aria-hidden="true"/);
});
