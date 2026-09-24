import React from 'react';
import { UserProfile, AppView } from '../types';
import { translations, Language } from '../utils/i18n';
import { EngineerLogo } from './EngineerLogo';
import {
  getTodayStudyMinutes,
  formatDuration,
  getAdmissionTargetDate,
  calculateAdmissionCountdown,
} from '../utils/storage';
import {
  X,
  PlusCircle,
  History,
  Bot,
  Languages,
  Home,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Clock,
  TrendingUp,
  ListTodo,
  CalendarClock,
  LogOut,
  Cloud,
  FlaskConical,
} from 'lucide-react';

interface MoreMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  language: Language;
  onToggleLanguage: () => void;
  profile: UserProfile | null;
  onOpenProfileModal: () => void;
  onOpenCountdownModal: () => void;
  questionCount: number;
  userEmail?: string | null;
  onLogout?: () => void;
  onOpenAuthModal?: () => void;
}

export const MoreMenuDrawer: React.FC<MoreMenuDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  language,
  onToggleLanguage,
  profile,
  onOpenProfileModal,
  onOpenCountdownModal,
  questionCount,
  userEmail,
  onLogout,
  onOpenAuthModal,
}) => {
  const t = translations[language];
  const todayMins = getTodayStudyMinutes();
  const targetAdmissionDate = getAdmissionTargetDate();
  const countdownInfo = calculateAdmissionCountdown(targetAdmissionDate);
  const toBn = (n: number) => n.toLocaleString('bn-BD');

  if (!isOpen) return null;

  const handleNav = (view: AppView) => {
    onNavigate(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-emerald-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Body - Pure White & Light Green Aesthetic */}
      <div className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl border-l border-emerald-100 flex flex-col justify-between overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 bg-emerald-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 flex-shrink-0">
              <EngineerLogo className="w-full h-full" />
            </div>
            <div>
              <h3 className="font-bold text-base text-emerald-900 leading-tight">
                Admix
              </h3>
              <p className="text-[11px] text-emerald-700/80">
                {language === 'bn' ? 'ডুয়েট ভর্তি প্রস্তুতি' : 'DUET Admission Prep'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/70 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Snapshot Card */}
        {profile && (
          <div className="p-3.5 mx-4 mt-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {profile.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-emerald-950 truncate">
                  {profile.name}
                </h4>
                <p className="text-[10px] text-emerald-700/80 truncate">
                  রোল: {profile.polytechnicRoll}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenProfileModal();
              }}
              className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex-shrink-0"
            >
              CGPA {profile.calculatedCgpa.toFixed(2)}
            </button>
          </div>
        )}

        {/* Language Changer - Prominently located in More Menu as requested */}
        <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'অ্যাপের ভাষা (Language)' : 'App Language'}</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 px-1.5 py-0.5 rounded-md bg-emerald-100">
              {language === 'bn' ? 'বাংলা সক্রিয়' : 'English Active'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                if (language !== 'bn') onToggleLanguage();
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                language === 'bn'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100/50'
              }`}
            >
              বাংলা (BN)
            </button>
            <button
              onClick={() => {
                if (language !== 'en') onToggleLanguage();
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                language === 'en'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100/50'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-1.5 flex-1">
          <button
            onClick={() => handleNav('home')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'home'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>হোম স্ক্রিন (Home)</span>
          </button>

          {/* Upcoming Class & Exam Schedules */}
          <button
            onClick={() => handleNav('schedules')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'schedules'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <CalendarClock className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'সিডিউল টাইমার' : 'Schedules'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
              {language === 'bn' ? 'ক্লাস ও পরীক্ষা' : 'Timer'}
            </span>
          </button>

          {/* Chemistry (রসায়ন) Feature */}
          <button
            onClick={() => handleNav('chemistry')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'chemistry'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'রসায়ন (Chemistry)' : 'Chemistry'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
              {language === 'bn' ? 'গ্রুপ, যোজনী ও সংকেত' : 'Quiz'}
            </span>
          </button>

          {/* Study Tasks Planner Feature */}
          <button
            onClick={() => handleNav('study_tasks')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'study_tasks'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <ListTodo className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'টাস্ক প্ল্যানার' : 'Task Planner'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
              {language === 'bn' ? 'পরের দিনের প্ল্যান' : 'Daily Plan'}
            </span>
          </button>

          {/* Study Time Feature */}
          <button
            onClick={() => handleNav('study_time')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'study_time'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'স্টাডি টাইম' : 'Study Time'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
              {todayMins > 0 ? formatDuration(todayMins, language) : (language === 'bn' ? 'রুটিন' : 'Routine')}
            </span>
          </button>

          {/* Study Graph Separate Page */}
          <button
            onClick={() => handleNav('study_graph')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'study_graph'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'স্টাডি গ্রাফ' : 'Study Graph'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
              {language === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics'}
            </span>
          </button>

          <button
            onClick={() => handleNav('import')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'import'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="w-4 h-4" />
              <span>{t.importQuiz}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
              {questionCount} টি
            </span>
          </button>

          <button
            onClick={() => handleNav('history')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t.history}</span>
          </button>

          <button
            onClick={() => handleNav('ai_support')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'ai_support'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{t.aiSupport} (Admix AI Chat)</span>
          </button>

          {/* Admission Exam Countdown Option */}
          <button
            onClick={() => {
              onClose();
              onOpenCountdownModal();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <CalendarClock className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>{language === 'bn' ? 'অ্যাডমিশন কাউন্টডাউন' : 'Admission Countdown'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold border border-emerald-200">
              {countdownInfo.isPassed
                ? (language === 'bn' ? 'তারিখ উত্তীর্ণ' : 'Passed')
                : (language === 'bn' ? `${toBn(countdownInfo.days)} দিন বাকি` : `${countdownInfo.days}d left`)}
            </span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenProfileModal();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition-all"
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>{t.profile}</span>
          </button>

          <div className="pt-3 my-2 border-t border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-wider px-3">
              ডিপার্টমেন্ট স্ট্যাটাস
            </span>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center justify-between px-3 py-1 text-emerald-900">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  সিভিল ইঞ্জিনিয়ারিং
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded-md">
                  ৪০ প্রশ্ন
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-1 text-emerald-600/60">
                <span>তড়িৎ, মেকানিক্যাল, সিএসই</span>
                <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded-md">শীঘ্রই</span>
              </div>
            </div>
          </div>

          {/* User Account & Logout */}
          {userEmail ? (
            <div className="pt-3 my-2 border-t border-emerald-100">
              <div className="px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-100 mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ফায়ারবেস একাউন্ট</span>
                </div>
                <p className="text-[11px] text-emerald-700/80 truncate mt-0.5">
                  {userEmail}
                </p>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === 'bn' ? 'লগআউট করুন' : 'Sign Out'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="pt-3 my-2 border-t border-emerald-100">
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 border border-emerald-300/80 transition-all shadow-2xs"
                >
                  <Cloud className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'bn' ? 'লগইন / ক্লাউড ব্যাকআপ সিঙ্ক' : 'Sign In / Cloud Sync'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom App Note */}
        <div className="p-4 border-t border-emerald-100 bg-emerald-50/40 text-center">
          <p className="text-[11px] text-emerald-950 font-bold">
            {language === 'bn' ? 'Admix • ডুয়েট ভর্তি প্রস্তুতি ও মডেল টেস্ট' : 'Admix • DUET Admission Prep & Model Test'}
          </p>
          <p className="text-[10px] text-emerald-700/80 mt-0.5">
            {language === 'bn'
              ? 'পরিশ্রম ও নিয়মিত অনুশীলনই ডুয়েট সাফল্যের মূল চাবিকাঠি'
              : 'Consistent hard work & daily practice lead to DUET success'}
          </p>
        </div>
      </div>
    </div>
  );
};
