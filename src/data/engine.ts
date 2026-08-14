import type {
  AppStore, SkillKey, SkillCategory, SkillScore, UserProfile,
  DailyBoringChallenge
} from '../types';

// ─── Skill Tree Map ──────────────────────────────────────────────────────────

export const SKILL_CATEGORIES: Record<SkillCategory, { label: string; color: string; skills: SkillKey[] }> = {
  PRODUCT_DESIGN: {
    label: 'Product Design',
    color: '#7C3AED',
    skills: ['visual_design', 'interaction_design', 'ux', 'information_architecture', 'design_systems', 'prototyping'],
  },
  PRODUCT_THINKING: {
    label: 'Product Thinking',
    color: '#2563EB',
    skills: ['problem_framing', 'user_research', 'prioritization', 'trade_offs', 'experimentation', 'product_strategy', 'metrics'],
  },
  COMMUNICATION: {
    label: 'Communication',
    color: '#059669',
    skills: ['storytelling', 'presenting', 'structured_thinking', 'writing', 'verbal_clarity', 'persuasion'],
  },
  BUSINESS: {
    label: 'Business',
    color: '#D97706',
    skills: ['business_models', 'pricing', 'revenue', 'unit_economics', 'market_analysis', 'competitive_strategy'],
  },
  GROWTH: {
    label: 'Growth',
    color: '#DC2626',
    skills: ['acquisition', 'activation', 'retention', 'referrals', 'loops', 'distribution'],
  },
  TECHNICAL: {
    label: 'Technical',
    color: '#0891B2',
    skills: ['html_css', 'javascript', 'react', 'nextjs', 'apis', 'databases', 'ai_dev'],
  },
  SALES: {
    label: 'Sales',
    color: '#EA580C',
    skills: ['pitching', 'cold_outreach', 'discovery', 'objection_handling', 'negotiation', 'closing'],
  },
  LEADERSHIP: {
    label: 'Leadership',
    color: '#7C3AED',
    skills: ['decision_making', 'delegation', 'feedback', 'hiring', 'collaboration', 'conflict_resolution'],
  },
  EXECUTION: {
    label: 'Execution',
    color: '#16A34A',
    skills: ['consistency', 'focus', 'shipping_exec', 'finishing', 'patience'],
  },
};

export const SKILL_LABELS: Record<SkillKey, string> = {
  visual_design: 'Visual Design', interaction_design: 'Interaction Design', ux: 'UX',
  information_architecture: 'Information Architecture', design_systems: 'Design Systems', prototyping: 'Prototyping',
  problem_framing: 'Problem Framing', user_research: 'User Research', prioritization: 'Prioritization',
  trade_offs: 'Trade-offs', experimentation: 'Experimentation', product_strategy: 'Product Strategy', metrics: 'Metrics',
  storytelling: 'Storytelling', presenting: 'Presenting', structured_thinking: 'Structured Thinking',
  writing: 'Writing', verbal_clarity: 'Verbal Clarity', persuasion: 'Persuasion',
  business_models: 'Business Models', pricing: 'Pricing', revenue: 'Revenue',
  unit_economics: 'Unit Economics', market_analysis: 'Market Analysis', competitive_strategy: 'Competitive Strategy',
  acquisition: 'Acquisition', activation: 'Activation', retention: 'Retention',
  referrals: 'Referrals', loops: 'Loops', distribution: 'Distribution',
  html_css: 'HTML/CSS', javascript: 'JavaScript', react: 'React',
  nextjs: 'Next.js', apis: 'APIs', databases: 'Databases', ai_dev: 'AI Development',
  pitching: 'Pitching', cold_outreach: 'Cold Outreach', discovery: 'Discovery',
  objection_handling: 'Objection Handling', negotiation: 'Negotiation', closing: 'Closing',
  decision_making: 'Decision Making', delegation: 'Delegation', feedback: 'Feedback',
  hiring: 'Hiring', collaboration: 'Collaboration', conflict_resolution: 'Conflict Resolution',
  consistency: 'Consistency', focus: 'Focus', shipping_exec: 'Shipping', finishing: 'Finishing', patience: 'Patience',
};

// ─── Level System ────────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1, name: 'Explorer', minXP: 0, maxXP: 500 },
  { level: 2, name: 'Practitioner', minXP: 500, maxXP: 1500 },
  { level: 3, name: 'Builder', minXP: 1500, maxXP: 3000 },
  { level: 4, name: 'Product Thinker', minXP: 3000, maxXP: 6000 },
  { level: 5, name: 'Operator', minXP: 6000, maxXP: 10000 },
  { level: 6, name: 'Product Leader', minXP: 10000, maxXP: 20000 },
  { level: 7, name: 'Founder', minXP: 20000, maxXP: Infinity },
];

export function getLevelInfo(xp: number) {
  const lvl = LEVELS.findLast(l => xp >= l.minXP) ?? LEVELS[0];
  const nextLvl = LEVELS.find(l => l.level === lvl.level + 1);
  const progress = nextLvl
    ? ((xp - lvl.minXP) / (nextLvl.minXP - lvl.minXP)) * 100
    : 100;
  return { ...lvl, nextLvl, progress: Math.min(100, Math.round(progress)) };
}

// ─── XP Engine ───────────────────────────────────────────────────────────────

export const BASE_XP: Record<string, number> = {
  // THINK
  product_teardown: 12, competitor_analysis: 10, hypothesis_creation: 12,
  problem_framing_act: 10, decision_analysis: 8, strategic_thinking: 10,
  // MAKE
  design: 10, prototype: 15, code: 12, case_study: 20, experiment: 20, landing_page: 15, feature: 20,
  // COMMUNICATE
  interview_rehearsal: 20, presenting_case_study: 18, writing_act: 8, recording: 15, explaining: 10, pitching_act: 20,
  // SHIP
  launch_feature: 50, publish_case_study: 40, release_update: 35, send_proposal: 20, contact_user: 25, run_experiment: 40,
  // REFLECT
  retrospective: 10, failure_analysis: 12, weekly_review: 15, pattern_recognition: 10,
  // Generic
  read_article: 1, watch_video: 1, apply_insight: 10, talk_to_users: 30, mock_interview: 20, cold_outreach: 25,
};

export const ACTION_TYPE_XP_MULTIPLIERS: Record<string, number> = {
  SHIP: 1.5,
  MAKE: 1.0,
  COMMUNICATE: 1.0,
  THINK: 0.8,
  REFLECT: 0.9,
};

export function calculateXP(
  baseXP: number,
  actionType: string,
  hasEvidence: boolean,
  isBoringChallenge: boolean,
  isConsumption: boolean,
  todayActivityCount: number,
  actionTypeCount: number
): number {
  let xp = baseXP;

  // Action type multiplier
  xp *= ACTION_TYPE_XP_MULTIPLIERS[actionType] ?? 1;

  // Consumption cap
  if (isConsumption) return Math.min(xp, 2);

  // Evidence bonus
  if (hasEvidence) xp *= 1.5;

  // Boring challenge bonus
  if (isBoringChallenge) xp *= 2;

  // Diminishing returns (same action type > 3x/day)
  if (actionType !== 'SHIP' && actionTypeCount >= 3) xp *= 0.5;

  return Math.round(xp);
}

// ─── Boring Challenge Generator ───────────────────────────────────────────────

const BORING_CHALLENGES = [
  { challenge: 'Call or voice-message a real ThisWeekend user today', xpBonus: 50 },
  { challenge: 'Send 3 cold LinkedIn messages to PMs at companies you admire', xpBonus: 45 },
  { challenge: 'Record a 5-minute walkthrough of your best case study', xpBonus: 40 },
  { challenge: "Finish an unfinished case study you've been avoiding", xpBonus: 55 },
  { challenge: 'Write down the 3 biggest assumptions in ThisWeekend and test one today', xpBonus: 40 },
  { challenge: 'Practice the "tell me about yourself" answer 3 times, record it', xpBonus: 35 },
  { challenge: 'Reach out to someone you respect and ask for 20 minutes of their time', xpBonus: 45 },
  { challenge: 'Analyze your last 3 interview rejections and find the common thread', xpBonus: 30 },
  { challenge: 'Pitch ThisWeekend to someone outside of tech — explain it in 60 seconds', xpBonus: 35 },
  { challenge: 'Write a 300-word honest reflection on what you have been avoiding', xpBonus: 30 },
  { challenge: 'Ask a designer or PM for brutal feedback on your portfolio', xpBonus: 40 },
  { challenge: 'Run a 30-minute usability test with a real user', xpBonus: 50 },
  { challenge: 'Publish something publicly — tweet, article, case study, or post', xpBonus: 45 },
  { challenge: 'Do a complete product teardown of a competitor and write 5 insights', xpBonus: 30 },
  { challenge: 'Fix the most annoying bug or UX issue in ThisWeekend right now', xpBonus: 35 },
  { challenge: 'Answer a behavioral interview question on camera — then rewatch it', xpBonus: 35 },
  { challenge: 'Write down every project you started in the last 6 months and their status', xpBonus: 25 },
  { challenge: 'Send one proposal, partnership request, or collaboration ask today', xpBonus: 40 },
  { challenge: 'Measure something in ThisWeekend that you have been guessing about', xpBonus: 35 },
  { challenge: 'Write your personal narrative — why you do this — in 200 words', xpBonus: 30 },
];

export function getDailyChallenge(dateStr: string): DailyBoringChallenge {
  const idx = dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % BORING_CHALLENGES.length;
  return {
    date: dateStr,
    ...BORING_CHALLENGES[idx],
    completed: false,
  };
}

// ─── Default Store ────────────────────────────────────────────────────────────

function buildInitialSkillScores(): Record<SkillKey, SkillScore> {
  const scores: Partial<Record<SkillKey, SkillScore>> = {};
  Object.entries(SKILL_CATEGORIES).forEach(([cat, catData]) => {
    catData.skills.forEach(skill => {
      scores[skill] = {
        key: skill,
        category: cat as SkillCategory,
        xp: 0,
        level: 0,
        recentActivities: [],
      };
    });
  });
  return scores as Record<SkillKey, SkillScore>;
}

export const DEFAULT_STORE: AppStore = {
  profile: {
    name: 'Vimarsh',
    level: 1,
    totalXP: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    primaryGoal: 'Become an exceptional product designer and future founder.',
    compoundingScore: 0,
  },
  activities: [],
  evidenceCards: [],
  skillScores: buildInitialSkillScores(),
  weaknesses: [],
  goals: [
    { id: 'g1', title: 'Become an exceptional product designer', description: 'World-class design craft + product thinking', type: 'primary', createdAt: new Date().toISOString() },
    { id: 'g2', title: 'Build ThisWeekend', description: 'Ship experiments. Talk to users. Measure.', type: 'secondary', createdAt: new Date().toISOString() },
    { id: 'g3', title: 'Improve communication & storytelling', description: 'Clarity, structure, confidence', type: 'secondary', createdAt: new Date().toISOString() },
  ],
  parkingLot: [],
  decisions: [],
  contacts: [],
  applications: [],
  interviewSessions: [],
  communicationSessions: [],
  productGymSessions: [],
  boringSessions: [],
  failureLogs: [],
  thisWeekendFeatures: [],
  dailyChallenge: null,
  aiApiKey: '',
};

// ─── Weakness Detection ───────────────────────────────────────────────────────

export function detectWeaknesses(activities: AppStore['activities']): AppStore['weaknesses'] {
  const now = new Date();
  const last14Days = activities.filter(a => {
    const d = new Date(a.timestamp);
    return (now.getTime() - d.getTime()) < 14 * 24 * 60 * 60 * 1000;
  });
  const last7Days = activities.filter(a => {
    const d = new Date(a.timestamp);
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });

  const weaknesses: AppStore['weaknesses'] = [];

  // Consumption addiction
  const consumptionActivities = last7Days.filter(a => a.isConsumption);
  const applicationActivities = last7Days.filter(a => !a.isConsumption);
  if (consumptionActivities.length > applicationActivities.length * 2 && consumptionActivities.length > 3) {
    weaknesses.push({
      type: 'consumption_addiction',
      severity: 'high',
      evidence: `You consumed ${consumptionActivities.length} pieces of content but only applied ${applicationActivities.length} times this week. Consumption is not progress.`,
      detectedAt: now.toISOString(),
      dismissed: false,
    });
  }

  // Low shipping
  const shipped = last7Days.filter(a => a.type === 'SHIP');
  const inProgress = last7Days.filter(a => a.type === 'MAKE');
  if (inProgress.length > shipped.length * 3 && inProgress.length >= 3) {
    weaknesses.push({
      type: 'low_shipping',
      severity: 'high',
      evidence: `You have ${inProgress.length} things in progress but only shipped ${shipped.length} this week. Many projects in progress, few public.`,
      detectedAt: now.toISOString(),
      dismissed: false,
    });
  }

  // Inconsistency — check active days
  const activeDays = new Set(last14Days.map(a => a.timestamp.slice(0, 10))).size;
  if (last14Days.length > 5 && activeDays < 6) {
    weaknesses.push({
      type: 'inconsistency',
      severity: 'medium',
      evidence: `You were active only ${activeDays} of the last 14 days. Strong bursts followed by several inactive days. Consistency compounds more than intensity.`,
      detectedAt: now.toISOString(),
      dismissed: false,
    });
  }

  // Avoiding uncomfortable — user research / sales vs design
  const designActs = last7Days.filter(a => a.skills.includes('visual_design') || a.skills.includes('interaction_design'));
  const researchActs = last7Days.filter(a => a.skills.includes('user_research') || a.skills.includes('cold_outreach'));
  if (designActs.length > researchActs.length * 4 && designActs.length > 2) {
    weaknesses.push({
      type: 'avoiding_uncomfortable',
      severity: 'medium',
      evidence: `You spent ${designActs.length} sessions on design and ${researchActs.length} on user research/sales. You're optimizing aesthetics more than product validation.`,
      detectedAt: now.toISOString(),
      dismissed: false,
    });
  }

  // Lack of evidence
  const evidenceActivities = last14Days.filter(a => a.evidence?.url || a.evidence?.metric);
  if (last14Days.length > 10 && evidenceActivities.length < 2) {
    weaknesses.push({
      type: 'lack_of_evidence',
      severity: 'medium',
      evidence: `You completed ${last14Days.length} activities in 14 days but have ${evidenceActivities.length} pieces of external evidence. Activity without proof doesn't compound.`,
      detectedAt: now.toISOString(),
      dismissed: false,
    });
  }

  return weaknesses;
}

// ─── Compounding Score ────────────────────────────────────────────────────────

export function calculateCompoundingScore(store: AppStore): number {
  const evidenceCount = store.evidenceCards.length;
  const shippedCount = store.activities.filter(a => a.type === 'SHIP').length;
  const realWorldCount = store.activities.filter(a =>
    a.skills.includes('user_research') || a.skills.includes('cold_outreach') || a.type === 'SHIP'
  ).length;
  const streak = store.profile.currentStreak;

  // Weighted formula emphasizing real-world impact
  return Math.round(
    (evidenceCount * 5) +
    (shippedCount * 3) +
    (realWorldCount * 2) +
    (streak * 1) +
    (store.profile.totalXP / 10)
  );
}

// ─── Future Me Projections ────────────────────────────────────────────────────

export function projectFutureMe(activities: AppStore['activities']) {
  const last30Days = activities.filter(a => {
    const d = new Date(a.timestamp);
    return (Date.now() - d.getTime()) < 30 * 24 * 60 * 60 * 1000;
  });

  const perDay = (count: number) => count / 30;

  const teardowns = last30Days.filter(a => a.type === 'THINK').length;
  const communication = last30Days.filter(a => a.type === 'COMMUNICATE').length;
  const experiments = last30Days.filter(a => a.skills.includes('experimentation') || a.type === 'SHIP').length;
  const userInterviews = last30Days.filter(a => a.skills.includes('user_research')).length;
  const caseStudies = last30Days.filter(a => a.skills.includes('storytelling') || a.skills.includes('case_study' as SkillKey)).length;
  const publicWork = last30Days.filter(a => a.type === 'SHIP').length;

  return {
    teardowns: Math.round(perDay(teardowns) * 365),
    communication: Math.round(perDay(communication) * 365),
    experiments: Math.round(perDay(experiments) * 365),
    userInterviews: Math.round(perDay(userInterviews) * 365),
    caseStudies: Math.round(perDay(caseStudies) * 365),
    publicWork: Math.round(perDay(publicWork) * 365),
  };
}
