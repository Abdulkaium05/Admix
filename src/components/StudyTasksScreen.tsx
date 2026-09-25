import React, { useState, useEffect, useMemo } from 'react';
import { StudyTask, StudySession } from '../types';
import {
  getStudyTasks,
  saveStudyTask,
  saveAllStudyTasks,
  deleteStudyTask,
  reorderStudyTasks,
  completeTaskWithStudyTime,
  moveTaskToDate,
  getTodayDateString,
  getTomorrowDateString,
  calculateStudyDurationMinutes,
  formatDuration,
} from '../utils/storage';
import { Language } from '../utils/i18n';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  MoveRight,
  ListTodo,
  Check,
  BookOpen,
  CalendarClock,
  ArrowUpDown,
  History,
  TrendingUp,
} from 'lucide-react';

interface StudyTasksScreenProps {
  language: Language;
  onBack: () => void;
  onNavigateStudyTime?: () => void;
  onNavigateStudyGraph?: () => void;
}

const PRESET_SUBJECTS = [
  { full: 'সিভিল ইঞ্জিনিয়ারিং', short: 'সিভিল' },
  { full: 'গণিত (Mathematics)', short: 'গণিত' },
  { full: 'পদার্থবিজ্ঞান (Physics)', short: 'পদার্থ' },
  { full: 'রসায়ন (Chemistry)', short: 'রসায়ন' },
  { full: 'ইংরেজি (English)', short: 'ইংরেজি' },
  { full: 'হ্যান্ডরাইটিং প্র্যাকটিস (Handwriting Practice)', short: 'হ্যান্ডরাইটিং' },
  { full: 'অন্যান্য / সাধারণ প্রস্তুতি', short: 'সাধারণ' },
];

export const StudyTasksScreen: React.FC<StudyTasksScreenProps> = ({
  language,
  onBack,
  onNavigateStudyTime,
  onNavigateStudyGraph,
}) => {
  const todayStr = useMemo(() => getTodayDateString(), []);
  const tomorrowStr = useMemo(() => getTomorrowDateString(), []);

  // Filter view tab: 'today' | 'tomorrow'
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');

  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Quick add form state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSubject, setQuickSubject] = useState(PRESET_SUBJECTS[0].full);
  const [quickPriority, setQuickPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(todayStr);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSubject, setModalSubject] = useState(PRESET_SUBJECTS[0].full);
  const [modalPriority, setModalPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [modalNotes, setModalNotes] = useState('');

  // Completion Time Modal State
  const [completingTask, setCompletingTask] = useState<StudyTask | null>(null);
  const [completeStartTime, setCompleteStartTime] = useState('08:00');
  const [completeEndTime, setCompleteEndTime] = useState('10:30');
  const [completeSessionDate, setCompleteSessionDate] = useState(todayStr);

  // Load and sync tasks
  const refreshTasks = () => {
    const loaded = getStudyTasks();
    setTasks(loaded);
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filter tasks based on active tab ('today' or 'tomorrow') and sort by custom order
  const displayedTasks = useMemo(() => {
    const targetDate = activeTab === 'tomorrow' ? tomorrowStr : todayStr;
    const list = tasks.filter((t) => t.targetDate === targetDate);
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [tasks, activeTab, todayStr, tomorrowStr]);

  // Count summary
  const summary = useMemo(() => {
    const todayList = tasks.filter((t) => t.targetDate === todayStr);
    const tomorrowList = tasks.filter((t) => t.targetDate === tomorrowStr);
    const todayCompleted = todayList.filter((t) => t.completed).length;
    const rolledOverCount = tasks.filter((t) => t.rolledOver && t.targetDate === todayStr && !t.completed).length;

    return {
      todayTotal: todayList.length,
      todayCompleted,
      tomorrowTotal: tomorrowList.length,
      rolledOverCount,
    };
  }, [tasks, todayStr, tomorrowStr]);

  // Fast Quick Add
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const targetDate = activeTab === 'tomorrow' ? tomorrowStr : todayStr;
    const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order ?? 0), 0);

    const newTask: StudyTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: quickTitle.trim(),
      subject: quickSubject,
      targetDate,
      completed: false,
      priority: quickPriority,
      order: maxOrder + 1,
      createdAt: Date.now(),
    };

    saveStudyTask(newTask);
    setQuickTitle('');
    refreshTasks();
    showToast(
      targetDate === tomorrowStr
        ? (language === 'bn' ? 'আগামীকালের জন্য টাস্ক সফলভাবে তৈরি হয়েছে!' : "Tomorrow's task created successfully!")
        : (language === 'bn' ? 'নতুন টাস্ক তালিকায় যুক্ত হয়েছে!' : 'New task added to your list!')
    );
  };

  // Full Modal Add Task
  const handleModalAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order ?? 0), 0);

    const newTask: StudyTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: modalTitle.trim(),
      subject: modalSubject,
      targetDate: modalDate,
      completed: false,
      priority: modalPriority,
      notes: modalNotes.trim() || undefined,
      order: maxOrder + 1,
      createdAt: Date.now(),
    };

    saveStudyTask(newTask);
    setModalTitle('');
    setModalNotes('');
    setIsAddModalOpen(false);
    refreshTasks();
    showToast(language === 'bn' ? 'টাস্ক সফলভাবে সংরক্ষণ হয়েছে!' : 'Task saved successfully!');
  };

  // Move task up or down in custom order
  const handleMoveOrder = (task: StudyTask, direction: 'up' | 'down') => {
    const list = [...displayedTasks];
    const currentIndex = list.findIndex((t) => t.id === task.id);
    if (currentIndex < 0) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap elements in current list
    const temp = list[currentIndex];
    list[currentIndex] = list[targetIndex];
    list[targetIndex] = temp;

    // Save newly ordered sequence
    reorderStudyTasks(list);
    refreshTasks();
  };

  // Move task explicitly to a manual position number
  const handleSetExactPosition = (task: StudyTask) => {
    const total = displayedTasks.length;
    const currentPos = displayedTasks.findIndex((t) => t.id === task.id) + 1;
    const input = prompt(
      language === 'bn'
        ? `এই টাস্কটিকে কত নম্বর সিরিয়ালে বসাতে চান? (১ থেকে ${total})`
        : `Enter desired serial number (1 to ${total}):`,
      String(currentPos)
    );

    if (!input) return;
    const newPos = parseInt(input, 10);
    if (isNaN(newPos) || newPos < 1 || newPos > total || newPos === currentPos) return;

    const list = [...displayedTasks];
    const itemIndex = list.findIndex((t) => t.id === task.id);
    const [item] = list.splice(itemIndex, 1);
    list.splice(newPos - 1, 0, item);

    reorderStudyTasks(list);
    refreshTasks();
    showToast(language === 'bn' ? `টাস্কটি #${newPos} সিরিয়ালে বসানো হয়েছে` : `Task moved to #${newPos}`);
  };

  // Move a task to tomorrow (Delay / Postpone)
  const handleMoveToTomorrow = (task: StudyTask) => {
    moveTaskToDate(task.id, tomorrowStr);
    refreshTasks();
    showToast(
      language === 'bn'
        ? 'টাস্কটি আগামীকালের তালিকায় স্থানান্তর করা হয়েছে'
        : 'Task moved to tomorrow'
    );
  };

  // Delete task
  const handleDelete = (taskId: string) => {
    if (confirm(language === 'bn' ? 'আপনি কি এই টাস্কটি মুছে ফেলতে চান?' : 'Delete this task?')) {
      deleteStudyTask(taskId);
      refreshTasks();
    }
  };

  // Prompt Completion and Time Logging
  const handleStartComplete = (task: StudyTask) => {
    if (task.completed) {
      // Toggle back to incomplete
      const updated = { ...task, completed: false, completedAt: undefined, studyTimeSpent: undefined };
      saveStudyTask(updated);
      refreshTasks();
      return;
    }

    setCompletingTask(task);
    setCompleteSessionDate(task.targetDate || todayStr);
    setCompleteStartTime('08:00');
    setCompleteEndTime('10:30');
  };

  const handleConfirmCompletionWithTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTask) return;

    const duration = calculateStudyDurationMinutes(completeStartTime, completeEndTime);
    if (duration <= 0) {
      alert(language === 'bn' ? 'শেষ সময় শুরুর সময় থেকে বেশি হতে হবে' : 'End time must be after start time');
      return;
    }

    const { createdSession } = completeTaskWithStudyTime(
      completingTask.id,
      completeStartTime,
      completeEndTime,
      completeSessionDate
    );

    setCompletingTask(null);
    refreshTasks();

    if (createdSession) {
      showToast(
        language === 'bn'
          ? `🎉 টাস্ক সম্পন্ন হয়েছে এবং স্টাডি টাইমে যুক্ত হয়েছে! (${formatDuration(createdSession.durationMinutes, 'bn')})`
          : `🎉 Task completed & logged into Study Time! (${formatDuration(createdSession.durationMinutes, 'en')})`
      );
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-20">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-emerald-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors shadow-2xs flex-shrink-0"
            title={language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-lg font-bold text-emerald-950 flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                <span>{language === 'bn' ? 'টাস্ক প্ল্যানার' : 'Task Planner'}</span>
              </h1>
              <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                {language === 'bn' ? 'পরের দিনের প্ল্যান' : 'Daily Planner'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-700/80 mt-0.5">
              {language === 'bn'
                ? 'আগেরদিন পরেরদিনের টাস্ক সাজিয়ে রাখুন। সম্পন্ন করলে সময় লিখে স্টাডি টাইমে অটো সেভ হবে।'
                : 'Plan tasks in advance. Completing a task automatically logs study duration into Study Time.'}
            </p>
          </div>
        </div>

        {/* Quick Navigation & Add Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto flex-wrap">
          {onNavigateStudyTime && (
            <button
              type="button"
              onClick={onNavigateStudyTime}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'bn' ? 'স্টাডি টাইম' : 'Study Time'}</span>
            </button>
          )}

          {onNavigateStudyGraph && (
            <button
              type="button"
              onClick={onNavigateStudyGraph}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'bn' ? 'গ্রাফ' : 'Graph'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setModalDate(activeTab === 'tomorrow' ? tomorrowStr : todayStr);
              setIsAddModalOpen(true);
            }}
            className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '+ নতুন' : '+ New'}</span>
          </button>
        </div>
      </div>

      {/* Auto-Rollover Notification Banner */}
      {summary.rolledOverCount > 0 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 sm:p-3.5 text-amber-950 text-xs flex items-start gap-2 shadow-2xs">
          <CalendarClock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">
              {language === 'bn'
                ? `গতকালকের ${summary.rolledOverCount}টি অসমাপ্ত টাস্ক আজকের তালিকায় স্থানান্তরিত হয়েছে`
                : `${summary.rolledOverCount} unfinished tasks carried over to today`}
            </span>
            <p className="text-amber-800/80 text-[11px]">
              {language === 'bn'
                ? 'যেসব টাস্ক শেষ হয়নি সেগুলো পরের দিনের তালিকায় যোগ হয়ে যায়।'
                : 'Incomplete tasks automatically roll over so nothing is forgotten.'}
            </p>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2-Column Clean Date Tabs & Quick Add Form (No Overflow, No 'All Tasks', No Sort Dropdown) */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-emerald-100 shadow-2xs space-y-3">
        {/* Balanced 2-Column Grid Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-emerald-50/80 rounded-xl border border-emerald-200/70">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`py-2 px-2.5 sm:px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'today'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{language === 'bn' ? 'আজকের টাস্ক' : "Today's Tasks"}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold flex-shrink-0 ${
                activeTab === 'today' ? 'bg-white/25 text-white' : 'bg-emerald-200/80 text-emerald-950'
              }`}
            >
              {summary.todayCompleted}/{summary.todayTotal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tomorrow')}
            className={`py-2 px-2.5 sm:px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'tomorrow'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-100/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{language === 'bn' ? 'কালকের প্ল্যান' : "Tomorrow's Plan"}</span>
            {summary.tomorrowTotal > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold flex-shrink-0 ${
                  activeTab === 'tomorrow' ? 'bg-white/25 text-white' : 'bg-emerald-200/80 text-emerald-950'
                }`}
              >
                {summary.tomorrowTotal}
              </span>
            )}
          </button>
        </div>

        {/* Quick Fast Input Form */}
        <form onSubmit={handleQuickAdd} className="space-y-2">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder={
              activeTab === 'tomorrow'
                ? (language === 'bn' ? 'কাল কী পড়বেন? (যেমন: সার্ভেয়িং চ্যাপ্টার ৫)' : 'What to study tomorrow?')
                : (language === 'bn' ? 'আজ কী পড়বেন? (যেমন: ক্যালকুলাস ম্যাথ)' : 'What will you study today?')
            }
            className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <select
              value={quickSubject}
              onChange={(e) => setQuickSubject(e.target.value)}
              className="flex-1 min-w-0 px-2 sm:px-2.5 py-2 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-950 bg-emerald-50/30 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden truncate"
            >
              {PRESET_SUBJECTS.map((sub) => (
                <option key={sub.full} value={sub.full}>{sub.short}</option>
              ))}
            </select>

            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value as any)}
              className="w-20 sm:w-24 px-1.5 sm:px-2 py-2 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-950 bg-emerald-50/30 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden flex-shrink-0"
            >
              <option value="high">🔴 {language === 'bn' ? 'জরুরি' : 'High'}</option>
              <option value="medium">🟡 {language === 'bn' ? 'সাধারণ' : 'Med'}</option>
              <option value="low">🟢 {language === 'bn' ? 'কম' : 'Low'}</option>
            </select>

            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{activeTab === 'tomorrow' ? (language === 'bn' ? '+ কালকে' : '+ Tomorrow') : (language === 'bn' ? '+ যোগ' : '+ Add')}</span>
            </button>
          </div>
        </form>

        {/* Helpful Tip */}
        <p className="text-[11px] text-emerald-700/80 flex items-center gap-1.5 pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block flex-shrink-0" />
          <span>
            {language === 'bn'
              ? 'আগেরদিন রাতে "কালকের প্ল্যান" এ টাস্ক লিখে রাখুন। অসমাপ্ত টাস্ক অটোমেটিক পরদিন স্থানান্তরিত হবে।'
              : 'Plan tasks the night before. Incomplete tasks automatically roll over to the next day.'}
          </span>
        </p>
      </div>

      {/* Task List Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
            <span>
              {activeTab === 'today' ? (language === 'bn' ? 'আজকের টাস্ক' : "Today's Tasks") : (language === 'bn' ? 'কালকের প্ল্যান' : "Tomorrow's Plan")}
            </span>
            <span className="text-emerald-700 font-mono font-bold">({displayedTasks.length})</span>
          </h2>

          <div className="text-[11px] text-stone-500 font-medium">
            <span>{language === 'bn' ? '▲ ▼ দিয়ে সিরিয়াল সাজান' : 'Use ▲ ▼ to reorder'}</span>
          </div>
        </div>

        {displayedTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-emerald-200 p-8 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                {activeTab === 'tomorrow'
                  ? (language === 'bn' ? 'আগামীকালের কোনো টাস্ক সেট করা নেই' : 'No tasks planned for tomorrow yet')
                  : (language === 'bn' ? 'এই তারিখে কোনো টাস্ক নেই' : 'No tasks found')}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                {activeTab === 'tomorrow'
                  ? (language === 'bn' ? 'উপরে টাস্ক লিখে "+ কালকের জন্য অ্যাড" বাটনে চাপুন।' : 'Write a task above to plan tomorrow in advance.')
                  : (language === 'bn' ? 'উপরে নতুন টাস্ক লিখে যোগ করুন।' : 'Add a task above to get started.')}
              </p>
            </div>
            {activeTab !== 'tomorrow' && (
              <button
                type="button"
                onClick={() => setActiveTab('tomorrow')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>{language === 'bn' ? 'আগামীকালের প্ল্যান দেখুন' : "View Tomorrow's Plan"}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayedTasks.map((task, index) => {
              const serialNum = index + 1;
              const isToday = task.targetDate === todayStr;
              const isTomorrow = task.targetDate === tomorrowStr;

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl border transition-all p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.completed
                      ? 'border-emerald-200/80 bg-emerald-50/20'
                      : task.rolledOver
                      ? 'border-amber-200 bg-amber-50/10'
                      : 'border-emerald-100 hover:border-emerald-200'
                  }`}
                >
                  {/* Left: Serial Number & Checkbox & Task Info */}
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    {/* Serial Number Badge (Clickable to change position) */}
                    <button
                      type="button"
                      onClick={() => handleSetExactPosition(task)}
                      title={language === 'bn' ? 'সিরিয়াল নম্বর পরিবর্তন করুন' : 'Click to change order position'}
                      className="w-7 h-7 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-200 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      {serialNum}
                    </button>

                    {/* Completion Trigger Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleStartComplete(task)}
                      className={`p-1 rounded-lg transition-transform hover:scale-105 flex-shrink-0 ${
                        task.completed ? 'text-emerald-600' : 'text-stone-400 hover:text-emerald-600'
                      }`}
                      title={
                        task.completed
                          ? (language === 'bn' ? 'টাস্ক সম্পন্ন হয়েছে' : 'Task completed')
                          : (language === 'bn' ? 'টাস্ক সম্পন্ন করুন ও পড়ার সময় লিখুন' : 'Complete task & log study time')
                      }
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Title */}
                        <span
                          className={`text-xs sm:text-sm font-bold text-emerald-950 break-words ${
                            task.completed ? 'line-through text-stone-500' : ''
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        {task.priority === 'high' && (
                          <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold px-1.5 py-0.2 rounded-md">
                            {language === 'bn' ? 'জরুরি' : 'High'}
                          </span>
                        )}

                        {/* Subject Badge */}
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded-md">
                          {task.subject}
                        </span>

                        {/* Rolled-over Badge */}
                        {task.rolledOver && !task.completed && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1">
                            <CalendarClock className="w-2.5 h-2.5" />
                            <span>{language === 'bn' ? 'গতকাল থেকে' : 'Rolled over'}</span>
                          </span>
                        )}

                        {/* Target Date Pill */}
                        <span className="text-[10px] text-stone-500 font-mono flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>
                            {isToday ? (language === 'bn' ? 'আজ' : 'Today') : isTomorrow ? (language === 'bn' ? 'কাল' : 'Tomorrow') : task.targetDate}
                          </span>
                        </span>
                      </div>

                      {/* Logged study duration if completed */}
                      {task.completed && task.studyTimeSpent && (
                        <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/80 w-fit">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>
                            {language === 'bn' ? 'স্টাডি টাইমে যুক্ত: ' : 'Logged: '}
                            <span className="font-mono font-bold">
                              {task.studyTimeSpent.startTime} - {task.studyTimeSpent.endTime}
                            </span>
                            {' '}
                            ({formatDuration(task.studyTimeSpent.durationMinutes, language)})
                          </span>
                        </div>
                      )}

                      {task.notes && (
                        <p className="text-[11px] text-stone-600">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Reorder Buttons & Postpone to Tomorrow & Delete */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                    {/* Up / Down Reorder Buttons */}
                    <div className="flex items-center bg-emerald-50 rounded-lg border border-emerald-100 p-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(task, 'up')}
                        disabled={index === 0}
                        title={language === 'bn' ? 'উপরে নিন (সিরিয়াল আগে আনুন)' : 'Move Up'}
                        className="p-1 text-emerald-800 hover:bg-emerald-200/70 disabled:opacity-30 rounded transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(task, 'down')}
                        disabled={index === displayedTasks.length - 1}
                        title={language === 'bn' ? 'নিচে নিন (সিরিয়াল পরে নিন)' : 'Move Down'}
                        className="p-1 text-emerald-800 hover:bg-emerald-200/70 disabled:opacity-30 rounded transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Move to tomorrow button if incomplete and not already tomorrow */}
                    {!task.completed && task.targetDate !== tomorrowStr && (
                      <button
                        type="button"
                        onClick={() => handleMoveToTomorrow(task)}
                        title={language === 'bn' ? 'কালকের জন্য স্থানান্তর' : 'Postpone to tomorrow'}
                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-bold transition-colors flex items-center gap-1 shadow-2xs whitespace-nowrap"
                      >
                        <MoveRight className="w-3 h-3 text-emerald-700" />
                        <span>{language === 'bn' ? 'কালকে' : 'Tomorrow'}</span>
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completion Modal: Asks "কয়টা থেকে কয়টা পর্যন্ত সময় লেগেছে?" and saves to Study Time */}
      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    {language === 'bn' ? 'টাস্ক সম্পন্ন হয়েছে!' : 'Task Completed!'}
                  </h3>
                  <p className="text-[11px] text-emerald-700">
                    {language === 'bn' ? 'পড়ার সময় লিখে স্টাডি টাইমে যুক্ত করুন' : 'Log your study hours into Study Time'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompletingTask(null)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Task Info Pill */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 inline-block">
                {completingTask.subject}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                {completingTask.title}
              </h4>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmCompletionWithTime} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-emerald-900 block mb-1">
                  {language === 'bn' ? 'কোন তারিখে পড়েছেন?' : 'Date studied'}
                </label>
                <input
                  type="date"
                  value={completeSessionDate}
                  onChange={(e) => setCompleteSessionDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-emerald-900 block">
                  {language === 'bn' ? 'কয়টা থেকে কয়টা পর্যন্ত সময় লেগেছে?' : 'From what time to what time did you study?'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">
                      {language === 'bn' ? 'শুরুর সময় (From)' : 'Start time'}
                    </span>
                    <input
                      type="time"
                      value={completeStartTime}
                      onChange={(e) => setCompleteStartTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">
                      {language === 'bn' ? 'শেষ সময় (To)' : 'End time'}
                    </span>
                    <input
                      type="time"
                      value={completeEndTime}
                      onChange={(e) => setCompleteEndTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated duration preview */}
              <div className="bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-semibold">
                  {language === 'bn' ? 'মোট পড়ার সময়:' : 'Total duration:'}
                </span>
                <span className="font-mono font-bold text-emerald-950 text-sm">
                  {formatDuration(calculateStudyDurationMinutes(completeStartTime, completeEndTime), language)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-100">
                <button
                  type="button"
                  onClick={() => setCompletingTask(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'স্টাডি টাইমে যুক্ত ও সমাপ্ত' : 'Save & Complete'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Full Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'নতুন টাস্ক তৈরি করুন' : 'Create New Task'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalAdd} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-emerald-900 block mb-1">
                  {language === 'bn' ? 'নির্ধারিত তারিখ (কোন দিনের জন্য)' : 'Target Date'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setModalDate(tomorrowStr)}
                    className="px-2.5 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    {language === 'bn' ? 'আগামীকাল' : 'Tomorrow'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-900 block mb-1">
                  {language === 'bn' ? 'বিষয় (Subject)' : 'Subject'}
                </label>
                <select
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {PRESET_SUBJECTS.map((sub) => (
                    <option key={sub.full} value={sub.full}>{sub.full}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-900 block mb-1">
                  {language === 'bn' ? 'টাস্কের বিবরণ / টপিক' : 'Task Title / Topic'}
                </label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: হাইড্রোলিক্স চ্যাপ্টার ৩ ম্যাথ রিভিশন' : 'e.g. Hydraulics Ch 3 math revision'}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-900 block mb-1">
                  {language === 'bn' ? 'অগ্রাধিকার (Priority)' : 'Priority'}
                </label>
                <select
                  value={modalPriority}
                  onChange={(e) => setModalPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="high">🔴 {language === 'bn' ? 'জরুরি (High Priority)' : 'High'}</option>
                  <option value="medium">🟡 {language === 'bn' ? 'সাধারণ (Medium Priority)' : 'Medium'}</option>
                  <option value="low">🟢 {language === 'bn' ? 'কম গুরুত্বপূর্ণ (Low Priority)' : 'Low'}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-900 block mb-1">
                  {language === 'bn' ? 'নোট বা মন্তব্য (ঐচ্ছিক)' : 'Notes (optional)'}
                </label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  rows={2}
                  placeholder={language === 'bn' ? 'গুরুত্বপূর্ণ সূত্র বা পৃষ্ঠা নম্বর...' : 'Any reminders or formulas...'}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
