import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore, useDispatch } from '../store';
import type { JobApplication } from '../types';

const STAGES: JobApplication['stage'][] = ['applied', 'screen', 'portfolio', 'design', 'final', 'offer', 'rejected'];
const STAGE_LABELS: Record<JobApplication['stage'], string> = {
  applied: 'Applied', screen: 'Screen', portfolio: 'Portfolio',
  design: 'Design Round', final: 'Final', offer: 'Offer', rejected: 'Rejected',
};

export function CareerFunnel() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: '', role: '', stage: 'applied' as JobApplication['stage'], notes: '' });

  const apps = store.applications;
  const stageCounts: Record<JobApplication['stage'], number> = {
    applied: 0, screen: 0, portfolio: 0, design: 0, final: 0, offer: 0, rejected: 0,
  };
  apps.forEach(a => stageCounts[a.stage]++);

  const conversionRates = {
    appToScreen: apps.length > 0 ? ((stageCounts.screen + stageCounts.portfolio + stageCounts.design + stageCounts.final + stageCounts.offer) / apps.length * 100).toFixed(0) : '—',
    screenToPortfolio: (stageCounts.screen + stageCounts.portfolio + stageCounts.design) > 0 ? ((stageCounts.portfolio + stageCounts.design + stageCounts.final + stageCounts.offer) / (stageCounts.screen + stageCounts.portfolio + stageCounts.design) * 100).toFixed(0) : '—',
    portfolioToFinal: (stageCounts.portfolio + stageCounts.design + stageCounts.final) > 0 ? ((stageCounts.final + stageCounts.offer) / (stageCounts.portfolio + stageCounts.design + stageCounts.final) * 100).toFixed(0) : '—',
  };

  const bottleneck = (() => {
    if (apps.length < 5) return 'Add at least 5 applications to see your conversion bottleneck.';
    const appToScreenRate = parseFloat(conversionRates.appToScreen);
    const screenToPortRate = parseFloat(conversionRates.screenToPortfolio);
    const portToFinalRate = parseFloat(conversionRates.portfolioToFinal);

    if (appToScreenRate < 20) return 'Your application-to-screen rate is weak. Focus on tailoring applications or networking before applying.';
    if (screenToPortRate < 50) return 'Your screen-to-portfolio rate is weak. Improve how you present your work in initial conversations.';
    if (portToFinalRate < 40) return 'Your portfolio-to-final rate is weak. Interview performance is the bottleneck — not application volume.';
    return 'Your funnel looks healthy. Keep shipping and practicing.';
  })();

  const handleAdd = () => {
    if (!form.company || !form.role) return;
    dispatch({
      type: 'ADD_APPLICATION',
      payload: { ...form, appliedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    });
    setForm({ company: '', role: '', stage: 'applied', notes: '' });
    setShowForm(false);
  };

  const updateStage = (app: JobApplication, stage: JobApplication['stage']) => {
    dispatch({ type: 'UPDATE_APPLICATION', payload: { ...app, stage, updatedAt: new Date().toISOString() } });
  };

  return (
    <div className="page animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Career Funnel</h1>
          <p className="page-subtitle">Track applications like a product. Diagnose bottlenecks. Eliminate guessing.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Add Application
        </button>
      </div>

      {/* Funnel visualization */}
      <div className="card card-lg" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>Funnel</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 20 }}>
          {['applied', 'screen', 'portfolio', 'design', 'final', 'offer'].map((stage, i) => {
            const count = stageCounts[stage as JobApplication['stage']];
            const max = Math.max(apps.length, 1);
            const height = Math.max(24, (count / max) * 120);
            const colors = ['var(--text-muted)', 'var(--blue)', 'var(--make)', 'var(--amber)', 'var(--accent-light)', 'var(--green)'];
            return (
              <div key={stage} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: colors[i], marginBottom: 4 }}>{count}</div>
                <div style={{ height, background: `${colors[i]}30`, border: `1px solid ${colors[i]}40`, borderRadius: 4, transition: 'height 0.5s ease' }} />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {STAGE_LABELS[stage as JobApplication['stage']]}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'App → Screen', value: `${conversionRates.appToScreen}%` },
            { label: 'Screen → Portfolio', value: `${conversionRates.screenToPortfolio}%` },
            { label: 'Portfolio → Final', value: `${conversionRates.portfolioToFinal}%` },
          ].map(r => (
            <div key={r.label} style={{ padding: '8px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>{r.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-light)' }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottleneck */}
      <div className="card" style={{ marginBottom: 24, background: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.2)' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blue)', marginBottom: 6 }}>Bottleneck Diagnosis</div>
        <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{bottleneck}</div>
      </div>

      {/* Applications list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {apps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <div className="empty-state-title">No applications yet</div>
            <div className="empty-state-text">Track every application to understand your funnel and improve your conversion rates.</div>
          </div>
        ) : (
          apps.map(app => (
            <div key={app.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.company}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{app.role}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <select
                    className="select"
                    style={{ width: 'auto', fontSize: '0.8rem', padding: '5px 10px' }}
                    value={app.stage}
                    onChange={e => updateStage(app, e.target.value as JobApplication['stage'])}
                  >
                    {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
              {app.notes && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 6 }}>{app.notes}</div>}
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2 className="modal-title">Add Application</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="input" placeholder="Company name" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input className="input" placeholder="Product Designer" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Current Stage</label>
                <select className="select" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as JobApplication['stage'] }))}>
                  {STAGES.filter(s => s !== 'rejected').map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="textarea" rows={2} placeholder="Referral, source, notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd} disabled={!form.company || !form.role}>Add Application</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
