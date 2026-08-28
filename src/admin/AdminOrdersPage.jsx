import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '../shared/Router.jsx';
import { apiFetch } from '../shared/api.js';
import { C, getThemeColors, PLATFORMS } from '../shared/theme.js';
import { USER_PAGES, getPermsForUser, savePermsForUser, syncPermsFromServer } from '../shared/permissions.js';
import { PageShell } from '../shared/UI.jsx';
import { Card, PlatformIcon, Badge, Btn, Input, Select, DataTable, Modal, Pagination, Avatar } from '../shared/UI.jsx';
import { useTheme } from '../shared/ThemeContext.jsx';
/* ═══════════════════════════════════════════════════
   API HELPERS
═══════════════════════════════════════════════════ */
async function apiGet(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString();
  const res = await fetch(`/api/crud?${qs}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { console.error('Non-JSON:', text.slice(0,200)); return []; }
}

async function apiPost(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

async function apiPut(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

async function apiDelete(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString();
  const res = await fetch(`/api/crud?${qs}`, { method: 'DELETE' });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

/* ═══════════════════════════════════════════════════
   ADMIN ORDERS PAGE
═══════════════════════════════════════════════════ */

export function AdminOrdersPage({ orders, setStore }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !search || o.id?.toLowerCase().includes(search.toLowerCase()) || o.user?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || o.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('orders', { order: 'created_at', ascending: 'false' });
      if (data && data.length > 0) {
        setStore(s => ({ ...s, orders: data }));
      }
    } catch (err) {
      console.error('Orders refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setStore]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateStatus = async (id, newStatus) => {
    setSavingId(id);
    setError("");
    try {
      const order = orders.find(o => o.id === id);
      if (!order) return;

      await apiPut('orders', { id, status: newStatus });

      // If completed, mark associated inventory as sold
      if (newStatus === "completed") {
        const lines = await apiGet('inventory_lines', { status: 'available', limit: '1' });
        if (lines && lines.length > 0) {
          await apiPut('inventory_lines', { id: lines[0].id, status: 'sold' });
        }
      }

      setStore(s => ({ ...s, orders: s.orders.map(o => o.id === id ? { ...o, status: newStatus } : o) }));
    } catch (err) {
      setError('Failed to update order: ' + err.message);
      console.error('Update order error:', err);
    } finally {
      setSavingId(null);
    }
  };

  const cancelOrder = (id) => updateStatus(id, 'cancelled');

  const deleteOrder = async (id) => {
    setSavingId(id);
    setError("");
    try {
      const res = await fetch(`/api/crud?table=orders&id=${id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Delete failed'); }
      setStore(s => ({ ...s, orders: s.orders.filter(o => o.id !== id) }));
    } catch (err) {
      setError('Delete failed: ' + err.message);
    } finally {
      setSavingId(null);
      setConfirmDelete(null);
    }
  };

  const cols = [
    { label: "Order ID", render: r => <span style={{ fontWeight: 700, color: TC.g700, fontSize: 12 }}>{r.id}</span> },
    { label: "User", render: r => <span style={{ fontSize: 12, color: TC.g500 }}>{r.user_email || r.user}</span> },
    { label: "Type", render: r => <span style={{ fontSize: 12 }}>{r.type}</span> },
    { label: "Platform", render: r => <span style={{ fontSize: 12 }}>{r.platform}</span> },
    { label: "Amount", render: r => <span style={{ fontWeight: 800, color: TC.primary }}>${r.amount}.00</span> },
    { label: "Status", render: r => <Badge status={r.status} /> },
    { label: "Date", render: r => <span style={{ fontSize: 12, color: TC.g400 }}>{r.date}</span> },
    { label: "Actions", render: r => (
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <select
          value={r.status}
          disabled={savingId === r.id}
          onChange={e => updateStatus(r.id, e.target.value)}
          style={{ fontSize: 12, borderRadius: 6, border: `1px solid ${TC.g200}`, padding: "4px 8px", background: TC.card, color: TC.text }}
        >
          <option>pending</option><option>processing</option><option>completed</option><option>cancelled</option>
        </select>
        {r.status !== 'cancelled' && (
          <Btn variant="warning" size="sm" onClick={() => cancelOrder(r.id)} disabled={savingId === r.id}>✕ Cancel</Btn>
        )}
        <Btn variant="danger" size="sm" onClick={() => setConfirmDelete(r)} disabled={savingId === r.id}>🗑</Btn>
      </div>
    )},
  ];

  return (
    <PageShell title="Orders" subtitle="View and manage all platform orders."
      actions={[<Btn key="exp" variant="outline">↑ Export</Btn>]}>
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[["Total Orders", orders.length, TC.blue], ["Completed", orders.filter(o => o.status === "completed").length, TC.green], ["Processing", orders.filter(o => o.status === "processing").length, TC.yellow], ["Pending", orders.filter(o => o.status === "pending").length, TC.red]].map(([l, v, c]) => (
          <Card key={l}><div style={{ fontSize: 12, color: TC.g400, marginBottom: 6 }}>{l}</div><div style={{ fontSize: 28, fontWeight: 800, color: c, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{v}</div></Card>
        ))}
      </div>
      <Card>
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <input placeholder="🔍 Search orders…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: `1px solid ${TC.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: TC.g50, border: `1px solid ${TC.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            <option>All Status</option><option>Completed</option><option>Processing</option><option>Pending</option>
          </select>
          <Btn variant="outline" size="sm" onClick={refetch} disabled={loading}>{loading ? '↻' : '↻ Refresh'}</Btn>
        </div>
        {loading && <div style={{ textAlign: "center", padding: "20px", color: TC.g400, fontSize: 14 }}>Loading orders…</div>}
        <DataTable cols={cols} rows={filteredOrders} />
        <div style={{ marginTop: 14 }}>
          <Pagination total={`${filteredOrders.length} orders`} showing={`1–${filteredOrders.length}`} pages={["‹", 1, 2, 3, "...", Math.ceil(filteredOrders.length / 10) || 1, "›"]} />
        </div>
      </Card>
      {confirmDelete && (
        <Modal title="Delete Order" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ fontSize: 14, color: TC.g600, marginBottom: 20 }}>
            Permanently delete order <strong style={{ color: TC.g800 }}>{confirmDelete.id}</strong>? This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="outline" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancel</Btn>
            <Btn variant="danger" onClick={() => deleteOrder(confirmDelete.id)} disabled={savingId === confirmDelete.id} style={{ flex: 1 }}>
              {savingId === confirmDelete.id ? 'Deleting…' : 'Yes, Delete'}
            </Btn>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
