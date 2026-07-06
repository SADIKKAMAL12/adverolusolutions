import { useState, useEffect } from 'react'
import { C, getThemeColors } from '../shared/theme.js'
import { useTheme } from '../shared/ThemeContext.jsx'
import { PageShell, Card, Btn } from '../shared/UI.jsx'
import { useStore, setStore } from '../shared/store.js'
import { fetchStructureOrders } from '../lib/db.js'
import { useAuth } from '../shared/AuthContext.jsx'
import { useNavigate } from '../shared/Router.jsx'
import { Package, Layers, Search, AlertTriangle } from 'lucide-react'

function StatusBadge({ status }) {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const isDark = theme === 'dark'
  const map = {
    pending:        { bg: TC.yellowL, c: TC.yellow, label: 'Pending' },
    building:       { bg: TC.blueL,   c: TC.blue,   label: 'Building' },
    done:           { bg: TC.greenL,  c: TC.green,  label: 'Done' },
    rejected:       { bg: TC.redL,    c: TC.red,    label: 'Rejected' },
    assets_missing: { bg: isDark ? 'rgba(190,24,93,.18)' : '#fce7f3', c: isDark ? '#f9a8d4' : '#be185d', label: 'Assets Missing' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.c, borderRadius: 20,
      padding: '3px 10px', fontSize: 11, fontWeight: 700,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.c }} />
      {s.label}
    </span>
  )
}

function CopyBtn({ text }) {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button onClick={copy} style={{
      background: copied ? TC.greenL : TC.primaryLight,
      border: 'none', borderRadius: 6,
      padding: '3px 8px', fontSize: 10, fontWeight: 700,
      cursor: 'pointer', color: copied ? TC.green : C.primary,
      flexShrink: 0, transition: 'all .15s', fontFamily: 'inherit',
    }}>
      {copied ? '✓' : 'Copy'}
    </button>
  )
}

function buildLine(purchase) {
  const parts = [purchase.email, purchase.password]
  if (purchase.twofa) parts.push(purchase.twofa)
  return parts.join(':')
}

/* ────────────────────────────────────────────────
   STRUCTURE ORDERS TAB
   ──────────────────────────────────────────────── */
function StructureOrdersTab({ orders, loading }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)
  const [search, setSearch] = useState('')
  const [reasonOrder, setReasonOrder] = useState(null)

  const filtered = (orders || []).filter(o => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (o.name || '').toLowerCase().includes(q) ||
      (o.order_code || '').toLowerCase().includes(q) ||
      (o.status || '').toLowerCase().includes(q)
    )
  })

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 48, color: TC.g400, fontSize: 14 }}>Loading structure orders…</div>
  }

  if (!orders || orders.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '56px 32px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📐</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: TC.g800, margin: '0 0 8px' }}>No Structure Orders Yet</h3>
        <p style={{ fontSize: 13, color: TC.g400, margin: '0 0 20px' }}>
          Build and submit your first agency structure from the builder.
        </p>
      </Card>
    )
  }

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: TC.g400 }} />
          <input
            placeholder="Search orders…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', border: `1px solid ${TC.g200}`, borderRadius: 10,
              padding: '10px 14px 10px 34px', fontSize: 13, fontFamily: 'inherit',
              outline: 'none', boxSizing: 'border-box', background: TC.card, color: TC.text,
            }}
          />
        </div>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '140px 1fr 100px 90px 110px 120px',
          gap: 0,
          background: TC.g50,
          borderBottom: `1px solid ${TC.g200}`,
          padding: '12px 20px',
        }}>
          {['Order Code', 'Name', 'Assets', 'Price', 'Status', 'Submitted'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 800, color: TC.g400, textTransform: 'uppercase', letterSpacing: .7 }}>{h}</div>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: TC.g400, fontSize: 14 }}>No results found.</div>
        ) : (
          filtered.map((o, i) => {
            const isMissing = o.status === 'assets_missing'
            const hasNote = isMissing && !!o.admin_notes
            return (
              <div key={o.id || i}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 100px 90px 130px 120px',
                  gap: 0,
                  padding: '14px 20px',
                  borderBottom: !hasNote && i < filtered.length - 1 ? `1px solid ${TC.g100}` : 'none',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: TC.g700 }}>{o.order_code || o.id}</span>
                    <CopyBtn text={o.order_code || o.id} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: TC.g800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
                    {o.name || 'Untitled'}
                  </div>
                  <div style={{ fontSize: 12, color: TC.g500 }}>
                    {o.node_count || 0} nodes · {o.edge_count || 0} edges
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: C.primary, fontVariantNumeric: 'tabular-nums' }}>
                    ${parseFloat(o.total_price || 0).toFixed(2)}
                  </div>
                  {/* Status + reason button */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <StatusBadge status={o.status || 'pending'} />
                    {hasNote && (
                      <button
                        onClick={() => setReasonOrder(o)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: isDark ? 'rgba(190,24,93,.18)' : '#fdf2f8',
                          border: `1px solid ${isDark ? 'rgba(249,168,212,.25)' : '#f9a8d4'}`,
                          color: isDark ? '#f9a8d4' : '#be185d', borderRadius: 6,
                          padding: '3px 8px', fontSize: 10, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        <AlertTriangle size={10} /> View reason
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: TC.g500 }}>
                    {o.submitted_at ? new Date(o.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </div>
                </div>

                {/* Inline note strip shown directly under the row */}
                {hasNote && (
                  <div style={{
                    margin: '0 20px 12px',
                    background: isDark ? 'rgba(190,24,93,.12)' : '#fdf2f8',
                    border: `1px solid ${isDark ? 'rgba(249,168,212,.2)' : '#f9a8d4'}`,
                    borderRadius: 8, padding: '10px 14px',
                    borderBottom: i < filtered.length - 1 ? `1px solid ${TC.g100}` : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <AlertTriangle size={13} color={isDark ? '#f9a8d4' : '#be185d'} style={{ marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#f9a8d4' : '#be185d', marginBottom: 3 }}>
                          Missing Assets — action required
                        </div>
                        <div style={{ fontSize: 12, color: isDark ? '#fbcfe8' : '#9d174d', lineHeight: 1.6 }}>
                          {o.admin_notes}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </Card>

      {/* Missing assets reason modal */}
      {reasonOrder && (
        <div
          onClick={() => setReasonOrder(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
            backdropFilter: 'blur(4px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: TC.card, borderRadius: 16,
              border: `1px solid ${isDark ? 'rgba(249,168,212,.2)' : '#f9a8d4'}`,
              boxShadow: '0 24px 64px rgba(0,0,0,.25)',
              width: 460, maxWidth: '92vw', padding: 28,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? 'rgba(190,24,93,.18)' : '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} color={isDark ? '#f9a8d4' : '#be185d'} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: TC.text }}>Missing Assets</div>
                <div style={{ fontSize: 11, color: TC.g400 }}>Order {reasonOrder.order_code}</div>
              </div>
              <button
                onClick={() => setReasonOrder(null)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: TC.g400 }}
              >✕</button>
            </div>
            <div style={{
              background: isDark ? 'rgba(190,24,93,.12)' : '#fdf2f8',
              border: `1px solid ${isDark ? 'rgba(249,168,212,.2)' : '#f9a8d4'}`,
              borderRadius: 10, padding: '16px 18px',
              fontSize: 13, color: isDark ? '#fbcfe8' : '#9d174d', lineHeight: 1.7, fontWeight: 500,
            }}>
              {reasonOrder.admin_notes}
            </div>
            <p style={{ fontSize: 12, color: TC.g400, marginTop: 14, marginBottom: 0 }}>
              Please provide the listed assets so we can continue building your structure. Contact support if you need help.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

/* ────────────────────────────────────────────────
   PURCHASE HISTORY TAB
   ──────────────────────────────────────────────── */
function PurchaseHistoryTab({ purchases }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

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
      <Card style={{ textAlign: 'center', padding: '56px 32px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🧾</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: TC.g800, margin: '0 0 8px' }}>No Purchases Yet</h3>
        <p style={{ fontSize: 13, color: TC.g400, margin: '0 0 20px' }}>
          Browse the marketplace and buy your first pre-verified account.
        </p>
        <Btn onClick={() => navigate('/preverified-accounts')}>Browse Accounts →</Btn>
      </Card>
    )
  }

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: TC.g400 }} />
          <input
            placeholder="Search purchases…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', border: `1px solid ${TC.g200}`, borderRadius: 10,
              padding: '10px 14px 10px 34px', fontSize: 13, fontFamily: 'inherit',
              outline: 'none', boxSizing: 'border-box', background: TC.card, color: TC.text,
            }}
          />
        </div>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr 150px 90px',
          gap: 0,
          background: TC.g50,
          borderBottom: `1px solid ${TC.g200}`,
          padding: '12px 20px',
        }}>
          {['Product', 'Credentials', 'Purchased', 'Price'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 800, color: TC.g400, textTransform: 'uppercase', letterSpacing: .7 }}>{h}</div>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: TC.g400, fontSize: 14 }}>No results found.</div>
        ) : (
          filtered.map((p, i) => {
            const line = buildLine(p)
            return (
              <div key={p.id || i} style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr 150px 90px',
                gap: 0,
                padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? `1px solid ${TC.g100}` : 'none',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, background: TC.g50,
                    border: `1px solid ${TC.g200}`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 18 }}>{p.platform?.[0] || '?'}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: TC.g800, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.productTitle || '—'}
                    </div>
                    <span style={{ background: TC.blueL, color: TC.blue, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20 }}>
                      {p.platform}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, paddingRight: 12 }}>
                  <div style={{
                    fontSize: 13, color: TC.g700, fontWeight: 600,
                    background: TC.g50, borderRadius: 7, padding: '6px 10px',
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    border: `1px solid ${TC.g200}`,
                  }}>
                    {line}
                  </div>
                  <CopyBtn text={line} />
                </div>
                <div style={{ fontSize: 12, color: TC.g500 }}>
                  {p.purchasedAt || p.purchased_at || (p.created_at ? new Date(p.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')}
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.primary, fontVariantNumeric: 'tabular-nums' }}>
                  ${parseFloat(p.price || 0).toFixed(2)}
                </div>
              </div>
            )
          })
        )}
      </Card>
    </>
  )
}

/* ────────────────────────────────────────────────
   MAIN PAGE
   ──────────────────────────────────────────────── */
export default function UserOrdersPage() {
  const [store, setLocalStore] = useStore()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('structures')
  const [loadingStructures, setLoadingStructures] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)

  const structureOrders = store.structureOrders || []
  const purchases = store.purchases || []

  // Fetch structure orders on mount
  useEffect(() => {
    setLoadingStructures(true)
    fetchStructureOrders(true, user?.id)
      .then(res => {
        if (res?.orders) {
          setLocalStore(s => ({ ...s, structureOrders: res.orders }))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStructures(false))
  }, [user?.id])

  const tabs = [
    { key: 'structures', label: 'Structure Orders', icon: Layers, count: structureOrders.length },
    { key: 'purchases', label: 'Purchase History', icon: Package, count: purchases.length },
  ]

  return (
    <PageShell
      title="Orders"
      subtitle="Track your structure orders and purchase history."
    >
      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4,
        borderBottom: `1px solid ${TC.g200}`,
        marginBottom: 22,
      }}>
        {tabs.map(tab => {
          const active = activeTab === tab.key
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px',
                border: 'none',
                borderBottom: `2px solid ${active ? C.primary : 'transparent'}`,
                background: 'transparent',
                color: active ? C.primary : TC.g500,
                fontSize: 13, fontWeight: active ? 800 : 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all .15s',
                marginBottom: -1,
              }}
            >
              <Icon size={15} />
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: active ? C.primary : TC.g200,
                  color: active ? '#fff' : TC.g600,
                  fontSize: 10, fontWeight: 800,
                  padding: '1px 7px', borderRadius: 20,
                  minWidth: 16, textAlign: 'center',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeTab === 'structures' && (
        <StructureOrdersTab orders={structureOrders} loading={loadingStructures} />
      )}
      {activeTab === 'purchases' && (
        <PurchaseHistoryTab purchases={purchases} />
      )}
    </PageShell>
  )
}
