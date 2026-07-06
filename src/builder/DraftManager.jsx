import { useState, useEffect } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors } from '../shared/theme.js'
import { X, FolderOpen, Trash2, Edit3, Plus, Lock, CheckCircle, AlertTriangle, Clock, XCircle, Loader } from 'lucide-react'

const STATUS_META = {
  draft:          { label: 'Draft',         color: '#6b7280', bg: '#6b728015', border: '#6b728030' },
  pending:        { label: 'Pending',        color: '#f59e0b', bg: '#f59e0b15', border: '#f59e0b40' },
  building:       { label: 'Building',       color: '#3b82f6', bg: '#3b82f615', border: '#3b82f640' },
  done:           { label: 'Done',           color: '#22c55e', bg: '#22c55e15', border: '#22c55e40' },
  rejected:       { label: 'Rejected',       color: '#ef4444', bg: '#ef444415', border: '#ef444440' },
  assets_missing: { label: 'Assets Missing', color: '#f97316', bg: '#f9731615', border: '#f9731640' },
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.draft
  const Icon = status === 'done' ? CheckCircle
    : status === 'building' ? Loader
    : status === 'rejected' ? XCircle
    : status === 'assets_missing' ? AlertTriangle
    : status === 'pending' ? Clock
    : FolderOpen
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 7px', borderRadius: 20,
      background: m.bg, border: `1px solid ${m.border}`,
      fontSize: 9, fontWeight: 700, color: m.color,
    }}>
      <Icon size={8} />
      {m.label}
    </span>
  )
}

export default function DraftManager({
  isOpen, onClose,
  drafts, onLoad, onSave, onDelete, currentDraftName, activeDraftId,
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)

  const [saveName, setSaveName] = useState(currentDraftName || '')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  // Re-populate the name field every time the modal opens
  useEffect(() => {
    if (isOpen) setSaveName(currentDraftName || '')
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: 500, maxWidth: '90vw',
        maxHeight: '80vh',
        background: TC.card,
        borderRadius: 16,
        border: `1px solid ${TC.g200}`,
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: `1px solid ${TC.g200}`,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: TC.text, letterSpacing: '-0.01em' }}>Save Structure</div>
            <div style={{ fontSize: 12, color: TC.g500, marginTop: 2 }}>Name and save the current canvas</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color={TC.g500} />
          </button>
        </div>

        {/* Save new */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${TC.g200}`, background: isDark ? 'rgba(255,255,255,.02)' : TC.g50 }}>
          <div style={{ fontSize: 11, color: TC.g500, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Save Current Structure
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="Structure name..."
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 8,
                border: `1px solid ${TC.g300}`, background: TC.card,
                color: TC.text, fontSize: 13, fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
                outline: 'none',
              }}
            />
            <button
              onClick={() => { onSave(saveName, activeDraftId || null); setSaveName('') }}
              disabled={!saveName.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 8, border: 'none',
                background: '#E8192C', color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: saveName.trim() ? 'pointer' : 'not-allowed',
                opacity: saveName.trim() ? 1 : 0.5,
              }}
            >
              <Plus size={14} />
              {activeDraftId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>

        {/* Drafts list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {(!drafts || drafts.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: TC.g400, fontSize: 13 }}>
              No saved structures yet
            </div>
          )}
          {drafts?.map(draft => {
            const displayStatus = draft.submitted ? (draft.order_status || 'pending') : 'draft'
            const locked = draft.submitted && draft.order_status === 'building'
            const isActive = draft.id === activeDraftId

            return (
              <div key={draft.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 20px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : TC.g100}`,
                background: isActive ? (isDark ? 'rgba(232,25,44,.06)' : '#fef9f9') : 'transparent',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: locked ? '#3b82f612' : `${TC.primary}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {locked
                    ? <Lock size={14} color="#3b82f6" />
                    : <FolderOpen size={15} color={TC.primary} />
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === draft.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { onSave(editName, draft.id); setEditingId(null) }
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        borderBottom: `1px solid ${TC.primary}`, color: TC.text,
                        fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                        outline: 'none', padding: 0,
                      }}
                    />
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: TC.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {draft.name}
                        </div>
                        {isActive && <span style={{ fontSize: 9, color: '#E8192C', fontWeight: 800 }}>ACTIVE</span>}
                        <StatusBadge status={displayStatus} />
                      </div>
                      <div style={{ fontSize: 11, color: TC.g500 }}>
                        ${draft.total_price} · {draft.node_count} nodes · {new Date(draft.updated_at).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {/* Load/Edit button */}
                  {locked ? (
                    <div style={{
                      width: 30, height: 30, borderRadius: 7,
                      border: `1px solid #3b82f630`, background: '#3b82f610',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} title="Locked while building">
                      <Lock size={12} color="#3b82f6" />
                    </div>
                  ) : (
                    <button
                      onClick={() => onLoad(draft)}
                      title="Load draft"
                      style={{
                        width: 30, height: 30, borderRadius: 7,
                        border: `1px solid ${TC.g300}`, background: TC.g100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <FolderOpen size={13} color={TC.g600} />
                    </button>
                  )}

                  {/* Rename (only unsubmitted) */}
                  {!draft.submitted && (
                    <button
                      onClick={() => { setEditingId(draft.id); setEditName(draft.name) }}
                      title="Rename"
                      style={{
                        width: 30, height: 30, borderRadius: 7,
                        border: `1px solid ${TC.g300}`, background: TC.g100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit3 size={13} color={TC.g600} />
                    </button>
                  )}

                  {/* Delete (only unsubmitted) */}
                  {!draft.submitted && (
                    <button
                      onClick={() => onDelete(draft.id)}
                      title="Delete"
                      style={{
                        width: 30, height: 30, borderRadius: 7,
                        border: `1px solid ${TC.red}30`, background: `${TC.red}10`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} color={TC.red} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
