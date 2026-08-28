import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '../shared/Router.jsx';
import { useTheme } from '../shared/ThemeContext.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import { ChevronLeft } from 'lucide-react';

const api = (path, opts) => fetch(path, opts).then(r => r.json());

const DEFAULTS = {
  smtp_host: 'mail.spacemail.com',
  smtp_port: '465',
  smtp_user: 'support@adversolutions.agency',
  smtp_pass: '',
};

function ToggleSwitch({ theme, checked, onChange, color = '#22c55e' }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ width: 46, height: 26, borderRadius: 100, border: 'none', background: checked ? `linear-gradient(90deg,#34d399,${color})` : theme.surfaceSunken, position: 'relative', cursor: 'pointer', flexShrink: 0, boxShadow: checked ? `0 0 12px -2px ${color}` : 'none' }}>
      <span style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 22, height: 22, borderRadius: 999, background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

function TextInput({ theme, suffix, ...rest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input {...rest} style={{ width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }} />
      {suffix && <span style={{ fontSize: 12.5, color: theme.textMuted, whiteSpace: 'nowrap' }}>{suffix}</span>}
    </div>
  );
}

function Label({ theme, children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{children}</div>;
}

export default function AdminEmailOTPPage() {
  const navigate = useNavigate();
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');

  const [cfg, setCfg] = useState({
    email_otp_enabled: false,
    email_otp_expiry: 10,
    email_otp_max_attempts: 3,
    email_otp_cooldown: 60,
    ...DEFAULTS,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api('/api/admin/platform-settings');
      setCfg(prev => ({
        ...prev,
        email_otp_enabled: data.email_otp_enabled ?? false,
        email_otp_expiry: data.email_otp_expiry ?? 10,
        email_otp_max_attempts: data.email_otp_max_attempts ?? 3,
        email_otp_cooldown: data.email_otp_cooldown ?? 60,
        smtp_host: data.smtp_host || DEFAULTS.smtp_host,
        smtp_port: data.smtp_port || DEFAULTS.smtp_port,
        smtp_user: data.smtp_user || DEFAULTS.smtp_user,
        smtp_pass: data.smtp_pass || '',
      }));
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveAll = async () => {
    setSaving(true);
    await api('/api/admin/platform-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_otp_enabled: cfg.email_otp_enabled,
        email_otp_expiry: cfg.email_otp_expiry,
        email_otp_max_attempts: cfg.email_otp_max_attempts,
        email_otp_cooldown: cfg.email_otp_cooldown,
        smtp_host: cfg.smtp_host,
        smtp_port: cfg.smtp_port,
        smtp_user: cfg.smtp_user,
        smtp_pass: cfg.smtp_pass,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleEnabled = async (next) => {
    const updated = { ...cfg, email_otp_enabled: next };
    setCfg(updated);
    await api('/api/admin/platform-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_otp_enabled: next }),
    });
  };

  const sendTest = async () => {
    if (!testEmail) return;
    setTesting(true);
    setTestResult(null);
    const res = await api('/api/email-otp?action=test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: testEmail }),
    });
    setTesting(false);
    setTestResult(res.success
      ? { ok: true, msg: 'Test email sent successfully!' }
      : { ok: false, msg: res.error || 'Failed to send' });
  };

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <style>{`@media (max-width: 640px) { .eo-grid { grid-template-columns: 1fr !important; } }`}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Email OTP</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Configure SMTP settings and email OTP verification for user registration.</p>
        </div>
        <button onClick={() => navigate('/admin/settings')} style={{ height: 44, padding: '0 18px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 }}><ChevronLeft size={15} /> Back to System Settings</button>
      </div>

      <GlassCard theme={theme} glow style={{ marginTop: 24, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: cfg.email_otp_enabled ? '#22c55e' : '#ef4444' }}>Email OTP is {cfg.email_otp_enabled ? 'Enabled' : 'Disabled'}</div>
          <div style={{ fontSize: 12.5, color: theme.textMuted, marginTop: 4 }}>{cfg.email_otp_enabled ? 'Users must verify their email address when registering' : 'Email OTP verification is not required at registration'}</div>
        </div>
        <ToggleSwitch theme={theme} checked={cfg.email_otp_enabled} onChange={toggleEnabled} />
      </GlassCard>

      <GlassCard theme={theme} style={{ marginTop: 20, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>SMTP Configuration</div>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: theme.textMuted }}>Spacemail / any SMTP server credentials</p>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><Label theme={theme}>SMTP Host</Label><TextInput theme={theme} value={cfg.smtp_host} onChange={e => setCfg(c => ({ ...c, smtp_host: e.target.value }))} placeholder="mail.spacemail.com" /></div>
          <div><Label theme={theme}>SMTP Port</Label><TextInput theme={theme} value={cfg.smtp_port} onChange={e => setCfg(c => ({ ...c, smtp_port: e.target.value }))} placeholder="465" /></div>
          <div><Label theme={theme}>Username</Label><TextInput theme={theme} value={cfg.smtp_user} onChange={e => setCfg(c => ({ ...c, smtp_user: e.target.value }))} placeholder="support@adversolutions.agency" /></div>
          <div><Label theme={theme}>Password</Label><TextInput theme={theme} type="password" value={cfg.smtp_pass} onChange={e => setCfg(c => ({ ...c, smtp_pass: e.target.value }))} placeholder="••••••••" /></div>
        </div>
      </GlassCard>

      <GlassCard theme={theme} style={{ marginTop: 20, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Test SMTP</div>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: theme.textMuted }}>Send a test email to verify your SMTP settings work</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}><TextInput theme={theme} type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="Send test to this email..." /></div>
          <button onClick={sendTest} disabled={testing || !testEmail} style={{ height: 46, padding: '0 20px', borderRadius: 12, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: testing || !testEmail ? 'not-allowed' : 'pointer', fontFamily: FONT, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.5)', opacity: testing || !testEmail ? 0.6 : 1 }}>{testing ? 'Sending…' : 'Send Test'}</button>
        </div>
        {testResult && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: testResult.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: testResult.ok ? '#22c55e' : '#ef4444', border: `1px solid ${testResult.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            {testResult.ok ? '✓ ' : '✕ '}{testResult.msg}
          </div>
        )}
      </GlassCard>

      <GlassCard theme={theme} style={{ marginTop: 20, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>OTP Settings</div>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: theme.textMuted }}>Configure code expiry, attempts, and cooldown</p>
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }} className="eo-grid">
          <div><Label theme={theme}>Code Expiry</Label><TextInput theme={theme} type="number" min={1} max={60} value={cfg.email_otp_expiry} onChange={e => setCfg(c => ({ ...c, email_otp_expiry: Number(e.target.value) }))} suffix="minutes" /></div>
          <div><Label theme={theme}>Max Attempts</Label><TextInput theme={theme} type="number" min={1} max={10} value={cfg.email_otp_max_attempts} onChange={e => setCfg(c => ({ ...c, email_otp_max_attempts: Number(e.target.value) }))} suffix="tries" /></div>
          <div><Label theme={theme}>Cooldown</Label><TextInput theme={theme} type="number" min={10} max={3600} value={cfg.email_otp_cooldown} onChange={e => setCfg(c => ({ ...c, email_otp_cooldown: Number(e.target.value) }))} suffix="seconds" /></div>
        </div>
        <button onClick={saveAll} disabled={saving || saved} style={{ marginTop: 22, width: '100%', height: 50, borderRadius: 14, border: 'none', background: saved ? 'linear-gradient(180deg,#34d399,#22c55e)' : `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: FONT, boxShadow: '0 14px 30px -12px rgba(255,45,85,0.55)', opacity: saving ? 0.7 : 1 }}>
          {saved ? '✓ Settings saved' : saving ? 'Saving…' : 'Save Settings'}
        </button>
      </GlassCard>
    </div>
  );
}
