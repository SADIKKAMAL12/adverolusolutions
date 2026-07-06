import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { verifyToken, tokenFromRequest, isPublicPath } from './api/lib/auth-middleware.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Load .env into process.env ────────────────────────────────────────────────
try {
  const raw = fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    const [, key, val] = m
    if (!process.env[key])
      process.env[key] = val.replace(/^['"]|['"]$/g, '').replace(/\r$/, '').trim()
  }
} catch { /* .env is optional */ }

// Alias VITE_SUPABASE_* → SUPABASE_* so api handlers work the same way
if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL)
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL
if (!process.env.SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY)
  process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

// ── Route map (mirrors vite.config.js CRUD_MAP) ───────────────────────────────
const CRUD_MAP = {
  '/api/users':               'users',
  '/api/transactions':        'transactions',
  '/api/orders':              'orders',
  '/api/deposits':            'deposits',
  '/api/media-buyers':        'media_buyers',
  '/api/payment-methods':     'payment_methods',
  '/api/business-types':      'business_types',
  '/api/support-tickets':     'support_tickets',
  '/api/inventory-products':  'inventory_products',
  '/api/inventory-lines':     'inventory_lines',
  '/api/purchases':           'purchases',
  '/api/projects':            'projects',
  '/api/announcements':       'announcements',
  '/api/ad-account-requests': 'ad_account_requests',
  '/api/platform-prices':     'platform_prices',
  '/api/settings':            'settings',
}

function resolveRoute(pathname) {
  if (CRUD_MAP[pathname]) return { file: 'api/crud.js', table: CRUD_MAP[pathname] }
  // Direct handler: /api/admin/stats → api/admin/stats.js
  return { file: pathname.replace(/^\//, '') + '.js', table: null }
}

// ── Security headers ──────────────────────────────────────────────────────────
const SUPABASE_HOST = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '')
  .replace(/^https?:\/\//, '').split('/')[0]

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // React's style props require unsafe-inline; Google Fonts stylesheet also needs it
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Supabase Storage for proof images and payment-method logos
  `img-src 'self' data: blob: ${SUPABASE_HOST ? 'https://' + SUPABASE_HOST : ''}`.trim(),
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

// ── App ───────────────────────────────────────────────────────────────────────
const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Apply security headers to every response
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options',    'nosniff')
  res.setHeader('X-Frame-Options',           'DENY')
  res.setHeader('X-XSS-Protection',          '1; mode=block')
  res.setHeader('Referrer-Policy',           'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy',        'camera=(), microphone=(), geolocation=()')
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  res.setHeader('Content-Security-Policy',   CSP)
  next()
})

// ── CORS ─────────────────────────────────────────────────────────────────────
// Only origins in ALLOWED_ORIGINS (env, comma-separated) receive CORS headers.
// Omitting the header for unlisted origins is enough — browsers block the read.
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(o => o.trim()).filter(Boolean)
)

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin',      origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods',     'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers',     'Content-Type, Authorization')
    res.setHeader('Access-Control-Max-Age',           '86400')
    res.setHeader('Vary',                             'Origin')
  }
  // Answer preflight immediately — no auth needed for OPTIONS
  if (req.method === 'OPTIONS') return res.status(204).end()
  next()
})

// ── API middleware ────────────────────────────────────────────────────────────
app.all('/api/*', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  const url = new URL(req.url, 'http://localhost')
  const pathname = url.pathname

  // ── Authentication gate ──────────────────────────────────────────────────
  let user = null
  if (!isPublicPath(req.method, pathname, url.searchParams)) {
    const token = tokenFromRequest(req)
    user = verifyToken(token)
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    // Admin-only paths
    if (pathname.startsWith('/api/admin') && user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
  }

  const { file, table } = resolveRoute(pathname)
  const handlerPath = path.join(__dirname, file)

  let handler
  try {
    const mod = await import(handlerPath + '?t=' + Date.now()) // bust cache on each request in dev
    handler = mod.default
  } catch (err) {
    console.error(`[api] cannot load handler ${file}:`, err.message)
    return res.status(404).json({ error: 'API route not found' })
  }

  if (typeof handler !== 'function') {
    return res.status(500).json({ error: 'Handler is not a function' })
  }

  // Merge URL query params + injected table
  const query = {}
  url.searchParams.forEach((v, k) => { query[k] = v })
  if (table) query.table = table

  try {
    await handler(
      { method: req.method, url: req.url, headers: req.headers, body: req.body, query, user },
      res,
    )
  } catch (err) {
    console.error(`[api] ${req.method} ${pathname} →`, err.message)
    if (!res.headersSent) res.status(500).json({ error: err.message })
  }
})

// ── Static files (built frontend) ────────────────────────────────────────────
const distDir = path.join(__dirname, 'dist')
app.use(express.static(distDir))

// SPA fallback — return index.html for any non-API route
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
  console.log(`[server] Supabase URL: ${process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '(not set)'}`)
})
