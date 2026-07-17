import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const authContext = await readFile('src/contexts/AuthContext.jsx', 'utf8');
const authSessionController = await readFile('src/contexts/authSessionController.js', 'utf8');
const app = await readFile('src/App.jsx', 'utf8');

test('AuthProvider starts one guarded initial session verification', () => {
  assert.match(authContext, /controller\.current\.startVerification\(\);/);
  assert.match(authSessionController, /if \(verificationStarted\) return/);
  assert.match(authSessionController, /const currentVerificationId = \+\+verificationId/);
  assert.match(authSessionController, /currentVerificationId !== verificationId/);
});

test('route changes consume auth status without requesting another session verification', () => {
  assert.doesNotMatch(app, /refreshSession|checkSession|authService\.getCurrentUser/);
  assert.match(app, /const \{ status, error, retrySessionVerification \} = useAuth\(\)/);
  assert.match(app, /status === AUTH_STATUS\.AUTHENTICATED/);
  assert.match(app, /const isAnonymous = status === AUTH_STATUS\.ANONYMOUS/);
  assert.match(app, /status === AUTH_STATUS\.ERROR/);
  assert.match(app, /retrySessionVerification/);
  assert.doesNotMatch(app, /useEffect\([\s\S]*?location[\s\S]*?verifySession/);
  assert.doesNotMatch(app, /useEffect\([\s\S]*?\[\s*location\s*\]/);
});

test('auth events take precedence over an in-flight session verification', () => {
  assert.match(authContext, /controller\.current\.handleAuthStateChange\(event, session\);/);
  assert.match(authSessionController, /verificationId \+= 1/);
  assert.match(authSessionController, /status: user \? 'authenticated' : 'anonymous'/);
});
