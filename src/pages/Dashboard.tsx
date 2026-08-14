import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Flame, Target, TrendingUp, ChevronRight, Plus,
  CheckCircle2, Circle, AlertTriangle, Archive, Star
} from 'lucide-react';
import { useStore, useDispatch } from '../store';
import { getLevelInfo, SKILL_CATEGORIES, SKILL_LABELS } from '../data/engine';
import type { ActionType, SkillKey } from '../types';

const ACTION_COLORS: Record<ActionType, string> = {
  THINK: 'var(--think)', MAKE: 'var(--make)', COMMUNICATE: 'var(--communicate)',
  SHIP: 'var(--ship)', REFLECT: 'var(--reflect)',
};

const IDENTITY_MESSAGES = [
  'You are becoming someone who ships.',
  'You chose validation over polishing.',
  'You did the uncomfortable thing.',
  'You finished something you started.',
  'Consistency is compounding.',
  'Every session makes future you stronger.',
  'You are building evidence, not just activity.',
];

function getTodayMission(store: ReturnType<typeof useStore>['store']) {
  const weaknesses = store.weaknesses.filter(w => !w.dismissed);
  const missions = [];

  if (weaknesses.some(w => w.type === 'low_shipping' || w.type === 'avoiding_uncomfortable')) {
    missions.push({ title: 'Ship or test something with ThisWeekend users', xp: 40, type: 'SHIP' as ActionType });
  } else {
    missions.push({ title: 'Run one product experiment in ThisWeekend', xp: 35, type: 'SHIP' as ActionType });
  }

  if (weaknesses.some(w => w.type === 'consumption_addiction')) {
    missions.push({ title: "Apply one insight — don't just read another article", xp: 15, type: 'MAKE' as ActionType });
  } else {
    missions.push({ title: 'Record a 5-minute product teardown', xp: 15, type: 'COMMUNICATE' as ActionType });
  }

  missions.push({ title: 'Practice your case study walkthrough once', xp: 20, type: 'COMMUNICATE' as ActionType });

  return missions.slice(0, 3);
}

export function Dashboard() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const levelInfo = getLevelInfo(store.profile.totalXP);
  const [challengeDone, setChallengeDown] = useState(store.dailyChallenge?.completed ?? false);

  const recentActivities = store.activities.slice(0, 6);
  const todayMissions = getTodayMission(store);
  const topWeakness = store.weaknesses.filter(w => !w.dismissed && w.severity === 'high')[0]
    ?? store.weaknesses.filter(w => !w.dismissed)[0];

  const evidenceThisMonth = store.evidenceCards.filter(e => {
    const d = new Date(e.timestamp);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const topSkills = Object.values(store.skillScores)
    .filter(s => s.xp > 0)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 6);

  const handleCompleteChallenge = () => {
    dispatch({ type: 'COMPLETE_BORING_CHALLENGE' });
    setChallengeDown(true);
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

  const identityMsg = IDENTITY_MESSAGES[Math.floor(Date.now() / 86400000) % IDENTITY_MESSAGES.length];

  return (
    <div className="page animate-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
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

      {/* Top Stats Row */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.06))', borderColor: 'rgba(124,58,237,0.2)' }}>
          <div className="stat-label">Total XP</div>
          <div className="stat-value" style={{ color: 'var(--accent-light)' }}>{store.profile.totalXP.toLocaleString()}</div>
          <div className="stat-sub">Lv.{levelInfo.level} · {levelInfo.name}</div>
          <div className="progress-bar" style={{ marginTop: 10 }}>
            <div className="progress-fill" style={{ width: `${levelInfo.progress}%` }} />
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Current Streak</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>
            {store.profile.currentStreak}
            <span style={{ fontSize: '1.25rem', marginLeft: 4 }}>🔥</span>
          </div>
          <div className="stat-sub">Best: {store.profile.longestStreak} days</div>
        </div>

        <div className="card" style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.15)' }}>
          <div className="stat-label">Evidence Created</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{evidenceThisMonth}</div>
          <div className="stat-sub">This month · {store.evidenceCards.length} total</div>
        </div>

        <div className="card">
          <div className="stat-label">Compounding Score</div>
          <div className="stat-value">{store.profile.compoundingScore}</div>
          <div className="stat-sub">{store.activities.length} total activities</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginBottom: 24 }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Today's Mission */}
          <div className="card card-lg">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ marginBottom: 2 }}>Today's Mission</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Maximum 3 actions. Choose the highest-leverage.</p>
              </div>
              <Link to="/log" className="btn btn-primary btn-sm">
                <Plus size={14} /> Log Activity
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todayMissions.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: `${ACTION_COLORS[m.type]}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: ACTION_COLORS[m.type],
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>{m.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.type}</div>
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: ACTION_COLORS[m.type] }}>+{m.xp} XP</div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Boring Challenge */}
          {store.dailyChallenge && (
            <div className="card" style={{
              background: challengeDone
                ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.04)',
              borderColor: challengeDone
                ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{challengeDone ? '✅' : '⚡'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: challengeDone ? 'var(--green)' : 'var(--amber)', marginBottom: 4 }}>
                    The One Thing You Don't Feel Like Doing
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {store.dailyChallenge.challenge}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    +{store.dailyChallenge.xpBonus} XP · Designed to train patience and execution
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

          {/* Weakness Alert */}
          {topWeakness && (
            <div className="weakness-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <AlertTriangle size={16} style={{ color: '#FC8181', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div className="weakness-title">What Is Holding You Back</div>
                  <div className="weakness-text">{topWeakness.evidence}</div>
                  <Link to="/mirror" style={{ fontSize: '0.8rem', color: 'var(--accent-light)', marginTop: 8, display: 'inline-block' }}>
                    See full diagnosis →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {recentActivities.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3>Recent Activity</h3>
                <Link to="/log" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View all</Link>
              </div>
              <div className="timeline">
                {recentActivities.map((act) => (
                  <div key={act.id} className="timeline-item">
                    <div className={`timeline-dot ${act.type}`}>
                      {act.type === 'THINK' ? '🧠' : act.type === 'MAKE' ? '🔨' : act.type === 'COMMUNICATE' ? '💬' : act.type === 'SHIP' ? '🚀' : '🪞'}
                    </div>
                    <div style={{ flex: 1, paddingTop: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{act.title}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: ACTION_COLORS[act.type], flexShrink: 0, marginLeft: 8 }}>+{act.xp}</div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(act.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {act.boringChallenge && <span style={{ marginLeft: 6, color: 'var(--amber)' }}>⚡ Boring Challenge</span>}
                        {act.evidence && <span style={{ marginLeft: 6, color: 'var(--green)' }}>📎 Evidence</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Identity */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), transparent)', borderColor: 'rgba(124,58,237,0.15)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Today's identity</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              "{identityMsg}"
            </div>
          </div>

          {/* Top Skills */}
          {topSkills.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3>Top Skills</h3>
                <Link to="/skills" style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Full tree <ChevronRight size={12} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topSkills.map(skill => (
                  <div key={skill.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{SKILL_LABELS[skill.key]}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{skill.level}/100</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Quick Access</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { to: '/thisweekend', label: 'ThisWeekend workspace', icon: Star, color: 'var(--amber)' },
                { to: '/evidence', label: 'Evidence vault', icon: Archive, color: 'var(--green)' },
                { to: '/career', label: 'Career funnel', icon: Target, color: 'var(--blue)' },
                { to: '/mirror', label: 'See The Mirror', icon: TrendingUp, color: 'var(--accent-light)' },
              ].map(item => (
                <Link key={item.to} to={item.to} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)',
                  fontSize: '0.875rem', textDecoration: 'none', transition: 'all 0.15s ease',
                }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = ''; }}>
                  <item.icon size={14} style={{ color: item.color }} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Demo Data */}
          {store.activities.length === 0 && (
            <div className="card card-accent">
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Load demo data to see the full system in action.
              </div>
              <button className="btn btn-primary w-full" onClick={() => useDispatch()({ type: 'LOAD_DEMO_DATA' })}>
                Load Demo Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
