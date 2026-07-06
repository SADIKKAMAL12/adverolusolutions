import { getSupabase } from '../lib/supabase-server.js'
import {
  buildPolicyPayload,
  isSupportedLogo,
  normalizeCategory,
  slugifyPolicyName,
} from '../lib/policy-utils.js'

function categoryId() {
  return `pcat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

async function storeLogo(sb, id, logoData) {
  if (!logoData || !logoData.startsWith('data:')) return logoData
  const matches = logoData.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches) return logoData
  const mimeType = matches[1]
  const buf = Buffer.from(matches[2], 'base64')
  const ext = mimeType.split('/')[1]?.split('+')[0] || 'png'
  const filename = `policy-logos/${id}.${ext}`
  const { error } = await sb.storage.from('proofs').upload(filename, buf, { contentType: mimeType, upsert: true })
  if (error) return logoData
  const { data: urlData } = sb.storage.from('proofs').getPublicUrl(filename)
  return urlData.publicUrl
}

async function storeIcons(sb, id, iconsRaw) {
  if (!Array.isArray(iconsRaw)) return []
  const results = []
  for (let i = 0; i < iconsRaw.length; i++) {
    const item = String(iconsRaw[i] || '')
    if (!item) continue
    if (!item.startsWith('data:')) { results.push(item); continue }
    const matches = item.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) { results.push(item); continue }
    const mimeType = matches[1]
    const buf = Buffer.from(matches[2], 'base64')
    const ext = mimeType.split('/')[1]?.split('+')[0] || 'png'
    const filename = `policy-icons/${id}_${i}.${ext}`
    const { error } = await sb.storage.from('proofs').upload(filename, buf, { contentType: mimeType, upsert: true })
    if (error) { results.push(item); continue }
    const { data: urlData } = sb.storage.from('proofs').getPublicUrl(filename)
    results.push(urlData.publicUrl)
  }
  return results
}

function normalizeLogoScale(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 1
  return Math.min(2, Math.max(0.4, num))
}

async function fetchBundle(sb) {
  const [{ data: categories, error: categoryError }, { data: translations, error: translationError }] = await Promise.all([
    sb.from('policy_categories').select('*').order('display_order', { ascending: true }).order('name', { ascending: true }),
    sb.from('policy_translations').select('*').order('language', { ascending: true }),
  ])

  if (categoryError) throw categoryError
  if (translationError) throw translationError

  return buildPolicyPayload(categories || [], translations || [])
}

export default async function handler(req, res) {
  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Database not configured' })

  if (req.method === 'GET') {
    try {
      const categories = await fetchBundle(sb)
      return res.status(200).json({ categories })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const name = String(body.name || '').trim()
    const slug = slugifyPolicyName(body.slug || name)
    if (!name) return res.status(400).json({ error: 'Category name is required' })
    if (!slug) return res.status(400).json({ error: 'Category slug is required' })
    if (!isSupportedLogo(body.logo)) {
      return res.status(400).json({ error: 'Unsupported logo format. Use PNG, JPG, SVG, or WebP.' })
    }

    const newId = body.id || categoryId()
    const payload = {
      id: newId,
      slug,
      name,
      description: String(body.description || ''),
      logo: await storeLogo(sb, newId, String(body.logo || '')),
      logo_scale: normalizeLogoScale(body.logo_scale),
      icons: await storeIcons(sb, newId, body.icons),
      display_order: Number.isFinite(Number(body.display_order)) ? Number(body.display_order) : 0,
      active: body.active !== false,
    }

    const { data, error } = await sb.from('policy_categories').insert(payload).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(normalizeCategory(data))
  }

  if (req.method === 'PUT') {
    const body = req.body || {}
    const id = String(body.id || '').trim()
    if (!id) return res.status(400).json({ error: 'Category ID is required' })
    if (body.logo != null && !isSupportedLogo(body.logo)) {
      return res.status(400).json({ error: 'Unsupported logo format. Use PNG, JPG, SVG, or WebP.' })
    }

    const updates = {}
    if (body.name != null) updates.name = String(body.name).trim()
    if (body.slug != null || body.name != null) {
      updates.slug = slugifyPolicyName(body.slug || body.name || '')
    }
    if (body.description != null) updates.description = String(body.description)
    if (body.logo != null) updates.logo = await storeLogo(sb, id, String(body.logo))
    if (body.logo_scale != null) updates.logo_scale = normalizeLogoScale(body.logo_scale)
    if (body.icons != null) updates.icons = await storeIcons(sb, id, body.icons)
    if (body.display_order != null) updates.display_order = Number(body.display_order) || 0
    if (body.active != null) updates.active = !!body.active
    updates.updated_at = new Date().toISOString()

    if (updates.name === '') return res.status(400).json({ error: 'Category name is required' })
    if (updates.slug === '') return res.status(400).json({ error: 'Category slug is required' })

    const { data, error } = await sb.from('policy_categories').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(normalizeCategory(data))
  }

  if (req.method === 'DELETE') {
    const id = String(req.query.id || '').trim()
    if (!id) return res.status(400).json({ error: 'Category ID is required' })
    const { error } = await sb.from('policy_categories').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
