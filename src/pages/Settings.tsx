import { useState } from 'react';
import { useStore, useDispatch } from '../store';
import { Key, User, RotateCcw, Download } from 'lucide-react';

export function Settings() {
  const { store } = useStore();
  const dispatch = useDispatch();
  const [apiKey, setApiKey] = useState(store.aiApiKey);
  const [name, setName] = useState(store.profile.name);
  const [ollamaModel, setOllamaModel] = useState(store.ollamaModel || 'llama3');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'SET_AI_KEY', payload: apiKey });
    dispatch({ type: 'UPDATE_PROFILE_NAME', payload: name });
    dispatch({ type: 'SET_OLLAMA_MODEL', payload: ollamaModel });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLoadDemo = () => {
    if (confirm('Load demo data? This will add sample activities and evidence to show the full system.')) {
      dispatch({ type: 'LOAD_DEMO_DATA' });
    }
  };

  const handleReset = () => {
    if (confirm('⚠️ This will delete ALL your data. Are you absolutely sure?')) {
      dispatch({ type: 'RESET_STORE' });
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(store, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compounding-os-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your personal command center.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
        {/* Profile */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <User size={16} color="var(--accent-light)" />
            <h3>Profile</h3>
          </div>
          <div className="form-group">
            <label className="form-label">Your name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="stat-label">Total XP</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-light)' }}>{store.profile.totalXP.toLocaleString()}</div>
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="stat-label">Current Streak</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--amber)' }}>🔥 {store.profile.currentStreak} days</div>
          </div>
        </div>

        {/* AI Coach — Ollama */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Key size={16} color="var(--accent-light)" />
            <h3>Ollama Model</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            The AI Coach and Content Library run on your local Ollama instance. Choose the model you want to use.
            Make sure it's pulled and Ollama is running with <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4, fontSize: '0.8em' }}>OLLAMA_ORIGINS="*" ollama serve</code>.
          </p>
          <div className="form-group">
            <label className="form-label">Model Name</label>
            <input
              className="input"
              placeholder="e.g. gemma3, llama3, mistral"
              value={ollamaModel}
              onChange={e => setOllamaModel(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {['llama3', 'gemma3', 'mistral', 'phi4', 'llama3:8b'].map(m => (
              <button
                key={m}
                onClick={() => setOllamaModel(m)}
                className="btn btn-secondary btn-sm"
                style={{ background: ollamaModel === m ? 'var(--accent-glow)' : undefined, color: ollamaModel === m ? 'var(--accent-light)' : undefined }}
              >
                {m}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Pull any model with: <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>ollama pull gemma3</code>
            &nbsp;| Browse models at <a href="https://ollama.com/library" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-light)' }}>ollama.com/library</a>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave} style={{ width: 'fit-content' }}>
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>

        <div className="divider" />

        {/* Data */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Data</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Load Demo Data</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Add sample activities and evidence to see the full system</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleLoadDemo}>Load Demo</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Export Data</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Download all your data as JSON</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={13} /> Export</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(239,68,68,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.1)' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--red)' }}>Reset All Data</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delete everything and start fresh</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={handleReset}><RotateCcw size={13} /> Reset</button>
            </div>
          </div>
        </div>

        {/* Philosophy */}
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>The North Star Metric</h3>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            <p>This system measures one thing above all else:</p>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-light)', margin: '12px 0' }}>Compounding Evidence Created</p>
            <p>Meaningful, externally verifiable proof of capability: shipped experiments, measured product improvements, user interviews, case studies, published work, strong interview performances.</p>
            <p style={{ marginTop: 12, fontStyle: 'italic', color: 'var(--text-muted)' }}>"Is what I'm doing today making future me more capable?"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
