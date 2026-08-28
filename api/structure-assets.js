import { getSupabase } from './lib/supabase-server.js'

// Fetches the live, admin-controlled asset catalog — exported so other
// handlers (e.g. structure-orders.js) can price against the same source of
// truth instead of trusting client input. Async because it now reads from
// Supabase rather than an in-memory array that reset on every restart.
export async function getAssets() {
  const sb = getSupabase()
  const { data, error } = await sb.from('structure_assets').select('*').order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return data || []
}

export default async function handler(req, res) {
  const sb = getSupabase()

  if (req.method === 'GET') {
    const assets = await getAssets()
    return res.status(200).json({ assets })
  }

  if (req.method === 'PUT') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const { key, ...updates } = req.body || {}
    if (!key) return res.status(400).json({ error: 'Key required' })
    const { data, error } = await sb.from('structure_assets').update(updates).eq('key', key).select().single()
    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Asset not found' })
    return res.status(200).json({ success: true })
  }

  if (req.method === 'POST') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const body = req.body || {}
    if (!body.key) return res.status(400).json({ error: 'Key required' })
    const { error } = await sb.from('structure_assets').insert(body)
    if (error) {
      if (error.message?.includes('duplicate')) return res.status(400).json({ error: 'Key already exists' })
      return res.status(500).json({ error: error.message })
    }
    return res.status(201).json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
