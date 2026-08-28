import { getSupabase } from './lib/supabase-server.js'

export default async function handler(req, res) {
  const method  = req.method
  const caller  = req.user
  const isAdmin = caller?.role === 'admin'
  const sb      = getSupabase()

  if (method === 'GET') {
    if (req.query.id) {
      const { data: draft, error } = await sb.from('structure_drafts').select('*').eq('id', req.query.id).single()
      if (error || !draft) return res.status(404).json({ error: 'Draft not found' })
      if (!isAdmin && String(draft.user_id) !== String(caller.id)) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      return res.status(200).json({ draft })
    }

    // Non-admins always see only their own drafts regardless of any user_id param
    const uid = isAdmin ? (req.query.user_id || null) : caller.id
    let q = sb.from('structure_drafts').select('*').order('updated_at', { ascending: false })
    if (uid) q = q.eq('user_id', uid)
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ drafts: data || [] })
  }

  if (method === 'POST') {
    const draft = {
      id: String(Date.now()),
      // Force user_id from session — body value is ignored
      user_id:      caller.id,
      name:         req.body.name || 'Untitled Structure',
      nodes_json:   JSON.stringify(req.body.nodes || []),
      edges_json:   JSON.stringify(req.body.edges || []),
      total_price:  req.body.total_price || 0,
      node_count:   req.body.node_count  || 0,
      edge_count:   req.body.edge_count  || 0,
      submitted:    false,
      order_id:     null,
      order_status: null,
    }
    const { data, error } = await sb.from('structure_drafts').insert(draft).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ success: true, id: data.id, name: data.name })
  }

  if (method === 'PUT') {
    const id = req.body.id ?? req.query.id
    const { data: draft, error: fetchErr } = await sb.from('structure_drafts').select('*').eq('id', id).single()
    if (fetchErr || !draft) return res.status(404).json({ error: 'Draft not found' })

    // Only the owner or an admin may update a draft
    if (!isAdmin && String(draft.user_id) !== String(caller.id)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const updates = { updated_at: new Date().toISOString() }
    if (req.body.name         !== undefined) updates.name        = req.body.name
    if (req.body.nodes        !== undefined) updates.nodes_json  = JSON.stringify(req.body.nodes)
    if (req.body.edges        !== undefined) updates.edges_json  = JSON.stringify(req.body.edges)
    if (req.body.total_price  !== undefined) updates.total_price = req.body.total_price
    if (req.body.node_count   !== undefined) updates.node_count  = req.body.node_count
    if (req.body.edge_count   !== undefined) updates.edge_count  = req.body.edge_count
    if (req.body.submitted    !== undefined) updates.submitted   = req.body.submitted
    if (req.body.order_id     !== undefined) updates.order_id    = req.body.order_id
    // order_status is set by the order handler when status changes — not writable by users
    if (isAdmin && req.body.order_status !== undefined) updates.order_status = req.body.order_status

    const { error } = await sb.from('structure_drafts').update(updates).eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, id })
  }

  if (method === 'DELETE') {
    const id = req.query.id
    const { data: draft, error: fetchErr } = await sb.from('structure_drafts').select('user_id').eq('id', id).single()
    if (fetchErr || !draft) return res.status(404).json({ error: 'Draft not found' })

    // Only the owner or an admin may delete a draft
    if (!isAdmin && String(draft.user_id) !== String(caller.id)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { error } = await sb.from('structure_drafts').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
