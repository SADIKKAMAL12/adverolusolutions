import { useEffect, useRef, useState } from 'react';
import { GripVertical, Pencil, Plus, Trash2, Upload, X, ChevronLeft } from 'lucide-react';
import { useTheme } from '../shared/ThemeContext.jsx';
import { useNavigate } from '../shared/Router.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ThemedInput({ theme, label, ...rest }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 8, display: 'block' }}>{label}</label>}
      <input {...rest} style={{ width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );
}

function AccountTypeModal({ theme, editing, initialName, initialLogo, saving, error, onSave, onClose }) {
  const [name, setName] = useState(initialName);
  const [logo, setLogo] = useState(initialLogo);
  const logoInputRef = useRef(null);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogo(await readFileAsBase64(file));
    e.target.value = '';
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: theme.surface, borderRadius: 20, border: `1px solid ${theme.border}`, boxShadow: theme.shadowLg, fontFamily: FONT, padding: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: theme.text }}>{editing ? 'Edit Account Type' : 'Add Account Type'}</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, display: 'grid', placeItems: 'center', cursor: 'pointer', color: theme.textMuted }}>
            <X size={15} />
          </button>
        </div>

        <ThemedInput
          theme={theme}
          label="Account Type Name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Google Ads PRO"
          onKeyDown={e => e.key === 'Enter' && onSave({ name, logo })}
          autoFocus
        />

        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 8, display: 'block' }}>Logo / Icon</label>
          <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {logo
                ? <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                : <span style={{ fontSize: 11, color: theme.textFaint }}>None</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', borderRadius: 9, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
              >
                <Upload size={14} /> {logo ? 'Change Logo' : 'Upload Logo'}
              </button>
              {logo && (
                <button type="button" onClick={() => setLogo(null)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: FONT }}>
                  Remove logo
                </button>
              )}
            </div>
          </div>
        </div>

        {error && <div style={{ marginTop: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '10px 14px', borderRadius: 10, fontSize: 12.5 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button
            onClick={() => onSave({ name, logo })}
            disabled={saving}
            style={{ flex: 1, height: 46, borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: FONT, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Add')}
          </button>
          <button onClick={onClose} style={{ height: 46, padding: '0 20px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAccountTypesPage() {
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // drag state
  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await request('/api/account-types');
      setTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDragStart = (e, idx) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e, idx) => {
    e.preventDefault();
    dragOverIdx.current = idx;
  };

  const onDrop = async () => {
    const from = dragIdx.current;
    const to = dragOverIdx.current;
    if (from === null || to === null || from === to) return;
    dragIdx.current = null;
    dragOverIdx.current = null;

    const reordered = [...types];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const updated = reordered.map((t, i) => ({ ...t, sort_order: i + 1 }));
    setTypes(updated);

    setReordering(true);
    try {
      await Promise.all(
        updated.map(t => request('/api/account-types', {
          method: 'PUT',
          body: JSON.stringify({ id: t.id, sort_order: t.sort_order }),
        }))
      );
      setSuccess('Order saved');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError('Failed to save order: ' + e.message);
    } finally {
      setReordering(false);
    }
  };

  const openAdd = () => { setEditing(null); setError(''); setShowModal(true); };
  const openEdit = (t) => { setEditing(t); setError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async ({ name, logo }) => {
    if (!name.trim()) { setError('Name cannot be empty'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { name };
      if (logo !== (editing?.logo || null)) payload.logo = logo;
      if (editing) {
        await request('/api/account-types', { method: 'PUT', body: JSON.stringify({ id: editing.id, ...payload }) });
        setSuccess('Account type updated');
      } else {
        await request('/api/account-types', { method: 'POST', body: JSON.stringify(payload) });
        setSuccess('Account type added');
      }
      closeModal();
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account type?')) return;
    try {
      await request(`/api/account-types?id=${id}`, { method: 'DELETE' });
      setSuccess('Deleted');
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleToggle = async (t) => {
    try {
      await request('/api/account-types', { method: 'PUT', body: JSON.stringify({ id: t.id, active: !t.active }) });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <button onClick={() => navigate('/admin/policies')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: theme.textMuted, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, padding: 0, marginBottom: 10 }}>
            <ChevronLeft size={14} /> Back to Policies
          </button>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Account Types</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Manage the account types shown to users in the policy order form. Drag rows to reorder.</p>
        </div>
        <button onClick={openAdd} style={{ height: 44, padding: '0 20px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 12px 26px -10px rgba(255,45,85,0.55)' }}>
          <Plus size={15} /> Add Account Type
        </button>
      </div>

      {error && !showModal && (
        <div style={{ marginTop: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{error}</div>
      )}
      {success && (
        <div style={{ marginTop: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{success}</div>
      )}
      {reordering && (
        <div style={{ marginTop: 20, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>Saving new order…</div>
      )}

      <GlassCard theme={theme} style={{ marginTop: 22, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 13, color: theme.textFaint }}>Loading...</div>
        ) : types.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <p style={{ color: theme.textFaint, marginBottom: 16 }}>No account types yet.</p>
            <button onClick={openAdd} style={{ height: 42, padding: '0 18px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Plus size={14} /> Add First Account Type
            </button>
          </div>
        ) : (
          <div>
            {types.map((t, i) => {
              const last = i === types.length - 1;
              return (
                <div
                  key={t.id}
                  draggable
                  onDragStart={e => onDragStart(e, i)}
                  onDragOver={e => onDragOver(e, i)}
                  onDrop={onDrop}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: last ? 'none' : `1px solid ${theme.border}`, cursor: 'grab', transition: 'background .1s' }}
                >
                  <GripVertical size={16} style={{ color: theme.textFaint, flexShrink: 0 }} />
                  <div style={{ width: 34, height: 34, borderRadius: 10, overflow: 'hidden', background: theme.surfaceSunken, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {t.logo
                      ? <img src={t.logo} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
                      : <span style={{ fontSize: 12, fontWeight: 800, color: theme.textFaint }}>{t.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: t.active ? theme.text : theme.textFaint, textDecoration: t.active ? 'none' : 'line-through', userSelect: 'none' }}>
                    {t.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle(t)}
                    style={{ borderRadius: 100, padding: '5px 13px', fontSize: 11.5, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: FONT, background: t.active ? 'rgba(34,197,94,0.14)' : theme.surfaceSunken, color: t.active ? '#22c55e' : theme.textFaint }}
                  >
                    {t.active ? 'Active' : 'Hidden'}
                  </button>
                  <button type="button" onClick={() => openEdit(t)} style={{ width: 32, height: 32, borderRadius: 9, background: 'none', border: 'none', color: theme.textFaint, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" onClick={() => handleDelete(t.id)} style={{ width: 32, height: 32, borderRadius: 9, background: 'none', border: 'none', color: theme.textFaint, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {showModal && (
        <AccountTypeModal
          theme={theme}
          editing={editing}
          initialName={editing?.name || ''}
          initialLogo={editing?.logo || null}
          saving={saving}
          error={error}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
