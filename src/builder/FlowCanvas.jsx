import { useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  useStore,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes } from './nodes/NodeTypes.jsx'
import CustomEdge from './edges/CustomEdge.jsx'
import { useTheme } from '../shared/ThemeContext.jsx'

const edgeTypes = { custom: CustomEdge }

function FlowCanvasInner({
  nodes, edges, onNodesChange, onEdgesChange, onConnect,
  onNodeClick, onEdgeClick, onPaneClick, onDrop, fitView,
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { screenToFlowPosition } = useReactFlow()
  const transform = useStore((s) => s.transform)
  const wrapperRef = useRef(null)

  // Manual coordinate conversion fallback
  const toFlowPosition = useCallback((clientX, clientY) => {
    // Try React Flow's built-in converter first
    try {
      const pos = screenToFlowPosition({ x: clientX, y: clientY })
      if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
        return pos
      }
    } catch (e) {
      console.warn('screenToFlowPosition failed:', e)
    }

    // Manual fallback using viewport transform
    if (!wrapperRef.current || !transform) {
      return { x: clientX, y: clientY }
    }

    const rect = wrapperRef.current.getBoundingClientRect()
    const [viewportX, viewportY, zoom] = transform
    return {
      x: (clientX - rect.left - viewportX) / zoom,
      y: (clientY - rect.top - viewportY) / zoom,
    }
  }, [screenToFlowPosition, transform])

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    console.log('[DND] dragover on canvas')
  }, [])

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    console.log('[DND] drop event fired')

    // Try both data types for cross-browser compatibility
    let type = event.dataTransfer.getData('application/reactflow')
    if (!type) {
      type = event.dataTransfer.getData('text/plain')
    }

    console.log('[DND] dropped type:', type)

    if (!type || typeof type !== 'string') {
      console.warn('[DND] No valid type found in dataTransfer')
      return
    }

    const position = toFlowPosition(event.clientX, event.clientY)
    console.log('[DND] flow position:', position)

    if (onDrop) onDrop(type, position)
  }, [onDrop, toFlowPosition])

  return (
    <div
      ref={wrapperRef}
      style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={fitView}
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'custom', animated: false }}
        style={{ background: 'transparent' }}
        proOptions={{ hideAttribution: true }}
        connectionMode="loose"
        connectionLineStyle={{
          stroke: '#E8192C',
          strokeWidth: 2,
        }}
      >
        <Background
          color={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}
          gap={20}
          size={1}
          variant="dots"
        />
        <Controls
          style={{
            background: isDark ? '#1a1a2e' : '#ffffff',
            border: `1px solid ${isDark ? '#2d2d44' : '#e5e7eb'}`,
            borderRadius: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
      </ReactFlow>
    </div>
  )
}

export default function FlowCanvas(props) {
  return <FlowCanvasInner {...props} />
}
