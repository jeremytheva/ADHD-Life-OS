import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const settingsSource = readFileSync(
  fileURLToPath(new URL('../src/components/settings/Settings.jsx', import.meta.url)),
  'utf8'
);

test('settings preference failures announce error copy without wrapping retry controls', () => {
  assert.match(
    settingsSource,
    /<p ref=\{loadErrorRef\} role="alert" aria-atomic="true" tabIndex=\{-1\}>Could not load preferences:[\s\S]*?<\/p>\s*<button onClick=\{loadPreferences\}[\s\S]*?>\s*Retry loading\s*<\/button>/
  );
  assert.match(
    settingsSource,
    /<p role="alert" aria-atomic="true">Could not save preferences:[\s\S]*?<\/p>\s*<button onClick=\{\(\) => handleUpdatePreferences\(lastUpdates\)\}[\s\S]*?>\s*Retry saving\s*<\/button>/
  );

  assert.doesNotMatch(settingsSource, /<div role="alert"[^>]*>[\s\S]*?Retry loading/);
  assert.doesNotMatch(settingsSource, /<div role="alert"[^>]*>[\s\S]*?Retry saving/);
});

test('settings load failure receives bounded focus recovery without stealing focus for save failures', () => {
  assert.match(settingsSource, /const loadErrorRef = useRef\(null\)/);
  assert.match(
    settingsSource,
    /useEffect\(\(\) => \{\s*if \(loadError\) loadErrorRef\.current\?\.focus\(\)\s*\}, \[loadError\]\)/
  );
  assert.match(
    settingsSource,
    /<p ref=\{loadErrorRef\} role="alert" aria-atomic="true" tabIndex=\{-1\}>Could not load preferences:/
  );
  assert.doesNotMatch(settingsSource, /ref=\{loadErrorRef\}[^>]*Could not save preferences:/);
});
