import { useState } from 'react';
import { Plus, Bell } from 'lucide-react';
import { useStore, useDispatch } from '../store';

export function Network() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', role: '', company: '', howMet: '', interests: '',
    lastInteraction: new Date().toISOString().slice(0, 10),
    nextAction: '', howCanHelp: '', notes: '',
  });

  const handleAdd = () => {
    if (!form.name) return;
    dispatch({ type: 'ADD_CONTACT', payload: form });
    setForm({ name: '', role: '', company: '', howMet: '', interests: '', lastInteraction: new Date().toISOString().slice(0, 10), nextAction: '', howCanHelp: '', notes: '' });
    setShowForm(false);
  };

  const daysSince = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 86400000);

  return (
    <div className="page animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Network</h1>
          <p className="page-subtitle">Meaningful relationships, not vanity connections. Build genuine value.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> Add Contact</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {store.contacts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🤝</div>
            <div className="empty-state-title">No contacts yet</div>
            <div className="empty-state-text">Track the relationships that actually matter to your career. Genuine connection builds over time.</div>
          </div>
        ) : (
          store.contacts.map(contact => {
            const days = daysSince(contact.lastInteraction);
            const needsAttention = days > 90;
            return (
              <div key={contact.id} className={`card ${needsAttention ? 'card-warning' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{contact.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{contact.role} · {contact.company}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: needsAttention ? 'var(--amber)' : 'var(--text-muted)', fontWeight: needsAttention ? 700 : 400 }}>
                      {days}d ago
                    </div>
                    {needsAttention && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--amber)', marginTop: 2 }}>⚠️ 90+ days</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 12 }}>
                  {contact.howMet && (
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>How you met</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{contact.howMet}</div>
                    </div>
                  )}
                  {contact.interests && (
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>What they care about</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{contact.interests}</div>
                    </div>
                  )}
                  {contact.nextAction && (
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Next action</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{contact.nextAction}</div>
                    </div>
                  )}
                  {contact.howCanHelp && (
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>How you can help them</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{contact.howCanHelp}</div>
                    </div>
                  )}
                </div>
                {needsAttention && (
                  <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(245,158,11,0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--amber)' }}>
                    You haven't spoken to {contact.name} in {days} days. Do you have something genuinely useful to share?
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2 className="modal-title">Add Contact</h2>
            <p className="modal-subtitle">Only meaningful relationships. No spam connections.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Role</label><input className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Company</label><input className="input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">How you met</label><input className="input" value={form.howMet} onChange={e => setForm(f => ({ ...f, howMet: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">What they care about</label><input className="input" value={form.interests} onChange={e => setForm(f => ({ ...f, interests: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Next useful interaction</label><input className="input" value={form.nextAction} onChange={e => setForm(f => ({ ...f, nextAction: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">How you can help them</label><input className="input" value={form.howCanHelp} onChange={e => setForm(f => ({ ...f, howCanHelp: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Last interaction date</label><input type="date" className="input" value={form.lastInteraction} onChange={e => setForm(f => ({ ...f, lastInteraction: e.target.value }))} /></div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd} disabled={!form.name}>Add Contact</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
