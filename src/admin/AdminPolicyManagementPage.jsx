import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, Plus, Trash2, Upload, X } from 'lucide-react';
import { useTheme } from '../shared/ThemeContext.jsx';
import { useNavigate } from '../shared/Router.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import RichTextEditor from '../policies/RichTextEditor.jsx';
import {
  POLICY_LANGUAGES,
  emptyTranslation,
  getLanguageLabel,
  getPolicyLogoBySlug,
  mergeWithFallbackPolicies,
} from '../policies/policyContent.js';

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
  };
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function reorderPair(items, id, direction) {
  const index = items.findIndex(item => item.id === id);
  const targetIndex = index + direction;
  if (index < 0 || targetIndex < 0 || targetIndex >= items.length) return null;
  return [items[index], items[targetIndex]];
}

function ThemedInput({ theme, label, ...rest }) {
  return (
    <div>
      {label && <label style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8, display: 'block' }}>{label}</label>}
      <input {...rest} style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 11, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );
}

function ThemedTextarea({ theme, label, rows = 3, ...rest }) {
  return (
    <div>
      {label && <label style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8, display: 'block' }}>{label}</label>}
      <textarea {...rest} rows={rows} style={{ width: '100%', padding: '12px 14px', borderRadius: 11, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontFamily: FONT, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.5 }} />
    </div>
  );
}

function ThemedSelect({ theme, label, value, onChange, options }) {
  return (
    <div>
      {label && <label style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8, display: 'block' }}>{label}</label>}
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%', height: 44, padding: '0 34px 0 14px', borderRadius: 11, border: `1px solid ${theme.border}`,
          background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontFamily: FONT, outline: 'none', cursor: 'pointer',
          appearance: 'none', WebkitAppearance: 'none', boxSizing: 'border-box',
          backgroundImage: theme.mode === 'dark'
            ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%239d9da6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%236b6b72' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function PillButton({ theme, active, children, ...rest }) {
  return (
    <button
      {...rest}
      style={{
        height: 36, padding: '0 16px', borderRadius: 100, fontSize: 12.5, fontWeight: 700, fontFamily: FONT, cursor: 'pointer',
        border: active ? 'none' : `1px solid ${theme.border}`,
        background: active ? `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})` : theme.surfaceSunken,
        color: active ? '#fff' : theme.text,
      }}
    >
      {children}
    </button>
  );
}

export default function AdminPolicyManagementPage() {
  const navigate = useNavigate();
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');

  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(defaultCategory());
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const logoInputRef = useRef(null);
  const iconInputRef = useRef(null);

  const selectedCategory = useMemo(
    () => categories.find(category => category.id === selectedId) || null,
    [categories, selectedId],
  );

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const categoryData = await request('/api/admin/policy-categories');
      const items = mergeWithFallbackPolicies(Array.isArray(categoryData.categories) ? categoryData.categories : []);
      setCategories(items);
      const first = items[0] || null;
      setSelectedId(first?.id || '');
      setDraft(first ? JSON.parse(JSON.stringify(first)) : defaultCategory());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setDraft(JSON.parse(JSON.stringify(selectedCategory)));
  }, [selectedCategory]);

  const setCategoryField = (field, value) => {
    setDraft(current => ({ ...current, [field]: value }));
  };

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
    }));
  };

  const onCreate = () => {
    const next = defaultCategory();
    next.display_order = categories.length + 1;
    setSelectedId('');
    setLanguage('en');
    setDraft(next);
    setError('');
    setSuccess('');
  };

  const openPreview = () => {
    window.open('https://policy.adversolutions.agency', '_blank');
  };

  const saveCategory = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
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
      };

      const savedCategory = draft.id
        ? await request('/api/admin/policy-categories', { method: 'PUT', body: JSON.stringify(categoryPayload) })
        : await request('/api/admin/policy-categories', { method: 'POST', body: JSON.stringify(categoryPayload) });

      for (const lang of POLICY_LANGUAGES) {
        const translation = draft.translations?.[lang];
        if (!translation?.title && !translation?.content_html && !translation?.short_description) continue;
        await request('/api/admin/policy-translations', {
          method: 'POST',
          body: JSON.stringify({
            ...translation,
            category_id: savedCategory.id,
            language: lang,
          }),
        });
      }

      await load();
      setSelectedId(savedCategory.id);
      setSuccess('Policy category saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async () => {
    if (!draft.id) {
      onCreate();
      return;
    }
    if (!window.confirm('Delete this policy category and all translations?')) return;
    try {
      await request(`/api/admin/policy-categories?id=${encodeURIComponent(draft.id)}`, { method: 'DELETE' });
      await load();
      setSuccess('Policy category deleted.');
    } catch (err) {
      setError(err.message);
    }
  };

  const moveCategory = async (direction) => {
    const pair = reorderPair(categories, draft.id, direction);
    if (!pair) return;
    const [current, target] = pair;
    try {
      await request('/api/admin/policy-categories', {
        method: 'PUT',
        body: JSON.stringify({ id: current.id, display_order: target.display_order }),
      });
      await request('/api/admin/policy-categories', {
        method: 'PUT',
        body: JSON.stringify({ id: target.id, display_order: current.display_order }),
      });
      await load();
      setSelectedId(current.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setCategoryField('logo', String(ev.target?.result || ''));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeLogo = () => setCategoryField('logo', '');

  const handleIconUpload = (e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    const existingIcons = draft.icons || [];
    let loaded = 0;
    const newEntries = [];
    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newEntries[idx] = { data: String(ev.target?.result || ''), name: file.name };
        loaded++;
        if (loaded === files.length) {
          setCategoryField('icons', [...existingIcons, ...newEntries.filter(Boolean)]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeIcon = (index) => {
    setCategoryField('icons', (draft.icons || []).filter((_, i) => i !== index));
  };

  const translation = draft.translations?.[language] || emptyTranslation(language);
  const autoLogo = getPolicyLogoBySlug(draft.slug || slugify(draft.name));
  const resolvedLogo = draft.logo != null ? (draft.logo || null) : autoLogo;
  const resolvedLogoScale = Number(draft.logo_scale) || 1;
  const isAutoLogo = draft.logo == null && !!autoLogo;
  const hasLogoToRemove = !!resolvedLogo;

  const secondaryBtnStyle = { height: 44, padding: '0 18px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 };
  const primaryBtnStyle = { height: 44, padding: '0 20px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 12px 26px -10px rgba(255,45,85,0.55)' };

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: theme.textFaint, marginBottom: 8, fontWeight: 700 }}>Admin / Policy Management</div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Policy Management</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted, maxWidth: 640 }}>Manage policy categories, translated content, and display order for the public policy portal.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={secondaryBtnStyle} onClick={() => navigate('/admin/policies/account-types')}>Account Types</button>
          <button style={secondaryBtnStyle} onClick={() => navigate('/admin/policies/payments')}>Payments Management</button>
          <button style={primaryBtnStyle} onClick={openPreview}><Eye size={14} /> Preview Portal</button>
          <button style={secondaryBtnStyle} onClick={onCreate}><Plus size={14} /> New Category</button>
        </div>
      </div>

      {error && <div style={{ marginTop: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700 }}>{error}</div>}
      {success && <div style={{ marginTop: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700 }}>{success}</div>}

      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '320px minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
        <GlassCard theme={theme} style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Categories</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>Active and fallback-ready public tabs.</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', background: 'rgba(59,130,246,0.14)', padding: '4px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>{categories.length} total</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading && <div style={{ fontSize: 13, color: theme.textFaint }}>Loading policy categories…</div>}
            {!loading && categories.length === 0 && <div style={{ fontSize: 13, color: theme.textFaint }}>No categories yet. Create the first one.</div>}
            {categories.map(category => {
              const active = category.id === selectedId;
              const categoryLogo = category.logo != null ? category.logo : getPolicyLogoBySlug(category.slug);
              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => setSelectedId(category.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                    borderRadius: 14, border: `1px solid ${active ? 'rgba(255,45,85,0.4)' : theme.border}`,
                    background: active ? 'rgba(255,45,85,0.08)' : theme.surfaceSunken,
                    padding: '12px 13px', cursor: 'pointer', fontFamily: FONT,
                  }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 12, overflow: 'hidden', background: theme.surface, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {categoryLogo
                      ? <img src={categoryLogo} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${Number(category.logo_scale) || 1})` }} />
                      : <span style={{ fontWeight: 800, color: theme.textFaint }}>{category.name?.slice(0, 1)}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: theme.text, fontSize: 13.5 }}>{category.name}</div>
                    <div style={{ fontSize: 11.5, color: theme.textFaint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{category.slug}</div>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: category.active ? '#22c55e' : theme.textFaint, background: category.active ? 'rgba(34,197,94,0.14)' : theme.surface, padding: '4px 9px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {category.active ? 'Active' : 'Disabled'}
                  </span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <GlassCard theme={theme} style={{ padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
              <ThemedInput theme={theme} label="Category Name" value={draft.name} onChange={e => {
                const name = e.target.value;
                setCategoryField('name', name);
                if (!draft.slug || draft.slug === slugify(draft.name)) setCategoryField('slug', slugify(name));
              }} />
              <ThemedInput theme={theme} label="Slug" value={draft.slug} onChange={e => setCategoryField('slug', slugify(e.target.value))} />
              <div style={{ gridColumn: '1 / -1' }}>
                <ThemedTextarea theme={theme} label="Description" rows={3} value={draft.description} onChange={e => setCategoryField('description', e.target.value)} />
              </div>
              <ThemedInput theme={theme} label="Display Order" type="number" value={draft.display_order} onChange={e => setCategoryField('display_order', Number(e.target.value || 0))} />
              <ThemedSelect theme={theme} label="Status" value={draft.active ? 'active' : 'disabled'} onChange={e => setCategoryField('active', e.target.value === 'active')} options={[
                { value: 'active', label: 'Active' },
                { value: 'disabled', label: 'Disabled' },
              ]} />
            </div>

            <div style={{ marginTop: 20, borderTop: `1px solid ${theme.border}`, paddingTop: 20 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text, marginBottom: 14 }}>Category Logo</div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    style={{ width: 120, height: 120, borderRadius: 18, overflow: 'hidden', background: theme.surfaceSunken, display: 'grid', placeItems: 'center', border: `2px dashed ${resolvedLogo ? theme.border : 'rgba(255,45,85,0.4)'}`, cursor: 'pointer', position: 'relative' }}
                    title="Click to upload logo"
                  >
                    {resolvedLogo
                      ? <img src={resolvedLogo} alt={draft.name || 'Logo'} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${resolvedLogoScale})` }} />
                      : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <Upload size={22} color={BRAND} />
                          <span style={{ fontSize: 11, color: BRAND, fontWeight: 700 }}>Upload</span>
                        </div>}
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  <button onClick={() => logoInputRef.current?.click()} style={{ ...secondaryBtnStyle, height: 36, width: '100%', justifyContent: 'center', fontSize: 12 }}>
                    <Upload size={13} /> Upload
                  </button>
                  {hasLogoToRemove && (
                    <button onClick={removeLogo} style={{ height: 36, width: '100%', justifyContent: 'center', borderRadius: 100, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <X size={13} /> Remove
                    </button>
                  )}
                  {isAutoLogo && <div style={{ fontSize: 11, color: theme.textFaint, textAlign: 'center', lineHeight: 1.4 }}>Auto from slug</div>}
                  {!resolvedLogo && !isAutoLogo && <div style={{ fontSize: 11, color: theme.textFaint, textAlign: 'center', lineHeight: 1.4 }}>No logo</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>Logo Scale: {resolvedLogoScale.toFixed(2)}x</div>
                    <input
                      type="range" min="0.4" max="2" step="0.05"
                      value={resolvedLogoScale}
                      onChange={e => setCategoryField('logo_scale', Number(e.target.value))}
                      style={{ width: '100%', accentColor: BRAND }}
                    />
                  </div>
                  {draft.id && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button onClick={() => moveCategory(-1)} style={{ ...secondaryBtnStyle, height: 36, fontSize: 12 }}><ArrowUp size={13} /> Move Up</button>
                      <button onClick={() => moveCategory(1)} style={{ ...secondaryBtnStyle, height: 36, fontSize: 12 }}><ArrowDown size={13} /> Move Down</button>
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.6 }}>
                    Upload a custom logo or leave empty to use the auto-assigned icon based on the category slug.
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard theme={theme} style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Platform Icons</div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>Upload platform logos (Google Ads, Meta, TikTok…) — they appear as a row of icons in the portal sticky header.</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', background: 'rgba(59,130,246,0.14)', padding: '4px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                {(draft.icons || []).length} icon{(draft.icons || []).length !== 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {(draft.icons || []).map((icon, index) => {
                const src = icon.url || icon.data || icon;
                return (
                  <div key={index} style={{ position: 'relative', width: 64, height: 64, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}`, background: theme.surfaceSunken, display: 'grid', placeItems: 'center' }}>
                    <img src={src} alt={`Icon ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
                    <button
                      type="button"
                      onClick={() => removeIcon(index)}
                      style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => iconInputRef.current?.click()}
                style={{ width: 64, height: 64, borderRadius: 14, border: '2px dashed rgba(255,45,85,0.4)', background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                title="Add platform icon"
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Upload size={18} color={BRAND} />
                  <span style={{ fontSize: 10, color: BRAND, fontWeight: 700 }}>Add</span>
                </div>
              </button>
            </div>

            <input ref={iconInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" multiple onChange={handleIconUpload} style={{ display: 'none' }} />

            <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.6 }}>
              Icons are shown in the portal sticky header next to the category title. Upload PNG, SVG, JPEG, or WebP. Max display: up to 6 icons in a row.
            </div>
          </GlassCard>

          <GlassCard theme={theme} style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Translated Content</div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>Edit each language separately while keeping the same policy layout.</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {POLICY_LANGUAGES.map(code => (
                  <PillButton key={code} theme={theme} active={language === code} onClick={() => setLanguage(code)}>
                    {getLanguageLabel(code)}
                  </PillButton>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <ThemedInput theme={theme} label={`${getLanguageLabel(language)} Title`} value={translation.title} onChange={e => setTranslationField(language, 'title', e.target.value)} />
              <ThemedTextarea theme={theme} label="Short Description" rows={3} value={translation.short_description} onChange={e => setTranslationField(language, 'short_description', e.target.value)} />
              <ThemedSelect theme={theme} label="Translation Status" value={translation.active ? 'active' : 'disabled'} onChange={e => setTranslationField(language, 'active', e.target.value === 'active')} options={[
                { value: 'active', label: 'Active' },
                { value: 'disabled', label: 'Disabled' },
              ]} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>Full Policy Content</div>
                <RichTextEditor value={translation.content_html} onChange={html => setTranslationField(language, 'content_html', html)} />
              </div>
            </div>
          </GlassCard>

          <GlassCard theme={theme} style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontSize: 12.5, color: theme.textMuted, maxWidth: 480 }}>
                Save categories and translations together. The existing built-in policies are loaded here automatically and will be written into the database when you save them.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={removeCategory} style={{ height: 44, padding: '0 18px', borderRadius: 100, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trash2 size={14} /> Delete Category
                </button>
                <button onClick={saveCategory} disabled={saving} style={{ ...primaryBtnStyle, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : 'Save Policy Category'}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
