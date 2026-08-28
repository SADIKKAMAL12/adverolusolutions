import { getSupabase } from './lib/supabase-server.js'
import { sendOrderNotification } from './admin/order-notifications.js'

async function readPlatformMap(sb) {
  const { data } = await sb.from('platform_settings').select('data').eq('id', 1).single()
  const d = data?.data?.verification_settings || {}
  return {
    map: d.verification_platform_map || {},
    platforms: d.verification_platforms || [],
    defaultExpiryDays: d.verification_default_expiry_days ?? null,
  }
}

export default async function handler(req, res) {
  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Database not configured' })

  const token = req.query.token

  // ── Public: fetch one request by token ──
  if (req.method === 'GET' && token) {
    const { data, error } = await sb.from('verification_requests').select('*').eq('token', token).single()
    if (error || !data) return res.status(404).json({ error: 'Request not found' })
    if (data.expires_at && new Date(data.expires_at) < new Date() && data.status === 'pending') {
      return res.status(410).json({ error: 'This link has expired' })
    }
    const { map, platforms } = await readPlatformMap(sb)
    const account_type_options = map[data.platform] || []
    const platform_label = platforms.find(p => p.key === data.platform)?.label || data.platform
    return res.status(200).json({ ...data, account_type_options, platform_label })
  }

  // ── Public: customer submits their info ──
  if (req.method === 'PATCH' && token) {
    const { account_type, account_email, amount_paid } = req.body || {}
    if (!account_type?.trim()) return res.status(400).json({ error: 'Account type required' })
    if (!account_email?.trim()) return res.status(400).json({ error: 'Account email required' })
    if (amount_paid === undefined || amount_paid === null || amount_paid === '') {
      return res.status(400).json({ error: 'Amount paid required' })
    }
    const { data: existing, error: fetchErr } = await sb.from('verification_requests').select('*').eq('token', token).single()
    if (fetchErr || !existing) return res.status(404).json({ error: 'Request not found' })
    if (existing.status !== 'pending') return res.status(409).json({ error: 'This request has already been submitted' })
    if (existing.expires_at && new Date(existing.expires_at) < new Date()) return res.status(410).json({ error: 'This link has expired' })

    const { data, error } = await sb
      .from('verification_requests')
      .update({
        account_type: account_type.trim(),
        account_email: account_email.trim(),
        amount_paid: Number(amount_paid),
        status: 'requested',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('token', token)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })

    sendOrderNotification('verification', {
      ticket_id: data.request_id || data.id,
      account_type: data.account_type || data.platform,
      name: data.customer_name || '',
      email: data.account_email,
    })

    return res.status(200).json(data)
  }

  // ── Admin: list all requests ──
  if (req.method === 'GET') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const { data, error } = await sb.from('verification_requests').select('*').order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  // ── Admin: generate a new request link ──
  if (req.method === 'POST') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const { platform, customer_name, expires_days } = req.body || {}
    if (!platform?.trim()) return res.status(400).json({ error: 'Platform required' })

    const { defaultExpiryDays } = await readPlatformMap(sb)

    const effectiveExpiryDays = expires_days !== undefined && expires_days !== null && expires_days !== ''
      ? Number(expires_days)
      : defaultExpiryDays
    const expires_at = effectiveExpiryDays ? new Date(Date.now() + effectiveExpiryDays * 86400000).toISOString() : null

    const token = crypto.randomUUID()
    const request_id = `#VER-${Date.now().toString(36).toUpperCase()}`

    const { data, error } = await sb
      .from('verification_requests')
      .insert({
        token,
        request_id,
        platform: platform.trim(),
        customer_name: customer_name?.trim() || null,
        status: 'pending',
        expires_at,
      })
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  // ── Admin: update status ──
  if (req.method === 'PUT') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const { id, status, replacement_link } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required' })
    if (!['in_review', 'rejected', 'verified', 'requested'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    const updates = { status, updated_at: new Date().toISOString() }
    // Only rejected requests carry a replacement link — a link submitted (or
    // left blank, meaning "not replaceable / out of warranty") alongside the
    // rejection itself. Every other status leaves whatever link is already
    // stored untouched.
    if (status === 'rejected') {
      updates.replacement_link = replacement_link?.trim() || null
    }
    const { data, error } = await sb
      .from('verification_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  // ── Admin: delete/revoke a request ──
  if (req.method === 'DELETE') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'ID required' })
    const { error } = await sb.from('verification_requests').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
