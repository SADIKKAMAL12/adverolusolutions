import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from '../shared/Router.jsx';
import { useTheme } from '../shared/ThemeContext.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import { ChevronLeft, Smartphone, Plus, X } from 'lucide-react';

const api = (path, opts) => fetch(path, opts).then(r => r.json());

function ToggleSwitch({ theme, checked, onChange, color = '#22c55e', disabled }) {
  return (
    <button onClick={() => !disabled && onChange(!checked)} disabled={disabled} style={{ width: 46, height: 26, borderRadius: 100, border: 'none', background: checked ? `linear-gradient(90deg,#34d399,${color})` : theme.surfaceSunken, position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0, boxShadow: checked ? `0 0 12px -2px ${color}` : 'none', opacity: disabled ? 0.5 : 1 }}>
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

/* ── QR Modal ── */
function AddDeviceModal({ theme, onClose, onConnected }) {
  const [sessionId, setSessionId] = useState(null);
  const [qrState, setQrState] = useState({ status: 'initializing' });
  const pollRef = useRef(null);

  const createSession = useCallback(async () => {
    try {
      const data = await api('/api/whatsapp?type=devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (data.id) setSessionId(data.id);
      else setQrState({ status: 'error', error: data.error || 'Failed to create session' });
    } catch {
      setQrState({ status: 'error', error: 'Cannot reach WhatsApp bridge' });
    }
  }, []);

  useEffect(() => { createSession(); }, [createSession]);

  useEffect(() => {
    if (!sessionId) return;
    const poll = async () => {
      try {
        const data = await api(`/api/whatsapp?type=qr&id=${sessionId}`);
        setQrState(data);
        if (data.status === 'connected') {
          clearInterval(pollRef.current);
          setTimeout(() => onConnected(), 1000);
        }
      } catch {
        setQrState({ status: 'error', error: 'Cannot reach WhatsApp bridge' });
      }
    };
    poll();
    pollRef.current = setInterval(poll, 4000);
    return () => clearInterval(pollRef.current);
  }, [sessionId, onConnected]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,8,0.6)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 380, background: theme.surface, borderRadius: 22, padding: 28, boxShadow: theme.shadowLg, border: `1px solid ${theme.border}`, fontFamily: FONT }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: theme.text }}>Link WhatsApp Device</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12.5, color: theme.textMuted }}>Scan the QR code with WhatsApp</p>
          </div>
          <button onClick={onClose} style={{ background: theme.surfaceSunken, border: 'none', borderRadius: 999, width: 30, height: 30, display: 'grid', placeItems: 'center', cursor: 'pointer', color: theme.textMuted }}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {qrState.status === 'initializing' && (
            <>
              <div style={{ width: 200, height: 200, borderRadius: 14, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${theme.border}`, borderTopColor: BRAND, animation: 'adver-spin .8s linear infinite' }} />
              </div>
              <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>Generating QR code…</p>
            </>
          )}
          {qrState.status === 'qr' && (
            <>
              <img src={qrState.qr} alt="Scan with WhatsApp" style={{ width: 200, height: 200, borderRadius: 12, border: `1px solid ${theme.border}`, display: 'block' }} />
              <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                Open WhatsApp → <strong style={{ color: theme.text }}>Settings → Linked Devices → Link a Device</strong> and scan this code
              </p>
            </>
          )}
          {qrState.status === 'connected' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✓</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#22c55e', margin: 0 }}>Connected! Adding device…</p>
            </>
          )}
          {qrState.status === 'error' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✕</div>
              <p style={{ fontSize: 13, color: '#ef4444', margin: 0, textAlign: 'center' }}>{qrState.error}</p>
              <button onClick={createSession} style={{ height: 38, padding: '0 16px', borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Try again</button>
            </>
          )}
        </div>

        <button onClick={onClose} style={{ marginTop: 24, width: '100%', height: 44, borderRadius: 10, border: `1px solid ${theme.border}`, background: 'transparent', fontSize: 13.5, fontWeight: 600, fontFamily: FONT, color: theme.textMuted, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

/* ── Device card ── */
function DeviceCard({ theme, device, onSetActive, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const [activating, setActivating] = useState(false);

  const handleRemove = async () => {
    if (!confirm('Remove this WhatsApp device?')) return;
    setRemoving(true);
    await onRemove(device.id);
    setRemoving(false);
  };
  const handleSetActive = async () => {
    setActivating(true);
    await onSetActive(device.id);
    setActivating(false);
  };

  const isConnected = device.status === 'connected';
  const statusMeta = {
    connected: { color: '#22c55e', bg: 'rgba(34,197,94,0.14)', label: 'Connected' },
    initializing: { color: '#f59e0b', bg: 'rgba(245,158,11,0.14)', label: 'Connecting…' },
    qr: { color: '#3b82f6', bg: 'rgba(59,130,246,0.14)', label: 'Awaiting scan' },
    logged_out: { color: '#ef4444', bg: 'rgba(239,68,68,0.14)', label: 'Logged out' },
    error: { color: '#ef4444', bg: 'rgba(239,68,68,0.14)', label: 'Error' },
  };
  const s = statusMeta[device.status] || { color: theme.textFaint, bg: theme.surfaceSunken, label: device.status };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, border: `1px solid ${device.isActive ? 'rgba(34,197,94,0.3)' : theme.border}`, background: device.isActive ? 'rgba(34,197,94,0.05)' : theme.surfaceSunken }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: isConnected ? 'rgba(34,197,94,0.15)' : theme.surface, color: isConnected ? '#22c55e' : theme.textMuted, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Smartphone size={18} /></div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{device.phone ? `+${device.phone}` : 'Connecting…'}</span>
          {device.isActive && <span style={{ fontSize: 10.5, fontWeight: 800, color: '#22c55e', background: 'rgba(34,197,94,0.15)', padding: '3px 9px', borderRadius: 100, letterSpacing: '0.04em' }}>ACTIVE</span>}
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: s.color, marginTop: 6 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: s.color }} />{s.label}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {!device.isActive && isConnected && (
          <button onClick={handleSetActive} disabled={activating} style={{ height: 38, padding: '0 16px', borderRadius: 10, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: activating ? 'not-allowed' : 'pointer', fontFamily: FONT, opacity: activating ? 0.6 : 1 }}>{activating ? '…' : 'Set Active'}</button>
        )}
        <button onClick={handleRemove} disabled={removing} style={{ height: 38, padding: '0 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 12.5, fontWeight: 700, cursor: removing ? 'not-allowed' : 'pointer', fontFamily: FONT, opacity: removing ? 0.6 : 1 }}>{removing ? '…' : 'Remove'}</button>
      </div>
    </div>
  );
}

export default function AdminWhatsAppPage() {
  const navigate = useNavigate();
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');

  const [devices, setDevices] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [config, setConfig] = useState({
    otp_enabled: true,
    otp_expiry: 10,
    otp_max_attempts: 3,
    otp_cooldown: 60,
    allow_skip: false,
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const pollRef = useRef(null);

  const loadDevices = useCallback(async () => {
    try {
      const data = await api('/api/whatsapp?type=devices');
      if (Array.isArray(data.devices)) setDevices(data.devices);
    } catch { /* bridge may not be running */ }
    setLoadingDevices(false);
  }, []);

  const loadConfig = useCallback(async () => {
    try {
      const data = await api('/api/whatsapp?type=config');
      setConfig({
        otp_enabled: data.otp_enabled ?? true,
        otp_expiry: data.otp_expiry ?? 10,
        otp_max_attempts: data.otp_max_attempts ?? 3,
        otp_cooldown: data.otp_cooldown ?? 60,
        allow_skip: data.allow_skip ?? false,
      });
    } catch {}
  }, []);

  useEffect(() => {
    loadDevices();
    loadConfig();
    pollRef.current = setInterval(loadDevices, 5000);
    return () => clearInterval(pollRef.current);
  }, [loadDevices, loadConfig]);

  const handleSetActive = async (id) => {
    await api(`/api/whatsapp?type=active&id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    await loadDevices();
  };
  const handleRemove = async (id) => {
    await api(`/api/whatsapp?type=devices&id=${id}`, { method: 'DELETE' });
    await loadDevices();
  };
  const handleDeviceConnected = async () => {
    setShowAddModal(false);
    await loadDevices();
  };
  const saveConfig = async () => {
    setConfigSaving(true);
    await api('/api/whatsapp?type=config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    setConfigSaving(false);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };
  const toggleOtp = async (val) => {
    const next = { ...config, otp_enabled: val };
    setConfig(next);
    await api('/api/whatsapp?type=config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
  };

  const connectedCount = devices.filter(d => d.status === 'connected').length;

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <style>{`@media (max-width: 640px) { .wo-grid { grid-template-columns: 1fr !important; } }`}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>WhatsApp OTP</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Connect WhatsApp devices to send verification codes to users during registration.</p>
        </div>
        <button onClick={() => navigate('/admin/settings')} style={{ height: 44, padding: '0 18px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 }}><ChevronLeft size={15} /> Back to System Settings</button>
      </div>

      <GlassCard theme={theme} glow style={{ marginTop: 24, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: config.otp_enabled ? '#22c55e' : '#ef4444' }}>WhatsApp OTP is {config.otp_enabled ? 'Enabled' : 'Disabled'}</div>
          <div style={{ fontSize: 12.5, color: theme.textMuted, marginTop: 4 }}>{config.otp_enabled ? 'Users must verify their WhatsApp number when registering' : 'Users can register without WhatsApp verification'}</div>
        </div>
        <ToggleSwitch theme={theme} checked={config.otp_enabled} onChange={toggleOtp} />
      </GlassCard>

      <GlassCard theme={theme} style={{ marginTop: 20, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Connected Devices</div>
            <div style={{ fontSize: 12.5, color: theme.textMuted, marginTop: 2 }}>{connectedCount} of {devices.length} device{devices.length !== 1 ? 's' : ''} connected</div>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ height: 42, padding: '0 18px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.5)' }}><Plus size={14} /> Add Device</button>
        </div>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loadingDevices ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '36px 0' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${theme.border}`, borderTopColor: BRAND, animation: 'adver-spin .8s linear infinite' }} />
            </div>
          ) : devices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📵</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 4 }}>No devices connected</div>
              <div style={{ fontSize: 12.5, color: theme.textMuted }}>Click "Add Device" to link a WhatsApp number</div>
            </div>
          ) : (
            devices.map(d => <DeviceCard key={d.id} theme={theme} device={d} onSetActive={handleSetActive} onRemove={handleRemove} />)
          )}
        </div>
      </GlassCard>

      <GlassCard theme={theme} style={{ marginTop: 20, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>OTP Settings</div>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: theme.textMuted }}>Configure code behaviour and verification flow</p>

        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.surfaceSunken }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>Allow users to skip verification</div>
            <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 2 }}>Users can register without providing a WhatsApp number</div>
          </div>
          <ToggleSwitch theme={theme} checked={config.allow_skip} onChange={(v) => setConfig(c => ({ ...c, allow_skip: v }))} color={BRAND} />
        </div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }} className="wo-grid">
          <div><Label theme={theme}>Code Expiry</Label><TextInput theme={theme} type="number" min={1} max={60} value={config.otp_expiry} onChange={e => setConfig(c => ({ ...c, otp_expiry: Number(e.target.value) }))} suffix="minutes" /></div>
          <div><Label theme={theme}>Max Attempts</Label><TextInput theme={theme} type="number" min={1} max={10} value={config.otp_max_attempts} onChange={e => setConfig(c => ({ ...c, otp_max_attempts: Number(e.target.value) }))} suffix="tries" /></div>
          <div><Label theme={theme}>Cooldown</Label><TextInput theme={theme} type="number" min={10} max={3600} value={config.otp_cooldown} onChange={e => setConfig(c => ({ ...c, otp_cooldown: Number(e.target.value) }))} suffix="seconds" /></div>
        </div>

        <button onClick={saveConfig} disabled={configSaving || configSaved} style={{ marginTop: 22, width: '100%', height: 50, borderRadius: 14, border: 'none', background: configSaved ? 'linear-gradient(180deg,#34d399,#22c55e)' : `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: configSaving ? 'not-allowed' : 'pointer', fontFamily: FONT, boxShadow: '0 14px 30px -12px rgba(255,45,85,0.55)', opacity: configSaving ? 0.7 : 1 }}>
          {configSaved ? '✓ Settings saved' : configSaving ? 'Saving…' : 'Save Settings'}
        </button>
      </GlassCard>

      {showAddModal && <AddDeviceModal theme={theme} onClose={() => setShowAddModal(false)} onConnected={handleDeviceConnected} />}
    </div>
  );
}
