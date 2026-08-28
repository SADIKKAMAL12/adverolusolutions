import { getSupabase } from '../lib/supabase-server.js'

// Real dashboard stats, optionally scoped to a date range via ?from=&to=
// (ISO date strings, inclusive). Previously this endpoint returned entirely
// hardcoded numbers that silently overrode the real client-computed fallback
// values whenever Supabase was configured — meaning the admin dashboard was
// showing fake data even though real data was available the whole time.
export default async function handler(req, res) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const sb = getSupabase()

  const { from, to } = req.query
  const rangeStart = from ? new Date(from) : null
  const rangeEnd   = to ? new Date(to) : null
  if (rangeEnd) rangeEnd.setHours(23, 59, 59, 999)

  const withRange = (q, col) => {
    if (rangeStart) q = q.gte(col, rangeStart.toISOString())
    if (rangeEnd)   q = q.lte(col, rangeEnd.toISOString())
    return q
  }

  const [usersRes, purchasesRes, structRes, agencyRes, depositsRes, ticketsRes] = await Promise.all([
    sb.from('users').select('id, balance'),
    withRange(sb.from('purchases').select('price, created_at'), 'created_at'),
    withRange(sb.from('structure_orders').select('total_price, submitted_at'), 'submitted_at'),
    withRange(sb.from('ad_account_requests').select('charged_amount, created_at'), 'created_at'),
    withRange(sb.from('deposits').select('amount, status, created_at'), 'created_at'),
    sb.from('support_tickets').select('status'),
  ])

  for (const r of [usersRes, purchasesRes, structRes, agencyRes, depositsRes, ticketsRes]) {
    if (r.error) return res.status(500).json({ error: r.error.message })
  }

  const users        = usersRes.data || []
  const purchases     = purchasesRes.data || []
  const structOrders  = structRes.data || []
  const agencyReqs    = agencyRes.data || []
  const deposits      = depositsRes.data || []
  const tickets       = ticketsRes.data || []

  const purchasesRevenue = purchases.reduce((s, p) => s + Number(p.price || 0), 0)
  const structRevenue    = structOrders.reduce((s, o) => s + Number(o.total_price || 0), 0)
  const agencyRevenue    = agencyReqs.reduce((s, r) => s + Number(r.charged_amount || 0), 0)

  const totalOrders  = purchases.length + structOrders.length + agencyReqs.length
  const totalRevenue = parseFloat((purchasesRevenue + structRevenue + agencyRevenue).toFixed(2))

  const completedDeposits = deposits.filter(d => d.status === 'completed')
  const depositsTotal = completedDeposits.reduce((s, d) => s + Number(d.amount || 0), 0)

  return res.status(200).json({
    users:         users.length,
    totalBalance:  parseFloat(users.reduce((s, u) => s + Number(u.balance || 0), 0).toFixed(2)),
    orders:        totalOrders,
    revenue:       totalRevenue,
    deposits:      completedDeposits.length,
    depositsTotal: parseFloat(depositsTotal.toFixed(2)),
    tickets:       tickets.filter(t => t.status === 'open').length,
    range: { from: from || null, to: to || null },
  })
}
