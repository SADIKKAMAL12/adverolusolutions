import { stores } from './crud.js'

const WA_URL = () => (process.env.WHATSAPP_SERVER_URL || 'http://localhost:3002').replace(/\/$/, '')

async function proxyFetch(path, opts = {}) {
  const r = await fetch(`${WA_URL()}${path}`, { ...opts, signal: AbortSignal.timeout(8000) })
  return { ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) }
}

export default async function handler(req, res) {
  const { type, id } = req.query

  // ── List devices ───────────────────────────────────────────────────────────
  if (req.method === 'GET' && type === 'devices') {
    try {
      const { data } = await proxyFetch('/devices')
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── Add device ─────────────────────────────────────────────────────────────
  if (req.method === 'POST' && type === 'devices') {
    try {
      const { data } = await proxyFetch('/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body || {}),
      })
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── Remove device ──────────────────────────────────────────────────────────
  if (req.method === 'DELETE' && type === 'devices') {
    if (!id) return res.status(400).json({ error: 'id required' })
    try {
      const { data } = await proxyFetch(`/devices/${id}`, { method: 'DELETE' })
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── Set active device ──────────────────────────────────────────────────────
  if (req.method === 'PUT' && type === 'active') {
    if (!id) return res.status(400).json({ error: 'id required' })
    try {
      const { data } = await proxyFetch(`/devices/${id}/active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── QR for specific device ─────────────────────────────────────────────────
  if (req.method === 'GET' && type === 'qr') {
    const endpoint = id ? `/qr/${id}` : '/qr'
    try {
      const { data } = await proxyFetch(endpoint)
      return res.status(200).json(data)
    } catch (err) {
      return res.status(200).json({ status: 'error', error: 'Bridge unreachable' })
    }
  }

  // ── Get OTP config ─────────────────────────────────────────────────────────
  if (req.method === 'GET' && type === 'config') {
    const s = stores.settings || {}
    return res.status(200).json({
      otp_enabled:      s.whatsapp_otp_enabled      ?? true,
      otp_expiry:       s.whatsapp_otp_expiry        ?? 10,
      otp_max_attempts: s.whatsapp_otp_max_attempts  ?? 3,
      otp_cooldown:     s.whatsapp_otp_cooldown      ?? 60,
      allow_skip:       s.whatsapp_otp_allow_skip    ?? false,
      server_url:       WA_URL(),
    })
  }

  // ── Save OTP config ────────────────────────────────────────────────────────
  if (req.method === 'POST' && type === 'config') {
    const body = req.body || {}
    stores.settings = {
      ...stores.settings,
      whatsapp_otp_enabled:      body.otp_enabled      ?? stores.settings?.whatsapp_otp_enabled      ?? true,
      whatsapp_otp_expiry:       body.otp_expiry       ?? stores.settings?.whatsapp_otp_expiry        ?? 10,
      whatsapp_otp_max_attempts: body.otp_max_attempts ?? stores.settings?.whatsapp_otp_max_attempts  ?? 3,
      whatsapp_otp_cooldown:     body.otp_cooldown     ?? stores.settings?.whatsapp_otp_cooldown      ?? 60,
      whatsapp_otp_allow_skip:   body.allow_skip       ?? stores.settings?.whatsapp_otp_allow_skip    ?? false,
    }
    return res.status(200).json({ success: true })
  }

  // ── Send message ───────────────────────────────────────────────────────────
  if (req.method === 'POST' && type === 'send') {
    const { phone, message } = req.body || {}
    if (!phone || !message) return res.status(400).json({ error: 'phone and message required' })
    try {
      const { ok, data } = await proxyFetch('/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      })
      return res.status(ok ? 200 : 500).json(data)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── Disconnect (backward compat) ───────────────────────────────────────────
  if (req.method === 'POST' && type === 'disconnect') {
    try {
      const { data } = await proxyFetch('/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(400).json({ error: 'Invalid type parameter' })
}
