import { getSupabase } from '../lib/supabase-server.js'
import {
  POLICY_LANGUAGES,
  isPolicyLanguage,
  normalizeTranslation,
} from '../lib/policy-utils.js'

function translationId() {
  return `ptr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export default async function handler(req, res) {
  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Database not configured' })

  if (req.method === 'GET') {
    let query = sb.from('policy_translations').select('*').order('language', { ascending: true })
    if (req.query.category_id) query = query.eq('category_id', req.query.category_id)
    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({
      languages: POLICY_LANGUAGES,
      translations: (data || []).map(normalizeTranslation),
    })
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const body = req.body || {}
    const categoryId = String(body.category_id || '').trim()
    const language = String(body.language || '').trim()
    if (!categoryId) return res.status(400).json({ error: 'Category ID is required' })
    if (!isPolicyLanguage(language)) return res.status(400).json({ error: 'Language must be en, fr, or ar' })

    const payload = {
      id: body.id || translationId(),
      category_id: categoryId,
      language,
      title: String(body.title || '').trim(),
      short_description: String(body.short_description || ''),
      content_html: String(body.content_html || ''),
      active: body.active !== false,
      updated_at: new Date().toISOString(),
    }

    if (!payload.title) return res.status(400).json({ error: 'Translation title is required' })

    const { data, error } = await sb
      .from('policy_translations')
      .upsert(payload, { onConflict: 'category_id,language' })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(normalizeTranslation(data))
  }

  if (req.method === 'DELETE') {
    const id = String(req.query.id || '').trim()
    if (!id) return res.status(400).json({ error: 'Translation ID is required' })
    const { error } = await sb.from('policy_translations').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
