import { stores, otpStore } from './crud.js'

// Purge expired entries periodically (only registers once since crud.js is module-cached)
if (!otpStore._purgeRegistered) {
  otpStore._purgeRegistered = true
  setInterval(() => {
    const now = Date.now()
    for (const [k, v] of otpStore) {
      if (typeof v === 'object' && now > v.expiry + 60_000) otpStore.delete(k)
    }
  }, 5 * 60_000)
}

function getCfg() {
  const s = stores.settings || {}
  return {
    enabled:     s.whatsapp_otp_enabled      ?? true,
    expiryMs:   (s.whatsapp_otp_expiry       ?? 10) * 60_000,
    maxAttempts: s.whatsapp_otp_max_attempts ?? 3,
    cooldownMs: (s.whatsapp_otp_cooldown     ?? 60) * 1_000,
    allowSkip:   s.whatsapp_otp_allow_skip   ?? false,
  }
}

const WA_URL = () => (process.env.WHATSAPP_SERVER_URL || 'http://localhost:3002').replace(/\/$/, '')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const action = req.query.action
  const body   = req.body || {}

  // ── Send OTP ──────────────────────────────────────────────────────────────
  if (action === 'send') {
    const { phone } = body
    if (!phone) return res.status(400).json({ error: 'Phone number required' })

    const cfg = getCfg()

    // Check cooldown
    const existing = otpStore.get(phone)
    if (existing) {
      const wait = Math.ceil((cfg.cooldownMs - (Date.now() - existing.sentAt)) / 1000)
      if (wait > 0) {
        return res.status(429).json({ error: `Please wait ${wait}s before requesting another code.` })
      }
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))

    otpStore.set(phone, {
      code,
      expiry:   Date.now() + cfg.expiryMs,
      sentAt:   Date.now(),
      attempts: 0,
    })

    const message =
      `🔐 Your AdverSolutions verification code is: *${code}*\n\n` +
      `This code expires in ${Math.round(cfg.expiryMs / 60_000)} minutes. Do not share it with anyone.`

    try {
      const r = await fetch(`${WA_URL()}/send`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal:  AbortSignal.timeout(10_000),
        body:    JSON.stringify({ phone, message }),
      })
      if (!r.ok) {
        const e = await r.json().catch(() => ({}))
        throw new Error(e.error || `WhatsApp server error (${r.status})`)
      }
      return res.status(200).json({ success: true })
    } catch (err) {
      otpStore.delete(phone)
      return res.status(500).json({ error: err.message || 'Failed to send OTP' })
    }
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────
  if (action === 'verify') {
    const { phone, otp } = body
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' })

    const cfg    = getCfg()
    const record = otpStore.get(phone)

    if (!record) {
      return res.status(400).json({ error: 'No OTP was sent to this number. Please request a new one.' })
    }
    if (Date.now() > record.expiry) {
      otpStore.delete(phone)
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' })
    }
    if (record.attempts >= cfg.maxAttempts) {
      otpStore.delete(phone)
      return res.status(400).json({ error: 'Too many wrong attempts. Please request a new code.' })
    }
    if (String(record.code) !== String(otp).trim()) {
      record.attempts++
      const left = cfg.maxAttempts - record.attempts
      return res.status(400).json({
        error: `Invalid code. ${left} attempt${left === 1 ? '' : 's'} remaining.`,
      })
    }

    otpStore.delete(phone)
    return res.status(200).json({ success: true })
  }

  return res.status(400).json({ error: 'Invalid action' })
}
