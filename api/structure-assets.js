import { sharedState } from './crud.js'

const DEFAULTS = [
  { key: 'profile', label: 'Profile', base_price: 40, icon: 'user', glow_color: '#3b82f6', image_url: '', logo_url: '', bg_color_dark: '#0f1a2e', bg_color_light: '#eff6ff', border_color_dark: '#1e3a5f', border_color_light: '#bfdbfe', text_color_dark: '#dbeafe', text_color_light: '#1e40af', description: 'Individual Facebook profile used as foundation.', sort_order: 1, active: 1 },
  { key: 'bm_verified', label: 'BM Verified', base_price: 250, icon: 'shield-check', glow_color: '#10b981', image_url: '', logo_url: '', bg_color_dark: '#0a1f15', bg_color_light: '#ecfdf5', border_color_dark: '#14532d', border_color_light: '#a7f3d0', text_color_dark: '#d1fae5', text_color_light: '#065f46', description: 'Verified Business Manager with full features.', sort_order: 2, active: 1 },
  { key: 'agency_bm', label: 'Agency BM', base_price: 300, icon: 'building-2', glow_color: '#8b5cf6', image_url: '', logo_url: '', bg_color_dark: '#1a1033', bg_color_light: '#f5f3ff', border_color_dark: '#4c1d95', border_color_light: '#ddd6fe', text_color_dark: '#ede9fe', text_color_light: '#5b21b6', description: 'Agency-level Business Manager for multiple clients.', sort_order: 3, active: 1 },
  { key: 'advertiser_account', label: 'Advertiser Account', base_price: 60, icon: 'megaphone', glow_color: '#f59e0b', image_url: '', logo_url: '', bg_color_dark: '#271a05', bg_color_light: '#fffbeb', border_color_dark: '#78350f', border_color_light: '#fde68a', text_color_dark: '#fef3c7', text_color_light: '#92400e', description: 'Dedicated advertiser account for campaigns.', sort_order: 4, active: 1 },
  { key: 'client_ad_account', label: 'Client Ad Account', base_price: 60, icon: 'briefcase', glow_color: '#06b6d4', image_url: '', logo_url: '', bg_color_dark: '#0a1f24', bg_color_light: '#ecfeff', border_color_dark: '#155e75', border_color_light: '#a5f3fc', text_color_dark: '#cffafe', text_color_light: '#0e7490', description: 'Client-managed ad account under agency BM.', sort_order: 5, active: 1 },
  { key: 'pages_bm', label: 'Pages BM', base_price: 80, icon: 'file-stack', glow_color: '#ec4899', image_url: '', logo_url: '', bg_color_dark: '#2a0a1a', bg_color_light: '#fdf2f8', border_color_dark: '#831843', border_color_light: '#fbcfe8', text_color_dark: '#fce7f3', text_color_light: '#9d174d', description: 'Business Manager with page assets bundled.', sort_order: 6, active: 1 },
  { key: 'fan_page', label: 'Fan Page', base_price: 35, icon: 'heart', glow_color: '#ef4444', image_url: '', logo_url: '', bg_color_dark: '#2a0a0a', bg_color_light: '#fef2f2', border_color_dark: '#7f1d1d', border_color_light: '#fecaca', text_color_dark: '#fee2e2', text_color_light: '#991b1b', description: 'Facebook fan page with established following.', sort_order: 7, active: 1 },
  { key: 'pixel', label: 'Pixel', base_price: 25, icon: 'activity', glow_color: '#14b8a6', image_url: '', logo_url: '', bg_color_dark: '#0a1f1c', bg_color_light: '#f0fdfa', border_color_dark: '#134e4a', border_color_light: '#99f6e4', text_color_dark: '#ccfbf1', text_color_light: '#115e59', description: 'Facebook Pixel for tracking and retargeting.', sort_order: 8, active: 1 },
  { key: 'dataset', label: 'Dataset', base_price: 20, icon: 'database', glow_color: '#6366f1', image_url: '', logo_url: '', bg_color_dark: '#0f0a2e', bg_color_light: '#eef2ff', border_color_dark: '#312e81', border_color_light: '#c7d2fe', text_color_dark: '#e0e7ff', text_color_light: '#3730a3', description: 'Conversions API dataset for server-side events.', sort_order: 9, active: 1 },
  { key: 'domain', label: 'Domain', base_price: 30, icon: 'globe', glow_color: '#f97316', image_url: '', logo_url: '', bg_color_dark: '#271306', bg_color_light: '#fff7ed', border_color_dark: '#7c2d12', border_color_light: '#fed7aa', text_color_dark: '#ffedd5', text_color_light: '#9a3412', description: 'Verified domain for event tracking and ads.', sort_order: 10, active: 1 },
  { key: 'backup_admin', label: 'Backup Admin', base_price: 25, icon: 'users', glow_color: '#84cc16', image_url: '', logo_url: '', bg_color_dark: '#1a2405', bg_color_light: '#f7fee7', border_color_dark: '#3f6212', border_color_light: '#d9f99d', text_color_dark: '#ecfccb', text_color_light: '#4d7c0f', description: 'Backup administrator access for redundancy.', sort_order: 11, active: 1 },
  { key: 'employee', label: 'Employee', base_price: 15, icon: 'user-cog', glow_color: '#64748b', image_url: '', logo_url: '', bg_color_dark: '#0f172a', bg_color_light: '#f8fafc', border_color_dark: '#334155', border_color_light: '#cbd5e1', text_color_dark: '#e2e8f0', text_color_light: '#475569', description: 'Employee access with limited permissions.', sort_order: 12, active: 1 },
  { key: 'media_buyer', label: 'Media Buyer', base_price: 45, icon: 'trending-up', glow_color: '#d946ef', image_url: '', logo_url: '', bg_color_dark: '#2a0a2a', bg_color_light: '#fdf4ff', border_color_dark: '#86198f', border_color_light: '#f0abfc', text_color_dark: '#fae8ff', text_color_light: '#a21caf', description: 'Vetted media buyer with proven track record.', sort_order: 13, active: 1 },
]

// Lazy-init from sharedState (which lives in the cached crud.js module)
// Exported so other handlers (e.g. structure-orders.js) can price against the
// same live, admin-controlled asset list instead of trusting client input.
export function getAssets() {
  if (!sharedState.structureAssets) {
    sharedState.structureAssets = DEFAULTS.map(a => ({ ...a }))
  }
  return sharedState.structureAssets
}

export default async function handler(req, res) {
  const assets = getAssets()

  if (req.method === 'GET') {
    return res.status(200).json({ assets })
  }

  if (req.method === 'PUT') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const body = req.body || {}
    const idx = assets.findIndex(a => a.key === body.key)
    if (idx === -1) return res.status(404).json({ error: 'Asset not found' })
    assets[idx] = { ...assets[idx], ...body }
    return res.status(200).json({ success: true })
  }

  if (req.method === 'POST') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const body = req.body || {}
    if (!body.key || assets.find(a => a.key === body.key)) {
      return res.status(400).json({ error: 'Key required or already exists' })
    }
    assets.push(body)
    return res.status(201).json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
