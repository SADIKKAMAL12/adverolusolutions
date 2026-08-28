import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../shared/ThemeContext.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import {
  Users, ShieldCheck, Settings, Package, Search, RotateCw, Upload,
  MoreHorizontal, Eye, Pencil, Ban, Phone, ChevronDown,
} from 'lucide-react';
import { AdminUserInfoPage } from './AdminUserInfoPage.jsx';

async function apiGet(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString();
  const res = await fetch(`/api/crud?${qs}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { console.error('Non-JSON:', text.slice(0, 200)); return []; }
}

async function apiPut(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

const AVATAR_PALETTE = ['#ff2d55', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899', '#84cc16'];
function avatarColor(seed) {
  let h = 0;
  const s = seed || '?';
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[h];
}

const STATUS_MAP = {
  active:    { bg: 'rgba(34,197,94,0.14)', color: '#22c55e', label: 'Active' },
  pending:   { bg: 'rgba(245,158,11,0.14)', color: '#f59e0b', label: 'Pending' },
  suspended: { bg: 'rgba(239,68,68,0.14)', color: '#ef4444', label: 'Suspended' },
  banned:    { bg: 'rgba(239,68,68,0.14)', color: '#ef4444', label: 'Banned' },
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
function RoleBadge({ role, theme }) {
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, color: theme.textMuted, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, padding: '5px 11px', borderRadius: 100, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
      {role || 'user'}
    </span>
  );
}

function StatCard({ theme, icon, label, value, tint }) {
  return (
    <GlassCard theme={theme} style={{ padding: 20 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${tint}22`, color: tint, display: 'grid', placeItems: 'center' }}>{icon}</div>
      <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 600, color: theme.textMuted }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 26, fontWeight: 800, color: theme.text, letterSpacing: '-0.01em' }}>{value}</div>
    </GlassCard>
  );
}

function ThemedSelect({ theme, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: 44, padding: '0 34px 0 14px', borderRadius: 12,
        border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text,
        fontSize: 13.5, fontWeight: 600, fontFamily: FONT, appearance: 'none', WebkitAppearance: 'none',
        backgroundImage: theme.mode === 'dark'
          ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%239d9da6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
          : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%236b6b72' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer',
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function ThemedInput({ theme, label, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, fontFamily: FONT }}>{label}</label>}
      <input
        {...rest}
        style={{ height: 42, padding: '0 14px', borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontFamily: FONT, outline: 'none' }}
      />
    </div>
  );
}

function ThemedModal({ theme, title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: theme.surface, borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: theme.shadowLg, border: `1px solid ${theme.border}`, fontFamily: FONT }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: theme.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textFaint, fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

function RowActions({ theme, user, onView, onEdit, onToggleSuspend, busy }) {
  const [open, setOpen] = useState(false);
  const isSuspended = user.status === 'suspended' || user.status === 'banned';

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: 34, height: 34, borderRadius: 10, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, display: 'grid', placeItems: 'center', cursor: 'pointer', color: theme.textMuted }}
      >
        <MoreHorizontal size={17} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
          <div style={{ position: 'absolute', top: 40, right: 0, width: 170, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 6, boxShadow: theme.shadowLg, zIndex: 10 }}>
            <button onClick={() => { setOpen(false); onView(user); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, textAlign: 'left', padding: '9px 10px', borderRadius: 9, background: 'transparent', border: 'none', color: theme.text, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>
              <Eye size={14} /> View info
            </button>
            <button onClick={() => { setOpen(false); onEdit(user); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, textAlign: 'left', padding: '9px 10px', borderRadius: 9, background: 'transparent', border: 'none', color: theme.text, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>
              <Pencil size={14} /> Edit user
            </button>
            <div style={{ height: 1, background: theme.border, margin: '4px 6px' }} />
            <button onClick={() => { setOpen(false); onToggleSuspend(user); }} disabled={busy} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, textAlign: 'left', padding: '9px 10px', borderRadius: 9, background: 'transparent', border: 'none', color: '#ef4444', fontSize: 13, cursor: busy ? 'default' : 'pointer', fontFamily: FONT, opacity: busy ? 0.5 : 1 }}>
              <Ban size={14} /> {busy ? '…' : isSuspended ? 'Unsuspend' : 'Suspend'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function UsersTable({ theme, users, onView, onEdit, onToggleSuspend, suspendingId }) {
  return (
    <GlassCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
          <thead>
            <tr>
              {['User', 'Phone', 'Balance', 'Role', 'Status', 'Joined', ''].map((h, i) => (
                <th key={h + i} style={{ textAlign: i === 6 ? 'right' : 'left', padding: '14px 22px', fontSize: 11, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const initials = u.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
              const color = avatarColor(u.name || u.email);
              const last = i === users.length - 1;
              const joined = u.joined || (u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
              return (
                <tr key={u.id}>
                  <td style={{ padding: '14px 22px', borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ position: 'relative', width: 38, height: 38, flexShrink: 0 }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: 999, background: `${color}26`, color, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>{initials}</div>
                        {u.status === 'active' && (
                          <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: 999, background: '#22c55e', border: `2px solid ${theme.surface}` }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>{u.name}</div>
                        <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 1 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>
                    {u.phone ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: theme.textMuted, fontFamily: 'monospace' }}>
                        <Phone size={13} style={{ color: theme.textFaint }} />
                        {u.phone}
                      </span>
                    ) : <span style={{ fontSize: 13, color: theme.textFaint }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: (u.balance || 0) > 0 ? theme.text : theme.textFaint }}>${(u.balance || 0).toFixed(2)}</span>
                  </td>
                  <td style={{ padding: '14px 22px', borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}><RoleBadge role={u.role} theme={theme} /></td>
                  <td style={{ padding: '14px 22px', borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}><StatusBadge status={u.status} /></td>
                  <td style={{ padding: '14px 22px', borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap', fontSize: 12.5, color: theme.textMuted }}>{joined}</td>
                  <td style={{ padding: '14px 22px', borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>
                    <RowActions theme={theme} user={u} onView={onView} onEdit={onEdit} onToggleSuspend={onToggleSuspend} busy={suspendingId === u.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <div style={{ padding: 32, textAlign: 'center', fontSize: 13.5, color: theme.textFaint }}>No users match your filters.</div>}
    </GlassCard>
  );
}

export function AdminUsersPage({ users, orders = [], deposits = [], transactions = [], adAccountRequests = [], inventoryLines = [], inventoryProducts = [], structureOrders = [], paymentMethods = [], setStore }) {
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const theme = getAdminTheme(isDark);

  const [editUser, setEditUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [error, setError] = useState('');
  const [suspendingId, setSuspendingId] = useState(null);

  const userList = users || [];
  const filteredUsers = userList.filter(u => {
    const matchesSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('users', { order: 'created_at', ascending: 'false' });
      if (data && data.length > 0) setStore(s => ({ ...s, users: data }));
    } catch (err) {
      console.error('Users refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setStore]);

  useEffect(() => { refetch(); }, [refetch]);

  const toggleSuspend = async (user) => {
    const isSuspended = user.status === 'suspended';
    const newStatus = isSuspended ? 'active' : 'suspended';
    setSuspendingId(user.id);
    setError('');
    try {
      await apiPut('users', { id: user.id, status: newStatus });
      setStore(s => ({ ...s, users: s.users.map(u => u.id === user.id ? { ...u, status: newStatus } : u) }));
    } catch (err) {
      setError(`${isSuspended ? 'Unsuspend' : 'Suspend'} failed: ` + err.message);
    } finally {
      setSuspendingId(null);
    }
  };

  const saveUser = async (updated) => {
    setSaving(true);
    setError('');
    try {
      await apiPut('users', {
        id: updated.id, name: updated.name, email: updated.email,
        phone: updated.phone || null, balance: updated.balance,
        status: updated.status, role: updated.role || 'user',
      });
      setStore(s => ({ ...s, users: s.users.map(u => u.id === updated.id ? updated : u) }));
      setEditUser(null);
    } catch (err) {
      setError('Failed to update user: ' + err.message);
      console.error('Save user error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (selectedUser) {
    return (
      <AdminUserInfoPage
        user={selectedUser}
        orders={orders}
        deposits={deposits}
        transactions={transactions}
        adAccountRequests={adAccountRequests}
        inventoryLines={inventoryLines}
        inventoryProducts={inventoryProducts}
        structureOrders={structureOrders}
        paymentMethods={paymentMethods}
        onUpdateUser={(updated) => {
          setSelectedUser(updated);
          setStore(s => ({ ...s, users: s.users.map(u => u.id === updated.id ? updated : u) }));
        }}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  const STATS = [
    { icon: <Users size={17} strokeWidth={1.8} />, label: 'Total Users', value: userList.length, tint: '#3b82f6' },
    { icon: <ShieldCheck size={17} strokeWidth={1.8} />, label: 'Active', value: userList.filter(u => u.status === 'active').length, tint: '#22c55e' },
    { icon: <Settings size={17} strokeWidth={1.8} />, label: 'Admins', value: userList.filter(u => u.role === 'admin').length, tint: '#a855f7' },
    { icon: <Package size={17} strokeWidth={1.8} />, label: 'Advertisers', value: userList.filter(u => u.role === 'advertiser').length, tint: '#f59e0b' },
  ];

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, marginBottom: 16, fontSize: 13, fontFamily: FONT }}>{error}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Users</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Manage all platform users.</p>
        </div>
        <button style={{ height: 42, padding: '0 18px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Upload size={14} /> Export
        </button>
      </div>

      <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STATS.map(s => <StatCard key={s.label} theme={theme} {...s} />)}
      </div>

      <div style={{ marginTop: 26 }}>
        <GlassCard theme={theme} style={{ padding: 18, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 14px', borderRadius: 12, background: theme.surfaceSunken, border: `1px solid ${theme.border}` }}>
            <Search size={15} style={{ color: theme.textFaint }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13.5, color: theme.text, fontFamily: FONT }}
            />
          </div>
          <ThemedSelect
            theme={theme} value={statusFilter} onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'banned', label: 'Banned' },
            ]}
          />
          <ThemedSelect
            theme={theme} value={roleFilter} onChange={setRoleFilter}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
              { value: 'advertiser', label: 'Advertiser' },
              { value: 'finance', label: 'Finance' },
            ]}
          />
          <button onClick={refetch} disabled={loading} style={{ height: 44, padding: '0 18px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
            <RotateCw size={14} /> {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </GlassCard>
      </div>

      <div style={{ marginTop: 20 }}>
        <UsersTable theme={theme} users={filteredUsers} onView={setSelectedUser} onEdit={setEditUser} onToggleSuspend={toggleSuspend} suspendingId={suspendingId} />
      </div>

      {editUser && (
        <ThemedModal theme={theme} title="Edit User" onClose={() => setEditUser(null)}>
          <ThemedInput theme={theme} label="Name" value={editUser.name || ''} onChange={e => setEditUser(u => ({ ...u, name: e.target.value }))} />
          <ThemedInput theme={theme} label="Email" value={editUser.email || ''} onChange={e => setEditUser(u => ({ ...u, email: e.target.value }))} />
          <ThemedInput theme={theme} label="WhatsApp Phone" placeholder="+1234567890" value={editUser.phone || ''} onChange={e => setEditUser(u => ({ ...u, phone: e.target.value }))} />
          <ThemedInput theme={theme} label="Balance" type="number" value={editUser.balance || 0} onChange={e => setEditUser(u => ({ ...u, balance: Number(e.target.value) }))} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, fontFamily: FONT, display: 'block', marginBottom: 6 }}>Role</label>
            <ThemedSelect theme={theme} value={editUser.role || 'user'} onChange={v => setEditUser(u => ({ ...u, role: v }))} options={['admin', 'advertiser', 'finance', 'user'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, fontFamily: FONT, display: 'block', marginBottom: 6 }}>Status</label>
            <ThemedSelect theme={theme} value={editUser.status || 'active'} onChange={v => setEditUser(u => ({ ...u, status: v }))} options={['active', 'suspended', 'banned', 'pending'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={() => setEditUser(null)} style={{ flex: 1, height: 42, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
            <button onClick={() => saveUser(editUser)} disabled={saving} style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: FONT, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </ThemedModal>
      )}
    </div>
  );
}
