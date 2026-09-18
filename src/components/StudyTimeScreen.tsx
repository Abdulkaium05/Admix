import React, { useState, useEffect } from 'react';
import { StudySession } from '../types';
import {
  getStudySessions,
  saveStudySession,
  deleteStudySession,
  calculateStudyDurationMinutes,
  formatDuration,
} from '../utils/storage';
import { Language } from '../utils/i18n';
import {
  Clock,
  Calendar,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface StudyTimeScreenProps {
  language: Language;
  onNavigateHome?: () => void;
}

const PRESET_SUBJECTS = [
  { id: 'civil', nameBn: 'সিভিল ইঞ্জিনিয়ারিং', nameEn: 'Civil Engineering', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'math', nameBn: 'গণিত (Mathematics)', nameEn: 'Mathematics', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: 'physics', nameBn: 'পদার্থবিজ্ঞান (Physics)', nameEn: 'Physics', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { id: 'chemistry', nameBn: 'রসায়ন (Chemistry)', nameEn: 'Chemistry', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'english', nameBn: 'ইংরেজি (English)', nameEn: 'English', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'other', nameBn: 'অন্যান্য / সাধারণ প্রস্তুতি', nameEn: 'General / Other', color: 'bg-stone-100 text-stone-900 border-stone-300' },
];

export const StudyTimeScreen: React.FC<StudyTimeScreenProps> = ({ language, onNavigateHome }) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Tab: 'daily' | 'all_history' | 'timer'
  const [activeTab, setActiveTab] = useState<'daily' | 'all_history' | 'timer'>('daily');

  // Form State
  const [sessionDate, setSessionDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>('06:00');
  const [endTime, setEndTime] = useState<string>('09:00');
  const [subject, setSubject] = useState<string>('সিভিল ইঞ্জিনিয়ারিং');
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [isAddingOpen, setIsAddingOpen] = useState<boolean>(false);

  // Live Timer State
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerSubject, setTimerSubject] = useState<string>('সিভিল ইঞ্জিনিয়ারিং');
  const [timerTopic, setTimerTopic] = useState<string>('');
  const [timerStartTimeStr, setTimerStartTimeStr] = useState<string>('');

  useEffect(() => {
    loadSessions();
  }, []);

  // Live Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const loadSessions = () => {
    const data = getStudySessions();
    setSessions(data);
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে কী পড়েছেন তা লিখুন (যেমন: সার্ভেয়িং অধ্যায় ৩)' : 'Please enter what you studied');
      return;
    }

    const duration = calculateStudyDurationMinutes(startTime, endTime);
    if (duration <= 0) {
      alert(language === 'bn' ? 'শুরুর সময় এবং শেষের সময় সঠিক নয়।' : 'Invalid start or end time.');
      return;
    }

    const newSession: StudySession = {
      id: `study-${Date.now()}`,
      date: sessionDate,
      startTime,
      endTime,
      durationMinutes: duration,
      subject,
      topic: topic.trim(),
      notes: notes.trim() || undefined,
      createdAt: Date.now(),
    };

    saveStudySession(newSession);
    loadSessions();

    // Reset topic & notes
    setTopic('');
    setNotes('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 2500);

    // If added for a different date, switch view to that date
    setSelectedDate(sessionDate);
  };

  const handleDelete = (id: string) => {
    const confirmMsg = language === 'bn'
      ? 'আপনি কি এই পড়ার সেশনটি মুছে ফেলতে চান?'
      : 'Are you sure you want to delete this study session?';
    if (window.confirm(confirmMsg)) {
      deleteStudySession(id);
      loadSessions();
    }
  };

  // Live Timer Actions
  const handleStartTimer = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    setTimerStartTimeStr(`${hours}:${mins}`);
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setTimerStartTimeStr('');
  };

  const handleSaveTimerSession = () => {
    if (timerSeconds < 60) {
      alert(language === 'bn' ? 'কমপক্ষে ১ মিনিট পড়ার পর সেভ করতে পারবেন।' : 'Study for at least 1 minute to save.');
      return;
    }

    const now = new Date();
    const endHours = String(now.getHours()).padStart(2, '0');
    const endMins = String(now.getMinutes()).padStart(2, '0');
    const endTimeStr = `${endHours}:${endMins}`;

    const durationMins = Math.round(timerSeconds / 60);
    const todayStr = now.toISOString().slice(0, 10);

    const newSession: StudySession = {
      id: `study-${Date.now()}`,
      date: todayStr,
      startTime: timerStartTimeStr || endTimeStr,
      endTime: endTimeStr,
      durationMinutes: durationMins,
      subject: timerSubject,
      topic: timerTopic.trim() || (language === 'bn' ? 'লাইভ টাইমার সেশন' : 'Live Timer Session'),
      createdAt: Date.now(),
    };

    saveStudySession(newSession);
    loadSessions();
    handleResetTimer();
    setTimerTopic('');
    setSelectedDate(todayStr);
    setActiveTab('daily');
    alert(language === 'bn' ? 'পড়ার সময় সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Study session saved successfully!');
  };

  // Calculations for Selected Date
  const selectedDateSessions = sessions.filter((s) => s.date === selectedDate);
  const selectedDateTotalMinutes = selectedDateSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Group all sessions by date for history
  const sessionsByDate: Record<string, StudySession[]> = {};
  sessions.forEach((s) => {
    if (!sessionsByDate[s.date]) {
      sessionsByDate[s.date] = [];
    }
    sessionsByDate[s.date].push(s);
  });

  const allDates = Object.keys(sessionsByDate).sort((a, b) => b.localeCompare(a));
  const totalAllMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Helper date navigation
  const shiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().slice(0, 10));
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const todayStr = new Date().toISOString().slice(0, 10);

      const isToday = dateStr === todayStr;
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const formatted = dateObj.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', options);
      return isToday ? `${formatted} (${language === 'bn' ? 'আজ' : 'Today'})` : formatted;
    } catch {
      return dateStr;
    }
  };

  const currentDuration = calculateStudyDurationMinutes(startTime, endTime);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-2">
              <span>{language === 'bn' ? 'ডেইলি স্টাডি টাইম ট্র্যাকার' : 'Daily Study Time Tracker'}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {language === 'bn' ? 'ক্যালেন্ডার ও হিস্ট্রি' : 'Calendar & Log'}
              </span>
            </h1>
            <p className="text-xs text-emerald-700/80">
              {language === 'bn'
                ? 'কখন থেকে কখন পড়লেন, কী পড়লেন তা দিনভিত্তিক ক্যালেন্ডারে সংরক্ষণ করুন'
                : 'Log daily study periods, topics, and track your admission study routine'}
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-1 bg-emerald-50/70 p-1 rounded-xl border border-emerald-100 text-xs font-semibold self-stretch sm:self-auto justify-between sm:justify-start">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'daily' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            {language === 'bn' ? 'আজকের পড়া' : 'Daily View'}
          </button>
          <button
            onClick={() => setActiveTab('all_history')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all_history' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            {language === 'bn' ? 'সব হিস্ট্রি' : 'All History'} ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'timer' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            <Play className="w-3 h-3" />
            <span>{language === 'bn' ? 'স্টপওয়াচ' : 'Stopwatch'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metrics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-700/80 block">
              {language === 'bn' ? 'নির্বাচিত দিনে পড়া' : 'Selected Date Study'}
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-950">
              {formatDuration(selectedDateTotalMinutes, language)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-700/80 block">
              {language === 'bn' ? 'মোট সেশন সংখ্যা' : 'Sessions Logged'}
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-950">
              {selectedDateSessions.length} {language === 'bn' ? 'টি সেশন' : 'sessions'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-700/80 block">
              {language === 'bn' ? 'সর্বমোট রেকর্ডকৃত পড়া' : 'Lifetime Study Logged'}
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-950">
              {formatDuration(totalAllMinutes, language)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ADD STUDY SESSION SECTION */}
      <div className="bg-white rounded-2xl border border-emerald-200/90 shadow-2xs overflow-hidden">
        <div
          onClick={() => setIsAddingOpen(!isAddingOpen)}
          className="p-4 bg-emerald-50/50 hover:bg-emerald-50 border-b border-emerald-100 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-950">
                {language === 'bn' ? 'নতুন পড়ার সময় যোগ করুন (Add Study Time)' : 'Add New Study Session'}
              </h2>
              <p className="text-[11px] text-emerald-700/80">
                {language === 'bn'
                  ? 'যেমন: সকাল ০৬:০০ - ০৯:০০ পর্যন্ত সিভিল ইঞ্জিনিয়ারিং বা ম্যাথ পড়া'
                  : 'Log exact hours, subject & topics studied'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-3 py-1 rounded-lg"
          >
            {isAddingOpen ? (language === 'bn' ? 'সংক্ষিপ্ত করুন' : 'Collapse') : (language === 'bn' ? '+ ফর্ম খুলুন' : '+ Open Form')}
          </button>
        </div>

        {isAddingOpen && (
          <form onSubmit={handleSaveSession} className="p-4 sm:p-5 space-y-4">
            {formSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>{language === 'bn' ? 'পড়ার সময় সফলভাবে ক্যালেন্ডার ও হিস্ট্রিতে সেভ করা হয়েছে!' : 'Study session saved successfully!'}</span>
              </div>
            )}

            {/* Row 1: Date, Start Time, End Time & Calculated Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? 'পড়ার তারিখ' : 'Study Date'}</span>
                </label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => {
                    setSessionDate(e.target.value);
                    setSelectedDate(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? 'শুরুর সময় (Start)' : 'Start Time'}</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? 'শেষের সময় (End)' : 'End Time'}</span>
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  {language === 'bn' ? 'মোট পড়ার সময়কাল' : 'Total Duration'}
                </label>
                <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-900 flex items-center justify-between">
                  <span>{formatDuration(currentDuration, language)}</span>
                  <span className="text-[11px] text-emerald-700 font-mono">({currentDuration} মি.)</span>
                </div>
              </div>
            </div>

            {/* Quick Time Presets (Common study slots like 6-9 AM, 10-12 AM, 3-5 PM, 7-10 PM) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-emerald-700/80 mr-1">
                {language === 'bn' ? 'কুইক স্লট:' : 'Quick Slots:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStartTime('06:00');
                  setEndTime('09:00');
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs border border-emerald-200/80 transition-colors"
              >
                সকাল ৬ - ৯ টা (৩ ঘণ্টা)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartTime('10:00');
                  setEndTime('12:00');
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs border border-emerald-200/80 transition-colors"
              >
                সকাল ১০ - ১২ টা (২ ঘণ্টা)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartTime('15:00');
                  setEndTime('17:00');
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs border border-emerald-200/80 transition-colors"
              >
                বিকাল ৩ - ৫ টা (২ ঘণ্টা)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartTime('19:00');
                  setEndTime('22:00');
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs border border-emerald-200/80 transition-colors"
              >
                রাত ৭ - ১০ টা (৩ ঘণ্টা)
              </button>
            </div>

            {/* Row 2: Subject & What Was Studied (Topic) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  {language === 'bn' ? 'বিষয় নির্বাচন করুন' : 'Select Subject'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                >
                  {PRESET_SUBJECTS.map((sub) => (
                    <option key={sub.id} value={sub.nameBn}>
                      {language === 'bn' ? sub.nameBn : sub.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  {language === 'bn' ? 'কী পড়লেন? (অধ্যায় / টপিক)' : 'What did you study? (Topic/Chapter)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'যেমন: সার্ভেয়িং অধ্যায় ৩ লেভেলিং সমস্যা বা ক্যালকুলাস ইন্টিগ্রেশন'
                      : 'e.g. Surveying Leveling problems or Calculus integration'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-bold text-emerald-950 mb-1">
                {language === 'bn' ? 'অতিরিক্ত মন্তব্য বা নোট (ঐচ্ছিক)' : 'Additional Notes (Optional)'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: রিভিশন বাকি আছে, ৩টি সূত্র মুখস্থ করলাম'
                    : 'e.g. Needs revision, memorized 3 key formulas'
                }
                className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{language === 'bn' ? 'পড়ার সময় সংরক্ষণ করুন' : 'Save Study Session'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4. LIVE STOPWATCH TAB (If active) */}
      {activeTab === 'timer' && (
        <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-2xs text-center space-y-4 animate-in fade-in">
          <div className="max-w-md mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {language === 'bn' ? 'লাইভ স্টাডি স্টপওয়াচ' : 'Live Study Stopwatch'}
            </span>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-emerald-950 tracking-wider">
              {String(Math.floor(timerSeconds / 3600)).padStart(2, '0')}:
              {String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0')}:
              {String(timerSeconds % 60).padStart(2, '0')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
              <div>
                <label className="block text-[11px] font-bold text-emerald-950 mb-1">বিষয়:</label>
                <select
                  value={timerSubject}
                  onChange={(e) => setTimerSubject(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs text-emerald-950 bg-white"
                >
                  {PRESET_SUBJECTS.map((sub) => (
                    <option key={sub.id} value={sub.nameBn}>
                      {sub.nameBn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-emerald-950 mb-1">টপিক:</label>
                <input
                  type="text"
                  value={timerTopic}
                  onChange={(e) => setTimerTopic(e.target.value)}
                  placeholder="কী পড়ছেন?"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs text-emerald-950 bg-white"
                />
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3 pt-3">
              {!isTimerRunning ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>{timerSeconds > 0 ? 'পড়া চালু রাখুন' : 'পড়া শুরু করুন'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseTimer}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span>সাময়িক বিরতি (Pause)</span>
                </button>
              )}

              {timerSeconds > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleSaveTimerSession}
                    className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>পড়া শেষ ও সেভ করুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    className="p-2.5 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
                    title="রিসেট"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. DAILY VIEW (Selected Date Logs) */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-2xs space-y-4">
          {/* Date Selector Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftDate(-1)}
                className="p-1.5 rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition-colors"
                title="আগের দিন"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-950 bg-emerald-50/40 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <span className="text-xs font-bold text-emerald-900 hidden sm:inline">
                  {formatDateDisplay(selectedDate)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => shiftDate(1)}
                className="p-1.5 rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition-colors"
                title="পরের দিন"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Quick Today Button */}
              {selectedDate !== new Date().toISOString().slice(0, 10) && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors ml-1"
                >
                  {language === 'bn' ? 'আজকে ফিরে যান' : 'Today'}
                </button>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs text-emerald-700/80 font-medium block">
                {language === 'bn' ? 'এই দিনের মোট পড়ার সময়:' : 'Total time on this date:'}
              </span>
              <span className="text-sm sm:text-base font-bold text-emerald-950 font-mono">
                {formatDuration(selectedDateTotalMinutes, language)}
              </span>
            </div>
          </div>

          {/* Sessions List for Selected Date */}
          {selectedDateSessions.length === 0 ? (
            <div className="py-10 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-emerald-950">
                {language === 'bn' ? 'এই তারিখে কোনো পড়ার হিসেব নেই' : 'No study sessions recorded on this date'}
              </h3>
              <p className="text-xs text-emerald-700/80 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'উপরে "+ নতুন পড়ার সময় যোগ করুন" বাটনে ক্লিক করে আজ কখন কতক্ষণ কী পড়লেন তা লিখে রাখুন।'
                  : 'Click "+ Add Study Time" above to log when and what you studied on this date.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSessionDate(selectedDate);
                  setIsAddingOpen(true);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'পড়ার সময় লিখুন' : 'Log Study Time'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateSessions.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3.5 sm:p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    {/* Time badge & Subject */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-white border border-emerald-200 text-emerald-950 px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{item.startTime} - {item.endTime}</span>
                        <span className="text-emerald-700/60 font-sans">({formatDuration(item.durationMinutes, language)})</span>
                      </span>

                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                        {item.subject}
                      </span>
                    </div>

                    {/* What was studied */}
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                      {item.topic}
                    </h4>

                    {/* Optional Note */}
                    {item.notes && (
                      <p className="text-xs text-emerald-800/80 bg-white/80 p-2 rounded-lg border border-emerald-100/70">
                        <span className="font-semibold">{language === 'bn' ? 'নোট: ' : 'Note: '}</span>
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                    title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                    aria-label="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. ALL HISTORY TAB (Grouped by Date) */}
      {activeTab === 'all_history' && (
        <div className="space-y-4">
          {allDates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-emerald-100 p-8 text-center space-y-3">
              <Clock className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-950">
                {language === 'bn' ? 'কোনো স্টাডি হিস্ট্রি এখনও পাওয়া যায়নি' : 'No study history available yet'}
              </h3>
              <p className="text-xs text-emerald-700/80">
                {language === 'bn'
                  ? 'প্রতিদিনের পড়ার হিসাব রাখতে উপরের ফর্ম ব্যবহার করুন।'
                  : 'Start logging your study sessions to build your routine history.'}
              </p>
            </div>
          ) : (
            allDates.map((dateStr) => {
              const daySessions = sessionsByDate[dateStr] || [];
              const dayTotalMins = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

              return (
                <div
                  key={dateStr}
                  className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-2xs"
                >
                  {/* Date Header Banner */}
                  <div className="p-3.5 sm:p-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs sm:text-sm font-bold text-emerald-950">
                        {formatDateDisplay(dateStr)}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-800 font-mono bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                      {language === 'bn' ? 'মোট: ' : 'Total: '}
                      {formatDuration(dayTotalMins, language)}
                    </span>
                  </div>

                  {/* Day Sessions List */}
                  <div className="divide-y divide-emerald-50 p-2 sm:p-3 space-y-2">
                    {daySessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-3 rounded-xl hover:bg-emerald-50/30 transition-colors flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                              {session.startTime} - {session.endTime} ({formatDuration(session.durationMinutes, language)})
                            </span>
                            <span className="text-xs font-bold text-emerald-800">
                              {session.subject}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-emerald-950">
                            {session.topic}
                          </p>

                          {session.notes && (
                            <p className="text-xs text-emerald-700/80 italic">
                              {session.notes}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
