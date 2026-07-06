import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ChevronDown, Loader2, X } from 'lucide-react'
import { api } from '../shared/api.js'

const FALLBACK_ACCOUNT_TYPES = [
  { name: 'Individual Client', logo: null },
  { name: 'Small Business', logo: null },
  { name: 'Medium Business', logo: null },
  { name: 'Agency', logo: null },
  { name: 'Freelancer', logo: null },
  { name: 'Other', logo: null },
]

const PAYMENT_METHOD_LABELS = {
  instapay: 'InstaPay',
  vodafone_cash: 'Vodafone Cash',
  bank_transfer: 'Bank Transfer',
  wise: 'Wise',
  paypal: 'PayPal',
  crypto: 'Cryptocurrency',
  cash: 'Cash',
  other: 'Other',
}

function CustomSelect({ options, value, onChange, placeholder, isDark, renderOption }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const baseCls = `w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition cursor-pointer flex items-center justify-between gap-2 ${
    isDark
      ? 'border-slate-700 bg-slate-800/70 text-white focus:border-[#ff2d55]/60'
      : 'border-slate-200 bg-white text-slate-900 focus:border-[#ff2d55]/60'
  }`
  const dropdownCls = `absolute z-50 mt-1 w-full rounded-xl border shadow-xl overflow-hidden ${
    isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
  }`

  return (
    <div ref={ref} className="relative">
      <button type="button" className={baseCls} onClick={() => setOpen(o => !o)}>
        <span className="flex items-center gap-2.5 min-w-0">
          {selected ? renderOption(selected, true) : <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{placeholder}</span>}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
      </button>
      {open && (
        <div className={dropdownCls}>
          <div className="max-h-52 overflow-y-auto py-1">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition ${
                  opt.value === value
                    ? (isDark ? 'bg-[#ff2d55]/20 text-[#ff2d55]' : 'bg-[#ff2d55]/10 text-[#ff2d55]')
                    : (isDark ? 'text-white hover:bg-slate-800' : 'text-slate-900 hover:bg-slate-50')
                }`}
              >
                {renderOption(opt, false)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrderModal({ onClose, onComplete, paymentMethods, language, policyType, isDark }) {
  const [accountTypes, setAccountTypes] = useState(FALLBACK_ACCOUNT_TYPES)

  useEffect(() => {
    api.get('/api/account-types')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAccountTypes(data.map(t => ({ name: t.name, logo: t.logo || null })))
        }
      })
      .catch(() => {})
  }, [])

  const [form, setForm] = useState({ name: '', email: '', account_type: '', payment_method: '', amount: '' })
  const [status, setStatus] = useState('idle')
  const [ticketId, setTicketId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const accountTypeOptions = accountTypes.map(t => ({ value: t.name, label: t.name, logo: t.logo }))
  const methodOptions = paymentMethods?.length
    ? paymentMethods.map(m => ({ value: m.id, label: m.name, logo: m.logo }))
    : Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => ({ value: v, label: l, logo: null }))

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.account_type || !form.payment_method || !form.amount) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const selectedPm = paymentMethods?.find(m => m.id === form.payment_method)
      const res = await api.post('/api/policy-orders', {
        ...form,
        payment_method: selectedPm?.name || form.payment_method,
        policy_type: policyType || '',
        language: language || 'en',
      })
      setTicketId(res.ticket_id)
      setStatus('success')
    } catch (err) {
      setErrorMsg(err?.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  const handleContinue = () => {
    const selected = paymentMethods?.find(m => m.id === form.payment_method) || null
    onComplete(selected)
  }

  const inputCls = `w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition focus:ring-2 focus:ring-[#ff2d55]/40 ${
    isDark
      ? 'border-slate-700 bg-slate-800/70 text-white placeholder-slate-500 focus:border-[#ff2d55]/60'
      : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-[#ff2d55]/60'
  }`
  const labelCls = `block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`

  const renderAccountType = (opt) => (
    <>
      <div className={`h-6 w-6 shrink-0 rounded-md overflow-hidden flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
        {opt.logo
          ? <img src={opt.logo} alt={opt.label} className="h-full w-full object-contain p-0.5" />
          : <span className="text-[10px] font-bold text-slate-400">{opt.label?.[0]?.toUpperCase()}</span>
        }
      </div>
      <span className="truncate">{opt.label}</span>
    </>
  )

  const renderPaymentMethod = (opt) => (
    <>
      {opt.logo && (
        <div className={`h-6 w-6 shrink-0 rounded-md overflow-hidden flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <img src={opt.logo} alt={opt.label} className="h-full w-full object-contain p-0.5" />
        </div>
      )}
      <span className="truncate">{opt.label}</span>
    </>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-950 border border-slate-800' : 'bg-white border border-slate-200'}`}>

        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-8 py-6 text-white">
          <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[#ff2d55]/20 blur-xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-16 rounded-full bg-blue-500/20 blur-xl" />
          <button type="button" onClick={onClose} className="absolute top-4 right-4 rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Step 2 of 3</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Order Information</h2>
            <p className="mt-1 text-sm text-white/70">Fill in your details to proceed to payment</p>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-8 py-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Order Registered!</p>
                <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Your ticket number is</p>
                <div className="mt-3 inline-block rounded-2xl border border-[#ff2d55]/30 bg-[#ff2d55]/10 px-6 py-3">
                  <span className="text-2xl font-bold tracking-widest text-[#ff2d55]">{ticketId}</span>
                </div>
                <p className={`mt-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Save this number for reference</p>
              </div>
              <button
                type="button"
                onClick={handleContinue}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff2d55] via-[#ff4f7a] to-[#ff7f50] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff2d55]/25 transition hover:-translate-y-0.5"
              >
                Continue to Payment
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" className={inputCls} placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>

              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" className={inputCls} placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>

              <div>
                <label className={labelCls}>Account Type</label>
                <CustomSelect
                  isDark={isDark}
                  options={accountTypeOptions}
                  value={form.account_type}
                  onChange={val => set('account_type', val)}
                  placeholder="Select account type..."
                  renderOption={renderAccountType}
                />
              </div>

              <div>
                <label className={labelCls}>Payment Method</label>
                <CustomSelect
                  isDark={isDark}
                  options={methodOptions}
                  value={form.payment_method}
                  onChange={val => set('payment_method', val)}
                  placeholder="Select payment method..."
                  renderOption={renderPaymentMethod}
                />
              </div>

              <div>
                <label className={labelCls}>Amount</label>
                <input type="text" className={inputCls} placeholder="e.g. 500 EGP or $50" value={form.amount} onChange={e => set('amount', e.target.value)} required />
              </div>

              {status === 'error' && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{errorMsg}</div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff2d55] via-[#ff4f7a] to-[#ff7f50] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#ff2d55]/25 transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {status === 'loading' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving order...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Confirm & Get Ticket</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
