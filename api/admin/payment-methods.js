import { getSupabase } from '../lib/supabase-server.js'

// Upload base64 logo to Supabase Storage and return the public URL.
// Falls back to the original value if upload fails or input isn't base64.
async function storeLogo(sb, id, logoData) {
  if (!logoData || !logoData.startsWith('data:')) return logoData
  const matches = logoData.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches) return logoData
  const mimeType = matches[1]
  const buf = Buffer.from(matches[2], 'base64')
  const ext = mimeType.split('/')[1]?.split('+')[0] || 'png'
  const filename = `payment-logos/${id}.${ext}`
  const { error } = await sb.storage.from('proofs').upload(filename, buf, { contentType: mimeType, upsert: true })
  if (error) return logoData
  const { data: urlData } = sb.storage.from('proofs').getPublicUrl(filename)
  return urlData.publicUrl
}

export default async function handler(req, res) {
  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Database not configured' })

  if (req.method === 'GET') {
    const { data, error } = await sb.from('payment_methods').select('*').order('name')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    const body = { ...req.body }
    if (!body.id) body.id = `pm-${Date.now()}`
    body.logo = await storeLogo(sb, body.id, body.logo)
    if (body.qr_code) body.qr_code = await storeLogo(sb, `qr-${body.id}`, body.qr_code)
    const { data, error } = await sb.from('payment_methods').insert(body).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required' })
    if (updates.logo) updates.logo = await storeLogo(sb, id, updates.logo)
    if (updates.qr_code) updates.qr_code = await storeLogo(sb, `qr-${id}`, updates.qr_code)
    const { data, error } = await sb.from('payment_methods').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, ...data })
  }

  if (req.method === 'DELETE') {
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'ID required' })
    const { error } = await sb.from('payment_methods').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
