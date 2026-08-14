import { useStore } from '../store';
import { projectFutureMe } from '../data/engine';
import { TrendingUp } from 'lucide-react';

export function FutureMe() {
  const { store } = useStore();
  const projections = projectFutureMe(store.activities);

  const hasData = store.activities.length > 0;

  const daysActive = new Set(store.activities.map(a => a.timestamp.slice(0, 10))).size;
  const daysSinceStart = store.activities.length > 0
    ? Math.max(1, Math.ceil((Date.now() - new Date(store.activities[store.activities.length - 1].timestamp).getTime()) / 86400000))
    : 1;

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Future Me</h1>
        <p className="page-subtitle">If you keep doing this for 365 days — this is what compounds.</p>
      </div>

      {!hasData ? (
        <div>
          <div className="empty-state">
            <div className="empty-state-icon">🔭</div>
            <div className="empty-state-title">Not enough data yet</div>
            <div className="empty-state-text">Log at least 30 days of activities to see your 365-day projection.</div>
          </div>
        </div>
      ) : (
        <>
          <div className="card card-lg" style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.04))',
            borderColor: 'rgba(124,58,237,0.2)',
            marginBottom: 32,
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 16 }}>
              At your current pace, in 365 days:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { label: 'Product Teardowns', value: projections.teardowns, icon: '🧠', color: 'var(--blue)' },
                { label: 'Communication Sessions', value: projections.communication, icon: '💬', color: 'var(--communicate)' },
                { label: 'Experiments Shipped', value: projections.experiments, icon: '🚀', color: 'var(--ship)' },
                { label: 'User Interviews', value: projections.userInterviews, icon: '🗣️', color: 'var(--green)' },
                { label: 'Case Studies', value: projections.caseStudies, icon: '📄', color: 'var(--accent-light)' },
                { label: 'Public Work Shipped', value: projections.publicWork, icon: '🌐', color: 'var(--cyan)' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 700, color: item.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                This is what compounding looks like.
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Not motivation. Not inspiration. Repetition.
              </div>
            </div>
          </div>

          {/* Current pace */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Your current pace</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Total activities', value: store.activities.length },
                  { label: 'Active days', value: daysActive },
                  { label: 'Activities/week (avg)', value: ((store.activities.length / Math.max(daysSinceStart, 7)) * 7).toFixed(1) },
                  { label: 'Shipped activities', value: store.activities.filter(a => a.type === 'SHIP').length },
                  { label: 'Evidence created', value: store.evidenceCards.length },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 16 }}>The transformation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { day: 'Day 30', label: 'Becoming consistent' },
                  { day: 'Day 90', label: 'Evidence of improvement' },
                  { day: 'Day 180', label: 'Have shipped a lot' },
                  { day: 'Day 365', label: 'Significantly more capable' },
                  { day: 'Day 730', label: 'Body of work difficult to ignore' },
                  { day: 'Day 1,000', label: 'This is who I am' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 70, fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-light)', flexShrink: 0 }}>{item.day}</div>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', flexShrink: 0, textAlign: 'right' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Warning if pace is low */}
          {parseFloat(((store.activities.length / Math.max(daysSinceStart, 7)) * 7).toFixed(1)) < 3 && (
            <div className="card card-warning">
              <div style={{ fontSize: '0.875rem', color: 'var(--amber)', lineHeight: 1.65 }}>
                <strong>Your current pace is low.</strong> At less than 3 activities per week, these projections will not materialize.
                The compound effect requires consistency. Small, consistent action beats large, sporadic effort.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
