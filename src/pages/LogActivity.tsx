import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Plus, Minus, FileText, Link2, BarChart } from 'lucide-react';
import { useDispatch, useStore } from '../store';
import { calculateXP, SKILL_CATEGORIES, SKILL_LABELS } from '../data/engine';
import type { ActionType, SkillKey, EvidenceType } from '../types';
import { XPToast } from '../components/XPToast';

const ACTION_TYPES: { type: ActionType; label: string; desc: string; emoji: string }[] = [
  { type: 'THINK', label: 'Think', desc: 'Teardowns, analysis, strategy', emoji: '🧠' },
  { type: 'MAKE', label: 'Make', desc: 'Design, code, prototype, write', emoji: '🔨' },
  { type: 'COMMUNICATE', label: 'Communicate', desc: 'Present, record, rehearse', emoji: '💬' },
  { type: 'SHIP', label: 'Ship', desc: 'Real-world exposure — earns the most XP', emoji: '🚀' },
  { type: 'REFLECT', label: 'Reflect', desc: 'Retrospectives, learning, patterns', emoji: '🪞' },
];

const CONSUMPTION_MARKERS = [
  'watched', 'read', 'browsed', 'consumed', 'scrolled', 'researched',
  'watched video', 'read article', 'listened',
];

const ALL_SKILLS = Object.entries(SKILL_CATEGORIES).flatMap(([cat, data]) =>
  data.skills.map(s => ({ key: s as SkillKey, label: SKILL_LABELS[s as SkillKey], category: cat, color: data.color }))
);

export function LogActivity() {
  const dispatch = useDispatch();
  const { store } = useStore();
  const navigate = useNavigate();

  const [actionType, setActionType] = useState<ActionType>('MAKE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<SkillKey[]>([]);
  const [isConsumption, setIsConsumption] = useState(false);
  const [isBoringChallenge, setIsBoringChallenge] = useState(false);
  const [hasEvidence, setHasEvidence] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('live_url');
  const [evidenceMetric, setEvidenceMetric] = useState('');
  const [xpOverride, setXpOverride] = useState<number | null>(null);
  const [xpToast, setXpToast] = useState<{ xp: number; skill?: string } | null>(null);
  const [showSkillPicker, setShowSkillPicker] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const todayActivities = store.activities.filter(a => a.timestamp.slice(0, 10) === today);
  const sameTypeToday = todayActivities.filter(a => a.type === actionType).length;

  // Detect consumption from title
  const looksLikeConsumption = CONSUMPTION_MARKERS.some(m =>
    title.toLowerCase().includes(m)
  );

  const baseXP = actionType === 'SHIP' ? 35 : actionType === 'MAKE' ? 15 : actionType === 'COMMUNICATE' ? 15 : actionType === 'THINK' ? 10 : 8;
  const computedXP = calculateXP(baseXP, actionType, hasEvidence, isBoringChallenge, isConsumption, todayActivities.length, sameTypeToday);
  const finalXP = xpOverride ?? computedXP;

  const toggleSkill = (key: SkillKey) => {
    setSelectedSkills(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : prev.length < 5 ? [...prev, key] : prev
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        type: actionType,
        title: title.trim(),
        description: description.trim(),
        xp: finalXP,
        skills: selectedSkills,
        boringChallenge: isBoringChallenge,
        isConsumption,
        timestamp: new Date().toISOString(),
        evidence: hasEvidence ? {
          type: evidenceType,
          url: evidenceUrl,
          metric: evidenceMetric,
        } : undefined,
      },
    });

    if (hasEvidence && (evidenceUrl || evidenceMetric)) {
      dispatch({
        type: 'ADD_EVIDENCE',
        payload: {
          title: title.trim(),
          problem: description.trim(),
          hypothesis: '',
          action: title.trim(),
          result: evidenceMetric,
          metric: evidenceMetric,
          learning: '',
          evidenceType,
          evidenceUrl,
          skills: selectedSkills,
          timestamp: new Date().toISOString(),
        },
      });
    }

    setXpToast({ xp: finalXP, skill: selectedSkills[0] ? SKILL_LABELS[selectedSkills[0]] : undefined });
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="page animate-fade-up">
      {xpToast && (
        <XPToast
          xp={xpToast.xp}
          skillName={xpToast.skill}
          reason={`${actionType} activity logged`}
          onDone={() => setXpToast(null)}
        />
      )}

      <div className="page-header">
        <h1 className="page-title">Log Activity</h1>
        <p className="page-subtitle">Output over consumption. Application over information.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        {/* Main form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Action type */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>What type of action is this?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {ACTION_TYPES.map(a => (
                <button
                  key={a.type}
                  onClick={() => setActionType(a.type)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${actionType === a.type ? `var(--${a.type.toLowerCase()})` : 'var(--border)'}`,
                    background: actionType === a.type ? `rgba(${a.type === 'THINK' ? '59,130,246' : a.type === 'MAKE' ? '139,92,246' : a.type === 'COMMUNICATE' ? '16,185,129' : a.type === 'SHIP' ? '245,158,11' : '6,182,212'},0.1)` : 'var(--bg-elevated)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>{a.emoji}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: actionType === a.type ? `var(--${a.type.toLowerCase()})` : 'var(--text-secondary)' }}>{a.label}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>{a.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="card">
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">What did you do?</label>
              <input
                className="input"
                placeholder="e.g. Shipped personalized feed to 50 beta users"
                value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  setIsConsumption(CONSUMPTION_MARKERS.some(m => e.target.value.toLowerCase().startsWith(m)));
                }}
              />
              {looksLikeConsumption && (
                <div style={{ fontSize: '0.8rem', color: 'var(--amber)', marginTop: 4 }}>
                  ⚠️ This looks like consumption. Did you apply anything from it? If not, XP is capped at 2.
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Description (context, outcome, what you learned)</label>
              <textarea
                className="textarea"
                placeholder="What did you actually produce? What changed because of this?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3>Skills developed (max 5)</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSkillPicker(!showSkillPicker)}>
                {showSkillPicker ? 'Collapse' : 'Browse all'}
              </button>
            </div>
            {/* Selected skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {selectedSkills.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSkill(s)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600,
                    background: 'var(--accent-glow)', color: 'var(--accent-light)',
                    border: '1px solid rgba(124,58,237,0.3)', cursor: 'pointer',
                  }}
                >
                  {SKILL_LABELS[s]} <Minus size={10} />
                </button>
              ))}
              {selectedSkills.length === 0 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No skills selected yet</span>
              )}
            </div>

            {showSkillPicker && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflowY: 'auto' }}>
                {Object.entries(SKILL_CATEGORIES).map(([cat, data]) => (
                  <div key={cat}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: data.color, marginBottom: 6 }}>
                      {data.label}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {data.skills.map(skill => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill as SkillKey)}
                          className="skill-tag"
                          style={{
                            cursor: 'pointer',
                            background: selectedSkills.includes(skill as SkillKey) ? 'var(--accent-glow)' : undefined,
                            color: selectedSkills.includes(skill as SkillKey) ? 'var(--accent-light)' : undefined,
                            borderColor: selectedSkills.includes(skill as SkillKey) ? 'rgba(124,58,237,0.3)' : undefined,
                          }}
                        >
                          {selectedSkills.includes(skill as SkillKey) ? '✓ ' : ''}{SKILL_LABELS[skill as SkillKey]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evidence */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: hasEvidence ? 16 : 0 }}>
              <div>
                <h3>Attach Evidence</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>Evidence = 1.5x XP. Builds your portfolio automatically.</p>
              </div>
              <button
                onClick={() => setHasEvidence(!hasEvidence)}
                className={`btn btn-sm ${hasEvidence ? 'btn-primary' : 'btn-secondary'}`}
              >
                {hasEvidence ? <><FileText size={13} /> Attached</> : <><Plus size={13} /> Add Evidence</>}
              </button>
            </div>

            {hasEvidence && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Evidence Type</label>
                  <select className="select" value={evidenceType} onChange={e => setEvidenceType(e.target.value as EvidenceType)}>
                    {['live_url', 'figma_link', 'github_repo', 'loom_video', 'published_post', 'metrics', 'experiment_result', 'before_after', 'interview_notes', 'testimonial'].map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">URL or Link</label>
                    <input className="input" placeholder="https://..." value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Key Metric (result)</label>
                    <input className="input" placeholder="e.g. +24% retention" value={evidenceMetric} onChange={e => setEvidenceMetric(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: XP Preview */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 24 }}>
            <h3 style={{ marginBottom: 20 }}>XP Preview</h3>

            <div style={{ textAlign: 'center', padding: '20px 0', marginBottom: 16 }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--accent-light)', letterSpacing: '-0.04em' }}>
                +{finalXP}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>XP gained</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                { label: 'Base XP', value: `+${baseXP}` },
                { label: `Action type (${actionType})`, value: actionType === 'SHIP' ? '×1.5' : actionType === 'THINK' ? '×0.8' : '×1.0' },
                { label: 'Evidence bonus', value: hasEvidence ? '×1.5' : '—', highlight: hasEvidence },
                { label: 'Boring challenge', value: isBoringChallenge ? '×2.0' : '—', highlight: isBoringChallenge },
                { label: 'Consumption cap', value: isConsumption ? '↓ capped at 2' : '—', warn: isConsumption },
                { label: 'Diminishing returns', value: sameTypeToday >= 3 && actionType !== 'SHIP' ? '×0.5' : '—', warn: sameTypeToday >= 3 },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ color: row.warn ? 'var(--red)' : row.highlight ? 'var(--green)' : 'var(--text-secondary)', fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="divider" />

            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={isConsumption} onChange={e => setIsConsumption(e.target.checked)} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>This is consumption (read/watch)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isBoringChallenge}
                  onChange={e => setIsBoringChallenge(e.target.checked)}
                  disabled={store.dailyChallenge?.completed}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>This completes today's boring challenge ⚡</span>
              </label>
            </div>

            <button
              className="btn btn-primary w-full btn-lg"
              onClick={handleSubmit}
              disabled={!title.trim()}
              style={{ opacity: title.trim() ? 1 : 0.5 }}
            >
              <Zap size={16} /> Log +{finalXP} XP
            </button>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
              Ship activities always earn full XP.
              <br />Evidence = 1.5x. Real-world = most valuable.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
