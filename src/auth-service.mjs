export async function submitAuth(client, mode, fields) {
  if (!client) throw new Error('Account access is unavailable. Please try again later.');
  const email = (fields.email || '').trim();
  let result;
  if (mode === 'send') result = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  else if (mode === 'verify') {
    const token = (fields.code || '').trim();
    if (!/^\d{8}$/.test(token)) throw new Error('Enter the 8-digit code from your email.');
    result = await client.auth.verifyOtp({ email, token, type: 'email' });
    if (!result.error && !result.data?.session) throw new Error('Your session could not be verified. Please request a new code.');
  }
  else if (mode === 'signout') result = await client.auth.signOut({ scope: 'local' });
  else throw new Error('Choose an account action.');
  if (result.error) throw result.error;
  return result.data;
}

export function loadAccountState(user, storage = localStorage) {
  const saved = storage.getItem(`bridgeit:account:${user.id}`);
  return saved ? JSON.parse(saved) : { state: null, revision: 0 };
}
export function saveAccountState(user, state, revision, storage = localStorage) {
  storage.setItem(`bridgeit:account:${user.id}`, JSON.stringify({ state, revision: revision + 1 }));
  return { revision: revision + 1 };
}
