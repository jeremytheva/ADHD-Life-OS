import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const projectsListSource = readFileSync(
  fileURLToPath(new URL('../src/components/projects/ProjectsList.jsx', import.meta.url)),
  'utf8'
);

test('Projects loading state is announced without exposing its decorative spinner', () => {
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
