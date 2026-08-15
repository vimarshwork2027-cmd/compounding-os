import { useState } from 'react';
import { useStore, useDispatch } from '../store';
import { processContentUrl } from '../services/ollama';
import { Book, Video, Play, FileText, CheckCircle2, Clock, Plus, Brain, Rocket } from 'lucide-react';
import { SKILL_LABELS } from '../data/engine';

export function Library() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!url) return;
    setIsProcessing(true);
    setError('');
    
    try {
      const resource = await processContentUrl(url);
      dispatch({ type: 'ADD_LEARNING_RESOURCE', payload: resource });
      setUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to process content');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book size={18} />;
      case 'video': return <Video size={18} />;
      case 'podcast': return <Play size={18} />;
      default: return <FileText size={18} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'var(--blue)';
      case 'video': return 'var(--red)';
      case 'podcast': return 'var(--purple)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="page animate-fade-up">
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Content Library
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Track capabilities developed, not pages read.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 40, padding: 24, background: 'linear-gradient(to right, rgba(124,58,237,0.05), transparent)', borderColor: 'var(--accent)' }}>
        <h3 style={{ marginBottom: 12 }}>Content → Task Engine</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Paste a YouTube, Substack, or Book URL. The system will extract concepts and generate a real-world application task.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="e.g. https://youtube.com/watch?v=..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={isProcessing}
          />
          <button className="btn btn-primary" onClick={handleAdd} disabled={isProcessing || !url}>
            {isProcessing ? 'Processing...' : <><Plus size={16} /> Process Content</>}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(252,129,129,0.1)', color: '#FC8181', fontSize: '0.8125rem', borderRadius: 4 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {store.library.map(resource => (
          <div key={resource.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px' }}>
              
              {/* Left Side: Concepts & Info */}
              <div style={{ padding: 24, borderRight: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${getTypeColor(resource.type)}20`, color: getTypeColor(resource.type),
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {getTypeIcon(resource.type)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {resource.title}
                    </h2>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{resource.source}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <Clock size={14} /> {resource.timeEstimate}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {resource.difficulty}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {resource.skills.map(s => (
                      <span key={s} className="chip chip-outline">{SKILL_LABELS[s] || s}</span>
                    ))}
                  </div>
                </div>

                {resource.concepts.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concepts to Master</h4>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-light)' }}>
                        {Math.round((resource.concepts.filter(c => c.mastered).length / resource.concepts.length) * 100)}%
                      </div>
                    </div>
                    
                    <div className="progress-bar" style={{ marginBottom: 16 }}>
                      <div className="progress-fill" style={{ width: `${(resource.concepts.filter(c => c.mastered).length / resource.concepts.length) * 100}%` }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {resource.concepts.map(concept => (
                        <div key={concept.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {concept.mastered ? (
                            <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
                          ) : (
                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border)' }} />
                          )}
                          <span style={{ fontSize: '0.9375rem', color: concept.mastered ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: concept.mastered ? 'line-through' : 'none' }}>
                            {concept.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Why & Apply */}
              <div style={{ padding: 24, background: 'var(--bg-elevated)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Brain size={14} /> Why this matters to you
                  </h4>
                  <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {resource.whyThis}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Rocket size={14} /> Real-world Application
                  </h4>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--accent-light)', lineHeight: 1.5 }}>
                    {resource.applicationTask}
                  </div>
                </div>

                <button className="btn btn-secondary w-full" style={{ marginTop: 24 }}>
                  Add to Today's Curriculum
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
