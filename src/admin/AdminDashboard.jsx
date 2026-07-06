import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '../shared/Router.jsx';
import { C, getThemeColors } from '../shared/theme.js';
import { useTheme } from '../shared/ThemeContext.jsx';
import { PageShell } from '../shared/UI.jsx';
import { Card, PlatformIcon, Badge, Btn } from '../shared/UI.jsx';
import { isSupabaseReady } from '../lib/supabase.js';

export default function AdminDashboard({ users, orders, deposits }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  const userList = users || [];
  const orderList = orders || [];
  const depositList = deposits || [];
  const pendingDeposits = depositList.filter(d => d.status === "pending").length;
  const totalBalance = userList.reduce((a, u) => a + (u.balance || 0), 0);

  const [apiStats, setApiStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    if (!isSupabaseReady()) return;
    setStatsLoading(true);
    setError("");
    try {
      const res = await fetch('/api/admin/stats');
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
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const stats = apiStats || {
    users: userList.length,
    orders: orderList.length,
    deposits: depositList.length,
    tickets: 0,
    totalBalance: totalBalance,
  };

  const platformData = [
    ["Meta", "1,245", "53.1%", C.primary],
    ["Google", "562", "23.9%", C.green],
    ["TikTok", "356", "15.2%", C.blue],
    ["Snapchat", "183", "7.8%", C.yellow],
  ];

  return (
    <PageShell title="Dashboard" subtitle="Welcome back, Super Admin! Here's what's happening on your platform.">
      {error && (
        <div style={{ background: TC.redL, border: `1px solid ${TC.red}50`, color: TC.red, padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 22 }}>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
            {[
              ["👥", "Total Users", stats.users, C.blue],
              ["◧", "Ad Accounts", "2,346", C.green],
              ["✓", "Verified Accounts", "4,562", C.primary],
              ["🛒", "Total Orders", stats.orders, "#8b5cf6"]
            ].map(([ic, l, v, c], i) => (
              <Card key={l} className="reveal-item" style={{ animationDelay: `${i * 80}ms` }}>
                <div style={{ width: 38, height: 38, background: c + "20", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 10 }}>{ic}</div>
                <div style={{ fontSize: 12, color: C.g400 }}>{l}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: TC.g800, margin: '4px 0', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{statsLoading ? '…' : v}</div>
                <div style={{ fontSize: 11, color: C.green }}>↑ 18.5% from last week</div>
              </Card>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
            {[
              ["◈", "Total Balance", `$${(stats.totalBalance || 0).toLocaleString()}.00`, C.primary],
              ["↓", "Total Deposits", `$${(depositList.reduce((a, d) => a + (d.amount || 0), 0)).toLocaleString()}`, C.blue],
              ["🛒", "Total Orders", stats.orders, C.green],
              ["💬", "Open Tickets", stats.tickets || 0, C.yellow]
            ].map(([ic, l, v, c], i) => (
              <Card key={l} className="reveal-item" style={{ animationDelay: `${(i + 4) * 80}ms` }}>
                <div style={{ width: 38, height: 38, background: c + "20", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 10 }}>{ic}</div>
                <div style={{ fontSize: 12, color: C.g400 }}>{l}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: TC.g800, margin: '4px 0', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{statsLoading ? '…' : v}</div>
                <div style={{ fontSize: 11, color: C.green }}>↑ 20.4% from last week</div>
              </Card>
            ))}
          </div>

          {pendingDeposits > 0 && (
            <div onClick={() => navigate("/admin/deposits")}
              style={{ background: TC.blueL, border: `2px solid ${TC.blue}50`, borderRadius: 13, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
              <div style={{ width: 44, height: 44, background: C.blue + "30", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>💰</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: TC.g800 }}>{pendingDeposits} Deposit{pendingDeposits > 1 ? "s" : ""} Pending Review</div>
                <div style={{ fontSize: 13, color: TC.g500, marginTop: 2 }}>Review and approve user deposit requests.</div>
              </div>
              <Btn variant="outline" size="sm" style={{ borderColor: C.blue, color: C.blue }}>Review →</Btn>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TC.g800 }}>Overview Chart</h3>
                <select style={{ background: TC.g50, border: `1px solid ${TC.g200}`, borderRadius: 7, padding: "3px 8px", fontSize: 12, fontFamily: "inherit", outline: "none", color: TC.g800 }}><option>This Week</option></select>
              </div>
              <div style={{ height: 130, display: "flex", alignItems: "flex-end", gap: 5 }}>
                {[60, 80, 55, 90, 75, 85, 100].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", height: h * 1.2, background: `${C.primary}18`, borderRadius: "4px 4px 0 0", position: "relative" }}>
                      <div style={{ width: "100%", height: "55%", background: C.primary + "70", borderRadius: "4px 4px 0 0", position: "absolute", bottom: 0 }} />
                    </div>
                    <span style={{ fontSize: 10, color: TC.g400 }}>May {19 + i}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800, color: TC.g800 }}>Accounts by Platform</h3>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                  <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: 90, height: 90 }}>
                    {[{ p: 53.1, c: C.primary }, { p: 23.9, c: C.green }, { p: 15.2, c: C.blue }, { p: 7.8, c: C.yellow }].reduce((acc, seg) => {
                      const dash = (seg.p / 100) * 251.2;
                      acc.els.push(<circle key={seg.c} cx="50" cy="50" r="40" fill="none" stroke={seg.c} strokeWidth="18" strokeDasharray={`${dash} ${251.2 - dash}`} strokeDashoffset={-acc.offset * 2.512} />);
                      acc.offset += seg.p; return acc;
                    }, { els: [], offset: 0 }).els}
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>2,346</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {platformData.map(([p, n, pct, c]) => (
                    <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, background: c, borderRadius: 2 }} />
                      <span style={{ fontSize: 12, color: TC.g500, flex: 1 }}>{p}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: TC.g800 }}>{n}</span>
                      <span style={{ fontSize: 11, color: TC.g400 }}>({pct})</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TC.g800 }}>Latest Orders</h3>
              <Btn variant="ghost" size="sm" onClick={() => navigate("/admin/orders")}>View All →</Btn>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ borderBottom: `1px solid ${TC.g200}`, background: TC.g50 }}>
                {["Order ID", "User", "Type", "Platform", "Amount", "Status", "Date"].map(h => (
                  <th key={h} style={{ padding: "9px 10px", textAlign: "left", color: TC.g400, fontWeight: 700, fontSize: 12 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {orderList.slice(0, 4).map((o, i) => (
                  <tr key={o.id} className="reveal-item" style={{ borderBottom: `1px solid ${TC.g100}`, animationDelay: `${i * 55}ms` }}>
                    <td style={{ padding: "10px", fontWeight: 700, color: TC.g700, fontSize: 12 }}>{o.id}</td>
                    <td style={{ padding: "10px", color: TC.g500, fontSize: 12 }}>{o.user}</td>
                    <td style={{ padding: "10px", color: TC.g500, fontSize: 12 }}>{o.type}</td>
                    <td style={{ padding: "10px" }}><div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}><PlatformIcon name={o.platform} size={14} />{o.platform}</div></td>
                    <td style={{ padding: "10px", fontWeight: 700 }}>${o.amount}.00</td>
                    <td style={{ padding: "10px" }}><Badge status={o.status} /></td>
                    <td style={{ padding: "10px", color: TC.g400, fontSize: 12 }}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800, color: TC.g800 }}>Platform Overview</h3>
            {[
              ["Active Users", userList.filter(u => u.status === "active").length, C.green],
              ["Inactive Users", userList.filter(u => u.status !== "active" && u.status !== "banned").length, C.g300],
              ["Banned Users", userList.filter(u => u.status === "banned").length, C.red],
              ["Pending Users", userList.filter(u => u.status === "pending").length, C.yellow]
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                <span style={{ fontSize: 12, color: TC.g500, flex: 1 }}>{l}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: TC.g800 }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TC.g800 }}>Recent Activity</h3>
              <span style={{ color: C.primary, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>View All</span>
            </div>
            {[["👤", "New user registered", "2 min ago"], ["💰", "New deposit $500.00", "8 min ago"], ["◧", "Ad account submitted", "15 min ago"], ["✓", "Verified account purchased", "22 min ago"]].map(([ic, t, d]) => (
              <div key={t} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${TC.g100}` }}>
                <div style={{ width: 28, height: 28, background: TC.primaryLight, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{ic}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: TC.g700 }}>{t}</div></div>
                <div style={{ fontSize: 11, color: TC.g400, whiteSpace: "nowrap" }}>{d}</div>
              </div>
            ))}
          </Card>
          <Card>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800, color: TC.g800 }}>System Info</h3>
            {[["Version", "v2.4.1"], ["DB Status", isSupabaseReady() ? "● Connected" : "● Offline"], ["Storage", "68% (136.5 GB)"], ["Backup", "● Up to date"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${TC.g100}`, fontSize: 12 }}>
                <span style={{ color: TC.g400 }}>{k}</span><span style={{ color: TC.g700, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card style={{ background: TC.primaryLight, border: `1px solid ${C.primary}20` }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 800, color: TC.g700 }}>Quick Actions</h3>
            {[["+ Add New User", "/admin/users"], ["+ Add Balance", "/admin/deposits"], ["📢 Create Announcement", "/admin/settings"], ["📋 View All Orders", "/admin/orders"]].map(([l, pg]) => (
              <button key={l} onClick={() => navigate(pg)} style={{ width: "100%", background: TC.card, border: `1px solid ${TC.g200}`, borderRadius: 8, padding: "9px 12px", fontSize: 12, cursor: "pointer", color: TC.g700, textAlign: "left", marginBottom: 7, fontWeight: 700, fontFamily: "inherit" }}>{l}</button>
            ))}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
