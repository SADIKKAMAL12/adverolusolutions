import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { useAuth } from './AuthContext.jsx';
import { Spinner } from './UI.jsx';

/* ── WhatsApp floating button ─────────────────────────── */
const WA_ANIMATIONS = {
  wiggle_pulse: `
    @keyframes waWave {
      0%,100% { transform: rotate(0deg) scale(1); }
      15%      { transform: rotate(-18deg) scale(1.08); }
      30%      { transform: rotate(14deg) scale(1.08); }
      45%      { transform: rotate(-10deg) scale(1.05); }
      60%      { transform: rotate(7deg) scale(1.05); }
      75%      { transform: rotate(-4deg) scale(1.02); }
    }
    .wa-fab-anim { animation: waPulse 2.4s ease-in-out infinite; }
    .wa-fab-anim svg { animation: waWave 3.2s ease-in-out infinite; }
    .wa-fab-anim:hover { animation: none; }
    .wa-fab-anim:hover svg { animation: none; }
  `,
  bounce: `
    @keyframes waBounce {
      0%,100% { transform: translateY(0); }
      40%      { transform: translateY(-10px); }
      60%      { transform: translateY(-6px); }
    }
    .wa-fab-anim { animation: waBounce 1.8s ease-in-out infinite; }
    .wa-fab-anim:hover { animation: none; }
  `,
  heartbeat: `
    @keyframes waHeart {
      0%,100% { transform: scale(1); }
      14%      { transform: scale(1.15); }
      28%      { transform: scale(1); }
      42%      { transform: scale(1.1); }
      56%      { transform: scale(1); }
    }
    .wa-fab-anim { animation: waHeart 1.6s ease-in-out infinite; }
    .wa-fab-anim:hover { animation: none; }
  `,
  shake_glow: `
    @keyframes waShake {
      0%,100% { transform: translateX(0); }
      15%      { transform: translateX(-6px); }
      30%      { transform: translateX(6px); }
      45%      { transform: translateX(-4px); }
      60%      { transform: translateX(4px); }
      75%      { transform: translateX(-2px); }
      90%      { transform: translateX(2px); }
    }
    .wa-fab-anim { animation: waShake 2.2s ease-in-out infinite; }
    .wa-fab-anim:hover { animation: none; }
  `,
  none: `
    .wa-fab-anim { animation: none; }
  `,
};

const WA_SIZES = { small: 46, medium: 56, large: 68 };
const WA_ICON_SIZES = { small: 22, medium: 30, large: 38 };

function injectWaStyles(animation, color, pulseColor) {
  let el = document.getElementById('wa-btn-styles');
  if (!el) { el = document.createElement('style'); el.id = 'wa-btn-styles'; document.head.appendChild(el); }
  const pulse = `
    @keyframes waPulse {
      0%,100% { box-shadow: 0 0 0 0 ${pulseColor}70; }
      50%      { box-shadow: 0 0 0 12px ${pulseColor}00; }
    }
  `;
  const shakeGlow = animation === 'shake_glow'
    ? `.wa-fab-anim { filter: drop-shadow(0 0 8px ${color}99); }`
    : '';
  el.textContent = pulse + (WA_ANIMATIONS[animation] || WA_ANIMATIONS.wiggle_pulse) + `
    .wa-fab {
      position: fixed;
      bottom: 28px;
      z-index: 9000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      text-decoration: none;
      transition: transform .15s, background .15s;
    }
    .wa-fab:hover { transform: scale(1.12) !important; }
  ` + shakeGlow;
}

function WhatsAppFAB() {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    fetch('/api/admin/platform-settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCfg(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!cfg) return;
    injectWaStyles(cfg.wa_animation || 'wiggle_pulse', cfg.wa_color || '#25d366', cfg.wa_color || '#25d366');
  }, [cfg]);

  if (!cfg) return null;

  const number = (cfg.wa_number || cfg.contact_whatsapp || '').replace(/\D/g, '');
  if (!number || cfg.wa_enabled === false) return null;

  const size = WA_SIZES[cfg.wa_size] || 56;
  const iconSize = WA_ICON_SIZES[cfg.wa_size] || 30;
  const color = cfg.wa_color || '#25d366';
  const pos = cfg.wa_position === 'left' ? { left: 28 } : { right: 28 };

  return (
    <a
      className="wa-fab wa-fab-anim"
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat with us on WhatsApp"
      style={{ width: size, height: size, background: color, ...pos }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M16 2C8.268 2 2 8.268 2 16c0 2.478.664 4.797 1.822 6.79L2 30l7.424-1.782A13.932 13.932 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="#fff"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M16 4.4c-6.4 0-11.6 5.2-11.6 11.6 0 2.24.636 4.324 1.74 6.088l.272.44-1.16 4.224 4.352-1.136.424.252A11.56 11.56 0 0016 27.6c6.4 0 11.6-5.2 11.6-11.6S22.4 4.4 16 4.4zm6.8 16.528c-.272.76-1.588 1.448-2.2 1.536-.56.08-1.268.112-2.044-.128a18.8 18.8 0 01-1.852-.688c-3.256-1.408-5.38-4.696-5.544-4.912-.16-.216-1.304-1.736-1.304-3.312 0-1.576.824-2.352 1.116-2.672.292-.32.636-.4.848-.4.212 0 .424 0 .608.008.2.008.464-.076.728.552.272.648.916 2.24 1 2.4.08.16.132.348.028.56-.104.212-.16.348-.316.536-.16.188-.332.42-.476.564-.16.16-.324.332-.14.652.184.32.82 1.352 1.76 2.192 1.208 1.076 2.228 1.408 2.548 1.568.32.16.504.132.688-.08.184-.212.788-.916 1-.232.212.684 1.304 1.244 1.744 1.468.44.224.728.332.836.52.112.184.112.96-.16 1.748z" fill={color}/>
      </svg>
    </a>
  );
}

export function Layout({ active, crumbs, children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.hash = '#/login';
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <Spinner size={28} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="app">
      <Sidebar active={active} />
      <main className="main">
        <Topbar crumbs={crumbs || []} />
        {children}
      </main>
      <WhatsAppFAB />
    </div>
  );
}
