import { useEffect, useState } from 'react';
import { useNavigate } from '../shared/Router.jsx';
import { useTheme } from '../shared/ThemeContext.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import { Plus, Copy, Trash2, X, Link2 } from 'lucide-react';

const DEFAULT_PLATFORMS = [
  { key: 'meta', label: 'Meta' },
  { key: 'google', label: 'Google' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'snapchat', label: 'Snapchat' },
];

const STATUS_META = {
  pending: { label: 'Awaiting Submission', color: '#9ca3af', bg: 'rgba(148,148,152,0.16)' },
  requested: { label: 'Requested', color: '#f59e0b', bg: 'rgba(245,158,11,0.16)' },
  in_review: { label: 'In Review', color: '#3b82f6', bg: 'rgba(59,130,246,0.16)' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.16)' },
  verified: { label: 'Verified', color: '#22c55e', bg: 'rgba(34,197,94,0.16)' },
};

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: meta.color, background: meta.bg, padding: '5px 12px', borderRadius: 100, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: meta.color }} />
      {meta.label}
    </span>
  );
}

function ThemedSelect({ theme, value, onChange, options, small }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: small ? 36 : 46, padding: small ? '0 28px 0 12px' : '0 34px 0 14px', borderRadius: small ? 10 : 12,
        border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text,
        fontSize: small ? 12.5 : 14, fontWeight: 600, fontFamily: FONT, appearance: 'none', WebkitAppearance: 'none', width: '100%',
        backgroundImage: theme.mode === 'dark'
          ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%239d9da6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
          : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%236b6b72' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: small ? 'right 10px center' : 'right 12px center', cursor: 'pointer',
      }}
    >
      {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
    </select>
  );
}

function TextInput({ theme, ...rest }) {
  return <input {...rest} style={{ width: '100%', height: 46, padding: '0 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }} />;
}

function Label({ theme, children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{children}</div>;
}

function GenerateLinkModal({ theme, platforms, onClose, onGenerated }) {
  const [platform, setPlatform] = useState(platforms[0]?.key || '');
  const [customerName, setCustomerName] = useState('');
  const [expiryDays, setExpiryDays] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const data = await request('/api/verification-requests', {
        method: 'POST',
        body: JSON.stringify({
          platform,
          customer_name: customerName || undefined,
          expires_days: expiryDays === '' ? undefined : Number(expiryDays),
        }),
      });
      const link = `${window.location.origin}/#/verify/${data.token}`;
      setGeneratedLink(link);
      onGenerated();
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,8,0.6)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: theme.surface, borderRadius: 22, padding: 28, boxShadow: theme.shadowLg, border: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: theme.text }}>Generate Verification Link</h3>
          <button onClick={onClose} style={{ background: theme.surfaceSunken, border: 'none', borderRadius: 999, width: 30, height: 30, display: 'grid', placeItems: 'center', cursor: 'pointer', color: theme.textMuted }}><X size={16} /></button>
        </div>

        {!generatedLink ? (
          <>
            <div style={{ marginTop: 20 }}>
              <Label theme={theme}>Platform</Label>
              <ThemedSelect theme={theme} value={platform} onChange={setPlatform} options={platforms.map((p) => ({ value: p.key, label: p.label }))} />
            </div>

            <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: theme.surfaceSunken, fontSize: 12.5, color: theme.textMuted, lineHeight: 1.5 }}>
              The customer will choose their account type themselves from the options configured for this platform in <strong style={{ color: theme.text }}>Settings</strong>.
            </div>

            <div style={{ marginTop: 18 }}>
              <Label theme={theme}>Customer Name (optional)</Label>
              <TextInput theme={theme} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. John Smith" />
            </div>
            <div style={{ marginTop: 18 }}>
              <Label theme={theme}>Expiration (days, optional)</Label>
              <TextInput theme={theme} type="number" min="1" value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} placeholder="Use default setting" />
            </div>

            {error && <p style={{ marginTop: 12, fontSize: 13, color: '#ef4444' }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={handleGenerate} disabled={generating || !platform} style={{ flex: 1, height: 48, borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 12px 26px -10px rgba(255,45,85,0.55)', opacity: generating || !platform ? 0.6 : 1 }}>{generating ? 'Generating...' : 'Generate'}</button>
              <button onClick={onClose} style={{ flex: 1, height: 48, borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
            </div>
          </>
        ) : (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>Send this link to the customer:</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, borderRadius: 12, border: `1px solid ${theme.border}`, padding: '10px 14px', background: theme.surfaceSunken }}>
              <span style={{ flex: 1, fontSize: 12, fontFamily: 'monospace', color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{generatedLink}</span>
              <button onClick={() => copyLink(generatedLink)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, flexShrink: 0 }}><Copy size={15} /></button>
            </div>
            {copied && <p style={{ marginTop: 8, fontSize: 12, color: '#22c55e' }}>Copied to clipboard</p>}
            <button onClick={onClose} style={{ marginTop: 18, width: '100%', height: 48, borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function RejectModal({ theme, row, onClose, onConfirm, saving }) {
  const [link, setLink] = useState(row.replacement_link || '');

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,8,0.6)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, background: theme.surface, borderRadius: 22, padding: 28, boxShadow: theme.shadowLg, border: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: theme.text }}>Reject Request</h3>
          <button onClick={onClose} style={{ background: theme.surfaceSunken, border: 'none', borderRadius: 999, width: 30, height: 30, display: 'grid', placeItems: 'center', cursor: 'pointer', color: theme.textMuted }}><X size={16} /></button>
        </div>

        <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: theme.surfaceSunken, fontSize: 12.5, color: theme.textMuted, lineHeight: 1.55 }}>
          Optionally give this customer a replacement link. It will appear to them as a <strong style={{ color: theme.text }}>"Get My Replacement"</strong> button — the raw link is never shown to them directly.
          If you leave this blank, they'll see this account was rejected and isn't replaceable (out of warranty).
        </div>

        <div style={{ marginTop: 18 }}>
          <Label theme={theme}>Replacement Link (optional)</Label>
          <TextInput theme={theme} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button
            onClick={() => onConfirm(link)}
            disabled={saving}
            style={{ flex: 1, height: 48, borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 12px 26px -10px rgba(255,45,85,0.55)', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : 'Confirm Rejection'}
          </button>
          <button onClick={onClose} style={{ flex: 1, height: 48, borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVerificationsPage() {
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [platforms, setPlatforms] = useState(DEFAULT_PLATFORMS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [rejectingRow, setRejectingRow] = useState(null);
  const [rejectSaving, setRejectSaving] = useState(false);

  const platformLabel = (key) => platforms.find(p => p.key === key)?.label || key;

  const load = async () => {
    setLoading(true);
    try {
      const [list, settings] = await Promise.all([
        request('/api/verification-requests'),
        request('/api/admin/verification-settings'),
      ]);
      setRows(Array.isArray(list) ? list : []);
      const loadedPlatforms = settings.verification_platforms?.length ? settings.verification_platforms : DEFAULT_PLATFORMS;
      setPlatforms(loadedPlatforms);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (row, status) => {
    if (status === 'rejected') { setRejectingRow(row); return; }
    try {
      await request('/api/verification-requests', {
        method: 'PUT',
        body: JSON.stringify({ id: row.id, status }),
      });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const confirmReject = async (replacementLink) => {
    setRejectSaving(true);
    try {
      await request('/api/verification-requests', {
        method: 'PUT',
        body: JSON.stringify({ id: rejectingRow.id, status: 'rejected', replacement_link: replacementLink }),
      });
      setRejectingRow(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setRejectSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this verification request? This cannot be undone.')) return;
    try {
      await request(`/api/verification-requests?id=${row.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
  };

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Account Verifications</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted, maxWidth: 560 }}>Generate a link to send to a customer who needs to re-verify a purchased ad account, and track its status.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/admin/verification-settings')} style={{ height: 44, padding: '0 18px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Settings</button>
          <button onClick={() => setShowModal(true)} style={{ height: 44, padding: '0 20px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.5)' }}><Plus size={14} /> Generate Link</button>
        </div>
      </div>

      {error && <div style={{ marginTop: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{error}</div>}

      <GlassCard theme={theme} style={{ marginTop: 24, padding: 8 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: theme.textFaint, marginBottom: 16, fontSize: 13.5 }}>No verification requests yet.</p>
            <button onClick={() => setShowModal(true)} style={{ height: 44, padding: '0 20px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: 8 }}><Plus size={14} /> Generate First Link</button>
          </div>
        ) : (
          rows.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderBottom: i < rows.length - 1 ? `1px solid ${theme.border}` : 'none', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 100 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>{platformLabel(r.platform)}</div>
                <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 2 }}>{r.request_id}</div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>{r.customer_name || <span style={{ color: theme.textFaint, fontStyle: 'italic', fontWeight: 500 }}>No name</span>}</div>
                <div style={{ fontSize: 12, color: theme.textFaint, marginTop: 2 }}>
                  {r.account_email || 'Not submitted yet'}
                  {r.account_type ? ` · ${r.account_type}` : ''}
                  {r.amount_paid != null ? ` · $${Number(r.amount_paid).toFixed(2)}` : ''}
                </div>
              </div>
              <StatusBadge status={r.status} />
              {r.status === 'rejected' && (
                <button
                  onClick={() => setRejectingRow(r)}
                  title={r.replacement_link ? 'Edit replacement link' : 'Add a replacement link'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 9,
                    border: `1px solid ${r.replacement_link ? 'rgba(34,197,94,0.3)' : theme.border}`,
                    background: r.replacement_link ? 'rgba(34,197,94,0.1)' : theme.surfaceSunken,
                    color: r.replacement_link ? '#22c55e' : theme.textFaint,
                    fontSize: 11.5, fontWeight: 700, fontFamily: FONT, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  <Link2 size={12} /> {r.replacement_link ? 'Replacement set' : 'No replacement'}
                </button>
              )}
              <div style={{ minWidth: 150 }}>
                <ThemedSelect theme={theme} small value="" onChange={(v) => v && handleStatusChange(r, v)} options={[{ value: '', label: 'Change status…' }, { value: 'in_review', label: 'In Review' }, { value: 'verified', label: 'Verified' }, { value: 'rejected', label: 'Rejected' }]} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => copyLink(`${window.location.origin}/#/verify/${r.token}`)} title="Copy link" style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.textMuted, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Copy size={15} /></button>
                <button onClick={() => handleDelete(r)} title="Delete" style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))
        )}
      </GlassCard>

      {showModal && (
        <GenerateLinkModal theme={theme} platforms={platforms} onClose={() => setShowModal(false)} onGenerated={load} />
      )}

      {rejectingRow && (
        <RejectModal theme={theme} row={rejectingRow} onClose={() => setRejectingRow(null)} onConfirm={confirmReject} saving={rejectSaving} />
      )}
    </div>
  );
}
