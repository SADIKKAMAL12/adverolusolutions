import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import { CONNECTION_REGISTRY } from '../nodes/nodeRegistry.js'
import { getEdgeStyle } from '../edges/edgeTypes.js'

const ROLES = ['admin', 'advertiser', 'finance']

function cloneNodes(nodes) {
  return nodes.map(n => ({ ...n, data: { ...n.data } }))
}
function cloneEdges(edges) {
  return edges.map(e => ({ ...e, data: e.data ? { ...e.data } : undefined }))
}

export function useStructureBuilder(assetsMap = {}, defaultConnectionType = 'admin') {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [history, setHistory] = useState([{ nodes: [], edges: [] }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [draftName, setDraftName] = useState('Untitled Structure')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDraftManager, setShowDraftManager] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  // Track if we're restoring from history (to avoid pushing history twice)
  const restoring = useRef(false)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const pushHistory = useCallback((newNodes, newEdges) => {
    if (restoring.current) return
    setHistory(prev => {
      const next = prev.slice(0, historyIndex + 1)
      next.push({ nodes: cloneNodes(newNodes), edges: cloneEdges(newEdges) })
      return next
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  const undo = useCallback(() => {
    if (!canUndo) return
    restoring.current = true
    const prev = history[historyIndex - 1]
    setNodes(cloneNodes(prev.nodes))
    setEdges(cloneEdges(prev.edges))
    setHistoryIndex(historyIndex - 1)
    setTimeout(() => { restoring.current = false }, 0)
  }, [canUndo, history, historyIndex])

  const redo = useCallback(() => {
    if (!canRedo) return
    restoring.current = true
    const next = history[historyIndex + 1]
    setNodes(cloneNodes(next.nodes))
    setEdges(cloneEdges(next.edges))
    setHistoryIndex(historyIndex + 1)
    setTimeout(() => { restoring.current = false }, 0)
  }, [canRedo, history, historyIndex])

  // Helper to get asset meta from live map or fallback
  const getAssetMeta = useCallback((type) => {
    return assetsMap[type] || { price: 0, label: type, icon: null, glow: '#3b82f6' }
  }, [assetsMap])

  // Price calculation
  const priceBreakdown = useMemo(() => {
    const counts = {}
    let total = 0
    for (const node of nodes) {
      const meta = getAssetMeta(node.type)
      counts[node.type] = (counts[node.type] || 0) + 1
      total += meta.price
    }
    const items = Object.entries(counts).map(([type, count]) => {
      const meta = getAssetMeta(type)
      return { type, label: meta.label, count, unitPrice: meta.price, subtotal: count * meta.price }
    }).sort((a, b) => b.subtotal - a.subtotal)
    return { items, total, nodeCount: nodes.length, edgeCount: edges.length }
  }, [nodes, edges, getAssetMeta])

  // Add node
  const addNode = useCallback((type, position = { x: 100, y: 100 }) => {
    const meta = getAssetMeta(type)
    const id = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    const newNode = {
      id,
      type,
      position: { ...position },
      data: {
        nodeType: type,
        label: meta.label,
        subtitle: '',
        price: meta.price,
        imageUrl: meta.imageUrl || '',
        logoUrl: meta.logoUrl || '',
        // role removed from node — now on edge
      },
    }
    const nextNodes = [...nodes, newNode]
    setNodes(nextNodes)
    setSelectedNodeId(id)
    pushHistory(nextNodes, edges)
  }, [nodes, edges, getAssetMeta, pushHistory])

  // Delete single node
  const deleteNode = useCallback((id) => {
    const nextNodes = nodes.filter(n => n.id !== id)
    const nextEdges = edges.filter(e => e.source !== id && e.target !== id)
    setNodes(nextNodes)
    setEdges(nextEdges)
    pushHistory(nextNodes, nextEdges)
  }, [nodes, edges, pushHistory])

  // Update edge role
  const updateEdgeRole = useCallback((id, role) => {
    const nextEdges = edges.map(e => e.id === id ? { ...e, data: { ...e.data, role } } : e)
    setEdges(nextEdges)
    pushHistory(nodes, nextEdges)
  }, [nodes, edges, pushHistory])

  // Clear all — confirmation is handled by the caller
  const clearAll = useCallback(() => {
    setNodes([])
    setEdges([])
    setSelectedNodeId(null)
    pushHistory([], [])
  }, [pushHistory])

  // Remove selected (via Delete key)
  const removeSelected = useCallback(() => {
    const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id)
    const selectedEdgeIds = edges.filter(e => e.selected).map(e => e.id)
    if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) return
    const nextNodes = nodes.filter(n => !n.selected)
    const nextEdges = edges.filter(e => !e.selected && !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target))
    setNodes(nextNodes)
    setEdges(nextEdges)
    pushHistory(nextNodes, nextEdges)
  }, [nodes, edges, pushHistory])

  // React Flow change handlers
  const onNodesChange = useCallback((changes) => {
    setNodes(prev => applyNodeChanges(changes, prev))
  }, [])

  const onEdgesChange = useCallback((changes) => {
    setEdges(prev => applyEdgeChanges(changes, prev))
  }, [])

  // On connect
  const onConnect = useCallback((params) => {
    const connectionType = defaultConnectionType || 'admin'
    const style = getEdgeStyle(connectionType)
    const meta = CONNECTION_REGISTRY[connectionType] || CONNECTION_REGISTRY.admin
    const nextEdges = addEdge({
      ...params,
      type: 'custom',
      label: meta.label,
      animated: style.animated,
      data: { connectionType, label: meta.label, role: 'admin' },
    }, edges)
    setEdges(nextEdges)
    pushHistory(nodes, nextEdges)
  }, [nodes, edges, defaultConnectionType, pushHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      // Redo: Ctrl/Cmd + Shift + Z  or  Ctrl/Cmd + Y
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault()
        redo()
        return
      }
      // Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = document.activeElement
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return
        removeSelected()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, removeSelected])

  return {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange,
    selectedNodeId, setSelectedNodeId,
    draftName, setDraftName,
    isSubmitting, setIsSubmitting,
    showDraftManager, setShowDraftManager,
    showSubmitModal, setShowSubmitModal,
    priceBreakdown,
    addNode, deleteNode, updateEdgeRole, removeSelected, clearAll, onConnect,
    undo, redo, canUndo, canRedo,
  }
}
