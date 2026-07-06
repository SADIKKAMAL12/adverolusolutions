import nodemailer from 'nodemailer'
import { stores, otpStore } from './crud.js'

const EMAIL_KEY = (email) => `email:${email.toLowerCase()}`

function getCfg() {
  const s = stores.settings || {}
  return {
    enabled:     s.email_otp_enabled      ?? false,
    expiryMs:   (s.email_otp_expiry       ?? 10) * 60_000,
    maxAttempts: s.email_otp_max_attempts ?? 3,
    cooldownMs: (s.email_otp_cooldown     ?? 60) * 1_000,
  }
}

function getTransporter() {
  const s = stores.settings || {}
  return nodemailer.createTransport({
    host:   s.smtp_host     || process.env.SMTP_HOST     || 'mail.spacemail.com',
    port:   Number(s.smtp_port || process.env.SMTP_PORT || 465),
    secure: (s.smtp_port || process.env.SMTP_PORT || '465') !== '587',
    auth: {
      user: s.smtp_user || process.env.SMTP_USER || 'support@adversolutions.agency',
      pass: s.smtp_pass || process.env.SMTP_PASS || '',
    },
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const action = req.query.action
  const body   = req.body || {}

  // ── Send OTP ────────────────────────────────────────────────────────────────
  if (action === 'send') {
    const { email } = body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const cfg = getCfg()
    const key = EMAIL_KEY(email)

    const existing = otpStore.get(key)
    if (existing) {
      const wait = Math.ceil((cfg.cooldownMs - (Date.now() - existing.sentAt)) / 1000)
      if (wait > 0) {
        return res.status(429).json({ error: `Please wait ${wait}s before requesting another code.` })
      }
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))

    otpStore.set(key, {
      code,
      expiry:   Date.now() + cfg.expiryMs,
      sentAt:   Date.now(),
      attempts: 0,
    })

    try {
      const transporter = getTransporter()
      const s = stores.settings || {}
      const siteName = s.site_name || 'AdverSolutions'
      const fromEmail = s.smtp_user || process.env.SMTP_USER || 'support@adversolutions.agency'

      await transporter.sendMail({
        from:    `"${siteName}" <${fromEmail}>`,
        to:      email,
        subject: `Your ${siteName} verification code: ${code}`,
        text:    `Your verification code is: ${code}\n\nThis code expires in ${Math.round(cfg.expiryMs / 60_000)} minutes. Do not share it with anyone.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
            <div style="text-align:center;margin-bottom:28px;">
              <span style="font-size:22px;font-weight:900;color:#111;">Adver<span style="color:#ff2d55;">Solutions</span></span>
            </div>
            <h2 style="font-size:20px;font-weight:800;color:#111;margin:0 0 8px;">Verify your email</h2>
            <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">
              Enter the code below to complete your registration. It expires in ${Math.round(cfg.expiryMs / 60_000)} minutes.
            </p>
            <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:14px;padding:24px;text-align:center;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:900;letter-spacing:10px;color:#111;">${code}</span>
            </div>
            <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
        `,
      })

      return res.status(200).json({ success: true })
    } catch (err) {
      otpStore.delete(key)
      return res.status(500).json({ error: err.message || 'Failed to send email OTP' })
    }
  }

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  if (action === 'verify') {
    const { email, otp } = body
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' })

    const cfg    = getCfg()
    const key    = EMAIL_KEY(email)
    const record = otpStore.get(key)

    if (!record) {
      return res.status(400).json({ error: 'No OTP was sent to this email. Please request a new one.' })
    }
    if (Date.now() > record.expiry) {
      otpStore.delete(key)
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' })
    }
    if (record.attempts >= cfg.maxAttempts) {
      otpStore.delete(key)
      return res.status(400).json({ error: 'Too many wrong attempts. Please request a new code.' })
    }
    if (String(record.code) !== String(otp).trim()) {
      record.attempts++
      const left = cfg.maxAttempts - record.attempts
      return res.status(400).json({
        error: `Invalid code. ${left} attempt${left === 1 ? '' : 's'} remaining.`,
      })
    }

    otpStore.delete(key)
    return res.status(200).json({ success: true })
  }

  // ── Test SMTP ───────────────────────────────────────────────────────────────
  if (action === 'test') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const { to } = body
    if (!to) return res.status(400).json({ error: 'Recipient email required' })
    try {
      const transporter = getTransporter()
      await transporter.sendMail({
        from:    `"AdverSolutions" <${stores.settings?.smtp_user || process.env.SMTP_USER || 'support@adversolutions.agency'}>`,
        to,
        subject: 'AdverSolutions SMTP Test',
        text:    'This is a test email from AdverSolutions. SMTP is working correctly.',
        html:    '<p style="font-family:Arial,sans-serif;">This is a test email from <strong>AdverSolutions</strong>. SMTP is working correctly. ✓</p>',
      })
      return res.status(200).json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(400).json({ error: 'Invalid action' })
}
