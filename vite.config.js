import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { verifyToken, tokenFromRequest, isPublicPath } from './api/lib/auth-middleware.js'

// Load .env vars into process.env (Vite only exposes VITE_* to the browser)
function loadEnvIntoProcess() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
      if (!m) continue
      const [, key, val] = m
      if (!process.env[key])
        process.env[key] = val.replace(/^['"]|['"]$/g, '').replace(/\r$/, '').trim()
    }
  } catch { /* .env is optional */ }
  if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL)
    process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL
}

// Mirrors vercel.json rewrites: which URL paths map to which handler file + table
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
  // Direct file: /api/admin/stats → api/admin/stats.js
  return { file: pathname.replace(/^\//, '') + '.js', table: null }
}

function localApiPlugin() {
  loadEnvIntoProcess()

  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const url = new URL(req.url, 'http://localhost')
        const pathname = url.pathname

        // Parse JSON body for mutation requests
        let body = {}
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          await new Promise(resolve => {
            let raw = ''
            req.on('data', chunk => { raw += chunk })
            req.on('end', () => {
              try { body = JSON.parse(raw) } catch { body = {} }
              resolve()
            })
          })
        }

        // ── Authentication gate ────────────────────────────────────────────
        let user = null
        if (!isPublicPath(req.method, pathname, url.searchParams)) {
          const token = tokenFromRequest(req)
          user = verifyToken(token)
          if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Authentication required' }))
            return
          }
          if (pathname.startsWith('/api/admin') && user.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Admin access required' }))
            return
          }
        }

        const { file, table } = resolveRoute(pathname)

        // ssrLoadModule loads for Node.js context — does NOT pollute browser module graph
        let handler
        try {
          const mod = await server.ssrLoadModule('/' + file)
          handler = mod.default
        } catch {
          return next()
        }
        if (!handler) return next()

        // Build query: merge URL params + injected table for crud routes
        const query = {}
        url.searchParams.forEach((v, k) => { query[k] = v })
        if (table) query.table = table

        // fakeRes supports setHeader so login can set the httpOnly cookie in dev
        let statusCode = 200
        const extraHeaders = {}
        const fakeRes = {
          status(code) { statusCode = code; return fakeRes },
          setHeader(k, v) { extraHeaders[k] = v; return fakeRes },
          json(data) {
            if (!res.headersSent) {
              res.writeHead(statusCode, { 'Content-Type': 'application/json', ...extraHeaders })
              res.end(JSON.stringify(data))
            }
          },
        }

        try {
          await handler(
            { method: req.method, url: req.url, headers: req.headers, body, query, user },
            fakeRes,
          )
        } catch (err) {
          console.error(`[api] ${req.method} ${pathname} →`, err.message)
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: err.message }))
          }
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: {
    port: 8765,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options':        'DENY',
      'X-XSS-Protection':       '1; mode=block',
      'Referrer-Policy':        'strict-origin-when-cross-origin',
      'Permissions-Policy':     'camera=(), microphone=(), geolocation=()',
    },
  },
  build: {
    // Raise warning threshold so we see real problems
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — tiny, cached forever
          'vendor-react': ['react', 'react-dom'],
          // ReactFlow is large (~400 kB) — only loaded on builder page
          'vendor-flow': ['@xyflow/react'],
          // Admin pages — not loaded by regular users
          'admin': [
            './src/admin/AdminDashboard.jsx',
            './src/admin/AdminOtherPages.jsx',
            './src/admin/AdminAllOrdersPage.jsx',
            './src/admin/AdminStructureOrdersPage.jsx',
            './src/admin/AdminPolicyManagementPage.jsx',
            './src/admin/AdminPolicyPaymentsPage.jsx',
            './src/admin/AdminAccountTypesPage.jsx',
            './src/admin/AdminWhatsAppPage.jsx',
            './src/admin/AdminStructureAssetsPage.jsx',
          ],
          // Policy portal — only loaded on /policies route
          'policies': [
            './src/policies/PolicyPortalPage.jsx',
            './src/policies/OrderModal.jsx',
          ],
        },
      },
    },
  },
})
