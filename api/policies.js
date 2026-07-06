import { getSupabase } from './lib/supabase-server.js'
import { buildPolicyPayload } from './lib/policy-utils.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Database not configured' })

  const [{ data: categories, error: categoryError }, { data: translations, error: translationError }] = await Promise.all([
    sb.from('policy_categories').select('*').order('display_order', { ascending: true }).order('name', { ascending: true }),
    sb.from('policy_translations').select('*').order('language', { ascending: true }),
  ])

  if (categoryError) return res.status(500).json({ error: categoryError.message })
  if (translationError) return res.status(500).json({ error: translationError.message })

  return res.status(200).json({
    categories: buildPolicyPayload(categories || [], translations || [], { publicOnly: true }),
  })
}
