// /api/appearance-settings.js
// GET  — public: returns which landing page template is currently active,
//        and whether the public /products page is enabled
// POST — admin-only: saves those settings
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', 'data', 'appearance-settings.json')

const DEFAULTS = { active_template: 'default', products_page_enabled: true }

function read() {
  try {
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) }
  } catch {
    return { ...DEFAULTS }
  }
}

function write(data) {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.json(read())
  }

  if (req.method === 'POST') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const current = read()
    const body = req.body || {}
    const updated = {
      active_template: typeof body.active_template === 'string' ? body.active_template : current.active_template,
      products_page_enabled: typeof body.products_page_enabled === 'boolean' ? body.products_page_enabled : current.products_page_enabled,
    }
    write(updated)
    return res.json(updated)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
