import { useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { useStore, useDispatch } from '../store';
import type { ThisWeekendFeature } from '../types';

const STAGES: ThisWeekendFeature['status'][] = ['hypothesis', 'building', 'shipped', 'measured', 'learned'];
const STAGE_LABELS: Record<ThisWeekendFeature['status'], string> = {
  hypothesis: 'Hypothesis', building: 'Building', shipped: 'Shipped',
  measured: 'Measured', learned: 'Learned',
};
const STAGE_COLORS: Record<ThisWeekendFeature['status'], string> = {
  hypothesis: 'var(--blue)', building: 'var(--make)', shipped: 'var(--ship)',
  measured: 'var(--green)', learned: 'var(--accent-light)',
};

const SECTIONS = ['Product', 'Users', 'Growth', 'Business', 'Evidence'] as const;

export function ThisWeekend() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [activeSection, setActiveSection] = useState<typeof SECTIONS[number]>('Product');
  const [form, setForm] = useState({
    title: '', hypothesis: '', problem: '', metric: '',
  });

  const handleAdd = () => {
    if (!form.title || !form.hypothesis || !form.problem) return;
    dispatch({
      type: 'ADD_TW_FEATURE',
      payload: { ...form, status: 'hypothesis', createdAt: new Date().toISOString() },
    });
    setForm({ title: '', hypothesis: '', problem: '', metric: '' });
    setShowForm(false);
  };

  const advance = (feature: ThisWeekendFeature) => {
    const idx = STAGES.indexOf(feature.status);
    if (idx < STAGES.length - 1) {
      dispatch({ type: 'UPDATE_TW_FEATURE', payload: { ...feature, status: STAGES[idx + 1], shippedAt: STAGES[idx + 1] === 'shipped' ? new Date().toISOString() : feature.shippedAt } });
    }
  };

  const features = store.thisWeekendFeatures;
  const shipped = features.filter(f => ['shipped', 'measured', 'learned'].includes(f.status)).length;
  const inProgress = features.filter(f => ['hypothesis', 'building'].includes(f.status)).length;

  return (
    <div className="page animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: '1.5rem' }}>⭐</span>
            <h1 className="page-title" style={{ marginBottom: 0 }}>ThisWeekend</h1>
          </div>
          <p className="page-subtitle">Hypothesis-first. Ship. Measure. Learn. Repeat.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Add Feature
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Features', value: features.length },
          { label: 'Shipped', value: shipped, color: 'var(--ship)' },
          { label: 'In Progress', value: inProgress },
          { label: 'With Metrics', value: features.filter(f => f.result).length, color: 'var(--green)' },
        ].map((s, i) => (
          <div key={i} className="card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value-sm" style={{ color: s.color ?? 'var(--text-primary)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pipeline view */}
      {features.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 16 }}>Feature Pipeline</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {STAGES.map(stage => {
              const stagFeatures = features.filter(f => f.status === stage);
              return (
                <div key={stage}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: STAGE_COLORS[stage], marginBottom: 10, padding: '4px 0', borderBottom: `2px solid ${STAGE_COLORS[stage]}20` }}>
                    {STAGE_LABELS[stage]} ({stagFeatures.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {stagFeatures.map(f => (
                      <div key={f.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', cursor: 'pointer' }} onClick={() => advance(f)}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{f.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tap to advance →</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature Cards */}
      {features.length > 0 && (
        <div>
          <h2 style={{ marginBottom: 16 }}>All Features</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {features.map(f => (
              <div key={f.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3>{f.title}</h3>
                      <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, background: `${STAGE_COLORS[f.status]}15`, color: STAGE_COLORS[f.status] }}>
                        {STAGE_LABELS[f.status]}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Created {new Date(f.createdAt).toLocaleDateString()}
                      {f.shippedAt && ` · Shipped ${new Date(f.shippedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  {f.status !== 'learned' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => advance(f)}>
                      Advance <ChevronRight size={12} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Problem', value: f.problem },
                    { label: 'Hypothesis', value: f.hypothesis },
                    { label: 'Metric', value: f.metric },
                    { label: 'Result', value: f.result },
                  ].filter(r => r.value).map(row => (
                    <div key={row.label}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 3 }}>{row.label}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{row.value}</div>
                    </div>
                  ))}
                </div>
                {f.learning && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(124,58,237,0.06)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-light)' }}>Learning: </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{f.learning}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {features.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <div className="empty-state-title">No features yet</div>
          <div className="empty-state-text">Every feature starts with a hypothesis. Not a design. Not a spec. A hypothesis about what user problem you're solving.</div>
        </div>
      )}

      {/* Add Feature Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2 className="modal-title">Add Feature / Experiment</h2>
            <p className="modal-subtitle">No hypothesis = no feature. Be specific.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Feature / Experiment Name</label>
                <input className="input" placeholder="e.g. Personalized discovery feed" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">What problem does this solve?</label>
                <textarea className="textarea" rows={2} placeholder="Be specific about the user problem — not the feature description" value={form.problem} onChange={e => setForm(f => ({ ...f, problem: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Hypothesis</label>
                <textarea className="textarea" rows={2} placeholder="We believe that [action] will cause [outcome] because [reason]" value={form.hypothesis} onChange={e => setForm(f => ({ ...f, hypothesis: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Success Metric</label>
                <input className="input" placeholder="e.g. +15% repeat open rate in 7 days" value={form.metric} onChange={e => setForm(f => ({ ...f, metric: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd} disabled={!form.title || !form.problem || !form.hypothesis}>
                  Add Feature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
