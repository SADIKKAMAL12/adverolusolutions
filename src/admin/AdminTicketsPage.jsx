import { useState, useEffect } from 'react';
import { apiFetch } from '../shared/api.js';
import { useTheme } from '../shared/ThemeContext.jsx';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import { FileText, MessageCircle, Layers, ShieldCheck, Search, Send, Tag } from 'lucide-react';

const STATUS_OPTIONS = ['open', 'in progress', 'resolved', 'closed'];

const STATUS_MAP = {
  open: { bg: 'rgba(245,158,11,0.14)', color: '#f59e0b', label: 'Open' },
  'in progress': { bg: 'rgba(168,85,247,0.14)', color: '#a855f7', label: 'In Progress' },
  resolved: { bg: 'rgba(34,197,94,0.14)', color: '#22c55e', label: 'Resolved' },
  closed: { bg: 'rgba(157,157,166,0.16)', color: '#9d9da6', label: 'Closed' },
};
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.open;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '4px 10px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.color }} />
      {s.label}
    </span>
  );
}

const CATEGORY_COLOR = { Billing: '#3b82f6', Technical: '#ef4444', General: '#9d9da6' };
function CategoryTag({ category }) {
  const color = CATEGORY_COLOR[category] || '#9d9da6';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color }}>
      <Tag size={12} /> {category || 'Other'}
    </span>
  );
}

function fmtInitials(email) {
  return (email || '?').slice(0, 2).toUpperCase();
}

function StatCard({ theme, icon, label, value, tint }) {
  return (
    <GlassCard theme={theme} style={{ padding: 18 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${tint}22`, color: tint, display: 'grid', placeItems: 'center' }}>{icon}</div>
      <div style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: theme.textMuted }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: '-0.01em' }}>{value}</div>
    </GlassCard>
  );
}

function ThemedSelect({ theme, value, onChange, options, small }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{
      height: small ? 36 : 44, padding: small ? '0 28px 0 12px' : '0 34px 0 14px', borderRadius: small ? 10 : 12,
      border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: small ? 12.5 : 13.5,
      fontWeight: 600, fontFamily: FONT, appearance: 'none', WebkitAppearance: 'none',
      backgroundImage: theme.mode === 'dark'
        ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%239d9da6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
        : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%236b6b72' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat', backgroundPosition: small ? 'right 10px center' : 'right 12px center', cursor: 'pointer',
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function TicketListItem({ theme, ticket, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'left', padding: '16px 18px', borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: FONT,
      background: active ? (theme.mode === 'dark' ? 'rgba(255,45,85,0.1)' : '#fff0f4') : 'transparent',
      boxShadow: active ? `inset 2px 0 0 0 ${BRAND}` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: 'rgba(255,45,85,0.14)', color: BRAND, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 11.5, flexShrink: 0 }}>{fmtInitials(ticket.user_email)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</div>
            <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.user_email}</div>
          </div>
        </div>
        <StatusBadge status={ticket.status} />
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.message}</div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <CategoryTag category={ticket.category} />
        <span style={{ fontSize: 11, color: theme.textFaint }}>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : ''}</span>
      </div>
    </button>
  );
}

function TicketDetail({ theme, ticket, draft, onDraftChange, onSave, saving }) {
  const [focused, setFocused] = useState(false);

  if (!ticket) {
    return (
      <GlassCard theme={theme} style={{ padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
        <div style={{ textAlign: 'center', color: theme.textFaint }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: theme.surfaceSunken, display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: theme.textMuted }}>
            <MessageCircle size={20} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Select a ticket to view the conversation</div>
        </div>
      </GlassCard>
    );
  }

  const reply = draft?.admin_reply || '';
  const hasChanges = draft && (draft.status !== (ticket.status || 'open') || draft.admin_reply !== (ticket.admin_reply || ''));

  return (
    <GlassCard theme={theme} style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: theme.text }}>{ticket.subject}</div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: theme.textMuted }}>{ticket.user_email}</span>
            <CategoryTag category={ticket.category} />
            <span style={{ fontSize: 11.5, color: theme.textFaint }}>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : ''}</span>
          </div>
        </div>
        <ThemedSelect theme={theme} value={draft?.status || ticket.status || 'open'} onChange={(v) => onDraftChange({ status: v })}
          options={STATUS_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{ maxWidth: '72%' }}>
            <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', fontSize: 13.5, lineHeight: 1.55, background: theme.surfaceSunken, color: theme.text, border: `1px solid ${theme.border}` }}>
              {ticket.message}
            </div>
            <div style={{ marginTop: 5, fontSize: 10.5, color: theme.textFaint }}>User · {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : ''}</div>
          </div>
        </div>
        {ticket.admin_reply && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ maxWidth: '72%' }}>
              <div style={{ padding: '12px 16px', borderRadius: '16px 16px 4px 16px', fontSize: 13.5, lineHeight: 1.55, background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff' }}>
                {ticket.admin_reply}
              </div>
              <div style={{ marginTop: 5, fontSize: 10.5, color: theme.textFaint, textAlign: 'right' }}>You</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 24px 20px', borderTop: `1px solid ${theme.border}` }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 10, borderRadius: 14,
          border: focused ? `1.5px solid ${BRAND}` : `1px solid ${theme.border}`,
          background: theme.surfaceSunken, padding: 10,
          boxShadow: focused ? '0 0 0 4px rgba(255,45,85,0.1)' : 'none', transition: 'all .15s',
        }}>
          <textarea
            value={reply}
            onChange={(e) => onDraftChange({ admin_reply: e.target.value })}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Write a reply the user will see…"
            rows={2}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: 13.5, color: theme.text, fontFamily: FONT, lineHeight: 1.5, padding: '6px 8px' }}
          />
          <button
            onClick={onSave}
            disabled={!hasChanges || saving}
            style={{
              flexShrink: 0, height: 40, padding: '0 18px', borderRadius: 10, border: 'none',
              background: (hasChanges && !saving) ? `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})` : theme.border,
              color: (hasChanges && !saving) ? '#fff' : theme.textFaint, fontSize: 13, fontWeight: 700, cursor: (hasChanges && !saving) ? 'pointer' : 'not-allowed',
              fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: (hasChanges && !saving) ? '0 10px 22px -10px rgba(255,45,85,0.5)' : 'none',
            }}
          >
            <Send size={14} /> {saving ? 'Saving…' : 'Save & Send'}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

export function AdminTicketsPage() {
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    apiFetch('/api/support-tickets')
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setTickets(list);
        if (list.length > 0) setSelectedId(id => id || list[0].id);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const selectTicket = (t) => {
    setSelectedId(t.id);
    setDrafts(d => ({ ...d, [t.id]: d[t.id] || { status: t.status || 'open', admin_reply: t.admin_reply || '' } }));
  };

  const updateDraft = (id, patch) => {
    setDrafts(d => ({ ...d, [id]: { ...d[id], ...patch } }));
  };

  const save = async (t) => {
    const draft = drafts[t.id];
    if (!draft) return;
    setSavingId(t.id);
    setError('');
    try {
      const updated = await apiFetch('/api/support-tickets', {
        method: 'PUT',
        body: JSON.stringify({ id: t.id, status: draft.status, admin_reply: draft.admin_reply }),
      });
      setTickets(list => list.map(x => x.id === t.id ? { ...x, ...updated } : x));
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };

  const filtered = tickets.filter(t => {
    const matchesStatus = statusFilter === 'all' || (t.status || '').toLowerCase() === statusFilter;
    const hay = `${t.subject || ''} ${t.user_email || ''} ${t.category || ''}`.toLowerCase();
    return matchesStatus && (!search || hay.includes(search.toLowerCase()));
  });
  const selected = tickets.find(t => t.id === selectedId) || null;
  const selectedDraft = selected ? (drafts[selected.id] || { status: selected.status || 'open', admin_reply: selected.admin_reply || '' }) : null;

  const STATS = [
    { icon: <FileText size={17} strokeWidth={1.8} />, label: 'Total Tickets', value: tickets.length, tint: '#3b82f6' },
    { icon: <MessageCircle size={17} strokeWidth={1.8} />, label: 'Open', value: tickets.filter(t => t.status === 'open').length, tint: '#f59e0b' },
    { icon: <Layers size={17} strokeWidth={1.8} />, label: 'In Progress', value: tickets.filter(t => t.status === 'in progress').length, tint: '#a855f7' },
    { icon: <ShieldCheck size={17} strokeWidth={1.8} />, label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, tint: '#22c55e' },
  ];

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Support Tickets</h1>
      <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Manage user support requests.</p>

      {error && <div style={{ marginTop: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{error}</div>}

      <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STATS.map(s => <StatCard key={s.label} theme={theme} {...s} />)}
      </div>

      {loading ? (
        <div style={{ marginTop: 22 }}>
          <GlassCard theme={theme} style={{ padding: '60px 32px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: theme.textFaint }}>Loading tickets…</p>
          </GlassCard>
        </div>
      ) : tickets.length === 0 ? (
        <div style={{ marginTop: 22 }}>
          <GlassCard theme={theme} style={{ padding: '60px 32px', textAlign: 'center' }}>
            <MessageCircle size={40} style={{ color: theme.textFaint, marginBottom: 14 }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: theme.text, margin: 0 }}>No Tickets Yet</h3>
            <p style={{ fontSize: 14, color: theme.textFaint, marginTop: 8 }}>All caught up!</p>
          </GlassCard>
        </div>
      ) : (
        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
          <GlassCard theme={theme} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 12px', borderRadius: 11, background: theme.surfaceSunken, border: `1px solid ${theme.border}` }}>
              <Search size={15} style={{ color: theme.textFaint }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: theme.text, fontFamily: FONT }} />
            </div>
            <ThemedSelect theme={theme} small value={statusFilter} onChange={setStatusFilter}
              options={[{ value: 'all', label: 'All Status' }, ...STATUS_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 560, overflowY: 'auto' }}>
              {filtered.map(t => (
                <TicketListItem key={t.id} theme={theme} ticket={t} active={t.id === selectedId} onClick={() => selectTicket(t)} />
              ))}
              {filtered.length === 0 && <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: theme.textFaint }}>No tickets match your filters.</div>}
            </div>
          </GlassCard>

          <div style={{ minHeight: 560 }}>
            <TicketDetail
              theme={theme} ticket={selected} draft={selectedDraft}
              onDraftChange={(patch) => selected && updateDraft(selected.id, patch)}
              onSave={() => selected && save(selected)}
              saving={selected && savingId === selected.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
