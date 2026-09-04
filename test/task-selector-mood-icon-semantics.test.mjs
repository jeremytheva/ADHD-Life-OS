import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const taskSelectorSource = readFileSync(
  fileURLToPath(new URL('../src/components/tasks/TaskSelector.jsx', import.meta.url)),
  'utf8'
);

test('task selector mood buttons hide decorative emoji while retaining visible labels', () => {
  assert.match(
    taskSelectorSource,
    /<span\s+aria-hidden="true"\s+className="mr-1">\{mood\.emoji\}<\/span>/
  );
  assert.match(
    taskSelectorSource,
    /\{mood\.value\.charAt\(0\)\.toUpperCase\(\) \+ mood\.value\.slice\(1\)\}/
  );
  assert.match(
    taskSelectorSource,
    /aria-pressed=\{userState\.mood === mood\.value\}/
  );
});
