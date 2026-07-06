import { stores } from './crud.js'

export default async function handler(req, res) {
  const method  = req.method
  const caller  = req.user
  const isAdmin = caller?.role === 'admin'
  const orders  = stores.structure_orders

  if (method === 'POST') {
    const order = {
      id: Date.now(),
      // Force user identity from the verified session — never trust the body
      user_id:    caller.id,
      user_name:  req.body.user_name  || '',
      user_email: caller.email        || '',
      draft_id:   req.body.draft_id   != null ? String(req.body.draft_id) : null,
      order_code: 'STR-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      name:       req.body.name       || 'Structure Order',
      nodes_json: JSON.stringify(req.body.nodes || []),
      edges_json: JSON.stringify(req.body.edges || []),
      total_price: req.body.total_price || 0,
      node_count:  req.body.node_count  || 0,
      edge_count:  req.body.edge_count  || 0,
      status:      'pending',
      admin_notes: '',
      submitted_at: new Date().toISOString(),
      completed_at: null,
      created_at:   new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    }
    orders.unshift(order)
    return res.status(201).json({ success: true, id: order.id, order_code: order.order_code, status: 'pending' })
  }

  if (method === 'GET') {
    // Fetch a single order by ID
    if (req.query.id) {
      const order = orders.find(o => String(o.id) === String(req.query.id))
      if (!order) return res.status(404).json({ error: 'Order not found' })
      if (!isAdmin && String(order.user_id) !== String(caller.id)) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      return res.status(200).json({ order })
    }

    if (req.query.mine) {
      // Non-admins always get their own orders; admins can scope by user_id param
      const uid = isAdmin ? (req.query.user_id || null) : caller.id
      const result = (uid
        ? orders.filter(o => String(o.user_id) === String(uid))
        : [...orders]
      ).sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
      return res.status(200).json({ orders: result })
    }

    // Unfiltered list — admin sees all, non-admin sees only their own
    const base = isAdmin
      ? [...orders]
      : orders.filter(o => String(o.user_id) === String(caller.id))
    return res.status(200).json({
      orders: base.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
    })
  }

  if (method === 'PUT') {
    // Only admins may update order status, notes, or delivery info
    if (!isAdmin) return res.status(403).json({ error: 'Admin access required' })

    const id = req.body.id
    const order = orders.find(o => String(o.id) === String(id))
    if (!order) return res.status(404).json({ error: 'Order not found' })

    if (req.body.status        !== undefined) order.status        = req.body.status
    if (req.body.admin_notes   !== undefined) order.admin_notes   = req.body.admin_notes
    if (req.body.delivery_info !== undefined) order.delivery_info = req.body.delivery_info
    order.updated_at = new Date().toISOString()

    // Sync order_status back to the linked draft
    if (req.body.status !== undefined && order.draft_id) {
      const draft = stores.structure_drafts.find(d => String(d.id) === String(order.draft_id))
      if (draft) draft.order_status = req.body.status
    }

    return res.status(200).json({ success: true, id })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
