import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors } from '../shared/theme.js'
import {
  History, ChevronDown, FolderOpen, Lock, Trash2,
  Layers, Clock, Package, CheckCircle, AlertTriangle,
  XCircle, Loader, FileText, ExternalLink,
} from 'lucide-react'

const STATUS_META = {
  draft:          { label: 'Draft',          color: '#6b7280', bg: '#6b728018', border: '#6b728030', Icon: FileText },
  pending:        { label: 'Pending',         color: '#f59e0b', bg: '#f59e0b18', border: '#f59e0b40', Icon: Clock },
  building:       { label: 'Building',        color: '#3b82f6', bg: '#3b82f618', border: '#3b82f640', Icon: Loader },
  done:           { label: 'Done',            color: '#22c55e', bg: '#22c55e18', border: '#22c55e40', Icon: CheckCircle },
  rejected:       { label: 'Rejected',        color: '#ef4444', bg: '#ef444418', border: '#ef444440', Icon: XCircle },
  assets_missing: { label: 'Assets Missing',  color: '#f97316', bg: '#f9731618', border: '#f9731640', Icon: AlertTriangle },
}

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.draft
  const { Icon } = m
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 20,
      background: m.bg, border: `1px solid ${m.border}`,
      fontSize: 10, fontWeight: 700, color: m.color, flexShrink: 0,
    }}>
      <Icon size={9} />
      {m.label}
    </div>
  )
}

function DeliveryModal({ info, onClose, TC, isDark }) {
  const lines = (info || '').split('\n')
  const urlRe = /https?:\/\/[^\s]+/g
  const renderLine = (line, i) => {
    const parts = []
    let last = 0
    let m
    urlRe.lastIndex = 0
    while ((m = urlRe.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index))
      parts.push(<a key={m.index} href={m[0]} target="_blank" rel="noopener noreferrer" style={{ color: '#E8192C', fontWeight: 700, wordBreak: 'break-all' }}>{m[0]}</a>)
      last = m.index + m[0].length
    }
    if (last < line.length) parts.push(line.slice(last))
    return <div key={i} style={{ marginBottom: 4, fontSize: 13, lineHeight: 1.6, color: isDark ? '#e5e7eb' : '#1f2937' }}>{parts}</div>
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: isDark ? '#1a1a2e' : '#fff', borderRadius: 18, padding: 28, width: '100%', maxWidth: 500, boxShadow: '0 24px 60px rgba(0,0,0,.35)', border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#22c55e18', border: '1px solid #22c55e40', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={18} color="#22c55e" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: isDark ? '#f9fafb' : '#111', marginBottom: 2 }}>Structure Delivered</div>
            <div style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280' }}>Your order is complete. See details below.</div>
          </div>
        </div>
        <div style={{ background: isDark ? 'rgba(255,255,255,.04)' : '#f9fafb', border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`, borderRadius: 10, padding: '14px 16px', marginBottom: 18, maxHeight: 280, overflowY: 'auto' }}>
          {lines.map((line, i) => renderLine(line, i))}
        </div>
        <button
          onClick={onClose}
          style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: '#E8192C', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

function HistoryRow({ item, TC, isDark, onLoad, onDelete, onClose }) {
  const [hovered, setHovered] = useState(false)
  const [showDelivery, setShowDelivery] = useState(false)
  const locked = item.isLocked
  const isActive = item.isActive
  const glow = isActive ? '#E8192C' : locked ? '#3b82f6' : TC.g300

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '13px 16px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#f0f0f5'}`,
        background: isActive
          ? (isDark ? 'rgba(232,25,44,.06)' : '#fff8f8')
          : hovered
          ? (isDark ? 'rgba(255,255,255,.03)' : '#fafafe')
          : 'transparent',
        borderLeft: `3px solid ${isActive ? '#E8192C' : locked ? '#3b82f650' : 'transparent'}`,
        transition: 'background .12s',
        cursor: 'default',
      }}
    >
      {/* Top row: name + active badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 7 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: locked ? '#3b82f612' : isActive ? '#E8192C12' : (isDark ? 'rgba(255,255,255,.06)' : '#f4f4f8'),
          border: `1.5px solid ${locked ? '#3b82f630' : isActive ? '#E8192C30' : (isDark ? 'rgba(255,255,255,.1)' : '#e8e8f0')}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {locked
            ? <Lock size={13} color="#3b82f6" />
            : <FolderOpen size={14} color={isActive ? '#E8192C' : TC.g500} />
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: TC.text,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              flex: 1,
            }}>
              {item.name}
            </span>
            {isActive && (
              <span style={{
                fontSize: 9, fontWeight: 700, color: '#E8192C',
                background: '#E8192C15', border: '1px solid #E8192C30',
                padding: '1px 6px', borderRadius: 10, flexShrink: 0,
              }}>
                ACTIVE
              </span>
            )}
          </div>
          <StatusPill status={item.displayStatus} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 10, paddingLeft: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Layers size={11} color={TC.g400} />
          <span style={{ fontSize: 11, color: TC.g500 }}>{item.node_count} nodes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} color={TC.g400} />
          <span style={{ fontSize: 11, color: TC.g500 }}>
            {new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#E8192C', marginLeft: 'auto' }}>
          ${Number(item.total_price || 0).toFixed(2)}
        </span>
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: 40, gap: 6 }}>
        {item._type === 'draft' && !item.submitted && (
          <button
            onClick={() => onDelete(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px', borderRadius: 7,
              border: `1px solid ${TC.red}30`, background: `${TC.red}0a`,
              color: TC.red, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <Trash2 size={11} /> Delete
          </button>
        )}
        {/* View Delivery button — shown when order is done and has delivery info */}
        {item.displayStatus === 'done' && item.delivery_info && (
          <button
            onClick={() => setShowDelivery(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 14px', borderRadius: 7,
              border: '1px solid #22c55e50', background: '#dcfce7',
              color: '#16a34a', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <ExternalLink size={11} /> View Delivery
          </button>
        )}
        {locked ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 7,
            background: '#3b82f610', border: '1px solid #3b82f635',
            color: '#3b82f6', fontSize: 11, fontWeight: 700,
          }}>
            <Lock size={11} /> Locked while building
          </div>
        ) : item._type === 'draft' && !item.submitted ? (
          <button
            onClick={() => { onLoad(item); onClose() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 14px', borderRadius: 7,
              border: '1px solid #E8192C40', background: '#E8192C',
              color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <FolderOpen size={11} /> Open & Edit
          </button>
        ) : (
          <span style={{
            padding: '5px 12px', borderRadius: 7,
            background: isDark ? 'rgba(255,255,255,.06)' : TC.g100,
            border: `1px solid ${TC.g200}`,
            color: TC.g400, fontSize: 11, fontWeight: 600,
          }}>
            {item.displayStatus === 'done' ? 'Completed' : 'Submitted — view only'}
          </span>
        )}
      </div>
      {showDelivery && (
        <DeliveryModal info={item.delivery_info} onClose={() => setShowDelivery(false)} TC={TC} isDark={isDark} />
      )}
    </div>
  )
}

export default function StructuresHistoryDropdown({
  drafts, orders, activeDraftId, onLoad, onDelete,
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Build merged list
  const orderById = Object.fromEntries((orders || []).map(o => [String(o.id), o]))
  const draftItems = (drafts || []).map(d => {
    const linkedOrder = d.order_id ? orderById[String(d.order_id)] : null
    return {
      ...d, _type: 'draft',
      displayStatus: d.submitted ? (d.order_status || 'pending') : 'draft',
      isLocked: d.submitted && d.order_status === 'building',
      isActive: d.id === activeDraftId,
      delivery_info: linkedOrder?.delivery_info || d.delivery_info || '',
    }
  })
  const linkedOrderIds = new Set((drafts || []).filter(d => d.order_id).map(d => String(d.order_id)))
  const orphanOrders = (orders || [])
    .filter(o => !linkedOrderIds.has(String(o.id)))
    .map(o => ({
      id: `order-${o.id}`, _type: 'order',
      name: o.name, total_price: o.total_price,
      node_count: o.node_count, updated_at: o.updated_at || o.submitted_at,
      submitted: true, displayStatus: o.status,
      isLocked: o.status === 'building', isActive: false,
      delivery_info: o.delivery_info || '',
    }))
  const items = [...draftItems, ...orphanOrders]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 14px', borderRadius: 8,
          border: `1px solid ${open ? '#E8192C60' : TC.g300}`,
          background: open ? '#E8192C12' : TC.g100,
          color: open ? '#E8192C' : TC.g700,
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          transition: 'all .15s',
        }}
      >
        <History size={13} />
        Structures History
        <span style={{
          fontSize: 10, fontWeight: 800,
          background: open ? '#E8192C20' : (isDark ? 'rgba(255,255,255,.1)' : TC.g200),
          color: open ? '#E8192C' : TC.g500,
          padding: '1px 6px', borderRadius: 20,
          minWidth: 18, textAlign: 'center',
        }}>
          {items.length}
        </span>
        <ChevronDown
          size={13}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 420,
          maxHeight: '70vh',
          background: TC.card,
          borderRadius: 14,
          border: `1px solid ${TC.g200}`,
          boxShadow: isDark
            ? '0 20px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.05)'
            : '0 20px 60px rgba(0,0,0,.15), 0 4px 16px rgba(0,0,0,.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9999,
          animation: 'dropdownIn .15s cubic-bezier(.22,1,.36,1)',
        }}>
          {/* Panel header */}
          <div style={{
            padding: '14px 16px 12px',
            borderBottom: `1px solid ${TC.g200}`,
            background: isDark ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.8)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, #E8192C22, #E8192C11)',
                border: '1px solid #E8192C40',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <History size={14} color="#E8192C" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: TC.text, letterSpacing: '-0.01em' }}>Structures History</div>
                <div style={{ fontSize: 11, color: TC.g400, marginTop: 1 }}>
                  {items.length} structure{items.length !== 1 ? 's' : ''} saved
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {items.length === 0 ? (
              <div style={{
                padding: '50px 20px', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: isDark ? 'rgba(255,255,255,.05)' : TC.g100,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Package size={24} color={TC.g300} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TC.g500, marginBottom: 4 }}>
                    No structures yet
                  </div>
                  <div style={{ fontSize: 12, color: TC.g400 }}>
                    Build something and click Save to see it here
                  </div>
                </div>
              </div>
            ) : (
              items.map(item => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  TC={TC}
                  isDark={isDark}
                  onLoad={onLoad}
                  onDelete={onDelete}
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Dropdown animation */}
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
