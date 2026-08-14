import { useStore } from '../store';
import { detectWeaknesses } from '../data/engine';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

const WEAKNESS_LABELS: Record<string, string> = {
  novelty_seeking: 'Novelty Seeking',
  overthinking: 'Overthinking',
  premature_polishing: 'Premature Polishing',
  consumption_addiction: 'Consumption Addiction',
  lack_of_focus: 'Lack of Focus',
  weak_communication: 'Weak Communication',
  lack_of_evidence: 'Lack of Evidence',
  avoiding_uncomfortable: 'Avoiding Uncomfortable Work',
  low_shipping: 'Low Shipping Frequency',
  inconsistency: 'Inconsistency',
  outcome_blindness: 'Outcome Blindness',
  career_avoidance: 'Career Avoidance',
};

const WEAKNESS_ADVICE: Record<string, string[]> = {
  low_shipping: [
    'Pick the most in-progress thing and ship a rough version today.',
    'A shipped v0.1 creates more evidence than a perfect v1 that never launches.',
    'Ask yourself: what would it take to get this in front of one real person today?',
  ],
  consumption_addiction: [
    'For every piece of content you consume, extract one insight and apply it.',
    'Reading is research. Application is progress.',
    'Close the browser tab. Open the design file or terminal.',
  ],
  avoiding_uncomfortable: [
    'The most valuable work is usually the most uncomfortable.',
    'Schedule user interviews before design time, not after.',
    'Sales and research compound faster than polish.',
  ],
  inconsistency: [
    'One small action every day beats 6 hours on Sundays.',
    'You don\'t need perfect conditions. You need a minimum viable session.',
    'Consistency is a skill that compounds.',
  ],
  lack_of_evidence: [
    'Every experiment needs a hypothesis, action, and metric — in writing.',
    'Evidence turns activities into a portfolio.',
    'Without proof, effort is invisible.',
  ],
};

export function Mirror() {
  const { store } = useStore();

  const now = new Date();
  const last7Days = store.activities.filter(a => {
    const d = new Date(a.timestamp);
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });

  const totalActivities = last7Days.length;
  const shipped = last7Days.filter(a => a.type === 'SHIP').length;
  const made = last7Days.filter(a => a.type === 'MAKE').length;
  const communicated = last7Days.filter(a => a.type === 'COMMUNICATE').length;
  const reflected = last7Days.filter(a => a.type === 'REFLECT').length;
  const consumed = last7Days.filter(a => a.isConsumption).length;
  const applied = last7Days.filter(a => !a.isConsumption).length;

  const designTime = last7Days.filter(a => a.skills.includes('visual_design') || a.skills.includes('interaction_design')).length;
  const userResearch = last7Days.filter(a => a.skills.includes('user_research')).length;

  const evidenceThisWeek = store.evidenceCards.filter(e => {
    const d = new Date(e.timestamp);
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const weeklyXP = last7Days.reduce((sum, a) => sum + a.xp, 0);

  const weaknesses = store.weaknesses.filter(w => !w.dismissed);
  const topWeakness = weaknesses.find(w => w.severity === 'high') ?? weaknesses[0];

  const nextWeekActions = [
    shipped < 1 ? 'Ship or test something with real users' : null,
    userResearch < 1 ? 'Conduct at least 3 user interviews' : null,
    communicated < 2 ? 'Record 2 communication or interview practice sessions' : null,
    evidenceThisWeek < 1 ? 'Create at least 1 piece of external evidence' : null,
  ].filter(Boolean).slice(0, 3);

  const mirrorText = generateMirrorText({ totalActivities, shipped, made, consumed, applied, designTime, userResearch, weaknesses });

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ fontSize: '1.5rem' }}>🪞</div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>The Mirror</h1>
        </div>
        <p className="page-subtitle">Your weekly truth. Based on what you actually did, not what you intended.</p>
      </div>

      {/* Mirror Statement */}
      <div className="card card-lg" style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(239,68,68,0.04))',
        borderColor: 'rgba(124,58,237,0.2)',
        marginBottom: 24,
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 16 }}>
          Week ending {now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </div>
        <div className="mirror-truth" style={{ whiteSpace: 'pre-line' }}>
          {mirrorText}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Weekly Stats */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>This Week's Output</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Activities logged', value: totalActivities, color: 'var(--text-primary)' },
              { label: 'Shipped / real-world', value: shipped, color: 'var(--ship)', important: true },
              { label: 'Made / built', value: made, color: 'var(--make)' },
              { label: 'Communicated / practiced', value: communicated, color: 'var(--communicate)' },
              { label: 'Reflected', value: reflected, color: 'var(--reflect)' },
              { label: 'Consumed (low value)', value: consumed, color: 'var(--red)', warn: consumed > applied },
              { label: 'Applied / produced', value: applied, color: 'var(--green)' },
              { label: 'Evidence created', value: evidenceThisWeek, color: 'var(--green)', important: true },
              { label: 'XP earned', value: weeklyXP, color: 'var(--accent-light)' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: row.warn ? 'var(--red)' : 'var(--text-secondary)', fontWeight: row.important ? 600 : 400 }}>{row.label}</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: row.color }}>{typeof row.value === 'number' && row.value > 999 ? `${row.value.toLocaleString()}` : row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Patterns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Consumption vs Application */}
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Consumption vs Application</h3>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consumption</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--red)', fontWeight: 700 }}>{consumed}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${totalActivities > 0 ? (consumed / totalActivities) * 100 : 0}%`,
                  background: 'var(--red)',
                }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Application</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--green)', fontWeight: 700 }}>{applied}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${totalActivities > 0 ? (applied / totalActivities) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Design vs Research */}
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Design vs User Research</h3>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Design sessions</span>
                <span style={{ fontSize: '0.8rem', color: designTime > userResearch * 3 ? 'var(--amber)' : 'var(--text-primary)', fontWeight: 700 }}>{designTime}</span>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>User research sessions</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--green)', fontWeight: 700 }}>{userResearch}</span>
              </div>
            </div>
            {designTime > userResearch * 3 && designTime > 1 && (
              <div style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--amber)', lineHeight: 1.5 }}>
                ⚠️ Your design:research ratio is {designTime}:{userResearch}. You may be optimizing aesthetics more than product validation.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 16 }}>What is holding you back</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {weaknesses.map((w, i) => (
              <div key={i} className="weakness-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <AlertTriangle size={16} style={{ color: '#FC8181', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div className="weakness-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {WEAKNESS_LABELS[w.type] ?? w.type}
                      <span style={{
                        fontSize: '0.65rem', padding: '1px 6px', borderRadius: 999,
                        background: w.severity === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                        color: w.severity === 'high' ? '#FC8181' : 'var(--amber)',
                      }}>
                        {w.severity}
                      </span>
                    </div>
                    <div className="weakness-text">{w.evidence}</div>
                    {WEAKNESS_ADVICE[w.type] && (
                      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {WEAKNESS_ADVICE[w.type].map((tip, j) => (
                          <div key={j} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 6 }}>
                            <span style={{ color: 'var(--accent-light)' }}>→</span> {tip}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Week Actions */}
      {nextWeekActions.length > 0 && (
        <div className="card card-accent card-lg">
          <h2 style={{ marginBottom: 8 }}>Next week: what actually matters</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Ignore everything else.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {nextWeekActions.map((action, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'rgba(124,58,237,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-light)', flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalActivities === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🪞</div>
          <div className="empty-state-title">No data yet</div>
          <div className="empty-state-text">Start logging activities and The Mirror will show you the truth about your behavior.</div>
        </div>
      )}
    </div>
  );
}

function generateMirrorText(data: {
  totalActivities: number; shipped: number; made: number;
  consumed: number; applied: number; designTime: number;
  userResearch: number; weaknesses: ReturnType<typeof useStore>['store']['weaknesses'];
}): string {
  const { totalActivities, shipped, consumed, applied, designTime, userResearch, weaknesses } = data;

  if (totalActivities === 0) {
    return 'No activity logged this week.\n\nThe mirror can\'t show you anything yet.\n\nStart logging. The truth only appears when you give it data.';
  }

  const lines: string[] = [];

  const topWeak = weaknesses.find(w => w.severity === 'high');

  if (topWeak?.type === 'low_shipping' || shipped === 0) {
    lines.push('Your ambition is ahead of your execution.');
    lines.push('');
    if (data.made > 3) {
      lines.push(`You built ${data.made} things this week. ${shipped === 0 ? 'None of them are in front of real people yet.' : `${shipped} reached the real world.`}`);
    }
  } else if (topWeak?.type === 'consumption_addiction') {
    lines.push('You are consuming more than you are creating.');
    lines.push('');
    lines.push(`${consumed} consumption sessions. ${applied} application sessions.`);
    lines.push('Reading is not the same as building.');
  } else if (shipped > 2) {
    lines.push('You are shipping. This is exactly how compounding works.');
    lines.push('');
    lines.push(`${shipped} things reached the real world this week.`);
  } else {
    lines.push(`You completed ${totalActivities} activities this week.`);
    lines.push('');
  }

  if (designTime > userResearch * 3 && designTime > 1) {
    lines.push('');
    lines.push(`You spent ${designTime} sessions on visual design and ${userResearch} on talking to users.`);
    lines.push('Your current behavior is optimizing aesthetics more than product validation.');
  }

  if (topWeak) {
    lines.push('');
    lines.push(`Your biggest bottleneck this week: ${topWeak.type.replace(/_/g, ' ')}.`);
  }

  if (shipped >= 1 && applied > consumed) {
    lines.push('');
    lines.push('This is what it looks like to become more capable.');
    lines.push('Keep this going.');
  }

  return lines.join('\n');
}
