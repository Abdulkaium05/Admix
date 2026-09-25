import React, { useState, useEffect, useMemo } from 'react';
import { StudySession } from '../types';
import { StudyTimeChart } from './StudyTimeChart';
import {
  getStudySessions,
  saveStudySession,
  deleteStudySession,
  calculateStudyDurationMinutes,
  formatDuration,
} from '../utils/storage';
import { Language } from '../utils/i18n';
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  TrendingUp,
  PlusCircle,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

interface StudyGraphScreenProps {
  sessions?: StudySession[];
  language: Language;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onOpenAddSession?: (date: string) => void;
  onBack: () => void;
  onNavigateToTracker?: () => void;
}

const PRESET_SUBJECTS = [
  'সিভিল ইঞ্জিনিয়ারিং',
  'গণিত (Mathematics)',
  'পদার্থবিজ্ঞান (Physics)',
  'রসায়ন (Chemistry)',
  'ইংরেজি (English)',
  'হ্যান্ডরাইটিং প্র্যাকটিস (Handwriting Practice)',
  'অন্যান্য / সাধারণ প্রস্তুতি',
];

export const StudyGraphScreen: React.FC<StudyGraphScreenProps> = ({
  sessions: initialSessions,
  language,
  selectedDate: propSelectedDate,
  onSelectDate: propOnSelectDate,
  onBack,
  onNavigateToTracker,
}) => {
  const [sessions, setSessions] = useState<StudySession[]>(() => initialSessions || getStudySessions());
  const [currentSelectedDate, setCurrentSelectedDate] = useState<string>(() => {
    return propSelectedDate || new Date().toISOString().slice(0, 10);
  });

  // Quick session modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionDate, setSessionDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>('07:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['সিভিল ইঞ্জিনিয়ারিং']);
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(sub)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter((s) => s !== sub);
      }
      return [...prev, sub];
    });
  };

  // Keep sessions in sync if prop changes
  useEffect(() => {
    if (initialSessions) {
      setSessions(initialSessions);
    } else {
      setSessions(getStudySessions());
    }
  }, [initialSessions]);

  const handleSelectDate = (date: string) => {
    setCurrentSelectedDate(date);
    if (propOnSelectDate) propOnSelectDate(date);
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে কী পড়েছেন তা লিখুন' : 'Please enter what you studied');
      return;
    }

    const duration = calculateStudyDurationMinutes(startTime, endTime);
    if (duration <= 0) {
      alert(language === 'bn' ? 'শেষ সময় শুরুর সময় থেকে বেশি হতে হবে' : 'End time must be after start time');
      return;
    }

    const newSession: StudySession = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: sessionDate,
      startTime,
      endTime,
      durationMinutes: duration,
      subject: selectedSubjects.join(', '),
      subjects: selectedSubjects,
      topic: topic.trim(),
      notes: notes.trim() || undefined,
      createdAt: Date.now(),
    };

    saveStudySession(newSession);
    const updated = getStudySessions();
    setSessions(updated);
    setTopic('');
    setNotes('');
    setIsModalOpen(false);
    setSuccessToast(language === 'bn' ? 'পড়ার সময় সফলভাবে সংরক্ষণ হয়েছে!' : 'Study session saved successfully!');
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleDeleteSession = (id: string) => {
    if (confirm(language === 'bn' ? 'আপনি কি এই সেশনটি মুছে ফেলতে চান?' : 'Delete this session?')) {
      deleteStudySession(id);
      setSessions(getStudySessions());
    }
  };

  // Compute subject-wise breakdown for all recorded sessions
  const subjectStats = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((s) => {
      const subj = s.subject?.trim() || (language === 'bn' ? 'অন্যান্য' : 'Other');
      map.set(subj, (map.get(subj) || 0) + s.durationMinutes);
    });

    const entries = Array.from(map.entries())
      .map(([sub, minutes]) => ({ subject: sub, minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    const totalAllMinutes = entries.reduce((acc, curr) => acc + curr.minutes, 0);

    return {
      entries: entries.slice(0, 5),
      totalAllMinutes,
    };
  }, [sessions, language]);

  // Selected date sessions
  const selectedDateSessions = useMemo(() => {
    return sessions.filter((s) => s.date === currentSelectedDate);
  }, [sessions, currentSelectedDate]);

  const selectedDateTotalMinutes = useMemo(() => {
    return selectedDateSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [selectedDateSessions]);

  return (
    <div className="space-y-5 max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-16">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors shadow-2xs flex-shrink-0"
            title={language === 'bn' ? 'স্টাডি টাইমে ফিরে যান' : 'Back to Study Time'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-emerald-950">
                {language === 'bn' ? 'স্টাডি গ্রাফ' : 'Study Graph'}
              </h1>
              <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                {language === 'bn' ? 'অগ্রগতি অ্যানালিটিক্স' : 'Analytics'}
              </span>
            </div>
            <p className="text-xs text-emerald-700/80 mt-0.5">
              {language === 'bn'
                ? 'পড়া শুরুর ১ম দিন থেকে আজকের পড়াশোনার ধারাবাহিকতা ও পূর্ণাঙ্গ গ্রাফ'
                : 'Complete visual curve and daily study timeline starting from Day 1'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {onNavigateToTracker && (
            <button
              type="button"
              onClick={onNavigateToTracker}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'bn' ? 'স্টাডি টাইম' : 'Study Time'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSessionDate(currentSelectedDate);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '+ সেশন যোগ' : '+ Add Session'}</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {successToast && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Interactive Chart (Starts from Day 1, with animated Line & Bar modes) */}
      <StudyTimeChart
        sessions={sessions}
        language={language}
        selectedDate={currentSelectedDate}
        onSelectDate={handleSelectDate}
        onOpenAddSession={(date) => {
          setSessionDate(date);
          setCurrentSelectedDate(date);
          setIsModalOpen(true);
        }}
        onBack={onBack}
      />

      {/* Selected Date Session Details */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={currentSelectedDate}
              onChange={(e) => handleSelectDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-950 bg-emerald-50/40 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            {currentSelectedDate !== new Date().toISOString().slice(0, 10) && (
              <button
                type="button"
                onClick={() => handleSelectDate(new Date().toISOString().slice(0, 10))}
                className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
              >
                {language === 'bn' ? 'আজকের তারিখে যান' : 'Today'}
              </button>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs text-emerald-700/80 font-medium block">
              {language === 'bn' ? 'এই দিনের পড়ার মোট সময়:' : 'Total time on this date:'}
            </span>
            <span className="text-sm sm:text-base font-bold text-emerald-950 font-mono">
              {formatDuration(selectedDateTotalMinutes, language)}
            </span>
          </div>
        </div>

        {selectedDateSessions.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-stone-600">
              {language === 'bn' ? 'এই তারিখে কোনো পড়ার হিসেব লেখা হয়নি।' : 'No study sessions recorded for this date.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSessionDate(currentSelectedDate);
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'পড়ার সময় লিখুন' : 'Log Study Time'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedDateSessions.map((item, idx) => (
              <div
                key={item.id ? `${item.id}-${idx}` : `sess-${idx}`}
                className="p-3 sm:p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-white border border-emerald-200 text-emerald-950 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>{item.startTime} - {item.endTime}</span>
                      <span className="text-emerald-700/70 font-sans">({formatDuration(item.durationMinutes, language)})</span>
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                      {item.subject}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                    {item.topic}
                  </h4>
                  {item.notes && (
                    <p className="text-xs text-emerald-800/80 bg-white/70 p-2 rounded-lg border border-emerald-100/70">
                      <span className="font-semibold">{language === 'bn' ? 'নোট: ' : 'Note: '}</span>
                      {item.notes}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteSession(item.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                  title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subject Distribution and Consistency Target */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Subjects Breakdown */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-2xs md:col-span-2">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'বিষয়ভিত্তিক স্টাডি টাইম বণ্টন' : 'Subject-wise Study Time'}</span>
            </h3>
            <span className="text-[11px] text-emerald-700 font-mono font-bold">
              {formatDuration(subjectStats.totalAllMinutes, language)}
            </span>
          </div>

          {subjectStats.entries.length > 0 ? (
            <div className="space-y-2.5">
              {subjectStats.entries.map((item, idx) => {
                const percent =
                  subjectStats.totalAllMinutes > 0
                    ? Math.round((item.minutes / subjectStats.totalAllMinutes) * 100)
                    : 0;

                return (
                  <div key={item.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-emerald-950">{item.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-900 font-bold">
                          {formatDuration(item.minutes, language)}
                        </span>
                        <span className="text-[11px] text-stone-600 font-mono">({percent}%)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-emerald-50 overflow-hidden border border-emerald-100">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-stone-600 text-xs">
              {language === 'bn' ? 'এখনো কোনো বিষয়ের পড়া রেকর্ড করা হয়নি' : 'No subjects studied yet'}
            </div>
          )}
        </div>

        {/* Consistency Target Card */}
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-emerald-300" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold">
                {language === 'bn' ? 'ডুয়েট মিশন স্টাডি রুটিন' : 'Study Routine Goal'}
              </h3>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              {language === 'bn'
                ? 'ডুয়েট ভর্তি পরীক্ষায় শীর্ষ মেধা তালিকায় থাকতে প্রতিদিন ৪ থেকে ৬ ঘণ্টা একাগ্র পড়াশোনার অভ্যাস ধরে রাখুন।'
                : 'Target 4 to 6 focused study hours every single day to stay on the top merit list for DUET admission.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-emerald-200">
              {language === 'bn' ? 'দৈনিক লক্ষ্য' : 'Daily Target'}
            </span>
            <span className="font-bold text-white font-mono bg-white/10 px-2.5 py-1 rounded-lg">
              {language === 'bn' ? '৫ - ৬ ঘণ্টা' : '5 - 6 Hours'}
            </span>
          </div>
        </div>
      </div>

      {/* Add Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'পড়ার সময় লিখুন' : 'Log Study Time'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-500 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSession} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-emerald-900 block mb-1">
                  {language === 'bn' ? 'তারিখ' : 'Date'}
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-emerald-900 block mb-1">
                    {language === 'bn' ? 'কখন থেকে' : 'From'}
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-emerald-900 block mb-1">
                    {language === 'bn' ? 'কখন পর্যন্ত' : 'To'}
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-900 block mb-1">
                  {language === 'bn' ? 'বিষয় নির্বাচন (একাধিক নির্বাচন করা যাবে)' : 'Select Subjects (Multiple allowed)'}
                  <span className="text-[11px] text-emerald-700 font-normal ml-1.5">
                    ({selectedSubjects.length} {language === 'bn' ? 'টি নির্বাচিত' : 'selected'})
                  </span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  {PRESET_SUBJECTS.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubject(sub)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs font-bold'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-emerald-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-900 block mb-1">
                  {language === 'bn' ? 'কী পড়েছেন (টপিক)' : 'Topic studied'}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: সার্ভেয়িং লেভেলিং ম্যাথ' : 'e.g. Surveying Leveling math'}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-900 block mb-1">
                  {language === 'bn' ? 'মন্তব্য / নোট (ঐচ্ছিক)' : 'Notes (optional)'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={language === 'bn' ? 'গুরুত্বপূর্ণ সূত্র বা রিভিশন রিমাইন্ডার...' : 'Important formulas or reminders...'}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
