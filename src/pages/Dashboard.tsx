import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Brain, Mic2, Rocket, TrendingUp, Zap, Archive, Flame, Target
} from 'lucide-react';
import { useStore, useDispatch } from '../store';
import { getPrimaryBottleneck, getDailyBalance, projectFutureMe } from '../data/engine';
import type { CurriculumStep } from '../types';

export function Dashboard() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [challengeDone, setChallengeDone] = useState(store.dailyChallenge?.completed ?? false);

  const bottleneck = getPrimaryBottleneck(store.weaknesses);
  const balance = getDailyBalance(store.activities, new Date());
  const future = projectFutureMe(store.activities);
  const curriculum = store.dailyCurriculum;

  const handleCompleteChallenge = () => {
    dispatch({ type: 'COMPLETE_BORING_CHALLENGE' });
    setChallengeDone(true);
    if (store.dailyChallenge) {
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          type: 'SHIP',
          title: store.dailyChallenge.challenge,
          description: 'Completed the daily uncomfortable challenge',
          xp: store.dailyChallenge.xpBonus,
          skills: ['consistency', 'patience', 'focus'],
          boringChallenge: true,
          isConsumption: false,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  const completeStep = (stepId: string) => {
    if (!curriculum) return;
    dispatch({ type: 'COMPLETE_CURRICULUM_STEP', payload: stepId });
  };

  const getBalanceColor = (minutes: number, target: number) => {
    if (minutes === 0) return 'var(--text-muted)';
    if (minutes >= target) return 'var(--green)';
    return 'var(--accent-light)';
  };

  return (
    <div className="page animate-fade-up">
      {/* 1. Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>
          What will make future you stronger?
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          {store.profile.primaryGoal}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginBottom: 40 }}>
        {/* Left Column: ACTIVE EXECUTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* 2. Today's Curriculum */}
          {curriculum && (
            <div className="card card-lg" style={{ borderColor: 'var(--accent)', borderWidth: 2 }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>
                  Today
                </div>
                <h3 style={{ fontSize: '1.25rem' }}>One Objective</h3>
                <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: 4, fontWeight: 500 }}>
                  {curriculum.objective}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {curriculum.steps.map((step, idx) => (
                  <div key={step.id} style={{
                    display: 'flex', gap: 16, padding: '16px',
                    background: step.completed ? 'rgba(16,185,129,0.05)' : 'var(--bg-elevated)',
                    border: `1px solid ${step.completed ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)', opacity: step.completed ? 0.6 : 1
                  }}>
                    <div style={{ fontSize: '1.5rem', width: 24, textAlign: 'center' }}>
                      {step.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                          0{idx + 1} · {step.phase}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{step.timeEstimate}</div>
                      </div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: step.why ? 8 : 12 }}>
                        {step.description}
                      </div>
                      {step.why && (
                        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: '0.8125rem', color: 'var(--text-secondary)', borderLeft: '2px solid var(--accent-light)', marginBottom: 12 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Why:</span> {step.why}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--green)' }}>+{step.xpReward} XP</div>
                        {!step.completed && (
                          <button className="btn btn-secondary btn-sm" onClick={() => completeStep(step.id)}>Complete</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. The One Thing (Smart Avoidance) */}
          {store.dailyChallenge && (
            <div className="card" style={{
              background: challengeDone ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.04)',
              borderColor: challengeDone ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{challengeDone ? '✅' : '⚡'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: challengeDone ? 'var(--green)' : 'var(--amber)', marginBottom: 4 }}>
                    Your Avoidance Pattern
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {store.dailyChallenge.challenge}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    +{store.dailyChallenge.xpBonus} XP · Based on what you typically avoid doing
                  </div>
                </div>
                {!challengeDone && (
                  <button className="btn btn-secondary btn-sm" onClick={handleCompleteChallenge}>
                    <CheckCircle2 size={14} /> Done
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: CONTEXT & FEEDBACK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* 4. Your Bottleneck */}
          {bottleneck && (
            <div className="card" style={{ borderTop: '3px solid #FC8181' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={16} color="#FC8181" />
                <h3 style={{ margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Bottleneck</h3>
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'capitalize' }}>
                {bottleneck.type.replace('_', ' ')}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                {bottleneck.evidence}
              </p>
              <Link to="/mirror" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                See intervention plan <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* 5. Daily Balance */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Balance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Learn', icon: BookOpen, val: balance.learn, target: 20 },
                { label: 'Make', icon: Zap, val: balance.make, target: 40 },
                { label: 'Communicate', icon: Mic2, val: balance.communicate, target: 15 },
                { label: 'Ship', icon: Rocket, val: balance.ship, target: 30 },
                { label: 'Connect', icon: Target, val: balance.connect, target: 10 },
                { label: 'Reflect', icon: Brain, val: balance.reflect, target: 5 },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <item.icon size={14} style={{ color: getBalanceColor(item.val, item.target) }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: getBalanceColor(item.val, item.target) }}>
                    {item.val}m
                  </div>
                </div>
              ))}
            </div>
            {(balance.learn > balance.ship * 2 && balance.learn > 30) && (
              <div style={{ marginTop: 16, padding: '8px 12px', background: 'rgba(245,158,11,0.1)', color: 'var(--amber)', fontSize: '0.75rem', borderRadius: 4 }}>
                ⚠️ You're learning too much and shipping too little today.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Future You (The Real Dopamine Loop) */}
      <div className="card card-accent" style={{ marginBottom: 40, padding: 32, textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 24 }}>If you keep this exact pace...</h2>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 24 }}>In 365 days you will have produced:</div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{future.teardowns}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>product teardowns</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{future.communication}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>comm. sessions</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{future.experiments}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>experiments</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{future.caseStudies}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>case studies</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{future.publicWork}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>public insights</div>
          </div>
        </div>

        <div style={{ marginTop: 32, fontSize: '0.9375rem', fontWeight: 500, color: 'var(--accent-light)' }}>
          This is what your boring days are buying you.
        </div>
      </div>

      {/* 7. Secondary Stats (Pushed down as feedback, not the core product) */}
      <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 16 }}>
        Lagging Indicators
      </h3>
      <div className="grid-4" style={{ opacity: 0.8 }}>
        <div className="card">
          <div className="stat-label">Total XP</div>
          <div className="stat-value">{store.profile.totalXP.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="stat-label">Current Streak</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{store.profile.currentStreak} <span style={{fontSize: '1rem'}}>🔥</span></div>
        </div>
        <div className="card">
          <div className="stat-label">Evidence</div>
          <div className="stat-value">{store.evidenceCards.length}</div>
        </div>
        <div className="card">
          <div className="stat-label">Compounding Score</div>
          <div className="stat-value">{store.profile.compoundingScore} <span style={{ fontSize: '0.875rem', color: 'var(--green)', marginLeft: 8 }}>/ 100</span></div>
        </div>
      </div>
      
      {/* Demo Data button for empty states */}
      {store.activities.length === 0 && (
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={() => useDispatch()({ type: 'LOAD_DEMO_DATA' })}>
            Load Demo Data
          </button>
        </div>
      )}

    </div>
  );
}
