import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const layoutSource = readFileSync(
  fileURLToPath(new URL('../src/components/Layout.jsx', import.meta.url)),
  'utf8'
);

test('layout hides decorative streak emoji while preserving explicit streak text', () => {
  assert.match(layoutSource, /<span aria-hidden="true">🔥<\/span>[\s\S]*?<span>\{stats\.current_streak\}-day streak<\/span>/);
});

test('layout hides decorative coin emoji while preserving the numeric coin balance', () => {
  assert.match(layoutSource, /<span className="text-xs" aria-hidden="true">💰<\/span>[\s\S]*?<span className="text-xs font-bold">\{currency\.coins\}<\/span>/);
});
