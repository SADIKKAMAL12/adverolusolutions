import { useState, useEffect, useCallback, Fragment } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx'
import { useStore, setStore as globalSetStore } from '../shared/store.js'
import { fetchStructureOrders, updateStructureOrder } from '../lib/db.js'
import StructurePreviewModal from '../builder/StructurePreviewModal.jsx'
import {
  Layers, ShoppingBag, Building2, Search, Eye,
  CheckCircle, RefreshCw, Loader, AlertTriangle, Save, CheckCheck, Package,
} from 'lucide-react'

async function apiGet(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString()
  const res = await fetch(`/api/crud?${qs}`)
  try { return await res.json() } catch { return [] }
}
async function apiPut(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}

const STATUS_COLORS = {
  pending: '#f59e0b', processing: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444',
  in_review: '#3b82f6', approved: '#22c55e', rejected: '#ef4444',
  building: '#3b82f6', done: '#22c55e', assets_missing: '#ec4899',
};
function StatusBadge({ status, labelMap }) {
  const color = STATUS_COLORS[status] || '#9d9da6';
  const label = labelMap?.[status] || (status ? status.replace('_', ' ') : 'Pending');
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color, background: `${color}22`, padding: '5px 11px', borderRadius: 100, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      {label}
    </span>
  );
}

function StatCard({ theme, label, value, tint }) {
  return (
    <GlassCard theme={theme} style={{ padding: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800, color: tint, letterSpacing: '-0.01em' }}>{value}</div>
    </GlassCard>
  );
}

function ThemedSelect({ theme, value, onChange, options, disabled }) {
  return (
    <select
      value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
      style={{
        height: 34, padding: '0 28px 0 10px', borderRadius: 9,
        border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text,
        fontSize: 12, fontWeight: 600, fontFamily: FONT, appearance: 'none', WebkitAppearance: 'none',
        backgroundImage: theme.mode === 'dark'
          ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%239d9da6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
          : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%236b6b72' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1,
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function FilterPills({ theme, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            padding: '9px 16px', borderRadius: 100, fontSize: 12.5, fontWeight: 700, fontFamily: FONT,
            border: active ? '1px solid transparent' : `1px solid ${theme.border}`, cursor: 'pointer',
            background: active ? `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})` : theme.surfaceSunken,
            color: active ? '#fff' : theme.textMuted, boxShadow: active ? '0 8px 18px -8px rgba(255,45,85,0.5)' : 'none', transition: 'all .15s',
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

function SearchFilterBar({ theme, search, setSearch, placeholder, filters, filterValue, setFilterValue, onRefresh, loading }) {
  return (
    <GlassCard theme={theme} style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
      <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 10, height: 42, padding: '0 14px', borderRadius: 12, background: theme.surfaceSunken, border: `1px solid ${theme.border}` }}>
        <Search size={15} style={{ color: theme.textFaint }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={placeholder} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13.5, color: theme.text, fontFamily: FONT }} />
      </div>
      <FilterPills theme={theme} value={filterValue} onChange={setFilterValue} options={filters} />
      {onRefresh && (
        <button onClick={onRefresh} disabled={loading} style={{ height: 42, padding: '0 16px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12.5, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
          {loading ? <Loader size={13} /> : <RefreshCw size={13} />} Refresh
        </button>
      )}
    </GlassCard>
  );
}

const PRE_LABELS = { pending: 'Pending', processing: 'Processing', completed: 'Completed', cancelled: 'Cancelled' };

function PreVerifiedTab({ theme }) {
  const [store] = useStore();
  const orders = store.orders || [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('purchases', { order: 'created_at', ascending: 'false' });
      if (Array.isArray(data) && data.length > 0) globalSetStore(s => ({ ...s, orders: data }));
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { refetch(); }, [refetch]);

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (o.id || '').toLowerCase().includes(q) || (o.user_email || o.user || '').toLowerCase().includes(q) || (o.platform || '').toLowerCase().includes(q);
  });

  const updateStatus = async (id, status) => {
    setSavingId(id);
    try {
      await apiPut('purchases', { id, status });
      globalSetStore(s => ({ ...s, orders: s.orders.map(o => o.id === id ? { ...o, status } : o) }));
    } catch (e) { alert(e.message); } finally { setSavingId(null); }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard theme={theme} label="Total" value={orders.length} tint="#3b82f6" />
        <StatCard theme={theme} label="Completed" value={orders.filter(o => o.status === 'completed').length} tint="#22c55e" />
        <StatCard theme={theme} label="Processing" value={orders.filter(o => o.status === 'processing').length} tint="#f59e0b" />
        <StatCard theme={theme} label="Pending" value={orders.filter(o => o.status === 'pending').length} tint="#ef4444" />
      </div>

      <SearchFilterBar theme={theme} search={search} setSearch={setSearch} placeholder="Search by ID, user, platform…"
        filters={[['all', 'All'], ['pending', 'Pending'], ['processing', 'Processing'], ['completed', 'Completed'], ['cancelled', 'Cancelled']].map(([value, label]) => ({ value, label }))}
        filterValue={filter} setFilterValue={setFilter} onRefresh={refetch} loading={loading} />

      <GlassCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
            <thead>
              <tr>
                {['Order ID', 'User', 'Platform', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '13px 20px', fontSize: 10.5, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>Loading orders…</td></tr>}
              {!loading && filtered.map((o, i, arr) => {
                const last = i === arr.length - 1;
                const cellStyle = { padding: '14px 20px', borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap', fontSize: 13, color: theme.text };
                return (
                  <tr key={o.id}>
                    <td style={{ ...cellStyle, fontFamily: 'monospace', fontWeight: 700, fontSize: 12 }}>{o.id}<div style={{ fontWeight: 400, color: theme.textFaint, fontSize: 11, marginTop: 2 }}>{o.date}</div></td>
                    <td style={cellStyle}>{o.user_email || o.user || '—'}</td>
                    <td style={cellStyle}>{o.platform || '—'}</td>
                    <td style={{ ...cellStyle, fontWeight: 800, color: BRAND }}>${o.amount || 0}</td>
                    <td style={cellStyle}><StatusBadge status={o.status || 'pending'} labelMap={PRE_LABELS} /></td>
                    <td style={cellStyle}>
                      <ThemedSelect theme={theme} value={o.status || 'pending'} disabled={savingId === o.id} onChange={(v) => updateStatus(o.id, v)}
                        options={[{ value: 'pending', label: 'Pending' }, { value: 'processing', label: 'Processing' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }]} />
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>No orders found</td></tr>}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

const AGY_LABELS = { pending: 'Pending', in_review: 'In Review', approved: 'Approved', rejected: 'Rejected' };

function AgencyTab({ theme }) {
  const [store] = useStore();
  const requests = store.adAccountRequests || [];
  const users = store.users || [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [savingId, setSavingId] = useState(null);
  const [detail, setDetail] = useState(null);

  const getUserEmail = (userId) => {
    const u = users.find(u => u.id === userId);
    return u ? (u.email || u.name) : (userId || '—');
  };

  const filtered = requests.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.account_name || '').toLowerCase().includes(q) || (r.platform || '').toLowerCase().includes(q) || getUserEmail(r.user_id).toLowerCase().includes(q);
  });

  const updateStatus = async (id, status) => {
    setSavingId(id);
    try {
      await apiPut('ad_account_requests', { id, status });
      globalSetStore(s => ({ ...s, adAccountRequests: s.adAccountRequests.map(r => r.id === id ? { ...r, status } : r) }));
    } catch (e) { alert(e.message); } finally { setSavingId(null); }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard theme={theme} label="Total Requests" value={requests.length} tint="#3b82f6" />
        <StatCard theme={theme} label="Pending" value={requests.filter(r => r.status === 'pending').length} tint="#f59e0b" />
        <StatCard theme={theme} label="In Review" value={requests.filter(r => r.status === 'in_review').length} tint="#a855f7" />
        <StatCard theme={theme} label="Approved" value={requests.filter(r => r.status === 'approved').length} tint="#22c55e" />
      </div>

      <SearchFilterBar theme={theme} search={search} setSearch={setSearch} placeholder="Search by account, platform, user…"
        filters={[['all', 'All'], ['pending', 'Pending'], ['in_review', 'In Review'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([value, label]) => ({ value, label }))}
        filterValue={filter} setFilterValue={setFilter} />

      <GlassCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
            <thead>
              <tr>
                {['Account Name', 'User', 'Platform', 'Business Type', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '13px 20px', fontSize: 10.5, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i, arr) => {
                const last = i === arr.length - 1;
                const cellStyle = { padding: '14px 20px', borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap', fontSize: 13, color: theme.text };
                return (
                  <tr key={r.id}>
                    <td style={cellStyle}>
                      <div style={{ fontWeight: 700 }}>{r.account_name || '—'}</div>
                      <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 2 }}>{r.id}</div>
                    </td>
                    <td style={cellStyle}>{getUserEmail(r.user_id)}</td>
                    <td style={cellStyle}>{r.platform || '—'}</td>
                    <td style={cellStyle}>{r.business_type || '—'}</td>
                    <td style={cellStyle}><StatusBadge status={r.status || 'pending'} labelMap={AGY_LABELS} /></td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ThemedSelect theme={theme} value={r.status || 'pending'} disabled={savingId === r.id} onChange={(v) => updateStatus(r.id, v)}
                          options={[{ value: 'pending', label: 'Pending' }, { value: 'in_review', label: 'In Review' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]} />
                        <button onClick={() => setDetail(r)} style={{ height: 34, padding: '0 14px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Eye size={12} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>No agency account requests</td></tr>}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {detail && (
        <div onClick={() => setDetail(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: theme.surface, borderRadius: 20, border: `1px solid ${theme.border}`, boxShadow: theme.shadowLg, width: 520, maxWidth: '92vw', maxHeight: '85vh', overflow: 'auto', padding: 24, fontFamily: FONT }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Request Details</div>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: theme.textFaint }}>✕</button>
            </div>
            {[
              ['Account Name', detail.account_name],
              ['Platform', detail.platform],
              ['Business Name', detail.business_name],
              ['Business Type', detail.business_type],
              ['Email', detail.business_email],
              ['BM ID', detail.bm_id],
              ['Status', detail.status],
              ['Submitted', detail.created_at ? new Date(detail.created_at).toLocaleString() : '—'],
            ].map(([k, v]) => v ? (
              <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: theme.textMuted, minWidth: 120 }}>{k}</span>
                <span style={{ color: theme.text, wordBreak: 'break-all' }}>{v}</span>
              </div>
            ) : null)}
          </div>
        </div>
      )}
    </div>
  );
}

const STR_LABELS = { pending: 'Pending', building: 'Building', done: 'Done', rejected: 'Rejected', assets_missing: 'Assets Missing' };

function StructureTab({ theme }) {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);
  const [error, setError] = useState('');
  const [draftNotes, setDraftNotes] = useState({});
  const [savedNotes, setSavedNotes] = useState({});
  const [draftDelivery, setDraftDelivery] = useState({});
  const [savedDelivery, setSavedDelivery] = useState({});

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetchStructureOrders(false);
      if (res?.orders) {
        setOrders(res.orders);
        const seeds = {}, deliverySeeds = {};
        for (const o of res.orders) {
          if (o.admin_notes) seeds[o.id] = o.admin_notes;
          if (o.delivery_info) deliverySeeds[o.id] = o.delivery_info;
        }
        setDraftNotes(prev => ({ ...seeds, ...prev }));
        setDraftDelivery(prev => ({ ...deliverySeeds, ...prev }));
      }
    } catch (e) {
      setError('Failed to load: ' + e.message);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, status) => {
    setSavingId(id);
    try {
      await updateStructureOrder(id, { status });
      setOrders(prev => prev.map(o => String(o.id) === String(id) ? { ...o, status } : o));
      if (status === 'assets_missing') {
        const order = orders.find(o => String(o.id) === String(id));
        setDraftNotes(prev => ({ ...prev, [id]: prev[id] !== undefined ? prev[id] : (order?.admin_notes || '') }));
      }
      if (status === 'done') {
        const order = orders.find(o => String(o.id) === String(id));
        setDraftDelivery(prev => ({ ...prev, [id]: prev[id] !== undefined ? prev[id] : (order?.delivery_info || '') }));
      }
    } catch (e) { alert(e.message); } finally { setSavingId(null); }
  };

  const saveDelivery = async (id) => {
    const text = draftDelivery[id] || '';
    try {
      await updateStructureOrder(id, { delivery_info: text });
      setOrders(prev => prev.map(o => String(o.id) === String(id) ? { ...o, delivery_info: text } : o));
      setSavedDelivery(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setSavedDelivery(prev => ({ ...prev, [id]: false })), 2500);
    } catch (e) { alert('Failed to save delivery info: ' + e.message); }
  };

  const saveNote = async (id) => {
    const text = draftNotes[id] || '';
    try {
      await updateStructureOrder(id, { admin_notes: text });
      setOrders(prev => prev.map(o => String(o.id) === String(id) ? { ...o, admin_notes: text } : o));
      setSavedNotes(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setSavedNotes(prev => ({ ...prev, [id]: false })), 2500);
    } catch (e) { alert('Failed to save note: ' + e.message); }
  };

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (o.order_code || '').toLowerCase().includes(q) || (o.user_name || '').toLowerCase().includes(q) || (o.user_email || '').toLowerCase().includes(q) || (o.name || '').toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard theme={theme} label="Total" value={orders.length} tint="#3b82f6" />
        <StatCard theme={theme} label="Pending" value={orders.filter(o => o.status === 'pending').length} tint="#f59e0b" />
        <StatCard theme={theme} label="Building" value={orders.filter(o => o.status === 'building').length} tint="#3b82f6" />
        <StatCard theme={theme} label="Done" value={orders.filter(o => o.status === 'done').length} tint="#22c55e" />
        <StatCard theme={theme} label="Rejected" value={orders.filter(o => o.status === 'rejected' || o.status === 'assets_missing').length} tint="#ef4444" />
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      <SearchFilterBar theme={theme} search={search} setSearch={setSearch} placeholder="Search by code, customer, structure name…"
        filters={[['all', 'All'], ['pending', 'Pending'], ['building', 'Building'], ['done', 'Done'], ['rejected', 'Rejected'], ['assets_missing', 'Assets Missing']].map(([value, label]) => ({ value, label }))}
        filterValue={filter} setFilterValue={setFilter} onRefresh={load} loading={loading} />

      <GlassCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
            <thead>
              <tr>
                {['Order Code', 'Customer', 'Structure', 'Assets', 'Price', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '13px 20px', fontSize: 10.5, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>Loading structure orders…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>No structure orders yet</td></tr>}
              {!loading && filtered.map((o, i, arr) => {
                const last = i === arr.length - 1;
                const isMissing = o.status === 'assets_missing';
                const isDone = o.status === 'done';
                const noteSaved = savedNotes[o.id];
                const noteText = draftNotes[o.id] !== undefined ? draftNotes[o.id] : (o.admin_notes || '');
                const deliveryText = draftDelivery[o.id] !== undefined ? draftDelivery[o.id] : (o.delivery_info || '');
                const deliverySaved = savedDelivery[o.id];
                const cellStyle = { padding: '14px 20px', whiteSpace: 'nowrap', fontSize: 13, color: theme.text, verticalAlign: 'top' };
                return (
                  <Fragment key={o.id}>
                    <tr style={{ borderBottom: (last && !isDone && !isMissing) ? 'none' : `1px solid ${theme.border}` }}>
                      <td style={cellStyle}>
                        <div style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700 }}>{o.order_code}</div>
                        <div style={{ fontSize: 10.5, color: theme.textFaint, marginTop: 2 }}>{o.submitted_at ? new Date(o.submitted_at).toLocaleDateString() : '—'}</div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ fontWeight: 700 }}>{o.user_name || 'Unknown'}</div>
                        <div style={{ fontSize: 11, color: theme.textFaint }}>{o.user_email || ''}</div>
                      </td>
                      <td style={{ ...cellStyle, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.name || 'Untitled'}</td>
                      <td style={{ ...cellStyle, fontSize: 11.5, color: theme.textMuted }}>{o.node_count || 0} nodes<br />{o.edge_count || 0} edges</td>
                      <td style={{ ...cellStyle, fontWeight: 800, color: BRAND }}>${Number(o.total_price || 0).toFixed(2)}</td>
                      <td style={cellStyle}>
                        <ThemedSelect theme={theme} value={o.status || 'pending'} disabled={savingId === o.id} onChange={(v) => changeStatus(o.id, v)}
                          options={[{ value: 'pending', label: 'Pending' }, { value: 'building', label: 'Building' }, { value: 'done', label: 'Done' }, { value: 'rejected', label: 'Rejected' }, { value: 'assets_missing', label: 'Assets Missing' }]} />
                      </td>
                      <td style={cellStyle}>
                        <button onClick={() => setPreviewOrder(o)} style={{ height: 34, padding: '0 14px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                    {(isDone || isMissing) && (
                      <tr style={{ borderBottom: last ? 'none' : `1px solid ${theme.border}` }}>
                        <td colSpan={7} style={{ padding: '0 20px 18px' }}>
                          {isDone && (
                            <div style={{ borderRadius: 14, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)', padding: 16 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <CheckCircle size={14} color="#22c55e" />
                                <span style={{ fontSize: 12.5, fontWeight: 800, color: '#22c55e' }}>Delivery Info — visible to the client when they check their order</span>
                              </div>
                              <textarea
                                value={deliveryText}
                                onChange={e => setDraftDelivery(prev => ({ ...prev, [o.id]: e.target.value }))}
                                placeholder={'Paste links, credentials, or instructions for the client.\n\nExample:\nBM Invite: https://business.facebook.com/...\nNote: Accept the invite within 48h.'}
                                rows={4}
                                style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12.5, fontFamily: 'monospace', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
                                {deliverySaved ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#22c55e', fontWeight: 700 }}><CheckCheck size={13} /> Saved — client can now view this</span>
                                ) : o.delivery_info ? (
                                  <span style={{ fontSize: 11.5, color: theme.textFaint }}>Saved: {o.delivery_info.slice(0, 60)}{o.delivery_info.length > 60 ? '…' : ''}</span>
                                ) : (
                                  <span style={{ fontSize: 11.5, color: theme.textFaint }}>No delivery info saved yet</span>
                                )}
                                <button onClick={() => saveDelivery(o.id)} disabled={!deliveryText.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, border: 'none', background: deliveryText.trim() ? `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})` : theme.surfaceSunken, color: deliveryText.trim() ? '#fff' : theme.textFaint, fontSize: 12, fontWeight: 700, cursor: deliveryText.trim() ? 'pointer' : 'not-allowed', fontFamily: FONT }}>
                                  <Save size={12} /> Save & Send to Client
                                </button>
                              </div>
                            </div>
                          )}
                          {isMissing && (
                            <div style={{ borderRadius: 14, border: '1px solid rgba(236,72,153,0.35)', background: 'rgba(236,72,153,0.06)', padding: 16 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <AlertTriangle size={14} color="#ec4899" />
                                <span style={{ fontSize: 12.5, fontWeight: 800, color: '#ec4899' }}>Missing Assets — describe what the user needs to provide</span>
                              </div>
                              <textarea
                                value={noteText}
                                onChange={e => setDraftNotes(prev => ({ ...prev, [o.id]: e.target.value }))}
                                placeholder="e.g. Profile x3, BM Verified x1, Advertiser Account x2…"
                                rows={3}
                                style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12.5, fontFamily: FONT, resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
                                {noteSaved ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#22c55e', fontWeight: 700 }}><CheckCheck size={13} /> Note saved — user will see this</span>
                                ) : o.admin_notes ? (
                                  <span style={{ fontSize: 11.5, color: theme.textFaint }}>Last saved: {o.admin_notes.slice(0, 60)}{o.admin_notes.length > 60 ? '…' : ''}</span>
                                ) : <span />}
                                <button onClick={() => saveNote(o.id)} disabled={!noteText.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, border: 'none', background: noteText.trim() ? '#ec4899' : theme.surfaceSunken, color: noteText.trim() ? '#fff' : theme.textFaint, fontSize: 12, fontWeight: 700, cursor: noteText.trim() ? 'pointer' : 'not-allowed', fontFamily: FONT }}>
                                  <Save size={12} /> Save Note
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <StructurePreviewModal isOpen={!!previewOrder} onClose={() => setPreviewOrder(null)} order={previewOrder} />
    </div>
  );
}

function TabNav({ theme, tab, setTab, counts }) {
  const tabs = [
    { key: 'preverified', label: 'Pre-Verified Accounts', Icon: ShoppingBag },
    { key: 'agency', label: 'Agency Ad Accounts', Icon: Building2 },
    { key: 'structure', label: 'Structure Building', Icon: Layers },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: 5, borderRadius: 14, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, width: 'fit-content' }}>
      {tabs.map(t => {
        const active = t.key === tab;
        const { Icon } = t;
        return (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 700, background: active ? theme.surface : 'transparent', color: active ? theme.text : theme.textMuted, boxShadow: active ? theme.shadow : 'none', transition: 'all .15s' }}>
            <Icon size={15} />{t.label}
            {counts[t.key] > 0 && (
              <span style={{ fontSize: 10.5, fontWeight: 800, color: active ? BRAND : theme.textFaint, background: active ? 'rgba(255,45,85,0.12)' : theme.surfaceSunken, borderRadius: 100, padding: '2px 8px' }}>{counts[t.key]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function AdminAllOrdersPage() {
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');
  const [store] = useStore();
  const [tab, setTab] = useState('structure');

  const counts = {
    preverified: (store.orders || []).length,
    agency: (store.adAccountRequests || []).length,
    structure: (store.structureOrders || []).length,
  };

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Orders</h1>
      <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Manage all order types from one place.</p>

      <div style={{ marginTop: 22 }}>
        <TabNav theme={theme} tab={tab} setTab={setTab} counts={counts} />
      </div>

      <div style={{ marginTop: 22 }}>
        {tab === 'preverified' && <PreVerifiedTab theme={theme} />}
        {tab === 'agency' && <AgencyTab theme={theme} />}
        {tab === 'structure' && <StructureTab theme={theme} />}
      </div>
    </div>
  );
}
