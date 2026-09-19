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
  saveBatchCustomQuestions,
  MAX_DAILY_EXAMS,
} from './utils/storage';
import {
  auth,
  logoutUser,
  getUserProfileFromCloud,
  saveUserProfileToCloud,
  getCustomQuestionsFromCloud,
  saveQuizResultToCloud,
  getQuizHistoryFromCloud,
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

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
import { AuthScreen } from './components/AuthScreen';
import { EngineerLogo } from './components/EngineerLogo';

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

  // 2. Firebase Authentication State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(() => auth.currentUser);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('duet_guest_mode') === 'true' || !!getUserProfile();
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // 3. User Profile State
  const [profile, setProfile] = useState<UserProfile | null>(() => getUserProfile());
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isCountdownModalOpen, setIsCountdownModalOpen] = useState<boolean>(false);

  // 4. Navigation View State
  const [currentView, setCurrentView] = useState<AppView>('home');

  // 5. Data State
  const [dailyLimit, setDailyLimit] = useState<DailyLimitInfo>(() => getDailyLimitInfo());
  const [history, setHistory] = useState<QuizResult[]>(() => getQuizHistory());
  const [allQuestions, setAllQuestions] = useState<Question[]>(() => getAllQuestions());
  const [customQuestions, setCustomQuestions] = useState<Question[]>(() => getCustomQuestions());

  // 6. Active Exam State
  const [activeExamQuestions, setActiveExamQuestions] = useState<Question[]>([]);
  const [latestResult, setLatestResult] = useState<QuizResult | null>(null);

  // Function to reload questions and sync with Firestore
  const syncCloudQuestions = useCallback(async (userId?: string) => {
    const uid = userId || firebaseUser?.uid;
    if (!uid) {
      setAllQuestions(getAllQuestions());
      setCustomQuestions(getCustomQuestions());
      return;
    }

    try {
      const cloudCustom = await getCustomQuestionsFromCloud(uid);
      if (cloudCustom && cloudCustom.length > 0) {
        saveBatchCustomQuestions(cloudCustom);
      }
      setAllQuestions(getAllQuestions());
      setCustomQuestions(getCustomQuestions());
    } catch (err) {
      console.warn('Questions sync warning:', err);
      setAllQuestions(getAllQuestions());
      setCustomQuestions(getCustomQuestions());
    }
  }, [firebaseUser?.uid]);

  // Safety timer: Never keep the user waiting on loading screen for more than 1 second
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setAuthLoading(false);
    }, 1000);
    return () => clearTimeout(safetyTimer);
  }, []);

  // Auth Listener - Runs once on mount
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;
      setFirebaseUser(user);
      // Immediately release loading screen so the user never gets stuck
      setAuthLoading(false);

      if (user) {
        // Load local profile first for instant UI response
        const localProf = getUserProfile();
        if (localProf && localProf.completedOnboarding) {
          setProfile(localProf);
          setIsOnboardingOpen(false);
        }

        // Asynchronous background cloud sync
        (async () => {
          try {
            const cloudProfile = await getUserProfileFromCloud(user.uid);
            if (!isMounted) return;
            if (cloudProfile && cloudProfile.completedOnboarding) {
              setProfile(cloudProfile);
              saveUserProfile(cloudProfile);
              setIsOnboardingOpen(false);
            } else if (localProf && localProf.completedOnboarding) {
              saveUserProfileToCloud(user.uid, localProf).catch(() => {});
            } else {
              setIsOnboardingOpen(true);
            }
          } catch (e) {
            console.warn('Profile background sync:', e);
            if (!localProf || !localProf.completedOnboarding) {
              setIsOnboardingOpen(true);
            }
          }

          // Background sync custom questions
          try {
            const cloudCustom = await getCustomQuestionsFromCloud(user.uid);
            if (!isMounted) return;
            if (cloudCustom && cloudCustom.length > 0) {
              saveBatchCustomQuestions(cloudCustom);
              setAllQuestions(getAllQuestions());
              setCustomQuestions(getCustomQuestions());
            }
          } catch (e) {
            console.warn('Questions sync warning:', e);
          }

          // Background sync quiz history
          try {
            const cloudHistory = await getQuizHistoryFromCloud(user.uid);
            if (!isMounted) return;
            if (cloudHistory && cloudHistory.length > 0) {
              setHistory(cloudHistory);
            }
          } catch (e) {
            console.warn('History sync warning:', e);
          }
        })();
      } else {
        // Not logged in to Firebase; check local profile
        const localProf = getUserProfile();
        if (localProf && localProf.completedOnboarding) {
          setProfile(localProf);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Refresh questions from storage
  const refreshQuestions = useCallback(() => {
    setAllQuestions(getAllQuestions());
    setCustomQuestions(getCustomQuestions());
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(getQuizHistory());
  }, []);

  // Profile Save Handler: Saves to Local Storage AND Firestore
  const handleSaveProfile = async (newProfile: UserProfile) => {
    saveUserProfile(newProfile);
    setProfile(newProfile);
    setIsOnboardingOpen(false);

    if (firebaseUser) {
      try {
        await saveUserProfileToCloud(firebaseUser.uid, newProfile);
      } catch (err) {
        console.error('Failed to sync profile to cloud:', err);
      }
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('duet_guest_mode');
      setIsGuest(false);
      setFirebaseUser(null);
      setProfile(null);
      setCurrentView('home');
    } catch (err) {
      console.error('Logout error:', err);
    }
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
    if (firebaseUser) {
      saveQuizResultToCloud(firebaseUser.uid, result).catch((err) =>
        console.error('Failed to save quiz result to cloud:', err)
      );
    }
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

  // Auth Loading Screen (Max 1 second timeout protection)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f0fdf4] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-emerald-200 p-2.5 mb-4 animate-bounce">
          <EngineerLogo className="w-full h-full text-emerald-700" />
        </div>
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-bold text-emerald-800">
          {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
        </p>
        <button
          type="button"
          onClick={() => setAuthLoading(false)}
          className="mt-3 text-[11px] text-emerald-700 hover:text-emerald-950 underline font-semibold"
        >
          {language === 'bn' ? 'সরাসরি প্রবেশ করুন' : 'Skip & Enter'}
        </button>
      </div>
    );
  }

  // Not Logged In & Not Guest: Show Auth Screen (Sign Up / Login / Guest Entrance)
  if (!firebaseUser && !isGuest) {
    return (
      <AuthScreen
        language={language}
        onSuccess={() => {
          setAuthLoading(false);
        }}
        onContinueAsGuest={() => {
          setIsGuest(true);
          localStorage.setItem('duet_guest_mode', 'true');
          const localProf = getUserProfile();
          if (localProf && localProf.completedOnboarding) {
            setProfile(localProf);
          } else {
            setIsOnboardingOpen(true);
          }
        }}
      />
    );
  }

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
            userId={firebaseUser?.uid}
            onSyncCloud={async () => {
              if (firebaseUser) await syncCloudQuestions(firebaseUser.uid);
            }}
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
              ফায়ারবেস ক্লাউড ডাটাবেস সংযুক্ত • যেকোনো ডিভাইস সিঙ্ক
            </p>
          </div>
        </footer>
      )}

      {/* Side More Menu Drawer with Language Setting & Account details */}
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
        userEmail={firebaseUser?.email || null}
        onLogout={handleLogout}
        onOpenAuthModal={() => {
          setIsGuest(false);
          localStorage.removeItem('duet_guest_mode');
        }}
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
        canCloseWithoutSave={profile !== null && profile.completedOnboarding}
        onClose={() => {
          if (profile !== null && profile.completedOnboarding) {
            setIsOnboardingOpen(false);
          }
        }}
      />
    </div>
  );
}
