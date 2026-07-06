import { useState } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors } from '../shared/theme.js'
import { Layers, Trash2, Maximize, Plus, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react'

/* inject toolbar hover animation once */
if (typeof document !== 'undefined' && !document.getElementById('toolbar-anim')) {
  const s = document.createElement('style')
  s.id = 'toolbar-anim'
  s.textContent = `
    @keyframes assetLift {
      0%   { transform: translateY(0) scale(1) }
      40%  { transform: translateY(-4px) scale(1.02) }
      100% { transform: translateY(-2px) scale(1.01) }
    }
    .asset-card-hover { animation: assetLift .2s ease forwards; }
    .asset-card-rest  { animation: none; transform: translateY(0) scale(1); transition: transform .2s; }
  `
  document.head.appendChild(s)
}

function AssetCard({ nodeKey, meta, isDark, TC, onDragStart, onAddNode }) {
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const glow = meta.glow || '#3b82f6'
  const Icon = meta.icon

  return (
    <div
      draggable
      className={hovered && !dragging ? 'asset-card-hover' : 'asset-card-rest'}
      onDragStart={(e) => { onDragStart(e, nodeKey); setDragging(true) }}
      onDragEnd={() => setDragging(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 12px', marginBottom: 6, borderRadius: 12,
        background: hovered ? (isDark ? `${glow}14` : `${glow}09`) : (isDark ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.7)'),
        border: `1px solid ${hovered ? glow + '55' : (isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb')}`,
        borderLeft: `3px solid ${hovered ? glow : glow + '40'}`,
        boxShadow: hovered ? `0 4px 20px ${glow}20, 0 0 10px ${glow}10` : '0 1px 4px rgba(0,0,0,.05)',
        cursor: 'grab', transition: 'background .15s, border-color .15s, box-shadow .15s', userSelect: 'none',
      }}
    >
      <GripVertical size={12} color={hovered ? glow : TC.g300} style={{ flexShrink: 0, transition: 'color .15s' }} />
      <div style={{
        width: meta.imageUrl ? 48 : 36, height: 36, borderRadius: 9, flexShrink: 0,
        overflow: 'hidden', color: glow,
        background: hovered ? `linear-gradient(135deg, ${glow}28, ${glow}14)` : `${glow}12`,
        border: `1.5px solid ${glow}${hovered ? '55' : '28'}`,
        boxShadow: hovered ? `0 0 12px ${glow}35` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s',
      }}>
        {meta.imageUrl
          ? <img src={meta.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : Icon ? <Icon size={17} strokeWidth={2.2} /> : '◈'
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: TC.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {meta.label || nodeKey}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: glow, fontVariantNumeric: 'tabular-nums', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: glow, boxShadow: `0 0 4px ${glow}`, display: 'inline-block' }} />
          ${meta.price}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onAddNode(nodeKey) }}
        title={`Add ${meta.label || nodeKey}`}
        style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          border: `1.5px solid ${glow}${hovered ? '70' : '35'}`,
          background: hovered ? `${glow}22` : `${glow}0d`, color: glow,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: hovered ? `0 0 8px ${glow}30` : 'none', transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${glow}35`; e.currentTarget.style.transform = 'scale(1.15)' }}
        onMouseLeave={e => { e.currentTarget.style.background = hovered ? `${glow}22` : `${glow}0d`; e.currentTarget.style.transform = 'scale(1)' }}
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  )
}

export default function BuilderToolbar({ assets, onAddNode, onClearAll, onFitView }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)
  const [collapsed, setCollapsed] = useState(false)

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.setData('text/plain', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const assetList = Object.entries(assets).sort((a, b) => (a[1].sort_order || 0) - (b[1].sort_order || 0))

  if (collapsed) {
    return (
      <div style={{
        width: 44, minWidth: 44,
        background: isDark ? '#0e0e1c' : '#f9fafc',
        borderRight: `1px solid ${TC.g200}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '12px 0', gap: 8, overflow: 'hidden',
      }}>
        <button
          onClick={() => setCollapsed(false)}
          title="Show Assets"
          style={{
            width: 30, height: 30, borderRadius: 8,
            border: `1px solid ${TC.g200}`,
            background: isDark ? 'rgba(255,255,255,.05)' : TC.g100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: TC.g500, transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.1)' : TC.g200 }}
          onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.05)' : TC.g100 }}
        >
          <ChevronRight size={15} />
        </button>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: 'linear-gradient(135deg, #E8192C22, #E8192C11)',
          border: '1px solid #E8192C40',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Layers size={12} color="#E8192C" />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: 268, minWidth: 268,
      background: isDark ? '#0e0e1c' : '#f9fafc',
      borderRight: `1px solid ${TC.g200}`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: `1px solid ${TC.g200}`,
        background: isDark ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #E8192C22, #E8192C11)',
            border: '1px solid #E8192C40',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Layers size={15} color="#E8192C" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TC.text }}>Assets</div>
            <div style={{ fontSize: 10, color: TC.g400 }}>{assetList.length} types</div>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            title="Hide Assets"
            style={{
              width: 26, height: 26, borderRadius: 7,
              border: `1px solid ${TC.g200}`,
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: TC.g400, transition: 'all .15s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.07)' : TC.g100; e.currentTarget.style.color = TC.g600 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TC.g400 }}
          >
            <ChevronLeft size={14} />
          </button>
        </div>
        <div style={{
          fontSize: 10, color: TC.g400, lineHeight: 1.5,
          background: isDark ? 'rgba(255,255,255,.04)' : TC.g50,
          borderRadius: 7, padding: '6px 10px',
          border: `1px solid ${TC.g200}`,
        }}>
          Drag onto canvas or press + to add
        </div>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 6px' }}>
        {assetList.length === 0 && (
          <div style={{ padding: '30px 10px', textAlign: 'center', color: TC.g400, fontSize: 12 }}>
            No assets configured.
          </div>
        )}
        {assetList.map(([key, meta]) => (
          <AssetCard
            key={key} nodeKey={key} meta={meta}
            isDark={isDark} TC={TC}
            onDragStart={onDragStart} onAddNode={onAddNode}
          />
        ))}
      </div>

      {/* Bottom actions */}
      <div style={{
        padding: '10px 12px',
        borderTop: `1px solid ${TC.g200}`,
        display: 'flex', gap: 8,
        background: isDark ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.8)',
      }}>
        <button
          onClick={onClearAll}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 0', borderRadius: 9,
            border: '1px solid rgba(239,68,68,.35)', background: 'rgba(239,68,68,.08)',
            color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.18)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(239,68,68,.2)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,.08)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <Trash2 size={13} /> Clear
        </button>
        <button
          onClick={onFitView}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 0', borderRadius: 9,
            border: `1px solid ${TC.g300}`, background: TC.g100,
            color: TC.g600, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = TC.g200 }}
          onMouseLeave={e => { e.currentTarget.style.background = TC.g100 }}
        >
          <Maximize size={13} /> Fit
        </button>
      </div>
    </div>
  )
}
