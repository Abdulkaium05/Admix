import { UserProfile, QuizResult, Question, DailyLimitInfo, SemesterGrades, StudySession, StudyTask, UpcomingSchedule, SavedQuestionBankItem } from '../types';
import { defaultQuestions } from '../data/defaultQuestions';

const PROFILE_KEY = 'duet_user_profile_v1';
const HISTORY_KEY = 'duet_quiz_history_v1';
const CUSTOM_QUESTIONS_KEY = 'duet_custom_questions_v1';
const DAILY_LIMIT_KEY = 'duet_daily_limit_v1';
const STUDY_SESSIONS_KEY = 'duet_study_sessions_v1';
const STUDY_TASKS_KEY = 'duet_study_tasks_v1';
const UPCOMING_SCHEDULES_KEY = 'duet_upcoming_schedules_v1';

export const MAX_DAILY_EXAMS = 5;

// Weight coefficients for BTEB Diploma 8 Semesters
export const SEMESTER_WEIGHTS: Record<keyof SemesterGrades, number> = {
  s1: 0.05, // ১ম সেমিস্টার ৫%
  s2: 0.05, // ২য় সেমিস্টার ৫%
  s3: 0.10, // ৩য় সেমিস্টার ১০%
  s4: 0.10, // ৪র্থ সেমিস্টার ১০%
  s5: 0.20, // ৫ম সেমিস্টার ২০%
  s6: 0.20, // ৬ষ্ঠ সেমিস্টার ২০%
  s7: 0.20, // ৭ম সেমিস্টার ২০%
  s8: 0.10, // ৮ম সেমিস্টার ১০%
};

/**
 * Calculates CGPA according to BTEB standard weighted formula.
 * If fewer than 8 semesters are provided (e.g. up to 6th semester = 70% total weight),
 * it scales the earned weighted sum proportionally to 100%.
 */
export function calculateCgpa(semesters: SemesterGrades): {
  cgpa: number;
  isAverage: boolean;
  enteredCount: number;
  completedWeightPercent: number;
} {
  const keys: (keyof SemesterGrades)[] = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
  const validEntries: { key: keyof SemesterGrades; val: number; weight: number }[] = [];

  for (const k of keys) {
    const val = semesters[k];
    if (typeof val === 'number' && !isNaN(val) && val >= 1.0 && val <= 4.0) {
      validEntries.push({ key: k, val, weight: SEMESTER_WEIGHTS[k] });
    }
  }

  if (validEntries.length === 0) {
    return { cgpa: 0, isAverage: false, enteredCount: 0, completedWeightPercent: 0 };
  }

  // Calculate total weight of entered semesters
  const totalEnteredWeight = validEntries.reduce((acc, curr) => acc + curr.weight, 0);
  const weightedSum = validEntries.reduce((acc, curr) => acc + curr.val * curr.weight, 0);

  // Scaled up to 100% (e.g., if up to 6th semester total weight is 70% = 0.70, divide weighted sum by 0.70)
  const normalizedCgpa = totalEnteredWeight > 0 ? weightedSum / totalEnteredWeight : 0;
  const completedPercent = Math.round(totalEnteredWeight * 100);

  return {
    cgpa: Number(normalizedCgpa.toFixed(2)),
    isAverage: validEntries.length < 8,
    enteredCount: validEntries.length,
    completedWeightPercent: completedPercent,
  };
}

// User Profile Operations
export function getUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) return null;
    const parsed: UserProfile = JSON.parse(data);
    if (parsed && parsed.semesters) {
      // Recalculate dynamically to ensure precision and formula synchronization
      const calc = calculateCgpa(parsed.semesters);
      if (calc.cgpa > 0) {
        parsed.calculatedCgpa = calc.cgpa;
        parsed.isAverage = calc.isAverage;
      }
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load profile', e);
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

// Daily Limit Tracker
export function getDailyLimitInfo(): DailyLimitInfo {
  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  try {
    const data = localStorage.getItem(DAILY_LIMIT_KEY);
    if (data) {
      const parsed: DailyLimitInfo = JSON.parse(data);
      if (parsed.date === todayStr) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load daily limit', e);
  }
  // Reset for new day
  const newLimit: DailyLimitInfo = { date: todayStr, count: 0 };
  localStorage.setItem(DAILY_LIMIT_KEY, JSON.stringify(newLimit));
  return newLimit;
}

export function incrementDailyQuizCount(): DailyLimitInfo {
  const current = getDailyLimitInfo();
  current.count += 1;
  try {
    localStorage.setItem(DAILY_LIMIT_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to increment daily limit', e);
  }
  return current;
}

// Quiz Results History
export function getQuizHistory(): QuizResult[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    const parsed: QuizResult[] = JSON.parse(data);
    const seen = new Set<string>();
    const unique: QuizResult[] = [];
    for (const item of parsed) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    if (unique.length !== parsed.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(unique));
    }
    return unique;
  } catch (e) {
    console.error('Failed to load quiz history', e);
    return [];
  }
}

export function saveQuizResult(result: QuizResult): void {
  try {
    const history = getQuizHistory().filter((h) => h.id !== result.id);
    history.unshift(result);
    // Keep last 50 results
    if (history.length > 50) history.length = 50;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save quiz result', e);
  }
}

export function clearQuizHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear quiz history', e);
  }
}

// Question Bank Management
export function getAllQuestions(): Question[] {
  try {
    const customList = getCustomQuestions();
    // Merge default questions with custom questions, deduplicating by ID
    const map = new Map<string, Question>();
    for (const q of defaultQuestions) {
      if (q && q.id) map.set(q.id, q);
    }
    for (const q of customList) {
      if (q && q.id) map.set(q.id, q);
    }
    return Array.from(map.values());
  } catch (e) {
    console.error('Failed to load questions', e);
    return defaultQuestions;
  }
}

export function getCustomQuestions(): Question[] {
  try {
    const customData = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    if (!customData) return [];
    const parsed: Question[] = JSON.parse(customData);
    const seen = new Set<string>();
    const unique: Question[] = [];
    for (const q of parsed) {
      if (q && q.id && !seen.has(q.id)) {
        seen.add(q.id);
        unique.push(q);
      }
    }
    // Auto-clean duplicates in localStorage if any were found
    if (unique.length !== parsed.length) {
      localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(unique));
    }
    return unique;
  } catch (e) {
    return [];
  }
}

export function saveCustomQuestion(question: Question): void {
  try {
    const list = getCustomQuestions();
    const map = new Map<string, Question>();
    // Put newest/updated question first
    map.set(question.id, question);
    for (const q of list) {
      if (q && q.id && !map.has(q.id)) {
        map.set(q.id, q);
      }
    }
    const updated = Array.from(map.values());
    localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save custom question', e);
  }
}

export function saveBatchCustomQuestions(questions: Question[]): void {
  try {
    const list = getCustomQuestions();
    const map = new Map<string, Question>();
    // Existing questions
    for (const q of list) {
      if (q && q.id) map.set(q.id, q);
    }
    // Incoming questions overwrite or add
    for (const q of questions) {
      if (q && q.id) map.set(q.id, q);
    }
    const updated = Array.from(map.values());
    localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to batch save questions', e);
  }
}

export function deleteCustomQuestion(questionId: string): void {
  try {
    const list = getCustomQuestions().filter((q) => q.id !== questionId);
    localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to delete custom question', e);
  }
}

// ==========================================
// Study Time Tracker & Daily Log Management
// ==========================================

export function getStudySessions(): StudySession[] {
  try {
    const data = localStorage.getItem(STUDY_SESSIONS_KEY);
    if (data === null) {
      // Seed default rich 30-day sample sessions
      const sampleSessions = generateSampleStudySessions();
      localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(sampleSessions));
      return sampleSessions;
    }
    const parsed: StudySession[] = JSON.parse(data);
    const seen = new Set<string>();
    const unique: StudySession[] = [];
    for (const s of parsed) {
      if (s && s.id && !seen.has(s.id)) {
        seen.add(s.id);
        unique.push(s);
      }
    }
    if (unique.length !== parsed.length) {
      localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(unique));
    }
    // Sort descending by date then createdAt
    return unique.sort((a, b) => {
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });
  } catch (e) {
    console.error('Failed to load study sessions', e);
    return [];
  }
}

export function saveStudySession(session: StudySession): void {
  try {
    const list = getStudySessions().filter((s) => s.id !== session.id);
    // Prepend new or updated session
    list.unshift(session);
    // Re-sort descending by date then createdAt
    list.sort((a, b) => {
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });
    localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save study session', e);
  }
}

export function updateStudySession(session: StudySession): void {
  try {
    const list = getStudySessions();
    const index = list.findIndex((s) => s.id === session.id);
    const updated: StudySession = {
      ...session,
      updatedAt: Date.now(),
    };
    if (index >= 0) {
      list[index] = updated;
    } else {
      list.unshift(updated);
    }
    // Re-sort descending by date then createdAt
    list.sort((a, b) => {
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });
    localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to update study session', e);
  }
}

/**
 * Extracts list of subjects from a session, handling both array subjects and comma-separated string
 */
export function extractSessionSubjects(session: { subject?: string; subjects?: string[] }): string[] {
  if (session.subjects && Array.isArray(session.subjects) && session.subjects.length > 0) {
    return session.subjects.filter(Boolean);
  }
  if (session.subject && session.subject.includes(',')) {
    return session.subject.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return session.subject ? [session.subject.trim()] : ['সিভিল ইঞ্জিনিয়ারিং'];
}

export interface SubjectDistributionEntry {
  subject: string;
  minutes: number;
  percentage: number;
}

export interface SubjectDistributionStats {
  entries: SubjectDistributionEntry[];
  totalAllMinutes: number;
}

/**
 * Computes subject-wise study time distribution.
 * If a session has multiple subjects (e.g. 1h 30m with 3 subjects),
 * the session duration is divided equally among the subjects (e.g. 30m each).
 */
export function calculateSubjectWiseStudyTime(
  sessionsList: StudySession[],
  fallbackSubject = 'অন্যান্য'
): SubjectDistributionStats {
  const map = new Map<string, number>();
  let totalAllMinutes = 0;

  for (const s of sessionsList) {
    const duration = s.durationMinutes || 0;
    if (duration <= 0) continue;
    totalAllMinutes += duration;

    const subjects = extractSessionSubjects(s);
    const activeSubjects = subjects.length > 0 ? subjects : [fallbackSubject];
    const splitMinutes = duration / activeSubjects.length;

    for (const subj of activeSubjects) {
      const cleanSubj = subj.trim();
      map.set(cleanSubj, (map.get(cleanSubj) || 0) + splitMinutes);
    }
  }

  const entries: SubjectDistributionEntry[] = Array.from(map.entries())
    .map(([subject, rawMins]) => {
      const minutes = Math.round(rawMins);
      const percentage = totalAllMinutes > 0 ? Math.round((minutes / totalAllMinutes) * 100) : 0;
      return {
        subject,
        minutes,
        percentage,
      };
    })
    .filter((e) => e.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  return {
    entries,
    totalAllMinutes,
  };
}

export function deleteStudySession(sessionId: string): void {
  try {
    const list = getStudySessions().filter((s) => s.id !== sessionId);
    localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to delete study session', e);
  }
}

export function getStudySessionsByDate(dateStr: string): StudySession[] {
  const all = getStudySessions();
  return all.filter((s) => s.date === dateStr);
}

export function getTodayStudyMinutes(): number {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySessions = getStudySessionsByDate(todayStr);
  return todaySessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
}

/**
 * Parses time string like "06:00", "09:30", "14:00" or returns minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  }
  return 0;
}

/**
 * Calculates duration in minutes between start time and end time (handling cross-midnight if needed)
 */
export function calculateStudyDurationMinutes(startTime: string, endTime: string): number {
  const startMin = timeStringToMinutes(startTime);
  const endMin = timeStringToMinutes(endTime);
  if (endMin >= startMin) {
    return endMin - startMin;
  }
  // Crosses midnight
  return 24 * 60 - startMin + endMin;
}

export function clearAllStudySessions(): void {
  try {
    localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear study sessions', e);
  }
}

export function generateSampleStudySessions(): StudySession[] {
  const today = new Date();
  const sampleDataPlan = [
    { daysAgo: 0, start: '06:00', end: '09:00', duration: 180, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'সার্ভেয়িং ও হাইড্রোলিক্স থিওরি এবং অঙ্ক' },
    { daysAgo: 0, start: '10:00', end: '12:00', duration: 120, subject: 'গণিত (Mathematics)', topic: 'ক্যালকুলাস ইন্টিগ্রেশন ও ডিফারেনশিয়াল সমীকরণ' },
    { daysAgo: 1, start: '06:30', end: '09:30', duration: 180, subject: 'পদার্থবিজ্ঞান (Physics)', topic: 'গতিবিদ্যা, নিউটনের সূত্র ও মহাকর্ষ' },
    { daysAgo: 1, start: '14:00', end: '16:00', duration: 120, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'মেকানিক্স অফ মেটেরিয়ালস স্ট্রেস ও স্ট্রেন' },
    { daysAgo: 2, start: '07:00', end: '09:30', duration: 150, subject: 'রসায়ন (Chemistry)', topic: 'রাসায়নিক পরিবর্তন ও পর্যায় সারণি' },
    { daysAgo: 3, start: '06:00', end: '09:30', duration: 210, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'আরসিসি ডিজাইন (RCC Design) ও বিম সমস্যা' },
    { daysAgo: 3, start: '19:00', end: '21:00', duration: 120, subject: 'ইংরেজি (English)', topic: 'Grammar, Preposition & Vocabulary Practice' },
    { daysAgo: 4, start: '08:00', end: '11:00', duration: 180, subject: 'গণিত (Mathematics)', topic: 'ম্যাট্রিক্স ও নির্ণায়ক সমাধান' },
    { daysAgo: 5, start: '06:00', end: '08:30', duration: 150, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'হাইড্রোলিক্স ও ফ্লুইড মেকানিক্স' },
    { daysAgo: 7, start: '06:00', end: '09:00', duration: 180, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'জিওটেকনিক্যাল ইঞ্জিনিয়ারিং ও সয়েল টেস্ট' },
    { daysAgo: 7, start: '10:00', end: '12:30', duration: 150, subject: 'পদার্থবিজ্ঞান (Physics)', topic: 'কাজ, ক্ষমতা ও শক্তি' },
    { daysAgo: 8, start: '19:00', end: '22:00', duration: 180, subject: 'গণিত (Mathematics)', topic: 'ত্রিকোণমিতি ও বৃত্তের সমীকরণ' },
    { daysAgo: 9, start: '06:30', end: '09:30', duration: 180, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'ট্রান্সপোর্টেশন ও হাইওয়ে ইঞ্জিনিয়ারিং' },
    { daysAgo: 10, start: '08:00', end: '11:30', duration: 210, subject: 'রসায়ন (Chemistry)', topic: 'পরিবেশ রসায়ন ও জৈব যৌগ প্রস্তুতি' },
    { daysAgo: 12, start: '06:00', end: '09:30', duration: 210, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'স্ট্রাকচারাল মেকানিক্স ট্রাস এনালাইসিস' },
    { daysAgo: 12, start: '15:00', end: '17:00', duration: 120, subject: 'ইংরেজি (English)', topic: 'Right form of verbs & Translation' },
    { daysAgo: 13, start: '07:00', end: '10:00', duration: 180, subject: 'পদার্থবিজ্ঞান (Physics)', topic: 'স্থির তড়িৎ ও চল তড়িৎ' },
    { daysAgo: 15, start: '06:00', end: '09:30', duration: 210, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'সার্ভেয়িং কনট্যুরিং ও ট্রাভার্সিং' },
    { daysAgo: 15, start: '19:00', end: '21:30', duration: 150, subject: 'গণিত (Mathematics)', topic: 'বিন্যাস ও সমাবেশ' },
    { daysAgo: 16, start: '08:00', end: '11:00', duration: 180, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'এনভায়রনমেন্টাল ইঞ্জিনিয়ারিং ওয়াটার ট্রিটমেন্ট' },
    { daysAgo: 18, start: '06:30', end: '09:30', duration: 180, subject: 'পদার্থবিজ্ঞান (Physics)', topic: 'আলোর প্রতিফলন ও প্রতিসরণ' },
    { daysAgo: 19, start: '10:00', end: '12:30', duration: 150, subject: 'রসায়ন (Chemistry)', topic: 'রাসায়নিক গণনা ও মোলার দ্রবণ' },
    { daysAgo: 20, start: '06:00', end: '09:00', duration: 180, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'এসএফডি ও বিএমডি (SFD & BMD) ডায়াগ্রাম' },
    { daysAgo: 20, start: '14:00', end: '16:00', duration: 120, subject: 'গণিত (Mathematics)', topic: 'দ্বিপদী বিস্তৃতি ও ধারা' },
    { daysAgo: 22, start: '07:00', end: '10:00', duration: 180, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'এস্টিমেটিং অ্যান্ড কস্টিং বিওকিউ' },
    { daysAgo: 23, start: '19:00', end: '22:00', duration: 180, subject: 'পদার্থবিজ্ঞান (Physics)', topic: 'শব্দ ও তরঙ্গ সমীকরণ' },
    { daysAgo: 25, start: '06:00', end: '09:30', duration: 210, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'কলাম ডিজাইন ও ফুটিং হিসাব' },
    { daysAgo: 26, start: '08:30', end: '11:00', duration: 150, subject: 'গণিত (Mathematics)', topic: 'স্থানাঙ্ক জ্যামিতি ও সরলরেখা' },
    { daysAgo: 28, start: '06:00', end: '09:00', duration: 180, subject: 'সিভিল ইঞ্জিনিয়ারিং', topic: 'সার্ভেয়িং লেভেলিং ও থিওডোলাইট' },
    { daysAgo: 28, start: '15:00', end: '17:00', duration: 120, subject: 'ইংরেজি (English)', topic: 'Synonyms, Antonyms & Idioms' },
    { daysAgo: 29, start: '07:00', end: '10:00', duration: 180, subject: 'রসায়ন (Chemistry)', topic: 'তড়িৎ রসায়ন ও জারণ-বিজারণ' },
  ];

  return sampleDataPlan.map((item, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - item.daysAgo);
    const dateStr = d.toISOString().slice(0, 10);
    return {
      id: `study-sample-30d-${idx + 1}`,
      date: dateStr,
      startTime: item.start,
      endTime: item.end,
      durationMinutes: item.duration,
      subject: item.subject,
      topic: item.topic,
      notes: `${item.start} - ${item.end} স্টাডি সম্পন্ন`,
      createdAt: d.getTime() + idx * 1000,
    };
  });
}

export function resetSampleStudySessions(): StudySession[] {
  try {
    const sampleSessions = generateSampleStudySessions();
    localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(sampleSessions));
    return sampleSessions;
  } catch (e) {
    console.error('Failed to reset sample study sessions', e);
    return [];
  }
}

// Admission Target Date Key
export const ADMISSION_TARGET_DATE_KEY = 'admix_admission_target_date';

export function getAdmissionTargetDate(): string {
  try {
    const stored = localStorage.getItem(ADMISSION_TARGET_DATE_KEY);
    if (stored) return stored;
    // Default to ~60 days ahead
    const d = new Date();
    d.setDate(d.getDate() + 60);
    const defaultDate = d.toISOString().slice(0, 10);
    localStorage.setItem(ADMISSION_TARGET_DATE_KEY, defaultDate);
    return defaultDate;
  } catch (e) {
    return '2026-11-20';
  }
}

export function setAdmissionTargetDate(dateStr: string): void {
  try {
    localStorage.setItem(ADMISSION_TARGET_DATE_KEY, dateStr);
  } catch (e) {
    console.error('Failed to set admission target date', e);
  }
}

export function calculateAdmissionCountdown(targetDateStr: string) {
  const target = new Date(`${targetDateStr}T09:00:00`);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPassed: true,
      totalMs: 0,
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isPassed: false,
    totalMs: diffMs,
  };
}

/**
 * Format minutes to human readable string (e.g. 3h 15m or ৩ ঘ ১৫ মি, ৫ ঘ)
 */
export function formatDuration(minutes: number, language: 'bn' | 'en' = 'bn'): string {
  if (!minutes || minutes <= 0) {
    return language === 'bn' ? '০ মি' : '0 min';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (language === 'bn') {
    const toBn = (n: number) => n.toLocaleString('bn-BD');
    if (hours > 0 && mins > 0) {
      return `${toBn(hours)} ঘ ${toBn(mins)} মি`;
    } else if (hours > 0) {
      return `${toBn(hours)} ঘ`;
    } else {
      return `${toBn(mins)} মি`;
    }
  } else {
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  }
}

// ==========================================
// Study Tasks & Daily Planner Management
// ==========================================

export function getTodayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function generateSampleStudyTasks(): StudyTask[] {
  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  return [
    {
      id: 'task-demo-1',
      title: 'সার্ভেয়িং লেভেলিং অঙ্ক ও থিওরি রিভিশন',
      subject: 'সিভিল ইঞ্জিনিয়ারিং',
      targetDate: todayStr,
      completed: false,
      order: 1,
      priority: 'high',
      notes: 'ডুয়েট বিগত বছরের প্রশ্ন সমাধান করা হবে',
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'task-demo-2',
      title: 'ক্যালকুলাস ইন্টিগ্রেশন প্র্যাকটিস (চ্যাপ্টার ৫)',
      subject: 'গণিত (Mathematics)',
      targetDate: todayStr,
      completed: false,
      order: 2,
      priority: 'medium',
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'task-demo-3',
      title: 'আরসিসি ডিজাইন ও ফুটিং ক্যালকুলেশন',
      subject: 'সিভিল ইঞ্জিনিয়ারিং',
      targetDate: tomorrowStr,
      completed: false,
      order: 3,
      priority: 'high',
      notes: 'আগামীকালের জন্য আগে থেকেই সেট করা টাস্ক',
      createdAt: Date.now(),
    },
    {
      id: 'task-demo-4',
      title: 'পদার্থবিজ্ঞান গতিবিদ্যা ও মহাকর্ষ সূত্রাবলী',
      subject: 'পদার্থবিজ্ঞান (Physics)',
      targetDate: tomorrowStr,
      completed: false,
      order: 4,
      priority: 'medium',
      createdAt: Date.now(),
    },
  ];
}

export function getStudyTasks(): StudyTask[] {
  try {
    const data = localStorage.getItem(STUDY_TASKS_KEY);
    if (!data) {
      const initial = generateSampleStudyTasks();
      localStorage.setItem(STUDY_TASKS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: StudyTask[] = JSON.parse(data);
    const todayStr = getTodayDateString();
    let hasChanges = false;

    // Rollover logic:
    // Any incomplete task with targetDate strictly earlier than today (yesterday or older)
    // is automatically carried forward to today!
    const updated = parsed.map((task) => {
      if (!task.completed && task.targetDate < todayStr) {
        hasChanges = true;
        return {
          ...task,
          originalDate: task.originalDate || task.targetDate,
          targetDate: todayStr,
          rolledOver: true,
        };
      }
      return task;
    });

    if (hasChanges) {
      localStorage.setItem(STUDY_TASKS_KEY, JSON.stringify(updated));
    }

    // Return sorted by custom order ascending, fallback to createdAt
    return updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.createdAt - b.createdAt);
  } catch (e) {
    console.error('Failed to load study tasks', e);
    return [];
  }
}

export function saveStudyTask(task: StudyTask): void {
  try {
    const tasks = getStudyTasks();
    const existingIndex = tasks.findIndex((t) => t.id === task.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order ?? 0), 0);
      task.order = task.order !== undefined ? task.order : maxOrder + 1;
      tasks.push(task);
    }
    localStorage.setItem(STUDY_TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save study task', e);
  }
}

export function saveAllStudyTasks(tasks: StudyTask[]): void {
  try {
    localStorage.setItem(STUDY_TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save all study tasks', e);
  }
}

export function deleteStudyTask(taskId: string): void {
  try {
    const tasks = getStudyTasks().filter((t) => t.id !== taskId);
    localStorage.setItem(STUDY_TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to delete study task', e);
  }
}

export function reorderStudyTasks(orderedTasks: StudyTask[]): StudyTask[] {
  try {
    const updated = orderedTasks.map((t, idx) => ({
      ...t,
      order: idx + 1,
    }));
    // We update only these tasks while preserving other tasks in storage
    const allTasks = getStudyTasks();
    const updatedMap = new Map(updated.map((t) => [t.id, t]));
    const finalTasks = allTasks.map((t) => updatedMap.get(t.id) || t);
    localStorage.setItem(STUDY_TASKS_KEY, JSON.stringify(finalTasks));
    return updated;
  } catch (e) {
    console.error('Failed to reorder study tasks', e);
    return orderedTasks;
  }
}

/**
 * Completes a task and prompts/records start and end times into Study Time Tracker.
 */
export function completeTaskWithStudyTime(
  taskId: string,
  startTime: string,
  endTime: string,
  sessionDate?: string
): { updatedTask: StudyTask | null; createdSession: StudySession | null } {
  try {
    const tasks = getStudyTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return { updatedTask: null, createdSession: null };

    const duration = calculateStudyDurationMinutes(startTime, endTime);
    const date = sessionDate || task.targetDate || getTodayDateString();

    const newSession: StudySession = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date,
      startTime,
      endTime,
      durationMinutes: duration > 0 ? duration : 60,
      subject: task.subject,
      topic: task.title,
      notes: task.notes ? `(টাস্ক থেকে সম্পন্ন) ${task.notes}` : `টাস্ক সম্পন্ন: ${task.title}`,
      createdAt: Date.now(),
    };

    // 1. Save directly to Study Time Tracker sessions
    saveStudySession(newSession);

    // 2. Mark task as completed
    task.completed = true;
    task.completedAt = Date.now();
    task.completedSessionId = newSession.id;
    task.studyTimeSpent = {
      startTime,
      endTime,
      durationMinutes: newSession.durationMinutes,
    };

    saveAllStudyTasks(tasks);

    return { updatedTask: task, createdSession: newSession };
  } catch (e) {
    console.error('Failed to complete task with study time', e);
    return { updatedTask: null, createdSession: null };
  }
}

export function moveTaskToDate(taskId: string, newDate: string): void {
  try {
    const tasks = getStudyTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      task.targetDate = newDate;
      saveAllStudyTasks(tasks);
    }
  } catch (e) {
    console.error('Failed to move task date', e);
  }
}

// =========================================================================
// Upcoming Schedules (Class, Exam, Subject, Topic, Time & 24h Auto-Deletion)
// =========================================================================

export const SCHEDULE_AUTO_DELETE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours after completion

/**
 * Checks if a schedule's time ended more than 24 hours ago.
 * A schedule is considered completed/ended at (scheduledAt + durationMinutes).
 * If 24 hours have passed since it ended, it is expired and must be purged.
 */
export function isScheduleExpired(schedule: UpcomingSchedule, nowMs: number = Date.now()): boolean {
  const durationMs = (schedule.durationMinutes || 60) * 60 * 1000;
  const finishTime = schedule.scheduledAt + durationMs;
  return nowMs - finishTime >= SCHEDULE_AUTO_DELETE_WINDOW_MS;
}

/**
 * Loads all upcoming/recent schedules and automatically purges items older than 24 hours.
 */
export function getUpcomingSchedules(): UpcomingSchedule[] {
  try {
    const raw = localStorage.getItem(UPCOMING_SCHEDULES_KEY);
    if (!raw) return [];
    const list: UpcomingSchedule[] = JSON.parse(raw);
    const now = Date.now();

    // Auto-clean any schedule finished > 24 hours ago
    const validList = list.filter((item) => !isScheduleExpired(item, now));

    if (validList.length !== list.length) {
      localStorage.setItem(UPCOMING_SCHEDULES_KEY, JSON.stringify(validList));
    }

    // Sort ascending by scheduled date/time
    return validList.sort((a, b) => a.scheduledAt - b.scheduledAt);
  } catch (e) {
    console.error('Failed to get upcoming schedules', e);
    return [];
  }
}

/**
 * Saves a new schedule or updates an existing schedule.
 */
export function saveUpcomingSchedule(schedule: UpcomingSchedule): void {
  try {
    const list = getUpcomingSchedules();
    const index = list.findIndex((s) => s.id === schedule.id);
    if (index >= 0) {
      list[index] = schedule;
    } else {
      list.push(schedule);
    }
    list.sort((a, b) => a.scheduledAt - b.scheduledAt);
    localStorage.setItem(UPCOMING_SCHEDULES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save schedule', e);
  }
}

/**
 * Saves all schedules (used during cloud sync).
 */
export function saveAllUpcomingSchedules(schedules: UpcomingSchedule[]): void {
  try {
    const now = Date.now();
    const valid = schedules.filter((s) => !isScheduleExpired(s, now));
    valid.sort((a, b) => a.scheduledAt - b.scheduledAt);
    localStorage.setItem(UPCOMING_SCHEDULES_KEY, JSON.stringify(valid));
  } catch (e) {
    console.error('Failed to save all schedules', e);
  }
}

/**
 * Deletes a schedule by ID.
 */
export function deleteUpcomingSchedule(scheduleId: string): void {
  try {
    const list = getUpcomingSchedules().filter((s) => s.id !== scheduleId);
    localStorage.setItem(UPCOMING_SCHEDULES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to delete schedule', e);
  }
}

/**
 * Purges schedules older than 24 hours from storage and returns the deleted IDs
 * so cloud synchronizer can also delete them from Firestore.
 */
export function purgeExpiredSchedules(): string[] {
  try {
    const raw = localStorage.getItem(UPCOMING_SCHEDULES_KEY);
    if (!raw) return [];
    const list: UpcomingSchedule[] = JSON.parse(raw);
    const now = Date.now();

    const expiredIds: string[] = [];
    const validList: UpcomingSchedule[] = [];

    for (const item of list) {
      if (isScheduleExpired(item, now)) {
        expiredIds.push(item.id);
      } else {
        validList.push(item);
      }
    }

    if (expiredIds.length > 0) {
      localStorage.setItem(UPCOMING_SCHEDULES_KEY, JSON.stringify(validList));
    }

    return expiredIds;
  } catch (e) {
    console.error('Failed to purge expired schedules', e);
    return [];
  }
}

/**
 * Finds the nearest active schedule(s) for the Homepage timer widget:
 * 1. Filter out schedules that have already concluded (scheduledAt + duration < now).
 * 2. If one has ended, the next upcoming schedule starts its timer.
 * 3. If there are 2 (or more) schedules on that SAME nearest day, returns all of them!
 */
export function getNearestSchedulesForHome(nowMs: number = Date.now()): UpcomingSchedule[] {
  const all = getUpcomingSchedules();
  // An item is active if its end time is still in the future or within 10 minutes of scheduled start
  const activeSchedules = all.filter((s) => {
    const durationMs = (s.durationMinutes || 60) * 60 * 1000;
    const finishTime = s.scheduledAt + durationMs;
    return finishTime > nowMs;
  });

  if (activeSchedules.length === 0) {
    return [];
  }

  // Find the date of the very first upcoming schedule
  const earliest = activeSchedules[0];
  const targetDate = earliest.date;

  // Return all schedules occurring on this same date
  const sameDaySchedules = activeSchedules.filter((s) => s.date === targetDate);
  return sameDaySchedules;
}

/**
 * Live Countdown calculation for a schedule
 */
export interface ScheduleCountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSecondsRemaining: number;
  status: 'upcoming' | 'in_progress' | 'ended';
  timeUntilEndSeconds?: number;
}

export function calculateScheduleCountdown(
  schedule: UpcomingSchedule,
  nowMs: number = Date.now()
): ScheduleCountdownResult {
  const durationMs = (schedule.durationMinutes || 60) * 60 * 1000;
  const finishTime = schedule.scheduledAt + durationMs;

  if (nowMs < schedule.scheduledAt) {
    // Upcoming: countdown to start
    const diffMs = schedule.scheduledAt - nowMs;
    const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return {
      days,
      hours,
      minutes,
      seconds,
      totalSecondsRemaining: totalSecs,
      status: 'upcoming',
    };
  } else if (nowMs <= finishTime) {
    // In progress right now
    const diffMs = finishTime - nowMs;
    const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return {
      days: 0,
      hours,
      minutes,
      seconds,
      totalSecondsRemaining: 0,
      timeUntilEndSeconds: totalSecs,
      status: 'in_progress',
    };
  } else {
    // Ended
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSecondsRemaining: 0,
      status: 'ended',
    };
  }
}

// =========================================================================
// QUESTION BANK STORAGE & QUESTION PAPER GENERATOR
// =========================================================================

const QUESTION_BANK_KEY = 'duet_saved_question_bank_v1';

export const DEFAULT_QUESTION_BANK_SEEDS: SavedQuestionBankItem[] = [
  {
    id: 'qb_vec_1',
    chapter: 'ভেক্টর',
    type: 'গাণিতিক সমস্যা',
    questionText: 'দুটি সমমানের বলের লব্ধির মান এদের যেকোনো একটি বলের মানের সমান হলে, বলদ্বয়ের মধ্যবর্তী কোণ নির্ণয় কর।',
    marks: 5,
    solution: 'ধরি বল দুটি P এবং P। লব্ধি R = P।\nR² = P² + P² + 2·P·P·cosα\n=> P² = 2P² + 2P² cosα\n=> 2P² cosα = -P²\n=> cosα = -1/2 = cos 120°\n∴ মধ্যবর্তী কোণ α = 120°।',
    subject: 'পদার্থবিজ্ঞান',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'qb_vec_2',
    chapter: 'ভেক্টর',
    type: 'সংক্ষিপ্ত প্রশ্ন',
    questionText: 'নাল ভেক্টর (Null Vector) কাকে বলে? এর দিক কীভাবে নির্ধারিত হয়?',
    marks: 2.5,
    solution: 'যে ভেক্টরের মান শূন্য তাকে নাল ভেক্টর বা শূন্য ভেক্টর বলে। নাল ভেক্টরের কোনো নির্দিষ্ট দিক নেই; এর পাদবিন্দু ও শীর্ষবিন্দু একই হওয়ায় এর দিক অনির্ধারিত।',
    subject: 'পদার্থবিজ্ঞান',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'qb_vec_3',
    chapter: 'ভেক্টর',
    type: 'বহুনির্বাচনী / MCQ',
    questionText: 'A = 2i + 3j - k এবং B = -4i - 6j + 2k ভেক্টরদ্বয় পরস্পরের সাথে কীভাবে অবস্থান করে?',
    marks: 1.5,
    solution: 'B = -2(2i + 3j - k) = -2A। যেহেতু একটি ভেক্টর অন্যটির ঋণাত্মক স্কেলার গুণিতক, তাই এরা পরস্পর সমান্তরাল ও বিপরীতমুখী।',
    subject: 'পদার্থবিজ্ঞান',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'qb_kin_1',
    chapter: 'গতিবিদ্যা',
    type: 'গাণিতিক সমস্যা',
    questionText: 'একটি বুলেট কোনো কাঠের তক্তায় প্রবেশ করে এর বেগের অর্ধেক হারায়। বুলেটটি ওই তক্তার ভেতর আর কত দূর প্রবেশ করতে পারবে?',
    marks: 5,
    solution: 'ধরি আদি বেগ u এবং প্রথম ক্ষেত্রে অতিক্রান্ত দূরত্ব s।\n(u/2)² = u² - 2as => 2as = 3u²/4 => a = 3u²/(8s)।\nবাকি বেগ u/2 নিয়ে আর s\' দূরত্ব গিয়ে বেগ 0 হলে:\n0 = (u/2)² - 2as\' => 2as\' = u²/4 => s\' = (u²/4) / (2 · 3u²/(8s)) = s/3।\n∴ বুলেটটি আরও (s/3) দূরত্ব প্রবেশ করে থেমে যাবে।',
    subject: 'পদার্থবিজ্ঞান',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'qb_kin_2',
    chapter: 'গতিবিদ্যা',
    type: 'সংজ্ঞা ও সূত্র',
    questionText: 'প্রাসের (Projectile) সর্বোচ্চ উচ্চতা এবং আনুভূমিক পাল্লার গাণিতিক সূত্র দুটি লিখ।',
    marks: 3,
    solution: 'সর্বোচ্চ উচ্চতা: H = (u² sin²θ) / (2g)\nআনুভূমিক পাল্লা: R = (u² sin 2θ) / g\nযেখানে u = প্রক্ষেপণ বেগ, θ = প্রক্ষেপণ কোণ, g = অভিকর্ষজ ত্বরণ।',
    subject: 'পদার্থবিজ্ঞান',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'qb_kin_3',
    chapter: 'গতিবিদ্যা',
    type: 'বহুনির্বাচনী / MCQ',
    questionText: 'কোন প্রক্ষেপণ কোণে নিক্ষিপ্ত প্রাসের আনুভূমিক পাল্লা (Horizontal Range) সর্বোচ্চ হয়?',
    marks: 1.5,
    solution: 'R = (u² sin 2θ)/g। sin 2θ এর সর্বোচ্চ মান 1 হলে 2θ = 90° => θ = 45°। অর্থাৎ ৪৫° কোণে পাল্লা সর্বোচ্চ হয়।',
    subject: 'পদার্থবিজ্ঞান',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'qb_wep_1',
    chapter: 'কাজ-ক্ষমতা-শক্তি',
    type: 'গাণিতিক সমস্যা',
    questionText: '৫ অশ্বক্ষমতার একটি পাম্প ২৫ মিটার গভীর কুয়া হতে প্রতি মিনিটে ২০০০ লিটার পানি উত্তোলন করে। পাম্পটির কার্যকর ক্ষমতা ও কর্মদক্ষতা নির্ণয় কর।',
    marks: 5,
    solution: 'কাজের পরিমাণ W = mgh = 2000 kg × 9.8 m/s² × 25 m = 490,000 J।\nকার্যকর ক্ষমতা P_out = W / t = 490,000 / 60 s = 8166.67 Watt।\nপ্রদত্ত ক্ষমতা P_in = 5 HP = 5 × 746 Watt = 3730 Watt (বা মোটর রেটিং অনুযায়ী হিসাব্য)।\nকর্মদক্ষতা η = (P_out / P_in) × 100%।',
    subject: 'পদার্থবিজ্ঞান',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'qb_wep_2',
    chapter: 'কাজ-ক্ষমতা-শক্তি',
    type: 'সংক্ষিপ্ত প্রশ্ন',
    questionText: 'সংরক্ষণশীল বল ও অসংরক্ষণশীল বলের মধ্যে পার্থক্য লিখ। দুটি করে উদাহরণ দাও।',
    marks: 4,
    solution: '১. সংরক্ষণশীল বলে কোনো বস্তুকে যেকোনো পথে ঘুরিয়ে আদি অবস্থানে আনলে কৃতকাজ শূন্য হয়; অসংরক্ষণশীলে শূন্য হয় না।\n২. সংরক্ষণশীল বলে কাজ পথের ওপর নির্ভর করে না; অসংরক্ষণশীলে পথের ওপর নির্ভর করে।\nউদাহরণ: সংরক্ষণশীল: অভিকর্ষ বল, কুলম্ব বল। অসংরক্ষণশীল: ঘর্ষণ বল, সান্দ্র বল।',
    subject: 'পদার্থবিজ্ঞান',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'qb_grav_1',
    chapter: 'মহাকর্ষ ও অভিকর্ষ',
    type: 'গাণিতিক সমস্যা',
    questionText: 'পৃথিবীপৃষ্ঠ হতে কত উচ্চতায় অভিকর্ষজ ত্বরণের মান ভূপৃষ্ঠের মানের এক-চতুর্থাংশ (1/4) হবে? (পৃথিবীর ব্যাসার্ধ R = 6400 km)',
    marks: 5,
    solution: 'g_h = g · [R / (R + h)]²\n=> (1/4) g = g · [R / (R + h)]²\n=> R / (R + h) = 1/2\n=> R + h = 2R\n=> h = R = 6400 km।\nঅতএব, ভূপৃষ্ঠ হতে ৬৪০০ কিমি উচ্চতায়।',
    subject: 'পদার্থবিজ্ঞান',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'qb_elas_1',
    chapter: 'স্থিতিস্থাপকতা',
    type: 'সংক্ষিপ্ত প্রশ্ন',
    questionText: 'হুকের সূত্রটি বিবৃত কর এবং পয়েসনের অনুপাতের (Poisson\'s Ratio) তাত্ত্বিক ও ব্যবহারিক সীমা লিখ।',
    marks: 3,
    solution: 'হুকের সূত্র: স্থিতিস্থাপক সীমার মধ্যে পীড়ন বিকৃতির সমানুপাতিক (পীড়ন ∝ বিকৃতি)।\nপয়েসনের অনুপাত σ = - (পার্শ্ব বিকৃতি / দৈর্ঘ্য বিকৃতি)।\nতাত্ত্বিক সীমা: -1 হতে +0.5\nব্যবহারিক বা বাস্তব সীমা: 0 হতে +0.5।',
    subject: 'পদার্থবিজ্ঞান',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'qb_thermo_1',
    chapter: 'তাপ ও তাপগতিবিদ্যা',
    type: 'গাণিতিক সমস্যা',
    questionText: 'একটি কার্নো ইঞ্জিন 27°C এবং 327°C তাপমাত্রার মধ্যে কাজ করে। ইঞ্জিনটির কর্মদক্ষতা কত? যদি এটি উচ্চ তাপমাত্রা হতে 1200 J তাপ গ্রহণ করে তবে কতটুকু কাজ সম্পাদন করবে?',
    marks: 5,
    solution: 'T₁ = 327 + 273 = 600 K; T₂ = 27 + 273 = 300 K।\nকর্মদক্ষতা η = 1 - (T₂ / T₁) = 1 - (300 / 600) = 0.5 = ৫০%।\nসম্পাদিত কাজ W = η × Q₁ = 0.5 × 1200 J = 600 Joule।',
    subject: 'পদার্থবিজ্ঞান',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'qb_chem_redox_1',
    chapter: 'জারণ-বিজারণ',
    type: 'সংক্ষিপ্ত প্রশ্ন',
    questionText: 'KMnO₄, K₂Cr₂O₇ এবং Na₂S₂O₃ যৌগে যথাক্রমে Mn, Cr এবং S এর জারণ সংখ্যা নির্ণয় কর।',
    marks: 4,
    solution: '১. KMnO₄: 1 + x + 4(-2) = 0 => x = +7 (Mn এর জারণ মান +7)\n২. K₂Cr₂O₇: 2(1) + 2x + 7(-2) = 0 => 2x = 12 => x = +6 (Cr এর জারণ মান +6)\n৩. Na₂S₂O₃: 2(1) + 2x + 3(-2) = 0 => 2x = 4 => x = +2 (S এর জারণ মান +2)।',
    subject: 'রসায়ন',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'qb_chem_redox_2',
    chapter: 'জারণ-বিজারণ',
    type: 'গাণিতিক সমস্যা',
    questionText: 'অম্লীয় মাধ্যমে 0.02 M ঘনমাত্রার 25 mL KMnO₄ দ্রবণকে সম্পূর্ণ প্রশমিত করতে 0.05 M FeSO₄ দ্রবণের কত আয়তন প্রয়োজন হবে?',
    marks: 5,
    solution: 'আয়ন-ইলেকট্রন সমীকরণ অনুযায়ী: 2KMnO₄ ≡ 10FeSO₄ => 1 mol KMnO₄ ≡ 5 mol FeSO₄।\nসূত্র: V₁M₁ / n₁ = V₂M₂ / n₂\n=> (25 × 0.02) / 1 = (V₂ × 0.05) / 5\n=> 0.5 = 0.01 × V₂\n=> V₂ = 50 mL।\n∴ FeSO₄ দ্রবণের আয়তন ৫০ মিলিলিটার।',
    subject: 'রসায়ন',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'qb_chem_per_1',
    chapter: 'পর্যায়বৃত্ত ধর্ম',
    type: 'থিওরি / রচনামূলক',
    questionText: 'পর্যায় সারণিতে পর্যায় ও গ্রুপভিত্তিক আয়নীকরণ শক্তির সাধারণ পরিবর্তন লিখ। ২য় পর্যায়ের Be ও B এবং N ও O এর আয়নীকরণ শক্তির ব্যতিক্রম ব্যাখ্যা কর।',
    marks: 6,
    solution: 'সাধারণ নিয়ম: একই পর্যায়ে বাম থেকে ডানে পারমাণবিক ব্যাসার্ধ হ্রাস পাওয়ায় আয়নীকরণ শক্তি বাড়ে; একই গ্রুপে উপর থেকে নিচে পারমাণবিক শক্তিস্তর বাড়ায় আয়নীকরণ শক্তি কমে।\nব্যতিক্রম ১: Be (1s² 2s²) এর 2s অরবিটাল পূর্ণ থাকায় এটি B (1s² 2s² 2p¹) অপেক্ষা অধিক স্থিতিশীল, তাই Be এর ১ম আয়নীকরণ শক্তি B অপেক্ষা বেশি।\nব্যতিক্রম ২: N (1s² 2s² 2p³) এর 2p অরবিটাল অর্ধপূর্ণ (p_x¹ p_y¹ p_z¹) থাকায় এটি O (1s² 2s² 2p⁴) অপেক্ষা স্থিতিশীল, ফলে N এর আয়নীকরণ শক্তি O অপেক্ষা বেশি।',
    subject: 'রসায়ন',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'qb_chem_bond_1',
    chapter: 'রাসায়নিক বন্ধন ও সংকেত',
    type: 'সংক্ষিপ্ত প্রশ্ন',
    questionText: 'অষ্টক নিয়ম (Octet Rule) এর সীমাবদ্ধতা বা ব্যতিক্রমসমূহ উদাহরণসহ লিখ।',
    marks: 4,
    solution: '১. অষ্টক সংকোচন (অসম্পূর্ণ অষ্টক): BeCl₂ (৪টি ইলেকট্রন), BF₃ ও AlCl₃ (৬টি ইলেকট্রন)।\n২. অষ্টক সম্প্রসারণ: PCl₅ (১০টি ইলেকট্রন), SF₆ (১২টি ইলেকট্রন), IF₇ (১৪টি ইলেকট্রন)।\n৩. বিজোড় ইলেকট্রন যৌগ: NO, NO₂।',
    subject: 'রসায়ন',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'qb_math_diff_1',
    chapter: 'ডিফারেনশিয়েশন',
    type: 'গাণিতিক সমস্যা',
    questionText: 'y = x^(sin x) হলে dy/dx এর মান নির্ণয় কর।',
    marks: 5,
    solution: 'উভয়পক্ষে স্বাভাবিক লগারিদম (ln) নিয়ে:\nln y = ln(x^(sin x)) = sin x · ln x\nx এর সাপেক্ষে অন্তরীকরণ করে:\n(1/y) · (dy/dx) = cos x · ln x + sin x · (1/x)\n=> dy/dx = y · [cos x · ln x + (sin x / x)]\n∴ dy/dx = x^(sin x) · [cos x · ln x + (sin x / x)]।',
    subject: 'গণিত',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'qb_math_diff_2',
    chapter: 'ডিফারেনশিয়েশন',
    type: 'গাণিতিক সমস্যা',
    questionText: 'f(x) = 2x³ - 9x² + 12x + 5 ফাংশনটির চরম মান (গুরুমান ও লঘুমান) নির্ণয় কর।',
    marks: 5,
    solution: 'f\'(x) = 6x² - 18x + 12 = 6(x² - 3x + 2) = 6(x - 1)(x - 2)।\nচরম মানের জন্য f\'(x) = 0 => x = 1 অথবা x = 2।\nf\'\'(x) = 12x - 18।\n১. x = 1 হলে f\'\'(1) = 12 - 18 = -6 < 0, সুতরাং x = 1 এ গুরুমান বিদ্যমান। গুরুমান = 2(1)³ - 9(1)² + 12(1) + 5 = 10।\n২. x = 2 হলে f\'\'(2) = 24 - 18 = +6 > 0, সুতরাং x = 2 এ লঘুমান বিদ্যমান। লঘুমান = 2(8) - 9(4) + 12(2) + 5 = 16 - 36 + 24 + 5 = 9।',
    subject: 'গণিত',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'qb_math_int_1',
    chapter: 'ইন্টিগ্রেশন',
    type: 'গাণিতিক সমস্যা',
    questionText: 'অনির্দিষ্ট যোগজ নির্ণয় কর: ∫ (x · e^x) / (1 + x)² dx',
    marks: 5,
    solution: '∫ e^x · [(1 + x - 1) / (1 + x)²] dx\n= ∫ e^x · [1/(1 + x) - 1/(1 + x)²] dx\nআমরা জানি, ∫ e^x [f(x) + f\'(x)] dx = e^x · f(x) + c।\nএখানে f(x) = 1/(1 + x) হলে f\'(x) = -1/(1 + x)²।\n∴ যোগজফল = [e^x / (1 + x)] + c।',
    subject: 'গণিত',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'qb_math_int_2',
    chapter: 'ইন্টিগ্রেশন',
    type: 'গাণিতিক সমস্যা',
    questionText: 'নির্দিষ্ট যোগজের মান নির্ণয় কর: ∫₀^(π/2) (√sin x) / (√sin x + √cos x) dx',
    marks: 5,
    solution: 'ধরি I = ∫₀^(π/2) [√sin x / (√sin x + √cos x)] dx  ---- (১)\nনির্দিষ্ট যোগজের ধর্ম ∫₀^a f(x)dx = ∫₀^a f(a - x)dx প্রয়োগ করে:\nI = ∫₀^(π/2) [√sin(π/2 - x) / (√sin(π/2 - x) + √cos(π/2 - x))] dx\nI = ∫₀^(π/2) [√cos x / (√cos x + √sin x)] dx  ---- (২)\n(১) ও (২) যোগ করে:\n2I = ∫₀^(π/2) [(√sin x + √cos x) / (√sin x + √cos x)] dx = ∫₀^(π/2) 1 dx = [x]₀^(π/2) = π/2\n∴ I = π / 4।',
    subject: 'গণিত',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'qb_math_trig_1',
    chapter: 'ত্রিকোণমিতি',
    type: 'গাণিতিক সমস্যা',
    questionText: 'প্রমাণ কর বা মান নির্ণয় কর: tan⁻¹(1/2) + tan⁻¹(1/3)',
    marks: 3,
    solution: 'সূত্র: tan⁻¹x + tan⁻¹y = tan⁻¹[(x + y) / (1 - xy)]\n= tan⁻¹[(1/2 + 1/3) / (1 - (1/2)(1/3))]\n= tan⁻¹[(5/6) / (5/6)]\n= tan⁻¹(1) = π/4 বা 45°।',
    subject: 'গণিত',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'qb_civ_som_1',
    chapter: 'স্ট্রেন্থ অব মেটেরিয়ালস',
    type: 'থিওরি / রচনামূলক',
    questionText: 'সহজভাবে সমর্থিত বিমের ওপর সমভাবে বিস্তৃত লোড (UDL) প্রয়োগ করা হলে শিয়ার ফোর্স (SFD) ও বেন্ডিং মোমেন্ট (BMD) ডায়াগ্রামের প্রকৃতি ব্যাখ্যা কর।',
    marks: 5,
    solution: '১. রিয়্যাকশন: L দৈর্ঘ্যের বিমে প্রতি মিটারে w লোড থাকলে উভয় সাপোর্টে রিয়্যাকশন R_A = R_B = wL/2।\n২. শিয়ার ফোর্স (SFD): সাপোর্টে মান wL/2 এবং স্প্যানের মাঝখানে শূন্য। ডায়াগ্রামটি একঘাতী বা ইনক্লাইন্ড সরলরেখা।\n৩. বেন্ডিং মোমেন্ট (BMD): উভয় সাপোর্টে শূন্য এবং স্প্যানের মাঝখানে (যেখানে SF = 0) সর্বোচ্চ। সর্বোচ্চ মোমেন্ট M_max = wL²/8। ডায়াগ্রামটি দ্বিঘাতী প্যারাবলিক বক্ররেখা।',
    subject: 'সিভিল ইঞ্জিনিয়ারিং',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'qb_civ_som_2',
    chapter: 'স্ট্রেন্থ অব মেটেরিয়ালস',
    type: 'সংক্ষিপ্ত প্রশ্ন',
    questionText: 'পয়েন্ট অব কন্ট্রাফ্লেক্সার (Point of Contraflexure) বা ইনফ্লেকশন পয়েন্ট কাকে বলে?',
    marks: 3,
    solution: 'কোনো বিমের যে বিন্দুতে বেন্ডিং মোমেন্টের মান শূন্য হয় এবং এর চিহ্ন ধনাত্মক থেকে ঋণাত্মক বা ঋণাত্মক থেকে ধনাত্মক দিকে পরিবর্তিত হয় (অর্থাৎ স্যাচিং থেকে হগিং বা হগিং থেকে স্যাচিং হয়), তাকে পয়েন্ট অব কন্ট্রাফ্লেক্সার বা পয়েন্ট অব ইনফ্লেকশন বলে। এটি সাধারণত ওভারহ্যাংগিং বা কন্টিনিউয়াস বিমে দেখা যায়।',
    subject: 'সিভিল ইঞ্জিনিয়ারিং',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'qb_civ_surv_1',
    chapter: 'সার্ভেয়িং',
    type: 'গাণিতিক সমস্যা',
    questionText: 'একটি লাইনের ফোর বেয়ারিং (Fore Bearing) 30°45\' হলে এর ব্যাক বেয়ারিং (Back Bearing) কত? অপর একটি লাইনের FB 215°30\' হলে এর BB কত?',
    marks: 4,
    solution: 'নিয়ম: যদি FB < 180° হয়, তবে BB = FB + 180°। যদি FB > 180° হয়, তবে BB = FB - 180°।\n১ম লাইন: FB = 30°45\' (< 180°), অতএব BB = 30°45\' + 180° = 210°45\'।\n২য় লাইন: FB = 215°30\' (> 180°), অতএব BB = 215°30\' - 180° = 35°30\'।',
    subject: 'সিভিল ইঞ্জিনিয়ারিং',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'qb_org_chem_1',
    chapter: 'জৈব রসায়ন',
    type: 'সংক্ষিপ্ত প্রশ্ন',
    questionText: 'উর্টজ বিক্রিয়া (Wurtz Reaction) এবং মার্কনিকভ নিয়ম (Markovnikov\'s Rule) উদাহরণসহ সংক্ষেপে লিখ।',
    marks: 4,
    solution: '১. উর্টজ বিক্রিয়া: শুষ্ক ইথারে দ্রবীভূত অ্যালকাইল হ্যালাইডের সাথে সোডিয়াম ধাতুর বিক্রিয়ায় দ্বিগুণ কার্বনবিশিষ্ট অ্যালকেন তৈরি হয়।\n2CH₃-I + 2Na -> CH₃-CH₃ + 2NaI।\n২. মার্কনিকভ নিয়ম: অপ্রতিসম অ্যালকিনের সাথে অপ্রতিসম বিকারকের (যেমন HBr) যুত বিক্রিয়ায় বিকারকের ঋণাত্মক অংশটি দ্বিবন্ধনযুক্ত সেই কার্বনে যুক্ত হয় যাতে কম সংখ্যক হাইড্রোজেন পরমাণু থাকে।\nCH₃-CH=CH₂ + HBr -> CH₃-CH(Br)-CH₃ (২-ব্রোমোপ্রোপেন)।',
    subject: 'রসায়ন',
    createdAt: Date.now() - 86400000 * 2,
  },
];

/**
 * Loads the user's custom question bank from local storage.
 * If empty, seeds with initial diverse sample admission questions.
 */
export function getSavedQuestionBank(): SavedQuestionBankItem[] {
  try {
    const raw = localStorage.getItem(QUESTION_BANK_KEY);
    if (!raw) {
      localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(DEFAULT_QUESTION_BANK_SEEDS));
      return DEFAULT_QUESTION_BANK_SEEDS;
    }
    const parsed: SavedQuestionBankItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(DEFAULT_QUESTION_BANK_SEEDS));
      return DEFAULT_QUESTION_BANK_SEEDS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load saved question bank', err);
    return DEFAULT_QUESTION_BANK_SEEDS;
  }
}

/**
 * Saves question bank items to local storage.
 */
export function saveSavedQuestionBank(items: SavedQuestionBankItem[]): void {
  try {
    localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save question bank', err);
  }
}

/**
 * Adds a new question item to local storage.
 */
export function addQuestionToBank(
  item: Omit<SavedQuestionBankItem, 'id' | 'createdAt'>
): SavedQuestionBankItem {
  const current = getSavedQuestionBank();
  const newItem: SavedQuestionBankItem = {
    ...item,
    id: `qb_item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: Date.now(),
  };
  const updated = [newItem, ...current];
  saveSavedQuestionBank(updated);
  return newItem;
}

/**
 * Updates an existing question in local storage.
 */
export function updateQuestionInBank(item: SavedQuestionBankItem): void {
  const current = getSavedQuestionBank();
  const index = current.findIndex((q) => q.id === item.id);
  if (index !== -1) {
    current[index] = item;
    saveSavedQuestionBank([...current]);
  }
}

/**
 * Deletes a question from local storage.
 */
export function deleteQuestionFromBank(id: string): void {
  const current = getSavedQuestionBank();
  const updated = current.filter((q) => q.id !== id);
  saveSavedQuestionBank(updated);
}

/**
 * Resets the question bank to the initial default seed set.
 */
export function resetQuestionBankToDefault(): SavedQuestionBankItem[] {
  saveSavedQuestionBank(DEFAULT_QUESTION_BANK_SEEDS);
  return DEFAULT_QUESTION_BANK_SEEDS;
}


