import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors, C } from '../shared/theme.js'
import { useStore, setStore as globalSetStore } from '../shared/store.js'
import { fetchStructureOrders, updateStructureOrder } from '../lib/db.js'
import StructurePreviewModal from '../builder/StructurePreviewModal.jsx'
import {
  Layers, ShoppingBag, Building2, Search, Eye,
  Clock, CheckCircle, XCircle, ArrowRight, RefreshCw, Loader,
  AlertTriangle, Save, CheckCheck,
} from 'lucide-react'

/* ─── helpers ───────────────────────────────────────── */
async function apiGet(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString()
  const res = await fetch(`/api/crud?${qs}`)
  try { return await res.json() } catch { return [] }
}
async function apiPut(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}

/* ─── shared sub-components ─────────────────────────── */
function StatusPill({ status, map }) {
  const s = map[status] || { bg: '#f3f4f6', text: '#374151', label: status }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: s.bg, color: s.text,
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.text, flexShrink: 0 }} />
      {s.label}
    </span>
  )
}

function SectionSearch({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
      <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 10px 8px 30px', borderRadius: 8,
          border: '1px solid #e5e7eb', fontSize: 12, fontFamily: 'inherit',
          outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 20px', color: '#9ca3af' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#374151', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{subtitle}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   TAB 1 — PRE-VERIFIED ACCOUNTS ORDERS
═══════════════════════════════════════════════════ */
const PRE_STATUS = {
  pending:    { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  processing: { bg: '#dbeafe', text: '#1e40af', label: 'Processing' },
  completed:  { bg: '#d1fae5', text: '#065f46', label: 'Completed' },
  cancelled:  { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
}

function PreVerifiedTab({ TC, isDark }) {
  const [store] = useStore()
  const orders = store.orders || []
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [savingId, setSavingId] = useState(null)
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet('orders', { order: 'created_at', ascending: 'false' })
      if (Array.isArray(data) && data.length > 0)
        globalSetStore(s => ({ ...s, orders: data }))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (o.id || '').toLowerCase().includes(q) ||
      (o.user_email || o.user || '').toLowerCase().includes(q) ||
      (o.platform || '').toLowerCase().includes(q)
  })

  const updateStatus = async (id, status) => {
    setSavingId(id)
    try {
      await apiPut('orders', { id, status })
      globalSetStore(s => ({ ...s, orders: s.orders.map(o => o.id === id ? { ...o, status } : o) }))
    } catch (e) { alert(e.message) } finally { setSavingId(null) }
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          ['Total', orders.length, '#3b82f6'],
          ['Completed', orders.filter(o => o.status === 'completed').length, '#10b981'],
          ['Processing', orders.filter(o => o.status === 'processing').length, '#f59e0b'],
          ['Pending', orders.filter(o => o.status === 'pending').length, '#ef4444'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: TC.card, border: `1px solid ${TC.g200}`, borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: TC.g400, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <SectionSearch value={search} onChange={setSearch} placeholder="Search by ID, user, platform…" />
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'pending', 'processing', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${filter === s ? '#E8192C' : TC.g300}`,
              background: filter === s ? '#fef2f3' : TC.g100,
              color: filter === s ? '#E8192C' : TC.g600,
              textTransform: 'capitalize',
            }}>{s}</button>
          ))}
        </div>
        <button onClick={refetch} disabled={loading} style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 7, border: `1px solid ${TC.g300}`,
          background: TC.g100, color: TC.g600, fontSize: 11, fontWeight: 700, cursor: 'pointer',
        }}>
          {loading ? <Loader size={12} /> : <RefreshCw size={12} />} Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ background: TC.card, border: `1px solid ${TC.g200}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '140px 1.5fr 100px 100px 110px 160px',
          padding: '12px 20px', background: isDark ? 'rgba(255,255,255,.03)' : TC.g50,
          borderBottom: `1px solid ${TC.g200}`,
        }}>
          {['Order ID', 'User', 'Platform', 'Amount', 'Status', 'Actions'].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 800, color: TC.g400, textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</div>
          ))}
        </div>

        {loading && <div style={{ padding: '32px', textAlign: 'center', color: TC.g400, fontSize: 13 }}>Loading orders…</div>}
        {!loading && filtered.length === 0 && <EmptyState icon="📦" title="No orders found" subtitle="Orders will appear here once users make purchases." />}

        {filtered.map((o, i) => (
          <div key={o.id} className="reveal-item" style={{
            display: 'grid', gridTemplateColumns: '140px 1.5fr 100px 100px 110px 160px',
            padding: '13px 20px', alignItems: 'center',
            borderBottom: i < filtered.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,.04)' : TC.g100}` : 'none',
            animationDelay: `${i * 45}ms`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TC.text, fontFamily: 'monospace' }}>{o.id}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: TC.text }}>{o.user_email || o.user || '—'}</div>
              <div style={{ fontSize: 11, color: TC.g400 }}>{o.date || ''}</div>
            </div>
            <div style={{ fontSize: 12, color: TC.g600 }}>{o.platform || '—'}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#E8192C' }}>${o.amount || 0}</div>
            <StatusPill status={o.status || 'pending'} map={PRE_STATUS} />
            <select
              value={o.status || 'pending'}
              disabled={savingId === o.id}
              onChange={e => updateStatus(o.id, e.target.value)}
              style={{
                fontSize: 11, borderRadius: 6, border: `1px solid ${TC.g300}`,
                padding: '5px 8px', background: TC.card, color: TC.text,
                fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   TAB 2 — AGENCY AD ACCOUNTS
═══════════════════════════════════════════════════ */
const AGENCY_STATUS = {
  pending:   { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  in_review: { bg: '#dbeafe', text: '#1e40af', label: 'In Review' },
  approved:  { bg: '#d1fae5', text: '#065f46', label: 'Approved' },
  rejected:  { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' },
}

function AgencyTab({ TC, isDark }) {
  const [store] = useStore()
  const requests = store.adAccountRequests || []
  const users = store.users || []
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [savingId, setSavingId] = useState(null)
  const [detail, setDetail] = useState(null)

  const getUserEmail = (userId) => {
    const u = users.find(u => u.id === userId)
    return u ? (u.email || u.name) : (userId || '—')
  }

  const filtered = requests.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (r.account_name || r.accountName || '').toLowerCase().includes(q) ||
      (r.platform || '').toLowerCase().includes(q) ||
      getUserEmail(r.user_id).toLowerCase().includes(q)
  })

  const updateStatus = async (id, status) => {
    setSavingId(id)
    try {
      await apiPut('ad_account_requests', { id, status })
      globalSetStore(s => ({
        ...s,
        adAccountRequests: s.adAccountRequests.map(r => r.id === id ? { ...r, status } : r)
      }))
    } catch (e) { alert(e.message) } finally { setSavingId(null) }
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          ['Total Requests', requests.length, '#3b82f6'],
          ['Pending', requests.filter(r => r.status === 'pending').length, '#f59e0b'],
          ['In Review', requests.filter(r => r.status === 'in_review').length, '#8b5cf6'],
          ['Approved', requests.filter(r => r.status === 'approved').length, '#10b981'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: TC.card, border: `1px solid ${TC.g200}`, borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: TC.g400, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <SectionSearch value={search} onChange={setSearch} placeholder="Search by account, platform, user…" />
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'pending', 'in_review', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${filter === s ? '#E8192C' : TC.g300}`,
              background: filter === s ? '#fef2f3' : TC.g100,
              color: filter === s ? '#E8192C' : TC.g600,
              textTransform: 'capitalize',
            }}>{s === 'in_review' ? 'In Review' : s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: TC.card, border: `1px solid ${TC.g200}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 110px 120px 110px 180px',
          padding: '12px 20px', background: isDark ? 'rgba(255,255,255,.03)' : TC.g50,
          borderBottom: `1px solid ${TC.g200}`,
        }}>
          {['Account Name', 'User', 'Platform', 'Business Type', 'Status', 'Actions'].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 800, color: TC.g400, textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 && <EmptyState icon="◧" title="No agency account requests" subtitle="Requests will appear here once users submit them." />}

        {filtered.map((r, i) => (
          <div key={r.id} className="reveal-item" style={{
            display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 110px 120px 110px 180px',
            padding: '13px 20px', alignItems: 'center',
            borderBottom: i < filtered.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,.04)' : TC.g100}` : 'none',
            animationDelay: `${i * 45}ms`,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TC.text }}>{r.account_name || r.accountName || '—'}</div>
              <div style={{ fontSize: 11, color: TC.g400 }}>{r.requestId || r.id}</div>
            </div>
            <div style={{ fontSize: 12, color: TC.g500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getUserEmail(r.user_id)}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: TC.g700 }}>{r.platform || '—'}</div>
            <div style={{ fontSize: 11, color: TC.g500 }}>{r.business_type || r.businessType || '—'}</div>
            <StatusPill status={r.status || 'pending'} map={AGENCY_STATUS} />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select
                value={r.status || 'pending'}
                disabled={savingId === r.id}
                onChange={e => updateStatus(r.id, e.target.value)}
                style={{
                  fontSize: 11, borderRadius: 6, border: `1px solid ${TC.g300}`,
                  padding: '5px 8px', background: TC.card, color: TC.text,
                  fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={() => setDetail(r)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '5px 10px', borderRadius: 6,
                  border: `1px solid ${TC.g300}`, background: TC.g100,
                  color: TC.g600, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Eye size={11} /> View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {detail && (
        <div onClick={() => setDetail(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
          backdropFilter: 'blur(4px)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: TC.card, borderRadius: 16, border: `1px solid ${TC.g200}`,
            boxShadow: '0 24px 64px rgba(0,0,0,.25)',
            width: 520, maxWidth: '92vw', maxHeight: '85vh',
            overflow: 'auto', padding: 28,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: TC.text }}>Request Details</div>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: TC.g400 }}>✕</button>
            </div>
            {[
              ['Account Name', detail.account_name || detail.accountName],
              ['Platform', detail.platform],
              ['Business Name', detail.business_name || detail.businessName],
              ['Business Type', detail.business_type || detail.businessType],
              ['Email', detail.business_email || detail.email],
              ['BM ID', detail.bm_id || detail.bmId],
              ['Page Links', detail.page_links || detail.pageLinks],
              ['Status', detail.status],
              ['Submitted', detail.submitted_at ? new Date(detail.submitted_at).toLocaleString() : '—'],
            ].map(([k, v]) => v ? (
              <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: TC.g500, minWidth: 120 }}>{k}</span>
                <span style={{ color: TC.text, wordBreak: 'break-all' }}>{v}</span>
              </div>
            ) : null)}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   TAB 3 — STRUCTURE BUILDING ORDERS
═══════════════════════════════════════════════════ */
const STRUCT_STATUS = {
  pending:        { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  building:       { bg: '#dbeafe', text: '#1e40af', label: 'Building' },
  done:           { bg: '#d1fae5', text: '#065f46', label: 'Done' },
  rejected:       { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' },
  assets_missing: { bg: '#fce7f3', text: '#be185d', label: 'Assets Missing' },
}

function StructureTab({ TC, isDark }) {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [previewOrder, setPreviewOrder] = useState(null)
  const [error, setError] = useState('')
  const [draftNotes, setDraftNotes] = useState({})
  const [savedNotes, setSavedNotes] = useState({})
  const [draftDelivery, setDraftDelivery] = useState({})
  const [savedDelivery, setSavedDelivery] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchStructureOrders(false)
      if (res?.orders) {
        setOrders(res.orders)
        // seed draftNotes from existing admin_notes
        const seeds = {}
        const deliverySeeds = {}
        for (const o of res.orders) {
          if (o.admin_notes) seeds[o.id] = o.admin_notes
          if (o.delivery_info) deliverySeeds[o.id] = o.delivery_info
        }
        setDraftNotes(prev => ({ ...seeds, ...prev }))
        setDraftDelivery(prev => ({ ...deliverySeeds, ...prev }))
      }
    } catch (e) {
      setError('Failed to load: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const changeStatus = async (id, status) => {
    setSavingId(id)
    try {
      await updateStructureOrder(id, { status })
      setOrders(prev => prev.map(o => String(o.id) === String(id) ? { ...o, status } : o))
      if (status === 'assets_missing') {
        const order = orders.find(o => String(o.id) === String(id))
        setDraftNotes(prev => ({
          ...prev,
          [id]: prev[id] !== undefined ? prev[id] : (order?.admin_notes || ''),
        }))
      }
      if (status === 'done') {
        const order = orders.find(o => String(o.id) === String(id))
        setDraftDelivery(prev => ({
          ...prev,
          [id]: prev[id] !== undefined ? prev[id] : (order?.delivery_info || ''),
        }))
      }
    } catch (e) { alert(e.message) } finally { setSavingId(null) }
  }

  const saveDelivery = async (id) => {
    const text = draftDelivery[id] || ''
    try {
      await updateStructureOrder(id, { delivery_info: text })
      setOrders(prev => prev.map(o => String(o.id) === String(id) ? { ...o, delivery_info: text } : o))
      setSavedDelivery(prev => ({ ...prev, [id]: true }))
      setTimeout(() => setSavedDelivery(prev => ({ ...prev, [id]: false })), 2500)
    } catch (e) { alert('Failed to save delivery info: ' + e.message) }
  }

  const saveNote = async (id) => {
    const text = draftNotes[id] || ''
    try {
      await updateStructureOrder(id, { admin_notes: text })
      setOrders(prev => prev.map(o => String(o.id) === String(id) ? { ...o, admin_notes: text } : o))
      setSavedNotes(prev => ({ ...prev, [id]: true }))
      setTimeout(() => setSavedNotes(prev => ({ ...prev, [id]: false })), 2500)
    } catch (e) { alert('Failed to save note: ' + e.message) }
  }

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (o.order_code || '').toLowerCase().includes(q) ||
      (o.user_name || '').toLowerCase().includes(q) ||
      (o.user_email || '').toLowerCase().includes(q) ||
      (o.name || '').toLowerCase().includes(q)
  })

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          ['Total', orders.length, '#3b82f6'],
          ['Pending', orders.filter(o => o.status === 'pending').length, '#f59e0b'],
          ['Building', orders.filter(o => o.status === 'building').length, '#3b82f6'],
          ['Done', orders.filter(o => o.status === 'done').length, '#10b981'],
          ['Rejected', orders.filter(o => o.status === 'rejected' || o.status === 'assets_missing').length, '#ef4444'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: TC.card, border: `1px solid ${TC.g200}`, borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: TC.g400, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: 10, marginBottom: 14, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <SectionSearch value={search} onChange={setSearch} placeholder="Search by code, customer, structure name…" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'pending', 'building', 'done', 'rejected', 'assets_missing'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${filter === s ? '#E8192C' : TC.g300}`,
              background: filter === s ? '#fef2f3' : TC.g100,
              color: filter === s ? '#E8192C' : TC.g600,
            }}>
              {s === 'assets_missing' ? 'Assets Missing' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={load} disabled={loading} style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 7, border: `1px solid ${TC.g300}`,
          background: TC.g100, color: TC.g600, fontSize: 11, fontWeight: 700, cursor: 'pointer',
        }}>
          {loading ? <Loader size={12} /> : <RefreshCw size={12} />} Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ background: TC.card, border: `1px solid ${TC.g200}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '140px 1.4fr 1.2fr 100px 90px 150px 100px',
          padding: '12px 20px', background: isDark ? 'rgba(255,255,255,.03)' : TC.g50,
          borderBottom: `1px solid ${TC.g200}`,
        }}>
          {['Order Code', 'Customer', 'Structure', 'Assets', 'Price', 'Status', 'Actions'].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 800, color: TC.g400, textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</div>
          ))}
        </div>

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: TC.g400, fontSize: 13 }}>
            <Loader size={22} style={{ marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
            Loading structure orders…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <EmptyState icon="📐" title="No structure orders yet" subtitle="Orders will appear here once users submit from the builder." />
        )}

        {filtered.map((o, i) => {
          const isLast = i === filtered.length - 1
          const isMissing = o.status === 'assets_missing'
          const isDone = o.status === 'done'
          const noteSaved = savedNotes[o.id]
          const noteText = draftNotes[o.id] !== undefined ? draftNotes[o.id] : (o.admin_notes || '')
          const deliveryText = draftDelivery[o.id] !== undefined ? draftDelivery[o.id] : (o.delivery_info || '')
          const deliverySaved = savedDelivery[o.id]

          return (
            <div key={o.id} style={{ borderBottom: isLast ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,.04)' : TC.g100}` }}>
              {/* Main row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '140px 1.4fr 1.2fr 100px 90px 150px 100px',
                padding: '14px 20px', alignItems: 'center',
              }}>
                {/* Order code */}
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: TC.text }}>{o.order_code}</div>
                  <div style={{ fontSize: 10, color: TC.g400, marginTop: 2 }}>
                    {o.submitted_at ? new Date(o.submitted_at).toLocaleDateString() : '—'}
                  </div>
                </div>
                {/* Customer */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TC.text }}>{o.user_name || 'Unknown'}</div>
                  <div style={{ fontSize: 11, color: TC.g400 }}>{o.user_email || ''}</div>
                </div>
                {/* Structure name */}
                <div style={{ fontSize: 12, fontWeight: 600, color: TC.g700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                  {o.name || 'Untitled'}
                </div>
                {/* Assets count */}
                <div style={{ fontSize: 11, color: TC.g500 }}>
                  {o.node_count || 0} nodes<br />
                  {o.edge_count || 0} edges
                </div>
                {/* Price */}
                <div style={{ fontSize: 14, fontWeight: 900, color: '#E8192C' }}>
                  ${Number(o.total_price || 0).toFixed(2)}
                </div>
                {/* Status dropdown */}
                <select
                  value={o.status || 'pending'}
                  disabled={savingId === o.id}
                  onChange={e => changeStatus(o.id, e.target.value)}
                  style={{
                    padding: '6px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    border: `1px solid ${STRUCT_STATUS[o.status]?.text || TC.g300}30`,
                    background: STRUCT_STATUS[o.status]?.bg || TC.g100,
                    color: STRUCT_STATUS[o.status]?.text || TC.g600,
                    fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="building">Building</option>
                  <option value="done">Done</option>
                  <option value="rejected">Rejected</option>
                  <option value="assets_missing">Assets Missing</option>
                </select>
                {/* View button */}
                <button
                  onClick={() => setPreviewOrder(o)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '7px 12px', borderRadius: 8,
                    border: `1px solid ${TC.g300}`, background: TC.g100,
                    color: TC.g700, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <Eye size={12} /> View
                </button>
              </div>

              {/* ── Done — delivery info panel ── */}
              {isDone && (
                <div style={{
                  margin: '0 20px 16px',
                  background: isDark ? 'rgba(209,250,229,.04)' : '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 10,
                  padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <CheckCircle size={14} color="#16a34a" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#15803d' }}>
                      Delivery Info — visible to the client when they check their order
                    </span>
                  </div>
                  <textarea
                    value={deliveryText}
                    onChange={e => setDraftDelivery(prev => ({ ...prev, [o.id]: e.target.value }))}
                    placeholder={'Paste links, credentials, or instructions for the client.\n\nExample:\nBM Invite: https://business.facebook.com/...\nNote: Accept the invite within 48h.'}
                    rows={4}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '10px 12px', borderRadius: 8,
                      border: '1px solid #86efac',
                      background: isDark ? 'rgba(255,255,255,.06)' : '#fff',
                      color: TC.text, fontSize: 12, fontFamily: 'inherit',
                      resize: 'vertical', outline: 'none', lineHeight: 1.6,
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    {deliverySaved ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#15803d', fontWeight: 700 }}>
                        <CheckCheck size={13} /> Saved — client can now view this
                      </span>
                    ) : o.delivery_info ? (
                      <span style={{ fontSize: 11, color: TC.g400 }}>
                        Saved: {o.delivery_info.slice(0, 60)}{o.delivery_info.length > 60 ? '…' : ''}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: TC.g400 }}>No delivery info saved yet</span>
                    )}
                    <button
                      onClick={() => saveDelivery(o.id)}
                      disabled={!deliveryText.trim()}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 16px', borderRadius: 8, border: 'none',
                        background: deliveryText.trim() ? '#16a34a' : '#e5e7eb',
                        color: deliveryText.trim() ? '#fff' : '#9ca3af',
                        fontSize: 12, fontWeight: 700,
                        cursor: deliveryText.trim() ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit',
                      }}
                    >
                      <Save size={12} /> Save & Send to Client
                    </button>
                  </div>
                </div>
              )}

              {/* ── Missing assets note panel (only when status = assets_missing) ── */}
              {isMissing && (
                <div style={{
                  margin: '0 20px 16px',
                  background: isDark ? 'rgba(252,231,243,.06)' : '#fdf2f8',
                  border: '1px solid #f9a8d4',
                  borderRadius: 10,
                  padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <AlertTriangle size={14} color="#be185d" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#be185d' }}>
                      Missing Assets — describe what the user needs to provide
                    </span>
                  </div>
                  <textarea
                    value={noteText}
                    onChange={e => setDraftNotes(prev => ({ ...prev, [o.id]: e.target.value }))}
                    placeholder="e.g. Profile x3, BM Verified x1, Advertiser Account x2…"
                    rows={3}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '10px 12px', borderRadius: 8,
                      border: '1px solid #f9a8d4',
                      background: isDark ? 'rgba(255,255,255,.06)' : '#fff',
                      color: TC.text, fontSize: 12, fontFamily: 'inherit',
                      resize: 'vertical', outline: 'none', lineHeight: 1.6,
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    {o.admin_notes && !noteSaved && (
                      <span style={{ fontSize: 11, color: TC.g400 }}>
                        Last saved: {o.admin_notes.slice(0, 60)}{o.admin_notes.length > 60 ? '…' : ''}
                      </span>
                    )}
                    {noteSaved && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#065f46', fontWeight: 700 }}>
                        <CheckCheck size={13} /> Note saved — user will see this
                      </span>
                    )}
                    {!o.admin_notes && !noteSaved && <span />}
                    <button
                      onClick={() => saveNote(o.id)}
                      disabled={!noteText.trim()}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 16px', borderRadius: 8,
                        border: 'none',
                        background: noteText.trim() ? '#be185d' : '#e5e7eb',
                        color: noteText.trim() ? '#fff' : '#9ca3af',
                        fontSize: 12, fontWeight: 700, cursor: noteText.trim() ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit',
                      }}
                    >
                      <Save size={12} /> Save Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <StructurePreviewModal
        isOpen={!!previewOrder}
        onClose={() => setPreviewOrder(null)}
        order={previewOrder}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
const TABS = [
  { key: 'preverified', label: 'Pre-Verified Accounts', icon: ShoppingBag },
  { key: 'agency',      label: 'Agency Ad Accounts',    icon: Building2 },
  { key: 'structure',   label: 'Structure Building',     icon: Layers },
]

export default function AdminAllOrdersPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)
  const [store] = useStore()
  const [activeTab, setActiveTab] = useState('structure')

  const counts = {
    preverified: (store.orders || []).length,
    agency:      (store.adAccountRequests || []).length,
    structure:   (store.structureOrders || []).length,
  }

  return (
    <div style={{ padding: '24px 28px', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", minHeight: '100%' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: TC.text, margin: 0 }}>Orders</h1>
        <p style={{ fontSize: 13, color: TC.g500, margin: '4px 0 0' }}>
          Manage all order types from one place
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4,
        borderBottom: `2px solid ${TC.g200}`,
        marginBottom: 24,
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 20px',
                border: 'none',
                borderBottom: `3px solid ${active ? '#E8192C' : 'transparent'}`,
                marginBottom: -2,
                background: 'transparent',
                color: active ? '#E8192C' : TC.g500,
                fontSize: 13, fontWeight: active ? 800 : 500,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all .15s',
              }}
            >
              <Icon size={15} />
              {tab.label}
              {counts[tab.key] > 0 && (
                <span style={{
                  background: active ? '#E8192C' : TC.g200,
                  color: active ? '#fff' : TC.g600,
                  fontSize: 10, fontWeight: 800,
                  padding: '1px 7px', borderRadius: 20,
                  minWidth: 18, textAlign: 'center',
                }}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'preverified' && <PreVerifiedTab TC={TC} isDark={isDark} />}
      {activeTab === 'agency'      && <AgencyTab      TC={TC} isDark={isDark} />}
      {activeTab === 'structure'   && <StructureTab   TC={TC} isDark={isDark} />}
    </div>
  )
}
