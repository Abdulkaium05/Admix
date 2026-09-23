import React from 'react';
import { UserProfile, DailyLimitInfo, AppView } from '../types';
import { translations, Language } from '../utils/i18n';
import { EngineerLogo } from './EngineerLogo';
import { MAX_DAILY_EXAMS, getTodayStudyMinutes, formatDuration, getStudyTasks, getTodayDateString, getTomorrowDateString } from '../utils/storage';
import {
  Play,
  PlusCircle,
  History,
  Bot,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Clock,
  Award,
  CheckCircle2,
  ListTodo,
  FlaskConical,
} from 'lucide-react';

interface HomeScreenProps {
  profile: UserProfile | null;
  dailyLimit: DailyLimitInfo;
  language: Language;
  onNavigate: (view: AppView) => void;
  onStartExam: () => void;
  onOpenProfile: () => void;
  totalQuestionCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  dailyLimit,
  language,
  onNavigate,
  onStartExam,
  onOpenProfile,
  totalQuestionCount,
}) => {
  const t = translations[language];
  const todayStudyMins = getTodayStudyMinutes();
  const allTasks = getStudyTasks();
  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();
  const pendingTodayTasks = allTasks.filter((t) => t.targetDate === todayStr && !t.completed).length;
  const tomorrowTasksCount = allTasks.filter((t) => t.targetDate === tomorrowStr).length;

  const examsRemaining = Math.max(0, MAX_DAILY_EXAMS - dailyLimit.count);
  const isLimitReached = examsRemaining <= 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* 1. Student Profile & CGPA Bar */}
      {profile && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base flex-shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-emerald-950 truncate">
                {profile.name}
              </h2>
              <p className="text-[11px] text-emerald-700/80 truncate">
                {profile.polytechnicName} • রোল: {profile.polytechnicRoll}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* CGPA Button */}
            <button
              onClick={onOpenProfile}
              className="text-right px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 transition-colors"
              title="ক্লিক করে সিজিপিএ আপডেট করুন"
            >
              <div className="text-[9px] sm:text-[10px] font-bold text-emerald-800 flex items-center justify-end gap-1">
                <GraduationCap className="w-3 h-3 text-emerald-600" />
                <span>{profile.isAverage ? 'সিজিপিএ (১০০%)' : 'CGPA'}</span>
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-emerald-800 font-mono">
                {profile.calculatedCgpa.toFixed(2)}{' '}
                <span className="text-[9px] text-emerald-600/70 font-normal">/ ৪.০০</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Quota reached notice if applicable */}
      {isLimitReached && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>{t.dailyLimitWarning}</span>
        </div>
      )}

      {/* Daily Study Time Banner - Quick Access to Study Log */}
      <div
        onClick={() => onNavigate('study_time')}
        className="p-3 sm:p-3.5 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-300 shadow-2xs cursor-pointer transition-all flex items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-emerald-100">
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-950">
                {language === 'bn' ? 'আজকের স্টাডি টাইম:' : "Today's Study Time:"}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                {formatDuration(todayStudyMins, language)}
              </span>
            </div>
            <p className="text-[10px] text-emerald-700/80 mt-0.5">
              {todayStudyMins > 0
                ? (language === 'bn' ? 'পড়ার বিবরণ ও ডেইলি ক্যালেন্ডার হিস্ট্রি দেখুন' : 'View daily logs & history')
                : (language === 'bn' ? 'কখন কতক্ষণ কী পড়লেন সেভ করুন (৬-৯ টা, ১০-১২ টা)' : 'Log your study sessions and topics')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 group-hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex-shrink-0">
          <span>{language === 'bn' ? 'স্টাডি টাইম' : 'Study Log'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 2. Main Exam Action Card - Super Clean & Focused */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        {/* Subtle accent corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>ডুয়েট মডেল টেস্ট</span>
            </span>

            {/* Daily Quota remaining */}
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              আজ বাকি: {examsRemaining} / {MAX_DAILY_EXAMS} বার
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight">
              {language === 'bn' ? '৮০ প্রশ্নের পূর্ণাঙ্গ মডেল টেস্ট' : '80-Question Full Model Test'}
            </h1>
            <p className="text-xs text-emerald-800/80 mt-1 leading-relaxed">
              {language === 'bn'
                ? 'ডিপার্টমেন্ট (সিভিল ৪০) ও নন-ডিপার্টমেন্ট (গণিত ১০, পদার্থ ১০, রসায়ন ১০, ইংরেজি ১০)।'
                : 'Department (Civil 40) & Non-Department (Math 10, Physics 10, Chem 10, English 10).'}
            </p>
          </div>

          {/* Exam Specs - Simple 3 Badges */}
          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="block text-[10px] font-semibold text-emerald-700">প্রশ্ন</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-900 font-mono">৮০ টি</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="block text-[10px] font-semibold text-emerald-700">সময়সীমা</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-900 font-mono">৩০ মিনিট</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="block text-[10px] font-semibold text-emerald-700">পূর্ণমান</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-900 font-mono">১২০ নম্বর</span>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={onStartExam}
            disabled={isLimitReached}
            className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all ${
              isLimitReached
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/20 hover:shadow-md'
            }`}
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            <span>{t.startExam}</span>
          </button>
        </div>
      </div>

      {/* 2.5 Chemistry (রসায়ন) Quick Access Card */}
      <div
        onClick={() => onNavigate('chemistry')}
        className="p-4 sm:p-4.5 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-emerald-200/60">
              <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-emerald-950 group-hover:text-emerald-700 transition-colors">
                  {language === 'bn' ? 'রসায়ন (Chemistry)' : 'Chemistry'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  নতুন অপশন
                </span>
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-0.5 leading-tight">
                {language === 'bn'
                  ? 'মৌলের গ্রুপ ও যোজনী কুইজ (১-১৮ ও ১-৮), রাসায়নিক সংকেত'
                  : 'Element Group & Valency Quiz (1-18, 1-8) & Chemical Formulas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 group-hover:bg-emerald-700 px-3 py-2 rounded-xl transition-colors shadow-2xs flex-shrink-0">
            <span>{language === 'bn' ? 'কুইজ দিন' : 'Start'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 3. Quick Action Buttons - 5 Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Study Tasks Planner (New Separate Feature) */}
        <button
          onClick={() => onNavigate('study_tasks')}
          className="p-3 sm:p-3.5 rounded-2xl bg-white border border-emerald-200/80 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group relative overflow-hidden"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
          </div>
          <span className="text-xs font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">
            {language === 'bn' ? 'টাস্ক প্ল্যানার' : 'Task Planner'}
          </span>
          <span className="text-[10px] text-emerald-700/80 mt-0.5">
            {pendingTodayTasks > 0
              ? (language === 'bn' ? `${pendingTodayTasks}টি বাকি` : `${pendingTodayTasks} pending`)
              : tomorrowTasksCount > 0
              ? (language === 'bn' ? `কালকে ${tomorrowTasksCount}টি` : `${tomorrowTasksCount} tomorrow`)
              : (language === 'bn' ? 'পরের দিনের প্ল্যান' : 'Daily Plan')}
          </span>
        </button>

        {/* Study Time */}
        <button
          onClick={() => onNavigate('study_time')}
          className="p-3 sm:p-3.5 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">
            {language === 'bn' ? 'স্টাডি টাইম' : 'Study Time'}
          </span>
          <span className="text-[10px] text-emerald-700/70 mt-0.5">
            {todayStudyMins > 0 ? formatDuration(todayStudyMins, language) : (language === 'bn' ? 'পড়ার রুটিন' : 'Daily Routine')}
          </span>
        </button>

        {/* AI Support Chat */}
        <button
          onClick={() => onNavigate('ai_support')}
          className="p-3 sm:p-3.5 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">
            AI চ্যাট
          </span>
          <span className="text-[10px] text-emerald-700/70 mt-0.5">সহজ সমাধান</span>
        </button>

        {/* History */}
        <button
          onClick={() => onNavigate('history')}
          className="p-3 sm:p-3.5 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <History className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">
            ফলাফল হিস্ট্রি
          </span>
          <span className="text-[10px] text-emerald-700/70 mt-0.5">পূর্বের রেজাল্ট</span>
        </button>

        {/* Import Quiz */}
        <button
          onClick={() => onNavigate('import')}
          className="p-3 sm:p-3.5 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">
            প্রশ্ন ইমপোর্ট
          </span>
          <span className="text-[10px] text-emerald-700/70 mt-0.5">{totalQuestionCount} টি প্রশ্ন</span>
        </button>
      </div>

      {/* 4. Minimal Guidelines Card */}
      <div className="p-4 rounded-2xl bg-white border border-emerald-100 text-xs text-emerald-900/80 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>পরীক্ষার নিয়ম ও মান বণ্টন:</span>
        </div>
        <p>• প্রতিটি প্রশ্নের মান ১.৫ নম্বর (ভুল উত্তরের জন্য নেগেটিভ মার্ক প্রযোজ্য নয়)।</p>
        <p>• ৩০ মিনিট অতিক্রান্ত হলে স্বয়ংক্রিয়ভাবে খাতা সাবমিট হয়ে রেজাল্ট শিট চলে আসবে।</p>
      </div>
    </div>
  );
};
