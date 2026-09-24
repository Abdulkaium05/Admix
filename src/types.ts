export type SubjectType = 'civil' | 'english' | 'math' | 'physics' | 'chemistry';
export type CategoryType = 'department' | 'non_department';
export type DepartmentType = 'civil' | 'eee' | 'me' | 'cse';

export interface Question {
  id: string;
  category: CategoryType;
  department: DepartmentType; // default 'civil'
  subject: SubjectType;
  questionBn: string;
  questionEn?: string;
  optionsBn: [string, string, string, string];
  optionsEn?: [string, string, string, string];
  correctAnswer: number; // 0, 1, 2, 3
  explanationBn?: string;
  explanationEn?: string;
  isCustom?: boolean;
  createdAt?: number;
}

export interface SemesterGrades {
  s1?: number; // 5%
  s2?: number; // 5%
  s3?: number; // 10%
  s4?: number; // 10%
  s5?: number; // 20%
  s6?: number; // 20%
  s7?: number; // 20%
  s8?: number; // 10%
}

export interface UserProfile {
  name: string;
  polytechnicRoll: string;
  polytechnicName: string;
  semesters: SemesterGrades;
  calculatedCgpa: number;
  isAverage: boolean;
  department: DepartmentType;
  completedOnboarding: boolean;
}

export interface QuizResult {
  id: string;
  quizName: string;
  score: number;
  totalMarks: number; // 120
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  totalQuestions: number; // 80
  percentage: number;
  timeTakenSeconds: number;
  timestamp: number;
  department: string;
  subjectBreakdown: {
    civil: { total: number; correct: number; wrong: number; score: number };
    math: { total: number; correct: number; wrong: number; score: number };
    physics: { total: number; correct: number; wrong: number; score: number };
    chemistry: { total: number; correct: number; wrong: number; score: number };
    english: { total: number; correct: number; wrong: number; score: number };
  };
  questionResults?: {
    questionId: string;
    question: string;
    subject: SubjectType;
    selectedOption: number | null;
    correctOption: number;
    options: string[];
    isCorrect: boolean;
    explanation?: string;
  }[];
}

export interface DailyLimitInfo {
  date: string; // YYYY-MM-DD
  count: number; // 0 to 5
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "06:00" or "06:00 AM"
  endTime: string; // "09:00" or "09:00 AM"
  durationMinutes: number; // duration in minutes (e.g. 180 = 3h)
  subject: string; // e.g. "Civil Engineering", "Math", "Physics", etc.
  topic: string; // what was studied, e.g. "Surveying Chapter 3"
  notes?: string;
  createdAt: number;
}

export interface StudyTask {
  id: string;
  title: string; // Task topic / title
  subject: string; // Subject e.g. "Civil Engineering", "Math"
  targetDate: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: number;
  completedSessionId?: string; // Linked study session id
  studyTimeSpent?: {
    startTime: string;
    endTime: string;
    durationMinutes: number;
  };
  order: number; // For custom serial / reordering
  rolledOver?: boolean; // True if rolled over from previous day
  originalDate?: string; // Original planned date if rolled over
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  createdAt: number;
}

export type ScheduleType = 'class' | 'exam' | 'special';

export interface UpcomingSchedule {
  id: string;
  userId?: string;
  type: ScheduleType; // 'class' (ক্লাস) | 'exam' (পরীক্ষা / মডেল টেস্ট) | 'special' (বিশেষ সেশন)
  title?: string;
  subject: string; // যেমন সিভিল ইঞ্জিনিয়ারিং, গণিত, পদার্থ, রসায়ন, ইংরেজি
  subjects?: string[]; // মাল্টিপল সাব্জেক্ট লিস্ট
  topic: string; // যেমন সার্ভেয়িং চ্যাপ্টার ৩, ইন্টিগ্রেশন
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24-hour e.g. "10:30", "15:00")
  scheduledAt: number; // calculated epoch timestamp in milliseconds (Date + Time)
  durationMinutes?: number; // duration in minutes (default 60)
  locationOrLink?: string; // Room number or meet link
  notes?: string;
  createdAt: number;
}

export type AppView =
  | 'home'
  | 'exam'
  | 'result'
  | 'import'
  | 'history'
  | 'ai_support'
  | 'profile'
  | 'study_time'
  | 'study_graph'
  | 'study_tasks'
  | 'chemistry'
  | 'schedules';
