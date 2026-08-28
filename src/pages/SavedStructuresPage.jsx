import { useEffect, useState } from 'react';
import { Layout } from '../shared/Layout.jsx';
import { PageHead, EmptyState, ErrorBanner, fmtMoney, fmtDate } from '../shared/UI.jsx';
import { Icon } from '../shared/Icon.jsx';
import { api } from '../shared/api.js';
import { useStore, setStore } from '../shared/store.js';
import { useAuth } from '../shared/AuthContext.jsx';
import { NODE_REGISTRY } from '../builder/nodes/nodeRegistry.js';

export default function SavedStructuresPage() {
  const { user } = useAuth();
  const [store] = useStore();
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const drafts = store.structureDrafts || [];
  const orders = store.structureOrders || [];
  const submittedOrders = orders;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([
      api.get('/api/structure-drafts?mine=1'),
      api.get('/api/structure-orders?mine=1'),
    ]).then(([draftsRes, ordersRes]) => {
      if (cancelled) return;
      const draftList = Array.isArray(draftsRes) ? draftsRes : (draftsRes?.drafts || draftsRes?.items || []);
      const orderList = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.orders || ordersRes?.items || []);
      setStore(s => ({ ...s, structureDrafts: draftList, structureOrders: orderList }));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  const loadIntoBuilder = (d) => {
    const nodes = d.nodes || (d.nodes_json ? JSON.parse(d.nodes_json) : []);
    const edges = d.edges || (d.edges_json ? JSON.parse(d.edges_json) : []);
    setStore(s => ({ ...s, editingOrderId: null, loadDraftData: { id: d.id, name: d.name, nodes, edges } }));
    window.location.hash = '#/structure-builder';
  };

  const editOrder = (order) => {
    const nodes = order.nodes || (order.nodes_json ? JSON.parse(order.nodes_json) : []);
    const edges = order.edges || (order.edges_json ? JSON.parse(order.edges_json) : []);
    setStore(s => ({ ...s, loadDraftData: { id: order.id, name: order.name, nodes, edges, orderId: order.id } }));
    window.location.hash = '#/structure-builder';
  };

  const submitDraft = async (d) => {
    if (!d.nodes?.length) { setError('This draft has no assets.'); return; }
    setBusyId('draft-' + d.id);
    setError(null);
    try {
      const order = await api.post('/api/structure-orders', {
        name: d.name || 'Untitled structure',
        nodes: d.nodes,
        edges: d.edges,
        total_price: d.total_price || 0,
        node_count: d.node_count || d.nodes.length,
        edge_count: d.edge_count || d.edges?.length || 0,
        draft_id: d.id,
        user_name: user?.name || user?.email || 'User',
      });
      setStore(s => ({ ...s, structureOrders: [order, ...(s.structureOrders || [])] }));
    } catch (err) { setError(err.message); }
    finally { setBusyId(null); }
  };

  const DraftCard = ({ d, revealIndex = 0 }) => {
    const meta = NODE_REGISTRY[d.nodes?.[0]?.data?.nodeType] || NODE_REGISTRY.profile;
    const glow = meta.glow;
    return (
      <div className="reveal-item" style={{
        padding: 14, borderRadius: 12,
        border: '1px solid var(--line)',
        background: 'var(--bg-card)',
        display: 'flex', flexDirection: 'column', gap: 10,
        animationDelay: `${revealIndex * 55}ms`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg,${glow}25,${glow}12)`,
            border: `1.5px solid ${glow}45`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: glow,
          }}>
            {meta.icon ? <meta.icon size={18} strokeWidth={2} /> : <Icon name="package" size={18} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {d.name || `Draft #${d.id}`}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {d.node_count || d.nodes?.length || 0} assets · {fmtMoney(d.total_price || 0)} · Draft
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn--sm"
            onClick={() => loadIntoBuilder(d)}
            style={{ flex: 1, fontSize: 12, padding: '6px 10px', justifyContent: 'center' }}
          >
            <Icon name="edit" size={12} />Load
          </button>
          <button
            className="btn btn--accent btn--sm"
            onClick={() => submitDraft(d)}
            disabled={busyId === 'draft-' + d.id}
            style={{ flex: 1, fontSize: 12, padding: '6px 10px', justifyContent: 'center' }}
          >
            <Icon name="send" size={12} />Submit
          </button>
        </div>
      </div>
    );
  };

  const statusColor = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'done') return 'var(--success)';
    if (s === 'building') return 'var(--warning)';
    if (s === 'rejected') return 'var(--danger)';
    if (s === 'pending') return 'var(--warning)';
    return 'var(--muted)';
  };

  const OrderCard = ({ o, revealIndex = 0 }) => {
    const meta = NODE_REGISTRY[o.nodes_json ? JSON.parse(o.nodes_json)[0]?.data?.nodeType : null] || NODE_REGISTRY.profile;
    const glow = meta.glow;
    const isPending = String(o.status).toLowerCase() === 'pending';
    return (
      <div className="reveal-item" style={{
        padding: 14, borderRadius: 12,
        border: '1px solid var(--line)',
        background: 'var(--bg-card)',
        display: 'flex', flexDirection: 'column', gap: 10,
        animationDelay: `${revealIndex * 55}ms`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg,${glow}25,${glow}12)`,
            border: `1.5px solid ${glow}45`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: glow,
          }}>
            {meta.icon ? <meta.icon size={18} strokeWidth={2} /> : <Icon name="layers" size={18} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {o.name || `Order #${o.order_code || o.id}`}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {o.node_count || 0} assets · {fmtMoney(o.total_price || 0)} · <span style={{ color: statusColor(o.status), fontWeight: 600, textTransform: 'capitalize' }}>{o.status || 'Pending'}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
              Submitted {fmtDate(o.submitted_at)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={isPending ? 'btn btn--accent btn--sm' : 'btn btn--sm'}
            onClick={() => editOrder(o)}
            disabled={!isPending}
            style={{ flex: 1, fontSize: 12, padding: '6px 10px', justifyContent: 'center' }}
          >
            <Icon name={isPending ? 'edit' : 'lock'} size={12} />{isPending ? 'Edit' : 'Locked'}
          </button>
        </div>
      </div>
    );
  };

  const totalCount = drafts.length + submittedOrders.length;

  return (
    <Layout active="saved-structures" crumbs={['Account', 'Saved Structures']}>
      <div className="page" data-screen-label="Saved Structures">
        <PageHead
          eyebrow="Workspace"
          title="Saved"
          titleAccent="Structures"
          subtitle="Manage your drafts and edit pending structure orders before they go into production."
          actions={
            <a className="btn btn--accent" href="#/structure-builder">
              <Icon name="plus" size={14} stroke={2.5} />New Structure
            </a>
          }
        />

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {totalCount === 0 ? (
          <EmptyState
            icon="package"
            title="No saved structures"
            description="Save drafts from the builder or submit a structure. Pending orders you can still edit will appear here too."
            action={<a className="btn btn--accent" href="#/structure-builder"><Icon name="layers" size={14} />Open Builder</a>}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {drafts.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>
                  Drafts <span className="section-title__count">{drafts.length}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {drafts.map((d, i) => <DraftCard key={d.id} d={d} revealIndex={i} />)}
                </div>
              </div>
            )}

            {submittedOrders.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>
                  Structure Orders <span className="section-title__count">{submittedOrders.length}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {submittedOrders.map((o, i) => <OrderCard key={o.id} o={o} revealIndex={i} />)}
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: '8px 0 0' }}>
                  <Icon name="info" size={11} /> Pending orders can be edited. Once status changes to "Building" or beyond, editing is locked.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
