import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useStore, useDispatch } from '../store';

const PROMPTS = [
  'Why does WhatsApp retain users better than competing messaging apps?',
  'What is Instagram\'s strongest growth loop and how would you evolve it?',
  'What is the biggest product weakness in ThisWeekend right now?',
  'Why does Uber need network effects to defend its market position?',
  'How would you redesign LinkedIn\'s feed to reduce noise and increase signal?',
  'Why does Duolingo have one of the most effective retention systems in mobile?',
  'What would you change about the Airbnb onboarding experience?',
  'Design a product for people who hate social media but still want connection.',
  'Why do most productivity apps fail to retain users past 2 weeks?',
  'How would you grow ThisWeekend from 100 to 10,000 users?',
  'What is the core retention mechanism of Spotify\'s free tier?',
  'How would you monetize a community app without destroying the culture?',
  'Why do most B2B products have terrible UX compared to consumer apps?',
  'What would you cut from Notion to make it 10x simpler?',
  'How would you measure the success of a discovery feature?',
];

const FIELDS = [
  { key: 'problem', label: 'Problem', placeholder: 'What is the core problem you\'re solving?' },
  { key: 'user', label: 'User', placeholder: 'Who is the specific user? What do they want?' },
  { key: 'insight', label: 'Insight', placeholder: 'What non-obvious truth drives your thinking?' },
  { key: 'hypothesis', label: 'Hypothesis', placeholder: 'What do you believe will work and why?' },
  { key: 'solution', label: 'Solution', placeholder: 'What specifically would you build or change?' },
  { key: 'metric', label: 'Metric', placeholder: 'How would you measure success?' },
  { key: 'tradeoff', label: 'Trade-off', placeholder: 'What are you deliberately not doing?' },
  { key: 'risk', label: 'Risk', placeholder: 'What could make this wrong or fail?' },
];

type FormData = Record<string, string>;

export function ProductGym() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [prompt, setPrompt] = useState('');
  const [form, setForm] = useState<FormData>({});
  const [score, setScore] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const generate = () => {
    const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(p);
    setForm({});
    setScore(5);
    setSubmitted(false);
  };

  const isComplete = FIELDS.every(f => (form[f.key] ?? '').trim().length > 0);

  const handleSubmit = () => {
    if (!prompt || !isComplete) return;
    dispatch({
      type: 'ADD_GYM_SESSION',
      payload: {
        prompt,
        problem: form.problem ?? '',
        user: form.user ?? '',
        insight: form.insight ?? '',
        hypothesis: form.hypothesis ?? '',
        solution: form.solution ?? '',
        metric: form.metric ?? '',
        tradeoff: form.tradeoff ?? '',
        risk: form.risk ?? '',
        score,
        timestamp: new Date().toISOString(),
      },
    });

    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        type: 'THINK',
        title: `Product thinking: ${prompt.slice(0, 60)}`,
        description: `Completed 8-field product analysis. Self-score: ${score}/10`,
        xp: 14,
        skills: ['problem_framing', 'product_strategy', 'experimentation', 'metrics'],
        boringChallenge: false,
        isConsumption: false,
        timestamp: new Date().toISOString(),
      },
    });

    setSubmitted(true);
  };

  const avgScore = store.productGymSessions.length > 0
    ? store.productGymSessions.reduce((s, r) => s + r.score, 0) / store.productGymSessions.length : 0;

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Product Thinking Gym</h1>
        <p className="page-subtitle">Build product reasoning muscle. One prompt. Eight fields. No shortcuts.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: prompt ? 16 : 0 }}>
              <h3>Product Challenge</h3>
              <button className="btn btn-primary btn-sm" onClick={generate}>
                <RefreshCw size={13} /> Generate
              </button>
            </div>

            {!prompt && (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon" style={{ fontSize: '2rem' }}>🧠</div>
                <div className="empty-state-title">Generate a challenge</div>
                <div className="empty-state-text">Answer all 8 fields with specificity. No vague answers.</div>
              </div>
            )}

            {prompt && (
              <div style={{
                padding: '16px 20px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(59,130,246,0.08)',
                borderLeft: '3px solid var(--blue)',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blue)', marginBottom: 6 }}>Product Challenge</div>
                <div style={{ fontSize: '1.075rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {prompt}
                </div>
              </div>
            )}
          </div>

          {prompt && !submitted && (
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>8-Field Analysis</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {FIELDS.map(field => (
                  <div key={field.key} className="form-group">
                    <label className="form-label">{field.label}</label>
                    <textarea
                      className="textarea"
                      rows={2}
                      placeholder={field.placeholder}
                      value={form[field.key] ?? ''}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label className="form-label">Quality of your thinking: {score}/10</label>
                </div>
                <input type="range" min={1} max={10} value={score} onChange={e => setScore(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleSubmit} disabled={!isComplete}>
                Submit +14 XP
              </button>
            </div>
          )}

          {submitted && (
            <div className="card card-success">
              <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '1.1rem', marginBottom: 4 }}>Strong work ✓</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Logged. Score: {score}/10 · +14 XP</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>This is what building product reasoning looks like.</div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={generate}>Next challenge</button>
            </div>
          )}

          {/* History */}
          {store.productGymSessions.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Recent Sessions</h3>
              {store.productGymSessions.slice(0, 4).map(s => (
                <div key={s.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1, marginRight: 12 }}>{s.prompt.slice(0, 70)}...</div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: s.score < 6 ? 'var(--red)' : s.score < 8 ? 'var(--amber)' : 'var(--green)', flexShrink: 0 }}>{s.score}/10</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(s.timestamp).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div className="stat-label">Sessions</div>
                <div className="stat-value-sm">{store.productGymSessions.length}</div>
              </div>
              <div>
                <div className="stat-label">Avg Score</div>
                <div className="stat-value-sm" style={{ color: 'var(--accent-light)' }}>{avgScore > 0 ? avgScore.toFixed(1) : '—'}/10</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 10 }}>The 8 Fields</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {FIELDS.map(f => (
                <div key={f.key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 6 }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{f.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{f.placeholder}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
