import { useState, useCallback } from 'react';
import { useTheme } from '../shared/ThemeContext.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import {
  Box, Layers, ShieldCheck, FileText, RotateCw, Plus, Pencil, Trash2,
  Upload, AlertTriangle, Save, ChevronLeft, Eye, Package,
} from 'lucide-react';

async function apiGet(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString();
  const res = await fetch(`/api/crud?${qs}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { console.error('Non-JSON:', text.slice(0, 200)); return []; }
}
async function apiPost(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}
async function apiPut(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}
async function apiDelete(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString();
  const res = await fetch(`/api/crud?${qs}`, { method: 'DELETE' });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

const PLATFORM_STYLE = {
  meta:      { color: '#2563eb', bg: 'rgba(37,99,235,0.16)', label: 'M' },
  google:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.16)', label: 'G' },
  tiktok:    { color: '#e5e5e5', bg: 'rgba(255,255,255,0.1)', label: 'T' },
  snapchat:  { color: '#c9a600', bg: 'rgba(242,196,0,0.18)', label: 'S' },
  twitter:   { color: '#1da1f2', bg: 'rgba(29,161,242,0.16)', label: 'X' },
  linkedin:  { color: '#0a66c2', bg: 'rgba(10,102,194,0.16)', label: 'L' },
  bing:      { color: '#0d8ecf', bg: 'rgba(37,150,190,0.18)', label: 'B' },
  pinterest: { color: '#e60023', bg: 'rgba(230,0,35,0.16)', label: 'P' },
  reddit:    { color: '#ff4500', bg: 'rgba(255,69,0,0.16)', label: 'R' },
};
function platformStyle(platform) {
  return PLATFORM_STYLE[(platform || '').toLowerCase()] || { color: '#9d9da6', bg: 'rgba(255,255,255,0.08)', label: (platform || '?')[0]?.toUpperCase() || '?' };
}

function PlatformLogo({ platform, logo, size = 40 }) {
  const s = platformStyle(platform);
  if (logo) {
    return (
      <div style={{ width: size, height: size, borderRadius: size * 0.3, overflow: 'hidden', flexShrink: 0 }}>
        <img src={logo} alt={platform} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.3, background: s.bg, color: s.color, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: size * 0.4, flexShrink: 0 }}>
      {s.label}
    </div>
  );
}

function StatCard({ theme, icon, label, value, tint }) {
  return (
    <GlassCard theme={theme} style={{ padding: 20 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${tint}22`, color: tint, display: 'grid', placeItems: 'center' }}>{icon}</div>
      <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 600, color: theme.textMuted }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 26, fontWeight: 800, color: theme.text, letterSpacing: '-0.01em' }}>{value}</div>
    </GlassCard>
  );
}

function ConditionBadge({ condition }) {
  const map = { New: { bg: 'rgba(59,130,246,0.14)', color: '#3b82f6' }, Aged: { bg: 'rgba(34,197,94,0.14)', color: '#22c55e' } };
  const s = map[condition] || { bg: 'rgba(255,255,255,0.08)', color: '#9d9da6' };
  return <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '5px 11px', borderRadius: 100, whiteSpace: 'nowrap' }}>{condition}</span>;
}

const LINE_STATUS_MAP = {
  available: { bg: 'rgba(34,197,94,0.14)', color: '#22c55e' },
  sold:      { bg: 'rgba(59,130,246,0.14)', color: '#3b82f6' },
  reserved:  { bg: 'rgba(245,158,11,0.14)', color: '#f59e0b' },
};
function LineStatusBadge({ status }) {
  const s = LINE_STATUS_MAP[status] || LINE_STATUS_MAP.available;
  return <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '4px 10px', borderRadius: 100, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{status}</span>;
}

function ProductCard({ theme, product, qty, onEdit, onOpen, onDelete, deleting }) {
  const [hover, setHover] = useState(false);
  const outOfStock = qty === 0;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(product)}
      style={{
        background: theme.mode === 'dark' ? 'rgba(255,255,255,0.035)' : theme.surface,
        backdropFilter: theme.mode === 'dark' ? 'blur(20px)' : 'none',
        border: `1px solid ${hover ? 'rgba(255,45,85,0.3)' : theme.border}`,
        borderRadius: 20, padding: 20, cursor: 'pointer',
        transition: 'all .2s',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hover ? theme.glowSoft : theme.shadow,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <PlatformLogo platform={product.platform} logo={product.logo} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={e => { e.stopPropagation(); onEdit(product); }} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 11px', borderRadius: 9, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
            <Pencil size={13} /> Edit
          </button>
          <button onClick={e => onDelete(product, e)} disabled={deleting} style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', display: 'grid', placeItems: 'center', cursor: deleting ? 'default' : 'pointer', opacity: deleting ? 0.5 : 1 }}>
            <Trash2 size={13} />
          </button>
          <ConditionBadge condition={product.type} />
        </div>
      </div>
      <div style={{ marginTop: 14, fontSize: 16, fontWeight: 700, color: theme.text }}>{product.title}</div>
      <div style={{ marginTop: 3, fontSize: 12.5, color: theme.textMuted }}>{product.platform} · {product.country || 'Any'}</div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: '-0.01em' }}>${Number(product.price).toFixed(2)}</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: outOfStock ? '#ef4444' : '#22c55e' }}>{outOfStock ? '0 in stock' : `${qty} in stock`}</div>
      </div>
    </div>
  );
}

function ThemedInput({ theme, label, ...rest }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 8, display: 'block' }}>{label}</label>}
      <input {...rest} style={{ width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );
}
function ThemedSelectField({ theme, label, value, onChange, options }) {
  return (
    <div>
      {label && <label style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 8, display: 'block' }}>{label}</label>}
      <select value={value} onChange={onChange} style={{ width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontFamily: FONT, outline: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', boxSizing: 'border-box' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function ProductEditor({ theme, isEditMode, initial, saving, error, onSave, onCancel }) {
  const [title, setTitle] = useState(initial.title);
  const [platform, setPlatform] = useState(initial.platform);
  const [customPlatform, setCustomPlatform] = useState('');
  const [condition, setCondition] = useState(initial.type);
  const [country, setCountry] = useState(initial.country);
  const [price, setPrice] = useState(initial.price);
  const [desc, setDesc] = useState(initial.description);
  const [logoPreview, setLogoPreview] = useState(initial.logo || null);
  const [lines, setLines] = useState(initial.linesText || '');

  const inputStyle = { width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 8, display: 'block' };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!title || !price) return;
    onSave({ title, platform, customPlatform, type: condition, country, price, description: desc, logo: logoPreview, linesText: lines });
  };

  return (
    <div style={{ fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onCancel} style={{ width: 38, height: 38, borderRadius: 11, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, display: 'grid', placeItems: 'center', cursor: 'pointer', color: theme.text }}>
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: theme.text, letterSpacing: '-0.01em' }}>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            {isEditMode && <p style={{ margin: '4px 0 0', fontSize: 13, color: theme.textMuted }}>{initial.title}</p>}
          </div>
        </div>
        <button onClick={submit} disabled={saving} style={{ height: 44, padding: '0 22px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 12px 26px -10px rgba(255,45,85,0.55)', opacity: saving ? 0.7 : 1 }}>
          <Save size={15} /> {saving ? 'Saving…' : isEditMode ? 'Save Changes' : 'Save Product'}
        </button>
      </div>

      {error && <div style={{ marginTop: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{error}</div>}

      <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
        <GlassCard theme={theme} style={{ padding: 26 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: theme.text, marginBottom: 20 }}>Product Information</div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Product Logo <span style={{ fontWeight: 500, color: theme.textFaint }}>(500 × 500px recommended)</span></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <label style={{ cursor: 'pointer' }}>
                <div style={{ width: 84, height: 84, borderRadius: 18, border: '1.5px dashed rgba(255,45,85,0.4)', background: theme.mode === 'dark' ? 'rgba(255,45,85,0.06)' : '#fff5f7', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                  {logoPreview
                    ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <PlatformLogo platform={platform} size={44} />}
                </div>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', borderRadius: 9, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                  <Upload size={14} /> Upload new
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                </label>
                {logoPreview && (
                  <button onClick={() => setLogoPreview(null)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: FONT }}>✕ Remove</button>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Product Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Meta Aged Accounts (US)" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Platform *</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
                {['Meta', 'Google', 'TikTok', 'Snapchat', 'Twitter', 'LinkedIn', 'Bing', 'Pinterest', 'Reddit', 'Other'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Account Type *</label>
              <input value={condition} onChange={e => setCondition(e.target.value)} placeholder="e.g. Aged, Fresh, Business…" style={inputStyle} />
            </div>
          </div>
          {platform === 'Other' && (
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Platform Name *</label>
              <input value={customPlatform} onChange={e => setCustomPlatform(e.target.value)} placeholder="e.g. Reddit, Pinterest…" style={inputStyle} />
            </div>
          )}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Country</label>
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Any country" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Price (USD) *</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="120.00" style={inputStyle} />
          </div>
        </GlassCard>

        <GlassCard theme={theme} style={{ padding: 26 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: theme.text, marginBottom: 14 }}>Product Description</div>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Describe this product for customers…"
            style={{ width: '100%', minHeight: 220, padding: 16, borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, lineHeight: 1.6, fontFamily: FONT, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
        </GlassCard>
      </div>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <GlassCard theme={theme} style={{ padding: 26 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: theme.text, marginBottom: 14 }}>{isEditMode ? 'Inventory Lines' : 'Bulk Add Inventory'}</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.28)', marginBottom: 16 }}>
            <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12.5, color: theme.text, lineHeight: 1.5 }}>
              {isEditMode ? 'Existing available lines are shown below. Saving will replace them with this list.' : 'Each line = 1 account. Format: email | password | 2fa'}
            </div>
          </div>
          <textarea
            value={lines}
            onChange={e => setLines(e.target.value)}
            placeholder={'email|password|2fa\nemail|password|2fa'}
            style={{ width: '100%', minHeight: 220, padding: 16, borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, lineHeight: 1.7, fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
        </GlassCard>
        <GlassCard theme={theme} style={{ padding: 22 }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: theme.text, marginBottom: 14 }}>Notes</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Each account on its own line.', 'Format: email | password | 2fa', '2FA: any format accepted', 'Editable after saving.'].map((n, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: theme.textMuted, lineHeight: 1.5 }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: BRAND, marginTop: 6, flexShrink: 0 }} />
                {n}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

function ProductDetail({ theme, product, lines, onBack, onEdit, onDelete, deleting }) {
  const productLines = lines.filter(l => l.productId === product.id || l.product_id === product.id);
  const counts = {
    total: productLines.length,
    available: productLines.filter(l => l.status === 'available').length,
    sold: productLines.filter(l => l.status === 'sold').length,
    reserved: productLines.filter(l => l.status === 'reserved').length,
  };
  const [revealed, setRevealed] = useState({});

  return (
    <div style={{ fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 11, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, display: 'grid', placeItems: 'center', cursor: 'pointer', color: theme.text }}>
          <ChevronLeft size={16} />
        </button>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: theme.text, letterSpacing: '-0.01em', flex: 1 }}>{product.title}</h1>
        <button onClick={() => onDelete(product)} disabled={deleting} style={{ height: 40, padding: '0 16px', borderRadius: 100, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: deleting ? 'default' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trash2 size={14} /> {deleting ? 'Deleting…' : 'Delete'}
        </button>
        <button onClick={() => onEdit(product)} style={{ height: 40, padding: '0 18px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Pencil size={14} /> Edit
        </button>
      </div>

      <div style={{ marginTop: 22 }}>
        <GlassCard theme={theme} style={{ padding: 22, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <PlatformLogo platform={product.platform} logo={product.logo} size={52} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[`Platform: ${product.platform}`, `Type: ${product.type}`, `Country: ${product.country || 'Any'}`].map(t => (
                <span key={t} style={{ background: theme.surfaceSunken, border: `1px solid ${theme.border}`, color: theme.textMuted, fontSize: 11, padding: '4px 11px', borderRadius: 20, fontWeight: 700 }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 26 }}>
            {[['Total', counts.total, theme.text], ['Available', counts.available, '#22c55e'], ['Sold', counts.sold, '#3b82f6'], ['Reserved', counts.reserved, '#f59e0b']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: theme.textFaint, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: c, letterSpacing: '-0.02em' }}>{v}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div style={{ marginTop: 20 }}>
        <GlassCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
              <thead>
                <tr>
                  {['ID', 'Email', 'Password', '2FA', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '14px 22px', fontSize: 11, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productLines.map((l, i) => {
                  const last = i === productLines.length - 1;
                  const show = revealed[l.id];
                  return (
                    <tr key={l.id}>
                      <td style={{ padding: '13px 22px', fontSize: 12, fontWeight: 800, color: BRAND, borderBottom: last ? 'none' : `1px solid ${theme.border}` }}>{l.id}</td>
                      <td style={{ padding: '13px 22px', fontSize: 12.5, fontFamily: 'monospace', color: theme.textMuted, borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{l.email}</td>
                      <td style={{ padding: '13px 22px', fontSize: 12.5, fontFamily: 'monospace', color: theme.textFaint, borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setRevealed(r => ({ ...r, [l.id]: !r[l.id] }))}>
                          {show ? l.password : '••••••••••••'} <Eye size={12} />
                        </span>
                      </td>
                      <td style={{ padding: '13px 22px', fontSize: 12.5, fontFamily: 'monospace', color: theme.textFaint, borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setRevealed(r => ({ ...r, [l.id]: !r[l.id] }))}>
                          {show ? l.twofa : '••••••••'} <Eye size={12} />
                        </span>
                      </td>
                      <td style={{ padding: '13px 22px', borderBottom: last ? 'none' : `1px solid ${theme.border}` }}><LineStatusBadge status={l.status} /></td>
                    </tr>
                  );
                })}
                {productLines.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '24px 22px', textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>No inventory lines yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export function AdminInventoryPage({ products, lines, setStore }) {
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const theme = getAdminTheme(isDark);

  const [view, setView] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const productList = products || [];
  const lineList = lines || [];

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, linesData] = await Promise.all([apiGet('inventory_products'), apiGet('inventory_lines')]);
      setStore(s => ({ ...s, inventoryProducts: productsData || s.inventoryProducts, inventoryLines: linesData || s.inventoryLines }));
    } catch (err) {
      console.error('Refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setStore]);

  const startEdit = (prod) => {
    const productLines = lineList.filter(l => l.productId === prod.id || l.product_id === prod.id);
    setEditingProduct(prod);
    setView('add');
  };

  const editorInitial = editingProduct
    ? {
        title: editingProduct.title || '', platform: editingProduct.platform || 'Meta', type: editingProduct.type || 'Aged',
        price: editingProduct.price?.toString() || '', country: editingProduct.country || '', description: editingProduct.description || '',
        logo: editingProduct.logo || null,
        linesText: lineList.filter(l => (l.productId === editingProduct.id || l.product_id === editingProduct.id) && l.status === 'available')
          .map(l => [l.email, l.password, l.twofa].filter(Boolean).join(' | ')).join('\n'),
      }
    : { title: '', platform: 'Meta', type: 'Aged', price: '', country: '', description: '', logo: null, linesText: '' };

  const saveNewProduct = async (form) => {
    if (!form.title || !form.price) return;
    setSaving(true); setError('');
    try {
      const productId = `prod-${Date.now()}`;
      const resolvedPlatform = form.platform === 'Other' ? (form.customPlatform || 'Other') : form.platform;
      const product = {
        id: productId, title: form.title, platform: resolvedPlatform, type: form.type, price: Number(form.price),
        country: form.country || '', description: form.description || '', logo: form.logo || null,
        created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      const parsedLines = form.linesText.trim()
        ? form.linesText.trim().split('\n').map((line, i) => {
            const parts = line.split('|').map(p => p.trim());
            return { id: `l-${Date.now()}-${i}`, product_id: productId, email: parts[0] || '', password: parts[1] || '', twofa: parts[2] || '', status: 'available' };
          }).filter(l => l.email)
        : [];
      await apiPost('inventory_products', product);
      if (parsedLines.length > 0) await apiPost('inventory_lines', parsedLines);
      setStore(s => ({
        ...s,
        inventoryProducts: [product, ...s.inventoryProducts],
        inventoryLines: [...parsedLines.map(l => ({ ...l, productId: l.product_id })), ...s.inventoryLines],
      }));
      setView('list'); setEditingProduct(null);
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateExistingProduct = async (form) => {
    if (!form.title || !form.price) return;
    setSaving(true); setError('');
    try {
      const resolvedPlatform = form.platform === 'Other' ? (form.customPlatform || 'Other') : form.platform;
      const product = {
        id: editingProduct.id, title: form.title, platform: resolvedPlatform, type: form.type, price: Number(form.price),
        country: form.country || '', description: form.description || '', logo: form.logo !== null ? form.logo : (editingProduct.logo || null),
      };
      const updatedLines = form.linesText.trim()
        ? form.linesText.trim().split('\n').map((line, i) => {
            const parts = line.split('|').map(p => p.trim());
            return { id: `l-${Date.now()}-${i}`, product_id: editingProduct.id, email: parts[0] || '', password: parts[1] || '', twofa: parts[2] || '', status: 'available' };
          }).filter(l => l.email)
        : [];
      await apiPut('inventory_products', product);
      await fetch(`/api/crud?table=inventory_lines&product_id=${encodeURIComponent(editingProduct.id)}&status=available`, { method: 'DELETE' });
      if (updatedLines.length > 0) await apiPost('inventory_lines', updatedLines);
      setStore(s => ({
        ...s,
        inventoryProducts: s.inventoryProducts.map(p => p.id === editingProduct.id ? product : p),
        inventoryLines: [
          ...s.inventoryLines.filter(l => (l.product_id !== editingProduct.id && l.productId !== editingProduct.id) || l.status !== 'available'),
          ...updatedLines.map(l => ({ ...l, productId: l.product_id })),
        ],
      }));
      setView('list'); setEditingProduct(null);
    } catch (err) {
      setError('Failed to update: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (prod, e) => {
    e?.stopPropagation?.();
    if (!confirm(`Delete "${prod.title}" and all its inventory lines? This cannot be undone.`)) return;
    setDeletingId(prod.id);
    try {
      await apiDelete('inventory_products', { id: prod.id });
      setStore(s => ({
        ...s,
        inventoryProducts: s.inventoryProducts.filter(p => p.id !== prod.id),
        inventoryLines: s.inventoryLines.filter(l => l.product_id !== prod.id && l.productId !== prod.id),
      }));
      if (selectedProduct?.id === prod.id) setSelectedProduct(null);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const wrap = (content) => (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>{content}</div>
  );

  if (view === 'add') {
    return wrap(
      <ProductEditor
        theme={theme}
        isEditMode={!!editingProduct}
        initial={editorInitial}
        saving={saving}
        error={error}
        onCancel={() => { setView('list'); setEditingProduct(null); setError(''); }}
        onSave={(form) => editingProduct ? updateExistingProduct(form) : saveNewProduct(form)}
      />
    );
  }

  if (selectedProduct) {
    return wrap(
      <ProductDetail
        theme={theme}
        product={selectedProduct}
        lines={lineList}
        onBack={() => setSelectedProduct(null)}
        onEdit={(p) => { setSelectedProduct(null); startEdit(p); }}
        onDelete={deleteProduct}
        deleting={deletingId === selectedProduct.id}
      />
    );
  }

  const STATS = [
    { icon: <Box size={17} strokeWidth={1.8} />, label: 'Total Products', value: productList.length, tint: '#3b82f6' },
    { icon: <Layers size={17} strokeWidth={1.8} />, label: 'Total Lines', value: lineList.length, tint: BRAND },
    { icon: <ShieldCheck size={17} strokeWidth={1.8} />, label: 'Available', value: lineList.filter(l => l.status === 'available').length, tint: '#22c55e' },
    { icon: <FileText size={17} strokeWidth={1.8} />, label: 'Sold', value: lineList.filter(l => l.status === 'sold').length, tint: '#3b82f6' },
  ];

  return wrap(
    <div style={{ fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Inventory</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Manage pre-verified account products and stock.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={refetch} disabled={loading} style={{ height: 44, padding: '0 18px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
            <RotateCw size={14} /> {loading ? 'Loading…' : 'Refresh'}
          </button>
          <button onClick={() => { setEditingProduct(null); setView('add'); }} style={{ height: 44, padding: '0 20px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 12px 26px -10px rgba(255,45,85,0.55)' }}>
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STATS.map(s => <StatCard key={s.label} theme={theme} {...s} />)}
      </div>

      <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {productList.map(prod => {
          const qty = lineList.filter(l => (l.productId === prod.id || l.product_id === prod.id) && l.status === 'available').length;
          return (
            <ProductCard
              key={prod.id} theme={theme} product={prod} qty={qty}
              onEdit={startEdit} onOpen={setSelectedProduct} onDelete={deleteProduct}
              deleting={deletingId === prod.id}
            />
          );
        })}
        {productList.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: theme.textFaint, fontSize: 13.5 }}>
            <Package size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
            <div>No products yet.</div>
          </div>
        )}
      </div>
    </div>
  );
}
