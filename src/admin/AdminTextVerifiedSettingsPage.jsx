import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Upload, Search } from 'lucide-react'
import { Btn, Card, PageShell, Input } from '../shared/UI.jsx'
import { getThemeColors } from '../shared/theme.js'
import { useTheme } from '../shared/ThemeContext.jsx'
import { useNavigate } from '../shared/Router.jsx'

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function AdminTextVerifiedSettingsPage() {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const navigate = useNavigate()

  const [apiKeyLast4, setApiKeyLast4] = useState('')
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiEmail, setApiEmail] = useState('')
  const [markupPercent, setMarkupPercent] = useState(40)
  const [rentalMarkupPercent, setRentalMarkupPercent] = useState(40)
  const [allowedServices, setAllowedServices] = useState([])
  const [balance, setBalance] = useState(null)
  const [balanceError, setBalanceError] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const fileInputRefs = useRef({})

  const [availability, setAvailability] = useState({}) // { [service_name]: { verification, rental } }
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const cfg = await request('/api/admin/textverified-settings')
      setApiKeyLast4(cfg.api_key_last4 || '')
      setApiKeyConfigured(!!cfg.api_key_configured)
      setApiEmail(cfg.api_email || '')
      setMarkupPercent(cfg.markup_percent ?? 40)
      setRentalMarkupPercent(cfg.rental_markup_percent ?? 40)
      setAllowedServices(cfg.allowed_services || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!apiKeyConfigured) return
    request('/api/admin/textverified-settings?action=balance')
      .then(d => setBalance(d.balance))
      .catch(e => setBalanceError(e.message))
  }, [apiKeyConfigured])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const body = {
        api_email: apiEmail,
        markup_percent: Number(markupPercent),
        rental_markup_percent: Number(rentalMarkupPercent),
        allowed_services: allowedServices,
      }
      if (apiKeyInput.trim()) body.api_key = apiKeyInput.trim()
      const result = await request('/api/admin/textverified-settings', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setApiKeyLast4(result.api_key_last4 || '')
      setApiKeyConfigured(!!result.api_key_configured)
      setAllowedServices(result.allowed_services || allowedServices)
      setApiKeyInput('')
      setSuccess('Settings saved')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const runSearch = async () => {
    setSearching(true)
    try {
      const results = await request(`/api/admin/textverified-settings?action=catalog&q=${encodeURIComponent(searchQuery)}`)
      setSearchResults(Array.isArray(results) ? results.slice(0, 30) : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setSearching(false)
    }
  }

  const addService = (serviceName) => {
    if (allowedServices.some(s => s.service_name === serviceName)) return
    setAllowedServices(prev => [...prev, { service_name: serviceName, label: serviceName, logo: null }])
  }

  const removeService = (serviceName) => {
    setAllowedServices(prev => prev.filter(s => s.service_name !== serviceName))
  }

  const renameService = (serviceName, label) => {
    setAllowedServices(prev => prev.map(s => s.service_name === serviceName ? { ...s, label } : s))
  }

  const uploadLogo = async (serviceName, file) => {
    const logo = await readFileAsBase64(file)
    setAllowedServices(prev => prev.map(s => s.service_name === serviceName ? { ...s, logo } : s))
  }

  const checkAvailability = async () => {
    setCheckingAvailability(true)
    setError('')
    try {
      const results = await request('/api/admin/textverified-settings?action=availability')
      const map = {}
      for (const r of results) map[r.service_name] = { verification: r.verification, rental: r.rental }
      setAvailability(map)
    } catch (e) {
      setError(e.message)
    } finally {
      setCheckingAvailability(false)
    }
  }

  return (
    <PageShell
      title="TextVerified Integration"
      subtitle="Connect your TextVerified account, set your markup, and choose which services customers can buy phone verifications for."
      actions={[
        <Btn key="back" variant="outline" onClick={() => navigate('/admin/settings')}>← Back to System Settings</Btn>,
      ]}
    >
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">{success}</div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading...</div>
      ) : (
        <>
          <Card style={{ padding: 20, marginBottom: 16 }}>
            <div className={`text-sm font-bold mb-3 ${TC.text}`}>API Credentials</div>
            <div className="grid gap-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">API Key</label>
                <Input
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={apiKeyConfigured ? `•••• ${apiKeyLast4} (saved — enter a new key to change it)` : 'Paste your TextVerified API V2 Key'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Account Email</label>
                <Input value={apiEmail} onChange={(e) => setApiEmail(e.target.value)} placeholder="your@email.com" />
              </div>
            </div>
            {apiKeyConfigured && (
              <div className="mt-3 text-xs text-slate-500">
                {balance != null ? `TextVerified balance: $${Number(balance).toFixed(2)}` : balanceError ? `Couldn't fetch balance: ${balanceError}` : 'Checking balance…'}
              </div>
            )}
          </Card>

          <Card style={{ padding: 20, marginBottom: 16 }}>
            <div className={`text-sm font-bold mb-1 ${TC.text}`}>Markup</div>
            <div className="text-xs text-slate-400 mb-4">
              Customer price = TextVerified's price × (1 + markup%). Verifications and rentals are priced independently, since they're different products with different costs.
            </div>
            <div className="flex flex-wrap gap-8">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Verification Markup</label>
                <div className="flex items-center gap-2">
                  <Input type="number" min="0" value={markupPercent} onChange={(e) => setMarkupPercent(e.target.value)} style={{ maxWidth: 120 }} />
                  <span className="text-sm text-slate-400">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Rental Markup</label>
                <div className="flex items-center gap-2">
                  <Input type="number" min="0" value={rentalMarkupPercent} onChange={(e) => setRentalMarkupPercent(e.target.value)} style={{ maxWidth: 120 }} />
                  <span className="text-sm text-slate-400">%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ padding: 20, marginBottom: 16 }}>
            <div className="flex items-center justify-between mb-1">
              <div className={`text-sm font-bold ${TC.text}`}>Allowed Services</div>
              {allowedServices.length > 0 && (
                <button
                  type="button"
                  onClick={checkAvailability}
                  disabled={checkingAvailability || !apiKeyConfigured}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-[#ff2d55] hover:text-[#ff2d55] transition disabled:opacity-40"
                >
                  {checkingAvailability ? 'Checking…' : 'Check Availability'}
                </button>
              )}
            </div>
            <div className="text-xs text-slate-400 mb-3">
              Shows whether TextVerified supports each service for verification and/or rental. Stock still fluctuates minute to minute — this isn't a live stock guarantee, just whether the service is offered at all.
            </div>

            {allowedServices.length > 0 && (
              <div className="space-y-2 mb-4">
                {allowedServices.map(s => {
                  const avail = availability[s.service_name]
                  return (
                  <div key={s.service_name} className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                    <input
                      ref={(el) => { fileInputRefs.current[s.service_name] = el }}
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(s.service_name, f); e.target.value = '' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[s.service_name]?.click()}
                      className="h-9 w-9 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-[#ff2d55] transition"
                      title="Upload logo"
                    >
                      {s.logo ? <img src={s.logo} alt="" className="h-full w-full object-contain p-0.5" /> : <Upload className="h-4 w-4" />}
                    </button>
                    <span className="text-xs text-slate-400 font-mono w-32 truncate shrink-0">{s.service_name}</span>
                    <Input value={s.label} onChange={(e) => renameService(s.service_name, e.target.value)} style={{ flex: 1 }} />
                    {avail && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${avail.verification ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                          Verification {avail.verification ? '✓' : '✗'}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${avail.rental ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                          Rental {avail.rental ? '✓' : '✗'}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeService(s.service_name)}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 transition shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  )
                })}
              </div>
            )}
            {allowedServices.length === 0 && (
              <div className="text-xs text-slate-400 mb-4">No services enabled yet — search below to add some.</div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-2 max-w-md mb-3">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search TextVerified's catalog, e.g. whatsapp"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runSearch() } }}
                />
                <button
                  type="button"
                  onClick={runSearch}
                  disabled={searching || !apiKeyConfigured}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-[#ff2d55] hover:text-[#ff2d55] transition disabled:opacity-40"
                >
                  <Search className="h-3.5 w-3.5" />
                  {searching ? 'Searching…' : 'Search'}
                </button>
              </div>
              {!apiKeyConfigured && (
                <div className="text-xs text-amber-500 mb-3">Save your API key above before searching the catalog.</div>
              )}
              {searchResults.length > 0 && (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {searchResults.map(r => {
                    const name = r.serviceName || r.name
                    const already = allowedServices.some(s => s.service_name === name)
                    return (
                      <div key={name} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="text-sm text-slate-600 dark:text-slate-300">{name}</span>
                        <button
                          type="button"
                          onClick={() => addService(name)}
                          disabled={already}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff2d55] disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {already ? 'Added' : 'Add'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>

          <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Btn>
        </>
      )}
    </PageShell>
  )
}
