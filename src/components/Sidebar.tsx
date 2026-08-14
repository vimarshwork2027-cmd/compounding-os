import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Zap, Eye, GitBranch, Archive, Mic2,
  Dumbbell, Brain, Briefcase, Users2, Lightbulb,
  GitFork, Timer, Telescope, BarChart2, RefreshCw,
  AlertTriangle, Settings, Target, FlameKindling, BookOpen, Star
} from 'lucide-react';
import { useStore } from '../store';
import { getLevelInfo } from '../data/engine';

const NAV = [
  {
    section: 'Core',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/log', label: 'Log Activity', icon: Zap },
      { to: '/mirror', label: 'The Mirror', icon: Eye },
    ],
  },
  {
    section: 'Train',
    items: [
      { to: '/skills', label: 'Skill Tree', icon: GitBranch },
      { to: '/interview', label: 'Interview Mode', icon: Mic2 },
      { to: '/communication', label: 'Comm. Gym', icon: Brain },
      { to: '/product-gym', label: 'Product Gym', icon: Dumbbell },
      { to: '/boring-mode', label: 'Boring Mode', icon: Timer },
    ],
  },
  {
    section: 'Build',
    items: [
      { to: '/thisweekend', label: 'ThisWeekend', icon: Star },
      { to: '/evidence', label: 'Evidence Vault', icon: Archive },
    ],
  },
  {
    section: 'Career',
    items: [
      { to: '/career', label: 'Career Funnel', icon: Briefcase },
      { to: '/network', label: 'Network', icon: Users2 },
    ],
  },
  {
    section: 'Mind',
    items: [
      { to: '/focus', label: 'Focus System', icon: Target },
      { to: '/decisions', label: 'Decisions', icon: GitFork },
      { to: '/ideas', label: 'Idea Parking', icon: Lightbulb },
      { to: '/failures', label: 'Failure Log', icon: FlameKindling },
    ],
  },
  {
    section: 'Review',
    items: [
      { to: '/future-me', label: 'Future Me', icon: Telescope },
      { to: '/review', label: 'Weekly Review', icon: RefreshCw },
      { to: '/review/monthly', label: 'Monthly Review', icon: BarChart2 },
    ],
  },
  {
    section: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const { store } = useStore();
  const levelInfo = getLevelInfo(store.profile.totalXP);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">Compounding OS</div>
        <div className="sidebar-brand-tagline">Personal Command Center</div>
      </div>

      {/* User XP Block */}
      <div style={{ padding: '12px 20px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{store.profile.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>Lv.{levelInfo.level} · {levelInfo.name}</div>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-light)' }}>
            {store.profile.totalXP.toLocaleString()} XP
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${levelInfo.progress}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            {levelInfo.nextLvl ? `${levelInfo.nextLvl.minXP - store.profile.totalXP} XP to ${levelInfo.nextLvl.name}` : 'Max Level'}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--amber)' }}>
            🔥 {store.profile.currentStreak}d
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <item.icon size={15} className="nav-item-icon" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
