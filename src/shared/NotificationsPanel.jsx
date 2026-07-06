import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from './store.js';
import { Icon } from './Icon.jsx';

const STORAGE_KEY = 'adver_notifications';
const MAX_NOTIFS = 50;

function loadNotifs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveNotifs(notifs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, MAX_NOTIFS))); } catch { }
}

function timeAgo(ts) {
  const diff = Date.now() - (isNaN(ts) ? Date.now() : ts);
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function safeTs(r) {
  const raw = r.submitted_at || r.created_at || r.date;
  const t = raw ? new Date(raw).getTime() : NaN;
  return isNaN(t) ? Date.now() : t;
}

const TYPE_META = {
  deposit: { icon: 'wallet', color: 'var(--success, #22c55e)', label: 'Deposit' },
  order:   { icon: 'package', color: 'var(--accent)', label: 'Order' },
  agency:  { icon: 'briefcase', color: '#a78bfa', label: 'Agency Account' },
  system:  { icon: 'bell', color: 'var(--muted)', label: 'System' },
};

// Detect meaningful status changes between two arrays of records
function diffRecords(prev, next, type) {
  if (!prev || !next) return [];
  const prevMap = Object.fromEntries(prev.map(r => [r.id, r]));
  const notifs = [];

  for (const r of next) {
    const old = prevMap[r.id];
    if (!old) continue; // new records don't generate notifs (avoids flood on first load)

    if (type === 'deposit') {
      // Admin approval sets status to "completed"
      if (old.status !== r.status && (r.status === 'completed' || r.status === 'approved')) {
        notifs.push({
          id: `dep-${r.id}-approved`,
          type: 'deposit',
          title: 'Deposit Approved',
          body: `Your deposit of $${Number(r.amount || 0).toFixed(2)} has been approved and added to your balance.`,
          ts: Date.now(),
          read: false,
        });
      }
      if (old.status !== r.status && r.status === 'rejected') {
        notifs.push({
          id: `dep-${r.id}-rejected`,
          type: 'deposit',
          title: 'Deposit Rejected',
          body: `Your deposit of $${Number(r.amount || 0).toFixed(2)} was rejected.`,
          ts: Date.now(),
          read: false,
        });
      }
    }

    if (type === 'order') {
      const STATUS_LABELS = {
        pending:        null,           // suppress — user just submitted
        processing:     'Processing',
        building:       'Being Built',
        in_progress:    'In Progress',
        completed:      'Completed',
        fulfilled:      'Fulfilled',
        cancelled:      'Cancelled',
        rejected:       'Rejected',
        active:         'Active',
        approved:       'Approved',
        delivered:      'Delivered',
        done:           'Done',         // structure order final status
        assets_missing: 'Assets Missing', // structure order needs info
      };
      const newLabel = STATUS_LABELS[r.status];
      if (old.status !== r.status && newLabel) {
        const ref = r.order_code || r.order_ref || r.id?.toString().slice(0, 8).toUpperCase();
        const isStructure = !!r.order_code; // structure orders have order_code (STR-XXX)
        notifs.push({
          id: `ord-${r.id}-${r.status}`,
          type: 'order',
          title: isStructure ? `Structure Order ${newLabel}` : `Order ${newLabel}`,
          body: `${isStructure ? 'Structure order' : 'Order'} #${ref} is now ${newLabel.toLowerCase()}.`,
          ts: Date.now(),
          read: false,
        });
      }
    }

    if (type === 'agency') {
      if (old.status !== r.status && r.status === 'approved') {
        notifs.push({
          id: `agency-${r.id}-approved`,
          type: 'agency',
          title: 'Agency Account Approved',
          body: `Your agency ad account request has been approved.`,
          ts: Date.now(),
          read: false,
        });
      }
      if (old.status !== r.status && r.status === 'rejected') {
        notifs.push({
          id: `agency-${r.id}-rejected`,
          type: 'agency',
          title: 'Agency Account Rejected',
          body: `Your agency ad account request was rejected.`,
          ts: Date.now(),
          read: false,
        });
      }
    }
  }
  return notifs;
}

// Merge new notifs, dedup by id
function mergeNotifs(existing, incoming) {
  const ids = new Set(existing.map(n => n.id));
  const fresh = incoming.filter(n => !ids.has(n.id));
  return [...fresh, ...existing];
}

// Scan existing records for already-resolved items not yet in the notification list.
// Safe to call repeatedly — seenIds deduplicates by notification ID.
function scanExisting(records, type, seenIds) {
  const notifs = [];
  for (const r of (records || [])) {
    if (type === 'deposit') {
      if (r.status === 'completed' || r.status === 'approved') {
        const id = `dep-${r.id}-approved`;
        if (!seenIds.has(id)) notifs.push({
          id, type: 'deposit', title: 'Deposit Approved',
          body: `Your deposit of $${Number(r.amount || 0).toFixed(2)} was approved and added to your balance.`,
          ts: safeTs(r), read: false,
        });
      }
      if (r.status === 'rejected') {
        const id = `dep-${r.id}-rejected`;
        if (!seenIds.has(id)) notifs.push({
          id, type: 'deposit', title: 'Deposit Rejected',
          body: `Your deposit of $${Number(r.amount || 0).toFixed(2)} was rejected.`,
          ts: safeTs(r), read: false,
        });
      }
    }
    if (type === 'order') {
      // All non-pending statuses that the user cares about
      const NOTIFY_STATUSES = {
        building:       'Being Built',
        done:           'Done',
        completed:      'Completed',
        fulfilled:      'Fulfilled',
        cancelled:      'Cancelled',
        rejected:       'Rejected',
        active:         'Active',
        approved:       'Approved',
        delivered:      'Delivered',
        processing:     'Processing',
        in_progress:    'In Progress',
        assets_missing: 'Assets Missing',
      };
      const label = NOTIFY_STATUSES[r.status];
      if (label) {
        const ref = r.order_code || r.order_ref || String(r.id || '').slice(0, 8).toUpperCase();
        const isStructure = !!r.order_code;
        const id = `ord-${r.id}-${r.status}`;
        if (!seenIds.has(id)) notifs.push({
          id, type: 'order',
          title: isStructure ? `Structure Order ${label}` : `Order ${label}`,
          body: `${isStructure ? 'Structure order' : 'Order'} #${ref} is now ${label.toLowerCase()}.`,
          ts: safeTs(r), read: false,
        });
      }
    }
    if (type === 'agency') {
      if (r.status === 'approved') {
        const id = `agency-${r.id}-approved`;
        const name = r.account_name || r.accountName || r.business_name || r.businessName || '';
        if (!seenIds.has(id)) notifs.push({
          id, type: 'agency', title: 'Agency Account Approved',
          body: `Your agency ad account${name ? ` "${name}"` : ''} has been approved.`,
          ts: safeTs(r), read: false,
        });
      }
      if (r.status === 'in_review') {
        const id = `agency-${r.id}-in_review`;
        if (!seenIds.has(id)) notifs.push({
          id, type: 'agency', title: 'Agency Account In Review',
          body: `Your agency ad account request is currently being reviewed.`,
          ts: safeTs(r), read: false,
        });
      }
      if (r.status === 'rejected') {
        const id = `agency-${r.id}-rejected`;
        if (!seenIds.has(id)) notifs.push({
          id, type: 'agency', title: 'Agency Account Rejected',
          body: `Your agency ad account request was rejected.`,
          ts: safeTs(r), read: false,
        });
      }
    }
  }
  return notifs;
}

export function useNotifications() {
  const [store] = useStore();
  const [notifs, setNotifs] = useState(loadNotifs);
  const prevRef = useRef({ deposits: null, orders: null, adAccountRequests: null, structureOrders: null });

  // Scan whenever any data slice first becomes non-null.
  // seenIds deduplication makes this safe to call repeatedly — no duplicates ever added.
  useEffect(() => {
    const { deposits, orders, adAccountRequests, structureOrders } = store;
    // Skip entirely if nothing has loaded yet
    if (deposits === null && orders === null && adAccountRequests === null && structureOrders === null) return;

    setNotifs(existing => {
      const seenIds = new Set(existing.map(n => n.id));
      const scanned = [
        ...scanExisting(deposits,          'deposit', seenIds),
        ...scanExisting(orders,            'order',   seenIds),
        ...scanExisting(adAccountRequests, 'agency',  seenIds),
        ...scanExisting(structureOrders,   'order',   seenIds),
      ];
      if (scanned.length === 0) return existing;
      scanned.sort((a, b) => b.ts - a.ts);
      const merged = mergeNotifs(existing, scanned);
      saveNotifs(merged);
      return merged;
    });
  }, [store.deposits, store.orders, store.adAccountRequests, store.structureOrders]);

  // Ongoing diff — catches status changes during polling
  useEffect(() => {
    const prev = prevRef.current;
    const incoming = [
      ...diffRecords(prev.deposits, store.deposits, 'deposit'),
      ...diffRecords(prev.orders, store.orders, 'order'),
      ...diffRecords(prev.adAccountRequests, store.adAccountRequests, 'agency'),
      ...diffRecords(prev.structureOrders, store.structureOrders, 'order'),
    ];
    prevRef.current = {
      deposits:          store.deposits          ?? prev.deposits,
      orders:            store.orders            ?? prev.orders,
      adAccountRequests: store.adAccountRequests ?? prev.adAccountRequests,
      structureOrders:   store.structureOrders   ?? prev.structureOrders,
    };
    if (incoming.length > 0) {
      setNotifs(prev => {
        const merged = mergeNotifs(prev, incoming);
        saveNotifs(merged);
        return merged;
      });
    }
  }, [store.deposits, store.orders, store.adAccountRequests, store.structureOrders]);

  const markAllRead = useCallback(() => {
    setNotifs(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifs(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifs([]);
    saveNotifs([]);
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  return { notifs, unreadCount, markAllRead, clearAll };
}

export function NotificationsPanel({ notifs, unreadCount, markAllRead, clearAll, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={panelRef} style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      width: 360,
      maxHeight: 520,
      borderRadius: 16,
      background: 'var(--bg-card)',
      border: '1px solid var(--line)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 9999,
      animation: 'notifSlideIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 18px 12px',
        borderBottom: '1px solid var(--line)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 20,
              padding: '1px 7px',
              lineHeight: '18px',
            }}>{unreadCount}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontSize: 12, fontWeight: 500, padding: '4px 8px',
              borderRadius: 8,
            }}>Mark all read</button>
          )}
          {notifs.length > 0 && (
            <button onClick={clearAll} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--muted)', fontSize: 12, fontWeight: 500, padding: '4px 8px',
              borderRadius: 8,
            }}>Clear</button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifs.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '48px 24px', gap: 12,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--bg-hover, rgba(0,0,0,0.05))',
              display: 'grid', placeItems: 'center',
            }}>
              <Icon name="bell" size={20} style={{ color: 'var(--muted)' }} />
            </div>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>No notifications yet</span>
          </div>
        ) : (
          notifs.map(n => <NotifItem key={n.id} notif={n} />)
        )}
      </div>

      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}

function NotifItem({ notif }) {
  const meta = TYPE_META[notif.type] || TYPE_META.system;
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      padding: '13px 18px',
      borderBottom: '1px solid var(--line)',
      background: notif.read ? 'transparent' : 'var(--accent-subtle, rgba(99,102,241,0.06))',
      transition: 'background 0.15s',
    }}>
      {/* Icon badge */}
      <div style={{
        flexShrink: 0,
        width: 36, height: 36, borderRadius: '50%',
        background: `${meta.color}18`,
        display: 'grid', placeItems: 'center',
        marginTop: 2,
      }}>
        <Icon name={meta.icon} size={16} style={{ color: meta.color }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)', lineHeight: 1.3 }}>
            {notif.title}
          </span>
          {!notif.read && (
            <span style={{
              flexShrink: 0, width: 7, height: 7, borderRadius: '50%',
              background: 'var(--accent)', marginTop: 4,
            }} />
          )}
        </div>
        <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>
          {notif.body}
        </p>
        <span style={{ fontSize: 11, color: 'var(--muted-2, var(--muted))', marginTop: 5, display: 'block' }}>
          {timeAgo(notif.ts)}
        </span>
      </div>
    </div>
  );
}
