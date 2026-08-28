import { getSupabase } from './lib/supabase-server.js'
import { sendOrderNotification } from './admin/order-notifications.js'

// Shared in-memory OTP store — lives here so the cached module keeps state across requests
export const otpStore = new Map()

// Mutable structure assets — stored here so PUT mutations survive the per-request module cache-busting
// null = not yet initialized; structure-assets.js lazily fills it with defaults

// Fields only an admin may write on a user record
const ADMIN_ONLY_FIELDS = ['role', 'status', 'balance', 'accounts', 'email']

// Fields a regular user may update on their own profile
const USER_EDITABLE_FIELDS = ['name', 'phone', 'password_hash']

// ── Supabase-backed users handler ─────────────────────────────────────────────
async function handleUsers(req, res) {
  const sb    = getSupabase()
  const isAdmin = req.user?.role === 'admin'

  if (req.method === 'GET') {
    const COLS = 'id,name,email,role,status,balance,accounts,phone,joined,created_at'
    let q = sb.from('users').select(COLS)

    if (!isAdmin) {
      // Regular users may only query their own record
      if (!req.user?.id) return res.status(403).json({ error: 'Forbidden' })
      q = q.eq('id', req.user.id)
    } else {
      for (const [key, val] of Object.entries(req.query)) {
        if (['table', 'order', 'ascending', 'limit', 'single'].includes(key)) continue
        q = q.ilike(key, val)
      }
    }

    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })

    if (req.query.single === 'true') return res.status(200).json(data?.[0] || null)
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    // Self-registration goes exclusively through /api/auth/register now
    // (proper server-side bcrypt + session cookie in one step). This path
    // is admin-only — reserved for a future "create user manually" admin
    // feature, not a second public registration flow.
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
    const body = { ...(req.body || {}) }
    if (!body.id) body.id = crypto.randomUUID()
    // Force safe defaults even for admin-created accounts
    body.role     = body.role === 'admin' ? 'admin' : 'user'
    body.status   = body.status || 'active'
    body.balance  = Number(body.balance) || 0
    body.accounts = Number(body.accounts) || 0
    const { data, error } = await sb.from('users').insert(body).select().single()
    if (error) {
      // Surface duplicate-email as a friendly message
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ error: 'Email already registered' })
      }
      return res.status(500).json({ error: error.message })
    }
    const { password_hash, ...safeData } = data
    return res.status(201).json({ success: true, ...safeData })
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required for update' })

    if (!isAdmin) {
      // Regular users can only edit their own record
      if (String(req.user?.id) !== String(id)) {
        return res.status(403).json({ error: 'Cannot modify another user\'s account' })
      }
      // Strip any field that isn't in the allowed list
      for (const key of Object.keys(updates)) {
        if (!USER_EDITABLE_FIELDS.includes(key)) delete updates[key]
      }
    } else {
      // Admins may update anything except password_hash directly
      // (password changes go through a dedicated reset flow)
      delete updates.password_hash
    }

    const { data, error } = await sb.from('users').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    const { password_hash, ...safeData } = data
    return res.status(200).json({ success: true, ...safeData })
  }

  if (req.method === 'DELETE') {
    // Only admins can delete users
    if (!isAdmin) return res.status(403).json({ error: 'Admin access required' })
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'ID required for delete' })
    const { error } = await sb.from('users').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// ── Allowed proof file types ──────────────────────────────────────────────────
const PROOF_MIME_WHITELIST = new Map([
  ['image/jpeg',       'jpg'],
  ['image/png',        'png'],
  ['image/gif',        'gif'],
  ['image/webp',       'webp'],
  ['application/pdf',  'pdf'],
])
const MAX_PROOF_BYTES = 5 * 1024 * 1024 // 5 MB

// ── Supabase-backed deposits handler (handles proof upload to Storage) ─────────
async function handleDeposits(req, res) {
  const sb = getSupabase()

  if (req.method === 'GET') {
    const isAdmin = req.user?.role === 'admin'
    let q = sb.from('deposits').select('*, users!user_id(email)').order('created_at', { ascending: false })
    const { user_id } = req.query
    if (isAdmin) {
      // Admin can filter by user_id or see all
      if (user_id) q = q.eq('user_id', user_id)
    } else {
      // Regular users can only see their own deposits
      q = q.eq('user_id', req.user.id)
    }
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    const rows = (data || []).map(r => {
      const { users, ...rest } = r
      return { ...rest, user: users?.email || rest.user_id }
    })
    return res.status(200).json(rows)
  }

  if (req.method === 'POST') {
    const body = { ...(req.body || {}) }
    // Upload base64 proof to Supabase Storage and replace with public URL
    if (body.proof && body.proof.startsWith('data:')) {
      const matches = body.proof.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches) return res.status(400).json({ error: 'Invalid proof format' })

      const mimeType = matches[1]
      const ext = PROOF_MIME_WHITELIST.get(mimeType)
      if (!ext) {
        return res.status(400).json({ error: 'Proof must be a JPEG, PNG, GIF, WebP, or PDF' })
      }

      const buf = Buffer.from(matches[2], 'base64')
      if (buf.length > MAX_PROOF_BYTES) {
        return res.status(400).json({ error: 'Proof file must be 5 MB or smaller' })
      }

      // Extension comes from the whitelist map — never from the caller's MIME string
      const filename = `${body.id || Date.now()}.${ext}`
      const { error: uploadErr } = await sb.storage.from('proofs').upload(filename, buf, {
        contentType: mimeType, upsert: true,
      })
      if (!uploadErr) {
        const { data: urlData } = sb.storage.from('proofs').getPublicUrl(filename)
        body.proof = urlData.publicUrl
      }
    }
    if (!body.id) body.id = `DEP-${Date.now()}`
    const { data, error } = await sb.from('deposits').insert(body).select().single()
    if (error) return res.status(500).json({ error: error.message })
    // Look up user email + payment method name for the notification
    ;(async () => {
      const uid = body.user_id || data?.user_id
      const rawMethod = body.method || body.payment_method || ''
      let email = body.email || ''
      let methodName = rawMethod
      const [userRes, pmRes] = await Promise.all([
        (!email && uid) ? sb.from('users').select('email').eq('id', uid).single() : Promise.resolve({ data: null }),
        rawMethod ? sb.from('payment_methods').select('name').eq('id', rawMethod).single() : Promise.resolve({ data: null }),
      ])
      if (userRes.data?.email) email = userRes.data.email
      if (pmRes.data?.name) methodName = pmRes.data.name
      sendOrderNotification('deposit', {
        email,
        amount: `$${body.amount || ''}`,
        payment_method: methodName,
      })
    })()
    return res.status(201).json({ success: true, ...data })
  }

  if (req.method === 'PUT') {
    // Only admins can update deposits (status, amount, etc.)
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const { id, ...updates } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required for update' })
    // Prevent status from being set to anything other than allowed values
    const ALLOWED_STATUSES = ['pending', 'completed', 'rejected', 'cancelled']
    if (updates.status && !ALLOWED_STATUSES.includes(updates.status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }
    // A deposit's `amount` is what admin/deposits/approve.js later trusts as the exact
    // sum to credit — validate it here so a bad edit can't silently authorize an
    // absurd or negative credit down the line.
    if (updates.amount !== undefined) {
      const amt = Number(updates.amount)
      if (!Number.isFinite(amt) || amt <= 0 || amt > 1_000_000) {
        return res.status(400).json({ error: 'Invalid deposit amount' })
      }
      updates.amount = amt
    }
    const { data, error } = await sb.from('deposits').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, ...data })
  }

  if (req.method === 'DELETE') {
    // Only admins can delete deposits
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'ID required for delete' })
    const { error } = await sb.from('deposits').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// ── Supabase-backed payment methods handler ───────────────────────────────────
async function handlePaymentMethods(req, res) {
  const sb = getSupabase()

  if (req.method === 'GET') {
    const { data, error } = await sb.from('payment_methods').select('*').order('name')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required' })
    const { data, error } = await sb.from('payment_methods').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, ...data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// ── Supabase-backed transactions handler ──────────────────────────────────────
async function handleTransactions(req, res) {
  const sb = getSupabase()
  const isAdmin = req.user?.role === 'admin'

  if (req.method === 'GET') {
    let q = sb.from('transactions').select('*').order('created_at', { ascending: false })
    const { user_id } = req.query
    if (isAdmin) {
      // Admin can filter by user_id or see all
      if (user_id) q = q.eq('user_id', user_id)
    } else {
      // Regular users can only see their own transactions
      q = q.eq('user_id', req.user.id)
    }
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  // Only admins can create or modify transaction records — this is a manual ledger
  // entry, not a balance mutation itself, but validated anyway since a bad/fabricated
  // row here undermines the transactions table's value as an audit trail.
  if (req.method === 'POST') {
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
    const body = req.body || {}
    if (!body.user_id) return res.status(400).json({ error: 'user_id required' })
    const amt = Number(body.amount)
    if (!Number.isFinite(amt)) return res.status(400).json({ error: 'amount must be a valid number' })
    body.amount = amt
    const { data, error } = await sb.from('transactions').insert(body).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ success: true, ...data })
  }

  if (req.method === 'PUT') {
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
    const { id, ...updates } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required for update' })
    if (updates.amount !== undefined) {
      const amt = Number(updates.amount)
      if (!Number.isFinite(amt)) return res.status(400).json({ error: 'amount must be a valid number' })
      updates.amount = amt
    }
    const { data, error } = await sb.from('transactions').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, ...data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// ── Supabase-backed inventory_products handler ────────────────────────────────
async function handleInventoryProducts(req, res) {
  const sb = getSupabase()
  const isAdmin = req.user?.role === 'admin'

  if (req.method === 'GET') {
    const { data, error } = await sb.from('inventory_products').select('*')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
    const body = req.body || {}
    if (!body.id) body.id = `prod-${Date.now()}`
    // Validate price
    if (body.price !== undefined) {
      const price = Number(body.price)
      if (isNaN(price) || price < 0) return res.status(400).json({ error: 'Price must be a non-negative number' })
      body.price = price
    }
    const { data, error } = await sb.from('inventory_products').insert(body).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ success: true, ...data })
  }

  if (req.method === 'PUT') {
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
    const { id, ...updates } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required for update' })
    if (updates.price !== undefined) {
      const price = Number(updates.price)
      if (isNaN(price) || price < 0) return res.status(400).json({ error: 'Price must be a non-negative number' })
      updates.price = price
    }
    const { data, error } = await sb.from('inventory_products').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, ...data })
  }

  if (req.method === 'DELETE') {
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'ID required for delete' })
    // Nullify purchases FK references before deleting (product_id and line_id)
    await sb.from('purchases').update({ product_id: null }).eq('product_id', id)
    // Get line IDs for this product so we can nullify line_id on purchases too
    const { data: lineRows } = await sb.from('inventory_lines').select('id').eq('product_id', id)
    if (lineRows && lineRows.length > 0) {
      const lineIds = lineRows.map(l => l.id)
      await sb.from('purchases').update({ line_id: null }).in('line_id', lineIds)
    }
    // Now safe to delete all inventory lines
    await sb.from('inventory_lines').delete().eq('product_id', id)
    const { error } = await sb.from('inventory_products').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// ── Supabase-backed inventory_lines handler ───────────────────────────────────
async function handleInventoryLines(req, res) {
  const sb = getSupabase()
  const isAdmin = req.user?.role === 'admin'

  if (req.method === 'GET') {
    // Non-admins can only see available counts — not the actual credentials
    let q = sb.from('inventory_lines').select(isAdmin ? '*' : 'id,product_id,status')
    const { product_id, status } = req.query
    if (product_id) q = q.eq('product_id', product_id)
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
    const body = req.body || {}
    if (Array.isArray(body)) {
      const rows = body.map(r => ({ ...r, id: r.id || `l-${Date.now()}-${Math.random().toString(36).slice(2)}` }))
      const { data, error } = await sb.from('inventory_lines').insert(rows).select()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json({ success: true, rows: data })
    }
    if (!body.id) body.id = `l-${Date.now()}`
    const { data, error } = await sb.from('inventory_lines').insert(body).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ success: true, ...data })
  }

  if (req.method === 'PUT') {
    // Only the internal purchase flow (server-side) and admins can mark lines as sold
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
    const { id, ...updates } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required for update' })
    const { data, error } = await sb.from('inventory_lines').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, ...data })
  }

  if (req.method === 'DELETE') {
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
    const { id, product_id, status } = req.query
    if (product_id) {
      let q = sb.from('inventory_lines').delete().eq('product_id', product_id)
      if (status) q = q.eq('status', status)
      const { error } = await q
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ success: true })
    }
    if (!id) return res.status(400).json({ error: 'ID required for delete' })
    const { error } = await sb.from('inventory_lines').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// ── Supabase-backed purchases handler (with balance deduction) ────────────────
async function handlePurchases(req, res) {
  const sb = getSupabase()

  if (req.method === 'GET') {
    let q = sb.from('purchases').select('*, users!user_id(email)').order('created_at', { ascending: false })
    const { user_id } = req.query
    const effectiveUserId = req.user?.role === 'admin' ? user_id : req.user?.id
    if (effectiveUserId) q = q.eq('user_id', effectiveUserId)
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    const rows = (data || []).map(r => {
      const { users, ...rest } = r
      // Aliases so this feeds the admin "orders" list view directly, without
      // that page needing to know purchases' own internal column names.
      return { ...rest, user_email: users?.email || rest.user_id, amount: rest.price, date: rest.purchased_at }
    })
    return res.status(200).json(rows)
  }

  if (req.method === 'PUT') {
    // Only admins may change a purchase's tracking status
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const { id, status } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required for update' })
    const ALLOWED = ['pending', 'processing', 'completed', 'cancelled']
    if (status && !ALLOWED.includes(status)) return res.status(400).json({ error: 'Invalid status value' })
    const { data, error } = await sb.from('purchases').update({ status }).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, ...data })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    // Always use the authenticated user's ID — never trust body.user_id from a non-admin
    const userId = req.user?.role === 'admin' ? (body.user_id || req.user?.id) : req.user?.id
    if (!userId) return res.status(400).json({ error: 'user_id required' })

    // Price, title, and platform must come from the server's own product record —
    // never trust these from the client, or a request could be tampered with to
    // pay a fraction of the real price for a real product.
    const productId = body.product_id || null
    if (!productId) return res.status(400).json({ error: 'product_id required' })
    const { data: product, error: productErr } = await sb
      .from('inventory_products').select('price, title, platform').eq('id', productId).single()
    if (productErr || !product) return res.status(404).json({ error: 'Product not found' })
    const cost = Number(product.price || 0)
    if (isNaN(cost) || cost < 0) return res.status(400).json({ error: 'Invalid product price' })

    // Atomic, row-locked deduction — closes a real race where two concurrent purchase
    // requests could both read the same stale balance and both pass a plain
    // `currentBalance < cost` check before either write landed (double-spend).
    if (cost > 0) {
      const { data: deduction, error: deductErr } = await sb.rpc('deduct_balance', { p_user_id: userId, p_amount: cost })
      if (deductErr) return res.status(500).json({ error: deductErr.message })
      if (!deduction?.ok) return res.status(400).json({ error: deduction?.error || 'Insufficient balance' })
    }

    // Verify the requested line is still available (prevent race condition / stock theft)
    const lineId = body.line_id || null
    if (lineId) {
      const { data: lineData } = await sb.from('inventory_lines').select('status').eq('id', lineId).single()
      if (!lineData || lineData.status !== 'available') {
        if (cost > 0) await sb.rpc('refund_balance', { p_user_id: userId, p_amount: cost })
        return res.status(409).json({ error: 'This account is no longer available. Please try another.' })
      }
      // Lock the line immediately before any other operation
      const { error: lockErr } = await sb.from('inventory_lines').update({ status: 'sold' }).eq('id', lineId).eq('status', 'available')
      if (lockErr) {
        if (cost > 0) await sb.rpc('refund_balance', { p_user_id: userId, p_amount: cost })
        return res.status(500).json({ error: lockErr.message })
      }
    }

    const insertData = {
      id:            body.id || `PUR-${Date.now()}`,
      user_id:       userId,
      product_id:    productId,
      product_title: product.title    || null,
      platform:      product.platform || null,
      line_id:       lineId,
      price:         cost,
      email:         body.email || '',
      password:      body.password || '',
      twofa:         body.twofa || '',
      logo:          body.logo || null,
      purchased_at:  body.purchased_at || new Date().toLocaleString(),
    }

    const { data, error } = await sb.from('purchases').insert(insertData).select().single()
    if (error) {
      // Roll back line status and the already-deducted balance if the insert fails
      if (lineId) await sb.from('inventory_lines').update({ status: 'available' }).eq('id', lineId)
      if (cost > 0) await sb.rpc('refund_balance', { p_user_id: userId, p_amount: cost })
      return res.status(500).json({ error: error.message })
    }

    // Notify admin
    ;(async () => {
      let email = req.user?.email || ''
      if (!email) {
        const { data: u } = await sb.from('users').select('email').eq('id', userId).single()
        email = u?.email || ''
      }
      sendOrderNotification('order', {
        ticket_id: insertData.id,
        name: email,
        email,
        account_type: insertData.product_title || insertData.platform || 'Pre-Verified Account',
        amount: `$${cost}`,
        payment_method: 'Balance',
        policy_type: insertData.platform || '',
      })
    })()

    return res.status(201).json({ success: true, ...data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// ── Supabase-backed business types handler ────────────────────────────────────
async function handleBusinessTypes(req, res) {
  const sb = getSupabase()

  if (req.method === 'GET') {
    const { data, error } = await sb.from('business_types').select('*').order('sort_order', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const body = req.body || {}
    if (!body.name) return res.status(400).json({ error: 'Name required' })
    const { error } = await sb.from('business_types').insert({ name: body.name })
    if (error) {
      if (error.message?.includes('duplicate')) return res.status(200).json({ success: true }) // already exists — no-op
      return res.status(500).json({ error: error.message })
    }
    return res.status(201).json({ success: true })
  }

  if (req.method === 'DELETE') {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'ID required for delete' })
    const { error } = await sb.from('business_types').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// ── Supabase-backed support tickets handler ───────────────────────────────────
async function handleSupportTickets(req, res) {
  const sb      = getSupabase()
  const isAdmin = req.user?.role === 'admin'

  if (req.method === 'GET') {
    let q = sb.from('support_tickets').select('*').order('created_at', { ascending: false })
    if (!isAdmin) {
      if (!req.user?.id) return res.status(403).json({ error: 'Forbidden' })
      q = q.eq('user_id', req.user.id)
    } else if (req.query.user_id) {
      q = q.eq('user_id', req.query.user_id)
    }
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' })
    const body = req.body || {}
    const ticket = {
      id: `TCK-${Date.now()}`,
      // Force identity from the verified session — never trust body.user_id
      user_id:    req.user.id,
      user_email: req.user.email || null,
      subject:    String(body.subject || '').slice(0, 255),
      category:   String(body.category || 'Other').slice(0, 100),
      message:    String(body.message || '').slice(0, 5000),
      status:     'open',
    }
    if (!ticket.subject || !ticket.message) {
      return res.status(400).json({ error: 'Subject and message are required' })
    }
    const { data, error } = await sb.from('support_tickets').insert(ticket).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ success: true, ...data })
  }

  if (req.method === 'PUT') {
    // Only admins may update tickets (e.g. change status / add notes)
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
    const { id, ...body } = req.body || {}
    if (!id) return res.status(400).json({ error: 'ID required for update' })
    const updates = { updated_at: new Date().toISOString() }
    if (body.status      !== undefined) updates.status      = body.status
    if (body.admin_reply !== undefined) updates.admin_reply = body.admin_reply
    const { data, error } = await sb.from('support_tickets').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, ...data })
  }

  if (req.method === 'DELETE') {
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'ID required for delete' })
    const { error } = await sb.from('support_tickets').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// Generic CRUD mock API for all tables — exported so other handlers can share state
export const stores = {
  users: [
    { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "John Doe", email: "john.doe@example.com", balance: 1240, accounts: 12, status: "active", joined: "Jan 5, 2024", role: "user", password_hash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" },
    { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", name: "William Smith", email: "william@example.com", balance: 850, accounts: 8, status: "active", joined: "Jan 18, 2024", role: "user", password_hash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" },
    { id: "c9d0e1f2-a3b4-5678-c345-789012345678", name: "Super Admin", email: "admin@adversolutions.com", balance: 0, accounts: 0, status: "active", joined: "Jan 1, 2024", role: "admin", password_hash: "$2b$10$IHLMQQNvKH3hWB58Ej1MEO.Fmmish7e9iLHBy1tD38q1FhF42HiXW" },
    { id: "d1e2f3a4-b5c6-7890-d345-678901234567", name: "Sarah Advert", email: "advertiser@adversolutions.com", balance: 500, accounts: 3, status: "active", joined: "Feb 10, 2024", role: "advertiser", password_hash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" },
    { id: "e2f3a4b5-c6d7-8901-e456-789012345678", name: "Mike Finance", email: "finance@adversolutions.com", balance: 0, accounts: 0, status: "active", joined: "Feb 15, 2024", role: "finance", password_hash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" },
  ],
  transactions: [
    { id: 1, user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", type: "Deposit", method: "Payoneer", amount: 350, status: "pending", date: "May 19, 2024 10:30 AM" },
    { id: 2, user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", type: "Deposit", method: "USDT (TRC20)", amount: 200, status: "completed", date: "May 17, 2024 08:15 PM" },
  ],
  orders: [
    { id: "ORD-98765", user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", user_email: "john.doe@example.com", type: "Ad Account", platform: "Meta", amount: 120, status: "completed", date: "May 25, 2024" },
  ],
  deposits: [
    { id: "DEP-001", user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", user: "john.doe@example.com", method: "Payoneer", amount: 350, status: "pending", date: "May 19, 2024 10:30 AM", proof: "proof_001.png" },
  ],
  media_buyers: [],
  payment_methods: [
    { id: "pm-1", name: "Payoneer", bank_name: "Payoneer", logo: "💳", account: "adver@solution.com", active: true },
    { id: "pm-2", name: "Wise", bank_name: "Wise", logo: "💳", account: "adver@solution.com", active: true },
  ],
  inventory_products: [
    { id: "prod-1", platform: "Meta", type: "Aged", title: "Meta Aged Accounts (US)", description: "High-quality aged Meta Business Manager accounts.", price: 120, country: "United States", created: "May 20, 2024" },
    { id: "prod-2", platform: "Google", type: "Aged", title: "Google Aged Accounts (US)", description: "Mature Google Ads accounts with billing history.", price: 110, country: "United States", created: "May 18, 2024" },
    { id: "prod-3", platform: "TikTok", type: "New", title: "TikTok Fresh Accounts", description: "Brand new TikTok Business Center accounts.", price: 95, country: "United States", created: "May 22, 2024" },
    { id: "prod-4", platform: "Snapchat", type: "Aged", title: "Snapchat Aged Accounts", description: "Aged Snapchat Ads accounts with spending history.", price: 90, country: "United States", created: "May 15, 2024" },
    { id: "prod-5", platform: "Meta", type: "Aged", title: "Meta Aged Accounts (UK)", description: "UK-based Meta Business Manager accounts.", price: 150, country: "United Kingdom", created: "May 25, 2024" },
    { id: "prod-6", platform: "Google", type: "New", title: "Google Fresh Accounts", description: "New Google Ads accounts with USD billing.", price: 85, country: "United States", created: "May 21, 2024" },
    { id: "prod-7", platform: "TikTok", type: "Aged", title: "TikTok Aged Accounts", description: "Aged TikTok accounts with $180/day spend limit.", price: 105, country: "United States", created: "May 19, 2024" },
    { id: "prod-8", platform: "Snapchat", type: "New", title: "Snapchat Fresh Accounts", description: "New Snapchat Ads accounts ready to launch.", price: 75, country: "United States", created: "May 23, 2024" },
  ],
  inventory_lines: [
    { id: "l1", product_id: "prod-1", email: "john.doe***@gmail.com", password: "Pass123!", twofa: "J3K4 5G6H", status: "available" },
    { id: "l2", product_id: "prod-1", email: "alex.smi***@gmail.com", password: "Pass456!", twofa: "L1M2 3N4O", status: "available" },
    { id: "l3", product_id: "prod-1", email: "mark.joh***@gmail.com", password: "Pass789!", twofa: "P5Q6 7R8S", status: "sold" },
    { id: "l4", product_id: "prod-2", email: "sarah.wil***@gmail.com", password: "Ggl123!", twofa: "A1B2 C3D4", status: "available" },
    { id: "l5", product_id: "prod-2", email: "james.bro***@gmail.com", password: "Ggl456!", twofa: "E5F6 G7H8", status: "available" },
    { id: "l6", product_id: "prod-3", email: "lisa.tay***@gmail.com", password: "Tik123!", twofa: "Z1X2 C3V4", status: "available" },
    { id: "l7", product_id: "prod-4", email: "kevin.lee***@gmail.com", password: "Snap123!", twofa: "B1N2 M3K4", status: "available" },
    { id: "l8", product_id: "prod-5", email: "emma.wat***@gmail.com", password: "MetaUK1!", twofa: "Q1W2 E3R4", status: "available" },
    { id: "l9", product_id: "prod-6", email: "noah.jam***@gmail.com", password: "GglNew1!", twofa: "T5Y6 U7I8", status: "available" },
    { id: "l10", product_id: "prod-7", email: "olivia.bro***@gmail.com", password: "TikAge1!", twofa: "O1P2 A3S4", status: "available" },
    { id: "l11", product_id: "prod-8", email: "liam.joh***@gmail.com", password: "SnapNew1!", twofa: "D5F6 G7H8", status: "available" },
    { id: "l12", product_id: "prod-1", email: "ava.dav***@gmail.com", password: "Pass012!", twofa: "J9K0 L1M2", status: "available" },
  ],
  purchases: [],
  ad_account_requests: [],
  settings: {
    business_name: "AdverSolutions",
    support_email: "support@adversolutions.com",
    whatsapp_number: "",
    whatsapp_otp_enabled: true,
    whatsapp_otp_expiry: 10,
    whatsapp_otp_max_attempts: 3,
    whatsapp_otp_cooldown: 60,
    whatsapp_otp_allow_skip: false,
  },
}

// ── Supabase-backed ad_account_requests handler ───────────────────────────────
async function handleAdAccountRequests(req, res) {
  const sb = getSupabase()

  if (req.method === 'GET') {
    let q = sb.from('ad_account_requests').select('*').order('created_at', { ascending: false })
    if (req.user?.role !== 'admin' && req.user?.id) {
      q = q.eq('user_id', req.user.id)
    }
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    // Never trust user_id from body for non-admins
    const userId = req.user?.role === 'admin' ? (body.user_id || req.user?.id) : req.user?.id
    const amount = Number(body.amount || 0)

    // Input length validation
    const STR_MAX = 255
    const fieldsToValidate = ['account_name', 'business_name', 'business_email', 'bm_id', 'platform', 'business_type']
    for (const field of fieldsToValidate) {
      if (body[field] && String(body[field]).length > STR_MAX) {
        return res.status(400).json({ error: `Field '${field}' exceeds maximum allowed length.` })
      }
    }
    if (amount < 0 || isNaN(amount)) return res.status(400).json({ error: 'Invalid amount' })

    // ── Server-side minimum price enforcement ──────────────────────────────────
    // The client computes `amount` from the platform's real pricing, but a request
    // can be tampered with client-side (e.g. amount=0.01). We can't know the exact
    // topup the user chose above the minimum, but we CAN recompute the legitimate
    // floor for this platform/request-type and reject anything below it.
    const isTopupRequest = String(body.account_name || '').startsWith('Top-up:')
    const platformId = (body.platform || '').toLowerCase()
    let platformFeePercent = 6
    if (platformId) {
      const { data: priceRow } = await sb
        .from('platform_prices').select('price, fee, min_topup').eq('id', platformId).maybeSingle()
      const servicePrice = Number(priceRow?.price ?? 50)
      const feePercent   = Number(priceRow?.fee ?? 6)
      const minTopup     = Number(priceRow?.min_topup ?? 200)
      platformFeePercent = feePercent
      const minTopupWithFee = minTopup * (1 + feePercent / 100)
      const requiredMinimum = isTopupRequest ? minTopupWithFee : servicePrice + minTopupWithFee
      if (amount < requiredMinimum - 0.01) {
        return res.status(400).json({
          error: `Amount is below the minimum required for this request ($${requiredMinimum.toFixed(2)}).`,
        })
      }
    }

    // ── Balance check + hold: atomic, row-locked deduction — closes a real race
    // where two concurrent submissions could both read the same stale balance and
    // both pass a plain `currentBalance < amount` check before either write landed.
    if (amount > 0 && userId) {
      const { data: deduction, error: deductErr } = await sb.rpc('deduct_balance', { p_user_id: userId, p_amount: amount })
      if (deductErr) return res.status(500).json({ error: deductErr.message })
      if (!deduction?.ok) {
        return res.status(400).json({
          error: deduction?.balance != null
            ? `Insufficient balance. Your current balance is $${Number(deduction.balance).toFixed(2)} but this request requires $${amount.toFixed(2)}. Please top up your account balance first.`
            : (deduction?.error || 'Insufficient balance'),
        })
      }
      // Record the transaction
      try {
        await sb.from('transactions').insert({
          user_id: userId,
          type: 'Agency Account Request',
          method: 'Balance Deduction',
          amount: -amount,
          status: 'pending',
          date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        })
      } catch (e) { console.error('[ad_account_requests] transaction log insert failed', e.message) }
    }

    const id = String(Date.now())
    const now = new Date()
    const submitted = now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    // Parse page_links: could be string, array, or newline-separated
    let pageLinks = body.page_links || []
    if (typeof pageLinks === 'string') {
      pageLinks = pageLinks.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
    }

    // Top-ups: the amount submitted from the UI is topup + platform fee combined.
    // The balance deduction above correctly charges that full total, but the
    // credit-line/milestone tracking (which sums this `amount` field) should only
    // count the actual topup principal — so back out the fee for stored records.
    let storedAmount = amount
    if (isTopupRequest && amount > 0) {
      storedAmount = parseFloat((amount / (1 + platformFeePercent / 100)).toFixed(2))
    }

    // Everything else the user submitted (websites, gmail, snap_profile, or any
    // admin-defined custom field for this platform) used to be silently dropped
    // here — only bm_id and page_links had dedicated columns. Captured generically
    // into `metadata` instead, so no admin-configured field is ever lost.
    const KNOWN_TOP_LEVEL_FIELDS = new Set([
      'user_id', 'amount', 'account_name', 'business_name', 'business_type',
      'business_email', 'bm_id', 'business_center_id', 'platform', 'page_links',
    ])
    const metadata = {}
    for (const [k, v] of Object.entries(body)) {
      if (KNOWN_TOP_LEVEL_FIELDS.has(k)) continue
      if (v === undefined || v === null || v === '') continue
      if (Array.isArray(v) && v.filter(Boolean).length === 0) continue
      metadata[k] = Array.isArray(v) ? v.filter(Boolean) : v
    }

    const record = {
      id,
      user_id:        userId || null,
      user_email:     body.business_email || req.user?.email || null,
      platform:       (body.platform || '').toLowerCase(),
      account_name:   body.account_name   || null,
      business_name:  body.business_name  || null,
      business_type:  body.business_type  || null,
      business_email: body.business_email || null,
      bm_id:          body.bm_id || body.business_center_id || null,
      page_links:     pageLinks,
      metadata:       Object.keys(metadata).length ? metadata : null,
      status:         'pending',
      amount:         storedAmount,
      // The amount actually deducted from the user's balance — may differ from
      // `amount` above for top-ups, where `amount` stores only the principal
      // with the platform fee backed out. Kept so a later rejection can refund
      // the exact amount that was really taken, not a recomputed guess.
      charged_amount: amount,
      request_id:     `#AAR-${id}`,
      submitted_at:   submitted,
    }

    const { data, error } = await sb.from('ad_account_requests').insert(record).select().single()
    if (error) {
      // Roll back the already-deducted hold if the request row itself failed to save
      if (amount > 0 && userId) await sb.rpc('refund_balance', { p_user_id: userId, p_amount: amount })
      return res.status(500).json({ error: error.message })
    }

    sendOrderNotification('agency', {
      ticket_id: record.request_id,
      name: record.business_name || record.user_email || '',
      email: record.user_email || record.business_email || '',
      account_type: record.platform || 'Agency Ad Account',
    })

    return res.status(201).json({ success: true, ...data })
  }

  if (req.method === 'PUT') {
    const isAdmin = req.user?.role === 'admin'
    const body = req.body || {}
    const { id, ...updates } = body
    if (!id) return res.status(400).json({ error: 'id required' })
    // Only admins can change status — users cannot self-approve
    if (!isAdmin && updates.status !== undefined) {
      return res.status(403).json({ error: 'Only admins can change account request status' })
    }
    // Users can only update their own requests and only allowed fields
    if (!isAdmin) {
      const { data: existing } = await sb.from('ad_account_requests').select('user_id').eq('id', id).single()
      if (!existing || String(existing.user_id) !== String(req.user?.id)) {
        return res.status(403).json({ error: 'Access denied' })
      }
    }

    // If this update is a rejection, make the pending -> rejected transition itself
    // the race guard: only the request whose UPDATE actually flips the status (via
    // the .eq('status', 'pending') below) gets to refund. Two concurrent "reject"
    // clicks can no longer both see status !== 'rejected' and both refund.
    if (updates.status === 'rejected') {
      const { data: before } = await sb.from('ad_account_requests').select('status, user_id, charged_amount').eq('id', id).single()
      const charged = Number(before?.charged_amount || 0)

      const { data, error } = await sb
        .from('ad_account_requests')
        .update(updates)
        .eq('id', id)
        .eq('status', 'pending') // only succeeds for the first writer
        .select()
        .single()
      if (error) return res.status(500).json({ error: error.message })

      if (data && charged > 0 && before?.user_id) {
        const { error: refundErr } = await sb.rpc('refund_balance', { p_user_id: before.user_id, p_amount: charged })
        if (refundErr) {
          console.error('[ad_account_requests] refund failed', before.user_id, charged, refundErr.message)
        } else {
          try {
            await sb.from('transactions').insert({
              user_id: before.user_id,
              type:    'Agency Account Request Refund',
              method:  'Balance Credit',
              amount:  charged,
              status:  'completed',
              date:    new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            })
          } catch (e) { console.error('[ad_account_requests] transaction log insert failed (refund)', e.message) }
        }
      }

      // Row was already 'rejected' (or otherwise not 'pending') by the time this
      // request landed — apply the update anyway (idempotent for non-status fields)
      // but skip refunding again.
      if (!data) {
        const { data: fallback, error: fallbackErr } = await sb.from('ad_account_requests').update(updates).eq('id', id).select().single()
        if (fallbackErr) return res.status(500).json({ error: fallbackErr.message })
        return res.status(200).json(fallback)
      }

      return res.status(200).json(data)
    }

    // Correcting a mistaken rejection (moving the request OFF 'rejected' to anything
    // else) must re-charge the customer — otherwise the earlier refund stands and
    // whatever the admin marks it as next (approved/in review) is delivered for free.
    // Blocked entirely if the customer can no longer afford it.
    if (updates.status !== undefined && updates.status !== 'rejected') {
      const { data: before } = await sb.from('ad_account_requests').select('status, user_id, charged_amount').eq('id', id).single()
      const charged = Number(before?.charged_amount || 0)

      if (before?.status === 'rejected' && charged > 0 && before?.user_id) {
        const { data: recharge, error: rechargeErr } = await sb.rpc('deduct_balance', { p_user_id: before.user_id, p_amount: charged })
        if (rechargeErr) return res.status(500).json({ error: rechargeErr.message })
        if (!recharge?.ok) {
          return res.status(400).json({
            error: `Cannot un-reject: customer's balance is insufficient to re-charge $${charged.toFixed(2)}` +
              (recharge?.balance != null ? ` (current balance: $${Number(recharge.balance).toFixed(2)})` : '') +
              '. Ask them to top up first.',
          })
        }

        const { data, error } = await sb.from('ad_account_requests').update(updates).eq('id', id).select().single()
        if (error) {
          // Roll back the re-charge if the status update itself fails to save
          await sb.rpc('refund_balance', { p_user_id: before.user_id, p_amount: charged })
          return res.status(500).json({ error: error.message })
        }
        try {
          await sb.from('transactions').insert({
            user_id: before.user_id,
            type:    'Agency Account Request Re-charge (correction)',
            method:  'Balance Deduction',
            amount:  -charged,
            status:  'completed',
            date:    new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          })
        } catch (e) { console.error('[ad_account_requests] transaction log insert failed (recharge)', e.message) }
        return res.status(200).json(data)
      }
    }

    const { data, error } = await sb.from('ad_account_requests').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

let nextId = 1000

export default async function handler(req, res) {
  const method = req.method
  const table = req.query.table

  if (!table) {
    res.status(400).json({ error: 'Table required' })
    return
  }

  const sb = getSupabase()

  // Use Supabase for key tables when credentials are configured
  if (sb) {
    if (table === 'users')               return handleUsers(req, res)
    if (table === 'deposits')            return handleDeposits(req, res)
    if (table === 'transactions')        return handleTransactions(req, res)
    if (table === 'payment_methods')     return handlePaymentMethods(req, res)
    if (table === 'inventory_products')  return handleInventoryProducts(req, res)
    if (table === 'inventory_lines')     return handleInventoryLines(req, res)
    if (table === 'purchases')           return handlePurchases(req, res)
    if (table === 'ad_account_requests') return handleAdAccountRequests(req, res)
  }
  if (table === 'support_tickets') return handleSupportTickets(req, res)
  if (table === 'business_types')  return handleBusinessTypes(req, res)

  // structure_orders / structure_drafts have their own dedicated, properly
  // access-controlled handlers (api/structure-orders.js, api/structure-drafts.js)
  // which enforce ownership and admin-only status changes. They must NEVER be
  // reachable through this generic fallback, or those checks (and the
  // server-side price validation) could be bypassed entirely.
  if (table === 'structure_orders' || table === 'structure_drafts') {
    return res.status(403).json({ error: 'Use the dedicated /api/structure-orders or /api/structure-drafts endpoint for this table.' })
  }

  // Everything else remaining here is legacy/reference data with no per-user
  // ownership model — reads stay open, but only admins may write.
  if (method !== 'GET' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' })
  }

  const store = stores[table] || []

  // GET — list or single
  if (method === 'GET') {
    // Handle object-type stores (e.g. settings)
    if (!Array.isArray(store)) {
      return res.status(200).json(store)
    }

    let results = [...store]

    // Filtering
    for (const [key, val] of Object.entries(req.query)) {
      if (key === 'table' || key === 'order' || key === 'ascending' || key === 'limit' || key === 'single') continue
      results = results.filter(r => String(r[key] ?? '').toLowerCase() === String(val).toLowerCase())
    }

    // Single result
    if (req.query.single === 'true' || req.query.single === true) {
      return res.status(200).json(results[0] || null)
    }

    return res.status(200).json(results)
  }

  // POST — create
  if (method === 'POST') {
    const body = req.body || {}
    const newItem = { ...body }
    if (!newItem.id) newItem.id = nextId++
    store.unshift(newItem)
    return res.status(201).json({ success: true, id: newItem.id, ...newItem })
  }

  // PUT — update
  if (method === 'PUT') {
    const body = req.body || {}
    const id = body.id
    if (id === undefined) {
      return res.status(400).json({ error: 'ID required for update' })
    }
    const idx = store.findIndex(r => String(r.id) === String(id))
    if (idx === -1) {
      // If not found, just create it (upsert behavior for mock)
      store.unshift({ ...body })
      return res.status(200).json({ success: true, id })
    }
    store[idx] = { ...store[idx], ...body }
    return res.status(200).json({ success: true, id, ...store[idx] })
  }

  // DELETE
  if (method === 'DELETE') {
    const id = req.query.id
    if (id === undefined) {
      return res.status(400).json({ error: 'ID required for delete' })
    }
    const idx = store.findIndex(r => String(r.id) === String(id))
    if (idx === -1) {
      return res.status(404).json({ error: 'Not found' })
    }
    store.splice(idx, 1)
    return res.status(200).json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
