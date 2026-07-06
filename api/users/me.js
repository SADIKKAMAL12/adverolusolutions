import { verifyToken, tokenFromRequest } from '../lib/auth-middleware.js'
import { getSupabase } from '../lib/supabase-server.js'

const SAFE_COLS = 'id,name,email,role,status,balance,accounts,phone,joined,created_at'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const token = tokenFromRequest(req)
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Not authenticated' })

  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Database not configured' })

  const { data: user, error } = await sb
    .from('users')
    .select(SAFE_COLS)
    .eq('id', payload.id)
    .single()

  if (error || !user) return res.status(404).json({ error: 'User not found' })
  if (user.status === 'banned') return res.status(403).json({ error: 'Account suspended' })

  return res.status(200).json(user)
}
