import { getSupabase } from '../lib/supabase-server.js'
import { getAccountBalance, searchServices, getVerificationPrice, getRentalPrice } from '../lib/adversolutionsotp.js'

const DEFAULTS = {
  api_key: '',
  api_email: '',
  markup_percent: 40,
  rental_markup_percent: 40,
  allowed_services: [],
}

async function storeLogo(sb, id, logoData) {
  if (!logoData || !logoData.startsWith('data:')) return logoData
  const matches = logoData.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches) return logoData
  const mimeType = matches[1]
  const buf = Buffer.from(matches[2], 'base64')
  const ext = mimeType.split('/')[1]?.split('+')[0] || 'png'
  const filename = `textverified-service-logos/${id}.${ext}`
  const { error } = await sb.storage.from('proofs').upload(filename, buf, { contentType: mimeType, upsert: true })
  if (error) return logoData
  const { data: urlData } = sb.storage.from('proofs').getPublicUrl(filename)
  return urlData.publicUrl
}

async function readConfig() {
  const sb = getSupabase()
  if (sb) {
    const { data, error } = await sb.from('platform_settings').select('data').eq('id', 1).single()
    if (!error && data?.data?.textverified_settings) {
      return { ...DEFAULTS, ...data.data.textverified_settings }
    }
  }
  return { ...DEFAULTS }
}

async function writeConfig(cfg) {
  const sb = getSupabase()
  if (!sb) return
  const { data: row } = await sb.from('platform_settings').select('data').eq('id', 1).single()
  const merged = { ...(row?.data || {}), textverified_settings: cfg }
  await sb.from('platform_settings').upsert({ id: 1, data: merged, updated_at: new Date().toISOString() })
}

function maskConfig(cfg) {
  const { api_key, ...rest } = cfg
  return {
    ...rest,
    api_key_last4: api_key ? api_key.slice(-4) : '',
    api_key_configured: !!api_key,
  }
}

export default async function handler(req, res) {
  const sb = getSupabase()

  if (req.method === 'GET') {
    const action = req.query.action
    const cfg = await readConfig()

    if (action === 'balance') {
      try {
        const balance = await getAccountBalance()
        return res.status(200).json({ balance })
      } catch (e) {
        return res.status(502).json({ error: e.message })
      }
    }

    if (action === 'catalog') {
      try {
        const results = await searchServices(req.query.q || '', 'verification')
        return res.status(200).json(results)
      } catch (e) {
        return res.status(502).json({ error: e.message })
      }
    }

    // On-demand check (not automatic) — each call makes 2 real TextVerified pricing
    // requests per allowed service, so this only runs when the admin asks for it.
    if (action === 'availability') {
      const allowed = Array.isArray(cfg.allowed_services) ? cfg.allowed_services : []
      const results = await Promise.all(allowed.map(async (s) => {
        const [verification, rental] = await Promise.all([
          getVerificationPrice(s.service_name).then(() => true).catch(() => false),
          getRentalPrice(s.service_name, 'oneDay').then(() => true).catch(() => false),
        ])
        return { service_name: s.service_name, verification, rental }
      }))
      return res.status(200).json(results)
    }

    return res.status(200).json(maskConfig(cfg))
  }

  if (req.method === 'POST') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const current = await readConfig()
    const body = req.body || {}

    // Don't overwrite the real key with a masked placeholder if the admin
    // didn't actually change it (frontend never sends the real value back)
    const updated = { ...current, ...body }
    if (!body.api_key || body.api_key === current.api_key_last4) {
      updated.api_key = current.api_key
    }

    if (sb && Array.isArray(updated.allowed_services)) {
      for (const s of updated.allowed_services) {
        if (s.logo && s.logo.startsWith('data:')) {
          s.logo = await storeLogo(sb, `tv-${s.service_name}`, s.logo)
        }
      }
    }

    await writeConfig(updated)
    return res.status(200).json({ success: true, ...maskConfig(updated) })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
