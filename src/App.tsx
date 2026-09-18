import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserProfile, DailyLimitInfo, QuizResult, Question, AppView } from './types';
import { Language } from './utils/i18n';
import {
  getUserProfile,
  saveUserProfile,
  getDailyLimitInfo,
  incrementDailyQuizCount,
  getQuizHistory,
  saveQuizResult,
  getAllQuestions,
  getCustomQuestions,
  MAX_DAILY_EXAMS,
} from './utils/storage';

import { Header } from './components/Header';
import { MoreMenuDrawer } from './components/MoreMenuDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { HomeScreen } from './components/HomeScreen';
import { ExamScreen } from './components/ExamScreen';
import { ResultScreen } from './components/ResultScreen';
import { QuizImportScreen } from './components/QuizImportScreen';
import { AiSupportScreen } from './components/AiSupportScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { StudyTimeScreen } from './components/StudyTimeScreen';
import { AdmissionCountdownModal } from './components/AdmissionCountdownModal';

export default function App() {
  // 1. Language State (Theme is permanently White & Light Green)
  const [language, setLanguage] = useState<Language>('bn');

  // Enforce pure light theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('duet_theme');
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  // 2. User Profile State
  const [profile, setProfile] = useState<UserProfile | null>(() => getUserProfile());
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => !getUserProfile());
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isCountdownModalOpen, setIsCountdownModalOpen] = useState<boolean>(false);

  // 3. Navigation View State
  const [currentView, setCurrentView] = useState<AppView>('home');

  // 4. Data State
  const [dailyLimit, setDailyLimit] = useState<DailyLimitInfo>(() => getDailyLimitInfo());
  const [history, setHistory] = useState<QuizResult[]>(() => getQuizHistory());
  const [allQuestions, setAllQuestions] = useState<Question[]>(() => getAllQuestions());
  const [customQuestions, setCustomQuestions] = useState<Question[]>(() => getCustomQuestions());

  // 5. Active Exam State
  const [activeExamQuestions, setActiveExamQuestions] = useState<Question[]>([]);
  const [latestResult, setLatestResult] = useState<QuizResult | null>(null);

  // Reload questions from storage
  const refreshQuestions = useCallback(() => {
    setAllQuestions(getAllQuestions());
    setCustomQuestions(getCustomQuestions());
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(getQuizHistory());
  }, []);

  // Profile Save Handler
  const handleSaveProfile = (newProfile: UserProfile) => {
    saveUserProfile(newProfile);
    setProfile(newProfile);
    setIsOnboardingOpen(false);
  };

  /**
   * Generates the 80 question model test:
   * 40 Civil + 10 Math + 10 Physics + 10 Chemistry + 10 English
   */
  const handleStartExam = () => {
    const currentLimit = getDailyLimitInfo();
    if (currentLimit.count >= MAX_DAILY_EXAMS) {
      alert(
        language === 'bn'
          ? 'আজকের ৫ বার কুইজ দেওয়ার কোটা পূর্ণ হয়েছে। অনুগ্রহ করে আগামীকাল আবার চেষ্টা করুন।'
          : 'You have reached your daily limit of 5 exams. Please try again tomorrow.'
      );
      return;
    }

    const civilPool = allQuestions.filter((q) => q.subject === 'civil');
    const mathPool = allQuestions.filter((q) => q.subject === 'math');
    const physicsPool = allQuestions.filter((q) => q.subject === 'physics');
    const chemPool = allQuestions.filter((q) => q.subject === 'chemistry');
    const englishPool = allQuestions.filter((q) => q.subject === 'english');

    const sample = (arr: Question[], count: number): Question[] => {
      if (arr.length === 0) return [];
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      if (shuffled.length >= count) {
        return shuffled.slice(0, count);
      }
      const result: Question[] = [];
      let i = 0;
      while (result.length < count) {
        const item = shuffled[i % shuffled.length];
        result.push({
          ...item,
          id: `${item.id}-${result.length}`,
        });
        i++;
      }
      return result;
    };

    const selected40Civil = sample(civilPool, 40);
    const selected10Math = sample(mathPool, 10);
    const selected10Physics = sample(physicsPool, 10);
    const selected10Chem = sample(chemPool, 10);
    const selected10English = sample(englishPool, 10);

    const full80Questions = [
      ...selected40Civil,
      ...selected10Math,
      ...selected10Physics,
      ...selected10Chem,
      ...selected10English,
    ];

    setActiveExamQuestions(full80Questions);
    setCurrentView('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Exam Finish Handler
  const handleFinishExam = (result: QuizResult) => {
    saveQuizResult(result);
    const updatedLimit = incrementDailyQuizCount();
    setDailyLimit(updatedLimit);
    refreshHistory();
    setLatestResult(result);
    setCurrentView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelExam = () => {
    if (confirm(language === 'bn' ? 'আপনি কি পরীক্ষা বাতিল করতে চান?' : 'Cancel exam?')) {
      setCurrentView('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0fdf4] text-emerald-950 font-['Hind_Siliguri',sans-serif]">
      {/* Top Global Header (hidden during exam for distraction-free focus) */}
      {currentView !== 'exam' && (
        <Header
          language={language}
          onOpenMoreMenu={() => setIsMoreMenuOpen(true)}
          onOpenProfile={() => setIsOnboardingOpen(true)}
          profile={profile}
          onNavigateHome={() => setCurrentView('home')}
        />
      )}

      {/* Main Screen View Content - Mobile Optimized with Smooth Container Padding */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4">
        {currentView === 'home' && (
          <HomeScreen
            profile={profile}
            dailyLimit={dailyLimit}
            language={language}
            onNavigate={setCurrentView}
            onStartExam={handleStartExam}
            onOpenProfile={() => setIsOnboardingOpen(true)}
            totalQuestionCount={allQuestions.length}
          />
        )}

        {currentView === 'exam' && (
          <ExamScreen
            questions={activeExamQuestions}
            language={language}
            onFinishExam={handleFinishExam}
            onCancelExam={handleCancelExam}
          />
        )}

        {currentView === 'result' && latestResult && (
          <ResultScreen
            result={latestResult}
            language={language}
            onNavigateHome={() => setCurrentView('home')}
            onNavigateHistory={() => setCurrentView('history')}
            onRetakeExam={handleStartExam}
          />
        )}

        {currentView === 'import' && (
          <QuizImportScreen
            questions={allQuestions}
            customQuestions={customQuestions}
            language={language}
            onRefreshQuestions={refreshQuestions}
          />
        )}

        {currentView === 'history' && (
          <HistoryScreen
            history={history}
            language={language}
            onSelectResult={(item) => {
              setLatestResult(item);
              setCurrentView('result');
            }}
            onRefreshHistory={refreshHistory}
            onStartExam={handleStartExam}
          />
        )}

        {currentView === 'ai_support' && <AiSupportScreen language={language} />}

        {currentView === 'study_time' && (
          <StudyTimeScreen
            language={language}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Subtle Clean Footer */}
      {currentView !== 'exam' && (
        <footer className="border-t border-emerald-100 py-4 px-4 bg-white/60 text-center text-xs text-emerald-800/70">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
            <p>Admix • ডুয়েট ভর্তি প্রস্তুতি ও মডেল টেস্ট</p>
            <p className="font-semibold text-emerald-700">
              সাদা ও হালকা সবুজ থিম • অফলাইন বান্ধব
            </p>
          </div>
        </footer>
      )}

      {/* Side More Menu Drawer with Language Setting */}
      <MoreMenuDrawer
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        currentView={currentView}
        onNavigate={setCurrentView}
        language={language}
        onToggleLanguage={toggleLanguage}
        profile={profile}
        onOpenProfileModal={() => setIsOnboardingOpen(true)}
        onOpenCountdownModal={() => setIsCountdownModalOpen(true)}
        questionCount={allQuestions.length}
      />

      {/* Admission Countdown Modal */}
      <AdmissionCountdownModal
        isOpen={isCountdownModalOpen}
        onClose={() => setIsCountdownModalOpen(false)}
        language={language}
      />

      {/* Mandatory Onboarding & Profile Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onSave={handleSaveProfile}
        initialProfile={profile}
        language={language}
        canCloseWithoutSave={profile !== null}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
