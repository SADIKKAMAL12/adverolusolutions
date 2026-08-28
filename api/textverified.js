import { getSupabase } from './lib/supabase-server.js'
import {
  createVerification, getVerificationDetails, getVerificationPrice,
  getSmsForVerification, cancelVerification,
  getRentalPrice, createRental, refundRental, resolveRentalDetailsHref,
} from './lib/textverified.js'

const RENTAL_DURATIONS = ['oneDay', 'threeDay', 'sevenDay', 'fourteenDay', 'thirtyDay']

async function readTvConfig(sb) {
  const { data } = await sb.from('platform_settings').select('data').eq('id', 1).single()
  return data?.data?.textverified_settings || { markup_percent: 40, rental_markup_percent: 40, allowed_services: [] }
}

function applyMarkup(basePrice, markupPercent) {
  const price = Number(basePrice || 0) * (1 + Number(markupPercent || 0) / 100)
  return Math.ceil(price * 100) / 100 // round up to the cent
}

// Atomic — runs as a single row-locked UPDATE in Postgres via the app's existing
// deduct_balance/refund_balance RPC functions, so concurrent requests (two tabs, a
// double-click) can never double-spend or corrupt the balance the way a
// read-then-write pattern would.
async function deductBalance(sb, userId, amount) {
  const { data, error } = await sb.rpc('deduct_balance', { p_user_id: userId, p_amount: amount })
  if (error) throw new Error(error.message)
  if (!data?.ok) throw new Error(data?.error || 'Insufficient balance')
  return data.new_balance
}

async function creditBalance(sb, userId, amount, label) {
  const { data, error } = await sb.rpc('refund_balance', { p_user_id: userId, p_amount: amount })
  if (error || !data?.ok) console.error('[textverified] credit balance failed', userId, amount, error?.message || data?.error)
  try {
    await sb.from('transactions').insert({
      user_id: userId,
      type: label,
      method: 'Balance Credit',
      amount: Number(amount || 0),
      status: 'completed',
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    })
  } catch (e) { console.error('[textverified] transaction log insert failed (credit)', e.message) }
}

// Processes one pending row against its live TextVerified state — shared by the customer's
// own status poll AND the server-side sweep, so both paths behave identically.
async function processPendingRow(sb, row) {
  let details
  try {
    details = await getVerificationDetails(row.textverified_href)
  } catch (e) {
    return { row, error: 'Could not reach TextVerified: ' + e.message }
  }

  // Verification: one code, then done
  if (row.mode !== 'rental' && details?.state === 'verificationCompleted') {
    let code = null
    try {
      if (details?.sms?.href) {
        const sms = await getSmsForVerification(details.sms.href)
        code = sms?.parsedCode || sms?.smsContent || null
      }
    } catch { /* code lookup failing shouldn't block showing "completed" */ }

    const { data: updated } = await sb
      .from('textverified_purchases')
      .update({
        status: 'completed',
        code,
        phone_number: row.phone_number || details?.number || null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .eq('status', 'pending') // only the first writer wins if this races with another poll
      .select()
      .single()
    return { row: updated || row, changed: !!updated }
  }

  // Rental: pick up the latest code without ending the rental, keep going until endsAt
  if (row.mode === 'rental') {
    if (details?.endsAt && new Date(details.endsAt) < new Date()) {
      const { data: expired } = await sb
        .from('textverified_purchases')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', row.id)
        .eq('status', 'pending')
        .select()
        .single()
      return { row: expired || row, changed: !!expired }
    }

    let code = row.code
    try {
      if (details?.sms?.href) {
        const sms = await getSmsForVerification(details.sms.href)
        if (sms?.parsedCode || sms?.smsContent) code = sms.parsedCode || sms.smsContent
      }
    } catch { /* keep last known code if this poll fails */ }

    if (code !== row.code || (details?.number && details.number !== row.phone_number)) {
      const { data: updated } = await sb
        .from('textverified_purchases')
        .update({ code, phone_number: details?.number || row.phone_number, updated_at: new Date().toISOString() })
        .eq('id', row.id)
        .eq('status', 'pending')
        .select()
        .single()
      return { row: updated || row, changed: !!updated }
    }
    return { row, changed: false }
  }

  // Verification: only reserved for a short window — once endsAt passes with no code, auto-refund
  if (details?.endsAt && new Date(details.endsAt) < new Date()) {
    const { data: expired } = await sb
      .from('textverified_purchases')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('status', 'pending') // race guard: only the writer that actually flips the status refunds
      .select()
      .single()
    if (expired) {
      await creditBalance(sb, row.user_id, row.cost_charged, 'Phone Verification Refund')
    }
    return { row: expired || row, changed: !!expired }
  }

  // Phone number may only become available after creation — keep it fresh while pending
  if (details?.number && details.number !== row.phone_number) {
    await sb.from('textverified_purchases').update({ phone_number: details.number }).eq('id', row.id)
    row.phone_number = details.number
  }

  return { row, changed: false }
}

export default async function handler(req, res) {
  const sb = getSupabase()
  if (!sb) return res.status(503).json({ error: 'Database not configured' })

  const action = req.query.action

  // ── List services available to buy, with live price + markup ──
  if (req.method === 'GET' && action === 'services') {
    const mode = req.query.mode === 'rental' ? 'rental' : 'verification'
    const duration = RENTAL_DURATIONS.includes(req.query.duration) ? req.query.duration : 'oneDay'
    const cfg = await readTvConfig(sb)
    const allowed = Array.isArray(cfg.allowed_services) ? cfg.allowed_services : []
    if (allowed.length === 0) return res.status(200).json([])

    const markupPercent = mode === 'rental' ? cfg.rental_markup_percent : cfg.markup_percent

    const results = await Promise.all(allowed.map(async (a) => {
      let basePrice = null
      try {
        basePrice = mode === 'rental'
          ? await getRentalPrice(a.service_name, duration)
          : await getVerificationPrice(a.service_name)
      } catch { /* leave unavailable if pricing lookup fails */ }
      return {
        service_name: a.service_name,
        label: a.label || a.service_name,
        logo: a.logo || null,
        price: basePrice != null ? applyMarkup(basePrice, markupPercent) : null,
        available: basePrice != null,
      }
    }))
    return res.status(200).json(results)
  }

  // ── Buy a verification or rental ──
  if (req.method === 'POST' && action === 'purchase') {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Not authenticated' })
    const { service_name, mode: rawMode, duration: rawDuration } = req.body || {}
    if (!service_name?.trim()) return res.status(400).json({ error: 'Service required' })
    const mode = rawMode === 'rental' ? 'rental' : 'verification'
    const duration = RENTAL_DURATIONS.includes(rawDuration) ? rawDuration : 'oneDay'
    if (mode === 'rental' && !RENTAL_DURATIONS.includes(rawDuration)) {
      return res.status(400).json({ error: 'Valid rental duration required' })
    }

    const cfg = await readTvConfig(sb)
    const allowed = (cfg.allowed_services || []).find(a => a.service_name === service_name)
    if (!allowed) return res.status(400).json({ error: 'Service not available' })
    const markupPercent = mode === 'rental' ? cfg.rental_markup_percent : cfg.markup_percent

    const { data: userData } = await sb.from('users').select('email').eq('id', userId).single()

    let providerCost
    try {
      providerCost = mode === 'rental'
        ? await getRentalPrice(service_name, duration)
        : await getVerificationPrice(service_name)
    } catch (e) {
      return res.status(502).json({ error: 'Could not reach TextVerified: ' + e.message })
    }
    if (providerCost == null) return res.status(404).json({ error: 'Service is currently unavailable' })

    const cost = applyMarkup(providerCost, markupPercent)

    // Deduct atomically FIRST — guarantees no overdraft/race regardless of concurrent
    // requests. If anything below fails, we roll this back with an explicit credit.
    try {
      await deductBalance(sb, userId, cost)
    } catch (e) {
      return res.status(400).json({ error: e.message })
    }

    let created
    try {
      created = mode === 'rental'
        ? await createRental(service_name, duration)
        : await createVerification(service_name, 'sms')
    } catch (e) {
      await creditBalance(sb, userId, cost, `Phone ${mode === 'rental' ? 'Rental' : 'Verification'} Refund (creation failed)`)
      return res.status(502).json({ error: `Could not create ${mode}: ` + e.message })
    }
    if (!created?.href) {
      await creditBalance(sb, userId, cost, `Phone ${mode === 'rental' ? 'Rental' : 'Verification'} Refund (creation failed)`)
      return res.status(502).json({ error: 'TextVerified did not return a reservation link' })
    }

    // A rental's create response points to a Sale object, not the reservation itself —
    // resolve the real, directly-usable details link once so everything downstream
    // (status polling, cancel) can treat it exactly like a verification's href.
    let reservationHref = created.href
    if (mode === 'rental') {
      try {
        reservationHref = await resolveRentalDetailsHref(created.href)
      } catch (e) {
        // The reservation was actually created on TextVerified's side at this point, so we do
        // NOT refund here — the money was genuinely spent on a real number, we just failed to
        // resolve its details link. Record it anyway so it's visible/manageable from history.
        console.error('[textverified] could not resolve rental details href', created.href, e.message)
      }
    }

    let details
    try {
      details = await getVerificationDetails(reservationHref)
    } catch {
      details = null
    }

    const { data: row, error: insertErr } = await sb
      .from('textverified_purchases')
      .insert({
        user_id: userId,
        user_email: userData?.email || null,
        service_name,
        service_label: allowed.label || service_name,
        phone_number: details?.number || null,
        textverified_href: reservationHref,
        status: 'pending',
        cost_charged: cost,
        provider_cost: providerCost,
        mode,
        duration: mode === 'rental' ? duration : null,
      })
      .select()
      .single()
    if (insertErr) {
      // The reservation is real on TextVerified's side but we couldn't record it — don't
      // refund (money was genuinely spent), but surface this loudly since it needs manual attention.
      console.error('[textverified] CRITICAL: purchase created on TextVerified but insert failed', reservationHref, insertErr.message)
      return res.status(500).json({ error: 'Purchase created but failed to save — contact support with this reference: ' + reservationHref })
    }

    try {
      await sb.from('transactions').insert({
        user_id: userId,
        type: mode === 'rental' ? 'Phone Rental' : 'Phone Verification',
        method: 'Balance Deduction',
        amount: -cost,
        status: 'completed',
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      })
    } catch (e) { console.error('[textverified] transaction log insert failed (purchase)', e.message) }

    return res.status(201).json(row)
  }

  // ── Poll for the SMS code (verifications: one code then done; rentals: stay active until endsAt) ──
  if (req.method === 'GET' && action === 'status') {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Not authenticated' })
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'ID required' })

    const { data: row, error } = await sb.from('textverified_purchases').select('*').eq('id', id).single()
    if (error || !row) return res.status(404).json({ error: 'Not found' })
    if (row.user_id !== userId) return res.status(403).json({ error: 'Forbidden' })

    if (row.status !== 'pending') return res.status(200).json(row)

    const result = await processPendingRow(sb, row)
    if (result.error) return res.status(502).json({ error: result.error })
    return res.status(200).json(result.row)
  }

  // ── Customer cancels a still-pending verification, or refunds an active rental early ──
  if (req.method === 'POST' && action === 'cancel') {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Not authenticated' })
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required' })

    const { data: row, error } = await sb.from('textverified_purchases').select('*').eq('id', id).single()
    if (error || !row) return res.status(404).json({ error: 'Not found' })
    if (row.user_id !== userId) return res.status(403).json({ error: 'Forbidden' })
    if (row.status !== 'pending') return res.status(409).json({ error: 'Only active purchases can be cancelled' })

    let details
    try {
      details = await getVerificationDetails(row.textverified_href)
    } catch (e) {
      return res.status(502).json({ error: 'Could not reach TextVerified: ' + e.message })
    }

    if (row.mode === 'rental') {
      if (!details?.refund?.canRefund || !details?.refund?.link?.href) {
        return res.status(409).json({ error: 'This rental is no longer refundable' })
      }
      try {
        await refundRental(details.refund.link.href)
      } catch (e) {
        return res.status(502).json({ error: 'Could not refund with TextVerified: ' + e.message })
      }
    } else {
      if (details?.state === 'verificationCompleted') {
        return res.status(409).json({ error: 'A code already arrived for this number — it can no longer be cancelled.' })
      }
      if (!details?.cancel?.canCancel || !details?.cancel?.link?.href) {
        return res.status(409).json({ error: 'This verification is no longer cancellable' })
      }
      try {
        await cancelVerification(details.cancel.link.href)
      } catch (e) {
        return res.status(502).json({ error: 'Could not cancel with TextVerified: ' + e.message })
      }
    }

    // Race guard: only the request that actually flips pending -> cancelled gets to credit the
    // refund. If two cancel clicks land at once, the second one here gets `updated: null` and
    // skips crediting — prevents a double-refund.
    const { data: updated, error: updateErr } = await sb
      .from('textverified_purchases')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single()
    if (updateErr) return res.status(500).json({ error: updateErr.message })
    if (!updated) return res.status(409).json({ error: 'Already processed' })

    await creditBalance(sb, userId, row.cost_charged, 'Phone Verification Refund')

    return res.status(200).json(updated)
  }

  // ── List a user's purchase history ──
  if (req.method === 'GET' && action === 'history') {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Not authenticated' })
    const { data, error } = await sb
      .from('textverified_purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  // ── Admin: refund a failed/timed-out purchase ──
  if (req.method === 'POST' && action === 'refund') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required' })
    const { data: row, error } = await sb.from('textverified_purchases').select('*').eq('id', id).single()
    if (error || !row) return res.status(404).json({ error: 'Not found' })
    if (row.status === 'refunded') return res.status(409).json({ error: 'Already refunded' })

    const { data: updated } = await sb
      .from('textverified_purchases')
      .update({ status: 'refunded', updated_at: new Date().toISOString() })
      .eq('id', id)
      .neq('status', 'refunded')
      .select()
      .single()
    if (!updated) return res.status(409).json({ error: 'Already processed' })

    await creditBalance(sb, row.user_id, row.cost_charged, 'Phone Verification Refund')

    return res.status(200).json({ success: true })
  }

  // ── Server-side sweep: catches purchases whose customer never revisited the page.
  // Meant to be called by a scheduled job (e.g. Supabase pg_cron + pg_net), not the browser —
  // gated by a shared secret rather than a user session.
  if (req.method === 'POST' && action === 'sweep') {
    const secret = req.headers['x-sweep-secret'] || req.query.secret
    if (!process.env.TEXTVERIFIED_SWEEP_SECRET || secret !== process.env.TEXTVERIFIED_SWEEP_SECRET) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { data: pendingRows, error } = await sb
      .from('textverified_purchases')
      .select('*')
      .eq('status', 'pending')
    if (error) return res.status(500).json({ error: error.message })

    const results = []
    for (const row of pendingRows || []) {
      const result = await processPendingRow(sb, row)
      if (result.changed) results.push({ id: row.id, new_status: result.row.status })
    }

    return res.status(200).json({ checked: (pendingRows || []).length, swept: results.length, results })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
