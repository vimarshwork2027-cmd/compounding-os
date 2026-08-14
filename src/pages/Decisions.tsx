import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore, useDispatch } from '../store';

export function Decisions() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', whatDeciding: '', whatWouldChange: '', whatToTest: '',
    reversible: true, deadline: '', defaultChoice: '',
    status: 'open' as 'open' | 'decided' | 'experimenting',
  });

  const handleAdd = () => {
    if (!form.title) return;
    dispatch({ type: 'ADD_DECISION', payload: { ...form } });
    setForm({ title: '', whatDeciding: '', whatWouldChange: '', whatToTest: '', reversible: true, deadline: '', defaultChoice: '', status: 'open' });
    setShowForm(false);
  };

  const statusColors = { open: 'var(--amber)', decided: 'var(--green)', experimenting: 'var(--blue)' };

  return (
    <div className="page animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Decisions</h1>
          <p className="page-subtitle">Stop thinking. Start testing. Decisions become experiments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> New Decision</button>
      </div>

      <div className="card card-warning" style={{ marginBottom: 24 }}>
        <strong style={{ color: 'var(--amber)', fontSize: '0.875rem' }}>Anti-overthinking framework:</strong>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
          Most decisions are not decisions — they are experiments in disguise. The goal is to move from thinking to testing as fast as possible. If you can't decide in 20 minutes, you probably need more information — and the fastest way to get it is to run a small test.
        </p>
      </div>

      {store.decisions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔀</div>
          <div className="empty-state-title">No decisions yet</div>
          <div className="empty-state-text">When a major decision is paralyzing you — add it here. The framework will help you stop overthinking and start experimenting.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {store.decisions.map(d => (
            <div key={d.id} className="card card-lg">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ marginBottom: 4 }}>"{d.title}"</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${statusColors[d.status]}15`, color: statusColors[d.status] }}>
                      {d.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: d.reversible ? 'var(--green)' : 'var(--red)' }}>
                      {d.reversible ? '↩️ Reversible' : '⚠️ Irreversible'}
                    </span>
                  </div>
                </div>
                {d.deadline && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    Deadline: {new Date(d.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {[
                  { label: 'What am I deciding?', value: d.whatDeciding },
                  { label: 'What info would change it?', value: d.whatWouldChange },
                  { label: 'What can I test instead?', value: d.whatToTest },
                  { label: 'Default choice', value: d.defaultChoice },
                ].filter(r => r.value).map(row => (
                  <div key={row.label}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 3 }}>{row.label}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{row.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                {d.status === 'open' && <button className="btn btn-secondary btn-sm" onClick={() => dispatch({ type: 'UPDATE_DECISION', payload: { ...d, status: 'experimenting' } })}>Start Experiment</button>}
                {d.status === 'experimenting' && <button className="btn btn-primary btn-sm" onClick={() => dispatch({ type: 'UPDATE_DECISION', payload: { ...d, status: 'decided' } })}>Mark Decided</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2 className="modal-title">Frame the Decision</h2>
            <p className="modal-subtitle">Clarity first. Testing second. Decision last.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">The decision</label>
                <input className="input" placeholder="e.g. &quot;Should I do a master's degree?&quot;" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">What are you actually deciding?</label>
                <textarea className="textarea" rows={2} placeholder="Break it down. What's the core choice?" value={form.whatDeciding} onChange={e => setForm(f => ({ ...f, whatDeciding: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">What information would change your decision?</label>
                <textarea className="textarea" rows={2} value={form.whatWouldChange} onChange={e => setForm(f => ({ ...f, whatWouldChange: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">What can you test instead of thinking?</label>
                <textarea className="textarea" rows={2} placeholder="The cheapest, fastest way to get real information" value={form.whatToTest} onChange={e => setForm(f => ({ ...f, whatToTest: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Default choice (if you had to decide today)</label>
                  <input className="input" value={form.defaultChoice} onChange={e => setForm(f => ({ ...f, defaultChoice: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Decision deadline</label>
                  <input type="date" className="input" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.reversible} onChange={e => setForm(f => ({ ...f, reversible: e.target.checked }))} />
                This decision is reversible
              </label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd} disabled={!form.title}>Add Decision</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
