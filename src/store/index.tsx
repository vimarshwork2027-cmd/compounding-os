import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppStore, Activity, EvidenceCard, Goal, ParkingLotIdea, Decision, NetworkContact, JobApplication, InterviewSession, CommunicationSession, ProductGymSession, BoringSession, FailureLog, ThisWeekendFeature, SkillKey, LearningResource, Season, DailyCurriculum } from '../types';
import { DEFAULT_STORE, detectWeaknesses, calculateCompoundingScore, getDailyChallenge, SKILL_CATEGORIES } from '../data/engine';

const STORAGE_KEY = 'compounding_os_v1';

function loadStore(): AppStore {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to handle new fields
      return { ...DEFAULT_STORE, ...parsed };
    }
  } catch {}
  return DEFAULT_STORE;
}

function saveStore(store: AppStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_ACTIVITY'; payload: Omit<Activity, 'id'> }
  | { type: 'ADD_EVIDENCE'; payload: Omit<EvidenceCard, 'id'> }
  | { type: 'COMPLETE_BORING_CHALLENGE' }
  | { type: 'ADD_GOAL'; payload: Omit<Goal, 'id'> }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'REMOVE_GOAL'; payload: string }
  | { type: 'ADD_IDEA'; payload: Omit<ParkingLotIdea, 'id' | 'unlocksAt' | 'promoted'> }
  | { type: 'PROMOTE_IDEA'; payload: string }
  | { type: 'ADD_DECISION'; payload: Omit<Decision, 'id'> }
  | { type: 'UPDATE_DECISION'; payload: Decision }
  | { type: 'ADD_CONTACT'; payload: Omit<NetworkContact, 'id'> }
  | { type: 'UPDATE_CONTACT'; payload: NetworkContact }
  | { type: 'ADD_APPLICATION'; payload: Omit<JobApplication, 'id'> }
  | { type: 'UPDATE_APPLICATION'; payload: JobApplication }
  | { type: 'ADD_INTERVIEW'; payload: Omit<InterviewSession, 'id'> }
  | { type: 'ADD_COMM_SESSION'; payload: Omit<CommunicationSession, 'id'> }
  | { type: 'ADD_GYM_SESSION'; payload: Omit<ProductGymSession, 'id'> }
  | { type: 'ADD_BORING_SESSION'; payload: Omit<BoringSession, 'id'> }
  | { type: 'UPDATE_BORING_SESSION'; payload: BoringSession }
  | { type: 'ADD_FAILURE'; payload: Omit<FailureLog, 'id'> }
  | { type: 'ADD_TW_FEATURE'; payload: Omit<ThisWeekendFeature, 'id'> }
  | { type: 'UPDATE_TW_FEATURE'; payload: ThisWeekendFeature }
  | { type: 'SET_AI_KEY'; payload: string }
  | { type: 'UPDATE_PROFILE_NAME'; payload: string }
  | { type: 'COMPLETE_CURRICULUM_STEP'; payload: string }
  | { type: 'ADD_LEARNING_RESOURCE'; payload: LearningResource }
  | { type: 'LOAD_DEMO_DATA' }
  | { type: 'RESET_STORE' };

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function updateSkillScores(store: AppStore, skills: SkillKey[], xpGained: number, activityId: string): AppStore['skillScores'] {
  const updated = { ...store.skillScores };
  const xpPerSkill = skills.length > 0 ? Math.round(xpGained / skills.length) : 0;
  skills.forEach(skill => {
    if (updated[skill]) {
      const current = updated[skill];
      const newXP = current.xp + xpPerSkill;
      updated[skill] = {
        ...current,
        xp: newXP,
        level: Math.min(100, Math.round(newXP / 10)),
        recentActivities: [activityId, ...current.recentActivities].slice(0, 5),
      };
    }
  });
  return updated;
}

function updateStreak(store: AppStore, today: string): Pick<AppStore['profile'], 'currentStreak' | 'longestStreak' | 'lastActiveDate'> {
  const last = store.profile.lastActiveDate;
  if (last === today) return { currentStreak: store.profile.currentStreak, longestStreak: store.profile.longestStreak, lastActiveDate: today };
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = last === yesterday ? store.profile.currentStreak + 1 : 1;
  return {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, store.profile.longestStreak),
    lastActiveDate: today,
  };
}

function reducer(state: AppStore, action: Action): AppStore {
  switch (action.type) {
    case 'ADD_ACTIVITY': {
      const id = uid();
      const activity: Activity = { ...action.payload, id };
      const today = new Date().toISOString().slice(0, 10);
      const streakData = updateStreak(state, today);
      const newSkillScores = updateSkillScores(state, activity.skills, activity.xp, id);
      const newActivities = [activity, ...state.activities];
      const newTotalXP = state.profile.totalXP + activity.xp;

      const newStore: AppStore = {
        ...state,
        activities: newActivities,
        skillScores: newSkillScores,
        profile: {
          ...state.profile,
          totalXP: newTotalXP,
          level: getLevelFromXP(newTotalXP),
          ...streakData,
        },
      };
      newStore.weaknesses = detectWeaknesses(newActivities);
      newStore.profile.compoundingScore = calculateCompoundingScore(newStore);
      return newStore;
    }

    case 'ADD_EVIDENCE': {
      const id = uid();
      const card: EvidenceCard = { ...action.payload, id };
      return { ...state, evidenceCards: [card, ...state.evidenceCards] };
    }

    case 'COMPLETE_BORING_CHALLENGE': {
      if (!state.dailyChallenge) return state;
      return {
        ...state,
        dailyChallenge: { ...state.dailyChallenge, completed: true },
      };
    }

    case 'ADD_GOAL': {
      const id = uid();
      return { ...state, goals: [...state.goals, { ...action.payload, id }] };
    }

    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) };

    case 'REMOVE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };

    case 'ADD_IDEA': {
      const id = uid();
      const unlocksAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      return { ...state, parkingLot: [{ ...action.payload, id, unlocksAt, promoted: false }, ...state.parkingLot] };
    }

    case 'PROMOTE_IDEA':
      return { ...state, parkingLot: state.parkingLot.map(i => i.id === action.payload ? { ...i, promoted: true } : i) };

    case 'ADD_DECISION': {
      const id = uid();
      return { ...state, decisions: [{ ...action.payload, id }, ...state.decisions] };
    }

    case 'UPDATE_DECISION':
      return { ...state, decisions: state.decisions.map(d => d.id === action.payload.id ? action.payload : d) };

    case 'ADD_CONTACT': {
      const id = uid();
      return { ...state, contacts: [{ ...action.payload, id }, ...state.contacts] };
    }

    case 'UPDATE_CONTACT':
      return { ...state, contacts: state.contacts.map(c => c.id === action.payload.id ? action.payload : c) };

    case 'ADD_APPLICATION': {
      const id = uid();
      return { ...state, applications: [{ ...action.payload, id }, ...state.applications] };
    }

    case 'UPDATE_APPLICATION':
      return { ...state, applications: state.applications.map(a => a.id === action.payload.id ? action.payload : a) };

    case 'ADD_INTERVIEW': {
      const id = uid();
      return { ...state, interviewSessions: [{ ...action.payload, id }, ...state.interviewSessions] };
    }

    case 'ADD_COMM_SESSION': {
      const id = uid();
      return { ...state, communicationSessions: [{ ...action.payload, id }, ...state.communicationSessions] };
    }

    case 'ADD_GYM_SESSION': {
      const id = uid();
      return { ...state, productGymSessions: [{ ...action.payload, id }, ...state.productGymSessions] };
    }

    case 'ADD_BORING_SESSION': {
      const id = uid();
      return { ...state, boringSessions: [{ ...action.payload, id }, ...state.boringSessions] };
    }

    case 'UPDATE_BORING_SESSION':
      return { ...state, boringSessions: state.boringSessions.map(s => s.id === action.payload.id ? action.payload : s) };

    case 'ADD_FAILURE': {
      const id = uid();
      return { ...state, failureLogs: [{ ...action.payload, id }, ...state.failureLogs] };
    }

    case 'ADD_TW_FEATURE': {
      const id = uid();
      return { ...state, thisWeekendFeatures: [{ ...action.payload, id }, ...state.thisWeekendFeatures] };
    }

    case 'UPDATE_TW_FEATURE':
      return { ...state, thisWeekendFeatures: state.thisWeekendFeatures.map(f => f.id === action.payload.id ? action.payload : f) };

    case 'SET_AI_KEY':
      return { ...state, aiApiKey: action.payload };

    case 'UPDATE_PROFILE_NAME':
      return { ...state, profile: { ...state.profile, name: action.payload } };

    case 'COMPLETE_CURRICULUM_STEP': {
      if (!state.dailyCurriculum) return state;
      return {
        ...state,
        dailyCurriculum: {
          ...state.dailyCurriculum,
          steps: state.dailyCurriculum.steps.map(s => 
            s.id === action.payload ? { ...s, completed: true } : s
          )
        }
      };
    }

    case 'ADD_LEARNING_RESOURCE': {
      return {
        ...state,
        library: [action.payload, ...(state.library || [])]
      };
    }

    case 'LOAD_DEMO_DATA':
      return loadDemoData(state);

    case 'RESET_STORE':
      return DEFAULT_STORE;

    default:
      return state;
  }
}

function getLevelFromXP(xp: number): number {
  if (xp >= 20000) return 7;
  if (xp >= 10000) return 6;
  if (xp >= 6000) return 5;
  if (xp >= 3000) return 4;
  if (xp >= 1500) return 3;
  if (xp >= 500) return 2;
  return 1;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

function loadDemoData(state: AppStore): AppStore {
  const now = Date.now();
  const day = 86400000;

  const activities: Activity[] = [
    { id: 'd1', type: 'SHIP', title: 'Shipped personalized feed to 50 beta users', description: 'Released the personalized weekend recommendations feature to early access users', xp: 50, skills: ['experimentation', 'activation', 'retention'], evidence: { type: 'live_url', url: 'https://thisweekend.app', metric: '+24% repeat engagement' }, boringChallenge: false, timestamp: new Date(now - day * 2).toISOString(), isConsumption: false },
    { id: 'd2', type: 'COMMUNICATE', title: 'Recorded District case study walkthrough', description: 'Recorded a 7-minute case study of the District redesign with problem, solution, metrics', xp: 18, skills: ['storytelling', 'presenting'], evidence: { type: 'loom_video', url: '#' }, boringChallenge: false, timestamp: new Date(now - day * 3).toISOString(), isConsumption: false },
    { id: 'd3', type: 'THINK', title: 'Product teardown: Airbnb Experiences', description: 'Deep analysis of Airbnb\'s expansion into experiences and why it works', xp: 12, skills: ['product_strategy', 'problem_framing', 'market_analysis'], boringChallenge: false, timestamp: new Date(now - day * 4).toISOString(), isConsumption: false },
    { id: 'd4', type: 'MAKE', title: 'Designed onboarding flow v3', description: 'Redesigned the onboarding flow based on user drop-off data', xp: 10, skills: ['visual_design', 'ux', 'interaction_design'], boringChallenge: false, timestamp: new Date(now - day * 4).toISOString(), isConsumption: false },
    { id: 'd5', type: 'REFLECT', title: 'Weekly retrospective', description: 'What worked, what failed, what I learned this week', xp: 12, skills: ['consistency', 'patience'], boringChallenge: false, timestamp: new Date(now - day * 5).toISOString(), isConsumption: false },
    { id: 'd6', type: 'SHIP', title: 'Published case study on Medium', description: 'Published the ThisWeekend product case study publicly', xp: 40, skills: ['storytelling', 'writing', 'product_strategy'], evidence: { type: 'published_post', url: '#' }, boringChallenge: true, timestamp: new Date(now - day * 6).toISOString(), isConsumption: false },
    { id: 'd7', type: 'THINK', title: 'Competitive analysis: Fever vs RA', description: 'Compared Fever and ResidentAdvisor on discovery, monetization, and retention', xp: 10, skills: ['competitive_strategy', 'market_analysis'], boringChallenge: false, timestamp: new Date(now - day * 7).toISOString(), isConsumption: false },
    { id: 'd8', type: 'MAKE', title: 'Built API integration for event data', description: 'Integrated a third-party events API to expand city coverage', xp: 15, skills: ['apis', 'javascript'], boringChallenge: false, timestamp: new Date(now - day * 8).toISOString(), isConsumption: false },
    { id: 'd9', type: 'COMMUNICATE', title: 'Mock PM interview — Spotify redesign', description: 'Completed a full 45-min mock PM interview with Spotify as the product', xp: 20, skills: ['presenting', 'structured_thinking', 'product_strategy'], boringChallenge: false, timestamp: new Date(now - day * 9).toISOString(), isConsumption: false },
    { id: 'd10', type: 'THINK', title: 'Visual design', description: 'Read articles on color theory', xp: 1, skills: ['visual_design'], boringChallenge: false, timestamp: new Date(now - day * 1).toISOString(), isConsumption: true },
    { id: 'd11', type: 'MAKE', title: 'Redesigned landing page hero section', description: 'Polished the hero typography and spacing — third revision this week', xp: 8, skills: ['visual_design', 'interaction_design'], boringChallenge: false, timestamp: new Date(now - day * 1).toISOString(), isConsumption: false },
    { id: 'd12', type: 'MAKE', title: 'Updated color system in design system', description: 'Refined the color palette across all components', xp: 7, skills: ['design_systems', 'visual_design'], boringChallenge: false, timestamp: new Date(now - day * 1).toISOString(), isConsumption: false },
  ];

  const evidenceCards: EvidenceCard[] = [
    {
      id: 'e1',
      title: 'ThisWeekend Personalization Experiment',
      problem: 'Users struggle to discover weekend activities relevant to them.',
      hypothesis: 'Personalized recommendations based on past activity will increase repeat usage.',
      action: 'Built and shipped personalized weekend feed to 50 beta users.',
      result: '+24% repeat engagement in 14 days.',
      metric: '+24% repeat engagement',
      learning: 'Users respond more strongly to social proof than pure personalization. Combining both doubled engagement.',
      evidenceType: 'experiment_result',
      evidenceUrl: 'https://thisweekend.app',
      skills: ['experimentation', 'product_strategy', 'retention', 'ux'],
      timestamp: new Date(now - day * 2).toISOString(),
      projectId: 'tw',
    },
    {
      id: 'e2',
      title: 'District Case Study',
      problem: 'District\'s discovery feature had high drop-off at the map view.',
      hypothesis: 'A list-first view with filters would reduce cognitive load and improve conversion.',
      action: 'Redesigned map/list toggle and filter system. Created prototype in Figma.',
      result: 'Presented in 3 interviews. All interviewers called out the data-driven approach.',
      metric: '3 portfolio round passes',
      learning: 'Anchoring decisions in specific user data (not assumptions) makes case studies significantly stronger.',
      evidenceType: 'figma_link',
      evidenceUrl: '#',
      skills: ['ux', 'visual_design', 'problem_framing', 'storytelling'],
      timestamp: new Date(now - day * 14).toISOString(),
    },
  ];

  const library: LearningResource[] = [
    {
      id: 'l1',
      type: 'book',
      title: 'Hooked',
      source: 'Nir Eyal',
      skills: ['retention', 'product_strategy'],
      difficulty: 'Intermediate',
      timeEstimate: '4h 30m',
      whyThis: 'You are currently working on ThisWeekend retention.',
      applicationTask: 'Analyze ThisWeekend using the Hook Model.',
      concepts: [
        { id: 'c1', title: 'Trigger', mastered: true },
        { id: 'c2', title: 'Action', mastered: true },
        { id: 'c3', title: 'Variable reward', mastered: true },
        { id: 'c4', title: 'Investment', mastered: false },
        { id: 'c5', title: 'Habit loops', mastered: false },
      ],
      progress: 60,
      status: 'in_progress'
    },
    {
      id: 'l2',
      type: 'video',
      title: 'How to tell better product stories',
      source: 'YouTube',
      skills: ['storytelling', 'presenting'],
      difficulty: 'Beginner',
      timeEstimate: '18 min',
      whyThis: 'Your recent interview scores show storytelling is one of your weakest areas.',
      applicationTask: 'Re-record your ThisWeekend case study using the storytelling framework.',
      concepts: [],
      progress: 0,
      status: 'queue'
    }
  ];

  const seasons: Season[] = [
    {
      id: 's1',
      number: 1,
      title: 'Become a Strong Product Designer',
      durationDays: 90,
      startDate: new Date(now - day * 17).toISOString(),
      goals: [
        { id: 'sg1', metric: 'product teardowns', target: 30, current: 4 },
        { id: 'sg2', metric: 'interview recordings', target: 20, current: 2 },
        { id: 'sg3', metric: 'user interviews', target: 10, current: 3 },
        { id: 'sg4', metric: 'experiments', target: 3, current: 1 },
      ]
    }
  ];

  const dailyCurriculum: DailyCurriculum = {
    date: new Date().toISOString().slice(0, 10),
    objective: 'Improve product storytelling.',
    steps: [
      {
        id: 'step1',
        phase: 'LEARN',
        icon: '📺',
        timeEstimate: '18 min',
        title: 'Watch: How to tell better product stories',
        why: 'Your recent interview scores show storytelling is one of your weakest areas.',
        description: 'Watch the video from the library.',
        xpReward: 5,
        completed: false
      },
      {
        id: 'step2',
        phase: 'EXTRACT',
        icon: '🧠',
        timeEstimate: '5 min',
        title: 'Write the 3 most useful ideas from the video.',
        description: 'Extract concepts into your mind.',
        xpReward: 5,
        completed: false
      },
      {
        id: 'step3',
        phase: 'APPLY',
        icon: '🎤',
        timeEstimate: '10 min',
        title: 'Re-record your ThisWeekend case study',
        description: 'Use the storytelling framework you just learned.',
        xpReward: 15,
        completed: false
      },
      {
        id: 'step4',
        phase: 'SHIP',
        icon: '🚀',
        timeEstimate: '30 min',
        title: 'Publish your revised case study section.',
        description: 'Put it in your public portfolio.',
        xpReward: 30,
        completed: false
      }
    ]
  };

  // Apply activities to build skill scores
  let newState = { ...state, activities: [...activities, ...state.activities], evidenceCards: [...evidenceCards, ...state.evidenceCards], library, seasons, dailyCurriculum };
  activities.forEach(a => {
    newState.skillScores = updateSkillScores(newState, a.skills, a.xp, a.id);
    newState.profile.totalXP += a.xp;
  });
  newState.profile.level = getLevelFromXP(newState.profile.totalXP);
  newState.profile.currentStreak = 7;
  newState.profile.longestStreak = 12;
  newState.profile.lastActiveDate = new Date().toISOString().slice(0, 10);
  newState.weaknesses = detectWeaknesses(newState.activities);
  newState.profile.compoundingScore = calculateCompoundingScore(newState);

  return newState;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface StoreContextValue {
  store: AppStore;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, dispatch] = useReducer(reducer, undefined, () => {
    const loaded = loadStore();
    // Ensure daily challenge is fresh
    const today = new Date().toISOString().slice(0, 10);
    if (!loaded.dailyChallenge || loaded.dailyChallenge.date !== today) {
      loaded.dailyChallenge = getDailyChallenge(today);
    }
    return loaded;
  });

  useEffect(() => {
    saveStore(store);
  }, [store]);

  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function useDispatch() {
  const { dispatch } = useStore();
  return dispatch;
}
