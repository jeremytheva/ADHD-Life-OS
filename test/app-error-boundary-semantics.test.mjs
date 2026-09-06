import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const errorBoundarySource = readFileSync(
  fileURLToPath(new URL('../src/components/common/AppErrorBoundary.jsx', import.meta.url)),
  'utf8'
);

test('render failures are announced atomically while retry remains a separate action', () => {
  assert.match(
    errorBoundarySource,
    /<div role="alert" aria-atomic="true">[\s\S]*?<h1[^>]*>Something went wrong<\/h1>[\s\S]*?Reference ID:[\s\S]*?<\/div>\s*<button[^>]*onClick=\{this\.retry\}[^>]*>[\s\S]*?Try again[\s\S]*?<\/button>/
  );

  assert.doesNotMatch(
    errorBoundarySource,
    /<main[^>]*role="alert"/
  );
});
