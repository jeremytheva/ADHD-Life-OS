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

test('mode preferences exposes selection and switch state programmatically', () => {
  assert.match(source, /<fieldset>[\s\S]*?<legend[\s\S]*?Visual Theme[\s\S]*?aria-pressed=\{preferences\.theme === theme\.value\}/);
  assert.match(source, /<fieldset>[\s\S]*?<legend[\s\S]*?View Density[\s\S]*?aria-pressed=\{preferences\.viewMode === view\.value\}/);
  assert.match(source, /htmlFor="mode-preferences-sort"[\s\S]*?<select[\s\S]*?id="mode-preferences-sort"/);

  assert.match(source, /role="switch"[\s\S]*?aria-checked=\{preferences\.showAnimations\}[\s\S]*?aria-label="Show animations"/);
  assert.match(source, /role="switch"[\s\S]*?aria-checked=\{preferences\.showNotifications\}[\s\S]*?aria-label="Mode notifications"/);
  assert.match(source, /role="switch"[\s\S]*?aria-checked=\{preferences\.hideCompleted\}[\s\S]*?aria-label="Hide completed tasks"/);
});

test('mode preferences hides decorative iconography from assistive technology', () => {
  assert.match(source, /className="text-4xl" aria-hidden="true">\{mode\.icon\}/);
  assert.match(source, /icon=\{FiMonitor\}[\s\S]*?aria-hidden="true"/);
  assert.match(source, /icon=\{FiZap\}[\s\S]*?aria-hidden="true"/);
  assert.match(source, /icon=\{FiBell\}[\s\S]*?aria-hidden="true"/);
  assert.match(source, /icon=\{FiEyeOff\}[\s\S]*?aria-hidden="true"/);
  assert.match(source, /icon=\{FiSave\}[\s\S]*?aria-hidden="true"/);
});
