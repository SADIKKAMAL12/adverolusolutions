import { useEffect, useState } from 'react';
import { Eye, Plus, Trash2, X } from 'lucide-react';
import { useTheme } from '../shared/ThemeContext.jsx';
import { useNavigate } from '../shared/Router.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';

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

function ThemedInput({ theme, label, ...rest }) {
  return (
    <div>
      {label && <label style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8, display: 'block' }}>{label}</label>}
      <input {...rest} style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 11, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );
}

function PolicyPaymentMethodModal({ theme, method, onSave, onClose, saving }) {
  const isEdit = !!method;
  const [name, setName] = useState(method?.name || '');
  const [bankName, setBankName] = useState(method?.bank_name || '');
  const [logo, setLogo] = useState(method?.logo || '');
  const [qrCode, setQrCode] = useState(method?.qr_code || '');
  const [fields, setFields] = useState(method?.fields?.length ? method.fields : [{ label: '', value: '' }]);

  const addField = () => setFields(current => [...current, { label: '', value: '' }]);
  const removeField = (index) => setFields(current => current.filter((_, currentIndex) => currentIndex !== index));
  const updateField = (index, key, value) => {
    setFields(current => current.map((field, currentIndex) => currentIndex === index ? { ...field, [key]: value } : field));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { window.alert('Please upload an image file.'); return; }
    const reader = new FileReader();
    reader.onload = (loadEvent) => setLogo(String(loadEvent.target?.result || ''));
    reader.readAsDataURL(file);
  };

  const handleQrUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { window.alert('Please upload an image file.'); return; }
    const reader = new FileReader();
    reader.onload = (loadEvent) => setQrCode(String(loadEvent.target?.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim() || !bankName.trim()) return;
    const validFields = fields.filter(field => field.label?.trim() && field.value?.trim());
    onSave({
      id: method?.id || `pm-${Date.now()}`,
      name: name.trim(),
      bank_name: bankName.trim(),
      logo: logo || '',
      qr_code: qrCode || '',
      account: validFields[0]?.value || '',
      active: method?.active ?? true,
      fields: validFields,
    });
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, background: theme.surface, borderRadius: 20, border: `1px solid ${theme.border}`, boxShadow: theme.shadowLg, fontFamily: FONT, padding: 26, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: theme.text }}>{isEdit ? 'Edit Payment Method' : 'Add Payment Method'}</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, display: 'grid', placeItems: 'center', cursor: 'pointer', color: theme.textMuted }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <ThemedInput theme={theme} label="Display Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Binance Pay" />
          <ThemedInput theme={theme} label="Bank / Provider Name" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Binance" />

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>Payment Logo</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                {logo
                  ? <img src={logo} alt="Payment logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontWeight: 800, color: theme.textFaint }}>{name?.slice(0, 1) || 'P'}</span>}
              </div>
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" onChange={handleFileUpload} style={{ color: theme.textMuted, fontSize: 12.5 }} />
              {logo && (
                <button onClick={() => setLogo('')} style={{ height: 34, padding: '0 12px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                  Remove Logo
                </button>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted }}>Payment Information Fields</div>
              <button onClick={addField} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                <Plus size={13} /> Add Field
              </button>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {fields.map((field, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.5fr) auto', gap: 10, alignItems: 'center' }}>
                  <ThemedInput theme={theme} value={field.label} onChange={e => updateField(index, 'label', e.target.value)} placeholder="e.g. Wallet Address" />
                  <ThemedInput theme={theme} value={field.value} onChange={e => updateField(index, 'value', e.target.value)} placeholder="Enter payment information" />
                  <button onClick={() => removeField(index)} disabled={fields.length === 1} style={{ width: 40, height: 40, borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: '#ef4444', cursor: fields.length === 1 ? 'default' : 'pointer', display: 'grid', placeItems: 'center', opacity: fields.length === 1 ? 0.4 : 1 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>QR Code (optional)</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
              {qrCode
                ? (
                  <div style={{ width: 100, height: 100, borderRadius: 12, border: `1px solid ${theme.border}`, overflow: 'hidden', background: '#fff', display: 'grid', placeItems: 'center' }}>
                    <img src={qrCode} alt="QR code preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )
                : (
                  <div style={{ width: 100, height: 100, borderRadius: 12, border: `2px dashed ${theme.border}`, background: theme.surfaceSunken, display: 'grid', placeItems: 'center', color: theme.textFaint, fontSize: 12, textAlign: 'center', lineHeight: 1.4, padding: 8 }}>
                    QR Code
                  </div>
                )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" onChange={handleQrUpload} style={{ color: theme.textMuted, fontSize: 12.5 }} />
                {qrCode && (
                  <button onClick={() => setQrCode('')} style={{ height: 30, padding: '0 12px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, alignSelf: 'flex-start' }}>
                    Remove QR Code
                  </button>
                )}
                <div style={{ fontSize: 11, color: theme.textFaint, lineHeight: 1.5, maxWidth: 220 }}>Upload a QR code image. It will be shown to users in the payment details popup.</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ height: 44, padding: '0 20px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !name.trim() || !bankName.trim()} style={{ height: 44, padding: '0 22px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, opacity: (saving || !name.trim() || !bankName.trim()) ? 0.6 : 1 }}>
              {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Add Method')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPolicyPaymentsPage() {
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');
  const navigate = useNavigate();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingMethod, setEditingMethod] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await request('/api/admin/payment-methods');
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const savePaymentMethod = async (method) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const exists = paymentMethods.some(item => item.id === method.id);
      const saved = exists
        ? await request('/api/admin/payment-methods', { method: 'PUT', body: JSON.stringify(method) })
        : await request('/api/admin/payment-methods', { method: 'POST', body: JSON.stringify(method) });

      setPaymentMethods(current => {
        if (exists) return current.map(item => item.id === method.id ? saved : item);
        return [...current, saved].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
      });
      setEditingMethod(null);
      setShowAddModal(false);
      setSuccess('Payment method saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePaymentMethod = async (method) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const saved = await request('/api/admin/payment-methods', {
        method: 'PUT',
        body: JSON.stringify({ id: method.id, active: method.active === false }),
      });
      setPaymentMethods(current => current.map(item => item.id === method.id ? { ...item, ...saved } : item));
      setSuccess('Payment method updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deletePaymentMethod = async (methodId) => {
    if (!window.confirm('Delete this payment method?')) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await request(`/api/admin/payment-methods?id=${encodeURIComponent(methodId)}`, { method: 'DELETE' });
      setPaymentMethods(current => current.filter(item => item.id !== methodId));
      setSuccess('Payment method deleted successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const activeCount = paymentMethods.filter(method => method?.active !== false).length;

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: theme.textFaint, marginBottom: 8, fontWeight: 700 }}>Admin / Policy Management / Payments Management</div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Payments Management</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Manage the payment methods shown after users approve a policy.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => window.open('#/policies', '_blank')} style={{ height: 44, padding: '0 18px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 12px 26px -10px rgba(255,45,85,0.55)' }}>
            <Eye size={14} /> Preview Portal
          </button>
          <button onClick={() => setShowAddModal(true)} style={{ height: 44, padding: '0 18px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={14} /> Add Payment Method
          </button>
        </div>
      </div>

      {error && <div style={{ marginTop: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700 }}>{error}</div>}
      {success && <div style={{ marginTop: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700 }}>{success}</div>}

      <GlassCard theme={theme} style={{ marginTop: 22, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Policy Payment Methods</div>
            <div style={{ fontSize: 12.5, color: theme.textMuted }}>Configure logos, provider names, and the text fields users will see on the payments step.</div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#3b82f6', background: 'rgba(59,130,246,0.14)', padding: '5px 11px', borderRadius: 100, whiteSpace: 'nowrap' }}>{activeCount} active</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading && <div style={{ fontSize: 13, color: theme.textFaint, padding: '12px 0' }}>Loading payment methods…</div>}
          {!loading && paymentMethods.length === 0 && (
            <div style={{ fontSize: 13, color: theme.textFaint, padding: '12px 0' }}>No payment methods configured yet.</div>
          )}
          {paymentMethods.map((method, i) => {
            const last = i === paymentMethods.length - 1;
            const active = method.active !== false;
            const fieldsText = (Array.isArray(method.fields) ? method.fields : []).map(field => `${field.label || field.name}: ${field.value || field.placeholder || ''}`).join(' · ') || method.account || 'No payment information yet';
            return (
              <div key={method.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
                <div onClick={() => togglePaymentMethod(method)} style={{ width: 36, height: 20, borderRadius: 10, background: active ? `linear-gradient(90deg,${BRAND_LIGHT},${BRAND})` : theme.surfaceSunken, cursor: 'pointer', position: 'relative', transition: 'all .2s', flexShrink: 0, border: active ? 'none' : `1px solid ${theme.border}` }}>
                  <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 1, left: active ? 18 : 2, transition: 'all .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                </div>
                <div style={{ width: 46, height: 46, borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {method.logo
                    ? <img src={method.logo} alt={method.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <span style={{ fontWeight: 800, color: theme.textFaint }}>{method.name?.slice(0, 1) || 'P'}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: theme.text }}>{method.name}</div>
                  <div style={{ fontSize: 12, color: theme.textMuted }}>{method.bank_name || 'Provider details'}</div>
                  <div style={{ fontSize: 11.5, color: theme.textFaint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fieldsText}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#22c55e' : theme.textFaint, background: active ? 'rgba(34,197,94,0.14)' : theme.surfaceSunken, padding: '4px 11px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {active ? 'Active' : 'Disabled'}
                </span>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setEditingMethod(method)} style={{ height: 34, padding: '0 14px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                    Edit
                  </button>
                  <button onClick={() => deletePaymentMethod(method.id)} style={{ height: 34, padding: '0 14px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {(editingMethod || showAddModal) && (
        <PolicyPaymentMethodModal
          theme={theme}
          method={editingMethod}
          onSave={savePaymentMethod}
          onClose={() => { setEditingMethod(null); setShowAddModal(false); }}
          saving={saving}
        />
      )}
    </div>
  );
}
