import { useState, useEffect, useCallback } from 'react';
import { C } from '../shared/theme.js';
import { PageShell } from '../shared/UI.jsx';
import { Card, PlatformIcon, Badge, Btn, Modal, Avatar } from '../shared/UI.jsx';
async function apiGet(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString();
  const res = await fetch(`/api/crud?${qs}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { console.error('Non-JSON:', text.slice(0,200)); return []; }
}

function ApplicationModal({ buyer, onApprove, onReject, onClose }) {
  const [rejectForm, setRejectForm] = useState(false);
  const [rejectReason, setReason] = useState("");

  return (
    <Modal title="Application Details" onClose={onClose} width={560}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
        <Avatar initials={buyer.avatar} size={60} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: C.g800 }}>{buyer.name}</h3>
            <Badge status={buyer.status} />
          </div>
          <div style={{ fontSize: 14, color: C.g500, marginBottom: 8 }}>{buyer.speciality}</div>
          <div style={{ display: "flex", gap: 6 }}>{(buyer.platforms || []).map(p => <PlatformIcon key={p} name={p} size={18} />)}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
        {[["Email", buyer.email], ["Experience", buyer.experience], ["Total Managed", buyer.spent], ["Monthly Rate", `$${buyer.rate}/month`], ["Applied", buyer.joined], ["Portfolio", buyer.portfolio]].map(([k, v]) => (
          <div key={k} style={{ background: C.g50, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: C.g400, marginBottom: 3, textTransform: "uppercase", letterSpacing: .6, fontWeight: 700 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.g700, wordBreak: "break-all" }}>{v}</div>
          </div>
        ))}
      </div>
      {buyer.rejectReason && (
        <div style={{ background: C.redL, border: `1px solid ${C.red}30`, borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
          <div style={{ fontWeight: 800, color: C.red, fontSize: 13, marginBottom: 4 }}>Rejection Reason</div>
          <div style={{ fontSize: 13, color: C.red }}>{buyer.rejectReason}</div>
        </div>
      )}
      {rejectForm && (
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.g700, marginBottom: 8 }}>Rejection Reason <span style={{ color: C.primary }}>*</span></label>
          <textarea value={rejectReason} onChange={e => setReason(e.target.value)} rows={3}
            placeholder="Explain why this application is being rejected…"
            style={{ width: "100%", border: `1.5px solid ${C.red}60`, borderRadius: 9, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
        </div>
      )}
      {buyer.status === "pending" && !rejectForm && (
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="outline" onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
          <Btn variant="danger" onClick={() => setRejectForm(true)} style={{ flex: 1 }}>✕ Reject</Btn>
          <Btn variant="success" onClick={() => onApprove(buyer.id)} style={{ flex: 1 }}>✓ Approve</Btn>
        </div>
      )}
      {buyer.status === "pending" && rejectForm && (
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="outline" onClick={() => setRejectForm(false)} style={{ flex: 1 }}>← Back</Btn>
          <Btn variant="danger" onClick={() => rejectReason && onReject(buyer.id, rejectReason)} style={{ flex: 1, opacity: rejectReason ? 1 : .4 }}>Confirm Reject</Btn>
        </div>
      )}
      {buyer.status !== "pending" && <Btn variant="outline" full onClick={onClose}>Close</Btn>}
    </Modal>
  );
}

export default function AdminMediaBuyersPage({ mediaBuyers, onApprove, onReject }) {
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buyers, setBuyers] = useState(mediaBuyers);

  useEffect(() => {
    setBuyers(mediaBuyers);
  }, [mediaBuyers]);

  const pending = buyers.filter(m => m.status === "pending");
  const approved = buyers.filter(m => m.status === "approved");
  const rejected = buyers.filter(m => m.status === "rejected");
  const displayed = tab === "all" ? buyers : buyers.filter(m => m.status === tab);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('media_buyers', { order: 'id', ascending: 'false' });
      if (data && data.length > 0) {
        setBuyers(data);
      }
    } catch (err) {
      console.error('Media buyers refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleApprove = async (id) => {
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch('/api/admin/media-buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Approval failed');
      }
      onApprove(id);
      setBuyers(prev => prev.map(m => m.id === id ? { ...m, status: "approved" } : m));
      setSelected(null);
    } catch (err) {
      setError('Approval failed: ' + err.message);
      console.error('Approve buyer error:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id, reason) => {
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch('/api/admin/media-buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject', reason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Rejection failed');
      }
      onReject(id, reason);
      setBuyers(prev => prev.map(m => m.id === id ? { ...m, status: "rejected", rejectReason: reason } : m));
      setSelected(null);
    } catch (err) {
      setError('Rejection failed: ' + err.message);
      console.error('Reject buyer error:', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <PageShell breadcrumb="Dashboard › Media Buyers" title="Media Buyers Management" subtitle="Review applications, manage approvals, and monitor performance insights." actions={[
      <Btn key="ref" variant="outline" onClick={refetch} disabled={loading}>{loading ? '↻' : '↻ Refresh'}</Btn>,
      <Btn key="exp" variant="outline">↑ Export</Btn>
    ]}>
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 22 }}>
        {[
          [C.blue, "👤", "Total Applications", buyers.length, "3 this week"],
          [C.yellow, "⏳", "Pending Review", pending.length, null],
          [C.green, "✓", "Approved", approved.length, "2 this week"],
          [C.red, "✕", "Rejected", rejected.length, null],
          [C.primary, "💰", "Avg. Monthly Rate", `$${Math.round(approved.reduce((a, m) => a + (m.rate || 0), 0) / (approved.length || 1))}`, null],
        ].map(([col, ic, l, v, sub]) => (
          <Card key={l}>
            <div style={{ width: 42, height: 42, background: col + "20", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{ic}</div>
            <div style={{ fontSize: 12, color: C.g400, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.g800 }}>{v}</div>
            {sub && <div style={{ fontSize: 12, color: C.green, marginTop: 4 }}>↑ {sub}</div>}
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800, color: C.g800 }}>Platform Coverage (Approved Buyers)</h3>
          {["Meta", "Google", "TikTok", "Snapchat"].map(p => {
            const count = approved.filter(m => (m.platforms || []).includes(p)).length;
            const pct = approved.length ? (count / approved.length) * 100 : 0;
            return (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <PlatformIcon name={p} size={18} />
                <span style={{ fontSize: 13, color: C.g600, width: 80 }}>{p}</span>
                <div style={{ flex: 1, height: 8, background: C.g100, borderRadius: 4 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: C.primary, borderRadius: 4, transition: "width .5s" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.g500, width: 20 }}>{count}</span>
              </div>
            );
          })}
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800, color: C.g800 }}>Performance (Approved Buyers)</h3>
          {approved.length === 0
            ? <div style={{ textAlign: "center", padding: "20px", color: C.g400, fontSize: 14 }}>No approved buyers yet</div>
            : approved.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Avatar initials={m.avatar} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.g700 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: C.g400 }}>{m.orders || 0} orders · {m.spent}</div>
                </div>
                {(m.rating || 0) > 0 && <div style={{ fontSize: 12, color: C.yellow }}>{"⭐".repeat(Math.floor(m.rating))}</div>}
                <span style={{ fontSize: 13, fontWeight: 900, color: C.primary }}>${m.rate}<span style={{ fontSize: 10, color: C.g400 }}>/mo</span></span>
              </div>
            ))}
        </Card>
      </div>

      <div style={{ display: "flex", borderBottom: `2px solid ${C.g200}`, marginBottom: 20 }}>
        {[["all", "All Applications", buyers.length], ["pending", "Pending", pending.length], ["approved", "Approved", approved.length], ["rejected", "Rejected", rejected.length]].map(([id, l, count]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: "12px 22px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === id ? 800 : 400, color: tab === id ? C.primary : C.g500, borderBottom: tab === id ? `2px solid ${C.primary}` : "2px solid transparent", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, marginBottom: -2 }}>
            {l}
            <span style={{ background: tab === id ? C.primary : C.g200, color: tab === id ? "#fff" : C.g500, fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>{count}</span>
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: "center", padding: "20px", color: C.g400, fontSize: 14 }}>Loading media buyers…</div>}

      {displayed.length === 0
        ? <Card style={{ textAlign: "center", padding: "48px" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.g600 }}>No applications in this category</div>
        </Card>
        : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {displayed.map(buyer => (
            <Card key={buyer.id} onClick={() => setSelected(buyer)} style={{ cursor: "pointer", transition: "box-shadow .15s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Avatar initials={buyer.avatar} size={52} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                    <span style={{ fontWeight: 900, fontSize: 15, color: C.g800 }}>{buyer.name}</span>
                    <Badge status={buyer.status} />
                  </div>
                  <div style={{ fontSize: 13, color: C.g500, marginBottom: 6 }}>{buyer.speciality} · {buyer.email}</div>
                  <div style={{ display: "flex", gap: 6 }}>{(buyer.platforms || []).map(p => <PlatformIcon key={p} name={p} size={16} />)}</div>
                </div>
                <div style={{ textAlign: "right", minWidth: 130 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.primary }}>${buyer.rate}<span style={{ fontSize: 12, color: C.g400, fontWeight: 400 }}>/mo</span></div>
                  <div style={{ fontSize: 12, color: C.g400, marginTop: 4 }}>{buyer.experience} experience</div>
                  <div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>Applied: {buyer.joined}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginLeft: 8 }}>
                  {buyer.status === "pending"
                    ? <>
                      <Btn variant="success" size="sm" onClick={e => { e.stopPropagation(); handleApprove(buyer.id); }} disabled={loadingId === buyer.id}>{loadingId === buyer.id ? '…' : '✓ Approve'}</Btn>
                      <Btn variant="danger" size="sm" onClick={e => { e.stopPropagation(); setSelected(buyer); }} disabled={loadingId === buyer.id}>✕ Reject</Btn>
                    </>
                    : <Btn variant="outline" size="sm" onClick={e => { e.stopPropagation(); setSelected(buyer); }}>View Details</Btn>
                  }
                </div>
              </div>
              {buyer.rejectReason && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: C.redL, borderRadius: 9, fontSize: 12, color: C.red }}>
                  <strong>Rejection Reason:</strong> {buyer.rejectReason}
                </div>
              )}
            </Card>
          ))}
        </div>
      }

      {selected && (
        <ApplicationModal
          buyer={selected}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setSelected(null)}
        />
      )}
    </PageShell>
  );
}
