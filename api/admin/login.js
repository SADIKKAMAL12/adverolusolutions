import bcrypt from 'bcryptjs'
import { getSupabase } from '../lib/supabase-server.js'
import { signToken, sessionCookieHeader } from '../lib/auth-middleware.js'

const SAFE_COLS = 'id,name,email,role,status,balance,accounts,phone,joined,created_at'

// Simple in-memory rate limiter: max 10 attempts per IP per 15 minutes
const loginAttempts = new Map()
const RATE_WINDOW = 15 * 60 * 1000
const RATE_MAX = 10
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW
  for (const [ip, entry] of loginAttempts) {
    if (entry.resetAt < cutoff) loginAttempts.delete(ip)
  }
}, 5 * 60 * 1000)

function isRateLimited(ip) {
  const now = Date.now()
  let entry = loginAttempts.get(ip)
  if (!entry || entry.resetAt < now - RATE_WINDOW) {
    entry = { count: 0, resetAt: now }
    loginAttempts.set(ip, entry)
  }
  entry.count++
  return entry.count > RATE_MAX
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many login attempts. Please wait 15 minutes.' })
  }

  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Database not configured' })

  const { data: user, error } = await sb
    .from('users')
    .select(`${SAFE_COLS},password_hash`)
    .ilike('email', email)
    .single()

  // Same error for wrong email or wrong password — no user enumeration
  const DENIED = 'Invalid credentials'
  if (error || !user) return res.status(401).json({ error: DENIED })

  const valid = await bcrypt.compare(password, user.password_hash || '')
  if (!valid) return res.status(401).json({ error: DENIED })

  // Server enforces admin requirement — non-admin accounts get 403 regardless of client state
  if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })

  if (user.status === 'banned') return res.status(403).json({ error: 'Account suspended' })

  const { password_hash, ...safeUser } = user
  const token = signToken({ id: safeUser.id, role: safeUser.role, email: safeUser.email })
  res.setHeader('Set-Cookie', sessionCookieHeader(token))
  return res.status(200).json(safeUser)
}
