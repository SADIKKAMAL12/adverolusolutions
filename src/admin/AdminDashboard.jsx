import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '../shared/Router.jsx';
import { useTheme } from '../shared/ThemeContext.jsx';
import { isSupabaseReady } from '../lib/supabase.js';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import {
  Users, DollarSign, ArrowDownToLine, ShoppingBag, Ticket,
  ChevronRight, ChevronDown, AlertTriangle, UserPlus, Wallet, ShieldCheck,
} from 'lucide-react';

const DATE_PRESETS = [
  { key: 'today',     label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week',      label: 'This week' },
  { key: 'lastWeek',  label: 'Last week' },
  { key: 'month',     label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'all',       label: 'All time' },
];

const toISODate = (d) => {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
};

function computeRange(key) {
  const now = new Date();
  if (key === 'today') return { from: toISODate(now), to: toISODate(now) };
  if (key === 'yesterday') {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return { from: toISODate(y), to: toISODate(y) };
  }
  if (key === 'week') {
    const s = new Date(now); s.setDate(s.getDate() - s.getDay());
    return { from: toISODate(s), to: toISODate(now) };
  }
  if (key === 'lastWeek') {
    const s = new Date(now); s.setDate(s.getDate() - s.getDay() - 7);
    const e = new Date(s); e.setDate(e.getDate() + 6);
    return { from: toISODate(s), to: toISODate(e) };
  }
  if (key === 'month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: toISODate(s), to: toISODate(now) };
  }
  if (key === 'lastMonth') {
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: toISODate(s), to: toISODate(e) };
  }
  return { from: null, to: null }; // all time
}

const STATUS_MAP = {
  completed: { bg: 'rgba(34,197,94,0.14)', color: '#22c55e' },
  done:      { bg: 'rgba(34,197,94,0.14)', color: '#22c55e' },
  approved:  { bg: 'rgba(34,197,94,0.14)', color: '#22c55e' },
  active:    { bg: 'rgba(34,197,94,0.14)', color: '#22c55e' },
  processing:{ bg: 'rgba(59,130,246,0.14)', color: '#3b82f6' },
  building:  { bg: 'rgba(59,130,246,0.14)', color: '#3b82f6' },
  pending:   { bg: 'rgba(245,158,11,0.14)', color: '#f59e0b' },
  refunded:  { bg: 'rgba(168,85,247,0.14)', color: '#a855f7' },
  rejected:  { bg: 'rgba(239,68,68,0.14)', color: '#ef4444' },
  cancelled: { bg: 'rgba(239,68,68,0.14)', color: '#ef4444' },
  banned:    { bg: 'rgba(239,68,68,0.14)', color: '#ef4444' },
};
function StatusBadge({ status }) {
  const key = String(status || 'pending').toLowerCase();
  const s = STATUS_MAP[key] || STATUS_MAP.pending;
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';
  return <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '4px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>{label}</span>;
}

function KpiCard({ theme, icon, label, value, tint }) {
  return (
    <GlassCard theme={theme} style={{ padding: 20 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${tint}22`, color: tint, display: 'grid', placeItems: 'center' }}>{icon}</div>
      <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 600, color: theme.textMuted, fontFamily: FONT }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 26, fontWeight: 800, color: theme.text, letterSpacing: '-0.01em', fontFamily: FONT }}>{value}</div>
    </GlassCard>
  );
}

function DateRangeFilter({ theme, preset, range, onPreset, onCustom }) {
  const [customFrom, setCustomFrom] = useState(range.from || '');
  const [customTo, setCustomTo] = useState(range.to || '');

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {DATE_PRESETS.map(p => {
          const active = p.key === preset;
          return (
            <button
              key={p.key}
              onClick={() => onPreset(p.key)}
              style={{
                padding: '9px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, fontFamily: FONT,
                border: active ? '1px solid transparent' : `1px solid ${theme.border}`,
                cursor: 'pointer',
                background: active ? `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})` : theme.surfaceSunken,
                color: active ? '#fff' : theme.textMuted,
                boxShadow: active ? '0 8px 18px -8px rgba(255,45,85,0.5)' : 'none',
                transition: 'all .15s',
              }}
            >{p.label}</button>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
          style={{ height: 42, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontFamily: FONT }} />
        <span style={{ color: theme.textFaint, fontSize: 13 }}>–</span>
        <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
          style={{ height: 42, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13.5, fontFamily: FONT }} />
        <button
          onClick={() => customFrom && customTo && onCustom(customFrom, customTo)}
          disabled={!customFrom || !customTo}
          style={{ height: 42, padding: '0 22px', borderRadius: 12, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: customFrom && customTo ? 'pointer' : 'not-allowed', fontFamily: FONT, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.5)', opacity: customFrom && customTo ? 1 : 0.5 }}
        >Apply</button>
      </div>
    </div>
  );
}

export default function AdminDashboard({ users, orders, deposits }) {
  const navigate = useNavigate();
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const theme = getAdminTheme(isDark);

  const userList = users || [];
  const orderList = orders || [];
  const depositList = deposits || [];
  const pendingDeposits = depositList.filter(d => d.status === 'pending').length;
  const totalBalance = userList.reduce((a, u) => a + (u.balance || 0), 0);

  const [apiStats, setApiStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preset, setPreset] = useState('week');
  const [range, setRange] = useState(() => computeRange('week'));
  const [chartOpen, setChartOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('This Week');

  const applyPreset = (key) => { setPreset(key); setRange(computeRange(key)); };
  const applyCustom = (from, to) => { setPreset('custom'); setRange({ from, to }); };

  const fetchStats = useCallback(async () => {
    if (!isSupabaseReady()) return;
    setStatsLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams();
      if (range.from) qs.set('from', range.from);
      if (range.to)   qs.set('to', range.to);
      const res = await fetch(`/api/admin/stats?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApiStats(data);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Stats error: ' + err.message);
    } finally {
      setStatsLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const stats = apiStats || {
    users: userList.length,
    orders: orderList.length,
    deposits: depositList.length,
    tickets: 0,
    totalBalance,
    revenue: 0,
    depositsTotal: 0,
  };

  const KPI_ROW_1 = [
    { icon: <Users size={17} strokeWidth={1.8} />, label: 'Total Users', value: statsLoading ? '…' : stats.users, tint: '#3b82f6' },
    { icon: <DollarSign size={17} strokeWidth={1.8} />, label: 'Revenue (period)', value: statsLoading ? '…' : `$${(stats.revenue || 0).toLocaleString()}`, tint: '#22c55e' },
    { icon: <ArrowDownToLine size={17} strokeWidth={1.8} />, label: 'Deposits (period)', value: statsLoading ? '…' : `$${(stats.depositsTotal || 0).toLocaleString()}`, tint: BRAND },
    { icon: <ShoppingBag size={17} strokeWidth={1.8} />, label: 'Orders (period)', value: statsLoading ? '…' : stats.orders, tint: '#f59e0b' },
  ];
  const KPI_ROW_2 = [
    { icon: <Wallet size={17} strokeWidth={1.8} />, label: 'Total Balance (all users, now)', value: `$${(stats.totalBalance || 0).toLocaleString()}`, tint: '#22c55e' },
    { icon: <ArrowDownToLine size={17} strokeWidth={1.8} />, label: 'Deposit Count (period)', value: statsLoading ? '…' : (stats.deposits || 0), tint: BRAND },
    { icon: <ShoppingBag size={17} strokeWidth={1.8} />, label: 'Total Orders (period)', value: statsLoading ? '…' : stats.orders, tint: '#f59e0b' },
    { icon: <Ticket size={17} strokeWidth={1.8} />, label: 'Open Tickets (all time)', value: stats.tickets || 0, tint: '#a855f7' },
  ];

  const platformData = [
    ['Meta', 1245, 53.1, '#2563eb'],
    ['Google', 562, 23.9, '#f59e0b'],
    ['TikTok', 356, 15.2, '#171719'],
    ['Snapchat', 183, 7.8, '#f2c400'],
  ];
  const platformTotal = platformData.reduce((s, p) => s + p[1], 0);
  const donutR = 60, donutC = 2 * Math.PI * donutR;
  let donutAcc = 0;

  const weekBars = [60, 80, 55, 90, 75, 85, 100];
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekMax = Math.max(...weekBars);

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, marginBottom: 16, fontSize: 13, fontFamily: FONT }}>{error}</div>
      )}

      <div>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Dashboard</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Welcome back, Super Admin! Here's what's happening on your platform.</p>
      </div>

      <div style={{ marginTop: 26 }}>
        <DateRangeFilter theme={theme} preset={preset} range={range} onPreset={applyPreset} onCustom={applyCustom} />
      </div>

      <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {KPI_ROW_1.map(k => <KpiCard key={k.label} theme={theme} {...k} />)}
      </div>
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {KPI_ROW_2.map(k => <KpiCard key={k.label} theme={theme} {...k} />)}
      </div>

      {pendingDeposits > 0 && (
        <div style={{ marginTop: 22 }}>
          <GlassCard theme={theme} glow style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,45,85,0.14)', color: BRAND, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <AlertTriangle size={20} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>{pendingDeposits} Deposit{pendingDeposits > 1 ? 's' : ''} Pending Review</div>
              <div style={{ fontSize: 12.5, color: theme.textMuted, marginTop: 2 }}>Review and approve user deposit requests.</div>
            </div>
            <button
              onClick={() => navigate('/admin/deposits')}
              style={{ height: 40, padding: '0 20px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.55)' }}
            >Review <ChevronRight size={14} /></button>
          </GlassCard>
        </div>
      )}

      <div style={{ marginTop: 26, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <GlassCard theme={theme} style={{ padding: 22, flex: 1.3, minWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Overview Chart</div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setChartOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', borderRadius: 10, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                {chartPeriod} <ChevronDown size={13} style={{ color: theme.textFaint }} />
              </button>
              {chartOpen && (
                <div style={{ position: 'absolute', top: 40, right: 0, width: 150, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 5, boxShadow: theme.shadowLg, zIndex: 5 }}>
                  {['This Week', 'Last Week', 'This Month'].map(p => (
                    <button key={p} onClick={() => { setChartPeriod(p); setChartOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, background: 'transparent', border: 'none', color: theme.text, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT }}>{p}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'flex-end', gap: 14, height: 160 }}>
            {weekBars.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', maxWidth: 34, height: `${(v / weekMax) * 100}%`, borderRadius: 8, background: `linear-gradient(180deg, ${BRAND_LIGHT}, ${BRAND})`, boxShadow: isDark ? '0 0 18px -2px rgba(255,45,85,0.5)' : 'none', transition: 'height .3s' }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: theme.textFaint }}>{weekLabels[i]}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard theme={theme} style={{ padding: 22, flex: 1, minWidth: 300 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Accounts by Platform</div>
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <svg viewBox="0 0 160 160" width="150" height="150" style={{ flexShrink: 0 }}>
              <g transform="translate(80,80) rotate(-90)">
                <circle r={donutR} fill="none" stroke={theme.surfaceSunken} strokeWidth="20" />
                {platformData.map(([name, count, pct, color], i) => {
                  const frac = count / platformTotal;
                  const dash = frac * donutC;
                  const el = <circle key={name} r={donutR} fill="none" stroke={color} strokeWidth="20" strokeDasharray={`${dash} ${donutC - dash}`} strokeDashoffset={-donutAcc} strokeLinecap="butt" />;
                  donutAcc += dash;
                  return el;
                })}
              </g>
              <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill={theme.text} fontFamily={FONT}>{platformTotal.toLocaleString()}</text>
              <text x="80" y="94" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={theme.textFaint} fontFamily={FONT}>accounts</text>
            </svg>
            <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {platformData.map(([name, count, pct, color]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: color, flexShrink: 0 }} />
                  <span style={{ color: theme.text, fontWeight: 600, flex: 1 }}>{name}</span>
                  <span style={{ color: theme.text, fontWeight: 800 }}>{count.toLocaleString()}</span>
                  <span style={{ color: theme.textFaint, fontWeight: 600, minWidth: 44, textAlign: 'right' }}>({pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <GlassCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px 14px' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Latest Orders</div>
              <a onClick={() => navigate('/admin/orders')} style={{ fontSize: 12.5, fontWeight: 700, color: BRAND, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                View All <ChevronRight size={13} />
              </a>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
                <thead>
                  <tr>
                    {['Order ID', 'User', 'Type', 'Platform', 'Amount', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 22px', fontSize: 11, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.04em', borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orderList.slice(0, 4).map((o, i, arr) => (
                    <tr key={o.id}>
                      <td style={{ padding: '13px 22px', fontSize: 12.5, fontFamily: 'monospace', fontWeight: 700, color: theme.text, borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : 'none', whiteSpace: 'nowrap' }}>{o.id}</td>
                      <td style={{ padding: '13px 22px', fontSize: 13, color: theme.textMuted, borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : 'none', whiteSpace: 'nowrap' }}>{o.user_email || o.user || '—'}</td>
                      <td style={{ padding: '13px 22px', fontSize: 13, color: theme.text, fontWeight: 600, borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : 'none', whiteSpace: 'nowrap' }}>{o.product_title || o.type || 'Pre-Verified Account'}</td>
                      <td style={{ padding: '13px 22px', fontSize: 13, color: theme.text, borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : 'none', whiteSpace: 'nowrap' }}>{o.platform || '—'}</td>
                      <td style={{ padding: '13px 22px', fontSize: 13, fontWeight: 800, color: theme.text, borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : 'none', whiteSpace: 'nowrap' }}>${Number(o.amount || 0).toFixed(2)}</td>
                      <td style={{ padding: '13px 22px', borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : 'none', whiteSpace: 'nowrap' }}><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                  {orderList.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '24px 22px', textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <GlassCard theme={theme} style={{ padding: 20 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: theme.text, marginBottom: 14 }}>Platform Overview</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Active Users', userList.filter(u => u.status === 'active').length, '#22c55e'],
                ['Inactive Users', userList.filter(u => u.status !== 'active' && u.status !== 'banned' && u.status !== 'pending').length, '#9ca3af'],
                ['Banned Users', userList.filter(u => u.status === 'banned').length, '#ef4444'],
                ['Pending Users', userList.filter(u => u.status === 'pending').length, '#f59e0b'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0 }} />
                  <span style={{ color: theme.textMuted, flex: 1 }}>{label}</span>
                  <span style={{ fontWeight: 800, color: theme.text }}>{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard theme={theme} style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: theme.text }}>Recent Activity</div>
              <a onClick={() => navigate('/admin/users')} style={{ fontSize: 12, fontWeight: 700, color: BRAND, textDecoration: 'none', cursor: 'pointer' }}>View All</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                [<UserPlus size={14} />, 'New user registered', '2 min ago'],
                [<ArrowDownToLine size={14} />, 'New deposit $500.00', '8 min ago'],
                [<ShoppingBag size={14} />, 'Ad account submitted', '15 min ago'],
                [<ShieldCheck size={14} />, 'Verified account purchased', '22 min ago'],
              ].map(([icon, text, time], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,45,85,0.12)', color: BRAND, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: theme.text, lineHeight: 1.4 }}>{text}</div>
                    <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 2 }}>{time}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard theme={theme} style={{ padding: 20 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: theme.text, marginBottom: 14 }}>System Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Version', 'v2.4.1'],
                ['DB Status', isSupabaseReady() ? 'Connected' : 'Offline', isSupabaseReady() ? '#22c55e' : '#ef4444'],
                ['Storage', '68% (136.5 GB)'],
                ['Backup', 'Up to date', '#22c55e'],
              ].map(([label, value, dot]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: theme.textMuted }}>{label}</span>
                  <span style={{ fontWeight: 700, color: theme.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: dot }} />}
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
