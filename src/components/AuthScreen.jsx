import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function describeError(err) {
  const msg = (err && err.message) || 'Something went wrong.';
  if (/failed to fetch|networkerror|fetch failed|load failed/i.test(msg)) {
    return 'Cannot reach the game server right now. You can still play against the computer as a guest.';
  }
  return msg;
}

export default function AuthScreen({ onGuest }) {
  const { signUp, signIn, resetPassword, supabaseConfigured } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password, username.trim());
      } else if (mode === 'reset') {
        await resetPassword(email.trim());
        setInfo('If that email exists, a password reset link is on its way.');
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      if (err.code === 'confirm-required') setInfo(err.message);
      else setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <div className="auth-logo">
          <div className="marks">
            <span className="x">X</span> <span className="o">O</span> <span className="x">X</span>
          </div>
          <h1>Tic-Tac-Toe Arcade</h1>
          <p className="muted">Win games, earn points, collect souvenirs.</p>
        </div>

        {!supabaseConfigured && (
          <div className="alert info">
            Backend not configured. Set your Supabase keys in <code>.env</code> to enable accounts,
            online play, and the store. You can still play the computer as a guest.
          </div>
        )}

        {mode !== 'reset' && (
          <div className="tabs">
            <button className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')} type="button">
              Sign in
            </button>
            <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')} type="button">
              Create account
            </button>
          </div>
        )}

        {error && <div className="alert error">{error}</div>}
        {info && <div className="alert success">{info}</div>}

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="username">Display name</label>
              <input
                id="username"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="How rivals will see you"
                autoComplete="nickname"
                required
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          {mode !== 'reset' && (
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={6}
                required
              />
            </div>
          )}

          <button className="btn btn-primary btn-block" disabled={busy} type="submit">
            {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
          </button>
        </form>

        <div className="row spread" style={{ marginTop: 14 }}>
          {mode === 'reset' ? (
            <button className="link-btn" onClick={() => setMode('signin')} type="button">
              Back to sign in
            </button>
          ) : (
            <button className="link-btn" onClick={() => setMode('reset')} type="button">
              Forgot password?
            </button>
          )}
          <button className="link-btn" onClick={onGuest} type="button">
            Play as guest →
          </button>
        </div>
      </div>
    </div>
  );
}
