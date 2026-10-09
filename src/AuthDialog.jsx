import { useEffect, useRef, useState } from 'react';
import { submitAuth } from './auth-service.mjs';

export default function AuthDialog({ client, user, close }) {
  const emailReady = import.meta.env.VITE_SUPABASE_EMAIL_OTP_READY === 'true';
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [remaining, setRemaining] = useState(0);
  const dialog = useRef(null);
  const busyRef = useRef(false);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const prior = document.activeElement;
    const root = dialog.current;
    root.querySelector('input')?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function keydown(event) {
      if (event.key === 'Escape' && !busyRef.current) closeRef.current();
      if (event.key !== 'Tab') return;
      const items = [...root.querySelectorAll('button:not(:disabled), input:not(:disabled)')];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    root.addEventListener('keydown', keydown);
    return () => { root.removeEventListener('keydown', keydown); document.body.style.overflow = previousOverflow; if (prior?.isConnected) prior.focus(); };
  }, []);
  useEffect(() => {
    if (!remaining) return;
    const timer = setTimeout(() => setRemaining(n => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);
  useEffect(() => { if (sent) dialog.current.querySelector('[name=code]')?.focus(); }, [sent]);
  async function perform(mode) {
    if (busyRef.current) return;
    if (!user && !emailReady) { setError('Email sign-in is being set up. Please try again soon.'); return; }
    busyRef.current = true; setBusy(true); setError(''); setMessage('');
    try {
      await submitAuth(client, mode, { email, code });
      if (mode === 'verify' || mode === 'signout') closeRef.current();
      else { setSent(true); setCode(''); setRemaining(60); setMessage('Code sent. Check your inbox and spam folder.'); }
    } catch (err) { setError(err.message || 'Something went wrong. Please try again.'); }
    finally { busyRef.current = false; setBusy(false); }
  }
  return <div className="bridge-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !busy) close(); }}>
    <section ref={dialog} className="bridge-modal bridge-auth-modal" role="dialog" aria-modal="true" aria-labelledby="bridge-auth-title">
      <header className="bridge-modal-header"><h2 id="bridge-auth-title">{user ? 'Your BRIDGEit account' : sent ? 'Check your email' : 'A space of your own'}</h2><button className="bridge-icon-button" aria-label="Close dialog" onClick={close} disabled={busy}>×</button></header>
      <div className="bridge-modal-content">
        {user ? <><p>Signed in as <strong>{user.email}</strong>.</p><p className="bridge-modal-muted">Your profile, connections, and pledges are saved on this device.</p></> : <p>{sent ? <>Enter the 8-digit code sent to <strong>{email}</strong>.</> : 'Enter your email to sign in or create your BRIDGEit account with a one-time code.'}</p>}
        <form className="bridge-auth-form" onSubmit={event => { event.preventDefault(); perform(user ? 'signout' : sent ? 'verify' : 'send'); }}>
          <fieldset disabled={busy}>
            {!user && (sent ? <label>Verification code<input name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" minLength={8} maxLength={8} required value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 8))}/></label> : <label>Email address<input name="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)}/></label>)}
            {error && <p className="bridge-auth-error" role="alert">{error}</p>}
            {message && <p className="bridge-auth-success" role="status">{message}</p>}
            <button className="bridge-primary" type="submit" disabled={!client || busy || (!user && !emailReady)}>{busy && <span className="bridge-spinner" aria-hidden="true" />}{busy ? 'Please wait…' : user ? 'Sign out' : sent ? 'Verify and continue' : 'Send sign-in code'}</button>
          </fieldset>
        </form>
        {!user && sent && <><button className="bridge-auth-link" onClick={() => perform('send')} disabled={busy || remaining > 0}>{remaining ? `Resend code in ${remaining}s` : 'Resend code'}</button><button className="bridge-auth-link" onClick={() => { setSent(false); setCode(''); setError(''); setMessage(''); }} disabled={busy}>Use a different email</button></>}
        {!user && !sent && <p className="bridge-modal-muted bridge-auth-note">We do not ask for a diagnosis or proof of disability.</p>}
        {!client && <p role="alert">Account access is unavailable. Please try again later.</p>}
        {client && !user && !emailReady && <p className="bridge-auth-setup" role="status">Email sign-in is being set up. Please try again soon.</p>}
      </div>
    </section>
  </div>;
}
