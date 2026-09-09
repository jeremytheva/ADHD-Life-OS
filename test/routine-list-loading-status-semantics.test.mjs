import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const routineListSource = readFileSync(
  fileURLToPath(new URL('../src/components/routines/RoutineList.jsx', import.meta.url)),
  'utf8'
);

test('Routine list initial loading state is announced without exposing its decorative spinner', () => {
  assert.match(routineListSource, /if \(loading && !hasLoaded\)/);
  assert.match(routineListSource, /Loading routines\.\.\./);
  assert.match(routineListSource, /role="status"/);
  assert.match(routineListSource, /aria-live="polite"/);
  assert.match(routineListSource, /aria-atomic="true"/);
  assert.match(routineListSource, /aria-busy="true"/);
  assert.match(
    routineListSource,
    /aria-hidden="true"[\s\S]*?animate-spin[\s\S]*?Loading routines\.\.\./
  );
});

test('Routine list subsequent refresh preserves the established interactive surface', () => {
  assert.match(routineListSource, /className="p-6 space-y-6" aria-busy=\{loading\}/);
  assert.match(routineListSource, /Refreshing routines\.\.\./);
});
