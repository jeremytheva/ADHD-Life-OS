import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const nextActionSource = readFileSync(
  fileURLToPath(new URL('../src/components/today/NextActionPanel.jsx', import.meta.url)),
  'utf8'
);

test('next action fit controls expose a named native group', () => {
  assert.match(nextActionSource, /aria-controls="next-action-fit-controls"/);
  assert.match(nextActionSource, /<fieldset id="next-action-fit-controls"/);
  assert.match(nextActionSource, /<legend className="sr-only">Recommendation fit<\/legend>/);
  assert.match(nextActionSource, /<label[^>]*>[\s\S]*?Energy now[\s\S]*?<select/);
  assert.match(nextActionSource, /<label[^>]*>[\s\S]*?Time available[\s\S]*?<select/);
  assert.match(nextActionSource, /<\/fieldset>/);
});
