import { useMemo, memo } from 'react'
import { ReactFlow, Background, Controls, MiniMap, ConnectionMode, BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors } from '../shared/theme.js'
import BaseNode from './nodes/BaseNode.jsx'
import { getConnectionMeta } from './nodes/nodeRegistry.js'
import { X, Package, Clock, DollarSign, User, Hash } from 'lucide-react'

// Self-contained read-only edge — mirrors the builder's inline CustomEdge exactly
const PreviewEdge = memo(function PreviewEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const connType = data?.connectionType || 'admin'
  const meta = getConnectionMeta(connType)
  const color = meta?.color || '#ef4444'
  const label = meta?.label || connType
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const markerId = `prev-arr-${id}`
  return (
    <>
      <defs>
        <marker id={markerId} markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill={color} />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: color, strokeWidth: 2, strokeDasharray: meta?.dash }}
        markerEnd={`url(#${markerId})`}
      />
      <EdgeLabelRenderer>
        <div style={{
          position: 'absolute',
          transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
          pointerEvents: 'none', zIndex: 10,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#fff',
            background: color, padding: '2px 9px', borderRadius: 10,
            whiteSpace: 'nowrap',
            fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", letterSpacing: .3,
            boxShadow: `0 2px 8px ${color}44`,
          }}>{label}</span>
        </div>
      </EdgeLabelRenderer>
    </>
  )
})

const edgeTypes = { custom: PreviewEdge }
const nodeTypes = { base: BaseNode }

export default function StructurePreviewModal({ isOpen, onClose, order }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)

  const nodes = useMemo(() => {
    if (!order?.nodes_json) return []
    try {
      const parsed = JSON.parse(order.nodes_json)
      return Array.isArray(parsed)
        ? parsed.map(n => ({ ...n, data: { ...n.data, readOnly: true } }))
        : []
    } catch {
      return []
    }
  }, [order])

  const edges = useMemo(() => {
    if (!order?.edges_json) return []
    try {
      const parsed = JSON.parse(order.edges_json)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [order])

  if (!isOpen || !order) return null

  const deliveryDays = Math.max(1, Math.ceil(1 + (order.node_count || 0) / 5))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        width: '90vw', maxWidth: 1200,
        height: '85vh',
        background: TC.card,
        borderRadius: 16,
        border: `1px solid ${TC.g200}`,
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: `1px solid ${TC.g200}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: TC.text }}>
                {order.name || 'Structure Order'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <span style={{ fontSize: 11, color: TC.g500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Hash size={11} /> {order.order_code}
                </span>
                <span style={{ fontSize: 11, color: TC.g500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={11} /> {order.user_name || order.user_email || 'Unknown'}
                </span>
                <span style={{ fontSize: 11, color: TC.g500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Package size={11} /> {order.node_count} nodes · {order.edge_count} edges
                </span>
                <span style={{ fontSize: 11, color: TC.g500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {deliveryDays} day delivery
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: TC.primary, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <DollarSign size={12} /> {Number(order.total_price).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${TC.g300}`, background: TC.g100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} color={TC.g600} />
          </button>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {nodes.length === 0 ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', color: TC.g400, fontSize: 14,
            }}>
              No structure data available for this order.
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              minZoom={0.1}
              maxZoom={2}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              zoomOnScroll={true}
              panOnScroll={true}
              style={{ background: isDark ? '#0a0a14' : '#ffffff' }}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                color={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}
                gap={20}
                size={1}
                variant="dots"
              />
              <Controls
                style={{
                  background: isDark ? '#1a1a2e' : '#ffffff',
                  border: `1px solid ${isDark ? '#2d2d44' : '#e5e7eb'}`,
                  borderRadius: 10,
                }}
              />
              <MiniMap
                style={{
                  background: isDark ? '#1a1a2e' : '#ffffff',
                  border: `1px solid ${isDark ? '#2d2d44' : '#e5e7eb'}`,
                  borderRadius: 10,
                }}
                nodeColor={(n) => {
                  const colors = {
                    profile: '#3b82f6', bm_verified: '#10b981', agency_bm: '#8b5cf6',
                    advertiser_account: '#f59e0b', client_ad_account: '#06b6d4',
                    pages_bm: '#ec4899', fan_page: '#ef4444', pixel: '#14b8a6',
                    dataset: '#6366f1', domain: '#f97316', backup_admin: '#84cc16',
                    employee: '#64748b', media_buyer: '#d946ef',
                  }
                  return colors[n.type] || '#6b7280'
                }}
                maskColor={isDark ? 'rgba(15,15,26,0.7)' : 'rgba(245,245,248,0.7)'}
              />
            </ReactFlow>
          )}
        </div>
      </div>
    </div>
  )
}
