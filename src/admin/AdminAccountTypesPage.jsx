import { useEffect, useRef, useState } from 'react'
import { GripVertical, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { Btn, Card, Input, PageShell } from '../shared/UI.jsx'
import { getThemeColors } from '../shared/theme.js'
import { useTheme } from '../shared/ThemeContext.jsx'
import { useNavigate } from '../shared/Router.jsx'

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

export default function AdminAccountTypesPage() {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const navigate = useNavigate()
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [logo, setLogo] = useState(null)
  const logoInputRef = useRef(null)

  // drag state
  const dragIdx = useRef(null)
  const dragOverIdx = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await request('/api/account-types')
      setTypes(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── drag handlers ────────────────────────────────────────────────────────────
  const onDragStart = (e, idx) => {
    dragIdx.current = idx
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragOver = (e, idx) => {
    e.preventDefault()
    dragOverIdx.current = idx
  }

  const onDrop = async () => {
    const from = dragIdx.current
    const to = dragOverIdx.current
    if (from === null || to === null || from === to) return
    dragIdx.current = null
    dragOverIdx.current = null

    const reordered = [...types]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    // Assign new sort_order values
    const updated = reordered.map((t, i) => ({ ...t, sort_order: i + 1 }))
    setTypes(updated)

    setReordering(true)
    try {
      await Promise.all(
        updated.map(t => request('/api/account-types', {
          method: 'PUT',
          body: JSON.stringify({ id: t.id, sort_order: t.sort_order }),
        }))
      )
      setSuccess('Order saved')
      setTimeout(() => setSuccess(''), 2000)
    } catch (e) {
      setError('Failed to save order: ' + e.message)
    } finally {
      setReordering(false)
    }
  }

  // ── modal helpers ────────────────────────────────────────────────────────────
  const openAdd = () => { setEditing(null); setName(''); setLogo(null); setError(''); setShowModal(true) }
  const openEdit = (t) => { setEditing(t); setName(t.name); setLogo(t.logo || null); setError(''); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditing(null); setName(''); setLogo(null) }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogo(await readFileAsBase64(file))
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty'); return }
    setSaving(true)
    setError('')
    try {
      const payload = { name }
      if (logo !== (editing?.logo || null)) payload.logo = logo
      if (editing) {
        await request('/api/account-types', { method: 'PUT', body: JSON.stringify({ id: editing.id, ...payload }) })
        setSuccess('Account type updated')
      } else {
        await request('/api/account-types', { method: 'POST', body: JSON.stringify(payload) })
        setSuccess('Account type added')
      }
      closeModal()
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account type?')) return
    try {
      await request(`/api/account-types?id=${id}`, { method: 'DELETE' })
      setSuccess('Deleted')
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    }
  }

  const handleToggle = async (t) => {
    try {
      await request('/api/account-types', { method: 'PUT', body: JSON.stringify({ id: t.id, active: !t.active }) })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <PageShell
      title="Account Types"
      subtitle="Manage the account types shown to users in the policy order form. Drag rows to reorder."
      actions={[
        <Btn key="back" variant="outline" onClick={() => navigate('/admin/policies')}>← Back to Policies</Btn>,
        <Btn key="add" onClick={openAdd}><Plus className="h-4 w-4 mr-1 inline" />Add Account Type</Btn>,
      ]}
    >
      {error && !showModal && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">{success}</div>
      )}
      {reordering && (
        <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-500">Saving new order…</div>
      )}

      <Card>
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading...</div>
        ) : types.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400 mb-4">No account types yet.</p>
            <Btn onClick={openAdd}><Plus className="h-4 w-4 mr-1 inline" />Add First Account Type</Btn>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {types.map((t, i) => (
              <div
                key={t.id}
                draggable
                onDragStart={e => onDragStart(e, i)}
                onDragOver={e => onDragOver(e, i)}
                onDrop={onDrop}
                className="flex items-center gap-4 px-4 py-3 cursor-grab active:cursor-grabbing active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
              >
                <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />
                <div className="h-8 w-8 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {t.logo
                    ? <img src={t.logo} alt={t.name} className="h-full w-full object-contain p-0.5" />
                    : <span className="text-xs font-bold text-slate-400">{t.name?.[0]?.toUpperCase()}</span>
                  }
                </div>
                <span className={`flex-1 text-sm font-medium select-none ${t.active ? TC.text : 'text-slate-400 line-through'}`}>
                  {t.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggle(t)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    t.active
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {t.active ? 'Active' : 'Hidden'}
                </button>
                <button type="button" onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-slate-400 hover:text-blue-500 transition">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(t.id)} className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${TC.card} border ${TC.border}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-bold ${TC.text}`}>{editing ? 'Edit Account Type' : 'Add Account Type'}</h3>
              <button type="button" onClick={closeModal} className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Account Type Name</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Google Ads PRO"
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Logo / Icon</label>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    {logo
                      ? <img src={logo} alt="logo" className="h-full w-full object-contain p-1" />
                      : <span className="text-xs text-slate-400">None</span>
                    }
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-[#ff2d55] hover:text-[#ff2d55] transition"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {logo ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    {logo && (
                      <button type="button" onClick={() => setLogo(null)} className="text-xs text-slate-400 hover:text-red-500 transition text-left">
                        Remove logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3 pt-1">
                <Btn onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : (editing ? 'Save Changes' : 'Add')}
                </Btn>
                <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
