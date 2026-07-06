import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Clock, Globe2, MessageCircle, Moon, Mouse, MousePointerClick, Phone, ShieldCheck, Sun } from 'lucide-react'
import { api } from '../shared/api.js'
import { useTheme } from '../shared/ThemeContext.jsx'
import OrderModal from './OrderModal.jsx'
import {
  DEFAULT_POLICY_LANGUAGE,
  POLICY_LANGUAGES,
  emptyTranslation,
  getFallbackPolicyCategories,
  getLanguageLabel,
  getPolicyLogoBySlug,
  isRTL,
  mergeWithFallbackPolicies,
  policyText,
} from './policyContent.js'

const POLICY_PREVIEW_KEY = 'adversolutions_policy_preview'

function normalizePolicies(payload) {
  return Array.isArray(payload?.categories) ? payload.categories : []
}

function normalizePaymentMethods(rows) {
  return Array.isArray(rows) ? rows.filter(row => row?.active !== false) : []
}

function safeTranslation(category, language) {
  return category?.translations?.[language]
    || category?.translations?.[DEFAULT_POLICY_LANGUAGE]
    || emptyTranslation(language)
}

function getLogoScale(category) {
  const scale = Number(category?.logo_scale)
  return Number.isFinite(scale) && scale > 0 ? scale : 1
}

function PolicyBody({ html }) {
  return <div className="policy-html" dangerouslySetInnerHTML={{ __html: html || '' }} />
}

function PaymentCard({ method, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(method)}
      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/80"
    >
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
        {method.logo
          ? <img src={method.logo} alt={method.name} className="h-full w-full object-cover" />
          : <span className="text-lg font-bold text-slate-500">{method.name?.slice(0, 1)}</span>}
      </div>
      <div className="flex-1">
        <div className="text-base font-semibold text-slate-900 dark:text-white">{method.name}</div>
        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{method.bank_name || method.account || 'Details available'}</div>
      </div>
      <div className="rounded-full border border-brand/20 px-3 py-1 text-xs font-semibold text-brand transition group-hover:bg-brand group-hover:text-white">
        View
      </div>
    </button>
  )
}

function PaymentModal({ method, language, onClose }) {
  if (!method) return null
  const fields = Array.isArray(method.fields) ? method.fields : []
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl rounded-3xl border border-slate-200/70 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900">
              {method.logo
                ? <img src={method.logo} alt={method.name} className="h-full w-full object-cover" />
                : <span className="text-xl font-bold text-slate-500">{method.name?.slice(0, 1)}</span>}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{method.name}</h3>
              {method.bank_name && <p className="text-sm text-slate-500 dark:text-slate-400">{method.bank_name}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white">
            ✕
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{policyText(language, 'accountDetails')}</div>
            <div className="mt-2 break-all text-base font-semibold text-slate-900 dark:text-white">{method.account || '—'}</div>
          </div>

          {fields.length > 0 && (
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{policyText(language, 'extraFields')}</div>
              <div className="mt-3 grid gap-3">
                {fields.map((field, index) => (
                  <div key={`${field?.name || 'field'}-${index}`} className="flex items-start justify-between gap-4 border-b border-slate-200/70 pb-3 last:border-b-0 last:pb-0 dark:border-slate-800">
                    <div className="text-sm text-slate-500 dark:text-slate-400">{field?.label || field?.name || `Field ${index + 1}`}</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{field?.value || field?.placeholder || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {method.qr_code && (
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 mb-3">QR Code</div>
              <div className="flex justify-center">
                <img src={method.qr_code} alt="Payment QR code" className="max-h-52 max-w-full rounded-xl object-contain" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PolicyPortalPage() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const previewMode = typeof window !== 'undefined' && window.location.hash.includes('preview=1')
  const [language, setLanguage] = useState(DEFAULT_POLICY_LANGUAGE)
  const [categories, setCategories] = useState(() => getFallbackPolicyCategories().map(c => ({ ...c, logo: '' })))
  const [step, setStep] = useState('policies')
  const [selectedTabId, setSelectedTabId] = useState(() => getFallbackPolicyCategories()[0]?.id || '')
  const [paymentMethods, setPaymentMethods] = useState([])
  const [activeMethod, setActiveMethod] = useState(null)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isScrollable, setIsScrollable] = useState(false)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const policyScrollRef = useRef(null)
  const sentinelRef = useRef(null)

  useEffect(() => {
    let mounted = true

    let previewPayload = null
    if (previewMode) {
      try {
        previewPayload = JSON.parse(window.localStorage.getItem(POLICY_PREVIEW_KEY) || 'null')
      } catch {
        previewPayload = null
      }
    }

    Promise.allSettled([api.get('/api/policies'), api.get('/api/payment-methods')]).then(results => {
      if (!mounted) return
      const policyResult = results[0]
      const paymentResult = results[1]

      let nextCategories = getFallbackPolicyCategories()
      if (policyResult.status === 'fulfilled') {
        nextCategories = mergeWithFallbackPolicies(normalizePolicies(policyResult.value))
      }
      if (previewPayload?.categories?.length) {
        nextCategories = mergeWithFallbackPolicies(previewPayload.categories)
      }
      const finalCategories = nextCategories.length > 0 ? nextCategories : getFallbackPolicyCategories()
      setCategories(finalCategories)
      setSelectedTabId(previewPayload?.selectedId || finalCategories[0]?.id || '')
      if (previewPayload?.language && POLICY_LANGUAGES.includes(previewPayload.language)) {
        setLanguage(previewPayload.language)
      }
      if (paymentResult.status === 'fulfilled') {
        setPaymentMethods(normalizePaymentMethods(paymentResult.value))
      }
    })
    return () => { mounted = false }
  }, [previewMode])

  const selectedCategory = useMemo(
    () => categories.find(category => category.id === selectedTabId) || categories[0] || null,
    [categories, selectedTabId],
  )
  const selectedTranslation = safeTranslation(selectedCategory, language)
  const rtl = isRTL(language)

  useEffect(() => {
    const panel = policyScrollRef.current
    if (!panel) return
    panel.scrollTo({ top: 0 })
    setHasScrolledToBottom(false)

    const updateProgress = () => {
      const maxScroll = panel.scrollHeight - panel.clientHeight
      setIsScrollable(maxScroll > 4)
      setScrollProgress(maxScroll <= 0 ? 1 : Math.min(1, panel.scrollTop / maxScroll))
    }

    updateProgress()
    panel.addEventListener('scroll', updateProgress)

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setHasScrolledToBottom(true)
    }, { root: panel, threshold: 0.05 })
    if (sentinelRef.current) observer.observe(sentinelRef.current)

    return () => {
      panel.removeEventListener('scroll', updateProgress)
      observer.disconnect()
    }
  }, [selectedTabId, language, step])

  const badges = [
    { icon: ShieldCheck, title: policyText(language, 'warranty'), body: policyText(language, 'warrantyText') },
    { icon: Clock, title: policyText(language, 'reviewTime'), body: policyText(language, 'reviewTimeText') },
  ]

  const scrollToBottom = () => {
    sentinelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  const handleOrderComplete = (selectedMethod) => {
    setOrderModalOpen(false)
    if (selectedMethod) {
      setActiveMethod(selectedMethod)
    }
    setStep('payments')
  }

  const pageTheme = isDark
    ? {
        shell: 'min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,45,85,0.12),_transparent_25%),linear-gradient(180deg,#020617_0%,#0f172a_60%,#020617_100%)] text-white',
        mainPanel: 'relative mt-6 overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-b from-slate-900/92 to-slate-950/88 shadow-lg shadow-slate-950/40',
        sticky: 'sticky top-0 z-10 -mx-4 -mt-6 border-b border-slate-800/70 bg-gradient-to-b from-slate-950/95 to-slate-950/78 px-4 pb-6 pt-6 shadow-[0_20px_50px_rgba(2,6,23,0.45)] backdrop-blur sm:-mx-8 sm:px-8',
        subtleText: 'text-slate-300',
        mutedText: 'text-slate-400',
        badge: 'rounded-2xl bg-slate-900/60 px-4 py-2 shadow-inner',
        progressTrack: 'h-1.5 w-full overflow-hidden rounded-full bg-slate-900/40',
        notice: 'rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/60 p-4 text-sm text-slate-200 shadow-inner backdrop-blur',
        contentCard: 'mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 shadow-sm',
        empty: 'mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-10 text-center text-slate-300',
        paymentsBadgeCard: 'flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-inner',
        cta: 'rounded-3xl border border-slate-800/70 bg-slate-900 p-8 shadow-lg',
      }
    : {
        shell: 'min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,45,85,0.08),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_52%,#f8fafc_100%)] text-slate-900',
        mainPanel: 'relative mt-6 overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-b from-white/95 to-emerald-50/40 shadow-lg shadow-slate-200/60',
        sticky: 'sticky top-0 z-10 -mx-4 -mt-6 border-b border-white/70 bg-gradient-to-b from-white/95 to-white/80 px-4 pb-6 pt-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:-mx-8 sm:px-8',
        subtleText: 'text-slate-600',
        mutedText: 'text-slate-500',
        badge: 'rounded-2xl bg-slate-900/5 px-4 py-2 shadow-inner',
        progressTrack: 'h-1.5 w-full overflow-hidden rounded-full bg-slate-100/80',
        notice: 'rounded-2xl border border-dashed border-slate-200/70 bg-white/90 p-4 text-sm text-slate-600 shadow-inner backdrop-blur',
        contentCard: 'mt-6 rounded-2xl border border-slate-100/70 bg-white/90 p-6 shadow-sm',
        empty: 'mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500',
        paymentsBadgeCard: 'flex items-center gap-4 rounded-2xl border border-slate-200/40 bg-white/90 p-4 shadow-inner',
        cta: 'rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg',
      }

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className={pageTheme.shell}>
      <div className="mx-auto max-w-7xl p-6 lg:p-10">
        {step === 'policies' && (
          <>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 text-white shadow-[0_30px_80px_rgba(2,6,23,0.4)]">
              <div className="pointer-events-none absolute inset-0 opacity-70 blur-2xl">
                <div className="absolute -top-10 left-10 h-40 w-40 rounded-full bg-[#ff2d55]/30" />
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-purple-500/20" />
                <div className="absolute inset-6 rounded-[26px] border border-white/20 opacity-40" />
              </div>
              <div className="relative space-y-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/70">{policyText(language, 'liveTranslation')}</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-transparent lg:text-4xl">
                      <span className="bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text">
                        {policyText(language, 'serviceAndPolicySelection')}
                      </span>
                    </h1>
                    <p className="mt-2 text-white/70">{policyText(language, 'selectCategory')}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
                      <Globe2 className="h-5 w-5" />
                      {getLanguageLabel(language)}
                    </div>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      {isDark ? 'Light mode' : 'Dark mode'}
                    </button>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white outline-none"
                    >
                      {POLICY_LANGUAGES.map(code => (
                        <option key={code} value={code} className="text-slate-900">{getLanguageLabel(code)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {categories.map(category => {
                    const active = category.id === selectedTabId
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedTabId(category.id)}
                        className={`flex items-center gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                          active ? 'border-white/70 bg-white text-slate-900 shadow-lg' : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {(category.logo != null ? category.logo : getPolicyLogoBySlug(category.slug)) && <img src={category.logo != null ? category.logo : getPolicyLogoBySlug(category.slug)} alt={category.name} className="h-6 w-6 rounded-full object-contain" style={{ transform: `scale(${getLogoScale(category)})` }} />}
                        <span>{safeTranslation(category, language).title || category.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {selectedCategory ? (
              <div className={pageTheme.mainPanel}>
                <div ref={policyScrollRef} className="max-h-[78vh] min-h-[60vh] overflow-y-auto">
                  <div className="px-4 py-6 pr-8 sm:px-8 sm:py-8 sm:pr-16">
                    <div className={pageTheme.sticky}>
                      <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-4">
                          {(selectedCategory.logo != null ? selectedCategory.logo : getPolicyLogoBySlug(selectedCategory.slug)) && <img src={selectedCategory.logo != null ? selectedCategory.logo : getPolicyLogoBySlug(selectedCategory.slug)} alt={selectedCategory.name} className="mt-1 h-12 w-12 rounded-2xl object-contain shadow-md" style={{ transform: `scale(${getLogoScale(selectedCategory)})` }} />}
                          <div>
                            <p className={`text-xs font-semibold uppercase tracking-[0.4em] ${pageTheme.mutedText}`}>{selectedCategory.name}</p>
                            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedTranslation.title}</h2>
                            {selectedTranslation.short_description && (
                              <p className={`mt-2 max-w-3xl text-sm ${pageTheme.subtleText}`}>{selectedTranslation.short_description}</p>
                            )}
                            {Array.isArray(selectedCategory.icons) && selectedCategory.icons.length > 0 && (
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {selectedCategory.icons.slice(0, 6).map((iconUrl, i) => (
                                  <div key={i} className={`h-8 w-8 rounded-xl overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-100'} flex items-center justify-center shadow-sm`}>
                                    <img src={iconUrl} alt={`Platform icon ${i + 1}`} className="h-full w-full object-contain p-1" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`grid gap-3 text-xs font-semibold ${pageTheme.subtleText} md:grid-cols-2`}>
                          <span className={pageTheme.badge}>{policyText(language, 'reviewPolicies')}</span>
                          <span className={pageTheme.badge}>{policyText(language, 'language')}: {getLanguageLabel(language)}</span>
                        </div>
                        <div className={pageTheme.progressTrack}>
                          <div className="h-full rounded-full bg-gradient-to-r from-[#ff2d55] via-sky-500 to-indigo-500 transition-all" style={{ width: `${Math.max(scrollProgress, 0.04) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-10">
                      {!hasScrolledToBottom && (
                        <div className={pageTheme.notice}>
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <MousePointerClick className="h-5 w-5 text-[#ff2d55]" />
                              <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>{policyText(language, 'scrollToReview')}</p>
                            </div>
                            <button type="button" onClick={scrollToBottom} className={`inline-flex items-center justify-center gap-2 rounded-full border border-[#ff2d55]/20 px-5 py-2 text-sm font-semibold text-[#ff2d55] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ff2d55] hover:text-white ${isDark ? 'bg-slate-900/70' : 'bg-white'}`}>
                              {policyText(language, 'scrollForMe')}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className={pageTheme.contentCard}>
                        <PolicyBody html={selectedTranslation.content_html} />
                      </div>
                    </div>
                  </div>
                  <div ref={sentinelRef} className="h-2 w-full" />
                </div>

                {!hasScrolledToBottom && isScrollable && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-20 flex justify-center">
                    <button
                      type="button"
                      onClick={scrollToBottom}
                      className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/40 transition hover:-translate-y-0.5"
                    >
                      <Mouse className="h-5 w-5 text-[#ff2d55]" />
                      <span>{policyText(language, 'tapToScroll')}</span>
                    </button>
                  </div>
                )}

                <div className={`flex flex-col items-center gap-3 border-t px-6 py-5 ${isDark ? 'border-slate-800/70 bg-slate-950/90' : 'border-slate-200/70 bg-white/90'} backdrop-blur`}>
                  <div className="flex items-center gap-2">
                    {hasScrolledToBottom
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      : <Mouse className="h-4 w-4 text-[#ff2d55] shrink-0 animate-bounce" />}
                    <span className={`text-xs font-medium ${hasScrolledToBottom ? 'text-emerald-500' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                      {hasScrolledToBottom ? 'Policy reviewed — you may continue' : 'Scroll to the bottom to continue'}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!hasScrolledToBottom}
                    onClick={() => setOrderModalOpen(true)}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white shadow-lg transition ${
                      hasScrolledToBottom
                        ? 'bg-gradient-to-r from-[#ff2d55] via-[#ff4f7a] to-[#ff7f50] shadow-[#ff2d55]/30 hover:-translate-y-0.5 cursor-pointer'
                        : 'bg-slate-400/40 shadow-none cursor-not-allowed opacity-50'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {policyText(language, 'continueToPayment')}
                  </button>
                </div>
              </div>
            ) : (
              <div className={pageTheme.empty}>
                {policyText(language, 'noCategories')}
              </div>
            )}
          </>
        )}

        {step === 'payments' && (
          <div className="space-y-6">
            <div className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-blue-900/40 p-6 text-white shadow-inner">
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{policyText(language, 'paymentMethods')}</h1>
                  <p className="text-sm text-slate-200">{policyText(language, 'paymentSubtitle')}</p>
                </div>
                <button type="button" onClick={() => setStep('policies')} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white">
                  <span aria-hidden>{rtl ? '→' : '←'}</span>
                  <span>{policyText(language, 'backToPolicies')}</span>
                </button>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">{policyText(language, 'paymentAvailable')}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {badges.map((badge, index) => (
                <div key={index} className={pageTheme.paymentsBadgeCard}>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-[#ff2d55] ${isDark ? 'bg-slate-900/50' : 'bg-slate-900/5'}`}>
                    <badge.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{badge.title}</p>
                    <p className={`text-xs leading-relaxed ${pageTheme.subtleText}`}>{badge.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {paymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {paymentMethods.map(method => (
                  <PaymentCard key={method.id} method={method} onOpen={setActiveMethod} />
                ))}
              </div>
            ) : (
              <div className={pageTheme.empty}>
                {policyText(language, 'noPaymentMethods')}
              </div>
            )}

            <div className={pageTheme.cta}>
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff2d55] to-indigo-500 text-white shadow-lg">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{policyText(language, 'nextSteps')}</h2>
                    <p className={pageTheme.subtleText}>{policyText(language, 'nextStepsText')}</p>
                  </div>
                </div>
                <a href="https://wa.me/212610341885" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-slate-900 via-[#ff2d55] to-indigo-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-slate-400/40 transition hover:scale-[1.01]">
                  <Phone className="h-5 w-5" />
                  {policyText(language, 'contactSupport')}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <PaymentModal method={activeMethod} language={language} onClose={() => setActiveMethod(null)} />

      {orderModalOpen && (
        <OrderModal
          isDark={isDark}
          language={language}
          policyType={selectedCategory?.name || ''}
          paymentMethods={paymentMethods}
          onClose={() => setOrderModalOpen(false)}
          onComplete={handleOrderComplete}
        />
      )}

      <style>{`
        .policy-html section + section { margin-top: 1.75rem; }
        .policy-html h3 { margin: 0 0 0.85rem; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: ${isDark ? 'rgb(148 163 184)' : 'rgb(100 116 139)'}; }
        .policy-html p { margin: 0 0 0.9rem; line-height: 1.8; color: ${isDark ? 'rgb(226 232 240)' : 'rgb(51 65 85)'}; }
        .policy-html ul, .policy-html ol { margin: 0 0 0.9rem 1.25rem; color: ${isDark ? 'rgb(226 232 240)' : 'rgb(51 65 85)'}; }
        .policy-html li { margin-bottom: 0.45rem; line-height: 1.75; }
      `}</style>
    </div>
  )
}
