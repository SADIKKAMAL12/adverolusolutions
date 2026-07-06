import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { api } from './api.js';
import { setStore } from './store.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Plain fetch here (not the `api` helper) — this is just the initial
        // "am I logged in?" probe on app boot, so a 401 is expected/normal for
        // anonymous visitors and must NOT bounce them to #/login.
        const res = await fetch('/api/users/me', { credentials: 'same-origin' });
        if (!res.ok) throw new Error('not logged in');
        const me = await res.json();
        if (!cancelled) {
          setUser(me);
          setStore({ balance: me.balance ?? 0 });
        }
      } catch (_) {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const me = await api.post('/api/auth/login', { email, password });
      setUser(me);
      setStore({ balance: me.balance ?? 0 });
      return me;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    setError(null);
    try {
      const me = await api.post('/api/admin/login', { email, password });
      setUser(me);
      setStore({ balance: me.balance ?? 0 });
      return me;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const register = useCallback(async (payload) => {
    setError(null);
    try {
      const me = await api.post('/api/auth/register', payload);
      setUser(me);
      setStore({ balance: me.balance ?? 0 });
      return me;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/api/auth/logout', {}); } catch (_) {}
    setUser(null);
    setStore({ balance: 0 });
    window.location.hash = '#/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, adminLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
