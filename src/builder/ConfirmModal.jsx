import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors } from '../shared/theme.js'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({
  isOpen, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  confirmColor = '#ef4444',
  onConfirm, onCancel,
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)

  if (!isOpen) return null

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 400, maxWidth: '90vw',
          background: TC.card,
          borderRadius: 16,
          border: `1px solid ${TC.g200}`,
          boxShadow: '0 24px 64px rgba(0,0,0,.3)',
          overflow: 'hidden',
          animation: 'confirmIn .15s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {/* Top accent */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${confirmColor}, ${confirmColor}88)` }} />

        <div style={{ padding: '22px 24px 20px' }}>
          {/* Icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: `${confirmColor}15`,
              border: `1.5px solid ${confirmColor}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={18} color={confirmColor} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: TC.text, letterSpacing: '-0.01em' }}>{title}</div>
          </div>

          {/* Message */}
          <div style={{
            fontSize: 13, color: TC.g500, lineHeight: 1.6,
            background: isDark ? 'rgba(255,255,255,.03)' : TC.g50,
            borderRadius: 9, padding: '10px 14px',
            border: `1px solid ${TC.g200}`,
            marginBottom: 20,
          }}>
            {message}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '9px 20px', borderRadius: 9,
                border: `1px solid ${TC.g300}`, background: TC.g100,
                color: TC.g600, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all .12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = TC.g200 }}
              onMouseLeave={e => { e.currentTarget.style.background = TC.g100 }}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: '9px 22px', borderRadius: 9,
                border: 'none',
                background: confirmColor,
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: `0 4px 14px ${confirmColor}40`,
                transition: 'all .12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none' }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes confirmIn { from { opacity:0; transform:scale(.94) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
    </div>
  )
}
