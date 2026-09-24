import React, { useState, useEffect } from 'react';
import { UpcomingSchedule, ScheduleType } from '../types';
import {
  getUpcomingSchedules,
  saveUpcomingSchedule,
  deleteUpcomingSchedule,
  purgeExpiredSchedules,
  calculateScheduleCountdown,
  SCHEDULE_AUTO_DELETE_WINDOW_MS,
} from '../utils/storage';
import { Language } from '../utils/i18n';
import {
  CalendarClock,
  Plus,
  Trash2,
  Clock,
  Calendar,
  BookOpen,
  Award,
  ChevronLeft,
  Info,
  CheckCircle2,
  AlertCircle,
  Radio,
  Sparkles,
  MapPin,
  ExternalLink,
  Edit2,
  Filter,
  Check,
} from 'lucide-react';

const STANDARD_SUBJECTS = ['সিভিল ইঞ্জিনিয়ারিং', 'গণিত', 'পদার্থবিজ্ঞান', 'রসায়ন', 'ইংরেজি'];

interface ScheduleScreenProps {
  language: Language;
  onBack: () => void;
  userId?: string;
  onSaveScheduleToCloud?: (schedule: UpcomingSchedule) => Promise<void>;
  onDeleteScheduleFromCloud?: (id: string) => Promise<void>;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  language,
  onBack,
  userId,
  onSaveScheduleToCloud,
  onDeleteScheduleFromCloud,
}) => {
  const [schedules, setSchedules] = useState<UpcomingSchedule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [filterType, setFilterType] = useState<'all' | 'class' | 'exam'>('all');

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<ScheduleType>('class');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['সিভিল ইঞ্জিনিয়ারিং']);
  const [customSubject, setCustomSubject] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>('10:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [locationOrLink, setLocationOrLink] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Bengali digits converter
  const toBn = (num: number | string): string => {
    if (language !== 'bn') return String(num);
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
  };

  const padZero = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

  // Subject toggling and presets for multiple subjects
  const toggleSubject = (subj: string) => {
    if (selectedSubjects.includes(subj)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== subj));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const selectAllNonDept = () => {
    setSelectedSubjects(['গণিত', 'পদার্থবিজ্ঞান', 'রসায়ন', 'ইংরেজি']);
  };

  const selectAllSubjects = () => {
    setSelectedSubjects([...STANDARD_SUBJECTS]);
  };

  const selectCivilOnly = () => {
    setSelectedSubjects(['সিভিল ইঞ্জিনিয়ারিং']);
  };

  // Load and refresh
  const loadSchedules = () => {
    const purgedIds = purgeExpiredSchedules();
    if (purgedIds.length > 0 && onDeleteScheduleFromCloud) {
      purgedIds.forEach((id) => onDeleteScheduleFromCloud(id).catch(() => {}));
    }
    const list = getUpcomingSchedules();
    setSchedules(list);
  };

  useEffect(() => {
    loadSchedules();

    // 1-sec ticker for real-time countdown
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format 12h time
  const formatTime12h = (timeStr: string) => {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    if (isNaN(h)) return timeStr;
    const isPm = h >= 12;
    h = h % 12 || 12;
    const suffix = language === 'bn' ? (isPm ? 'দুপুর/সন্ধ্যা' : 'সকাল') : isPm ? 'PM' : 'AM';
    return `${toBn(h)}:${toBn(m)} ${suffix}`;
  };

  // Open Form for Adding New
  const handleOpenNewForm = () => {
    setEditingId(null);
    setType('class');
    setSelectedSubjects(['সিভিল ইঞ্জিনিয়ারিং']);
    setCustomSubject('');
    setTopic('');
    setDate(new Date().toISOString().slice(0, 10));
    setTime('10:00');
    setDurationMinutes(60);
    setLocationOrLink('');
    setNotes('');
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleEditSchedule = (item: UpcomingSchedule) => {
    setEditingId(item.id);
    setType(item.type);

    // Extract subjects list from item.subjects or comma-separated item.subject
    let rawSubjects: string[] = [];
    if (item.subjects && item.subjects.length > 0) {
      rawSubjects = item.subjects;
    } else if (item.subject) {
      rawSubjects = item.subject.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const standardFound = rawSubjects.filter((s) => STANDARD_SUBJECTS.includes(s));
    const customFound = rawSubjects.filter((s) => !STANDARD_SUBJECTS.includes(s));

    if (customFound.length > 0) {
      setSelectedSubjects([...standardFound, 'অন্যান্য']);
      setCustomSubject(customFound.join(', '));
    } else {
      setSelectedSubjects(standardFound.length > 0 ? standardFound : ['সিভিল ইঞ্জিনিয়ারিং']);
      setCustomSubject('');
    }

    setTopic(item.topic);
    setDate(item.date);
    setTime(item.time);
    setDurationMinutes(item.durationMinutes || 60);
    setLocationOrLink(item.locationOrLink || '');
    setNotes(item.notes || '');
    setFormError('');
    setIsFormOpen(true);
  };

  // Save Schedule Handler
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Resolve all selected subjects including custom
    const finalSubjects = selectedSubjects
      .map((s) => (s === 'অন্যান্য' ? customSubject.trim() : s))
      .filter(Boolean);

    if (finalSubjects.length === 0) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে অন্তত একটি বিষয় নির্বাচন করুন' : 'Please select at least one subject');
      return;
    }

    const resolvedSubject = finalSubjects.join(', ');

    if (!topic.trim()) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে টপিক বা অধ্যায় লিখুন' : 'Please enter a topic or chapter');
      return;
    }

    if (!date || !time) {
      setFormError(language === 'bn' ? 'তারিখ এবং সময় নির্বাচন করুন' : 'Please select date and time');
      return;
    }

    // Calculate epoch timestamp from date and time
    // Parse Date & Time locally
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const scheduleDateObj = new Date(year, month - 1, day, hours, minutes, 0, 0);
    const scheduledAt = scheduleDateObj.getTime();

    if (isNaN(scheduledAt)) {
      setFormError(language === 'bn' ? 'সঠিক তারিখ ও সময় নির্বাচন করুন' : 'Invalid date or time');
      return;
    }

    const scheduleId = editingId || `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const newSchedule: UpcomingSchedule = {
      id: scheduleId,
      userId: userId || undefined,
      type,
      subject: resolvedSubject,
      subjects: finalSubjects,
      topic: topic.trim(),
      date,
      time,
      scheduledAt,
      durationMinutes: Number(durationMinutes) || 60,
      locationOrLink: locationOrLink.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: editingId ? (schedules.find((s) => s.id === editingId)?.createdAt || Date.now()) : Date.now(),
    };

    // Save to local storage
    saveUpcomingSchedule(newSchedule);

    // Save to cloud Firestore if user is authenticated
    if (userId && onSaveScheduleToCloud) {
      try {
        await onSaveScheduleToCloud(newSchedule);
      } catch (err) {
        console.warn('Failed to sync schedule to cloud:', err);
      }
    }

    loadSchedules();
    setIsFormOpen(false);
  };

  // Delete Schedule Handler
  const handleDeleteSchedule = async (id: string) => {
    const confirmMsg = language === 'bn' ? 'আপনি কি নিশ্চিত যে এই সিডিউলটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this schedule?';
    if (!window.confirm(confirmMsg)) return;

    deleteUpcomingSchedule(id);

    if (userId && onDeleteScheduleFromCloud) {
      try {
        await onDeleteScheduleFromCloud(id);
      } catch (err) {
        console.warn('Failed to delete schedule from cloud:', err);
      }
    }

    loadSchedules();
  };

  // Filtered schedules
  const filtered = schedules.filter((s) => {
    if (filterType === 'class') return s.type === 'class';
    if (filterType === 'exam') return s.type === 'exam';
    return true;
  });

  // Separate into Active/Upcoming vs Completed within last 24h
  const upcomingList = filtered.filter((s) => {
    const durationMs = (s.durationMinutes || 60) * 60 * 1000;
    return s.scheduledAt + durationMs > currentTime;
  });

  const completedList = filtered.filter((s) => {
    const durationMs = (s.durationMinutes || 60) * 60 * 1000;
    return s.scheduledAt + durationMs <= currentTime;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Top Navigation & Title */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-2 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
        </button>

        <button
          onClick={handleOpenNewForm}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন সিডিউল যোগ করুন' : 'Add New Schedule'}</span>
        </button>
      </div>

      {/* Main Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <CalendarClock className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-extrabold text-emerald-950">
                {language === 'bn' ? 'ক্লাস ও এক্সাম সিডিউল ম্যানেজার' : 'Class & Exam Schedule Planner'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {language === 'bn' ? 'হোমপেজ লাইভ টাইমার' : 'Live Home Timer'}
              </span>
            </div>
            <p className="text-xs text-emerald-700/80 mt-0.5 leading-relaxed">
              {language === 'bn'
                ? 'সিডিউল শেষ হলে পরবর্তী টাইমার চালু হবে। সমাপ্তির ২৪ ঘণ্টা পর হিস্টরি থেকে স্বয়ংক্রিয়ভাবে মুছে যাবে।'
                : 'Closest schedule runs on homepage timer. Auto-purged 24 hours after completion.'}
            </p>
          </div>
        </div>
      </div>

      {/* 24-hour Auto-Deletion Notification Pill */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs font-medium">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          {language === 'bn'
            ? '📌 নিয়ম: যেকোনো ক্লাস বা পরীক্ষা শেষ হওয়ার ঠিক ২৪ ঘণ্টা পর তা স্বয়ংক্রিয়ভাবে ডাটাবেস থেকে মুছে যাবে।'
            : '📌 Rule: Schedules are automatically deleted 24 hours after conclusion.'}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 bg-emerald-50/80 rounded-xl border border-emerald-200/80">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            {language === 'bn' ? `সব (${schedules.length})` : `All (${schedules.length})`}
          </button>
          <button
            onClick={() => setFilterType('class')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filterType === 'class'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ক্লাস' : 'Classes'}</span>
          </button>
          <button
            onClick={() => setFilterType('exam')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filterType === 'exam'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'পরীক্ষা' : 'Exams'}</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-semibold">
          {language === 'bn'
            ? `${toBn(upcomingList.length)} টি আসন্ন`
            : `${upcomingList.length} upcoming`}
        </span>
      </div>

      {/* Form Modal / Accordion */}
      {isFormOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-emerald-400 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <h3 className="text-sm sm:text-base font-extrabold text-emerald-950 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-emerald-600" />
              <span>
                {editingId
                  ? (language === 'bn' ? 'সিডিউল সম্পাদনা করুন' : 'Edit Schedule')
                  : (language === 'bn' ? 'নতুন ক্লাস বা পরীক্ষা সিডিউল করুন' : 'Add New Class or Exam')}
              </span>
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
          </div>

          {formError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSaveSchedule} className="space-y-3.5">
            {/* Type selector: Class vs Exam */}
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1.5">
                {language === 'bn' ? 'সিডিউলের ধরন:' : 'Schedule Type:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('class')}
                  className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    type === 'class'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50/60 text-emerald-900 border-emerald-200 hover:bg-emerald-100/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{language === 'bn' ? '📚 ক্লাস (Class)' : '📚 Class'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('exam')}
                  className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    type === 'exam'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-rose-50/60 text-rose-900 border-rose-200 hover:bg-rose-100/60'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>{language === 'bn' ? '📝 মডেল টেস্ট / এক্সাম (Exam)' : '📝 Exam / Test'}</span>
                </button>
              </div>
            </div>

            {/* Subject Selector - Supports Multiple Subject Selection for Classes and Exams */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-emerald-950">
                    {language === 'bn' ? 'বিষয় নির্বাচন (একাধিক সিলেক্ট করতে পারেন):' : 'Select Subjects (Multiple selection allowed):'}
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                    {language === 'bn' ? `${toBn(selectedSubjects.length)}টি বিষয়` : `${selectedSubjects.length} subjects`}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={selectCivilOnly}
                    className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                  >
                    সিভিল
                  </button>
                  <button
                    type="button"
                    onClick={selectAllNonDept}
                    className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                  >
                    নন-ডিপার্টমেন্ট সব
                  </button>
                  <button
                    type="button"
                    onClick={selectAllSubjects}
                    className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                  >
                    সব বিষয়
                  </button>
                </div>
              </div>

              {type === 'class' && (
                <p className="text-[11px] text-emerald-700/90 mb-2 font-medium">
                  {language === 'bn'
                    ? '💡 একই ক্লাসে একাধিক বিষয় থাকলে (যেমন: গণিত + পদার্থ বা সিভিল + রসায়ন) সবগুলো সিলেক্ট করে রাখুন।'
                    : '💡 If multiple subjects are covered in this class, tap to select all of them.'}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                {[...STANDARD_SUBJECTS, 'অন্যান্য'].map((subj) => {
                  const isSelected = selectedSubjects.includes(subj);
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => toggleSubject(subj)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs font-extrabold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/60 hover:border-emerald-300'
                      }`}
                    >
                      <span className="truncate">{subj}</span>
                      <span
                        className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 ml-1.5 border transition-colors ${
                          isSelected
                            ? 'bg-white text-emerald-700 border-transparent'
                            : 'bg-slate-100 text-transparent border-slate-300'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedSubjects.includes('অন্যান্য') && (
                <input
                  type="text"
                  placeholder={
                    language === 'bn'
                      ? 'কাস্টম বিষয়ের নাম লিখুন (একাধিক থাকলে কমা দিয়ে লিখুন)...'
                      : 'Custom subject name...'
                  }
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-xl focus:outline-emerald-600 bg-white"
                />
              )}
            </div>

            {/* Topic / Chapter */}
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                {language === 'bn' ? 'টপিক বা অধ্যায় (Topic / Details):' : 'Topic / Chapter:'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  type === 'class'
                    ? (language === 'bn' ? 'যেমন: সার্ভেয়িং চ্যাপ্টার ৩ - লেভেলিং' : 'e.g. Surveying Chapter 3 - Leveling')
                    : (language === 'bn' ? 'যেমন: ডুয়েট পূর্ণাঙ্গ মডেল টেস্ট - ১' : 'e.g. DUET Full Model Test 1')
                }
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-emerald-200 rounded-xl focus:outline-emerald-600 bg-white"
              />
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  <span>{language === 'bn' ? 'তারিখ:' : 'Date:'}</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-emerald-200 rounded-xl focus:outline-emerald-600 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>{language === 'bn' ? 'সময় (Time):' : 'Time:'}</span>
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-emerald-200 rounded-xl focus:outline-emerald-600 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'সময়কাল (মিনিট):' : 'Duration (Mins):'}
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-emerald-200 rounded-xl focus:outline-emerald-600 bg-white"
                >
                  <option value={30}>৩০ মিনিট</option>
                  <option value={45}>৪৫ মিনিট</option>
                  <option value={60}>১ ঘণ্টা (৬০ মিনিট)</option>
                  <option value={90}>১ ঘণ্টা ৩০ মিনিট</option>
                  <option value={120}>২ ঘণ্টা (১২০ মিনিট)</option>
                  <option value={180}>৩ ঘণ্টা (১৮০ মিনিট)</option>
                </select>
              </div>
            </div>

            {/* Location / Link & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'রুম / প্ল্যাটফর্ম (ঐচ্ছিক):' : 'Room / Link (Optional):'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: গুগল মিট, জুম বা কোচিং রুম ১০১' : 'Google Meet, Room 101, etc.'}
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-emerald-200 rounded-xl focus:outline-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  {language === 'bn' ? 'সংক্ষিপ্ত নোট (ঐচ্ছিক):' : 'Notes (Optional):'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: ক্যালকুলেটর ও স্কেল সাথে নিতে হবে' : 'Special remarks...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-emerald-200 rounded-xl focus:outline-emerald-600 bg-white"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-all cursor-pointer"
              >
                {editingId
                  ? (language === 'bn' ? 'আপডেট করুন' : 'Update Schedule')
                  : (language === 'bn' ? 'সিডিউল সংরক্ষণ করুন' : 'Save Schedule')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Section 1: Upcoming Active Schedules */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'bn' ? 'আসন্ন ও চলমান সিডিউল' : 'Upcoming & Live Schedules'}</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.2 rounded-full">
            {toBn(upcomingList.length)}
          </span>
        </h2>

        {upcomingList.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-2">
            <CalendarClock className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-emerald-950">
              {language === 'bn' ? 'বর্তমানে কোনো ক্লাস বা পরীক্ষা সিডিউল করা নেই' : 'No upcoming schedules found'}
            </p>
            <p className="text-xs text-emerald-700/80 max-w-sm mx-auto">
              {language === 'bn'
                ? 'উপরে "নতুন সিডিউল যোগ করুন" বাটনে চাপ দিয়ে আপনার ক্লাস বা পরীক্ষার সময় নির্ধারণ করুন।'
                : 'Click "Add New Schedule" to set up your upcoming study classes or mock tests.'}
            </p>
            <button
              onClick={handleOpenNewForm}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'সিডিউল যোগ করুন' : 'Schedule Now'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {upcomingList.map((schedule) => {
              const countdown = calculateScheduleCountdown(schedule, currentTime);
              const isExam = schedule.type === 'exam';

              return (
                <div
                  key={schedule.id}
                  className={`p-4 rounded-2xl bg-white border transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isExam ? 'border-rose-200' : 'border-emerald-200'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          isExam
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                        }`}
                      >
                        {isExam ? <Award className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                        <span>{isExam ? 'পরীক্ষা / এক্সাম' : 'ক্লাস'}</span>
                      </span>

                      {schedule.subjects && schedule.subjects.length > 1 ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          {schedule.subjects.map((sub, idx) => (
                            <span
                              key={idx}
                              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${
                                isExam
                                  ? 'bg-rose-50 text-rose-950 border-rose-200'
                                  : 'bg-emerald-50 text-emerald-950 border-emerald-200'
                              }`}
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs font-extrabold text-emerald-950">
                          {schedule.subject}
                        </span>
                      )}

                      {countdown.status === 'in_progress' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                          🔴 এখন চলছে
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 truncate">
                      {schedule.topic}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        <span>{schedule.date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{formatTime12h(schedule.time)} ({toBn(schedule.durationMinutes || 60)} মি.)</span>
                      </span>
                      {schedule.locationOrLink && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{schedule.locationOrLink}</span>
                        </span>
                      )}
                    </div>

                    {schedule.notes && (
                      <p className="text-[11px] text-slate-500 italic">
                        নোট: {schedule.notes}
                      </p>
                    )}
                  </div>

                  {/* Countdown Ticker Box & Edit/Delete Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Countdown indicator */}
                    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[120px]">
                      {countdown.status === 'upcoming' ? (
                        <>
                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                            {language === 'bn' ? 'বাকি সময়' : 'Remaining'}
                          </div>
                          <div className="text-xs font-mono font-black text-emerald-800">
                            {countdown.days > 0 && `${toBn(countdown.days)}দিন `}
                            {toBn(padZero(countdown.hours))}:{toBn(padZero(countdown.minutes))}:{toBn(padZero(countdown.seconds))}
                          </div>
                        </>
                      ) : countdown.status === 'in_progress' ? (
                        <>
                          <div className="text-[9px] font-bold text-rose-600 uppercase tracking-wider animate-pulse">
                            {language === 'bn' ? 'চলমান' : 'Live'}
                          </div>
                          <div className="text-xs font-mono font-black text-rose-700">
                            {toBn(padZero(countdown.hours))}:{toBn(padZero(countdown.minutes))}:{toBn(padZero(countdown.seconds))}
                          </div>
                        </>
                      ) : (
                        <div className="text-[10px] font-bold text-slate-500">
                          {language === 'bn' ? 'সমাপ্ত' : 'Ended'}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditSchedule(schedule)}
                        className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
                        title={language === 'bn' ? 'সম্পাদনা করুন' : 'Edit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                        title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Recently Concluded (within 24 hours of auto-deletion) */}
      {completedList.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-emerald-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'bn' ? 'সম্পন্ন সিডিউল (২৪ ঘণ্টার মধ্যে অটো-ডিলেট হবে)' : 'Completed (auto-purging in 24h)'}</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-1.5 py-0.2 rounded-full">
                {toBn(completedList.length)}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {completedList.map((schedule) => {
              const finishTime = schedule.scheduledAt + (schedule.durationMinutes || 60) * 60 * 1000;
              const expireTime = finishTime + SCHEDULE_AUTO_DELETE_WINDOW_MS;
              const remainingMs = Math.max(0, expireTime - currentTime);
              const remHours = Math.floor(remainingMs / 3600000);
              const remMins = Math.floor((remainingMs % 3600000) / 60000);

              return (
                <div
                  key={schedule.id}
                  className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-center justify-between gap-3 text-xs opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="line-through font-bold text-slate-800 truncate">
                        {schedule.subject}: {schedule.topic}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {schedule.date} ({formatTime12h(schedule.time)})
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-700 mt-0.5 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>
                        {language === 'bn'
                          ? `অটো-ডিলেট হতে বাকি: ${toBn(remHours)} ঘণ্টা ${toBn(remMins)} মিনিট`
                          : `Auto-deletes in: ${remHours}h ${remMins}m`}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer flex-shrink-0"
                    title="এখনই ডিলিট করুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
