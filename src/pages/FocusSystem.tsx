import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useStore, useDispatch } from '../store';
import type { GoalType } from '../types';

export function FocusSystem() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'primary' as GoalType });

  const primaryGoals = store.goals.filter(g => g.type === 'primary');
  const secondaryGoals = store.goals.filter(g => g.type === 'secondary');
  const backlogGoals = store.goals.filter(g => g.type === 'backlog');

  const canAddPrimary = primaryGoals.length < 1;
  const canAddSecondary = secondaryGoals.length < 2;

  const handleAdd = () => {
    if (!form.title) return;
    if (form.type === 'primary' && !canAddPrimary) {
      alert('You already have a primary goal. A primary goal can only be replaced, not added to.');
      return;
    }
    if (form.type === 'secondary' && !canAddSecondary) {
      alert('You already have 2 secondary goals. Move one to the backlog before adding another.');
      return;
    }
    dispatch({ type: 'ADD_GOAL', payload: { ...form, createdAt: new Date().toISOString() } });
    setForm({ title: '', description: '', type: 'primary' });
    setShowForm(false);
  };

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Focus System</h1>
        <p className="page-subtitle">1 primary. 2 secondary. Everything else waits.</p>
      </div>

      <div className="card" style={{ marginBottom: 24, background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.15)' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--amber)', lineHeight: 1.65 }}>
          <strong>Rule:</strong> You can only have 1 primary goal and 2 secondary goals. Everything else goes to the backlog.
          If your attention is distributed across more than 3 directions, nothing compounds.
        </div>
      </div>

      {/* Primary */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-light)', marginBottom: 12 }}>
          🎯 Primary Goal
        </div>
        {primaryGoals.length === 0 ? (
          <div className="card" style={{ borderStyle: 'dashed' }}>
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>No primary goal set. Set one.</div>
          </div>
        ) : (
          primaryGoals.map(g => (
            <div key={g.id} className="card" style={{ borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: 'var(--accent-light)', marginBottom: 4 }}>{g.title}</h3>
                  {g.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{g.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'UPDATE_GOAL', payload: { ...g, type: 'backlog' } })}>Move to backlog</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => dispatch({ type: 'REMOVE_GOAL', payload: g.id })}>Remove</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Secondary */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blue)', marginBottom: 12 }}>
          ◉ Secondary Goals ({secondaryGoals.length}/2)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {secondaryGoals.map(g => (
            <div key={g.id} className="card" style={{ borderColor: 'rgba(59,130,246,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ marginBottom: 4 }}>{g.title}</h3>
                  {g.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{g.description}</p>}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'UPDATE_GOAL', payload: { ...g, type: 'backlog' } })}>Backlog</button>
              </div>
            </div>
          ))}
          {secondaryGoals.length < 2 && (
            <div className="card" style={{ borderStyle: 'dashed', textAlign: 'center', padding: '14px', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => { setForm(f => ({ ...f, type: 'secondary' })); setShowForm(true); }}>
              + Add secondary goal ({2 - secondaryGoals.length} remaining)
            </div>
          )}
        </div>
      </div>

      {/* Backlog */}
      {backlogGoals.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 12 }}>
            ○ Backlog — Not now
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {backlogGoals.map(g => (
              <div key={g.id} className="card" style={{ opacity: 0.7 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{g.title}</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'REMOVE_GOAL', payload: g.id })}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={14} /> Add Goal</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2 className="modal-title">Add Goal</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Goal</label>
                <input className="input" placeholder="Be specific. What does success look like?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="textarea" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select className="select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as GoalType }))}>
                  <option value="primary">Primary (1 max)</option>
                  <option value="secondary">Secondary (2 max)</option>
                  <option value="backlog">Backlog</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd} disabled={!form.title}>Add Goal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
