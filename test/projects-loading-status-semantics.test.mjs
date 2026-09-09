import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const projectsListSource = readFileSync(
  fileURLToPath(new URL('../src/components/projects/ProjectsList.jsx', import.meta.url)),
  'utf8'
);

test('Projects initial loading state is announced without exposing its decorative spinner', () => {
  assert.match(projectsListSource, /if \(loading && !hasLoaded\)/);
  assert.match(projectsListSource, /Loading your projects\.\.\./);
  assert.match(projectsListSource, /role="status"/);
  assert.match(projectsListSource, /aria-live="polite"/);
  assert.match(projectsListSource, /aria-atomic="true"/);
  assert.match(projectsListSource, /aria-busy="true"/);
  assert.match(
    projectsListSource,
    /animate-spin[\s\S]*?aria-hidden="true"[\s\S]*?Loading your projects\.\.\./
  );
});

test('Projects subsequent refresh state preserves the established project surface', () => {
  assert.match(projectsListSource, /className="p-6 space-y-6" aria-busy=\{loading\}/);
  assert.match(projectsListSource, /Refreshing projects\.\.\./);
});

test('Projects refresh failures keep established content and avoid duplicate mutation recovery', () => {
  assert.match(projectsListSource, /if \(loadError && !hasLoaded\)/);
  assert.match(projectsListSource, /loadError && !operationError/);
  assert.match(projectsListSource, /We couldn’t refresh your projects/);
  assert.match(projectsListSource, /Your existing project list is still available/);
  assert.match(projectsListSource, /<OperationErrorState message=\{operationError\}/);
});
