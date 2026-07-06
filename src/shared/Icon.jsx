export function Icon({ name, size = 16, stroke = 1.6, className = '', style }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    style,
  };
  switch (name) {
    case 'grid':
      return (<svg {...props}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>);
    case 'building':
      return (<svg {...props}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" /><path d="M10 21v-3h4v3" /></svg>);
    case 'shield':
      return (<svg {...props}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>);
    case 'clipboard':
      return (<svg {...props}><rect x="6" y="4" width="12" height="17" rx="2" /><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>);
    case 'wallet':
      return (<svg {...props}><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" /><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-3" /><path d="M21 11v5h-5a2.5 2.5 0 0 1 0-5h5Z" /></svg>);
    case 'chat':
      return (<svg {...props}><path d="M21 12a8 8 0 1 1-3-6.2L21 5l-.5 3.4A8 8 0 0 1 21 12Z" /><path d="M8 11h.01M12 11h.01M16 11h.01" /></svg>);
    case 'layers':
      return (<svg {...props}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /><path d="m3 17 9 5 9-5" /></svg>);
    case 'search':
      return (<svg {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
    case 'bell':
      return (<svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>);
    case 'moon':
      return (<svg {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>);
    case 'sun':
      return (<svg {...props}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></svg>);
    case 'plus':
      return (<svg {...props}><path d="M12 5v14M5 12h14" /></svg>);
    case 'arrow-right':
      return (<svg {...props}><path d="M5 12h14M13 5l7 7-7 7" /></svg>);
    case 'arrow-up-right':
      return (<svg {...props}><path d="M7 17 17 7M9 7h8v8" /></svg>);
    case 'arrow-up':
      return (<svg {...props}><path d="M12 19V5M5 12l7-7 7 7" /></svg>);
    case 'arrow-down':
      return (<svg {...props}><path d="M12 5v14M19 12l-7 7-7-7" /></svg>);
    case 'trend-up':
      return (<svg {...props}><path d="m3 17 6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>);
    case 'export':
      return (<svg {...props}><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" /></svg>);
    case 'check':
      return (<svg {...props}><path d="m5 12 5 5L20 7" /></svg>);
    case 'x':
      return (<svg {...props}><path d="M6 6l12 12M18 6 6 18" /></svg>);
    case 'filter':
      return (<svg {...props}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" /></svg>);
    case 'card':
      return (<svg {...props}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></svg>);
    case 'clock':
      return (<svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
    case 'users':
      return (<svg {...props}><circle cx="9" cy="8" r="3.5" /><path d="M2 21c0-3.5 3.2-6 7-6s7 2.5 7 6" /><circle cx="17" cy="8" r="2.5" /><path d="M22 19c0-2.5-2-4-4-4" /></svg>);
    case 'monitor':
      return (<svg {...props}><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>);
    case 'send':
      return (<svg {...props}><path d="m22 2-11 11M22 2l-6 19-5-10-9-5 20-4Z" /></svg>);
    case 'headphones':
      return (<svg {...props}><path d="M3 14v-2a9 9 0 0 1 18 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></svg>);
    case 'phone':
      return (<svg {...props}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.5a2 2 0 0 1-.5 1.9L8 9.4a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 1.9-.5l2.5.5A2 2 0 0 1 22 16.9Z" /></svg>);
    case 'mail':
      return (<svg {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 7 9-7" /></svg>);
    case 'package':
      return (<svg {...props}><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z" /><path d="M3 8 12 13 21 8" /><path d="M12 13v9" /></svg>);
    case 'settings':
      return (<svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>);
    case 'log-out':
      return (<svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>);
    case 'upload':
      return (<svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 9 5-5 5 5" /><path d="M12 4v12" /></svg>);
    case 'tiktok':
      return (<svg viewBox="0 0 24 24" width={size} height={size}><path fill="currentColor" d="M16.2 2h-3v13.5a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V9.8a5.7 5.7 0 1 0 4.9 5.7V8.6a7.5 7.5 0 0 0 4.3 1.3V6.8a4.4 4.4 0 0 1-4.3-4.8Z" /></svg>);
    case 'snapchat':
      return (<svg viewBox="0 0 24 24" width={size} height={size}><path fill="#FFFC00" stroke="#0e0e10" strokeWidth="0.8" d="M12 2c3.6 0 5.4 2.7 5.4 5.4v3.2c.2.1.5.2.7.2.4 0 .7-.3 1-.3.4 0 1 .2 1 .8 0 .7-1.5.9-2 1.2-.3.2 1 2.7 3 3.1.4 0 .4.6 0 .9-.6.5-1.6.6-2 .8-.2.1-.1.6-.3.9-.1.2-.4.2-.8.2-.6 0-1.5-.2-2.4.1-.9.3-1.7 1.7-3.6 1.7s-2.7-1.4-3.6-1.7c-.9-.3-1.8-.1-2.4-.1-.4 0-.7 0-.8-.2-.2-.3-.1-.8-.3-.9-.4-.2-1.4-.3-2-.8-.4-.3-.4-.9 0-.9 2-.4 3.3-2.9 3-3.1-.5-.3-2-.5-2-1.2 0-.6.6-.8 1-.8.3 0 .6.3 1 .3.2 0 .5-.1.7-.2V7.4C6.6 4.7 8.4 2 12 2Z" /></svg>);
    default:
      return null;
  }
}

export function PlatformIcon({ platform, size = 32, logo }) {
  if (logo && (logo.startsWith('data:') || logo.startsWith('http'))) {
    return (
      <div className="platform-icon" style={{ width: size, height: size, background: 'var(--bg-card)', borderRadius: '30%', overflow: 'hidden', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <img src={logo} alt={platform || ''} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    );
  }
  const lower = (platform || '').toLowerCase();
  let cls = 'platform-icon';
  let inner = null;
  if (lower.includes('meta') || lower.includes('facebook')) {
    cls += ' platform-icon--meta';
    inner = 'f';
  } else if (lower.includes('google')) {
    cls += ' platform-icon--google';
    inner = 'G';
  } else if (lower.includes('tiktok')) {
    return (<div className="platform-icon platform-icon--tiktok" style={{ width: size, height: size, color: 'white' }}><Icon name="tiktok" size={size * 0.55} /></div>);
  } else if (lower.includes('snap')) {
    return (<div className="platform-icon platform-icon--snap" style={{ width: size, height: size }}><Icon name="snapchat" size={size * 0.55} /></div>);
  } else {
    inner = (platform || '?').slice(0, 1).toUpperCase();
  }
  return (<div className={cls} style={{ width: size, height: size }}>{inner}</div>);
}
