import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const source = readFileSync(
  fileURLToPath(new URL('../src/components/today/NextActionPanel.jsx', import.meta.url)),
  'utf8'
);

test('next-action selection changes are announced to assistive technology', () => {
  assert.match(source, /className="sr-only"[\s\S]*?role="status"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-atomic="true"/);
  assert.match(source, /Suggested next action: \{selected\.title\}\. Start with this: \{selected\.start_action\}/);
  assert.match(source, /onClick=\{chooseAnother\}/);
});
