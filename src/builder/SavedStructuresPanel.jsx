import { useState } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors } from '../shared/theme.js'
import { FolderOpen, Trash2, Clock, Layers, ChevronUp, ChevronDown, Package, Plus, Lock, CheckCircle, AlertTriangle, Loader, XCircle } from 'lucide-react'

const STATUS_META = {
  draft:          { label: 'Draft',          color: '#6b7280', bg: '#6b728015', border: '#6b728030' },
  pending:        { label: 'Pending',         color: '#f59e0b', bg: '#f59e0b15', border: '#f59e0b40' },
  building:       { label: 'Building',        color: '#3b82f6', bg: '#3b82f615', border: '#3b82f640' },
  done:           { label: 'Done',            color: '#22c55e', bg: '#22c55e15', border: '#22c55e40' },
  rejected:       { label: 'Rejected',        color: '#ef4444', bg: '#ef444415', border: '#ef444440' },
  assets_missing: { label: 'Assets Missing',  color: '#f97316', bg: '#f9731615', border: '#f9731640' },
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.draft
  const Icon = status === 'done' ? CheckCircle
    : status === 'building' ? Loader
    : status === 'rejected' ? XCircle
    : status === 'assets_missing' ? AlertTriangle
    : status === 'pending' ? Clock
    : Package
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 20,
      background: m.bg, border: `1px solid ${m.border}`,
      fontSize: 10, fontWeight: 700, color: m.color,
      flexShrink: 0,
    }}>
      <Icon size={9} />
      {m.label}
    </div>
  )
}

export default function SavedStructuresPanel({
  drafts, orders, onLoad, onDelete, onNew, activeDraftId,
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)
  const [collapsed, setCollapsed] = useState(false)

  // Build merged history list
  // drafts already have order_status if submitted
  const LOCKED_STATUSES = new Set(['building', 'done', 'completed', 'review', 'in_review'])

  const draftItems = (drafts || []).map(d => ({
    ...d,
    _type: 'draft',
    displayStatus: d.submitted ? (d.order_status || 'pending') : 'draft',
    isLocked: d.submitted && LOCKED_STATUSES.has(d.order_status),
    isEditable: !d.submitted || (!LOCKED_STATUSES.has(d.order_status)),
    isActive: d.id === activeDraftId,
  }))

  // Orphan orders (no linked draft found)
  const linkedOrderIds = new Set((drafts || []).filter(d => d.order_id).map(d => String(d.order_id)))
  const orphanOrders = (orders || [])
    .filter(o => !linkedOrderIds.has(String(o.id)))
    .map(o => ({
      id: `order-${o.id}`,
      _type: 'order',
      name: o.name,
      total_price: o.total_price,
      node_count: o.node_count,
      edge_count: o.edge_count,
      nodes_json: o.nodes_json,
      edges_json: o.edges_json,
      updated_at: o.updated_at || o.submitted_at,
      submitted: true,
      order_status: o.status,
      displayStatus: o.status,
      isLocked: LOCKED_STATUSES.has(o.status),
      isEditable: !LOCKED_STATUSES.has(o.status),
      isActive: false,
    }))

  const allItems = [...draftItems, ...orphanOrders]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))

  return (
    <div style={{
      background: TC.card,
      borderTop: `1px solid ${TC.g200}`,
      flexShrink: 0,
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 18px', userSelect: 'none',
      }}>
        <div
          onClick={() => setCollapsed(c => !c)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1 }}
        >
          <FolderOpen size={16} color={TC.primary} />
          <span style={{ fontSize: 13, fontWeight: 800, color: TC.text }}>
            Structure History
          </span>
          <span style={{
            fontSize: 11, color: TC.g500,
            background: isDark ? 'rgba(255,255,255,.06)' : TC.g100,
            padding: '2px 10px', borderRadius: 20,
          }}>
            {allItems.length}
          </span>
          {collapsed ? <ChevronUp size={16} color={TC.g500} /> : <ChevronDown size={16} color={TC.g500} />}
        </div>

        {/* New Structure button */}
        <button
          onClick={onNew}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 8,
            border: '1px solid #22c55e40', background: '#22c55e12',
            color: '#22c55e', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#22c55e22' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#22c55e12' }}
        >
          <Plus size={11} />
          New Structure
        </button>
      </div>

      {/* Cards */}
      {!collapsed && (
        <div style={{
          display: 'flex', gap: 12,
          padding: '0 18px 14px',
          overflowX: 'auto',
        }}>
          {allItems.length === 0 && (
            <div style={{
              padding: '20px 10px', color: TC.g400, fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Package size={14} />
              No saved structures yet. Build something and hit Save.
            </div>
          )}

          {allItems.map(item => {
            const locked = item.isLocked
            const isActive = item.isActive

            return (
              <div
                key={item.id}
                style={{
                  minWidth: 230,
                  maxWidth: 270,
                  padding: '13px 15px',
                  borderRadius: 12,
                  background: isActive
                    ? (isDark ? `rgba(232,25,44,.08)` : `#fef2f3`)
                    : locked
                    ? (isDark ? 'rgba(255,255,255,.02)' : '#fafafa')
                    : (isDark ? 'rgba(255,255,255,.03)' : TC.g50),
                  border: isActive
                    ? `1px solid #E8192C40`
                    : locked
                    ? `1px solid ${isDark ? 'rgba(255,255,255,.05)' : TC.g200}`
                    : `1px solid ${isDark ? 'rgba(255,255,255,.08)' : TC.g200}`,
                  display: 'flex', flexDirection: 'column', gap: 8,
                  flexShrink: 0,
                  opacity: locked ? 0.75 : 1,
                  transition: 'all .15s',
                  position: 'relative',
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: 2, background: '#E8192C', borderRadius: '12px 12px 0 0',
                  }} />
                )}

                {/* Name + status row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: TC.text,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
                  }}>
                    {item.name}
                    {isActive && <span style={{ fontSize: 9, color: '#E8192C', marginLeft: 5, fontWeight: 800 }}>ACTIVE</span>}
                  </div>
                  {item._type === 'draft' && !item.submitted && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                      style={{
                        width: 22, height: 22, borderRadius: 6,
                        border: 'none', background: 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                      }}
                      title="Delete draft"
                    >
                      <Trash2 size={11} color={TC.red} />
                    </button>
                  )}
                </div>

                <StatusBadge status={item.displayStatus} />

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Layers size={10} color={TC.g400} />
                    <span style={{ fontSize: 10, color: TC.g400 }}>{item.node_count} nodes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} color={TC.g400} />
                    <span style={{ fontSize: 10, color: TC.g400 }}>
                      {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Price + action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: TC.primary }}>
                    ${Number(item.total_price || 0).toFixed(2)}
                  </span>

                  {locked ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 8,
                      border: `1px solid #3b82f640`, background: '#3b82f610',
                      color: '#3b82f6', fontSize: 10, fontWeight: 700,
                    }}>
                      <Lock size={10} />
                      Locked
                    </div>
                  ) : item.isEditable ? (
                    <button
                      onClick={() => onLoad(item)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 8,
                        border: `1px solid ${TC.primary}40`, background: `${TC.primary}10`,
                        color: TC.primary, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      <FolderOpen size={10} />
                      Edit
                    </button>
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 8,
                      border: `1px solid ${TC.g300}`, background: TC.g100,
                      color: TC.g500, fontSize: 10, fontWeight: 700,
                    }}>
                      Submitted
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
