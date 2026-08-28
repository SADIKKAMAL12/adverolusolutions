import { useState, useEffect, useRef } from "react";

const BRAND = "#ff2d55";
const BRAND_DARK = "#e2003c";
const FONT = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';

const STATUS_META = {
  pending:    { label: "Awaiting your submission", color: "#f59e0b", bg: "#fff8ec" },
  requested:  { label: "Requested",  color: "#f59e0b", bg: "#fff8ec" },
  in_review:  { label: "In Review",  color: "#3b82f6", bg: "#eff6ff" },
  rejected:   { label: "Rejected",   color: "#ef4444", bg: "#fef2f2" },
  verified:   { label: "Verified",   color: "#22c55e", bg: "#f0fdf4" },
};

function BrandMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 28 }}>
      <svg viewBox="0 0 40 40" width="30" height="30">
        <defs>
          <linearGradient id="vr-bm" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ff5d80" />
            <stop offset="1" stopColor={BRAND_DARK} />
          </linearGradient>
        </defs>
        <path d="M20 4 L34 32 H26 L20 18 L14 32 H6 Z" fill="url(#vr-bm)" />
        <path d="M20 4 L26 18 L20 18 Z" fill="#9a002a" opacity="0.55" />
      </svg>
      <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em", color: "#111" }}>
        Adver<span style={{ color: BRAND }}>Solutions</span>
      </span>
    </div>
  );
}

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.requested;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700,
      color: meta.color, background: meta.bg, border: `1px solid ${meta.color}30`,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: meta.color }} />
      {meta.label}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3a3a3d", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  height: 48,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "#fff",
  padding: "0 14px",
  fontSize: 15,
  color: "#111",
  fontFamily: FONT,
  outline: "none",
  boxSizing: "border-box",
};

function TypeLogo({ logo, size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 7, overflow: "hidden", flexShrink: 0,
      background: "#f1f1f3", display: "grid", placeItems: "center",
    }}>
      {logo
        ? <img src={logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        : <span style={{ fontSize: size * 0.4, fontWeight: 800, color: "#b0b0b3" }}>?</span>
      }
    </div>
  );
}

function AccountTypePicker({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.name === value);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          ...inputStyle,
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          justifyContent: "space-between", textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {selected && <TypeLogo logo={selected.logo} />}
          <span style={{ color: selected ? "#111" : "#9a9a9e", fontSize: 15, fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selected ? selected.name : "Select the account type…"}
          </span>
        </span>
        <span style={{ color: "#9a9a9e", fontSize: 11, flexShrink: 0 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20,
          background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)",
          boxShadow: "0 12px 30px -8px rgba(0,0,0,0.2)", overflow: "hidden", maxHeight: 240, overflowY: "auto",
        }}>
          {options.length === 0 && (
            <div style={{ padding: "12px 14px", fontSize: 13, color: "#9a9a9e" }}>No account types available.</div>
          )}
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => { onChange(o.name); setOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", border: "none", background: o.name === value ? "#fff5f7" : "transparent",
                cursor: "pointer", textAlign: "left", fontFamily: FONT,
              }}
              onMouseEnter={(e) => { if (o.name !== value) e.currentTarget.style.background = "#fafafa"; }}
              onMouseLeave={(e) => { if (o.name !== value) e.currentTarget.style.background = "transparent"; }}
            >
              <TypeLogo logo={o.logo} />
              <span style={{ fontSize: 14, color: "#171719" }}>{o.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReadOnlyRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
      <span style={{ fontSize: 13, color: "#8a8a8e" }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: "#171719" }}>{value}</span>
    </div>
  );
}

export default function VerifyRequestPage({ token }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [expired, setExpired] = useState(false);

  const [accountType, setAccountType] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const load = async () => {
    setLoading(true);
    setNotFound(false);
    setExpired(false);
    try {
      const r = await fetch(`/api/verification-requests?token=${encodeURIComponent(token)}`);
      if (r.status === 404) { setNotFound(true); return; }
      if (r.status === 410) { setExpired(true); return; }
      const json = await r.json();
      if (!r.ok) { setNotFound(true); return; }
      setData(json);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (!accountType || !accountEmail.trim() || !amountPaid) return;
    setSubmitting(true);
    setError("");
    try {
      const r = await fetch(`/api/verification-requests?token=${encodeURIComponent(token)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_type: accountType, account_email: accountEmail.trim(), amount_paid: amountPaid }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Couldn't submit. Please try again.");
      setData(json);
      setJustSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #fff5f7, #fff)", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <BrandMark />

        <div style={{ background: "#fff", borderRadius: 20, padding: "32px 30px", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.06)" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#8a8a8e", fontSize: 14 }}>Loading…</div>
          )}

          {!loading && notFound && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: "0 0 8px" }}>Link not found</h2>
              <p style={{ fontSize: 14, color: "#8a8a8e", margin: 0 }}>
                This verification link is invalid or no longer exists. Please contact support for a new link.
              </p>
            </div>
          )}

          {!loading && expired && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: "0 0 8px" }}>Link expired</h2>
              <p style={{ fontSize: 14, color: "#8a8a8e", margin: 0 }}>
                This verification link has expired. Please contact support for a new one.
              </p>
            </div>
          )}

          {!loading && data && (
            <>
              <div style={{ marginBottom: 22 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 6px" }}>
                  {data.status === "pending" ? "Account Verification" : "Verification Status"}
                </h2>
                <p style={{ fontSize: 13.5, color: "#8a8a8e", margin: 0, lineHeight: 1.5 }}>
                  {data.status === "pending"
                    ? "Please fill in the details below for the account that needs verification."
                    : "Here's the current status of your verification request."}
                </p>
              </div>

              {data.status === "pending" && !justSubmitted ? (
                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <ReadOnlyRow label="Platform" value={data.platform_label || data.platform} />
                  {data.customer_name && <ReadOnlyRow label="Name" value={data.customer_name} />}

                  <div style={{ marginTop: 6 }}>
                    <Field label="Account Type">
                      <AccountTypePicker
                        options={data.account_type_options || []}
                        value={accountType}
                        onChange={setAccountType}
                      />
                    </Field>
                  </div>

                  <div>
                    <Field label="Account Email">
                      <input
                        type="email"
                        required
                        value={accountEmail}
                        onChange={(e) => setAccountEmail(e.target.value)}
                        placeholder="account@example.com"
                        style={inputStyle}
                      />
                    </Field>
                  </div>

                  <Field label="Amount Paid ($)">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      style={inputStyle}
                    />
                  </Field>

                  {error && <div style={{ fontSize: 12.5, color: "#ef4444", fontWeight: 600 }}>{error}</div>}

                  <button
                    type="submit"
                    disabled={submitting || !accountType || !accountEmail.trim() || !amountPaid}
                    style={{
                      width: "100%", height: 50, borderRadius: 100, border: "none",
                      background: `linear-gradient(180deg, #ff5470, ${BRAND})`,
                      color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: FONT,
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting || !accountType || !accountEmail.trim() || !amountPaid ? 0.6 : 1,
                      boxShadow: "0 16px 30px -12px rgba(255,45,85,0.5)",
                    }}
                  >
                    {submitting ? "Submitting…" : "Submit"}
                  </button>
                </form>
              ) : (
                <div>
                  <div style={{ marginBottom: 18 }}>
                    <StatusPill status={data.status} />
                  </div>
                  <ReadOnlyRow label="Platform" value={data.platform_label || data.platform} />
                  {data.customer_name && <ReadOnlyRow label="Name" value={data.customer_name} />}
                  <ReadOnlyRow label="Account Type" value={data.account_type} />
                  <ReadOnlyRow label="Account Email" value={data.account_email} />
                  <ReadOnlyRow label="Amount Paid" value={data.amount_paid != null ? `$${Number(data.amount_paid).toFixed(2)}` : null} />
                  <ReadOnlyRow label="Request ID" value={data.request_id} />

                  {data.status === "rejected" && (
                    data.replacement_link ? (
                      <a
                        href={data.replacement_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: "100%", height: 50, borderRadius: 100, marginTop: 18,
                          background: `linear-gradient(180deg, #ff5470, ${BRAND})`,
                          color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: FONT,
                          textDecoration: "none", boxShadow: "0 16px 30px -12px rgba(255,45,85,0.5)",
                        }}
                      >
                        Get My Replacement
                      </a>
                    ) : (
                      <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13, color: "#991b1b", lineHeight: 1.5 }}>
                        This account is not eligible for a replacement — it's out of warranty.
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#b0b0b3", marginTop: 20 }}>
          © 2026 AdverSolutions. All rights reserved.
        </p>
      </div>
    </div>
  );
}
