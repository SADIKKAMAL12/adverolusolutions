// Agency Ad Accounts — list user's requests, allow creating a new one.

import { useEffect, useState } from 'react';
import { Layout } from '../shared/Layout.jsx';
import { PageHead, KPI, StatusPill, SkeletonRows, EmptyState, ErrorBanner, SuccessBanner, Spinner, fmtDate, statusTone } from '../shared/UI.jsx';
import { Icon, PlatformIcon } from '../shared/Icon.jsx';
import { api } from '../shared/api.js';
import { useStore, setStore } from '../shared/store.js';
import { useAuth } from '../shared/AuthContext.jsx';
import InsufficientBalanceModal from '../shared/InsufficientBalanceModal.jsx';
import OrderConfirmModal from '../shared/OrderConfirmModal.jsx';

const PLATFORMS_FALLBACK = ['Meta', 'Google', 'TikTok', 'Snapchat'];
const BIZ_TYPES = ['E-commerce', 'Lead Gen', 'SaaS', 'App Install', 'Local Services', 'DTC', 'Other'];

function CreateModal({ onClose, onCreated, currentBalance = 0 }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    account_name: '',
    platform: 'Meta',
    business_name: '',
    business_type: 'E-commerce',
    business_email: user?.email || '',
  });
  const [extraFields, setExtraFields] = useState({});
  const [topupAmount, setTopupAmount] = useState('');
  const [platformsList, setPlatformsList] = useState([]);
  const [platformConfigs, setPlatformConfigs] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/platform-config')
      .then(r => r.json())
      .then(data => {
        const arr = (Array.isArray(data) ? data : []).filter(p => p.active !== false);
        const map = {};
        arr.forEach(p => { if (p.id) map[p.id] = p; });
        setPlatformsList(arr);
        setPlatformConfigs(map);
        // Set default platform to first active one
        if (arr.length > 0) setForm(s => ({ ...s, platform: arr[0].name }));
      })
      .catch(() => {});
  }, []);

  const platformId = (platformsList.find(p => p.name === form.platform)?.id) || form.platform.toLowerCase();
  const platformConfig = platformConfigs[platformId] || {};
  const platformFields = platformConfig.fields || [];
  const servicePrice = Number(platformConfig.price ?? 50);
  const feePercent   = Number(platformConfig.fee   ?? 6);
  const minTopup     = Number(platformConfig.minTopup ?? 200);
  const topup        = parseFloat(topupAmount) || 0;
  const topupFee     = parseFloat((topup * feePercent / 100).toFixed(2));
  const total        = parseFloat((servicePrice + topup + topupFee).toFixed(2));

  const update = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const handlePlatformChange = (v) => {
    setForm(s => ({ ...s, platform: v }));
    setExtraFields({});
  };

  const goNext = (e) => {
    e.preventDefault();
    for (const f of platformFields) {
      if (f.required && !extraFields[f.key]) {
        setError(`"${f.label}" is required`);
        return;
      }
    }
    setError(null);
    setStep(2);
  };

  const submit = () => {
    if (!topupAmount) { setError('Please enter a top-up amount'); return; }
    if (topup < minTopup) { setError(`Minimum top-up is $${minTopup}`); return; }
    if (currentBalance < total) { setShowBalanceModal(true); return; }
    setShowConfirm(true);
  };

  const doSubmit = async () => {
    setError(null);
    setBusy(true);
    try {
      const created = await api.post('/api/ad-account-requests', {
        ...form,
        ...extraFields,
        user_id: user?.id,
        amount: total,
      });
      setShowConfirm(false);
      onCreated(created, total);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal__head">
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              {step === 1 ? 'Create ad account request' : 'Pricing & Top-up'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
              Step {step} of 2 — {step === 1 ? 'Account details & requirements' : 'Review pricing and submit'}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', height: 3, margin: '0 0 2px' }}>
          <div style={{ flex: 1, background: 'var(--accent)', borderRadius: 2, transition: 'flex .3s' }} />
          <div style={{ flex: 1, background: step === 2 ? 'var(--accent)' : 'var(--line-2)', transition: 'background .3s' }} />
        </div>

        <div className="modal__body">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          {step === 1 ? (
            /* ── STEP 1: Account details ── */
            <form onSubmit={goNext}>
              <div className="grid-2">
                <div className="input-group">
                  <label>Account name <span style={{ color: 'var(--accent)' }}>*</span></label>
                  <input className="input" required value={form.account_name}
                    onChange={e => update('account_name', e.target.value)} placeholder="e.g. Brand US — Meta 03" />
                </div>
                <div className="input-group">
                  <label>Platform <span style={{ color: 'var(--accent)' }}>*</span></label>
                  {platformsList.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {platformsList.map(p => {
                        const active = form.platform === p.name;
                        return (
                          <button key={p.id} type="button" onClick={() => handlePlatformChange(p.name)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '9px 12px', borderRadius: 10,
                              border: `2px solid ${active ? (p.color || 'var(--accent)') : 'var(--line)'}`,
                              background: active ? `${p.color || 'var(--accent)'}12` : 'var(--bg-card)',
                              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                              transition: 'border-color .15s, background .15s',
                            }}>
                            {p.logo
                              ? <img src={p.logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 4, flexShrink: 0 }} />
                              : <div style={{ width: 24, height: 24, borderRadius: 6, background: `${p.color || '#6366f1'}22`, border: `1px solid ${p.color || '#6366f1'}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: p.color || '#6366f1', flexShrink: 0 }}>{p.name[0]}</div>
                            }
                            <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? (p.color || 'var(--accent)') : 'var(--ink)' }}>{p.name}</span>
                            {active && <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: p.color || 'var(--accent)', flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <select className="select" value={form.platform} onChange={e => handlePlatformChange(e.target.value)}>
                      {PLATFORMS_FALLBACK.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Business name <span style={{ color: 'var(--accent)' }}>*</span></label>
                  <input className="input" required value={form.business_name}
                    onChange={e => update('business_name', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Business type <span style={{ color: 'var(--accent)' }}>*</span></label>
                  <select className="select" value={form.business_type}
                    onChange={e => update('business_type', e.target.value)}>
                    {BIZ_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Business email <span style={{ color: 'var(--accent)' }}>*</span></label>
                <input className="input" type="email" required value={form.business_email}
                  onChange={e => update('business_email', e.target.value)} />
              </div>

              {/* Dynamic platform fields */}
              {platformFields.length > 0 && (
                <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 14, marginTop: 2 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>
                    {form.platform} Requirements
                  </div>
                  {platformFields.map(f => (
                    <div key={f.key} className="input-group">
                      <label>
                        {f.label}
                        {f.required
                          ? <span style={{ color: 'var(--accent)' }}> *</span>
                          : <span style={{ color: 'var(--muted-2)' }}> (optional)</span>}
                      </label>
                      {f.type === 'textarea' ? (
                        <textarea className="input" style={{ minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }}
                          value={extraFields[f.key] || ''} onChange={e => setExtraFields(x => ({ ...x, [f.key]: e.target.value }))}
                          placeholder={f.placeholder} />
                      ) : (
                        <input className="input" type={f.type || 'text'}
                          value={extraFields[f.key] || ''} onChange={e => setExtraFields(x => ({ ...x, [f.key]: e.target.value }))}
                          placeholder={f.placeholder} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn--accent">
                  Next <Icon name="arrow-right" size={12} />
                </button>
              </div>
            </form>
          ) : (
            /* ── STEP 2: Pricing ── */
            <div>
              {/* Selected account summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-sunken)', borderRadius: 10, marginBottom: 18 }}>
                <PlatformIcon platform={form.platform} size={34} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{form.account_name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{form.platform} · {form.business_name}</div>
                </div>
              </div>

              {/* Top-up input */}
              <div className="input-group">
                <label>
                  Top-up amount (USD) <span style={{ color: 'var(--accent)' }}>*</span>
                  <span style={{ marginLeft: 6, fontSize: 11.5, color: 'var(--muted-2)', fontWeight: 400 }}>Min. ${minTopup}</span>
                </label>
                <input
                  className="input"
                  type="number"
                  min={minTopup}
                  step="0.01"
                  value={topupAmount}
                  onChange={e => setTopupAmount(e.target.value)}
                  placeholder={`$${minTopup}.00`}
                  autoFocus
                />
              </div>

              {/* Price breakdown card */}
              <div style={{ background: 'var(--bg-sunken)', borderRadius: 12, padding: '16px 18px', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[
                  { label: 'Service fee',              value: `$${servicePrice.toFixed(2)}`,  bold: false },
                  { label: 'Top-up amount',            value: topup > 0 ? `$${topup.toFixed(2)}` : '—', bold: false },
                  { label: `Top-up fee (${feePercent}%)`, value: topup > 0 ? `$${topupFee.toFixed(2)}` : '—', muted: true },
                ].map(({ label, value, bold, muted }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                    <span style={{ color: 'var(--muted)' }}>{label}</span>
                    <span className="mono" style={{ fontWeight: bold ? 700 : 500, color: muted ? 'var(--muted)' : 'var(--ink)' }}>{value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Total to pay</span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent)' }}>
                    ${topup > 0 ? total.toFixed(2) : servicePrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="btn" onClick={() => { setStep(1); setError(null); }}>
                  <Icon name="arrow-left" size={12} /> Back
                </button>
                <button className="btn btn--accent" onClick={submit} disabled={busy || !topupAmount}>
                  {busy && <Spinner size={13} />}
                  Submit request
                  <Icon name="arrow-right" size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <InsufficientBalanceModal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        required={total}
        available={currentBalance}
      />
      <OrderConfirmModal
        isOpen={showConfirm}
        onClose={() => { if (!busy) setShowConfirm(false) }}
        onConfirm={doSubmit}
        orderLabel={`Agency Account — ${form.platform}`}
        cost={total}
        balance={currentBalance}
        loading={busy}
      />
    </div>
  );
}

/* ── Top-up modal (approved accounts only) ─────────────────────────────── */
function TopUpModal({ request, onClose, onSuccess, currentBalance = 0 }) {
  const { user } = useAuth();
  const [topupAmount, setTopupAmount] = useState('');
  const [platformConfig, setPlatformConfig] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch('/api/platform-config')
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        const cfg = arr.find(p => p.id === (request.platform || '').toLowerCase()) || {};
        setPlatformConfig(cfg);
      })
      .catch(() => {});
  }, [request.platform]);

  const feePercent = Number(platformConfig.fee   ?? 6);
  const minTopup   = Number(platformConfig.minTopup ?? 200);
  const topup      = parseFloat(topupAmount) || 0;
  const topupFee   = parseFloat((topup * feePercent / 100).toFixed(2));
  const total      = parseFloat((topup + topupFee).toFixed(2));

  const submit = () => {
    if (!topupAmount || topup < minTopup) {
      setError(`Minimum top-up is $${minTopup}`);
      return;
    }
    if (currentBalance < total) { setShowBalanceModal(true); return; }
    setShowConfirm(true);
  };

  const doSubmit = async () => {
    setError(null);
    setBusy(true);
    try {
      const created = await api.post('/api/ad-account-requests', {
        account_name:   `Top-up: ${request.account_name || request.business_name}`,
        platform:       request.platform,
        business_name:  request.business_name,
        business_type:  request.business_type,
        business_email: request.business_email,
        bm_id:          request.bm_id,
        user_id:        user?.id,
        amount:         total,
      });
      setShowConfirm(false);
      onSuccess(created, total);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal__head">
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Top Up Account</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
              Add funds to your existing ad account — no setup fee.
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" size={14} />
          </button>
        </div>

        <div className="modal__body">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          {/* Account summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-sunken)', borderRadius: 10, marginBottom: 18 }}>
            <PlatformIcon platform={request.platform} size={34} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{request.account_name || request.business_name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                {request.platform} · {request.business_name}
                {request.request_id && <span className="mono" style={{ marginLeft: 8 }}>{request.request_id}</span>}
              </div>
            </div>
          </div>

          {/* Top-up input */}
          <div className="input-group">
            <label>
              Top-up amount (USD) <span style={{ color: 'var(--accent)' }}>*</span>
              <span style={{ marginLeft: 6, fontSize: 11.5, color: 'var(--muted-2)', fontWeight: 400 }}>Min. ${minTopup}</span>
            </label>
            <input
              className="input"
              type="number"
              min={minTopup}
              step="0.01"
              value={topupAmount}
              onChange={e => setTopupAmount(e.target.value)}
              placeholder={`$${minTopup}.00`}
              autoFocus
            />
          </div>

          {/* Breakdown */}
          <div style={{ background: 'var(--bg-sunken)', borderRadius: 12, padding: '16px 18px', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {[
              { label: 'Top-up amount',            value: topup > 0 ? `$${topup.toFixed(2)}` : '—' },
              { label: `Top-up fee (${feePercent}%)`, value: topup > 0 ? `$${topupFee.toFixed(2)}` : '—', muted: true },
            ].map(({ label, value, muted }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span className="mono" style={{ fontWeight: muted ? 400 : 500, color: muted ? 'var(--muted)' : 'var(--ink)' }}>{value}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Total to pay</span>
              <span className="mono" style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent)' }}>
                {topup > 0 ? `$${total.toFixed(2)}` : '—'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn--accent" onClick={submit} disabled={busy || !topupAmount}>
              {busy && <Spinner size={13} />}
              Submit top-up <Icon name="arrow-right" size={12} />
            </button>
          </div>
        </div>
      </div>
      <InsufficientBalanceModal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        required={total}
        available={currentBalance}
      />
      <OrderConfirmModal
        isOpen={showConfirm}
        onClose={() => { if (!busy) setShowConfirm(false) }}
        onConfirm={doSubmit}
        orderLabel={`Account Top-up — ${request.platform}`}
        cost={total}
        balance={currentBalance}
        loading={busy}
      />
    </div>
  );
}

/* ── Account detail / "Manage" view (approved accounts) ─────────────────── */
const AD_DETAIL_CSS = `
@keyframes adBarShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
@keyframes adBarGlow { 0%,100% { opacity: .7; } 50% { opacity: 1; } }
@keyframes adBadgePop { 0% { transform: scale(0) rotate(-12deg); opacity: 0; } 70% { transform: scale(1.18) rotate(4deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
@keyframes adPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(232,25,44,.55); } 50% { box-shadow: 0 0 0 8px rgba(232,25,44,0); } }
`;

function AccountDetail({ account, approvedAccounts, allRequests, onBack, onTopUp, onSwitch }) {
  const [settings, setSettings] = useState({ creditLineColor: '#e8192c', milestones: [] });

  useEffect(() => {
    fetch('/api/agency-settings', { credentials: 'same-origin' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d) setSettings(d); })
      .catch(() => {});
  }, []);

  const isTopup = (r) => String(r.account_name || '').startsWith('Top-up:');
  const name = account.account_name || account.business_name || '—';

  const accountTopups = allRequests.filter(r =>
    isTopup(r)
      ? (String(r.account_name || '').replace(/^Top-up:\s*/i, '') === name || r.business_name === account.business_name)
      : false
  );

  const totalFunded = accountTopups
    .filter(r => /approved|completed/i.test(r.status || ''))
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const pending = accountTopups
    .filter(r => /pending|in.?review/i.test(r.status || ''))
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const milestones = (settings.milestones || []).filter(m =>
    m.scope === 'global' ||
    (m.scope === 'specific' && (m.accountIds || []).some(id => String(id) === String(account.id)))
  );
  const color = settings.creditLineColor || '#e8192c';
  const nextMilestone = milestones.find(m => m.amount > totalFunded);
  const target = nextMilestone ? nextMilestone.amount : Math.max(totalFunded * 2, 1e4);
  const progress = totalFunded > 0 ? Math.min((totalFunded / target) * 100, 100) : 0;
  const achieved = milestones.filter(m => totalFunded >= m.amount);
  const currentBadge = achieved[achieved.length - 1] || null;

  const money = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const short = (n) => {
    const v = Number(n || 0);
    return v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v}`;
  };

  const statusMap = {
    approved:  { dot: '#10b981', label: '#10b981', bg: 'rgba(16,185,129,.12)' },
    pending:   { dot: '#f59e0b', label: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
    in_review: { dot: '#3b82f6', label: '#3b82f6', bg: 'rgba(59,130,246,.12)' },
    rejected:  { dot: '#ef4444', label: '#ef4444', bg: 'rgba(239,68,68,.12)' },
  };
  const statusStyle = statusMap[account.status] || statusMap.pending;

  const detailRows = [
    ['Request ID', account.request_id || `#${account.id}`],
    ['Platform', account.platform],
    ['Business', account.business_name],
    ['Business Type', account.business_type],
    ['Email', account.business_email],
    ['Timezone', account.timezone],
    ['Currency', account.currency],
    ['BM ID', account.bm_id],
    ['Submitted', fmtDate(account.submitted_at || account.created_at)],
  ].filter(([, v]) => v);

  return (
    <div className="page" data-screen-label="Account Detail">
      <style>{AD_DETAIL_CSS}</style>

      {/* ── Header card ── */}
      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, var(--bg-card) 60%, var(--line) 100%)', border: '1.5px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,25,44,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 58, height: 58, borderRadius: 16, background: 'var(--bg-main)', border: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}>
              <PlatformIcon platform={account.platform} size={30} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.025em' }}>{name}</span>
                {currentBadge && (
                  <span title={currentBadge.label} style={{ fontSize: 20, animation: 'adBadgePop .5s cubic-bezier(.16,1,.3,1) both', cursor: 'default' }}>{currentBadge.icon}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: statusStyle.bg, fontSize: 11, fontWeight: 700, color: statusStyle.label }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusStyle.dot, animation: 'adPulse 2s ease-in-out infinite' }} />
                  {(account.status || 'pending').replace('_', ' ')}
                </span>
                <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{account.platform}</span>
                {account.timezone && (<><span style={{ color: 'var(--line)' }}>·</span><span style={{ fontSize: 12, color: 'var(--muted)' }}>{account.timezone}</span></>)}
                {account.currency && (<><span style={{ color: 'var(--line)' }}>·</span><span style={{ fontSize: 12, color: 'var(--muted)' }}>{account.currency}</span></>)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {approvedAccounts.length > 1 && (
              <div style={{ position: 'relative' }}>
                <select
                  value={account.id}
                  onChange={e => onSwitch(approvedAccounts.find(a => String(a.id) === e.target.value))}
                  style={{ appearance: 'none', background: 'var(--bg-main)', border: '1.5px solid var(--line)', borderRadius: 10, padding: '9px 36px 9px 14px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', fontFamily: 'inherit', outline: 'none', minWidth: 180 }}
                >
                  {approvedAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.account_name || a.business_name || `#${a.id}`}</option>
                  ))}
                </select>
                <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
              </div>
            )}
            <button className="btn btn--accent" onClick={() => onTopUp(account)} style={{ gap: 7, padding: '10px 20px', fontSize: 14, fontWeight: 700 }}>
              <Icon name="plus" size={14} stroke={2.5} /> Top Up
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Funded', value: money(totalFunded), sub: 'Approved top-ups', color: '#10b981', icon: '↑' },
          { label: 'Pending', value: money(pending), sub: 'Awaiting approval', color: '#f59e0b', icon: '⏳' },
          { label: 'Top-up Count', value: String(accountTopups.length), sub: 'Total requests', color: '#3b82f6', icon: '#' },
          { label: 'Completed', value: String(accountTopups.filter(r => /approved|completed/i.test(r.status || '')).length), sub: 'Approved top-ups', color: '#a78bfa', icon: '✓' },
        ].map(({ label, value, sub, color: c, icon }) => (
          <div key={label} className="card" style={{ padding: '18px 20px', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: `${c}18`, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>{icon}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.02em', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Credit line / milestones ── */}
      <div className="card" style={{ marginBottom: 20, padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 3 }}>Credit Line</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.03em', lineHeight: 1 }}>{money(totalFunded)}</span>
              {pending > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,.1)', borderRadius: 99, padding: '2px 8px', border: '1px solid rgba(245,158,11,.2)' }}>+{money(pending)} pending</span>
              )}
            </div>
          </div>
          {nextMilestone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 10, background: `${nextMilestone.color || '#f59e0b'}0d`, border: `1px solid ${nextMilestone.color || '#f59e0b'}30` }}>
              <span style={{ fontSize: 18 }}>{nextMilestone.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: nextMilestone.color || '#f59e0b' }}>{nextMilestone.label}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{money(nextMilestone.amount - totalFunded)} away</div>
              </div>
            </div>
          ) : milestones.length > 0 ? (
            <div style={{ fontSize: 13, fontWeight: 700 }}>🏆 All milestones reached!</div>
          ) : null}
        </div>

        {milestones.length > 0 && (
          <div style={{ position: 'relative', height: 20, marginBottom: 3 }}>
            {milestones.map(m => {
              const left = Math.min((m.amount / target) * 100, 100);
              const reached = totalFunded >= m.amount;
              return (
                <div key={m.id || m.amount} title={`${m.label} — ${money(m.amount)}`} style={{ position: 'absolute', left: `${left}%`, transform: 'translateX(-50%)', cursor: 'default' }}>
                  <span style={{ fontSize: 13, filter: reached ? 'none' : 'grayscale(1) opacity(.3)', transition: 'filter .3s', animation: reached ? 'adBadgePop .4s cubic-bezier(.16,1,.3,1) both' : 'none' }}>{m.icon}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ height: 7, borderRadius: 99, background: 'var(--line)', position: 'relative', overflow: 'visible', marginBottom: milestones.length > 0 ? 0 : 4 }}>
          <div style={{ height: '100%', borderRadius: 99, width: `${progress}%`, position: 'relative', overflow: 'hidden', background: progress > 0 ? `linear-gradient(90deg, ${color}, ${color}cc)` : 'transparent', boxShadow: progress > 0 ? `0 0 14px ${color}80, 0 0 4px ${color}` : 'none', transition: 'width 1s cubic-bezier(.16,1,.3,1)' }}>
            {progress > 0 && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.3) 50%, transparent 100%)', animation: 'adBarShimmer 2.2s ease-in-out infinite', width: '40%' }} />}
          </div>
          {progress > 0 && progress < 100 && (
            <div style={{ position: 'absolute', top: '50%', left: `${progress}%`, transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: '50%', background: color, border: '2px solid var(--bg-card)', animation: 'adPulse 1.8s ease-in-out infinite', zIndex: 2 }} />
          )}
          {milestones.map(m => {
            const left = Math.min((m.amount / target) * 100, 100);
            const reached = totalFunded >= m.amount;
            return <div key={m.id || m.amount} style={{ position: 'absolute', top: -2, left: `${left}%`, transform: 'translateX(-50%)', width: 2, height: 11, borderRadius: 99, background: reached ? (m.color || color) : 'var(--muted-2)', opacity: .5, zIndex: 1 }} />;
          })}
        </div>

        {milestones.length > 0 && (
          <div style={{ position: 'relative', height: 16, marginTop: 4 }}>
            {milestones.map(m => {
              const left = Math.min((m.amount / target) * 100, 100);
              const reached = totalFunded >= m.amount;
              return <div key={m.id || m.amount} style={{ position: 'absolute', left: `${left}%`, transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, color: reached ? (m.color || color) : 'var(--muted-2)', whiteSpace: 'nowrap' }}>{short(m.amount)}</div>;
            })}
          </div>
        )}

        {achieved.length > 0 && (
          <div style={{ borderTop: '1px solid var(--line)', marginTop: 14, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>🏆 Achievements Unlocked</div>
            {achieved.map((m, idx) => (
              <div key={m.id || m.amount} style={{ borderRadius: 12, border: `1.5px solid ${m.color || color}35`, background: `${m.color || color}0c`, overflow: 'hidden', animation: `adBadgePop .4s ${idx * 0.08}s cubic-bezier(.16,1,.3,1) both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${m.color || color}20`, border: `1.5px solid ${m.color || color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{m.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: m.color || color }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{money(m.amount)} milestone reached</div>
                  </div>
                  <div style={{ flexShrink: 0, padding: '3px 9px', borderRadius: 99, background: `${m.color || color}20`, border: `1px solid ${m.color || color}40`, fontSize: 10, fontWeight: 700, color: m.color || color }}>UNLOCKED</div>
                </div>
                {m.rewardMessage && (
                  <div style={{ padding: '10px 14px', borderTop: `1px solid ${m.color || color}20`, background: `${m.color || color}08`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.4 }}>🎁</span>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--ink)', lineHeight: 1.6, fontStyle: 'italic', opacity: .9 }}>{m.rewardMessage}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {milestones.length === 0 && (
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--muted)' }}>
            {progress > 0 ? `${progress.toFixed(1)}% of next tier — keep topping up!` : 'Top up your account to build your credit line.'}
          </div>
        )}
      </div>

      {/* ── History + details ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Top-up History</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--line)', borderRadius: 99, padding: '2px 9px' }}>{accountTopups.length}</span>
          </div>
          {accountTopups.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>💳</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>No top-ups yet</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Click "Top Up" to add funds and start earning milestones.</div>
            </div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Transaction ID</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {accountTopups.map(r => (
                  <tr key={r.id}>
                    <td className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)' }}>{r.request_id || `#${r.id}`}</td>
                    <td className="mono" style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 14 }}>{money(r.amount)}</td>
                    <td className="mono" style={{ color: 'var(--muted)', fontSize: 12 }}>{fmtDate(r.submitted_at || r.created_at)}</td>
                    <td><StatusPill status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Account Details</span>
          </div>
          <div>
            {detailRows.map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 20px', borderBottom: i < detailRows.length - 1 ? '1px solid var(--line)' : 'none', fontSize: 13 }}>
                <span style={{ color: 'var(--muted)', fontWeight: 500, flexShrink: 0 }}>{k}</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)', textAlign: 'right', wordBreak: 'break-all', textTransform: k === 'Platform' ? 'capitalize' : 'none' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgencyAdAccounts() {
  const { user } = useAuth();
  const [store] = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tab, setTab] = useState('accounts'); // 'accounts' | 'topups'
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [topupRequest, setTopupRequest] = useState(null);
  const [managedAccount, setManagedAccount] = useState(null);

  const load = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    api
      .get('/api/ad-account-requests?order=created_at&ascending=false')
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.items || []);
        setStore((s) => ({ ...s, adAccountRequests: list }));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const all = store.adAccountRequests || [];
  // Separate top-ups from account creation requests
  const isTopup = (r) => String(r.account_name || '').startsWith('Top-up:');
  const accountRequests = all.filter(r => !isTopup(r));
  const topupRequests   = all.filter(r =>  isTopup(r));

  const approvedAccounts = accountRequests.filter(r => /^approved$/i.test(r.status || ''));

  const activeList = tab === 'accounts' ? accountRequests : topupRequests;
  const filtered = activeList.filter((r) => {
    if (statusFilter !== 'all' && (r.status || '').toLowerCase() !== statusFilter) return false;
    if (platformFilter !== 'all' && (r.platform || '').toLowerCase() !== platformFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!`${r.id} ${r.business_name} ${r.account_name} ${r.platform}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totals = {
    all: all.length,
    approved: all.filter((r) => /approved|active/i.test(r.status || '')).length,
    pending: all.filter((r) => /pending|in-review|review/i.test(r.status || '')).length,
    rejected: all.filter((r) => /rejected|failed/i.test(r.status || '')).length,
  };

  // ── Manage (account detail) view ──
  if (managedAccount) {
    return (
      <Layout
        active="agency-ad-accounts"
        crumbs={['Workspace', { label: 'Agency Ad Accounts', onClick: () => setManagedAccount(null) }]}
      >
        <AccountDetail
          account={managedAccount}
          approvedAccounts={approvedAccounts}
          allRequests={all}
          onBack={() => setManagedAccount(null)}
          onTopUp={(r) => setTopupRequest(r)}
          onSwitch={(a) => setManagedAccount(a)}
        />
        {topupRequest && (
          <TopUpModal
            request={topupRequest}
            onClose={() => setTopupRequest(null)}
            currentBalance={store.balance ?? 0}
            onSuccess={(created, cost) => {
              setStore((s) => ({
                ...s,
                adAccountRequests: [created, ...(s.adAccountRequests || [])],
                balance: typeof s.balance === 'number' ? s.balance - (cost || 0) : s.balance,
              }));
              setSuccess('Top-up submitted. We\'ll process it shortly.');
            }}
          />
        )}
      </Layout>
    );
  }

  return (
    <Layout active="agency-ad-accounts" crumbs={['Workspace', 'Agency Ad Accounts']}>
      <div className="page" data-screen-label="Agency Ad Accounts">
        <PageHead
          eyebrow="Agency"
          title="Agency"
          titleAccent="ad accounts"
          subtitle="Request, manage, and monitor your agency-provisioned ad accounts across every platform."
          actions={
            <>
              <button className="btn"><Icon name="export" size={14} />Export</button>
              <button className="btn btn--accent" onClick={() => setShowModal(true)}>
                <Icon name="plus" size={14} stroke={2.5} />Create Ad Account
              </button>
            </>
          }
        />

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        {success && <SuccessBanner message={success} onDismiss={() => setSuccess(null)} />}

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <KPI icon="building" label="Ad accounts" value={loading ? '—' : String(accountRequests.length)} footer="All time" />
          <KPI icon="check"    label="Approved"    value={loading ? '—' : String(accountRequests.filter(r => /approved/i.test(r.status || '')).length)} footer="Active accounts" />
          <KPI icon="clock"    label="Pending"     value={loading ? '—' : String(accountRequests.filter(r => /pending|review/i.test(r.status || '')).length)} footer="Under review" />
          <KPI icon="arrow-up" label="Top-ups"     value={loading ? '—' : String(topupRequests.length)} footer="All top-up requests" />
        </div>

        {/* ── Section tabs ── */}
        <div className="tabs">
          <button
            className={'tab' + (tab === 'accounts' ? ' tab--active' : '')}
            onClick={() => { setTab('accounts'); setStatusFilter('all'); setQuery(''); }}
          >
            Account Requests
            {!loading && <span style={{ marginLeft: 7, fontSize: 11, fontFamily: 'Geist Mono, monospace', opacity: .7 }}>{accountRequests.length}</span>}
          </button>
          <button
            className={'tab' + (tab === 'topups' ? ' tab--active' : '')}
            onClick={() => { setTab('topups'); setStatusFilter('all'); setQuery(''); }}
          >
            Top Up Requests
            {!loading && <span style={{ marginLeft: 7, fontSize: 11, fontFamily: 'Geist Mono, monospace', opacity: .7 }}>{topupRequests.length}</span>}
          </button>
        </div>

        <div className="card">
          <div className="toolbar">
            <div className="input-wrap" style={{ flex: 1, maxWidth: 340 }}>
              <Icon name="search" size={14} />
              <input
                className="input input--search"
                placeholder={tab === 'accounts' ? 'Search by ID, business, account name…' : 'Search by ID or platform…'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {tab === 'accounts' && (
              <select className="select" style={{ width: 160 }} value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}>
                <option value="all">All platforms</option>
                {PLATFORMS_FALLBACK.map((p) => <option key={p} value={p.toLowerCase()}>{p}</option>)}
              </select>
            )}
            <div style={{ flex: 1 }} />
            {/* Status filter chips */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { k: 'all', label: 'All' },
                { k: 'approved', label: 'Approved', dot: 'var(--success)' },
                { k: 'pending',  label: 'Pending',  dot: 'var(--warn)'    },
                { k: 'rejected', label: 'Rejected', dot: 'var(--accent)'  },
              ].map(s => (
                <button
                  key={s.k}
                  className={'chip' + (statusFilter === s.k ? ' chip--active' : '')}
                  onClick={() => setStatusFilter(s.k)}
                  style={{ fontSize: 12, padding: '4px 10px' }}
                >
                  {s.dot && <span className="dot" style={{ background: s.dot }} />}
                  {s.label}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              <span className="mono" style={{ color: 'var(--ink)', fontWeight: 600 }}>{filtered.length}</span>
            </span>
          </div>

          {loading ? (
            <SkeletonRows rows={5} />
          ) : filtered.length === 0 ? (
            tab === 'accounts' ? (
              <EmptyState
                icon="building"
                title={accountRequests.length === 0 ? 'No ad account requests yet' : 'No requests match your filters'}
                description="Create your first request — we typically provision within a business day."
                action={<button className="btn btn--accent" onClick={() => setShowModal(true)}><Icon name="plus" size={14} />Create Ad Account</button>}
              />
            ) : (
              <EmptyState
                icon="arrow-up"
                title="No top-up requests yet"
                description="Once your account is approved, click 'Top Up' to add funds."
              />
            )
          ) : tab === 'topups' ? (
            /* ── TOP UP REQUESTS TABLE ── */
            <table className="tbl">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Account</th>
                  <th>Platform</th>
                  <th>Amount</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="mono" style={{ fontWeight: 600, fontSize: 11.5 }}>
                      {r.request_id || `#${r.id}`}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {String(r.account_name || '').replace(/^Top-up:\s*/i, '') || r.business_name || '—'}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{r.business_name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <PlatformIcon platform={r.platform} size={24} />
                        <span style={{ textTransform: 'capitalize' }}>{r.platform}</span>
                      </div>
                    </td>
                    <td className="mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                      {r.amount != null ? `$${Number(r.amount).toFixed(2)}` : '—'}
                    </td>
                    <td className="mono" style={{ color: 'var(--muted)' }}>{fmtDate(r.submitted_at || r.created_at)}</td>
                    <td><StatusPill status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* ── ACCOUNT REQUESTS TABLE ── */
            <table className="tbl">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Account / Business</th>
                  <th>Platform</th>
                  <th>Type</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ width: 140 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>#{r.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.account_name || r.business_name || '—'}</div>
                      {r.business_name && r.account_name && (
                        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{r.business_name}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <PlatformIcon platform={r.platform} size={26} />
                        <span>{r.platform}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{r.business_type || '—'}</td>
                    <td className="mono" style={{ color: 'var(--muted)' }}>{fmtDate(r.submitted_at || r.created_at)}</td>
                    <td><StatusPill status={r.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {/^approved$/i.test(r.status || '') && (
                          <button
                            className="btn btn--sm btn--accent"
                            onClick={() => setTopupRequest(r)}
                            style={{ fontSize: 12, padding: '5px 12px' }}
                          >
                            <Icon name="plus" size={11} stroke={2.5} /> Top Up
                          </button>
                        )}
                        {/^approved$/i.test(r.status || '') ? (
                          <button
                            className="btn btn--sm"
                            onClick={() => setManagedAccount(r)}
                            style={{ gap: 5 }}
                          >
                            Manage <Icon name="arrow-right" size={11} />
                          </button>
                        ) : (
                          <button
                            className="btn btn--sm btn--ghost"
                            style={{ gap: 5, opacity: .5, cursor: 'default' }}
                            disabled
                          >
                            Details <Icon name="arrow-right" size={11} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <CreateModal
            onClose={() => setShowModal(false)}
            currentBalance={store.balance ?? 0}
            onCreated={(created, cost) => {
              setStore((s) => ({
                ...s,
                adAccountRequests: [created, ...(s.adAccountRequests || [])],
                balance: typeof s.balance === 'number' ? s.balance - (cost || 0) : s.balance,
              }));
              setSuccess('Request submitted. We\'ll notify you when it\'s ready.');
            }}
          />
        )}

        {topupRequest && (
          <TopUpModal
            request={topupRequest}
            onClose={() => setTopupRequest(null)}
            currentBalance={store.balance ?? 0}
            onSuccess={(created, cost) => {
              setStore((s) => ({
                ...s,
                adAccountRequests: [created, ...(s.adAccountRequests || [])],
                balance: typeof s.balance === 'number' ? s.balance - (cost || 0) : s.balance,
              }));
              setSuccess('Top-up submitted. We\'ll process it shortly.');
            }}
          />
        )}
      </div>
    </Layout>
  );
}
