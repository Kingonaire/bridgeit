import { useEffect, useState } from 'react';
import Bridgeit, { supabase } from './Bridgeit.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import './auth.css';

export function App() {
  const isAdminRoute = typeof window !== 'undefined' && (window.location.pathname === '/admin' || new URLSearchParams(window.location.search).has('admin'));
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(!!supabase);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return;
      setSession(next);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSession(data.session);
      if (error) setError(error.message);
      setLoading(false);
    }).catch(() => { if (active) { setError('Unable to restore your session. Please sign in again.'); setLoading(false); } });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  if (isAdminRoute) return <AdminDashboard />;
  if (loading) return <main className="bridge-auth-loading" role="status"><span className="bridge-spinner" aria-hidden="true" /> Opening your BRIDGEit space…</main>;
  return <>{error && <p role="alert" className="bridge-auth-error">{error}</p>}<Bridgeit key={session?.user.id || 'guest'} signedIn={!!session} user={session?.user}/></>;
}
