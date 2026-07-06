// Support — submit ticket form + list of user's tickets.

import { useEffect, useState } from 'react';
import { Layout } from '../shared/Layout.jsx';
import { PageHead, StatusPill, SkeletonRows, EmptyState, ErrorBanner, SuccessBanner, Spinner, fmtDate, Pill } from '../shared/UI.jsx';
import { Icon } from '../shared/Icon.jsx';
import { api } from '../shared/api.js';
import { useStore, setStore } from '../shared/store.js';
import { useAuth } from '../shared/AuthContext.jsx';

const CATEGORIES = ['Billing', 'Technical', 'Account', 'Other'];

export default function Support() {
  const { user } = useAuth();
  const [store] = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Billing');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    api
      .get('/api/support-tickets?order=created_at&ascending=false')
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.items || []);
        setStore((s) => ({ ...s, supportTickets: list }));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in both subject and message.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.post('/api/support-tickets', {
        user_id: user.id,
        subject,
        category,
        message,
        status: 'open',
      });
      setStore((s) => ({
        ...s,
        supportTickets: [created, ...(s.supportTickets || [])],
      }));
      setSubject('');
      setMessage('');
      setCategory('Billing');
      setSuccess('Ticket submitted. We\'ll reply at your account email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const tickets = store.supportTickets || [];

  return (
    <Layout active="support" crumbs={['Account', 'Support']}>
      <div className="page" data-screen-label="Support">
        <PageHead
          eyebrow="Help center"
          title="We've got"
          titleAccent="your back"
          subtitle="24/7 human support. Average first response under 12 minutes."
          actions={
            <button className="btn">
              <Icon name="package" size={14} />
              Knowledge base
            </button>
          }
        />

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        {success && <SuccessBanner message={success} onDismiss={() => setSuccess(null)} />}

        <div className="grid-3">
          {[
            { icon: 'chat', title: 'Live chat', sub: 'In this dashboard', meta: 'Avg. 2m response', bg: 'var(--accent-50)', color: 'var(--accent)', cta: 'Start chat' },
            { icon: 'mail', title: 'Email support', sub: 'For longer issues', meta: 'Reply in 4h', bg: 'var(--success-bg)', color: 'var(--success)', cta: 'Send email' },
            { icon: 'phone', title: 'Phone support', sub: 'Talk to a human', meta: 'Mon–Fri 9–6 GMT', bg: 'var(--violet-bg)', color: 'var(--violet)', cta: 'Call now' },
          ].map((c) => (
            <div className="card card--pad" key={c.title} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, color: c.color, display: 'grid', placeItems: 'center' }}>
                  <Icon name={c.icon} size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{c.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{c.sub}</div>
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', padding: '8px 10px', background: 'var(--bg-sunken)', border: '1px solid var(--line)', borderRadius: 8, display: 'inline-flex', gap: 6, alignItems: 'center', width: 'fit-content' }}>
                <span className="dot" style={{ background: 'var(--success)' }} />
                {c.meta}
              </div>
              <button className="btn btn--primary" style={{ justifyContent: 'center' }}>
                {c.cta}
                <Icon name="arrow-right" size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="split">
          <div className="card">
            <div className="card__head">
              <h2 className="card__title">Submit a ticket</h2>
              <p className="card__sub">We'll route this to the right team</p>
            </div>
            <form onSubmit={submit} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="grid-2">
                <div className="input-group">
                  <label>Subject <span style={{ color: 'var(--accent)' }}>*</span></label>
                  <input
                    className="input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief subject of your issue"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Category <span style={{ color: 'var(--accent)' }}>*</span></label>
                  <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Message <span style={{ color: 'var(--accent)' }}>*</span></label>
                <textarea
                  className="input"
                  style={{ minHeight: 140, resize: 'vertical', fontFamily: 'inherit' }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail. Include relevant IDs."
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button type="submit" className="btn btn--accent" disabled={submitting}>
                  {submitting && <Spinner size={13} />}
                  <Icon name="send" size={13} />
                  Submit ticket
                </button>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>
                  Reply at <b style={{ color: 'var(--ink)' }}>{user?.email}</b>
                </span>
              </div>
            </form>
          </div>

          <div className="card">
            <div className="card__head">
              <h2 className="card__title">Your tickets</h2>
              <span className="section-title__count" style={{ marginLeft: 'auto' }}>{tickets.length}</span>
            </div>
            {loading ? (
              <SkeletonRows rows={3} />
            ) : tickets.length === 0 ? (
              <EmptyState
                icon="chat"
                title="No tickets yet"
                description="Open one above — we'll get back to you fast."
              />
            ) : (
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tickets.map((t, i) => (
                  <div
                    key={t.id}
                    className="reveal-item"
                    style={{
                      padding: 12,
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      background: 'var(--bg-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      animationDelay: `${i * 55}ms`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                        #{t.id}
                      </span>
                      <span style={{ color: 'var(--muted-2)', fontSize: 12 }}>·</span>
                      <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t.category || '—'}</span>
                      <div style={{ flex: 1 }} />
                      <StatusPill status={t.status} />
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{t.subject}</div>
                    {t.message && (
                      <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, maxHeight: 60, overflow: 'hidden' }}>
                        {t.message}
                      </div>
                    )}
                    <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                      Opened {fmtDate(t.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
