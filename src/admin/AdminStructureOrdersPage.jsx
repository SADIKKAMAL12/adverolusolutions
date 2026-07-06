import { useState, useEffect } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors } from '../shared/theme.js'
import { useStore, setStore } from '../shared/store.js'
import { fetchStructureOrders, updateStructureOrder } from '../lib/db.js'
import { FileStack, Eye, CheckCircle, XCircle, Clock, ArrowRight, Search, Loader, Send } from 'lucide-react'
import StructurePreviewModal from '../builder/StructurePreviewModal.jsx'

const STATUS_BADGE = {
  pending:        { bg: '#fef3c7', text: '#92400e', icon: Clock },
  building:       { bg: '#dbeafe', text: '#1e40af', icon: ArrowRight },
  done:           { bg: '#d1fae5', text: '#065f46', icon: CheckCircle },
  rejected:       { bg: '#fee2e2', text: '#991b1b', icon: XCircle },
  assets_missing: { bg: '#fce7f3', text: '#be185d', icon: Clock },
}

export default function AdminStructureOrdersPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)
  const [store] = useStore()
  const [orders, setOrders] = useState(store.structureOrders || [])
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewOrder, setPreviewOrder] = useState(null)
  const [deliveryOrder, setDeliveryOrder] = useState(null)
  const [deliveryText, setDeliveryText] = useState('')
  const [savingDelivery, setSavingDelivery] = useState(false)

  // Fetch orders from API
  useEffect(() => {
    setLoading(true)
    fetchStructureOrders(false) // admin = false means fetch all
      .then(res => {
        if (res?.orders) {
          setOrders(res.orders)
          setStore(s => ({ ...s, structureOrders: res.orders }))
        }
      })
      .catch(err => {
        console.error('Failed to fetch structure orders:', err)
        setError('Failed to load orders. ' + err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'done') {
      // Auto-open delivery info modal instead of saving immediately
      const order = orders.find(o => o.id === id) || { id }
      setDeliveryOrder({ ...order, _pendingStatus: 'done' })
      setDeliveryText(order.delivery_info || '')
      return
    }
    try {
      await updateStructureOrder(id, { status: newStatus })
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
      setStore(s => ({
        ...s,
        structureOrders: (s.structureOrders || []).map(o => o.id === id ? { ...o, status: newStatus } : o)
      }))
    } catch (err) {
      alert('Failed to update status: ' + err.message)
    }
  }

  const openDelivery = (order) => {
    setDeliveryOrder(order)
    setDeliveryText(order.delivery_info || '')
  }

  const saveDelivery = async (skipInfo = false) => {
    if (!deliveryOrder) return
    setSavingDelivery(true)
    const isMarkingDone = !!deliveryOrder._pendingStatus
    try {
      const updates = {}
      if (isMarkingDone) updates.status = 'done'
      if (!skipInfo) updates.delivery_info = deliveryText
      await updateStructureOrder(deliveryOrder.id, updates)
      const updated = { ...deliveryOrder, ...updates }
      delete updated._pendingStatus
      setOrders(prev => prev.map(o => o.id === deliveryOrder.id ? updated : o))
      setStore(s => ({
        ...s,
        structureOrders: (s.structureOrders || []).map(o => o.id === deliveryOrder.id ? updated : o)
      }))
      setDeliveryOrder(null)
    } catch (err) {
      alert('Failed to save: ' + err.message)
    } finally {
      setSavingDelivery(false)
    }
  }

  const filtered = orders.filter(o => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      return o.order_code?.toLowerCase().includes(q)
        || o.user_name?.toLowerCase().includes(q)
        || o.name?.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div style={{ padding: '24px 28px', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: TC.text, margin: 0 }}>Structure Orders</h1>
          <p style={{ fontSize: 13, color: TC.g500, margin: '4px 0 0' }}>Review and manage agency structure orders</p>
        </div>
        <div style={{
          background: `${TC.primary}10`, border: `1px solid ${TC.primary}25`,
          borderRadius: 10, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <FileStack size={16} color={TC.primary} />
          <span style={{ fontSize: 13, fontWeight: 700, color: TC.primary }}>{orders.length} orders</span>
        </div>
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

      {/* Filters */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        padding: '12px 16px', background: TC.card, borderRadius: 12,
        border: `1px solid ${TC.g200}`,
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={14} color={TC.g400} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders..."
            style={{
              width: '100%', padding: '8px 10px 8px 32px', borderRadius: 8,
              border: `1px solid ${TC.g300}`, background: TC.card,
              color: TC.text, fontSize: 13, fontFamily: "inherit",
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'pending', 'building', 'done', 'rejected', 'assets_missing'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '7px 14px', borderRadius: 8,
                border: `1px solid ${filterStatus === s ? TC.primary : TC.g300}`,
                background: filterStatus === s ? `${TC.primary}15` : TC.g100,
                color: filterStatus === s ? TC.primary : TC.g600,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s === 'assets_missing' ? 'Assets Missing' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: TC.card, borderRadius: 14,
        border: `1px solid ${TC.g200}`, overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1fr 140px',
          padding: '14px 20px', background: isDark ? 'rgba(255,255,255,.03)' : TC.g50,
          borderBottom: `1px solid ${TC.g200}`,
        }}>
          {['Order ID', 'Customer', 'Structure', 'Total', 'Status', 'Actions'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 800, color: TC.g500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {h}
            </div>
          ))}
        </div>

        {loading && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: TC.g400 }}>
            <Loader size={24} className="spin" style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }} />
            Loading orders...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: TC.g400, fontSize: 13 }}>
            No orders match your filters
          </div>
        )}

        {filtered.map((order, i) => {
          const status = STATUS_BADGE[order.status] || STATUS_BADGE.pending
          const StatusIcon = status.icon
          return (
            <div key={order.id} className="reveal-item" style={{
              display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1fr 140px',
              padding: '14px 20px', alignItems: 'center',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : TC.g100}`,
              animationDelay: `${i * 45}ms`,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TC.text }}>{order.order_code}</div>
                <div style={{ fontSize: 11, color: TC.g500, marginTop: 2 }}>
                  {order.submitted_at ? new Date(order.submitted_at).toLocaleDateString() : '-'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TC.text }}>{order.user_name || 'Unknown'}</div>
                <div style={{ fontSize: 11, color: TC.g500, marginTop: 2 }}>{order.user_email || ''}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TC.text }}>{order.name}</div>
                <div style={{ fontSize: 11, color: TC.g500, marginTop: 2 }}>{order.node_count} nodes · {order.edge_count} edges</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: TC.primary }}>
                ${Number(order.total_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div>
                <select
                  value={order.status}
                  onChange={e => handleStatusChange(order.id, e.target.value)}
                  style={{
                    padding: '5px 10px', borderRadius: 8,
                    border: `1px solid ${status.bg}`, background: status.bg,
                    color: status.text, fontSize: 11, fontWeight: 700,
                    fontFamily: "inherit", cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="building">Building</option>
                  <option value="done">Done</option>
                  <option value="rejected">Rejected</option>
                  <option value="assets_missing">Assets Missing</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPreviewOrder(order)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 8,
                    border: `1px solid ${TC.g300}`, background: TC.g100,
                    color: TC.g700, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Eye size={12} /> View
                </button>
                <button
                  onClick={() => openDelivery(order)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 8,
                    border: `1px solid ${order.delivery_info ? '#22c55e50' : TC.g300}`,
                    background: order.delivery_info ? '#dcfce7' : TC.g100,
                    color: order.delivery_info ? '#16a34a' : TC.g500,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                  title={order.delivery_info ? 'Edit delivery info' : 'Add delivery info'}
                >
                  <Send size={12} />
                  {order.delivery_info ? 'Delivery ✓' : 'Delivery'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Preview Modal */}
      <StructurePreviewModal
        isOpen={!!previewOrder}
        onClose={() => setPreviewOrder(null)}
        order={previewOrder}
      />

      {/* Delivery Info Modal */}
      {deliveryOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 32, width: '100%', maxWidth: 540, boxShadow: '0 24px 60px rgba(0,0,0,.25)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#dcfce7', border: '1px solid #22c55e40', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={20} color="#16a34a" />
              </div>
              <div>
                <h2 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 800, color: '#111' }}>
                  {deliveryOrder._pendingStatus ? 'Mark as Done — Add Delivery Info' : 'Edit Delivery Info'}
                </h2>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                  {deliveryOrder.order_code} · {deliveryOrder.user_name} — the user will see this when they check their order.
                </p>
              </div>
            </div>
            <textarea
              value={deliveryText}
              onChange={e => setDeliveryText(e.target.value)}
              placeholder={'Paste links, credentials, or instructions for the client.\n\nExample:\nBM Invite Link: https://business.facebook.com/...\nBackup Admin: admin@example.com\nNote: Accept the invite within 48h.'}
              rows={8}
              autoFocus
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10, boxSizing: 'border-box',
                border: '1.5px solid #e5e7eb', fontSize: 13, lineHeight: 1.7,
                fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                color: '#111', background: '#fafafa',
              }}
              onFocus={e => { e.target.style.borderColor = '#22c55e' }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {deliveryOrder._pendingStatus ? (
                <>
                  <button
                    onClick={() => setDeliveryOrder(null)}
                    style={{ padding: '9px 18px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveDelivery(true)}
                    disabled={savingDelivery}
                    style={{ padding: '9px 18px', borderRadius: 9, border: '1.5px solid #d1fae5', background: '#f0fdf4', color: '#15803d', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Mark Done (no info)
                  </button>
                  <button
                    onClick={() => saveDelivery(false)}
                    disabled={savingDelivery || !deliveryText.trim()}
                    style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: deliveryText.trim() ? '#16a34a' : '#d1d5db', color: '#fff', fontSize: 13, fontWeight: 700, cursor: deliveryText.trim() ? 'pointer' : 'default', fontFamily: 'inherit', opacity: savingDelivery ? 0.7 : 1 }}
                  >
                    {savingDelivery ? 'Saving…' : 'Mark Done + Send Info'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setDeliveryOrder(null)}
                    style={{ padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveDelivery(false)}
                    disabled={savingDelivery}
                    style={{ padding: '9px 24px', borderRadius: 9, border: 'none', background: '#E8192C', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: savingDelivery ? 0.7 : 1 }}
                  >
                    {savingDelivery ? 'Saving…' : 'Save Delivery Info'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
