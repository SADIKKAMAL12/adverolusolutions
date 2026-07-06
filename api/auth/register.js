import bcrypt from 'bcryptjs'
import { getSupabase } from '../lib/supabase-server.js'
import { signToken, sessionCookieHeader } from '../lib/auth-middleware.js'

const SAFE_COLS = 'id,name,email,role,status,balance,accounts,phone,joined,created_at'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, password, phone } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
  if (email.length > 255) return res.status(400).json({ error: 'Invalid email' })

  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Database not configured' })

  // Check if email already exists
  const { data: existing } = await sb
    .from('users')
    .select('id')
    .ilike('email', email)
    .maybeSingle()

  if (existing) return res.status(409).json({ error: 'An account with this email already exists' })

  const password_hash = await bcrypt.hash(password, 12)
  const id = crypto.randomUUID()

  const { data: newUser, error } = await sb
    .from('users')
    .insert({
      id,
      name:          name.trim(),
      email:         email.toLowerCase().trim(),
      phone:         phone || null,
      role:          'user',
      status:        'active',
      balance:       0,
      accounts:      0,
      joined:        new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      password_hash,
      created_at:    new Date().toISOString(),
    })
    .select(SAFE_COLS)
    .single()

  if (error || !newUser) {
    console.error('[register] insert error:', error?.message)
    return res.status(500).json({ error: 'Failed to create account. Please try again.' })
  }

  const token = signToken({ id: newUser.id, role: newUser.role, email: newUser.email })
  res.setHeader('Set-Cookie', sessionCookieHeader(token))
  return res.status(201).json(newUser)
}
