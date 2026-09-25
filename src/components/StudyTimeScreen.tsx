import React, { useState, useEffect } from 'react';
import { StudySession } from '../types';
import {
  getStudySessions,
  saveStudySession,
  updateStudySession,
  deleteStudySession,
  clearAllStudySessions,
  resetSampleStudySessions,
  calculateStudyDurationMinutes,
  formatDuration,
  extractSessionSubjects,
  calculateSubjectWiseStudyTime,
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
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertTriangle,
  RefreshCw,
  Check,
  ListTodo,
  Pencil,
  X,
  Layers,
  Tag,
  Hourglass,
  FileText,
} from 'lucide-react';
import { auth, saveStudySessionToCloud, deleteStudySessionFromCloud } from '../firebase';

interface StudyTimeScreenProps {
  language: Language;
  userId?: string;
  onNavigateHome?: () => void;
  onNavigateGraph?: () => void;
  onNavigateTasks?: () => void;
}

export const PRESET_SUBJECTS = [
  { id: 'civil', nameBn: 'সিভিল ইঞ্জিনিয়ারিং', nameEn: 'Civil Engineering', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'math', nameBn: 'গণিত (Mathematics)', nameEn: 'Mathematics', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: 'physics', nameBn: 'পদার্থবিজ্ঞান (Physics)', nameEn: 'Physics', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { id: 'chemistry', nameBn: 'রসায়ন (Chemistry)', nameEn: 'Chemistry', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'english', nameBn: 'ইংরেজি (English)', nameEn: 'English', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'handwriting', nameBn: 'হ্যান্ডরাইটিং প্র্যাকটিস (Handwriting Practice)', nameEn: 'Handwriting Practice', color: 'bg-rose-100 text-rose-900 border-rose-300' },
  { id: 'other', nameBn: 'অন্যান্য / সাধারণ প্রস্তুতি', nameEn: 'General / Other', color: 'bg-stone-100 text-stone-900 border-stone-300' },
];

export const StudyTimeScreen: React.FC<StudyTimeScreenProps> = ({
  language,
  userId,
  onNavigateHome,
  onNavigateGraph,
  onNavigateTasks,
}) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Tab: 'daily' | 'all_history' | 'timer'
  const [activeTab, setActiveTab] = useState<'daily' | 'all_history' | 'timer'>('daily');

  // Form State (Multi-subject support)
  const [sessionDate, setSessionDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>('06:00');
  const [endTime, setEndTime] = useState<string>('09:00');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['সিভিল ইঞ্জিনিয়ারিং']);
  const [customSubjectInput, setCustomSubjectInput] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [isAddingOpen, setIsAddingOpen] = useState<boolean>(false);

  // Live Timer State (Multi-subject support)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerSubjects, setTimerSubjects] = useState<string[]>(['সিভিল ইঞ্জিনিয়ারিং']);
  const [timerTopic, setTimerTopic] = useState<string>('');
  const [timerStartTimeStr, setTimerStartTimeStr] = useState<string>('');

  // History Edit Modal State
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editStartTime, setEditStartTime] = useState<string>('06:00');
  const [editEndTime, setEditEndTime] = useState<string>('09:00');
  const [editSubjects, setEditSubjects] = useState<string[]>(['সিভিল ইঞ্জিনিয়ারিং']);
  const [editCustomSubject, setEditCustomSubject] = useState<string>('');
  const [editTopic, setEditTopic] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

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

  const toggleFormSubject = (subName: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subName)) {
        if (prev.length <= 1) return prev; // keep at least one subject
        return prev.filter((s) => s !== subName);
      }
      return [...prev, subName];
    });
  };

  const handleAddCustomFormSubject = () => {
    const trimmed = customSubjectInput.trim();
    if (!trimmed) return;
    if (!selectedSubjects.includes(trimmed)) {
      setSelectedSubjects((prev) => [...prev, trimmed]);
    }
    setCustomSubjectInput('');
  };

  const toggleTimerSubject = (subName: string) => {
    setTimerSubjects((prev) => {
      if (prev.includes(subName)) {
        if (prev.length <= 1) return prev;
        return prev.filter((s) => s !== subName);
      }
      return [...prev, subName];
    });
  };

  const toggleEditSubject = (subName: string) => {
    setEditSubjects((prev) => {
      if (prev.includes(subName)) {
        if (prev.length <= 1) return prev;
        return prev.filter((s) => s !== subName);
      }
      return [...prev, subName];
    });
  };

  const handleAddCustomEditSubject = () => {
    const trimmed = editCustomSubject.trim();
    if (!trimmed) return;
    if (!editSubjects.includes(trimmed)) {
      setEditSubjects((prev) => [...prev, trimmed]);
    }
    setEditCustomSubject('');
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

    const finalSubjects = selectedSubjects.length > 0 ? selectedSubjects : ['সিভিল ইঞ্জিনিয়ারিং'];

    const newSession: StudySession = {
      id: `study-${Date.now()}`,
      userId: userId || auth.currentUser?.uid,
      date: sessionDate,
      startTime,
      endTime,
      durationMinutes: duration,
      subject: finalSubjects.join(', '),
      subjects: finalSubjects,
      topic: topic.trim(),
      notes: notes.trim() || undefined,
      createdAt: Date.now(),
    };

    saveStudySession(newSession);
    const activeUid = userId || auth.currentUser?.uid;
    if (activeUid) {
      saveStudySessionToCloud(activeUid, newSession);
    }
    loadSessions();

    // Reset topic & notes
    setTopic('');
    setNotes('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 2500);

    // If added for a different date, switch view to that date
    setSelectedDate(sessionDate);
  };

  const handleOpenEdit = (session: StudySession) => {
    setEditingSession(session);
    setEditDate(session.date);
    setEditStartTime(session.startTime);
    setEditEndTime(session.endTime);
    const subs = extractSessionSubjects(session);
    setEditSubjects(subs.length > 0 ? subs : ['সিভিল ইঞ্জিনিয়ারিং']);
    setEditTopic(session.topic);
    setEditNotes(session.notes || '');
    setEditCustomSubject('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    if (!editTopic.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে কী পড়েছেন তা লিখুন (টপিক / অধ্যায়)।' : 'Please enter what you studied.');
      return;
    }
    if (editSubjects.length === 0) {
      alert(language === 'bn' ? 'কমপক্ষে একটি বিষয় নির্বাচন করুন।' : 'Please select at least one subject.');
      return;
    }

    const duration = calculateStudyDurationMinutes(editStartTime, editEndTime);
    if (duration <= 0) {
      alert(language === 'bn' ? 'শুরুর সময় এবং শেষের সময় সঠিক নয়।' : 'Invalid start or end time.');
      return;
    }

    const updatedSession: StudySession = {
      ...editingSession,
      date: editDate,
      startTime: editStartTime,
      endTime: editEndTime,
      durationMinutes: duration,
      subject: editSubjects.join(', '),
      subjects: editSubjects,
      topic: editTopic.trim(),
      notes: editNotes.trim() || undefined,
      updatedAt: Date.now(),
    };

    updateStudySession(updatedSession);
    const activeUid = userId || auth.currentUser?.uid;
    if (activeUid) {
      saveStudySessionToCloud(activeUid, updatedSession);
    }
    loadSessions();
    setIsEditModalOpen(false);
    setEditingSession(null);
    setActionNotice(language === 'bn' ? 'পড়ার হিস্ট্রি সফলভাবে আপডেট করা হয়েছে!' : 'Study history updated successfully!');
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleDelete = (id: string) => {
    const confirmMsg = language === 'bn'
      ? 'আপনি কি এই পড়ার সেশনটি মুছে ফেলতে চান?'
      : 'Are you sure you want to delete this study session?';
    if (window.confirm(confirmMsg)) {
      deleteStudySession(id);
      const activeUid = userId || auth.currentUser?.uid;
      if (activeUid) {
        deleteStudySessionFromCloud(activeUid, id);
      }
      loadSessions();
    }
  };

  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string>('');

  const handleClearAllHistory = () => {
    clearAllStudySessions();
    loadSessions();
    setShowDeleteAllConfirm(false);
    setActionNotice(language === 'bn' ? 'স্টাডি হিস্ট্রি সফলভাবে মুছে ফেলা হয়েছে।' : 'Study history cleared successfully.');
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleResetSampleData = () => {
    const samples = resetSampleStudySessions();
    setSessions(samples);
    setShowDeleteAllConfirm(false);
    setActionNotice(language === 'bn' ? 'নমুনা টেস্ট স্টাডি ডাটা পুনরায় লোড করা হয়েছে।' : 'Sample test study data loaded.');
    setTimeout(() => setActionNotice(''), 3000);
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
    const finalSubjects = timerSubjects.length > 0 ? timerSubjects : ['সিভিল ইঞ্জিনিয়ারিং'];

    const newSession: StudySession = {
      id: `study-${Date.now()}`,
      userId: userId || auth.currentUser?.uid,
      date: todayStr,
      startTime: timerStartTimeStr || endTimeStr,
      endTime: endTimeStr,
      durationMinutes: durationMins,
      subject: finalSubjects.join(', '),
      subjects: finalSubjects,
      topic: timerTopic.trim() || (language === 'bn' ? 'লাইভ টাইমার সেশন' : 'Live Timer Session'),
      createdAt: Date.now(),
    };

    saveStudySession(newSession);
    const activeUid = userId || auth.currentUser?.uid;
    if (activeUid) {
      saveStudySessionToCloud(activeUid, newSession);
    }
    loadSessions();
    handleResetTimer();
    setTimerTopic('');
    setSelectedDate(todayStr);
    setActiveTab('daily');
    setActionNotice(language === 'bn' ? 'পড়ার সময় সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Study session saved successfully!');
    setTimeout(() => setActionNotice(''), 3000);
  };

  // Calculations for Selected Date
  const selectedDateSessions = sessions.filter((s) => s.date === selectedDate);
  const selectedDateTotalMinutes = selectedDateSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Subject-wise Study Time calculations (divides session duration equally among multiple subjects)
  const selectedDateSubjectStats = calculateSubjectWiseStudyTime(
    selectedDateSessions,
    language === 'bn' ? 'অন্যান্য' : 'Other'
  );

  const allHistorySubjectStats = calculateSubjectWiseStudyTime(
    sessions,
    language === 'bn' ? 'অন্যান্য' : 'Other'
  );

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

  // Render polished modern card for a study session
  const renderPolishedSessionCard = (session: StudySession, idx: number) => {
    const subs = extractSessionSubjects(session);
    const perSubMins = Math.round((session.durationMinutes || 0) / (subs.length || 1));

    return (
      <div
        key={session.id ? `${session.id}-${idx}` : `sess-${idx}`}
        className="p-3.5 sm:p-4 rounded-2xl border border-emerald-100 bg-white hover:border-emerald-300/80 shadow-2xs hover:shadow-xs transition-all space-y-2.5"
      >
        {/* Top Bar: Time, Duration & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-200/90 text-xs font-mono font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{session.startTime} - {session.endTime}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-2xs font-sans">
              <Hourglass className="w-3 h-3 text-emerald-100" />
              <span>{formatDuration(session.durationMinutes, language)}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenEdit(session)}
              className="px-2.5 py-1 text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold border border-emerald-200 shadow-2xs"
              title={language === 'bn' ? 'পড়ার হিস্ট্রি এডিট করুন' : 'Edit study session'}
              aria-label="Edit session"
            >
              <Pencil className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDelete(session.id)}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
              title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
              aria-label="Delete session"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Topic Title */}
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-100/60 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-emerald-950 leading-snug">
            {session.topic}
          </h4>
        </div>

        {/* Subject Badges with Equal Time Distribution */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {subs.map((subName, sIdx) => {
            const preset = PRESET_SUBJECTS.find((p) => p.nameBn === subName || p.nameEn === subName);
            const colorClass = preset?.color || 'bg-emerald-50 text-emerald-900 border-emerald-200';
            return (
              <span
                key={sIdx}
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${colorClass} shadow-2xs`}
              >
                <Tag className="w-3 h-3 text-emerald-700 opacity-80" />
                <span>{subName}</span>
                {subs.length > 1 && (
                  <span className="text-emerald-800 font-mono font-semibold text-[11px] ml-0.5">
                    ({formatDuration(perSubMins, language)})
                  </span>
                )}
              </span>
            );
          })}
          {subs.length > 1 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{language === 'bn' ? `${subs.length} বিষয়ে সমান বণ্টন` : `Split equally (${subs.length} subjects)`}</span>
            </span>
          )}
        </div>

        {/* Optional Notes */}
        {session.notes && (
          <div className="text-xs text-stone-700 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/70 flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950 mr-1">{language === 'bn' ? 'নোট:' : 'Note:'}</span>
              <span>{session.notes}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

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
              <span>{language === 'bn' ? 'স্টাডি টাইম' : 'Study Time'}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {language === 'bn' ? 'হিস্ট্রি' : 'History'}
              </span>
            </h1>
            <p className="text-xs text-emerald-700/80">
              {language === 'bn'
                ? 'কখন থেকে কখন পড়লেন, কী পড়লেন তা দিনভিত্তিক ক্যালেন্ডারে সংরক্ষণ করুন'
                : 'Log daily study periods, topics, and track your admission study routine'}
            </p>
          </div>
        </div>

        {/* Quick Action & Tabs */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto justify-between sm:justify-start flex-wrap">
          {onNavigateTasks && (
            <button
              type="button"
              onClick={onNavigateTasks}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200/80 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              title={language === 'bn' ? 'টাস্ক প্ল্যানারে যান' : 'Go to Task Planner'}
            >
              <ListTodo className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'bn' ? 'টাস্ক প্ল্যানার' : 'Task Planner'}</span>
            </button>
          )}

          {onNavigateGraph && (
            <button
              type="button"
              onClick={onNavigateGraph}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              title={language === 'bn' ? 'আলাদা পেজে স্টাডি গ্রাফ দেখুন' : 'View Study Graph'}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'স্টাডি গ্রাফ' : 'Study Graph'}</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-emerald-50/70 p-1 rounded-xl border border-emerald-100 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'daily' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-100/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'দৈনিক লগ' : 'Daily'}</span>
            </button>
            <button
              onClick={() => setActiveTab('all_history')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all_history' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-100/60'
              }`}
            >
              {language === 'bn' ? 'হিস্ট্রি' : 'History'} ({sessions.length})
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

        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-2xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-emerald-700/80 block">
                {language === 'bn' ? 'সর্বমোট স্টাডি টাইম' : 'Total Study Time'}
              </span>
              <span className="text-base sm:text-lg font-bold text-emerald-950">
                {formatDuration(totalAllMinutes, language)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowDeleteAllConfirm(true)}
              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1"
              title={language === 'bn' ? 'স্টাডি হিস্ট্রি ডিলিট করুন' : 'Delete study history'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'হিস্ট্রি মুছুন' : 'Delete'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice('')}
            className="text-emerald-800 hover:text-emerald-950 text-xs font-bold underline"
          >
            {language === 'bn' ? 'ঠিক আছে' : 'OK'}
          </button>
        </div>
      )}

      {/* Delete All Confirmation Dialog / Banner */}
      {showDeleteAllConfirm && (
        <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 shadow-sm animate-in fade-in zoom-in-95 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-950">
                {language === 'bn' ? 'সর্বমোট স্টাডি টাইম হিস্ট্রি মুছবেন?' : 'Delete All Study History?'}
              </h4>
              <p className="text-xs text-rose-800/80 mt-0.5 leading-relaxed">
                {language === 'bn'
                  ? 'এটি আপনার রেকর্ডকৃত সমস্ত স্টাডি সেশন হিস্ট্রি পরিষ্কার করে ফেলবে। আপনি টেস্ট করার জন্য এখনই হিস্ট্রি মুছে ফেলতে পারেন এবং প্রয়োজনে পুনরায় নমুনা ডাটা যোগ করতে পারবেন।'
                  : 'This will erase all recorded study sessions from your total study time. You can clear now for testing and re-add sample test data anytime.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-rose-200/70">
            <button
              type="button"
              onClick={() => setShowDeleteAllConfirm(false)}
              className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-800 hover:bg-rose-100/50 text-xs font-bold transition-colors"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleResetSampleData}
              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নমুনা ডাটা দিয়ে টেস্ট করুন' : 'Test with Sample Data'}</span>
            </button>
            <button
              type="button"
              onClick={handleClearAllHistory}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'হ্যাঁ, সম্পূর্ণ হিস্ট্রি মুছুন' : 'Yes, Delete All History'}</span>
            </button>
          </div>
        </div>
      )}

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

            {/* Row 2: Multi-Subject Selector with Handwriting Practice */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? 'বিষয়সমূহ নির্বাচন করুন (একাধিক সিলেক্ট করা যাবে)' : 'Select Subjects (Multiple allowed)'}</span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {selectedSubjects.length} {language === 'bn' ? 'টি বিষয় নির্বাচিত' : 'selected'}
                  </span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSubjects(PRESET_SUBJECTS.map((p) => p.nameBn))}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline"
                  >
                    {language === 'bn' ? 'সবগুলো সিলেক্ট' : 'Select All'}
                  </button>
                  <span className="text-emerald-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSubjects(['সিভিল ইঞ্জিনিয়ারিং'])}
                    className="text-[11px] text-stone-500 hover:text-stone-800 font-semibold underline"
                  >
                    {language === 'bn' ? 'রিসেট' : 'Reset'}
                  </button>
                </div>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-emerald-50/40 rounded-xl border border-emerald-200/90">
                {PRESET_SUBJECTS.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub.nameBn);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleFormSubject(sub.nameBn)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs scale-[1.02]'
                          : 'bg-white text-emerald-950 border-emerald-200 hover:bg-emerald-100/60'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-white text-emerald-700 font-black' : 'border border-emerald-300'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </span>
                      <span>{language === 'bn' ? sub.nameBn : sub.nameEn}</span>
                    </button>
                  );
                })}

                {/* Any custom subjects added by user */}
                {selectedSubjects
                  .filter((s) => !PRESET_SUBJECTS.some((p) => p.nameBn === s))
                  .map((customSub, idx) => (
                    <button
                      key={`custom-${idx}`}
                      type="button"
                      onClick={() => toggleFormSubject(customSub)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border bg-emerald-700 text-white border-emerald-800 shadow-xs"
                    >
                      <span>✓ {customSub}</span>
                      <X className="w-3 h-3 text-emerald-200 hover:text-white" />
                    </button>
                  ))}
              </div>

              {/* Optional Custom Subject Adder */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="text"
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomFormSubject();
                    }
                  }}
                  placeholder={
                    language === 'bn'
                      ? 'অন্য কোনো বিষয় যোগ করতে এখানে লিখুন...'
                      : 'Type custom subject name and click Add...'
                  }
                  className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomFormSubject}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors"
                >
                  {language === 'bn' ? '+ বিষয় যোগ' : '+ Add Subject'}
                </button>
              </div>
            </div>

            {/* Row 3: What Was Studied (Topic) */}
            <div>
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

            <div className="space-y-2 text-left pt-2">
              <div>
                <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                  {language === 'bn' ? 'বিষয়সমূহ নির্বাচন (একাধিক সিলেক্ট করা যাবে):' : 'Select Subjects (Multiple allowed):'}
                  <span className="text-[10px] text-emerald-700 font-semibold ml-1.5">
                    ({timerSubjects.length} {language === 'bn' ? 'টি নির্বাচিত' : 'selected'})
                  </span>
                </label>
                <div className="flex flex-wrap gap-1 p-2 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  {PRESET_SUBJECTS.map((sub) => {
                    const isSelected = timerSubjects.includes(sub.nameBn);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleTimerSubject(sub.nameBn)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs font-bold'
                            : 'bg-white text-emerald-950 border-emerald-200 hover:bg-emerald-100/50'
                        }`}
                      >
                        <span>{isSelected ? '✓ ' : ''}{sub.nameBn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                  {language === 'bn' ? 'টপিক বা কী পড়ছেন:' : 'Topic or what you are studying:'}
                </label>
                <input
                  type="text"
                  value={timerTopic}
                  onChange={(e) => setTimerTopic(e.target.value)}
                  placeholder={language === 'bn' ? 'কী পড়ছেন? (যেমন: সার্ভেয়িং ম্যাথ বা হাতের লেখা)' : 'What are you studying?'}
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

      {/* 5. Dedicated Study Graph Banner & DAILY VIEW (Selected Date Logs) */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {onNavigateGraph && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200/80 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <span>{language === 'bn' ? 'স্টাডি গ্রাফ ও অ্যানালিটিক্স' : 'Study Graph & Analytics'}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                      {language === 'bn' ? 'আলাদা পেজ' : 'Separate Page'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-700/80 mt-0.5">
                    {language === 'bn'
                      ? 'পড়া শুরুর ১ম দিন থেকে আজকের পড়াশোনার লাইন গ্রাফ ও বার চার্ট আলাদা পেজে দেখুন'
                      : 'View full animated study curve and progression timeline from Day 1 on a dedicated page'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onNavigateGraph}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs self-stretch sm:self-auto"
              >
                <BarChart3 className="w-4 h-4" />
                <span>{language === 'bn' ? 'স্টাডি গ্রাফ দেখুন' : 'View Study Graph'}</span>
              </button>
            </div>
          )}

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
            <div className="space-y-4">
              {/* Daily Subject Distribution Card */}
              {selectedDateSubjectStats.entries.length > 0 && (
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-100/70">
                    <h3 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'bn' ? 'এই দিনের বিষয়ভিত্তিক স্টাডি টাইম বণ্টন' : 'Subject-wise Study Time for this Date'}</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-semibold">
                        {language === 'bn' ? 'সমান ভাগে বণ্টন' : 'Equally divided'}
                      </span>
                      <span className="text-xs text-emerald-900 font-mono font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        {formatDuration(selectedDateSubjectStats.totalAllMinutes, language)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {selectedDateSubjectStats.entries.map((item, idx) => {
                      const percent = item.percentage;
                      return (
                        <div key={item.subject} className="space-y-1.5 p-2 rounded-xl hover:bg-emerald-50/30 transition-colors">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center font-mono border border-emerald-200">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-emerald-950">{item.subject}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-emerald-900 font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                                {formatDuration(item.minutes, language)}
                              </span>
                              <span className="text-[11px] text-emerald-700 font-mono font-bold">({percent}%)</span>
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full h-2 rounded-full bg-emerald-50 overflow-hidden border border-emerald-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sessions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'bn' ? 'পড়ার সেশন হিস্ট্রি' : 'Study Sessions Log'}</span>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      ({selectedDateSessions.length})
                    </span>
                  </h3>
                </div>

                {selectedDateSessions.map((item, idx) => renderPolishedSessionCard(item, idx))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* 6. ALL HISTORY TAB (Grouped by Date) */}
      {activeTab === 'all_history' && (
        <div className="space-y-4">
          {/* History Management Action Bar */}
          <div className="bg-white rounded-2xl border border-emerald-100 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-950">
                {language === 'bn' ? 'মোট সংরক্ষিত সেশন:' : 'Total Logged Sessions:'}
              </span>
              <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                {sessions.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetSampleData}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                title={language === 'bn' ? 'টেস্ট করার জন্য ডেমো ডাটা লোড করুন' : 'Load sample test data'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'নমুনা ডাটা লোড' : 'Load Sample Data'}</span>
              </button>

              {sessions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowDeleteAllConfirm(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                  title={language === 'bn' ? 'সব হিস্ট্রি মুছে ফেলুন' : 'Clear all history'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সম্পূর্ণ হিস্ট্রি মুছুন' : 'Clear All'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Overall Subject-wise Distribution Summary */}
          {allHistorySubjectStats.entries.length > 0 && (
            <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-100/70">
                <h3 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'bn' ? 'সর্বমোট বিষয়ভিত্তিক পড়ার সময়' : 'Overall Subject-wise Study Time'}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-semibold">
                    {language === 'bn' ? 'সেশন সময় সমান ভাগে বণ্টন' : 'Equally split'}
                  </span>
                  <span className="text-xs text-emerald-900 font-mono font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {formatDuration(allHistorySubjectStats.totalAllMinutes, language)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {allHistorySubjectStats.entries.map((item, idx) => (
                  <div key={item.subject} className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/20 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center font-mono border border-emerald-200">
                          {idx + 1}
                        </span>
                        <span>{item.subject}</span>
                      </span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-emerald-900">{formatDuration(item.minutes, language)}</span>
                        <span className="text-[11px] text-emerald-700 font-bold">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-emerald-100/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allDates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-emerald-100 p-8 text-center space-y-3">
              <Clock className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-950">
                {language === 'bn' ? 'কোনো স্টাডি হিস্ট্রি পাওয়া যায়নি' : 'No study history available'}
              </h3>
              <p className="text-xs text-emerald-700/80 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'আপনি সম্পূর্ণ হিস্ট্রি মুছে ফেলেছেন। টেস্ট করার জন্য নিচে ক্লিক করে নমুনা ডাটা লোড করতে পারেন অথবা নতুন পড়ার সময় যোগ করতে পারেন।'
                  : 'You have cleared all study history. Click below to load sample test data or log a new study session.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSampleData}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'টেস্টের জন্য নমুনা ডাটা যোগ করুন' : 'Add Test Sample Data'}</span>
                </button>
              </div>
            </div>
          ) : (
            allDates.map((dateStr) => {
              const daySessions = sessionsByDate[dateStr] || [];
              const dayTotalMins = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

              return (
                <div
                  key={dateStr}
                  className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-2xs space-y-0"
                >
                  {/* Date Header Banner */}
                  <div className="p-3.5 sm:p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs sm:text-sm font-bold text-emerald-950">
                        {formatDateDisplay(dateStr)}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                        {daySessions.length} {language === 'bn' ? 'টি সেশন' : 'sessions'}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-800 font-mono bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                      {language === 'bn' ? 'মোট: ' : 'Total: '}
                      {formatDuration(dayTotalMins, language)}
                    </span>
                  </div>

                  {/* Day Sessions List */}
                  <div className="p-3 sm:p-4 space-y-3 bg-stone-50/30">
                    {daySessions.map((session, sIdx) => renderPolishedSessionCard(session, sIdx))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 7. EDIT STUDY SESSION MODAL */}
      {isEditModalOpen && editingSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-emerald-200 overflow-hidden my-auto animate-in zoom-in-95">
            {/* Header */}
            <div className="p-4 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    {language === 'bn' ? 'পড়ার হিস্ট্রি এডিট করুন' : 'Edit Study Session'}
                  </h3>
                  <p className="text-[11px] text-emerald-700/80">
                    {formatDateDisplay(editDate)} • {editStartTime} - {editEndTime}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingSession(null);
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Date, Start Time, End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'bn' ? 'তারিখ' : 'Date'}</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'bn' ? 'শুরুর সময়' : 'Start'}</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'bn' ? 'শেষের সময়' : 'End'}</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* Duration Preview */}
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900">
                  {language === 'bn' ? 'সংশোধিত মোট পড়ার সময়:' : 'Calculated Duration:'}
                </span>
                <span className="font-bold text-emerald-950 font-mono">
                  {formatDuration(calculateStudyDurationMinutes(editStartTime, editEndTime), language)}
                </span>
              </div>

              {/* Multi-Subject selection with Handwriting Practice */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-emerald-950 flex items-center justify-between">
                  <span>{language === 'bn' ? 'বিষয়সমূহ নির্বাচন (একাধিক হতে পারে):' : 'Subjects (Multiple allowed):'}</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    ({editSubjects.length} {language === 'bn' ? 'টি নির্বাচিত' : 'selected'})
                  </span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-emerald-50/40 rounded-xl border border-emerald-200">
                  {PRESET_SUBJECTS.map((sub) => {
                    const isSelected = editSubjects.includes(sub.nameBn);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleEditSubject(sub.nameBn)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-white text-emerald-950 border-emerald-200 hover:bg-emerald-100/60'
                        }`}
                      >
                        <span>{isSelected ? '✓ ' : ''}{language === 'bn' ? sub.nameBn : sub.nameEn}</span>
                      </button>
                    );
                  })}

                  {editSubjects
                    .filter((s) => !PRESET_SUBJECTS.some((p) => p.nameBn === s))
                    .map((customSub, idx) => (
                      <button
                        key={`custom-edit-${idx}`}
                        type="button"
                        onClick={() => toggleEditSubject(customSub)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold border bg-emerald-700 text-white border-emerald-800 shadow-2xs flex items-center gap-1"
                      >
                        <span>✓ {customSub}</span>
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                </div>

                {/* Add custom subject in edit mode */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={editCustomSubject}
                    onChange={(e) => setEditCustomSubject(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomEditSubject();
                      }
                    }}
                    placeholder={language === 'bn' ? 'অন্য কোনো বিষয় যোগ করতে লিখুন...' : 'Add other subject...'}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs text-emerald-950 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomEditSubject}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors"
                  >
                    {language === 'bn' ? '+ যোগ' : '+ Add'}
                  </button>
                </div>
              </div>

              {/* Topic / What was studied */}
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  {language === 'bn' ? 'কী পড়লেন? (টপিক / অধ্যায়)' : 'Topic / What did you study?'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  {language === 'bn' ? 'মন্তব্য বা নোট (ঐচ্ছিক)' : 'Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-emerald-100">
                <button
                  type="button"
                  onClick={() => {
                    if (editingSession) {
                      handleDelete(editingSession.id);
                      setIsEditModalOpen(false);
                      setEditingSession(null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingSession(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-colors"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
