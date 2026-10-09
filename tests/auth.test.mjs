import test from 'node:test';
import assert from 'node:assert/strict';
import { submitAuth, loadAccountState, saveAccountState } from '../src/auth-service.mjs';
function client(method, response = { data: {}, error: null }) {
  const calls = [];
  return { calls, auth: { [method]: async (...args) => { calls.push(args); return response; } } };
}
test('OTP request supports new and existing users without returning a fake session', async () => {
  const api = client('signInWithOtp', { data: { user: null, session: null }, error: null });
  const result = await submitAuth(api, 'send', { email: ' person@example.test ' });
  assert.equal(result.session, null);
  assert.deepEqual(api.calls[0], [{ email: 'person@example.test', options: { shouldCreateUser: true } }]);
});
test('verification supplies the code and email and requires a real session', async () => {
  const api = client('verifyOtp', { data: { session: { user: { id: 'verified' } } }, error: null });
  const result = await submitAuth(api, 'verify', { email: 'person@example.test', code: '01234567' });
  assert.equal(result.session.user.id, 'verified');
  assert.deepEqual(api.calls[0], [{ email: 'person@example.test', token: '01234567', type: 'email' }]);
  await assert.rejects(submitAuth(client('verifyOtp'), 'verify', { email: 'person@example.test', code: '01234567' }), /could not be verified/);
});
test('invalid code shapes never reach the backend', async () => {
  const api = client('verifyOtp');
  for (const code of ['123', 'abcdefgh', '123456789']) await assert.rejects(submitAuth(api, 'verify', { code }), /8-digit/);
  assert.equal(api.calls.length, 0);
});
test('expired codes and email delivery failures surface without false success', async () => {
  await assert.rejects(submitAuth(client('verifyOtp', { error: new Error('Token has expired') }), 'verify', { code: '12345678' }), /expired/);
  await assert.rejects(submitAuth(client('signInWithOtp', { error: new Error('Email rate limit exceeded') }), 'send', { email: 'person@example.test' }), /rate limit/);
  await assert.rejects(submitAuth(null, 'send', {}), /unavailable/);
});
test('password actions are rejected and local signout uses Supabase', async () => {
  const api = client('signOut');
  await submitAuth(api, 'signout', {});
  assert.deepEqual(api.calls[0], [{ scope: 'local' }]);
  for (const mode of ['signin', 'signup', 'reset', 'update']) await assert.rejects(submitAuth(api, mode, {}), /Choose an account action/);
});
test('account state is isolated by user and reports storage failures', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  saveAccountState({ id: 'alice' }, { savedSearches: ['hello'] }, 0, storage);
  assert.deepEqual(loadAccountState({ id: 'alice' }, storage), { state: { savedSearches: ['hello'] }, revision: 1 });
  assert.deepEqual(loadAccountState({ id: 'bob' }, storage), { state: null, revision: 0 });
  assert.throws(() => saveAccountState({ id: 'alice' }, {}, 0, { setItem: () => { throw new Error('quota'); } }), /quota/);
});
