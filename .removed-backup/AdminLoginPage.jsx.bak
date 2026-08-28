import { C } from '../shared/theme.js'
import { useState } from 'react'
import { useNavigate } from '../shared/Router.jsx'
import { Logo } from '../shared/UI.jsx'
import { useAuth } from '../shared/AuthContext.jsx'

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const blocked = attempts >= 5;

  const submit = async () => {
    if (blocked) { setError("Too many failed attempts. Please contact support."); return; }
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    try {
      await adminLogin(email, password);
      navigate("/admin");
    } catch (err) {
      const left = Math.max(0, 5 - attempts - 1);
      setAttempts(p => p + 1);
      setError(`${err.message || 'Invalid credentials.'} ${left} attempt${left !== 1 ? 's' : ''} remaining.`);
    } finally {
      setLoading(false);
    }
  };

  const darkInput = {
    width: "100%", background: "rgba(255,255,255,.05)", border: "1.5px solid rgba(255,255,255,.1)",
    borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#fff", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", padding: 20 }}>
<div style={{ width: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <Logo size="md" />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(232,25,44,.1)", border: "1px solid rgba(232,25,44,.25)", borderRadius: 30, padding: "6px 16px", marginBottom: 14 }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#e88", letterSpacing: 1 }}>RESTRICTED ACCESS</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "0 0 8px" }}>Admin Portal</h1>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, margin: 0 }}>Authorized personnel only</p>
        </div>
        <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: "36px", boxShadow: "0 40px 80px rgba(0,0,0,.5)" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 7, fontWeight: 600 }}>Admin Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@adversolutions.com" style={darkInput}
              onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 7, fontWeight: 600 }}>Admin Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••" style={darkInput}
              onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}
              onKeyDown={e => e.key === "Enter" && submit()}
            />
          </div>
          {error && (
            <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5", padding: "10px 14px", borderRadius: 9, fontSize: 13, marginBottom: 18 }}>{error}</div>
          )}
          <button onClick={submit} disabled={loading || blocked}
            style={{ width: "100%", background: loading || blocked ? C.g600 : C.primary, color: "#fff", border: "none", borderRadius: 10, padding: "13px 0", fontSize: 15, fontWeight: 900, cursor: loading || blocked ? "default" : "pointer", fontFamily: "inherit", marginBottom: 14, transition: "all .2s" }}>
            {loading ? "Authenticating…" : "Access Admin Panel →"}
          </button>
          <button onClick={() => navigate("/login")}
            style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "11px 0", fontSize: 13, color: "rgba(255,255,255,.35)", cursor: "pointer", fontFamily: "inherit" }}>
            ← Back to User Login
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,.15)" }}>
          Unauthorized access is monitored and prosecuted
        </div>
      </div>
    </div>
  );
}
