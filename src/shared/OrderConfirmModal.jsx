import { useEffect } from 'react'

/**
 * Pre-order confirmation popup.
 * Shows balance, order cost, and remaining balance. User must press Confirm.
 *
 * Props:
 *   isOpen      — boolean
 *   onClose     — () => void
 *   onConfirm   — () => void  (called when user presses Confirm)
 *   orderLabel  — string  e.g. "Structure Order", "Agency Account", "BM Verified"
 *   cost        — number
 *   balance     — number  (current balance)
 *   loading     — boolean (show spinner on confirm button while submitting)
 */
export default function OrderConfirmModal({ isOpen, onClose, onConfirm, orderLabel = 'Order', cost = 0, balance = 0, loading = false }) {
  const remaining = balance - cost
  const pctUsed = balance > 0 ? Math.min(100, Math.round((cost / balance) * 100)) : 100

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape' && !loading) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, loading])

  if (!isOpen) return null

  return (
    <div
      onClick={() => { if (!loading) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.38)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        animation: 'ocm-fade 0.18s ease',
      }}
    >
      <style>{`
        @keyframes ocm-fade { from{opacity:0} to{opacity:1} }
        @keyframes ocm-up { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes ocm-bar { from{width:0} to{width:var(--used-w)} }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 380,
          background: 'var(--bg-card)',
          border: '1px solid var(--line)',
          borderRadius: 22,
          boxShadow: 'var(--shadow-md), 0 32px 80px rgba(0,0,0,0.22)',
          padding: '28px 26px 22px',
          display: 'flex', flexDirection: 'column', gap: 0,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
          animation: 'ocm-up 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
              Confirm Order
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.3 }}>
              {orderLabel}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'var(--bg-sunken)',
              border: '1px solid var(--line)',
              color: 'var(--muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 16, lineHeight: 1,
              opacity: loading ? 0.4 : 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Balance breakdown */}
        <div style={{
          background: 'var(--bg-sunken)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 11,
          marginBottom: 16,
        }}>
          <BRow label="Current balance" value={`$${balance.toFixed(2)}`} color="var(--ink)" />
          <BRow label="Order cost" value={`−$${cost.toFixed(2)}`} color="var(--accent)" bold />
          <div style={{ height: 1, background: 'var(--line)' }} />
          <BRow
            label="Remaining balance"
            value={`$${remaining.toFixed(2)}`}
            color="var(--success)"
            bold
            large
          />

          {/* Usage bar */}
          <div>
            <div style={{ height: 6, borderRadius: 99, background: 'var(--line)', overflow: 'hidden' }}>
              <div style={{
                '--used-w': `${pctUsed}%`,
                height: '100%',
                width: `${pctUsed}%`,
                borderRadius: 99,
                background: pctUsed > 80
                  ? 'linear-gradient(90deg,var(--accent),#f97316)'
                  : 'linear-gradient(90deg,#22c55e,#16a34a)',
                animation: 'ocm-bar 0.5s cubic-bezier(0.4,0,0.2,1) 0.05s both',
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 5, textAlign: 'right' }}>
              {pctUsed}% of balance used
            </div>
          </div>
        </div>

        {/* Note */}
        <div style={{
          fontSize: 12, color: 'var(--muted)',
          background: 'var(--info-bg)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          padding: '9px 12px',
          marginBottom: 18,
          lineHeight: 1.5,
        }}>
          💡 Your balance will be deducted immediately upon confirmation.
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1, height: 44, borderRadius: 12,
              background: 'var(--bg-sunken)',
              border: '1px solid var(--line)',
              color: 'var(--muted)',
              fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 2, height: 44, borderRadius: 12,
              background: loading ? 'var(--muted)' : 'linear-gradient(135deg,#007aff,#0055d4)',
              border: 'none',
              color: '#fff',
              fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 4px 16px rgba(0,122,255,0.28)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Processing…
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </>
            ) : (
              <>Confirm & Submit</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function BRow({ label, value, color, bold, large }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
      <span style={{
        fontSize: large ? 16 : 14,
        color,
        fontWeight: bold ? 700 : 500,
        letterSpacing: -0.2,
      }}>{value}</span>
    </div>
  )
}
