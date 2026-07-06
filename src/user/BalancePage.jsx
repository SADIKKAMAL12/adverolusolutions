import { C, getThemeColors } from '../shared/theme.js'
import { useState, useRef, useEffect } from 'react'
import { PageShell, Card, Btn, Badge, DataTable, Modal } from '../shared/UI.jsx'
import { useTheme } from '../shared/ThemeContext.jsx'
import { useAuth } from '../shared/AuthContext.jsx'
import { createDeposit, createTransaction, fetchDeposits, fetchTransactions, fetchUsers } from '../lib/db.js'

function PaymentInfoModal({ method, onClose }) {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const [copied, setCopied] = useState(null);
  const copy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };
  return (
    <Modal title="Payment Details" onClose={onClose} width={440}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: TC.g100, border: `1px solid ${TC.g200}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", overflow: "hidden" }}>
          {method.logo && method.logo.startsWith('data:') ? (
            <img src={method.logo} alt="" style={{ width: 60, height: 60, objectFit: "contain" }} />
          ) : (
            <span style={{ fontSize: 40 }}>{method.logo || "💳"}</span>
          )}
        </div>
        <div style={{ fontWeight: 900, fontSize: 18, color: TC.text }}>{method.name}</div>
        {method.bank_name && <div style={{ fontSize: 14, fontWeight: 500, color: TC.g500, marginTop: 3 }}>{method.bank_name}</div>}
      </div>

      {(method.fields || []).length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: TC.g400, fontSize: 13 }}>No payment details available.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {(method.fields || []).map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${TC.g100}` }}>
              <span style={{ fontSize: 12, color: TC.g500, fontWeight: 700, minWidth: 90 }}>{f.label}</span>
              <span style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 800, color: TC.text, flex: 1, wordBreak: "break-all" }}>{f.value}</span>
              <button
                onClick={() => copy(f.value, i)}
                style={{ background: copied === i ? TC.greenL : TC.primaryLight, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: copied === i ? TC.green : C.primary, flexShrink: 0, transition: "all .15s" }}
              >
                {copied === i ? "✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20, background: TC.yellowL, border: `1px solid ${TC.yellow}40`, borderRadius: 10, padding: "12px 14px", fontSize: 12, color: TC.yellow, lineHeight: 1.6 }}>
        ⚠️ Send the exact amount to the details above, then upload your payment proof in the next step.
      </div>
    </Modal>
  );
}

export default function BalancePage({ balance, transactions, paymentMethods, addTransaction, addBalance, setStore }) {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const isDark = theme === 'dark'
  const { user } = useAuth();
  const [payStep, setPayStep] = useState(1);
  const firstMethod = paymentMethods[0];
  const [method, setMethod] = useState((firstMethod && firstMethod.name) || "Payoneer");
  const [amount, setAmount] = useState("350.00");
  const [txFilter, setTxFilter] = useState("all");
  const [successBanner, setSuccessBanner] = useState(false);
  const [showMethod, setShowMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofDataUrl, setProofDataUrl] = useState(null);
  const [uploadError, setUploadError] = useState("");

  // Refresh deposits, transactions, and balance from the server every time this page mounts.
  // This ensures the user sees updated statuses after admin approve/reject without a full page reload.
  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    Promise.all([
      fetchTransactions(user.id),
      fetchDeposits(user.id),
      fetchUsers(),
    ]).then(([txs, deps, users]) => {
      if (cancelled) return
      const me = Array.isArray(users) ? users.find(u => u.id === user.id) : null
      setStore(s => ({
        ...s,
        transactions: txs || s.transactions,
        deposits: deps || s.deposits,
        ...(me != null ? { balance: parseFloat(me.balance) || s.balance } : {}),
      }))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [user?.id])

  const activeMethods = paymentMethods.filter(m => m.active);
  const filtered = txFilter === "all" ? transactions : transactions.filter(t => t.type.toLowerCase().includes(txFilter) || t.status === txFilter);
  const selectedMethod = activeMethods.find(m => m.name === method);

  const handleFileChange = (e) => {
    setUploadError("");
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setUploadError("File too large. Please use an image under 3MB.");
      return;
    }
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProofDataUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submitDeposit = async () => {
    if (!proofFile) { setUploadError("Please upload payment proof before submitting."); return; }
    if (!user) { alert("Please log in."); return; }

    setSubmitting(true);
    const dateStr = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const depositId = "DEP-" + Date.now();

    try {
      await createDeposit({
        id: depositId,
        user_id: user.id,
        method,
        amount: parseFloat(amount) || 0,
        status: "pending",
        date: dateStr,
        proof: proofDataUrl || proofFile.name,
      });

      await createTransaction({
        user_id: user.id,
        type: "Deposit",
        method,
        amount: parseFloat(amount) || 0,
        status: "pending",
        date: dateStr,
      });

      // Optimistic update so the UI feels instant
      setStore(s => ({
        ...s,
        transactions: [{
          id: Date.now(),
          type: "Deposit", method,
          amount: parseFloat(amount) || 0,
          status: "pending",
          date: dateStr,
        }, ...s.transactions],
        deposits: [{
          id: depositId,
          user: user.email,
          method,
          amount: parseFloat(amount) || 0,
          status: "pending",
          date: dateStr,
          proof: proofDataUrl || proofFile.name,
        }, ...s.deposits],
      }));

      // Then sync with server to get the real DB record
      Promise.all([fetchTransactions(user.id), fetchDeposits(user.id)])
        .then(([txs, deps]) => {
          setStore(s => ({
            ...s,
            transactions: txs || s.transactions,
            deposits: deps || s.deposits,
          }))
        })
        .catch(() => {})

      setSuccessBanner(true);
      setPayStep(1);
      setProofFile(null);
      setProofDataUrl(null);
      setUploadError("");
      setAmount("350.00");
    } catch (err) {
      alert("Failed to submit deposit: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const txCols = [
    { label: "#", render: r => <span style={{ color: TC.g400 }}>{r.id}</span> },
    { label: "Type", render: r => <span style={{ fontWeight: 700, color: TC.g700 }}>{r.type}</span> },
    { label: "Method", render: r => <span style={{ color: TC.g500 }}>{r.method}</span> },
    { label: "Amount", render: r => <span style={{ fontWeight: 900, color: r.amount < 0 ? TC.red : TC.green }}>{r.amount < 0 ? "−" : "+"} ${Math.abs(r.amount).toFixed(2)}</span> },
    { label: "Status", render: r => <Badge status={r.status} /> },
    { label: "Date", render: r => <span style={{ fontSize: 12, color: TC.g400 }}>{r.date}</span> },
  ];

  return (
    <PageShell title="Balance & Transactions" subtitle="Manage your account balance, top up, and view your full transaction history.">
      {showMethod && <PaymentInfoModal method={showMethod} onClose={() => setShowMethod(null)} />}

      {submitting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <style>{`@keyframes _spin { to { transform: rotate(360deg) } }`}</style>
          <div style={{ background: TC.card, borderRadius: 20, padding: '48px 56px', textAlign: 'center', minWidth: 300, boxShadow: '0 24px 64px rgba(0,0,0,.25)' }}>
            <div style={{ width: 56, height: 56, border: `5px solid ${TC.g200}`, borderTop: `5px solid ${C.primary}`, borderRadius: '50%', animation: '_spin 0.8s linear infinite', margin: '0 auto 24px' }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: TC.text, marginBottom: 8 }}>Processing Request…</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: TC.g500 }}>Submitting your deposit. Please don't close this page.</div>
          </div>
        </div>
      )}

      {successBanner && (
        <div style={{ background: TC.greenL, border: `1px solid ${TC.green}40`, borderRadius: 13, padding: "14px 20px", marginBottom: 22, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <strong style={{ color: TC.green }}>Deposit request submitted!</strong>
            <div style={{ fontSize: 13, color: TC.green, marginTop: 2, opacity: 0.85 }}>Pending admin approval — you'll be notified once it's confirmed.</div>
          </div>
          <button onClick={() => setSuccessBanner(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 20, color: TC.green }}>✕</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[[C.primary, "◈", "Current Balance", `$${balance.toFixed(2)}`], [TC.yellow, "⏱", "Pending Balance", "$320.00"], [TC.green, "↓", "Total Deposits", "$5,850.00"], [TC.blue, "↑", "Total Spent", "$4,610.00"]].map(([col, ic, l, v]) => (
          <Card key={l}>
            <div style={{ width: 40, height: 40, background: col + "20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>{ic}</div>
            <div style={{ fontSize: 12, color: TC.g400 }}>{l}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: col, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", margin: "4px 0" }}>{v}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        <div>
          <Card style={{ marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: TC.text, letterSpacing: "-0.01em" }}>Top Up Balance</h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, fontWeight: 500, color: TC.g500 }}>Add funds to your account balance.</p>

            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
              {[{ n: 1, l: "Payment Method" }, { n: 2, l: "Payment Details" }, { n: 3, l: "Upload Proof" }].map((s, i) => (
                <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "auto" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: payStep >= s.n ? C.primary : TC.g200, color: payStep >= s.n ? "#fff" : TC.g500, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{payStep > s.n ? "✓" : s.n}</div>
                    <span style={{ fontSize: 11, color: payStep === s.n ? C.primary : TC.g400, fontWeight: payStep === s.n ? 700 : 400, whiteSpace: "nowrap" }}>{s.l}</span>
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: payStep > s.n ? C.primary : TC.g200, margin: "0 6px", marginBottom: 18 }} />}
                </div>
              ))}
            </div>

            {/* Step 1 — choose method */}
            {payStep === 1 && (
              <>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
                  {activeMethods.map(m => (
                    <div key={m.name} onClick={() => setMethod(m.name)}
                      style={{ border: `2px solid ${method === m.name ? C.primary : TC.g200}`, borderRadius: 11, padding: "11px 16px", cursor: "pointer", background: method === m.name ? TC.primaryLight : TC.card, display: "flex", alignItems: "center", gap: 8, transition: "all .15s" }}>
                      {m.logo && m.logo.startsWith('data:') ? (
                        <img src={m.logo} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} />
                      ) : (
                        <span style={{ fontSize: 18 }}>{m.logo || "💳"}</span>
                      )}
                      <span style={{ fontSize: 13, fontWeight: 700, color: method === m.name ? C.primary : TC.g600 }}>{m.name}</span>
                    </div>
                  ))}
                </div>
                <Btn onClick={() => setPayStep(2)}>Next Step →</Btn>
              </>
            )}

            {/* Step 2 — payment details + amount */}
            {payStep === 2 && (
              <>
                <div style={{ background: TC.g50, borderRadius: 11, padding: "16px 18px", marginBottom: 18, border: `1px solid ${TC.g200}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: TC.card, border: `1px solid ${TC.g200}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {selectedMethod?.logo && selectedMethod.logo.startsWith('data:') ? (
                        <img src={selectedMethod.logo} alt="" style={{ width: 32, height: 32, objectFit: "contain" }} />
                      ) : (
                        <span style={{ fontSize: 24 }}>{selectedMethod?.logo || "💳"}</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: TC.text }}>{selectedMethod?.name}</div>
                      {selectedMethod?.bank_name && <div style={{ fontSize: 12, color: TC.g400 }}>{selectedMethod.bank_name}</div>}
                    </div>
                    <button
                      onClick={() => setShowMethod(selectedMethod)}
                      style={{ marginLeft: "auto", background: TC.primaryLight, color: C.primary, border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                      Show Details
                    </button>
                  </div>
                  {(selectedMethod?.fields || []).map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: `1px solid ${TC.g200}` }}>
                      <span style={{ fontSize: 12, color: TC.g500, fontWeight: 600, minWidth: 90 }}>{f.label}</span>
                      <span style={{ fontSize: 13, color: TC.text, fontWeight: 700, flex: 1, fontFamily: "inherit" }}>{f.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: TC.g500, marginBottom: 6, fontWeight: 600 }}>Amount (USD)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: "100%", border: `1.5px solid ${TC.g200}`, borderRadius: 9, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: TC.card, color: TC.text }} />
                    <div style={{ fontSize: 11, color: TC.g400, marginTop: 4 }}>Minimum: $10</div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: TC.g500, marginBottom: 6, fontWeight: 600 }}>You receive</label>
                    <div style={{ fontSize: 28, fontWeight: 800, color: C.primary, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", paddingTop: 6 }}>${parseFloat(amount || 0).toFixed(2)}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn variant="outline" onClick={() => setPayStep(1)}>← Back</Btn>
                  <Btn onClick={() => setPayStep(3)}>Next Step →</Btn>
                </div>
              </>
            )}

            {/* Step 3 — upload proof */}
            {payStep === 3 && (
              <>
                <div style={{ background: TC.yellowL, border: `1px solid ${TC.yellow}40`, borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: TC.yellow }}>
                  ⚠️ Send <strong>${parseFloat(amount || 0).toFixed(2)} USD</strong> via <strong>{selectedMethod?.name || method}</strong>{selectedMethod?.bank_name ? ` (${selectedMethod.bank_name})` : ""}. Use the account details from step 2, then upload your payment screenshot below.
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: `2px dashed ${proofFile ? TC.green : TC.g300}`, borderRadius: 13, padding: "38px 20px", textAlign: "center", cursor: "pointer", background: proofFile ? TC.greenL : TC.g50, marginBottom: 10, transition: "all .2s" }}
                >
                  {proofFile ? (
                    <>
                      {proofDataUrl && proofDataUrl.startsWith('data:image') && (
                        <img src={proofDataUrl} alt="proof" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 8, marginBottom: 10, objectFit: "contain" }} />
                      )}
                      <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                      <div style={{ fontWeight: 700, color: TC.green }}>{proofFile.name}</div>
                      <div style={{ fontSize: 12, color: TC.green, marginTop: 4, opacity: 0.8 }}>{(proofFile.size / 1024).toFixed(0)} KB — click to replace</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 36, marginBottom: 8, color: TC.g400 }}>↑</div>
                      <div style={{ fontWeight: 700, color: TC.g500 }}>Click to Upload Payment Proof</div>
                      <div style={{ fontSize: 12, color: TC.g400, marginTop: 4 }}>PNG, JPG, PDF up to 3MB</div>
                    </>
                  )}
                </div>

                {uploadError && (
                  <div style={{ background: TC.redL, border: `1px solid ${TC.red}50`, borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: TC.red }}>{uploadError}</div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <Btn variant="outline" onClick={() => setPayStep(2)}>← Back</Btn>
                  <Btn onClick={submitDeposit} style={{ background: proofFile ? C.primary : TC.g300, cursor: proofFile ? "pointer" : "default" }}>
                    Submit Deposit Request
                  </Btn>
                </div>
              </>
            )}
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TC.text, letterSpacing: "-0.01em" }}>Transaction History</h3>
              <div style={{ display: "flex", gap: 7 }}>
                {[["all", "All"], ["deposit", "Deposits"], ["spent", "Spent"], ["refund", "Refunds"]].map(([v, l]) => (
                  <button key={v} onClick={() => setTxFilter(v)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${txFilter === v ? C.primary : TC.g200}`, background: txFilter === v ? TC.primaryLight : TC.card, color: txFilter === v ? C.primary : TC.g500, fontSize: 12, fontWeight: txFilter === v ? 700 : 400, cursor: "pointer" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <DataTable cols={txCols} rows={filtered} emptyMsg="No transactions found." />
          </Card>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: TC.text }}>Payment Methods</h3>
            {activeMethods.length === 0 && (
              <div style={{ fontSize: 13, color: TC.g400, textAlign: "center", padding: "20px 0" }}>No payment methods available.</div>
            )}
            {activeMethods.map((m, idx) => (
              <div key={m.id} style={{ padding: "12px 0", borderBottom: idx < activeMethods.length - 1 ? `1px solid ${TC.g100}` : "none", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, background: TC.primaryLight, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {m.logo && m.logo.startsWith('data:') ? (
                    <img src={m.logo} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
                  ) : (
                    <span style={{ fontSize: 20 }}>{m.logo || "💳"}</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: TC.g700 }}>{m.name}</div>
                  {m.bank_name && <div style={{ fontSize: 11, color: TC.g400 }}>{m.bank_name}</div>}
                </div>
                <button
                  onClick={() => setShowMethod(m)}
                  style={{ background: TC.primaryLight, color: C.primary, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                >
                  Show
                </button>
              </div>
            ))}
          </Card>

          <div style={{ background: TC.yellowL, border: `1px solid ${TC.yellow}30`, borderRadius: 13, padding: 16 }}>
            <div style={{ display: "flex", gap: 9 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: TC.yellow, marginBottom: 3 }}>Important</div>
                <div style={{ fontSize: 12, color: TC.yellow, lineHeight: 1.5, opacity: 0.85 }}>Please send the exact amount. Wrong amounts may cause processing delays.</div>
              </div>
            </div>
          </div>

          <Card>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: TC.text }}>Balance Summary</h3>
            {[["Total Deposits", "$5,850.00", TC.green], ["Total Spent", "$4,610.00", TC.red], ["Pending", "$320.00", TC.yellow], ["Net Balance", `$${balance.toFixed(2)}`, C.primary]].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${TC.g100}`, fontSize: 13 }}>
                <span style={{ color: TC.g500 }}>{l}</span><span style={{ fontWeight: 800, color: c }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
