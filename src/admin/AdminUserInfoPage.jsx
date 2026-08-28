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
   ADMIN USER INFO PAGE
═══════════════════════════════════════════════════ */

export function AdminUserInfoPage({ user, orders = [], deposits = [], transactions = [], adAccountRequests = [], inventoryLines = [], inventoryProducts = [], structureOrders = [], paymentMethods = [], onUpdateUser, onBack }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  const uid = user.id;
  const uemail = user.email;

  const userDeposits = deposits.filter(d => d.user_id === uid || d.user === uemail || d.user_email === uemail);
  const userOrders = orders.filter(o => o.user_id === uid || o.user === uemail || o.user_email === uemail);

  // Fetch this user's transactions directly from API for accuracy
  const [userTransactions, setUserTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  useEffect(() => {
    setTxLoading(true);
    apiGet('transactions', { user_id: uid })
      .then(data => setUserTransactions((Array.isArray(data) ? data : []).sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))))
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, [uid]);
  const userAdRequests = adAccountRequests.filter(r => r.user_id === uid || r.user_email === uemail);
  const userStructures = structureOrders.filter(s => s.user_id === uid || s.user_email === uemail);

  const completedDeposits = userDeposits.filter(d => d.status === 'completed');
  const pendingDeposits = userDeposits.filter(d => d.status === 'pending');
  const totalDeposited = completedDeposits.reduce((s, d) => s + (d.amount || 0), 0);
  const totalPending = pendingDeposits.reduce((s, d) => s + (d.amount || 0), 0);
  const totalSpent = userOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.amount || 0), 0);

  const cancelledOrders = userOrders.filter(o => o.status === 'cancelled');
  const rejectedAdReqs = userAdRequests.filter(r => r.status === 'rejected');
  const rejectedStructures = userStructures.filter(s => s.status === 'rejected');
  const issueCount = cancelledOrders.length + rejectedAdReqs.length + rejectedStructures.length;

  const initials = user.name?.split(" ").map(w => w[0]).join("").slice(0, 2) || "?";
  const STATUS_COLOR = { active: TC.green, suspended: TC.yellow, banned: TC.red, pending: TC.blue };
  const statusColor = STATUS_COLOR[user.status] || TC.g400;

  // Access control state — loaded from localStorage, then synced from server
  const [pagePerms, setPagePerms] = useState(() => {
    const stored = getPermsForUser(user.id);
    const p = stored.pages || {};
    return Object.fromEntries(USER_PAGES.map(pg => [pg.key, p[pg.key] !== false]));
  });
  const [blockedMethods, setBlockedMethods] = useState(() => {
    return getPermsForUser(user.id).blockedPaymentMethods || [];
  });
  const [permsSaved, setPermsSaved] = useState(false);

  // Refresh permissions from server whenever this profile is opened
  useEffect(() => {
    syncPermsFromServer(user.id).then(() => {
      const stored = getPermsForUser(user.id);
      const p = stored.pages || {};
      setPagePerms(Object.fromEntries(USER_PAGES.map(pg => [pg.key, p[pg.key] !== false])));
      setBlockedMethods(stored.blockedPaymentMethods || []);
    });
  }, [user.id]);

  const savePermissions = async () => {
    const permissions = {
      pages: Object.fromEntries(USER_PAGES.map(pg => [pg.key, pagePerms[pg.key]])),
      blockedPaymentMethods: blockedMethods,
    };
    await savePermsForUser(user.id, permissions);
    if (onUpdateUser) onUpdateUser({ ...user, permissions });
    setPermsSaved(true);
    setTimeout(() => setPermsSaved(false), 3000);
  };

  return (
    <PageShell
      breadcrumb={`Dashboard › Users › ${user.name}`}
      title="User Profile"
      actions={[<Btn key="back" variant="outline" onClick={onBack}>← Back to Users</Btn>]}
    >
      {/* Profile header */}
      <div style={{ background: TC.card, border: `1px solid ${TC.g100}`, borderRadius: 18, padding: "28px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
          <div style={{ width: 78, height: 78, borderRadius: 20, background: `linear-gradient(135deg,${TC.primary},${TC.primary}bb)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: `0 6px 20px ${TC.primary}40` }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: TC.g800, letterSpacing: "-0.02em" }}>{user.name}</h2>
              <span style={{ background: statusColor + "18", color: statusColor, border: `1px solid ${statusColor}40`, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{user.status || "active"}</span>
              <span style={{ background: TC.g100, color: TC.g600, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{user.role || "user"}</span>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                <span style={{ color: TC.g400 }}>✉</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: TC.g700 }}>{user.email}</span>
              </div>
              {user.phone ? (
                <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                  <span style={{ color: TC.green }}>📱</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TC.g700 }}>{user.phone}</span>
                  <span style={{ background: "#dcfce7", color: TC.green, borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>WhatsApp</span>
                </div>
              ) : (
                <span style={{ fontSize: 13, color: TC.g300, fontStyle: "italic" }}>No phone number on file</span>
              )}
              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                <span style={{ color: TC.g400 }}>📅</span>
                <span style={{ fontSize: 13, color: TC.g500 }}>Joined {user.joined}</span>
              </div>
              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: TC.g300, fontFamily: "monospace" }}>ID: {user.id?.slice(0, 16)}…</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, background: TC.primaryLight, border: `1px solid ${TC.primary}20`, borderRadius: 14, padding: "16px 22px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TC.primary, letterSpacing: "0.08em", marginBottom: 6 }}>BALANCE</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: TC.primary, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              ${(user.balance || 0).toLocaleString()}<span style={{ fontSize: 18 }}>.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          ["Total Deposited", `$${totalDeposited.toLocaleString()}`, TC.green, completedDeposits.length + " completed"],
          ["Pending Deposits", `$${totalPending.toLocaleString()}`, TC.yellow, pendingDeposits.length + " awaiting approval"],
          ["Total Spent", `$${totalSpent.toLocaleString()}`, TC.primary, userOrders.filter(o => o.status === "completed").length + " paid orders"],
          ["Total Orders", userOrders.length, TC.blue, userAdRequests.length + " ad account req."],
          ["Issues Found", issueCount, issueCount > 0 ? TC.red : TC.green, issueCount > 0 ? "Needs attention" : "All clear ✓"],
        ].map(([l, v, c, sub]) => (
          <div key={l} style={{ background: TC.card, border: `1px solid ${TC.g100}`, borderRadius: 14, padding: "18px 16px", boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: TC.g400, letterSpacing: "0.05em", marginBottom: 6, textTransform: "uppercase" }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: c, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", marginBottom: 4 }}>{v}</div>
            <div style={{ fontSize: 11, color: TC.g400 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Issues banner */}
      {issueCount > 0 && (
        <div style={{ background: "#fff7ed", border: `1px solid ${TC.yellow}50`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20, flexShrink: 0, color: TC.yellow }}>⚠</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e", marginBottom: 4 }}>{issueCount} issue{issueCount > 1 ? "s" : ""} on this account</div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {cancelledOrders.length > 0 && <span style={{ fontSize: 12, color: "#a16207" }}>• {cancelledOrders.length} cancelled order{cancelledOrders.length > 1 ? "s" : ""}</span>}
              {rejectedAdReqs.length > 0 && <span style={{ fontSize: 12, color: "#a16207" }}>• {rejectedAdReqs.length} rejected ad account request{rejectedAdReqs.length > 1 ? "s" : ""}</span>}
              {rejectedStructures.length > 0 && <span style={{ fontSize: 12, color: "#a16207" }}>• {rejectedStructures.length} rejected structure order{rejectedStructures.length > 1 ? "s" : ""}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Deposits + Orders side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: TC.card, border: `1px solid ${TC.g100}`, borderRadius: 16, padding: "22px 22px 8px", boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TC.g800 }}>Deposit History</h3>
            <span style={{ background: TC.greenL, color: TC.green, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{userDeposits.length} total</span>
          </div>
          {userDeposits.length === 0
            ? <div style={{ textAlign: "center", padding: "28px 0", color: TC.g300, fontSize: 13 }}>No deposits yet</div>
            : userDeposits.map(d => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${TC.g100}` }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: TC.g800 }}>{d.method}</div>
                  <div style={{ fontSize: 11, color: TC.g400, marginTop: 2 }}>{d.date} · {d.id}</div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: TC.green, fontVariantNumeric: "tabular-nums" }}>+${(d.amount || 0).toLocaleString()}</span>
                  <Badge status={d.status} />
                </div>
              </div>
            ))
          }
        </div>

        <div style={{ background: TC.card, border: `1px solid ${TC.g100}`, borderRadius: 16, padding: "22px 22px 8px", boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TC.g800 }}>Order History</h3>
            <span style={{ background: TC.blueL, color: TC.blue, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{userOrders.length} total</span>
          </div>
          {userOrders.length === 0
            ? <div style={{ textAlign: "center", padding: "28px 0", color: TC.g300, fontSize: 13 }}>No orders yet</div>
            : userOrders.map(o => (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${TC.g100}` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <PlatformIcon name={o.platform} size={16} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: o.status === "cancelled" ? TC.red : TC.g800 }}>{o.type}</div>
                    <div style={{ fontSize: 11, color: TC.g400, marginTop: 2 }}>{o.date} · {o.id}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: TC.primary, fontVariantNumeric: "tabular-nums" }}>${o.amount}</span>
                  <Badge status={o.status} />
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ background: TC.card, border: `1px solid ${TC.g100}`, borderRadius: 16, padding: "22px 22px 8px", marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TC.g800 }}>Transaction History</h3>
          <span style={{ background: TC.g100, color: TC.g600, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{txLoading ? '…' : userTransactions.length + ' total'}</span>
        </div>
        {txLoading
          ? <div style={{ textAlign: "center", padding: "28px 0", color: TC.g400, fontSize: 13 }}>Loading transactions…</div>
          : userTransactions.length === 0
          ? <div style={{ textAlign: "center", padding: "28px 0", color: TC.g300, fontSize: 13 }}>No transactions yet</div>
          : userTransactions.map((t, i) => {
            const isCredit = t.type?.toLowerCase() === 'deposit' || (t.amount > 0 && t.type?.toLowerCase() !== 'spent')
            const amount = Math.abs(t.amount || 0)
            return (
              <div key={t.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${TC.g100}` }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: isCredit ? "#dcfce7" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                    {isCredit ? "↑" : "↓"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: TC.g800 }}>{t.type} · {t.method}</div>
                    <div style={{ fontSize: 11, color: TC.g400, marginTop: 2 }}>{t.date || (t.created_at ? new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: isCredit ? TC.green : TC.red, fontVariantNumeric: "tabular-nums" }}>
                    {isCredit ? '+' : '−'}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <Badge status={t.status} />
                </div>
              </div>
            )
          })
        }
      </div>

      {/* Ad Account Requests */}
      {userAdRequests.length > 0 && (
        <div style={{ background: TC.card, border: `1px solid ${TC.g100}`, borderRadius: 16, padding: "22px 22px 8px", marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TC.g800 }}>Agency Ad Account Requests</h3>
            <span style={{ background: TC.primaryLight, color: TC.primary, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{userAdRequests.length} request{userAdRequests.length > 1 ? "s" : ""}</span>
          </div>
          {userAdRequests.map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${TC.g100}` }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <PlatformIcon name={r.platform} size={18} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: r.status === "rejected" ? TC.red : TC.g800 }}>{r.account_name || r.accountName || "—"} · {r.platform}</div>
                  <div style={{ fontSize: 11, color: TC.g400, marginTop: 2 }}>{r.business_type || "—"} · {r.submittedAt || (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—")} · {r.requestId || r.id}</div>
                  {r.status === "rejected" && <div style={{ fontSize: 12, color: TC.red, fontWeight: 600, marginTop: 4 }}>Rejected: {r.rejectReason || "no reason specified"}</div>}
                </div>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: TC.primary }}>${r.amount || 52}.00</span>
                <Badge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Structure Orders */}
      {userStructures.length > 0 && (
        <div style={{ background: TC.card, border: `1px solid ${TC.g100}`, borderRadius: 16, padding: "22px 22px 8px", marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TC.g800 }}>Structure Orders</h3>
            <span style={{ background: TC.g100, color: TC.g600, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{userStructures.length} total</span>
          </div>
          {userStructures.map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${TC.g100}` }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: s.status === "rejected" ? TC.red : TC.g800 }}>{s.name || s.structureName || s.id}</div>
                <div style={{ fontSize: 11, color: TC.g400, marginTop: 2 }}>{s.date || s.created_at || "—"}</div>
                {s.status === "rejected" && <div style={{ fontSize: 12, color: TC.red, fontWeight: 600, marginTop: 4 }}>Rejected: {s.rejectReason || "no reason given"}</div>}
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                {(s.total || s.amount) ? <span style={{ fontWeight: 800, fontSize: 14, color: TC.primary, fontVariantNumeric: "tabular-nums" }}>${s.total || s.amount}</span> : null}
                <Badge status={s.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {userDeposits.length === 0 && userOrders.length === 0 && userAdRequests.length === 0 && userStructures.length === 0 && (
        <div style={{ background: TC.card, border: `1px solid ${TC.g100}`, borderRadius: 16, padding: "56px 32px", textAlign: "center", marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: TC.g700 }}>No activity yet</div>
          <div style={{ fontSize: 13, color: TC.g400, marginTop: 8 }}>This user hasn't made any deposits, orders, or requests.</div>
        </div>
      )}

      {/* Access Control */}
      <div style={{ background: TC.card, border: `1px solid ${TC.g100}`, borderRadius: 16, padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TC.g800, letterSpacing: "-0.01em" }}>Access Control</h3>
            <p style={{ margin: "5px 0 0", fontSize: 13, color: TC.g400 }}>Control which pages and payment methods this user can access.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {permsSaved && <span style={{ fontSize: 12, color: TC.green, fontWeight: 700 }}>✓ Saved</span>}
            <Btn onClick={savePermissions}>Save Settings</Btn>
          </div>
        </div>

        {/* Page Access */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TC.g400, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Page Access</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {USER_PAGES.map(pg => {
              const enabled = pagePerms[pg.key];
              return (
                <div key={pg.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: enabled ? TC.card : TC.g50, borderRadius: 12, border: `1px solid ${enabled ? TC.g200 : TC.g200}`, transition: "all .15s" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: enabled ? TC.g800 : TC.g400 }}>{pg.label}</div>
                    <div style={{ fontSize: 11, color: TC.g400, marginTop: 3, lineHeight: 1.4 }}>{pg.description}</div>
                  </div>
                  <div
                    onClick={() => setPagePerms(p => ({ ...p, [pg.key]: !p[pg.key] }))}
                    style={{ width: 42, height: 23, borderRadius: 12, background: enabled ? TC.primary : TC.g300, cursor: "pointer", position: "relative", transition: "all .2s", flexShrink: 0, marginLeft: 14 }}
                  >
                    <div style={{ width: 19, height: 19, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: enabled ? 21 : 2, transition: "all .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method Access */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: TC.g400, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Payment Methods</div>
          {paymentMethods.filter(m => m.active).length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: TC.g300, fontSize: 13 }}>No active payment methods configured</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {paymentMethods.filter(m => m.active).map(m => {
                const allowed = !blockedMethods.includes(m.id);
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: allowed ? TC.card : TC.g50, borderRadius: 12, border: `1px solid ${TC.g200}`, transition: "all .15s" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${TC.g200}`, display: "flex", alignItems: "center", justifyContent: "center", background: TC.g50, flexShrink: 0 }}>
                        {m.logo && m.logo.startsWith('data:')
                          ? <img src={m.logo} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
                          : <span style={{ fontSize: 18 }}>{m.logo || "💳"}</span>
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: allowed ? TC.g800 : TC.g400 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: TC.g400 }}>{m.bank_name}</div>
                      </div>
                    </div>
                    <div
                      onClick={() => setBlockedMethods(bm => bm.includes(m.id) ? bm.filter(id => id !== m.id) : [...bm, m.id])}
                      style={{ width: 42, height: 23, borderRadius: 12, background: allowed ? TC.primary : TC.g300, cursor: "pointer", position: "relative", transition: "all .2s", flexShrink: 0, marginLeft: 14 }}
                    >
                      <div style={{ width: 19, height: 19, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: allowed ? 21 : 2, transition: "all .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
