import { UserProfile, QuizResult, Question, DailyLimitInfo, SemesterGrades, StudySession } from '../types';
import { defaultQuestions } from '../data/defaultQuestions';

const PROFILE_KEY = 'duet_user_profile_v1';
const HISTORY_KEY = 'duet_quiz_history_v1';
const CUSTOM_QUESTIONS_KEY = 'duet_custom_questions_v1';
const DAILY_LIMIT_KEY = 'duet_daily_limit_v1';
const STUDY_SESSIONS_KEY = 'duet_study_sessions_v1';

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
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load quiz history', e);
    return [];
  }
}

export function saveQuizResult(result: QuizResult): void {
  try {
    const history = getQuizHistory();
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
    const customData = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    const customList: Question[] = customData ? JSON.parse(customData) : [];
    // Merge default questions with custom questions
    return [...defaultQuestions, ...customList];
  } catch (e) {
    console.error('Failed to load questions', e);
    return defaultQuestions;
  }
}

export function getCustomQuestions(): Question[] {
  try {
    const customData = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    return customData ? JSON.parse(customData) : [];
  } catch (e) {
    return [];
  }
}

export function saveCustomQuestion(question: Question): void {
  try {
    const list = getCustomQuestions();
    list.unshift(question);
    localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save custom question', e);
  }
}

export function saveBatchCustomQuestions(questions: Question[]): void {
  try {
    const list = getCustomQuestions();
    const updated = [...questions, ...list];
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
      // Seed default sample sessions matching user prompt scenario
      const todayStr = new Date().toISOString().slice(0, 10);
      const sampleSessions: StudySession[] = [
        {
          id: 'study-sample-1',
          date: todayStr,
          startTime: '06:00',
          endTime: '09:00',
          durationMinutes: 180,
          subject: 'সিভিল ইঞ্জিনিয়ারিং',
          topic: 'সার্ভেয়িং ও হাইড্রোলিক্স থিওরি এবং অঙ্ক',
          notes: 'সকাল ৬:০০ - ৯:০০ টা পর্যন্ত পড়া হয়েছে',
          createdAt: Date.now() - 3600000 * 4,
        },
        {
          id: 'study-sample-2',
          date: todayStr,
          startTime: '10:00',
          endTime: '12:00',
          durationMinutes: 120,
          subject: 'গণিত (Mathematics)',
          topic: 'ক্যালকুলাস ইন্টিগ্রেশন ও ডিফারেনশিয়াল সমীকরণ',
          notes: 'সকাল ১০:০০ - ১২:০০ টা পর্যন্ত পড়া হয়েছে',
          createdAt: Date.now() - 3600000 * 2,
        },
      ];
      localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(sampleSessions));
      return sampleSessions;
    }
    const parsed: StudySession[] = JSON.parse(data);
    // Sort descending by date then createdAt
    return parsed.sort((a, b) => {
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
    const list = getStudySessions();
    // Prepend new session
    list.unshift(session);
    localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save study session', e);
  }
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

export function resetSampleStudySessions(): StudySession[] {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const sampleSessions: StudySession[] = [
      {
        id: 'study-sample-1',
        date: todayStr,
        startTime: '06:00',
        endTime: '09:00',
        durationMinutes: 180,
        subject: 'সিভিল ইঞ্জিনিয়ারিং',
        topic: 'সার্ভেয়িং ও হাইড্রোলিক্স থিওরি এবং অঙ্ক',
        notes: 'সকাল ৬:০০ - ৯:০০ টা পর্যন্ত পড়া হয়েছে',
        createdAt: Date.now() - 3600000 * 4,
      },
      {
        id: 'study-sample-2',
        date: todayStr,
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 120,
        subject: 'গণিত (Mathematics)',
        topic: 'ক্যালকুলাস ইন্টিগ্রেশন ও ডিফারেনশিয়াল সমীকরণ',
        notes: 'সকাল ১০:০০ - ১২:০০ টা পর্যন্ত পড়া হয়েছে',
        createdAt: Date.now() - 3600000 * 2,
      },
    ];
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
