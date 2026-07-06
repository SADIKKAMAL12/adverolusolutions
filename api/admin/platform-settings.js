import { getSupabase } from '../lib/supabase-server.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FALLBACK_FILE = path.join(__dirname, '..', '..', 'data', 'platform_settings.json')

const DEFAULTS = {
  allow_signup: true,
  maintenance_mode: false,
  min_deposit: 100,
  global_discount: 0,
  contact_email: '',
  contact_whatsapp: '',
  contact_telegram: '',
  site_name: 'AdverSolutions',
  footer_text: '© AdverSolutions. All rights reserved.',
  site_logo: '',
  site_favicon: '',
  wa_enabled: true,
  wa_number: '',
  wa_position: 'right',
  wa_color: '#25d366',
  wa_animation: 'wiggle_pulse',
  wa_size: 'medium',
  email_otp_enabled: false,
  email_otp_expiry: 10,
  email_otp_max_attempts: 3,
  email_otp_cooldown: 60,
  smtp_host: 'mail.spacemail.com',
  smtp_port: '465',
  smtp_user: 'support@adversolutions.agency',
  smtp_pass: '',
}

async function readSettings() {
  const sb = getSupabase()
  if (sb) {
    const { data, error } = await sb
      .from('platform_settings')
      .select('data')
      .eq('id', 1)
      .single()
    if (!error && data?.data) return { ...DEFAULTS, ...data.data }
  }
  // Fallback to local JSON
  try { return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8')) } }
  catch { return { ...DEFAULTS } }
}

async function writeSettings(merged) {
  const sb = getSupabase()
  if (sb) {
    await sb
      .from('platform_settings')
      .upsert({ id: 1, data: merged, updated_at: new Date().toISOString() })
  }
  // Always keep local file as backup
  try {
    fs.mkdirSync(path.dirname(FALLBACK_FILE), { recursive: true })
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(merged, null, 2))
  } catch { /* ignore */ }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const settings = await readSettings()
    return res.status(200).json(settings)
  }

  if (req.method === 'POST') {
    // Admin-only write
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const current = await readSettings()
    const body = req.body || {}
    // Only allow known keys — prevents arbitrary field injection
    const ALLOWED_KEYS = new Set(Object.keys(DEFAULTS))
    const filtered = {}
    for (const key of Object.keys(body)) {
      if (ALLOWED_KEYS.has(key)) filtered[key] = body[key]
    }
    const merged = { ...current, ...filtered }
    await writeSettings(merged)
    return res.status(200).json({ success: true, settings: merged })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
