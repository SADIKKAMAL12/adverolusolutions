import { useState, useEffect, useCallback } from 'react'
import { PageShell, Card, Btn } from '../shared/UI.jsx'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors, C } from '../shared/theme.js'
import { useNavigate } from '../shared/Router.jsx'

const F = "'Plus Jakarta Sans','Inter',sans-serif"
const api = (path, opts) => fetch(path, opts).then(r => r.json())

const DEFAULTS = {
  smtp_host: 'mail.spacemail.com',
  smtp_port: '465',
  smtp_user: 'support@adversolutions.agency',
  smtp_pass: '',
}

/* ── Toggle switch — same pattern as AdminWhatsAppPage's Toggle ─────────────── */
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

export default function AdminEmailOTPPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)

  const [cfg, setCfg] = useState({
    email_otp_enabled: false,
    email_otp_expiry: 10,
    email_otp_max_attempts: 3,
    email_otp_cooldown: 60,
    ...DEFAULTS,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await api('/api/admin/platform-settings')
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
      }))
    } catch { /* keep defaults if settings can't be loaded */ }
  }, [])

  useEffect(() => { load() }, [load])

  const saveAll = async () => {
    setSaving(true)
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
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleEnabled = async (next) => {
    const updated = { ...cfg, email_otp_enabled: next }
    setCfg(updated)
    await api('/api/admin/platform-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_otp_enabled: next }),
    })
  }

  const sendTest = async () => {
    if (!testEmail) return
    setTesting(true)
    setTestResult(null)
    const res = await api('/api/email-otp?action=test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: testEmail }),
    })
    setTesting(false)
    setTestResult(res.success
      ? { ok: true, msg: 'Test email sent successfully!' }
      : { ok: false, msg: res.error || 'Failed to send' })
  }

  const textField = (field, placeholder, type = 'text') => ({
    type,
    value: cfg[field],
    placeholder,
    onChange: (e) => setCfg(prev => ({ ...prev, [field]: e.target.value })),
    style: {
      flex: 1,
      padding: '9px 12px',
      border: `1px solid ${TC.g200}`,
      borderRadius: 8,
      background: TC.g50,
      color: TC.text,
      fontSize: 13.5,
      fontFamily: F,
      outline: 'none',
    },
  })

  const numberField = (field, min, max) => ({
    type: 'number',
    min,
    max,
    value: cfg[field],
    onChange: (e) => setCfg(prev => ({ ...prev, [field]: Number(e.target.value) })),
    style: {
      width: 80,
      padding: '7px 10px',
      border: `1px solid ${TC.g200}`,
      borderRadius: 8,
      background: TC.g50,
      color: TC.text,
      fontSize: 13.5,
      fontFamily: F,
      fontWeight: 600,
      textAlign: 'center',
      outline: 'none',
    },
  })

  return (
    <PageShell
      title="Email OTP"
      subtitle="Configure SMTP settings and email OTP verification for user registration."
      breadcrumb="Admin / System Settings / Email OTP"
      actions={[
        <Btn key="back" variant="outline" onClick={() => navigate('/admin/settings')}>
          ← Back to System Settings
        </Btn>,
      ]}
    >
      {/* ── Status banner ── */}
      <div style={{
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        border: `2px solid ${cfg.email_otp_enabled ? C.green + '50' : C.red + '40'}`,
        background: cfg.email_otp_enabled
          ? (isDark ? 'rgba(16,185,129,.08)' : '#f0fdf4')
          : (isDark ? 'rgba(239,68,68,.08)' : '#fff5f5'),
      }}>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, fontFamily: F, color: cfg.email_otp_enabled ? C.green : C.red, marginBottom: 2 }}>
            Email OTP is {cfg.email_otp_enabled ? 'Enabled' : 'Disabled'}
          </div>
          <div style={{ fontSize: 12.5, color: TC.textSecondary, fontFamily: F }}>
            {cfg.email_otp_enabled
              ? 'Users must verify their email address when registering'
              : 'Email OTP verification is not required at registration'}
          </div>
        </div>
        <Toggle checked={cfg.email_otp_enabled} onChange={toggleEnabled} />
      </div>

      {/* ── SMTP configuration ── */}
      <Card style={{ marginBottom: 18, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${TC.g100}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TC.text, fontFamily: F }}>SMTP Configuration</div>
          <div style={{ fontSize: 12, color: TC.textSecondary, marginTop: 2, fontFamily: F }}>
            Spacemail / any SMTP server credentials
          </div>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { field: 'smtp_host', label: 'SMTP Host', placeholder: 'mail.spacemail.com' },
            { field: 'smtp_port', label: 'SMTP Port', placeholder: '465' },
            { field: 'smtp_user', label: 'Username', placeholder: 'support@adversolutions.agency' },
            { field: 'smtp_pass', label: 'Password', placeholder: '••••••••', type: 'password' },
          ].map(({ field, label, placeholder, type }) => (
            <div key={field} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 120, fontSize: 12.5, fontWeight: 600, color: TC.textSecondary, fontFamily: F, flexShrink: 0 }}>
                {label}
              </div>
              <input {...textField(field, placeholder, type)} />
            </div>
          ))}
        </div>
      </Card>

      {/* ── Test SMTP ── */}
      <Card style={{ marginBottom: 18, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${TC.g100}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TC.text, fontFamily: F }}>Test SMTP</div>
          <div style={{ fontSize: 12, color: TC.textSecondary, marginTop: 2, fontFamily: F }}>
            Send a test email to verify your SMTP settings work
          </div>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="email"
              placeholder="Send test to this email..."
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              style={{
                flex: 1, padding: '9px 12px', border: `1px solid ${TC.g200}`, borderRadius: 8,
                background: TC.g50, color: TC.text, fontSize: 13.5, fontFamily: F, outline: 'none',
              }}
            />
            <button
              onClick={sendTest}
              disabled={testing || !testEmail}
              style={{
                padding: '9px 18px', borderRadius: 8, background: C.primary, color: '#fff', border: 'none',
                cursor: testing || !testEmail ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600,
                fontFamily: F, opacity: testing || !testEmail ? 0.6 : 1,
              }}
            >
              {testing ? 'Sending…' : 'Send Test'}
            </button>
          </div>
          {testResult && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, fontSize: 13,
              background: testResult.ok ? '#f0fdf4' : '#fef2f2',
              color: testResult.ok ? '#16a34a' : '#ef4444',
              border: `1px solid ${testResult.ok ? '#bbf7d0' : '#fecaca'}`,
              fontWeight: 600,
            }}>
              {testResult.ok ? '✓ ' : '✕ '}{testResult.msg}
            </div>
          )}
        </div>
      </Card>

      {/* ── OTP behavior settings ── */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${TC.g100}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TC.text, fontFamily: F }}>OTP Settings</div>
          <div style={{ fontSize: 12, color: TC.textSecondary, marginTop: 2, fontFamily: F }}>
            Configure code expiry, attempts, and cooldown
          </div>
        </div>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 0', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { field: 'email_otp_expiry', label: 'Code Expiry', unit: 'minutes', min: 1, max: 60 },
              { field: 'email_otp_max_attempts', label: 'Max Attempts', unit: 'tries', min: 1, max: 10 },
              { field: 'email_otp_cooldown', label: 'Cooldown', unit: 'seconds', min: 10, max: 3600 },
            ].map(({ field, label, unit, min, max }) => (
              <div key={field}>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: TC.textSecondary, fontFamily: F,
                  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em',
                }}>
                  {label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input {...numberField(field, min, max)} />
                  <span style={{ fontSize: 12, color: TC.textSecondary, fontFamily: F }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ paddingBottom: 20 }}>
            <button
              onClick={saveAll}
              disabled={saving || saved}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 10,
                background: saved ? C.green : C.primary, color: '#fff', border: 'none',
                fontSize: 14, fontWeight: 600, fontFamily: F,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                transition: 'background .2s, opacity .2s',
              }}
            >
              {saved ? '✓ Settings saved' : saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      </Card>
    </PageShell>
  )
}
