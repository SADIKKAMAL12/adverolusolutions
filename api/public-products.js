// /api/public-products.js
// GET — fully public: returns the Pre-Verified Accounts catalog (name,
// platform, price, country, type, logo, and a live available-stock count)
// for the public /products marketing page. Never exposes inventory_lines
// credential fields (email/password/2fa) — only a count of available ones.
import { getSupabase } from './lib/supabase-server.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Database not configured' })

  const { data: products, error: pErr } = await sb
    .from('inventory_products')
    .select('id,title,platform,price,country,type,logo')
    .order('title', { ascending: true })
  if (pErr) return res.status(500).json({ error: pErr.message })

  const { data: lines, error: lErr } = await sb
    .from('inventory_lines')
    .select('product_id,status')
    .eq('status', 'available')
  if (lErr) return res.status(500).json({ error: lErr.message })

  const counts = {}
  for (const l of lines || []) counts[l.product_id] = (counts[l.product_id] || 0) + 1

  const result = (products || []).map(p => ({ ...p, stock: counts[p.id] || 0 }))
  return res.status(200).json(result)
}
