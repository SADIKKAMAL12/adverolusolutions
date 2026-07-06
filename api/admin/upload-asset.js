import { getSupabase } from '../lib/supabase-server.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { data: dataUrl, filename } = req.body || {}
  if (!dataUrl || !filename) return res.status(400).json({ error: 'Missing data or filename' })

  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Storage not configured' })

  // Decode base64 data URL → Buffer
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return res.status(400).json({ error: 'Invalid data URL' })
  const [, mimeType, base64] = match
  const buffer = Buffer.from(base64, 'base64')

  // Ensure bucket exists (create if missing)
  await sb.storage.createBucket('platform-assets', { public: true }).catch(() => {})

  // Upload to Supabase Storage (upsert so re-uploads overwrite)
  const { data: uploaded, error } = await sb.storage
    .from('platform-assets')
    .upload(filename, buffer, { contentType: mimeType, upsert: true })

  if (error) return res.status(500).json({ error: error.message })

  const { data: { publicUrl } } = sb.storage
    .from('platform-assets')
    .getPublicUrl(uploaded.path)

  return res.status(200).json({ url: publicUrl })
}
