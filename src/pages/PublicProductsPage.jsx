import { useState, useEffect } from "react";

const BRAND = "#ff2d55";
const FONT = '-apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Cairo", system-ui, sans-serif';

const PLATFORM_STYLES = {
  meta: { color: "#2563eb", label: "M" },
  google: { color: "#f59e0b", label: "G" },
  tiktok: { color: "#111111", label: "T" },
  snapchat: { color: "#c9a600", label: "S" },
  twitter: { color: "#1da1f2", label: "X" },
  linkedin: { color: "#0a66c2", label: "L" },
  bing: { color: "#0d8ecf", label: "B" },
};
function platformStyle(platform) {
  return PLATFORM_STYLES[(platform || "").toLowerCase()] || { color: "#8a8a8e", label: (platform || "?")[0]?.toUpperCase() || "?" };
}

function ProductLogo({ platform, logo, size = 48 }) {
  const s = platformStyle(platform);
  if (logo) {
    return (
      <div style={{ width: size, height: size, borderRadius: size * 0.28, overflow: "hidden", flexShrink: 0, background: "#f5f5f6" }}>
        <img src={logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: `${s.color}18`, color: s.color, display: "grid", placeItems: "center", fontWeight: 800, fontSize: size * 0.4, flexShrink: 0 }}>
      {s.label}
    </div>
  );
}

export default function PublicProductsPage({ onNavigateLogin, onNavigateSignup }) {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(null); // null = still checking

  const authLoginHref = onNavigateLogin ? undefined : "/login";
  const authSignupHref = onNavigateSignup ? undefined : "/signup";

  useEffect(() => {
    fetch("/api/appearance-settings")
      .then((r) => r.json())
      .then((data) => setEnabled(data?.products_page_enabled !== false))
      .catch(() => setEnabled(true)); // fail open rather than hide the page on a network blip
  }, []);

  useEffect(() => {
    if (enabled !== true) return;
    fetch("/api/public-products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message));
  }, [enabled]);

  if (enabled === false) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, textAlign: "center", padding: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111" }}>This page isn't available right now.</h1>
          <p style={{ marginTop: 10, fontSize: 14.5, color: "#8a8a8e" }}><a href="#/" style={{ color: BRAND, fontWeight: 700, textDecoration: "none" }}>Back to home</a></p>
        </div>
      </div>
    );
  }
  if (enabled === null) return null;

  return (
    <div style={{ background: "#ffffff", color: "#111111", minHeight: "100vh", fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}>
      {/* ================= NAVBAR ================= */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, width: "100%", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 28px", height: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <a href="#/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img src="/assets/logo.png" alt="AdverSolutions" style={{ height: 28, width: "auto" }} />
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {authLoginHref ? (
              <a href={authLoginHref} style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 18px", borderRadius: 100, background: "#f5f5f6", border: "1px solid rgba(0,0,0,0.08)", color: "#171719", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>Log in</a>
            ) : (
              <button onClick={onNavigateLogin} style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 18px", borderRadius: 100, background: "#f5f5f6", border: "1px solid rgba(0,0,0,0.08)", color: "#171719", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Log in</button>
            )}
            {authSignupHref ? (
              <a href={authSignupHref} style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 20px", borderRadius: 100, background: `linear-gradient(180deg,#ff5470,${BRAND})`, color: "#fff", fontSize: 13.5, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 20px -8px rgba(255,45,85,0.5)" }}>Access Dashboard</a>
            ) : (
              <button onClick={onNavigateSignup} style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 20px", borderRadius: 100, background: `linear-gradient(180deg,#ff5470,${BRAND})`, color: "#fff", fontSize: 13.5, fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 8px 20px -8px rgba(255,45,85,0.5)", fontFamily: FONT }}>Access Dashboard</button>
            )}
          </div>
        </div>
      </header>

      {/* ================= HEADER ================= */}
      <section style={{ padding: "72px 28px 40px", textAlign: "center", background: "linear-gradient(to bottom,#fff5f7,#ffffff 70%)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 100, background: "#ffffff", border: "1px solid #ffd6e0", fontSize: 13, fontWeight: 600, color: BRAND }}>
          Pre-Verified Accounts
        </div>
        <h1 style={{ margin: "20px auto 0", fontSize: "clamp(32px,5vw,48px)", fontWeight: 700, letterSpacing: "-0.02em", maxWidth: 700 }}>
          Browse our current inventory
        </h1>
        <p style={{ margin: "16px auto 0", fontSize: 16.5, lineHeight: 1.6, color: "#5b5b60", maxWidth: 560 }}>
          Live stock of verified, ready-to-use accounts across every platform we support.
          {authSignupHref ? (
            <> <a href={authSignupHref} style={{ color: BRAND, fontWeight: 700, textDecoration: "none" }}>Create an account</a> to purchase.</>
          ) : (
            <> <button onClick={onNavigateSignup} style={{ background: "none", border: "none", padding: 0, color: BRAND, fontWeight: 700, cursor: "pointer", fontSize: "inherit", fontFamily: "inherit" }}>Create an account</button> to purchase.</>
          )}
        </p>
      </section>

      {/* ================= GRID ================= */}
      <section style={{ padding: "20px 28px 110px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          {error && (
            <div style={{ textAlign: "center", padding: 40, color: "#991b1b", background: "#fee2e2", borderRadius: 14, fontSize: 14 }}>
              Couldn't load the catalog: {error}
            </div>
          )}

          {!error && products === null && (
            <div style={{ textAlign: "center", padding: 60, color: "#9a9a9e", fontSize: 14 }}>Loading…</div>
          )}

          {!error && products && products.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "#9a9a9e", fontSize: 14 }}>No products listed right now — check back soon.</div>
          )}

          {!error && products && products.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {products.map((p) => {
                const outOfStock = !p.stock;
                return (
                  <div
                    key={p.id}
                    style={{
                      background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 20, padding: 24,
                      boxShadow: "0 4px 18px -12px rgba(0,0,0,0.08)", opacity: outOfStock ? 0.55 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <ProductLogo platform={p.platform} logo={p.logo} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: p.type === "New" ? "#3b82f6" : "#22c55e", background: p.type === "New" ? "rgba(59,130,246,0.12)" : "rgba(34,197,94,0.12)", padding: "4px 10px", borderRadius: 100 }}>
                        {p.type || "Aged"}
                      </span>
                    </div>
                    <div style={{ marginTop: 16, fontSize: 16, fontWeight: 700, color: "#111" }}>{p.title}</div>
                    <div style={{ marginTop: 3, fontSize: 12.5, color: "#8a8a8e" }}>{p.platform} · {p.country || "Any"}</div>
                    <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: "-0.01em" }}>${Number(p.price).toFixed(2)}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: outOfStock ? "#ef4444" : "#22c55e" }}>
                        {outOfStock ? "Out of stock" : `${p.stock} in stock`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer style={{ padding: "40px 28px", background: "#0b0b0d", color: "#8a8a8e", textAlign: "center", fontSize: 13 }}>
        © 2026 AdverSolutions. All rights reserved. · <a href="https://policy.adversolutions.agency/" style={{ color: "#8a8a8e" }}>Policy</a>
      </footer>
    </div>
  );
}
