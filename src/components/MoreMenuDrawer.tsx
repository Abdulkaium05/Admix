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
  CalendarClock,
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

          {/* New Study Time Feature Added in More Menu */}
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
              <span>{language === 'bn' ? 'স্টাডি টাইম (পড়ার রুটিন)' : 'Study Time Tracker'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
              {todayMins > 0 ? formatDuration(todayMins, language) : (language === 'bn' ? 'নতুন হিসাব' : 'Track')}
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
        </div>

        {/* Bottom App Note */}
        <div className="p-4 border-t border-emerald-100 bg-emerald-50/40 text-center">
          <p className="text-[11px] text-emerald-700 font-medium">
            Admix • ডুয়েট ভর্তি কুইজ ও মডেল টেস্ট
          </p>
          <p className="text-[10px] text-emerald-600/70">
            সাদা ও হালকা সবুজ থিম
          </p>
        </div>
      </div>
    </div>
  );
};
