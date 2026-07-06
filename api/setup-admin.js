import { getSupabase } from './lib/supabase-server.js'
import bcrypt from 'bcryptjs'

// One-time admin setup / password-reset endpoint — call once then delete this file
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, name = 'Admin', force = false } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  const sb = getSupabase()
  const cleanEmail = email.toLowerCase().trim()

  // Check if this email already exists
  const { data: existingUser, error: findErr } = await sb
    .from('users')
    .select('id,email,role,name')
    .ilike('email', cleanEmail)
    .single()

  if (findErr && findErr.code !== 'PGRST116') {
    return res.status(500).json({ error: findErr.message })
  }

  if (existingUser) {
    if (!force) {
      return res.status(409).json({
        error: 'User already exists. Use force=true to reset password.',
        existingAdmin: existingUser.email,
      })
    }
    // Reset password for existing user
    const password_hash = await bcrypt.hash(password, 10)
    const { error: updErr } = await sb
      .from('users')
      .update({ password_hash, name: name || existingUser.name })
      .eq('id', existingUser.id)

    if (updErr) return res.status(500).json({ error: updErr.message })

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      admin: { id: existingUser.id, name: name || existingUser.name, email: existingUser.email, role: existingUser.role },
    })
  }

  // Check if any admin already exists (only block creating NEW admin if one exists and force is not used)
  const { data: anyAdmin, error: adminErr } = await sb
    .from('users')
    .select('id,email')
    .eq('role', 'admin')
    .limit(1)

  if (adminErr) return res.status(500).json({ error: adminErr.message })

  if (anyAdmin && anyAdmin.length > 0 && !force) {
    return res.status(409).json({
      error: 'An admin already exists. Use force=true to create another or reset existing.',
      existingAdmin: anyAdmin[0].email,
    })
  }

  // Create new admin
  const password_hash = await bcrypt.hash(password, 10)
  const { data, error } = await sb.from('users').insert({
    id: crypto.randomUUID(),
    name,
    email: cleanEmail,
    password_hash,
    role: 'admin',
    status: 'active',
    balance: 0,
    accounts: 0,
  }).select('id,name,email,role').single()

  if (error) return res.status(500).json({ error: error.message })

  return res.status(201).json({
    success: true,
    message: 'Admin created',
    admin: data,
  })
}
