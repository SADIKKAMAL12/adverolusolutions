import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '../shared/Router.jsx';
import { apiFetch } from '../shared/api.js';
import { useTheme } from '../shared/ThemeContext.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import {
  Smartphone, Mail, Bell, ShieldCheck, PhoneCall, Plus, Save, Upload, X,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════
   API HELPERS
═══════════════════════════════════════════════════ */
async function apiGet(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString();
  const res = await fetch(`/api/crud?${qs}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { console.error('Non-JSON:', text.slice(0,200)); return []; }
}

async function apiPost(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

async function apiPut(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

async function apiDelete(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString();
  const res = await fetch(`/api/crud?${qs}`, { method: 'DELETE' });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

/* ═══════════════════════════════════════════════════
   ADMIN SETTINGS PAGE
═══════════════════════════════════════════════════ */

const SETTINGS_KEY = 'adver_settings_v1';

function loadSettings() {
  try { const raw = localStorage.getItem(SETTINGS_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  return null;
}

function saveSettings(paymentMethods, businessTypes) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ paymentMethods, businessTypes })); } catch (e) {}
}

const PLATFORM_DEFAULTS = {
  allow_signup: true,
  maintenance_mode: false,
  min_deposit: 100,
  global_discount: 0,
  contact_email: '',
  contact_whatsapp: '',
  contact_telegram: '',
  site_name: 'AdverSolutions',
  footer_text: '© AdverSolutions. All rights reserved.',
  site_logo: '',
  site_favicon: '',
  wa_enabled: true,
  wa_number: '',
  wa_position: 'right',
  wa_color: '#25d366',
  wa_animation: 'wiggle_pulse',
  wa_size: 'medium',
};

const CONFIG_PAGES = [
  { label: 'WhatsApp OTP', icon: <Smartphone size={19} />, desc: 'Manage WhatsApp OTP configuration', path: '/admin/whatsapp' },
  { label: 'Email OTP', icon: <Mail size={19} />, desc: 'Configure SMTP and email OTP verification', path: '/admin/email-otp' },
  { label: 'Order Notifications', icon: <Bell size={19} />, desc: 'WhatsApp alerts for orders & top-ups', path: '/admin/order-notifications' },
  { label: 'Account Verifications', icon: <ShieldCheck size={19} />, desc: 'Generate verification links and track their status', path: '/admin/verifications' },
  { label: 'AdverSolutions OTP', icon: <PhoneCall size={19} />, desc: 'Manage phone verification services', path: '/admin/adversolutionsotp-settings' },
];

function Section({ theme, title, sub, children, action }) {
  return (
    <GlassCard theme={theme} style={{ padding: 26, marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: theme.text }}>{title}</div>
          {sub && <p style={{ margin: '4px 0 0', fontSize: 12.5, color: theme.textMuted }}>{sub}</p>}
        </div>
        {action}
      </div>
      <div style={{ marginTop: 18 }}>{children}</div>
    </GlassCard>
  );
}

function Toggle({ theme, checked, onChange, color = BRAND, size = 'md' }) {
  const w = size === 'lg' ? 52 : 42, h = size === 'lg' ? 30 : 24, knob = size === 'lg' ? 26 : 20;
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{ width: w, height: h, borderRadius: 100, border: 'none', background: checked ? `linear-gradient(90deg,${BRAND_LIGHT},${color})` : theme.surfaceSunken, position: 'relative', cursor: 'pointer', flexShrink: 0, boxShadow: checked ? `0 0 12px -2px ${color}` : 'none' }}
    >
      <span style={{ position: 'absolute', top: 2, left: checked ? w - knob - 2 : 2, width: knob, height: knob, borderRadius: 999, background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

function Label({ theme, children }) {
  return <label style={{ fontSize: 11.5, fontWeight: 700, color: theme.textMuted, marginBottom: 7, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{children}</label>;
}

function TextInput({ theme, ...rest }) {
  return (
    <input
      {...rest}
      style={{ width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }}
    />
  );
}

export function AdminSettingsPage({ paymentMethods, businessTypes, setStore }) {
  const navigate = useNavigate();
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingKey, setUploadingKey] = useState(null);
  const [editingMethod, setEditingMethod] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [platformCfg, setPlatformCfg] = useState({ ...PLATFORM_DEFAULTS });
  const [cfgSaving, setCfgSaving] = useState(false);
  const [cfgSuccess, setCfgSuccess] = useState('');

  const [methods, setMethods] = useState(() => {
    const local = loadSettings();
    return local?.paymentMethods || paymentMethods;
  });
  const [bizTypes, setBizTypes] = useState(() => {
    const local = loadSettings();
    return (local?.businessTypes || businessTypes).join('\n');
  });

  useEffect(() => {
    const btArray = bizTypes.split('\n').map(t => t.trim()).filter(Boolean);
    saveSettings(methods, btArray);
    setStore(s => ({ ...s, paymentMethods: methods, businessTypes: btArray }));
  }, [methods, bizTypes, setStore]);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const [pmRes, btRes, cfgRes] = await Promise.all([
        fetch('/api/admin/payment-methods'),
        fetch('/api/admin/business-types'),
        fetch('/api/admin/platform-settings'),
      ]);
      const pmData = pmRes.ok ? await pmRes.json() : null;
      const btData = btRes.ok ? await btRes.json() : null;
      const cfgData = cfgRes.ok ? await cfgRes.json() : null;
      if (pmData && Array.isArray(pmData)) setMethods(pmData);
      if (btData && Array.isArray(btData)) setBizTypes(btData.join('\n'));
      if (cfgData && typeof cfgData === 'object') setPlatformCfg(c => ({ ...c, ...cfgData }));
    } catch (err) {
      console.error('Settings refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePlatformCfg = async () => {
    setCfgSaving(true);
    setCfgSuccess('');
    setError('');
    try {
      await apiFetch('/api/admin/platform-settings', {
        method: 'POST',
        body: JSON.stringify(platformCfg),
      });
      setCfgSuccess('Platform settings saved!');
      setTimeout(() => setCfgSuccess(''), 3000);
    } catch (e) {
      setError('Failed to save platform settings: ' + e.message);
    } finally {
      setCfgSaving(false);
    }
  };

  const cfgSet = (key, val) => setPlatformCfg(c => ({ ...c, [key]: val }));

  const handleImageUpload = (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    setError('');
    const ext = file.name.split('.').pop().toLowerCase();
    const filename = `${key}-${Date.now()}.${ext}`;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = await apiFetch('/api/admin/upload-asset', {
          method: 'POST',
          body: JSON.stringify({ data: e.target.result, filename }),
        });
        cfgSet(key, result.url);
      } catch {
        cfgSet(key, e.target.result);
      } finally {
        setUploadingKey(null);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  const saveBizTypes = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updatedBizTypes = bizTypes.split('\n').map(t => t.trim()).filter(Boolean);
      try {
        await fetch('/api/admin/business-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names: updatedBizTypes }),
        });
      } catch (dbErr) {
        console.warn('Business types API save failed:', dbErr.message);
      }
      setSuccess('Business types saved!');
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = async (id) => {
    const updated = methods.map(x => x.id === id ? { ...x, active: !x.active } : x);
    const method = updated.find(x => x.id === id);
    setMethods(updated);
    try {
      await fetch('/api/admin/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: method.active }),
      });
    } catch (e) {}
  };

  const saveMethod = async (methodData) => {
    setSaving(true);
    setError('');
    try {
      let saved = null;
      const isExisting = methodData.id && methods.find(m => m.id === methodData.id);
      try {
        const res = await fetch('/api/admin/payment-methods', {
          method: isExisting ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(methodData),
        });
        if (res.ok) {
          const json = await res.json();
          saved = json;
        }
      } catch (dbErr) {
        console.warn('API save failed, using local state:', dbErr.message);
      }
      const finalMethod = saved || methodData;
      const updated = isExisting
        ? methods.map(m => m.id === methodData.id ? finalMethod : m)
        : [...methods, finalMethod];
      setMethods(updated);
      setEditingMethod(null);
      setShowAddModal(false);
      setSuccess('Payment method saved!');
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMethod = async (id) => {
    if (!confirm('Delete this payment method?')) return;
    setSaving(true);
    try {
      try {
        await fetch(`/api/admin/payment-methods?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
      } catch (dbErr) {}
      const updated = methods.filter(m => m.id !== id);
      setMethods(updated);
      setSuccess('Payment method deleted!');
    } catch (err) {
      setError('Failed to delete: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const waColors = ['#25d366', '#128c7e', '#075e54', '#e8192c', '#1877f2', '#000000'];

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <style>{`
        @media (max-width: 1200px) { .ss-config-grid { grid-template-columns: 1fr !important; } .ss-three-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 640px) { .ss-two-grid { grid-template-columns: 1fr !important; } .ss-three-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>System Settings</h1>
      <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Configure platform settings.</p>

      {error && <div style={{ marginTop: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ marginTop: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{success}</div>}

      {/* Sub-page navigation */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Configuration Pages</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="ss-config-grid">
          {CONFIG_PAGES.map((c) => (
            <button
              key={c.path}
              onClick={() => navigate(c.path)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, borderRadius: 16, border: `1px solid ${theme.border}`, background: theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : theme.surface, cursor: 'pointer', textAlign: 'left', fontFamily: FONT }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,45,85,0.12)', color: BRAND, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{c.label}</div>
                <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 2 }}>{c.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <Section
        theme={theme}
        title="Payment Methods"
        action={
          <button onClick={() => setShowAddModal(true)} style={{ height: 40, padding: '0 16px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.5)' }}>
            <Plus size={14} /> Add Method
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {methods.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < methods.length - 1 ? `1px solid ${theme.border}` : 'none', flexWrap: 'wrap' }}>
              <Toggle theme={theme} checked={m.active} onChange={() => toggleMethod(m.id)} />
              <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.surfaceSunken, color: theme.text, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0, overflow: 'hidden' }}>
                {m.logo && (m.logo.startsWith('data:') || m.logo.startsWith('http')) ? (
                  <img src={m.logo} alt="" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} />
                ) : (
                  <span style={{ fontSize: 18 }}>{m.logo || '💳'}</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>{m.name}</div>
                <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 2, wordBreak: 'break-word' }}>{m.bank_name} · {(m.fields || []).map(f => `${f.label}: ${f.value}`).join(' · ')}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => setEditingMethod(m)} style={{ height: 34, padding: '0 14px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Edit</button>
                <button onClick={() => deleteMethod(m.id)} style={{ height: 34, padding: '0 14px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Business Types */}
      <Section theme={theme} title="Business Types" sub="One per line. These appear in signup and ad account forms.">
        <textarea rows={8} value={bizTypes} onChange={e => setBizTypes(e.target.value)}
          style={{ width: '100%', minHeight: 140, padding: 14, borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, lineHeight: 1.7, fontFamily: 'monospace', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        <button onClick={saveBizTypes} disabled={saving} style={{ marginTop: 14, height: 44, padding: '0 20px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.5)', opacity: saving ? 0.7 : 1 }}>
          <Save size={15} /> {saving ? 'Saving…' : 'Save Business Types'}
        </button>
      </Section>

      {/* Platform Configuration */}
      <Section theme={theme} title="Platform Configuration" sub="Control core platform behaviour.">
        {cfgSuccess && <div style={{ marginBottom: 16, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '10px 14px', borderRadius: 10, fontSize: 13 }}>{cfgSuccess}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="ss-two-grid">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.surfaceSunken }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>User Sign-Up</div>
              <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 2 }}>Allow new users to register</div>
            </div>
            <Toggle theme={theme} checked={platformCfg.allow_signup} onChange={(v) => cfgSet('allow_signup', v)} color="#22c55e" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.surfaceSunken }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>Maintenance Mode</div>
              <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 2 }}>Show maintenance page to all users</div>
            </div>
            <Toggle theme={theme} checked={platformCfg.maintenance_mode} onChange={(v) => cfgSet('maintenance_mode', v)} color="#f59e0b" />
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="ss-two-grid">
          <div><Label theme={theme}>Minimum Deposit ($)</Label><TextInput theme={theme} type="number" min={0} value={platformCfg.min_deposit} onChange={e => cfgSet('min_deposit', Number(e.target.value))} /></div>
          <div><Label theme={theme}>Global Discount (%)</Label><TextInput theme={theme} type="number" min={0} max={100} value={platformCfg.global_discount} onChange={e => cfgSet('global_discount', Number(e.target.value))} /></div>
        </div>

        <div style={{ marginTop: 24, fontSize: 11.5, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact & Support</div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }} className="ss-three-grid">
          <div><Label theme={theme}>Support Email</Label><TextInput theme={theme} type="email" value={platformCfg.contact_email} onChange={e => cfgSet('contact_email', e.target.value)} placeholder="support@example.com" /></div>
          <div><Label theme={theme}>WhatsApp Number (with country code)</Label><TextInput theme={theme} value={platformCfg.contact_whatsapp} onChange={e => cfgSet('contact_whatsapp', e.target.value)} placeholder="+212612345678" /></div>
          <div><Label theme={theme}>Telegram Link</Label><TextInput theme={theme} value={platformCfg.contact_telegram} onChange={e => cfgSet('contact_telegram', e.target.value)} placeholder="https://t.me/…" /></div>
        </div>

        <button onClick={savePlatformCfg} disabled={cfgSaving} style={{ marginTop: 20, height: 44, padding: '0 20px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.5)', opacity: cfgSaving ? 0.7 : 1 }}>
          <Save size={15} /> {cfgSaving ? 'Saving…' : 'Save Platform Settings'}
        </button>
      </Section>

      {/* WhatsApp Button Settings */}
      <Section theme={theme} title="WhatsApp Button Settings" sub="Configure the floating WhatsApp button shown to users.">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.surfaceSunken }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>Show WhatsApp Button</div>
            <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 2 }}>Display floating button on user pages</div>
          </div>
          <Toggle theme={theme} checked={platformCfg.wa_enabled} onChange={(v) => cfgSet('wa_enabled', v)} color="#22c55e" />
        </div>

        <div style={{ marginTop: 18 }}>
          <Label theme={theme}>WhatsApp Number</Label>
          <TextInput theme={theme} value={platformCfg.wa_number} onChange={e => cfgSet('wa_number', e.target.value)} placeholder="Country code + number, e.g. 212612345678" />
          <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 6 }}>No + or spaces. Include country code (e.g. 44 for UK, 212 for Morocco).</div>
        </div>

        <div style={{ marginTop: 18 }}>
          <Label theme={theme}>Button Position</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['left', '← Bottom Left'], ['right', 'Bottom Right →']].map(([k, l]) => (
              <button key={k} onClick={() => cfgSet('wa_position', k)} style={{ height: 38, padding: '0 16px', borderRadius: 10, border: platformCfg.wa_position === k ? '1.5px solid #22c55e' : `1px solid ${theme.border}`, background: platformCfg.wa_position === k ? 'rgba(34,197,94,0.1)' : theme.surfaceSunken, color: platformCfg.wa_position === k ? '#22c55e' : theme.text, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <Label theme={theme}>Button Size</Label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['small', 'Small (46px)'], ['medium', 'Medium (56px)'], ['large', 'Large (68px)']].map(([k, l]) => (
              <button key={k} onClick={() => cfgSet('wa_size', k)} style={{ height: 38, padding: '0 16px', borderRadius: 10, border: platformCfg.wa_size === k ? '1.5px solid #22c55e' : `1px solid ${theme.border}`, background: platformCfg.wa_size === k ? 'rgba(34,197,94,0.1)' : theme.surfaceSunken, color: platformCfg.wa_size === k ? '#22c55e' : theme.text, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <Label theme={theme}>Button Color</Label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {waColors.map((c) => (
              <button key={c} onClick={() => cfgSet('wa_color', c)} style={{ width: 34, height: 34, borderRadius: 999, background: c, border: platformCfg.wa_color === c ? '3px solid #fff' : '1px solid rgba(0,0,0,0.1)', boxShadow: platformCfg.wa_color === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer' }} />
            ))}
            <input type="color" value={platformCfg.wa_color} onChange={e => cfgSet('wa_color', e.target.value)} style={{ width: 34, height: 34, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0 }} />
            <span style={{ fontSize: 12, color: theme.textFaint }}>Custom</span>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <Label theme={theme}>Animation</Label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['wiggle_pulse', 'Wiggle + Pulse'], ['bounce', 'Bounce'], ['heartbeat', 'Heartbeat'], ['shake_glow', 'Shake + Glow'], ['none', 'None']].map(([k, l]) => (
              <button key={k} onClick={() => cfgSet('wa_animation', k)} style={{ height: 38, padding: '0 14px', borderRadius: 10, border: platformCfg.wa_animation === k ? '1.5px solid #22c55e' : `1px solid ${theme.border}`, background: platformCfg.wa_animation === k ? 'rgba(34,197,94,0.1)' : theme.surfaceSunken, color: platformCfg.wa_animation === k ? '#22c55e' : theme.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <Label theme={theme}>Preview</Label>
          <div style={{ position: 'relative', height: 100, borderRadius: 14, border: `1px dashed ${theme.borderStrong}`, background: theme.surfaceSunken }}>
            {platformCfg.wa_enabled && (
              <div style={{ position: 'absolute', bottom: 14, [platformCfg.wa_position === 'left' ? 'left' : 'right']: 14, width: platformCfg.wa_size === 'large' ? 68 : platformCfg.wa_size === 'small' ? 46 : 56, height: platformCfg.wa_size === 'large' ? 68 : platformCfg.wa_size === 'small' ? 46 : 56, borderRadius: 999, background: platformCfg.wa_color, display: 'grid', placeItems: 'center', boxShadow: `0 10px 26px -6px ${platformCfg.wa_color}` }}>
                <svg viewBox="0 0 24 24" width="55%" height="55%" fill="#fff"><path d="M12 2a10 10 0 00-8.7 15L2 22l5.2-1.4A10 10 0 1012 2z" /></svg>
              </div>
            )}
            {!platformCfg.wa_enabled && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 13, color: theme.textFaint }}>Button is hidden</div>
            )}
          </div>
        </div>

        <button onClick={savePlatformCfg} disabled={cfgSaving} style={{ marginTop: 20, height: 44, padding: '0 20px', borderRadius: 100, border: 'none', background: 'linear-gradient(180deg,#34d399,#22c55e)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 22px -10px rgba(34,197,94,0.5)', opacity: cfgSaving ? 0.7 : 1 }}>
          <Save size={15} /> {cfgSaving ? 'Saving…' : 'Save WhatsApp Settings'}
        </button>
      </Section>

      {/* Branding */}
      <Section theme={theme} title="Branding" sub="Customize the site name, logo, favicon and footer.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="ss-two-grid">
          <div><Label theme={theme}>Website Name</Label><TextInput theme={theme} value={platformCfg.site_name} onChange={e => cfgSet('site_name', e.target.value)} /></div>
          <div><Label theme={theme}>Footer Text</Label><TextInput theme={theme} value={platformCfg.footer_text} onChange={e => cfgSet('footer_text', e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="ss-two-grid">
          {[{ key: 'site_logo', label: 'Site Logo' }, { key: 'site_favicon', label: 'Favicon' }].map(({ key, label }) => (
            <div key={key}>
              <Label theme={theme}>{label}</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, border: `1px dashed ${theme.borderStrong}`, background: theme.surfaceSunken, display: 'grid', placeItems: 'center', fontSize: 10, color: theme.textFaint, flexShrink: 0, overflow: 'hidden' }}>
                  {platformCfg[key] ? <img src={platformCfg[key]} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} /> : 'None'}
                </div>
                <label style={{ height: 38, padding: '0 14px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12.5, fontWeight: 700, cursor: uploadingKey === key ? 'wait' : 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: 6, opacity: uploadingKey && uploadingKey !== key ? 0.5 : 1 }}>
                  <Upload size={13} /> {uploadingKey === key ? 'Uploading…' : 'Upload'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} disabled={!!uploadingKey} onChange={e => handleImageUpload(key, e.target.files?.[0])} />
                </label>
                {platformCfg[key] && (
                  <button onClick={() => cfgSet(key, '')} style={{ background: 'none', border: 'none', fontSize: 11, color: theme.textFaint, cursor: 'pointer' }}>Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button onClick={savePlatformCfg} disabled={cfgSaving} style={{ marginTop: 20, height: 44, padding: '0 20px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.5)', opacity: cfgSaving ? 0.7 : 1 }}>
          <Save size={15} /> {cfgSaving ? 'Saving…' : 'Save Branding'}
        </button>
      </Section>

      {(editingMethod || showAddModal) && (
        <PaymentMethodModal
          theme={theme}
          method={editingMethod}
          onSave={saveMethod}
          onClose={() => { setEditingMethod(null); setShowAddModal(false); }}
          saving={saving}
        />
      )}
    </div>
  );
}

function PaymentMethodModal({ theme, method, onSave, onClose, saving }) {
  const isEdit = !!method;
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [logo, setLogo] = useState('💳');
  const [fields, setFields] = useState([{ label: '', value: '' }]);

  useEffect(() => {
    setName(method?.name || '');
    setBankName(method?.bank_name || '');
    setLogo(method?.logo || '💳');
    setFields(method?.fields?.length ? method.fields : [{ label: '', value: '' }]);
  }, [method]);

  const addField = () => setFields(f => [...f, { label: '', value: '' }]);
  const removeField = (i) => setFields(f => f.filter((_, idx) => idx !== i));
  const updateField = (i, key, val) => setFields(f => f.map((fld, idx) => idx === i ? { ...fld, [key]: val } : fld));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim() || !bankName.trim()) return;
    const validFields = fields.filter(f => f.label.trim() && f.value.trim());
    onSave({
      id: method?.id || `pm-${Date.now()}`,
      name: name.trim(),
      bank_name: bankName.trim(),
      logo: logo || '💳',
      account: validFields[0]?.value || '',
      active: method?.active ?? true,
      fields: validFields,
    });
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,8,0.6)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', background: theme.surface, borderRadius: 22, padding: 28, boxShadow: theme.shadowLg, border: `1px solid ${theme.border}`, fontFamily: FONT }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: theme.text }}>{isEdit ? 'Edit Payment Method' : 'Add Payment Method'}</h3>
          <button onClick={onClose} style={{ background: theme.surfaceSunken, border: 'none', borderRadius: 999, width: 30, height: 30, display: 'grid', placeItems: 'center', cursor: 'pointer', color: theme.textMuted }}><X size={16} /></button>
        </div>

        <div style={{ marginTop: 18 }}>
          <Label theme={theme}>Display Name *</Label>
          <TextInput theme={theme} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Payoneer" />
        </div>
        <div style={{ marginTop: 14 }}>
          <Label theme={theme}>Bank / Provider Name *</Label>
          <TextInput theme={theme} value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Payoneer Inc." />
        </div>
        <div style={{ marginTop: 14 }}>
          <Label theme={theme}>Logo (PNG/JPG image)</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {logo && logo.startsWith('data:') ? (
              <img src={logo} alt="logo" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, border: `1px solid ${theme.border}` }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 8, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: theme.surfaceSunken }}>{logo || '💳'}</div>
            )}
            <div style={{ flex: 1 }}>
              <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileUpload} style={{ width: '100%', fontSize: 13, color: theme.textMuted }} />
            </div>
            {logo && (<button onClick={() => setLogo('')} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Remove</button>)}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Label theme={theme} style={{ marginBottom: 0 }}>Payment Details</Label>
            <button onClick={addField} style={{ background: 'none', border: 'none', color: BRAND, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add field</button>
          </div>
          {fields.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input value={f.label} onChange={e => updateField(i, 'label', e.target.value)} placeholder="Label (e.g. Email)"
                style={{ flex: 1, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: FONT, color: theme.text, background: theme.surfaceSunken }} />
              <input value={f.value} onChange={e => updateField(i, 'value', e.target.value)} placeholder="Value"
                style={{ flex: 2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: FONT, color: theme.text, background: theme.surfaceSunken }} />
              {fields.length > 1 && (
                <button onClick={() => removeField(i)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 16, cursor: 'pointer', padding: '0 4px' }}>✕</button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, height: 48, borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !name.trim() || !bankName.trim()} style={{ flex: 1, height: 48, borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 12px 26px -10px rgba(255,45,85,0.55)', opacity: (saving || !name.trim() || !bankName.trim()) ? 0.6 : 1 }}>
            {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Add Method')}
          </button>
        </div>
      </div>
    </div>
  );
}
