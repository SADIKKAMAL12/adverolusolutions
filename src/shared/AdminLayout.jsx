import { usePath, useNavigate } from './Router.jsx'
import { C, getThemeColors } from './theme.js'
import { getAdminTheme, BRAND, BRAND_LIGHT, FONT as ADMIN_FONT } from './adminTheme.jsx'
import { Logo } from './UI.jsx'
import { useTheme } from './ThemeContext.jsx'
import { useStore } from './store.js'
import { useState, useRef, useEffect } from 'react'
import { USER_PAGES, hasPageAccess } from './permissions.js'
import {
  LayoutDashboard, Monitor, ShieldCheck, ShoppingBag,
  ClipboardList, Wallet, MessageCircle, Layers,
  Users, Package, Building2, FileText, ArrowDownToLine,
  BarChart2, Settings, Smartphone, Sun, Moon, Bell, ChevronRight, LogOut, Palette,
} from 'lucide-react'

const F = "'Plus Jakarta Sans','Inter',sans-serif"

const USER_NAV = [
  { path: "/dashboard",            label: "Dashboard",             Icon: LayoutDashboard  },
  { path: "/agency-ad-accounts",   label: "Agency Ad Accounts",    Icon: Building2        },
  { path: "/preverified-accounts", label: "Pre-Verified Accounts", Icon: ShieldCheck, badge: "HOT" },
  { path: "/orders",               label: "Orders",                Icon: ClipboardList    },
  { path: "/balance",              label: "Balance",               Icon: Wallet           },
  { path: "/support",              label: "Support",               Icon: MessageCircle    },
  { path: "/structure-builder",    label: "Structure Builder",     Icon: Layers           },
  { path: "/phone-verifications", label: "Phone Verifications",  Icon: Smartphone       },
]

const ADMIN_NAV = [
  { path: "/admin",                  label: "Dashboard",             Icon: LayoutDashboard },
  { path: "/admin/users",            label: "Users",                 Icon: Users           },
  { path: "/admin/inventory",        label: "Pre-Verified Accounts", Icon: Package         },
  { path: "/admin/agency-accounts",  label: "Agency Ad Accounts",    Icon: Building2       },
  { path: "/admin/orders",           label: "All Orders",            Icon: FileText        },
  { path: "/admin/deposits",         label: "Deposits",              Icon: ArrowDownToLine },
  { path: "/admin/tickets",          label: "Support Tickets",       Icon: MessageCircle   },
  { path: "/admin/reports",          label: "Reports",               Icon: BarChart2       },
  { path: "/admin/policies",         label: "Policy Management",     Icon: Monitor         },
  { path: "/admin/settings",         label: "System Settings",       Icon: Settings        },
  { path: "/admin/structure-assets", label: "Structure Assets",      Icon: Layers          },
  { path: "/admin/appearance",        label: "Appearance",           Icon: Palette         },
]

function BrandMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg viewBox="0 0 40 40" width="26" height="26">
        <defs>
          <linearGradient id="ad-bm" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ff5d80" />
            <stop offset="1" stopColor="#e2003c" />
          </linearGradient>
        </defs>
        <path d="M20 4 L34 32 H26 L20 18 L14 32 H6 Z" fill="url(#ad-bm)" />
      </svg>
      <span style={{ fontWeight: 800, fontSize: 15, color: '#fff', fontFamily: ADMIN_FONT }}>
        Adver<span style={{ color: '#ff5d80' }}>Solutions</span>
      </span>
    </div>
  )
}

function AdminSidebar({ currentPath, navigate, logout, user }) {
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A'
  return (
    <div style={{
      width: 252, flexShrink: 0,
      background: 'linear-gradient(180deg,#160309,#0a0207 60%)',
      color: '#fff', display: 'flex', flexDirection: 'column',
      padding: '22px 14px', position: 'relative', overflow: 'hidden',
      height: '100%',
    }}>
      <div style={{ position: 'absolute', top: -80, left: -60, width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(255,45,85,0.28), transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', padding: '4px 8px 6px' }}>
        <BrandMark />
      </div>
      <div style={{ position: 'relative', padding: '0 8px 20px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 800, color: BRAND, background: 'rgba(255,45,85,0.14)', border: '1px solid rgba(255,45,85,0.3)', borderRadius: 100, padding: '3px 10px', letterSpacing: '0.06em', fontFamily: ADMIN_FONT }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: BRAND }} />
          ADMIN
        </span>
      </div>

      <nav style={{ position: 'relative', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ADMIN_NAV.map(item => {
          const active = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path))
          const { Icon } = item
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                fontSize: 13.5, fontWeight: active ? 700 : 600,
                fontFamily: ADMIN_FONT,
                color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                background: active ? 'linear-gradient(90deg, rgba(255,45,85,0.24), rgba(255,45,85,0.06))' : 'transparent',
                boxShadow: active ? 'inset 2px 0 0 0 rgba(255,45,85,0.7)' : 'none',
                cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.06)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, lineHeight: 1.3 }}>{item.label}</span>
            </div>
          )
        })}
      </nav>

      <div style={{ position: 'relative', borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', fontFamily: ADMIN_FONT }}>Need help?</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontFamily: ADMIN_FONT }}>Support team available 24/7</div>
        <button
          onClick={() => navigate('/admin/tickets')}
          style={{ marginTop: 10, width: '100%', height: 32, borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: ADMIN_FONT, transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.13)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)' }}
        >
          Contact Support
        </button>
      </div>

      <div
        onClick={logout}
        title="Sign out"
        style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', cursor: 'pointer', borderRadius: 10, transition: 'background .15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 999, background: `linear-gradient(135deg,${BRAND_LIGHT},${BRAND})`, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0, fontFamily: ADMIN_FONT }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', fontFamily: ADMIN_FONT }}>{user?.name || 'Admin'}</div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: ADMIN_FONT }}>{user?.email || ''}</div>
        </div>
        <LogOut size={15} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
      </div>
    </div>
  )
}

export function Sidebar({ role, logout, userId, user }) {
  const currentPath = usePath()
  const navigate = useNavigate()
  const isAdmin = role === 'admin'

  if (isAdmin) {
    return <AdminSidebar currentPath={currentPath} navigate={navigate} logout={logout} user={user} />
  }

  const items = USER_NAV.filter(item => {
    const key = item.path.replace(/^\//, '')
    const isControlled = USER_PAGES.some(p => p.key === key)
    if (!isControlled) return true
    return hasPageAccess(userId, key)
  })

  return (
    <div style={{
      width: 232, minWidth: 232,
      background: C.sidebar,
      height: '100%',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ position: 'relative', padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <Logo size="sm" />
      </div>

      {/* Nav */}
      <nav style={{ position: 'relative', flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {items.map(item => {
          const active = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))
          const { Icon } = item
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                cursor: 'pointer', margin: '2px 0',
                background: active ? 'rgba(232,25,44,.14)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,.6)',
                fontWeight: active ? 700 : 500,
                fontSize: 13.5,
                fontFamily: F,
                transition: 'all .15s',
                borderLeft: `3px solid ${active ? C.primary : 'transparent'}`,
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = '#fff' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.6)' } }}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, lineHeight: 1.3 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: C.primary, color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 20, letterSpacing: '0.04em' }}>
                  {item.badge}
                </span>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom CTA */}
      <div style={{ position: 'relative', padding: '0 8px 12px' }}>
        <div style={{
          background: 'rgba(232,25,44,.08)',
          border: '1px solid rgba(232,25,44,.18)',
          borderRadius: 16, padding: '14px 13px', marginBottom: 8,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 3, fontFamily: F }}>Need help?</div>
          <div style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,.5)', marginBottom: 10, lineHeight: 1.4, fontFamily: F }}>
            Support team available 24/7
          </div>
          <button
            onClick={() => navigate('/support')}
            style={{
              width: '100%', background: 'rgba(255,255,255,.06)',
              color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 9, padding: '7px 0',
              fontSize: 12, fontWeight: 600, fontFamily: F,
              cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.13)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)' }}
          >
            Contact Support
          </button>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%', background: 'transparent',
            border: '1px solid rgba(255,255,255,.09)',
            borderRadius: 8, padding: '8px 0',
            fontSize: 12, fontWeight: 500, fontFamily: F,
            color: 'rgba(255,255,255,.3)', cursor: 'pointer', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.18)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.09)' }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function NotificationBell({ balance, TC, isDark }) {
  const [store] = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const notifications = []
  if ((balance || 0) < 20) {
    notifications.push({ id: 'low-balance', title: 'Low Balance', body: `Your balance is $${(balance || 0).toFixed(2)}. Top up to continue.`, color: C.red })
  }
  ;(store.adAccountRequests || []).filter(r => r.status === 'approved' || r.status === 'rejected').forEach(r => {
    notifications.push({
      id: `req-${r.id}`,
      title: `Agency Account ${r.status === 'approved' ? 'Approved' : 'Rejected'}`,
      body: `Your${r.platform ? ' ' + r.platform : ''} account request has been ${r.status}.`,
      color: r.status === 'approved' ? C.green : C.red,
    })
  })

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 38, height: 38,
          background: isDark ? 'rgba(255,255,255,.06)' : TC.g100,
          border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : TC.g200}`,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative', transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.1)' : TC.g200 }}
        onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.06)' : TC.g100 }}
      >
        <Bell size={16} color={TC.g500} strokeWidth={1.8} />
        {notifications.length > 0 && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            minWidth: 16, height: 16,
            background: C.primary, borderRadius: '50%',
            fontSize: 9, fontWeight: 800, fontFamily: F,
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px',
          }}>
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 46, right: 0, width: 320,
          background: TC.card, borderRadius: 14,
          boxShadow: '0 8px 40px rgba(0,0,0,.18)', border: `1px solid ${TC.g200}`,
          zIndex: 999, overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${TC.g200}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: TC.text, fontFamily: F }}>Notifications</span>
            {notifications.length > 0 && (
              <span style={{ background: C.primary, color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20 }}>{notifications.length}</span>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: TC.g400, fontSize: 13, fontWeight: 500, fontFamily: F }}>
              All caught up
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{ padding: '13px 16px', borderBottom: `1px solid ${TC.g100}` }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: n.color, marginBottom: 3, fontFamily: F }}>{n.title}</div>
                <div style={{ fontSize: 13, fontWeight: 400, color: TC.g500, lineHeight: 1.5, fontFamily: F }}>{n.body}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function AdminBell({ badgeCount, adminTheme }) {
  const [store] = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const pendingDeposits = (store.deposits || []).filter(d => d.status === 'pending').length
  const pendingTickets = (store.supportTickets || []).filter(t => t.status === 'open').length
  const notifications = []
  if (pendingDeposits > 0) notifications.push({ id: 'deposits', title: 'Pending Deposits', body: `${pendingDeposits} deposit${pendingDeposits === 1 ? '' : 's'} awaiting review.`, color: BRAND })
  if (pendingTickets > 0) notifications.push({ id: 'tickets', title: 'Open Tickets', body: `${pendingTickets} support ticket${pendingTickets === 1 ? '' : 's'} need attention.`, color: adminTheme.textMuted })

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ position: 'relative', width: 36, height: 36, borderRadius: 10, background: adminTheme.surfaceSunken, border: `1px solid ${adminTheme.border}`, display: 'grid', placeItems: 'center', cursor: 'pointer', color: adminTheme.textMuted }}
      >
        <Bell size={16} strokeWidth={1.7} />
        {notifications.length > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, padding: '0 3px', borderRadius: 999, background: BRAND, color: '#fff', fontSize: 9.5, fontWeight: 800, display: 'grid', placeItems: 'center', fontFamily: ADMIN_FONT }}>
            {notifications.length}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 44, right: 0, width: 300, background: adminTheme.surface, borderRadius: 14, boxShadow: adminTheme.shadowLg, border: `1px solid ${adminTheme.border}`, zIndex: 999, overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: `1px solid ${adminTheme.border}`, fontWeight: 800, fontSize: 13, color: adminTheme.text, fontFamily: ADMIN_FONT }}>
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '26px 16px', textAlign: 'center', color: adminTheme.textFaint, fontSize: 13, fontFamily: ADMIN_FONT }}>All caught up</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${adminTheme.border}` }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: n.color, marginBottom: 3, fontFamily: ADMIN_FONT }}>{n.title}</div>
                <div style={{ fontSize: 12.5, color: adminTheme.textMuted, lineHeight: 1.5, fontFamily: ADMIN_FONT }}>{n.body}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function TopBar({ role, user, balance }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const isAdmin = role === 'admin'
  const currentPath = usePath()

  if (isAdmin) {
    const adminTheme = getAdminTheme(isDark)
    const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A'
    const currentAdminLabel = ADMIN_NAV.find(item =>
      currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path))
    )?.label || 'Dashboard'

    return (
      <div style={{
        height: 68, flexShrink: 0,
        borderBottom: `1px solid ${adminTheme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px',
        background: isDark ? 'rgba(19,19,23,0.7)' : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: adminTheme.textMuted, fontFamily: ADMIN_FONT }}>
          <span>Admin</span>
          <ChevronRight size={13} color={adminTheme.textFaint} />
          <span style={{ color: adminTheme.text, fontWeight: 700 }}>{currentAdminLabel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggleTheme}
            style={{ width: 36, height: 36, borderRadius: 10, background: adminTheme.surfaceSunken, border: `1px solid ${adminTheme.border}`, display: 'grid', placeItems: 'center', cursor: 'pointer', color: adminTheme.textMuted }}
          >
            {isDark ? <Sun size={15} strokeWidth={1.7} /> : <Moon size={15} strokeWidth={1.7} />}
          </button>
          <AdminBell adminTheme={adminTheme} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: `linear-gradient(135deg,${BRAND_LIGHT},${BRAND})`, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12.5, color: '#fff', fontFamily: ADMIN_FONT }}>{initials}</div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: adminTheme.text, fontFamily: ADMIN_FONT }}>{user?.name || 'Admin'}</div>
              <div style={{ fontSize: 10.5, color: adminTheme.textFaint, fontFamily: ADMIN_FONT }}>{user?.email || ''}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const TC = getThemeColors(isDark)
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || '?'

  return (
    <div style={{
      height: 60,
      background: TC.topbar,
      borderBottom: `1px solid ${TC.g200}`,
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '0 24px', gap: 10, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: isDark ? 'rgba(255,51,68,.12)' : '#fef2f3',
          border: '1px solid rgba(232,25,44,.2)',
          borderRadius: 10, padding: '6px 14px',
        }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: TC.g500, fontFamily: F }}>Balance</span>
          <span style={{
            fontSize: 14, fontWeight: 800, color: C.primary,
            fontFamily: F, fontVariantNumeric: 'tabular-nums',
          }}>
            ${(balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light' : 'Switch to dark'}
          style={{
            width: 38, height: 38, borderRadius: 10,
            border: `1px solid ${TC.g200}`,
            background: isDark ? 'rgba(255,255,255,.06)' : TC.g100,
            color: TC.g600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.1)' : TC.g200 }}
          onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.06)' : TC.g100 }}
        >
          {isDark ? <Sun size={15} strokeWidth={1.8} /> : <Moon size={15} strokeWidth={1.8} />}
        </button>

        <NotificationBell balance={balance} TC={TC} isDark={isDark} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 36, height: 36,
            background: `linear-gradient(135deg, ${C.primary}, #ff6b7a)`,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: F,
            flexShrink: 0, letterSpacing: '0.02em',
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: TC.text, fontFamily: F, lineHeight: 1.2 }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: 11, fontWeight: 400, color: TC.g400, fontFamily: F }}>{user?.email || ''}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
