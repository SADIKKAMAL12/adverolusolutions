import { getSupabase } from '../lib/supabase-server.js'

const DEFAULTS = {
  verification_platforms: [],
  verification_platform_map: {},
  verification_default_expiry_days: null,
}

async function storeLogo(sb, id, logoData) {
  if (!logoData || !logoData.startsWith('data:')) return logoData
  const matches = logoData.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches) return logoData
  const mimeType = matches[1]
  const buf = Buffer.from(matches[2], 'base64')
  const ext = mimeType.split('/')[1]?.split('+')[0] || 'png'
  const filename = `verification-type-logos/${id}.${ext}`
  const { error } = await sb.storage.from('proofs').upload(filename, buf, { contentType: mimeType, upsert: true })
  if (error) return logoData
  const { data: urlData } = sb.storage.from('proofs').getPublicUrl(filename)
  return urlData.publicUrl
}

async function readConfig() {
  const sb = getSupabase()
  if (sb) {
    const { data, error } = await sb.from('platform_settings').select('data').eq('id', 1).single()
    if (!error && data?.data?.verification_settings) {
      return { ...DEFAULTS, ...data.data.verification_settings }
    }
  }
  return { ...DEFAULTS }
}

async function writeConfig(cfg) {
  const sb = getSupabase()
  if (!sb) return
  const { data: row } = await sb.from('platform_settings').select('data').eq('id', 1).single()
  const merged = { ...(row?.data || {}), verification_settings: cfg }
  await sb.from('platform_settings').upsert({ id: 1, data: merged, updated_at: new Date().toISOString() })
}

export default async function handler(req, res) {
  const sb = getSupabase()

  if (req.method === 'GET') {
    const cfg = await readConfig()
    return res.status(200).json(cfg)
  }
  if (req.method === 'POST') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const current = await readConfig()
    const updated = { ...current, ...(req.body || {}) }

    // Upload any newly-added logo data-URIs to storage, replacing them with public URLs
    if (sb && updated.verification_platform_map) {
      for (const [platform, types] of Object.entries(updated.verification_platform_map)) {
        if (!Array.isArray(types)) continue
        for (const t of types) {
          if (t.logo && t.logo.startsWith('data:')) {
            t.logo = await storeLogo(sb, `vt-${t.id}`, t.logo)
          }
        }
      }
    }

    await writeConfig(updated)
    return res.status(200).json({ success: true, verification_platform_map: updated.verification_platform_map })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
