import { getSupabase } from './lib/supabase-server.js'
import { getAssets } from './structure-assets.js'

export default async function handler(req, res) {
  const method  = req.method
  const caller  = req.user
  const isAdmin = caller?.role === 'admin'
  const sb      = getSupabase()

  if (method === 'POST') {
    const nodes = Array.isArray(req.body.nodes) ? req.body.nodes : []
    const edges = Array.isArray(req.body.edges) ? req.body.edges : []

    // Price must come from the server's own current asset list — never trust
    // the client-computed total_price, or an order could be submitted at any
    // self-declared price regardless of what assets were actually selected.
    const assets = await getAssets()
    const priceByKey = new Map(assets.map(a => [a.key, Number(a.base_price) || 0]))
    const totalPrice = parseFloat(nodes.reduce((sum, n) => sum + (priceByKey.get(n.data?.nodeType) || 0), 0).toFixed(2))

    // Server-side balance check + deduction — atomic, row-locked via the
    // deduct_balance RPC so two concurrent submissions can't both read the same
    // stale balance and both pass a plain `currentBalance < totalPrice` check
    // before either write lands (this used to be exactly that non-atomic pattern).
    if (totalPrice > 0) {
      const { data: deduction, error: deductErr } = await sb.rpc('deduct_balance', { p_user_id: caller.id, p_amount: totalPrice })
      if (deductErr) return res.status(500).json({ error: deductErr.message })
      if (!deduction?.ok) {
        return res.status(400).json({
          error: deduction?.balance != null
            ? `Insufficient balance. Your current balance is $${Number(deduction.balance).toFixed(2)} but this order costs $${totalPrice.toFixed(2)}.`
            : (deduction?.error || 'Insufficient balance'),
        })
      }
    }

    const order = {
      id: String(Date.now()),
      // Force user identity from the verified session — never trust the body
      user_id:     caller.id,
      user_name:   req.body.user_name  || '',
      user_email:  caller.email        || '',
      draft_id:    req.body.draft_id   != null ? String(req.body.draft_id) : null,
      order_code:  'STR-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      name:        req.body.name       || 'Structure Order',
      nodes_json:  JSON.stringify(nodes),
      edges_json:  JSON.stringify(edges),
      total_price: totalPrice,
      node_count:  nodes.length,
      edge_count:  edges.length,
      status:      'pending',
      admin_notes: '',
    }
    const { data, error } = await sb.from('structure_orders').insert(order).select().single()
    if (error) {
      // Roll back the already-deducted hold if the order record itself failed to save
      if (totalPrice > 0) await sb.rpc('refund_balance', { p_user_id: caller.id, p_amount: totalPrice })
      return res.status(500).json({ error: error.message })
    }

    if (totalPrice > 0) {
      try {
        await sb.from('transactions').insert({
          user_id: caller.id,
          type:    'Structure Order',
          method:  'Balance Deduction',
          amount:  -totalPrice,
          status:  'pending',
          date:    new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        })
      } catch { /* non-fatal: order still proceeds even if the log entry fails */ }
    }

    return res.status(201).json({ success: true, id: data.id, order_code: data.order_code, status: 'pending' })
  }

  if (method === 'GET') {
    // Fetch a single order by ID
    if (req.query.id) {
      const { data: order, error } = await sb.from('structure_orders').select('*').eq('id', req.query.id).single()
      if (error || !order) return res.status(404).json({ error: 'Order not found' })
      if (!isAdmin && String(order.user_id) !== String(caller.id)) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      return res.status(200).json({ order })
    }

    if (req.query.mine) {
      // Non-admins always get their own orders; admins can scope by user_id param
      const uid = isAdmin ? (req.query.user_id || null) : caller.id
      let q = sb.from('structure_orders').select('*').order('submitted_at', { ascending: false })
      if (uid) q = q.eq('user_id', uid)
      const { data, error } = await q
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ orders: data || [] })
    }

    // Unfiltered list — admin sees all, non-admin sees only their own
    let q = sb.from('structure_orders').select('*').order('submitted_at', { ascending: false })
    if (!isAdmin) q = q.eq('user_id', caller.id)
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ orders: data || [] })
  }

  if (method === 'PUT') {
    // Owning user editing their own still-pending order's structure (nodes/edges/name) —
    // a separate, narrower path from the admin one below: no status/admin_notes/delivery_info
    // access, and price is always recomputed server-side (never trusts the client total).
    if (!isAdmin && req.body.nodes !== undefined) {
      const id = req.body.id
      const { data: order, error: fetchErr } = await sb.from('structure_orders').select('*').eq('id', id).single()
      if (fetchErr || !order) return res.status(404).json({ error: 'Order not found' })
      if (String(order.user_id) !== String(caller.id)) return res.status(403).json({ error: 'Forbidden' })
      if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be edited' })

      const nodes = Array.isArray(req.body.nodes) ? req.body.nodes : []
      const edges = Array.isArray(req.body.edges) ? req.body.edges : []
      const assets = await getAssets()
      const priceByKey = new Map(assets.map(a => [a.key, Number(a.base_price) || 0]))
      const newTotal = parseFloat(nodes.reduce((sum, n) => sum + (priceByKey.get(n.data?.nodeType) || 0), 0).toFixed(2))
      const oldTotal = Number(order.total_price || 0)
      const diff = parseFloat((newTotal - oldTotal).toFixed(2))

      if (diff > 0) {
        const { data: deduction, error: deductErr } = await sb.rpc('deduct_balance', { p_user_id: caller.id, p_amount: diff })
        if (deductErr) return res.status(500).json({ error: deductErr.message })
        if (!deduction?.ok) {
          return res.status(400).json({
            error: deduction?.balance != null
              ? `Insufficient balance to cover the extra $${diff.toFixed(2)}. Your current balance is $${Number(deduction.balance).toFixed(2)}.`
              : (deduction?.error || 'Insufficient balance'),
          })
        }
      } else if (diff < 0) {
        const { error: refundErr } = await sb.rpc('refund_balance', { p_user_id: caller.id, p_amount: -diff })
        if (refundErr) return res.status(500).json({ error: refundErr.message })
      }

      const updates = {
        updated_at:  new Date().toISOString(),
        name:        req.body.name || order.name,
        nodes_json:  JSON.stringify(nodes),
        edges_json:  JSON.stringify(edges),
        total_price: newTotal,
        node_count:  nodes.length,
        edge_count:  edges.length,
      }
      const { error: updErr } = await sb.from('structure_orders').update(updates).eq('id', id)
      if (updErr) {
        // Roll back the balance change if the row update itself failed to save
        if (diff > 0) await sb.rpc('refund_balance', { p_user_id: caller.id, p_amount: diff })
        else if (diff < 0) await sb.rpc('deduct_balance', { p_user_id: caller.id, p_amount: -diff })
        return res.status(500).json({ error: updErr.message })
      }

      if (diff !== 0) {
        try {
          await sb.from('transactions').insert({
            user_id: caller.id,
            type:    'Structure Order Edit',
            method:  diff > 0 ? 'Balance Deduction' : 'Balance Credit',
            amount:  -diff,
            status:  'completed',
            date:    new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          })
        } catch { /* non-fatal */ }
      }

      return res.status(200).json({ success: true, id, total_price: newTotal })
    }

    // Only admins may update order status, notes, or delivery info
    if (!isAdmin) return res.status(403).json({ error: 'Admin access required' })

    const id = req.body.id
    const { data: order, error: fetchErr } = await sb.from('structure_orders').select('*').eq('id', id).single()
    if (fetchErr || !order) return res.status(404).json({ error: 'Order not found' })

    const updates = { updated_at: new Date().toISOString() }
    if (req.body.status        !== undefined) updates.status        = req.body.status
    if (req.body.admin_notes   !== undefined) updates.admin_notes   = req.body.admin_notes
    if (req.body.delivery_info !== undefined) updates.delivery_info = req.body.delivery_info

    const price = Number(order.total_price || 0)
    const isRejection = req.body.status === 'rejected' && order.status !== 'rejected' && price > 0
    // Correcting a mistaken rejection (moving the order OFF 'rejected' to anything
    // else) must re-charge the customer — otherwise the earlier refund stands and
    // whatever the admin marks it as next (done/building/pending) is delivered for
    // free. Blocked entirely if the customer can no longer afford it, rather than
    // silently letting the order proceed unpaid.
    const isUnrejection = order.status === 'rejected' && req.body.status !== undefined && req.body.status !== 'rejected' && price > 0

    if (isUnrejection) {
      const { data: recharge, error: rechargeErr } = await sb.rpc('deduct_balance', { p_user_id: order.user_id, p_amount: price })
      if (rechargeErr) return res.status(500).json({ error: rechargeErr.message })
      if (!recharge?.ok) {
        return res.status(400).json({
          error: `Cannot un-reject: customer's balance is insufficient to re-charge $${price.toFixed(2)}` +
            (recharge?.balance != null ? ` (current balance: $${Number(recharge.balance).toFixed(2)})` : '') +
            '. Ask them to top up first.',
        })
      }
      const { error: updErr } = await sb.from('structure_orders').update(updates).eq('id', id)
      if (updErr) {
        // Roll back the re-charge if the status update itself fails to save
        await sb.rpc('refund_balance', { p_user_id: order.user_id, p_amount: price })
        return res.status(500).json({ error: updErr.message })
      }
      try {
        await sb.from('transactions').insert({
          user_id: order.user_id,
          type:    'Structure Order Re-charge (correction)',
          method:  'Balance Deduction',
          amount:  -price,
          status:  'completed',
          date:    new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        })
      } catch (e) { console.error('[structure-orders] transaction log insert failed (recharge)', e.message) }
    } else if (isRejection) {
      // Make the pending -> rejected transition itself the race guard: only the
      // request whose UPDATE actually flips the status (via .eq('status', order.status)
      // below) gets to refund — two concurrent "reject" clicks can't both refund.
      const { data: updated, error: updErr } = await sb
        .from('structure_orders')
        .update(updates)
        .eq('id', id)
        .eq('status', order.status)
        .select()
        .single()
      if (updErr) return res.status(500).json({ error: updErr.message })

      if (updated) {
        const { error: refundErr } = await sb.rpc('refund_balance', { p_user_id: order.user_id, p_amount: price })
        if (refundErr) {
          console.error('[structure-orders] refund failed', order.user_id, price, refundErr.message)
        } else {
          try {
            await sb.from('transactions').insert({
              user_id: order.user_id,
              type:    'Structure Order Refund',
              method:  'Balance Credit',
              amount:  price,
              status:  'completed',
              date:    new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            })
          } catch (e) { console.error('[structure-orders] transaction log insert failed (refund)', e.message) }
        }
      } else {
        // Someone else already changed the status first — apply the remaining
        // updates (notes/delivery info) without a second refund.
        const { error: fallbackErr } = await sb.from('structure_orders').update(updates).eq('id', id)
        if (fallbackErr) return res.status(500).json({ error: fallbackErr.message })
      }
    } else {
      const { error } = await sb.from('structure_orders').update(updates).eq('id', id)
      if (error) return res.status(500).json({ error: error.message })
    }

    // Sync order_status back to the linked draft
    if (req.body.status !== undefined && order.draft_id) {
      await sb.from('structure_drafts').update({ order_status: req.body.status }).eq('id', order.draft_id)
    }

    return res.status(200).json({ success: true, id })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
