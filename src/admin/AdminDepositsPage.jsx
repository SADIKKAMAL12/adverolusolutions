import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../shared/ThemeContext.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import { Wallet, ShieldCheck, FileText, Box, Search, RotateCw, Upload, AlertTriangle, ImageIcon, ChevronLeft } from 'lucide-react';

async function apiGet(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString();
  const res = await fetch(`/api/crud?${qs}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { console.error('Non-JSON:', text.slice(0, 200)); return []; }
}
async function apiPut(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

function fmtMoney(n) {
  return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_MAP = {
  completed: { bg: 'rgba(34,197,94,0.14)', color: '#22c55e', label: 'Completed' },
  pending: { bg: 'rgba(245,158,11,0.14)', color: '#f59e0b', label: 'Pending' },
  rejected: { bg: 'rgba(239,68,68,0.14)', color: '#ef4444', label: 'Rejected' },
};
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: s.color, background: s.bg, padding: '5px 11px', borderRadius: 100, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.color }} />
      {s.label}
    </span>
  );
}

const METHOD_PALETTE = ['#3b82f6', '#f59e0b', '#f97316', '#22c55e', '#10b981', '#a855f7', '#ec4899', '#06b6d4'];
function methodColor(method) {
  let h = 0;
  const s = method || '?';
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % METHOD_PALETTE.length;
  return METHOD_PALETTE[h];
}
function MethodChip({ theme, method }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: theme.text }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: methodColor(method), flexShrink: 0 }} />
      {method || '—'}
    </span>
  );
}

function ProofThumb({ theme, proof, onOpen }) {
  if (!proof) return <span style={{ fontSize: 12, color: theme.textFaint }}>—</span>;
  const isImage = proof.startsWith('data:image');
  return (
    <button onClick={() => isImage && onOpen(proof)} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 34, padding: '0 12px 0 8px', borderRadius: 10, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, cursor: isImage ? 'pointer' : 'default', fontFamily: FONT }} title={isImage ? 'View proof' : proof}>
      <span style={{ width: 22, height: 22, borderRadius: 6, background: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', display: 'grid', placeItems: 'center', color: theme.textMuted, flexShrink: 0, overflow: 'hidden' }}>
        {isImage ? <img src={proof} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={13} />}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted }}>{isImage ? 'View proof' : proof}</span>
    </button>
  );
}

function StatCard({ theme, icon, label, value, tint }) {
  return (
    <GlassCard theme={theme} style={{ padding: 20 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${tint}22`, color: tint, display: 'grid', placeItems: 'center' }}>{icon}</div>
      <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 600, color: theme.textMuted }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, color: theme.text, letterSpacing: '-0.01em' }}>{value}</div>
    </GlassCard>
  );
}

function ThemedSelect({ theme, value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{
      height: 44, padding: '0 34px 0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken,
      color: theme.text, fontSize: 13.5, fontWeight: 600, fontFamily: FONT, appearance: 'none', WebkitAppearance: 'none',
      backgroundImage: theme.mode === 'dark'
        ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%239d9da6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
        : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%236b6b72' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer',
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function PendingBanner({ theme, count }) {
  if (!count) return null;
  return (
    <GlassCard theme={theme} glow style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.14)', color: '#f59e0b', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <AlertTriangle size={20} strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>{count} Deposit{count > 1 ? 's' : ''} Pending Review</div>
        <div style={{ fontSize: 12.5, color: theme.textMuted, marginTop: 2 }}>Review and approve or reject the deposits below.</div>
      </div>
    </GlassCard>
  );
}

function Pagination({ theme, page, setPage, totalPages, total, pageSize }) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ fontSize: 12.5, color: theme.textFaint }}>{total} deposits · Showing {start}–{end}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, display: 'grid', placeItems: 'center', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map(p => (
          <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: 9, border: p === page ? '1px solid transparent' : `1px solid ${theme.border}`, background: p === page ? `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})` : theme.surfaceSunken, color: p === page ? '#fff' : theme.text, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>{p}</button>
        ))}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, display: 'grid', placeItems: 'center', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, transform: 'rotate(180deg)' }}>
          <ChevronLeft size={14} />
        </button>
      </div>
    </div>
  );
}

export function AdminDepositsPage({ deposits, setStore, addBalance }) {
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');

  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [proofModal, setProofModal] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const depositList = deposits || [];

  const filtered = depositList.filter(d => {
    const matchesSearch = !search || d.id?.toLowerCase().includes(search.toLowerCase()) || (d.user_email || d.user || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pending = depositList.filter(d => d.status === 'pending');

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('deposits', { order: 'created_at', ascending: 'false' });
      if (data && data.length > 0) setStore(s => ({ ...s, deposits: data }));
    } catch (err) {
      console.error('Deposits refetch error:', err);
    } finally { setLoading(false); }
  }, [setStore]);

  useEffect(() => { refetch(); }, [refetch]);

  const approve = async (id) => {
    const dep = depositList.find(d => d.id === id);
    if (!dep || !dep.user_id) return;
    setLoadingId(id); setError('');
    try {
      const res = await fetch('/api/admin/deposits/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ depositId: id, userId: dep.user_id, amount: dep.amount }) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Approval failed');
      addBalance(dep.amount);
      setStore(s => ({ ...s, deposits: s.deposits.map(d => d.id === id ? { ...d, status: 'completed' } : d) }));
    } catch (err) {
      setError('Approval failed: ' + err.message);
    } finally { setLoadingId(null); }
  };

  const reject = async (id) => {
    setLoadingId(id); setError('');
    try {
      await apiPut('deposits', { id, status: 'rejected' });
      setStore(s => ({ ...s, deposits: s.deposits.map(d => d.id === id ? { ...d, status: 'rejected' } : d) }));
    } catch (err) {
      setError('Rejection failed: ' + err.message);
    } finally { setLoadingId(null); }
  };

  const STATS = [
    { icon: <Wallet size={17} strokeWidth={1.8} />, label: 'Total Deposits', value: `$${depositList.reduce((a, d) => a + (d.amount || 0), 0).toLocaleString()}`, tint: '#3b82f6' },
    { icon: <ShieldCheck size={17} strokeWidth={1.8} />, label: 'Approved', value: `$${depositList.filter(d => d.status === 'completed').reduce((a, d) => a + (d.amount || 0), 0).toLocaleString()}`, tint: '#22c55e' },
    { icon: <FileText size={17} strokeWidth={1.8} />, label: 'Pending', value: `$${pending.reduce((a, d) => a + (d.amount || 0), 0).toLocaleString()}`, tint: '#f59e0b' },
    { icon: <Box size={17} strokeWidth={1.8} />, label: 'Rejected', value: `$${depositList.filter(d => d.status === 'rejected').reduce((a, d) => a + (d.amount || 0), 0).toLocaleString()}`, tint: '#ef4444' },
  ];

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Deposits</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Review and approve user deposit requests.</p>
        </div>
        <button style={{ height: 44, padding: '0 18px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Upload size={14} /> Export
        </button>
      </div>

      <div style={{ marginTop: 26 }}>
        <PendingBanner theme={theme} count={pending.length} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STATS.map(s => <StatCard key={s.label} theme={theme} {...s} />)}
      </div>

      <div style={{ marginTop: 22 }}>
        <GlassCard theme={theme} style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 10, height: 42, padding: '0 14px', borderRadius: 12, background: theme.surfaceSunken, border: `1px solid ${theme.border}` }}>
            <Search size={15} style={{ color: theme.textFaint }} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search deposits…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13.5, color: theme.text, fontFamily: FONT }} />
          </div>
          <ThemedSelect theme={theme} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={[{ value: 'all', label: 'All Status' }, { value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }, { value: 'rejected', label: 'Rejected' }]} />
          <button onClick={refetch} disabled={loading} style={{ height: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12.5, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
            <RotateCw size={14} /> {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </GlassCard>

        <GlassCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
              <thead>
                <tr>
                  {['Deposit ID', 'User', 'Method', 'Amount', 'Status', 'Proof', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '13px 20px', fontSize: 10.5, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>Loading deposits…</td></tr>}
                {!loading && paged.map((d, i, arr) => {
                  const last = i === arr.length - 1;
                  const cellStyle = { padding: '14px 20px', borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap', fontSize: 13, color: theme.text };
                  return (
                    <tr key={d.id}>
                      <td style={{ ...cellStyle, fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: BRAND }}>{d.id}</td>
                      <td style={cellStyle}>{d.user_email || d.user || '—'}</td>
                      <td style={cellStyle}><MethodChip theme={theme} method={d.method} /></td>
                      <td style={{ ...cellStyle, fontWeight: 800 }}>{fmtMoney(d.amount)}</td>
                      <td style={cellStyle}><StatusBadge status={d.status} /></td>
                      <td style={cellStyle}><ProofThumb theme={theme} proof={d.proof} onOpen={setProofModal} /></td>
                      <td style={{ ...cellStyle, color: theme.textMuted, fontSize: 12 }}>{d.date || '—'}</td>
                      <td style={cellStyle}>
                        {d.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => approve(d.id)} disabled={loadingId === d.id} style={{ height: 32, padding: '0 12px', borderRadius: 9, border: 'none', background: '#22c55e', color: '#fff', fontSize: 12, fontWeight: 700, cursor: loadingId === d.id ? 'default' : 'pointer', fontFamily: FONT, opacity: loadingId === d.id ? 0.6 : 1 }}>
                              {loadingId === d.id ? '…' : '✓ Approve'}
                            </button>
                            <button onClick={() => reject(d.id)} disabled={loadingId === d.id} style={{ height: 32, padding: '0 12px', borderRadius: 9, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, cursor: loadingId === d.id ? 'default' : 'pointer', fontFamily: FONT, opacity: loadingId === d.id ? 0.6 : 1 }}>
                              ✕ Reject
                            </button>
                          </div>
                        ) : <StatusBadge status={d.status} />}
                      </td>
                    </tr>
                  );
                })}
                {!loading && paged.length === 0 && <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>No deposits match your filters.</td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{ borderTop: `1px solid ${theme.border}` }}>
            <Pagination theme={theme} page={page} setPage={setPage} totalPages={totalPages} total={filtered.length} pageSize={pageSize} />
          </div>
        </GlassCard>
      </div>

      {proofModal && (
        <div onClick={() => setProofModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <button onClick={() => setProofModal(null)} style={{ position: 'absolute', top: -14, right: -14, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.3)', zIndex: 1 }}>✕</button>
            <img src={proofModal} alt="Proof of payment" style={{ maxWidth: '88vw', maxHeight: '88vh', borderRadius: 12, objectFit: 'contain', display: 'block' }} />
          </div>
        </div>
      )}
    </div>
  );
}
