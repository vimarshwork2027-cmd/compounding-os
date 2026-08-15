import { useStore } from '../store';
import { Target } from 'lucide-react';

export function Seasons() {
  const { store } = useStore();
  const season = store.seasons[0]; // Active season

  if (!season) {
    return (
      <div className="page">
        <h2>No Active Season</h2>
      </div>
    );
  }

  const daysElapsed = Math.floor((new Date().getTime() - new Date(season.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, (daysElapsed / season.durationDays) * 100);

  return (
    <div className="page animate-fade-up">
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>
          Season 0{season.number}
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
          {season.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
          A {season.durationDays}-day sprint to lock in a new identity.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 40, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.25rem' }}>Timeline</h3>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Day {daysElapsed} <span style={{ color: 'var(--text-muted)' }}>/ {season.durationDays}</span>
          </div>
        </div>
        <div className="progress-bar" style={{ height: 12 }}>
          <div className="progress-fill" style={{ width: `${progressPercent}%`, background: 'var(--accent-light)' }} />
        </div>
      </div>

      <h3 style={{ fontSize: '1.125rem', marginBottom: 20 }}>Season Objectives</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {season.goals.map(goal => {
          const goalProgress = Math.min(100, (goal.current / goal.target) * 100);
          return (
            <div key={goal.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', color: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={16} />
                  </div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {goal.metric}
                  </div>
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {goal.current} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ {goal.target}</span>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${goalProgress}%`, background: goalProgress >= 100 ? 'var(--green)' : 'var(--accent-light)' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: 20, color: 'var(--text-muted)' }}>Upcoming Seasons</h3>
        <div style={{ display: 'flex', gap: 16, opacity: 0.6 }}>
          <div className="card" style={{ flex: 1, borderStyle: 'dashed' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Season 02</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>Product + Growth</div>
          </div>
          <div className="card" style={{ flex: 1, borderStyle: 'dashed' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Season 03</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>Business + Distribution</div>
          </div>
          <div className="card" style={{ flex: 1, borderStyle: 'dashed' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Season 04</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>Founder Mode</div>
          </div>
        </div>
      </div>
    </div>
  );
}
