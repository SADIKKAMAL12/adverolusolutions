import { useState, useEffect, useRef, useCallback } from 'react'
import { PageShell, Card, Btn } from '../shared/UI.jsx'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors, C } from '../shared/theme.js'

const F = "'Plus Jakarta Sans','Inter',sans-serif"
const api = (path, opts) => fetch(path, opts).then(r => r.json())

/* ── Toggle switch ─────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, disabled }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        width: 44,
        height: 24,
        borderRadius: 12,
        background: checked ? C.green : (isDark ? '#3d3d5c' : '#d1d5db'),
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background .2s',
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3,
        left: checked ? 23 : 3,
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        transition: 'left .2s',
      }} />
    </button>
  )
}

/* ── Status badge ──────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const configs = {
    connected:    { bg: '#d1fae5', color: '#065f46', label: 'Connected' },
    initializing: { bg: '#fef3c7', color: '#92400e', label: 'Connecting…' },
    qr:           { bg: '#dbeafe', color: '#1e40af', label: 'Awaiting scan' },
    logged_out:   { bg: '#fee2e2', color: '#991b1b', label: 'Logged out' },
    error:        { bg: '#fee2e2', color: '#991b1b', label: 'Error' },
  }
  const cfg = configs[status] || { bg: '#f3f4f6', color: '#374151', label: status }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11.5, fontWeight: 600, fontFamily: F,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.color, flexShrink: 0,
        animation: status === 'connected' ? 'adver-pulse 2s infinite' : 'none',
      }} />
      {cfg.label}
    </span>
  )
}

/* ── QR Modal ──────────────────────────────────────────────────────────────── */
function AddDeviceModal({ onClose, onConnected }) {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const isDark = theme === 'dark'
  const [sessionId, setSessionId] = useState(null)
  const [qrState, setQrState] = useState({ status: 'initializing' })
  const pollRef = useRef(null)

  const createSession = useCallback(async () => {
    try {
      const data = await api('/api/whatsapp?type=devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      if (data.id) setSessionId(data.id)
      else setQrState({ status: 'error', error: data.error || 'Failed to create session' })
    } catch {
      setQrState({ status: 'error', error: 'Cannot reach WhatsApp bridge' })
    }
  }, [])

  useEffect(() => { createSession() }, [createSession])

  useEffect(() => {
    if (!sessionId) return
    const poll = async () => {
      try {
        const data = await api(`/api/whatsapp?type=qr&id=${sessionId}`)
        setQrState(data)
        if (data.status === 'connected') {
          clearInterval(pollRef.current)
          setTimeout(() => onConnected(), 1000)
        }
      } catch {
        setQrState({ status: 'error', error: 'Cannot reach WhatsApp bridge' })
      }
    }
    poll()
    pollRef.current = setInterval(poll, 4000)
    return () => clearInterval(pollRef.current)
  }, [sessionId, onConnected])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: TC.card,
          borderRadius: 18,
          boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          border: `1px solid ${TC.g200}`,
          width: '100%', maxWidth: 380,
          padding: 28, fontFamily: F,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TC.text }}>Link WhatsApp Device</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12.5, color: TC.textSecondary }}>Scan the QR code with WhatsApp</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: `1px solid ${TC.g200}`,
              background: TC.g100, cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: TC.g500,
            }}
          >×</button>
        </div>

        {/* QR area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {qrState.status === 'initializing' && (
            <>
              <div style={{
                width: 200, height: 200, borderRadius: 14,
                background: TC.g100, border: `1px solid ${TC.g200}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: `3px solid ${TC.g300}`,
                  borderTopColor: C.primary,
                  animation: 'adver-spin .8s linear infinite',
                }} />
              </div>
              <p style={{ fontSize: 13, color: TC.textSecondary, margin: 0 }}>Generating QR code…</p>
            </>
          )}

          {qrState.status === 'qr' && (
            <>
              <img
                src={qrState.qr}
                alt="Scan with WhatsApp"
                style={{ width: 200, height: 200, borderRadius: 12, border: `1px solid ${TC.g200}`, display: 'block' }}
              />
              <p style={{ fontSize: 12.5, color: TC.textSecondary, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                Open WhatsApp → <strong style={{ color: TC.text }}>Settings → Linked Devices → Link a Device</strong> and scan this code
              </p>
            </>
          )}

          {qrState.status === 'connected' && (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#d1fae5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
              }}>✓</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.green, margin: 0 }}>Connected! Adding device…</p>
            </>
          )}

          {qrState.status === 'error' && (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
              }}>✕</div>
              <p style={{ fontSize: 13, color: C.red, margin: 0, textAlign: 'center' }}>{qrState.error}</p>
              <Btn variant="outline" size="sm" onClick={createSession}>Try again</Btn>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 24, width: '100%',
            padding: '10px 0', borderRadius: 10,
            border: `1px solid ${TC.g200}`,
            background: 'transparent',
            fontSize: 13.5, fontWeight: 500, fontFamily: F,
            color: TC.g500, cursor: 'pointer',
          }}
        >Cancel</button>
      </div>
    </div>
  )
}

/* ── Device card ───────────────────────────────────────────────────────────── */
function DeviceCard({ device, onSetActive, onRemove, TC }) {
  const [removing, setRemoving] = useState(false)
  const [activating, setActivating] = useState(false)

  const handleRemove = async () => {
    if (!confirm('Remove this WhatsApp device?')) return
    setRemoving(true)
    await onRemove(device.id)
    setRemoving(false)
  }

  const handleSetActive = async () => {
    setActivating(true)
    await onSetActive(device.id)
    setActivating(false)
  }

  const isConnected = device.status === 'connected'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', borderRadius: 12,
      border: `2px solid ${device.isActive ? C.green + '60' : TC.g200}`,
      background: device.isActive ? (TC.g50) : TC.card,
      transition: 'border-color .2s, background .2s',
    }}>
      {/* Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        background: isConnected ? '#d1fae5' : TC.g100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>
        📱
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: TC.text, fontFamily: F }}>
            {device.phone ? `+${device.phone}` : 'Connecting…'}
          </span>
          {device.isActive && (
            <span style={{
              fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: '#d1fae5', color: '#065f46', fontFamily: F, letterSpacing: '.03em',
            }}>ACTIVE</span>
          )}
        </div>
        <StatusBadge status={device.status} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {!device.isActive && isConnected && (
          <button
            onClick={handleSetActive}
            disabled={activating}
            style={{
              padding: '6px 12px', borderRadius: 8,
              background: C.primary, color: '#fff',
              border: 'none', cursor: activating ? 'not-allowed' : 'pointer',
              fontSize: 12.5, fontWeight: 600, fontFamily: F,
              opacity: activating ? 0.6 : 1, transition: 'opacity .15s',
            }}
          >
            {activating ? '…' : 'Set Active'}
          </button>
        )}
        <button
          onClick={handleRemove}
          disabled={removing}
          style={{
            padding: '6px 12px', borderRadius: 8,
            background: 'transparent',
            border: `1px solid ${C.red}40`,
            color: C.red, cursor: removing ? 'not-allowed' : 'pointer',
            fontSize: 12.5, fontWeight: 600, fontFamily: F,
            opacity: removing ? 0.6 : 1, transition: 'opacity .15s',
          }}
        >
          {removing ? '…' : 'Remove'}
        </button>
      </div>
    </div>
  )
}

/* ── Config row helper ─────────────────────────────────────────────────────── */
function ConfigRow({ label, hint, children, TC }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: TC.text, fontFamily: F }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: TC.textSecondary, marginTop: 2, fontFamily: F }}>{hint}</div>}
      </div>
      {children}
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function AdminWhatsAppPage() {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')

  const [devices, setDevices] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [config, setConfig] = useState({
    otp_enabled: true,
    otp_expiry: 10,
    otp_max_attempts: 3,
    otp_cooldown: 60,
    allow_skip: false,
  })
  const [configSaving, setConfigSaving] = useState(false)
  const [configSaved, setConfigSaved] = useState(false)
  const [loadingDevices, setLoadingDevices] = useState(true)
  const pollRef = useRef(null)

  const loadDevices = useCallback(async () => {
    try {
      const data = await api('/api/whatsapp?type=devices')
      if (Array.isArray(data.devices)) setDevices(data.devices)
    } catch { /* bridge may not be running */ }
    setLoadingDevices(false)
  }, [])

  const loadConfig = useCallback(async () => {
    try {
      const data = await api('/api/whatsapp?type=config')
      setConfig({
        otp_enabled:      data.otp_enabled      ?? true,
        otp_expiry:       data.otp_expiry        ?? 10,
        otp_max_attempts: data.otp_max_attempts  ?? 3,
        otp_cooldown:     data.otp_cooldown      ?? 60,
        allow_skip:       data.allow_skip        ?? false,
      })
    } catch {}
  }, [])

  useEffect(() => {
    loadDevices()
    loadConfig()
    pollRef.current = setInterval(loadDevices, 5000)
    return () => clearInterval(pollRef.current)
  }, [loadDevices, loadConfig])

  const handleSetActive = async (id) => {
    await api(`/api/whatsapp?type=active&id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    await loadDevices()
  }

  const handleRemove = async (id) => {
    await api(`/api/whatsapp?type=devices&id=${id}`, { method: 'DELETE' })
    await loadDevices()
  }

  const handleDeviceConnected = async () => {
    setShowAddModal(false)
    await loadDevices()
  }

  const saveConfig = async () => {
    setConfigSaving(true)
    await api('/api/whatsapp?type=config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    setConfigSaving(false)
    setConfigSaved(true)
    setTimeout(() => setConfigSaved(false), 2000)
  }

  const toggleOtp = async (val) => {
    const next = { ...config, otp_enabled: val }
    setConfig(next)
    await api('/api/whatsapp?type=config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
  }

  const connectedCount = devices.filter(d => d.status === 'connected').length

  const numInput = (field, min, max) => ({
    type: 'number', min, max,
    value: config[field],
    onChange: e => setConfig(c => ({ ...c, [field]: Number(e.target.value) })),
    style: {
      width: 80, padding: '7px 10px',
      border: `1px solid ${TC.g200}`, borderRadius: 8,
      background: TC.g50, color: TC.text,
      fontSize: 13.5, fontFamily: F, fontWeight: 600,
      textAlign: 'center',
      outline: 'none',
    },
  })

  return (
    <PageShell
      title="WhatsApp OTP"
      subtitle="Connect WhatsApp devices to send verification codes to users during registration."
      breadcrumb="Admin / WhatsApp OTP"
    >

      {/* Enable / disable banner */}
      <div style={{
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        border: `2px solid ${config.otp_enabled ? C.green + '50' : C.red + '40'}`,
        background: config.otp_enabled
          ? (theme === 'dark' ? 'rgba(16,185,129,.08)' : '#f0fdf4')
          : (theme === 'dark' ? 'rgba(239,68,68,.08)' : '#fff5f5'),
      }}>
        <div>
          <div style={{
            fontSize: 14.5, fontWeight: 700, fontFamily: F,
            color: config.otp_enabled ? C.green : C.red,
            marginBottom: 2,
          }}>
            WhatsApp OTP is {config.otp_enabled ? 'Enabled' : 'Disabled'}
          </div>
          <div style={{ fontSize: 12.5, color: TC.textSecondary, fontFamily: F }}>
            {config.otp_enabled
              ? 'Users must verify their WhatsApp number when registering'
              : 'Users can register without WhatsApp verification'}
          </div>
        </div>
        <Toggle checked={config.otp_enabled} onChange={toggleOtp} />
      </div>

      {/* Connected Devices card */}
      <Card style={{ marginBottom: 18, padding: 0, overflow: 'hidden' }}>
        {/* Card header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: `1px solid ${TC.g100}`,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: TC.text, fontFamily: F }}>Connected Devices</div>
            <div style={{ fontSize: 12, color: TC.textSecondary, marginTop: 2, fontFamily: F }}>
              {connectedCount} of {devices.length} device{devices.length !== 1 ? 's' : ''} connected
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 9,
              background: C.primary, color: '#fff',
              border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: F,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Device
          </button>
        </div>

        {/* Device list */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loadingDevices ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '36px 0' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                border: `3px solid ${TC.g200}`,
                borderTopColor: C.primary,
                animation: 'adver-spin .8s linear infinite',
              }} />
            </div>
          ) : devices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', fontFamily: F }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📵</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TC.text, marginBottom: 4 }}>No devices connected</div>
              <div style={{ fontSize: 12.5, color: TC.textSecondary }}>Click "Add Device" to link a WhatsApp number</div>
            </div>
          ) : (
            devices.map(d => (
              <DeviceCard
                key={d.id}
                device={d}
                onSetActive={handleSetActive}
                onRemove={handleRemove}
                TC={TC}
              />
            ))
          )}
        </div>
      </Card>

      {/* OTP Settings card */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${TC.g100}`,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TC.text, fontFamily: F }}>OTP Settings</div>
          <div style={{ fontSize: 12, color: TC.textSecondary, marginTop: 2, fontFamily: F }}>
            Configure code behaviour and verification flow
          </div>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column' }}>

          {/* Allow skip */}
          <div style={{ padding: '18px 0', borderBottom: `1px solid ${TC.g100}` }}>
            <ConfigRow
              label="Allow users to skip verification"
              hint="Users can register without providing a WhatsApp number"
              TC={TC}
            >
              <Toggle
                checked={config.allow_skip}
                onChange={val => setConfig(c => ({ ...c, allow_skip: val }))}
              />
            </ConfigRow>
          </div>

          {/* Numeric fields */}
          <div style={{ padding: '18px 0', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { field: 'otp_expiry',       label: 'Code Expiry',   unit: 'minutes', min: 1,  max: 60   },
              { field: 'otp_max_attempts', label: 'Max Attempts',  unit: 'tries',   min: 1,  max: 10   },
              { field: 'otp_cooldown',     label: 'Cooldown',      unit: 'seconds', min: 10, max: 3600 },
            ].map(({ field, label, unit, min, max }) => (
              <div key={field}>
                <div style={{ fontSize: 12, fontWeight: 600, color: TC.textSecondary, fontFamily: F, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  {label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input {...numInput(field, min, max)} />
                  <span style={{ fontSize: 12, color: TC.textSecondary, fontFamily: F }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Save button */}
          <div style={{ paddingBottom: 20 }}>
            <button
              onClick={saveConfig}
              disabled={configSaving || configSaved}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 10,
                background: configSaved ? C.green : C.primary,
                color: '#fff', border: 'none',
                fontSize: 14, fontWeight: 600, fontFamily: F,
                cursor: configSaving ? 'not-allowed' : 'pointer',
                opacity: configSaving ? 0.7 : 1,
                transition: 'background .2s, opacity .2s',
              }}
            >
              {configSaved ? '✓ Settings saved' : configSaving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      </Card>

      {/* Add Device Modal */}
      {showAddModal && (
        <AddDeviceModal
          onClose={() => setShowAddModal(false)}
          onConnected={handleDeviceConnected}
        />
      )}
    </PageShell>
  )
}
