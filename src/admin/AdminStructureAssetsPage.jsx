import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx'
import { useStore, setStore } from '../shared/store.js'
import { Box, Plus, Save, X, Edit3, Loader, Search, Image as ImageIcon } from 'lucide-react'

const CURATED_SWATCHES = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4',
  '#ec4899', '#ef4444', '#14b8a6', '#6366f1', '#f97316',
  '#84cc16', '#64748b', '#d946ef', '#e11d48', '#0ea5e9',
]

function hexToHsv(hex) {
  hex = (hex || '#888888').replace('#', '')
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  const v = max
  return { h, s, v }
}
function hsvToHex(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c
  let r, g, b
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
  return '#' + toHex(r) + toHex(g) + toHex(b)
}
function isValidHex(v) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)
}

function ColorPicker({ theme, value, onChange, swatches = CURATED_SWATCHES, compact = false }) {
  const [open, setOpen] = useState(false)
  const [hexInput, setHexInput] = useState(value || '#2563eb')
  const [hsv, setHsv] = useState(() => hexToHsv(value || '#2563eb'))
  const popRef = useRef(null)
  const svRef = useRef(null)
  const hueRef = useRef(null)
  const draggingRef = useRef(null)

  useEffect(() => {
    setHexInput(value || '#2563eb')
    setHsv(hexToHsv(value || '#2563eb'))
  }, [value])

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (popRef.current && !popRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const applyHsv = (next) => {
    setHsv(next)
    const hex = hsvToHex(next.h, next.s, next.v)
    setHexInput(hex)
    onChange(hex)
  }

  const svPointer = (e) => {
    const rect = svRef.current.getBoundingClientRect()
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width)
    const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height)
    applyHsv({ ...hsv, s: x / rect.width, v: 1 - y / rect.height })
  }
  const huePointer = (e) => {
    const rect = hueRef.current.getBoundingClientRect()
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width)
    applyHsv({ ...hsv, h: (x / rect.width) * 360 })
  }

  useEffect(() => {
    function onMove(e) {
      if (draggingRef.current === 'sv') svPointer(e)
      if (draggingRef.current === 'hue') huePointer(e)
    }
    function onUp() { draggingRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [hsv])

  const currentHueColor = hsvToHex(hsv.h, 1, 1)

  const commitHex = (v) => {
    setHexInput(v)
    if (isValidHex(v)) {
      const normalized = v.length === 4 ? '#' + v.slice(1).split('').map((c) => c + c).join('') : v
      setHsv(hexToHsv(normalized))
      onChange(normalized)
    }
  }

  const popover = (
    <div ref={popRef} style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200, width: 240, padding: 16, borderRadius: 16, background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: theme.shadowLg }}>
      {compact && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {swatches.map((c) => (
            <button key={c} onClick={() => onChange(c)} title={c} style={{ width: 22, height: 22, borderRadius: 999, background: c, cursor: 'pointer', border: value && value.toLowerCase() === c.toLowerCase() ? '2px solid #fff' : '1px solid rgba(0,0,0,0.1)', boxShadow: value && value.toLowerCase() === c.toLowerCase() ? `0 0 0 2px ${c}` : 'none', flexShrink: 0 }} />
          ))}
        </div>
      )}
      <div ref={svRef} onMouseDown={(e) => { draggingRef.current = 'sv'; svPointer(e) }} style={{ position: 'relative', width: '100%', height: compact ? 110 : 130, borderRadius: 10, cursor: 'crosshair', background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${currentHueColor})`, backgroundBlendMode: 'multiply' }}>
        <div style={{ position: 'absolute', left: `calc(${hsv.s * 100}% - 6px)`, top: `calc(${(1 - hsv.v) * 100}% - 6px)`, width: 12, height: 12, borderRadius: 999, border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.4)', background: hexInput, pointerEvents: 'none' }} />
      </div>
      <div ref={hueRef} onMouseDown={(e) => { draggingRef.current = 'hue'; huePointer(e) }} style={{ position: 'relative', width: '100%', height: 14, borderRadius: 999, marginTop: 12, cursor: 'pointer', background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)' }}>
        <div style={{ position: 'absolute', left: `calc(${(hsv.h / 360) * 100}% - 7px)`, top: -1, width: 16, height: 16, borderRadius: 999, border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.4)', background: currentHueColor, pointerEvents: 'none' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: hexInput, border: `1px solid ${theme.border}`, flexShrink: 0 }} />
        <input value={hexInput} onChange={(e) => commitHex(e.target.value)} spellCheck={false} style={{ flex: 1, height: 34, padding: '0 10px', borderRadius: 9, border: `1px solid ${isValidHex(hexInput) ? theme.border : '#ef4444'}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontFamily: 'monospace', outline: 'none' }} />
      </div>
      <button onClick={() => setOpen(false)} style={{ marginTop: 12, width: '100%', height: 34, borderRadius: 9, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Done</button>
    </div>
  )

  if (compact) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }} ref={compact ? undefined : popRef}>
        <button onClick={() => setOpen((o) => !o)} title={value} style={{ width: 34, height: 34, borderRadius: 10, background: value, border: `1px solid ${theme.border}`, cursor: 'pointer', boxShadow: `0 0 8px -2px ${value}`, flexShrink: 0 }} />
        {open && popover}
      </div>
    )
  }

  const isCustom = !swatches.some((c) => c.toLowerCase() === (value || '').toLowerCase())

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {swatches.map((c) => (
          <button key={c} onClick={() => { onChange(c); setOpen(false) }} title={c} style={{ width: 26, height: 26, borderRadius: 999, background: c, cursor: 'pointer', border: value && value.toLowerCase() === c.toLowerCase() ? '2px solid #fff' : '1px solid rgba(0,0,0,0.1)', boxShadow: value && value.toLowerCase() === c.toLowerCase() ? `0 0 0 2px ${c}, 0 0 10px -1px ${c}` : 'none', flexShrink: 0 }} />
        ))}
        <button onClick={() => setOpen((o) => !o)} title="Custom color" style={{ width: 26, height: 26, borderRadius: 999, cursor: 'pointer', flexShrink: 0, position: 'relative', overflow: 'hidden', background: isCustom ? value : 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)', border: isCustom ? '2px solid #fff' : '1px solid rgba(0,0,0,0.15)', boxShadow: isCustom ? `0 0 0 2px ${value}, 0 0 10px -1px ${value}` : 'none' }}>
          {!isCustom && <span style={{ position: 'absolute', inset: 3, borderRadius: 999, background: theme.surface, display: 'grid', placeItems: 'center', fontSize: 8, fontWeight: 800, color: theme.textMuted }}>+</span>}
        </button>
      </div>
      {open && popover}
    </div>
  )
}

function TextInput({ theme, value, onChange, placeholder, type = 'text', style }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', ...style }} />
}
function Label({ theme, children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{children}</div>
}

function UploadSlot({ theme, label, value, onUpload, onRemove, validateSquare }) {
  const inputRef = useRef(null)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0]
          if (!file) return
          if (file.size > 4 * 1024 * 1024) { alert(`${label} too large. Max 4MB.`); return }
          if (validateSquare) {
            const img = new window.Image()
            const url = URL.createObjectURL(file)
            img.onload = () => {
              URL.revokeObjectURL(url)
              if (img.width !== img.height) {
                alert(`${label} must be square (equal width and height). Yours is ${img.width}×${img.height}px.`)
                return
              }
              const reader = new FileReader()
              reader.onload = (ev) => onUpload(ev.target.result)
              reader.readAsDataURL(file)
            }
            img.src = url
          } else {
            const reader = new FileReader()
            reader.onload = (ev) => onUpload(ev.target.result)
            reader.readAsDataURL(file)
          }
          e.target.value = ''
        }}
      />
      <button onClick={() => inputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 10px', borderRadius: 9, border: `1px dashed ${theme.borderStrong}`, background: theme.surfaceSunken, color: theme.textMuted, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
        <ImageIcon size={13} /> {value ? 'Change' : 'Upload'}
      </button>
      {value && (
        <button onClick={onRemove} title={`Remove ${label.toLowerCase()}`} style={{ width: 22, height: 22, borderRadius: 999, border: 'none', background: 'rgba(239,68,68,0.14)', color: '#ef4444', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <X size={11} />
        </button>
      )}
    </div>
  )
}

function NewAssetForm({ theme, form, setForm, onCreate, onCancel, saving }) {
  return (
    <GlassCard theme={theme} glow style={{ padding: 26, marginBottom: 20 }}>
      <div style={{ fontSize: 15.5, fontWeight: 800, color: theme.text }}>New Asset</div>
      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
        <div><Label theme={theme}>Key</Label><TextInput theme={theme} value={form.key} onChange={(v) => setForm(f => ({ ...f, key: v }))} placeholder="e.g. verified_bm" /></div>
        <div><Label theme={theme}>Label</Label><TextInput theme={theme} value={form.label} onChange={(v) => setForm(f => ({ ...f, label: v }))} placeholder="e.g. Verified BM" /></div>
        <div><Label theme={theme}>Price ($)</Label><TextInput theme={theme} value={form.base_price} onChange={(v) => setForm(f => ({ ...f, base_price: v }))} type="number" /></div>
      </div>
      <div style={{ marginTop: 18 }}>
        <Label theme={theme}>Glow Color</Label>
        <ColorPicker theme={theme} value={form.glow_color} onChange={(c) => setForm(f => ({ ...f, glow_color: c }))} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <button onClick={onCreate} disabled={saving} style={{ height: 46, padding: '0 22px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: FONT, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.5)', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Creating…' : 'Create Asset'}
        </button>
        <button onClick={onCancel} style={{ height: 46, padding: '0 22px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
          Cancel
        </button>
      </div>
    </GlassCard>
  )
}

function AssetRow({ theme, asset, isEditing, editForm, setEditForm, onStartEdit, onSave, onCancel, saving }) {
  const glow = isEditing ? editForm.glow_color : asset.glow_color
  const imageUrl = isEditing ? editForm.image_url : asset.image_url
  const logoUrl = isEditing ? editForm.logo_url : asset.logo_url

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '44px 1.6fr 1fr 0.8fr 1.6fr 130px 130px 70px', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ width: imageUrl ? 40 : 30, height: 30, borderRadius: 8, background: `${glow}22`, color: glow, display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
        {imageUrl ? <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Box size={14} />}
      </div>

      {isEditing ? (
        <input value={editForm.label || ''} onChange={(e) => setEditForm(f => ({ ...f, label: e.target.value }))} style={{ height: 42, padding: '0 12px', borderRadius: 10, border: `1.5px solid ${BRAND}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontFamily: FONT, outline: 'none', boxShadow: '0 0 0 3px rgba(255,45,85,0.12)' }} />
      ) : (
        <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>{asset.label}</div>
      )}

      <div style={{ fontSize: 12.5, color: theme.textFaint, fontFamily: 'monospace' }}>{asset.key}</div>

      {isEditing ? (
        <input type="number" value={editForm.base_price ?? 0} onChange={(e) => setEditForm(f => ({ ...f, base_price: Number(e.target.value) }))} style={{ height: 42, padding: '0 12px', borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontFamily: FONT, outline: 'none' }} />
      ) : (
        <div style={{ fontSize: 14, fontWeight: 800, color: BRAND }}>${Number(asset.base_price).toFixed(2)}</div>
      )}

      <div>
        {isEditing ? (
          <ColorPicker theme={theme} value={editForm.glow_color} onChange={(c) => setEditForm(f => ({ ...f, glow_color: c }))} compact />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 14, height: 14, borderRadius: 999, background: asset.glow_color, boxShadow: `0 0 8px -1px ${asset.glow_color}` }} />
            <span style={{ fontSize: 12, color: theme.textMuted, fontFamily: 'monospace' }}>{asset.glow_color}</span>
          </div>
        )}
      </div>

      {isEditing ? (
        <UploadSlot theme={theme} label="Image" value={editForm.image_url} onUpload={(v) => setEditForm(f => ({ ...f, image_url: v }))} onRemove={() => setEditForm(f => ({ ...f, image_url: '' }))} />
      ) : (
        <span style={{ fontSize: 11, color: asset.image_url ? '#22c55e' : theme.textFaint }}>{asset.image_url ? '✓ Image set' : '—'}</span>
      )}

      {isEditing ? (
        <UploadSlot theme={theme} label="Logo" value={editForm.logo_url} onUpload={(v) => setEditForm(f => ({ ...f, logo_url: v }))} onRemove={() => setEditForm(f => ({ ...f, logo_url: '' }))} validateSquare />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {asset.logo_url ? (<><img src={asset.logo_url} alt="" style={{ width: 20, height: 20, objectFit: 'contain', borderRadius: 4 }} /><span style={{ fontSize: 11, color: '#22c55e' }}>✓</span></>) : <span style={{ fontSize: 11, color: theme.textFaint }}>—</span>}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {isEditing ? (
          <>
            <button onClick={onSave} disabled={saving} title="Save" style={{ width: 34, height: 34, borderRadius: 9, border: 'none', background: 'rgba(34,197,94,0.14)', color: '#22c55e', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Save size={14} /></button>
            <button onClick={onCancel} title="Cancel" style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.textMuted, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><X size={14} /></button>
          </>
        ) : (
          <button onClick={onStartEdit} title="Edit" style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.textMuted, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Edit3 size={14} /></button>
        )}
      </div>
    </div>
  )
}

export default function AdminStructureAssetsPage() {
  const { theme: themeMode } = useTheme()
  const theme = getAdminTheme(themeMode === 'dark')
  const [store] = useStore()

  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ key: '', label: '', base_price: 0, glow_color: '#3b82f6' })

  useEffect(() => {
    setLoading(true)
    fetch('/api/structure-assets')
      .then(r => r.json())
      .then(data => {
        if (data?.assets) {
          setAssets(data.assets)
          const map = {}
          for (const a of data.assets) {
            map[a.key] = { price: Number(a.base_price), label: a.label, glow: a.glow_color, icon: a.icon, imageUrl: a.image_url || '', logoUrl: a.logo_url || '' }
          }
          setStore(s => ({ ...s, structureAssets: map }))
        }
      })
      .catch(err => setError('Failed to load assets: ' + err.message))
      .finally(() => setLoading(false))
  }, [])

  const startEdit = (asset) => {
    setEditingId(asset.key)
    setEditForm({ ...asset })
  }
  const cancelEdit = () => { setEditingId(null); setEditForm({}) }

  const saveEdit = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/structure-assets', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      if (data.success) {
        setAssets(prev => prev.map(a => a.key === editForm.key ? { ...editForm } : a))
        setEditingId(null)
        setStore(s => {
          const map = { ...s.structureAssets }
          map[editForm.key] = { price: Number(editForm.base_price), label: editForm.label, glow: editForm.glow_color, icon: editForm.icon, imageUrl: editForm.image_url || '', logoUrl: editForm.logo_url || '' }
          return { ...s, structureAssets: map }
        })
      }
    } catch (err) {
      alert('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const createAsset = async () => {
    if (!addForm.key.trim() || !addForm.label.trim()) { alert('Key and Label are required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/structure-assets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          key: addForm.key.trim().toLowerCase().replace(/\s+/g, '_'),
          icon: 'box',
          bg_color_dark: '#1a1a2e', bg_color_light: '#ffffff',
          border_color_dark: '#2d2d44', border_color_light: '#e5e7eb',
          text_color_dark: '#f0f0fa', text_color_light: '#1f2937',
          description: '', sort_order: assets.length + 1, active: 1,
        }),
      })
      if (!res.ok) throw new Error('Create failed')
      const data = await res.json()
      if (data.success) {
        const newAsset = { key: addForm.key.trim().toLowerCase().replace(/\s+/g, '_'), label: addForm.label, base_price: Number(addForm.base_price), glow_color: addForm.glow_color, icon: 'box', sort_order: assets.length + 1, active: 1 }
        setAssets(prev => [...prev, newAsset])
        setShowAdd(false)
        setAddForm({ key: '', label: '', base_price: 0, glow_color: '#3b82f6' })
      }
    } catch (err) {
      alert('Failed to create: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = assets.filter(a => {
    if (!search) return true
    const q = search.toLowerCase()
    return a.label?.toLowerCase().includes(q) || a.key?.toLowerCase().includes(q)
  })

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Structure Assets</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Manage builder node types, pricing, and theming.</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ height: 46, padding: '0 20px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.5)' }}>
          <Plus size={15} /> Add Asset
        </button>
      </div>

      {error && <div style={{ marginTop: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{error}</div>}

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', gap: 10, height: 46, padding: '0 16px', borderRadius: 100, background: theme.surfaceSunken, border: `1px solid ${theme.border}` }}>
          <Search size={15} style={{ color: theme.textFaint }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13.5, color: theme.text, fontFamily: FONT }} />
        </div>
        <div style={{ fontSize: 13, color: theme.textFaint, fontWeight: 600 }}>{filtered.length} assets</div>
      </div>

      <div style={{ marginTop: 20 }}>
        {showAdd && (
          <NewAssetForm theme={theme} form={addForm} setForm={setAddForm} onCreate={createAsset} onCancel={() => setShowAdd(false)} saving={saving} />
        )}

        <GlassCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 960 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '44px 1.6fr 1fr 0.8fr 1.6fr 130px 130px 70px', gap: 14, padding: '13px 20px', borderBottom: `1px solid ${theme.border}` }}>
                {['', 'Asset', 'Key', 'Price', 'Glow', 'Image', 'Logo', 'Actions'].map((h) => (
                  <div key={h} style={{ fontSize: 10.5, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>
              {loading && <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textFaint }}><Loader size={22} style={{ display: 'block', margin: '0 auto 10px' }} />Loading assets…</div>}
              {!loading && filtered.length === 0 && <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>No assets found</div>}
              {!loading && filtered.map((a) => (
                <AssetRow
                  key={a.key} theme={theme} asset={a} isEditing={editingId === a.key}
                  editForm={editForm} setEditForm={setEditForm}
                  onStartEdit={() => startEdit(a)} onSave={saveEdit} onCancel={cancelEdit} saving={saving}
                />
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
