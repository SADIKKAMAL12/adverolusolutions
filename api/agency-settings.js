// /api/agency-settings.js
// GET  — returns current agency settings (public once authed)
// POST — admin-only: saves settings
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', 'data', 'agency-settings.json')

function read() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch {
    return { creditLineColor: '#e8192c', milestones: [] }
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
      creditLineColor: body.creditLineColor ?? current.creditLineColor ?? '#e8192c',
      milestones: Array.isArray(body.milestones) ? body.milestones : current.milestones,
    }
    write(updated)
    return res.json(updated)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
