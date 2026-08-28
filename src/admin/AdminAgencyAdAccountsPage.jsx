import { useState, useEffect } from 'react';
import { useTheme } from '../shared/ThemeContext.jsx';
import { PLATFORMS } from '../shared/theme.js';
import { getAdminTheme, GlassCard, BRAND, BRAND_LIGHT, FONT } from '../shared/adminTheme.jsx';
import {
  Box, Clock, FileText, ShieldCheck, XCircle, CreditCard, Settings, Trophy,
  Search, Plus, Save, ChevronDown, X,
} from 'lucide-react';

async function apiPut(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

const STATUS_MAP = {
  approved:  { bg: 'rgba(34,197,94,0.14)', color: '#22c55e', label: 'Approved' },
  pending:   { bg: 'rgba(245,158,11,0.14)', color: '#f59e0b', label: 'Pending' },
  rejected:  { bg: 'rgba(239,68,68,0.14)', color: '#ef4444', label: 'Rejected' },
  in_review: { bg: 'rgba(59,130,246,0.14)', color: '#3b82f6', label: 'In Review' },
};
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: s.color, background: s.bg, padding: '5px 11px', borderRadius: 100, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.color }} />
      {s.label}
    </span>
  );
}
function PlatformChip({ theme, platformId, fallbackLabel }) {
  const pl = PLATFORMS.find(p => p.id === platformId);
  const label = pl?.name || fallbackLabel || platformId;
  const color = '#9d9da6';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 22, height: 22, borderRadius: 7, background: `${color}22`, color, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>{(label || '?')[0]?.toUpperCase()}</div>
      <span style={{ fontSize: 13, color: theme.text }}>{label}</span>
    </div>
  );
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: small ? 34 : 44, padding: small ? '0 28px 0 10px' : '0 34px 0 14px', borderRadius: small ? 9 : 12,
        border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text,
        fontSize: small ? 12 : 13.5, fontWeight: 600, fontFamily: FONT, appearance: 'none', WebkitAppearance: 'none',
        backgroundImage: theme.mode === 'dark'
          ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%239d9da6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
          : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%236b6b72' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: small ? 'right 8px center' : 'right 12px center', cursor: 'pointer',
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

const STATUS_OPTIONS = ['pending', 'in_review', 'approved', 'rejected'];

function RequestsTable({ theme, rows, isTopup, getUserEmail, savingId, updateStatus, onView }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = rows.filter(r => {
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const hay = `${r.account_name || ''} ${r.platform || ''} ${getUserEmail(r.user_id)}`.toLowerCase();
    const matchSearch = !search || hay.includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <GlassCard theme={theme} style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, height: 42, padding: '0 14px', borderRadius: 12, background: theme.surfaceSunken, border: `1px solid ${theme.border}` }}>
          <Search size={15} style={{ color: theme.textFaint }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by account, user, platform…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13.5, color: theme.text, fontFamily: FONT }} />
        </div>
        <ThemedSelect theme={theme} value={statusFilter} onChange={setStatusFilter} options={[{ value: 'All', label: 'All Statuses' }, ...STATUS_OPTIONS.map(s => ({ value: s, label: s.replace('_', ' ') }))]} />
      </GlassCard>

      <GlassCard theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
            <thead>
              <tr>
                {[isTopup ? 'Transaction ID' : null, 'Account', 'User', 'Platform', !isTopup ? 'Business' : null, 'Amount', 'Date', 'Status', 'Actions'].filter(Boolean).map(c => (
                  <th key={c} style={{ textAlign: 'left', padding: '13px 20px', fontSize: 10.5, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const last = i === filtered.length - 1;
                const cellStyle = { padding: '14px 20px', borderBottom: last ? 'none' : `1px solid ${theme.border}`, whiteSpace: 'nowrap', fontSize: 13, color: theme.text };
                const displayName = isTopup ? String(r.account_name || '').replace(/^Top-up:\s*/i, '') || '—' : (r.account_name || '—');
                return (
                  <tr key={r.id}>
                    {isTopup && <td style={{ ...cellStyle, color: BRAND, fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>{r.request_id || `#${r.id}`}</td>}
                    <td style={cellStyle}>
                      <div style={{ fontWeight: 700 }}>{displayName}</div>
                      <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 2 }}>{isTopup ? r.business_name : (r.requestId || r.id)}</div>
                    </td>
                    <td style={cellStyle}>{getUserEmail(r.user_id)}</td>
                    <td style={cellStyle}><PlatformChip theme={theme} platformId={r.platform} fallbackLabel={r.platform} /></td>
                    {!isTopup && <td style={cellStyle}>{r.business_type || '—'}</td>}
                    <td style={{ ...cellStyle, fontWeight: 800 }}>${Number(r.amount || 0).toFixed(2)}</td>
                    <td style={{ ...cellStyle, color: theme.textMuted, fontSize: 12 }}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                    <td style={cellStyle}><StatusBadge status={r.status} /></td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ThemedSelect theme={theme} small value={r.status} onChange={(v) => updateStatus(r.id, v)} options={STATUS_OPTIONS.map(s => ({ value: s, label: s.replace('_', ' ') }))} />
                        <button onClick={() => onView(r)} style={{ height: 34, padding: '0 14px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>View</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>No requests match your filters.</div>}
      </GlassCard>
    </div>
  );
}

function FieldRow({ theme, field, onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{field.label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: field.required ? BRAND : theme.textFaint, background: field.required ? 'rgba(255,45,85,0.12)' : theme.surfaceSunken, padding: '3px 9px', borderRadius: 100 }}>{field.required ? 'Required' : 'Optional'}</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#3b82f6', background: 'rgba(59,130,246,0.12)', padding: '3px 9px', borderRadius: 100 }}>{field.type}</span>
        {field.multiple && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#a855f7', background: 'rgba(168,85,247,0.12)', padding: '3px 9px', borderRadius: 100 }}>multiple{field.maxEntries ? ` · max ${field.maxEntries}` : ''}</span>}
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, fontWeight: 700, padding: 0 }}>×</button>
      </div>
    </div>
  );
}

function PlatformSettingsCard({ theme, platform, onUpdate, onRemoveField, onAddField, onLogoUpload, onDelete, addingField, setAddingField }) {
  const p = platform;
  const inputStyle = { height: 44, padding: '0 12px', borderRadius: 11, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontFamily: FONT, outline: 'none', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 11.5, fontWeight: 700, color: theme.textMuted, marginBottom: 6, display: 'block' };
  const fd = addingField[p.id] || {};

  return (
    <GlassCard theme={theme} style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <label style={{ cursor: 'pointer', flexShrink: 0 }} title="Click to upload logo">
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onLogoUpload(p.id, e)} />
          <div style={{ width: 48, height: 48, borderRadius: 12, background: p.logo ? 'transparent' : `${p.color || BRAND}22`, border: `2px dashed ${p.color || theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {p.logo ? <img src={p.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} /> : <span style={{ fontSize: 18, fontWeight: 800, color: p.color || BRAND }}>{p.name?.[0] || '?'}</span>}
          </div>
        </label>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input value={p.name} onChange={e => onUpdate(p.id, { name: e.target.value })} style={{ fontWeight: 800, fontSize: 14, color: theme.text, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '6px 10px', fontFamily: FONT, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <input type="color" value={p.color || '#6366f1'} onChange={e => onUpdate(p.id, { color: e.target.value })} style={{ width: 28, height: 22, border: 'none', borderRadius: 5, cursor: 'pointer', padding: 0, background: 'none' }} />
            <input value={p.color || '#6366f1'} onChange={e => onUpdate(p.id, { color: e.target.value })} maxLength={7} style={{ width: 80, fontSize: 12, border: `1px solid ${theme.border}`, borderRadius: 7, padding: '3px 7px', fontFamily: 'monospace', outline: 'none', background: theme.surfaceSunken, color: theme.text }} />
            {p.logo && <button onClick={() => onUpdate(p.id, { logo: null })} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>✕ Remove logo</button>}
          </div>
        </div>
        <button onClick={() => onUpdate(p.id, { active: !p.active })} style={{ width: 42, height: 24, borderRadius: 100, border: 'none', background: p.active ? `linear-gradient(90deg,${BRAND_LIGHT},${BRAND})` : theme.surfaceSunken, position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 2, left: p.active ? 20 : 2, width: 20, height: 20, borderRadius: 999, background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
        </button>
        {!p.builtin && (
          <button onClick={() => onDelete(p.id)} style={{ height: 34, padding: '0 14px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, flexShrink: 0 }}>Delete</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <div>
          <label style={labelStyle}>Service Price (USD)</label>
          <input type="number" value={p.price} min={0} onChange={e => onUpdate(p.id, { price: Number(e.target.value) })} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Min. Top-up (USD)</label>
          <input type="number" value={p.minTopup ?? 200} min={0} onChange={e => onUpdate(p.id, { minTopup: Number(e.target.value) })} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Top-up Fee (%)</label>
          <input type="number" value={p.fee} min={0} max={100} onChange={e => onUpdate(p.id, { fee: Number(e.target.value) })} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 12, background: theme.surfaceSunken, fontSize: 12.5, color: theme.textMuted }}>
        User pays: <strong style={{ color: theme.text }}>${p.price}</strong> service + topup amount + <strong style={{ color: p.color || BRAND }}>{p.fee}%</strong> fee on topup
      </div>

      <div style={{ marginTop: 22, fontSize: 11.5, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Fields From User</div>
      <div style={{ marginTop: 6 }}>
        {(p.fields || []).length === 0 && <div style={{ fontSize: 12, color: theme.textFaint, marginBottom: 10, fontStyle: 'italic' }}>No custom fields — only base fields shown.</div>}
        {(p.fields || []).map(f => <FieldRow key={f.key} theme={theme} field={f} onRemove={() => onRemoveField(p.id, f.key)} />)}
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1.4fr 1fr auto auto auto', gap: 10, alignItems: 'end' }}>
        <div>
          <label style={labelStyle}>Label</label>
          <input value={fd.label || ''} onChange={e => setAddingField(f => ({ ...f, [p.id]: { ...(f[p.id] || {}), label: e.target.value } }))} onKeyDown={e => e.key === 'Enter' && onAddField(p.id)} placeholder="e.g. Business Manager ID" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Type</label>
          <ThemedSelect theme={theme} value={fd.type || 'text'} onChange={(v) => setAddingField(f => ({ ...f, [p.id]: { ...(f[p.id] || {}), type: v } }))} options={['text', 'textarea', 'email', 'url', 'number'].map(t => ({ value: t, label: t }))} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: theme.textMuted, height: 44 }}>
          <input type="checkbox" checked={!!fd.required} onChange={e => setAddingField(f => ({ ...f, [p.id]: { ...(f[p.id] || {}), required: e.target.checked } }))} /> Required
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: theme.textMuted, height: 44 }}>
          <input type="checkbox" checked={!!fd.multiple} onChange={e => setAddingField(f => ({ ...f, [p.id]: { ...(f[p.id] || {}), multiple: e.target.checked } }))} /> Multiple
        </label>
        <button onClick={() => onAddField(p.id)} disabled={!fd.label} style={{ height: 44, padding: '0 16px', borderRadius: 11, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: fd.label ? 'pointer' : 'not-allowed', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6, opacity: fd.label ? 1 : 0.5 }}>
          <Plus size={13} /> Add
        </button>
      </div>

      {!p.active && (
        <div style={{ marginTop: 14, background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#ef4444', fontWeight: 700, textAlign: 'center' }}>Hidden from users</div>
      )}
    </GlassCard>
  );
}

function AgencySettingsTab({ theme, agencySettings, setAgencySettings, saveAgencySettings, savingAgencySettings, milestoneForm, setMilestoneForm, addMilestone, removeMilestone }) {
  const inputStyle = { height: 44, padding: '0 12px', borderRadius: 11, border: `1px solid ${theme.border}`, background: theme.surfaceSunken, color: theme.text, fontSize: 14, fontFamily: FONT, outline: 'none', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 11.5, fontWeight: 700, color: theme.textMuted, marginBottom: 6, display: 'block' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <GlassCard theme={theme} style={{ padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Credit Line Bar Color</div>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: theme.textMuted }}>Sets the glow color of the credit line progress bar visible to users on their account page.</p>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input type="color" value={agencySettings.creditLineColor || '#e8192c'} onChange={e => setAgencySettings(s => ({ ...s, creditLineColor: e.target.value }))} style={{ width: 44, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'none' }} />
          <input value={agencySettings.creditLineColor || '#e8192c'} onChange={e => setAgencySettings(s => ({ ...s, creditLineColor: e.target.value }))} maxLength={7} style={{ ...inputStyle, width: 140, fontFamily: 'monospace' }} />
          <div style={{ flex: 1, minWidth: 200, height: 10, borderRadius: 999, background: theme.surfaceSunken, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', borderRadius: 999, background: agencySettings.creditLineColor || '#e8192c', boxShadow: `0 0 16px -2px ${agencySettings.creditLineColor || '#e8192c'}` }} />
          </div>
          <button onClick={() => saveAgencySettings(agencySettings)} disabled={savingAgencySettings} style={{ height: 44, padding: '0 22px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.5)' }}>
            {savingAgencySettings ? 'Saving…' : 'Save'}
          </button>
        </div>
      </GlassCard>

      <GlassCard theme={theme} style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Trophy size={16} style={{ color: BRAND }} />
          <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Milestone Awards</div>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: theme.textMuted }}>Create top-up milestones that unlock achievement badges for users. Set a top-up threshold, icon, and whether it applies to all accounts or specific ones.</p>

        <div style={{ marginTop: 20, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 22 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Add Milestone</div>
          <div style={{ display: 'grid', gridTemplateColumns: '70px 1.4fr 90px 1fr 1.2fr', gap: 14, alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>Icon</label>
              <input value={milestoneForm.icon} onChange={e => setMilestoneForm(f => ({ ...f, icon: e.target.value }))} maxLength={4} style={{ ...inputStyle, textAlign: 'center', fontSize: 20 }} />
            </div>
            <div>
              <label style={labelStyle}>Award Name</label>
              <input value={milestoneForm.label} onChange={e => setMilestoneForm(f => ({ ...f, label: e.target.value }))} placeholder="Gold Tier" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Color</label>
              <input type="color" value={milestoneForm.color || '#f59e0b'} onChange={e => setMilestoneForm(f => ({ ...f, color: e.target.value }))} style={{ width: '100%', height: 44, border: `1px solid ${theme.border}`, borderRadius: 11, cursor: 'pointer', padding: 2, background: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={labelStyle}>Amount ($)</label>
              <input type="number" value={milestoneForm.amount} onChange={e => setMilestoneForm(f => ({ ...f, amount: e.target.value }))} placeholder="10000" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Applies To</label>
              <ThemedSelect theme={theme} value={milestoneForm.scope} onChange={(v) => setMilestoneForm(f => ({ ...f, scope: v }))} options={[{ value: 'global', label: 'Everyone' }, { value: 'specific', label: 'Specific accounts' }]} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Reward Message (shown to user when they reach this milestone)</label>
            <textarea value={milestoneForm.rewardMessage} onChange={e => setMilestoneForm(f => ({ ...f, rewardMessage: e.target.value }))} rows={2} style={{ ...inputStyle, height: 'auto', padding: 12, resize: 'vertical', lineHeight: 1.5 }} />
          </div>

          {milestoneForm.scope === 'specific' && (
            <div style={{ marginTop: 10 }}>
              <label style={labelStyle}>Account IDs (comma-separated)</label>
              <input value={(milestoneForm.accountIds || []).join(', ')} onChange={e => setMilestoneForm(f => ({ ...f, accountIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="e.g. 1782939900368, 1782930083318" style={inputStyle} />
            </div>
          )}

          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={addMilestone} disabled={!milestoneForm.amount || !milestoneForm.label} style={{ height: 44, padding: '0 22px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 22px -10px rgba(255,45,85,0.5)', opacity: (!milestoneForm.amount || !milestoneForm.label) ? 0.5 : 1 }}>
              <Plus size={15} /> Add Milestone
            </button>
          </div>
        </div>

        {(agencySettings.milestones || []).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: theme.textFaint, fontSize: 13 }}>No milestones yet. Add one above to motivate clients to top up more.</div>
        ) : (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {agencySettings.milestones.map(m => (
              <div key={m.id} style={{ padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${m.color || theme.border}50`, background: `${m.color || '#f59e0b'}10` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: m.color || theme.text }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                      ${Number(m.amount).toLocaleString()} threshold · {m.scope === 'global' ? 'All accounts' : `${(m.accountIds || []).length} specific account${(m.accountIds || []).length !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: m.color || '#f59e0b', flexShrink: 0, boxShadow: `0 0 8px ${m.color || '#f59e0b'}` }} />
                  <button onClick={() => removeMilestone(m.id)} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 7, padding: '4px 10px', fontSize: 12, color: '#ef4444', cursor: 'pointer', fontFamily: FONT, flexShrink: 0 }}>Delete</button>
                </div>
                {m.rewardMessage && (
                  <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: `${m.color || '#f59e0b'}18`, border: `1px dashed ${m.color || '#f59e0b'}50`, fontSize: 12, color: theme.textMuted, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700, color: m.color || '#f59e0b', marginRight: 5 }}>🎁 Reward:</span>{m.rewardMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function RequestDetailModal({ theme, request, getUserEmail, onClose, updateStatus }) {
  const [openSections, setOpenSections] = useState({});
  const metaLabel = (k) => k.startsWith('cf_')
    ? k.replace(/^cf_/, '').replace(/_\d+$/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const metaEntries = request.metadata && typeof request.metadata === 'object' ? Object.entries(request.metadata) : [];
  const listSections = [
    ...(Array.isArray(request.page_links) && request.page_links.filter(Boolean).length ? [['Page Links', request.page_links.filter(Boolean)]] : []),
    ...metaEntries.filter(([, v]) => Array.isArray(v) && v.filter(Boolean).length).map(([k, v]) => [metaLabel(k), v.filter(Boolean)]),
  ];
  const flatMetaRows = metaEntries.filter(([, v]) => !Array.isArray(v)).map(([k, v]) => [metaLabel(k), v]);
  const platformName = PLATFORMS.find(p => p.id === request.platform)?.name || request.platform;
  const detailRows = [
    ['Business Type', request.business_type],
    ['Business Name', request.business_name],
    ['Email', request.business_email],
    ['BM ID', request.bm_id],
    ...flatMetaRows,
    ['Amount', `$${Number(request.amount || 0).toFixed(2)}`],
    ['Submitted', request.created_at ? new Date(request.created_at).toLocaleString() : '—'],
  ].filter(([, v]) => v);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: theme.surface, borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: theme.shadowLg, border: `1px solid ${theme.border}`, fontFamily: FONT }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: theme.text }}>Request Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textFaint, fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, marginBottom: 18 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,45,85,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18, fontWeight: 800, color: BRAND }}>
              {(request.account_name || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: theme.text, letterSpacing: '-0.01em' }}>{request.account_name || 'Untitled request'}</div>
              <div style={{ fontSize: 12.5, color: theme.textMuted, fontWeight: 500, marginTop: 2 }}>{platformName} · {getUserEmail(request.user_id)}</div>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: theme.textFaint, marginBottom: 8 }}>Request ID: {request.id}</div>

          <div style={{ borderRadius: 12, border: `1px solid ${theme.border}`, overflow: 'hidden', marginBottom: listSections.length ? 16 : 20 }}>
            {detailRows.map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`, fontSize: 13 }}>
                <span style={{ color: theme.textMuted, fontWeight: 600, whiteSpace: 'nowrap' }}>{k}</span>
                <span style={{ fontWeight: 700, color: theme.text, textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
              </div>
            ))}
          </div>

          {listSections.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {listSections.map(([label, values], idx) => {
                const isOpen = openSections[label] ?? (idx === 0);
                return (
                  <div key={label} style={{ borderRadius: 12, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                    <button type="button" onClick={() => setOpenSections(s => ({ ...s, [label]: !isOpen }))} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>{label}</span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: theme.surfaceSunken, color: theme.textMuted }}>{values.length}</span>
                      </span>
                      <ChevronDown size={14} style={{ color: theme.textFaint, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {values.map((v, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 11px', borderRadius: 9, background: theme.surfaceSunken, fontSize: 12.5 }}>
                            <span style={{ color: theme.textFaint, fontWeight: 700, minWidth: 14 }}>{i + 1}</span>
                            <span style={{ color: theme.text, fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: theme.textFaint, marginBottom: 10 }}>Update Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            {STATUS_OPTIONS.map(s => {
              const meta = STATUS_MAP[s];
              const active = request.status === s;
              return (
                <button key={s} onClick={() => updateStatus(request.id, s)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', borderRadius: 11, border: `1.5px solid ${active ? meta.color : theme.border}`, background: active ? meta.bg : theme.surfaceSunken, cursor: 'pointer', fontFamily: FONT, textAlign: 'left' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: active ? meta.color : theme.textFaint, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: active ? meta.color : theme.textMuted }}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabNav({ theme, tab, setTab, topupPending }) {
  const tabs = [
    { key: 'requests', label: 'Account Requests', icon: <FileText size={15} /> },
    { key: 'topups', label: `Top-up Requests${topupPending > 0 ? ` (${topupPending})` : ''}`, icon: <CreditCard size={15} /> },
    { key: 'platforms', label: 'Platform Settings', icon: <Settings size={15} /> },
    { key: 'agency', label: 'Agency Settings', icon: <Trophy size={15} /> },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: 5, borderRadius: 14, background: theme.surfaceSunken, border: `1px solid ${theme.border}`, width: 'fit-content' }}>
      {tabs.map(t => {
        const active = t.key === tab;
        return (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 700, background: active ? theme.surface : 'transparent', color: active ? theme.text : theme.textMuted, boxShadow: active ? theme.shadow : 'none', transition: 'all .15s' }}>
            {t.icon}{t.label}
          </button>
        );
      })}
    </div>
  );
}

export function AdminAgencyAdAccountsPage({ requests, users, setStore }) {
  const { theme: themeMode } = useTheme();
  const theme = getAdminTheme(themeMode === 'dark');

  const [tab, setTab] = useState('requests');
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewRequest, setViewRequest] = useState(null);

  const [platforms, setPlatforms] = useState([]);
  const [savingPrices, setSavingPrices] = useState(false);
  const [addingField, setAddingField] = useState({});
  const [newPlatform, setNewPlatform] = useState({ name: '', color: '#6366f1' });
  const [addingPlatform, setAddingPlatform] = useState(false);

  const [agencySettings, setAgencySettings] = useState({ creditLineColor: '#e8192c', milestones: [] });
  const [agencySettingsLoaded, setAgencySettingsLoaded] = useState(false);
  const [savingAgencySettings, setSavingAgencySettings] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ amount: '', label: '', icon: '🏆', scope: 'global', accountIds: [], rewardMessage: '', color: '#f59e0b' });

  const loadAgencySettings = async () => {
    try {
      const data = await fetch('/api/agency-settings', { credentials: 'same-origin' }).then(r => r.json());
      setAgencySettings(data);
    } catch { /* keep defaults */ }
    setAgencySettingsLoaded(true);
  };
  const saveAgencySettings = async (next) => {
    setSavingAgencySettings(true);
    try {
      const data = await fetch('/api/agency-settings', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).then(r => r.json());
      setAgencySettings(data);
    } catch { /* non-fatal */ }
    setSavingAgencySettings(false);
  };
  const addMilestone = () => {
    if (!milestoneForm.amount || !milestoneForm.label) return;
    const milestone = {
      id: Date.now().toString(), amount: Number(milestoneForm.amount), label: milestoneForm.label,
      icon: milestoneForm.icon || '🏆', scope: milestoneForm.scope || 'global',
      accountIds: milestoneForm.scope === 'specific' ? milestoneForm.accountIds : [],
      color: milestoneForm.color || '#f59e0b', rewardMessage: milestoneForm.rewardMessage || '',
    };
    const next = { ...agencySettings, milestones: [...agencySettings.milestones, milestone].sort((a, b) => a.amount - b.amount) };
    setAgencySettings(next);
    saveAgencySettings(next);
    setMilestoneForm({ amount: '', label: '', icon: '🏆', scope: 'global', accountIds: [], color: '#f59e0b', rewardMessage: '' });
  };
  const removeMilestone = (id) => {
    const next = { ...agencySettings, milestones: agencySettings.milestones.filter(m => m.id !== id) };
    setAgencySettings(next);
    saveAgencySettings(next);
  };

  useEffect(() => { if (tab === 'agency' && !agencySettingsLoaded) loadAgencySettings(); }, [tab]);

  const updatePlatform = (id, changes) => setPlatforms(ps => ps.map(p => p.id === id ? { ...p, ...changes } : p));

  const addField = (platformId) => {
    const fd = addingField[platformId] || {};
    if (!fd.label) return;
    const rawKey = fd.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const key = `cf_${rawKey}_${Date.now()}`;
    const newField = { key, label: fd.label, type: fd.type || 'text', required: !!fd.required, placeholder: fd.placeholder || '' };
    if (fd.multiple) {
      newField.multiple = true;
      if (fd.maxEntries) newField.maxEntries = Number(fd.maxEntries);
    }
    updatePlatform(platformId, { fields: [...(platforms.find(p => p.id === platformId)?.fields || []), newField] });
    setAddingField(f => ({ ...f, [platformId]: { label: '', type: 'text', required: false, placeholder: '', multiple: false, maxEntries: '' } }));
  };
  const removeField = (platformId, fieldKey) => {
    const pl = platforms.find(p => p.id === platformId);
    if (!pl) return;
    updatePlatform(platformId, { fields: (pl.fields || []).filter(f => f.key !== fieldKey) });
  };
  const handleLogoUpload = (platformId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { setError('Logo must be under 500KB'); return; }
    const reader = new FileReader();
    reader.onload = ev => updatePlatform(platformId, { logo: ev.target.result });
    reader.readAsDataURL(file);
  };
  const addCustomPlatform = () => {
    const name = newPlatform.name.trim();
    if (!name) return;
    const id = 'custom_' + name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
    setPlatforms(ps => [...ps, { id, name, color: newPlatform.color || '#6366f1', logo: null, price: 50, fee: 6, minTopup: 200, active: true, fields: [], builtin: false }]);
    setNewPlatform({ name: '', color: '#6366f1' });
    setAddingPlatform(false);
  };
  const deletePlatform = async (id) => {
    if (!window.confirm('Delete this platform?')) return;
    setPlatforms(ps => ps.filter(p => p.id !== id));
    try { await fetch('/api/platform-config', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); } catch { /* already removed from UI */ }
  };

  useEffect(() => {
    fetch('/api/platform-config').then(r => r.json()).then(arr => { if (Array.isArray(arr)) setPlatforms(arr); }).catch(() => {});
  }, []);

  const getUserEmail = (userId) => {
    const u = (users || []).find(u => u.id === userId);
    return u ? (u.email || u.name) : userId;
  };

  const isTopup = r => String(r.account_name || '').startsWith('Top-up:');
  const accountReqs = requests.filter(r => !isTopup(r));
  const topupReqs = requests.filter(r => isTopup(r));

  const updateStatus = async (id, newStatus) => {
    setSavingId(id);
    setError('');
    try {
      await apiPut('ad_account_requests', { id, status: newStatus });
      setStore(s => ({ ...s, adAccountRequests: s.adAccountRequests.map(r => r.id === id ? { ...r, status: newStatus } : r) }));
      setViewRequest(r => r ? { ...r, status: newStatus } : r);
    } catch (err) {
      setError('Failed to update: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const savePrices = async () => {
    setSavingPrices(true);
    setError('');
    try {
      const fields = Object.fromEntries(platforms.map(p => [p.id, p.fields || []]));
      const res = await fetch('/api/platform-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platforms, fields }) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `HTTP ${res.status}`); }
      setSuccess('Platform settings saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSavingPrices(false);
    }
  };

  const statCounts = {
    total: accountReqs.length,
    pending: accountReqs.filter(r => r.status === 'pending').length,
    in_review: accountReqs.filter(r => r.status === 'in_review').length,
    approved: accountReqs.filter(r => r.status === 'approved').length,
    rejected: accountReqs.filter(r => r.status === 'rejected').length,
    topups: topupReqs.length,
    topups_pending: topupReqs.filter(r => r.status === 'pending').length,
  };

  const STATS = [
    { icon: <Box size={17} strokeWidth={1.8} />, label: 'Accounts', value: statCounts.total, tint: '#3b82f6' },
    { icon: <Clock size={17} strokeWidth={1.8} />, label: 'Pending', value: statCounts.pending, tint: '#f59e0b' },
    { icon: <FileText size={17} strokeWidth={1.8} />, label: 'In Review', value: statCounts.in_review, tint: '#3b82f6' },
    { icon: <ShieldCheck size={17} strokeWidth={1.8} />, label: 'Approved', value: statCounts.approved, tint: '#22c55e' },
    { icon: <XCircle size={17} strokeWidth={1.8} />, label: 'Rejected', value: statCounts.rejected, tint: '#ef4444' },
    { icon: <CreditCard size={17} strokeWidth={1.8} />, label: 'Top-ups', value: statCounts.topups, tint: '#a855f7' },
  ];

  return (
    <div style={{ fontFamily: FONT, background: theme.pageBg, minHeight: '100%', padding: '32px 28px 60px', transition: 'background .25s' }}>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: '-0.015em' }}>Agency Ad Accounts</h1>
      <p style={{ margin: '8px 0 0', fontSize: 14.5, color: theme.textMuted }}>Manage requests and platform pricing.</p>

      {error && <div style={{ marginTop: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ marginTop: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '12px 16px', borderRadius: 12, fontSize: 13 }}>{success}</div>}

      <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {STATS.map(s => <StatCard key={s.label} theme={theme} {...s} />)}
      </div>

      <div style={{ marginTop: 26 }}>
        <TabNav theme={theme} tab={tab} setTab={setTab} topupPending={statCounts.topups_pending} />
      </div>

      <div style={{ marginTop: 20 }}>
        {tab === 'requests' && (
          <RequestsTable theme={theme} rows={accountReqs} isTopup={false} getUserEmail={getUserEmail} savingId={savingId} updateStatus={updateStatus} onView={setViewRequest} />
        )}
        {tab === 'topups' && (
          <RequestsTable theme={theme} rows={topupReqs} isTopup={true} getUserEmail={getUserEmail} savingId={savingId} updateStatus={updateStatus} onView={setViewRequest} />
        )}
        {tab === 'platforms' && (
          <div>
            {platforms.length === 0 && <div style={{ textAlign: 'center', color: theme.textFaint, padding: 40, fontSize: 14 }}>Loading platforms…</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
              {platforms.map(p => (
                <PlatformSettingsCard
                  key={p.id} theme={theme} platform={p}
                  onUpdate={updatePlatform} onRemoveField={removeField} onAddField={addField}
                  onLogoUpload={handleLogoUpload} onDelete={deletePlatform}
                  addingField={addingField} setAddingField={setAddingField}
                />
              ))}
            </div>

            {addingPlatform ? (
              <GlassCard theme={theme} style={{ padding: 22, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: theme.text, marginBottom: 14 }}>New Platform</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 2, minWidth: 160 }}>
                    <div style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600, marginBottom: 6 }}>Platform Name</div>
                    <input value={newPlatform.name} onChange={e => setNewPlatform(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Pinterest Ads" style={{ width: '100%', height: 42, border: `1px solid ${theme.border}`, borderRadius: 11, padding: '0 12px', fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', background: theme.surfaceSunken, color: theme.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600, marginBottom: 6 }}>Brand Color</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={newPlatform.color} onChange={e => setNewPlatform(p => ({ ...p, color: e.target.value }))} style={{ width: 38, height: 38, border: 'none', borderRadius: 9, cursor: 'pointer', padding: 0 }} />
                      <input value={newPlatform.color} onChange={e => setNewPlatform(p => ({ ...p, color: e.target.value }))} maxLength={7} style={{ width: 88, height: 38, border: `1px solid ${theme.border}`, borderRadius: 9, padding: '0 10px', fontSize: 13, fontFamily: 'monospace', outline: 'none', background: theme.surfaceSunken, color: theme.text }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={addCustomPlatform} disabled={!newPlatform.name.trim()} style={{ height: 42, padding: '0 20px', borderRadius: 11, background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: FONT, opacity: newPlatform.name.trim() ? 1 : 0.5 }}>Add Platform</button>
                    <button onClick={() => setAddingPlatform(false)} style={{ height: 42, padding: '0 16px', borderRadius: 11, background: theme.surfaceSunken, color: theme.textMuted, border: `1px solid ${theme.border}`, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: FONT }}>Cancel</button>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <button onClick={() => setAddingPlatform(true)} style={{ marginBottom: 18, width: '100%', height: 52, borderRadius: 16, border: `1.5px dashed ${theme.borderStrong}`, background: 'transparent', color: theme.textMuted, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Plus size={15} /> Add New Platform
              </button>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={savePrices} disabled={savingPrices} style={{ height: 48, padding: '0 24px', borderRadius: 100, border: 'none', background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 14px 28px -10px rgba(255,45,85,0.55)', opacity: savingPrices ? 0.7 : 1 }}>
                <Save size={15} /> {savingPrices ? 'Saving…' : 'Save Platform Settings'}
              </button>
            </div>
          </div>
        )}
        {tab === 'agency' && (
          <AgencySettingsTab
            theme={theme} agencySettings={agencySettings} setAgencySettings={setAgencySettings}
            saveAgencySettings={saveAgencySettings} savingAgencySettings={savingAgencySettings}
            milestoneForm={milestoneForm} setMilestoneForm={setMilestoneForm}
            addMilestone={addMilestone} removeMilestone={removeMilestone}
          />
        )}
      </div>

      {viewRequest && (
        <RequestDetailModal theme={theme} request={viewRequest} getUserEmail={getUserEmail} onClose={() => setViewRequest(null)} updateStatus={updateStatus} />
      )}
    </div>
  );
}
