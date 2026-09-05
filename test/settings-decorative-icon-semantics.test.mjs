import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const settingsSource = readFileSync(
  fileURLToPath(new URL('../src/components/settings/Settings.jsx', import.meta.url)),
  'utf8'
);

test('settings decorative section and action icons are hidden from assistive technology', () => {
  assert.match(
    settingsSource,
    /<SafeIcon\s+aria-hidden="true"\s+icon=\{FiSliders\}/
  );
  assert.match(
    settingsSource,
    /<SafeIcon\s+aria-hidden="true"\s+icon=\{FiEye\}/
  );
  assert.match(
    settingsSource,
    /<SafeIcon\s+aria-hidden="true"\s+icon=\{FiSettings\}/
  );
  assert.match(settingsSource, />\s*Mode Preferences\s*<\/h2>/);
  assert.match(settingsSource, />\s*Accessibility\s*<\/h2>/);
  assert.match(settingsSource, />\s*Configure\s*<\/button>/);
});
