import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const DATA_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/user-settings.json')

function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) } catch { return {} }
}

function save(data) {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)) } catch {}
}

export default async function handler(req, res) {
  const caller = req.user
  if (!caller) return res.status(401).json({ error: 'Authentication required' })

  const userId = req.query.user_id
  if (!userId) return res.status(400).json({ error: 'user_id required' })

  if (req.method === 'GET') {
    // Non-admins can only read their own settings
    if (caller.role !== 'admin' && String(caller.id) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    const all = load()
    return res.status(200).json(all[userId] || {})
  }

  if (req.method === 'PUT') {
    // Only admins can update user permission settings
    if (caller.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    const all = load()
    all[userId] = { ...(all[userId] || {}), ...(req.body || {}) }
    save(all)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
