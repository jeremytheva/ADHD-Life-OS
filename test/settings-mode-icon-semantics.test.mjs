import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const settingsSource = readFileSync(
  fileURLToPath(new URL('../src/components/settings/Settings.jsx', import.meta.url)),
  'utf8'
);

test('settings mode preference buttons hide decorative mode icons from assistive technology', () => {
  assert.match(
    settingsSource,
    /<div\s+aria-hidden="true"\s+className=\{`[\s\S]*?\{mode\.icon\}[\s\S]*?<\/div>/
  );
  assert.match(settingsSource, /\{mode\.label\}/);
  assert.match(settingsSource, /\{mode\.description\}/);
});
