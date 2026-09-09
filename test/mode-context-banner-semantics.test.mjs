import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const inboxSource = readFileSync(
  fileURLToPath(new URL('../src/pages/Inbox.jsx', import.meta.url)),
  'utf8'
);
const houseworkSource = readFileSync(
  fileURLToPath(new URL('../src/pages/Housework.jsx', import.meta.url)),
  'utf8'
);

test('mode context banners keep decorative mode icons out of the accessibility tree', () => {
  assert.match(
    inboxSource,
    /<span className="text-2xl" aria-hidden="true">\{currentMode\.icon\}<\/span>/
  );
  assert.match(
    houseworkSource,
    /<span className="text-2xl" aria-hidden="true">\{currentMode\.icon\}<\/span>/
  );
});

test('mode context banners retain their textual mode context', () => {
  assert.match(inboxSource, /\{currentMode\.label\} Mode Active/);
  assert.match(houseworkSource, /Home Mode Active/);
});
