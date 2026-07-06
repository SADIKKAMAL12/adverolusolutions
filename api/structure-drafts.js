import { stores } from './crud.js'

export default async function handler(req, res) {
  const method  = req.method
  const caller  = req.user
  const isAdmin = caller?.role === 'admin'
  const drafts  = stores.structure_drafts

  if (method === 'GET') {
    if (req.query.id) {
      const draft = drafts.find(d => String(d.id) === String(req.query.id))
      if (!draft) return res.status(404).json({ error: 'Draft not found' })
      if (!isAdmin && String(draft.user_id) !== String(caller.id)) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      return res.status(200).json({ draft })
    }

    // Non-admins always see only their own drafts regardless of any user_id param
    const uid = isAdmin ? (req.query.user_id || null) : caller.id
    const filtered = (uid
      ? drafts.filter(d => String(d.user_id) === String(uid))
      : [...drafts]
    ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    return res.status(200).json({ drafts: filtered })
  }

  if (method === 'POST') {
    const draft = {
      id: Date.now(),
      // Force user_id from session — body value is ignored
      user_id:     caller.id,
      name:        req.body.name || 'Untitled Structure',
      nodes_json:  JSON.stringify(req.body.nodes || []),
      edges_json:  JSON.stringify(req.body.edges || []),
      total_price: req.body.total_price || 0,
      node_count:  req.body.node_count  || 0,
      edge_count:  req.body.edge_count  || 0,
      submitted:   false,
      order_id:    null,
      order_status: null,
      created_at:  new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    }
    drafts.unshift(draft)
    return res.status(201).json({ success: true, id: draft.id, name: draft.name })
  }

  if (method === 'PUT') {
    const id = req.body.id ?? req.query.id
    const draft = drafts.find(d => String(d.id) === String(id))
    if (!draft) return res.status(404).json({ error: 'Draft not found' })

    // Only the owner or an admin may update a draft
    if (!isAdmin && String(draft.user_id) !== String(caller.id)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (req.body.name         !== undefined) draft.name         = req.body.name
    if (req.body.nodes        !== undefined) draft.nodes_json   = JSON.stringify(req.body.nodes)
    if (req.body.edges        !== undefined) draft.edges_json   = JSON.stringify(req.body.edges)
    if (req.body.total_price  !== undefined) draft.total_price  = req.body.total_price
    if (req.body.node_count   !== undefined) draft.node_count   = req.body.node_count
    if (req.body.edge_count   !== undefined) draft.edge_count   = req.body.edge_count
    if (req.body.submitted    !== undefined) draft.submitted    = req.body.submitted
    if (req.body.order_id     !== undefined) draft.order_id     = req.body.order_id
    // order_status is set by the order handler when status changes — not writable by users
    if (isAdmin && req.body.order_status !== undefined) draft.order_status = req.body.order_status
    draft.updated_at = new Date().toISOString()
    return res.status(200).json({ success: true, id })
  }

  if (method === 'DELETE') {
    const id = req.query.id
    const idx = drafts.findIndex(d => String(d.id) === String(id))
    if (idx === -1) return res.status(404).json({ error: 'Draft not found' })

    // Only the owner or an admin may delete a draft
    if (!isAdmin && String(drafts[idx].user_id) !== String(caller.id)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    drafts.splice(idx, 1)
    return res.status(200).json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
