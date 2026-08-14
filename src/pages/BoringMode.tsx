import { useState, useEffect, useRef } from 'react';
import { Play, Square, Lightbulb } from 'lucide-react';
import { useStore, useDispatch } from '../store';

export function BoringMode() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [taskName, setTaskName] = useState('');
  const [active, setActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [interruptions, setInterruptions] = useState(0);
  const [capturedIdeas, setCapturedIdeas] = useState<string[]>([]);
  const [ideaInput, setIdeaInput] = useState('');
  const [showIdeaCapture, setShowIdeaCapture] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!taskName.trim()) return;
    setActive(true);
    setElapsed(0);
    setInterruptions(0);
    setCapturedIdeas([]);
  };

  const captureIdea = () => {
    if (!ideaInput.trim()) return;
    setCapturedIdeas(prev => [...prev, ideaInput]);
    setIdeaInput('');
    setInterruptions(prev => prev + 1);
    setShowIdeaCapture(false);
    // Park the idea
    dispatch({
      type: 'ADD_IDEA',
      payload: {
        title: ideaInput,
        whyInteresting: 'Captured during a Boring Mode session',
        potential: 5,
        confidence: 5,
        estimatedEffort: 'medium',
        createdAt: new Date().toISOString(),
      },
    });
  };

  const handleStop = (completed: boolean) => {
    setActive(false);
    const durationMinutes = Math.round(elapsed / 60);

    dispatch({
      type: 'ADD_BORING_SESSION',
      payload: {
        taskName,
        startedAt: new Date(Date.now() - elapsed * 1000).toISOString(),
        endedAt: new Date().toISOString(),
        durationMinutes,
        interruptions,
        completed,
        capturedIdeas,
      },
    });

    if (completed) {
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          type: 'MAKE',
          title: `Deep work: ${taskName}`,
          description: `${durationMinutes} minutes of focused work. ${interruptions} ideas captured and parked.`,
          xp: Math.max(10, Math.min(40, Math.round(durationMinutes * 0.8))),
          skills: ['focus', 'consistency', 'patience'],
          boringChallenge: false,
          isConsumption: false,
          timestamp: new Date().toISOString(),
        },
      });
    }

    setTaskName('');
    setElapsed(0);
  };

  const totalDeepWorkMinutes = store.boringSessions.reduce((s, b) => s + b.durationMinutes, 0);
  const completedSessions = store.boringSessions.filter(s => s.completed).length;

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Boring Mode</h1>
        <p className="page-subtitle">No switching. No ideas during the session. Just the work.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {!active ? (
            <div className="card card-lg">
              <h3 style={{ marginBottom: 16 }}>Start a Deep Work Session</h3>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">What is the one task for this session?</label>
                <input
                  className="input"
                  placeholder="e.g. Complete the onboarding case study"
                  value={taskName}
                  onChange={e => setTaskName(e.target.value)}
                />
              </div>
              <div className="card" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', marginBottom: 20 }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Rules during this session:</strong>
                  <br />— No task switching
                  <br />— No new ideas acted on
                  <br />— No checking other tabs
                  <br />— If an idea comes → Capture &amp; Return
                </div>
              </div>
              <button
                className="btn btn-primary btn-lg w-full"
                onClick={handleStart}
                disabled={!taskName.trim()}
                style={{ opacity: taskName.trim() ? 1 : 0.5 }}
              >
                <Play size={18} /> Enter Boring Mode
              </button>
            </div>
          ) : (
            <div className="card card-lg" style={{ textAlign: 'center', borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.04)' }}>
              {/* Timer */}
              <div style={{ fontSize: '5rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--accent-light)', lineHeight: 1, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(elapsed)}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 8 }}>deep work seconds</div>

              <div style={{ padding: '12px 20px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: 24, display: 'inline-block' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Current task</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{taskName}</div>
              </div>

              {!showIdeaCapture ? (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowIdeaCapture(true)}
                  >
                    <Lightbulb size={15} /> Capture Idea → Return
                  </button>
                  <button className="btn btn-primary" onClick={() => handleStop(true)}>
                    <Square size={15} /> Mark Complete
                  </button>
                  <button className="btn btn-ghost" onClick={() => handleStop(false)}>
                    Abandon session
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Capture it and return immediately:
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="input"
                      placeholder="Your idea..."
                      value={ideaInput}
                      onChange={e => setIdeaInput(e.target.value)}
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && captureIdea()}
                    />
                    <button className="btn btn-primary btn-sm" onClick={captureIdea}>Park it</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowIdeaCapture(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {capturedIdeas.length > 0 && (
                <div style={{ marginTop: 24, textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    {capturedIdeas.length} ideas captured and parked
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Session History */}
          {store.boringSessions.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Recent Sessions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {store.boringSessions.slice(0, 5).map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{s.taskName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {s.durationMinutes}min · {s.interruptions} interruptions
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                      background: s.completed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: s.completed ? 'var(--green)' : 'var(--red)',
                    }}>
                      {s.completed ? 'Complete' : 'Abandoned'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Deep Work Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div className="stat-label">Total Minutes</div>
                <div className="stat-value-sm" style={{ color: 'var(--accent-light)' }}>{totalDeepWorkMinutes}</div>
              </div>
              <div>
                <div className="stat-label">Sessions Completed</div>
                <div className="stat-value-sm">{completedSessions}</div>
              </div>
              <div>
                <div className="stat-label">Ideas Captured</div>
                <div className="stat-value-sm">{store.boringSessions.reduce((s, b) => s + b.capturedIdeas.length, 0)}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 10 }}>Why this matters</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Most people never do boring work. They busy-work instead.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginTop: 8 }}>
              Boring work — finishing the thing, writing the case study, making the call — is where compounding happens.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--accent-light)', lineHeight: 1.65, marginTop: 8, fontWeight: 600 }}>
              The timer isn't the reward. The finished work is.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
