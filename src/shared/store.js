import { useSyncExternalStore } from 'react';
import {
  fetchUsers, fetchTransactions, fetchInventoryProducts, fetchInventoryLines,
  fetchOrders, fetchDeposits, fetchPaymentMethods,
  fetchBusinessTypes, fetchTickets, fetchAdAccountRequests, fetchPurchases,
  fetchPlatformPrices, fetchStructureOrders
} from '../lib/db.js';

const initial = {
  balance: 0,
  transactions: null,
  deposits: null,
  orders: null,
  paymentMethods: null,
  inventoryProducts: null,
  inventoryLines: null,
  adAccountRequests: null,
  purchases: null,
  supportTickets: null,
  structureDrafts: null,
  structureOrders: null,
  theme:
    (typeof window !== 'undefined' &&
      window.localStorage?.getItem('adver_theme')) ||
    'light',
  // Admin-only fields
  users: null,
  businessTypes: null,
  platformPrices: null,
  // Legacy compat
  perms: {},
};

let state = initial;
const listeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}

export function getStore() {
  return state;
}

export function setStore(updater) {
  state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
  emit();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore() {
  const snapshot = useSyncExternalStore(subscribe, getStore, getStore);
  return [snapshot, setStore];
}

export function _resetStore() {
  state = initial;
  emit();
}

// Used by admin to pre-populate the store after login
// Poll user-facing data every N seconds — merges into existing state without flash
export async function pollUserStore(userId) {
  try {
    const [
      transactions, orders, deposits, adAccountRequests, purchases, supportTickets,
      inventoryProducts, structureOrdersRes,
    ] = await Promise.all([
      fetchTransactions(userId),
      fetchOrders(userId),
      fetchDeposits(userId),
      fetchAdAccountRequests(),
      fetchPurchases(userId),
      fetchTickets(),
      fetchInventoryProducts(),
      fetchStructureOrders(true, userId),
    ]);
    // structure-orders API returns { orders: [...] }
    const structureOrders = Array.isArray(structureOrdersRes)
      ? structureOrdersRes
      : (structureOrdersRes?.orders || structureOrdersRes?.items || null);
    setStore(s => ({
      ...s,
      transactions:      transactions      ?? s.transactions      ?? [],
      orders:            orders            ?? s.orders            ?? [],
      deposits:          deposits          ?? s.deposits          ?? [],
      adAccountRequests: adAccountRequests ?? s.adAccountRequests ?? [],
      purchases:         purchases         ?? s.purchases         ?? [],
      supportTickets:    supportTickets    ?? s.supportTickets    ?? [],
      inventoryProducts: inventoryProducts ?? s.inventoryProducts ?? [],
      structureOrders:   structureOrders   ?? s.structureOrders   ?? [],
    }));
  } catch { /* silent — never break the UI on a background poll */ }
}

// Poll admin-facing data — keeps new user submissions visible without manual refresh
export async function pollAdminStore() {
  try {
    const [
      users, transactions, orders, deposits, adAccountRequests,
      supportTickets, inventoryLines,
    ] = await Promise.all([
      fetchUsers(),
      fetchTransactions(null),
      fetchOrders(null),
      fetchDeposits(null),
      fetchAdAccountRequests(),
      fetchTickets(),
      fetchInventoryLines(),
    ]);
    setStore(s => ({
      ...s,
      users:             users             ?? s.users             ?? [],
      transactions:      transactions      ?? s.transactions      ?? [],
      orders:            orders            ?? s.orders            ?? [],
      deposits:          deposits          ?? s.deposits          ?? [],
      adAccountRequests: adAccountRequests ?? s.adAccountRequests ?? [],
      supportTickets:    supportTickets    ?? s.supportTickets    ?? [],
      inventoryLines:    inventoryLines    ?? s.inventoryLines    ?? [],
    }));
  } catch { /* silent */ }
}

export async function hydrateStore() {
  try {
    const [
      users, inventoryProducts, inventoryLines, paymentMethods,
      businessTypes, platformPrices, transactions, orders,
      deposits, supportTickets, adAccountRequests, purchases,
    ] = await Promise.all([
      fetchUsers(),
      fetchInventoryProducts(),
      fetchInventoryLines(),
      fetchPaymentMethods(),
      fetchBusinessTypes(),
      fetchPlatformPrices(),
      fetchTransactions(null),
      fetchOrders(null),
      fetchDeposits(null),
      fetchTickets(),
      fetchAdAccountRequests(),
      fetchPurchases(null),
    ]);
    setStore((s) => ({
      ...s,
      users: users || [],
      inventoryProducts: inventoryProducts || [],
      inventoryLines: inventoryLines || [],
      paymentMethods: paymentMethods || [],
      businessTypes: businessTypes || [],
      platformPrices: platformPrices || {},
      transactions: transactions || [],
      orders: orders || [],
      deposits: deposits || [],
      supportTickets: supportTickets || [],
      adAccountRequests: adAccountRequests || [],
      purchases: purchases || [],
    }));
  } catch (err) {
    console.error('hydrateStore error:', err);
  }
}
