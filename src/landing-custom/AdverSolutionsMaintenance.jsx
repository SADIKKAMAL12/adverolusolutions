import React, { useState, useEffect } from 'react';

const ACCENT = '#ff2d55';
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

const FONT_LINK_ID = 'adversolutions-manrope-font';
const KEYFRAMES_ID = 'adversolutions-maintenance-keyframes';

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

export default function AdverSolutionsMaintenance({ assetsPath = "/assets" }) {
  useInjectedGlobalStyles();
  const A = (name) => `${assetsPath.replace(/\/$/, "")}/${name}`;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  const c = {
    bg: '#09090b', text: '#f5f5f7', textMuted: '#9a9aa2',
    accentSoft: 'rgba(255,45,85,0.14)',
  };

  const styles = {
    page: {
      position: 'relative', background: c.bg, color: c.text, fontFamily: FONT,
      minHeight: '100vh', overflow: 'hidden', display: 'flex',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32,
    },
    orbA: {
      position: 'absolute', width: 560, height: 560, borderRadius: '50%', top: -200, left: '6%',
      background: `radial-gradient(circle, ${ACCENT}33, transparent 70%)`, filter: 'blur(20px)',
      animation: 'floatA 14s ease-in-out infinite', pointerEvents: 'none',
    },
    orbB: {
      position: 'absolute', width: 480, height: 480, borderRadius: '50%', bottom: -220, right: '4%',
      background: `radial-gradient(circle, ${ACCENT}22, transparent 70%)`, filter: 'blur(24px)',
      animation: 'floatB 16s ease-in-out infinite', pointerEvents: 'none',
    },
    content: {
      position: 'relative', maxWidth: 640, display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(18px)',
      transition: 'opacity 0.9s cubic-bezier(.16,1,.3,1), transform 0.9s cubic-bezier(.16,1,.3,1)',
    },
    logoImg: { height: 34, width: 'auto', display: 'block', marginBottom: 40 },
    badge: {
      fontSize: 13, fontWeight: 700, color: ACCENT, background: c.accentSoft, padding: '7px 16px',
      borderRadius: 100, marginBottom: 24, letterSpacing: '0.01em',
    },
    title: {
      fontSize: 'clamp(36px, 5.5vw, 64px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08,
      margin: '0 0 20px 0', color: c.text,
    },
    subtitle: {
      fontSize: 'clamp(15px, 1.6vw, 18px)', color: c.textMuted, lineHeight: 1.6, maxWidth: 480,
      margin: 0, fontWeight: 500,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.orbA} />
      <div style={styles.orbB} />
      <div style={styles.content}>
        <img src={A("logo.png")} alt="AdverSolutions" style={styles.logoImg} />
        <div style={styles.badge}>Under Maintenance</div>
        <h1 style={styles.title}>We'll be right back.</h1>
        <p style={styles.subtitle}>
          AdverSolutions is undergoing scheduled maintenance to make your agency ad accounts even more reliable.
          Thanks for your patience.
        </p>
      </div>
    </div>
  );
}
