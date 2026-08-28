import { useEffect, useState } from 'react';
import { Icon } from './Icon.jsx';
import { useAuth } from './AuthContext.jsx';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', group: 'Workspace', hash: '#/dashboard' },
  { id: 'agency-ad-accounts', label: 'Agency Ad Accounts', icon: 'building', group: 'Workspace', hash: '#/agency-ad-accounts' },
  { id: 'preverified-accounts', label: 'Pre-Verified Accounts', icon: 'shield', group: 'Workspace', hash: '#/preverified-accounts', badge: 'HOT' },
  { id: 'orders', label: 'Orders', icon: 'clipboard', group: 'Workspace', hash: '#/orders' },
  { id: 'balance', label: 'Balance', icon: 'wallet', group: 'Workspace', hash: '#/balance' },
  { id: 'support', label: 'Support', icon: 'chat', group: 'Account', hash: '#/support' },
  { id: 'structure-builder', label: 'Structure Builder', icon: 'layers', group: 'Account', hash: '#/structure-builder' },
  { id: 'saved-structures', label: 'Saved Structures', icon: 'bookmark', group: 'Account', hash: '#/saved-structures' },
  { id: 'phone-verifications', label: 'Phone Verifications', icon: 'phone', group: 'Account', hash: '#/phone-verifications' },
];

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export function Sidebar({ active }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );
  const [branding, setBranding] = useState(() => window.__platformBranding || null);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth < 1024) setCollapsed(true); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    // Fast path: already loaded by PlatformBranding in App.jsx
    if (window.__platformBranding) {
      setBranding(window.__platformBranding);
      return;
    }
    // Event path: PlatformBranding fires this after its fetch completes
    const onBranding = () => setBranding(window.__platformBranding || null);
    window.addEventListener('platform-branding-loaded', onBranding);
    // Fallback: fetch directly in case the event was missed
    fetch('/api/admin/platform-settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const b = { site_name: d.site_name, site_logo: d.site_logo };
        window.__platformBranding = b;
        setBranding(b);
      })
      .catch(() => {});
    return () => window.removeEventListener('platform-branding-loaded', onBranding);
  }, []);

  const groups = [];
  NAV.forEach((item) => {
    let g = groups.find((x) => x.name === item.group);
    if (!g) { g = { name: item.group, items: [] }; groups.push(g); }
    g.items.push(item);
  });

  return (
    <aside className={'sidebar' + (collapsed ? ' sidebar--collapsed' : '')}>
      <div className="sidebar__logo">
        {branding?.site_logo
          ? <img src={branding.site_logo} alt="logo" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6, flexShrink: 0 }} />
          : <div className="sidebar__logo-mark" aria-hidden="true">A</div>
        }
        {!collapsed && (
          <div className="sidebar__logo-text">
            Adver<small>Solutions</small>
          </div>
        )}
        <button
          className="sidebar__collapse"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((v) => !v)}
        >
          <Icon name={collapsed ? 'arrow-right' : 'x'} size={13} />
        </button>
      </div>

      {!collapsed && (
        <a href="#/search" className="sidebar__search" onClick={(e) => e.preventDefault()}>
          <Icon name="search" size={14} />
          <span>Search…</span>
          <kbd>⌘K</kbd>
        </a>
      )}

      {groups.map((g) => (
        <div key={g.name}>
          {!collapsed && <div className="sidebar__group">{g.name}</div>}
          <nav className="sidebar__nav">
            {g.items.map((item) => (
              <a
                key={item.id}
                href={item.hash}
                className={'sidebar__item' + (active === item.id ? ' sidebar__item--active' : '')}
                title={collapsed ? item.label : undefined}
              >
                <Icon name={item.icon} size={16} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="sidebar__badge sidebar__badge--hot">{item.badge}</span>
                )}
              </a>
            ))}
          </nav>
        </div>
      ))}

      <div className="sidebar__bottom">
        {!collapsed && (
          <div className="sidebar__help">
            <h4>Need an account fast?</h4>
            <p>Skip the queue with a pre-verified account.</p>
            <a className="sidebar__help-btn" href="#/preverified-accounts">
              Browse inventory <Icon name="arrow-right" size={12} />
            </a>
          </div>
        )}

        <div className="sidebar__user" title={user?.email}>
          <div className="sidebar__user-avatar">{initials(user?.name || user?.email)}</div>
          {!collapsed && (
            <>
              <div className="sidebar__user-info">
                <div className="sidebar__user-name">{user?.name || user?.email || 'Account'}</div>
                <div className="sidebar__user-email">{user?.email}</div>
              </div>
              <button onClick={logout} className="sidebar__user-action" aria-label="Log out" title="Log out">
                <Icon name="log-out" size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

export { NAV };
