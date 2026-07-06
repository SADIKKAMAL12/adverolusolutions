import { getSupabase } from './lib/supabase-server.js'

async function storeLogo(sb, id, logoData) {
  if (!logoData || !logoData.startsWith('data:')) return logoData
  const matches = logoData.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches) return logoData
  const mimeType = matches[1]
  const buf = Buffer.from(matches[2], 'base64')
  const ext = mimeType.split('/')[1]?.split('+')[0] || 'png'
  const filename = `account-type-logos/${id}.${ext}`
  const { error } = await sb.storage.from('proofs').upload(filename, buf, { contentType: mimeType, upsert: true })
  if (error) return logoData
  const { data: urlData } = sb.storage.from('proofs').getPublicUrl(filename)
  return urlData.publicUrl
}

export default async function handler(req, res) {
  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Database not configured' })

  if (req.method === 'GET') {
    const { data, error } = await sb
      .from('account_types')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    const { name, logo } = req.body || {}
    if (!name?.trim()) return res.status(400).json({ error: 'Name required' })
    const { data: existing } = await sb.from('account_types').select('sort_order').order('sort_order', { ascending: false }).limit(1)
    const sort_order = (existing?.[0]?.sort_order ?? 0) + 1
    const tempId = `at-${Date.now()}`
    const logoUrl = logo ? await storeLogo(sb, tempId, logo) : null
    const { data, error } = await sb.from('account_types').insert({ name: name.trim(), sort_order, active: true, logo: logoUrl || null }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required' })
    if (updates.name) updates.name = updates.name.trim()
    if (updates.logo && updates.logo.startsWith('data:')) {
      updates.logo = await storeLogo(sb, `at-${id}`, updates.logo)
    }
    const { data, error } = await sb.from('account_types').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'ID required' })
    const { error } = await sb.from('account_types').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
