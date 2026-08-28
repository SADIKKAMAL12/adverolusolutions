import { useEffect, useRef, useState } from 'react';
import { Layout } from '../shared/Layout.jsx';
import { PageHead, EmptyState, ErrorBanner, SuccessBanner, fmtMoney } from '../shared/UI.jsx';
import { api } from '../shared/api.js';
import { useStore, setStore } from '../shared/store.js';
import { useAuth } from '../shared/AuthContext.jsx';

const FONT = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';

const STATUS_META = {
  pending:   { label: 'Waiting for code', pill: 'pill--warn' },
  completed: { label: 'Completed',        pill: 'pill--success' },
  refunded:  { label: 'Refunded',         pill: 'pill--info' },
  expired:   { label: 'Expired',          pill: 'pill--danger' },
  cancelled: { label: 'Cancelled',        pill: 'pill--danger' },
};

const DURATIONS = [
  { value: 'oneDay',      label: '1 Day' },
  { value: 'threeDay',    label: '3 Days' },
  { value: 'sevenDay',    label: '7 Days' },
  { value: 'fourteenDay', label: '14 Days' },
  { value: 'thirtyDay',   label: '1 Month' },
];

function durationLabel(value) {
  return DURATIONS.find(d => d.value === value)?.label || value;
}

/* ---------------- icons ---------------- */
const Icon = {
  Copy: (p) => (<svg viewBox="0 0 24 24" fill="none" width="15" height="15" {...p}><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.7" /></svg>),
  Phone: (p) => (<svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...p}><path d="M6.5 3h3l1.5 4-2 1.5a11 11 0 005.5 5.5l1.5-2 4 1.5v3a2 2 0 01-2 2A16 16 0 014.5 5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>),
  Close: (p) => (<svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...p}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>),
  Alert: (p) => (<svg viewBox="0 0 24 24" fill="none" width="17" height="17" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="currentColor" /></svg>),
  Spinner: (p) => (<svg viewBox="0 0 24 24" width="14" height="14" {...p} style={{ animation: 'pv-spin .8s linear infinite' }}><circle cx="12" cy="12" r="9" stroke="var(--line)" strokeWidth="3" fill="none" /><path d="M21 12a9 9 0 00-9-9" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" fill="none" /></svg>),
};

/* ---------------- service logo (real upload, letter-avatar fallback) ---------------- */
const AVATAR_COLORS = ['#22c55e', '#0ea5e9', '#f59e0b', '#2563eb', '#db2777', '#111111', '#6366f1', '#f97316', '#7c3aed', '#16a34a'];
function avatarColorFor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function ServiceLogo({ logo, label, size = 40 }) {
  if (logo) {
    return (
      <div style={{ width: size, height: size, borderRadius: size * 0.32, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-sunken)' }}>
        <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: size * 0.1 }} />
      </div>
    );
  }
  const color = avatarColorFor(label || '?');
  const letter = (label || '?').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32, background: color, color: '#fff',
      display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: size * 0.36, flexShrink: 0,
      letterSpacing: '-0.02em', boxShadow: `0 6px 16px -6px ${color}99`,
    }}>
      {letter}
    </div>
  );
}

function StatusPill({ purchase }) {
  // A rental that received real codes and simply ran out its duration isn't a failure —
  // reserve the red "Expired" pill for rentals that genuinely got nothing.
  const meta = (purchase.mode === 'rental' && purchase.status === 'expired' && purchase.code)
    ? { label: 'Rental ended', pill: 'pill--success' }
    : (STATUS_META[purchase.status] || STATUS_META.pending);
  return (
    <span className={`pill ${meta.pill}`} style={{ fontSize: 11.5, fontWeight: 700 }}>
      <span className="pill__dot" />
      {meta.label}
    </span>
  );
}

/* ---------------- mode / duration pill toggles ---------------- */
function PillToggle({ options, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 100, background: 'var(--bg-sunken)', border: '1px solid var(--line)' }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              padding: '9px 20px', borderRadius: 100, fontSize: 13.5, fontWeight: 700, fontFamily: FONT,
              border: 'none', cursor: 'pointer',
              background: active ? 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 85%, white 15%), var(--accent))' : 'transparent',
              color: active ? '#fff' : 'var(--muted)',
              boxShadow: active ? '0 8px 20px -8px color-mix(in srgb, var(--accent) 60%, transparent)' : 'none',
              transition: 'all .2s',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function DurationPills({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {DURATIONS.map((d) => {
        const active = d.value === value;
        return (
          <button
            key={d.value}
            onClick={() => onChange(d.value)}
            style={{
              padding: '8px 16px', borderRadius: 100, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
              background: active ? 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 85%, white 15%), var(--accent))' : 'var(--bg-card)',
              border: active ? '1px solid transparent' : '1px solid var(--line)',
              color: active ? '#fff' : 'var(--ink)',
              boxShadow: active ? '0 6px 16px -6px color-mix(in srgb, var(--accent) 50%, transparent)' : 'none',
              transition: 'all .2s',
            }}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</div>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  );
}

/* ---------------- live "active purchase" card ---------------- */
function ActivePurchaseCard({ purchase, onUpdate }) {
  const pollRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const isRental = purchase.mode === 'rental';

  useEffect(() => {
    if (purchase.status !== 'pending') return;
    const startedAt = Date.now();
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);

    const poll = async () => {
      try {
        const data = await api.get(`/api/adversolutionsotp?action=status&id=${purchase.id}`);
        onUpdate(data);
      } catch { /* keep waiting, transient network errors shouldn't stop polling */ }
    };
    poll();
    pollRef.current = setInterval(poll, 4000);
    return () => { clearInterval(pollRef.current); clearInterval(tick); };
  }, [purchase.id, purchase.status]);

  const copyCode = () => {
    navigator.clipboard.writeText(purchase.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cancel = async () => {
    const verb = isRental ? 'rental' : 'number';
    if (!window.confirm(`Cancel this ${purchase.service_label} ${verb} and get a refund?`)) return;
    setCancelling(true);
    setCancelError('');
    try {
        const updated = await api.post('/api/adversolutionsotp?action=cancel', { id: purchase.id });
      onUpdate(updated);
    } catch (e) {
      setCancelError(e.message);
    } finally {
      setCancelling(false);
    }
  };

  const statusLabel = isRental ? 'Rental active' : 'Waiting for code';

  return (
    <div style={{
      position: 'relative', overflow: 'hidden', padding: 20, borderRadius: 20,
      background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 25%, var(--line))',
      boxShadow: '0 0 0 1px color-mix(in srgb, var(--accent) 8%, transparent), 0 12px 30px -16px color-mix(in srgb, var(--accent) 30%, transparent)',
    }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 160, height: 160, borderRadius: 999, background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 20%, transparent), transparent 70%)', filter: 'blur(10px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
        <ServiceLogo logo={purchase.service_logo} label={purchase.service_label} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>
            {purchase.service_label}
            {isRental && purchase.duration && <span style={{ marginLeft: 8, fontSize: 11.5, fontWeight: 700, color: 'var(--muted-2)' }}>· {durationLabel(purchase.duration)}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Icon.Spinner />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{statusLabel}</span>
          </div>
        </div>
      </div>

      {purchase.phone_number && (
        <div style={{ position: 'relative', marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'var(--bg-sunken)' }}>
          <Icon.Phone style={{ color: 'var(--muted)' }} />
          <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{purchase.phone_number}</span>
        </div>
      )}

      {!purchase.code ? (
        <div style={{ position: 'relative', marginTop: 12, fontSize: 12.5, color: 'var(--muted)' }}>
          {isRental ? 'Any codes sent to this number will appear here.' : `Waiting for the code to arrive… ${elapsed}s`}
        </div>
      ) : (
        <div style={{
          position: 'relative', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          padding: '12px 16px', borderRadius: 12, background: 'var(--accent-50)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
        }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Code received</div>
            <div className="mono" style={{ marginTop: 2, fontSize: 22, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--ink)' }}>{purchase.code}</div>
          </div>
          <button onClick={copyCode} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 100, background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)', color: 'var(--accent)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
            <Icon.Copy /> {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {purchase.status === 'pending' && (
        <>
          {cancelError && <div style={{ position: 'relative', marginTop: 10, fontSize: 12, color: 'var(--accent)' }}>{cancelError}</div>}
          <button
            onClick={cancel}
            disabled={cancelling}
            style={{ position: 'relative', marginTop: 14, width: '100%', height: 40, borderRadius: 10, background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 13, fontWeight: 700, cursor: cancelling ? 'not-allowed' : 'pointer', fontFamily: FONT }}
          >
            {cancelling ? 'Cancelling…' : 'Cancel & Refund'}
          </button>
        </>
      )}
    </div>
  );
}

/* ---------------- buy confirmation modal ---------------- */
function BuyConfirmModal({ service, mode, duration, currentBalance, onConfirm, onClose, confirming }) {
  const balanceAfter = currentBalance - service.price;
  const isRental = mode === 'rental';
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,8,0.55)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 380, background: 'var(--bg-card)', borderRadius: 24, padding: 26, boxShadow: 'var(--shadow-md)', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{isRental ? 'Confirm rental' : 'Confirm purchase'}</h3>
          <button onClick={onClose} style={{ background: 'var(--bg-sunken)', border: 'none', borderRadius: 999, width: 28, height: 28, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--muted)' }}>
            <Icon.Close />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, padding: 14, borderRadius: 16, background: 'var(--bg-sunken)' }}>
          <ServiceLogo logo={service.logo} label={service.label} size={40} />
          <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)' }}>{service.label}</div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isRental && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
              <span style={{ color: 'var(--muted)' }}>Duration</span>
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{durationLabel(duration)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
            <span style={{ color: 'var(--muted)' }}>Price</span>
            <span className="mono" style={{ fontWeight: 700, color: 'var(--ink)' }}>{fmtMoney(service.price)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
            <span style={{ color: 'var(--muted)' }}>Current balance</span>
            <span className="mono" style={{ fontWeight: 700, color: 'var(--ink)' }}>{fmtMoney(currentBalance)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--muted)' }}>Balance after</span>
            <span className="mono" style={{ fontWeight: 800, color: balanceAfter < 0 ? 'var(--accent)' : 'var(--ink)' }}>{fmtMoney(Math.max(0, balanceAfter))}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, height: 46, borderRadius: 100, background: 'var(--bg-sunken)', border: 'none', color: 'var(--ink)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            style={{
              flex: 1.4, height: 46, borderRadius: 100, border: 'none',
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 85%, white 15%), var(--accent))',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: confirming ? 'not-allowed' : 'pointer', fontFamily: FONT,
              boxShadow: '0 14px 28px -10px color-mix(in srgb, var(--accent) 60%, transparent)',
              opacity: confirming ? 0.7 : 1,
            }}
          >
            {confirming ? 'Purchasing…' : `Buy for ${fmtMoney(service.price)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- service card ---------------- */
function ServiceCard({ service, mode, buying, onBuy }) {
  const [hover, setHover] = useState(false);
  const label = mode === 'rental' ? 'Rent Number' : 'Buy Number';
  const isBuying = buying === service.service_name;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hover && service.available ? 'color-mix(in srgb, var(--accent) 35%, transparent)' : 'var(--line)'}`,
        borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'all .25s',
        transform: hover && service.available ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hover && service.available ? '0 0 0 1px color-mix(in srgb, var(--accent) 8%, transparent), 0 12px 30px -16px color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ServiceLogo logo={service.logo} label={service.label} />
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{service.label}</div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
        {service.price != null ? fmtMoney(service.price) : 'Unavailable'}
      </div>
      <button
        onClick={() => service.available && onBuy(service)}
        disabled={!service.available || isBuying}
        style={{
          height: 42, borderRadius: 100, border: 'none', fontSize: 13.5, fontWeight: 700, fontFamily: FONT,
          cursor: service.available && !isBuying ? 'pointer' : 'not-allowed',
          background: service.available ? 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 85%, white 15%), var(--accent))' : 'var(--bg-sunken)',
          color: service.available ? '#fff' : 'var(--muted-2)',
          boxShadow: service.available ? '0 10px 22px -8px color-mix(in srgb, var(--accent) 50%, transparent)' : 'none',
        }}
      >
        {isBuying ? 'Purchasing…' : service.available ? label : 'Unavailable'}
      </button>
    </div>
  );
}

export default function PhoneVerifications() {
  const { user } = useAuth();
  const [store] = useStore();
  const currentBalance = store.balance ?? 0;

  const [mode, setMode] = useState('verification'); // 'verification' | 'rental'
  const [duration, setDuration] = useState('sevenDay');
  const [services, setServices] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null); // service_name currently being purchased
  const [confirmService, setConfirmService] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadServices = async () => {
    setLoading(true);
    try {
      const params = mode === 'rental' ? `&mode=rental&duration=${duration}` : '';
        const svc = await api.get(`/api/adversolutionsotp?action=services${params}`);
      setServices(Array.isArray(svc) ? svc : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
        const hist = await api.get('/api/adversolutionsotp?action=history');
      setHistory(Array.isArray(hist) ? hist : []);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { loadHistory(); }, [user]);
  useEffect(() => { loadServices(); }, [user, mode, duration]);

  const activePurchases = history.filter(h => h.status === 'pending');
  const pastPurchases = history.filter(h => h.status !== 'pending');

  const handleUpdate = (updated) => {
    setHistory(prev => prev.map(h => h.id === updated.id ? updated : h));
  };

  const openConfirm = (service) => {
    setError(null);
    setSuccess(null);
    if (service.price == null) return;
    if (currentBalance < service.price) {
      setError('Insufficient balance. Please top up your wallet first.');
      return;
    }
    setConfirmService(service);
  };

  const confirmBuy = async () => {
    const service = confirmService;
    if (!service) return;
    setBuying(service.service_name);
    try {
        const purchase = await api.post('/api/adversolutionsotp?action=purchase', {
        service_name: service.service_name,
        mode,
        duration: mode === 'rental' ? duration : undefined,
      });
      setHistory(prev => [{ ...purchase, service_label: service.label, service_logo: service.logo }, ...prev]);
      setStore(s => ({ ...s, balance: typeof s.balance === 'number' ? s.balance - service.price : s.balance }));
      setSuccess(mode === 'rental'
        ? `${durationLabel(duration)} rental purchased for ${service.label}.`
        : `Number purchased for ${service.label}. Waiting for the code below.`);
      setConfirmService(null);
    } catch (e) {
      setError(e.message);
      setConfirmService(null);
    } finally {
      setBuying(null);
    }
  };

  const modeOptions = [
    { value: 'verification', label: 'Pay Per Use' },
    { value: 'rental', label: 'Rental' },
  ];

  return (
    <Layout active="phone-verifications" crumbs={['Workspace', 'Phone Verifications']}>
      <div className="page" data-screen-label="Phone Verifications" style={{ fontFamily: FONT }}>
        <style>{`@keyframes pv-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        <PageHead
          eyebrow="SMS Verification"
          title="Phone Verifications"
          subtitle="Buy a temporary number and receive an SMS verification code instantly, or rent one for longer."
        />

        <div style={{ marginTop: 22, marginBottom: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <PillToggle options={modeOptions} value={mode} onChange={setMode} />
          {mode === 'rental' && <DurationPills value={duration} onChange={setDuration} />}
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        {success && <SuccessBanner message={success} onDismiss={() => setSuccess(null)} />}

        {activePurchases.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <SectionLabel>Active Purchases</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 8 }}>
              {activePurchases.map(p => (
                <ActivePurchaseCard key={p.id} purchase={p} onUpdate={handleUpdate} />
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <SectionLabel>Available Services</SectionLabel>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
          ) : services.length === 0 ? (
            <EmptyState
              icon="package"
              title="No services available yet"
              description="Ask an admin to enable services for phone verification."
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {services.map(s => (
                <ServiceCard key={s.service_name} service={s} mode={mode} buying={buying} onBuy={openConfirm} />
              ))}
            </div>
          )}
        </div>

        {pastPurchases.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <SectionLabel>History</SectionLabel>
            <div style={{ border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden', background: 'var(--bg-card)' }}>
              {pastPurchases.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', flexWrap: 'wrap',
                  borderTop: i > 0 ? '1px solid var(--line)' : 'none',
                }}>
                  <ServiceLogo logo={p.service_logo} label={p.service_label} size={32} />
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>
                      {p.service_label}
                      {p.mode === 'rental' && p.duration && <span style={{ fontWeight: 600, color: 'var(--muted-2)' }}> · {durationLabel(p.duration)}</span>}
                    </div>
                    <div className="mono" style={{ fontSize: 12, color: p.code ? 'var(--ink)' : 'var(--muted-2)', marginTop: 2 }}>
                      {p.code ? `Code: ${p.code}` : 'No code received'}
                    </div>
                  </div>
                  <StatusPill purchase={p} />
                  <span className="mono" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', minWidth: 60, textAlign: 'right' }}>{fmtMoney(p.cost_charged)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {confirmService && (
          <BuyConfirmModal
            service={confirmService}
            mode={mode}
            duration={duration}
            currentBalance={currentBalance}
            confirming={buying === confirmService.service_name}
            onConfirm={confirmBuy}
            onClose={() => setConfirmService(null)}
          />
        )}
      </div>
    </Layout>
  );
}
