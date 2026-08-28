import React, { useState, useEffect } from "react";
import { T, CALC_PLATFORMS } from "./i18n";

/**
 * AdverSolutions — Landing Page (React)
 * Plain React, inline styles only — no Tailwind / CSS modules / UI kit required.
 *
 * ASSETS: this component references logos via the `assetsPath` prop (default "/assets").
 * Copy everything from the sibling `assets/` folder into your app's public assets directory
 * (e.g. `public/assets/` in Vite/CRA/Next) so the paths resolve, or pass a different
 * `assetsPath` prop pointing at wherever you host them (e.g. a CDN prefix).
 *
 * FONT: uses "Plus Jakarta Sans" + "Cairo" (for Arabic). Add once in your app's <head>:
 *   <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
 *
 * ROUTING: `onNavigateLogin` / `onNavigateSignup` props let you wire the nav's "Log in" /
 * "Access Dashboard" buttons to your router (react-router, Next Link, etc). If omitted,
 * they fall back to plain <a href="/login"> / <a href="/signup"> links.
 */

const FONT = '-apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Cairo", system-ui, sans-serif';
const BRAND = "#ff2d55";

const GLOBAL_CSS = `
  html, body { margin: 0; }
  ::selection { background: ${BRAND}; color: #fff; }
  @keyframes adv-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
  @keyframes adv-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  .adv-desktop-nav { display: flex; }
  .adv-mobile-btn { display: none; }
  @media (max-width: 920px) {
    .adv-desktop-nav { display: none; }
    .adv-mobile-btn { display: grid; }
    .adv-hide-sm { display: none; }
  }
  .adv-hero-grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: 56px; align-items: center; }
  .adv-platform-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; }
  .adv-feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .adv-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
  .adv-faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .adv-calc-tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .adv-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; }
  @media (max-width: 1024px) {
    .adv-hero-grid { grid-template-columns: 1fr; gap: 40px; }
    .adv-platform-grid { grid-template-columns: repeat(3, 1fr); }
    .adv-feature-grid { grid-template-columns: repeat(2, 1fr); }
    .adv-pricing-grid { grid-template-columns: 1fr; max-width: 460px; margin: 0 auto; }
    .adv-faq-grid { grid-template-columns: 1fr; }
    .adv-footer-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 640px) {
    .adv-platform-grid { grid-template-columns: repeat(2, 1fr); }
    .adv-calc-tabs { grid-template-columns: repeat(2, 1fr); }
  }
  .adv-range { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 999px; background: transparent; outline: none; }
  .adv-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 26px; height: 26px; border-radius: 50%; background: #ffffff; border: 3px solid ${BRAND}; box-shadow: 0 4px 14px rgba(255,45,85,0.35); cursor: pointer; margin-top: -10px; }
  .adv-range::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%; background: #ffffff; border: 3px solid ${BRAND}; box-shadow: 0 4px 14px rgba(255,45,85,0.35); cursor: pointer; }
  .adv-range::-moz-range-track { height: 6px; border-radius: 999px; background: transparent; }
  .adv-navlink:hover { background: #fff5f7; color: ${BRAND}; }
  .adv-outline-btn:hover { background: #fff5f7; border-color: #ffd6e0; color: ${BRAND}; }
  .adv-ghost-btn:hover { background: #efeff0; }
  .adv-cta-btn:hover { transform: translateY(-2px); }
  .adv-cta-nav:hover { transform: translateY(-1px); }
  .adv-platform-card:hover { border-color: #ffd6e0; box-shadow: 0 24px 50px -22px rgba(255,45,85,0.3); transform: translateY(-4px); }
`;

function fmt(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function Check({ color = "#34c759", ...rest }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" {...rest}>
      <circle cx="12" cy="12" r="10" fill={color} />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage({ assetsPath = "/assets", onNavigateLogin, onNavigateSignup }) {
  const A = (name) => `${assetsPath.replace(/\/$/, "")}/${name}`;

  const [lang, setLang] = useState(() => {
    if (typeof localStorage !== "undefined") return localStorage.getItem("adv_lang") || "en";
    return "en";
  });
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);
  const [adSpend, setAdSpend] = useState(1000);
  const [calcPlatformKey, setCalcPlatformKey] = useState("meta");

  const t = T[lang];
  const isRtl = t.dir === "rtl";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = t.dir;
    }
  }, [lang, t.dir]);

  const setLangAndPersist = (l) => {
    setLang(l);
    setLangMenuOpen(false);
    if (typeof localStorage !== "undefined") localStorage.setItem("adv_lang", l);
  };

  const langOptions = [
    { code: "EN", label: "EN — English", value: "en" },
    { code: "FR", label: "FR — Français", value: "fr" },
    { code: "AR", label: "AR — العربية", value: "ar" }
  ];

  const txns = [
    { date: lang === "ar" ? "22 مايو 2024" : lang === "fr" ? "22 mai 2024" : "May 22, 2024", desc: "Facebook Ads", amt: "$450.23" },
    { date: lang === "ar" ? "21 مايو 2024" : lang === "fr" ? "21 mai 2024" : "May 21, 2024", desc: "Instagram Ads", amt: "$320.50" },
    { date: lang === "ar" ? "20 مايو 2024" : lang === "fr" ? "20 mai 2024" : "May 20, 2024", desc: "Meta Ads", amt: "$277.83" }
  ];

  // ---- savings calculator math: platform-specific 15-25% ----
  const min = 200, max = 20000;
  const sliderFillPct = ((adSpend - min) / (max - min)) * 100;
  const selected = CALC_PLATFORMS[calcPlatformKey];
  const monthlySavings = adSpend * selected.rate;
  const annualSavings = monthlySavings * 12;
  const pctLow = Math.round((selected.rate - 0.05) * 100);
  const pctHigh = Math.round((selected.rate + 0.05) * 100);

  const helperTemplates = {
    en: (s, m, name, lo, hi) => `Brands spending ${fmt(s)}/month on ${name} recover on average ${fmt(m)}/month — a ${lo}–${hi}% edge from improved ROAS and reduced ad waste using our agency accounts.`,
    fr: (s, m, name, lo, hi) => `Les marques dépensant ${fmt(s)}/mois sur ${name} récupèrent en moyenne ${fmt(m)}/mois — un avantage de ${lo} à ${hi} % grâce à nos comptes agence.`,
    ar: (s, m, name, lo, hi) => `العلامات التجارية التي تنفق ${fmt(s)}/شهرياً على ${name} تسترد في المتوسط ${fmt(m)}/شهرياً — بفارق أداء ${lo}–${hi}٪ باستخدام حسابات الوكالة لدينا.`
  };
  const calcHelperText = helperTemplates[lang](adSpend, monthlySavings, selected.name, pctLow, pctHigh);

  const navLinkStyle = { padding: "9px 16px", borderRadius: 100, color: "#3a3a3d", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "all .2s" };

  const authLoginHref = onNavigateLogin ? undefined : "/login";
  const authSignupHref = onNavigateSignup ? undefined : "/signup";

  return (
    <div style={{ background: "#ffffff", color: "#111111", minHeight: "100vh", overflowX: "hidden", fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ================= NAVBAR ================= */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, width: "100%", background: "rgba(255,255,255,0.78)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 28px", height: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <a href="#home" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img src={A("logo.png")} alt="AdverSolutions" style={{ height: 28, width: "auto" }} />
          </a>
          <nav className="adv-desktop-nav" style={{ alignItems: "center", gap: 4 }}>
            <a href="#home" className="adv-navlink" style={navLinkStyle}>{t.nav.home}</a>
            <a href="#platforms" className="adv-navlink" style={navLinkStyle}>{t.nav.platforms}</a>
            <a href="#/products" className="adv-navlink" style={navLinkStyle}>Products</a>
            <a href="#pricing" className="adv-navlink" style={navLinkStyle}>{t.nav.pricing}</a>
            <a href="#calculator" className="adv-navlink" style={navLinkStyle}>{t.nav.calculator}</a>
            <a href="#faq" className="adv-navlink" style={navLinkStyle}>{t.nav.faq}</a>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }} className="adv-hide-sm">
              <button onClick={() => setLangMenuOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 12px", borderRadius: 100, background: "#f7f7f8", border: "1px solid rgba(0,0,0,0.08)", color: "#3a3a3d", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <span>{lang.toUpperCase()}</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {langMenuOpen && (
                <div style={{ position: "absolute", top: 44, right: 0, width: 150, background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.18)" }}>
                  {langOptions.map((lo) => (
                    <button key={lo.value} onClick={() => setLangAndPersist(lo.value)} style={{ width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 9, background: "transparent", border: "none", color: "#3a3a3d", fontSize: 13, cursor: "pointer" }}>{lo.label}</button>
                  ))}
                </div>
              )}
            </div>
            {authLoginHref ? (
              <a href={authLoginHref} className="adv-ghost-btn adv-hide-sm" style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 18px", borderRadius: 100, background: "#f5f5f6", border: "1px solid rgba(0,0,0,0.08)", color: "#171719", fontSize: 13.5, fontWeight: 600, textDecoration: "none", transition: "all .2s" }}>{t.nav.login}</a>
            ) : (
              <button onClick={onNavigateLogin} className="adv-ghost-btn adv-hide-sm" style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 18px", borderRadius: 100, background: "#f5f5f6", border: "1px solid rgba(0,0,0,0.08)", color: "#171719", fontSize: 13.5, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>{t.nav.login}</button>
            )}
            {authSignupHref ? (
              <a href={authSignupHref} className="adv-cta-nav" style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 20px", borderRadius: 100, background: `linear-gradient(180deg,#ff5470,${BRAND})`, color: "#fff", fontSize: 13.5, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 20px -8px rgba(255,45,85,0.5)", transition: "transform .2s" }}>{t.nav.cta}</a>
            ) : (
              <button onClick={onNavigateSignup} className="adv-cta-nav" style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 20px", borderRadius: 100, background: `linear-gradient(180deg,#ff5470,${BRAND})`, color: "#fff", fontSize: 13.5, fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 8px 20px -8px rgba(255,45,85,0.5)", transition: "transform .2s" }}>{t.nav.cta}</button>
            )}
            <button className="adv-mobile-btn" onClick={() => setMobileMenuOpen((o) => !o)} style={{ width: 38, height: 38, placeItems: "center", borderRadius: 10, background: "#f5f5f6", border: "1px solid rgba(0,0,0,0.08)", color: "#171719", cursor: "pointer" }}>
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "14px 20px 20px", display: "flex", flexDirection: "column", gap: 2, background: "#ffffff" }}>
            {[["#home", t.nav.home], ["#platforms", t.nav.platforms], ["#/products", "Products"], ["#pricing", t.nav.pricing], ["#calculator", t.nav.calculator], ["#faq", t.nav.faq]].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} style={{ padding: "12px 10px", color: "#171719", textDecoration: "none", fontSize: 15, fontWeight: 500, borderRadius: 10 }}>{label}</a>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {langOptions.map((lo) => (
                <button key={lo.value} onClick={() => setLangAndPersist(lo.value)} style={{ flex: 1, height: 38, borderRadius: 10, background: "#f5f5f6", border: "1px solid rgba(0,0,0,0.08)", color: "#171719", fontSize: 13, fontWeight: 600 }}>{lo.code}</button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <section id="home" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: -2, background: "linear-gradient(to bottom,#fff5f7,#ffffff 60%)" }} />
        <div style={{ position: "absolute", top: 0, left: -160, width: 480, height: 480, borderRadius: 999, filter: "blur(90px)", opacity: 0.5, background: "radial-gradient(closest-side,#ffd6e0,transparent 70%)", zIndex: -1 }} />

        <div className="adv-hero-grid" style={{ maxWidth: 1240, margin: "0 auto", padding: "96px 28px 100px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 100, background: "#ffffff", border: "1px solid #ffd6e0", fontSize: 13, fontWeight: 600, color: BRAND, boxShadow: "0 8px 20px -12px rgba(255,45,85,0.3)" }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: BRAND, animation: "adv-pulse 2s ease-in-out infinite" }} />
              {t.hero.badge}
            </div>
            <h1 style={{ margin: "22px 0 0", fontSize: 56, lineHeight: 1.06, fontWeight: 700, letterSpacing: "-0.02em", color: "#111" }}>
              {t.hero.title_1} {t.hero.title_with} <span style={{ color: BRAND }}>{t.hero.title_2} {t.hero.title_3}</span>
            </h1>
            <p style={{ margin: "22px 0 0", fontSize: 18, lineHeight: 1.6, color: "#5b5b60", maxWidth: 520 }}>{t.hero.sub}</p>
            <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>
              {authSignupHref ? (
                <a href={authSignupHref} className="adv-cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, padding: "0 28px", borderRadius: 100, background: `linear-gradient(180deg,#ff5470,${BRAND})`, color: "#fff", fontSize: 15.5, fontWeight: 600, textDecoration: "none", boxShadow: "0 16px 34px -12px rgba(255,45,85,0.45)", transition: "transform .2s" }}>
                  {t.hero.cta1}
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              ) : (
                <button onClick={onNavigateSignup} className="adv-cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, padding: "0 28px", borderRadius: 100, background: `linear-gradient(180deg,#ff5470,${BRAND})`, color: "#fff", fontSize: 15.5, fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 16px 34px -12px rgba(255,45,85,0.45)", transition: "transform .2s" }}>
                  {t.hero.cta1}
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              )}
              <a href="#platforms" className="adv-outline-btn" style={{ display: "inline-flex", alignItems: "center", height: 52, padding: "0 26px", borderRadius: 100, background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", color: "#171719", fontSize: 15.5, fontWeight: 600, textDecoration: "none", transition: "all .2s" }}>
                {t.hero.cta2}
              </a>
            </div>
            <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: "16px 28px" }}>
              {t.hero.badges.map((bd, i) => (
                <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#3a3a3d" }}>
                  <Check />
                  <span style={{ fontWeight: 500 }}>{bd}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: -24, left: -16, width: 64, height: 64, borderRadius: 18, background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", display: "grid", placeItems: "center", boxShadow: "0 20px 40px -18px rgba(255,45,85,0.25)", animation: "adv-float 6s ease-in-out infinite" }}>
              <img src={A("meta.png")} style={{ width: 32, height: 32, objectFit: "contain" }} alt="Meta" />
            </div>
            <div style={{ position: "absolute", top: 120, right: -20, width: 64, height: 64, borderRadius: 18, background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", display: "grid", placeItems: "center", boxShadow: "0 20px 40px -18px rgba(255,45,85,0.25)", animation: "adv-float 7s ease-in-out infinite 1s" }}>
              <img src={A("google.webp")} style={{ width: 32, height: 32, objectFit: "contain" }} alt="Google" />
            </div>
            <div style={{ position: "absolute", bottom: -16, left: 40, width: 64, height: 64, borderRadius: 18, background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", display: "grid", placeItems: "center", boxShadow: "0 20px 40px -18px rgba(255,45,85,0.25)", animation: "adv-float 6.5s ease-in-out infinite 0.5s" }}>
              <img src={A("tiktok.png")} style={{ width: 30, height: 30, objectFit: "contain" }} alt="TikTok" />
            </div>

            <div style={{ position: "relative", background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 28, boxShadow: "0 50px 100px -35px rgba(0,0,0,0.22)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 32px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fff0f4", display: "grid", placeItems: "center" }}><img src={A("meta.png")} style={{ width: 18, height: 18, objectFit: "contain" }} alt="" /></div>
                  <div style={{ fontSize: 14.5, color: "#171719", fontWeight: 700, letterSpacing: "-0.01em" }}>{t.billing.title}</div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#1d8a4c", background: "rgba(52,199,89,0.12)", padding: "5px 12px", borderRadius: 100 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "#22c55e", animation: "adv-pulse 2s ease-in-out infinite" }} />
                  Active
                </div>
              </div>

              <div style={{ padding: "28px 32px 0" }}>
                <div style={{ borderRadius: 20, background: "linear-gradient(135deg,#fff5f7,#ffffff)", border: "1px solid #ffe3ea", padding: "22px 24px" }}>
                  <div style={{ fontSize: 12, color: "#9a5a67", fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase" }}>{t.billing.title}</div>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontSize: 38, fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>$5,000.00</div>
                    <div style={{ fontSize: 12.5, color: "#8a8a8e", fontWeight: 500 }}>{t.billing.remaining}</div>
                  </div>
                  <div style={{ marginTop: 18, height: 9, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "50%", borderRadius: 999, background: "linear-gradient(90deg,#ff5470,#ff2d55)", boxShadow: "0 0 12px rgba(255,45,85,0.4)" }} />
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12.5, color: "#7a7a80", fontWeight: 500 }}>{t.billing.spent}</div>
                </div>
              </div>

              <div style={{ padding: "24px 32px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#171719" }}>{t.billing.recent}</div>
                  <a href="#" style={{ fontSize: 12, fontWeight: 600, color: BRAND, textDecoration: "none" }}>View all</a>
                </div>
                {txns.map((tx, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f7f7f8", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <img src={A("meta.png")} style={{ width: 18, height: 18, objectFit: "contain" }} alt="" />
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, color: "#171719", fontWeight: 600 }}>{tx.desc}</div>
                        <div style={{ fontSize: 11.5, color: "#9a9a9e", marginTop: 2 }}>{tx.date}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "#171719" }}>{tx.amt}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#1d8a4c", background: "rgba(52,199,89,0.12)", padding: "4px 10px", borderRadius: 100 }}>{t.billing.paid}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PLATFORMS ================= */}
      <section id="platforms" style={{ padding: "100px 28px", background: "linear-gradient(to bottom,#ffffff,#fffafb,#ffffff)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, background: "#fff0f4", border: "1px solid #ffd6e0", fontSize: 13, fontWeight: 600, color: BRAND }}>{t.platforms.kicker}</div>
            <h2 style={{ margin: "14px 0 0", fontSize: 38, fontWeight: 700, letterSpacing: "-0.01em", color: "#111" }}>{t.platforms.title}</h2>
            <p style={{ margin: "14px 0 0", fontSize: 16, lineHeight: 1.6, color: "#5b5b60" }}>{t.platforms.sub}</p>
          </div>

          <div className="adv-platform-grid" style={{ marginTop: 56 }}>
            {[
              { icon: "meta.png", card: t.platforms.cards[0] },
              { icon: "google.webp", card: t.platforms.cards[1] },
              { icon: "tiktok.png", card: t.platforms.cards[2] },
              { icon: "snapchat.png", card: t.platforms.cards[3] },
              { icon: "bing.png", card: t.platforms.cards[4] }
            ].map((p, i) => (
              <div key={i} className="adv-platform-card" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 20, padding: 24, boxShadow: "0 4px 18px -12px rgba(0,0,0,0.08)", transition: "all .25s" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fafafa", display: "grid", placeItems: "center", marginBottom: 16 }}><img src={A(p.icon)} style={{ width: 26, height: 26, objectFit: "contain" }} alt="" /></div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>{p.card.name}</div>
                <p style={{ marginTop: 6, fontSize: 13, lineHeight: 1.55, color: "#5b5b60" }}>{p.card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" style={{ padding: "100px 28px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, background: "#fff0f4", border: "1px solid #ffd6e0", fontSize: 13, fontWeight: 600, color: BRAND }}>{t.features.kicker}</div>
            <h2 style={{ margin: "14px 0 0", fontSize: 38, fontWeight: 700, letterSpacing: "-0.01em", color: "#111" }}>{t.features.title}</h2>
          </div>
          <div className="adv-feature-grid" style={{ marginTop: 56 }}>
            {t.features.items.map((f, i) => (
              <div key={i} style={{ padding: 28, borderRadius: 20, background: "#fafafa", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ffe1e9", display: "grid", placeItems: "center" }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill={BRAND} /></svg>
                </div>
                <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600, color: "#111" }}>{f.t}</div>
                <p style={{ marginTop: 6, fontSize: 13.5, lineHeight: 1.55, color: "#6b6b70" }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section id="pricing" style={{ padding: "100px 28px", background: "linear-gradient(to bottom,#ffffff,#fff8fa)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, background: "#fff0f4", border: "1px solid #ffd6e0", fontSize: 13, fontWeight: 600, color: BRAND }}>{t.pricing.kicker}</div>
            <h2 style={{ margin: "14px 0 0", fontSize: 38, fontWeight: 700, letterSpacing: "-0.01em", color: "#111" }}>{t.pricing.title}</h2>
            <p style={{ margin: "14px 0 0", fontSize: 16, lineHeight: 1.6, color: "#5b5b60" }}>{t.pricing.sub}</p>
          </div>

          <div className="adv-pricing-grid" style={{ marginTop: 56 }}>
            {[{ icon: "meta.png", popular: false }, { icon: "google.webp", popular: true }, { icon: "tiktok.png", popular: false }].map((meta, i) => {
              const card = t.pricing.cards[i];
              const popular = meta.popular;
              return (
                <div key={i} style={{ position: "relative", background: "#ffffff", border: popular ? `1.5px solid ${BRAND}` : "1px solid rgba(0,0,0,0.06)", borderRadius: 24, padding: 32, boxShadow: popular ? "0 30px 60px -24px rgba(255,45,85,0.35)" : "0 8px 28px -18px rgba(0,0,0,0.12)" }}>
                  {popular && (
                    <span style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", padding: "6px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", color: "#fff", background: `linear-gradient(180deg,#ff5470,${BRAND})` }}>{t.pricing.popular}</span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={A(meta.icon)} style={{ width: 26, height: 26, objectFit: "contain" }} alt="" />
                    <div style={{ fontSize: 17, fontWeight: 600, color: "#111" }}>{card.name}</div>
                  </div>
                  <div style={{ marginTop: 20, display: "flex", alignItems: "baseline", gap: 8 }}>
                    <div style={{ fontSize: 42, fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>{card.price}</div>
                    <div style={{ fontSize: 12.5, color: "#8a8a8e" }}>{t.pricing.perAccount}</div>
                  </div>
                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#3a3a3d" }}><Check color="#22a35a" />{t.pricing.minTopup}: <strong style={{ color: "#111" }}>{card.min}</strong></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#3a3a3d" }}><Check color="#22a35a" />{t.pricing.topupFees}: <strong style={{ color: "#111" }}>{card.fees}</strong></div>
                    {card.features.map((f, fi) => (
                      <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#3a3a3d" }}><Check color="#22a35a" />{f}</div>
                    ))}
                  </div>
                  <a href={authSignupHref || "#"} onClick={!authSignupHref ? onNavigateSignup : undefined} style={{ marginTop: 26, display: "flex", alignItems: "center", justifyContent: "center", height: 48, borderRadius: 100, background: popular ? `linear-gradient(180deg,#ff5470,${BRAND})` : "#171719", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: popular ? "0 14px 26px -10px rgba(255,45,85,0.5)" : "none" }}>{card.cta}</a>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12.5, color: "#8a8a8e" }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><rect x="4" y="10" width="16" height="11" rx="2" fill="#8a8a8e" /><path d="M8 10V7a4 4 0 018 0v3" stroke="#8a8a8e" strokeWidth="2" /></svg>
            {t.pricing.pay}
          </div>
        </div>
      </section>

      {/* ================= SAVINGS CALCULATOR ================= */}
      <section id="calculator" style={{ padding: "100px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -140, width: 420, height: 420, borderRadius: 999, filter: "blur(100px)", opacity: 0.35, background: "radial-gradient(closest-side,#ffd6e0,transparent 70%)", zIndex: -1 }} />
        <div style={{ position: "absolute", bottom: -100, left: -140, width: 420, height: 420, borderRadius: 999, filter: "blur(100px)", opacity: 0.3, background: "radial-gradient(closest-side,#d9f2e6,transparent 70%)", zIndex: -1 }} />
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, background: "#fff0f4", border: "1px solid #ffd6e0", fontSize: 13, fontWeight: 600, color: BRAND }}>{t.calc.kicker}</div>
            <h2 style={{ margin: "14px 0 0", fontSize: 36, fontWeight: 700, letterSpacing: "-0.01em", color: "#111" }}>{t.calc.title}</h2>
            <p style={{ margin: "14px 0 0", fontSize: 15.5, lineHeight: 1.6, color: "#5b5b60" }}>{t.calc.sub}</p>
          </div>

          <div style={{ marginTop: 44, background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 28, boxShadow: "0 30px 60px -30px rgba(0,0,0,0.18)", padding: 36 }}>
            <div className="adv-calc-tabs">
              {Object.entries(CALC_PLATFORMS).map(([key, p]) => {
                const active = key === calcPlatformKey;
                return (
                  <button
                    key={key}
                    onClick={() => setCalcPlatformKey(key)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 8px", borderRadius: 16, cursor: "pointer", background: active ? "#fff0f4" : "#fafafa", border: active ? `1.5px solid ${BRAND}` : "1px solid rgba(0,0,0,0.06)", transition: "all .2s" }}
                  >
                    <img src={A(p.logo)} alt={p.name} style={{ width: 30, height: 30, objectFit: "contain" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: active ? BRAND : "#3a3a3d" }}>{p.name}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 30 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#3a3a3d" }}>{t.calc.spendLabel}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: "-0.01em" }}>{fmt(adSpend)}</div>
              </div>
              <div style={{ marginTop: 16, position: "relative" }}>
                <div style={{ position: "relative", height: 6, borderRadius: 999, background: "#efeff1" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#ff5470,#ff2d55)", width: `${sliderFillPct}%` }} />
                </div>
                <input type="range" className="adv-range" min={min} max={max} step={100} value={adSpend} onChange={(e) => setAdSpend(Number(e.target.value))} style={{ position: "relative", top: -16 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#9a9a9e", marginTop: -4 }}>
                <span>$200</span>
                <span>$20,000</span>
              </div>
            </div>

            <div style={{ marginTop: 22, borderRadius: 20, background: "#fafafb", border: "1px solid rgba(0,0,0,0.05)", padding: 22 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#8a8a8e", textTransform: "uppercase", letterSpacing: "0.03em" }}>{t.calc.resultsLabel} — {selected.name}</div>
              <div style={{ marginTop: 16, display: "flex", gap: 28 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#8a8a8e" }}>{t.calc.monthly}</div>
                  <div style={{ marginTop: 4, fontSize: 26, fontWeight: 800, color: "#111", letterSpacing: "-0.01em" }}>{fmt(monthlySavings)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#8a8a8e" }}>{t.calc.annually}</div>
                  <div style={{ marginTop: 4, fontSize: 26, fontWeight: 800, color: BRAND, letterSpacing: "-0.01em" }}>{fmt(annualSavings)}</div>
                </div>
              </div>
              <p style={{ margin: "16px 0 0", fontSize: 12.5, lineHeight: 1.6, color: "#8a8a8e" }}>{calcHelperText}</p>
            </div>

            <a href={authSignupHref || "#"} onClick={!authSignupHref ? onNavigateSignup : undefined} style={{ marginTop: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 100, background: `linear-gradient(180deg,#ff5470,${BRAND})`, color: "#fff", fontSize: 14.5, fontWeight: 700, textDecoration: "none", boxShadow: "0 16px 30px -12px rgba(255,45,85,0.45)" }}>
              {t.calc.cta}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" style={{ padding: "100px 28px", background: "linear-gradient(to bottom,#ffffff,#fff8fa)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, background: "#fff0f4", border: "1px solid #ffd6e0", fontSize: 13, fontWeight: 600, color: BRAND }}>{t.faq.kicker}</div>
            <h2 style={{ margin: "14px 0 0", fontSize: 38, fontWeight: 700, letterSpacing: "-0.01em", color: "#111" }}>{t.faq.title}</h2>
            <p style={{ margin: "14px 0 0", fontSize: 16, lineHeight: 1.6, color: "#5b5b60" }}>{t.faq.sub}</p>
          </div>
          <div className="adv-faq-grid" style={{ marginTop: 48 }}>
            {[0, 1].map((col) => (
              <div key={col} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {t.faq.items.filter((_, i) => i % 2 === col).map((it, idx) => {
                  const globalIndex = t.faq.items.indexOf(it);
                  const open = faqOpen === globalIndex;
                  return (
                    <div key={globalIndex} style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 18px -14px rgba(0,0,0,0.1)" }}>
                      <button onClick={() => setFaqOpen(open ? -1 : globalIndex)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                        <span style={{ fontSize: 14.5, fontWeight: 600, color: "#171719" }}>{it.q}</span>
                        <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, display: "grid", placeItems: "center", background: open ? BRAND : "#fff5f7", color: open ? "#fff" : BRAND, transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform .2s" }}>
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        </span>
                      </button>
                      {open && <div style={{ padding: "0 20px 18px", fontSize: 13.5, lineHeight: 1.65, color: "#5b5b60" }}>{it.a}</div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section style={{ padding: "88px 28px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", overflow: "hidden", borderRadius: 32, background: "linear-gradient(135deg,#ff4f7a,#ff2d55)", padding: "64px 56px" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: 999, filter: "blur(90px)", opacity: 0.5, background: "radial-gradient(closest-side,#ffffff,transparent 70%)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 560 }}>
              <h2 style={{ margin: 0, fontSize: 36, fontWeight: 700, letterSpacing: "-0.01em", color: "#fff" }}>{t.cta.title}</h2>
              <p style={{ margin: "14px 0 0", fontSize: 15.5, lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>{t.cta.sub}</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href={authSignupHref || "#"} onClick={!authSignupHref ? onNavigateSignup : undefined} style={{ display: "inline-flex", alignItems: "center", height: 52, padding: "0 28px", borderRadius: 100, background: "#ffffff", color: BRAND, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 14px 30px -12px rgba(0,0,0,0.3)" }}>{t.cta.btn1}</a>
              <a href="#footer" style={{ display: "inline-flex", alignItems: "center", height: 52, padding: "0 26px", borderRadius: 100, background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>{t.cta.btn2}</a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer id="footer" style={{ padding: "56px 28px 28px", background: "#0b0b0d", color: "#c7c7cc" }}>
        <div className="adv-footer-grid" style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div>
            <img src={A("logo.png")} style={{ height: 26 }} alt="AdverSolutions" />
            <p style={{ marginTop: 16, fontSize: 13.5, lineHeight: 1.6, color: "#8a8a8e", maxWidth: 320 }}>{t.footer.tag}</p>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 14 }}>{t.footer.navTitle}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="#home" style={{ fontSize: 13.5, color: "#8a8a8e", textDecoration: "none" }}>{t.nav.home}</a>
              <a href="#platforms" style={{ fontSize: 13.5, color: "#8a8a8e", textDecoration: "none" }}>{t.nav.platforms}</a>
              <a href="#pricing" style={{ fontSize: 13.5, color: "#8a8a8e", textDecoration: "none" }}>{t.nav.pricing}</a>
              <a href="#calculator" style={{ fontSize: 13.5, color: "#8a8a8e", textDecoration: "none" }}>{t.nav.calculator}</a>
              <a href="#faq" style={{ fontSize: 13.5, color: "#8a8a8e", textDecoration: "none" }}>{t.nav.faq}</a>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 14 }}>{t.footer.platTitle}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {t.platforms.cards.map((c, i) => (
                <a key={i} href="#platforms" style={{ fontSize: 13.5, color: "#8a8a8e", textDecoration: "none" }}>{c.name}</a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 14 }}>{t.footer.contactTitle}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, color: "#8a8a8e" }}>
              <div>contact@adversolutions.agency</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: "#34c759" }} />{t.footer.live}</div>
              <a href="#" style={{ color: "#8a8a8e", textDecoration: "none" }}>{t.footer.terms}</a>
              <a href="#" style={{ color: "#8a8a8e", textDecoration: "none" }}>{t.footer.privacy}</a>
              <a href="https://policy.adversolutions.agency/" style={{ color: "#8a8a8e", textDecoration: "none" }}>Policy</a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1240, margin: "40px auto 0", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "#6b6b70", textAlign: "center" }}>
          {t.footer.copy}
        </div>
      </footer>
    </div>
  );
}
