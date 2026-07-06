import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow, Background, Controls,
  addEdge, applyEdgeChanges, applyNodeChanges,
  Handle, Position, useReactFlow,
  BaseEdge, EdgeLabelRenderer, getBezierPath,
  ReactFlowProvider, ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  User, ShieldCheck, Building2, Megaphone, Briefcase, FileStack, Heart,
  Activity, Database, Globe, Users, UserCog, TrendingUp,
  ChevronLeft, ChevronRight, PanelLeftOpen, PanelRightOpen,
} from 'lucide-react';

import { Layout } from '../shared/Layout.jsx';
import { PageHead, ErrorBanner, SuccessBanner, Spinner, StatusPill, fmtMoney, fmtDate } from '../shared/UI.jsx';
import { Icon } from '../shared/Icon.jsx';
import { api } from '../shared/api.js';
import { useStore, setStore } from '../shared/store.js';
import { useAuth } from '../shared/AuthContext.jsx';
import InsufficientBalanceModal from '../shared/InsufficientBalanceModal.jsx';
import OrderConfirmModal from '../shared/OrderConfirmModal.jsx';

/* ─── Node registry ─────────────────────────────────── */
const NODE_REGISTRY = {
  profile:            { label: 'Profile',            Icon: User,        price: 40,  glow: '#3b82f6' },
  bm_verified:        { label: 'BM Verified',        Icon: ShieldCheck, price: 250, glow: '#10b981' },
  agency_bm:          { label: 'Agency BM',          Icon: Building2,   price: 300, glow: '#8b5cf6' },
  advertiser_account: { label: 'Advertiser Account', Icon: Megaphone,   price: 60,  glow: '#f59e0b' },
  client_ad_account:  { label: 'Client Ad Account',  Icon: Briefcase,   price: 60,  glow: '#06b6d4' },
  pages_bm:           { label: 'Pages BM',           Icon: FileStack,   price: 80,  glow: '#ec4899' },
  fan_page:           { label: 'Fan Page',           Icon: Heart,       price: 35,  glow: '#ef4444' },
  pixel:              { label: 'Pixel',              Icon: Activity,    price: 25,  glow: '#14b8a6' },
  dataset:            { label: 'Dataset',            Icon: Database,    price: 20,  glow: '#6366f1' },
  domain:             { label: 'Domain',             Icon: Globe,       price: 30,  glow: '#f97316' },
  backup_admin:       { label: 'Backup Admin',       Icon: Users,       price: 25,  glow: '#84cc16' },
  employee:           { label: 'Employee',           Icon: UserCog,     price: 15,  glow: '#64748b' },
  media_buyer:        { label: 'Media Buyer',        Icon: TrendingUp,  price: 45,  glow: '#d946ef' },
};
const NODE_KEYS = Object.keys(NODE_REGISTRY);

/* ─── Connection registry ────────────────────────────── */
const CONNECTION_REGISTRY = {
  admin:             { label: 'Admin',             color: '#ef4444', dash: undefined, animated: false },
  partner:           { label: 'Partner',           color: '#3b82f6', dash: undefined, animated: false },
  advertiser_access: { label: 'Advertiser Access', color: '#f59e0b', dash: '5,5',    animated: true  },
  employee:          { label: 'Employee',          color: '#10b981', dash: '2,4',    animated: false },
  pixel_sharing:     { label: 'Pixel Sharing',     color: '#8b5cf6', dash: '8,4,2,4', animated: true },
  domain_sharing:    { label: 'Domain Sharing',    color: '#06b6d4', dash: '4,4',    animated: false },
};
const CONNECTION_KEYS = Object.keys(CONNECTION_REGISTRY);

/* ─── Injected styles ────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('sb-node-styles')) {
  const s = document.createElement('style');
  s.id = 'sb-node-styles';
  s.textContent = `
    @keyframes sbMount { 0%{opacity:0;transform:scale(.78) translateY(10px)} 60%{opacity:1;transform:scale(1.04) translateY(-2px)} 100%{transform:scale(1) translateY(0)} }
    @keyframes sbDrop  { 0%{transform:scale(1)} 20%{transform:scale(1.1)} 45%{transform:scale(.94)} 65%{transform:scale(1.05)} 82%{transform:scale(.98)} 100%{transform:scale(1)} }
    @keyframes sbGlow  { 0%,100%{box-shadow:var(--ring-a)} 50%{box-shadow:var(--ring-b)} }
    @keyframes sbPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
    .sb-node-mount  { animation: sbMount .4s cubic-bezier(.22,1,.36,1) both; }
    .sb-node-drop   { animation: sbDrop  .6s cubic-bezier(.36,.07,.19,.97) both; }
    .sb-node-glow   { animation: sbGlow  2s ease-in-out infinite; }
    .sb-icon-pulse  { animation: sbPulse 2s ease-in-out infinite; }

    .react-flow__handle {
      width: 14px !important; height: 14px !important;
      border-radius: 50% !important;
      border-width: 2.5px !important;
      cursor: crosshair !important;
      transition: transform .12s, box-shadow .12s !important;
    }
    .react-flow__handle:hover {
      transform: scale(1.5) !important;
    }
    .react-flow__connection-line {
      stroke-width: 2.5 !important;
      stroke: #ef2b2b !important;
      stroke-dasharray: 7 4 !important;
    }
    /* hide default attribution */
    .react-flow__attribution { display: none !important; }
    /* Controls theming */
    .react-flow__controls {
      background: var(--sb-panel-bg) !important;
      border: 1px solid var(--line) !important;
      border-radius: 10px !important;
      backdrop-filter: blur(16px) !important;
      overflow: hidden;
    }
    .react-flow__controls-button {
      background: transparent !important;
      border-bottom: 1px solid var(--line) !important;
      color: var(--muted) !important;
      fill: var(--muted) !important;
    }
    .react-flow__controls-button:hover {
      background: var(--line) !important;
      color: var(--ink) !important;
      fill: var(--ink) !important;
    }
    .react-flow__controls-button:last-child { border-bottom: none !important; }
  `;
  document.head.appendChild(s);
}

/* ─── BaseNode ───────────────────────────────────────── */
const BaseNode = memo(function BaseNode({ id, data, selected, dragging }) {
  const meta = NODE_REGISTRY[data.nodeType] || NODE_REGISTRY.profile;
  const glow = data.glow || meta.glow;
  const NodeIcon = meta.Icon;
  const { setNodes } = useReactFlow();

  const [editingTitle, setEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(data.label || meta.label);
  const [mounted, setMounted] = useState(false);
  const [dropped, setDropped] = useState(false);
  const prevDragging = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (prevDragging.current && !dragging) {
      setDropped(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setDropped(true)));
      const t = setTimeout(() => setDropped(false), 700);
      return () => clearTimeout(t);
    }
    prevDragging.current = dragging;
  }, [dragging]);

  const updateLabel = useCallback((v) => {
    setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, label: v } } : n));
  }, [id, setNodes]);

  const handleDelete = useCallback(() => {
    setNodes(ns => ns.filter(n => n.id !== id));
  }, [id, setNodes]);

  const ringA = `0 0 0 2px ${glow}55, 0 0 18px ${glow}40`;
  const ringB = `0 0 0 3px ${glow}80, 0 0 32px ${glow}60`;
  const animClass = [
    !mounted ? 'sb-node-mount' : '',
    dropped ? 'sb-node-drop' : '',
    selected ? 'sb-node-glow' : '',
  ].filter(Boolean).join(' ');

  const handleStyle = {
    background: glow,
    border: `2.5px solid #fff`,
    boxShadow: `0 0 8px ${glow}aa`,
    width: 14, height: 14,
    borderRadius: '50%',
  };

  return (
    <div
      className={animClass}
      style={{ '--ring-a': ringA, '--ring-b': ringB, position: 'relative', width: 196, fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}
    >
      {/* Handles — all four sides, loose mode */}
      <Handle type="source" position={Position.Top}    id="top"    style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />
      <Handle type="source" position={Position.Left}   id="left"   style={handleStyle} />
      <Handle type="source" position={Position.Right}  id="right"  style={handleStyle} />

      {/* Delete */}
      <button
        onClick={handleDelete}
        title="Remove"
        style={{
          position: 'absolute', top: -8, right: -8, zIndex: 10,
          width: 20, height: 20, borderRadius: '50%',
          background: 'linear-gradient(135deg,#ef4444,#dc2626)',
          color: '#fff', border: '2px solid #fff',
          fontSize: 13, fontWeight: 900, lineHeight: 1,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(239,68,68,.4)', padding: 0,
          transition: 'transform .12s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >×</button>

      {/* Card */}
      <div style={{
        borderRadius: 14, overflow: 'hidden',
        border: `1.5px solid ${selected ? glow + 'cc' : glow + '30'}`,
        boxShadow: selected
          ? `0 0 0 2px ${glow}55, 0 0 20px ${glow}45, 0 8px 32px rgba(0,0,0,.3)`
          : `0 0 10px ${glow}18, 0 4px 20px rgba(0,0,0,.25)`,
        background: 'linear-gradient(145deg,#141417 0%,#0f0f12 100%)',
        transition: 'border-color .18s, box-shadow .18s',
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg,${glow}ee,${glow}55 60%,transparent)` }} />
        <div style={{ padding: '12px 12px 10px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
            <div
              className={selected ? 'sb-icon-pulse' : ''}
              style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg,${glow}25,${glow}12)`,
                border: `1.5px solid ${glow}45`,
                boxShadow: `0 0 12px ${glow}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: glow, overflow: 'hidden',
              }}
            >
              {data.logoUrl
                ? <img src={data.logoUrl} alt={data.label} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                : <NodeIcon size={17} strokeWidth={2} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingTitle ? (
                <input
                  autoFocus
                  value={localTitle}
                  onChange={e => setLocalTitle(e.target.value)}
                  onBlur={() => { setEditingTitle(false); updateLabel(localTitle); }}
                  onKeyDown={e => { if (e.key === 'Enter') { setEditingTitle(false); updateLabel(localTitle); } }}
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${glow}`, color: '#f4f4f5', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', outline: 'none', padding: 0 }}
                />
              ) : (
                <div
                  onDoubleClick={() => setEditingTitle(true)}
                  title="Double-click to rename"
                  style={{ fontSize: 12, fontWeight: 800, color: '#f1f1f1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'text', lineHeight: 1.2 }}
                >{localTitle || meta.label}</div>
              )}
              <div style={{ fontSize: 10, color: '#787880', marginTop: 1 }}>{meta.label}</div>
            </div>
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg,${glow}28,transparent)`, marginBottom: 8 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: `${glow}14`, border: `1px solid ${glow}30`,
              borderRadius: 20, padding: '3px 9px',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: glow }} />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: glow }}>${data.price ?? meta.price}</span>
            </div>
            <div style={{ fontSize: 8.5, color: '#787880', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>per unit</div>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ─── Custom edge ────────────────────────────────────── */
const CustomEdge = memo(function CustomEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected }) {
  const connType = data?.connectionType || 'admin';
  const meta = CONNECTION_REGISTRY[connType] || CONNECTION_REGISTRY.admin;
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const [showMenu, setShowMenu] = useState(false);

  const changeType = useCallback((type) => {
    window.dispatchEvent(new CustomEvent('sb-change-edge-type', { detail: { edgeId: id, connectionType: type } }));
    setShowMenu(false);
  }, [id]);

  return (
    <>
      <defs>
        <marker id={`arr-${id}`} markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill={meta.color} />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: meta.color, strokeWidth: selected ? 3 : 2, strokeDasharray: meta.dash, transition: 'stroke-width .15s' }}
        markerEnd={`url(#arr-${id})`}
      />
      <EdgeLabelRenderer>
        <div style={{ position: 'absolute', transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all', zIndex: 10 }}>
          <span
            onClick={e => { e.stopPropagation(); setShowMenu(o => !o); }}
            title="Click to change type"
            style={{
              fontSize: 10, fontWeight: 700, color: '#fff',
              background: meta.color, padding: '2px 9px', borderRadius: 10,
              whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none',
              fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", letterSpacing: .3,
              boxShadow: `0 2px 8px ${meta.color}44`,
            }}
          >{meta.label}</span>
          {showMenu && (
            <>
              <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 20 }} />
              <div style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 10, boxShadow: '0 6px 24px rgba(0,0,0,.35)', padding: 4, minWidth: 160, zIndex: 30 }}>
                {CONNECTION_KEYS.map(k => {
                  const m = CONNECTION_REGISTRY[k];
                  return (
                    <div key={k} onClick={e => { e.stopPropagation(); changeType(k); }}
                      style={{ padding: '7px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: m.color, cursor: 'pointer', background: connType === k ? `${m.color}18` : 'transparent', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .1s' }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                      {m.label}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

const nodeTypes = { base: BaseNode };
const edgeTypes = { custom: CustomEdge };

/* ─── Canvas (pure ReactFlow wrapper) ───────────────── */
function BuilderCanvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onInit, canvasRef, onDragOver, onDrop }) {
  return (
    <div
      ref={canvasRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'custom', animated: false }}
        connectionLineStyle={{ stroke: '#ef2b2b', strokeWidth: 2.5, strokeDasharray: '7 4' }}
        connectionMode={ConnectionMode.Loose}
        elevateEdgesOnSelect
        minZoom={0.05}
        maxZoom={3}
        panOnDrag={[1, 2]}
        zoomOnDoubleClick={false}
        style={{ background: 'var(--sb-canvas)' }}
      >
        <Background gap={26} size={1.5} color="var(--bg-grid-dot)" variant="dots" />
        <Controls
          position="bottom-right"
          showInteractive={false}
          style={{ margin: '0 16px 16px 0' }}
        />
      </ReactFlow>
    </div>
  );
}

/* ─── Floating panel ─────────────────────────────────── */
const PANEL_W = 232;

function FloatPanel({ side, open, onToggle, header, children }) {
  const pos = side === 'left'
    ? { left: open ? 12 : -PANEL_W - 4 }
    : { right: open ? 12 : -PANEL_W - 4 };

  return (
    <>
      {/* Sliding panel */}
      <div style={{
        position: 'absolute', top: 12, bottom: 12, ...pos,
        width: PANEL_W,
        background: 'var(--sb-panel-bg)',
        backdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid var(--line)',
        borderRadius: 14,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 32px rgba(0,0,0,.18)',
        zIndex: 10,
        transition: `${side} .22s cubic-bezier(.22,1,.36,1)`,
      }}>
        {/* Panel header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 12px', borderBottom: '1px solid var(--line)',
          flexShrink: 0,
        }}>
          {header}
          <button
            onClick={onToggle}
            title={open ? 'Hide panel' : 'Show panel'}
            style={{
              marginLeft: 'auto', width: 24, height: 24, borderRadius: 6,
              background: 'var(--bg-sunken)', border: '1px solid var(--line)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted)', flexShrink: 0, padding: 0, transition: 'background .12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--line)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-sunken)'}
          >
            {side === 'left'
              ? (open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />)
              : (open ? <ChevronRight size={14} /> : <ChevronLeft size={14} />)
            }
          </button>
        </div>
        {children}
      </div>

      {/* Edge toggle tab when panel is hidden */}
      {!open && (
        <button
          onClick={onToggle}
          title="Show panel"
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            [side]: 12, zIndex: 11,
            width: 30, height: 56, borderRadius: 8,
            background: 'var(--sb-panel-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--line)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)',
            boxShadow: '0 2px 12px rgba(0,0,0,.14)',
            padding: 0,
          }}
        >
          {side === 'left' ? <PanelLeftOpen size={15} /> : <PanelRightOpen size={15} />}
        </button>
      )}
    </>
  );
}

/* ─── Premium submit toast ───────────────────────────── */
function SubmitToast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <>
      <style>{`
        @keyframes sb-toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.94); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)      scale(1);    }
        }
        @keyframes sb-toast-bar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      <div style={{
        position: 'fixed', top: 24, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 88888,
        animation: 'sb-toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        pointerEvents: 'all',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'var(--bg-card)',
          border: '1px solid var(--line)',
          borderRadius: 18,
          padding: '14px 18px 14px 16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          minWidth: 320, maxWidth: 480,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Green glow icon */}
          <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg,#16a34a22,#22c55e18)',
            border: '1.5px solid #22c55e44',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 6px #22c55e0a',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.2 }}>
              Order Submitted
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>
              {message}
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            style={{
              width: 24, height: 24, borderRadius: 7,
              background: 'var(--bg-sunken)', border: '1px solid var(--line)',
              color: 'var(--muted)', fontSize: 14, lineHeight: 1,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >×</button>

          {/* Auto-dismiss progress bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
            background: 'var(--line)',
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg,#16a34a,#22c55e)',
              borderRadius: 99,
              animation: 'sb-toast-bar 5s linear both',
            }} />
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main inner component ───────────────────────────── */
function StructureBuilderInner() {
  const { user } = useAuth();
  const [store] = useStore();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // toast (save/load)
  const [orderResult, setOrderResult] = useState(null); // { orderCode, name, total } after submit
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState('Untitled structure');
  const [draftId, setDraftId] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [connectionType, setConnectionType] = useState('admin');
  const [loading, setLoading] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [newStructureConfirm, setNewStructureConfirm] = useState(false);

  const idRef = useRef(1);
  const canvasRef = useRef(null);

  // Bump idRef past the highest numeric id in a loaded node list to prevent id collisions
  const syncIdRef = useCallback((loadedNodes) => {
    let max = idRef.current;
    for (const n of loadedNodes) {
      const num = parseInt(String(n.id).replace(/\D/g, ''), 10);
      if (!isNaN(num) && num >= max) max = num + 1;
    }
    idRef.current = max;
  }, []);
  const [rfInstance, setRfInstance] = useState(null);

  /* ── DB asset overrides (label / price / glow / logo from admin) ── */
  const [dbAssets, setDbAssets] = useState({});

  useEffect(() => {
    api.get('/api/structure-assets').then(data => {
      if (!data?.assets) return;
      const map = {};
      for (const a of data.assets) {
        map[a.key] = {
          label:   a.label          || NODE_REGISTRY[a.key]?.label,
          price:   Number(a.base_price ?? NODE_REGISTRY[a.key]?.price ?? 0),
          glow:    a.glow_color     || NODE_REGISTRY[a.key]?.glow,
          logoUrl: a.logo_url       || '',
          imageUrl: a.image_url     || '',
        };
      }
      setDbAssets(map);
    }).catch(() => {});
  }, []);

  /* Resolved registry: DB data wins over hardcoded defaults */
  const resolvedRegistry = useMemo(() => {
    const result = {};
    for (const key of NODE_KEYS) {
      const base = NODE_REGISTRY[key];
      const db   = dbAssets[key] || {};
      result[key] = {
        ...base,
        label:   db.label   || base.label,
        price:   db.price   ?? base.price,
        glow:    db.glow    || base.glow,
        logoUrl: db.logoUrl || '',
      };
    }
    return result;
  }, [dbAssets]);

  /* ── Load ── */
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.get('/api/structure-drafts?mine=1'),
      api.get('/api/structure-orders?mine=1'),
    ]).then(([draftsRes, ordersRes]) => {
      if (cancelled) return;
      setStore(s => ({
        ...s,
        structureDrafts: Array.isArray(draftsRes) ? draftsRes : (draftsRes?.drafts || draftsRes?.items || []),
        structureOrders: Array.isArray(ordersRes) ? ordersRes : (ordersRes?.orders || ordersRes?.items || []),
      }));
    }).catch(() => {}).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [user]);

  /* ── Consume loadDraftData set by SavedStructuresPage ── */
  useEffect(() => {
    if (!store.loadDraftData) return;
    const ld = store.loadDraftData;
    setDraftId(ld.id);
    setName(ld.name || 'Untitled structure');
    const loadedNodes = Array.isArray(ld.nodes) ? ld.nodes : [];
    setNodes(loadedNodes);
    setEdges(Array.isArray(ld.edges) ? ld.edges : []);
    syncIdRef(loadedNodes);
    setStore(s => ({ ...s, loadDraftData: null }));
  }, [store.loadDraftData]);

  /* ── Edge type changes ── */
  useEffect(() => {
    const handler = (e) => {
      const { edgeId, connectionType: ct } = e.detail;
      setEdges(prev => prev.map(edge => edge.id === edgeId ? { ...edge, data: { ...edge.data, connectionType: ct } } : edge));
    };
    window.addEventListener('sb-change-edge-type', handler);
    return () => window.removeEventListener('sb-change-edge-type', handler);
  }, []);

  /* ── Flow handlers ── */
  const onNodesChange = useCallback(ch => setNodes(ns => applyNodeChanges(ch, ns)), []);
  const onEdgesChange = useCallback(ch => setEdges(es => applyEdgeChanges(ch, es)), []);

  const onConnect = useCallback(params => {
    const m = CONNECTION_REGISTRY[connectionType] || CONNECTION_REGISTRY.admin;
    setEdges(es => addEdge({
      ...params, type: 'custom', animated: m.animated,
      style: { stroke: m.color, strokeWidth: 2 },
      data: { connectionType },
    }, es));
  }, [connectionType]);

  /* ── Add node ── */
  const addNode = useCallback((nodeType, position) => {
    const meta = resolvedRegistry[nodeType] || resolvedRegistry.profile || NODE_REGISTRY.profile;
    const id = 'n' + (idRef.current++);
    setNodes(ns => [...ns, {
      id, type: 'base',
      position: position || { x: 120 + Math.random() * 300, y: 80 + Math.random() * 160 },
      data: {
        nodeType,
        label:   meta.label,
        price:   meta.price,
        glow:    meta.glow,
        logoUrl: meta.logoUrl || '',
      },
    }]);
  }, [resolvedRegistry]);

  /* ── Drag & drop ── */
  const onDragStart = (e, nodeType) => {
    e.dataTransfer.setData('application/adver-node', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = useCallback(e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const onDrop = useCallback(e => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('application/adver-node');
    if (!nodeType || !rfInstance) return;
    const position = rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode(nodeType, position);
  }, [rfInstance, addNode]);

  /* ── Estimate ── */
  const { totalPrice, breakdown } = useMemo(() => {
    let total = 0;
    const groups = {};
    nodes.forEach(n => {
      const meta = NODE_REGISTRY[n.data.nodeType];
      if (!meta) return;
      const price = n.data.price ?? meta.price;
      total += price;
      groups[n.data.nodeType] = groups[n.data.nodeType] || { ...meta, count: 0, total: 0 };
      groups[n.data.nodeType].count++;
      groups[n.data.nodeType].total += price;
    });
    return { totalPrice: total, breakdown: Object.values(groups) };
  }, [nodes]);

  /* ── Save/submit ── */
  const serialize = () => ({ name, nodes, edges, total_price: totalPrice, node_count: nodes.length, edge_count: edges.length });

  const saveDraft = async () => {
    if (!nodes.length) { setError('Add at least one asset.'); return; }
    setBusy(true); setError(null); setSuccess(null);
    try {
      const saved = draftId
        ? await api.put('/api/structure-drafts', { id: draftId, ...serialize() })
        : await api.post('/api/structure-drafts', serialize());
      setDraftId(saved.id || saved.draft_id || draftId);
      setStore(s => {
        const list = s.structureDrafts || [];
        const next = list.some(d => d.id === saved.id) ? list.map(d => d.id === saved.id ? saved : d) : [saved, ...list];
        return { ...s, structureDrafts: next };
      });
      setSuccess('Draft saved.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const submitOrder = () => {
    if (!nodes.length) { setError('Add at least one asset.'); return; }
    if ((store.balance ?? 0) < totalPrice) { setShowBalanceModal(true); return; }
    setShowConfirmModal(true);
  };

  const doSubmitOrder = async () => {
    setBusy(true); setError(null); setSuccess(null);
    const orderName = name;
    const orderTotal = totalPrice;
    try {
      const order = await api.post('/api/structure-orders', { ...serialize(), draft_id: draftId });
      setStore(s => ({
        ...s,
        structureOrders: [order, ...(s.structureOrders || [])],
        balance: typeof s.balance === 'number' ? s.balance - orderTotal : s.balance,
      }));
      setShowConfirmModal(false);
      setNodes([]); setEdges([]); setName('Untitled structure'); setDraftId(null);
      setOrderResult({ orderCode: order.order_code || order.id, name: orderName, total: orderTotal });
    } catch (err) { setError(err.message); setShowConfirmModal(false); }
    finally { setBusy(false); }
  };

  const loadDraft = d => {
    setDraftId(d.id); setName(d.name || 'Untitled structure');
    const loadedNodes = d.nodes || [];
    setNodes(loadedNodes); setEdges(d.edges || []);
    syncIdRef(loadedNodes);
    setSuccess(`Loaded "${d.name || d.id}".`);
  };

  const clearCanvas = () => { setNodes([]); setEdges([]); setDraftId(null); setName('Untitled structure'); };

  const startNewStructure = () => {
    if (nodes.length > 0) {
      setNewStructureConfirm(true);
    } else {
      clearCanvas();
    }
  };

  const confirmNewStructure = () => {
    clearCanvas();
    setNewStructureConfirm(false);
  };

  const saveAndNew = async () => {
    setNewStructureConfirm(false);
    await saveDraft();
    clearCanvas();
  };

  const drafts = store.structureDrafts || [];
  const submitted = store.structureOrders || [];

  // Full-screen success state
  if (orderResult) {
    return (
      <Layout active="structure-builder" crumbs={['Account', 'Structure Builder']}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 'calc(100vh - 65px)', padding: 24,
        }}>
          <div style={{
            maxWidth: 520, width: '100%', textAlign: 'center',
            animation: 'sb-toast-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            {/* Check ring */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 28px',
              background: 'linear-gradient(135deg,#16a34a22,#22c55e18)',
              border: '2px solid #22c55e44',
              boxShadow: '0 0 0 12px #22c55e0a, 0 0 40px #22c55e22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)', letterSpacing: -0.5, marginBottom: 8 }}>
              Order Submitted!
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 28 }}>
              <strong style={{ color: 'var(--ink)' }}>{orderResult.name}</strong> has been received.<br />
              Our team will start provisioning within <strong style={{ color: 'var(--ink)' }}>24 hours</strong>.
            </div>

            {/* Order code card */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--line)',
              borderRadius: 14, padding: '16px 20px', marginBottom: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Order reference</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', letterSpacing: 1, fontFamily: 'monospace' }}>
                  {orderResult.orderCode}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Total charged</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)' }}>
                  ${Number(orderResult.total).toFixed(2)}
                </div>
              </div>
            </div>

            {/* What's next */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--line)',
              borderRadius: 14, padding: '14px 18px', marginBottom: 28, textAlign: 'left',
            }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>What happens next</div>
              {[
                ['Our team reviews your structure', '~1–2 hours'],
                ['Assets are provisioned & configured', '~24 hours'],
                ['You receive delivery confirmation', 'Via notifications'],
              ].map(([step, time], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < 2 ? '1px solid var(--line)' : 'none' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</div>
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--ink)' }}>{step}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{time}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <a href="#/orders" className="btn btn--accent" style={{ textDecoration: 'none' }}>
                View my orders
              </a>
              <button className="btn" onClick={() => setOrderResult(null)}>
                New structure
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout active="structure-builder" crumbs={['Account', 'Structure Builder']}>
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: 'calc(100vh - 65px)',
        overflow: 'hidden',
        padding: '16px 20px 0',
        gap: 10,
        maxWidth: 'none',
        width: '100%',
      }}>
        {/* ── Top bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Builder</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2, marginTop: 2 }}>
              Structure <span className="serif" style={{ color: 'var(--accent)', fontStyle: 'italic' }}>builder</span>
            </div>
          </div>
{/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="btn" onClick={startNewStructure} style={{ gap: 6 }}>
              <Icon name="plus" size={14} />New Structure
            </button>
            <button className="btn" onClick={saveDraft} disabled={busy}>
              {busy && <Spinner size={13} />}<Icon name="package" size={14} />Save draft
            </button>
            <button className="btn btn--accent" onClick={submitOrder} disabled={busy || !nodes.length}>
              <Icon name="send" size={14} />Submit
            </button>
          </div>
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} style={{ flexShrink: 0 }} />}
        <SubmitToast message={success} onDismiss={() => setSuccess(null)} />

        {/* ── Miro-like full canvas with floating panels ── */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)' }}>

          {/* Canvas fills everything */}
          <BuilderCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            canvasRef={canvasRef}
            onDragOver={onDragOver}
            onDrop={onDrop}
          />

          {/* Empty state overlay */}
          {nodes.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 5 }}>
              <div style={{ textAlign: 'center' }}>
                <Icon name="layers" size={44} style={{ opacity: .25, color: 'var(--muted)' }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginTop: 12, opacity: .7 }}>Drag assets to start building</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4, opacity: .6 }}>Use the library panel on the left · grab colored dots on nodes to connect</div>
              </div>
            </div>
          )}

          {/* Floating canvas header strip */}
          <div style={{
            position: 'absolute', top: 12, zIndex: 11,
            left: leftOpen ? PANEL_W + 24 : 52,
            right: rightOpen ? PANEL_W + 24 : 52,
            transition: 'left .22s cubic-bezier(.22,1,.36,1), right .22s cubic-bezier(.22,1,.36,1)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--sb-panel-bg)',
            backdropFilter: 'blur(20px) saturate(160%)',
            border: '1px solid var(--line)',
            borderRadius: 10, padding: '7px 12px',
            boxShadow: '0 2px 12px rgba(0,0,0,.1)',
          }}>
            <Icon name="grid" size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            <input
              className="input"
              style={{ flex: 1, maxWidth: 260, padding: '4px 8px', fontSize: 12.5, background: 'transparent', border: '1px solid var(--line)', borderRadius: 6 }}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Structure name"
            />
            <span style={{ fontSize: 11.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{nodes.length}</span> assets
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', display: 'none' }}>Del to remove</span>
          </div>

          {/* ── Left floating panel ── */}
          <FloatPanel
            side="left"
            open={leftOpen}
            onToggle={() => setLeftOpen(o => !o)}
            header={
              <>
                <Icon name="layers" size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>Asset library</span>
                <span className="section-title__count">{NODE_KEYS.length}</span>
              </>
            }
          >
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NODE_KEYS.map(key => {
                const meta = resolvedRegistry[key] || NODE_REGISTRY[key];
                return (
                  <div
                    key={key}
                    className="sb-asset"
                    draggable
                    onDragStart={e => onDragStart(e, key)}
                    onClick={() => addNode(key)}
                    title="Drag to canvas or click to add"
                    style={{ cursor: 'grab' }}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: `${meta.glow}18`, border: `1px solid ${meta.glow}38`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: meta.glow, overflow: 'hidden',
                    }}>
                      {meta.logoUrl
                        ? <img src={meta.logoUrl} alt={meta.label} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
                        : <meta.Icon size={14} strokeWidth={2} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="sb-asset__title">{meta.label}</div>
                      <div className="sb-asset__price">${meta.price}</div>
                    </div>
                    <div className="sb-asset__plus"><Icon name="plus" size={12} stroke={2.4} /></div>
                  </div>
                );
              })}

              {drafts.length > 0 && (
                <>
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', padding: '8px 0 4px' }}>
                    <Icon name="package" size={12} />Saved drafts
                    <span className="section-title__count" style={{ marginLeft: 'auto' }}>{drafts.length}</span>
                  </div>
                  {drafts.map(d => (
                    <button key={d.id} className="sb-asset" onClick={() => loadDraft(d)} style={{ textAlign: 'left', cursor: 'pointer' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', flexShrink: 0 }}>
                        <Icon name="package" size={12} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sb-asset__title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name || `Draft #${d.id}`}</div>
                        <div className="sb-asset__price">{d.node_count || 0} assets · {fmtMoney(d.total_price || 0)}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </FloatPanel>

          {/* ── Right floating panel ── */}
          <FloatPanel
            side="right"
            open={rightOpen}
            onToggle={() => setRightOpen(o => !o)}
            header={
              <>
                <Icon name="card" size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>Estimate</span>
              </>
            }
          >
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Total */}
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 500 }}>Total estimate</div>
                <div className="mono" style={{ fontSize: 30, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1, marginTop: 4 }}>
                  ${totalPrice.toLocaleString()}<span style={{ fontSize: 13, color: 'var(--muted)' }}>.00</span>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11.5, color: 'var(--muted)' }}>
                  <span><span style={{ color: 'var(--ink)', fontWeight: 600 }}>{nodes.length}</span> assets</span>
                  <span><span style={{ color: 'var(--ink)', fontWeight: 600 }}>~24h</span> delivery</span>
                </div>
              </div>

              <div className="divider" />

              {/* Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {breakdown.length === 0 ? (
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', textAlign: 'center', padding: '8px 0' }}>Add assets to see estimate</div>
                ) : breakdown.map(b => (
                  <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: b.glow, flexShrink: 0, boxShadow: `0 0 5px ${b.glow}` }} />
                    <span style={{ flex: 1 }}>{b.label} <span style={{ color: 'var(--muted)' }}>×{b.count}</span></span>
                    <span className="mono" style={{ fontWeight: 600, fontSize: 12 }}>${b.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="divider" />

              {/* Submissions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600 }}>
                <Icon name="clipboard" size={13} />Submitted
                <span className="section-title__count" style={{ marginLeft: 'auto' }}>{submitted.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {loading ? <Spinner size={14} /> : submitted.length === 0 ? (
                  <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>No submissions yet.</div>
                ) : submitted.slice(0, 6).map(o => (
                  <div key={o.id} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>#{o.order_code || o.id}</span>
                      <StatusPill status={o.status} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{o.name || 'Structure'}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{o.node_count || 0} assets · {fmtMoney(o.total_price || 0)}</div>
                  </div>
                ))}
              </div>
            </div>
          </FloatPanel>
        </div>
      </div>

      {/* ── New Structure confirmation modal ── */}
      {newStructureConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
        }}>
          <div style={{
            width: 420, maxWidth: '90vw',
            background: 'var(--bg-card)',
            borderRadius: 20,
            border: '1px solid var(--line)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
            padding: '28px 28px 24px',
            position: 'relative',
            fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
          }}>
            {/* X button */}
            <button
              onClick={() => setNewStructureConfirm(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--bg-sunken)', border: '1px solid var(--line)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--muted)', padding: 0,
              }}
            >
              <Icon name="x" size={14} />
            </button>

            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(232,25,44,.1)', border: '1.5px solid rgba(232,25,44,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 18,
            }}>
              <Icon name="layers" size={24} style={{ color: '#E8192C' }} />
            </div>

            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.01em' }}>
              Unsaved structure
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              You have <strong style={{ color: 'var(--ink)' }}>{nodes.length} asset{nodes.length !== 1 ? 's' : ''}</strong> on the canvas that haven't been saved. What would you like to do?
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Save & start new */}
              <button
                onClick={saveAndNew}
                disabled={busy}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 12,
                  background: '#E8192C', color: '#fff',
                  border: 'none', fontSize: 14, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
                  opacity: busy ? 0.7 : 1,
                  transition: 'opacity .15s, transform .1s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { if (!busy) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
              >
                {busy ? <Spinner size={14} /> : <Icon name="package" size={15} />}
                Save current &amp; start new
              </button>

              {/* Discard & start new */}
              <button
                onClick={confirmNewStructure}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 12,
                  background: 'var(--bg-sunken)', color: 'var(--ink)',
                  border: '1px solid var(--line)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  transition: 'background .12s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--line)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-sunken)'; }}
              >
                <Icon name="x" size={15} />
                Discard &amp; build new
              </button>
            </div>
          </div>
        </div>
      )}
      <InsufficientBalanceModal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        required={totalPrice}
        available={store.balance ?? 0}
      />
      <OrderConfirmModal
        isOpen={showConfirmModal}
        onClose={() => { if (!busy) setShowConfirmModal(false) }}
        onConfirm={doSubmitOrder}
        orderLabel="Structure Order"
        cost={totalPrice}
        balance={store.balance ?? 0}
        loading={busy}
      />
    </Layout>
  );
}

export default function StructureBuilder() {
  return (
    <ReactFlowProvider>
      <StructureBuilderInner />
    </ReactFlowProvider>
  );
}
