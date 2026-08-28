import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { getSupabase } from './lib/supabase-server.js'
import { stores, otpStore } from './crud.js'
import { signToken, verifyToken } from './lib/auth-middleware.js'

const OTP_KEY   = (email) => `pwreset:${email.toLowerCase()}`
const OTP_TTL   = 10 * 60_000  // 10 minutes
const MAX_ATTEMPTS = 3
const COOLDOWN_MS  = 60_000
const RESET_TOKEN_TTL = 10 * 60_000 // 10 minutes to actually set the new password after OTP verification

function getTransporter() {
  const s = stores.settings || {}
  return nodemailer.createTransport({
    host:   s.smtp_host || process.env.SMTP_HOST || 'mail.spacemail.com',
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
  const sb     = getSupabase()

  // ── Step 1: request a reset code, sent to the account's own email ──────────
  if (action === 'request') {
    const email = String(body.email || '').trim().toLowerCase()
    if (!email) return res.status(400).json({ error: 'Email required' })

    const key = OTP_KEY(email)
    const existing = otpStore.get(key)
    if (existing) {
      const wait = Math.ceil((COOLDOWN_MS - (Date.now() - existing.sentAt)) / 1000)
      if (wait > 0) return res.status(429).json({ error: `Please wait ${wait}s before requesting another code.` })
    }

    // Look up the account, but never reveal to the caller whether it exists —
    // the response is identical either way, both to prevent email enumeration
    // and to stop this endpoint being used to spam-relay mail to arbitrary addresses.
    const { data: user } = await sb.from('users').select('id,email').ilike('email', email).maybeSingle()

    if (user) {
      const code = String(Math.floor(100000 + Math.random() * 900000))
      otpStore.set(key, { code, userId: user.id, expiry: Date.now() + OTP_TTL, sentAt: Date.now(), attempts: 0 })

      try {
        const transporter = getTransporter()
        const s = stores.settings || {}
        const siteName  = s.site_name || 'AdverSolutions'
        const fromEmail = s.smtp_user || process.env.SMTP_USER || 'support@adversolutions.agency'
        await transporter.sendMail({
          from:    `"${siteName}" <${fromEmail}>`,
          to:      user.email,
          subject: `Your ${siteName} password reset code: ${code}`,
          text:    `Your password reset code is: ${code}\n\nThis code expires in ${Math.round(OTP_TTL / 60_000)} minutes. If you didn't request this, you can ignore this email.`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
              <div style="text-align:center;margin-bottom:28px;">
                <span style="font-size:22px;font-weight:900;color:#111;">Adver<span style="color:#ff2d55;">Solutions</span></span>
              </div>
              <h2 style="font-size:20px;font-weight:800;color:#111;margin:0 0 8px;">Reset your password</h2>
              <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">
                Enter the code below to continue. It expires in ${Math.round(OTP_TTL / 60_000)} minutes. If you didn't request this, you can ignore this email.
              </p>
              <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:14px;padding:24px;text-align:center;margin-bottom:24px;">
                <span style="font-size:36px;font-weight:900;letter-spacing:10px;color:#111;">${code}</span>
              </div>
            </div>
          `,
        })
      } catch {
        otpStore.delete(key)
        // Still return success — don't leak SMTP/account-existence details to the caller
      }
    }

    return res.status(200).json({ success: true })
  }

  // ── Step 2: verify the emailed code ─────────────────────────────────────────
  if (action === 'verify') {
    const email = String(body.email || '').trim().toLowerCase()
    const otp   = String(body.otp || '').trim()
    if (!email || !otp) return res.status(400).json({ error: 'Email and code required' })

    const key    = OTP_KEY(email)
    const record = otpStore.get(key)
    if (!record) return res.status(400).json({ error: 'No code was sent to this email, or it already expired. Please request a new one.' })
    if (Date.now() > record.expiry) {
      otpStore.delete(key)
      return res.status(400).json({ error: 'Code has expired. Please request a new one.' })
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(key)
      return res.status(400).json({ error: 'Too many wrong attempts. Please request a new code.' })
    }
    if (record.code !== otp) {
      record.attempts++
      const left = MAX_ATTEMPTS - record.attempts
      return res.status(400).json({ error: `Invalid code. ${left} attempt${left === 1 ? '' : 's'} remaining.` })
    }

    const userId = record.userId
    otpStore.delete(key)

    // Issue a short-lived, opaque token proving this specific account's OTP
    // was just verified — the client never sees the raw user id directly.
    const resetToken = signToken({ purpose: 'pwreset', userId, exp: Date.now() + RESET_TOKEN_TTL })
    return res.status(200).json({ success: true, resetToken })
  }

  // ── Step 3: set the new password ────────────────────────────────────────────
  if (action === 'complete') {
    const { resetToken, newPassword } = body
    if (!resetToken || !newPassword) return res.status(400).json({ error: 'Reset token and new password required' })
    if (String(newPassword).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })

    const payload = verifyToken(resetToken)
    if (!payload || payload.purpose !== 'pwreset' || !payload.userId) {
      return res.status(400).json({ error: 'Invalid or expired reset session. Please start over.' })
    }
    if (Date.now() > payload.exp) {
      return res.status(400).json({ error: 'Reset session expired. Please start over.' })
    }

    const password_hash = await bcrypt.hash(newPassword, 10)
    const { error } = await sb.from('users').update({ password_hash }).eq('id', payload.userId)
    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ success: true })
  }

  return res.status(400).json({ error: 'Invalid action' })
}
