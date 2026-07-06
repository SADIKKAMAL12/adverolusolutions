import { useEffect } from 'react'

export default function InsufficientBalanceModal({ isOpen, onClose, required = 0, available = 0 }) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const shortfall = Math.max(0, required - available)
  const pct = Math.min(100, required > 0 ? Math.round((available / required) * 100) : 0)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.40)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        animation: 'ibm-fade-in 0.18s ease',
      }}
    >
      <style>{`
        @keyframes ibm-fade-in { from{opacity:0} to{opacity:1} }
        @keyframes ibm-slide-up { from{opacity:0;transform:translateY(18px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes ibm-bar { from{width:0} to{width:var(--bar-w)} }
        .ibm-cancel-btn:hover { background: var(--bg-sunken) !important; }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 360,
          background: 'var(--bg-card)',
          border: '1px solid var(--line)',
          borderRadius: 22,
          boxShadow: 'var(--shadow-md), 0 32px 80px rgba(0,0,0,0.25)',
          padding: '32px 28px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
          animation: 'ibm-slide-up 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 62, height: 62, borderRadius: '50%',
          background: 'var(--accent-100)',
          border: '1.5px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 18,
          opacity: 0.85,
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        {/* Title */}
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.4, marginBottom: 8 }}>
          Insufficient Balance
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 24, maxWidth: 280 }}>
          You don't have enough funds to complete this order. Top up your balance to continue.
        </div>

        {/* Comparison card */}
        <div style={{
          width: '100%',
          background: 'var(--bg-sunken)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: '16px 18px',
          marginBottom: 20,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <Row label="Order total"  value={`$${required.toFixed(2)}`}  valueStyle={{ color: 'var(--ink)', fontWeight: 600 }} />
          <Row label="Your balance" value={`$${available.toFixed(2)}`} valueStyle={{ color: 'var(--muted)', fontWeight: 600 }} />
          <div style={{ height: 1, background: 'var(--line-2)', margin: '2px 0' }} />
          <Row
            label="You need"
            value={`$${shortfall.toFixed(2)}`}
            valueStyle={{ color: 'var(--accent)', fontWeight: 700, fontSize: 15 }}
          />

          {/* Progress bar */}
          <div style={{ marginTop: 4 }}>
            <div style={{ height: 5, borderRadius: 99, background: 'var(--line)', overflow: 'hidden' }}>
              <div style={{
                '--bar-w': `${pct}%`,
                height: '100%', width: `${pct}%`, borderRadius: 99,
                background: 'linear-gradient(90deg, var(--accent), #f97316)',
                animation: 'ibm-bar 0.6s cubic-bezier(0.4,0,0.2,1) 0.1s both',
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 5, textAlign: 'right' }}>
              {pct}% funded
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            className="ibm-cancel-btn"
            onClick={onClose}
            style={{
              flex: 1, height: 42, borderRadius: 12,
              background: 'var(--bg-sunken)',
              border: '1px solid var(--line)',
              color: 'var(--muted)',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            Cancel
          </button>
          <a
            href="#/balance"
            onClick={onClose}
            style={{
              flex: 1, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg,#007aff,#0055d4)',
              border: 'none', color: '#fff',
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,122,255,0.28)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Top Up
          </a>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, valueStyle }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, letterSpacing: -0.2, ...valueStyle }}>{value}</span>
    </div>
  )
}
