import { getSupabase } from '../lib/supabase-server.js'

const DEFAULTS = {
  enabled: false,
  recipient_number: '',
  notify_orders: true,       // purchases / pre-verified account orders
  notify_agency: true,       // agency ad account requests
  notify_deposits: true,     // top-up / deposit requests
  notify_tickets: false,     // support tickets
  message_template_order:
    '🛒 *New Order*\nTicket: {{ticket_id}}\nEmail: {{email}}\nType: {{account_type}}\nAmount: {{amount}}\nPayment: {{payment_method}}',
  message_template_agency:
    '🏢 *New Agency Account Request*\nRequest: {{ticket_id}}\nEmail: {{email}}\nPlatform: {{account_type}}\nBusiness: {{name}}',
  message_template_deposit:
    '💰 *New Deposit / Top-Up*\nEmail: {{email}}\nAmount: {{amount}}\nMethod: {{payment_method}}\nStatus: Pending Review',
  message_template_ticket:
    '🎫 *New Support Ticket*\nFrom: {{email}}\nSubject: {{subject}}',
}

async function readConfig() {
  const sb = getSupabase()
  if (sb) {
    const { data, error } = await sb
      .from('platform_settings')
      .select('data')
      .eq('id', 1)
      .single()
    if (!error && data?.data?.order_notifications) {
      return { ...DEFAULTS, ...data.data.order_notifications }
    }
  }
  return { ...DEFAULTS }
}

async function writeConfig(cfg) {
  const sb = getSupabase()
  if (!sb) return
  const { data: row } = await sb.from('platform_settings').select('data').eq('id', 1).single()
  const merged = { ...(row?.data || {}), order_notifications: cfg }
  await sb.from('platform_settings').upsert({ id: 1, data: merged, updated_at: new Date().toISOString() })
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const cfg = await readConfig()
    return res.status(200).json(cfg)
  }
  if (req.method === 'POST') {
    const current = await readConfig()
    const updated = { ...current, ...(req.body || {}) }
    await writeConfig(updated)
    return res.status(200).json({ success: true })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}

// Exported helper — call from other API handlers after events
export async function sendOrderNotification(type, vars) {
  try {
    const cfg = await readConfig()
    if (!cfg.enabled) return
    if (type === 'order'   && !cfg.notify_orders)   return
    if (type === 'agency'  && !cfg.notify_agency)   return
    if (type === 'deposit' && !cfg.notify_deposits)  return
    if (type === 'ticket'  && !cfg.notify_tickets)   return

    const recipient = cfg.recipient_number?.replace(/\D/g, '')
    if (!recipient) return

    const templateKey = `message_template_${type}`
    let msg = cfg[templateKey] || ''
    for (const [k, v] of Object.entries(vars || {})) {
      msg = msg.replaceAll(`{{${k}}}`, v || '')
    }

    const WA_URL = (process.env.WHATSAPP_SERVER_URL || 'http://localhost:3002').replace(/\/$/, '')
    await fetch(`${WA_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: recipient, message: msg }),
      signal: AbortSignal.timeout(6000),
    })
  } catch {
    // Notifications are best-effort — never block the main flow
  }
}
