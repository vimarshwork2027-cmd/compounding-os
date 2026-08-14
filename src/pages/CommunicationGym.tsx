import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useStore, useDispatch } from '../store';

const CHALLENGES = [
  { type: 'Explain', prompt: 'Explain Uber\'s business model in 60 seconds to a non-technical person.' },
  { type: 'Defend', prompt: 'Why should a product team prioritize retention over acquisition in year one?' },
  { type: 'Simplify', prompt: 'Explain APIs to a non-technical person using an everyday analogy.' },
  { type: 'Persuade', prompt: 'Convince a skeptical founder that user research is worth the time.' },
  { type: 'Critique', prompt: 'Give one strong, specific criticism of Instagram\'s current design.' },
  { type: 'Story', prompt: 'Tell the story of your biggest product design mistake in 2 minutes.' },
  { type: 'Explain', prompt: 'Explain network effects using a product you\'ve actually used.' },
  { type: 'Defend', prompt: 'Why is showing your process more important than showing the final design?' },
  { type: 'Simplify', prompt: 'Explain A/B testing to a founder who has never run one.' },
  { type: 'Persuade', prompt: 'Convince an engineer why design systems save development time.' },
  { type: 'Critique', prompt: 'What is the biggest UX problem with LinkedIn right now?' },
  { type: 'Story', prompt: 'Tell me about a time you changed your mind based on user feedback.' },
  { type: 'Explain', prompt: 'What is the difference between a feature and a product in 60 seconds?' },
  { type: 'Defend', prompt: 'Argue that shipping something imperfect is better than waiting for perfect.' },
  { type: 'Simplify', prompt: 'Explain why consistency matters in product design to a new designer.' },
];

const CHALLENGE_COLORS: Record<string, string> = {
  Explain: 'var(--blue)', Defend: 'var(--amber)', Simplify: 'var(--green)',
  Persuade: 'var(--violet)', Critique: 'var(--red)', Story: 'var(--cyan)',
};

export function CommunicationGym() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [challenge, setChallenge] = useState<typeof CHALLENGES[0] | null>(null);
  const [response, setResponse] = useState('');
  const [selfScore, setSelfScore] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const generate = () => {
    const c = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    setChallenge(c);
    setResponse('');
    setSelfScore(5);
    setSubmitted(false);
    setStartTime(Date.now());
  };

  const handleSubmit = () => {
    if (!challenge || !response) return;
    const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    dispatch({
      type: 'ADD_COMM_SESSION',
      payload: {
        type: challenge.type,
        prompt: challenge.prompt,
        response,
        durationSeconds: duration,
        selfScore,
        timestamp: new Date().toISOString(),
      },
    });

    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        type: 'COMMUNICATE',
        title: `${challenge.type}: ${challenge.prompt.slice(0, 60)}`,
        description: `Communication gym session. Score: ${selfScore}/10`,
        xp: 15,
        skills: ['verbal_clarity', 'structured_thinking', 'storytelling'],
        boringChallenge: false,
        isConsumption: false,
        timestamp: new Date().toISOString(),
      },
    });

    setSubmitted(true);
  };

  const avgScore = store.communicationSessions.length > 0
    ? store.communicationSessions.reduce((sum, s) => sum + s.selfScore, 0) / store.communicationSessions.length
    : 0;

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Communication Gym</h1>
        <p className="page-subtitle">Think clearly → speak clearly. 5 minutes a day compounds fast.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>Daily Challenge</h3>
              <button className="btn btn-primary btn-sm" onClick={generate}>
                <RefreshCw size={13} /> Generate
              </button>
            </div>

            {!challenge && (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon" style={{ fontSize: '2rem' }}>💬</div>
                <div className="empty-state-title">Generate a challenge</div>
                <div className="empty-state-text">Explain, defend, simplify, persuade, critique, or tell a story.</div>
              </div>
            )}

            {challenge && (
              <>
                <div style={{
                  padding: '16px 20px', borderRadius: 'var(--radius-sm)',
                  background: `${CHALLENGE_COLORS[challenge.type]}10`,
                  borderLeft: `3px solid ${CHALLENGE_COLORS[challenge.type]}`,
                  marginBottom: 20,
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: CHALLENGE_COLORS[challenge.type], marginBottom: 6 }}>
                    {challenge.type}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {challenge.prompt}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Your response (write as if you're speaking it)</label>
                  <textarea
                    className="textarea"
                    rows={7}
                    placeholder="Write your response here. Aim for clear structure, specific examples, and a strong conclusion..."
                    value={response}
                    onChange={e => setResponse(e.target.value)}
                    disabled={submitted}
                  />
                </div>

                {!submitted && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label className="form-label">Self-Score: How clearly did you communicate?</label>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-light)' }}>{selfScore}/10</span>
                    </div>
                    <input type="range" min={1} max={10} step={1} value={selfScore}
                      onChange={e => setSelfScore(+e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--accent)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      <span>Rambling</span><span>Crystal clear</span>
                    </div>
                  </div>
                )}

                {!submitted ? (
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={!response}>
                    Submit Session +15 XP
                  </button>
                ) : (
                  <div className="card card-success" style={{ marginTop: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>Session logged ✓</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Score: {selfScore}/10 · +15 XP</div>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={generate}>Next challenge</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* History */}
          {store.communicationSessions.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Recent Sessions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {store.communicationSessions.slice(0, 5).map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: CHALLENGE_COLORS[s.type] ?? 'var(--text-muted)', marginRight: 6 }}>{s.type}</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.prompt.slice(0, 50)}...</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: s.selfScore < 6 ? 'var(--red)' : s.selfScore < 8 ? 'var(--amber)' : 'var(--green)', flexShrink: 0, marginLeft: 12 }}>
                      {s.selfScore}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div className="stat-label">Sessions</div>
                <div className="stat-value-sm">{store.communicationSessions.length}</div>
              </div>
              <div>
                <div className="stat-label">Avg Score</div>
                <div className="stat-value-sm" style={{ color: avgScore < 6 ? 'var(--red)' : avgScore < 8 ? 'var(--amber)' : 'var(--green)' }}>
                  {avgScore > 0 ? avgScore.toFixed(1) : '—'}/10
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>The goal</h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              <p style={{ marginBottom: 8 }}>Clear communication is the highest-leverage skill in your career.</p>
              <p style={{ marginBottom: 8 }}>Designers who can articulate their thinking get hired over those who can't.</p>
              <p>5 minutes of deliberate practice daily = 30+ hours of communication training per year.</p>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Challenge types</h3>
            {Object.entries(CHALLENGE_COLORS).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
