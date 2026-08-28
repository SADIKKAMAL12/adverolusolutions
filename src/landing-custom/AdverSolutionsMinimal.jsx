import React, { useState, useRef, useEffect, useCallback } from 'react';

const ACCENT = '#ff2d55';
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

const PLATFORM_DEFS = [
  { name: 'Meta', icon: 'meta.png' },
  { name: 'Google', icon: 'google.webp' },
  { name: 'TikTok', icon: 'tiktok.png' },
  { name: 'Snapchat', icon: 'snapchat.png' },
  { name: 'Bing', icon: 'bing.png' },
];

const TIER_DEFS = [
  {
    name: 'Meta Agency Ads', icon: 'meta.png', price: 70, minTopup: 100, fee: '6%', popular: false,
    features: ['Balance warranty', 'Instant delivery', 'Dashboard access', 'Verified account', 'Premium support'],
  },
  {
    name: 'Google Agency Ads', icon: 'google.webp', price: 99, minTopup: 200, fee: '9%', popular: true,
    features: ['Balance warranty', 'Stable billing', 'Dashboard access', 'Verified account', 'Premium support'],
  },
  {
    name: 'TikTok Agency Ads', icon: 'tiktok.png', price: 39, minTopup: 100, fee: '3%', popular: false,
    features: ['Balance warranty', 'Instant delivery', 'Scalable spending', 'Dashboard access', 'Premium support'],
  },
];

const WHY_DEFS = [
  { title: 'Verified & Warrantied', desc: 'Every account is fully verified and ships with a balance warranty protecting any unspent balance.' },
  { title: 'Instant Delivery', desc: 'Most accounts are delivered within minutes of payment confirmation, with full dashboard credentials.' },
  { title: 'Premium Support', desc: 'Dedicated support and dashboard access to manage spend, top-ups, and account health.' },
];

const FAQ_DEFS = [
  { question: 'What is an agency ad account?', answer: 'A premium advertising account managed by a verified agency partner, offering higher limits, faster reviews, and dedicated stability for scaling brands.' },
  { question: 'Are the accounts verified?', answer: 'Yes, every account is fully verified and provisioned through trusted agency partnerships before delivery.' },
  { question: 'How fast is delivery?', answer: 'Most accounts are delivered within minutes of payment confirmation, with full dashboard credentials.' },
  { question: 'Which platforms are supported?', answer: 'Meta, Google, TikTok, Snapchat, and Bing — all delivered as agency-grade accounts.' },
  { question: 'Do you provide balance warranty?', answer: 'Yes, every account ships with a balance warranty so any unspent balance is protected.' },
  { question: 'Is dashboard access included?', answer: 'Every order includes access to our advanced dashboard to manage spend, top-ups, and account health.' },
  { question: 'How is the savings estimate calculated?', answer: 'Based on aggregate performance data per platform, agency accounts recover 15–25% of monthly ad spend through improved ROAS and reduced wasted spend.' },
];

const FONT_LINK_ID = 'adversolutions-manrope-font';
const KEYFRAMES_ID = 'adversolutions-keyframes';

function useInjectedGlobalStyles() {
  useEffect(() => {
    if (!document.getElementById(FONT_LINK_ID)) {
      const preconnect1 = document.createElement('link');
      preconnect1.rel = 'preconnect';
      preconnect1.href = 'https://fonts.googleapis.com';
      const preconnect2 = document.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'anonymous';
      const link = document.createElement('link');
      link.id = FONT_LINK_ID;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(preconnect1);
      document.head.appendChild(preconnect2);
      document.head.appendChild(link);
    }
    if (!document.getElementById(KEYFRAMES_ID)) {
      const style = document.createElement('style');
      style.id = KEYFRAMES_ID;
      style.textContent = `
        @keyframes floatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-3%, 4%) scale(1.06); } }
        @keyframes floatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(4%, -3%) scale(1.08); } }
      `;
      document.head.appendChild(style);
    }
  }, []);
}

function useReveal(ids) {
  const refs = useRef({});
  const [visibleIds, setVisibleIds] = useState({});

  const setRef = useCallback((id) => (el) => { refs.current[id] = el; }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-reveal-id');
          if (id) setVisibleIds((s) => (s[id] ? s : { ...s, [id]: true }));
        }
      });
    }, { threshold: 0.12 });

    ids.forEach((id) => {
      const el = refs.current[id];
      if (el) {
        el.setAttribute('data-reveal-id', id);
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { setRef, refs, visible: (id) => !!visibleIds[id] };
}

export default function AdverSolutionsMinimal({ assetsPath = "/assets", onNavigateLogin, onNavigateSignup }) {
  useInjectedGlobalStyles();

  const A = (name) => `${assetsPath.replace(/\/$/, "")}/${name}`;
  const authLoginHref = onNavigateLogin ? undefined : "/login";
  const authSignupHref = onNavigateSignup ? undefined : "/signup";
  const goSignup = () => { if (onNavigateSignup) onNavigateSignup(); };

  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const { setRef, refs, visible } = useReveal(['platforms', 'why', 'pricing', 'faq']);

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  const scrollTo = useCallback((id) => {
    const el = refs.current[id];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [refs]);

  const toggleTheme = useCallback(() => setIsDark((v) => !v), []);
  const toggleFaq = useCallback((i) => setOpenFaq((cur) => (cur === i ? null : i)), []);

  const c = isDark ? {
    bg: '#09090b', bgAlt: '#0f0f12', surface: '#17171b', surfaceHover: '#1e1e23',
    border: 'rgba(255,255,255,0.09)', borderStrong: 'rgba(255,255,255,0.16)',
    text: '#f5f5f7', textMuted: '#9a9aa2', textFaint: '#65656b',
    accentSoft: 'rgba(255,45,85,0.14)', navBg: 'rgba(9,9,11,0.72)',
  } : {
    bg: '#faf9f8', bgAlt: '#ffffff', surface: '#ffffff', surfaceHover: '#f3f2f1',
    border: 'rgba(0,0,0,0.08)', borderStrong: 'rgba(0,0,0,0.14)',
    text: '#1d1d1f', textMuted: '#6e6e73', textFaint: '#a1a1a6',
    accentSoft: 'rgba(255,45,85,0.09)', navBg: 'rgba(250,249,248,0.72)',
  };

  const styles = {
    page: {
      background: c.bg, color: c.text, fontFamily: FONT, minHeight: '100vh',
      transition: 'background 0.5s ease, color 0.5s ease', overflowX: 'hidden',
    },
    nav: {
      position: 'sticky', top: 0, zIndex: 50, background: c.navBg, backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${c.border}`,
      transition: 'background 0.5s ease, border-color 0.5s ease',
    },
    navInner: {
      maxWidth: 1180, margin: '0 auto', padding: '16px 32px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
    },
    logoRow: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'default' },
    logoImg: { height: 26, width: 'auto', display: 'block' },
    navLinksRow: { display: 'flex', alignItems: 'center', gap: 24 },
    navLink: { fontSize: 14, fontWeight: 600, color: c.textMuted, cursor: 'pointer' },
    navLoginLink: { fontSize: 14, fontWeight: 600, color: c.text, cursor: 'pointer', textDecoration: 'none', background: 'none', border: 'none', fontFamily: FONT, padding: 0 },
    navCta: {
      background: ACCENT, color: '#fff', border: 'none', borderRadius: 100, padding: '10px 20px',
      fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, textDecoration: 'none', display: 'inline-flex',
      transition: 'transform 0.2s ease, background 0.2s ease',
    },
    themeTrack: {
      width: 44, height: 26, borderRadius: 100, border: `1px solid ${c.borderStrong}`,
      background: isDark ? '#000' : '#e8e7e5', position: 'relative', cursor: 'pointer', padding: 0,
      transition: 'background 0.3s ease',
    },
    themeKnob: {
      position: 'absolute', top: 2, left: isDark ? 20 : 2, width: 20, height: 20, borderRadius: '50%',
      background: isDark ? '#f5f5f7' : ACCENT, transition: 'left 0.3s cubic-bezier(.4,0,.2,1), background 0.3s ease',
    },
    heroSection: {
      position: 'relative', padding: '160px 32px 140px', overflow: 'hidden', display: 'flex',
      justifyContent: 'center', textAlign: 'center',
    },
    heroOrbA: {
      position: 'absolute', width: 520, height: 520, borderRadius: '50%', top: -180, left: '8%',
      background: `radial-gradient(circle, ${ACCENT}33, transparent 70%)`, filter: 'blur(20px)',
      animation: 'floatA 14s ease-in-out infinite', pointerEvents: 'none',
    },
    heroOrbB: {
      position: 'absolute', width: 460, height: 460, borderRadius: '50%', bottom: -200, right: '6%',
      background: `radial-gradient(circle, ${ACCENT}22, transparent 70%)`, filter: 'blur(24px)',
      animation: 'floatB 16s ease-in-out infinite', pointerEvents: 'none',
    },
    heroContent: {
      position: 'relative', maxWidth: 780, display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(18px)',
      transition: 'opacity 0.9s cubic-bezier(.16,1,.3,1), transform 0.9s cubic-bezier(.16,1,.3,1)',
    },
    heroBadge: {
      fontSize: 13, fontWeight: 700, color: ACCENT, background: c.accentSoft, padding: '7px 16px',
      borderRadius: 100, marginBottom: 24, letterSpacing: '0.01em',
    },
    heroTitle: {
      fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05,
      margin: '0 0 24px 0', color: c.text,
    },
    heroSubtitle: {
      fontSize: 'clamp(16px, 2vw, 20px)', color: c.textMuted, lineHeight: 1.55, maxWidth: 620,
      margin: '0 0 40px 0', fontWeight: 500,
    },
    heroActions: { display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' },
    heroPrimaryBtn: {
      background: ACCENT, color: '#fff', border: 'none', borderRadius: 100, padding: '16px 32px',
      fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, textDecoration: 'none', display: 'inline-flex',
      boxShadow: `0 8px 30px ${ACCENT}40`, transition: 'transform 0.2s ease',
    },
    heroSecondaryBtn: {
      background: 'transparent', color: c.text, border: `1px solid ${c.borderStrong}`, borderRadius: 100,
      padding: '16px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
      transition: 'background 0.2s ease',
    },
    eyebrow: { fontSize: 13, fontWeight: 700, color: ACCENT, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 12px 0' },
    platformsSection: { padding: '80px 32px', borderTop: `1px solid ${c.border}`, transition: 'border-color 0.5s ease' },
    platformsInner: (v) => ({
      maxWidth: 1000, margin: '0 auto', textAlign: 'center',
      opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(24px)',
      transition: 'opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)',
    }),
    platformsRow: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 8 },
    platformsNote: { marginTop: 28, fontSize: 14, color: c.textFaint, fontWeight: 500 },
    platformsNoteLink: { color: ACCENT, fontWeight: 700, cursor: 'pointer' },
    whySection: { padding: '40px 32px 100px', borderTop: `1px solid ${c.border}`, transition: 'border-color 0.5s ease' },
    whyInner: { maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 },
    statBar: { maxWidth: 1080, margin: '32px auto 0' },
    statInner: {
      background: `linear-gradient(135deg, ${ACCENT}14, transparent)`, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '28px 32px', display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap',
    },
    statNumber: { fontSize: 36, fontWeight: 800, color: ACCENT, letterSpacing: '-0.02em', flexShrink: 0 },
    statLabel: { fontSize: 14.5, color: c.textMuted, fontWeight: 500, lineHeight: 1.5, maxWidth: 640 },
    pricingSection: { padding: '100px 32px', borderTop: `1px solid ${c.border}`, transition: 'border-color 0.5s ease' },
    pricingHeader: { maxWidth: 640, margin: '0 auto 56px', textAlign: 'center' },
    sectionTitle: { fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px 0', color: c.text },
    sectionSubtitle: { fontSize: 16, color: c.textMuted, fontWeight: 500, margin: 0 },
    pricingGrid: { maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 },
    popularBadge: {
      position: 'absolute', top: -13, left: 28, background: ACCENT, color: '#fff', fontSize: 12, fontWeight: 800,
      padding: '5px 14px', borderRadius: 100, letterSpacing: '0.02em',
    },
    faqSection: { padding: '100px 32px 120px', borderTop: `1px solid ${c.border}`, transition: 'border-color 0.5s ease' },
    faqInner: { maxWidth: 760, margin: '0 auto' },
    faqHeader: { textAlign: 'center', marginBottom: 48 },
    faqList: (v) => ({
      display: 'flex', flexDirection: 'column', gap: 12,
      opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(24px)',
      transition: 'opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)',
    }),
    footer: { borderTop: `1px solid ${c.border}`, padding: '48px 32px', transition: 'border-color 0.5s ease' },
    footerInner: { maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' },
    footerTagline: { fontSize: 14, color: c.textMuted, fontWeight: 500, margin: '4px 0 0 0' },
    footerCopy: { fontSize: 13, color: c.textFaint, fontWeight: 500, margin: '16px 0 0 0' },
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logoRow}>
            <img src={A("logo.png")} alt="AdverSolutions" style={styles.logoImg} />
          </div>
          <div style={styles.navLinksRow}>
            <span style={styles.navLink} onClick={() => scrollTo('platforms')}>Platforms</span>
            <a href="#/products" style={{ ...styles.navLink, textDecoration: 'none' }}>Products</a>
            <span style={styles.navLink} onClick={() => scrollTo('pricing')}>Pricing</span>
            <span style={styles.navLink} onClick={() => scrollTo('faq')}>FAQ</span>
            {authLoginHref ? (
              <a href={authLoginHref} style={styles.navLoginLink}>Log in</a>
            ) : (
              <button style={styles.navLoginLink} onClick={onNavigateLogin}>Log in</button>
            )}
            <button style={styles.themeTrack} onClick={toggleTheme} aria-label="Toggle theme">
              <div style={styles.themeKnob} />
            </button>
            {authSignupHref ? (
              <a href={authSignupHref} style={styles.navCta}>Get Started</a>
            ) : (
              <button style={styles.navCta} onClick={goSignup}>Get Started</button>
            )}
          </div>
        </div>
      </nav>

      <section style={styles.heroSection}>
        <div style={styles.heroOrbA} />
        <div style={styles.heroOrbB} />
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>Premium Agency Ad Accounts</div>
          <h1 style={styles.heroTitle}>Scale further.<br />Spend smarter.</h1>
          <p style={styles.heroSubtitle}>
            Verified agency ad accounts for Meta, Google, TikTok, Snapchat, and Bing — built for media buyers
            who need stability, speed, and scale.
          </p>
          <div style={styles.heroActions}>
            {authSignupHref ? (
              <a href={authSignupHref} style={styles.heroPrimaryBtn}>Get Started</a>
            ) : (
              <button style={styles.heroPrimaryBtn} onClick={goSignup}>Get Started</button>
            )}
            <button style={styles.heroSecondaryBtn} onClick={() => scrollTo('platforms')}>View Platforms</button>
          </div>
        </div>
      </section>

      <section ref={setRef('platforms')} style={styles.platformsSection}>
        <div style={styles.platformsInner(visible('platforms'))}>
          <p style={styles.eyebrow}>Supported Platforms</p>
          <div style={styles.platformsRow}>
            {PLATFORM_DEFS.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 20px 8px 8px',
                  borderRadius: 100, border: `1px solid ${c.border}`, background: c.surface,
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, overflow: 'hidden', boxShadow: `inset 0 0 0 1px ${c.border}`,
                }}>
                  <img src={A(p.icon)} alt={p.name} style={{ width: '68%', height: '68%', objectFit: 'contain' }} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>{p.name}</span>
              </div>
            ))}
          </div>
          <p style={styles.platformsNote}>
            Looking for Snapchat or Bing accounts? <span style={styles.platformsNoteLink}>Contact us for custom pricing.</span>
          </p>
        </div>
      </section>

      <section ref={setRef('why')} style={styles.whySection}>
        <div style={styles.whyInner}>
          {WHY_DEFS.map((w, i) => (
            <div
              key={w.title}
              style={{
                padding: 28, borderRadius: 20, background: c.surface, border: `1px solid ${c.border}`,
                opacity: visible('why') ? 1 : 0, transform: visible('why') ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${i * 0.1}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${i * 0.1}s`,
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 4, background: ACCENT, marginBottom: 18, transform: 'rotate(45deg)' }} />
              <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', margin: '0 0 8px 0', color: c.text }}>{w.title}</h3>
              <p style={{ fontSize: 14.5, color: c.textMuted, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{w.desc}</p>
            </div>
          ))}
        </div>
        <div style={styles.statBar}>
          <div style={styles.statInner}>
            <span style={styles.statNumber}>15&ndash;25%</span>
            <span style={styles.statLabel}>
              of monthly ad spend recovered through improved ROAS and reduced waste, on average, across agency accounts.
            </span>
          </div>
        </div>
      </section>

      <section ref={setRef('pricing')} style={styles.pricingSection}>
        <div style={styles.pricingHeader}>
          <p style={styles.eyebrow}>Pricing</p>
          <h2 style={styles.sectionTitle}>One account away from scale.</h2>
          <p style={styles.sectionSubtitle}>Transparent, per-account pricing. No hidden fees.</p>
        </div>
        <div style={styles.pricingGrid}>
          {TIER_DEFS.map((t, i) => (
            <div
              key={t.name}
              style={{
                position: 'relative', padding: 32, borderRadius: 24,
                background: c.surface,
                border: t.popular ? `2px solid ${ACCENT}` : `1px solid ${c.border}`,
                boxShadow: t.popular ? `0 20px 50px ${ACCENT}22` : 'none',
                display: 'flex', flexDirection: 'column',
                opacity: visible('pricing') ? 1 : 0, transform: visible('pricing') ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${i * 0.1}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${i * 0.1}s`,
              }}
            >
              {t.popular && <div style={styles.popularBadge}>Most Popular</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <img src={A(t.icon)} alt={t.name} style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                <h3 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em', margin: 0, color: c.text }}>{t.name}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em', color: c.text }}>${t.price}</span>
                <span style={{ fontSize: 14, color: c.textMuted, fontWeight: 600 }}>/ account</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <span style={{ fontSize: 13, color: c.textFaint, fontWeight: 600 }}>${t.minTopup} min topup</span>
                <span style={{ fontSize: 13, color: c.textFaint }}>&middot;</span>
                <span style={{ fontSize: 13, color: c.textFaint, fontWeight: 600 }}>{t.fee} topup fee</span>
              </div>
              <div style={{ height: 1, background: c.border, margin: '0 0 24px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 28, flex: 1 }}>
                {t.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', background: c.accentSoft, position: 'relative',
                      flexShrink: 0, boxShadow: `inset 0 0 0 1px ${ACCENT}55`,
                    }} />
                    <span style={{ fontSize: 14.5, color: c.textMuted, fontWeight: 600 }}>{f}</span>
                  </div>
                ))}
              </div>
              {authSignupHref ? (
                <a
                  href={authSignupHref}
                  style={{
                    background: t.popular ? ACCENT : 'transparent', color: t.popular ? '#fff' : c.text,
                    border: t.popular ? 'none' : `1px solid ${c.borderStrong}`, borderRadius: 100, padding: '14px 20px',
                    fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, transition: 'transform 0.2s ease',
                    textDecoration: 'none', textAlign: 'center',
                  }}
                >
                  Order {t.name}
                </a>
              ) : (
                <button
                  style={{
                    background: t.popular ? ACCENT : 'transparent', color: t.popular ? '#fff' : c.text,
                    border: t.popular ? 'none' : `1px solid ${c.borderStrong}`, borderRadius: 100, padding: '14px 20px',
                    fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, transition: 'transform 0.2s ease',
                  }}
                  onClick={goSignup}
                >
                  Order {t.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section ref={setRef('faq')} style={styles.faqSection}>
        <div style={styles.faqInner}>
          <div style={styles.faqHeader}>
            <p style={styles.eyebrow}>FAQ</p>
            <h2 style={styles.sectionTitle}>Questions, answered.</h2>
          </div>
          <div style={styles.faqList(visible('faq'))}>
            {FAQ_DEFS.map((q, i) => {
              const open = openFaq === i;
              return (
                <div key={q.question} style={{ borderRadius: 16, border: `1px solid ${c.border}`, background: c.surface, overflow: 'hidden' }}>
                  <button
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                      padding: '20px 22px', background: 'transparent', border: 'none', cursor: 'pointer',
                      textAlign: 'left', fontFamily: FONT,
                    }}
                    onClick={() => toggleFaq(i)}
                  >
                    <span style={{ fontSize: 15.5, fontWeight: 700, color: c.text }}>{q.question}</span>
                    <div style={{ position: 'relative', width: 18, height: 18, flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: '50%', left: 0, width: 18, height: 2, background: c.textMuted, transform: 'translateY(-50%)' }} />
                      <div style={{
                        position: 'absolute', top: 0, left: '50%', width: 2, height: 18, background: c.textMuted,
                        transform: open ? 'translateX(-50%) rotate(90deg)' : 'translateX(-50%) rotate(0deg)',
                        opacity: open ? 0 : 1, transition: 'transform 0.25s ease, opacity 0.25s ease',
                      }} />
                    </div>
                  </button>
                  <div style={{
                    maxHeight: open ? 240 : 0, opacity: open ? 1 : 0, overflow: 'hidden',
                    transition: 'max-height 0.35s cubic-bezier(.4,0,.2,1), opacity 0.3s ease',
                  }}>
                    <p style={{ fontSize: 14.5, color: c.textMuted, lineHeight: 1.65, margin: '0 22px 20px', fontWeight: 500 }}>{q.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={A("logo.png")} alt="AdverSolutions" style={styles.logoImg} />
          </div>
          <p style={styles.footerTagline}>Premium agency ad accounts for Meta, Google, TikTok, Snapchat, and Bing.</p>
          <a href="https://policy.adversolutions.agency/" style={{ fontSize: 13, color: c.textMuted, fontWeight: 600, textDecoration: 'none' }}>Policy</a>
          <p style={styles.footerCopy}>&copy; 2026 AdverSolutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
