import { useEffect, useState } from 'react'
import { C, getThemeColors } from '../shared/theme.js'
import { useNavigate } from '../shared/Router.jsx'
import { useTheme } from '../shared/ThemeContext.jsx'
import { PageShell, StatCard, Card, Badge, Btn } from '../shared/UI.jsx'
import { useAuth } from '../shared/AuthContext.jsx'
import { useStore, setStore } from '../shared/store.js'

export default function UserDashboard() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const { user } = useAuth()
  const [store] = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    setLoading(true)

    Promise.all([
      fetch(`/api/transactions?user_id=${user.id}&order=id&ascending=false`).then(r => r.json()).catch(() => []),
      fetch(`/api/deposits?user_id=${user.id}`).then(r => r.json()).catch(() => []),
      fetch(`/api/orders?user_id=${user.id}`).then(r => r.json()).catch(() => []),
    ]).then(([transactions, deposits, orders]) => {
      if (cancelled) return
      setStore(s => ({
        ...s,
        transactions: Array.isArray(transactions) ? transactions : (transactions?.items || s.transactions),
        deposits:     Array.isArray(deposits)     ? deposits     : (deposits?.items     || s.deposits),
        orders:       Array.isArray(orders)       ? orders       : (orders?.items       || s.orders),
      }))
    }).finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [user?.id])

  const balance = store.balance ?? 0
  const txns = store.transactions || []
  const deps = store.deposits    || []
  const ords = store.orders      || []
  const reqs = store.adAccountRequests || []
  const purs = store.purchases   || []

  const totalSpend = txns
    .filter(t => (t.amount ?? 0) < 0 || /spent/i.test(t.type || ''))
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0)

  const totalAccounts = reqs.filter(r => r.status === 'approved' || r.status === 'active').length + purs.length

  const pendingOrders = ords.filter(o => o.status === 'pending').length
    + reqs.filter(r => r.status === 'pending').length

  const pendingDeposits = deps
    .filter(d => d.status === 'pending')
    .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)

  const totalDeposits = deps
    .filter(d => d.status === 'completed' || d.status === 'approved')
    .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)

  const recentActivity = txns.slice(0, 4)

  return (
    <PageShell title="Welcome back! 👋" subtitle="Here's what's happening with your account today.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 22 }}>

        {/* ── Left column ── */}
        <div>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
            <StatCard icon="◈" label="Current Balance"  value={`$${balance.toFixed(2)}`}         color={C.primary} />
            <StatCard icon="📊" label="Total Spend"      value={`$${totalSpend.toFixed(2)}`}       color={C.blue}    />
            <StatCard icon="🖥"  label="Total Accounts"  value={String(totalAccounts)}             color={C.green}   />
            <StatCard icon="⏱" label="Pending Orders"   value={loading ? '—' : String(pendingOrders)} color={C.yellow} />
          </div>

          {/* Quick actions */}
          <Card style={{ marginBottom: 22 }}>
            <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 800, color: TC.g800 }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {[
                [C.primary, '➕', 'Create Ad Account',    'Request new ad account',  '/agency-ad-accounts'  ],
                [C.green,   '◈',  'Top Up Balance',       'Add funds to account',    '/balance'             ],
                [C.blue,    '🛒', 'Buy Verified Account', 'Browse accounts',         '/preverified-accounts'],
                [C.yellow,  '💬', 'Contact Support',      'Get help from our team',  '/support'             ],
              ].map(([col, ic, l, s, pg]) => (
                <div key={l} onClick={() => navigate(pg)}
                  style={{ background: TC.g50, border: `1px solid ${TC.g200}`, borderRadius: 13, padding: '16px 12px', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = col; e.currentTarget.style.background = col + '0d' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = TC.g200; e.currentTarget.style.background = TC.g50 }}>
                  <div style={{ width: 46, height: 46, background: col + '20', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 10px' }}>{ic}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: TC.g700, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 11, color: TC.g400 }}>{s}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent activity */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TC.g800 }}>Recent Activity</h3>
              <Btn variant="ghost" size="sm" onClick={() => navigate('/balance')}>View all →</Btn>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: TC.g400, fontSize: 13 }}>Loading…</div>
            ) : recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: TC.g400, fontSize: 13 }}>
                No transactions yet. Top up your balance to get started.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${TC.g200}` }}>
                    {['#', 'Type', 'Method', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: TC.g400, fontWeight: 700, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map(row => (
                    <tr key={row.id} style={{ borderBottom: `1px solid ${TC.g100}` }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: TC.g700 }}>{row.id}</td>
                      <td style={{ padding: '12px 10px' }}><span style={{ fontWeight: 700, color: TC.g700 }}>{row.type}</span></td>
                      <td style={{ padding: '12px 10px', color: TC.g500 }}>{row.method}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 900, color: (row.amount ?? 0) < 0 ? C.red : C.green }}>
                        {(row.amount ?? 0) < 0 ? '−' : '+'} ${Math.abs(row.amount || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 10px' }}><Badge status={row.status} /></td>
                      <td style={{ padding: '12px 10px', color: TC.g400 }}>{row.date || row.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* ── Right sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, color: TC.g800 }}>Balance Overview</h3>
            <div style={{ fontSize: 12, color: TC.g400, marginBottom: 4 }}>Current Balance</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: C.primary, marginBottom: 16 }}>${balance.toFixed(2)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 12, color: TC.g400 }}>Pending</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.yellow }}>${pendingDeposits.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: TC.g400 }}>Total Deposits</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.green }}>${totalDeposits.toFixed(2)}</div>
              </div>
            </div>
            <Btn full onClick={() => navigate('/balance')}>◈ Top Up Balance</Btn>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
