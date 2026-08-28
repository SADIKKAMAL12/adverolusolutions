import { useState, useEffect } from 'react';
import { useTheme } from '../shared/ThemeContext.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import { Upload } from 'lucide-react';

async function apiGet(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString();
  const res = await fetch(`/api/crud?${qs}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { console.error('Non-JSON:', text.slice(0, 200)); return []; }
}

const STATUS_PALETTE = ['#22c55e', '#f59e0b', '#3b82f6', '#a855f7', '#ef4444', '#06b6d4', '#ec4899'];
function statusColor(status, index) {
  return STATUS_PALETTE[index % STATUS_PALETTE.length];
}

function KpiCard({ theme, label, value, sub, color }) {
  return (
    <GlassCard theme={theme} style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 999, background: `radial-gradient(circle, ${color}33, transparent 70%)`, filter: 'blur(6px)' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ width: 9, height: 9, borderRadius: 999, background: color, boxShadow: `0 0 10px 1px ${color}` }} />
      </div>
      <div style={{ position: 'relative', marginTop: 12, fontSize: 26, fontWeight: 800, color: theme.text, letterSpacing: '-0.01em' }}>{value}</div>
      <div style={{ position: 'relative', marginTop: 4, fontSize: 12, color: theme.textMuted }}>{sub}</div>
    </GlassCard>
  );
}

function GlowBarChart({ theme, title, series }) {
  const max = Math.max(...series.map(d => d.count), 1);
  const chartH = 160;
  const gradId = 'grad-' + title.replace(/\s+/g, '-').toLowerCase();
  const glowId = 'glow-' + title.replace(/\s+/g, '-').toLowerCase();

  return (
    <GlassCard theme={theme} style={{ padding: 24, flex: 1, minWidth: 320 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>{title}</div>
      <svg viewBox={`0 0 350 ${chartH + 30}`} width="100%" height={chartH + 30} style={{ marginTop: 20, overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_LIGHT} />
            <stop offset="100%" stopColor={BRAND} />
          </linearGradient>
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={theme.mode === 'dark' ? '6' : '2.5'} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line x1="0" y1={chartH} x2="350" y2={chartH} stroke={theme.border} strokeWidth="1" />
        {series.map((d, i) => {
          const barW = 350 / series.length;
          const gap = barW * 0.34;
          const w = barW - gap;
          const h = (d.count / max) * (chartH - 10);
          const x = i * barW + gap / 2;
          const y = chartH - h;
          return (
            <g key={i}>
              {d.count > 0 && (
                <rect x={x} y={y} width={w} height={h} rx={8} fill={`url(#${gradId})`} filter={`url(#${glowId})`} opacity={theme.mode === 'dark' ? 0.95 : 1} />
              )}
              <text x={x + w / 2} y={chartH + 20} textAnchor="middle" fontSize="11" fontWeight="600" fill={theme.textFaint} fontFamily={FONT}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </GlassCard>
  );
}

function StatusBreakdownCard({ theme, title, entries }) {
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  return (
    <GlassCard theme={theme} style={{ padding: 24, flex: 1, minWidth: 300 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>{title}</div>
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {entries.map(([status, count], i) => {
          const color = statusColor(status, i);
          return (
            <div key={status}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: theme.text, fontWeight: 600, textTransform: 'capitalize' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: color, boxShadow: theme.mode === 'dark' ? `0 0 8px ${color}` : 'none' }} />
                  {status}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>{count}</div>
              </div>
              <div style={{ height: 7, borderRadius: 999, background: theme.surfaceSunken, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(count / total) * 100}%`, borderRadius: 999, background: color, boxShadow: theme.mode === 'dark' ? `0 0 10px -1px ${color}` : 'none' }} />
              </div>
            </div>
          );
        })}
        {entries.length === 0 && <div style={{ fontSize: 13, color: theme.textFaint }}>No data yet.</div>}
      </div>
    </GlassCard>
  );
}

export function AdminReportsPage() {
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [users, orders, deposits, tickets] = await Promise.all([
          apiGet('users'), apiGet('orders'), apiGet('deposits'), apiGet('support_tickets'),
        ]);

        const now = new Date();
        const day = 24 * 60 * 60 * 1000;
        const last7 = new Date(now - 7 * day);
        const last30 = new Date(now - 30 * day);

        const recentUsers = users.filter(u => new Date(u.created_at) >= last30).length;
        const recentOrders = orders.filter(o => new Date(o.created_at) >= last7).length;

        const totalDeposits = deposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        const pendingDeposits = deposits.filter(d => d.status === 'pending').length;

        const ordersByStatus = orders.reduce((acc, o) => {
          const s = o.status || 'unknown';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {});

        const ticketsByStatus = tickets.reduce((acc, t) => {
          const s = t.status || 'open';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {});

        const usersByDay = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now - (6 - i) * day);
          const dateStr = d.toISOString().slice(0, 10);
          return { label: d.toLocaleDateString('en', { weekday: 'short' }), count: users.filter(u => u.created_at?.slice(0, 10) === dateStr).length };
        });

        const ordersByDay = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now - (6 - i) * day);
          const dateStr = d.toISOString().slice(0, 10);
          return { label: d.toLocaleDateString('en', { weekday: 'short' }), count: orders.filter(o => o.created_at?.slice(0, 10) === dateStr).length };
        });

        setStats({
          totalUsers: users.length, recentUsers,
          totalOrders: orders.length, recentOrders,
          totalDeposits, pendingDeposits,
          openTickets: ticketsByStatus['open'] || ticketsByStatus['pending'] || 0,
          totalTickets: tickets.length,
          ordersByStatus, ticketsByStatus,
          usersByDay, ordersByDay,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, sub: `+${stats.recentUsers} this month`, color: '#6366f1' },
    { label: 'Total Orders', value: stats.totalOrders, sub: `+${stats.recentOrders} this week`, color: BRAND },
    { label: 'Total Deposits', value: `$${stats.totalDeposits.toLocaleString()}`, sub: `${stats.pendingDeposits} pending`, color: '#22c55e' },
    { label: 'Support Tickets', value: stats.totalTickets, sub: `${stats.openTickets} open`, color: '#f59e0b' },
  ] : [];

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Reports</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Live platform analytics from your database.</p>
        </div>
        <button style={{ height: 44, padding: '0 18px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Upload size={14} /> Export
        </button>
      </div>

      {loading ? (
        <div style={{ marginTop: 26 }}>
          <GlassCard theme={theme} style={{ padding: '60px 0', textAlign: 'center' }}>
            <span style={{ color: theme.textFaint, fontSize: 14 }}>Loading reports…</span>
          </GlassCard>
        </div>
      ) : !stats ? (
        <div style={{ marginTop: 26 }}>
          <GlassCard theme={theme} style={{ padding: '60px 0', textAlign: 'center' }}>
            <span style={{ color: theme.textFaint, fontSize: 14 }}>Could not load data.</span>
          </GlassCard>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {statCards.map(k => <KpiCard key={k.label} theme={theme} {...k} />)}
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <GlowBarChart theme={theme} title="New Users — Last 7 Days" series={stats.usersByDay} />
            <GlowBarChart theme={theme} title="Orders — Last 7 Days" series={stats.ordersByDay} />
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <StatusBreakdownCard theme={theme} title="Orders by Status" entries={Object.entries(stats.ordersByStatus)} />
            <StatusBreakdownCard theme={theme} title="Tickets by Status" entries={Object.entries(stats.ticketsByStatus)} />
          </div>
        </>
      )}
    </div>
  );
}
