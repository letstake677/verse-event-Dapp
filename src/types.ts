
export enum QuestionType {
  MCQ = 'MCQ',
  TEXT = 'TEXT',
  PARAGRAPH = 'PARAGRAPH',
  NUMBER = 'NUMBER'
}

export enum EventType {
  MCQ = 'MCQ',
  FORM = 'FORM',
  LEARN = 'LEARN'
}

export interface MCQQuestion {
  id: string;
  text: string;
  options: string[]; // Always 4 options for consistency
  correctOption: number; // 0, 1, 2, 3
}

export interface FormField {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  articleUrl?: string;
}

export interface LearnModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  quiz: MCQQuestion[];
  pointsReward: number;
}

export interface LearningMaterials {
  videoUrl?: string;
  articleUrl?: string;
  pdfUrl?: string;
}

export interface PointDistribution {
  top15: number;
  next25: number;
  rest: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  points: number;
  creator: string;
  eventType: EventType;
  // Specific fields based on type
  mcqQuestions?: MCQQuestion[];
  formFields?: FormField[];
  moduleId?: string; // For LEARN type
  // New fields
  startTime?: string; // ISO string UTC
  endTime?: string; // ISO string UTC
  pointDistribution?: PointDistribution;
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  AUTO_APPROVED = 'AUTO_APPROVED'
}

export interface Answer {
  questionId: string;
  value: string;
}

export interface Submission {
  id: string;
  eventId: string;
  userId: string;
  answers: Answer[];
  status: SubmissionStatus;
  timestamp: string;
}

export interface BonusSettings {
  dailyBonus: number;
  weeklyBonus: number;
  weeklyThreshold: number;
  monthlyBonus: number;
  monthlyThreshold: number;
  enableStreakMultiplier: boolean;
}

export interface Season {
  id: number;
  name: string;
  startDate: string;
  topUser?: string;
}

export interface UserModuleProgress {
  moduleId: string;
  completed: boolean;
  score: number;
}

export interface User {
  address: string;
  points: number;
  eventsJoined: string[];
  eventsAttended: string[];
  moduleProgress: UserModuleProgress[];
  
  dailyStreak: number;
  lastCheckInDate: string;
  weeklyCheckIns: number;
  monthlyCheckIns: number;
  totalBonusPoints: number;
  lastBonusReset: {
    week: number;
    month: number;
    year: number;
  };
  versePackCompleted?: boolean;
}

export interface VersePackTask {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'module' | 'action';
  targetId?: string;
  completed: boolean;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'appkit-button': any;
      'appkit-network-button': any;
    }
  }
}
