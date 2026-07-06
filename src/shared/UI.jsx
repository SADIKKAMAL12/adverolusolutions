// Combined UI primitives — exports both user (CSS-class based) and admin (inline-style) components.
// On macOS the filesystem is case-insensitive, so UI.jsx === ui.jsx.

import { Icon } from './Icon.jsx';
import { C, getThemeColors } from './theme.js';
import { useTheme } from './ThemeContext.jsx';

const F = "'Plus Jakarta Sans','Inter',sans-serif";

/* ═══════════════════════════════════════════════════════
   USER-FACING COMPONENTS  (src 7 design — use CSS classes)
   ═══════════════════════════════════════════════════════ */

export function Pill({ tone = 'default', children, dot = true }) {
  const cls = 'pill' + (tone !== 'default' ? ' pill--' + tone : '');
  return (
    <span className={cls}>
      {dot && <span className="pill__dot" />}
      {children}
    </span>
  );
}

export function statusTone(s) {
  return (
    {
      active: 'success', approved: 'success', completed: 'success',
      done: 'success', fulfilled: 'success', resolved: 'success',
      sold: 'success', paid: 'success', available: 'success',
      review: 'info', 'in-review': 'info', 'in-progress': 'info',
      open: 'warn', pending: 'warn', processing: 'warn', 'assets-missing': 'warn',
      rejected: 'danger', failed: 'danger', cancelled: 'danger', banned: 'danger',
    }[String(s || '').toLowerCase()] || 'default'
  );
}

export function StatusPill({ status }) {
  if (!status) return null;
  const label = String(status)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
  return <Pill tone={statusTone(status)}>{label}</Pill>;
}

export function Sparkline({ data = [], color = 'currentColor', width = 120, height = 32, strokeWidth = 1.75, area = true }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const gradId = 'spark-' + Math.random().toString(36).slice(2, 9);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ color }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={areaPath} fill={`url(#${gradId})`} />}
      <path d={linePath} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KPI({ icon, label, value, prefix, delta, deltaTone, footer, spark, sparkColor = 'var(--ink)' }) {
  return (
    <div className="kpi">
      <div className="kpi__head">
        {icon && <div className="kpi__icon"><Icon name={icon} size={15} /></div>}
        <div className="kpi__label">{label}</div>
        {delta != null && (
          <div className={'kpi__delta kpi__delta--' + (deltaTone || 'up')}>
            <Icon name={deltaTone === 'down' ? 'arrow-down' : 'arrow-up'} size={10} stroke={2.5} />
            {delta}
          </div>
        )}
      </div>
      <div className="kpi__value">
        {prefix && <sup>{prefix}</sup>}
        {value}
      </div>
      {spark && spark.length > 1 && <Sparkline data={spark} color={sparkColor} width={260} height={32} />}
      {footer && <div className="kpi__foot">{footer}</div>}
    </div>
  );
}

export function Spinner({ size = 18 }) {
  return (
    <span aria-label="Loading" style={{
      width: size, height: size,
      borderRadius: '50%',
      border: '2px solid var(--line)',
      borderTopColor: 'var(--accent)',
      display: 'inline-block',
      animation: 'adver-spin 0.8s linear infinite',
    }} />
  );
}

export function Skeleton({ height = 16, width = '100%', radius = 6, style }) {
  return (
    <span style={{
      display: 'block', height, width, borderRadius: radius,
      background: 'linear-gradient(90deg, var(--bg-sunken) 0%, color-mix(in srgb, var(--bg-sunken) 50%, var(--bg-card)) 50%, var(--bg-sunken) 100%)',
      backgroundSize: '200% 100%',
      animation: 'adver-shimmer 1.4s ease-in-out infinite',
      ...style,
    }} />
  );
}

export function SkeletonRows({ rows = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 'var(--density-pad)' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Skeleton height={32} width={32} radius={8} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton height={12} width="35%" />
            <Skeleton height={10} width="65%" />
          </div>
          <Skeleton height={20} width={70} radius={6} />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon = 'package', title, description, action }) {
  return (
    <div className="empty">
      <div className="empty__icon"><Icon name={icon} size={22} /></div>
      {title && <h3 className="empty__title">{title}</h3>}
      {description && <p className="empty__sub">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div role="alert" style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '10px 14px', borderRadius: 10,
      background: 'var(--accent-50)',
      border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
      color: 'var(--accent-700)', fontSize: 13,
    }}>
      <Icon name="x" size={14} stroke={2.4} style={{ flex: '0 0 auto', marginTop: 2 }} />
      <div style={{ flex: 1 }}>{message}</div>
      {onDismiss && (
        <button onClick={onDismiss} className="btn btn--ghost btn--sm" style={{ padding: '2px 6px' }} aria-label="Dismiss">
          <Icon name="x" size={12} />
        </button>
      )}
    </div>
  );
}

export function SuccessBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div role="status" style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '10px 14px', borderRadius: 10,
      background: 'var(--success-bg)',
      border: '1px solid color-mix(in srgb, var(--success) 30%, transparent)',
      color: 'var(--success)', fontSize: 13,
    }}>
      <Icon name="check" size={14} stroke={2.4} style={{ flex: '0 0 auto', marginTop: 2 }} />
      <div style={{ flex: 1 }}>{message}</div>
      {onDismiss && (
        <button onClick={onDismiss} className="btn btn--ghost btn--sm" style={{ padding: '2px 6px' }} aria-label="Dismiss">
          <Icon name="x" size={12} />
        </button>
      )}
    </div>
  );
}

export function PageHead({ eyebrow, title, titleAccent, subtitle, actions }) {
  return (
    <div className="page__head">
      <div className="page__head-left">
        {eyebrow && <div className="page__eyebrow">{eyebrow}</div>}
        <h1 className="page__title">
          {title}
          {titleAccent && <>{' '}<span className="serif">{titleAccent}</span></>}
        </h1>
        {subtitle && <p className="page__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page__actions">{actions}</div>}
    </div>
  );
}

export function fmtMoney(n, opts = {}) {
  const { decimals = 2, prefix = '$' } = opts;
  if (n == null || isNaN(n)) return `${prefix}—`;
  return prefix + Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return iso;
  }
}

/* ═══════════════════════════════════════════════════════
   ADMIN COMPONENTS  (inline styles, theme-aware)
   ═══════════════════════════════════════════════════════ */

export function Logo({ size = 'sm' }) {
  const dim = size === 'md' ? 44 : 32;
  const fs = size === 'md' ? 19 : 14;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: F }}>
      <div style={{
        width: dim, height: dim, borderRadius: 10,
        background: C.primary,
        display: 'grid', placeItems: 'center',
        color: '#fff', fontWeight: 800, fontSize: fs,
        letterSpacing: '-0.02em',
        boxShadow: `inset 0 -2px 0 rgba(0,0,0,.2), 0 4px 12px -2px ${C.primary}80`,
        flexShrink: 0,
      }}>A</div>
      {size !== 'sm' && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Adver Solutions</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Agency Dashboard</div>
        </div>
      )}
    </div>
  );
}

export function PageShell({ title, subtitle, breadcrumb, actions = [], children }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ padding: '28px 32px', fontFamily: F, color: TC.text, minHeight: '100%' }}>
      {breadcrumb && <div style={{ fontSize: 12, color: TC.textSecondary, marginBottom: 10 }}>{breadcrumb}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          {title && <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: TC.g800 }}>{title}</h1>}
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13.5, color: TC.textSecondary }}>{subtitle}</p>}
        </div>
        {actions.length > 0 && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Card({ children, style = {}, onClick, className }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div onClick={onClick} className={className} style={{
      background: TC.card, border: `1px solid ${TC.g200}`,
      borderRadius: 14, padding: 18,
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      fontFamily: F, marginBottom: 14,
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Btn({ children, onClick, variant = 'filled', size = 'md', disabled = false, style = {}, type = 'button' }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  const isPrimary = variant === 'filled' || variant === 'primary';
  const isOutline = variant === 'outline' || variant === 'ghost';
  const isDanger = variant === 'danger';
  const sm = size === 'sm';
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: sm ? '6px 12px' : '9px 16px',
    borderRadius: 9, fontSize: sm ? 12 : 13.5,
    fontWeight: 600, fontFamily: F,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    border: '1px solid transparent',
    transition: 'all .15s', whiteSpace: 'nowrap',
  };
  const variantStyle = isDanger
    ? { background: C.red, color: '#fff', borderColor: C.red }
    : isOutline
    ? { background: 'transparent', color: TC.g700, borderColor: TC.g300 }
    : { background: C.primary, color: '#fff', borderColor: C.primary, boxShadow: `0 1px 2px ${C.primary}40, inset 0 -1px 0 rgba(0,0,0,.12)` };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variantStyle, ...style }}>
      {children}
    </button>
  );
}

const STATUS_MAP = {
  active:      { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  approved:    { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  confirmed:   { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  completed:   { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  pending:     { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  reviewing:   { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  'in-review': { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  rejected:    { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  failed:      { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  banned:      { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  inactive:    { bg: '#f3f4f6', color: '#4b5563', dot: '#9ca3af' },
  refunded:    { bg: '#ede9fe', color: '#5b21b6', dot: '#8b5cf6' },
  user:        { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  admin:       { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};

export function Badge({ status, text, tone }) {
  const key = (status || text || tone || '').toLowerCase();
  const s = STATUS_MAP[key] || { bg: '#f3f4f6', color: '#4b5563', dot: '#9ca3af' };
  const label = text || status || tone || '';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      background: s.bg, color: s.color,
      fontSize: 11.5, fontWeight: 600, fontFamily: F, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

export function Input({ label, value, onChange, placeholder, required, type = 'text', style = {}, ...rest }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontFamily: F }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: TC.textSecondary }}>
          {label}{required && <span style={{ color: C.primary }}> *</span>}
        </label>
      )}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${TC.g200}`, background: TC.card, color: TC.text, fontSize: 13.5, fontFamily: F, outline: 'none', boxSizing: 'border-box', ...style }}
        {...rest} />
    </div>
  );
}

export function Select({ label, value, onChange, children, options, required, style = {} }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontFamily: F }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: TC.textSecondary }}>
          {label}{required && <span style={{ color: C.primary }}> *</span>}
        </label>
      )}
      <select value={value} onChange={onChange} required={required}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${TC.g200}`, background: TC.card, color: TC.text, fontSize: 13.5, fontFamily: F, outline: 'none', boxSizing: 'border-box', ...style }}>
        {options
          ? options.map(o => {
              const val = typeof o === 'object' ? o.value : o;
              const lbl = typeof o === 'object' ? o.label : o;
              return <option key={val} value={val}>{lbl}</option>;
            })
          : children}
      </select>
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 4, style = {}, required }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontFamily: F }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: TC.textSecondary }}>
          {label}{required && <span style={{ color: C.primary }}> *</span>}
        </label>
      )}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} required={required}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${TC.g200}`, background: TC.card, color: TC.text, fontSize: 13.5, fontFamily: F, outline: 'none', resize: 'vertical', boxSizing: 'border-box', ...style }} />
    </div>
  );
}

export function DataTable({ cols = [], rows = [], emptyMsg = 'No data found.' }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontFamily: F, fontSize: 13 }}>
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: TC.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase', background: TC.g50, borderBottom: `1px solid ${TC.g200}` }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length} style={{ padding: '40px 16px', textAlign: 'center', color: TC.textSecondary, fontSize: 13 }}>{emptyMsg}</td></tr>
          ) : rows.map((row, ri) => (
            <tr key={ri}
              className="reveal-item"
              style={{ animationDelay: `${ri * 40}ms` }}
              onMouseEnter={e => e.currentTarget.style.background = TC.g50}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {cols.map((c, ci) => (
                <td key={ci} style={{ padding: '12px 16px', borderBottom: `1px solid ${TC.g100}`, color: TC.text, verticalAlign: 'middle' }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ total, showing, pages = [] }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontFamily: F, fontSize: 12.5, color: TC.textSecondary, borderTop: `1px solid ${TC.g200}` }}>
      <span style={{ flex: 1 }}>{total} &middot; Showing {showing}</span>
      {pages.map((p, i) => (
        <button key={i} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${TC.g200}`, background: typeof p === 'number' ? TC.card : 'transparent', color: TC.text, cursor: 'pointer', fontSize: 12, fontFamily: F }}>{p}</button>
      ))}
    </div>
  );
}

export function Modal({ title, onClose, width = 560, children }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: TC.card, borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(0,0,0,.2)', border: `1px solid ${TC.g200}`, fontFamily: F }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${TC.g100}` }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TC.g800 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TC.g400, fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

export function Avatar({ initials = '?', size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, #ff7a3d)`, color: '#fff', fontWeight: 700, fontSize: size * 0.36, display: 'grid', placeItems: 'center', flexShrink: 0, fontFamily: F }}>
      {initials}
    </div>
  );
}

const PLATFORM_STYLES = {
  meta:     { bg: 'linear-gradient(135deg,#0866ff,#5b8def)', color: '#fff', label: 'M' },
  facebook: { bg: 'linear-gradient(135deg,#0866ff,#5b8def)', color: '#fff', label: 'f' },
  google:   { bg: '#fff', color: '#4285f4', label: 'G', border: '1px solid #e5e7eb' },
  tiktok:   { bg: '#0e0e10', color: '#fff', label: 'T' },
  snapchat: { bg: '#fffc00', color: '#0e0e10', label: 'S' },
  snap:     { bg: '#fffc00', color: '#0e0e10', label: 'S' },
};

export function PlatformIcon({ platform, name, size = 32, logo }) {
  const key = (platform || name || '').toLowerCase();
  const s = PLATFORM_STYLES[key] || { bg: '#e5e7eb', color: '#6b7280', label: (key[0] || '?').toUpperCase() };
  if (logo) {
    return (
      <div style={{ width: size, height: size, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
        <img src={logo} alt={key} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.28), background: s.bg, color: s.color, border: s.border, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: Math.round(size * 0.44), flexShrink: 0, fontFamily: F }}>
      {s.label}
    </div>
  );
}

export function StatCard({ icon, label, value, color = C.primary }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ background: TC.card, border: `1px solid ${TC.g200}`, borderRadius: 14, padding: '18px 20px', fontFamily: F }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 12, color: TC.textSecondary, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: TC.g800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

export function StepHeader({ steps = [], current = 0 }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, fontFamily: F }}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? C.primary : active ? C.primary + '22' : TC.g100, border: `2px solid ${done || active ? C.primary : TC.g200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: done ? '#fff' : active ? C.primary : TC.textSecondary }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? C.primary : TC.textSecondary, whiteSpace: 'nowrap' }}>
                {typeof step === 'string' ? step : step.label}
              </span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? C.primary : TC.g200, margin: '0 8px', marginBottom: 18 }} />}
          </div>
        );
      })}
    </div>
  );
}
