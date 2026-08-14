import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore, useDispatch } from '../store';

export function FailureLog() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', whatHappened: '', whatAssumed: '', whatRealityTaught: '',
    whatWillChange: '', importantInOneYear: false,
  });

  const handleAdd = () => {
    if (!form.title || !form.whatHappened) return;
    dispatch({ type: 'ADD_FAILURE', payload: { ...form, timestamp: new Date().toISOString() } });
    setForm({ title: '', whatHappened: '', whatAssumed: '', whatRealityTaught: '', whatWillChange: '', importantInOneYear: false });
    setShowForm(false);
  };

  return (
    <div className="page animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Failure Log</h1>
          <p className="page-subtitle">Rejection is data. Convert emotional events into learning.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> Log Failure</button>
      </div>

      <div className="card" style={{ marginBottom: 24, background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.15)' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          The purpose of this log is not to dwell — it's to extract the signal from pain and move faster.
          Rejection, failure, and bad interviews are normal. What separates compounders from others is their processing speed.
        </div>
      </div>

      {store.failureLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔥</div>
          <div className="empty-state-title">No failures logged</div>
          <div className="empty-state-text">When something goes wrong — rejection, failed experiment, bad interview — log it here. Turn it into a learning asset.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {store.failureLogs.map(f => (
            <div key={f.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <h3 style={{ marginBottom: 4 }}>{f.title}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(f.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
                {!f.importantInOneYear && (
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', color: 'var(--green)', flexShrink: 0 }}>
                    Won't matter in a year
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'What happened', value: f.whatHappened },
                  { label: 'What I assumed', value: f.whatAssumed },
                  { label: 'What reality taught me', value: f.whatRealityTaught, highlight: true },
                  { label: 'What I will change', value: f.whatWillChange, highlight: true },
                ].filter(r => r.value).map(row => (
                  <div key={row.label}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: row.highlight ? 'var(--accent-light)' : 'var(--text-muted)', marginBottom: 3 }}>{row.label}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2 className="modal-title">Log a Failure</h2>
            <p className="modal-subtitle">What happened? What did it teach you?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">What happened? (title)</label>
                <input className="input" placeholder="e.g. Rejected after portfolio round at Figma" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">What happened? (detail)</label>
                <textarea className="textarea" rows={2} value={form.whatHappened} onChange={e => setForm(f => ({ ...f, whatHappened: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">What did I assume that was wrong?</label>
                <textarea className="textarea" rows={2} value={form.whatAssumed} onChange={e => setForm(f => ({ ...f, whatAssumed: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">What did reality teach me?</label>
                <textarea className="textarea" rows={2} value={form.whatRealityTaught} onChange={e => setForm(f => ({ ...f, whatRealityTaught: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">What will I change?</label>
                <textarea className="textarea" rows={2} value={form.whatWillChange} onChange={e => setForm(f => ({ ...f, whatWillChange: e.target.value }))} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.importantInOneYear} onChange={e => setForm(f => ({ ...f, importantInOneYear: e.target.checked }))} />
                Will this actually matter one year from now?
              </label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd} disabled={!form.title || !form.whatHappened}>Log It</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
