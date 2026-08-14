import { useState } from 'react';
import { Plus, Clock, ChevronRight } from 'lucide-react';
import { useStore, useDispatch } from '../store';

export function IdeaParkingLot() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', whyInteresting: '', potential: 5, confidence: 5,
    estimatedEffort: 'medium' as 'low' | 'medium' | 'high',
    createdAt: new Date().toISOString(),
  });

  const handleAdd = () => {
    if (!form.title) return;
    dispatch({ type: 'ADD_IDEA', payload: form });
    setForm({ title: '', whyInteresting: '', potential: 5, confidence: 5, estimatedEffort: 'medium', createdAt: new Date().toISOString() });
    setShowForm(false);
  };

  const daysTilUnlock = (unlocksAt: string) => {
    const days = Math.ceil((new Date(unlocksAt).getTime() - Date.now()) / 86400000);
    return Math.max(0, days);
  };

  const unlocked = store.parkingLot.filter(i => !i.promoted && new Date(i.unlocksAt) <= new Date());
  const locked = store.parkingLot.filter(i => !i.promoted && new Date(i.unlocksAt) > new Date());
  const promoted = store.parkingLot.filter(i => i.promoted);

  return (
    <div className="page animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Idea Parking Lot</h1>
          <p className="page-subtitle">Good idea. You don't need to act on it.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> Park an Idea</button>
      </div>

      <div className="card card-warning" style={{ marginBottom: 28 }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          <strong style={{ color: 'var(--amber)' }}>The rule:</strong> Ideas are parked for 30 days before you can act on them.
          This is not punishment. It's protection. Most new ideas feel urgent in the moment and unimportant 30 days later.
          <br /><br />
          <em style={{ color: 'var(--text-muted)' }}>"An idea is not an obligation."</em>
        </div>
      </div>

      {unlocked.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green)', marginBottom: 12 }}>
            🔓 Unlocked — ready to revisit ({unlocked.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {unlocked.map(idea => (
              <div key={idea.id} className="card card-success">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: 4 }}>{idea.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{idea.whyInteresting}</p>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Potential: <strong style={{ color: 'var(--text-primary)' }}>{idea.potential}/10</strong></span>
                      <span>Confidence: <strong style={{ color: 'var(--text-primary)' }}>{idea.confidence}/10</strong></span>
                      <span>Effort: <strong style={{ color: 'var(--text-primary)' }}>{idea.estimatedEffort}</strong></span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Parked {new Date(idea.createdAt).toLocaleDateString()} · Unlocked
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => dispatch({ type: 'PROMOTE_IDEA', payload: idea.id })}>
                    Promote to goal <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 12 }}>
            🔒 Parked — wait for unlock ({locked.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {locked.map(idea => (
              <div key={idea.id} className="card" style={{ opacity: 0.75 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ marginBottom: 4 }}>{idea.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{idea.whyInteresting}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 16 }}>
                    <Clock size={12} />
                    {daysTilUnlock(idea.unlocksAt)}d left
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {store.parkingLot.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">💡</div>
          <div className="empty-state-title">No ideas parked</div>
          <div className="empty-state-text">When a new startup idea, product idea, or pivot tempts you — park it here. Don't act on it. Most ideas look different in 30 days.</div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2 className="modal-title">Park an Idea</h2>
            <p className="modal-subtitle">It will unlock in 30 days. Until then, keep focusing.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">The idea</label>
                <input className="input" placeholder="One-sentence summary" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Why it's interesting</label>
                <textarea className="textarea" rows={2} placeholder="What excites you about this? Be specific." value={form.whyInteresting} onChange={e => setForm(f => ({ ...f, whyInteresting: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Potential (1–10): {form.potential}</label>
                  <input type="range" min={1} max={10} value={form.potential} onChange={e => setForm(f => ({ ...f, potential: +e.target.value }))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confidence (1–10): {form.confidence}</label>
                  <input type="range" min={1} max={10} value={form.confidence} onChange={e => setForm(f => ({ ...f, confidence: +e.target.value }))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Effort</label>
                <select className="select" value={form.estimatedEffort} onChange={e => setForm(f => ({ ...f, estimatedEffort: e.target.value as 'low' | 'medium' | 'high' }))}>
                  <option value="low">Low (days)</option>
                  <option value="medium">Medium (weeks)</option>
                  <option value="high">High (months)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd} disabled={!form.title}>Park It</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
