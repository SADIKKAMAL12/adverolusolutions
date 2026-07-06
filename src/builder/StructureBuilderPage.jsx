import { useCallback, useEffect, useRef, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { getThemeColors } from '../shared/theme.js'
import { useStore, setStore } from '../shared/store.js'
import { useAuth } from '../shared/AuthContext.jsx'
import { useStructureBuilder } from './hooks/useStructureBuilder.js'
import FlowCanvas from './FlowCanvas.jsx'
import BuilderToolbar from './BuilderToolbar.jsx'
import PricePanel from './PricePanel.jsx'
import DraftManager from './DraftManager.jsx'
import SubmitModal from './SubmitModal.jsx'
import StructuresHistoryDropdown from './StructuresHistoryDropdown.jsx'
import ConfirmModal from './ConfirmModal.jsx'
import { CONNECTION_REGISTRY } from './nodes/nodeRegistry.js'
import {
  createStructureDraft, updateStructureDraft, deleteStructureDraft,
  createStructureOrder, fetchStructureDrafts, fetchStructureOrders,
  updateUser, createTransaction,
} from '../lib/db.js'
import { FolderOpen, Save, GitBranch, Undo2, Redo2, CloudCheck, Cloud, Plus } from 'lucide-react'

function BuilderInner() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const TC = getThemeColors(isDark)
  const [store] = useStore()
  const { user } = useAuth()

  const [assets, setAssets] = useState({})
  const [connectionType, setConnectionType] = useState('admin')
  const [saving, setSaving] = useState(false)
  const [drafts, setDrafts] = useState(store.structureDrafts || [])
  const [structureOrders, setStructureOrders] = useState([])
  const [activeDraftId, setActiveDraftId] = useState(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState('')
  const [confirmModal, setConfirmModal] = useState(null) // { title, message, confirmLabel, confirmColor, onConfirm }
  const confirmResolverRef = useRef(null)

  const SESSION_KEY = `adversolutions_builder_session_${user?.id || 'guest'}`

  const {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange,
    draftName, setDraftName,
    showDraftManager, setShowDraftManager,
    showSubmitModal, setShowSubmitModal,
    priceBreakdown,
    addNode, deleteNode, updateEdgeRole, removeSelected, clearAll, onConnect,
    undo, redo, canUndo, canRedo,
    isSubmitting, setIsSubmitting,
  } = useStructureBuilder(assets, connectionType)

  // Promise-based custom confirm
  const showConfirm = useCallback(({ title, message, confirmLabel = 'Confirm', confirmColor = '#ef4444' }) => {
    return new Promise(resolve => {
      confirmResolverRef.current = resolve
      setConfirmModal({ title, message, confirmLabel, confirmColor })
    })
  }, [])

  const handleConfirmOk = useCallback(() => {
    setConfirmModal(null)
    confirmResolverRef.current?.(true)
  }, [])

  const handleConfirmCancel = useCallback(() => {
    setConfirmModal(null)
    confirmResolverRef.current?.(false)
  }, [])

  // Fetch assets from API on mount
  useEffect(() => {
    fetch('/api/structure-assets')
      .then(r => r.json())
      .then(data => {
        if (data?.assets) {
          const map = {}
          for (const a of data.assets) {
            map[a.key] = {
              price: Number(a.base_price),
              label: a.label,
              glow: a.glow_color,
              icon: null,
              imageUrl: a.image_url || '',
              logoUrl: a.logo_url || '',
              sort_order: a.sort_order || 0,
            }
          }
          setAssets(map)
          setStore(s => ({ ...s, structureAssets: map }))
        }
      })
      .catch(err => console.error('Failed to fetch assets:', err))
  }, [])


  // Restore auto-saved session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved) {
        const session = JSON.parse(saved)
        if (session.nodes?.length > 0 || session.edges?.length > 0) {
          setNodes(session.nodes || [])
          setEdges(session.edges || [])
          if (session.draftName) setDraftName(session.draftName)
          setAutoSaveStatus('Session restored')
          setTimeout(() => setAutoSaveStatus(''), 3000)
        }
      }
    } catch (err) {
      console.error('Session restore error:', err)
    }
  }, [SESSION_KEY, setNodes, setEdges, setDraftName])

  // Auto-save session every 1s when nodes/edges change
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) return
    setAutoSaveStatus('Saving…')
    const timer = setTimeout(() => {
      try {
        const session = {
          nodes,
          edges,
          draftName,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        setAutoSaveStatus('Auto-saved')
        setTimeout(() => setAutoSaveStatus(''), 2000)
      } catch (err) {
        console.error('Auto-save error:', err)
        setAutoSaveStatus('Save failed')
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [nodes, edges, draftName, SESSION_KEY])

  // Clear session when canvas is cleared
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [nodes.length, edges.length, SESSION_KEY])

  // Load drafts and orders on mount
  useEffect(() => {
    fetchStructureDrafts(user?.id).then(res => {
      if (res?.drafts) {
        setDrafts(res.drafts)
        setStore(s => ({ ...s, structureDrafts: res.drafts }))
      }
    }).catch(() => {})

    fetchStructureOrders(true, user?.id).then(res => {
      if (res?.orders) setStructureOrders(res.orders)
    }).catch(() => {})
  }, [user?.id])

  // Listen for individual node delete from BaseNode
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.nodeId) deleteNode(e.detail.nodeId)
    }
    window.addEventListener('builder-delete-node', handler)
    return () => window.removeEventListener('builder-delete-node', handler)
  }, [deleteNode])

  // Listen for edge role updates from CustomEdge
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.edgeId && e.detail?.role) {
        updateEdgeRole(e.detail.edgeId, e.detail.role)
      }
    }
    window.addEventListener('builder-update-edge-role', handler)
    return () => window.removeEventListener('builder-update-edge-role', handler)
  }, [updateEdgeRole])

  // Handle drop from toolbar
  const handleDrop = useCallback((type, position) => {
    addNode(type, position)
  }, [addNode])

  // Fit view helper
  const handleFitView = useCallback(() => {
    window.dispatchEvent(new CustomEvent('reactflow-fitview'))
  }, [])

  // Save draft
  const handleSaveDraft = useCallback(async (name, draftId = null) => {
    if (nodes.length === 0) {
      alert('Add some assets first before saving.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: name || draftName,
        nodes,
        edges,
        total_price: priceBreakdown.total,
        node_count: priceBreakdown.nodeCount,
        edge_count: priceBreakdown.edgeCount,
      }

      if (draftId) {
        await updateStructureDraft(draftId, payload)
        setActiveDraftId(draftId)
        setDrafts(prev => {
          const next = prev.map(d => d.id === draftId
            ? { ...d, name: payload.name, nodes_json: JSON.stringify(payload.nodes), edges_json: JSON.stringify(payload.edges), total_price: payload.total_price, node_count: payload.node_count, edge_count: payload.edge_count, updated_at: new Date().toISOString() }
            : d
          )
          setStore(s => ({ ...s, structureDrafts: next }))
          return next
        })
      } else {
        const res = await createStructureDraft({ ...payload, user_id: user?.id })
        if (res?.id) {
          const newDraft = {
            id: res.id,
            user_id: user?.id,
            name: payload.name,
            nodes_json: JSON.stringify(payload.nodes),
            edges_json: JSON.stringify(payload.edges),
            total_price: payload.total_price,
            node_count: payload.node_count,
            edge_count: payload.edge_count,
            submitted: false,
            order_id: null,
            order_status: null,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          }
          setActiveDraftId(res.id)
          setDrafts(prev => {
            const next = [newDraft, ...prev]
            setStore(s => ({ ...s, structureDrafts: next }))
            return next
          })
        }
      }
      setShowDraftManager(false)
    } catch (err) {
      console.error('Save draft error:', err)
      alert('Failed to save draft. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [draftName, nodes, edges, priceBreakdown, drafts, user?.id, setShowDraftManager])

  // Load draft
  const handleLoadDraft = useCallback((draft) => {
    try {
      const loadedNodes = JSON.parse(draft.nodes_json || '[]')
      const loadedEdges = JSON.parse(draft.edges_json || '[]')
      setNodes(loadedNodes)
      setEdges(loadedEdges)
      setDraftName(draft.name)
      setActiveDraftId(draft.id)
      setShowDraftManager(false)
    } catch (err) {
      console.error('Load draft error:', err)
      alert('Failed to load draft.')
    }
  }, [setNodes, setEdges, setDraftName])

  // Delete draft
  const handleDeleteDraft = useCallback(async (id) => {
    const ok = await showConfirm({
      title: 'Delete Structure',
      message: 'This draft will be permanently deleted and cannot be recovered.',
      confirmLabel: 'Delete',
      confirmColor: '#ef4444',
    })
    if (!ok) return
    try {
      await deleteStructureDraft(id)
      setDrafts(prev => {
        const next = prev.filter(d => d.id !== id)
        setStore(s => ({ ...s, structureDrafts: next }))
        return next
      })
      if (activeDraftId === id) setActiveDraftId(null)
    } catch (err) {
      console.error('Delete draft error:', err)
    }
  }, [activeDraftId])

  // Submit order
  const handleSubmit = useCallback(async () => {
    const total = priceBreakdown.total
    if (total <= 0) {
      alert('Structure price must be greater than $0 to submit.')
      return
    }
    if (store.balance < total) {
      alert(`Insufficient balance. You need $${total.toFixed(2)} but only have $${store.balance.toFixed(2)}. Please top up.`)
      return
    }
    setIsSubmitting(true)
    try {
      const payload = {
        name: draftName,
        nodes,
        edges,
        total_price: total,
        node_count: priceBreakdown.nodeCount,
        edge_count: priceBreakdown.edgeCount,
        user_id:    user?.id,
        user_name:  user?.name,
        user_email: user?.email,
        draft_id:   activeDraftId,
      }
      const res = await createStructureOrder(payload)

      // Mark the linked draft as submitted
      if (activeDraftId) {
        await updateStructureDraft(activeDraftId, {
          submitted: true,
          order_id: res?.id,
          order_status: 'pending',
        })
        setDrafts(prev => prev.map(d => d.id === activeDraftId
          ? { ...d, submitted: true, order_id: res?.id, order_status: 'pending' }
          : d
        ))
      }

      // Deduct balance in Supabase and locally
      const newBalance = store.balance - total
      await updateUser(user.id, { balance: newBalance })
      setStore(s => ({ ...s, balance: newBalance }))

      // Record transaction in Supabase and locally
      const dateStr = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      await createTransaction({
        user_id: user.id,
        type: 'Spent',
        method: 'Structure Order',
        amount: -total,
        status: 'completed',
        date: dateStr,
      })
      const tx = { id: 'TX-' + Date.now(), type: 'Spent', method: 'Structure Order', amount: -total, status: 'completed', date: dateStr, order_code: res?.order_code || res?.id }
      setStore(s => ({ ...s, transactions: [tx, ...s.transactions] }))

      // Add to structure orders list
      const newOrder = {
        id: res?.id || Date.now(),
        order_code: res?.order_code || 'STR-' + Date.now(),
        name: draftName,
        total_price: total,
        node_count: priceBreakdown.nodeCount,
        edge_count: priceBreakdown.edgeCount,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setStore(s => ({ ...s, structureOrders: [newOrder, ...s.structureOrders] }))

      setShowSubmitModal(false)
      alert('Order submitted successfully!')
    } catch (err) {
      console.error('Submit error:', err)
      alert('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [draftName, nodes, edges, priceBreakdown, store.balance, setIsSubmitting, activeDraftId])

  // New structure — only confirm if canvas has content AND it's never been saved
  const handleNewStructure = useCallback(async () => {
    const hasContent = nodes.length > 0 || edges.length > 0
    if (hasContent && !activeDraftId) {
      const ok = await showConfirm({
        title: 'New Structure',
        message: 'Your canvas has unsaved content. Starting a new structure will clear it.',
        confirmLabel: 'Start New',
        confirmColor: '#22c55e',
      })
      if (!ok) return
    }
    clearAll()
    setActiveDraftId(null)
    setDraftName('Untitled Structure')
    localStorage.removeItem(SESSION_KEY)
  }, [nodes.length, edges.length, activeDraftId, clearAll, SESSION_KEY, setDraftName, showConfirm])

  // Quick save: update existing active draft, or open modal to name a new one
  const quickSave = useCallback(() => {
    if (nodes.length === 0) {
      alert('Add some assets first before saving.')
      return
    }
    if (activeDraftId) {
      handleSaveDraft(draftName, activeDraftId)
    } else {
      setShowDraftManager(true)
    }
  }, [nodes.length, activeDraftId, draftName, handleSaveDraft])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: isDark ? '#0f0f1a' : '#f5f5f8',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
    }}>
      {/* Main workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Toolbar */}
        <BuilderToolbar
          assets={assets}
          onAddNode={addNode}
          onClearAll={async () => {
            if (nodes.length === 0 && edges.length === 0) return
            const ok = await showConfirm({
              title: 'Clear Canvas',
              message: 'This will remove all nodes and connections from the canvas. This cannot be undone.',
              confirmLabel: 'Clear',
              confirmColor: '#ef4444',
            })
            if (ok) { clearAll(); setActiveDraftId(null) }
          }}
          onFitView={handleFitView}
        />

        {/* Canvas area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {/* Top bar inside builder */}
          <div style={{
            height: 52,
            background: TC.card,
            borderBottom: `1px solid ${TC.g200}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: TC.text }}>
                Structure Builder
              </div>
              <div style={{
                fontSize: 11, color: TC.g500, background: isDark ? 'rgba(255,255,255,.05)' : TC.g100,
                padding: '3px 10px', borderRadius: 20,
              }}>
                {priceBreakdown.nodeCount} assets · ${priceBreakdown.total}
              </div>
              {/* Undo/Redo buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                  style={{
                    width: 28, height: 28, borderRadius: 7,
                    border: `1px solid ${canUndo ? TC.g300 : TC.g200}`,
                    background: canUndo ? TC.g100 : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: canUndo ? 'pointer' : 'not-allowed',
                    opacity: canUndo ? 1 : 0.4,
                  }}
                >
                  <Undo2 size={14} color={TC.g600} />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y)"
                  style={{
                    width: 28, height: 28, borderRadius: 7,
                    border: `1px solid ${canRedo ? TC.g300 : TC.g200}`,
                    background: canRedo ? TC.g100 : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: canRedo ? 'pointer' : 'not-allowed',
                    opacity: canRedo ? 1 : 0.4,
                  }}
                >
                  <Redo2 size={14} color={TC.g600} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Auto-save status */}
              {autoSaveStatus && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11, color: autoSaveStatus === 'Save failed' ? TC.red : TC.g500,
                  background: isDark ? 'rgba(255,255,255,.05)' : TC.g100,
                  padding: '3px 10px', borderRadius: 20,
                  transition: 'opacity 0.3s',
                }}>
                  {autoSaveStatus === 'Saving…'
                    ? <Cloud size={11} />
                    : <CloudCheck size={11} />}
                  {autoSaveStatus}
                </div>
              )}
              {/* Connection type selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <GitBranch size={14} color={TC.g500} />
                <select
                  value={connectionType}
                  onChange={e => setConnectionType(e.target.value)}
                  style={{
                    padding: '5px 10px', borderRadius: 8,
                    border: `1px solid ${TC.g300}`, background: TC.card,
                    color: TC.text, fontSize: 12, fontFamily: "inherit",
                    outline: 'none', cursor: 'pointer',
                  }}
                >
                  {Object.entries(CONNECTION_REGISTRY).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleNewStructure}
                title="Start a new structure"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8,
                  border: '1px solid #22c55e40', background: '#22c55e12',
                  color: '#22c55e', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#22c55e22' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#22c55e12' }}
              >
                <Plus size={13} />
                New
              </button>
              <button
                onClick={quickSave}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8,
                  border: `1px solid ${TC.g300}`, background: TC.g100,
                  color: TC.g700, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                <Save size={13} />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowDraftManager(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8,
                  border: `1px solid ${TC.g300}`, background: TC.g100,
                  color: TC.g700, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                <FolderOpen size={13} />
                Drafts
              </button>
              <StructuresHistoryDropdown
                drafts={drafts}
                orders={structureOrders}
                activeDraftId={activeDraftId}
                onLoad={handleLoadDraft}
                onDelete={handleDeleteDraft}
              />
            </div>
          </div>

          {/* Canvas */}
          <div style={{ flex: 1, padding: 12, overflow: 'hidden' }}>
            <div style={{
              width: '100%', height: '100%',
              borderRadius: 14,
              border: `1px solid ${TC.g200}`,
              background: isDark ? '#0a0a14' : '#ffffff',
              overflow: 'hidden',
            }}>
              <FlowCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={handleDrop}
                fitView
              />
            </div>
          </div>
        </div>

        {/* Price Panel */}
        <PricePanel
          priceBreakdown={priceBreakdown}
          onSaveDraft={quickSave}
          onSubmit={() => setShowSubmitModal(true)}
          isSubmitting={isSubmitting}
        />
      </div>


      {/* Draft Manager Modal */}
      <DraftManager
        isOpen={showDraftManager}
        onClose={() => setShowDraftManager(false)}
        drafts={drafts}
        onLoad={handleLoadDraft}
        onSave={handleSaveDraft}
        onDelete={handleDeleteDraft}
        currentDraftName={draftName}
        activeDraftId={activeDraftId}
      />

      {/* Submit Modal */}
      <SubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        priceBreakdown={priceBreakdown}
        draftName={draftName}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Custom confirm dialog — replaces all window.confirm() calls */}
      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        confirmColor={confirmModal?.confirmColor}
        onConfirm={handleConfirmOk}
        onCancel={handleConfirmCancel}
      />
    </div>
  )
}

export default function StructureBuilderPage() {
  return (
    <ReactFlowProvider>
      <BuilderInner />
    </ReactFlowProvider>
  )
}
