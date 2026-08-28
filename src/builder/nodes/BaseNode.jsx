import { memo, useState, useCallback, useEffect, useRef } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { getNodeTheme } from '../../shared/theme.js'
import { useTheme } from '../../shared/ThemeContext.jsx'
import { NODE_REGISTRY } from './nodeRegistry.js'

/* ── Inject CSS keyframes once ────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('node-anim-styles')) {
  const s = document.createElement('style')
  s.id = 'node-anim-styles'
  s.textContent = `
    @keyframes nodeDrop {
      0%   { transform: scale(1) }
      18%  { transform: scale(1.13) }
      42%  { transform: scale(0.92) }
      66%  { transform: scale(1.06) }
      82%  { transform: scale(0.97) }
      100% { transform: scale(1) }
    }
    @keyframes nodeMount {
      0%   { opacity: 0; transform: scale(0.75) translateY(12px) }
      60%  { opacity: 1; transform: scale(1.05) translateY(-2px) }
      100% { transform: scale(1) translateY(0) }
    }
    @keyframes glowRing {
      0%, 100% { box-shadow: var(--ring-a) }
      50%       { box-shadow: var(--ring-b) }
    }
    @keyframes iconPulse {
      0%, 100% { transform: scale(1) }
      50%       { transform: scale(1.08) }
    }
    .node-selected-glow { animation: glowRing 2s ease-in-out infinite; }
    .node-drop          { animation: nodeDrop 0.65s cubic-bezier(.36,.07,.19,.97) both; }
    .node-mount         { animation: nodeMount 0.45s cubic-bezier(.22,1,.36,1) both; }
    .node-icon-pulse    { animation: iconPulse 2s ease-in-out infinite; }
  `
  document.head.appendChild(s)
}

function BaseNode({ id, data, selected, dragging }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const t = getNodeTheme(data.nodeType, isDark)
  const { setNodes } = useReactFlow()

  const [editingTitle, setEditingTitle]       = useState(false)
  const [editingSubtitle, setEditingSubtitle] = useState(false)
  const [localTitle, setLocalTitle]           = useState(data.label || '')
  const [localSubtitle, setLocalSubtitle]     = useState(data.subtitle || '')
  const [dropped, setDropped]   = useState(false)
  const [mounted, setMounted]   = useState(false)
  const prevDragging = useRef(false)

  /* mount-in animation */
  useEffect(() => {
    setMounted(true)
  }, [])

  /* bounce on drop */
  useEffect(() => {
    if (prevDragging.current && !dragging) {
      setDropped(false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDropped(true))
      })
      const t = setTimeout(() => setDropped(false), 700)
      return () => clearTimeout(t)
    }
    prevDragging.current = dragging
  }, [dragging])

  const updateNodeData = useCallback((changes) => {
    setNodes(prev => prev.map(n =>
      n.id === id ? { ...n, data: { ...n.data, ...changes } } : n
    ))
  }, [id, setNodes])

  const finishTitle = useCallback(() => {
    setEditingTitle(false)
    updateNodeData({ label: localTitle })
  }, [localTitle, updateNodeData])

  const finishSubtitle = useCallback(() => {
    setEditingSubtitle(false)
    updateNodeData({ subtitle: localSubtitle })
  }, [localSubtitle, updateNodeData])

  const handleDelete = useCallback(() => {
    window.dispatchEvent(new CustomEvent('builder-delete-node', { detail: { nodeId: id } }))
  }, [id])

  const readOnly = !!data.readOnly

  const meta = NODE_REGISTRY[data.nodeType] || NODE_REGISTRY.profile
  const Icon = meta.icon
  const glow = t.glow

  /* CSS custom props for animated glow ring */
  const ringA = `0 0 0 2px ${glow}55, 0 0 18px ${glow}40, 0 8px 32px ${glow}18`
  const ringB = `0 0 0 3px ${glow}80, 0 0 32px ${glow}60, 0 12px 40px ${glow}30`

  /* Animation class composition */
  const animClass = [
    !mounted ? 'node-mount' : '',
    dropped   ? 'node-drop'  : '',
    selected  ? 'node-selected-glow' : '',
  ].filter(Boolean).join(' ')

  /* Box shadow for non-selected / non-animated state */
  const baseBoxShadow = selected
    ? `0 0 0 2px ${glow}66, 0 0 22px ${glow}50, 0 10px 40px ${glow}22`
    : `0 0 12px ${glow}20, 0 4px 24px rgba(0,0,0,${isDark ? '.4' : '.08'})`

  if (data.imageUrl) {
    return (
      <div
        className={animClass}
        style={{
          '--ring-a': ringA,
          '--ring-b': ringB,
          position: 'relative',
          width: 220,
          borderRadius: 16,
          overflow: 'hidden',
          border: `1.5px solid ${selected ? glow : glow + '40'}`,
          boxShadow: baseBoxShadow,
          transition: 'border-color .2s, box-shadow .2s',
          fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
          cursor: 'default',
        }}
      >
        {/* delete */}
        {!readOnly && <DeleteBtn onClick={handleDelete} />}

        <div style={{ position: 'relative', width: 220, height: 130 }}>
          <img src={data.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} draggable={false} />
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,.18)', borderRadius: 20,
            padding: '4px 10px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: glow, boxShadow: `0 0 6px ${glow}` }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>${data.price}</span>
          </div>
        </div>
        <Handles glow={glow} bg={t.bg} />
      </div>
    )
  }

  return (
    <div
      className={animClass}
      style={{
        '--ring-a': ringA,
        '--ring-b': ringB,
        position: 'relative',
        width: 210,
        borderRadius: 16,
        overflow: 'visible',
        fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
        cursor: 'default',
      }}
    >
      {/* Card shell */}
      <div style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: `1.5px solid ${selected ? glow + 'cc' : glow + '35'}`,
        boxShadow: baseBoxShadow,
        background: isDark
          ? `linear-gradient(145deg, ${t.bg} 0%, ${t.bg}ee 100%)`
          : `linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)`,
        transition: 'border-color .2s, box-shadow .2s',
        backdropFilter: 'blur(8px)',
      }}>
        {/* Top accent stripe */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${glow}ee 0%, ${glow}88 60%, transparent 100%)`,
        }} />

        {/* Inner glow layer */}
        <div style={{
          position: 'absolute',
          top: 3, left: 0, right: 0,
          height: 60,
          background: `radial-gradient(ellipse at 30% 0%, ${glow}18 0%, transparent 70%)`,
          pointerEvents: 'none',
          borderRadius: '0 0 50% 50%',
        }} />

        {/* Body */}
        <div style={{ padding: '14px 14px 12px', position: 'relative', zIndex: 1 }}>
          {/* Icon + label row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
            {/* Icon bubble */}
            <div
              className={selected ? 'node-icon-pulse' : ''}
              style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `linear-gradient(135deg, ${glow}28 0%, ${glow}14 100%)`,
                border: `1.5px solid ${glow}50`,
                boxShadow: `0 0 14px ${glow}35, inset 0 1px 0 rgba(255,255,255,.1)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                color: glow,
              }}
            >
              {data.logoUrl
                ? <img src={data.logoUrl} alt="" draggable={false} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4 }} />
                : Icon && <Icon size={20} strokeWidth={2} />
              }
            </div>

            {/* Label + subtitle */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingTitle ? (
                <input
                  autoFocus
                  value={localTitle}
                  onChange={e => setLocalTitle(e.target.value)}
                  onBlur={finishTitle}
                  onKeyDown={e => e.key === 'Enter' && finishTitle()}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    borderBottom: `1px solid ${glow}`, color: t.text,
                    fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                    outline: 'none', padding: 0,
                  }}
                />
              ) : (
                <div
                  onDoubleClick={() => !readOnly && setEditingTitle(true)}
                  title={readOnly ? undefined : 'Double-click to rename'}
                  style={{
                    fontSize: 13, fontWeight: 800, color: t.text,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    cursor: 'text', lineHeight: 1.2,
                  }}
                >
                  {data.label || 'Untitled'}
                </div>
              )}

              {editingSubtitle ? (
                <input
                  autoFocus
                  value={localSubtitle}
                  onChange={e => setLocalSubtitle(e.target.value)}
                  onBlur={finishSubtitle}
                  onKeyDown={e => e.key === 'Enter' && finishSubtitle()}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    borderBottom: `1px solid ${glow}55`, color: t.text,
                    fontSize: 10, fontFamily: 'inherit', opacity: 0.6,
                    outline: 'none', padding: 0, marginTop: 3,
                  }}
                />
              ) : (
                <div
                  onDoubleClick={() => !readOnly && setEditingSubtitle(true)}
                  title={readOnly ? undefined : 'Double-click to edit'}
                  style={{
                    fontSize: 10, color: t.text, opacity: 0.55, marginTop: 3,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    cursor: 'text',
                  }}
                >
                  {data.subtitle || meta.label}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height: 1,
            background: `linear-gradient(90deg, ${glow}30, transparent)`,
            marginBottom: 10,
          }} />

          {/* Price row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: `${glow}15`,
              border: `1px solid ${glow}35`,
              borderRadius: 20, padding: '4px 10px',
              boxShadow: `0 0 8px ${glow}20`,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: glow,
                boxShadow: `0 0 6px ${glow}`,
              }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: glow }}>
                ${data.price}
              </span>
            </div>
            <div style={{
              fontSize: 9, color: t.text, opacity: 0.35,
              fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
            }}>
              per unit
            </div>
          </div>
        </div>
      </div>

      {/* Delete button — outside card so it's not clipped */}
      {!readOnly && <DeleteBtn onClick={handleDelete} />}

      <Handles glow={glow} bg={t.bg} />
    </div>
  )
}

/* ── Shared sub-components ───────────────────────────── */
function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Remove"
      style={{
        position: 'absolute', top: -9, right: -9, zIndex: 10,
        width: 22, height: 22, borderRadius: '50%',
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: '#fff', border: '2px solid rgba(255,255,255,.3)',
        fontSize: 13, fontWeight: 900, lineHeight: '1',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(239,68,68,.5)',
        transition: 'transform .12s, box-shadow .12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.2)'
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,.7)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,.5)'
      }}
    >
      ×
    </button>
  )
}

function Handles({ glow, bg }) {
  const style = (extra = {}) => ({
    background: glow,
    border: `2.5px solid ${bg}`,
    boxShadow: `0 0 6px ${glow}`,
    width: 14, height: 14,
    ...extra,
  })
  return (
    <>
      {/* All four handles are type="source" — with ConnectionMode.Loose, xyflow's
          edge-position lookup only ever checks a node's *source*-type bounds for
          the edge's sourceHandle (the target-side lookup is the only one that also
          falls back to source bounds), so a handle used to start a drag must be
          type="source" regardless of which visual dot the user grabbed. */}
      <Handle type="source" position={Position.Top}    id="top"    style={style({ top: -7 })} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={style({ bottom: -7 })} />
      <Handle type="source" position={Position.Left}   id="left"  style={style({ left: -7,  width: 12, height: 12 })} />
      <Handle type="source" position={Position.Right}  id="right" style={style({ right: -7, width: 12, height: 12 })} />
    </>
  )
}

export default memo(BaseNode)
