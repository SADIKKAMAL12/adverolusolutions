// Orders — two tabs: Marketplace purchases and Structure orders.

import { useEffect, useState } from 'react';
import { Layout } from '../shared/Layout.jsx';
import { PageHead, StatusPill, SkeletonRows, EmptyState, ErrorBanner, fmtDate, fmtMoney, KPI } from '../shared/UI.jsx';
import { Icon, PlatformIcon } from '../shared/Icon.jsx';
import { api } from '../shared/api.js';
import { useStore, setStore } from '../shared/store.js';
import { useAuth } from '../shared/AuthContext.jsx';

/* ── Credentials modal ───────────────────────────── */
function CredentialsModal({ purchase, onClose }) {
  const [revealed, setRevealed] = useState(false);
  const [copiedLine, setCopiedLine] = useState(false);

  const email    = purchase.email    || '';
  const password = purchase.password || '';
  const twofa    = purchase.twofa    || '';
  const fullLine = [email, password, twofa].filter(Boolean).join(' | ');

  const copyLine = () => {
    navigator.clipboard.writeText(fullLine).catch(() => {});
    setCopiedLine(true);
    setTimeout(() => setCopiedLine(false), 1800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PlatformIcon platform={purchase.platform} size={34} logo={purchase.logo} />
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{purchase.product_title || purchase.platform}</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                Purchase <span className="mono">#{String(purchase.id).slice(-12)}</span>
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div className="modal__body">
          {!revealed ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 20 }}>
                Your credentials are hidden for security. Click below to reveal them.
              </p>
              <button className="btn btn--accent" onClick={() => setRevealed(true)}>
                <Icon name="shield" size={14} /> Reveal credentials
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: '16px 18px', background: 'var(--bg-sunken)', borderRadius: 10, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                  Account credentials
                </div>
                <div className="mono" style={{ fontSize: 14, color: 'var(--ink)', wordBreak: 'break-all', lineHeight: 1.6 }}>
                  {fullLine || '—'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn" style={{ fontSize: 13 }} onClick={copyLine}>
                  {copiedLine ? '✓ Copied!' : 'Copy line'}
                </button>
                <button className="btn btn--accent" style={{ fontSize: 13 }} onClick={() => downloadCredentials(purchase)}>
                  <Icon name="export" size={13} /> Download .txt
                </button>
              </div>

              <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="shield" size={11} /> Keep these credentials private and do not share them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function downloadCredentials(purchase) {
  const email    = purchase.email    || '—';
  const password = purchase.password || '—';
  const twofa    = purchase.twofa    || '—';
  const fullLine = [purchase.email, purchase.password, purchase.twofa].filter(Boolean).join(' | ');

  const content = [
    `Product:  ${purchase.product_title || purchase.platform || '—'}`,
    `Platform: ${purchase.platform || '—'}`,
    `Date:     ${purchase.purchased_at || purchase.created_at || '—'}`,
    `Order ID: ${purchase.id}`,
    '',
    fullLine,
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(purchase.product_title || 'account').replace(/\s+/g, '_')}_${String(purchase.id).slice(-8)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function StructureOrderRow({ order, className, style: outerStyle }) {
  const isDone = String(order.status || '').toLowerCase() === 'done';
  const hasDelivery = isDone && order.delivery_info;
  return (
    <div
      className={className}
      style={{
        padding: '14px var(--density-pad)',
        borderBottom: '1px solid var(--line-2)',
        display: 'flex',
        flexDirection: 'column',
        ...outerStyle,
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: 'var(--violet-bg)',
            color: 'var(--violet)',
            display: 'grid',
            placeItems: 'center',
            flex: '0 0 auto',
          }}
        >
          <Icon name="layers" size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{order.name || 'Structure order'}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
            <span className="mono">#{order.order_code || order.id}</span>
            {' · '}
            {order.node_count || 0} assets
            {' · '}
            {fmtDate(order.submitted_at || order.created_at)}
          </div>
        </div>
        <StatusPill status={order.status} />
        <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>
          {fmtMoney(order.total_price)}
        </div>
      </div>

      {hasDelivery && (
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--success-bg)',
            border: '1px solid color-mix(in srgb, var(--success) 30%, transparent)',
            borderRadius: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Icon name="check" size={13} stroke={2.4} style={{ color: 'var(--success)' }} />
            <strong style={{ fontSize: 12.5, color: 'var(--success)' }}>Delivered</strong>
          </div>
          {typeof order.delivery_info === 'string' ? (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)', whiteSpace: 'pre-wrap' }}>
              {order.delivery_info}
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 6 }}>
              {Object.entries(order.delivery_info).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 10, fontSize: 12.5 }}>
                  <span style={{ minWidth: 110, color: 'var(--muted)', textTransform: 'capitalize' }}>{k}</span>
                  <span className="mono" style={{ wordBreak: 'break-all' }}>{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const [store] = useStore();
  const [tab, setTab] = useState('marketplace');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewPurchase, setViewPurchase] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/api/purchases?user_id=${user.id}&order=created_at&ascending=false`),
      api.get('/api/structure-orders?mine=1'),
    ])
      .then(([purchases, structureOrders]) => {
        if (cancelled) return;
        setStore((s) => ({
          ...s,
          purchases: Array.isArray(purchases) ? purchases : (purchases?.items || []),
          structureOrders: Array.isArray(structureOrders) ? structureOrders : (structureOrders?.orders || structureOrders?.items || []),
        }));
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [user]);

  const marketplaceOrders = store.purchases || [];
  const structureOrders = store.structureOrders || [];

  return (
    <Layout active="orders" crumbs={['Workspace', 'Orders']}>
      <div className="page" data-screen-label="Orders">
        <PageHead
          eyebrow="Orders"
          title="Your"
          titleAccent="orders"
          subtitle="Track marketplace purchases and structure provisions in one place."
          actions={
            <>
              <button className="btn"><Icon name="export" size={14} />Export CSV</button>
              <a className="btn btn--accent" href="#/structure-builder">
                <Icon name="plus" size={14} stroke={2.5} />New Structure
              </a>
            </>
          }
        />

        {viewPurchase && (
          <CredentialsModal purchase={viewPurchase} onClose={() => setViewPurchase(null)} />
        )}

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <KPI icon="package" label="Accounts purchased" value={loading ? '—' : String(marketplaceOrders.length)} footer="All-time purchases" />
          <KPI icon="layers" label="Structure orders" value={loading ? '—' : String(structureOrders.length)} footer="Custom builds" />
          <KPI
            icon="check"
            label="Fulfilled"
            value={loading ? '—' : String(
              marketplaceOrders.filter((o) => /done|complet|fulfill/i.test(o.status || '')).length +
              structureOrders.filter((o) => /done|complet|fulfill/i.test(o.status || '')).length
            )}
            footer="Ready to use"
          />
        </div>

        <div className="tabs">
          <button className={'tab' + (tab === 'marketplace' ? ' tab--active' : '')} onClick={() => setTab('marketplace')}>
            Marketplace Orders
          </button>
          <button className={'tab' + (tab === 'structure' ? ' tab--active' : '')} onClick={() => setTab('structure')}>
            Structure Orders
          </button>
        </div>

        <div className="card">
          {tab === 'marketplace' ? (
            loading ? (
              <SkeletonRows rows={5} />
            ) : marketplaceOrders.length === 0 ? (
              <EmptyState
                icon="package"
                title="No marketplace orders yet"
                description="Buy a pre-verified account and it'll show up here."
                action={<a className="btn btn--accent" href="#/preverified-accounts"><Icon name="shield" size={14} />Browse marketplace</a>}
              />
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Purchase ID</th>
                    <th>Product</th>
                    <th>Email</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {marketplaceOrders.map((o, i) => (
                    <tr key={o.id} className="reveal-item" style={{ animationDelay: `${i * 50}ms` }}>
                      <td className="mono" style={{ fontWeight: 600, fontSize: 11 }}>#{String(o.id).slice(-12)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <PlatformIcon platform={o.platform} size={26} logo={o.logo} />
                          <span style={{ fontWeight: 600 }}>{o.product_title || o.platform || '—'}</span>
                        </div>
                      </td>
                      <td className="mono" style={{ color: 'var(--muted)', fontSize: 12 }}>{o.email || '—'}</td>
                      <td className="mono" style={{ fontWeight: 600 }}>{fmtMoney(o.amount || o.price)}</td>
                      <td className="mono" style={{ color: 'var(--muted)' }}>{fmtDate(o.purchased_at || o.created_at)}</td>
                      <td><StatusPill status="completed" /></td>
                      <td>
                        <button
                          className="btn btn--sm"
                          style={{ fontSize: 12, padding: '5px 12px' }}
                          onClick={() => setViewPurchase(o)}
                        >
                          <Icon name="shield" size={12} /> Reveal
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : loading ? (
            <SkeletonRows rows={4} />
          ) : structureOrders.length === 0 ? (
            <EmptyState
              icon="layers"
              title="No structure orders yet"
              description="Build a custom structure and submit it for provisioning."
              action={<a className="btn btn--accent" href="#/structure-builder"><Icon name="plus" size={14} />Open builder</a>}
            />
          ) : (
            <div>
              {structureOrders.map((o, i) => <StructureOrderRow key={o.id} order={o} className="reveal-item" style={{ animationDelay: `${i * 50}ms` }} />)}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
