import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '../shared/Router.jsx'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx'
import { PlatformIcon } from '../shared/UI.jsx'
import { ChevronLeft, Trash2, Upload, Plus } from 'lucide-react'

const DEFAULT_PLATFORMS = [
  { key: 'meta', label: 'Meta' },
  { key: 'google', label: 'Google' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'snapchat', label: 'Snapchat' },
]

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function slugify(label, existingKeys) {
  let base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'platform'
  let key = base
  let i = 2
  while (existingKeys.includes(key)) {
    key = `${base}-${i}`
    i += 1
  }
  return key
}

function TextInput({ theme, value, onChange, placeholder, style, ...rest }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', ...style }}
      {...rest}
    />
  )
}

function PlatformTypesEditor({ theme, platform, types, onLabelChange, onRemovePlatform, onChange }) {
  const [draftName, setDraftName] = useState('')
  const [draftLogo, setDraftLogo] = useState(null)
  const fileInputRef = useRef(null)

  const add = () => {
    const name = draftName.trim()
    if (!name) return
    onChange([...types, { id: crypto.randomUUID(), name, logo: draftLogo || null }])
    setDraftName('')
    setDraftLogo(null)
  }

  const remove = (id) => onChange(types.filter(t => t.id !== id))

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setDraftLogo(await readFileAsBase64(file))
    e.target.value = ''
  }

  return (
    <div style={{ paddingBottom: 22, marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <PlatformIcon platform={platform.key} size={34} />
        <div style={{ flex: 1, maxWidth: 260 }}>
          <TextInput theme={theme} value={platform.label} onChange={onLabelChange} style={{ fontWeight: 700 }} />
        </div>
        <button
          onClick={onRemovePlatform}
          title="Remove platform"
          style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', display: 'grid', placeItems: 'center', cursor: 'pointer', marginLeft: 'auto' }}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {types.length === 0 ? (
        <div style={{ marginTop: 12, fontSize: 12.5, color: theme.textFaint }}>No account types added yet for this platform.</div>
      ) : (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {types.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: theme.surfaceSunken }}>
              <span style={{ width: 26, height: 26, borderRadius: 7, overflow: 'hidden', display: 'grid', placeItems: 'center', flexShrink: 0, background: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
                {t.logo ? <img src={t.logo} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <PlatformIcon platform={platform.key} size={26} />}
              </span>
              <span style={{ flex: 1, fontSize: 13.5, color: theme.text }}>{t.name}</span>
              <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 15, padding: 0 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Upload logo (optional)"
          style={{ width: 46, height: 46, borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.textMuted, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0, overflow: 'hidden' }}
        >
          {draftLogo ? <img src={draftLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Upload size={16} />}
        </button>
        <div style={{ flex: 1 }}>
          <TextInput theme={theme} value={draftName} onChange={setDraftName} placeholder={`e.g. ${platform.label} Aged Account`} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
        </div>
        <button onClick={add} style={{ height: 46, padding: '0 18px', borderRadius: 12, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  )
}

export default function AdminVerificationSettingsPage() {
  const { theme: themeMode } = useTheme()
  const theme = getAdminTheme(themeMode === 'dark')
  const navigate = useNavigate()

  const [platforms, setPlatforms] = useState(DEFAULT_PLATFORMS)
  const [map, setMap] = useState({})
  const [defaultExpiryDays, setDefaultExpiryDays] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newPlatformName, setNewPlatformName] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const settings = await request('/api/admin/verification-settings')
      setPlatforms(settings.verification_platforms?.length ? settings.verification_platforms : DEFAULT_PLATFORMS)
      setMap(settings.verification_platform_map || {})
      setDefaultExpiryDays(settings.verification_default_expiry_days ?? '')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const result = await request('/api/admin/verification-settings', {
        method: 'POST',
        body: JSON.stringify({
          verification_platforms: platforms,
          verification_platform_map: map,
          verification_default_expiry_days: defaultExpiryDays === '' ? null : Number(defaultExpiryDays),
        }),
      })
      if (result.verification_platform_map) setMap(result.verification_platform_map)
      setSuccess('Settings saved')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const renamePlatform = (key, label) => {
    setPlatforms(prev => prev.map(p => p.key === key ? { ...p, label } : p))
  }

  const removePlatform = (key) => {
    if (!window.confirm('Remove this platform and all its account types?')) return
    setPlatforms(prev => prev.filter(p => p.key !== key))
    setMap(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const addPlatform = () => {
    const label = newPlatformName.trim()
    if (!label) return
    const key = slugify(label, platforms.map(p => p.key))
    setPlatforms(prev => [...prev, { key, label }])
    setNewPlatformName('')
  }

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Verification Settings</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted, maxWidth: 620 }}>Manage the platforms and account types customers can choose from. When they open a verification link, they'll pick one of these themselves.</p>
        </div>
        <button onClick={() => navigate('/admin/verifications')} style={{ height: 44, padding: '0 18px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ChevronLeft size={15} /> Back to Verifications
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{error}</div>
      )}
      {success && (
        <div style={{ marginTop: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{success}</div>
      )}

      <GlassCard theme={theme} style={{ marginTop: 24, padding: 26 }}>
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 13, color: theme.textFaint }}>Loading…</div>
        ) : (
          platforms.map((p, i) => (
            <div key={p.key} style={{ borderBottom: i < platforms.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
              <PlatformTypesEditor
                theme={theme}
                platform={p}
                types={map[p.key] || []}
                onLabelChange={(label) => renamePlatform(p.key, label)}
                onRemovePlatform={() => removePlatform(p.key)}
                onChange={(next) => setMap(prev => ({ ...prev, [p.key]: next }))}
              />
            </div>
          ))
        )}
      </GlassCard>

      <GlassCard theme={theme} style={{ marginTop: 20, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Add Platform</div>
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, maxWidth: 320 }}>
            <TextInput theme={theme} value={newPlatformName} onChange={setNewPlatformName} placeholder="e.g. Bing" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPlatform() } }} />
          </div>
          <button onClick={addPlatform} style={{ height: 46, padding: '0 18px', borderRadius: 12, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Plus size={14} /> Add Platform
          </button>
        </div>
      </GlassCard>

      <GlassCard theme={theme} style={{ marginTop: 20, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Default Link Expiration</div>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: theme.textMuted }}>Days before an unsubmitted verification link expires. Leave blank for links that never expire. You can still override this per-link when generating.</p>
        <div style={{ marginTop: 14, maxWidth: 260 }}>
          <TextInput theme={theme} type="number" min="1" value={defaultExpiryDays} onChange={setDefaultExpiryDays} placeholder="Never expires" />
        </div>
      </GlassCard>

      <button onClick={handleSave} disabled={saving} style={{ marginTop: 20, height: 50, padding: '0 24px', borderRadius: 14, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: FONT, boxShadow: '0 14px 30px -12px rgba(255,45,85,0.55)', opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
