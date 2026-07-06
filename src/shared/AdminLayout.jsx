import { usePath, useNavigate } from './Router.jsx'
import { C, getThemeColors } from './theme.js'
import { Logo } from './UI.jsx'
import { useTheme } from './ThemeContext.jsx'
import { useStore } from './store.js'
import { useState, useRef, useEffect } from 'react'
import { USER_PAGES, hasPageAccess } from './permissions.js'
import {
  LayoutDashboard, Monitor, ShieldCheck, ShoppingBag,
  ClipboardList, Wallet, MessageCircle, Layers,
  Users, Package, Building2, FileText, ArrowDownToLine,
  BarChart2, Settings, Smartphone, Sun, Moon, Bell,
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
]

export function Sidebar({ role, logout, userId }) {
  const currentPath = usePath()
  const navigate = useNavigate()
  const baseItems = role === 'admin' ? ADMIN_NAV : USER_NAV
  const items = role === 'admin'
    ? baseItems
    : baseItems.filter(item => {
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
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <Logo size="sm" />
        {role && role !== 'user' && (
          <div style={{
            marginTop: 10,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: role === 'admin' ? 'rgba(232,25,44,.15)' : role === 'advertiser' ? 'rgba(249,115,22,.15)' : 'rgba(59,130,246,.15)',
            border: `1px solid ${role === 'admin' ? 'rgba(232,25,44,.3)' : role === 'advertiser' ? 'rgba(249,115,22,.3)' : 'rgba(59,130,246,.3)'}`,
            borderRadius: 20, padding: '3px 10px',
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: role === 'admin' ? C.primary : role === 'advertiser' ? C.orange : C.blue }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: role === 'admin' ? C.primary : role === 'advertiser' ? C.orange : C.blue, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{role}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {items.map(item => {
          const active = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))
          const { Icon } = item
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 11px', borderRadius: 9,
                cursor: 'pointer', margin: '1px 0',
                background: active ? 'rgba(232,25,44,.14)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,.48)',
                fontWeight: active ? 700 : 500,
                fontSize: 14,
                fontFamily: F,
                transition: 'all .15s',
                borderLeft: `3px solid ${active ? C.primary : 'transparent'}`,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? '#fff' : 'rgba(255,255,255,.48)' }}
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
      <div style={{ padding: '0 8px 12px' }}>
        <div style={{
          background: 'rgba(232,25,44,.08)', border: '1px solid rgba(232,25,44,.18)',
          borderRadius: 12, padding: '14px 13px', marginBottom: 8,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 3, fontFamily: F }}>Need help?</div>
          <div style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,.38)', marginBottom: 10, lineHeight: 1.4, fontFamily: F }}>
            Support team available 24/7
          </div>
          <button
            onClick={() => navigate('/support')}
            style={{
              width: '100%', background: 'rgba(255,255,255,.07)',
              color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 8, padding: '7px 0',
              fontSize: 12, fontWeight: 600, fontFamily: F,
              cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.13)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)' }}
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

export function TopBar({ role, user, balance }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
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
      {role !== 'admin' && (
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
      )}

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
  )
}
