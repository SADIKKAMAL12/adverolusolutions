import { getSupabase } from '../lib/supabase-server.js'

// Reads/writes the same `business_types` table the public-facing
// /api/business-types endpoint serves — these used to be two completely
// disconnected in-memory arrays, meaning admin edits here never actually
// reached the dropdown users saw when submitting an ad account request.
export default async function handler(req, res) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const sb = getSupabase()

  if (req.method === 'GET') {
    const { data, error } = await sb.from('business_types').select('name').order('sort_order', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json((data || []).map(r => r.name))
  }

  if (req.method === 'POST') {
    // The admin settings page edits the full list as one textarea and submits
    // it as a complete replacement, not a single addition.
    const names = Array.isArray(req.body?.names) ? req.body.names : []
    const cleaned = names.map(n => String(n || '').trim()).filter(Boolean)

    const { error: delErr } = await sb.from('business_types').delete().neq('id', 0)
    if (delErr) return res.status(500).json({ error: delErr.message })

    if (cleaned.length) {
      const rows = cleaned.map((name, i) => ({ name, sort_order: i + 1 }))
      const { error: insErr } = await sb.from('business_types').insert(rows)
      if (insErr) return res.status(500).json({ error: insErr.message })
    }

    return res.status(201).json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
