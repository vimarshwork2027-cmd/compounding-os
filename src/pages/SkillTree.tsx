import { useState } from 'react';
import { useStore } from '../store';
import { SKILL_CATEGORIES, SKILL_LABELS } from '../data/engine';
import type { SkillCategory, SkillKey } from '../types';

const CATEGORY_EMOJI: Record<SkillCategory, string> = {
  PRODUCT_DESIGN: '🎨', PRODUCT_THINKING: '💡', COMMUNICATION: '💬',
  BUSINESS: '📈', GROWTH: '🚀', TECHNICAL: '⚙️',
  SALES: '🤝', LEADERSHIP: '🧭', EXECUTION: '⚡',
};

export function SkillTree() {
  const { store } = useStore();
  const [selected, setSelected] = useState<SkillCategory | null>(null);

  const getCategoryLevel = (cat: SkillCategory) => {
    const skills = SKILL_CATEGORIES[cat].skills;
    const total = skills.reduce((sum, s) => sum + (store.skillScores[s as SkillKey]?.level ?? 0), 0);
    return Math.round(total / skills.length);
  };

  const getSkillXP = (key: SkillKey) => store.skillScores[key]?.xp ?? 0;
  const getSkillLevel = (key: SkillKey) => store.skillScores[key]?.level ?? 0;

  const categories = Object.entries(SKILL_CATEGORIES) as [SkillCategory, (typeof SKILL_CATEGORIES)[SkillCategory]][];

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Skill Tree</h1>
        <p className="page-subtitle">Your capability map. Updated automatically as you log activities.</p>
      </div>

      {/* Category Grid */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        {categories.map(([cat, data]) => {
          const level = getCategoryLevel(cat);
          const isSelected = selected === cat;
          return (
            <div
              key={cat}
              className="card"
              onClick={() => setSelected(isSelected ? null : cat)}
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? data.color : undefined,
                background: isSelected ? `${data.color}10` : undefined,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>{CATEGORY_EMOJI[cat]}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>{data.skills.length} subskills</div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: `${data.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: data.color }}>{level}</span>
                </div>
              </div>
              <div className="progress-bar progress-bar-lg">
                <div className="progress-fill" style={{ width: `${level}%`, background: data.color }} />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Avg level {level}/100</div>
            </div>
          );
        })}
      </div>

      {/* Expanded Category */}
      {selected && (
        <div className="card card-lg animate-fade-up" style={{ borderColor: SKILL_CATEGORIES[selected].color }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ fontSize: '1.5rem' }}>{CATEGORY_EMOJI[selected]}</div>
            <div>
              <h2>{SKILL_CATEGORIES[selected].label}</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Click any skill to see recent activity</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SKILL_CATEGORIES[selected].skills.map((skill) => {
              const sk = skill as SkillKey;
              const level = getSkillLevel(sk);
              const xp = getSkillXP(sk);
              const recentActivities = store.skillScores[sk]?.recentActivities ?? [];
              const color = SKILL_CATEGORIES[selected].color;

              return (
                <div key={sk}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: level > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {SKILL_LABELS[sk]}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{xp} XP</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: level > 0 ? color : 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>
                        {level}/100
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar progress-bar-lg">
                    <div
                      className="progress-fill"
                      style={{ width: `${level}%`, background: level > 0 ? color : 'var(--bg-elevated)', transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    />
                  </div>
                  {recentActivities.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {recentActivities.length} recent activit{recentActivities.length === 1 ? 'y' : 'ies'} contributed to this skill
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 12 }}>How skills grow</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { range: '0–20', label: 'Beginner', desc: 'Occasional exposure, no real practice' },
            { range: '20–40', label: 'Developing', desc: 'Regular practice, building foundations' },
            { range: '40–60', label: 'Proficient', desc: 'Consistent application, growing fluency' },
            { range: '60–80', label: 'Advanced', desc: 'Strong evidence of real-world impact' },
            { range: '80–100', label: 'Expert', desc: 'Teaching level, producing significant outcomes' },
          ].map(item => (
            <div key={item.range} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-light)', minWidth: 44, flexShrink: 0 }}>{item.range}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: 90, flexShrink: 0 }}>{item.label}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
