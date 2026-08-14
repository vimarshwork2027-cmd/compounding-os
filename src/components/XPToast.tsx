import { useState, useEffect } from 'react';
import { Zap, TrendingUp } from 'lucide-react';

interface XPToastProps {
  xp: number;
  skillName?: string;
  reason?: string;
  onDone: () => void;
}

export function XPToast({ xp, skillName, reason, onDone }: XPToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="xp-toast">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Zap size={18} color="var(--accent-light)" />
        </div>
        <div>
          <div className="xp-toast-amount">+{xp} XP</div>
          {skillName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <TrendingUp size={12} color="var(--green)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--green)' }}>{skillName} improved</span>
            </div>
          )}
          {reason && <div className="xp-toast-detail">{reason}</div>}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
            You are building evidence, not just activity.
          </div>
        </div>
      </div>
    </div>
  );
}
