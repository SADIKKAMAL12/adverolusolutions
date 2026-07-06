import { getStore, setStore } from './store.js'

export const USER_PAGES = [
  { key: "agency-ad-accounts",   label: "Agency Ad Accounts",   description: "Request & manage Meta, Google, TikTok and Snapchat agency ad accounts" },
  { key: "preverified-accounts", label: "Pre-Verified Accounts", description: "Browse and purchase pre-verified ad accounts from inventory" },
  { key: "orders",               label: "Orders",               description: "View all platform orders and their statuses" },
  { key: "balance",              label: "Balance & Deposits",   description: "Add funds, deposit and view transaction history" },
  { key: "support",              label: "Support",              description: "Create and track support tickets with the team" },
  { key: "structure-builder",   label: "Structure Builder",    description: "Build and submit custom ad structure orders" },
  { key: "purchase-history",    label: "Purchase History",     description: "View previously purchased account history" },
];

// Fetch one user's permissions from server and cache in the in-memory store.
// Cookie is sent automatically for same-origin requests.
export async function syncPermsFromServer(userId) {
  if (!userId) return
  try {
    const res = await fetch(`/api/user-settings?user_id=${encodeURIComponent(userId)}`)
    if (!res.ok) return
    const serverPerms = await res.json()
    if (serverPerms && typeof serverPerms === 'object') {
      setStore(s => ({ ...s, perms: { ...(s.perms || {}), [userId]: serverPerms } }))
    }
  } catch {}
}

// Push permissions to server and update the in-memory store.
export async function savePermsForUser(userId, permissions) {
  setStore(s => ({ ...s, perms: { ...(s.perms || {}), [userId]: permissions } }))
  try {
    await fetch(`/api/user-settings?user_id=${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permissions),
    })
  } catch {}
}

export function getPermsForUser(userId) {
  return ((getStore().perms) || {})[userId] || {}
}

export function hasPageAccess(userId, pageKey) {
  const perms = getPermsForUser(userId)
  if (!perms.pages) return true
  return perms.pages[pageKey] !== false
}

export function hasPaymentAccess(userId, methodId) {
  const perms = getPermsForUser(userId)
  if (!perms.blockedPaymentMethods?.length) return true
  return !perms.blockedPaymentMethods.includes(methodId)
}
