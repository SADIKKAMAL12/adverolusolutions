import React, { useState, useEffect } from "react";
import { T } from "./i18n";

/**
 * AdverSolutions — Premium Landing Page (React)
 * Apple-inspired restyle of the default landing page. Same sections, order,
 * copy, and pricing as LandingPage.jsx — visual treatment only.
 * Plain React, inline styles only — no Tailwind / CSS modules / UI kit required.
 *
 * ASSETS: this component references logos via the `assetsPath` prop (default "/assets").
 * Copy the sibling `assets/` folder (meta.png, google.webp, tiktok.png, snapchat.png,
 * bing.png, logo.png) into your app's public assets directory (e.g. `public/assets/`
 * in Vite/CRA/Next), or pass a different `assetsPath` prop pointing at a CDN prefix.
 *
 * FONT: uses "Plus Jakarta Sans" + "Cairo" (for Arabic). Add once in your app's <head>:
 *   <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
 *
 * ROUTING: `onNavigateLogin` / `onNavigateSignup` props wire the nav / CTA buttons to
 * your router. If omitted, they fall back to plain <a href="/login"> / <a href="/signup">.
 */

const FONT = '-apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Cairo", system-ui, sans-serif';
const BRAND = "#ff2d55";
const INK = "#1d1d1f";
const SUBTLE = "#6e6e73";
const FAINT = "#86868b";
const HAIRLINE = "rgba(0,0,0,0.06)";

const GLOBAL_CSS = `
  html, body { margin: 0; }
  ::selection { background: ${BRAND}; color: #fff; }
  @keyframes adv-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
  @keyframes adv-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .adv-desktop-nav { display: flex; }
  .adv-mobile-btn { display: none; }
  @media (max-width: 920px) {
    .adv-desktop-nav { display: none; }
    .adv-mobile-btn { display: grid; }
    .adv-hide-sm { display: none; }
  }
  .adv-platform-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
  .adv-feature-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
  .adv-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .adv-faq-wrap { max-width: 760px; margin: 0 auto; }
  .adv-calc-tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
  .adv-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; }
  @media (max-width: 1024px) {
    .adv-platform-grid, .adv-feature-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .adv-platform-grid > *, .adv-feature-grid > * { grid-column: span 1 !important; }
    .adv-pricing-grid { grid-template-columns: 1fr; max-width: 460px; margin: 0 auto; }
    .adv-footer-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 640px) {
    .adv-platform-grid, .adv-feature-grid { grid-template-columns: 1fr !important; }
    .adv-calc-tabs { grid-template-columns: repeat(2, 1fr); }
  }
  .adv-range { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 999px; background: transparent; outline: none; }
  .adv-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #ffffff; border: 2px solid ${BRAND}; box-shadow: 0 4px 14px rgba(0,0,0,0.18); cursor: pointer; margin-top: -9px; }
  .adv-range::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: #ffffff; border: 2px solid ${BRAND}; box-shadow: 0 4px 14px rgba(0,0,0,0.18); cursor: pointer; }
  .adv-range::-moz-range-track { height: 6px; border-radius: 999px; background: transparent; }
  .adv-navlink:hover { background: #f5f5f7; color: ${BRAND}; }
  .adv-ghost-btn:hover { background: #ececed; }
  .adv-outline-btn:hover { background: #f5f5f7; }
  .adv-cta-btn:hover { transform: translateY(-1px); }
  .adv-explore-btn:hover { opacity: 0.6; }
  .adv-platform-card:hover, .adv-feature-card:hover { transform: translateY(-4px); box-shadow: 0 24px 48px -24px rgba(0,0,0,0.16); }
  .adv-footer-link:hover { color: #fff; }
`;

const CALC_PLATFORMS = {
  meta: { name: "Meta", logo: "meta.png", rate: 0.2 },
  google: { name: "Google", logo: "google.webp", rate: 0.18 },
  tiktok: { name: "TikTok", logo: "tiktok.png", rate: 0.25 },
  snapchat: { name: "Snapchat", logo: "snapchat.png", rate: 0.15 }
};

const PLATFORM_ICONS = ["meta.png", "google.webp", "tiktok.png", "snapchat.png", "bing.png"];
const PLATFORM_SPANS = [7, 5, 4, 4, 4];
const PRICING_ICONS = ["meta.png", "google.webp", "tiktok.png"];
const FEATURE_SPANS = [8, 4, 4, 4, 4, 12];

function fmt(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function Check({ color = "#22a35a", ...rest }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" {...rest}>
      <circle cx="12" cy="12" r="10" fill={color} />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Arrow(props) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdverSolutionsPremium({ assetsPath = "/assets", onNavigateLogin, onNavigateSignup }) {
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

  const authLoginHref = onNavigateLogin ? undefined : "/login";
  const authSignupHref = onNavigateSignup ? undefined : "/signup";

  const platformCards = t.platforms.cards.map((c, i) => ({
    ...c,
    iconSrc: A(PLATFORM_ICONS[i]),
    colSpan: PLATFORM_SPANS[i]
  }));

  const featureItems = t.features.items.map((f, i) => ({
    ...f,
    colSpan: FEATURE_SPANS[i]
  }));

  const pricingCards = t.pricing.cards.map((c, i) => {
    const popular = i === 1;
    return {
      ...c,
      popular,
      iconSrc: A(PRICING_ICONS[i]),
      cardBg: popular ? INK : "#ffffff",
      shadowStyle: popular ? "0 30px 70px -34px rgba(0,0,0,0.35)" : "0 2px 10px -8px rgba(0,0,0,0.06)",
      ctaBg: popular ? BRAND : INK,
      textColor: popular ? "#ffffff" : INK,
      subColor: popular ? "rgba(255,255,255,0.6)" : FAINT,
      featColor: popular ? "rgba(255,255,255,0.85)" : "#3a3a3d"
    };
  });

  const footerNavLinks = [
    { href: "#home", label: t.nav.home },
    { href: "#platforms", label: t.nav.platforms },
    { href: "#/products", label: "Products" },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#calculator", label: t.nav.calculator },
    { href: "#faq", label: t.nav.faq }
  ];

  const navLinkStyle = { padding: "8px 14px", borderRadius: 100, color: "#3a3a3d", textDecoration: "none", fontSize: 13.5, fontWeight: 500, transition: "all .2s" };

  return (
    <div style={{ background: "#ffffff", color: INK, minHeight: "100vh", overflowX: "hidden", fontFamily: FONT, WebkitFontSmoothing: "antialiased" }} dir={t.dir}>
      <style>{GLOBAL_CSS}</style>

      {/* ================= NAVBAR ================= */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, width: "100%", background: "rgba(255,255,255,0.82)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${HAIRLINE}` }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "10px 28px", minHeight: 64, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px 24px" }}>
          <a href="#home" style={{ display: "flex", alignItems: "center", flexShrink: 0, textDecoration: "none" }}>
            <img src={A("logo.png")} alt="AdverSolutions" style={{ height: 24, width: "auto" }} />
          </a>
          <nav className="adv-desktop-nav" style={{ alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <a href="#home" className="adv-navlink" style={navLinkStyle}>{t.nav.home}</a>
            <a href="#platforms" className="adv-navlink" style={navLinkStyle}>{t.nav.platforms}</a>
            <a href="#/products" className="adv-navlink" style={navLinkStyle}>Products</a>
            <a href="#pricing" className="adv-navlink" style={navLinkStyle}>{t.nav.pricing}</a>
            <a href="#calculator" className="adv-navlink" style={navLinkStyle}>{t.nav.calculator}</a>
            <a href="#faq" className="adv-navlink" style={navLinkStyle}>{t.nav.faq}</a>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setLangMenuOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 100, background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.08)", color: "#3a3a3d", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                <span>{lang.toUpperCase()}</span>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {langMenuOpen && (
                <div style={{ position: "absolute", top: 42, right: 0, width: 150, background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 6, boxShadow: "0 20px 44px -14px rgba(0,0,0,0.18)", zIndex: 60 }}>
                  {langOptions.map((lo) => (
                    <button key={lo.value} onClick={() => setLangAndPersist(lo.value)} style={{ width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 9, background: "transparent", border: "none", color: "#3a3a3d", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{lo.label}</button>
                  ))}
                </div>
              )}
            </div>
            {authLoginHref ? (
              <a href={authLoginHref} className="adv-ghost-btn" style={{ display: "inline-flex", alignItems: "center", height: 36, padding: "0 16px", borderRadius: 100, background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.08)", color: INK, fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "background .2s" }}>{t.nav.login}</a>
            ) : (
              <button onClick={onNavigateLogin} className="adv-ghost-btn" style={{ display: "inline-flex", alignItems: "center", height: 36, padding: "0 16px", borderRadius: 100, background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.08)", color: INK, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background .2s", fontFamily: "inherit" }}>{t.nav.login}</button>
            )}
            {authSignupHref ? (
              <a href={authSignupHref} style={{ display: "inline-flex", alignItems: "center", height: 36, padding: "0 18px", borderRadius: 100, background: BRAND, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "background .2s" }}>{t.nav.cta}</a>
            ) : (
              <button onClick={onNavigateSignup} style={{ display: "inline-flex", alignItems: "center", height: 36, padding: "0 18px", borderRadius: 100, background: BRAND, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", transition: "background .2s", fontFamily: "inherit" }}>{t.nav.cta}</button>
            )}
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section id="home" style={{ position: "relative", padding: "110px 28px 0", background: "#ffffff", overflow: "hidden" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: FAINT, textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.hero.badge}</div>
          <h1 style={{ margin: "22px 0 0", fontSize: "clamp(48px,8vw,104px)", lineHeight: 0.98, fontWeight: 700, letterSpacing: "-0.045em", color: INK }}>
            {t.hero.title_1}<br />{t.hero.title_with} {t.hero.title_2} <span style={{ color: BRAND }}>{t.hero.title_3}</span>
          </h1>
          <p style={{ margin: "32px auto 0", fontSize: 21, lineHeight: 1.55, color: SUBTLE, maxWidth: 560, fontWeight: 400 }}>{t.hero.sub}</p>
          <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
            {authSignupHref ? (
              <a href={authSignupHref} className="adv-cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 54, padding: "0 32px", borderRadius: 100, background: BRAND, color: "#fff", fontSize: 17, fontWeight: 600, textDecoration: "none", transition: "transform .2s" }}>
                {t.hero.cta1}<Arrow />
              </a>
            ) : (
              <button onClick={onNavigateSignup} className="adv-cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 54, padding: "0 32px", borderRadius: 100, background: BRAND, color: "#fff", fontSize: 17, fontWeight: 600, border: "none", cursor: "pointer", transition: "transform .2s", fontFamily: "inherit" }}>
                {t.hero.cta1}<Arrow />
              </button>
            )}
            <a href="#platforms" className="adv-explore-btn" style={{ display: "inline-flex", alignItems: "center", height: 54, padding: "0 30px", borderRadius: 100, background: "transparent", color: INK, fontSize: 17, fontWeight: 600, textDecoration: "none", transition: "opacity .2s" }}>
              {t.hero.cta2} &rsaquo;
            </a>
          </div>
          <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 26px" }}>
            {t.hero.badges.map((bd, i) => (
              <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, color: FAINT }}>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: FAINT }} />
                <span style={{ fontWeight: 500 }}>{bd}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", maxWidth: 920, margin: "64px auto 0", padding: "0 28px 130px" }}>
          <div style={{ position: "absolute", top: 10, left: -6, width: 58, height: 58, borderRadius: 16, background: "#ffffff", border: `1px solid ${HAIRLINE}`, display: "grid", placeItems: "center", boxShadow: "0 20px 44px -20px rgba(0,0,0,0.2)", animation: "adv-float 6s ease-in-out infinite", zIndex: 2 }}>
            <img src={A("meta.png")} style={{ width: 28, height: 28, objectFit: "contain" }} alt="Meta" />
          </div>
          <div style={{ position: "absolute", top: -24, right: 60, width: 58, height: 58, borderRadius: 16, background: "#ffffff", border: `1px solid ${HAIRLINE}`, display: "grid", placeItems: "center", boxShadow: "0 20px 44px -20px rgba(0,0,0,0.2)", animation: "adv-float 7s ease-in-out infinite 1s", zIndex: 2 }}>
            <img src={A("google.webp")} style={{ width: 28, height: 28, objectFit: "contain" }} alt="Google" />
          </div>
          <div style={{ position: "absolute", bottom: 70, right: -10, width: 58, height: 58, borderRadius: 16, background: "#ffffff", border: `1px solid ${HAIRLINE}`, display: "grid", placeItems: "center", boxShadow: "0 20px 44px -20px rgba(0,0,0,0.2)", animation: "adv-float 6.5s ease-in-out infinite .5s", zIndex: 2 }}>
            <img src={A("tiktok.png")} style={{ width: 26, height: 26, objectFit: "contain" }} alt="TikTok" />
          </div>

          <div style={{ position: "relative", background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 28, boxShadow: "0 60px 120px -50px rgba(0,0,0,0.28)", overflow: "hidden", maxWidth: 520, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 30px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f5f5f7", display: "grid", placeItems: "center" }}><img src={A("meta.png")} style={{ width: 17, height: 17, objectFit: "contain" }} alt="" /></div>
                <div style={{ fontSize: 14, color: INK, fontWeight: 700, letterSpacing: "-0.01em" }}>{t.billing.title}</div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#1d8a4c", background: "rgba(52,199,89,0.12)", padding: "5px 12px", borderRadius: 100 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "#22c55e", animation: "adv-pulse 2s ease-in-out infinite" }} />
                Active
              </div>
            </div>

            <div style={{ padding: "26px 30px 0" }}>
              <div style={{ borderRadius: 18, background: "#fafafa", border: "1px solid rgba(0,0,0,0.05)", padding: "20px 22px" }}>
                <div style={{ fontSize: 11.5, color: FAINT, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase" }}>{t.billing.title}</div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>$5,000.00</div>
                  <div style={{ fontSize: 12, color: FAINT, fontWeight: 500 }}>{t.billing.remaining}</div>
                </div>
                <div style={{ marginTop: 18, height: 8, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "50%", borderRadius: 999, background: BRAND }} />
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: FAINT, fontWeight: 500 }}>{t.billing.spent}</div>
              </div>
            </div>

            <div style={{ padding: "22px 30px 26px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{t.billing.recent}</div>
                <a href="#" style={{ fontSize: 12, fontWeight: 600, color: BRAND, textDecoration: "none" }}>View all</a>
              </div>
              {txns.map((tx, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "#f5f5f7", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <img src={A("meta.png")} style={{ width: 17, height: 17, objectFit: "contain" }} alt="" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: INK, fontWeight: 600 }}>{tx.desc}</div>
                      <div style={{ fontSize: 11, color: "#9a9a9e", marginTop: 2 }}>{tx.date}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{tx.amt}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#1d8a4c", background: "rgba(52,199,89,0.12)", padding: "4px 10px", borderRadius: 100 }}>{t.billing.paid}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= PLATFORMS ================= */}
      <section id="platforms" style={{ padding: "130px 28px", background: "#f5f5f7" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND, textTransform: "uppercase", letterSpacing: "0.04em" }}>{t.platforms.kicker}</div>
            <h2 style={{ margin: "14px 0 0", fontSize: "clamp(32px,4vw,46px)", fontWeight: 700, letterSpacing: "-0.02em", color: INK }}>{t.platforms.title}</h2>
            <p style={{ margin: "16px 0 0", fontSize: 17, lineHeight: 1.6, color: SUBTLE }}>{t.platforms.sub}</p>
          </div>

          <div className="adv-platform-grid" style={{ marginTop: 60 }}>
            {platformCards.map((p, i) => (
              <div key={i} className="adv-platform-card" style={{ gridColumn: `span ${p.colSpan}`, background: "#ffffff", border: `1px solid ${HAIRLINE}`, borderRadius: 22, padding: 32, boxShadow: "0 2px 10px -6px rgba(0,0,0,0.05)", transition: "transform .25s, box-shadow .25s", minWidth: 0 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: "#f5f5f7", display: "grid", placeItems: "center", marginBottom: 20 }}><img src={p.iconSrc} style={{ width: 25, height: 25, objectFit: "contain" }} alt="" /></div>
                <div style={{ fontSize: 20, fontWeight: 600, color: INK, letterSpacing: "-0.01em" }}>{p.name}</div>
                <p style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.6, color: SUBTLE, maxWidth: 380 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" style={{ padding: "130px 28px", background: "#ffffff" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND, textTransform: "uppercase", letterSpacing: "0.04em" }}>{t.features.kicker}</div>
            <h2 style={{ margin: "14px 0 0", fontSize: "clamp(32px,4vw,46px)", fontWeight: 700, letterSpacing: "-0.02em", color: INK }}>{t.features.title}</h2>
          </div>
          <div className="adv-feature-grid" style={{ marginTop: 60 }}>
            {featureItems.map((f, i) => (
              <div key={i} className="adv-feature-card" style={{ gridColumn: `span ${f.colSpan}`, padding: 34, borderRadius: 22, background: "#fafafa", border: "1px solid rgba(0,0,0,0.05)", minWidth: 0, display: "flex", flexDirection: "column" }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: "#ffe1e9", display: "grid", placeItems: "center" }}>
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill={BRAND} /></svg>
                </div>
                <div style={{ marginTop: 20, fontSize: 19, fontWeight: 600, color: INK, letterSpacing: "-0.01em" }}>{f.t}</div>
                <p style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.6, color: SUBTLE, maxWidth: 420 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section id="pricing" style={{ padding: "130px 28px", background: "#f5f5f7" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND, textTransform: "uppercase", letterSpacing: "0.04em" }}>{t.pricing.kicker}</div>
            <h2 style={{ margin: "14px 0 0", fontSize: "clamp(32px,4vw,46px)", fontWeight: 700, letterSpacing: "-0.02em", color: INK }}>{t.pricing.title}</h2>
            <p style={{ margin: "16px 0 0", fontSize: 17, lineHeight: 1.6, color: SUBTLE }}>{t.pricing.sub}</p>
          </div>

          <div className="adv-pricing-grid" style={{ marginTop: 60 }}>
            {pricingCards.map((card, i) => (
              <div key={i} style={{ position: "relative", background: card.cardBg, borderRadius: 28, padding: 36, border: "1px solid rgba(0,0,0,0.06)", boxShadow: card.shadowStyle }}>
                {card.popular && (
                  <span style={{ position: "absolute", top: 22, right: 22, padding: "6px 14px", borderRadius: 100, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: "#fff", background: BRAND }}>{t.pricing.popular}</span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src={card.iconSrc} style={{ width: 24, height: 24, objectFit: "contain" }} alt="" />
                  <div style={{ fontSize: 15, fontWeight: 600, color: card.subColor }}>{card.name}</div>
                </div>
                <div style={{ marginTop: 26, display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontSize: 56, fontWeight: 700, color: card.textColor, letterSpacing: "-0.03em" }}>{card.price}</div>
                  <div style={{ fontSize: 12.5, color: card.subColor }}>{t.pricing.perAccount}</div>
                </div>
                <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: card.featColor }}>
                    <Check />{t.pricing.minTopup}: <strong style={{ color: card.textColor }}>{card.min}</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: card.featColor }}>
                    <Check />{t.pricing.topupFees}: <strong style={{ color: card.textColor }}>{card.fees}</strong>
                  </div>
                  {card.features.map((feat, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: card.featColor }}>
                      <Check />{feat}
                    </div>
                  ))}
                </div>
                {authSignupHref ? (
                  <a href={authSignupHref} style={{ marginTop: 30, display: "flex", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 100, background: card.ctaBg, color: "#fff", fontSize: 14.5, fontWeight: 600, textDecoration: "none" }}>{card.cta}</a>
                ) : (
                  <button onClick={onNavigateSignup} style={{ marginTop: 30, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: 50, borderRadius: 100, background: card.ctaBg, color: "#fff", fontSize: 14.5, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>{card.cta}</button>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 36, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: FAINT }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><rect x="4" y="10" width="16" height="11" rx="2" fill={FAINT} /><path d="M8 10V7a4 4 0 018 0v3" stroke={FAINT} strokeWidth="2" /></svg>
            {t.pricing.pay}
          </div>
        </div>
      </section>

      {/* ================= SAVINGS CALCULATOR ================= */}
      <section id="calculator" style={{ padding: "130px 28px", background: "#ffffff" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND, textTransform: "uppercase", letterSpacing: "0.04em" }}>{t.calc.kicker}</div>
            <h2 style={{ margin: "14px 0 0", fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, letterSpacing: "-0.02em", color: INK }}>{t.calc.title}</h2>
            <p style={{ margin: "16px 0 0", fontSize: 16, lineHeight: 1.6, color: SUBTLE }}>{t.calc.sub}</p>
          </div>

          <div style={{ marginTop: 48, background: "#fafafa", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 26, boxShadow: "0 30px 70px -40px rgba(0,0,0,0.15)", padding: 36 }}>
            <div className="adv-calc-tabs" style={{ background: "#eeeef0", padding: 4, borderRadius: 100 }}>
              {Object.entries(CALC_PLATFORMS).map(([key, p]) => {
                const active = key === calcPlatformKey;
                return (
                  <button key={key} onClick={() => setCalcPlatformKey(key)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 8px", borderRadius: 100, cursor: "pointer", background: active ? "#fff0f4" : "#ffffff", border: "none", transition: "all .2s", fontFamily: "inherit" }}>
                    <img src={A(p.logo)} alt={p.name} style={{ width: 18, height: 18, objectFit: "contain" }} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: active ? BRAND : "#3a3a3d" }}>{p.name}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#3a3a3d" }}>{t.calc.spendLabel}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: INK, letterSpacing: "-0.01em" }}>{fmt(adSpend)}</div>
              </div>
              <div style={{ marginTop: 18, position: "relative" }}>
                <div style={{ position: "relative", height: 6, borderRadius: 999, background: "#e5e5ea" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 999, background: BRAND, width: `${sliderFillPct}%` }} />
                </div>
                <input type="range" min={200} max={20000} step={100} value={adSpend} onChange={(e) => setAdSpend(Number(e.target.value))} className="adv-range" style={{ position: "relative", top: -16 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#9a9a9e", marginTop: -4 }}>
                <span>$200</span><span>$20,000</span>
              </div>
            </div>

            <div style={{ marginTop: 24, borderRadius: 20, background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", padding: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: FAINT, textTransform: "uppercase", letterSpacing: "0.03em" }}>{t.calc.resultsLabel} — {selected.name}</div>
              <div style={{ marginTop: 16, display: "flex", gap: 30, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 12, color: FAINT }}>{t.calc.monthly}</div>
                  <div style={{ marginTop: 4, fontSize: 28, fontWeight: 800, color: INK, letterSpacing: "-0.01em" }}>{fmt(monthlySavings)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: FAINT }}>{t.calc.annually}</div>
                  <div style={{ marginTop: 4, fontSize: 28, fontWeight: 800, color: BRAND, letterSpacing: "-0.01em" }}>{fmt(annualSavings)}</div>
                </div>
              </div>
              <p style={{ margin: "18px 0 0", fontSize: 13, lineHeight: 1.6, color: FAINT }}>{calcHelperText}</p>
            </div>

            {authSignupHref ? (
              <a href={authSignupHref} style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 100, background: BRAND, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                {t.calc.cta}<Arrow width={16} height={16} />
              </a>
            ) : (
              <button onClick={onNavigateSignup} style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", height: 52, borderRadius: 100, background: BRAND, color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                {t.calc.cta}<Arrow width={16} height={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" style={{ padding: "130px 28px", background: "#f5f5f7" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND, textTransform: "uppercase", letterSpacing: "0.04em" }}>{t.faq.kicker}</div>
            <h2 style={{ margin: "14px 0 0", fontSize: "clamp(32px,4vw,46px)", fontWeight: 700, letterSpacing: "-0.02em", color: INK }}>{t.faq.title}</h2>
            <p style={{ margin: "16px 0 0", fontSize: 17, lineHeight: 1.6, color: SUBTLE }}>{t.faq.sub}</p>
          </div>
          <div className="adv-faq-wrap" style={{ marginTop: 56 }}>
            {t.faq.items.map((it, i) => {
              const open = faqOpen === i;
              return (
                <div key={i} style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                  <button onClick={() => setFaqOpen(open ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "26px 0", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                    <span style={{ fontSize: 19, fontWeight: 600, color: INK, letterSpacing: "-0.01em" }}>{it.q}</span>
                    <span style={{ flexShrink: 0, width: 28, height: 28, display: "grid", placeItems: "center", color: INK, transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform .25s" }}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                    </span>
                  </button>
                  {open && <div style={{ padding: "0 0 28px", fontSize: 16, lineHeight: 1.65, color: SUBTLE, maxWidth: 640 }}>{it.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section style={{ padding: "150px 28px", background: INK, textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(36px,5.5vw,58px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.05 }}>{t.cta.title}</h2>
          <p style={{ margin: "22px auto 0", fontSize: 18, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", maxWidth: 480 }}>{t.cta.sub}</p>
          <div style={{ marginTop: 40, display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            {authSignupHref ? (
              <a href={authSignupHref} style={{ display: "inline-flex", alignItems: "center", height: 54, padding: "0 32px", borderRadius: 100, background: BRAND, color: "#fff", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>{t.cta.btn1}</a>
            ) : (
              <button onClick={onNavigateSignup} style={{ display: "inline-flex", alignItems: "center", height: 54, padding: "0 32px", borderRadius: 100, background: BRAND, color: "#fff", fontSize: 16, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>{t.cta.btn1}</button>
            )}
            <a href="#footer" style={{ display: "inline-flex", alignItems: "center", height: 54, padding: "0 30px", borderRadius: 100, background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>{t.cta.btn2}</a>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer id="footer" style={{ padding: "64px 28px 30px", background: INK, color: "#a1a1a6" }}>
        <div className="adv-footer-grid" style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src={A("logo.png")} style={{ height: 24, filter: "brightness(0) invert(1)" }} alt="AdverSolutions" />
            </div>
            <p style={{ marginTop: 16, fontSize: 13.5, lineHeight: 1.6, color: FAINT, maxWidth: 320 }}>{t.footer.tag}</p>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.03em" }}>{t.footer.navTitle}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {footerNavLinks.map((fl, i) => (
                <a key={i} href={fl.href} className="adv-footer-link" style={{ fontSize: 13.5, color: FAINT, textDecoration: "none" }}>{fl.label}</a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.03em" }}>{t.footer.platTitle}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {t.platforms.cards.map((pc, i) => (
                <a key={i} href="#platforms" className="adv-footer-link" style={{ fontSize: 13.5, color: FAINT, textDecoration: "none" }}>{pc.name}</a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.03em" }}>{t.footer.contactTitle}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, color: FAINT }}>
              <div>contact@adversolutions.agency</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: "#34c759" }} />{t.footer.live}</div>
              <a href="#" className="adv-footer-link" style={{ color: FAINT, textDecoration: "none" }}>{t.footer.terms}</a>
              <a href="#" className="adv-footer-link" style={{ color: FAINT, textDecoration: "none" }}>{t.footer.privacy}</a>
              <a href="https://policy.adversolutions.agency/" className="adv-footer-link" style={{ color: FAINT, textDecoration: "none" }}>Policy</a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1240, margin: "44px auto 0", paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "#6e6e73", textAlign: "center" }}>
          {t.footer.copy}
        </div>
      </footer>
    </div>
  );
}
