import bcrypt from 'bcryptjs'
import { getSupabase } from '../lib/supabase-server.js'
import { signToken, sessionCookieHeader } from '../lib/auth-middleware.js'

const SAFE_COLS = 'id,name,email,role,status,balance,accounts,phone,joined,created_at'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Database not configured' })

  // Fetch user — password_hash is used here only, never sent to client
  const { data: user, error } = await sb
    .from('users')
    .select(`${SAFE_COLS},password_hash`)
    .ilike('email', email)
    .single()

  if (error || !user) return res.status(401).json({ error: 'Invalid email or password' })

  const valid = await bcrypt.compare(password, user.password_hash || '')
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

  if (user.status === 'banned') return res.status(403).json({ error: 'Account suspended' })

  const { password_hash, ...safeUser } = user

  // Sign a session token and deliver it as an httpOnly cookie
  const token = signToken({ id: safeUser.id, role: safeUser.role, email: safeUser.email })
  res.setHeader('Set-Cookie', sessionCookieHeader(token))

  return res.status(200).json(safeUser)
}
