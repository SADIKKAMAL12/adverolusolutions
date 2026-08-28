import { getSupabase } from './supabase-server.js'

const BASE_URL = 'https://www.textverified.com'
let tokenCache = null // { token, expiresAt }

async function readConfig() {
  const sb = getSupabase()
  if (!sb) return {}
  const { data } = await sb.from('platform_settings').select('data').eq('id', 1).single()
  return data?.data?.textverified_settings || {}
}

async function getBearerToken() {
  if (tokenCache?.token && tokenCache.expiresAt && new Date(tokenCache.expiresAt) > new Date()) {
    return tokenCache.token
  }
  const cfg = await readConfig()
  if (!cfg.api_key || !cfg.api_email) throw new Error('TextVerified API is not configured')

  const res = await fetch(`${BASE_URL}/api/pub/v2/auth`, {
    method: 'POST',
    headers: { 'X-API-KEY': cfg.api_key, 'X-API-USERNAME': cfg.api_email },
  })
  if (!res.ok) throw new Error(`TextVerified auth failed (${res.status})`)
  const data = await res.json()
  tokenCache = { token: data.token, expiresAt: data.expiresAt }
  return data.token
}

async function tvFetch(path, options = {}) {
  const token = await getBearerToken()
  const res = await fetch(path.startsWith('http') ? path : `${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`TextVerified request failed (${res.status}): ${text.slice(0, 200)}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : {} // some endpoints (e.g. refund) return an empty body on success
}

export async function getAccountBalance() {
  const data = await tvFetch('/api/pub/v2/account/me')
  return data.currentBalance
}

export async function getServices({ reservationType = 'verification', numberType = 'mobile' } = {}) {
  const params = new URLSearchParams({ numberType, reservationType })
  return tvFetch(`/api/pub/v2/services?${params}`)
}

export async function searchServices(query, reservationType = 'verification') {
  const services = await getServices({ reservationType })
  if (!query) return services
  const q = query.toLowerCase()
  return (Array.isArray(services) ? services : []).filter(s =>
    (s.serviceName || s.name || '').toLowerCase().includes(q)
  )
}

// Verifications' /services list doesn't include price — pricing is a separate,
// per-service lookup. areaCode/carrier: false means "any" (cheapest), matching
// the default the official Python client uses.
export async function getVerificationPrice(serviceName, capability = 'sms', numberType = 'mobile') {
  const data = await tvFetch('/api/pub/v2/pricing/verifications', {
    method: 'POST',
    body: JSON.stringify({ serviceName, areaCode: false, carrier: false, numberType, capability }),
  })
  return data.price
}

export async function createVerification(serviceName, capability = 'sms') {
  return tvFetch('/api/pub/v2/verifications', {
    method: 'POST',
    body: JSON.stringify({ serviceName, capability }),
  })
}

export async function getVerificationDetails(href) {
  return tvFetch(href)
}

// The verification object itself never contains the received code — it has to be
// looked up separately via the `sms.href` link included on the verification details
// (its exact query param casing, e.g. `ReservationId`, isn't documented, so we always
// follow the link TextVerified gives us rather than constructing the URL ourselves).
export async function getSmsForVerification(smsHref) {
  const data = await tvFetch(smsHref)
  const messages = Array.isArray(data) ? data : (data?.data || [])
  return messages[0] || null
}

// Follows the verification's own `cancel.link.href` — confirmed live that
// TextVerified refunds the reservation on their end when this succeeds.
export async function cancelVerification(cancelHref) {
  return tvFetch(cancelHref, { method: 'POST' })
}

// ── Rentals (non-renewable only — renewable rentals need billing cycles, deferred) ──

export async function getRentalPrice(serviceName, duration, { numberType = 'mobile', capability = 'sms', alwaysOn = true } = {}) {
  const data = await tvFetch('/api/pub/v2/pricing/rentals', {
    method: 'POST',
    body: JSON.stringify({
      serviceName, areaCode: false, numberType, capability,
      alwaysOn, isRenewable: false, duration, callForwarding: false,
      billingCycleIdToAssignTo: null,
    }),
  })
  return data.price
}

export async function createRental(serviceName, duration, { numberType = 'mobile', capability = 'sms', alwaysOn = true } = {}) {
  return tvFetch('/api/pub/v2/reservations/rental', {
    method: 'POST',
    body: JSON.stringify({
      serviceName, numberType, capability, isRenewable: false, duration, alwaysOn,
      allowBackOrderReservations: false, areaCodeSelectOption: null, billingCycleIdToAssignTo: null,
    }),
  })
}

// Follows the rental's own `refund.link.href` — same generic POST-and-done shape as cancel.
export async function refundRental(refundHref) {
  return tvFetch(refundHref, { method: 'POST' })
}

// createRental()'s response `href` points to a Sale object, NOT the reservation
// itself — unlike verifications, where the create response href is directly usable.
// Confirmed live: sale.href -> { reservations: [{ link: { href } }] } -> another
// { href } redirect -> the actual rental object (number, sms.href, refund.link, endsAt).
// This resolves that whole chain once, right after creation, so everywhere else in
// the app can treat a rental's stored href exactly like a verification's.
export async function resolveRentalDetailsHref(saleHref) {
  const sale = await tvFetch(saleHref)
  const reservationLink = sale?.reservations?.[0]?.link?.href
  if (!reservationLink) throw new Error('TextVerified sale response had no reservation link')
  const redirect = await tvFetch(reservationLink)
  return redirect?.href || reservationLink
}
