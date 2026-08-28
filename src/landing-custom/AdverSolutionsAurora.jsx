import { useState, useEffect, useRef } from "react";

/* ============================================================
   AdverSolutions — Landing Page (2026 refresh)
   Light, Apple-clean layout with a magenta aurora signature,
   glass pricing cards, and scroll-reveal motion.
   ============================================================ */

const BRAND = {
  magenta: "#E63975",
  magentaDeep: "#B91C5B",
  plum: "#2B0F1E",
  ink: "#141419",
  mist: "#FAFAFC",
  rose: "#FDECF2",
};

/* ---------- Simplified platform marks (inline SVG) ---------- */

const GoogleAdsMark = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 512 466" fill="none">
    <rect x="150" y="20" width="140" height="420" rx="70" transform="rotate(30 220 230)" fill="#FBBC04" />
    <rect x="240" y="20" width="140" height="420" rx="70" transform="rotate(-30 310 230)" fill="#4285F4" />
    <circle cx="105" cy="375" r="78" fill="#34A853" />
  </svg>
);

const MetaMark = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 100 66" fill="none">
    <path
      d="M14 62C6 62 2 53 2 43 2 22 14 4 28 4c9 0 14 6 22 18C58 10 63 4 72 4c14 0 26 18 26 39 0 10-4 19-12 19-9 0-13-8-20-20L50 22 34 42c-7 12-11 20-20 20Z"
      stroke="#0866FF"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TikTokMark = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M31 8c1 5 4 8 9 9v6c-3 0-6-1-9-3v12c0 7-5 12-12 12S7 39 7 33s5-11 12-11v6c-3 0-6 2-6 5s3 5 6 5 6-2 6-5V8h6Z" fill="#25F4EE" transform="translate(-1.6,-1.6)" />
    <path d="M31 8c1 5 4 8 9 9v6c-3 0-6-1-9-3v12c0 7-5 12-12 12S7 39 7 33s5-11 12-11v6c-3 0-6 2-6 5s3 5 6 5 6-2 6-5V8h6Z" fill="#FE2C55" transform="translate(1.6,1.6)" />
    <path d="M31 8c1 5 4 8 9 9v6c-3 0-6-1-9-3v12c0 7-5 12-12 12S7 39 7 33s5-11 12-11v6c-3 0-6 2-6 5s3 5 6 5 6-2 6-5V8h6Z" fill="#0B0B10" />
  </svg>
);

const SnapMark = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#FFFC00" />
    <path
      d="M24 9c5 0 8.5 3.6 8.5 9 0 1.5-.1 2.8-.2 3.9 1-.4 2.5-.3 2.9.7.4 1.1-.8 1.9-2.4 2.6 1.2 2.8 3.4 4.7 6.2 5.4-.3 1.6-2.9 2.3-5 2.6-.2.7-.4 1.5-.8 1.6-1.3.4-3-.6-4.6.2-1.3.7-2.4 2-4.6 2s-3.3-1.3-4.6-2c-1.6-.8-3.3.2-4.6-.2-.4-.1-.6-.9-.8-1.6-2.1-.3-4.7-1-5-2.6 2.8-.7 5-2.6 6.2-5.4-1.6-.7-2.8-1.5-2.4-2.6.4-1 1.9-1.1 2.9-.7-.1-1.1-.2-2.4-.2-3.9 0-5.4 3.5-9 8.5-9Z"
      fill="#fff"
      stroke="#0B0B10"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const BingMark = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="bingGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#37BDFF" />
        <stop offset="1" stopColor="#1B48EF" />
      </linearGradient>
    </defs>
    <path d="M13 5l8 3v26l10-6-5-2-3-7 14 5v8L21 43l-8-5V5Z" fill="url(#bingGrad)" />
  </svg>
);

const PLATFORMS = [
  {
    name: "Meta Ads",
    mark: MetaMark,
    tint: "#0866FF",
    blurb: "Facebook & Instagram agency accounts with high spending limits, built for scale.",
  },
  {
    name: "Google Ads",
    mark: GoogleAdsMark,
    tint: "#4285F4",
    blurb: "Search, Display, YouTube and PMax through stable, invoiced agency accounts.",
  },
  {
    name: "TikTok Ads",
    mark: TikTokMark,
    tint: "#FE2C55",
    blurb: "Agency accounts made for aggressive creative testing and worldwide targeting.",
  },
  {
    name: "Snapchat Ads",
    mark: SnapMark,
    tint: "#E8DF00",
    blurb: "Reach younger audiences with unlocked geos and dedicated Snap support.",
  },
  {
    name: "Bing / Microsoft Ads",
    mark: BingMark,
    tint: "#1B48EF",
    blurb: "Low-competition search traffic through premium Microsoft agency accounts.",
  },
];

const SERVICES = [
  {
    title: "Agency Ad Accounts",
    desc: "Instant access to premium agency accounts across all five platforms — no daily caps holding you back.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="14" rx="3" />
        <path d="M3 9h18M8 21h8" />
      </svg>
    ),
  },
  {
    title: "Fast Top-Ups",
    desc: "Fund your accounts in minutes with low fees. Crypto, bank transfer and card supported.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M5 10l7-7 7 7" />
      </svg>
    ),
  },
  {
    title: "Ban-Resistant Structure",
    desc: "Accounts backed by direct platform partnerships. If anything happens, we replace and migrate fast.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Dedicated Manager",
    desc: "A real human on WhatsApp and Telegram, around the clock — setup, appeals, scaling advice.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </svg>
    ),
  },
  {
    title: "Media Buying Support",
    desc: "Campaign structure reviews, creative feedback and scaling playbooks from senior buyers.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V5M4 19h16M8 15l4-6 3 3 5-7" />
      </svg>
    ),
  },
  {
    title: "Transparent Reporting",
    desc: "Live spend dashboards and clean monthly statements. You always know where every dollar goes.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 14v3M12 10v7M16 7v10" />
      </svg>
    ),
  },
];

// Real AdverSolutions pricing — matches the default/premium landing pages
// exactly (per-account price, not a % fee tier), so all three templates
// quote the same numbers regardless of which is set active.
const PRICING = [
  {
    name: "Meta Agency Ads",
    price: "$70",
    sub: "per account",
    min: "$100",
    fees: "6%",
    features: ["Balance warranty", "Instant delivery", "Dashboard access", "Verified account", "Premium support"],
    cta: "Choose Meta Ads",
    featured: false,
  },
  {
    name: "Google Agency Ads",
    price: "$99",
    sub: "per account",
    min: "$200",
    fees: "9%",
    features: ["Balance warranty", "Stable billing", "Dashboard access", "Verified account", "Premium support"],
    cta: "Choose Google Ads",
    featured: true,
  },
  {
    name: "TikTok Agency Ads",
    price: "$39",
    sub: "per account",
    min: "$100",
    fees: "3%",
    features: ["Balance warranty", "Instant delivery", "Scalable spending", "Dashboard access", "Premium support"],
    cta: "Choose TikTok Ads",
    featured: false,
  },
];

const STEPS = [
  { n: "01", t: "Tell us your platforms", d: "Pick Meta, Google, TikTok, Snapchat or Bing — or all five." },
  { n: "02", t: "Get your accounts", d: "We hand over verified agency accounts, usually within hours." },
  { n: "03", t: "Top up & launch", d: "Fund with a small fee, launch campaigns, and scale without limits." },
];

/* ------------------- Reveal-on-scroll hook ------------------- */
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown(true), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

const Reveal = ({ children, delay = 0, style = {} }) => {
  const [ref, shown] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(28px)",
        transition: `opacity .8s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform .8s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------- Logo ------------------------- */
const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <svg width="30" height="30" viewBox="0 0 60 60" fill="none">
      <path d="M10 52L28 10c1.4-3 5.6-3 7 0l3 7-14 35c-.8 2-2.8 3-4.8 2.6L10 52Z" fill={BRAND.magenta} />
      <path d="M33 26l9 22c1 2.6 4.6 3.4 6.6 1.4L52 47 39 17l-6 9Z" fill={BRAND.magentaDeep} />
    </svg>
    <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em", color: BRAND.ink }}>
      ADVER
      <span
        style={{
          background: BRAND.magenta,
          color: "#fff",
          borderRadius: 999,
          padding: "2px 10px",
          marginLeft: 6,
          fontSize: 15,
          verticalAlign: "middle",
        }}
      >
        SOLUTIONS
      </span>
    </span>
  </div>
);

/* ------------------------- Page ------------------------- */
export default function AdverSolutionsAurora({ onNavigateLogin, onNavigateSignup }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const authLoginHref = onNavigateLogin ? undefined : "/login";
  const authSignupHref = onNavigateSignup ? undefined : "/signup";

  const navLinks = [
    ["Platforms", "#platforms"],
    ["Products", "#/products"],
    ["Services", "#services"],
    ["Pricing", "#pricing"],
    ["How it works", "#how"],
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: BRAND.mist, color: BRAND.ink, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; }
        html { scroll-behavior: smooth; }
        @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1);} 50% { transform: translate(60px,-40px) scale(1.15);} }
        @keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1);} 50% { transform: translate(-70px,50px) scale(1.1);} }
        @keyframes drift3 { 0%,100% { transform: translate(0,0) scale(1);} 50% { transform: translate(40px,60px) scale(0.92);} }
        @keyframes floaty { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-12px);} }
        @keyframes shimmer { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }
        .aurora { position:absolute; border-radius:50%; filter: blur(90px); opacity:.5; pointer-events:none; }
        .plat-card { transition: transform .45s cubic-bezier(.2,.7,.2,1), box-shadow .45s, border-color .45s; }
        .plat-card:hover { transform: translateY(-8px); box-shadow: 0 24px 60px -20px rgba(230,57,117,.25); border-color: rgba(230,57,117,.35) !important; }
        .svc-card { transition: transform .4s cubic-bezier(.2,.7,.2,1), box-shadow .4s; }
        .svc-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px -22px rgba(20,20,25,.25); }
        .price-card { transition: transform .45s cubic-bezier(.2,.7,.2,1), box-shadow .45s; }
        .price-card:hover { transform: translateY(-10px) scale(1.01); }
        .btn-primary { transition: transform .25s, box-shadow .25s, background .25s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 34px -10px rgba(230,57,117,.55); }
        .btn-ghost { transition: background .25s, border-color .25s; }
        .btn-ghost:hover { background: rgba(230,57,117,.08); border-color: rgba(230,57,117,.5) !important; }
        .navlink { transition: color .2s; }
        .navlink:hover { color: ${BRAND.magenta}; }
        @media (prefers-reduced-motion: reduce) {
          .aurora, .float-el { animation: none !important; }
          * { transition-duration: .01ms !important; }
        }
        @media (max-width: 860px) {
          .nav-links { display: none !important; }
          .nav-burger { display: flex !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .steps { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ======================= NAV ======================= */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px clamp(20px, 5vw, 56px)",
          background: scrolled ? "rgba(250,250,252,.75)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(20,20,25,.06)" : "1px solid transparent",
          transition: "all .35s",
        }}
      >
        <Logo />
        <div className="nav-links" style={{ display: "flex", gap: 22, alignItems: "center" }}>
          {navLinks.map(([label, href]) => (
            <a key={label} href={href} className="navlink" style={{ textDecoration: "none", color: BRAND.ink, fontSize: 14.5, fontWeight: 500 }}>
              {label}
            </a>
          ))}
          {authLoginHref ? (
            <a href={authLoginHref} className="navlink" style={{ textDecoration: "none", color: BRAND.ink, fontSize: 14.5, fontWeight: 500 }}>Log in</a>
          ) : (
            <button onClick={onNavigateLogin} className="navlink" style={{ background: "none", border: "none", cursor: "pointer", color: BRAND.ink, fontSize: 14.5, fontWeight: 500, fontFamily: "inherit" }}>Log in</button>
          )}
          {authSignupHref ? (
            <a
              href={authSignupHref}
              className="btn-primary"
              style={{
                textDecoration: "none",
                background: BRAND.magenta,
                color: "#fff",
                padding: "10px 22px",
                borderRadius: 999,
                fontSize: 14.5,
                fontWeight: 600,
              }}
            >
              Get started
            </a>
          ) : (
            <button
              onClick={onNavigateSignup}
              className="btn-primary"
              style={{
                background: BRAND.magenta,
                color: "#fff",
                padding: "10px 22px",
                borderRadius: 999,
                fontSize: 14.5,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Get started
            </button>
          )}
        </div>
        <button
          className="nav-burger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          style={{ display: "none", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 8 }}
        >
          <span style={{ width: 22, height: 2, background: BRAND.ink, transition: ".3s", transform: menuOpen ? "rotate(45deg) translateY(5px)" : "none" }} />
          <span style={{ width: 22, height: 2, background: BRAND.ink, opacity: menuOpen ? 0 : 1, transition: ".3s" }} />
          <span style={{ width: 22, height: 2, background: BRAND.ink, transition: ".3s", transform: menuOpen ? "rotate(-45deg) translateY(-5px)" : "none" }} />
        </button>
      </nav>

      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: "60px 0 auto 0",
            zIndex: 49,
            background: "rgba(250,250,252,.97)",
            backdropFilter: "blur(20px)",
            padding: "18px 24px 26px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            borderBottom: "1px solid rgba(20,20,25,.08)",
          }}
        >
          {navLinks.map(([label, href]) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", color: BRAND.ink, fontSize: 17, fontWeight: 600 }}>
              {label}
            </a>
          ))}
          {authLoginHref ? (
            <a href={authLoginHref} onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", color: BRAND.ink, fontSize: 17, fontWeight: 600 }}>Log in</a>
          ) : (
            <button onClick={() => { setMenuOpen(false); onNavigateLogin(); }} style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: BRAND.ink, fontSize: 17, fontWeight: 600, fontFamily: "inherit" }}>Log in</button>
          )}
          {authSignupHref ? (
            <a
              href={authSignupHref}
              onClick={() => setMenuOpen(false)}
              style={{ textDecoration: "none", background: BRAND.magenta, color: "#fff", padding: "12px 22px", borderRadius: 999, fontWeight: 600, textAlign: "center" }}
            >
              Get started
            </a>
          ) : (
            <button
              onClick={() => { setMenuOpen(false); onNavigateSignup(); }}
              style={{ background: BRAND.magenta, color: "#fff", padding: "12px 22px", borderRadius: 999, fontWeight: 600, textAlign: "center", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Get started
            </button>
          )}
        </div>
      )}

      {/* ======================= HERO ======================= */}
      <header style={{ position: "relative", padding: "150px clamp(20px,5vw,56px) 90px", textAlign: "center", overflow: "hidden" }}>
        <div className="aurora" style={{ width: 520, height: 520, background: BRAND.magenta, top: -180, left: "8%", animation: "drift1 14s ease-in-out infinite" }} />
        <div className="aurora" style={{ width: 460, height: 460, background: "#7C3AED", top: -120, right: "4%", opacity: 0.28, animation: "drift2 18s ease-in-out infinite" }} />
        <div className="aurora" style={{ width: 380, height: 380, background: "#38BDF8", bottom: -160, left: "42%", opacity: 0.25, animation: "drift3 16s ease-in-out infinite" }} />

        <div style={{ position: "relative", maxWidth: 880, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(230,57,117,.08)",
                border: "1px solid rgba(230,57,117,.25)",
                color: BRAND.magentaDeep,
                borderRadius: 999,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 26,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: 999, background: BRAND.magenta, display: "inline-block" }} />
              Premium agency ad accounts · 5 platforms
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(42px, 6.4vw, 78px)",
                lineHeight: 1.06,
                letterSpacing: "-0.035em",
              }}
            >
              Scale your ads.
              <br />
              <span
                style={{
                  background: `linear-gradient(90deg, ${BRAND.magenta}, #7C3AED, ${BRAND.magenta})`,
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  animation: "shimmer 6s linear infinite",
                }}
              >
                Without limits.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p style={{ maxWidth: 620, margin: "26px auto 0", fontSize: 18, lineHeight: 1.65, color: "rgba(20,20,25,.65)" }}>
              AdverSolutions gives media buyers and brands premium agency ad accounts on Meta, Google, TikTok, Snapchat and Bing —
              high limits, fast top-ups, and real human support around the clock.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 38 }}>
              <a
                href="#pricing"
                className="btn-primary"
                style={{ textDecoration: "none", background: BRAND.magenta, color: "#fff", padding: "15px 34px", borderRadius: 999, fontWeight: 600, fontSize: 16 }}
              >
                See pricing
              </a>
              <a
                href="#platforms"
                className="btn-ghost"
                style={{
                  textDecoration: "none",
                  color: BRAND.ink,
                  padding: "15px 34px",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 16,
                  border: "1.5px solid rgba(20,20,25,.15)",
                  background: "rgba(255,255,255,.6)",
                }}
              >
                Explore platforms
              </a>
            </div>
          </Reveal>

          <Reveal delay={420}>
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(18px,4vw,42px)", marginTop: 70, flexWrap: "wrap" }}>
              {PLATFORMS.map((p, i) => (
                <div
                  key={p.name}
                  className="float-el"
                  title={p.name}
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: 20,
                    background: "rgba(255,255,255,.85)",
                    border: "1px solid rgba(20,20,25,.07)",
                    boxShadow: "0 12px 34px -14px rgba(20,20,25,.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                    animation: `floaty ${4 + i * 0.6}s ease-in-out ${i * 0.35}s infinite`,
                  }}
                >
                  <p.mark size={34} />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </header>

      {/* ======================= STATS STRIP ======================= */}
      <section style={{ padding: "0 clamp(20px,5vw,56px)", marginTop: -10 }}>
        <Reveal>
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 1,
              background: "rgba(20,20,25,.07)",
              borderRadius: 24,
              overflow: "hidden",
              border: "1px solid rgba(20,20,25,.07)",
            }}
          >
            {[
              ["$25M+", "Ad spend managed"],
              ["500+", "Active advertisers"],
              ["5", "Ad platforms"],
              ["24/7", "Human support"],
            ].map(([v, l]) => (
              <div key={l} style={{ background: "#fff", padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 30, color: BRAND.magenta, letterSpacing: "-0.02em" }}>{v}</div>
                <div style={{ fontSize: 13.5, color: "rgba(20,20,25,.55)", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ======================= PLATFORMS ======================= */}
      <section id="platforms" style={{ padding: "110px clamp(20px,5vw,56px) 30px", maxWidth: 1180, margin: "0 auto" }}>
        <Reveal>
          <p style={{ color: BRAND.magenta, fontWeight: 700, fontSize: 13.5, letterSpacing: ".14em", textTransform: "uppercase", textAlign: "center" }}>Platforms</p>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(30px,4vw,44px)", letterSpacing: "-0.03em", textAlign: "center", marginTop: 12 }}>
            Every channel that matters
          </h2>
          <p style={{ textAlign: "center", color: "rgba(20,20,25,.6)", maxWidth: 560, margin: "16px auto 0", fontSize: 16.5, lineHeight: 1.6 }}>
            One partner, five ad ecosystems. Run everything from a single relationship.
          </p>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 18,
            marginTop: 54,
          }}
        >
          {PLATFORMS.map((p, i) => (
            <Reveal key={p.name} delay={i * 90} style={{ height: "100%" }}>
              <div
                className="plat-card"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(20,20,25,.08)",
                  borderRadius: 22,
                  padding: "30px 24px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `${p.tint}12`,
                  }}
                >
                  <p.mark size={32} />
                </div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 17.5, letterSpacing: "-0.01em" }}>{p.name}</div>
                <p style={{ fontSize: 14.2, lineHeight: 1.6, color: "rgba(20,20,25,.6)" }}>{p.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ======================= SERVICES ======================= */}
      <section id="services" style={{ padding: "100px clamp(20px,5vw,56px)", maxWidth: 1180, margin: "0 auto" }}>
        <Reveal>
          <p style={{ color: BRAND.magenta, fontWeight: 700, fontSize: 13.5, letterSpacing: ".14em", textTransform: "uppercase" }}>What we offer</p>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(30px,4vw,44px)", letterSpacing: "-0.03em", marginTop: 12, maxWidth: 560 }}>
            Built for serious media buyers
          </h2>
        </Reveal>

        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 50 }}>
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 70} style={{ height: "100%" }}>
              <div
                className="svc-card"
                style={{
                  background: "#fff",
                  borderRadius: 22,
                  border: "1px solid rgba(20,20,25,.08)",
                  padding: "30px 26px",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: BRAND.rose,
                    color: BRAND.magenta,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  {s.icon}
                </div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 17.5, letterSpacing: "-0.01em" }}>{s.title}</div>
                <p style={{ fontSize: 14.4, lineHeight: 1.65, color: "rgba(20,20,25,.6)", marginTop: 10 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ======================= HOW IT WORKS ======================= */}
      <section id="how" style={{ background: BRAND.plum, color: "#fff", padding: "100px clamp(20px,5vw,56px)", position: "relative", overflow: "hidden" }}>
        <div className="aurora" style={{ width: 480, height: 480, background: BRAND.magenta, top: -220, right: -120, opacity: 0.35, animation: "drift2 16s ease-in-out infinite" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <Reveal>
            <p style={{ color: "#FF8FB6", fontWeight: 700, fontSize: 13.5, letterSpacing: ".14em", textTransform: "uppercase" }}>How it works</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(30px,4vw,44px)", letterSpacing: "-0.03em", marginTop: 12 }}>
              Live in three steps
            </h2>
          </Reveal>
          <div className="steps" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 56 }}>
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120} style={{ height: "100%" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.12)",
                    borderRadius: 22,
                    padding: "30px 26px",
                    height: "100%",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontWeight: 800,
                      fontSize: 15,
                      color: BRAND.magenta,
                      background: "#fff",
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {s.n}
                  </div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18.5, marginTop: 20 }}>{s.t}</div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "rgba(255,255,255,.66)", marginTop: 10 }}>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= PRICING ======================= */}
      <section id="pricing" style={{ padding: "110px clamp(20px,5vw,56px)", maxWidth: 1180, margin: "0 auto" }}>
        <Reveal>
          <p style={{ color: BRAND.magenta, fontWeight: 700, fontSize: 13.5, letterSpacing: ".14em", textTransform: "uppercase", textAlign: "center" }}>Pricing</p>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(30px,4vw,44px)", letterSpacing: "-0.03em", textAlign: "center", marginTop: 12 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ textAlign: "center", color: "rgba(20,20,25,.6)", maxWidth: 540, margin: "16px auto 0", fontSize: 16.5, lineHeight: 1.6 }}>
            Every account includes balance warranty and instant delivery.
          </p>
        </Reveal>

        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, marginTop: 60, alignItems: "stretch" }}>
          {PRICING.map((t, i) => (
            <Reveal key={t.name} delay={i * 110} style={{ height: "100%" }}>
              <div
                className="price-card"
                style={{
                  position: "relative",
                  borderRadius: 26,
                  padding: t.featured ? "40px 30px" : "34px 30px",
                  height: "100%",
                  background: t.featured
                    ? `linear-gradient(160deg, ${BRAND.magenta}, ${BRAND.magentaDeep} 70%)`
                    : "rgba(255,255,255,.8)",
                  color: t.featured ? "#fff" : BRAND.ink,
                  border: t.featured ? "1px solid transparent" : "1px solid rgba(20,20,25,.09)",
                  boxShadow: t.featured ? "0 30px 70px -24px rgba(230,57,117,.5)" : "0 14px 40px -24px rgba(20,20,25,.18)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {t.featured && (
                  <span
                    style={{
                      position: "absolute",
                      top: -14,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#fff",
                      color: BRAND.magentaDeep,
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "6px 16px",
                      borderRadius: 999,
                      letterSpacing: ".06em",
                      boxShadow: "0 8px 20px -8px rgba(0,0,0,.25)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    POPULAR
                  </span>
                )}
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18 }}>{t.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 16 }}>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 52, letterSpacing: "-0.04em" }}>{t.price}</span>
                  <span style={{ fontSize: 14.5, opacity: 0.75 }}>/ {t.sub}</span>
                </div>
                <div style={{ fontSize: 13.5, marginTop: 6, opacity: 0.75 }}>
                  Min. topup {t.min} · {t.fees} topup fee
                </div>
                <div style={{ height: 1, background: t.featured ? "rgba(255,255,255,.25)" : "rgba(20,20,25,.08)", margin: "24px 0" }} />
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 13, flex: 1 }}>
                  {t.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.5, alignItems: "flex-start" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                        <circle cx="12" cy="12" r="11" fill={t.featured ? "rgba(255,255,255,.2)" : BRAND.rose} />
                        <path d="M7.5 12.5l3 3 6-6.5" stroke={t.featured ? "#fff" : BRAND.magenta} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {authSignupHref ? (
                  <a
                    href={authSignupHref}
                    className="btn-primary"
                    style={{
                      textDecoration: "none",
                      textAlign: "center",
                      marginTop: 28,
                      padding: "14px 24px",
                      borderRadius: 999,
                      fontWeight: 600,
                      fontSize: 15,
                      background: t.featured ? "#fff" : BRAND.magenta,
                      color: t.featured ? BRAND.magentaDeep : "#fff",
                    }}
                  >
                    {t.cta}
                  </a>
                ) : (
                  <button
                    onClick={onNavigateSignup}
                    className="btn-primary"
                    style={{
                      textAlign: "center",
                      marginTop: 28,
                      padding: "14px 24px",
                      borderRadius: 999,
                      fontWeight: 600,
                      fontSize: 15,
                      background: t.featured ? "#fff" : BRAND.magenta,
                      color: t.featured ? BRAND.magentaDeep : "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {t.cta}
                  </button>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300}>
          <p style={{ textAlign: "center", fontSize: 13.5, color: "rgba(20,20,25,.5)", marginTop: 30 }}>
            Custom volume?{" "}
            <a href="#contact" style={{ color: BRAND.magenta, fontWeight: 600 }}>
              Talk to us
            </a>{" "}
            for negotiated rates.
          </p>
        </Reveal>
      </section>

      {/* ======================= CTA ======================= */}
      <section id="contact" style={{ padding: "40px clamp(20px,5vw,56px) 110px" }}>
        <Reveal>
          <div
            style={{
              position: "relative",
              maxWidth: 1100,
              margin: "0 auto",
              borderRadius: 32,
              overflow: "hidden",
              background: `linear-gradient(135deg, ${BRAND.plum}, #4A0F2E 60%, ${BRAND.magentaDeep})`,
              color: "#fff",
              padding: "clamp(50px,7vw,86px) clamp(26px,6vw,80px)",
              textAlign: "center",
            }}
          >
            <div className="aurora" style={{ width: 420, height: 420, background: BRAND.magenta, top: -180, left: "30%", opacity: 0.45, animation: "drift1 13s ease-in-out infinite" }} />
            <div style={{ position: "relative" }}>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(30px,4.4vw,50px)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Ready to scale in 2026?
              </h2>
              <p style={{ maxWidth: 520, margin: "18px auto 0", fontSize: 16.5, lineHeight: 1.65, color: "rgba(255,255,255,.75)" }}>
                Get your first agency account today. Setup usually takes less than a few hours.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 36 }}>
                {authSignupHref ? (
                  <a
                    href={authSignupHref}
                    className="btn-primary"
                    style={{ textDecoration: "none", background: "#fff", color: BRAND.magentaDeep, padding: "15px 34px", borderRadius: 999, fontWeight: 700, fontSize: 16 }}
                  >
                    Access Dashboard
                  </a>
                ) : (
                  <button
                    onClick={onNavigateSignup}
                    className="btn-primary"
                    style={{ background: "#fff", color: BRAND.magentaDeep, padding: "15px 34px", borderRadius: 999, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Access Dashboard
                  </button>
                )}
                <a
                  href="#"
                  className="btn-ghost"
                  style={{ textDecoration: "none", color: "#fff", padding: "15px 34px", borderRadius: 999, fontWeight: 600, fontSize: 16, border: "1.5px solid rgba(255,255,255,.35)" }}
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ======================= FOOTER ======================= */}
      <footer
        style={{
          borderTop: "1px solid rgba(20,20,25,.08)",
          padding: "36px clamp(20px,5vw,56px)",
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo />
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {navLinks.map(([label, href]) => (
            <a key={label} href={href} className="navlink" style={{ textDecoration: "none", color: "rgba(20,20,25,.55)", fontSize: 13.5 }}>
              {label}
            </a>
          ))}
          <a href="https://policy.adversolutions.agency/" className="navlink" style={{ textDecoration: "none", color: "rgba(20,20,25,.55)", fontSize: 13.5 }}>
            Policy
          </a>
        </div>
        <p style={{ fontSize: 13, color: "rgba(20,20,25,.45)" }}>© 2026 AdverSolutions. All rights reserved.</p>
      </footer>
    </div>
  );
}
