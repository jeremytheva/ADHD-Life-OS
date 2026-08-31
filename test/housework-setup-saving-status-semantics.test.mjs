import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const houseworkSetupSource = readFileSync(
  fileURLToPath(new URL('../src/components/housework/HouseworkSetup.jsx', import.meta.url)),
  'utf8'
);

test('Housework setup saving state is announced without exposing its decorative spinner', () => {
  assert.match(houseworkSetupSource, /aria-busy=\{saving\}/);
  assert.match(
    houseworkSetupSource,
    /aria-hidden="true"[\s\S]*?animate-spin[\s\S]*?Creating Tasks\.\.\./
  );
  assert.match(houseworkSetupSource, /role="status"/);
  assert.match(houseworkSetupSource, /aria-live="polite"/);
  assert.match(houseworkSetupSource, /aria-atomic="true"/);
  assert.match(houseworkSetupSource, /\{saving \? 'Creating tasks\.\.\.' : ''\}/);
});
