import { useStore } from '../store';
import { SKILL_CATEGORIES, SKILL_LABELS, getLevelInfo } from '../data/engine';
import type { SkillKey } from '../types';

export function MonthlyReview() {
  const { store } = useStore();
  const now = new Date();

  const thisMonth = store.activities.filter(a => {
    const d = new Date(a.timestamp);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const lastMonth = store.activities.filter(a => {
    const d = new Date(a.timestamp);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });

  const thisMonthXP = thisMonth.reduce((s, a) => s + a.xp, 0);
  const lastMonthXP = lastMonth.reduce((s, a) => s + a.xp, 0);

  const thisShipped = thisMonth.filter(a => a.type === 'SHIP').length;
  const lastShipped = lastMonth.filter(a => a.type === 'SHIP').length;

  const topSkills = Object.values(store.skillScores)
    .filter(s => s.xp > 0)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 8);

  const levelInfo = getLevelInfo(store.profile.totalXP);

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Monthly Review</h1>
        <p className="page-subtitle">
          {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} — Trajectory matters more than absolute score.
        </p>
      </div>

      {/* Month Comparison */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          {
            label: 'XP This Month',
            value: thisMonthXP.toLocaleString(),
            prev: lastMonthXP.toLocaleString(),
            up: thisMonthXP > lastMonthXP,
            color: 'var(--accent-light)',
          },
          {
            label: 'Shipped',
            value: thisShipped,
            prev: lastShipped,
            up: thisShipped > lastShipped,
            color: 'var(--ship)',
          },
          {
            label: 'Evidence Created',
            value: store.evidenceCards.filter(e => {
              const d = new Date(e.timestamp);
              return d.getMonth() === now.getMonth();
            }).length,
            prev: store.evidenceCards.filter(e => {
              const d = new Date(e.timestamp);
              const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              return d.getMonth() === lm.getMonth();
            }).length,
            up: store.evidenceCards.filter(e => new Date(e.timestamp).getMonth() === now.getMonth()).length >
                store.evidenceCards.filter(e => new Date(e.timestamp).getMonth() === new Date(now.getFullYear(), now.getMonth() - 1, 1).getMonth()).length,
            color: 'var(--green)',
          },
          {
            label: 'Current Level',
            value: `Lv.${levelInfo.level}`,
            prev: levelInfo.name,
            color: 'var(--text-primary)',
          },
        ].map((s, i) => (
          <div key={i} className="card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value-sm" style={{ color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: s.up !== undefined ? (s.up ? 'var(--green)' : 'var(--red)') : 'var(--text-muted)', marginTop: 4 }}>
              {s.prev !== undefined && s.up !== undefined ? `${s.up ? '↑' : '↓'} vs last month: ${s.prev}` : s.prev}
            </div>
          </div>
        ))}
      </div>

      {/* Skill Scores */}
      {topSkills.length > 0 && (
        <div className="card card-lg" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20 }}>Skill Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topSkills.map(skill => {
              const catColor = Object.values(SKILL_CATEGORIES).find(c => c.skills.includes(skill.key as SkillKey))?.color ?? 'var(--accent)';
              return (
                <div key={skill.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{SKILL_LABELS[skill.key]}</span>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{skill.xp} XP</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: catColor }}>{skill.level}/100</span>
                    </div>
                  </div>
                  <div className="progress-bar progress-bar-lg">
                    <div className="progress-fill" style={{ width: `${skill.level}%`, background: catColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* What changed */}
      <div className="card card-accent card-lg">
        <h2 style={{ marginBottom: 12 }}>What changed about you this month?</h2>
        <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          {thisMonth.length === 0 ? (
            'No activity this month yet. Log activities and come back.'
          ) : (
            <>
              <p>You completed <strong style={{ color: 'var(--text-primary)' }}>{thisMonth.length} activities</strong> this month. {thisShipped > 0 ? `${thisShipped} reached the real world.` : 'None have reached the real world yet.'}</p>
              <br />
              {topSkills[0] && <p>Your strongest skill area is <strong style={{ color: 'var(--accent-light)' }}>{SKILL_LABELS[topSkills[0].key]}</strong> with {topSkills[0].xp} XP and a level of {topSkills[0].level}/100.</p>}
              <br />
              <p>{thisMonthXP > lastMonthXP ? `↑ XP trajectory is improving (+${(thisMonthXP - lastMonthXP).toLocaleString()} vs last month).` : lastMonthXP > 0 ? `↓ XP trajectory dropped from last month. Review what changed.` : 'This is your first month of data.'}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
