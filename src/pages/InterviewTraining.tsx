import { useState } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { useStore, useDispatch } from '../store';

const CATEGORIES = [
  'Portfolio', 'Product Design', 'Product Thinking', 'Behavioral',
  'Leadership', 'Business', 'Analytics', 'Whiteboard', 'Case Study',
];

const QUESTIONS: Record<string, string[]> = {
  Portfolio: [
    'Walk me through your most challenging design project.',
    'How do you measure the success of a design?',
    'Tell me about a time you significantly changed your design direction mid-project.',
    'What\'s a project where the final outcome surprised you?',
    'Which case study in your portfolio best shows your product thinking?',
  ],
  'Product Design': [
    'How do you approach designing for accessibility?',
    'Describe your process for conducting user research.',
    'How do you balance business goals with user needs?',
    'When do you stop iterating on a design?',
    'How do you design for ambiguous problems?',
  ],
  'Product Thinking': [
    'How would you improve Spotify\'s discovery feature?',
    'What metrics would you use to measure the success of a new feature?',
    'Tell me about a product decision you disagreed with and how you handled it.',
    'How would you prioritize a product roadmap with limited resources?',
    'What is the biggest design mistake you\'ve seen in a product?',
  ],
  Behavioral: [
    'Tell me about a time you disagreed with an engineer.',
    'Describe a situation where you had to influence without authority.',
    'Tell me about your biggest professional failure and what you learned.',
    'Give me an example of when you received critical feedback and how you responded.',
    'Tell me about a time you had to make a decision with incomplete information.',
  ],
  Leadership: [
    'How do you give feedback to people who are more senior than you?',
    'Describe how you\'ve built alignment across teams.',
    'Tell me about a time you mentored someone.',
    'How do you handle conflict within a team?',
    'How do you set priorities for yourself and communicate them to others?',
  ],
  Business: [
    'How would you monetize a social app with 10M users but no revenue?',
    'What is the difference between product-market fit and product-channel fit?',
    'How would you evaluate whether a new market is worth entering?',
    'Explain unit economics to a non-technical founder.',
    'What business model would you choose for a marketplace product?',
  ],
  Analytics: [
    'How would you diagnose a 20% drop in DAU?',
    'What\'s the difference between correlation and causation in product analytics?',
    'How do you decide which metrics to track for a new feature?',
    'Explain A/B testing to a stakeholder who doesn\'t trust it.',
    'How would you measure the success of an onboarding flow?',
  ],
  Whiteboard: [
    'Design a product for people who want to meet strangers with shared interests.',
    'Redesign the airport experience.',
    'Design a social platform for elderly users.',
    'Create a product that helps remote teams build culture.',
    'Design a system for doctors to communicate with patients.',
  ],
  'Case Study': [
    'Walk me through your design process for [your most complex project].',
    'What would you do differently if you did this project again?',
    'What was the most difficult trade-off you made in this project?',
    'How did user feedback change your direction?',
    'What data or evidence did you use to make key decisions?',
  ],
};

const SCORE_DIMS = ['Structure', 'Clarity', 'Conciseness', 'Product Thinking', 'Evidence', 'Confidence'] as const;

export function InterviewTraining() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [selectedCat, setSelectedCat] = useState('Portfolio');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState<'practice' | 'history'>('practice');

  const generateQuestion = () => {
    const qs = QUESTIONS[selectedCat];
    const q = qs[Math.floor(Math.random() * qs.length)];
    setQuestion(q);
    setAnswer('');
    setScores({});
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!question || !answer) return;
    const avgScore = Object.values(scores).length > 0
      ? Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
      : 5;

    dispatch({
      type: 'ADD_INTERVIEW',
      payload: {
        category: selectedCat,
        question,
        answer,
        scores: {
          structure: scores['Structure'] ?? 5,
          clarity: scores['Clarity'] ?? 5,
          conciseness: scores['Conciseness'] ?? 5,
          productThinking: scores['Product Thinking'] ?? 5,
          evidence: scores['Evidence'] ?? 5,
          confidence: scores['Confidence'] ?? 5,
        },
        timestamp: new Date().toISOString(),
      },
    });

    // Bonus XP
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        type: 'COMMUNICATE',
        title: `Interview practice: ${question.slice(0, 50)}`,
        description: `Category: ${selectedCat}. Average score: ${avgScore.toFixed(1)}/10`,
        xp: 20,
        skills: ['presenting', 'structured_thinking', 'verbal_clarity'],
        boringChallenge: false,
        isConsumption: false,
        timestamp: new Date().toISOString(),
      },
    });

    setSubmitted(true);
  };

  // Detect weak dimensions from history
  const allScores = store.interviewSessions.flatMap(s => Object.entries(s.scores));
  const dimAvgs: Record<string, number> = {};
  SCORE_DIMS.forEach(dim => {
    const key = dim.toLowerCase().replace(' ', '') as keyof typeof store.interviewSessions[0]['scores'];
    const vals = store.interviewSessions.map(s => s.scores[key]).filter(Boolean);
    dimAvgs[dim] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
  const weakDim = Object.entries(dimAvgs).sort(([, a], [, b]) => a - b)[0];

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Interview Training</h1>
        <p className="page-subtitle">Practice deliberately. Build a portfolio of strong answers.</p>
      </div>

      {weakDim && weakDim[1] > 0 && weakDim[1] < 7 && (
        <div className="card card-warning" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--amber)', fontWeight: 600, marginBottom: 4 }}>Pattern detected</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Your {weakDim[0]} scores consistently average {weakDim[1].toFixed(1)}/10. Focus on improving this dimension.
          </div>
        </div>
      )}

      <div className="tab-bar">
        {(['practice', 'history'] as const).map(t => (
          <div key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {tab === 'practice' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Category */}
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Question Category</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCat(cat); setQuestion(''); setAnswer(''); setSubmitted(false); }}
                    className="btn btn-sm"
                    style={{
                      background: selectedCat === cat ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: selectedCat === cat ? 'white' : 'var(--text-secondary)',
                      borderColor: selectedCat === cat ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={generateQuestion}>
                <RefreshCw size={14} /> Generate Question
              </button>
            </div>

            {question && (
              <>
                <div className="card" style={{ borderColor: 'rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.04)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-light)', marginBottom: 10 }}>{selectedCat} Question</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>"{question}"</div>
                </div>

                <div className="card">
                  <div className="form-group">
                    <label className="form-label">Your answer (aim for 2–4 minutes when spoken aloud)</label>
                    <textarea
                      className="textarea"
                      rows={8}
                      placeholder="Use structure: Situation → Task → Action → Result. Include specific evidence and metrics..."
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      disabled={submitted}
                    />
                  </div>
                </div>

                {!submitted ? (
                  <div className="card">
                    <h3 style={{ marginBottom: 16 }}>Self-Evaluation (1–10)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {SCORE_DIMS.map(dim => (
                        <div key={dim}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>{dim}</label>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-light)' }}>{scores[dim] ?? '—'}/10</span>
                          </div>
                          <input
                            type="range" min={1} max={10} step={1}
                            value={scores[dim] ?? 5}
                            onChange={e => setScores(s => ({ ...s, [dim]: +e.target.value }))}
                            style={{ width: '100%', accentColor: 'var(--accent)' }}
                          />
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleSubmit} disabled={!answer}>
                      Submit & Log +20 XP
                    </button>
                  </div>
                ) : (
                  <div className="card card-success">
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>Logged ✓</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Average score: {(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length).toFixed(1)}/10
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 6 }}>+20 XP earned. Practice recorded in history.</div>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => { setQuestion(''); setAnswer(''); setSubmitted(false); setScores({}); }}>
                      Next Question
                    </button>
                  </div>
                )}
              </>
            )}

            {!question && (
              <div className="empty-state">
                <div className="empty-state-icon">🎤</div>
                <div className="empty-state-title">Select a category and generate a question</div>
                <div className="empty-state-text">Practice answering, self-evaluate, and track your patterns over time.</div>
              </div>
            )}
          </div>

          {/* Score history sidebar */}
          <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Score Averages</h3>
            {store.interviewSessions.length === 0 ? (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Complete sessions to see your averages.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SCORE_DIMS.map(dim => {
                  const key = dim.toLowerCase().replace(' ', '') as keyof typeof store.interviewSessions[0]['scores'];
                  const vals = store.interviewSessions.map(s => s.scores[key]);
                  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                  return (
                    <div key={dim}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{dim}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: avg < 6 ? 'var(--red)' : avg < 8 ? 'var(--amber)' : 'var(--green)' }}>
                          {avg.toFixed(1)}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(avg / 10) * 100}%`, background: avg < 6 ? 'var(--red)' : avg < 8 ? 'var(--amber)' : 'var(--green)' }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {store.interviewSessions.length} sessions total
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {store.interviewSessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No sessions yet</div>
              <div className="empty-state-text">Complete interview practice sessions to see your history here.</div>
            </div>
          ) : (
            store.interviewSessions.map(session => {
              const avg = Object.values(session.scores).reduce((a, b) => a + b, 0) / 6;
              return (
                <div key={session.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--bg-elevated)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 4 }}>{session.category}</span>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 6 }}>"{session.question}"</div>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: avg < 6 ? 'var(--red)' : avg < 8 ? 'var(--amber)' : 'var(--green)', flexShrink: 0, marginLeft: 16 }}>
                      {avg.toFixed(1)}/10
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {session.answer}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                    {new Date(session.timestamp).toLocaleDateString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
