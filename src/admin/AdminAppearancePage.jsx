import { useState, useEffect } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx'
import { LANDING_TEMPLATES } from '../landing-custom/templates/registry.js'
import { Check, ExternalLink } from 'lucide-react'

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

function TemplateCard({ theme, template, active, onSetActive, saving }) {
  const previewHref = `/#/preview-landing/${encodeURIComponent(template.key)}`
  return (
    <GlassCard theme={theme} glow={active} style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        height: 150, background: theme.surfaceSunken, borderBottom: `1px solid ${theme.border}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <iframe
          src={previewHref}
          title={template.label}
          scrolling="no"
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '400%', height: '400%',
            border: 'none',
            transform: 'scale(0.25)',
            transformOrigin: 'top left',
            pointerEvents: 'none',
          }}
        />
        {active && (
          <span style={{ position: 'absolute', top: 12, right: 12, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.14)', padding: '5px 11px', borderRadius: 100 }}>
            <Check size={12} /> Live now
          </span>
        )}
      </div>
      <div style={{ padding: 22 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: theme.text }}>{template.label}</div>
        <p style={{ margin: '6px 0 0', fontSize: 12.5, color: theme.textMuted, lineHeight: 1.55, minHeight: 40 }}>{template.description}</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <a
            href={previewHref} target="_blank" rel="noreferrer"
            style={{ flex: 1, height: 40, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12.5, fontWeight: 700, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
          >
            <ExternalLink size={13} /> Preview
          </a>
          <button
            onClick={() => onSetActive(template.key)}
            disabled={active || saving}
            style={{
              flex: 1, height: 40, borderRadius: 10, border: 'none',
              background: active ? theme.surfaceSunken : `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`,
              color: active ? theme.textFaint : '#fff',
              fontSize: 12.5, fontWeight: 700, fontFamily: FONT,
              cursor: active || saving ? 'default' : 'pointer',
              boxShadow: active ? 'none' : '0 10px 20px -10px rgba(255,45,85,0.5)',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {active ? 'Active' : saving ? 'Saving…' : 'Set Active'}
          </button>
        </div>
      </div>
    </GlassCard>
  )
}

export default function AdminAppearancePage() {
  const { theme: themeMode } = useTheme()
  const theme = getAdminTheme(themeMode === 'dark')

  const [activeTemplate, setActiveTemplate] = useState('default')
  const [productsEnabled, setProductsEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingProducts, setSavingProducts] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    request('/api/appearance-settings')
      .then(data => {
        setActiveTemplate(data.active_template || 'default')
        setProductsEnabled(data.products_page_enabled !== false)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const setActive = async (key) => {
    setSaving(true)
    setError('')
    try {
      const data = await request('/api/appearance-settings', { method: 'POST', body: JSON.stringify({ active_template: key }) })
      setActiveTemplate(data.active_template)
      setSuccess('Landing page updated — live for all visitors now.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleProductsPage = async () => {
    const next = !productsEnabled
    setSavingProducts(true)
    setError('')
    try {
      const data = await request('/api/appearance-settings', { method: 'POST', body: JSON.stringify({ products_page_enabled: next }) })
      setProductsEnabled(data.products_page_enabled)
    } catch (e) {
      setError(e.message)
    } finally {
      setSavingProducts(false)
    }
  }

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Appearance</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted, maxWidth: 620 }}>
          Choose which landing page design is shown to visitors on adversolutions.agency. Swap it for a seasonal promo, a "Coming Soon" page, or back to the default — takes effect immediately, no deploy needed.
        </p>
      </div>

      {error && <div style={{ marginTop: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ marginTop: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{success}</div>}

      <div style={{ marginTop: 26 }}>
        {loading ? (
          <GlassCard theme={theme} style={{ padding: '60px 0', textAlign: 'center' }}>
            <span style={{ color: theme.textFaint, fontSize: 14 }}>Loading…</span>
          </GlassCard>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
            {LANDING_TEMPLATES.map(t => (
              <TemplateCard key={t.key} theme={theme} template={t} active={t.key === activeTemplate} onSetActive={setActive} saving={saving} />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <GlassCard theme={theme} style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Products page</div>
            <p style={{ margin: 0, fontSize: 12.5, color: theme.textMuted, lineHeight: 1.55, maxWidth: 480 }}>
              Public catalog of available Pre-Verified Accounts at adversolutions.agency/#/products, linked from the landing page nav. Visitors can browse stock but must be logged in to purchase.
            </p>
          </div>
          <button
            onClick={toggleProductsPage}
            disabled={loading || savingProducts}
            style={{
              flexShrink: 0, width: 52, height: 30, borderRadius: 100, border: 'none', position: 'relative',
              background: productsEnabled ? `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})` : theme.surfaceSunken,
              cursor: loading || savingProducts ? 'default' : 'pointer', opacity: savingProducts ? 0.6 : 1,
              transition: 'background .2s',
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: productsEnabled ? 25 : 3, width: 24, height: 24, borderRadius: '50%',
              background: '#fff', transition: 'left .2s', boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }} />
          </button>
        </GlassCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <GlassCard theme={theme} style={{ padding: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text, marginBottom: 4 }}>More templates coming</div>
          <p style={{ margin: 0, fontSize: 12.5, color: theme.textMuted, lineHeight: 1.55 }}>
            This list grows as new landing page designs are added — each one shows up here automatically once it's wired in.
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
