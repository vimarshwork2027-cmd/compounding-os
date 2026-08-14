import { useState } from 'react';
import { Plus, ExternalLink, Filter } from 'lucide-react';
import { useStore, useDispatch } from '../store';
import { SKILL_LABELS } from '../data/engine';
import type { EvidenceType, SkillKey } from '../types';

const EVIDENCE_EMOJI: Record<EvidenceType, string> = {
  screenshot: '📸', figma_link: '🎨', live_url: '🌐', github_repo: '⚙️',
  loom_video: '🎥', metrics: '📊', interview_notes: '📝', document: '📄',
  published_post: '✍️', testimonial: '💬', before_after: '↔️', experiment_result: '🧪',
};

export function EvidenceVault() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [filterSkill, setFilterSkill] = useState<SkillKey | ''>('');

  const [form, setForm] = useState({
    title: '', problem: '', hypothesis: '', action: '', result: '',
    metric: '', learning: '', evidenceType: 'experiment_result' as EvidenceType,
    evidenceUrl: '', skills: [] as SkillKey[],
  });

  const filteredCards = filterSkill
    ? store.evidenceCards.filter(c => c.skills.includes(filterSkill))
    : store.evidenceCards;

  const handleAdd = () => {
    if (!form.title || !form.problem) return;
    dispatch({
      type: 'ADD_EVIDENCE',
      payload: { ...form, timestamp: new Date().toISOString() },
    });
    setForm({ title: '', problem: '', hypothesis: '', action: '', result: '', metric: '', learning: '', evidenceType: 'experiment_result', evidenceUrl: '', skills: [] });
    setShowForm(false);
  };

  return (
    <div className="page animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Evidence Vault</h1>
          <p className="page-subtitle">What I've actually done. Every card is a portfolio asset.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Add Evidence
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: 'Total Evidence', value: store.evidenceCards.length },
          { label: 'Experiments', value: store.evidenceCards.filter(e => e.evidenceType === 'experiment_result').length },
          { label: 'Published Work', value: store.evidenceCards.filter(e => e.evidenceType === 'published_post').length },
          { label: 'With Metrics', value: store.evidenceCards.filter(e => e.metric).length },
        ].map((s, i) => (
          <div key={i} className="card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value-sm" style={{ color: 'var(--accent-light)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <h2 className="modal-title">Add Evidence Card</h2>
            <p className="modal-subtitle">This becomes a career asset. Be specific.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="input" placeholder="e.g. ThisWeekend Personalization Experiment" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Problem</label>
                <textarea className="textarea" placeholder="What problem were you solving?" rows={2} value={form.problem} onChange={e => setForm(f => ({ ...f, problem: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hypothesis</label>
                  <textarea className="textarea" placeholder="What did you believe?" rows={2} value={form.hypothesis} onChange={e => setForm(f => ({ ...f, hypothesis: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Action taken</label>
                  <textarea className="textarea" placeholder="What did you actually do?" rows={2} value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Result</label>
                  <input className="input" placeholder="What happened?" value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Key Metric</label>
                  <input className="input" placeholder="e.g. +24% retention" value={form.metric} onChange={e => setForm(f => ({ ...f, metric: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Learning</label>
                <textarea className="textarea" placeholder="What did this teach you?" rows={2} value={form.learning} onChange={e => setForm(f => ({ ...f, learning: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Evidence type</label>
                  <select className="select" value={form.evidenceType} onChange={e => setForm(f => ({ ...f, evidenceType: e.target.value as EvidenceType }))}>
                    {Object.keys(EVIDENCE_EMOJI).map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">URL / Link</label>
                  <input className="input" placeholder="https://..." value={form.evidenceUrl} onChange={e => setForm(f => ({ ...f, evidenceUrl: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd} disabled={!form.title || !form.problem}>Add to Vault</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Cards */}
      {filteredCards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗄️</div>
          <div className="empty-state-title">No evidence yet</div>
          <div className="empty-state-text">Every experiment you run, case study you create, and user interview you conduct should become a card here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredCards.map(card => (
            <div key={card.id} className="card card-lg">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>{EVIDENCE_EMOJI[card.evidenceType]}</span>
                    <h3>{card.title}</h3>
                    {card.metric && (
                      <span style={{ padding: '2px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.15)', color: 'var(--green)', fontSize: '0.75rem', fontWeight: 700 }}>
                        {card.metric}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(card.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                {card.evidenceUrl && (
                  <a href={card.evidenceUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                    <ExternalLink size={12} /> View
                  </a>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
                {card.problem && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>Problem</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{card.problem}</div>
                  </div>
                )}
                {card.hypothesis && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>Hypothesis</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{card.hypothesis}</div>
                  </div>
                )}
                {card.action && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>Action</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{card.action}</div>
                  </div>
                )}
                {card.result && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--green)', marginBottom: 4 }}>Result</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{card.result}</div>
                  </div>
                )}
              </div>

              {card.learning && (
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-light)' }}>Learning: </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{card.learning}</span>
                </div>
              )}

              {card.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {card.skills.map(s => (
                    <span key={s} className="skill-tag">{SKILL_LABELS[s]}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
