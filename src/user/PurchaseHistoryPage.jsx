import { C } from '../shared/theme.js'
import { useState } from 'react'
import { useNavigate } from '../shared/Router.jsx'
import { PageShell, Card, Btn, PlatformIcon } from '../shared/UI.jsx'

function buildLine(purchase) {
  const parts = [purchase.email, purchase.password]
  if (purchase.twofa) parts.push(purchase.twofa)
  return parts.join(':')
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button onClick={copy} style={{
      background: copied ? C.greenL : C.primaryLight,
      border: 'none', borderRadius: 7,
      padding: '5px 12px', fontSize: 12, fontWeight: 700,
      cursor: 'pointer', color: copied ? C.green : C.primary,
      flexShrink: 0, transition: 'all .15s', fontFamily: 'inherit',
    }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

export default function PurchaseHistoryPage({ purchases }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = (purchases || []).filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (p.productTitle || '').toLowerCase().includes(q) ||
      (p.platform || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    )
  })

  if (!purchases || purchases.length === 0) {
    return (
      <PageShell title="Purchase History" subtitle="All your purchased pre-verified accounts.">
        <Card style={{ textAlign: 'center', padding: '72px 32px' }}>
          <div style={{ fontSize: 56, marginBottom: 18 }}>🧾</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: C.g700, margin: '0 0 10px' }}>No Purchases Yet</h3>
          <p style={{ fontSize: 14, color: C.g400, margin: '0 0 24px' }}>
            Browse the marketplace and buy your first pre-verified account.
          </p>
          <Btn onClick={() => navigate('/preverified-accounts')}>Browse Accounts →</Btn>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Purchase History"
      subtitle={`${purchases.length} purchase${purchases.length !== 1 ? 's' : ''} — credentials delivered instantly`}
      actions={[
        <Btn key="shop" variant="outline" onClick={() => navigate('/preverified-accounts')}>+ Buy More</Btn>
      ]}
    >
      {/* Search */}
      <div style={{ marginBottom: 18 }}>
        <input
          placeholder="🔍  Search by product, platform or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 400, border: `1px solid ${C.g200}`, borderRadius: 10, padding: '10px 16px', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr 150px 90px',
          gap: 0,
          background: C.g50,
          borderBottom: `1px solid ${C.g200}`,
          padding: '12px 20px',
        }}>
          {['Product', 'Credentials', 'Purchased', 'Price'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 800, color: C.g400, textTransform: 'uppercase', letterSpacing: .7 }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: C.g400, fontSize: 14 }}>No results found.</div>
        ) : (
          filtered.map((p, i) => {
            const line = buildLine(p)
            return (
              <div key={p.id} style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr 150px 90px',
                gap: 0,
                padding: '16px 20px',
                borderBottom: i < filtered.length - 1 ? `1px solid ${C.g100}` : 'none',
                alignItems: 'center',
              }}>
                {/* Product */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: C.g50, border: `1px solid ${C.g200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PlatformIcon name={p.platform} size={20} logo={p.logo} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: C.g800, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.productTitle || '—'}</div>
                    <span style={{ background: C.blueL, color: C.blue, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20 }}>{p.platform}</span>
                  </div>
                </div>

                {/* Credentials */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, paddingRight: 12 }}>
                  <div style={{
                    fontFamily: 'monospace', fontSize: 12, color: C.g700, fontWeight: 600,
                    background: C.g50, borderRadius: 7, padding: '6px 10px',
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    border: `1px solid ${C.g200}`,
                  }}>
                    {line}
                  </div>
                  <CopyBtn text={line} />
                </div>

                {/* Date */}
                <div style={{ fontSize: 12, color: C.g500 }}>
                  {p.purchasedAt || p.purchased_at || (p.created_at ? new Date(p.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')}
                </div>

                {/* Price */}
                <div style={{ fontWeight: 900, fontSize: 14, color: C.primary }}>
                  ${parseFloat(p.price || 0).toFixed(2)}
                </div>
              </div>
            )
          })
        )}
      </Card>
    </PageShell>
  )
}
