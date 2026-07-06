import { useState, useEffect } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors } from '../shared/theme.js'
import { useStore, setStore } from '../shared/store.js'
import {
  Box, Plus, Save, X, Edit3, Trash2, Loader, Search, Tag, DollarSign,
  Palette, Hexagon, Image
} from 'lucide-react'

const DEFAULT_GLOW_COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4',
  '#ec4899', '#ef4444', '#14b8a6', '#6366f1', '#f97316',
  '#84cc16', '#64748b', '#d946ef', '#e11d48', '#0ea5e9',
]

export default function AdminStructureAssetsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)
  const [store] = useStore()

  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({
    key: '', label: '', base_price: 0, glow_color: '#3b82f6',
  })

  // Fetch assets
  useEffect(() => {
    setLoading(true)
    fetch('/api/structure-assets')
      .then(r => r.json())
      .then(data => {
        if (data?.assets) {
          setAssets(data.assets)
          // Build map for store
          const map = {}
          for (const a of data.assets) {
            map[a.key] = {
              price: Number(a.base_price),
              label: a.label,
              glow: a.glow_color,
              icon: a.icon,
              imageUrl: a.image_url || '',
              logoUrl: a.logo_url || '',
            }
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

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/structure-assets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      if (data.success) {
        setAssets(prev => prev.map(a => a.key === editForm.key ? { ...editForm } : a))
        setEditingId(null)
        // Update store map
        setStore(s => {
          const map = { ...s.structureAssets }
          map[editForm.key] = {
            price: Number(editForm.base_price),
            label: editForm.label,
            glow: editForm.glow_color,
            icon: editForm.icon,
            imageUrl: editForm.image_url || '',
            logoUrl: editForm.logo_url || '',
          }
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
    if (!addForm.key.trim() || !addForm.label.trim()) {
      alert('Key and Label are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/structure-assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          key: addForm.key.trim().toLowerCase().replace(/\s+/g, '_'),
          icon: 'box',
          bg_color_dark: '#1a1a2e',
          bg_color_light: '#ffffff',
          border_color_dark: '#2d2d44',
          border_color_light: '#e5e7eb',
          text_color_dark: '#f0f0fa',
          text_color_light: '#1f2937',
          description: '',
          sort_order: assets.length + 1,
          active: 1,
        }),
      })
      if (!res.ok) throw new Error('Create failed')
      const data = await res.json()
      if (data.success) {
        const newAsset = {
          key: addForm.key.trim().toLowerCase().replace(/\s+/g, '_'),
          label: addForm.label,
          base_price: Number(addForm.base_price),
          glow_color: addForm.glow_color,
          icon: 'box',
          sort_order: assets.length + 1,
          active: 1,
        }
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
    <div style={{ padding: '24px 28px', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: TC.text, margin: 0 }}>Structure Assets</h1>
          <p style={{ fontSize: 13, color: TC.g500, margin: '4px 0 0' }}>Manage builder node types, pricing, and theming</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: TC.primary, color: '#fff',
            fontSize: 13, fontWeight: 800, cursor: 'pointer',
          }}
        >
          <Plus size={15} />
          Add Asset
        </button>
      </div>

      {error && (
        <div style={{
          background: `${TC.red}10`, border: `1px solid ${TC.red}30`,
          color: TC.red, padding: '12px 16px', borderRadius: 10,
          marginBottom: 16, fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        padding: '12px 16px', background: TC.card, borderRadius: 12,
        border: `1px solid ${TC.g200}`,
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} color={TC.g400} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets..."
            style={{
              width: '100%', padding: '8px 10px 8px 32px', borderRadius: 8,
              border: `1px solid ${TC.g300}`, background: TC.card,
              color: TC.text, fontSize: 13, fontFamily: "inherit",
              outline: 'none',
            }}
          />
        </div>
        <span style={{ fontSize: 12, color: TC.g500 }}>{filtered.length} assets</span>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{
          background: TC.card, borderRadius: 14, border: `1px solid ${TC.g200}`,
          padding: '18px 20px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: TC.text, marginBottom: 14 }}>New Asset</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: TC.g500, fontWeight: 600, marginBottom: 6, display: 'block' }}>Key</label>
              <input
                value={addForm.key}
                onChange={e => setAddForm(f => ({ ...f, key: e.target.value }))}
                placeholder="e.g. verified_bm"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: `1px solid ${TC.g300}`, background: TC.card,
                  color: TC.text, fontSize: 13, fontFamily: "inherit",
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: TC.g500, fontWeight: 600, marginBottom: 6, display: 'block' }}>Label</label>
              <input
                value={addForm.label}
                onChange={e => setAddForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Verified BM"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: `1px solid ${TC.g300}`, background: TC.card,
                  color: TC.text, fontSize: 13, fontFamily: "inherit",
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: TC.g500, fontWeight: 600, marginBottom: 6, display: 'block' }}>Price ($)</label>
              <input
                type="number"
                value={addForm.base_price}
                onChange={e => setAddForm(f => ({ ...f, base_price: Number(e.target.value) }))}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: `1px solid ${TC.g300}`, background: TC.card,
                  color: TC.text, fontSize: 13, fontFamily: "inherit",
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: TC.g500, fontWeight: 600, marginBottom: 6, display: 'block' }}>Glow Color</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DEFAULT_GLOW_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setAddForm(f => ({ ...f, glow_color: c }))}
                    style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: c,
                      border: addForm.glow_color === c ? `2px solid ${TC.text}` : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={createAsset}
              disabled={saving}
              style={{
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: TC.primary, color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {saving ? 'Creating...' : 'Create Asset'}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{
                padding: '8px 18px', borderRadius: 8,
                border: `1px solid ${TC.g300}`, background: TC.g100,
                color: TC.g700, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{
        background: TC.card, borderRadius: 14,
        border: `1px solid ${TC.g200}`, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '44px 1.5fr 1fr 100px 100px 120px 120px 120px',
          padding: '14px 20px', background: isDark ? 'rgba(255,255,255,.03)' : TC.g50,
          borderBottom: `1px solid ${TC.g200}`,
        }}>
          {['', 'Asset', 'Key', 'Price', 'Glow', 'Image', 'Logo', 'Actions'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 800, color: TC.g500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {h}
            </div>
          ))}
        </div>

        {loading && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: TC.g400 }}>
            <Loader size={24} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }} />
            Loading assets...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: TC.g400, fontSize: 13 }}>
            No assets found
          </div>
        )}

        {filtered.map(asset => {
          const isEditing = editingId === asset.key
          return (
            <div key={asset.key} style={{
              display: 'grid', gridTemplateColumns: '44px 1.5fr 1fr 100px 100px 120px 120px 120px',
              padding: '12px 20px', alignItems: 'center',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : TC.g100}`,
            }}>
              {/* Icon / Image */}
              <div style={{
                width: asset.image_url ? 52 : 32,
                height: 32,
                borderRadius: 7,
                background: `${asset.glow_color}15`,
                border: `1px solid ${asset.glow_color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {asset.image_url ? (
                  <img src={asset.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Box size={14} color={asset.glow_color} />
                )}
              </div>

              {/* Label */}
              <div>
                {isEditing ? (
                  <input
                    value={editForm.label || ''}
                    onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                    style={{
                      width: '90%', padding: '6px 10px', borderRadius: 6,
                      border: `1px solid ${TC.primary}`, background: TC.card,
                      color: TC.text, fontSize: 13, fontFamily: "inherit",
                      outline: 'none',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 700, color: TC.text }}>{asset.label}</span>
                )}
              </div>

              {/* Key */}
              <div style={{ fontSize: 12, color: TC.g500, fontFamily: 'monospace' }}>
                {asset.key}
              </div>

              {/* Price */}
              <div>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.base_price || 0}
                    onChange={e => setEditForm(f => ({ ...f, base_price: Number(e.target.value) }))}
                    style={{
                      width: 80, padding: '6px 10px', borderRadius: 6,
                      border: `1px solid ${TC.primary}`, background: TC.card,
                      color: TC.text, fontSize: 13, fontFamily: "inherit",
                      outline: 'none',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 800, color: TC.primary }}>
                    ${Number(asset.base_price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Glow color picker */}
              <div>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {DEFAULT_GLOW_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setEditForm(f => ({ ...f, glow_color: c }))}
                        style={{
                          width: 18, height: 18, borderRadius: '50%',
                          background: c,
                          border: editForm.glow_color === c ? `2px solid ${TC.text}` : '2px solid transparent',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: asset.glow_color, border: `1px solid ${TC.g300}` }} />
                    <span style={{ fontSize: 11, color: TC.g500, fontFamily: 'monospace' }}>{asset.glow_color}</span>
                  </div>
                )}
              </div>

              {/* Image upload */}
              <div>
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '5px 10px', borderRadius: 6,
                      border: `1px solid ${TC.g300}`, background: TC.g100,
                      cursor: 'pointer', fontSize: 11, color: TC.g600,
                      fontWeight: 600,
                    }}>
                      <Image size={12} />
                      {editForm.image_url ? 'Change' : 'Upload'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files[0]
                          if (!file) return
                          if (file.size > 4 * 1024 * 1024) {
                            alert('Image too large. Max 4MB.')
                            return
                          }
                          const reader = new FileReader()
                          reader.onload = (ev) => {
                            setEditForm(f => ({ ...f, image_url: ev.target.result }))
                          }
                          reader.readAsDataURL(file)
                        }}
                      />
                    </label>
                    {editForm.image_url && (
                      <button
                        onClick={() => setEditForm(f => ({ ...f, image_url: '' }))}
                        title="Remove image"
                        style={{
                          width: 20, height: 20, borderRadius: '50%',
                          border: 'none', background: TC.red + '15',
                          color: TC.red, fontSize: 10, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: asset.image_url ? TC.green : TC.g400 }}>
                    {asset.image_url ? '✓ Image set' : '—'}
                  </span>
                )}
              </div>

              {/* Logo upload */}
              <div>
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '5px 10px', borderRadius: 6,
                      border: `1px solid ${TC.g300}`, background: TC.g100,
                      cursor: 'pointer', fontSize: 11, color: TC.g600,
                      fontWeight: 600,
                    }}>
                      <Image size={12} />
                      {editForm.logo_url ? 'Change' : 'Upload'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (!file) return
                          if (file.size > 4 * 1024 * 1024) {
                            alert('Logo too large. Max 4MB.')
                            return
                          }
                          const img = new window.Image()
                          const url = URL.createObjectURL(file)
                          img.onload = () => {
                            URL.revokeObjectURL(url)
                            if (img.width !== img.height) {
                              alert(`Logo must be square (equal width and height). Yours is ${img.width}×${img.height}px.`)
                              return
                            }
                            const reader = new FileReader()
                            reader.onload = (ev) => setEditForm(f => ({ ...f, logo_url: ev.target.result }))
                            reader.readAsDataURL(file)
                          }
                          img.src = url
                        }}
                      />
                    </label>
                    {editForm.logo_url && (
                      <button
                        onClick={() => setEditForm(f => ({ ...f, logo_url: '' }))}
                        title="Remove logo"
                        style={{
                          width: 20, height: 20, borderRadius: '50%',
                          border: 'none', background: TC.red + '15',
                          color: TC.red, fontSize: 10, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {asset.logo_url ? (
                      <>
                        <img src={asset.logo_url} alt="" style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: 4 }} />
                        <span style={{ fontSize: 11, color: TC.green }}>✓ Set</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 11, color: TC.g400 }}>—</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                {isEditing ? (
                  <>
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      title="Save"
                      style={{
                        width: 28, height: 28, borderRadius: 7,
                        border: `1px solid ${TC.green}40`, background: `${TC.green}10`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Save size={13} color={TC.green} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      title="Cancel"
                      style={{
                        width: 28, height: 28, borderRadius: 7,
                        border: `1px solid ${TC.g300}`, background: TC.g100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={13} color={TC.g600} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startEdit(asset)}
                    title="Edit"
                    style={{
                      width: 28, height: 28, borderRadius: 7,
                      border: `1px solid ${TC.g300}`, background: TC.g100,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit3 size={13} color={TC.g600} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
