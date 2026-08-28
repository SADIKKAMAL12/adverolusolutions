import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '../shared/Router.jsx';
import { useTheme } from '../shared/ThemeContext.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import { ChevronLeft } from 'lucide-react';

const api = (path, opts) => fetch(path, opts).then(r => r.json());

const DEFAULTS = {
  enabled: false,
  recipient_number: '',
  notify_orders: true,
  notify_agency: true,
  notify_deposits: true,
  notify_tickets: false,
  notify_verification: true,
  message_template_order:
    '🛒 *New Order*\nTicket: {{ticket_id}}\nEmail: {{email}}\nType: {{account_type}}\nAmount: {{amount}}\nPayment: {{payment_method}}',
  message_template_agency:
    '🏢 *New Agency Account Request*\nRequest: {{ticket_id}}\nEmail: {{email}}\nPlatform: {{account_type}}\nBusiness: {{name}}',
  message_template_deposit:
    '💰 *New Deposit / Top-Up*\nEmail: {{email}}\nAmount: {{amount}}\nMethod: {{payment_method}}\nStatus: Pending Review',
  message_template_ticket:
    '🎫 *New Support Ticket*\nFrom: {{email}}\nSubject: {{subject}}',
  message_template_verification:
    '🔎 *Verification Request Submitted*\nRequest: {{ticket_id}}\nPlatform: {{account_type}}\nName: {{name}}\nEmail: {{email}}',
};

const EVENT_TYPES = [
  { key: 'notify_orders', templateKey: 'message_template_order', label: 'Pre-Verified Account Orders', desc: 'Sent when a user buys a pre-verified account' },
  { key: 'notify_agency', templateKey: 'message_template_agency', label: 'Agency Ad Account Requests', desc: 'Sent when a user submits a new ad account request' },
  { key: 'notify_deposits', templateKey: 'message_template_deposit', label: 'Deposits / Top-Ups', desc: 'Sent when a user submits a deposit or top-up' },
  { key: 'notify_tickets', templateKey: 'message_template_ticket', label: 'Support Tickets', desc: 'Sent when a user opens a new support ticket' },
  { key: 'notify_verification', templateKey: 'message_template_verification', label: 'Account Verification Requests', desc: 'Sent when a customer submits an account verification request' },
];

function ToggleSwitch({ theme, checked, onChange, color = '#22c55e' }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ width: 46, height: 26, borderRadius: 100, border: 'none', background: checked ? `linear-gradient(90deg,#34d399,${color})` : theme.surfaceSunken, position: 'relative', cursor: 'pointer', flexShrink: 0, boxShadow: checked ? `0 0 12px -2px ${color}` : 'none' }}>
      <span style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 22, height: 22, borderRadius: 999, background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

function TextInput({ theme, ...rest }) {
  return <input {...rest} style={{ width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }} />;
}

export default function AdminOrderNotificationsPage() {
  const navigate = useNavigate();
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');

  const [cfg, setCfg] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openTemplate, setOpenTemplate] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api('/api/admin/order-notifications');
      setCfg(prev => ({ ...prev, ...data }));
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveAll = async () => {
    setSaving(true);
    await api('/api/admin/order-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleEnabled = async (next) => {
    const updated = { ...cfg, enabled: next };
    setCfg(updated);
    await api('/api/admin/order-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: next }),
    });
  };

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Order Notifications</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Configure WhatsApp alerts sent to your team for new orders, requests, deposits, and tickets.</p>
        </div>
        <button onClick={() => navigate('/admin/settings')} style={{ height: 44, padding: '0 18px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 }}><ChevronLeft size={15} /> Back to System Settings</button>
      </div>

      <GlassCard theme={theme} glow style={{ marginTop: 24, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: cfg.enabled ? '#22c55e' : '#ef4444' }}>Order Notifications are {cfg.enabled ? 'Enabled' : 'Disabled'}</div>
          <div style={{ fontSize: 12.5, color: theme.textMuted, marginTop: 4 }}>{cfg.enabled ? 'WhatsApp alerts will be sent to the number below for the events checked below' : 'No WhatsApp alerts will be sent for any event'}</div>
        </div>
        <ToggleSwitch theme={theme} checked={cfg.enabled} onChange={toggleEnabled} />
      </GlassCard>

      <GlassCard theme={theme} style={{ marginTop: 20, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Recipient</div>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: theme.textMuted }}>The WhatsApp number that receives these alerts (digits only, with country code)</p>
        <div style={{ marginTop: 16, maxWidth: 340 }}>
          <TextInput theme={theme} value={cfg.recipient_number} onChange={e => setCfg(prev => ({ ...prev, recipient_number: e.target.value }))} placeholder="e.g. 15551234567" />
        </div>
      </GlassCard>

      <GlassCard theme={theme} style={{ marginTop: 20, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Events</div>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: theme.textMuted }}>Choose which events trigger an alert, and customize each message</p>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' }}>
          {EVENT_TYPES.map(({ key, templateKey, label, desc }, i) => {
            const isOpen = openTemplate === key;
            return (
              <div key={key} style={{ padding: '16px 0', borderBottom: i < EVENT_TYPES.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{label}</div>
                    <div style={{ fontSize: 12, color: theme.textFaint, marginTop: 3 }}>{desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                    <button onClick={() => setOpenTemplate(isOpen ? null : key)} style={{ background: 'none', border: 'none', color: BRAND, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>{isOpen ? 'Hide template' : 'Edit template'}</button>
                    <ToggleSwitch theme={theme} checked={!!cfg[key]} onChange={(v) => setCfg(prev => ({ ...prev, [key]: v }))} />
                  </div>
                </div>
                {isOpen && (
                  <textarea
                    value={cfg[templateKey] || ''}
                    onChange={(e) => setCfg(prev => ({ ...prev, [templateKey]: e.target.value }))}
                    rows={5}
                    style={{ width: '100%', marginTop: 12, padding: '10px 12px', border: `1px solid ${theme.border}`, borderRadius: 10, background: theme.surfaceSunken, color: theme.text, fontSize: 12.5, fontFamily: 'ui-monospace, monospace', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      <button onClick={saveAll} disabled={saving || saved} style={{ marginTop: 20, width: '100%', height: 52, borderRadius: 16, border: 'none', background: saved ? 'linear-gradient(180deg,#34d399,#22c55e)' : `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: FONT, boxShadow: '0 16px 34px -14px rgba(255,45,85,0.55)', opacity: saving ? 0.7 : 1 }}>
        {saved ? '✓ Settings saved' : saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  );
}
