// Balance & Transactions — top up form with file upload, transaction history.

import { useEffect, useState } from 'react';
import { Layout } from '../shared/Layout.jsx';
import { PageHead, KPI, StatusPill, SkeletonRows, EmptyState, ErrorBanner, SuccessBanner, Spinner, Pill, fmtDate, fmtMoney } from '../shared/UI.jsx';
import { Icon } from '../shared/Icon.jsx';
import { api } from '../shared/api.js';
import { useStore, setStore } from '../shared/store.js';
import { useAuth } from '../shared/AuthContext.jsx';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export default function Balance() {
  const { user } = useAuth();
  const [store] = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Top-up form state
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [txFilter, setTxFilter] = useState('all');

  const loadAll = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get(`/api/transactions?user_id=${user.id}`),
      api.get(`/api/deposits?user_id=${user.id}`),
      api.get('/api/payment-methods'),
      api.get('/api/users/me'),
    ])
      .then(([transactions, deposits, paymentMethods, me]) => {
        setStore((s) => ({
          ...s,
          transactions: Array.isArray(transactions) ? transactions : (transactions?.items || []),
          deposits: Array.isArray(deposits) ? deposits : (deposits?.items || []),
          paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : (paymentMethods?.items || []),
          balance: me?.balance ?? s.balance,
        }));
        // Default the form method to first active payment method
        const pm = Array.isArray(paymentMethods) ? paymentMethods : (paymentMethods?.items || []);
        const firstActive = pm.find((p) => p.active !== false);
        if (firstActive) setMethod(firstActive.id || firstActive.name);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, [user]);

  const onPickFile = (e) => {
    setFileError(null);
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    if (!ALLOWED_MIME.includes(f.type)) {
      setFileError('Please upload a JPEG, PNG, GIF, WebP, or PDF file.');
      setFile(null);
      e.target.value = '';
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError('File is too large. Max 5 MB.');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(f);
  };

  const submitDeposit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!method) return setError('Please choose a payment method.');
    if (!amount || Number(amount) <= 0) return setError('Enter a valid amount.');
    if (!file) return setError('Please upload proof of payment.');
    if (fileError) return setError(fileError);

    setSubmitting(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const id = 'DEP-' + Date.now();
      const dateStr = new Date().toISOString().slice(0, 10);

      await api.post('/api/deposits', {
        id,
        user_id: user.id,
        method,
        amount: Number(amount),
        status: 'pending',
        date: dateStr,
        proof: dataUrl,
      });
      await api.post('/api/transactions', {
        user_id: user.id,
        type: 'Deposit',
        method,
        amount: Number(amount),
        status: 'pending',
        date: dateStr,
      });

      setSuccess(`Deposit submitted for ${fmtMoney(amount)}. We'll confirm within 30 minutes.`);
      setAmount('');
      setFile(null);

      // Re-fetch
      const [deposits, transactions] = await Promise.all([
        api.get(`/api/deposits?user_id=${user.id}`),
        api.get(`/api/transactions?user_id=${user.id}`),
      ]);
      setStore((s) => ({
        ...s,
        deposits: Array.isArray(deposits) ? deposits : (deposits?.items || []),
        transactions: Array.isArray(transactions) ? transactions : (transactions?.items || []),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const txList = store.transactions || [];
  const filteredTx = txList.filter((t) => {
    if (txFilter === 'all') return true;
    return (t.type || '').toLowerCase() === txFilter;
  });

  const totalDeposits = (store.deposits || [])
    .filter((d) => /complet|paid|approved|confirmed/i.test(d.status || ''))
    .reduce((acc, d) => acc + Number(d.amount || 0), 0);
  const pendingDeposits = (store.deposits || [])
    .filter((d) => /pending|processing/i.test(d.status || ''))
    .reduce((acc, d) => acc + Number(d.amount || 0), 0);
  const totalSpent = txList
    .filter((t) => /spent|charge|purchase|order/i.test(t.type || ''))
    .reduce((acc, t) => acc + Math.abs(Number(t.amount || 0)), 0);

  const methods = store.paymentMethods || [];

  return (
    <Layout active="balance" crumbs={['Workspace', 'Balance']}>
      <div className="page" data-screen-label="Balance">
        <PageHead
          eyebrow="Treasury"
          title="Balance &"
          titleAccent="transactions"
          subtitle="Top up your wallet and review every dollar in or out."
          actions={
            <button className="btn"><Icon name="export" size={14} />Statement</button>
          }
        />

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        {success && <SuccessBanner message={success} onDismiss={() => setSuccess(null)} />}

        <div className="kpi-grid">
          <KPI icon="wallet" label="Current balance" value={(store.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} prefix="$" footer="Available for ad spend" />
          <KPI icon="clock" label="Pending balance" value={pendingDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })} prefix="$" footer="Clears within 24h" />
          <KPI icon="arrow-down" label="Total deposits" value={totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })} prefix="$" footer="All-time" />
          <KPI icon="arrow-up-right" label="Total spent" value={totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })} prefix="$" footer="All-time" />
        </div>

        <div className="split">
          <div className="card">
            <div className="card__head">
              <h2 className="card__title">Top up balance</h2>
              <p className="card__sub">Add funds to your wallet</p>
            </div>
            <form onSubmit={submitDeposit} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Payment method <span style={{ color: 'var(--accent)' }}>*</span></label>
                {loading ? (
                  <Spinner size={16} />
                ) : methods.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                    No payment methods are available right now. Please contact support.
                  </p>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {methods.filter((m) => m.active !== false).map((pm) => {
                        const key = pm.id || pm.name;
                        const active = method === key;
                        const hasImage = pm.logo && (pm.logo.startsWith('http') || pm.logo.startsWith('data:'));
                        const hasEmoji = pm.logo && !pm.logo.startsWith('http') && !pm.logo.startsWith('data:');
                        return (
                          <button
                            type="button"
                            key={key}
                            className={'pm' + (active ? ' pm--active' : '')}
                            onClick={() => setMethod(key)}
                          >
                            <div className="pm__icon" style={{ background: 'var(--bg-sunken)', overflow: 'hidden', padding: hasImage ? 2 : 0 }}>
                              {hasImage
                                ? <img src={pm.logo} alt={pm.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                : hasEmoji
                                  ? <span style={{ fontSize: 16 }}>{pm.logo}</span>
                                  : <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>{pm.name?.charAt(0).toUpperCase() || '$'}</span>
                              }
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <div className="pm__name">{pm.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{pm.bank_name || pm.description || pm.network || ''}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {/* Payment details panel — shown when a method is selected */}
                    {method && (() => {
                      const sel = methods.find(m => (m.id || m.name) === method);
                      const fields = sel?.fields?.filter(f => f.label && f.value) || [];
                      if (!fields.length) return null;
                      return (
                        <div style={{
                          marginTop: 12, padding: '14px 16px',
                          background: 'var(--bg-sunken)', borderRadius: 11,
                          border: '1px solid var(--line)',
                        }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                            Send payment to:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {fields.map((f, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 90, flexShrink: 0 }}>{f.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', flex: 1, wordBreak: 'break-all' }}>{f.value}</span>
                                <button
                                  type="button"
                                  title="Copy"
                                  onClick={() => navigator.clipboard?.writeText(f.value)}
                                  style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: 'var(--muted)', cursor: 'pointer', flexShrink: 0 }}
                                >Copy</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>

              <div className="input-group">
                <label>Amount (USD) <span style={{ color: 'var(--accent)' }}>*</span></label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="input-group">
                <label>Proof of payment <span style={{ color: 'var(--accent)' }}>*</span></label>
                <label className="file-drop">
                  <Icon name="upload" size={18} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {file ? file.name : 'Upload screenshot or PDF'}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                      JPG, PNG, GIF, WebP, or PDF · max 5 MB
                    </div>
                  </div>
                  <input
                    type="file"
                    accept={ALLOWED_MIME.join(',')}
                    onChange={onPickFile}
                    style={{ display: 'none' }}
                  />
                </label>
                {fileError && (
                  <div style={{ fontSize: 12, color: 'var(--accent)' }}>{fileError}</div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button type="submit" className="btn btn--accent" disabled={submitting || loading}>
                  {submitting && <Spinner size={13} />}
                  Submit deposit
                  <Icon name="arrow-right" size={13} />
                </button>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>
                  Funds usually clear in <b style={{ color: 'var(--ink)' }}>5–30 min</b>.
                </span>
              </div>
            </form>
          </div>

          <div className="card">
            <div className="card__head">
              <h2 className="card__title">Saved payment methods</h2>
              <span className="section-title__count" style={{ marginLeft: 'auto' }}>{methods.length}</span>
            </div>
            {loading ? (
              <SkeletonRows rows={4} />
            ) : methods.length === 0 ? (
              <EmptyState icon="card" title="No payment methods yet" description="Methods will appear here once configured." />
            ) : (
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {methods.map((pm) => {
                  const hasImage = pm.logo && (pm.logo.startsWith('http') || pm.logo.startsWith('data:'));
                  const hasEmoji = pm.logo && !pm.logo.startsWith('http') && !pm.logo.startsWith('data:');
                  return (
                    <div
                      key={pm.id || pm.name}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', border: '1px solid var(--line)',
                        borderRadius: 10, background: 'var(--bg-card)', color: 'var(--ink)',
                      }}
                    >
                      <div className="pm__icon" style={{ background: 'var(--bg-sunken)', overflow: 'hidden', padding: hasImage ? 2 : 0 }}>
                        {hasImage
                          ? <img src={pm.logo} alt={pm.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          : hasEmoji
                            ? <span style={{ fontSize: 16 }}>{pm.logo}</span>
                            : <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>{pm.name?.charAt(0).toUpperCase() || '$'}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{pm.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{pm.bank_name || pm.description || pm.network || ''}</div>
                      </div>
                      {pm.active === false && <Pill tone="warn">Inactive</Pill>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <h2 className="card__title">Transaction history</h2>
            <p className="card__sub">All movements on your wallet</p>
            <div className="card__spacer" />
            <div className="tabs">
              {[
                { k: 'all', l: 'All' },
                { k: 'deposit', l: 'Deposits' },
                { k: 'spent', l: 'Spent' },
                { k: 'refund', l: 'Refunds' },
              ].map((t) => (
                <button
                  key={t.k}
                  className={'tab' + (txFilter === t.k ? ' tab--active' : '')}
                  onClick={() => setTxFilter(t.k)}
                >
                  {t.l}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <SkeletonRows rows={5} />
          ) : filteredTx.length === 0 ? (
            <EmptyState
              icon="wallet"
              title={txList.length === 0 ? 'No transactions yet' : 'No transactions match this filter'}
              description={txList.length === 0 ? 'Submit a deposit above to fund your wallet.' : 'Try a different tab.'}
            />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((t, i) => {
                  const isNeg = /spent|charge|purchase|order|withdraw/i.test(t.type || '') || Number(t.amount) < 0;
                  return (
                    <tr key={t.id} className="reveal-item" style={{ animationDelay: `${i * 45}ms` }}>
                      <td className="mono" style={{ fontWeight: 600 }}>#{t.id}</td>
                      <td>{t.type || '—'}</td>
                      <td>{t.method || '—'}</td>
                      <td className={'mono ' + (isNeg ? 'amount-neg' : 'amount-pos')} style={{ fontWeight: 600 }}>
                        {isNeg ? '−' : '+'}{fmtMoney(Math.abs(Number(t.amount || 0)))}
                      </td>
                      <td><StatusPill status={t.status} /></td>
                      <td className="mono" style={{ color: 'var(--muted)' }}>{fmtDate(t.date || t.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
