import crypto from 'crypto'

const SECRET = process.env.SESSION_SECRET || 'adver-dev-secret-change-in-prod'
const COOKIE = 'adver_session'
const MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

// ── Token sign / verify ───────────────────────────────────────────────────────

export function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig  = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null
  const i = token.lastIndexOf('.')
  if (i < 1) return null
  const data = token.slice(0, i)
  const sig  = token.slice(i + 1)
  const exp  = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  try {
    const sBuf = Buffer.from(sig, 'base64url')
    const eBuf = Buffer.from(exp, 'base64url')
    if (sBuf.length !== eBuf.length || !crypto.timingSafeEqual(sBuf, eBuf)) return null
  } catch { return null }
  try { return JSON.parse(Buffer.from(data, 'base64url').toString()) }
  catch { return null }
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

export function tokenFromRequest(req) {
  // Try httpOnly cookie first
  for (const part of (req.headers?.cookie || '').split(';')) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    const k = part.slice(0, eq).trim()
    if (k === COOKIE) return part.slice(eq + 1).trim()
  }
  // Fall back to Authorization header (needed for local dev in some setups)
  const auth = req.headers?.authorization || ''
  if (auth.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export function sessionCookieHeader(token) {
  const secure = process.env.NODE_ENV !== 'development' ? '; Secure' : ''
  return `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${MAX_AGE}${secure}`
}

export function clearCookieHeader() {
  const secure = process.env.NODE_ENV !== 'development' ? '; Secure' : ''
  return `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`
}

// ── Public-path rules — no auth required ─────────────────────────────────────

export function isPublicPath(method, pathname, searchParams) {
  // Auth endpoints
  if (pathname === '/api/auth/login'    && method === 'POST') return true
  if (pathname === '/api/auth/logout'   && method === 'POST') return true
  if (pathname === '/api/auth/register' && method === 'POST') return true
  if (pathname === '/api/admin/login'   && method === 'POST') return true
  // OTP / WhatsApp (forgot-password flow)
  if (pathname.startsWith('/api/otp'))              return true
  if (pathname === '/api/email-otp' && (searchParams?.get?.('action') === 'send' || searchParams?.get?.('action') === 'verify')) return true
  if (pathname.startsWith('/api/whatsapp'))         return true
  // Forgot-password (email OTP + reset) — the user isn't logged in yet, so
  // every step of this flow has to be public. Ownership/proof-of-identity is
  // enforced inside password-reset.js itself (via the emailed OTP and the
  // signed, short-lived reset token), not by session auth.
  if (pathname === '/api/password-reset' && method === 'POST') {
    const action = searchParams?.get?.('action')
    if (action === 'request' || action === 'verify' || action === 'complete') return true
  }
  if (pathname === '/api/platform-config' && method === 'GET') return true
  if (pathname === '/api/policies' && method === 'GET') return true
  if (pathname === '/api/payment-methods' && method === 'GET') return true
  if (pathname === '/api/policy-orders' && method === 'POST') return true
  if (pathname === '/api/appearance-settings' && method === 'GET') return true
  if (pathname === '/api/public-products' && method === 'GET') return true
  if (pathname === '/api/account-types' && method === 'GET') return true
  if (pathname === '/api/admin/platform-settings' && method === 'GET') return true
  if (pathname === '/api/admin/upload-asset' && method === 'POST') return true
  // Called by Supabase pg_cron (no browser session) — gated by its own
  // shared-secret check inside the handler, not session auth.
  if (pathname === '/api/textverified' && method === 'POST' && searchParams?.get?.('action') === 'sweep') return true
  if (pathname === '/api/verification-requests' && method === 'GET' && searchParams?.get?.('token')) return true
  if (pathname === '/api/verification-requests' && method === 'PATCH' && searchParams?.get?.('token')) return true
  // Registration goes exclusively through /api/auth/register now — the old
  // POST /api/crud?table=users path used to double as a second, weaker
  // registration flow (client-side password hashing, no session cookie set,
  // no validation that the hash was even well-formed). Removed as a public
  // path; the generic users handler now requires admin for any write.
  return false
}
