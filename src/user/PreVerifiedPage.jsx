import { C, getThemeColors } from '../shared/theme.js'
import { useState } from 'react'
import { useNavigate } from '../shared/Router.jsx'
import { useTheme } from '../shared/ThemeContext.jsx'
import { PageShell, Card, Btn, PlatformIcon, Modal } from '../shared/UI.jsx'
import { useStore } from '../shared/store.js'

export default function PreVerifiedPage({ products, lines, balance, purchases, setStore }) {
  const [{ auth }] = useStore()
  const navigate = useNavigate();
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [view, setView] = useState("shop");
  const [filters, setFilters] = useState({ platform: "All", type: "All", min: "", max: "", sort: "Newest First" });
  const [buyModal, setBuyModal] = useState(null);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");

  const getQty = (pid) => lines.filter(l => (l.productId === pid || l.product_id === pid) && l.status === "available").length;

  const filtered = products.filter(p => {
    if (filters.platform !== "All" && p.platform !== filters.platform) return false;
    if (filters.type !== "All" && p.type !== filters.type) return false;
    if (filters.min && p.price < Number(filters.min)) return false;
    if (filters.max && p.price > Number(filters.max)) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sort === "Price: Low to High") return a.price - b.price;
    if (filters.sort === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  const openBuy = (product) => {
    setBuyError("");
    setBuyModal(product);
  };

  const confirmBuy = async (orderQty = 1) => {
    if (!buyModal) return;
    const product = buyModal;
    const available = lines.filter(l => (l.productId === product.id || l.product_id === product.id) && l.status === "available");
    const toBuy = available.slice(0, orderQty);
    if (toBuy.length === 0 || balance < product.price * orderQty) return;

    setBuying(true);
    setBuyError("");
    const now = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const totalCost = parseFloat((product.price * orderQty).toFixed(2));
    const newBalance = parseFloat((balance - totalCost).toFixed(2));
    const orderId = "ORD-" + Date.now();

    const post = async (url, body) => {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const text = await r.text();
      let data; try { data = JSON.parse(text); } catch { throw new Error('Non-JSON: ' + text.slice(0, 100)); }
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      return data;
    };
    const put = async (url, body) => {
      const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const text = await r.text();
      let data; try { data = JSON.parse(text); } catch { throw new Error('Non-JSON: ' + text.slice(0, 100)); }
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      return data;
    };

    try {
      await Promise.all([
        ...toBuy.map((line, i) => post('/api/purchases', {
          id: "PUR-" + (Date.now() + i),
          user_id: auth?.id || null,
          product_id: product.id,
          product_title: product.title,
          platform: product.platform,
          price: product.price,
          line_id: line.id,
          email: line.email,
          password: line.password,
          twofa: line.twofa,
          purchased_at: now,
          logo: product.logo || null,
        })),
        ...toBuy.map(line => put('/api/inventory-lines', { id: line.id, status: 'sold' })),
        auth?.id ? put('/api/users', { id: auth.id, balance: newBalance }) : Promise.resolve(),
      ]);
    } catch (err) {
      console.error('Purchase save error:', err);
      setBuyError('Save failed: ' + err.message);
      setBuying(false);
      return;
    }

    Promise.all([
      post('/api/transactions', {
        user_id: auth?.id || null,
        type: 'Spent',
        method: 'Pre-Verified Account',
        amount: -totalCost,
        status: 'completed',
        date: now,
      }),
      post('/api/orders', {
        id: orderId,
        user_id: auth?.id || null,
        user_email: auth?.email || '',
        type: 'Pre-Verified Account',
        platform: product.platform,
        amount: totalCost,
        status: 'completed',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }),
    ]).catch(err => console.warn('Logging failed (non-critical):', err.message));

    const localPurchases = toBuy.map((line, i) => ({
      id: "PUR-" + (Date.now() + i),
      productId: product.id,
      productTitle: product.title,
      platform: product.platform,
      price: product.price,
      lineId: line.id,
      email: line.email,
      password: line.password,
      twofa: line.twofa,
      purchasedAt: now,
      logo: product.logo || null,
    }));

    setStore(s => ({
      ...s,
      balance: newBalance,
      auth: s.auth ? { ...s.auth, balance: newBalance } : s.auth,
      purchases: [...localPurchases, ...s.purchases],
      inventoryLines: s.inventoryLines.map(l => toBuy.find(tb => tb.id === l.id) ? { ...l, status: 'sold' } : l),
      transactions: [{ type: 'Spent', method: 'Pre-Verified Account', amount: -totalCost, status: 'completed', date: now }, ...s.transactions],
      orders: [{ id: orderId, user_email: auth?.email || '', user: auth?.email || '', type: 'Pre-Verified Account', platform: product.platform, amount: totalCost, status: 'completed', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }, ...s.orders],
    }));

    setBuying(false);
    setBuyModal(null);
    setSelectedProduct(null);
    navigate('/purchase-history');
  };

  if (view === "product" && selectedProduct) {
    const qty = getQty(selectedProduct.id);
    return (
      <>
        <PageShell title={selectedProduct.title} subtitle={`${selectedProduct.platform} · ${selectedProduct.type} · ${selectedProduct.country}`}
          actions={[
            <Btn key="back" variant="outline" onClick={() => setView("shop")}>← Back</Btn>,
            <Btn key="buy" onClick={() => openBuy(selectedProduct)} disabled={qty === 0 || balance < selectedProduct.price}>
              {qty === 0 ? "Out of Stock" : balance < selectedProduct.price ? "Insufficient Balance" : `Buy Now $${selectedProduct.price}`}
            </Btn>,
          ]}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <PlatformIcon name={selectedProduct.platform} size={32} logo={selectedProduct.logo} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: TC.g800 }}>{selectedProduct.title}</div>
                  <div style={{ fontSize: 12, color: TC.g400 }}>ID: {selectedProduct.id}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: TC.g500, lineHeight: 1.7, marginBottom: 20 }}>{selectedProduct.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["Platform", selectedProduct.platform], ["Type", selectedProduct.type], ["Country", selectedProduct.country], ["Created", selectedProduct.created]].map(([k, v]) => (
                  <div key={k} style={{ background: TC.g50, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, color: TC.g400, marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: TC.g800 }}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Card>
                <div style={{ fontSize: 12, color: TC.g400, marginBottom: 4 }}>Price</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.primary, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', marginBottom: 12 }}>${selectedProduct.price}.00</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: qty > 0 ? C.green : C.red }} />
                  <span style={{ fontSize: 13, color: TC.g600 }}>{qty} in stock</span>
                </div>
                <Btn full onClick={() => openBuy(selectedProduct)} disabled={qty === 0 || balance < selectedProduct.price}>
                  {qty === 0 ? "Out of Stock" : balance < selectedProduct.price ? "Insufficient Balance" : "Buy Now"}
                </Btn>
              </Card>
              <Card>
                <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: TC.text }}>Delivery</h4>
                <div style={{ fontSize: 12, color: TC.g500, lineHeight: 1.6 }}>Instant delivery after purchase. Credentials will appear in My Purchases.</div>
              </Card>
            </div>
          </div>
        </PageShell>
        {buyModal && (
          <BuyConfirmModal product={buyModal} qty={getQty(buyModal.id)} balance={balance} buying={buying} error={buyError} onConfirm={confirmBuy} onClose={() => { setBuyModal(null); setBuyError(""); }} />
        )}
      </>
    );
  }

  return (
    <>
      <PageShell
        title="Pre-Verified Accounts"
        subtitle="Browse and purchase ready-to-use, pre-verified ad accounts."
        actions={[
          <Btn key="history" variant="outline" onClick={() => navigate('/purchase-history')}>🧾 Purchase History ({purchases.length})</Btn>,
        ]}
      >
        <Card style={{ marginBottom: 20, padding: "14px 20px" }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 12, color: TC.g400, marginBottom: 5, fontWeight: 600 }}>Platform</div>
              <select value={filters.platform} onChange={e => setFilters(f => ({ ...f, platform: e.target.value }))} style={{ background: TC.g50, color: TC.g700, border: `1px solid ${TC.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
                {["All", "Meta", "Google", "TikTok", "Snapchat"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, color: TC.g400, marginBottom: 5, fontWeight: 600 }}>Account Type</div>
              <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} style={{ background: TC.g50, color: TC.g700, border: `1px solid ${TC.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
                {["All", "Aged", "New"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, color: TC.g400, marginBottom: 5, fontWeight: 600 }}>Price Range</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input value={filters.min} onChange={e => setFilters(f => ({ ...f, min: e.target.value }))} placeholder="$ Min" style={{ width: 72, background: TC.card, color: TC.g700, border: `1px solid ${TC.g200}`, borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                <span style={{ color: TC.g300 }}>—</span>
                <input value={filters.max} onChange={e => setFilters(f => ({ ...f, max: e.target.value }))} placeholder="$ Max" style={{ width: 72, background: TC.card, color: TC.g700, border: `1px solid ${TC.g200}`, borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <div style={{ fontSize: 12, color: TC.g400, marginBottom: 5, fontWeight: 600 }}>Sort By</div>
              <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))} style={{ background: TC.g50, color: TC.g700, border: `1px solid ${TC.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
                {["Newest First", "Price: Low to High", "Price: High to Low"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {filtered.map(acc => {
            const qty = getQty(acc.id);
            return (
              <Card key={acc.id} onClick={() => { setSelectedProduct(acc); setView("product"); }} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <PlatformIcon name={acc.platform} size={26} logo={acc.logo} />
                  <span style={{ background: acc.type === "Aged" ? TC.greenL : TC.blueL, color: acc.type === "Aged" ? TC.green : TC.blue, fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20 }}>{acc.type}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: TC.g800, marginBottom: 3 }}>{acc.title}</div>
                <div style={{ fontSize: 11, color: TC.g400, marginBottom: 14 }}>{acc.country}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: TC.g500, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ color: C.green, fontWeight: 800 }}>✓</span>Platform: {acc.platform}
                  </div>
                  <div style={{ fontSize: 12, color: TC.g500, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ color: qty > 0 ? C.green : C.red, fontWeight: 800 }}>✓</span>{qty} in stock
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: C.primary, fontVariantNumeric: 'tabular-nums' }}>${acc.price}.00</span>
                  <Btn size="sm" onClick={e => { e.stopPropagation(); openBuy(acc); }} disabled={qty === 0 || balance < acc.price}>
                    {qty === 0 ? "Sold Out" : "Buy"}
                  </Btn>
                </div>
              </Card>
            );
          })}
        </div>
      </PageShell>
      {buyModal && (
        <BuyConfirmModal product={buyModal} qty={getQty(buyModal.id)} balance={balance} buying={buying} error={buyError} onConfirm={confirmBuy} onClose={() => { setBuyModal(null); setBuyError(""); }} />
      )}
    </>
  );
}

function BuyConfirmModal({ product, qty, balance, buying, error, onConfirm, onClose }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  const maxQty = Math.min(qty, Math.floor(balance / product.price)) || 0;
  const [orderQty, setOrderQty] = useState(Math.min(1, maxQty));
  const hasStock = qty > 0;
  const totalCost = parseFloat((product.price * orderQty).toFixed(2));
  const canAfford = balance >= totalCost;
  const afterBalance = canAfford ? (balance - totalCost).toFixed(2) : balance.toFixed(2);

  const dec = () => setOrderQty(q => Math.max(1, q - 1));
  const inc = () => setOrderQty(q => Math.min(maxQty, q + 1));

  return (
    <Modal title="Confirm Purchase" onClose={onClose} width={480}>
      {/* Product preview */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: TC.g50, borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: 14, background: TC.card, border: `1px solid ${TC.g200}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
          <PlatformIcon name={product.platform} size={42} logo={product.logo} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: TC.g800, marginBottom: 4 }}>{product.title}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ background: TC.blueL, color: TC.blue, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{product.platform}</span>
            <span style={{ background: product.type === "Aged" ? TC.greenL : TC.blueL, color: product.type === "Aged" ? TC.green : TC.blue, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{product.type}</span>
            {product.country && <span style={{ background: TC.g100, color: TC.g600, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{product.country}</span>}
            <span style={{ background: hasStock ? C.greenL : C.redL, color: hasStock ? C.green : C.red, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
              {qty} in stock
            </span>
          </div>
        </div>
      </div>

      {/* Quantity selector */}
      {hasStock && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: TC.g50, borderRadius: 12, padding: "12px 18px", marginBottom: 16, border: `1px solid ${TC.g200}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: TC.g700 }}>Quantity</span>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={dec} disabled={orderQty <= 1} style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${TC.g200}`, background: TC.card, color: TC.g700, fontSize: 18, fontWeight: 700, cursor: orderQty <= 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: orderQty <= 1 ? 0.4 : 1, fontFamily: "inherit" }}>−</button>
            <span style={{ fontSize: 20, fontWeight: 800, color: TC.g800, fontVariantNumeric: 'tabular-nums', minWidth: 28, textAlign: "center" }}>{orderQty}</span>
            <button onClick={inc} disabled={orderQty >= maxQty} style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${TC.g200}`, background: TC.card, color: TC.g700, fontSize: 18, fontWeight: 700, cursor: orderQty >= maxQty ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: orderQty >= maxQty ? 0.4 : 1, fontFamily: "inherit" }}>+</button>
          </div>
          <span style={{ fontSize: 12, color: TC.g400 }}>max {maxQty}</span>
        </div>
      )}

      {/* Price breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          [orderQty > 1 ? `$${product.price} × ${orderQty}` : "Price", `$${totalCost.toFixed(2)}`, C.primary],
          ["Your Balance", `$${balance.toFixed(2)}`, TC.g700],
          ["After Purchase", `$${afterBalance}`, canAfford ? C.green : C.red],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: TC.g50, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: TC.g400, marginBottom: 5 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color }}>{value}</div>
          </div>
        ))}
      </div>

      {!hasStock && (
        <div style={{ background: TC.redL, border: `1px solid ${TC.red}50`, borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: TC.red, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚠</span> This product is out of stock.
        </div>
      )}
      {!canAfford && hasStock && (
        <div style={{ background: TC.redL, border: `1px solid ${TC.red}50`, borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: TC.red, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚠</span> Insufficient balance. Please top up your account first.
        </div>
      )}
      {error && (
        <div style={{ background: TC.redL, border: `1px solid ${TC.red}50`, borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: TC.red }}>{error}</div>
      )}

      <div style={{ fontSize: 12, color: TC.g400, marginBottom: 18, lineHeight: 1.6, background: TC.g50, borderRadius: 9, padding: "10px 14px" }}>
        After confirming, credentials will be delivered instantly and visible in <strong>Purchase History</strong>.
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="outline" onClick={onClose} disabled={buying} style={{ flex: 1 }}>Cancel</Btn>
        <Btn onClick={() => onConfirm(orderQty)} disabled={!canAfford || !hasStock || buying} style={{ flex: 1 }}>
          {buying ? "Processing…" : `Confirm — $${totalCost.toFixed(2)}`}
        </Btn>
      </div>
    </Modal>
  );
}

