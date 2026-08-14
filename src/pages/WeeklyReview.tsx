import { useStore } from '../store';
import { SKILL_LABELS, SKILL_CATEGORIES } from '../data/engine';

export function WeeklyReview() {
  const { store } = useStore();
  const now = new Date();

  const last7 = store.activities.filter(a => (now.getTime() - new Date(a.timestamp).getTime()) < 7 * 86400000);
  const prev7 = store.activities.filter(a => {
    const d = now.getTime() - new Date(a.timestamp).getTime();
    return d >= 7 * 86400000 && d < 14 * 86400000;
  });

  const shipped = last7.filter(a => a.type === 'SHIP');
  const made = last7.filter(a => a.type === 'MAKE');
  const communicated = last7.filter(a => a.type === 'COMMUNICATE');
  const reflected = last7.filter(a => a.type === 'REFLECT');
  const consumed = last7.filter(a => a.isConsumption);
  const prevXP = prev7.reduce((s, a) => s + a.xp, 0);
  const thisXP = last7.reduce((s, a) => s + a.xp, 0);
  const xpChange = thisXP - prevXP;

  const evidenceThisWeek = store.evidenceCards.filter(e => (now.getTime() - new Date(e.timestamp).getTime()) < 7 * 86400000);
  const avoided = store.weaknesses.filter(w => w.severity === 'high' && !w.dismissed);

  // Top skill gained
  const topSkill = Object.values(store.skillScores).sort((a, b) => b.xp - a.xp)[0];

  const nextWeekActions = [
    shipped.length < 1 ? 'Ship at least one thing that reaches real people' : null,
    consumed.length > last7.length * 0.4 ? 'Replace 2 consumption sessions with application sessions' : null,
    evidenceThisWeek.length < 1 ? 'Create 1 piece of measurable evidence' : null,
    communicated.length < 2 ? 'Complete 2 communication practice sessions' : null,
  ].filter(Boolean).slice(0, 3);

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Weekly Review</h1>
        <p className="page-subtitle">Week ending {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Output */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📦 Output</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Total activities', value: last7.length, prev: prev7.length },
              { label: 'Shipped / real-world', value: shipped.length, highlight: true },
              { label: 'Built / made', value: made.length },
              { label: 'Communicated', value: communicated.length },
              { label: 'Reflected', value: reflected.length },
              { label: 'XP earned', value: thisXP, prev: prevXP },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: row.highlight ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: row.highlight ? 600 : 400 }}>
                  {row.label}
                </span>
                <div style={{ display: 'flex', align: 'center', gap: 8 }}>
                  {row.prev !== undefined && (
                    <span style={{ fontSize: '0.75rem', color: row.value > row.prev ? 'var(--green)' : row.value < row.prev ? 'var(--red)' : 'var(--text-muted)' }}>
                      {row.value > row.prev ? '↑' : row.value < row.prev ? '↓' : '—'}
                    </span>
                  )}
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {typeof row.value === 'number' && row.value > 999 ? row.value.toLocaleString() : row.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence & Shipping */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>🧪 Evidence & Learning</h3>
          <div style={{ marginBottom: 16 }}>
            <div className="stat-label">Evidence created this week</div>
            <div className="stat-value" style={{ color: evidenceThisWeek.length > 0 ? 'var(--green)' : 'var(--red)', fontSize: '2.5rem' }}>
              {evidenceThisWeek.length}
            </div>
          </div>

          {evidenceThisWeek.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {evidenceThisWeek.slice(0, 3).map(e => (
                <div key={e.id} style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {e.title}
                  {e.metric && <span style={{ color: 'var(--green)', marginLeft: 6 }}>{e.metric}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--amber)' }}>⚠️ No evidence created this week. Activity without proof doesn't compound.</div>
          )}
        </div>
      </div>

      {/* Avoidance & Patterns */}
      {(avoided.length > 0 || consumed.length > last7.length * 0.4) && (
        <div className="card" style={{ marginBottom: 24, background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.15)' }}>
          <h3 style={{ marginBottom: 14 }}>⚠️ What you avoided</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {avoided.map((w, i) => (
              <div key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                → {w.evidence}
              </div>
            ))}
            {consumed.length > last7.length * 0.4 && (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                → {consumed.length} consumption sessions out of {last7.length} total. More consuming than applying.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Week */}
      {nextWeekActions.length > 0 && (
        <div className="card card-accent card-lg" style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Next week: 3 highest-leverage actions</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Everything else is secondary.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {nextWeekActions.map((action, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-light)', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {last7.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No activity this week</div>
          <div className="empty-state-text">Log activities throughout the week to get a meaningful weekly review.</div>
        </div>
      )}
    </div>
  );
}
