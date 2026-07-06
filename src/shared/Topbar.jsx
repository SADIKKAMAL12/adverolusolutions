import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon.jsx';
import { useStore, setStore } from './store.js';
import { fmtMoney } from './UI.jsx';
import { useNotifications, NotificationsPanel } from './NotificationsPanel.jsx';

export function Topbar({ crumbs = [] }) {
  const [store] = useStore();
  const [panelOpen, setPanelOpen] = useState(false);
  const { notifs, unreadCount, markAllRead, clearAll } = useNotifications();

  useEffect(() => {
    document.documentElement.dataset.theme = store.theme;
    try { localStorage.setItem('adver_theme', store.theme); } catch (_) {}
  }, [store.theme]);

  const toggleTheme = () => {
    setStore((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
  };

  const handleBellClick = () => {
    if (panelOpen) {
      setPanelOpen(false);
    } else {
      setPanelOpen(true);
      if (unreadCount > 0) markAllRead();
    }
  };

  return (
    <header className="topbar">
      <div className="topbar__crumbs">
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: i === crumbs.length - 1 ? 'var(--ink)' : 'var(--muted)', fontWeight: i === crumbs.length - 1 ? 500 : 400 }}>
              {c}
            </span>
            {i < crumbs.length - 1 && <span style={{ color: 'var(--muted-2)' }}>/</span>}
          </span>
        ))}
      </div>
      <div className="topbar__spacer" />

      <div className="topbar__balance" title="Available balance">
        <div className="topbar__balance-dot">
          <Icon name="wallet" size={12} stroke={2} />
        </div>
        <div>
          <div className="topbar__balance-label">Balance</div>
          <div className="topbar__balance-value">{fmtMoney(store.balance)}</div>
        </div>
      </div>

      <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
        <Icon name={store.theme === 'dark' ? 'sun' : 'moon'} size={16} />
      </button>

      {/* Notification bell with dropdown panel */}
      <div style={{ position: 'relative' }}>
        <button
          className="icon-btn"
          title="Notifications"
          aria-label="Notifications"
          onClick={handleBellClick}
          style={{ position: 'relative' }}
        >
          <Icon name="bell" size={16} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -5, right: -5,
              minWidth: 17, height: 17,
              borderRadius: 99,
              background: '#ef4444',
              border: '2px solid var(--bg-main, var(--bg-card, #fff))',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              lineHeight: '13px',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
              animation: 'notifPulse 2s ease-in-out infinite',
              pointerEvents: 'none',
            }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        {panelOpen && (
          <NotificationsPanel
            notifs={notifs}
            unreadCount={0}
            markAllRead={markAllRead}
            clearAll={clearAll}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>

      <style>{`
        @keyframes notifPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.55; transform: scale(1.4); }
        }
      `}</style>
    </header>
  );
}
