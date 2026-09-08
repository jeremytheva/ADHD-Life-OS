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
    /<div[\s\S]*?role="alert"[\s\S]*?aria-atomic="true"[\s\S]*?<h1[^>]*>Something went wrong<\/h1>[\s\S]*?Reference ID:[\s\S]*?<\/div>\s*<button[^>]*onClick=\{this\.retry\}[^>]*>[\s\S]*?Try again[\s\S]*?<\/button>/
  );

  assert.doesNotMatch(
    errorBoundarySource,
    /<main[^>]*role="alert"/
  );
});

test('render failures recover keyboard focus into the replacement error state', () => {
  assert.match(errorBoundarySource, /this\.errorAlertRef = createRef\(\)/);
  assert.match(
    errorBoundarySource,
    /componentDidUpdate\(_prevProps, prevState\) \{[\s\S]*?if \(!prevState\.error && this\.state\.error\) \{[\s\S]*?this\.errorAlertRef\.current\?\.focus\(\)/
  );
  assert.match(
    errorBoundarySource,
    /<div[\s\S]*?ref=\{this\.errorAlertRef\}[\s\S]*?role="alert"[\s\S]*?tabIndex=\{-1\}/
  );
});
