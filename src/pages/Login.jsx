import { useState } from 'react';
import { useAuth } from '../shared/AuthContext.jsx';
import { Icon } from '../shared/Icon.jsx';
import { ErrorBanner, Spinner } from '../shared/UI.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password });
      }
      window.location.hash = '#/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="auth__logo">
          <div className="sidebar__logo-mark" style={{ width: 38, height: 38, fontSize: 17 }}>A</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Adver Solutions</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Agency dashboard
            </div>
          </div>
        </div>

        <h1 className="auth__title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth__sub">
          {mode === 'login'
            ? 'Sign in to manage your accounts, top-ups, and structures.'
            : 'Free to start — pay only for what you provision.'}
        </p>

        <form onSubmit={onSubmit} className="auth__form">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          {mode === 'register' && (
            <div className="input-group">
              <label htmlFor="name">Full name</label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>

          <button type="submit" className="btn btn--accent" disabled={busy} style={{ width: '100%', justifyContent: 'center', padding: '11px 14px' }}>
            {busy && <Spinner size={14} />}
            {mode === 'login' ? 'Sign in' : 'Create account'}
            <Icon name="arrow-right" size={13} />
          </button>
        </form>

        <div className="auth__toggle">
          {mode === 'login' ? (
            <>New here? <button type="button" onClick={() => setMode('register')}>Create an account</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => setMode('login')}>Sign in</button></>
          )}
        </div>

      </div>

      <div className="auth__hero">
        <div className="auth__hero-card">
          <div className="auth__hero-eyebrow">Trusted by 1,400+ agencies</div>
          <h2>Provision ad accounts at agency speed.</h2>
          <ul>
            <li><Icon name="check" size={13} stroke={2.5} /> Pre-verified inventory, live in &lt; 30 min</li>
            <li><Icon name="check" size={13} stroke={2.5} /> 7-day replacement warranty</li>
            <li><Icon name="check" size={13} stroke={2.5} /> Visual Structure Builder</li>
            <li><Icon name="check" size={13} stroke={2.5} /> 24/7 human support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
