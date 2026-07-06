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
   ADMIN INVENTORY PAGE
═══════════════════════════════════════════════════ */
export function AdminInventoryPage({ products, lines, setStore }) {
  const [view, setView] = useState("list");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkInput, setBulkInput] = useState("");
  const [newProduct, setNewProduct] = useState({ title: "", platform: "Meta", customPlatform: "", type: "Aged", price: "", country: "", description: "" });
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Refetch data
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, linesData] = await Promise.all([
        apiGet('inventory_products'),
        apiGet('inventory_lines'),
      ]);
      setStore(s => ({
        ...s,
        inventoryProducts: productsData || s.inventoryProducts,
        inventoryLines: linesData || s.inventoryLines,
      }));
    } catch (err) {
      console.error('Refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setStore]);

  // Note: refetch is now manual-only (via button) to avoid overwriting local changes on mount

  const startEdit = (prod) => {
    const productLines = lines.filter(l => l.productId === prod.id || l.product_id === prod.id);
    setEditingProduct(prod);
    setNewProduct({
      title: prod.title || "",
      platform: prod.platform || "Meta",
      customPlatform: "",
      type: prod.type || "Aged",
      price: prod.price?.toString() || "",
      country: prod.country || "",
      description: prod.description || ""
    });
    setLogoPreview(prod.logo || null);
    setBulkInput(productLines.map(l => [l.email, l.password, l.twofa].filter(v => v).join(" | ")).join("\n"));
    setView("add");
  };

  const updateProduct = async () => {
    if (!newProduct.title || !newProduct.price) return;
    setSaving(true);
    setError("");
    try {
      const resolvedPlatform = newProduct.platform === "Other" ? (newProduct.customPlatform || "Other") : newProduct.platform;
      const product = {
        id: editingProduct.id,
        title: newProduct.title,
        platform: resolvedPlatform,
        type: newProduct.type,
        price: Number(newProduct.price),
        country: newProduct.country || "",
        description: newProduct.description || "",
        logo: logoPreview !== null ? logoPreview : (editingProduct.logo || null),
      };
      const updatedLines = bulkInput.trim()
        ? bulkInput.trim().split("\n").map((line, i) => {
            const parts = line.split("|").map(p => p.trim());
            return { id: `l-${Date.now()}-${i}`, product_id: editingProduct.id, email: parts[0] || "", password: parts[1] || "", twofa: parts[2] || "", status: "available" };
          }).filter(l => l.email)
        : [];
      await apiPut('inventory_products', product);
      // Replace available lines: delete existing ones first, then insert the new list
      await fetch(`/api/crud?table=inventory_lines&product_id=${encodeURIComponent(editingProduct.id)}&status=available`, { method: 'DELETE' });
      if (updatedLines.length > 0) await apiPost('inventory_lines', updatedLines);
      setStore(s => ({
        ...s,
        inventoryProducts: s.inventoryProducts.map(p => p.id === editingProduct.id ? product : p),
        inventoryLines: [
          ...s.inventoryLines.filter(l => (l.product_id !== editingProduct.id && l.productId !== editingProduct.id) || l.status !== "available"),
          ...updatedLines.map(l => ({ ...l, productId: l.product_id }))
        ]
      }));
      setView("list");
      setEditingProduct(null);
      setNewProduct({ title: "", platform: "Meta", customPlatform: "", type: "Aged", price: "", country: "", description: "" });
      setLogoPreview(null);
      setBulkInput("");
    } catch (err) {
      setError('Failed to update: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (prod, e) => {
    e?.stopPropagation();
    if (!confirm(`Delete "${prod.title}" and all its inventory lines? This cannot be undone.`)) return;
    setDeletingId(prod.id);
    try {
      // Backend handles nullifying purchases FK + deleting lines + deleting product
      await apiDelete('inventory_products', { id: prod.id });
      setStore(s => ({
        ...s,
        inventoryProducts: s.inventoryProducts.filter(p => p.id !== prod.id),
        inventoryLines: s.inventoryLines.filter(l => l.product_id !== prod.id && l.productId !== prod.id),
      }));
      if (selectedProduct?.id === prod.id) setSelectedProduct(null);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (view === "add") {
    const isEditMode = !!editingProduct;
    const saveProduct = async () => {
      if (!newProduct.title || !newProduct.price) return;
      setSaving(true);
      setError("");
      try {
        const productId = `prod-${Date.now()}`;
        const resolvedPlatform = newProduct.platform === "Other" ? (newProduct.customPlatform || "Other") : newProduct.platform;
        const product = {
          id: productId,
          title: newProduct.title,
          platform: resolvedPlatform,
          type: newProduct.type,
          price: Number(newProduct.price),
          country: newProduct.country || "",
          description: newProduct.description || "",
          logo: logoPreview || null,
          created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        };

        const parsedLines = bulkInput.trim().split("\n").map((line, i) => {
          const parts = line.split("|").map(p => p.trim());
          return {
            id: `l-${Date.now()}-${i}`,
            product_id: productId,
            email: parts[0] || "",
            password: parts[1] || "",
            twofa: parts[2] || "",
            status: "available"
          };
        }).filter(l => l.email);

        // Save to API
        await apiPost('inventory_products', product);
        if (parsedLines.length > 0) {
          await apiPost('inventory_lines', parsedLines);
        }

        // Update local store
        setStore(s => ({
          ...s,
          inventoryProducts: [product, ...s.inventoryProducts],
          inventoryLines: [...parsedLines.map(l => ({ ...l, productId: l.product_id })), ...s.inventoryLines]
        }));

        setView("list");
        setNewProduct({ title: "", platform: "Meta", customPlatform: "", type: "Aged", price: "", country: "", description: "" });
        setLogoPreview(null);
        setBulkInput("");
      } catch (err) {
        setError('Failed to save: ' + err.message);
        console.error('Save product error:', err);
      } finally {
        setSaving(false);
      }
    };

    return (
      <PageShell
        breadcrumb={isEditMode ? `Dashboard › Pre-Verified Accounts › Edit: ${editingProduct.title}` : "Dashboard › Pre-Verified Accounts › Add New Account"}
        title={isEditMode ? "Edit Account" : "Add New Account"}
        actions={[
          <Btn key="c" variant="outline" onClick={() => { setView("list"); setEditingProduct(null); }}>✕ Cancel</Btn>,
          <Btn key="s" onClick={isEditMode ? updateProduct : saveProduct} disabled={saving}>{saving ? 'Saving…' : isEditMode ? '💾 Save Changes' : '💾 Save Account'}</Btn>
        ]}>
        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <Card>
            <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 800 }}>Product Information</h3>

            {/* Logo upload */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.g500, fontWeight: 600, marginBottom: 6 }}>Product Logo <span style={{ color: C.g300, fontWeight: 400 }}>(500 × 500 px recommended)</span></div>
              <label style={{ cursor: "pointer" }}>
                <div style={{ width: 110, height: 110, border: `2px dashed ${logoPreview ? C.primary : C.g200}`, borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: logoPreview ? C.primaryLight : C.g50, overflow: "hidden", transition: "all .15s" }}>
                  {logoPreview
                    ? <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <><div style={{ fontSize: 28, color: C.g300, marginBottom: 4 }}>↑</div><div style={{ fontSize: 11, color: C.g400, textAlign: "center", lineHeight: 1.4 }}>Upload<br/>Logo</div></>
                  }
                </div>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => setLogoPreview(ev.target.result);
                  reader.readAsDataURL(file);
                }} />
              </label>
              {logoPreview && (
                <button onClick={() => setLogoPreview(null)} style={{ marginTop: 6, background: "none", border: "none", fontSize: 12, color: C.red, cursor: "pointer", padding: 0 }}>✕ Remove</button>
              )}
            </div>

            <Input label="Product Title" required value={newProduct.title} onChange={e => setNewProduct(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Meta Aged Accounts (US)" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Select label="Platform" required value={newProduct.platform} onChange={e => setNewProduct(p => ({ ...p, platform: e.target.value }))}
                options={["Meta", "Google", "TikTok", "Snapchat", "Twitter", "LinkedIn", "Bing", "Pinterest", "Reddit", "Other"]} />
              <Input label="Account Type" required value={newProduct.type} onChange={e => setNewProduct(p => ({ ...p, type: e.target.value }))} placeholder="e.g. Aged, Fresh, Business…" />
            </div>
            {newProduct.platform === "Other" && (
              <Input label="Platform Name" required value={newProduct.customPlatform} onChange={e => setNewProduct(p => ({ ...p, customPlatform: e.target.value }))} placeholder="e.g. Pinterest, Reddit…" />
            )}
            <Input label="Country" value={newProduct.country} onChange={e => setNewProduct(p => ({ ...p, country: e.target.value }))} placeholder="Any country" />
            <Input label="Price (USD)" required type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="120.00" />
          </Card>
          <Card>
            <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 800 }}>Product Description</h3>
            <textarea rows={10} value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} placeholder="Write a detailed description about this account type…"
              style={{ width: "100%", border: `1px solid ${C.g200}`, borderRadius: 10, padding: "12px 14px", fontSize: 13, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
          </Card>
        </div>
        <Card>
          <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800 }}>{isEditMode ? "Inventory Lines" : "Bulk Add Inventory"}</h3>
          <div style={{ background: "#fff7ed", border: `1px solid ${C.yellow}40`, borderRadius: 9, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: C.yellow }}>⚠</span>
            <span style={{ fontSize: 13, color: "#92400e" }}>{isEditMode ? "Existing available lines are shown below. Saving will replace them with this list." : "Each line = 1 account. Format: email | password | 2fa"}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20 }}>
            <textarea rows={8} value={bulkInput} onChange={e => setBulkInput(e.target.value)}
              placeholder={`john.doe@gmail.com | Passw0rd@123 | J3K4 5G6H 7J8K\nalex.smith@gmail.com | Passw0rd@123 | L1M2 3N4O 5P6Q`}
              style={{ width: "100%", border: `1px solid ${C.g200}`, borderRadius: 10, padding: "12px 14px", fontSize: 13, resize: "vertical", boxSizing: "border-box", background: C.g50, outline: "none" }} />
            <div style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 12, padding: 18, width: 220 }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 800, color: C.g700 }}>Notes</h4>
              {["Each account on its own line.", "Format: email | password | 2fa", "2FA: any format accepted", "Editable after saving."].map(n => (
                <div key={n} style={{ fontSize: 12, color: C.g500, marginBottom: 8, display: "flex", gap: 6 }}><span style={{ color: C.primary }}>•</span>{n}</div>
              ))}
            </div>
          </div>
        </Card>
      </PageShell>
    );
  }

  if (selectedProduct) {
    const productLines = lines.filter(l => l.productId === selectedProduct.id || l.product_id === selectedProduct.id);
    const cols = [
      { label: "ID", render: r => <span style={{ fontWeight: 800, color: C.primary, fontSize: 12 }}>{r.id}</span> },
      { label: "Email", render: r => <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 12, color: C.g500 }}>{r.email} <span style={{ cursor: "pointer" }}>👁</span></div> },
      { label: "Password", render: () => <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 12, color: C.g300 }}>••••••••••••<span style={{ cursor: "pointer" }}>👁</span></div> },
      { label: "2FA", render: () => <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 12, color: C.g300 }}>••••••••<span style={{ cursor: "pointer" }}>👁</span></div> },
      { label: "Status", render: r => <Badge status={r.status} /> },
      { label: "Actions", render: r => <div style={{ display: "flex", gap: 8 }}><span style={{ cursor: "pointer" }}>✏️</span><span style={{ cursor: "pointer", color: C.red }}>🗑</span></div> },
    ];
    return (
      <PageShell breadcrumb={`Dashboard › Pre-Verified Accounts › ${selectedProduct.title}`} title={selectedProduct.title}
        actions={[
          <Btn key="back" variant="outline" onClick={() => setSelectedProduct(null)}>← Back</Btn>,
          <Btn key="del" variant="danger" disabled={deletingId === selectedProduct.id} onClick={e => deleteProduct(selectedProduct, e)}>
            {deletingId === selectedProduct.id ? 'Deleting…' : '🗑 Delete Product'}
          </Btn>,
          <Btn key="add" onClick={() => { startEdit(selectedProduct); setSelectedProduct(null); }}>✏ Edit Product</Btn>,
        ]}>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, background: "#1877f210", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>ℳ</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{selectedProduct.title}</h2>
                <Badge status="active" />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[[`Platform: ${selectedProduct.platform}`, C.blueL], [`Type: ${selectedProduct.type}`, C.greenL], [`Country: ${selectedProduct.country || "Any"}`, "#ede9fe"]].map(([t, bg]) => (
                  <span key={t} style={{ background: bg, color: C.g600, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center" }}>
              {[["Total", productLines.length, C.g600], ["Available", productLines.filter(l => l.status === "available").length, C.green], ["Sold", productLines.filter(l => l.status === "sold").length, C.blue], ["Reserved", productLines.filter(l => l.status === "reserved").length, C.yellow]].map(([l, v, c]) => (
                <div key={l}><div style={{ fontSize: 11, color: C.g400, marginBottom: 4 }}>{l}</div><div style={{ fontSize: 26, fontWeight: 800, color: c, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{v}</div></div>
              ))}
            </div>
          </div>
        </Card>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <DataTable cols={cols} rows={productLines} />
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell breadcrumb="Dashboard › Pre-Verified Accounts" title="Inventory"
      actions={[
        <Btn key="e" variant="outline" onClick={refetch} disabled={loading}>{loading ? '↻ Loading…' : '↻ Refresh'}</Btn>,
        <Btn key="a" onClick={() => setView("add")}>+ Add Product</Btn>
      ]}>
      {loading && <div style={{ textAlign: "center", padding: "20px", color: C.g400, fontSize: 14 }}>Loading inventory…</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[["Total Products", products.length, C.blue], ["Total Lines", lines.length, C.primary], ["Available", lines.filter(l => l.status === "available").length, C.green], ["Sold", lines.filter(l => l.status === "sold").length, C.blue]].map(([l, v, c]) => (
          <Card key={l}><div style={{ fontSize: 12, color: C.g400, marginBottom: 6 }}>{l}</div><div style={{ fontSize: 28, fontWeight: 800, color: c, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{v}</div></Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {products.map(prod => {
          const qty = lines.filter(l => (l.productId === prod.id || l.product_id === prod.id) && l.status === "available").length;
          return (
            <Card key={prod.id} onClick={() => setSelectedProduct(prod)} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <PlatformIcon name={prod.platform} size={22} logo={prod.logo} />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={e => { e.stopPropagation(); startEdit(prod); }} style={{ background: C.g100, border: "none", borderRadius: 7, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: C.g600, fontFamily: "inherit" }}>Edit</button>
                  <button
                    onClick={e => deleteProduct(prod, e)}
                    disabled={deletingId === prod.id}
                    title="Delete product"
                    style={{ background: C.redL, border: "none", borderRadius: 7, padding: "3px 8px", fontSize: 13, cursor: deletingId === prod.id ? "not-allowed" : "pointer", opacity: deletingId === prod.id ? 0.5 : 1, lineHeight: 1 }}
                  >🗑</button>
                  <span style={{ background: prod.type === "Aged" ? C.greenL : C.blueL, color: prod.type === "Aged" ? C.green : C.blue, fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>{prod.type}</span>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.g800, marginBottom: 3 }}>{prod.title}</div>
              <div style={{ fontSize: 11, color: C.g400, marginBottom: 10 }}>{prod.platform} · {prod.country || "Any"}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.primary, fontVariantNumeric: 'tabular-nums' }}>${prod.price}.00</span>
                <span style={{ fontSize: 12, color: qty > 0 ? C.green : C.red, fontWeight: 700 }}>{qty} in stock</span>
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN USERS PAGE
═══════════════════════════════════════════════════ */
export function AdminUsersPage({ users, orders = [], deposits = [], transactions = [], adAccountRequests = [], inventoryLines = [], inventoryProducts = [], structureOrders = [], paymentMethods = [], setStore }) {
  const [editUser, setEditUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [error, setError] = useState("");
  const [suspendingId, setSuspendingId] = useState(null);

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || u.status === statusFilter.toLowerCase();
    const matchesRole = roleFilter === "All Roles" || u.role === roleFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesRole;
  });

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('users', { order: 'created_at', ascending: 'false' });
      if (data && data.length > 0) {
        setStore(s => ({ ...s, users: data }));
      }
    } catch (err) {
      console.error('Users refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setStore]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const toggleSuspend = async (user) => {
    const isSuspended = user.status === 'suspended';
    const newStatus = isSuspended ? 'active' : 'suspended';
    setSuspendingId(user.id);
    setError("");
    try {
      await apiPut('users', { id: user.id, status: newStatus });
      setStore(s => ({ ...s, users: s.users.map(u => u.id === user.id ? { ...u, status: newStatus } : u) }));
      // WhatsApp suspension hook: configure WHATSAPP_API_URL in env to integrate
    } catch (err) {
      setError(`${isSuspended ? 'Unsuspend' : 'Suspend'} failed: ` + err.message);
    } finally {
      setSuspendingId(null);
    }
  };

  const cols = [
    { label: "User", render: r => <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar initials={r.name?.split(" ").map(w => w[0]).join("") || "?"} size={32} /><div><div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div><div style={{ fontSize: 11, color: C.g400 }}>{r.email}</div></div></div> },
    { label: "Phone", render: r => <span style={{ fontSize: 12, color: C.g500 }}>{r.phone || '—'}</span> },
    { label: "Balance", render: r => <span style={{ fontWeight: 700, color: C.primary }}>${(r.balance || 0).toLocaleString()}.00</span> },
    { label: "Role", render: r => <Badge text={r.role || 'user'} /> },
    { label: "Status", render: r => <Badge status={r.status} /> },
    { label: "Joined", render: r => <span style={{ fontSize: 12, color: C.g400 }}>{r.joined}</span> },
    { label: "Actions", render: r => (
      <div style={{ display: "flex", gap: 6 }}>
        <Btn size="sm" onClick={() => setSelectedUser(r)}>User Info</Btn>
        <Btn variant="outline" size="sm" onClick={() => setEditUser(r)}>Edit</Btn>
        <Btn
          variant={r.status === 'suspended' ? 'success' : 'warning'}
          size="sm"
          onClick={() => toggleSuspend(r)}
          disabled={suspendingId === r.id}
        >
          {suspendingId === r.id ? '…' : r.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
        </Btn>
      </div>
    )},
  ];

  if (selectedUser) {
    return (
      <AdminUserInfoPage
        user={selectedUser}
        orders={orders}
        deposits={deposits}
        transactions={transactions}
        adAccountRequests={adAccountRequests}
        inventoryLines={inventoryLines}
        inventoryProducts={inventoryProducts}
        structureOrders={structureOrders}
        paymentMethods={paymentMethods}
        onUpdateUser={(updated) => {
          setSelectedUser(updated);
          setStore(s => ({ ...s, users: s.users.map(u => u.id === updated.id ? updated : u) }));
        }}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  const saveUser = async (updated) => {
    setSaving(true);
    setError("");
    try {
      await apiPut('users', {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || null,
        balance: updated.balance,
        status: updated.status,
        role: updated.role || 'user',
      });
      setStore(s => ({ ...s, users: s.users.map(u => u.id === updated.id ? updated : u) }));
      setEditUser(null);
    } catch (err) {
      setError('Failed to update user: ' + err.message);
      console.error('Save user error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Users" subtitle="Manage all platform users."
      actions={[<Btn key="exp" variant="outline">↑ Export</Btn>]}>
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[["Total Users", users.length, C.blue], ["Active", users.filter(u => u.status === "active").length, C.green], ["Admins", users.filter(u => u.role === "admin").length, C.purple], ["Advertisers", users.filter(u => u.role === "advertiser").length, C.orange], ["Finance", users.filter(u => u.role === "finance").length, C.blue]].map(([l, v, c]) => (
          <Card key={l}><div style={{ fontSize: 12, color: C.g400, marginBottom: 6 }}>{l}</div><div style={{ fontSize: 28, fontWeight: 800, color: c, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{v}</div></Card>
        ))}
      </div>
      <Card>
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <input placeholder="🔍 Search users…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            <option>All Status</option><option>Active</option><option>Suspended</option><option>Banned</option><option>Pending</option>
          </select>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            <option>All Roles</option><option>Admin</option><option>Advertiser</option><option>Finance</option><option>User</option>
          </select>
          <Btn variant="outline" size="sm" onClick={refetch} disabled={loading}>{loading ? '↻' : '↻ Refresh'}</Btn>
        </div>
        {loading && <div style={{ textAlign: "center", padding: "20px", color: C.g400, fontSize: 14 }}>Loading users…</div>}
        <DataTable cols={cols} rows={filteredUsers} />
        <div style={{ marginTop: 14 }}>
          <Pagination total={`${filteredUsers.length} users`} showing={`1–${filteredUsers.length}`} pages={["‹", 1, 2, 3, "...", Math.ceil(filteredUsers.length / 10) || 1, "›"]} />
        </div>
      </Card>
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}
          <Input label="Name" value={editUser.name || ''} onChange={e => setEditUser(u => ({ ...u, name: e.target.value }))} />
          <Input label="Email" value={editUser.email || ''} onChange={e => setEditUser(u => ({ ...u, email: e.target.value }))} />
          <Input label="WhatsApp Phone" placeholder="+1234567890" value={editUser.phone || ''} onChange={e => setEditUser(u => ({ ...u, phone: e.target.value }))} />
          <Input label="Balance" type="number" value={editUser.balance || 0} onChange={e => setEditUser(u => ({ ...u, balance: Number(e.target.value) }))} />
          <Select label="Role" value={editUser.role || 'user'} onChange={e => setEditUser(u => ({ ...u, role: e.target.value }))} options={["admin", "advertiser", "finance", "user"]} />
          <Select label="Status" value={editUser.status || 'active'} onChange={e => setEditUser(u => ({ ...u, status: e.target.value }))} options={["active", "suspended", "banned", "pending"]} />
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn variant="outline" onClick={() => setEditUser(null)}>Cancel</Btn>
            <Btn onClick={() => saveUser(editUser)} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Btn>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN ORDERS PAGE
═══════════════════════════════════════════════════ */
export function AdminOrdersPage({ orders, setStore }) {
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !search || o.id?.toLowerCase().includes(search.toLowerCase()) || o.user?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || o.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('orders', { order: 'created_at', ascending: 'false' });
      if (data && data.length > 0) {
        setStore(s => ({ ...s, orders: data }));
      }
    } catch (err) {
      console.error('Orders refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setStore]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateStatus = async (id, newStatus) => {
    setSavingId(id);
    setError("");
    try {
      const order = orders.find(o => o.id === id);
      if (!order) return;

      await apiPut('orders', { id, status: newStatus });

      // If completed, mark associated inventory as sold
      if (newStatus === "completed") {
        const lines = await apiGet('inventory_lines', { status: 'available', limit: '1' });
        if (lines && lines.length > 0) {
          await apiPut('inventory_lines', { id: lines[0].id, status: 'sold' });
        }
      }

      setStore(s => ({ ...s, orders: s.orders.map(o => o.id === id ? { ...o, status: newStatus } : o) }));
    } catch (err) {
      setError('Failed to update order: ' + err.message);
      console.error('Update order error:', err);
    } finally {
      setSavingId(null);
    }
  };

  const cancelOrder = (id) => updateStatus(id, 'cancelled');

  const deleteOrder = async (id) => {
    setSavingId(id);
    setError("");
    try {
      const res = await fetch(`/api/crud?table=orders&id=${id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Delete failed'); }
      setStore(s => ({ ...s, orders: s.orders.filter(o => o.id !== id) }));
    } catch (err) {
      setError('Delete failed: ' + err.message);
    } finally {
      setSavingId(null);
      setConfirmDelete(null);
    }
  };

  const cols = [
    { label: "Order ID", render: r => <span style={{ fontWeight: 700, color: C.g700, fontSize: 12 }}>{r.id}</span> },
    { label: "User", render: r => <span style={{ fontSize: 12, color: C.g500 }}>{r.user_email || r.user}</span> },
    { label: "Type", render: r => <span style={{ fontSize: 12 }}>{r.type}</span> },
    { label: "Platform", render: r => <span style={{ fontSize: 12 }}>{r.platform}</span> },
    { label: "Amount", render: r => <span style={{ fontWeight: 800, color: C.primary }}>${r.amount}.00</span> },
    { label: "Status", render: r => <Badge status={r.status} /> },
    { label: "Date", render: r => <span style={{ fontSize: 12, color: C.g400 }}>{r.date}</span> },
    { label: "Actions", render: r => (
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <select
          value={r.status}
          disabled={savingId === r.id}
          onChange={e => updateStatus(r.id, e.target.value)}
          style={{ fontSize: 12, borderRadius: 6, border: `1px solid ${C.g200}`, padding: "4px 8px", background: "#fff" }}
        >
          <option>pending</option><option>processing</option><option>completed</option><option>cancelled</option>
        </select>
        {r.status !== 'cancelled' && (
          <Btn variant="warning" size="sm" onClick={() => cancelOrder(r.id)} disabled={savingId === r.id}>✕ Cancel</Btn>
        )}
        <Btn variant="danger" size="sm" onClick={() => setConfirmDelete(r)} disabled={savingId === r.id}>🗑</Btn>
      </div>
    )},
  ];

  return (
    <PageShell title="Orders" subtitle="View and manage all platform orders."
      actions={[<Btn key="exp" variant="outline">↑ Export</Btn>]}>
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[["Total Orders", orders.length, C.blue], ["Completed", orders.filter(o => o.status === "completed").length, C.green], ["Processing", orders.filter(o => o.status === "processing").length, C.yellow], ["Pending", orders.filter(o => o.status === "pending").length, C.red]].map(([l, v, c]) => (
          <Card key={l}><div style={{ fontSize: 12, color: C.g400, marginBottom: 6 }}>{l}</div><div style={{ fontSize: 28, fontWeight: 800, color: c, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{v}</div></Card>
        ))}
      </div>
      <Card>
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <input placeholder="🔍 Search orders…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            <option>All Status</option><option>Completed</option><option>Processing</option><option>Pending</option>
          </select>
          <Btn variant="outline" size="sm" onClick={refetch} disabled={loading}>{loading ? '↻' : '↻ Refresh'}</Btn>
        </div>
        {loading && <div style={{ textAlign: "center", padding: "20px", color: C.g400, fontSize: 14 }}>Loading orders…</div>}
        <DataTable cols={cols} rows={filteredOrders} />
        <div style={{ marginTop: 14 }}>
          <Pagination total={`${filteredOrders.length} orders`} showing={`1–${filteredOrders.length}`} pages={["‹", 1, 2, 3, "...", Math.ceil(filteredOrders.length / 10) || 1, "›"]} />
        </div>
      </Card>
      {confirmDelete && (
        <Modal title="Delete Order" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ fontSize: 14, color: C.g600, marginBottom: 20 }}>
            Permanently delete order <strong style={{ color: C.g800 }}>{confirmDelete.id}</strong>? This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="outline" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancel</Btn>
            <Btn variant="danger" onClick={() => deleteOrder(confirmDelete.id)} disabled={savingId === confirmDelete.id} style={{ flex: 1 }}>
              {savingId === confirmDelete.id ? 'Deleting…' : 'Yes, Delete'}
            </Btn>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN DEPOSITS PAGE
═══════════════════════════════════════════════════ */
export function AdminDepositsPage({ deposits, setStore, addBalance }) {
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [error, setError] = useState("");
  const [proofModal, setProofModal] = useState(null);

  const filteredDeposits = deposits.filter(d => {
    const matchesSearch = !search || d.id?.toLowerCase().includes(search.toLowerCase()) || d.user?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || d.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('deposits', { order: 'created_at', ascending: 'false' });
      if (data && data.length > 0) {
        setStore(s => ({ ...s, deposits: data }));
      }
    } catch (err) {
      console.error('Deposits refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setStore]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const approve = async (id) => {
    const dep = deposits.find(d => d.id === id);
    if (!dep || !dep.user_id) return;

    setLoadingId(id);
    setError("");
    try {
      const res = await fetch('/api/admin/deposits/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: id, userId: dep.user_id, amount: dep.amount }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Approval failed');

      if (dep) addBalance(dep.amount);
      setStore(s => ({ ...s, deposits: s.deposits.map(d => d.id === id ? { ...d, status: "completed" } : d) }));
    } catch (err) {
      setError('Approval failed: ' + err.message);
      console.error('Approve deposit error:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const reject = async (id) => {
    setLoadingId(id);
    setError("");
    try {
      await apiPut('deposits', { id, status: 'rejected' });
      setStore(s => ({ ...s, deposits: s.deposits.map(d => d.id === id ? { ...d, status: "rejected" } : d) }));
    } catch (err) {
      setError('Rejection failed: ' + err.message);
      console.error('Reject deposit error:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const cols = [
    { label: "Deposit ID", render: r => <span style={{ fontWeight: 700, color: C.primary, fontSize: 12 }}>{r.id}</span> },
    { label: "User", render: r => <span style={{ fontSize: 12, color: C.g500 }}>{r.user_email || r.user}</span> },
    { label: "Method", render: r => <span style={{ fontSize: 12 }}>{r.method}</span> },
    { label: "Amount", render: r => <span style={{ fontWeight: 800, color: C.green, fontVariantNumeric: 'tabular-nums' }}>${r.amount?.toFixed ? r.amount.toFixed(2) : r.amount}</span> },
    { label: "Status", render: r => <Badge status={r.status} /> },
    { label: "Proof", render: r => r.proof && r.proof.startsWith('data:image')
      ? <img src={r.proof} alt="proof" onClick={() => setProofModal(r.proof)} style={{ height: 36, borderRadius: 4, cursor: "pointer", objectFit: "cover", border: `1px solid ${C.g200}` }} />
      : <span style={{ fontSize: 12, color: C.g400 }}>{r.proof || "—"}</span>
    },
    { label: "Date", render: r => <span style={{ fontSize: 12, color: C.g400 }}>{r.date}</span> },
    { label: "Actions", render: r => r.status === "pending"
      ? <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="success" size="sm" onClick={() => approve(r.id)} disabled={loadingId === r.id}>{loadingId === r.id ? '…' : '✓ Approve'}</Btn>
        <Btn variant="danger" size="sm" onClick={() => reject(r.id)} disabled={loadingId === r.id}>✕ Reject</Btn>
      </div>
      : <Badge status={r.status} />
    },
  ];

  const pending = deposits.filter(d => d.status === "pending");

  return (
    <PageShell title="Deposits" subtitle="Review and approve user deposit requests."
      actions={[<Btn key="exp" variant="outline">↑ Export</Btn>]}>
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}
      {pending.length > 0 && (
        <div style={{ background: C.yellowL, border: `1px solid ${C.yellow}40`, borderRadius: 12, padding: "14px 20px", marginBottom: 22, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>⏳</span>
          <div><strong style={{ color: "#92400e" }}>{pending.length} deposit{pending.length > 1 ? "s" : ""} pending review</strong><div style={{ fontSize: 13, color: "#a16207", marginTop: 2 }}>Review and approve or reject the deposits below.</div></div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[["Total Deposits", `$${deposits.reduce((a, d) => a + (d.amount || 0), 0).toLocaleString()}`, C.blue], ["Approved", `$${deposits.filter(d => d.status === "completed").reduce((a, d) => a + (d.amount || 0), 0).toLocaleString()}`, C.green], ["Pending", `$${pending.reduce((a, d) => a + (d.amount || 0), 0).toLocaleString()}`, C.yellow], ["Rejected", `$${deposits.filter(d => d.status === "rejected").reduce((a, d) => a + (d.amount || 0), 0).toLocaleString()}`, C.red]].map(([l, v, c]) => (
          <Card key={l}><div style={{ fontSize: 12, color: C.g400, marginBottom: 6 }}>{l}</div><div style={{ fontSize: 24, fontWeight: 800, color: c, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{v}</div></Card>
        ))}
      </div>
      <Card>
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <input placeholder="🔍 Search deposits…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            <option>All Status</option><option>Pending</option><option>Completed</option><option>Rejected</option>
          </select>
          <Btn variant="outline" size="sm" onClick={refetch} disabled={loading}>{loading ? '↻' : '↻ Refresh'}</Btn>
        </div>
        {loading && <div style={{ textAlign: "center", padding: "20px", color: C.g400, fontSize: 14 }}>Loading deposits…</div>}
        <DataTable cols={cols} rows={filteredDeposits} />
        <div style={{ marginTop: 14 }}>
          <Pagination total={`${filteredDeposits.length} deposits`} showing={`1–${filteredDeposits.length}`} pages={["‹", 1, 2, "›"]} />
        </div>
      </Card>
      {proofModal && (
        <div onClick={() => setProofModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
            <button onClick={() => setProofModal(null)} style={{ position: "absolute", top: -14, right: -14, width: 32, height: 32, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.3)", zIndex: 1 }}>✕</button>
            <img src={proofModal} alt="Proof of payment" style={{ maxWidth: "88vw", maxHeight: "88vh", borderRadius: 12, objectFit: "contain", display: "block" }} />
          </div>
        </div>
      )}
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN TICKETS PAGE
═══════════════════════════════════════════════════ */
export function AdminTicketsPage({ tickets }) {
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(false);

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === "All Status") return true;
    return t.status === statusFilter.toLowerCase();
  });

  return (
    <PageShell title="Support Tickets" subtitle="Manage user support requests.">
      {tickets.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 32px" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>💬</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.g700 }}>No Tickets Yet</h3>
          <p style={{ fontSize: 14, color: C.g400, marginTop: 8 }}>All caught up!</p>
        </Card>
      ) : (
        <Card>
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
              <option>All Status</option><option>Open</option><option>Closed</option>
            </select>
          </div>
          {filteredTickets.map((t, i) => (
            <div key={t.id} className="reveal-item" style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${C.g100}`, animationDelay: `${i * 45}ms` }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.g800 }}>{t.subject}</div>
                <div style={{ fontSize: 12, color: C.g400, marginTop: 2 }}>{t.user_email} · {t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</div>
                <div style={{ fontSize: 13, color: C.g500, marginTop: 4 }}>{t.message}</div>
              </div>
              <Badge status={t.status} />
            </div>
          ))}
        </Card>
      )}
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN REPORTS PAGE
═══════════════════════════════════════════════════ */
export function AdminReportsPage() {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [users, orders, deposits, tickets] = await Promise.all([
          apiGet('users'),
          apiGet('orders'),
          apiGet('deposits'),
          apiGet('support_tickets'),
        ]);

        const now = new Date();
        const day = 24 * 60 * 60 * 1000;
        const last7 = new Date(now - 7 * day);
        const last30 = new Date(now - 30 * day);

        const recentUsers = users.filter(u => new Date(u.created_at) >= last30).length;
        const recentOrders = orders.filter(o => new Date(o.created_at) >= last7).length;

        const totalDeposits = deposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        const pendingDeposits = deposits.filter(d => d.status === 'pending').length;

        const ordersByStatus = orders.reduce((acc, o) => {
          const s = o.status || 'unknown';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {});

        const ticketsByStatus = tickets.reduce((acc, t) => {
          const s = t.status || 'open';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {});

        // Last 7 days user registrations
        const usersByDay = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now - (6 - i) * day);
          const dateStr = d.toISOString().slice(0, 10);
          return {
            label: d.toLocaleDateString('en', { weekday: 'short' }),
            count: users.filter(u => u.created_at?.slice(0, 10) === dateStr).length,
          };
        });

        // Last 7 days orders
        const ordersByDay = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now - (6 - i) * day);
          const dateStr = d.toISOString().slice(0, 10);
          return {
            label: d.toLocaleDateString('en', { weekday: 'short' }),
            count: orders.filter(o => o.created_at?.slice(0, 10) === dateStr).length,
          };
        });

        setStats({
          totalUsers: users.length, recentUsers,
          totalOrders: orders.length, recentOrders,
          totalDeposits, pendingDeposits,
          openTickets: ticketsByStatus['open'] || ticketsByStatus['pending'] || 0,
          totalTickets: tickets.length,
          ordersByStatus, ticketsByStatus,
          usersByDay, ordersByDay,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, sub: `+${stats.recentUsers} this month`, color: '#6366f1' },
    { label: 'Total Orders', value: stats.totalOrders, sub: `+${stats.recentOrders} this week`, color: C.primary },
    { label: 'Total Deposits', value: `$${stats.totalDeposits.toLocaleString()}`, sub: `${stats.pendingDeposits} pending`, color: '#10b981' },
    { label: 'Support Tickets', value: stats.totalTickets, sub: `${stats.openTickets} open`, color: '#f59e0b' },
  ] : [];

  function MiniBar({ days, color }) {
    const max = Math.max(...days.map(d => d.count), 1);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, marginTop: 12 }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', height: `${Math.max((d.count / max) * 80, d.count > 0 ? 6 : 2)}px`, background: d.count > 0 ? color + 'cc' : TC.g100, borderRadius: '3px 3px 0 0', transition: 'height .3s' }} />
            <span style={{ fontSize: 9, color: TC.textSecondary }}>{d.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <PageShell title="Reports" subtitle="Live platform analytics from your database.">
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: TC.textSecondary, fontSize: 14 }}>Loading reports…</div>
      ) : !stats ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: TC.textSecondary, fontSize: 14 }}>Could not load data.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {statCards.map(s => (
              <Card key={s.label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TC.textSecondary }}>{s.label}</span>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: TC.text, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: TC.textSecondary, marginTop: 6 }}>{s.sub}</div>
              </Card>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 800, color: TC.text }}>New Users — Last 7 Days</div>
              <MiniBar days={stats.usersByDay} color="#6366f1" />
            </Card>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 800, color: TC.text }}>Orders — Last 7 Days</div>
              <MiniBar days={stats.ordersByDay} color={C.primary} />
            </Card>
          </div>

          {/* Breakdown tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 800, color: TC.text, marginBottom: 16 }}>Orders by Status</div>
              {Object.keys(stats.ordersByStatus).length === 0
                ? <div style={{ color: TC.textSecondary, fontSize: 13 }}>No orders yet.</div>
                : Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${TC.border}` }}>
                    <span style={{ fontSize: 13, textTransform: 'capitalize', color: TC.text }}>{status}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TC.text }}>{count}</span>
                  </div>
                ))
              }
            </Card>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 800, color: TC.text, marginBottom: 16 }}>Tickets by Status</div>
              {Object.keys(stats.ticketsByStatus).length === 0
                ? <div style={{ color: TC.textSecondary, fontSize: 13 }}>No tickets yet.</div>
                : Object.entries(stats.ticketsByStatus).map(([status, count]) => (
                  <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${TC.border}` }}>
                    <span style={{ fontSize: 13, textTransform: 'capitalize', color: TC.text }}>{status}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TC.text }}>{count}</span>
                  </div>
                ))
              }
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}

const SETTINGS_KEY = 'adver_settings_v1';

function loadSettings() {
  try { const raw = localStorage.getItem(SETTINGS_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  return null;
}

function saveSettings(paymentMethods, businessTypes) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ paymentMethods, businessTypes })); } catch (e) {}
}

/* ═══════════════════════════════════════════════════
   ADMIN SETTINGS PAGE
═══════════════════════════════════════════════════ */
const PLATFORM_DEFAULTS = {
  allow_signup: true,
  maintenance_mode: false,
  min_deposit: 100,
  global_discount: 0,
  contact_email: '',
  contact_whatsapp: '',
  contact_telegram: '',
  site_name: 'AdverSolutions',
  footer_text: '© AdverSolutions. All rights reserved.',
  site_logo: '',
  site_favicon: '',
  wa_enabled: true,
  wa_number: '',
  wa_position: 'right',
  wa_color: '#25d366',
  wa_animation: 'wiggle_pulse',
  wa_size: 'medium',
};

export function AdminSettingsPage({ paymentMethods, businessTypes, setStore }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingKey, setUploadingKey] = useState(null);
  const [editingMethod, setEditingMethod] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [platformCfg, setPlatformCfg] = useState({ ...PLATFORM_DEFAULTS });
  const [cfgSaving, setCfgSaving] = useState(false);
  const [cfgSuccess, setCfgSuccess] = useState('');

  // Load from localStorage on mount, fallback to props
  const [methods, setMethods] = useState(() => {
    const local = loadSettings();
    return local?.paymentMethods || paymentMethods;
  });
  const [bizTypes, setBizTypes] = useState(() => {
    const local = loadSettings();
    return (local?.businessTypes || businessTypes).join("\n");
  });

  // Persist to localStorage + global store whenever methods or bizTypes change
  useEffect(() => {
    const btArray = bizTypes.split("\n").map(t => t.trim()).filter(Boolean);
    saveSettings(methods, btArray);
    setStore(s => ({ ...s, paymentMethods: methods, businessTypes: btArray }));
  }, [methods, bizTypes, setStore]);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const [pmRes, btRes, cfgRes] = await Promise.all([
        fetch('/api/admin/payment-methods'),
        fetch('/api/admin/business-types'),
        fetch('/api/admin/platform-settings'),
      ]);
      const pmData = pmRes.ok ? await pmRes.json() : null;
      const btData = btRes.ok ? await btRes.json() : null;
      const cfgData = cfgRes.ok ? await cfgRes.json() : null;
      if (pmData && Array.isArray(pmData)) setMethods(pmData);
      if (btData && Array.isArray(btData)) setBizTypes(btData.join("\n"));
      if (cfgData && typeof cfgData === 'object') setPlatformCfg(c => ({ ...c, ...cfgData }));
    } catch (err) {
      console.error('Settings refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePlatformCfg = async () => {
    setCfgSaving(true);
    setCfgSuccess('');
    setError('');
    try {
      await apiFetch('/api/admin/platform-settings', {
        method: 'POST',
        body: JSON.stringify(platformCfg),
      });
      setCfgSuccess('Platform settings saved!');
      setTimeout(() => setCfgSuccess(''), 3000);
    } catch (e) {
      setError('Failed to save platform settings: ' + e.message);
    } finally {
      setCfgSaving(false);
    }
  };

  const cfgSet = (key, val) => setPlatformCfg(c => ({ ...c, [key]: val }));

  const handleImageUpload = (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    setError('');
    const ext = file.name.split('.').pop().toLowerCase();
    const filename = `${key}-${Date.now()}.${ext}`;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = await apiFetch('/api/admin/upload-asset', {
          method: 'POST',
          body: JSON.stringify({ data: e.target.result, filename }),
        });
        cfgSet(key, result.url);
      } catch {
        // Fallback: store as base64 if storage fails
        cfgSet(key, e.target.result);
      } finally {
        setUploadingKey(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-refetch on mount to sync with Supabase (overwrites local)
  useEffect(() => {
    refetch();
  }, [refetch]);

  const saveBizTypes = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updatedBizTypes = bizTypes.split("\n").map(t => t.trim()).filter(Boolean);
      try {
        await fetch('/api/admin/business-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names: updatedBizTypes }),
        });
      } catch (dbErr) {
        console.warn('Business types API save failed:', dbErr.message);
      }
      setSuccess("Business types saved!");
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = async (id) => {
    const updated = methods.map(x => x.id === id ? { ...x, active: !x.active } : x);
    const method = updated.find(x => x.id === id);
    setMethods(updated);
    try {
      await fetch('/api/admin/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: method.active }),
      });
    } catch (e) {}
  };

  const saveMethod = async (methodData) => {
    setSaving(true);
    setError("");
    try {
      let saved = null;
      const isExisting = methodData.id && methods.find(m => m.id === methodData.id);
      try {
        const res = await fetch('/api/admin/payment-methods', {
          method: isExisting ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(methodData),
        });
        if (res.ok) {
          const json = await res.json();
          saved = json;
        }
      } catch (dbErr) {
        console.warn('API save failed, using local state:', dbErr.message);
      }
      const finalMethod = saved || methodData;
      const updated = isExisting
        ? methods.map(m => m.id === methodData.id ? finalMethod : m)
        : [...methods, finalMethod];
      setMethods(updated);
      setEditingMethod(null);
      setShowAddModal(false);
      setSuccess("Payment method saved!");
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMethod = async (id) => {
    if (!confirm('Delete this payment method?')) return;
    setSaving(true);
    try {
      try {
        await fetch(`/api/admin/payment-methods?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
      } catch (dbErr) {}
      const updated = methods.filter(m => m.id !== id);
      setMethods(updated);
      setSuccess("Payment method deleted!");
    } catch (err) {
      setError('Failed to delete: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="System Settings" subtitle="Configure platform settings.">
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}
      {success && (
        <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{success}</div>
      )}

      {/* Sub-page navigation */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TC.g500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Configuration Pages</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'WhatsApp OTP', icon: '📱', desc: 'Manage WhatsApp OTP configuration', path: '/admin/whatsapp' },
            { label: 'Order Notifications', icon: '🔔', desc: 'WhatsApp alerts for orders & top-ups', path: '/admin/order-notifications' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, border: `1px solid ${TC.g200}`, background: TC.card, cursor: 'pointer', textAlign: 'left', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", transition: 'border-color .15s', minWidth: 220 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
              onMouseLeave={e => e.currentTarget.style.borderColor = TC.g200}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: TC.g800 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: TC.textSecondary, marginTop: 2 }}>{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Payment Methods */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TC.g800 }}>Payment Methods</h3>
          <Btn size="sm" onClick={() => setShowAddModal(true)}>+ Add Method</Btn>
        </div>
        {methods.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${TC.g100}` }}>
            <div onClick={() => toggleMethod(m.id)} style={{ width: 36, height: 20, borderRadius: 10, background: m.active ? C.primary : TC.g300, cursor: "pointer", position: "relative", transition: "all .2s", flexShrink: 0 }}>
              <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: m.active ? 18 : 2, transition: "all .2s" }} />
            </div>
            <div style={{ width: 28, height: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {m.logo && (m.logo.startsWith('data:') || m.logo.startsWith('http')) ? (
                <img src={m.logo} alt="" style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 4 }} />
              ) : (
                <span style={{ fontSize: 20 }}>{m.logo || "💳"}</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: TC.g800 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: TC.g400 }}>{m.bank_name} · {(m.fields || []).map(f => `${f.label}: ${f.value}`).join(" · ")}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => setEditingMethod(m)} style={{ background: TC.g100, border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", color: TC.g600 }}>Edit</button>
              <button onClick={() => deleteMethod(m.id)} style={{ background: C.redL, border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", color: C.red }}>Delete</button>
            </div>
          </div>
        ))}
      </Card>

      {/* Business Types */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 800, color: TC.g800 }}>Business Types</h3>
        <p style={{ fontSize: 13, color: TC.g500, marginBottom: 12 }}>One per line. These appear in signup and ad account forms.</p>
        <textarea rows={8} value={bizTypes} onChange={e => setBizTypes(e.target.value)}
          style={{ width: "100%", border: `1px solid ${TC.g200}`, borderRadius: 10, padding: "12px 14px", fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 16, background: TC.card, color: TC.g800 }} />
        <Btn onClick={saveBizTypes} disabled={saving}>{saving ? 'Saving…' : '💾 Save Business Types'}</Btn>
      </Card>

      {/* ── Platform Configuration ── */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: TC.g800 }}>Platform Configuration</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: TC.g500 }}>Control core platform behaviour.</p>

        {cfgSuccess && <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{cfgSuccess}</div>}

        {/* Toggles row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          {[
            { key: 'allow_signup',      label: 'User Sign-Up',      desc: 'Allow new users to register'       },
            { key: 'maintenance_mode',  label: 'Maintenance Mode',  desc: 'Show maintenance page to all users' },
          ].map(({ key, label, desc }) => (
            <div key={key} onClick={() => cfgSet(key, !platformCfg[key])} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
              borderRadius: 12, border: `1px solid ${TC.g200}`, cursor: "pointer",
              background: platformCfg[key] ? (key === 'maintenance_mode' ? '#fef3c730' : '#dcfce730') : TC.g50,
              flex: "1 1 220px", userSelect: "none", transition: "all .15s",
            }}>
              <div style={{ width: 40, height: 22, borderRadius: 11, position: "relative", flexShrink: 0,
                background: platformCfg[key] ? (key === 'maintenance_mode' ? '#f59e0b' : '#22c55e') : TC.g300,
                transition: "background .2s" }}>
                <div style={{ width: 18, height: 18, background: "#fff", borderRadius: "50%", position: "absolute",
                  top: 2, left: platformCfg[key] ? 20 : 2, transition: "left .2s" }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TC.g800 }}>{label}</div>
                <div style={{ fontSize: 11, color: TC.g400, marginTop: 1 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Number inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { key: 'min_deposit',     label: 'Minimum Deposit ($)', type: 'number', min: 0 },
            { key: 'global_discount', label: 'Global Discount (%)',  type: 'number', min: 0, max: 100 },
          ].map(({ key, label, type, min, max }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: TC.g600, marginBottom: 6, textTransform: "uppercase", letterSpacing: .4 }}>{label}</label>
              <input type={type} min={min} max={max} value={platformCfg[key]} onChange={e => cfgSet(key, Number(e.target.value))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${TC.g200}`, fontSize: 13, background: TC.card, color: TC.g800, boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TC.g600, textTransform: "uppercase", letterSpacing: .4, marginBottom: 12 }}>Contact &amp; Support</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { key: 'contact_email',     label: 'Support Email',    placeholder: 'support@example.com', type: 'email' },
              { key: 'contact_whatsapp',  label: 'WhatsApp Number (with country code)',  placeholder: '+212612345678',          type: 'text'  },
              { key: 'contact_telegram',  label: 'Telegram Link',    placeholder: 'https://t.me/...',     type: 'text'  },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TC.g500, marginBottom: 5 }}>{label}</label>
                <input type={type} value={platformCfg[key]} onChange={e => cfgSet(key, e.target.value)} placeholder={placeholder}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${TC.g200}`, fontSize: 13, background: TC.card, color: TC.g800, boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
            ))}
          </div>
        </div>

        <Btn onClick={savePlatformCfg} disabled={cfgSaving}>{cfgSaving ? 'Saving…' : '💾 Save Platform Settings'}</Btn>
      </Card>

      {/* ── WhatsApp Button Settings ── */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: TC.g800 }}>WhatsApp Button Settings</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: TC.g500 }}>Configure the floating WhatsApp button shown to users.</p>

        {/* Enable toggle */}
        <div style={{ marginBottom: 20 }}>
          <div onClick={() => cfgSet('wa_enabled', !platformCfg.wa_enabled)} style={{
            display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 18px",
            borderRadius: 12, border: `1px solid ${TC.g200}`, cursor: "pointer",
            background: platformCfg.wa_enabled ? '#dcfce730' : TC.g50, userSelect: "none",
          }}>
            <div style={{ width: 40, height: 22, borderRadius: 11, position: "relative", flexShrink: 0,
              background: platformCfg.wa_enabled ? '#25d366' : TC.g300, transition: "background .2s" }}>
              <div style={{ width: 18, height: 18, background: "#fff", borderRadius: "50%", position: "absolute",
                top: 2, left: platformCfg.wa_enabled ? 20 : 2, transition: "left .2s" }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TC.g800 }}>Show WhatsApp Button</div>
              <div style={{ fontSize: 11, color: TC.g400 }}>Display floating button on user pages</div>
            </div>
          </div>
        </div>

        {/* Number */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: TC.g600, textTransform: "uppercase", letterSpacing: .4, marginBottom: 6 }}>WhatsApp Number</label>
          <input type="text" value={platformCfg.wa_number} onChange={e => cfgSet('wa_number', e.target.value)}
            placeholder="Country code + number, e.g. 212612345678"
            style={{ width: "100%", maxWidth: 360, padding: "9px 12px", borderRadius: 8, border: `1px solid ${TC.g200}`, fontSize: 13, background: TC.card, color: TC.g800, boxSizing: "border-box", fontFamily: "inherit" }} />
          <div style={{ fontSize: 11, color: TC.g400, marginTop: 4 }}>No + or spaces. Include country code (e.g. 44 for UK, 212 for Morocco).</div>
        </div>

        {/* Position */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TC.g600, textTransform: "uppercase", letterSpacing: .4, marginBottom: 10 }}>Button Position</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { val: 'left',  label: '← Bottom Left' },
              { val: 'right', label: 'Bottom Right →' },
            ].map(({ val, label }) => (
              <div key={val} onClick={() => cfgSet('wa_position', val)} style={{
                padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: `2px solid ${platformCfg.wa_position === val ? '#25d366' : TC.g200}`,
                background: platformCfg.wa_position === val ? '#dcfce740' : TC.card,
                color: platformCfg.wa_position === val ? '#166534' : TC.g600,
              }}>{label}</div>
            ))}
          </div>
        </div>

        {/* Size */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TC.g600, textTransform: "uppercase", letterSpacing: .4, marginBottom: 10 }}>Button Size</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { val: 'small',  label: 'Small (46px)' },
              { val: 'medium', label: 'Medium (56px)' },
              { val: 'large',  label: 'Large (68px)' },
            ].map(({ val, label }) => (
              <div key={val} onClick={() => cfgSet('wa_size', val)} style={{
                padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: `2px solid ${platformCfg.wa_size === val ? '#25d366' : TC.g200}`,
                background: platformCfg.wa_size === val ? '#dcfce740' : TC.card,
                color: platformCfg.wa_size === val ? '#166534' : TC.g600,
              }}>{label}</div>
            ))}
          </div>
        </div>

        {/* Color */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TC.g600, textTransform: "uppercase", letterSpacing: .4, marginBottom: 10 }}>Button Color</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {['#25d366','#128c7e','#075e54','#e8192c','#1877f2','#000000'].map(color => (
              <div key={color} onClick={() => cfgSet('wa_color', color)} style={{
                width: 36, height: 36, borderRadius: "50%", background: color, cursor: "pointer",
                border: platformCfg.wa_color === color ? `3px solid ${TC.g800}` : `3px solid transparent`,
                boxShadow: platformCfg.wa_color === color ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : 'none',
                transition: "all .15s",
              }} />
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="color" value={platformCfg.wa_color} onChange={e => cfgSet('wa_color', e.target.value)}
                style={{ width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer", padding: 2 }} />
              <span style={{ fontSize: 12, color: TC.g500 }}>Custom</span>
            </div>
          </div>
        </div>

        {/* Animation */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TC.g600, textTransform: "uppercase", letterSpacing: .4, marginBottom: 10 }}>Animation</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { val: 'wiggle_pulse', label: '🌀 Wiggle + Pulse' },
              { val: 'bounce',       label: '⬆️ Bounce' },
              { val: 'heartbeat',    label: '💓 Heartbeat' },
              { val: 'shake_glow',   label: '✨ Shake + Glow' },
              { val: 'none',         label: '— None' },
            ].map(({ val, label }) => (
              <div key={val} onClick={() => cfgSet('wa_animation', val)} style={{
                padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: `2px solid ${platformCfg.wa_animation === val ? '#25d366' : TC.g200}`,
                background: platformCfg.wa_animation === val ? '#dcfce740' : TC.card,
                color: platformCfg.wa_animation === val ? '#166534' : TC.g600,
              }}>{label}</div>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div style={{ marginBottom: 24, padding: "16px 20px", background: TC.g50, borderRadius: 12, border: `1px solid ${TC.g200}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TC.g600, textTransform: "uppercase", letterSpacing: .4, marginBottom: 12 }}>Preview</div>
          <div style={{ position: "relative", height: 80, background: TC.card, borderRadius: 10, border: `1px solid ${TC.g200}` }}>
            {platformCfg.wa_enabled && (
              <div style={{
                position: "absolute",
                bottom: 12,
                [platformCfg.wa_position === 'left' ? 'left' : 'right']: 12,
                width: platformCfg.wa_size === 'small' ? 36 : platformCfg.wa_size === 'large' ? 52 : 44,
                height: platformCfg.wa_size === 'small' ? 36 : platformCfg.wa_size === 'large' ? 52 : 44,
                borderRadius: "50%",
                background: platformCfg.wa_color,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M16 2C8.268 2 2 8.268 2 16c0 2.478.664 4.797 1.822 6.79L2 30l7.424-1.782A13.932 13.932 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="#fff"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M16 4.4c-6.4 0-11.6 5.2-11.6 11.6 0 2.24.636 4.324 1.74 6.088l.272.44-1.16 4.224 4.352-1.136.424.252A11.56 11.56 0 0016 27.6c6.4 0 11.6-5.2 11.6-11.6S22.4 4.4 16 4.4zm6.8 16.528c-.272.76-1.588 1.448-2.2 1.536-.56.08-1.268.112-2.044-.128a18.8 18.8 0 01-1.852-.688c-3.256-1.408-5.38-4.696-5.544-4.912-.16-.216-1.304-1.736-1.304-3.312 0-1.576.824-2.352 1.116-2.672.292-.32.636-.4.848-.4.212 0 .424 0 .608.008.2.008.464-.076.728.552.272.648.916 2.24 1 2.4.08.16.132.348.028.56-.104.212-.16.348-.316.536-.16.188-.332.42-.476.564-.16.16-.324.332-.14.652.184.32.82 1.352 1.76 2.192 1.208 1.076 2.228 1.408 2.548 1.568.32.16.504.132.688-.08.184-.212.788-.916 1-.232.212.684 1.304 1.244 1.744 1.468.44.224.728.332.836.52.112.184.112.96-.16 1.748z" fill={platformCfg.wa_color}/>
                </svg>
              </div>
            )}
            {!platformCfg.wa_enabled && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 13, color: TC.g400 }}>Button is hidden</div>
            )}
          </div>
        </div>

        <Btn onClick={savePlatformCfg} disabled={cfgSaving} style={{ background: '#25d366', borderColor: '#25d366' }}>
          {cfgSaving ? 'Saving…' : '💾 Save WhatsApp Settings'}
        </Btn>
        {cfgSuccess && <span style={{ marginLeft: 12, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{cfgSuccess}</span>}
      </Card>

      {/* ── Branding ── */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: TC.g800 }}>Branding</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: TC.g500 }}>Customize the site name, logo, favicon and footer.</p>

        {/* Text fields */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { key: 'site_name',    label: 'Website Name',  placeholder: 'AdverSolutions' },
            { key: 'footer_text',  label: 'Footer Text',   placeholder: '© Your Company. All rights reserved.' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: TC.g600, marginBottom: 6, textTransform: "uppercase", letterSpacing: .4 }}>{label}</label>
              <input type="text" value={platformCfg[key]} onChange={e => cfgSet(key, e.target.value)} placeholder={placeholder}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${TC.g200}`, fontSize: 13, background: TC.card, color: TC.g800, boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          ))}
        </div>

        {/* Logo & Favicon uploads */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 24 }}>
          {[
            { key: 'site_logo',    label: 'Site Logo',  size: 64 },
            { key: 'site_favicon', label: 'Favicon',    size: 40 },
          ].map(({ key, label, size }) => (
            <div key={key}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TC.g600, textTransform: "uppercase", letterSpacing: .4, marginBottom: 8 }}>{label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: size, height: size, borderRadius: 10, border: `2px dashed ${TC.g200}`, background: TC.g50,
                  display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {platformCfg[key]
                    ? <img src={platformCfg[key]} alt={label} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                    : <span style={{ fontSize: 11, color: TC.g400 }}>None</span>
                  }
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 7, border: `1px solid ${TC.g200}`,
                    fontSize: 12, fontWeight: 600, color: TC.g600,
                    cursor: uploadingKey === key ? "wait" : "pointer",
                    background: TC.g50, transition: "all .12s",
                    opacity: uploadingKey && uploadingKey !== key ? 0.5 : 1,
                  }}>
                    {uploadingKey === key ? '⏳ Uploading…' : '📁 Upload'}
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      disabled={!!uploadingKey}
                      onChange={e => handleImageUpload(key, e.target.files?.[0])} />
                  </label>
                  {platformCfg[key] && (
                    <button onClick={() => cfgSet(key, '')} style={{ background: "none", border: "none", fontSize: 11, color: TC.g400, cursor: "pointer", textAlign: "left", padding: 0 }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Btn onClick={savePlatformCfg} disabled={cfgSaving}>{cfgSaving ? 'Saving…' : '💾 Save Branding'}</Btn>
      </Card>

      {/* Edit/Add Modal */}
      {(editingMethod || showAddModal) && (
        <PaymentMethodModal
          method={editingMethod}
          onSave={saveMethod}
          onClose={() => { setEditingMethod(null); setShowAddModal(false); }}
          saving={saving}
        />
      )}
    </PageShell>
  );
}

function PaymentMethodModal({ method, onSave, onClose, saving }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  const isEdit = !!method;
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("");
  const [logo, setLogo] = useState("💳");
  const [fields, setFields] = useState([{ label: "", value: "" }]);

  // Reset state when method prop changes
  useEffect(() => {
    setName(method?.name || "");
    setBankName(method?.bank_name || "");
    setLogo(method?.logo || "💳");
    setFields(method?.fields?.length ? method.fields : [{ label: "", value: "" }]);
  }, [method]);

  const addField = () => setFields(f => [...f, { label: "", value: "" }]);
  const removeField = (i) => setFields(f => f.filter((_, idx) => idx !== i));
  const updateField = (i, key, val) => setFields(f => f.map((fld, idx) => idx === i ? { ...fld, [key]: val } : fld));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim() || !bankName.trim()) return;
    const validFields = fields.filter(f => f.label.trim() && f.value.trim());
    onSave({
      id: method?.id || `pm-${Date.now()}`,
      name: name.trim(),
      bank_name: bankName.trim(),
      logo: logo || "💳",
      account: validFields[0]?.value || "",
      active: method?.active ?? true,
      fields: validFields,
    });
  };

  return (
    <Modal title={isEdit ? "Edit Payment Method" : "Add Payment Method"} onClose={onClose} width={520}>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 6, fontWeight: 600 }}>Display Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Payoneer"
          style={{ width: "100%", border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: TC.g800, background: TC.card }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 6, fontWeight: 600 }}>Bank / Provider Name *</label>
        <input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Payoneer Inc."
          style={{ width: "100%", border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: TC.g800, background: TC.card }} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 6, fontWeight: 600 }}>Logo (PNG/JPG image)</label>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {logo && logo.startsWith('data:') ? (
            <img src={logo} alt="logo" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8, border: `1px solid ${TC.g200}` }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 8, border: `1px solid ${TC.g200}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: TC.g50 }}>{logo || "💳"}</div>
          )}
          <div style={{ flex: 1 }}>
            <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileUpload}
              style={{ width: "100%", fontSize: 13, color: TC.g600 }} />
          </div>
          {logo && (
            <button onClick={() => setLogo('')} style={{ background: "none", border: "none", color: C.red, fontSize: 12, cursor: "pointer" }}>Remove</button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: TC.g600, fontWeight: 600 }}>Payment Details</label>
          <button onClick={addField} style={{ background: "none", border: "none", color: C.primary, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add field</button>
        </div>
        {fields.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input value={f.label} onChange={e => updateField(i, "label", e.target.value)} placeholder="Label (e.g. Email)"
              style={{ flex: 1, border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: TC.g800, background: TC.card }} />
            <input value={f.value} onChange={e => updateField(i, "value", e.target.value)} placeholder="Value"
              style={{ flex: 2, border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: TC.g800, background: TC.card }} />
            {fields.length > 1 && (
              <button onClick={() => removeField(i)} style={{ background: "none", border: "none", color: C.red, fontSize: 16, cursor: "pointer", padding: "0 4px" }}>✕</button>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave} disabled={saving || !name.trim() || !bankName.trim()}>
          {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Add Method')}
        </Btn>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN AGENCY AD ACCOUNTS PAGE
═══════════════════════════════════════════════════ */

const DEFAULT_PLATFORM_PRICES = {
  meta:     { name: 'Meta (Facebook)', icon: 'Meta',     sub: 'Business Manager & Ad Account', price: 50, fee: 6, minTopup: 200, active: true,
    fields: [
      { key: 'bm_id',      label: 'Business Manager ID',        type: 'text',     required: false, placeholder: '123456789012345' },
      { key: 'page_links', label: 'Facebook Page Links (one per line)', type: 'textarea', required: false, placeholder: 'https://facebook.com/your-brand' },
      { key: 'domain',     label: 'Domain Name',                type: 'text',     required: false, placeholder: 'yourbrand.com' },
    ]},
  google:   { name: 'Google Ads',      icon: 'Google',   sub: 'Google Ads Account',            price: 50, fee: 6, minTopup: 200, active: true,
    fields: [
      { key: 'gmail', label: 'Gmail Account (fresh)', type: 'email', required: false, placeholder: 'yourbrand@gmail.com' },
    ]},
  tiktok:   { name: 'TikTok Ads',      icon: 'TikTok',   sub: 'TikTok Business Account',       price: 50, fee: 6, minTopup: 200, active: true,
    fields: [
      { key: 'business_center_id', label: 'TikTok Business Center ID', type: 'text', required: false, placeholder: '7000000000000' },
    ]},
  snapchat: { name: 'Snapchat Ads',    icon: 'Snapchat', sub: 'Snapchat Business Account',     price: 50, fee: 6, minTopup: 200, active: true,
    fields: [
      { key: 'snap_profile', label: 'Snapchat Business Profile URL', type: 'url', required: false, placeholder: 'https://www.snapchat.com/add/your-brand' },
    ]},
};

export function AdminAgencyAdAccountsPage({ requests, users, setStore, platformPrices: propPrices }) {
  const [tab, setTab] = useState("requests");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewRequest, setViewRequest] = useState(null);

  // Dynamic platforms loaded from API — each has { id, name, color, logo, price, fee, minTopup, active, fields, builtin }
  const [platforms, setPlatforms] = useState([]);
  const [savingPrices, setSavingPrices] = useState(false);
  const [addingField, setAddingField] = useState({});
  const [newPlatform, setNewPlatform] = useState({ name: '', color: '#6366f1' });
  const [addingPlatform, setAddingPlatform] = useState(false);

  const updatePlatform = (id, changes) => {
    setPlatforms(ps => ps.map(p => p.id === id ? { ...p, ...changes } : p));
  };

  const addField = (platformId) => {
    const fd = addingField[platformId] || {};
    if (!fd.label) return;
    const rawKey = fd.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const key = `cf_${rawKey}_${Date.now()}`;
    updatePlatform(platformId, { fields: [...(platforms.find(p => p.id === platformId)?.fields || []), { key, label: fd.label, type: fd.type || 'text', required: !!fd.required, placeholder: fd.placeholder || '' }] });
    setAddingField(f => ({ ...f, [platformId]: { label: '', type: 'text', required: false, placeholder: '' } }));
  };

  const removeField = (platformId, fieldKey) => {
    const pl = platforms.find(p => p.id === platformId);
    if (!pl) return;
    updatePlatform(platformId, { fields: (pl.fields || []).filter(f => f.key !== fieldKey) });
  };

  const handleLogoUpload = (platformId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { setError('Logo must be under 500KB'); return; }
    const reader = new FileReader();
    reader.onload = ev => updatePlatform(platformId, { logo: ev.target.result });
    reader.readAsDataURL(file);
  };

  const addCustomPlatform = () => {
    const name = newPlatform.name.trim();
    if (!name) return;
    const id = 'custom_' + name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
    setPlatforms(ps => [...ps, { id, name, color: newPlatform.color || '#6366f1', logo: null, price: 50, fee: 6, minTopup: 200, active: true, fields: [], builtin: false }]);
    setNewPlatform({ name: '', color: '#6366f1' });
    setAddingPlatform(false);
  };

  const deletePlatform = async (id) => {
    if (!window.confirm('Delete this platform?')) return;
    setPlatforms(ps => ps.filter(p => p.id !== id));
    try {
      await fetch('/api/platform-config', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    } catch { /* already removed from UI */ }
  };

  // Load platforms from API on mount
  useEffect(() => {
    fetch('/api/platform-config')
      .then(r => r.json())
      .then(arr => { if (Array.isArray(arr)) setPlatforms(arr); })
      .catch(() => {});
  }, []);

  const getUserEmail = (userId) => {
    const u = (users || []).find(u => u.id === userId);
    return u ? (u.email || u.name) : userId;
  };

  const isTopup = r => String(r.account_name || '').startsWith('Top-up:');
  const accountReqs = requests.filter(r => !isTopup(r));
  const topupReqs   = requests.filter(r =>  isTopup(r));

  const filteredRequests = accountReqs.filter(r => {
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchSearch = !search ||
      (r.account_name || r.accountName || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.platform || "").toLowerCase().includes(search.toLowerCase()) ||
      getUserEmail(r.user_id).toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredTopups = topupReqs.filter(r => {
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchSearch = !search ||
      (r.account_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.platform || "").toLowerCase().includes(search.toLowerCase()) ||
      getUserEmail(r.user_id).toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const updateStatus = async (id, newStatus) => {
    setSavingId(id);
    setError("");
    try {
      await apiPut('ad_account_requests', { id, status: newStatus });
      setStore(s => ({
        ...s,
        adAccountRequests: s.adAccountRequests.map(r => r.id === id ? { ...r, status: newStatus } : r)
      }));
    } catch (err) {
      setError('Failed to update: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const savePrices = async () => {
    setSavingPrices(true);
    setError("");
    try {
      const fields = Object.fromEntries(platforms.map(p => [p.id, p.fields || []]));
      const res = await fetch('/api/platform-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms, fields }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      setSuccess("Platform settings saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save: " + err.message);
    } finally {
      setSavingPrices(false);
    }
  };

  const STATUS_OPTIONS = ["pending", "in_review", "approved", "rejected"];

  const statCounts = {
    total:    accountReqs.length,
    pending:  accountReqs.filter(r => r.status === "pending").length,
    in_review:accountReqs.filter(r => r.status === "in_review").length,
    approved: accountReqs.filter(r => r.status === "approved").length,
    rejected: accountReqs.filter(r => r.status === "rejected").length,
    topups:   topupReqs.length,
    topups_pending: topupReqs.filter(r => r.status === "pending").length,
  };

  const cols = [
    { label: "Account", render: r => (
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.g800 }}>{r.account_name || r.accountName || "—"}</div>
        <div style={{ fontSize: 11, color: C.g400 }}>{r.requestId || r.id}</div>
      </div>
    )},
    { label: "User", render: r => <span style={{ fontSize: 12, color: C.g500 }}>{getUserEmail(r.user_id)}</span> },
    { label: "Platform", render: r => {
      const pl = PLATFORMS.find(p => p.id === r.platform);
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PlatformIcon name={pl?.icon || r.platform} size={16} />
          <span style={{ fontSize: 12 }}>{pl?.name || r.platform}</span>
        </div>
      );
    }},
    { label: "Business", render: r => <span style={{ fontSize: 12, color: C.g600 }}>{r.business_type || r.businessType || "—"}</span> },
    { label: "Amount", render: r => <span style={{ fontWeight: 700, color: C.primary, fontSize: 13 }}>${r.amount || 52}.00</span> },
    { label: "Date", render: r => <span style={{ fontSize: 11, color: C.g400 }}>{r.submittedAt || (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—")}</span> },
    { label: "Status", render: r => <Badge status={r.status} /> },
    { label: "Actions", render: r => (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          value={r.status}
          disabled={savingId === r.id}
          onChange={e => updateStatus(r.id, e.target.value)}
          style={{ fontSize: 12, borderRadius: 7, border: `1px solid ${C.g200}`, padding: "5px 8px", background: "#fff", cursor: "pointer" }}
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <button onClick={() => setViewRequest(r)}
          style={{ background: C.g100, border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 12, cursor: "pointer", color: C.g600 }}>
          View
        </button>
      </div>
    )},
  ];

  return (
    <PageShell title="Agency Ad Accounts" subtitle="Manage requests and platform pricing.">
      {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{success}</div>}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 22 }}>
        {[
          ["Accounts",  statCounts.total,    C.blue],
          ["Pending",   statCounts.pending,  "#d97706"],
          ["In Review", statCounts.in_review,C.blue],
          ["Approved",  statCounts.approved, C.green],
          ["Rejected",  statCounts.rejected, C.red],
          ["Top-ups",   statCounts.topups,   C.purple],
        ].map(([l, v, c]) => (
          <Card key={l}><div style={{ fontSize: 11, color: C.g400, marginBottom: 5 }}>{l}</div><div style={{ fontSize: 26, fontWeight: 800, color: c, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{v}</div></Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.g100, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[
          ["requests",  "📋 Account Requests"],
          ["topups",    `💳 Top-up Requests${statCounts.topups_pending > 0 ? ` (${statCounts.topups_pending})` : ''}`],
          ["platforms", "⚙ Platform Settings"],
        ].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setSearch(""); setStatusFilter("All"); }}
            style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit",
              background: tab === key ? "#fff" : "transparent",
              color: tab === key ? C.g800 : C.g400,
              boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,.08)" : "none",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Account Requests Tab ── */}
      {tab === "requests" && (
        <Card>
          <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <input placeholder="🔍 Search by account, user, platform…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
          <DataTable cols={cols} rows={filteredRequests} emptyMsg="No ad account requests yet." />
        </Card>
      )}

      {/* ── Top-up Requests Tab ── */}
      {tab === "topups" && (
        <Card>
          <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <input placeholder="🔍 Search by account, user, platform…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
          <DataTable
            emptyMsg="No top-up requests yet."
            rows={filteredTopups}
            cols={[
              { label: "Transaction ID", render: r => (
                <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, color: C.primary }}>
                  {r.request_id || `#${r.id}`}
                </span>
              )},
              { label: "Account", render: r => (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.g800 }}>
                    {String(r.account_name || "").replace(/^Top-up:\s*/i, "") || "—"}
                  </div>
                  <div style={{ fontSize: 11, color: C.g400 }}>{r.business_name}</div>
                </div>
              )},
              { label: "User", render: r => <span style={{ fontSize: 12, color: C.g500 }}>{getUserEmail(r.user_id)}</span> },
              { label: "Platform", render: r => (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <PlatformIcon name={r.platform} size={16} />
                  <span style={{ fontSize: 12, textTransform: "capitalize" }}>{r.platform}</span>
                </div>
              )},
              { label: "Amount", render: r => (
                <span style={{ fontWeight: 800, color: C.primary, fontSize: 14, fontFamily: "monospace" }}>
                  ${Number(r.amount || 0).toFixed(2)}
                </span>
              )},
              { label: "Date", render: r => (
                <span style={{ fontSize: 11, color: C.g400 }}>
                  {r.submitted_at || (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—")}
                </span>
              )},
              { label: "Status", render: r => <Badge status={r.status} /> },
              { label: "Actions", render: r => (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select
                    value={r.status}
                    disabled={savingId === r.id}
                    onChange={e => updateStatus(r.id, e.target.value)}
                    style={{ fontSize: 12, borderRadius: 7, border: `1px solid ${C.g200}`, padding: "5px 8px", background: "#fff", cursor: "pointer" }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                  <button onClick={() => setViewRequest(r)}
                    style={{ background: C.g100, border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 12, cursor: "pointer", color: C.g600 }}>
                    View
                  </button>
                </div>
              )},
            ]}
          />
        </Card>
      )}

      {/* ── Platform Settings Tab ── */}
      {tab === "platforms" && (
        <>
          {platforms.length === 0 && (
            <div style={{ textAlign: 'center', color: C.g400, padding: 40, fontSize: 14 }}>Loading platforms…</div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 20 }}>
            {platforms.map(p => (
              <Card key={p.id}>
                {/* ── Header: logo + name + color + toggle ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  {/* Logo upload area */}
                  <label style={{ cursor: 'pointer', flexShrink: 0 }} title="Click to upload logo">
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleLogoUpload(p.id, e)} />
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: p.logo ? 'transparent' : `${p.color || '#6366f1'}18`,
                      border: `2px dashed ${p.color || C.g200}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: 'hidden', position: 'relative',
                    }}>
                      {p.logo
                        ? <img src={p.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                        : <span style={{ fontSize: 20 }}>{p.name?.[0] || '?'}</span>
                      }
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                        <span style={{ color: '#fff', fontSize: 18 }}>📷</span>
                      </div>
                    </div>
                  </label>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                      value={p.name}
                      onChange={e => updatePlatform(p.id, { name: e.target.value })}
                      style={{ fontWeight: 800, fontSize: 14, color: C.g800, background: 'transparent', border: `1px solid ${C.g200}`, borderRadius: 7, padding: '4px 8px', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                    {/* Color picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <input
                        type="color"
                        value={p.color || '#6366f1'}
                        onChange={e => updatePlatform(p.id, { color: e.target.value })}
                        style={{ width: 28, height: 22, border: 'none', borderRadius: 5, cursor: 'pointer', padding: 0, background: 'none' }}
                        title="Brand color"
                      />
                      <input
                        value={p.color || '#6366f1'}
                        onChange={e => updatePlatform(p.id, { color: e.target.value })}
                        placeholder="#6366f1"
                        maxLength={7}
                        style={{ width: 80, fontSize: 12, border: `1px solid ${C.g200}`, borderRadius: 7, padding: '3px 7px', fontFamily: 'monospace', outline: 'none' }}
                      />
                      {p.logo && (
                        <button onClick={() => updatePlatform(p.id, { logo: null })}
                          style={{ fontSize: 11, color: C.red, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>
                          ✕ Remove logo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div onClick={() => updatePlatform(p.id, { active: !p.active })}
                    style={{ width: 40, height: 22, borderRadius: 11, background: p.active ? (p.color || C.primary) : C.g300, cursor: "pointer", position: "relative", transition: "all .2s", flexShrink: 0 }}>
                    <div style={{ width: 18, height: 18, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: p.active ? 20 : 2, transition: "all .2s" }} />
                  </div>

                  {/* Delete (custom platforms only) */}
                  {!p.builtin && (
                    <button onClick={() => deletePlatform(p.id)}
                      style={{ background: C.redL, border: 'none', borderRadius: 8, color: C.red, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '4px 10px', flexShrink: 0 }}>
                      Delete
                    </button>
                  )}
                </div>

                {/* Pricing */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: C.g500, fontWeight: 600, marginBottom: 6 }}>Service Price (USD)</div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.g400, fontSize: 14, fontWeight: 700 }}>$</span>
                      <input type="number" value={p.price} min={0}
                        onChange={e => updatePlatform(p.id, { price: Number(e.target.value) })}
                        style={{ width: "100%", border: `1.5px solid ${C.g200}`, borderRadius: 9, padding: "10px 12px 10px 24px", fontSize: 14, fontWeight: 700, color: C.g800, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: C.g500, fontWeight: 600, marginBottom: 6 }}>Min. Top-up (USD)</div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.g400, fontSize: 14, fontWeight: 700 }}>$</span>
                      <input type="number" value={p.minTopup ?? 200} min={0}
                        onChange={e => updatePlatform(p.id, { minTopup: Number(e.target.value) })}
                        style={{ width: "100%", border: `1.5px solid ${C.g200}`, borderRadius: 9, padding: "10px 12px 10px 24px", fontSize: 14, fontWeight: 700, color: C.g800, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: C.g500, fontWeight: 600, marginBottom: 6 }}>Top-up Fee (%)</div>
                    <div style={{ position: "relative" }}>
                      <input type="number" value={p.fee} min={0} max={100}
                        onChange={e => updatePlatform(p.id, { fee: Number(e.target.value) })}
                        style={{ width: "100%", border: `1.5px solid ${C.g200}`, borderRadius: 9, padding: "10px 30px 10px 12px", fontSize: 14, fontWeight: 700, color: C.g800, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.g400, fontSize: 14, fontWeight: 700 }}>%</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12, background: C.g50, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.g500 }}>
                  User pays: <strong style={{ color: C.g800 }}>${p.price}</strong> service + topup amount + <strong style={{ color: p.color || C.primary }}>{p.fee}%</strong> fee on topup
                </div>

                {/* Required Fields */}
                <div style={{ marginTop: 18, borderTop: `1px solid ${C.g100}`, paddingTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.g700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Required Fields from User
                  </div>
                  {(p.fields || []).length === 0 && (
                    <div style={{ fontSize: 12, color: C.g400, marginBottom: 10, fontStyle: 'italic' }}>No custom fields — only base fields shown.</div>
                  )}
                  {(p.fields || []).map(f => (
                    <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${C.g50}` }}>
                      <div style={{ flex: 1 }}><span style={{ fontSize: 13, color: C.g700, fontWeight: 600 }}>{f.label}</span></div>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: f.required ? '#fef2f3' : C.g100, color: f.required ? C.primary : C.g500, fontWeight: 700, flexShrink: 0 }}>{f.required ? 'Required' : 'Optional'}</span>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: C.blueL, color: C.blue, fontWeight: 600, flexShrink: 0 }}>{f.type}</span>
                      <button onClick={() => removeField(p.id, f.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: 18, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 2, minWidth: 120 }}>
                      <div style={{ fontSize: 11, color: C.g500, marginBottom: 4 }}>Label</div>
                      <input value={addingField[p.id]?.label || ''} onChange={e => setAddingField(f => ({ ...f, [p.id]: { ...(f[p.id] || {}), label: e.target.value } }))} onKeyDown={e => e.key === 'Enter' && addField(p.id)} placeholder="e.g. Business Manager ID"
                        style={{ width: '100%', border: `1px solid ${C.g200}`, borderRadius: 8, padding: '7px 10px', fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 80 }}>
                      <div style={{ fontSize: 11, color: C.g500, marginBottom: 4 }}>Type</div>
                      <select value={addingField[p.id]?.type || 'text'} onChange={e => setAddingField(f => ({ ...f, [p.id]: { ...(f[p.id] || {}), type: e.target.value } }))}
                        style={{ width: '100%', border: `1px solid ${C.g200}`, borderRadius: 8, padding: '7px 10px', fontSize: 12, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                        {['text', 'textarea', 'email', 'url', 'number'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingBottom: 3 }}>
                      <input type="checkbox" id={`req-${p.id}`} checked={!!addingField[p.id]?.required} onChange={e => setAddingField(f => ({ ...f, [p.id]: { ...(f[p.id] || {}), required: e.target.checked } }))} style={{ cursor: 'pointer', width: 14, height: 14 }} />
                      <label htmlFor={`req-${p.id}`} style={{ fontSize: 12, color: C.g600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Required</label>
                    </div>
                    <button onClick={() => addField(p.id)} disabled={!addingField[p.id]?.label}
                      style={{ padding: '7px 16px', borderRadius: 8, background: C.primary, color: '#fff', border: 'none', cursor: addingField[p.id]?.label ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', opacity: addingField[p.id]?.label ? 1 : 0.45, whiteSpace: 'nowrap' }}>
                      + Add
                    </button>
                  </div>
                </div>

                {!p.active && (
                  <div style={{ marginTop: 10, background: C.redL, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.red, fontWeight: 700, textAlign: "center" }}>Hidden from users</div>
                )}
              </Card>
            ))}
          </div>

          {/* Add new platform */}
          {addingPlatform ? (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.g700, marginBottom: 14 }}>New Platform</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: 160 }}>
                  <div style={{ fontSize: 12, color: C.g500, fontWeight: 600, marginBottom: 6 }}>Platform Name</div>
                  <input value={newPlatform.name} onChange={e => setNewPlatform(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Pinterest Ads"
                    style={{ width: '100%', border: `1.5px solid ${C.g200}`, borderRadius: 9, padding: '9px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: C.g500, fontWeight: 600, marginBottom: 6 }}>Brand Color</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="color" value={newPlatform.color} onChange={e => setNewPlatform(p => ({ ...p, color: e.target.value }))}
                      style={{ width: 38, height: 36, border: 'none', borderRadius: 9, cursor: 'pointer', padding: 0 }} />
                    <input value={newPlatform.color} onChange={e => setNewPlatform(p => ({ ...p, color: e.target.value }))} maxLength={7}
                      style={{ width: 88, border: `1.5px solid ${C.g200}`, borderRadius: 9, padding: '9px 10px', fontSize: 13, fontFamily: 'monospace', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addCustomPlatform} disabled={!newPlatform.name.trim()}
                    style={{ padding: '9px 20px', borderRadius: 9, background: C.primary, color: '#fff', border: 'none', cursor: newPlatform.name.trim() ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', opacity: newPlatform.name.trim() ? 1 : 0.5 }}>
                    Add Platform
                  </button>
                  <button onClick={() => setAddingPlatform(false)}
                    style={{ padding: '9px 16px', borderRadius: 9, background: C.g100, color: C.g600, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            <button onClick={() => setAddingPlatform(true)}
              style={{ padding: '10px 20px', borderRadius: 10, background: C.g50, border: `2px dashed ${C.g200}`, color: C.g600, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16, width: '100%' }}>
              + Add New Platform
            </button>
          )}

          <Btn onClick={savePrices} disabled={savingPrices}>
            {savingPrices ? "Saving…" : "💾 Save Platform Settings"}
          </Btn>
        </>
      )}

      {/* Request Detail Modal */}
      {viewRequest && (
        <Modal title="Request Details" onClose={() => setViewRequest(null)} width={500}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              ["Request ID", viewRequest.requestId || viewRequest.id],
              ["Account Name", viewRequest.account_name || viewRequest.accountName],
              ["User", getUserEmail(viewRequest.user_id)],
              ["Platform", PLATFORMS.find(p => p.id === viewRequest.platform)?.name || viewRequest.platform],
              ["Business Type", viewRequest.business_type || viewRequest.businessType],
              ["Business Name", viewRequest.business_name || viewRequest.businessName],
              ["Email", viewRequest.business_email || viewRequest.email],
              ["Timezone", viewRequest.timezone],
              ["Currency", viewRequest.currency],
              ["BM ID", viewRequest.bm_id || viewRequest.bmId],
              ["Amount", `$${viewRequest.amount || 52}.00`],
              ["Submitted", viewRequest.submittedAt || (viewRequest.created_at ? new Date(viewRequest.created_at).toLocaleString() : "—")],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.g100}`, fontSize: 13 }}>
                <span style={{ color: C.g500, fontWeight: 600 }}>{k}</span>
                <span style={{ fontWeight: 700, color: C.g700, textAlign: "right", maxWidth: 260 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 12, color: C.g500, fontWeight: 600, marginBottom: 8 }}>Update Status</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => { updateStatus(viewRequest.id, s); setViewRequest(r => ({ ...r, status: s })); }}
                  style={{ padding: "8px 16px", borderRadius: 8, border: `2px solid ${viewRequest.status === s ? C.primary : C.g200}`, background: viewRequest.status === s ? C.primaryLight : "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: viewRequest.status === s ? C.primary : C.g600 }}>
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN USER INFO PAGE
═══════════════════════════════════════════════════ */
export function AdminUserInfoPage({ user, orders = [], deposits = [], transactions = [], adAccountRequests = [], inventoryLines = [], inventoryProducts = [], structureOrders = [], paymentMethods = [], onUpdateUser, onBack }) {
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
  const STATUS_COLOR = { active: C.green, suspended: C.yellow, banned: C.red, pending: C.blue };
  const statusColor = STATUS_COLOR[user.status] || C.g400;

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
      <div style={{ background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 18, padding: "28px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
          <div style={{ width: 78, height: 78, borderRadius: 20, background: `linear-gradient(135deg,${C.primary},${C.primary}bb)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: `0 6px 20px ${C.primary}40` }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.g800, letterSpacing: "-0.02em" }}>{user.name}</h2>
              <span style={{ background: statusColor + "18", color: statusColor, border: `1px solid ${statusColor}40`, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{user.status || "active"}</span>
              <span style={{ background: C.g100, color: C.g600, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{user.role || "user"}</span>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                <span style={{ color: C.g400 }}>✉</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.g700 }}>{user.email}</span>
              </div>
              {user.phone ? (
                <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                  <span style={{ color: C.green }}>📱</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.g700 }}>{user.phone}</span>
                  <span style={{ background: "#dcfce7", color: C.green, borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>WhatsApp</span>
                </div>
              ) : (
                <span style={{ fontSize: 13, color: C.g300, fontStyle: "italic" }}>No phone number on file</span>
              )}
              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                <span style={{ color: C.g400 }}>📅</span>
                <span style={{ fontSize: 13, color: C.g500 }}>Joined {user.joined}</span>
              </div>
              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: C.g300, fontFamily: "monospace" }}>ID: {user.id?.slice(0, 16)}…</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, background: C.primaryLight, border: `1px solid ${C.primary}20`, borderRadius: 14, padding: "16px 22px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: "0.08em", marginBottom: 6 }}>BALANCE</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: C.primary, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              ${(user.balance || 0).toLocaleString()}<span style={{ fontSize: 18 }}>.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          ["Total Deposited", `$${totalDeposited.toLocaleString()}`, C.green, completedDeposits.length + " completed"],
          ["Pending Deposits", `$${totalPending.toLocaleString()}`, C.yellow, pendingDeposits.length + " awaiting approval"],
          ["Total Spent", `$${totalSpent.toLocaleString()}`, C.primary, userOrders.filter(o => o.status === "completed").length + " paid orders"],
          ["Total Orders", userOrders.length, C.blue, userAdRequests.length + " ad account req."],
          ["Issues Found", issueCount, issueCount > 0 ? C.red : C.green, issueCount > 0 ? "Needs attention" : "All clear ✓"],
        ].map(([l, v, c, sub]) => (
          <div key={l} style={{ background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 14, padding: "18px 16px", boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.g400, letterSpacing: "0.05em", marginBottom: 6, textTransform: "uppercase" }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: c, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", marginBottom: 4 }}>{v}</div>
            <div style={{ fontSize: 11, color: C.g400 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Issues banner */}
      {issueCount > 0 && (
        <div style={{ background: "#fff7ed", border: `1px solid ${C.yellow}50`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20, flexShrink: 0, color: C.yellow }}>⚠</span>
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
        <div style={{ background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 16, padding: "22px 22px 8px", boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.g800 }}>Deposit History</h3>
            <span style={{ background: C.greenL, color: C.green, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{userDeposits.length} total</span>
          </div>
          {userDeposits.length === 0
            ? <div style={{ textAlign: "center", padding: "28px 0", color: C.g300, fontSize: 13 }}>No deposits yet</div>
            : userDeposits.map(d => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${C.g100}` }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.g800 }}>{d.method}</div>
                  <div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>{d.date} · {d.id}</div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: C.green, fontVariantNumeric: "tabular-nums" }}>+${(d.amount || 0).toLocaleString()}</span>
                  <Badge status={d.status} />
                </div>
              </div>
            ))
          }
        </div>

        <div style={{ background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 16, padding: "22px 22px 8px", boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.g800 }}>Order History</h3>
            <span style={{ background: C.blueL, color: C.blue, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{userOrders.length} total</span>
          </div>
          {userOrders.length === 0
            ? <div style={{ textAlign: "center", padding: "28px 0", color: C.g300, fontSize: 13 }}>No orders yet</div>
            : userOrders.map(o => (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${C.g100}` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <PlatformIcon name={o.platform} size={16} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: o.status === "cancelled" ? C.red : C.g800 }}>{o.type}</div>
                    <div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>{o.date} · {o.id}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: C.primary, fontVariantNumeric: "tabular-nums" }}>${o.amount}</span>
                  <Badge status={o.status} />
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 16, padding: "22px 22px 8px", marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.g800 }}>Transaction History</h3>
          <span style={{ background: C.g100, color: C.g600, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{txLoading ? '…' : userTransactions.length + ' total'}</span>
        </div>
        {txLoading
          ? <div style={{ textAlign: "center", padding: "28px 0", color: C.g400, fontSize: 13 }}>Loading transactions…</div>
          : userTransactions.length === 0
          ? <div style={{ textAlign: "center", padding: "28px 0", color: C.g300, fontSize: 13 }}>No transactions yet</div>
          : userTransactions.map((t, i) => {
            const isCredit = t.type?.toLowerCase() === 'deposit' || (t.amount > 0 && t.type?.toLowerCase() !== 'spent')
            const amount = Math.abs(t.amount || 0)
            return (
              <div key={t.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${C.g100}` }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: isCredit ? "#dcfce7" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                    {isCredit ? "↑" : "↓"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.g800 }}>{t.type} · {t.method}</div>
                    <div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>{t.date || (t.created_at ? new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: isCredit ? C.green : C.red, fontVariantNumeric: "tabular-nums" }}>
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
        <div style={{ background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 16, padding: "22px 22px 8px", marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.g800 }}>Agency Ad Account Requests</h3>
            <span style={{ background: C.primaryLight, color: C.primary, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{userAdRequests.length} request{userAdRequests.length > 1 ? "s" : ""}</span>
          </div>
          {userAdRequests.map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${C.g100}` }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <PlatformIcon name={r.platform} size={18} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: r.status === "rejected" ? C.red : C.g800 }}>{r.account_name || r.accountName || "—"} · {r.platform}</div>
                  <div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>{r.business_type || "—"} · {r.submittedAt || (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—")} · {r.requestId || r.id}</div>
                  {r.status === "rejected" && <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginTop: 4 }}>Rejected: {r.rejectReason || "no reason specified"}</div>}
                </div>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: C.primary }}>${r.amount || 52}.00</span>
                <Badge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Structure Orders */}
      {userStructures.length > 0 && (
        <div style={{ background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 16, padding: "22px 22px 8px", marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.g800 }}>Structure Orders</h3>
            <span style={{ background: C.g100, color: C.g600, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{userStructures.length} total</span>
          </div>
          {userStructures.map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${C.g100}` }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: s.status === "rejected" ? C.red : C.g800 }}>{s.name || s.structureName || s.id}</div>
                <div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>{s.date || s.created_at || "—"}</div>
                {s.status === "rejected" && <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginTop: 4 }}>Rejected: {s.rejectReason || "no reason given"}</div>}
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                {(s.total || s.amount) ? <span style={{ fontWeight: 800, fontSize: 14, color: C.primary, fontVariantNumeric: "tabular-nums" }}>${s.total || s.amount}</span> : null}
                <Badge status={s.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {userDeposits.length === 0 && userOrders.length === 0 && userAdRequests.length === 0 && userStructures.length === 0 && (
        <div style={{ background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 16, padding: "56px 32px", textAlign: "center", marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.g700 }}>No activity yet</div>
          <div style={{ fontSize: 13, color: C.g400, marginTop: 8 }}>This user hasn't made any deposits, orders, or requests.</div>
        </div>
      )}

      {/* Access Control */}
      <div style={{ background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 16, padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.g800, letterSpacing: "-0.01em" }}>Access Control</h3>
            <p style={{ margin: "5px 0 0", fontSize: 13, color: C.g400 }}>Control which pages and payment methods this user can access.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {permsSaved && <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>✓ Saved</span>}
            <Btn onClick={savePermissions}>Save Settings</Btn>
          </div>
        </div>

        {/* Page Access */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Page Access</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {USER_PAGES.map(pg => {
              const enabled = pagePerms[pg.key];
              return (
                <div key={pg.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: enabled ? "#fff" : C.g50, borderRadius: 12, border: `1px solid ${enabled ? C.g200 : C.g200}`, transition: "all .15s" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: enabled ? C.g800 : C.g400 }}>{pg.label}</div>
                    <div style={{ fontSize: 11, color: C.g400, marginTop: 3, lineHeight: 1.4 }}>{pg.description}</div>
                  </div>
                  <div
                    onClick={() => setPagePerms(p => ({ ...p, [pg.key]: !p[pg.key] }))}
                    style={{ width: 42, height: 23, borderRadius: 12, background: enabled ? C.primary : C.g300, cursor: "pointer", position: "relative", transition: "all .2s", flexShrink: 0, marginLeft: 14 }}
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
          <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Payment Methods</div>
          {paymentMethods.filter(m => m.active).length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: C.g300, fontSize: 13 }}>No active payment methods configured</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {paymentMethods.filter(m => m.active).map(m => {
                const allowed = !blockedMethods.includes(m.id);
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: allowed ? "#fff" : C.g50, borderRadius: 12, border: `1px solid ${C.g200}`, transition: "all .15s" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.g200}`, display: "flex", alignItems: "center", justifyContent: "center", background: C.g50, flexShrink: 0 }}>
                        {m.logo && m.logo.startsWith('data:')
                          ? <img src={m.logo} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
                          : <span style={{ fontSize: 18 }}>{m.logo || "💳"}</span>
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: allowed ? C.g800 : C.g400 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: C.g400 }}>{m.bank_name}</div>
                      </div>
                    </div>
                    <div
                      onClick={() => setBlockedMethods(bm => bm.includes(m.id) ? bm.filter(id => id !== m.id) : [...bm, m.id])}
                      style={{ width: 42, height: 23, borderRadius: 12, background: allowed ? C.primary : C.g300, cursor: "pointer", position: "relative", transition: "all .2s", flexShrink: 0, marginLeft: 14 }}
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
