import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, Plus, Trash2, Upload, X } from 'lucide-react'
import { Badge, Btn, Card, Input, PageShell, Select, Textarea } from '../shared/UI.jsx'
import { C, getThemeColors } from '../shared/theme.js'
import { useTheme } from '../shared/ThemeContext.jsx'
import { useNavigate } from '../shared/Router.jsx'
import RichTextEditor from '../policies/RichTextEditor.jsx'
import {
  POLICY_LANGUAGES,
  emptyTranslation,
  getLanguageLabel,
  getPolicyLogoBySlug,
  mergeWithFallbackPolicies,
} from '../policies/policyContent.js'

const F = "'Plus Jakarta Sans','Inter',sans-serif"

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function defaultCategory() {
  return {
    id: '',
    slug: '',
    name: '',
    description: '',
    logo: '',
    logo_scale: 1,
    display_order: 0,
    active: true,
    icons: [],
    translations: {
      en: emptyTranslation('en'),
      fr: emptyTranslation('fr'),
      ar: emptyTranslation('ar'),
    },
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`)
  return data
}

function reorderPair(items, id, direction) {
  const index = items.findIndex(item => item.id === id)
  const targetIndex = index + direction
  if (index < 0 || targetIndex < 0 || targetIndex >= items.length) return null
  return [items[index], items[targetIndex]]
}

export default function AdminPolicyManagementPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const [categories, setCategories] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [draft, setDraft] = useState(defaultCategory())
  const [language, setLanguage] = useState('en')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const logoInputRef = useRef(null)
  const iconInputRef = useRef(null)

  const selectedCategory = useMemo(
    () => categories.find(category => category.id === selectedId) || null,
    [categories, selectedId],
  )

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const categoryData = await request('/api/admin/policy-categories')
      const items = mergeWithFallbackPolicies(Array.isArray(categoryData.categories) ? categoryData.categories : [])
      setCategories(items)
      const first = items[0] || null
      setSelectedId(first?.id || '')
      setDraft(first ? JSON.parse(JSON.stringify(first)) : defaultCategory())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!selectedCategory) return
    setDraft(JSON.parse(JSON.stringify(selectedCategory)))
  }, [selectedCategory])

  const setCategoryField = (field, value) => {
    setDraft(current => ({ ...current, [field]: value }))
  }

  const setTranslationField = (lang, field, value) => {
    setDraft(current => ({
      ...current,
      translations: {
        ...current.translations,
        [lang]: {
          ...(current.translations?.[lang] || emptyTranslation(lang)),
          [field]: value,
          language: lang,
        },
      },
    }))
  }

  const onCreate = () => {
    const next = defaultCategory()
    next.display_order = categories.length + 1
    setSelectedId('')
    setLanguage('en')
    setDraft(next)
    setError('')
    setSuccess('')
  }

  const openPreview = () => {
    window.open('https://policy.adversolutions.agency', '_blank')
  }

  const saveCategory = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const categoryPayload = {
        id: draft.id || undefined,
        slug: draft.slug || slugify(draft.name),
        name: draft.name,
        description: draft.description,
        logo: draft.logo ?? '',
        logo_scale: Number(draft.logo_scale) || 1,
        display_order: Number(draft.display_order || 0),
        active: draft.active !== false,
        icons: (draft.icons || []).map(icon => icon.data || icon.url || icon),
      }

      const savedCategory = draft.id
        ? await request('/api/admin/policy-categories', { method: 'PUT', body: JSON.stringify(categoryPayload) })
        : await request('/api/admin/policy-categories', { method: 'POST', body: JSON.stringify(categoryPayload) })

      for (const lang of POLICY_LANGUAGES) {
        const translation = draft.translations?.[lang]
        if (!translation?.title && !translation?.content_html && !translation?.short_description) continue
        await request('/api/admin/policy-translations', {
          method: 'POST',
          body: JSON.stringify({
            ...translation,
            category_id: savedCategory.id,
            language: lang,
          }),
        })
      }

      await load()
      setSelectedId(savedCategory.id)
      setSuccess('Policy category saved successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeCategory = async () => {
    if (!draft.id) {
      onCreate()
      return
    }
    if (!window.confirm('Delete this policy category and all translations?')) return
    try {
      await request(`/api/admin/policy-categories?id=${encodeURIComponent(draft.id)}`, { method: 'DELETE' })
      await load()
      setSuccess('Policy category deleted.')
    } catch (err) {
      setError(err.message)
    }
  }

  const moveCategory = async (direction) => {
    const pair = reorderPair(categories, draft.id, direction)
    if (!pair) return
    const [current, target] = pair
    try {
      await request('/api/admin/policy-categories', {
        method: 'PUT',
        body: JSON.stringify({ id: current.id, display_order: target.display_order }),
      })
      await request('/api/admin/policy-categories', {
        method: 'PUT',
        body: JSON.stringify({ id: target.id, display_order: current.display_order }),
      })
      await load()
      setSelectedId(current.id)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setCategoryField('logo', String(ev.target?.result || ''))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const removeLogo = () => setCategoryField('logo', '')

  const handleIconUpload = (e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'))
    if (!files.length) return
    const existingIcons = draft.icons || []
    let loaded = 0
    const newEntries = []
    files.forEach((file, idx) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        newEntries[idx] = { data: String(ev.target?.result || ''), name: file.name }
        loaded++
        if (loaded === files.length) {
          setCategoryField('icons', [...existingIcons, ...newEntries.filter(Boolean)])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeIcon = (index) => {
    setCategoryField('icons', (draft.icons || []).filter((_, i) => i !== index))
  }

  const translation = draft.translations?.[language] || emptyTranslation(language)
  const autoLogo = getPolicyLogoBySlug(draft.slug || slugify(draft.name))
  // draft.logo === null/undefined → use auto; draft.logo === '' → explicitly cleared; draft.logo === URL → custom
  const resolvedLogo = draft.logo != null ? (draft.logo || null) : autoLogo
  const resolvedLogoScale = Number(draft.logo_scale) || 1
  const isAutoLogo = draft.logo == null && !!autoLogo
  const hasLogoToRemove = !!resolvedLogo
  return (
    <PageShell
      title="Policy Management"
      subtitle="Manage policy categories, translated content, and display order for the public policy portal."
      breadcrumb="Admin / Policy Management"
      actions={[
        <Btn key="account-types" variant="outline" onClick={() => navigate('/admin/policies/account-types')}> Account Types </Btn>,
        <Btn key="payments" variant="outline" onClick={() => navigate('/admin/policies/payments')}> Payments Management </Btn>,
        <Btn key="preview" onClick={openPreview}> <Eye size={14} /> Preview Portal </Btn>,
        <Btn key="new" variant="outline" onClick={onCreate}> <Plus size={14} /> New Category </Btn>,
      ]}
    >
      {error && (
        <Card style={{ borderColor: `${C.red}33`, background: `${C.red}08` }}>
          <div style={{ color: C.red, fontWeight: 700, fontFamily: F }}>{error}</div>
        </Card>
      )}
      {success && (
        <Card style={{ borderColor: `${C.green}33`, background: `${C.green}10` }}>
          <div style={{ color: C.green, fontWeight: 700, fontFamily: F }}>{success}</div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
        <Card style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: TC.g800 }}>Categories</div>
              <div style={{ fontSize: 12.5, color: TC.textSecondary }}>Active and fallback-ready public tabs.</div>
            </div>
            <Badge text={`${categories.length} total`} tone="info" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading && <div style={{ fontSize: 13, color: TC.textSecondary }}>Loading policy categories…</div>}
            {!loading && categories.length === 0 && <div style={{ fontSize: 13, color: TC.textSecondary }}>No categories yet. Create the first one.</div>}
            {categories.map(category => {
              const active = category.id === selectedId
              const categoryLogo = category.logo != null ? category.logo : getPolicyLogoBySlug(category.slug)
              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => setSelectedId(category.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: 12,
                    border: `1px solid ${active ? C.primary : TC.g200}`,
                    background: active ? `${C.primary}10` : TC.card,
                    padding: '12px 13px',
                    cursor: 'pointer',
                    fontFamily: F,
                  }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 12, overflow: 'hidden', background: TC.g100, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {categoryLogo
                      ? <img src={categoryLogo} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${Number(category.logo_scale) || 1})` }} />
                      : <span style={{ fontWeight: 800, color: TC.g500 }}>{category.name?.slice(0, 1)}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: TC.g800 }}>{category.name}</div>
                    <div style={{ fontSize: 12, color: TC.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{category.slug}</div>
                  </div>
                  <Badge text={category.active ? 'Active' : 'Disabled'} status={category.active ? 'active' : 'inactive'} />
                </button>
              )
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ marginBottom: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14 }}>
              <Input label="Category Name" value={draft.name} onChange={e => {
                const name = e.target.value
                setCategoryField('name', name)
                if (!draft.slug || draft.slug === slugify(draft.name)) setCategoryField('slug', slugify(name))
              }} />
              <Input label="Slug" value={draft.slug} onChange={e => setCategoryField('slug', slugify(e.target.value))} />
              <Textarea label="Description" rows={3} value={draft.description} onChange={e => setCategoryField('description', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Display Order" type="number" value={draft.display_order} onChange={e => setCategoryField('display_order', Number(e.target.value || 0))} />
                <Select label="Status" value={draft.active ? 'active' : 'disabled'} onChange={e => setCategoryField('active', e.target.value === 'active')} options={[
                  { value: 'active', label: 'Active' },
                  { value: 'disabled', label: 'Disabled' },
                ]} />
              </div>
            </div>

            <div style={{ marginTop: 16, borderTop: `1px solid ${TC.g100}`, paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TC.g800, marginBottom: 12 }}>Category Logo</div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', background: TC.g100, display: 'grid', placeItems: 'center', border: `2px dashed ${resolvedLogo ? TC.g200 : C.primary}`, cursor: 'pointer', position: 'relative', transition: 'border-color .15s' }}
                    title="Click to upload logo"
                  >
                    {resolvedLogo
                      ? <img src={resolvedLogo} alt={draft.name || 'Logo'} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${resolvedLogoScale})` }} />
                      : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <Upload size={22} color={C.primary} />
                          <span style={{ fontSize: 11, color: C.primary, fontWeight: 600 }}>Upload</span>
                        </div>}
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  <Btn variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} style={{ width: '100%', justifyContent: 'center' }}>
                    <Upload size={13} /> Upload
                  </Btn>
                  {hasLogoToRemove && (
                    <Btn variant="outline" size="sm" onClick={removeLogo} style={{ width: '100%', justifyContent: 'center', color: C.red, borderColor: `${C.red}40` }}>
                      <X size={13} /> Remove
                    </Btn>
                  )}
                  {isAutoLogo && (
                    <div style={{ fontSize: 11, color: TC.textSecondary, textAlign: 'center', lineHeight: 1.4 }}>Auto from slug</div>
                  )}
                  {!resolvedLogo && !isAutoLogo && (
                    <div style={{ fontSize: 11, color: TC.textSecondary, textAlign: 'center', lineHeight: 1.4 }}>No logo</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TC.textSecondary, marginBottom: 8 }}>Logo Scale: {resolvedLogoScale.toFixed(2)}x</div>
                    <input
                      type="range" min="0.4" max="2" step="0.05"
                      value={resolvedLogoScale}
                      onChange={e => setCategoryField('logo_scale', Number(e.target.value))}
                      style={{ width: '100%', accentColor: C.primary }}
                    />
                  </div>
                  {draft.id && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Btn variant="outline" size="sm" onClick={() => moveCategory(-1)}><ArrowUp size={13} /> Move Up</Btn>
                      <Btn variant="outline" size="sm" onClick={() => moveCategory(1)}><ArrowDown size={13} /> Move Down</Btn>
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: TC.textSecondary, lineHeight: 1.6 }}>
                    Upload a custom logo or leave empty to use the auto-assigned icon based on the category slug.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: TC.g800 }}>Platform Icons</div>
                <div style={{ fontSize: 12.5, color: TC.textSecondary }}>Upload platform logos (Google Ads, Meta, TikTok…) — they appear as a row of icons in the portal sticky header.</div>
              </div>
              <Badge text={`${(draft.icons || []).length} icon${(draft.icons || []).length !== 1 ? 's' : ''}`} tone="info" />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {(draft.icons || []).map((icon, index) => {
                const src = icon.url || icon.data || icon
                return (
                  <div key={index} style={{ position: 'relative', width: 64, height: 64, borderRadius: 14, overflow: 'hidden', border: `1px solid ${TC.g200}`, background: TC.g100, display: 'grid', placeItems: 'center' }}>
                    <img src={src} alt={`Icon ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
                    <button
                      type="button"
                      onClick={() => removeIcon(index)}
                      style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: C.red, color: '#fff', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={() => iconInputRef.current?.click()}
                style={{ width: 64, height: 64, borderRadius: 14, border: `2px dashed ${C.primary}`, background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                title="Add platform icon"
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Upload size={18} color={C.primary} />
                  <span style={{ fontSize: 10, color: C.primary, fontWeight: 600 }}>Add</span>
                </div>
              </button>
            </div>

            <input ref={iconInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" multiple onChange={handleIconUpload} style={{ display: 'none' }} />

            <div style={{ fontSize: 12, color: TC.textSecondary, lineHeight: 1.6 }}>
              Icons are shown in the portal sticky header next to the category title. Upload PNG, SVG, JPEG, or WebP. Max display: up to 6 icons in a row.
            </div>
          </Card>

          <Card style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: TC.g800 }}>Translated Content</div>
                <div style={{ fontSize: 12.5, color: TC.textSecondary }}>Edit each language separately while keeping the same policy layout.</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {POLICY_LANGUAGES.map(code => (
                  <Btn key={code} variant={language === code ? 'filled' : 'outline'} size="sm" onClick={() => setLanguage(code)}>
                    {getLanguageLabel(code)}
                  </Btn>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <Input label={`${getLanguageLabel(language)} Title`} value={translation.title} onChange={e => setTranslationField(language, 'title', e.target.value)} />
              <Textarea label="Short Description" rows={3} value={translation.short_description} onChange={e => setTranslationField(language, 'short_description', e.target.value)} />
              <Select label="Translation Status" value={translation.active ? 'active' : 'disabled'} onChange={e => setTranslationField(language, 'active', e.target.value === 'active')} options={[
                { value: 'active', label: 'Active' },
                { value: 'disabled', label: 'Disabled' },
              ]} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: TC.textSecondary, marginBottom: 8 }}>Full Policy Content</div>
                <RichTextEditor value={translation.content_html} onChange={html => setTranslationField(language, 'content_html', html)} />
              </div>
            </div>
          </Card>

          <Card style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12.5, color: TC.textSecondary }}>
                Save categories and translations together. The existing built-in policies are loaded here automatically and will be written into the database when you save them.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn variant="outline" onClick={removeCategory}><Trash2 size={14} /> Delete Category</Btn>
                <Btn onClick={saveCategory} disabled={saving}>{saving ? 'Saving…' : 'Save Policy Category'}</Btn>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
