import { BookOpen, Target, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';

const PATHS = [
  {
    title: 'Product Thinking',
    progress: 67,
    modules: [
      { name: 'Problem framing', completed: true },
      { name: 'User research', completed: true },
      { name: 'Product discovery', completed: true },
      { name: 'Prioritization', completed: true },
      { name: 'Metrics', completed: true },
      { name: 'Experimentation', completed: true },
      { name: 'Trade-offs', completed: true },
      { name: 'Product strategy', completed: false },
    ]
  },
  {
    title: 'Communication',
    progress: 54,
    modules: [
      { name: 'Structured thinking', completed: true },
      { name: 'Storytelling', completed: false },
      { name: 'Presentations', completed: false },
      { name: 'Writing', completed: true },
      { name: 'Persuasion', completed: false },
      { name: 'Executive communication', completed: false },
    ]
  },
  {
    title: 'Business',
    progress: 38,
    modules: [
      { name: 'Business models', completed: true },
      { name: 'Revenue', completed: false },
      { name: 'Pricing', completed: false },
      { name: 'Unit economics', completed: true },
      { name: 'Markets', completed: false },
      { name: 'Competition', completed: false },
    ]
  },
  {
    title: 'Growth',
    progress: 42,
    modules: [
      { name: 'Acquisition', completed: true },
      { name: 'Activation', completed: true },
      { name: 'Retention', completed: false },
      { name: 'Referral', completed: false },
      { name: 'Network effects', completed: false },
      { name: 'Distribution', completed: false },
    ]
  },
  {
    title: 'Sales',
    progress: 29,
    modules: [
      { name: 'Pitching', completed: true },
      { name: 'Cold outreach', completed: false },
      { name: 'Discovery', completed: false },
      { name: 'Objection handling', completed: false },
      { name: 'Negotiation', completed: false },
      { name: 'Closing', completed: false },
    ]
  }
];

export function LearningPath() {
  return (
    <div className="page animate-fade-up">
      <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Learning Path
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            What should you learn over the next 12 months?
          </p>
        </div>
        <Target size={40} style={{ color: 'var(--accent-light)', opacity: 0.2 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {PATHS.map(path => (
          <div key={path.title} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.25rem' }}>{path.title}</h3>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-light)' }}>{path.progress}%</div>
            </div>
            
            <div className="progress-bar" style={{ marginBottom: 24, height: 6 }}>
              <div className="progress-fill" style={{ width: `${path.progress}%`, background: 'var(--accent-light)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {path.modules.map(mod => (
                <div key={mod.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {mod.completed ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
                  ) : (
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border)', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: '0.9375rem', color: mod.completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: mod.completed ? 'line-through' : 'none', opacity: mod.completed ? 0.6 : 1 }}>
                    {mod.name}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>
                <BookOpen size={14} /> Resume Curriculum
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
