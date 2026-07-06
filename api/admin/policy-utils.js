export const POLICY_LANGUAGES = ['en', 'fr', 'ar']

export function isPolicyLanguage(value) {
  return POLICY_LANGUAGES.includes(value)
}

export function slugifyPolicyName(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function isSupportedLogo(value) {
  if (!value) return true
  if (!String(value).startsWith('data:')) return true
  return /^data:image\/(png|jpeg|jpg|svg\+xml|webp);base64,/i.test(String(value))
}

export function normalizeCategory(row = {}) {
  const rawScale = Number(row.logo_scale)
  const logoScale = Number.isFinite(rawScale) && rawScale > 0 ? rawScale : 1
  return {
    id: row.id,
    slug: row.slug,
    name: row.name || '',
    description: row.description || '',
    logo: row.logo || '',
    logo_scale: logoScale,
    icons: Array.isArray(row.icons) ? row.icons : [],
    display_order: Number(row.display_order || 0),
    active: row.active !== false,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  }
}

export function normalizeTranslation(row = {}) {
  return {
    id: row.id,
    category_id: row.category_id,
    language: row.language,
    title: row.title || '',
    short_description: row.short_description || '',
    content_html: row.content_html || '',
    active: row.active !== false,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  }
}

export function buildPolicyPayload(categories = [], translations = [], { publicOnly = false } = {}) {
  const byCategory = new Map()
  for (const row of categories) {
    const category = normalizeCategory(row)
    if (publicOnly && !category.active) continue
    byCategory.set(category.id, {
      ...category,
      translations: {},
    })
  }

  for (const row of translations) {
    const translation = normalizeTranslation(row)
    if (!byCategory.has(translation.category_id)) continue
    if (publicOnly && !translation.active) continue
    byCategory.get(translation.category_id).translations[translation.language] = translation
  }

  return Array.from(byCategory.values()).sort((a, b) => {
    if (a.display_order !== b.display_order) return a.display_order - b.display_order
    return a.name.localeCompare(b.name)
  })
}
