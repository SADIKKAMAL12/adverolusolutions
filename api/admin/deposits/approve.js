import { getSupabase } from '../../lib/supabase-server.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Defence-in-depth: verify admin role even though the router already checks it
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  const { depositId, userId, amount } = req.body || {}
  if (!depositId || !userId || amount == null) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const parsedAmount = parseFloat(amount)
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' })
  }

  const sb = getSupabase()
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' })

  try {
    // Verify the deposit exists, belongs to the stated user, and is still pending
    // This prevents: approving someone else's deposit, double-approving, or inventing amounts
    const { data: deposit, error: fetchErr } = await sb
      .from('deposits')
      .select('id, user_id, amount, status')
      .eq('id', depositId)
      .single()

    if (fetchErr || !deposit) return res.status(404).json({ error: 'Deposit not found' })
    if (String(deposit.user_id) !== String(userId)) {
      return res.status(400).json({ error: 'Deposit does not belong to stated user' })
    }
    if (deposit.status === 'completed') {
      return res.status(409).json({ error: 'Deposit already approved' })
    }

    // Use the deposit's own recorded amount — do not trust the amount from the request body
    const approvedAmount = parseFloat(deposit.amount)

    const { error: depErr } = await sb
      .from('deposits')
      .update({ status: 'completed' })
      .eq('id', depositId)
    if (depErr) throw depErr

    const { data: user, error: userErr } = await sb
      .from('users').select('balance').eq('id', userId).single()
    if (userErr) throw userErr

    const newBalance = parseFloat(user.balance || 0) + approvedAmount

    const { error: balErr } = await sb
      .from('users').update({ balance: newBalance }).eq('id', userId)
    if (balErr) throw balErr

    const { error: txErr } = await sb.from('transactions').insert({
      user_id: userId,
      type: 'Deposit',
      method: 'Admin Approval',
      amount: approvedAmount,
      status: 'completed',
      date: new Date().toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
    })
    if (txErr) throw txErr

    return res.status(200).json({ success: true, newBalance })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
