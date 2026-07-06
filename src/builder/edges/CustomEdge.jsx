import { memo, useState, useCallback } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import { getEdgeStyle } from './edgeTypes.js'

const ROLES = [
  { key: 'admin', label: 'Admin', color: '#ef4444' },
  { key: 'advertiser', label: 'Advertiser', color: '#3b82f6' },
  { key: 'finance', label: 'Finance', color: '#10b981' },
]

function CustomEdge({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition, targetPosition,
  data,
  selected,
}) {
  const connectionType = data?.connectionType || 'admin'
  const style = getEdgeStyle(connectionType)
  const label = data?.label || style.label || connectionType
  const role = data?.role || 'admin'
  const currentRole = ROLES.find(r => r.key === role) || ROLES[0]

  const [showRoleMenu, setShowRoleMenu] = useState(false)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  const setEdgeRole = useCallback((newRole) => {
    window.dispatchEvent(new CustomEvent('builder-update-edge-role', {
      detail: { edgeId: id, role: newRole }
    }))
    setShowRoleMenu(false)
  }, [id])

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style.color,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: style.strokeDasharray,
          transition: 'stroke-width .15s',
        }}
        markerEnd={{
          type: 'arrowclosed',
          width: 14,
          height: 14,
          color: style.color,
        }}
      />
      {style.animated && (
        <BaseEdge
          id={`${id}-flow`}
          path={edgePath}
          style={{
            stroke: style.color,
            strokeWidth: 2,
            strokeDasharray: '8,8',
            strokeDashoffset: 0,
            opacity: 0.35,
            pointerEvents: 'none',
          }}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="16"
            to="0"
            dur="1s"
            repeatCount="indefinite"
          />
        </BaseEdge>
      )}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 10,
          }}
        >
          {/* Connection type label */}
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
            background: style.color,
            padding: '3px 10px',
            borderRadius: 12,
            whiteSpace: 'nowrap',
            boxShadow: `0 2px 8px ${style.color}44`,
            fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
            letterSpacing: 0.3,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}>
            {label}
          </span>

          {/* Role badge — clickable */}
          <span
            onClick={(e) => {
              e.stopPropagation()
              setShowRoleMenu(o => !o)
            }}
            title="Click to change role"
            style={{
              fontSize: 9,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              padding: '2px 8px',
              borderRadius: 10,
              background: `${currentRole.color}22`,
              border: `1px solid ${currentRole.color}55`,
              color: currentRole.color,
              cursor: 'pointer',
              userSelect: 'none',
              marginLeft: 6,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backdropFilter: 'blur(4px)',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: currentRole.color }} />
            {currentRole.label}
          </span>

          {/* Role dropdown */}
          {showRoleMenu && (
            <div style={{
              position: 'absolute',
              top: 26,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1a1a2e',
              border: '1px solid #2d2d44',
              borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              padding: '4px',
              minWidth: 110,
              zIndex: 30,
            }}>
              {ROLES.map(r => (
                <div
                  key={r.key}
                  onClick={(e) => {
                    e.stopPropagation()
                    setEdgeRole(r.key)
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    color: r.color,
                    cursor: 'pointer',
                    background: role === r.key ? `${r.color}18` : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: r.color }} />
                  {r.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Click outside to close role menu */}
        {showRoleMenu && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 20 }}
            onClick={() => setShowRoleMenu(false)}
          />
        )}
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(CustomEdge)
