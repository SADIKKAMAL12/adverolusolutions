import { useEffect, useMemo, useState } from 'react';
import { Layout } from '../shared/Layout.jsx';
import { PageHead, Pill, EmptyState, ErrorBanner, SuccessBanner, Spinner, Skeleton, fmtMoney } from '../shared/UI.jsx';
import { Icon, PlatformIcon } from '../shared/Icon.jsx';
import { api } from '../shared/api.js';
import { useStore, setStore } from '../shared/store.js';
import { useAuth } from '../shared/AuthContext.jsx';

function availableForProduct(productId, lines) {
  return (lines || []).filter(
    (l) => l.product_id === productId && (l.status || '').toLowerCase() === 'available'
  );
}

function flag(country) {
  if (!country) return '';
  const map = {
    'united states': '🇺🇸', us: '🇺🇸', usa: '🇺🇸',
    'united kingdom': '🇬🇧', uk: '🇬🇧',
    canada: '🇨🇦', germany: '🇩🇪', france: '🇫🇷', spain: '🇪🇸',
    australia: '🇦🇺', brazil: '🇧🇷', india: '🇮🇳',
  };
  return map[country.toLowerCase()] || '🌐';
}

/* ─── Credentials modal (post-purchase) ─────────────── */
function CredentialsModal({ purchase, onClose }) {
  if (!purchase) return null;
  const creds = purchase.credentials || purchase.line?.credentials || null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal__head">
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--success)', fontSize: 20 }}>✓</span>
              Purchase complete
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
              {purchase.product_title || 'Account'} · receipt <span className="mono">#{purchase.id}</span>
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div className="modal__body">
          <div style={{ padding: 16, background: 'var(--bg-sunken)', borderRadius: 10 }}>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>
              Account credentials
            </div>
            {creds && typeof creds === 'object' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(creds).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', minWidth: 100, textTransform: 'capitalize' }}>{k}</div>
                    <div className="mono" style={{ fontSize: 12.5, color: 'var(--ink)', wordBreak: 'break-all' }}>{String(v)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                Credentials will be delivered to your email within a few minutes.
              </p>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '12px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="shield" size={12} /> Covered by 7-day replacement warranty.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn" onClick={onClose}>Close</button>
            <a className="btn btn--accent" href="#/orders">View order <Icon name="arrow-right" size={12} /></a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Buy confirmation modal ─────────────────────────── */
function BuyModal({ product, available, currentBalance, onConfirm, onClose, buying }) {
  const maxQty = Math.min(available.length, 20);
  const [qty, setQty] = useState(1);
  const total = Number(product.price) * qty;
  const balanceAfter = (currentBalance || 0) - total;
  const canAfford = balanceAfter >= 0;

  const dec = () => setQty(q => Math.max(1, q - 1));
  const inc = () => setQty(q => Math.min(maxQty, q + 1));

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PlatformIcon platform={product.platform} size={38} logo={product.logo} />
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{product.title}</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                {flag(product.country)} {product.country}
                {product.type && <> · <span style={{ color: 'var(--success)', fontWeight: 600 }}>{product.type}</span></>}
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {product.description && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
              {product.description}
            </p>
          )}

          {/* Quantity selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'var(--bg-sunken)', borderRadius: 11, border: '1px solid var(--line)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Quantity</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={dec} disabled={qty <= 1}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-card)', color: 'var(--ink)', fontSize: 18, fontWeight: 700, cursor: qty <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: qty <= 1 ? .4 : 1 }}
              >−</button>
              <div style={{ width: 44, textAlign: 'center', fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{qty}</div>
              <button
                onClick={inc} disabled={qty >= maxQty}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-card)', color: 'var(--ink)', fontSize: 18, fontWeight: 700, cursor: qty >= maxQty ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: qty >= maxQty ? .4 : 1 }}
              >+</button>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Available</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{available.length}</div>
            </div>
          </div>

          {/* Price breakdown */}
          <div style={{ padding: '14px 16px', background: 'var(--bg-card)', borderRadius: 11, border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
              <span>Unit price</span>
              <span className="mono" style={{ color: 'var(--ink)' }}>{fmtMoney(product.price)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
              <span>Quantity</span>
              <span className="mono" style={{ color: 'var(--ink)' }}>× {qty}</span>
            </div>
            <div style={{ height: 1, background: 'var(--line)', margin: '2px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800 }}>
              <span style={{ color: 'var(--ink)' }}>Total</span>
              <span className="mono" style={{ color: 'var(--accent)' }}>{fmtMoney(total)}</span>
            </div>
          </div>

          {/* Balance impact */}
          <div style={{ padding: '13px 16px', background: canAfford ? 'var(--success-bg)' : 'var(--accent-50)', borderRadius: 11, border: `1px solid ${canAfford ? 'rgba(22,163,74,.25)' : 'rgba(239,43,43,.25)'}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
              <span style={{ color: 'var(--muted)' }}>Current balance</span>
              <span className="mono" style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmtMoney(currentBalance || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
              <span style={{ color: 'var(--muted)' }}>Deduction</span>
              <span className="mono" style={{ fontWeight: 600, color: 'var(--accent)' }}>− {fmtMoney(total)}</span>
            </div>
            <div style={{ height: 1, background: canAfford ? 'rgba(22,163,74,.2)' : 'rgba(239,43,43,.2)', margin: '2px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
              <span style={{ color: canAfford ? 'var(--success)' : 'var(--accent)' }}>Balance after</span>
              <span className="mono" style={{ color: canAfford ? 'var(--success)' : 'var(--accent)' }}>{fmtMoney(Math.max(0, balanceAfter))}</span>
            </div>
          </div>

          {!canAfford && (
            <div style={{ padding: '10px 14px', background: 'var(--accent-50)', border: '1px solid var(--accent)', borderRadius: 9, fontSize: 13, color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="alert" size={14} />
              Insufficient balance. Please top up your wallet first.
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button
              className="btn btn--accent"
              disabled={!canAfford || buying}
              onClick={() => onConfirm(product, available.slice(0, qty), qty)}
            >
              {buying && <Spinner size={13} />}
              Confirm · {fmtMoney(total)}
              <Icon name="arrow-right" size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Product detail modal ───────────────────────────── */
function ProductDetailModal({ product, available, currentBalance, onBuy, onClose, buying }) {
  const stock = available.length;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <PlatformIcon platform={product.platform} size={46} logo={product.logo} />
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{product.title}</h2>
              <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {flag(product.country)} {product.country}
                {product.type && (
                  <Pill tone={/aged/i.test(product.type) ? 'success' : 'info'} dot={false}>{product.type}</Pill>
                )}
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        <div className="modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Description */}
          {product.description && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 8 }}>Description</div>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.6 }}>{product.description}</p>
            </div>
          )}

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 4 }}>What's included</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink)' }}>
              <span style={{ color: 'var(--success)', fontSize: 15, fontWeight: 700 }}>✓</span>
              {product.platform} verified account
            </div>
            {product.description && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--ink)' }}>
                <span style={{ color: 'var(--success)', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>✓</span>
                {product.description}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink)' }}>
              <span style={{ color: 'var(--success)', fontSize: 15, fontWeight: 700 }}>✓</span>
              7-day replacement warranty
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink)' }}>
              <span style={{ color: 'var(--success)', fontSize: 15, fontWeight: 700 }}>✓</span>
              Credentials delivered within 30 minutes
            </div>
          </div>

          {/* Stock + price row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: 'var(--bg-sunken)', borderRadius: 12, border: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Price</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', fontFamily: "'Geist Mono',monospace" }}>
                {fmtMoney(product.price)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>per account · one-time</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Availability</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: stock === 0 ? 'var(--muted-2)' : stock <= 1 ? 'var(--accent)' : stock <= 3 ? 'var(--warn)' : 'var(--success)',
                }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                  {stock === 0 ? 'Out of stock' : `${stock} in stock`}
                </span>
              </div>
              {stock === 1 && <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>Last one!</div>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={onClose}>Close</button>
            <button
              className="btn btn--accent"
              disabled={stock === 0 || buying}
              onClick={() => onBuy(product)}
            >
              {buying && <Spinner size={13} />}
              {stock === 0 ? 'Out of stock' : 'Buy now'}
              {stock > 0 && <Icon name="arrow-right" size={12} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Card reveal animation ──────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('mp-card-reveal-styles')) {
  const s = document.createElement('style');
  s.id = 'mp-card-reveal-styles';
  s.textContent = `
    @keyframes mpCardReveal {
      from { opacity: 0; transform: translateY(22px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)   scale(1);    }
    }
    .mp-card--reveal {
      animation: mpCardReveal 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
  `;
  document.head.appendChild(s);
}

/* ─── Product card ───────────────────────────────────── */
function ProductCard({ product, available, onViewDetail, onBuyDirect, busy, revealIndex }) {
  const stock = available.length;
  return (
    <div
      className="mp-card mp-card--reveal"
      onClick={() => onViewDetail(product)}
      style={{
        cursor: 'pointer',
        transition: 'transform .12s, box-shadow .12s',
        animationDelay: `${revealIndex * 55}ms`,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
    >
      <div className="mp-card__head">
        <PlatformIcon platform={product.platform} size={38} logo={product.logo} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="mp-card__title">{product.title}</h3>
          <p className="mp-card__country">{flag(product.country)} {product.country}</p>
        </div>
        {product.type && (
          <Pill tone={/aged/i.test(product.type) ? 'success' : 'info'} dot={false}>{product.type}</Pill>
        )}
      </div>

      <ul className="mp-card__features">
        <li><Icon name="check" size={12} stroke={2.5} style={{ color: 'var(--success)' }} />{product.platform} verified</li>
        {product.description && (
          <li><Icon name="check" size={12} stroke={2.5} style={{ color: 'var(--success)' }} />{product.description}</li>
        )}
        <li style={{ color: 'var(--muted)' }}>
          <span className="dot" style={{ background: stock === 0 ? 'var(--muted-2)' : stock <= 1 ? 'var(--accent)' : stock <= 3 ? 'var(--warn)' : 'var(--success)' }} />
          {stock === 0 ? 'Out of stock' : `${stock} in stock`}
          {stock === 1 && <span style={{ color: 'var(--accent)', fontWeight: 600 }}> · last one</span>}
        </li>
      </ul>

      <div className="mp-card__price-row">
        <div>
          <div className="mp-card__price">{fmtMoney(product.price)}</div>
          <small style={{ display: 'block', marginTop: 2, fontSize: 11, color: 'var(--muted)' }}>per account · one-time</small>
        </div>
        <button
          className="btn btn--accent btn--sm"
          style={{ padding: '8px 14px' }}
          disabled={stock === 0 || busy}
          onClick={e => { e.stopPropagation(); onBuyDirect(product); }}
        >
          {busy && <Spinner size={12} />}
          {stock === 0 ? 'Out of stock' : 'Buy now'}
          {stock > 0 && !busy && <Icon name="arrow-right" size={12} />}
        </button>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function PreVerifiedAccounts() {
  const { user } = useAuth();
  const [store] = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [buying, setBuying] = useState(false);
  const [lastPurchase, setLastPurchase] = useState(null);

  // Modal states
  const [detailProduct, setDetailProduct] = useState(null);
  const [buyProduct, setBuyProduct] = useState(null);

  // Filters
  const [platform, setPlatform] = useState('all');
  const [accType, setAccType] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('featured');

  const load = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get('/api/inventory-products'),
      api.get('/api/inventory-lines'),
    ])
      .then(([products, lines]) => {
        setStore(s => ({
          ...s,
          inventoryProducts: Array.isArray(products) ? products : (products?.items || []),
          inventoryLines: Array.isArray(lines) ? lines : (lines?.items || []),
        }));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const products = store.inventoryProducts || [];
  const lines = store.inventoryLines || [];
  const currentBalance = store.balance ?? 0;

  const [revealKey, setRevealKey] = useState(0);

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      if (platform !== 'all' && (p.platform || '').toLowerCase() !== platform) return false;
      if (accType !== 'all' && (p.type || '').toLowerCase() !== accType) return false;
      if (minPrice && Number(p.price) < Number(minPrice)) return false;
      if (maxPrice && Number(p.price) > Number(maxPrice)) return false;
      return true;
    });
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, platform, accType, minPrice, maxPrice, sort]);

  // Re-trigger reveal animation whenever filtered list changes
  useEffect(() => { setRevealKey(k => k + 1); }, [filtered]);

  /* ── Purchase handler (qty accounts) ── */
  const onConfirmBuy = async (product, linesToBuy, qty) => {
    if (!linesToBuy?.length) return;
    setError(null);
    setBuying(true);
    // The server (`POST /api/purchases`) already locks the chosen line atomically
    // (checks it's still available, marks it sold, deducts balance, rolls back on
    // failure) — a separate client-side `PUT /api/inventory-lines` call used to run
    // first here, but that endpoint is admin-only and always rejected regular users,
    // blocking every purchase before it could even reach /api/purchases.
    const purchases = [];
    const soldLineIds = [];
    let spent = 0;
    try {
      /* Create one purchase record per line (with credentials), sequentially to avoid balance race */
      const now = new Date().toLocaleString();
      for (let i = 0; i < linesToBuy.length; i++) {
        const l = linesToBuy[i];
        const rec = await api.post('/api/purchases', {
          id: `PUR-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          user_id: user.id,
          product_id: product.id,
          product_title: product.title,
          platform: product.platform,
          line_id: l.id,
          price: Number(product.price),
          email: l.email || '',
          password: l.password || '',
          twofa: l.twofa || '',
          logo: product.logo || null,
          purchased_at: now,
        });
        purchases.push(rec);
        soldLineIds.push(l.id);
        spent += Number(product.price);
        // Reflect each successful purchase immediately, so a later failure in this
        // same batch (e.g. buying qty > 1 and a line runs out mid-way) doesn't leave
        // the UI showing a stale balance/inventory state for the ones that DID succeed.
        setStore(s => ({
          ...s,
          inventoryLines: (s.inventoryLines || []).map(line =>
            line.id === l.id ? { ...line, status: 'sold' } : line
          ),
          purchases: [rec, ...(s.purchases || [])],
          balance: typeof s.balance === 'number' ? s.balance - Number(product.price) : s.balance,
        }));
      }

      setBuyProduct(null);
      setDetailProduct(null);
      setLastPurchase({ ...purchases[0], product_title: product.title, quantity: qty });
      setSuccess(`Purchased ${qty > 1 ? `${qty}× ` : ''}${product.title} for ${fmtMoney(spent)}.`);
    } catch (err) {
      if (purchases.length) {
        setError(`${err.message} (${purchases.length} of ${qty} completed before this error — your balance already reflects those.)`);
      } else {
        setError(err.message);
      }
    } finally {
      setBuying(false);
    }
  };

  /* Opens buy modal (from card or detail modal) */
  const openBuy = product => {
    setDetailProduct(null);
    setBuyProduct(product);
  };

  return (
    <Layout active="preverified-accounts" crumbs={['Workspace', 'Pre-Verified Accounts']}>
      <div className="page" data-screen-label="Pre-Verified">
        <PageHead
          eyebrow="Marketplace"
          title="Pre-verified"
          titleAccent="inventory"
          subtitle="Ready-to-use accounts, vetted by our team. Live in your dashboard in under 30 minutes."
          actions={
            <a className="btn" href="#/orders">
              <Icon name="package" size={14} />Purchase history
            </a>
          }
        />

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        {success && <SuccessBanner message={success} onDismiss={() => setSuccess(null)} />}

        {/* Filters */}
        <div className="card card--pad">
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ minWidth: 160 }}>
              <label>Platform</label>
              <select className="select" value={platform} onChange={e => setPlatform(e.target.value)}>
                <option value="all">All platforms</option>
                <option value="meta">Meta</option>
                <option value="google">Google</option>
                <option value="tiktok">TikTok</option>
                <option value="snapchat">Snapchat</option>
              </select>
            </div>
            <div className="input-group" style={{ minWidth: 140 }}>
              <label>Account type</label>
              <select className="select" value={accType} onChange={e => setAccType(e.target.value)}>
                <option value="all">All types</option>
                <option value="aged">Aged</option>
                <option value="fresh">Fresh</option>
              </select>
            </div>
            <div className="input-group" style={{ minWidth: 200 }}>
              <label>Price range</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="input" placeholder="$ min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                <span style={{ color: 'var(--muted-2)' }}>–</span>
                <input className="input" placeholder="$ max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <div className="input-group" style={{ minWidth: 180 }}>
              <label>Sort by</label>
              <select className="select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="mp-card" key={i}>
                <Skeleton height={38} width={38} radius={9} />
                <Skeleton height={14} width="60%" />
                <Skeleton height={10} width="40%" />
                <Skeleton height={24} width="50%" radius={6} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="shield"
              title={products.length === 0 ? 'Inventory is empty right now' : 'No products match your filters'}
              description={products.length === 0 ? 'Check back soon — we restock daily.' : 'Try clearing filters or widening your price range.'}
            />
          </div>
        ) : (
          <div className="grid-4">
            {filtered.map((p, i) => (
              <ProductCard
                key={`${p.id}-${revealKey}`}
                product={p}
                available={availableForProduct(p.id, lines)}
                onViewDetail={setDetailProduct}
                onBuyDirect={openBuy}
                busy={buying && buyProduct?.id === p.id}
                revealIndex={i}
              />
            ))}
          </div>
        )}

        {/* Product detail modal */}
        {detailProduct && (
          <ProductDetailModal
            product={detailProduct}
            available={availableForProduct(detailProduct.id, lines)}
            currentBalance={currentBalance}
            onBuy={openBuy}
            onClose={() => setDetailProduct(null)}
            buying={buying}
          />
        )}

        {/* Buy confirmation modal */}
        {buyProduct && (
          <BuyModal
            product={buyProduct}
            available={availableForProduct(buyProduct.id, lines)}
            currentBalance={currentBalance}
            onConfirm={onConfirmBuy}
            onClose={() => setBuyProduct(null)}
            buying={buying}
          />
        )}

        {/* Post-purchase credentials modal */}
        {lastPurchase && (
          <CredentialsModal purchase={lastPurchase} onClose={() => setLastPurchase(null)} />
        )}
      </div>
    </Layout>
  );
}
