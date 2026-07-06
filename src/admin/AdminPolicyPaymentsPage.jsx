import { useEffect, useState } from 'react'
import { Eye, Plus, Trash2 } from 'lucide-react'
import { Badge, Btn, Card, Input, Modal, PageShell } from '../shared/UI.jsx'
import { C, getThemeColors } from '../shared/theme.js'
import { useTheme } from '../shared/ThemeContext.jsx'

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

export default function AdminPolicyPaymentsPage() {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingMethod, setEditingMethod] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await request('/api/admin/payment-methods')
      setPaymentMethods(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const savePaymentMethod = async (method) => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const exists = paymentMethods.some(item => item.id === method.id)
      const saved = exists
        ? await request('/api/admin/payment-methods', { method: 'PUT', body: JSON.stringify(method) })
        : await request('/api/admin/payment-methods', { method: 'POST', body: JSON.stringify(method) })

      setPaymentMethods(current => {
        if (exists) return current.map(item => item.id === method.id ? saved : item)
        return [...current, saved].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
      })
      setEditingMethod(null)
      setShowAddModal(false)
      setSuccess('Payment method saved successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const togglePaymentMethod = async (method) => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const saved = await request('/api/admin/payment-methods', {
        method: 'PUT',
        body: JSON.stringify({ id: method.id, active: method.active === false }),
      })
      setPaymentMethods(current => current.map(item => item.id === method.id ? { ...item, ...saved } : item))
      setSuccess('Payment method updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deletePaymentMethod = async (methodId) => {
    if (!window.confirm('Delete this payment method?')) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await request(`/api/admin/payment-methods?id=${encodeURIComponent(methodId)}`, { method: 'DELETE' })
      setPaymentMethods(current => current.filter(item => item.id !== methodId))
      setSuccess('Payment method deleted successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const activeCount = paymentMethods.filter(method => method?.active !== false).length

  return (
    <PageShell
      title="Payments Management"
      subtitle="Manage the payment methods shown after users approve a policy."
      breadcrumb="Admin / Policy Management / Payments Management"
      actions={[
        <Btn key="preview" onClick={() => window.open('#/policies', '_blank')}><Eye size={14} /> Preview Portal</Btn>,
        <Btn key="add" variant="outline" onClick={() => setShowAddModal(true)}><Plus size={14} /> Add Payment Method</Btn>,
      ]}
    >
      {error && (
        <Card style={{ borderColor: `${C.red}33`, background: `${C.red}08` }}>
          <div style={{ color: C.red, fontWeight: 700 }}>{error}</div>
        </Card>
      )}
      {success && (
        <Card style={{ borderColor: `${C.green}33`, background: `${C.green}10` }}>
          <div style={{ color: C.green, fontWeight: 700 }}>{success}</div>
        </Card>
      )}

      <Card style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: TC.g800 }}>Policy Payment Methods</div>
            <div style={{ fontSize: 12.5, color: TC.textSecondary }}>
              Configure logos, provider names, and the text fields users will see on the payments step.
            </div>
          </div>
          <Badge text={`${activeCount} active`} tone="info" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading && <div style={{ fontSize: 13, color: TC.textSecondary }}>Loading payment methods…</div>}
          {!loading && paymentMethods.length === 0 && (
            <div style={{ fontSize: 13, color: TC.textSecondary, padding: '12px 0' }}>
              No payment methods configured yet.
            </div>
          )}
          {paymentMethods.map(method => (
            <div key={method.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: `1px solid ${TC.g100}` }}>
              <div onClick={() => togglePaymentMethod(method)} style={{ width: 36, height: 20, borderRadius: 10, background: method.active === false ? TC.g300 : C.primary, cursor: 'pointer', position: 'relative', transition: 'all .2s', flexShrink: 0 }}>
                <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: method.active === false ? 2 : 18, transition: 'all .2s' }} />
              </div>
              <div style={{ width: 46, height: 46, borderRadius: 12, border: `1px solid ${TC.g200}`, background: TC.g50, display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {method.logo
                  ? <img src={method.logo} alt={method.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontWeight: 800, color: TC.g500 }}>{method.name?.slice(0, 1) || 'P'}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: TC.g800 }}>{method.name}</div>
                <div style={{ fontSize: 12, color: TC.textSecondary }}>{method.bank_name || 'Provider details'}</div>
                <div style={{ fontSize: 11.5, color: TC.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {(Array.isArray(method.fields) ? method.fields : []).map(field => `${field.label || field.name}: ${field.value || field.placeholder || ''}`).join(' · ') || method.account || 'No payment information yet'}
                </div>
              </div>
              <Badge text={method.active === false ? 'Disabled' : 'Active'} status={method.active === false ? 'inactive' : 'active'} />
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="outline" size="sm" onClick={() => setEditingMethod(method)}>Edit</Btn>
                <Btn variant="outline" size="sm" onClick={() => deletePaymentMethod(method.id)}><Trash2 size={14} /> Delete</Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {(editingMethod || showAddModal) && (
        <PolicyPaymentMethodModal
          method={editingMethod}
          onSave={savePaymentMethod}
          onClose={() => { setEditingMethod(null); setShowAddModal(false) }}
          saving={saving}
        />
      )}
    </PageShell>
  )
}

function PolicyPaymentMethodModal({ method, onSave, onClose, saving }) {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const isEdit = !!method
  const [name, setName] = useState('')
  const [bankName, setBankName] = useState('')
  const [logo, setLogo] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [fields, setFields] = useState([{ label: '', value: '' }])

  useEffect(() => {
    setName(method?.name || '')
    setBankName(method?.bank_name || '')
    setLogo(method?.logo || '')
    setQrCode(method?.qr_code || '')
    setFields(method?.fields?.length ? method.fields : [{ label: '', value: '' }])
  }, [method])

  const addField = () => setFields(current => [...current, { label: '', value: '' }])
  const removeField = (index) => setFields(current => current.filter((_, currentIndex) => currentIndex !== index))
  const updateField = (index, key, value) => {
    setFields(current => current.map((field, currentIndex) => currentIndex === index ? { ...field, [key]: value } : field))
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { window.alert('Please upload an image file.'); return }
    const reader = new FileReader()
    reader.onload = (loadEvent) => setLogo(String(loadEvent.target?.result || ''))
    reader.readAsDataURL(file)
  }

  const handleQrUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { window.alert('Please upload an image file.'); return }
    const reader = new FileReader()
    reader.onload = (loadEvent) => setQrCode(String(loadEvent.target?.result || ''))
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!name.trim() || !bankName.trim()) return
    const validFields = fields.filter(field => field.label?.trim() && field.value?.trim())
    onSave({
      id: method?.id || `pm-${Date.now()}`,
      name: name.trim(),
      bank_name: bankName.trim(),
      logo: logo || '',
      qr_code: qrCode || '',
      account: validFields[0]?.value || '',
      active: method?.active ?? true,
      fields: validFields,
    })
  }

  return (
    <Modal title={isEdit ? 'Edit Payment Method' : 'Add Payment Method'} onClose={onClose} width={560}>
      <div style={{ display: 'grid', gap: 14 }}>
        <Input label="Display Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Binance Pay" />
        <Input label="Bank / Provider Name" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Binance" />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: TC.textSecondary, marginBottom: 8 }}>Payment Logo</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, border: `1px solid ${TC.g200}`, background: TC.g50, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              {logo
                ? <img src={logo} alt="Payment logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span style={{ fontWeight: 800, color: TC.g500 }}>{name?.slice(0, 1) || 'P'}</span>}
            </div>
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" onChange={handleFileUpload} style={{ color: TC.textSecondary, fontSize: 13 }} />
            {logo && <Btn variant="outline" size="sm" onClick={() => setLogo('')}>Remove Logo</Btn>}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TC.textSecondary }}>Payment Information Fields</div>
            <Btn variant="outline" size="sm" onClick={addField}><Plus size={14} /> Add Field</Btn>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {fields.map((field, index) => (
              <div key={`${index}-${field.label}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.5fr) auto', gap: 10, alignItems: 'center' }}>
                <Input label={index === 0 ? 'Field Label' : ''} value={field.label} onChange={e => updateField(index, 'label', e.target.value)} placeholder="e.g. Wallet Address" />
                <Input label={index === 0 ? 'Field Value' : ''} value={field.value} onChange={e => updateField(index, 'value', e.target.value)} placeholder="Enter payment information" />
                <Btn variant="outline" size="sm" onClick={() => removeField(index)} disabled={fields.length === 1}><Trash2 size={14} /></Btn>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: TC.textSecondary, marginBottom: 8 }}>QR Code (optional)</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            {qrCode
              ? <div style={{ position: 'relative', width: 100, height: 100, borderRadius: 12, border: `1px solid ${TC.g200}`, overflow: 'hidden', background: '#fff', display: 'grid', placeItems: 'center' }}>
                  <img src={qrCode} alt="QR code preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              : <div style={{ width: 100, height: 100, borderRadius: 12, border: `2px dashed ${TC.g200}`, background: TC.g50, display: 'grid', placeItems: 'center', color: TC.textSecondary, fontSize: 12, textAlign: 'center', lineHeight: 1.4, padding: 8 }}>
                  QR Code
                </div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" onChange={handleQrUpload} style={{ color: TC.textSecondary, fontSize: 13 }} />
              {qrCode && <Btn variant="outline" size="sm" onClick={() => setQrCode('')}>Remove QR Code</Btn>}
              <div style={{ fontSize: 11, color: TC.textSecondary, lineHeight: 1.5, maxWidth: 220 }}>Upload a QR code image. It will be shown to users in the payment details popup.</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving || !name.trim() || !bankName.trim()}>
            {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Add Method')}
          </Btn>
        </div>
      </div>
    </Modal>
  )
}
