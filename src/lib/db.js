const API_BASE = '/api'

async function apiGet(endpoint, params = {}) {
  const qs = new URLSearchParams(params).toString()
  const url = qs ? `${endpoint}?${qs}` : endpoint
  const res = await fetch(url)
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch {
    console.error(`[apiGet ${endpoint}] Non-JSON response:`, text.slice(0, 200))
    throw new Error('Non-JSON response from server')
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

async function apiPost(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch {
    console.error(`[apiPost ${endpoint}] Non-JSON response:`, text.slice(0, 200))
    throw new Error('Non-JSON response from server')
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

async function apiPut(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch {
    console.error(`[apiPut ${endpoint}] Non-JSON response:`, text.slice(0, 200))
    throw new Error('Non-JSON response from server')
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

async function apiDelete(endpoint, id) {
  const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch {
    console.error(`[apiDelete ${endpoint}] Non-JSON response:`, text.slice(0, 200))
    throw new Error('Non-JSON response from server')
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

// ========================
// USERS
// ========================

export async function fetchUsers() {
  return apiGet(`${API_BASE}/users`, { order: 'created_at', ascending: 'false' })
}

export async function fetchUserByEmail(email) {
  return apiGet(`${API_BASE}/users`, { email, single: 'true' })
}

export async function createUser(user) {
  return apiPost(`${API_BASE}/users`, user)
}

export async function updateUser(id, updates) {
  return apiPut(`${API_BASE}/users`, { id, ...updates })
}

// ========================
// TRANSACTIONS
// ========================

export async function fetchTransactions(userId = null) {
  const params = { order: 'id', ascending: 'false' }
  if (userId) params.user_id = userId
  return apiGet(`${API_BASE}/transactions`, params)
}

export async function createTransaction(tx) {
  return apiPost(`${API_BASE}/transactions`, tx)
}

// ========================
// INVENTORY
// ========================

export async function fetchInventoryProducts() {
  return apiGet(`${API_BASE}/inventory-products`)
}

export async function fetchInventoryLines() {
  const data = await apiGet(`${API_BASE}/inventory-lines`)
  // DB returns product_id (snake_case); app code uses productId (camelCase)
  return (data || []).map(l => ({ ...l, productId: l.product_id ?? l.productId }))
}

export async function updateInventoryLine(id, updates) {
  return apiPut(`${API_BASE}/inventory-lines`, { id, ...updates })
}

export async function createInventoryProduct(product) {
  return apiPost(`${API_BASE}/inventory-products`, product)
}

export async function createInventoryLines(lines) {
  return apiPost(`${API_BASE}/inventory-lines`, lines)
}

// ========================
// ORDERS
// ========================

export async function fetchOrders(userId = null) {
  const params = { order: 'created_at', ascending: 'false' }
  if (userId) params.user_id = userId
  return apiGet(`${API_BASE}/orders`, params)
}

export async function createOrder(order) {
  return apiPost(`${API_BASE}/orders`, order)
}

export async function updateOrder(id, updates) {
  return apiPut(`${API_BASE}/orders`, { id, ...updates })
}

// ========================
// DEPOSITS
// ========================

export async function fetchDeposits(userId = null) {
  const params = { order: 'created_at', ascending: 'false' }
  if (userId) params.user_id = userId
  return apiGet(`${API_BASE}/deposits`, params)
}

export async function createDeposit(deposit) {
  return apiPost(`${API_BASE}/deposits`, deposit)
}

export async function updateDeposit(id, updates) {
  return apiPut(`${API_BASE}/deposits`, { id, ...updates })
}

// ========================
// MEDIA BUYERS
// ========================

export async function fetchMediaBuyers() {
  const data = await apiGet(`${API_BASE}/media-buyers`, { order: 'id', ascending: 'false' })
  // DB returns reject_reason (snake_case); app code uses rejectReason (camelCase)
  return (data || []).map(m => ({ ...m, rejectReason: m.reject_reason ?? m.rejectReason }))
}

export async function updateMediaBuyer(id, updates) {
  return apiPut(`${API_BASE}/media-buyers`, { id, ...updates })
}

// ========================
// PAYMENT METHODS
// ========================

export async function fetchPaymentMethods() {
  return apiGet(`${API_BASE}/payment-methods`)
}

export async function updatePaymentMethod(id, updates) {
  return apiPut(`${API_BASE}/payment-methods`, { id, ...updates })
}

export async function createPaymentMethod(method) {
  return apiPost(`${API_BASE}/payment-methods`, method)
}

export async function deletePaymentMethod(id) {
  return apiDelete(`${API_BASE}/payment-methods`, id)
}

// ========================
// BUSINESS TYPES
// ========================

export async function fetchBusinessTypes() {
  const data = await apiGet(`${API_BASE}/business-types`)
  return (data || []).map(r => r.name)
}

export async function createBusinessType(name) {
  const data = await apiPost(`${API_BASE}/business-types`, { name })
  return data
}

export async function deleteBusinessType(id) {
  return apiDelete(`${API_BASE}/business-types`, id)
}

// ========================
// SUPPORT TICKETS
// ========================

export async function fetchTickets() {
  return apiGet(`${API_BASE}/support-tickets`, { order: 'created_at', ascending: 'false' })
}

export async function createTicket(ticket) {
  return apiPost(`${API_BASE}/support-tickets`, ticket)
}

// ========================
// AD ACCOUNT REQUESTS
// ========================

export async function fetchAdAccountRequests() {
  const data = await apiGet(`${API_BASE}/ad-account-requests`, { order: 'created_at', ascending: 'false' })
  return (data || []).map(r => ({
    ...r,
    accountName:  r.account_name   ?? r.accountName,
    pageLinks:    r.page_links     ?? r.pageLinks,
    bmId:         r.bm_id          ?? r.bmId,
    businessName: r.business_name  ?? r.businessName,
    businessType: r.business_type  ?? r.businessType,
    email:        r.business_email ?? r.email,
    requestId:    r.request_id     ?? r.requestId,
    submittedAt:  r.submitted_at   ?? r.submittedAt,
  }))
}

export async function createAdAccountRequest(req) {
  return apiPost(`${API_BASE}/ad-account-requests`, req)
}

// ========================
// PLATFORM PRICES
// ========================

export async function fetchPlatformPrices() {
  const rows = await apiGet(`${API_BASE}/platform-prices`)
  const map = {}
  for (const r of (rows || [])) {
    map[r.id] = {
      price:    Number(r.price),
      fee:      Number(r.fee),
      minTopup: Number(r.min_topup ?? 200),
      active:   r.active !== false,
    }
  }
  return map
}

export async function updatePlatformPrice(id, updates) {
  return apiPut(`${API_BASE}/platform-prices`, { id, ...updates })
}

// ========================
// PURCHASES
// ========================

export async function fetchPurchases(userId = null) {
  const params = { order: 'created_at', ascending: 'false' }
  if (userId) params.user_id = userId
  const data = await apiGet(`${API_BASE}/purchases`, params)
  return (data || []).map(p => ({
    ...p,
    productId:    p.product_id    ?? p.productId,
    productTitle: p.product_title ?? p.productTitle,
    lineId:       p.line_id       ?? p.lineId,
    purchasedAt:  p.purchased_at  ?? p.purchasedAt,
  }))
}

export async function createPurchase(purchase) {
  return apiPost(`${API_BASE}/purchases`, purchase)
}

// ========================
// PROJECTS
// ========================

export async function fetchProjects() {
  return apiGet(`${API_BASE}/projects`, { order: 'created_at', ascending: 'false' })
}

export async function createProject(project) {
  return apiPost(`${API_BASE}/projects`, project)
}

export async function updateProject(id, updates) {
  return apiPut(`${API_BASE}/projects`, { id, ...updates })
}

// ========================
// ANNOUNCEMENTS
// ========================

export async function fetchAnnouncements() {
  return apiGet(`${API_BASE}/announcements`, { order: 'id', ascending: 'false' })
}

// ========================
// SETTINGS
// ========================

export async function fetchSettings() {
  return apiGet(`${API_BASE}/settings`, { single: 'true' })
}

export async function upsertSettings(settings) {
  return apiPost(`${API_BASE}/settings`, settings)
}

// ========================
// STRUCTURE BUILDER
// ========================

export async function fetchStructureAssets() {
  return apiGet(`${API_BASE}/structure-assets`)
}

export async function fetchStructureConnections() {
  return apiGet(`${API_BASE}/structure-connections`)
}

export async function fetchStructureDrafts(userId = null) {
  const params = userId ? { user_id: userId } : {}
  return apiGet(`${API_BASE}/structure-drafts`, params)
}

export async function fetchStructureDraft(id) {
  return apiGet(`${API_BASE}/structure-drafts`, { id })
}

export async function createStructureDraft(draft) {
  return apiPost(`${API_BASE}/structure-drafts`, draft)
}

export async function updateStructureDraft(id, draft) {
  return apiPut(`${API_BASE}/structure-drafts`, { id, ...draft })
}

export async function deleteStructureDraft(id) {
  return apiDelete(`${API_BASE}/structure-drafts`, id)
}

export async function fetchStructureOrders(userOnly = false, userId = null) {
  const params = {}
  if (userOnly) { params.mine = '1'; if (userId) params.user_id = userId }
  return apiGet(`${API_BASE}/structure-orders`, params)
}

export async function fetchStructureOrder(id) {
  return apiGet(`${API_BASE}/structure-orders`, { id })
}

export async function createStructureOrder(order) {
  return apiPost(`${API_BASE}/structure-orders`, order)
}

export async function updateStructureOrder(id, updates) {
  return apiPut(`${API_BASE}/structure-orders`, { id, ...updates })
}
