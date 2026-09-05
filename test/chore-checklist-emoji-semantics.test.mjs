import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const choreChecklistSource = readFileSync(
  fileURLToPath(new URL('../src/components/housework/ChoreChecklist.jsx', import.meta.url)),
  'utf8'
);

test('ready chore cards hide room emoji when the room label is already visible', () => {
  assert.match(
    choreChecklistSource,
    /<span className="text-xl" aria-hidden="true">\{getRoomIcon\(task\.room\)\}<\/span><h4 className="font-medium text-slate-900">\{task\.title\}<\/h4>[\s\S]*?<span className="capitalize">\{task\.room\.replace\('_', ' '\)\}<\/span>/
  );
});

test('upcoming chore cards preserve the room emoji where no equivalent room label is shown', () => {
  assert.match(
    choreChecklistSource,
    /<div className="flex items-center gap-3"><span className="text-xl">\{getRoomIcon\(task\.room\)\}<\/span><div><h4 className="font-medium text-slate-900">\{task\.title\}<\/h4><div className="text-sm text-slate-600">Due /
  );
});

test('empty chore state hides decorative celebration emoji while keeping the message authoritative', () => {
  assert.match(
    choreChecklistSource,
    /<p className="text-slate-600">No chores due right now\. Great job keeping your space tidy! <span aria-hidden="true">✨<\/span><\/p>/
  );
});
