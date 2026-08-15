import { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { useStore } from '../store';
import { chatWithOllama } from '../services/ollama';
import type { ChatMessage } from '../services/ollama';

// Simple markdown renderer for AI responses
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines (add spacing)
    if (line.trim() === '') {
      result.push(<div key={i} style={{ height: 8 }} />);
      i++;
      continue;
    }

    // Bullet points: lines starting with * or -
    if (/^[\*\-]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[\*\-]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[\*\-]\s+/, ''));
        i++;
      }
      result.push(
        <ul key={i} style={{ margin: '4px 0', paddingLeft: 18 }}>
          {items.map((item, j) => (
            <li key={j} style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list: lines starting with 1. 2. etc.
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      result.push(
        <ol key={i} style={{ margin: '4px 0', paddingLeft: 18 }}>
          {items.map((item, j) => (
            <li key={j} style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ol>
      );
      continue;
    }

    // Normal paragraph
    result.push(
      <p key={i} style={{ margin: '4px 0' }} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
    );
    i++;
  }

  return result;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(124,58,237,0.15);padding:1px 5px;border-radius:3px;font-size:0.85em">$1</code>');
}

const MODES = [
  { key: 'morning', label: 'Morning Coach', prompt: 'What is the highest-leverage thing I should do today?', emoji: '🌅' },
  { key: 'interview', label: 'Interview Coach', prompt: 'Ask me a product design interview question and coach my answer.', emoji: '🎤' },
  { key: 'product', label: 'Product Coach', prompt: 'Challenge my product thinking about ThisWeekend.', emoji: '💡' },
  { key: 'founder', label: 'Founder Coach', prompt: 'Challenge my ThisWeekend strategy. Be direct.', emoji: '🚀' },
  { key: 'reflection', label: 'Reflection Coach', prompt: 'Help me understand why I didn\'t execute this week.', emoji: '🪞' },
  { key: 'career', label: 'Career Coach', prompt: 'Look at my evidence and tell me what is missing for a strong product designer portfolio.', emoji: '💼' },
];

// Re-use ChatMessage from ollama.ts

export function AICoach() {
  const { store } = useStore();
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const buildContext = () => {
    const last7 = store.activities.filter(a => (Date.now() - new Date(a.timestamp).getTime()) < 7 * 86400000);
    const weaknesses = store.weaknesses.filter(w => !w.dismissed).map(w => w.evidence).join('; ');
    const activeSeason = store.seasons[0];
    const todayCurriculum = store.dailyCurriculum;
    
    return `
You are an AI coach for a product designer who wants to become world-class and eventually a founder.
Your role is to: Diagnose, Challenge, Prioritize, Reflect, Explain patterns, Recommend experiments.
You are NOT a cheerleader. Be honest, concise, evidence-based.

User context:
- Name: ${store.profile.name}
- Total XP: ${store.profile.totalXP}
- Level: ${store.profile.level}
- Current streak: ${store.profile.currentStreak} days
- Activities last 7 days: ${last7.length}
- Shipped last 7 days: ${last7.filter(a => a.type === 'SHIP').length}
- Evidence cards: ${store.evidenceCards.length}
- Active weaknesses: ${weaknesses || 'None detected yet'}
- Primary goal: ${store.profile.primaryGoal}
- ThisWeekend features: ${store.thisWeekendFeatures.length} (${store.thisWeekendFeatures.filter(f => ['shipped', 'measured', 'learned'].includes(f.status)).length} shipped)
- Active Season: ${activeSeason ? `${activeSeason.title}` : 'None'}
- Today's Curriculum Objective: ${todayCurriculum?.objective || 'None'}
- Mode: ${selectedMode.label}
    `.trim();
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = buildContext();
      const allMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages,
        userMsg,
      ];

      const reply = await chatWithOllama(allMessages, store.ollamaModel || 'llama3');
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: err.message || 'Error connecting to Ollama.' }]);
    } finally {
      setLoading(false);
    }
  };

  const startMode = () => {
    setMessages([]);
    setInput(selectedMode.prompt);
  };

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">AI Coach</h1>
        <p className="page-subtitle">Diagnose. Challenge. Prioritize. No cheerleading.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Mode selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MODES.map(mode => (
            <button
              key={mode.key}
              onClick={() => { setSelectedMode(mode); setMessages([]); }}
              className="btn btn-ghost"
              style={{
                justifyContent: 'flex-start', gap: 10, textAlign: 'left', padding: '10px 12px',
                background: selectedMode.key === mode.key ? 'var(--accent-glow)' : undefined,
                color: selectedMode.key === mode.key ? 'var(--accent-light)' : 'var(--text-secondary)',
                border: `1px solid ${selectedMode.key === mode.key ? 'rgba(124,58,237,0.2)' : 'transparent'}`,
              }}
            >
              <span>{mode.emoji}</span>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{mode.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 500 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.1rem' }}>{selectedMode.emoji}</span>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedMode.label}</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{selectedMode.emoji}</div>
                <div style={{ fontSize: '0.9rem', marginBottom: 16 }}>{selectedMode.prompt}</div>
                <button className="btn btn-primary btn-sm" onClick={startMode}>Start Session</button>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 10,
              }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={14} color="var(--accent-light)" />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%', padding: '12px 16px',
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  fontSize: '0.9rem', color: msg.role === 'user' ? 'white' : 'var(--text-secondary)',
                  lineHeight: 1.65,
                }}>
                  {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} color="var(--accent-light)" />
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: '12px 12px 12px 4px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <textarea
              className="textarea"
              style={{ resize: 'none', minHeight: 'unset', height: 44, lineHeight: '24px', padding: '10px 14px' }}
              placeholder="Ask anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <button className="btn btn-primary btn-icon" style={{ height: 44, width: 44 }} onClick={sendMessage} disabled={loading || !input.trim()}>
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateOfflineInsight(store: ReturnType<typeof useStore>['store']): string {
  const last7 = store.activities.filter(a => (Date.now() - new Date(a.timestamp).getTime()) < 7 * 86400000);
  const shipped = last7.filter(a => a.type === 'SHIP').length;
  const consumed = last7.filter(a => a.isConsumption).length;
  const evidence = store.evidenceCards.length;
  const topWeakness = store.weaknesses.filter(w => !w.dismissed && w.severity === 'high')[0];

  const lines = [];

  if (last7.length === 0) {
    lines.push('No activity logged this week. The data can\'t tell me anything meaningful.');
    lines.push('Log what you\'re doing and I\'ll give you honest analysis.');
  } else {
    lines.push(`This week: ${last7.length} activities, ${shipped} shipped, ${consumed} consumed.`);
    if (topWeakness) lines.push(`\nBiggest current pattern: ${topWeakness.evidence}`);
    if (evidence < 3) lines.push(`\nYou have ${evidence} evidence cards. For a product designer at your stage, this is low. Evidence is what turns effort into career capital.`);
    if (shipped === 0) lines.push(`\nNothing shipped this week. Shipping is the only way to create external evidence of your capability.`);
  }

  return lines.join('\n');
}
