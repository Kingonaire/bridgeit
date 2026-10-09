const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '');
const PROJECT_REF = SUPABASE_URL.match(/https?:\/\/([^.]+)\./)?.[1] || 'jddnstvkfvpkhiafuydd';
const SESSION_KEY = `sb-${PROJECT_REF}-auth-token`;

function authHeaders(accessToken) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${accessToken || SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function request(path, options = {}, accessToken) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase environment variables are missing.');
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(accessToken), ...(options.headers || {}) },
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const message = data?.msg || data?.message || data?.error_description || data?.error || `Supabase request failed (${response.status}).`;
    throw new Error(message);
  }
  return data;
}

export function getAdminSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAdminSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getAdminAccess(session = getAdminSession()) {
  if (!session?.access_token || !session.user?.id) return { authenticated: false, isAdmin: false, session: null };
  try {
    const rows = await request(`/rest/v1/admin_users?select=user_id,email&user_id=eq.${encodeURIComponent(session.user.id)}`, {}, session.access_token);
    return { authenticated: true, isAdmin: rows.length > 0, session, user: session.user };
  } catch (error) {
    return { authenticated: true, isAdmin: false, session, user: session.user, error };
  }
}

export async function sendAdminOtp(email) {
  return request('/auth/v1/otp', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), create_user: false }),
  });
}

export async function verifyAdminOtp(email, token) {
  const session = await request('/auth/v1/verify', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), token: token.trim(), type: 'email' }),
  });
  saveAdminSession(session);
  return getAdminAccess(session);
}

export function signOutAdmin() {
  window.localStorage.removeItem(SESSION_KEY);
}

export async function loadCommunityVideos(session) {
  return request('/rest/v1/community_videos?select=id,phrase,tutor_name,media_url&order=id.desc', {}, session.access_token);
}

export async function deleteCommunityVideo(id, session) {
  return request(`/rest/v1/community_videos?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  }, session.access_token);
}
