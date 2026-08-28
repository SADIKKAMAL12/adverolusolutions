import { useEffect, useState } from 'react';
import { Layout } from '../shared/Layout.jsx';
import { PageHead, KPI, Pill, SkeletonRows, EmptyState, ErrorBanner, fmtMoney, fmtDate, statusTone } from '../shared/UI.jsx';
import { Icon } from '../shared/Icon.jsx';
import { api } from '../shared/api.js';
import { useStore, setStore } from '../shared/store.js';
import { useAuth } from '../shared/AuthContext.jsx';

function QuickAction({ icon, bg, color, title, sub, hash }) {
  return (
    <a className="qa" href={hash}>
      <div className="qa__arrow"><Icon name="arrow-up-right" size={14} /></div>
      <div className="qa__icon" style={{ background: bg, color }}><Icon name={icon} size={17} /></div>
      <div className="qa__title">{title}</div>
      <div className="qa__sub">{sub}</div>
    </a>
  );
}

function ActivityRow({ tx, revealIndex = 0 }) {
  const isNeg = (tx.amount ?? 0) < 0 || /spent|withdraw|charge/i.test(tx.type || '');
  const tone = isNeg
    ? { bg: 'var(--accent-50)', c: 'var(--accent)', ic: 'arrow-up-right' }
    : /refund/i.test(tx.type || '')
    ? { bg: 'var(--info-bg)', c: 'var(--info)', ic: 'arrow-down' }
    : { bg: 'var(--success-bg)', c: 'var(--success)', ic: 'arrow-down' };
  return (
    <div className="activity-row reveal-item" style={{ animationDelay: `${revealIndex * 50}ms` }}>
      <div className="activity-row__icon" style={{ background: tone.bg, color: tone.c }}>
        <Icon name={tone.ic} size={14} stroke={2.2} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="activity-row__title">
          {tx.type || 'Transaction'}
          {tx.method ? <span style={{ color: 'var(--muted)', fontWeight: 400 }}> · {tx.method}</span> : null}
        </div>
        <div className="activity-row__meta">
          <span className="mono">#{tx.id}</span> · {fmtDate(tx.created_at || tx.date)}
        </div>
      </div>
      <Pill tone={statusTone(tx.status)}>{tx.status || '—'}</Pill>
      <div className={'activity-row__amount ' + (isNeg ? 'amount-neg' : 'amount-pos')}>
        {isNeg ? '−' : '+'}{fmtMoney(Math.abs(tx.amount || 0))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [store] = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/api/transactions?user_id=${user.id}&order=id&ascending=false`),
      api.get(`/api/deposits?user_id=${user.id}`),
      api.get(`/api/purchases?user_id=${user.id}`),
    ])
      .then(([transactions, deposits, orders]) => {
        if (cancelled) return;
        setStore((s) => ({
          ...s,
          transactions: Array.isArray(transactions) ? transactions : (transactions?.items || []),
          deposits: Array.isArray(deposits) ? deposits : (deposits?.items || []),
          orders: Array.isArray(orders) ? orders : (orders?.items || []),
        }));
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [user]);

  const txList = store.transactions || [];
  const recent = txList.slice(0, 6);
  const pendingDeposits = (store.deposits || []).filter((d) => /pending|processing/i.test(d.status || '')).length;
  const totalOrders = (store.orders || []).length;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  return (
    <Layout active="dashboard" crumbs={['Workspace', 'Dashboard']}>
      <div className="page" data-screen-label="Dashboard">
        <PageHead
          eyebrow="Overview"
          title={`Good ${greet},`}
          titleAccent={user?.name?.split(' ')[0] || ''}
          subtitle="Here's what's happening across your ad accounts today."
          actions={
            <>
              <a className="btn" href="#/orders"><Icon name="export" size={14} />Export</a>
              <a className="btn btn--accent" href="#/structure-builder">
                <Icon name="plus" size={14} stroke={2.5} />New Structure
              </a>
            </>
          }
        />

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <div className="kpi-grid">
          <KPI icon="wallet" label="Current Balance" value={(store.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} prefix="$" footer="Available for ad spend" />
          <KPI icon="clock" label="Pending Deposits" value={loading ? '—' : String(pendingDeposits)} footer={pendingDeposits > 0 ? 'Awaiting confirmation' : 'No pending deposits'} />
          <KPI icon="package" label="Total Orders" value={loading ? '—' : String(totalOrders)} footer="Across all platforms" />
          <KPI icon="trend-up" label="Available Credit" value={fmtMoney(store.balance ?? 0).replace('$', '')} prefix="$" footer="Top-up to extend" />
        </div>

        <div className="split">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 10 }}>
                <h2 className="section-title">Quick Actions</h2>
                <span className="section-title__count">4</span>
              </div>
              <div className="grid-4">
                <QuickAction icon="plus" bg="var(--accent-50)" color="var(--accent)" title="Create Ad Account" sub="Request a new account" hash="#/agency-ad-accounts" />
                <QuickAction icon="arrow-up-right" bg="var(--success-bg)" color="var(--success)" title="Top Up Balance" sub="Add funds" hash="#/balance" />
                <QuickAction icon="shield" bg="var(--info-bg)" color="var(--info)" title="Buy Verified" sub="Live in 30m" hash="#/preverified-accounts" />
                <QuickAction icon="layers" bg="var(--violet-bg)" color="var(--violet)" title="Build Structure" sub="Custom multi-asset" hash="#/structure-builder" />
              </div>
            </div>

            <div className="card">
              <div className="card__head">
                <h2 className="card__title">Recent Activity</h2>
                <p className="card__sub">Latest transactions on your wallet</p>
                <div className="card__spacer" />
                <a className="btn btn--sm btn--ghost" href="#/balance">View all <Icon name="arrow-right" size={12} /></a>
              </div>
              {loading ? (
                <SkeletonRows rows={5} />
              ) : recent.length === 0 ? (
                <EmptyState
                  icon="clipboard"
                  title="No activity yet"
                  description="Your transactions will appear here once you top up or make a purchase."
                  action={<a className="btn btn--accent" href="#/balance"><Icon name="plus" size={14} />Top up balance</a>}
                />
              ) : (
                <div>{recent.map((tx, i) => <ActivityRow key={tx.id} tx={tx} revealIndex={i} />)}</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="balance-hero">
              <div className="balance-hero__label">Current Balance</div>
              <div className="balance-hero__value">
                ${(store.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                <sup style={{ fontSize: 16, opacity: 0.6 }}>
                  .{((store.balance ?? 0) % 1).toFixed(2).slice(2)}
                </sup>
              </div>
              <div className="balance-hero__row">
                <div className="balance-hero__cell">
                  <div className="balance-hero__cell-label">Pending</div>
                  <div className="balance-hero__cell-value" style={{ color: '#fbbf24' }}>{pendingDeposits}</div>
                </div>
                <div className="balance-hero__cell">
                  <div className="balance-hero__cell-label">Orders</div>
                  <div className="balance-hero__cell-value" style={{ color: '#34d399' }}>{totalOrders}</div>
                </div>
              </div>
              <a className="balance-hero__btn" href="#/balance">
                <Icon name="arrow-up-right" size={14} stroke={2.4} />Top Up Balance
              </a>
            </div>

            <div className="card card--pad" style={{ background: 'linear-gradient(180deg, var(--bg-card), var(--bg-sunken))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--violet-bg)', color: 'var(--violet)', display: 'grid', placeItems: 'center' }}>
                  <Icon name="layers" size={16} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Structure Builder</div>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
                Compose multi-asset agency structures and submit for one-tap provisioning.
              </p>
              <a className="btn" style={{ width: '100%', justifyContent: 'center' }} href="#/structure-builder">
                Open Builder <Icon name="arrow-right" size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
