// Backend types for Nurtura

export type AgeBand = '10-12' | '13-14' | '15-16';

export type PeriodStatus = 'not_started' | 'started_recently' | 'tracking_regularly';

export type FlowLevel = 'light' | 'medium' | 'heavy';

export type MoodType = 'happy' | 'calm' | 'sensitive' | 'tired' | 'anxious' | 'frustrated';

export type EnergyLevel = 'low' | 'medium' | 'high';

export type CrampLevel = 'none' | 'mild' | 'moderate' | 'strong';

export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  ageBand: AgeBand;
  periodStatus: PeriodStatus;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface PeriodRecordDTO {
  id: string;
  userId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  flow: FlowLevel;
  symptoms: string[];
  mood?: MoodType;
  energy?: EnergyLevel;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePeriodRecordInput {
  startDate: string;
  endDate?: string | null;
  flow?: FlowLevel;
  symptoms?: string[];
  mood?: MoodType;
  energy?: EnergyLevel;
  notes?: string;
}

export interface UpdatePeriodRecordInput {
  startDate?: string;
  endDate?: string | null;
  flow?: FlowLevel;
  symptoms?: string[];
  mood?: MoodType;
  energy?: EnergyLevel;
  notes?: string;
}

export interface JournalEntryDTO {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: MoodType;
  energy: EnergyLevel;
  cramps: CrampLevel;
  symptoms: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertJournalEntryInput {
  date: string;
  mood: MoodType;
  energy: EnergyLevel;
  cramps?: CrampLevel;
  symptoms?: string[];
  notes?: string;
}

export interface CycleStats {
  hasSufficientData: boolean;
  totalRecordedPeriods: number;
  averageCycleLength: number | null; // days between start dates
  averagePeriodDuration: number | null; // days of bleeding
  lastPeriodStartDate: string | null;
  estimatedNextPeriodStart: string | null;
  estimatedNextPeriodEnd: string | null;
  currentCycleDay: number | null;
  isIrregular: boolean;
  explanation: string;
}

export interface LearningProgressDTO {
  lessonId: string;
  completed: boolean;
  completedAt: string;
  pointsEarned: number;
}

export interface QuizAttemptDTO {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  createdAt: string;
}

export interface EarnedBadgeDTO {
  id: string;
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  earnedAt: string;
}

export interface WeeklyDayStatus {
  date: string; // "YYYY-MM-DD"
  dayName: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  dayNumber: number; // day of month e.g. 24
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  isPast: boolean;
}

export interface BloomStreakSummary {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  todayActivityCount: number;
  weeklyCalendar: WeeklyDayStatus[];
  encouragingMessage: string;
  totalActivitiesCompleted: number;
}

export interface UnlockedDayInfo {
  maxUnlockedDay: number;
  programStartedAt: string;
  nextDayUnlockTime: string | null;
  nextDayUnlockSeconds: number;
  serverTime: string;
}

export interface UserProgressSummary {
  totalPoints: number;
  completedLessonsCount: number;
  completedLessonIds: string[];
  quizzesTakenCount: number;
  recentQuizAttempts: QuizAttemptDTO[];
  badges: EarnedBadgeDTO[];
  streak: BloomStreakSummary;
  completedDailyActivities: string[];
  unlockedDayInfo: UnlockedDayInfo;
}

export interface MedicalTerm {
  term: string;
  simpleDefinition: string;
  detailedExplanation: string;
  category: 'anatomy' | 'cycle' | 'puberty' | 'hygiene' | 'health';
  pronunciation?: string;
}

export interface DailyMCQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DailyMythFact {
  id: string;
  statement: string;
  isFact: boolean;
  explanation: string;
}

export interface DayContent {
  dayNumber: number;
  title: string;
  topic: string;
  mcqs: DailyMCQ[];
  mythFacts: DailyMythFact[];
}

export interface DailyActivitySubmissionInput {
  activityId: string;
  dayNumber: number;
  activityType: 'mcq' | 'myth_fact';
  clientDate?: string; // "YYYY-MM-DD"
}

export interface DailyActivityRecordDTO {
  id: string;
  activityId: string;
  dayNumber: number;
  activityType: 'mcq' | 'myth_fact';
  activityDate: string;
  completedAt: string;
}
