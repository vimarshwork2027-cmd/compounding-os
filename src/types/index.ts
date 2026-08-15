// ─── Enums ───────────────────────────────────────────────────────────────────

export type ActionType = 'THINK' | 'MAKE' | 'COMMUNICATE' | 'SHIP' | 'REFLECT';

export type SkillKey =
  | 'visual_design' | 'interaction_design' | 'ux' | 'information_architecture' | 'design_systems' | 'prototyping'
  | 'problem_framing' | 'user_research' | 'prioritization' | 'trade_offs' | 'experimentation' | 'product_strategy' | 'metrics'
  | 'storytelling' | 'presenting' | 'structured_thinking' | 'writing' | 'verbal_clarity' | 'persuasion'
  | 'business_models' | 'pricing' | 'revenue' | 'unit_economics' | 'market_analysis' | 'competitive_strategy'
  | 'acquisition' | 'activation' | 'retention' | 'referrals' | 'loops' | 'distribution'
  | 'html_css' | 'javascript' | 'react' | 'nextjs' | 'apis' | 'databases' | 'ai_dev'
  | 'pitching' | 'cold_outreach' | 'discovery' | 'objection_handling' | 'negotiation' | 'closing'
  | 'decision_making' | 'delegation' | 'feedback' | 'hiring' | 'collaboration' | 'conflict_resolution'
  | 'consistency' | 'focus' | 'shipping_exec' | 'finishing' | 'patience';

export type SkillCategory =
  | 'PRODUCT_DESIGN' | 'PRODUCT_THINKING' | 'COMMUNICATION'
  | 'BUSINESS' | 'GROWTH' | 'TECHNICAL' | 'SALES' | 'LEADERSHIP' | 'EXECUTION';

export type EvidenceType =
  | 'screenshot' | 'figma_link' | 'live_url' | 'github_repo' | 'loom_video'
  | 'metrics' | 'interview_notes' | 'document' | 'published_post' | 'testimonial'
  | 'before_after' | 'experiment_result';

export type WeaknessType =
  | 'novelty_seeking' | 'overthinking' | 'premature_polishing'
  | 'consumption_addiction' | 'lack_of_focus' | 'weak_communication'
  | 'lack_of_evidence' | 'avoiding_uncomfortable' | 'low_shipping'
  | 'inconsistency' | 'outcome_blindness' | 'career_avoidance';

export type GoalType = 'primary' | 'secondary' | 'backlog';

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Evidence {
  type: EvidenceType;
  url?: string;
  description?: string;
  metric?: string;
}

export type Action = 
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'LOAD_DEMO_DATA' }
  | { type: 'RESET_STORE' }
  | { type: 'COMPLETE_CURRICULUM_STEP'; payload: string }
  | { type: 'ADD_LEARNING_RESOURCE'; payload: LearningResource };

export interface Activity {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  xp: number;
  skills: SkillKey[];
  evidence?: Evidence;
  boringChallenge: boolean;
  timestamp: string; // ISO
  projectId?: string;
  isConsumption: boolean;
}

export interface EvidenceCard {
  id: string;
  title: string;
  problem: string;
  hypothesis: string;
  action: string;
  result: string;
  metric?: string;
  learning: string;
  evidenceType: EvidenceType;
  evidenceUrl?: string;
  skills: SkillKey[];
  activityId?: string;
  timestamp: string;
  projectId?: string;
}

export interface SkillScore {
  key: SkillKey;
  category: SkillCategory;
  xp: number;
  level: number; // 0–100
  recentActivities: string[];
}

export interface WeaknessPattern {
  type: WeaknessType;
  severity: 'low' | 'medium' | 'high';
  evidence: string;
  detectedAt: string;
  dismissed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  createdAt: string;
}

export interface ParkingLotIdea {
  id: string;
  title: string;
  whyInteresting: string;
  potential: number; // 1-10
  confidence: number; // 1-10
  estimatedEffort: 'low' | 'medium' | 'high';
  createdAt: string;
  unlocksAt: string; // 30 days after creation
  promoted: boolean;
}

export interface Decision {
  id: string;
  title: string;
  whatDeciding: string;
  whatWouldChange: string;
  whatToTest: string;
  reversible: boolean;
  deadline: string;
  defaultChoice: string;
  status: 'open' | 'decided' | 'experimenting';
  outcome?: string;
  createdAt: string;
}

export interface NetworkContact {
  id: string;
  name: string;
  role: string;
  company: string;
  howMet: string;
  interests: string;
  lastInteraction: string;
  nextAction: string;
  howCanHelp: string;
  notes: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  stage: 'applied' | 'screen' | 'portfolio' | 'design' | 'final' | 'offer' | 'rejected';
  appliedAt: string;
  updatedAt: string;
  notes: string;
}

export interface InterviewSession {
  id: string;
  category: string;
  question: string;
  answer: string;
  scores: {
    structure: number;
    clarity: number;
    conciseness: number;
    productThinking: number;
    evidence: number;
    confidence: number;
  };
  timestamp: string;
}

export interface CommunicationSession {
  id: string;
  type: string;
  prompt: string;
  response: string;
  durationSeconds: number;
  selfScore: number;
  timestamp: string;
}

export interface ProductGymSession {
  id: string;
  prompt: string;
  problem: string;
  user: string;
  insight: string;
  hypothesis: string;
  solution: string;
  metric: string;
  tradeoff: string;
  risk: string;
  score: number;
  timestamp: string;
}

export interface BoringSession {
  id: string;
  taskName: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  interruptions: number;
  completed: boolean;
  capturedIdeas: string[];
}

export interface FailureLog {
  id: string;
  title: string;
  whatHappened: string;
  whatAssumed: string;
  whatRealityTaught: string;
  whatWillChange: string;
  importantInOneYear: boolean;
  timestamp: string;
}

export interface ThisWeekendFeature {
  id: string;
  title: string;
  hypothesis: string;
  problem: string;
  metric: string;
  status: 'hypothesis' | 'building' | 'shipped' | 'measured' | 'learned';
  result?: string;
  learning?: string;
  createdAt: string;
  shippedAt?: string;
}

export interface UserProfile {
  name: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  primaryGoal: string;
  compoundingScore: number;
}

export interface DailyBoringChallenge {
  date: string; // YYYY-MM-DD
  challenge: string;
  xpBonus: number;
  completed: boolean;
}

// ─── Store Shape ─────────────────────────────────────────────────────────────

export interface AppStore {
  profile: UserProfile;
  activities: Activity[];
  evidenceCards: EvidenceCard[];
  skillScores: Record<SkillKey, SkillScore>;
  weaknesses: WeaknessPattern[];
  goals: Goal[];
  parkingLot: ParkingLotIdea[];
  decisions: Decision[];
  contacts: NetworkContact[];
  applications: JobApplication[];
  interviewSessions: InterviewSession[];
  communicationSessions: CommunicationSession[];
  productGymSessions: ProductGymSession[];
  boringSessions: BoringSession[];
  failureLogs: FailureLog[];
  thisWeekendFeatures: ThisWeekendFeature[];
  dailyChallenge: DailyBoringChallenge | null;
  aiApiKey: string;
  ollamaModel: string; // e.g. 'llama3', 'gemma3', 'mistral'
  // V2 Additions
  library: LearningResource[];
  seasons: Season[];
  dailyCurriculum: DailyCurriculum | null;
}

// ─── Curriculum & Learning ───────────────────────────────────────────────────

export interface Concept {
  id: string;
  title: string;
  mastered: boolean;
}

export interface LearningResource {
  id: string;
  type: 'book' | 'video' | 'article' | 'podcast' | 'case_study';
  title: string;
  source: string; // URL or author
  skills: SkillKey[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeEstimate: string; // e.g., '4h 30m' or '18 min'
  whyThis: string;
  applicationTask: string;
  concepts: Concept[];
  progress: number; // 0-100
  status: 'queue' | 'in_progress' | 'completed';
}

export interface CurriculumStep {
  id: string;
  phase: 'LEARN' | 'EXTRACT' | 'APPLY' | 'SHIP';
  icon: string;
  timeEstimate: string;
  title: string;
  description: string;
  why?: string;
  xpReward: number;
  completed: boolean;
}

export interface DailyCurriculum {
  date: string;
  objective: string;
  steps: CurriculumStep[];
}

// ─── Seasons ─────────────────────────────────────────────────────────────────

export interface SeasonTarget {
  id: string;
  metric: string; // e.g. "product teardowns"
  target: number;
  current: number;
}

export interface Season {
  id: string;
  number: number;
  title: string;
  durationDays: number;
  startDate: string;
  goals: SeasonTarget[];
}
