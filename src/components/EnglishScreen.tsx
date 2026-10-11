import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Play,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Trophy,
  Clock,
  Search,
  Sparkles,
  Check,
  X,
  HelpCircle,
  Brain,
  SlidersHorizontal,
  Award,
  Layers,
  Compass,
  Languages,
  Quote,
} from 'lucide-react';
import {
  idiomsData,
  generateIdiomsQuiz,
  generateIdiomsRecall,
  filterIdiomsByRange,
  IdiomMcqStyle,
  IdiomRecallDirection,
  IdiomRangeFilter,
  IdiomQuizQuestion,
  IdiomRecallQuestion,
} from '../data/idiomsData';
import { Language } from '../utils/i18n';

interface EnglishScreenProps {
  language: Language;
  onBack: () => void;
}

type EnglishView = 'hub' | 'idioms';
type IdiomTab = 'quiz' | 'recall' | 'sheet';
type QuizPhase = 'setup' | 'active' | 'result';
type QuizMode = 'exam' | 'practice';

export const EnglishScreen: React.FC<EnglishScreenProps> = ({ language, onBack }) => {
  const [currentView, setCurrentView] = useState<EnglishView>('hub');
  const [activeTab, setActiveTab] = useState<IdiomTab>('quiz');

  // ==========================================
  // 1. MCQ QUIZ STATE
  // ==========================================
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('setup');
  const [quizMode, setQuizMode] = useState<QuizMode>('exam');
  const [quizRange, setQuizRange] = useState<IdiomRangeFilter>('all');
  const [quizStyle, setQuizStyle] = useState<IdiomMcqStyle>('both');
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(15);
  const [quizQuestions, setQuizQuestions] = useState<IdiomQuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [revealedInPractice, setRevealedInPractice] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [examDuration, setExamDuration] = useState<number>(0);

  // ==========================================
  // 2. REVEAL ANSWER (RECALL) STATE
  // ==========================================
  const [recallPhase, setRecallPhase] = useState<QuizPhase>('setup');
  const [recallDirection, setRecallDirection] =
    useState<IdiomRecallDirection>('phrase_to_meaning');
  const [recallRange, setRecallRange] = useState<IdiomRangeFilter>('all');
  const [recallQuestionCount, setRecallQuestionCount] = useState<number>(15);
  const [recallQuestions, setRecallQuestions] = useState<IdiomRecallQuestion[]>([]);
  const [currentRecallIndex, setCurrentRecallIndex] = useState<number>(0);
  const [recallRevealed, setRecallRevealed] = useState<Record<number, boolean>>({});
  const [recallFeedback, setRecallFeedback] = useState<Record<number, 'correct' | 'wrong'>>({});

  // ==========================================
  // 3. STUDY SHEET STATE
  // ==========================================
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sheetRange, setSheetRange] = useState<IdiomRangeFilter>('all');

  const rangeOptions: { value: IdiomRangeFilter; label: string; count: number }[] = [
    { value: 'all', label: 'সবগুলো (১-১৪২)', count: 142 },
    { value: '1-35', label: '১ - ৩৫', count: 35 },
    { value: '36-70', label: '৩৬ - ৭০', count: 35 },
    { value: '71-105', label: '৭১ - ১০৫', count: 35 },
    { value: '106-142', label: '১০৬ - ১৪২', count: 37 },
  ];

  const maxQuizCount = useMemo(() => {
    return filterIdiomsByRange(quizRange).length;
  }, [quizRange]);

  const maxRecallCount = useMemo(() => {
    return filterIdiomsByRange(recallRange).length;
  }, [recallRange]);

  // ------------------------------------------
  // MCQ QUIZ HANDLERS
  // ------------------------------------------
  const handleStartQuiz = () => {
    const questions = generateIdiomsQuiz(quizQuestionCount, quizRange, quizStyle);
    setQuizQuestions(questions);
    setCurrentQuizIndex(0);
    setUserAnswers({});
    setRevealedInPractice({});
    const totalSecs = questions.length * 35; // 35s per idiom question
    setTimeLeft(totalSecs);
    setExamDuration(totalSecs);
    setQuizPhase('active');
  };

  useEffect(() => {
    if (
      currentView !== 'idioms' ||
      activeTab !== 'quiz' ||
      quizPhase !== 'active' ||
      quizMode !== 'exam'
    ) {
      return;
    }
    if (timeLeft <= 0) {
      setQuizPhase('result');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentView, activeTab, quizPhase, quizMode, timeLeft]);

  const handleSelectOption = (optionIndex: number) => {
    if (quizPhase !== 'active') return;
    if (quizMode === 'practice' && revealedInPractice[currentQuizIndex]) return;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuizIndex]: optionIndex,
    }));

    if (quizMode === 'practice') {
      setRevealedInPractice((prev) => ({
        ...prev,
        [currentQuizIndex]: true,
      }));
    }
  };

  const quizStats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    quizQuestions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans === undefined) {
        skipped++;
      } else if (ans === q.correctAnswerIndex) {
        correct++;
      } else {
        wrong++;
      }
    });

    const total = quizQuestions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const score = correct * 1.5;
    const totalMarks = total * 1.5;

    return { correct, wrong, skipped, total, percentage, score, totalMarks };
  }, [quizQuestions, userAnswers]);

  // ------------------------------------------
  // REVEAL ANSWER (RECALL) HANDLERS
  // ------------------------------------------
  const handleStartRecall = () => {
    const questions = generateIdiomsRecall(recallQuestionCount, recallDirection, recallRange);
    setRecallQuestions(questions);
    setCurrentRecallIndex(0);
    setRecallRevealed({});
    setRecallFeedback({});
    setRecallPhase('active');
  };

  const recallStats = useMemo(() => {
    let remembered = 0;
    let forgot = 0;
    let unrated = 0;

    recallQuestions.forEach((_, idx) => {
      const fb = recallFeedback[idx];
      if (fb === 'correct') remembered++;
      else if (fb === 'wrong') forgot++;
      else unrated++;
    });

    const total = recallQuestions.length;
    const percentage = total > 0 ? Math.round((remembered / total) * 100) : 0;

    return { remembered, forgot, unrated, total, percentage };
  }, [recallQuestions, recallFeedback]);

  // ------------------------------------------
  // STUDY SHEET FILTERING
  // ------------------------------------------
  const filteredIdioms = useMemo(() => {
    const base = filterIdiomsByRange(sheetRange);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return base;
    return base.filter(
      (item) =>
        item.phrase.toLowerCase().includes(q) ||
        item.meaningEn.toLowerCase().includes(q) ||
        item.meaningBn.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q) ||
        String(item.id) === q ||
        `#${item.id}` === q
    );
  }, [searchQuery, sheetRange]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  const currentQuizQ = quizQuestions[currentQuizIndex];
  const currentRecallQ = recallQuestions[currentRecallIndex];

  return (
    <div className="space-y-4 pb-10">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-200 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => {
              if (currentView !== 'hub') {
                setCurrentView('hub');
              } else {
                onBack();
              }
            }}
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer flex-shrink-0"
            title={language === 'bn' ? 'ফিরে যান' : 'Go Back'}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-extrabold text-emerald-950 flex items-center gap-1.5 truncate">
                <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  {currentView === 'hub'
                    ? 'ইংরেজি (English)'
                    : 'Idiom and Phrase (বাগধারা)'}
                </span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                ১৪২টি Idiom
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/80 truncate">
              {currentView === 'hub'
                ? 'ডুয়েট ভর্তি প্রস্তুতির Most Important Phrase & Idioms'
                : activeTab === 'quiz'
                ? '১. MCQ কুইজ • ৪টি অপশন ও উদাহরণসহ ব্যাখ্যা'
                : activeTab === 'recall'
                ? '২. Reveal Answer • অপশনহীন মেমোরি টেস্ট'
                : 'সকল ১৪২টি Idiom & Phrase-এর অর্থ ও উদাহরণ তালিকা'}
            </p>
          </div>
        </div>

        {currentView !== 'hub' && (
          <button
            onClick={() => setCurrentView('hub')}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer flex-shrink-0"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">English হাব</span>
          </button>
        )}
      </div>

      {/* ======================= VIEW: ENGLISH HUB ======================= */}
      {currentView === 'hub' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="text-center py-2 space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-emerald-950">
              English প্রস্তুতি হাব
            </h2>
            <p className="text-xs text-emerald-700/80">
              Idiom and Phrase অপশন থেকে MCQ অথবা Reveal Answer অনুশীলন শুরু করুন
            </p>
          </div>

          {/* Main Idiom and Phrase Card */}
          <div className="w-full text-left p-5 sm:p-6 rounded-3xl bg-radial from-emerald-500/10 via-white to-white border-2 border-emerald-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200/70">
                  <BookOpen className="w-7 h-7 text-emerald-700" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ১৪২টি Idiom & Phrase
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                    Road To DUET স্পেশাল
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <span>Idiom and Phrase (বাগধারা ও প্রবাদ)</span>
                </h3>
                <p className="text-xs text-emerald-700/90 mt-1 leading-relaxed">
                  ডুয়েট ভর্তি পরীক্ষার জন্য সর্বাধিক গুরুত্বপূর্ণ ১৪২টি Phrase And Idioms (ABC থেকে Wear and tear পর্যন্ত)—ইংরেজি অর্থ, বাংলা অর্থ ও উদাহরণসহ পূর্ণাঙ্গ প্রস্তুতি। এতে রয়েছে ২টি মোড: <strong>১. MCQ কুইজ</strong> এবং <strong>২. Reveal Answer</strong>।
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-emerald-100/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('quiz');
                  setQuizPhase('setup');
                  setCurrentView('idioms');
                }}
                className="py-3 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-950 border border-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>১. MCQ কুইজ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('recall');
                  setRecallPhase('setup');
                  setCurrentView('idioms');
                }}
                className="py-3 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>২. Reveal Answer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('sheet');
                  setCurrentView('idioms');
                }}
                className="py-3 px-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>স্টাডি শিট (১৪২টি)</span>
              </button>
            </div>
          </div>

          {/* Quick Study Sheet Card */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Quote className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-emerald-950 truncate">
                  Most Important 142 Phrase And Idioms তালিকা
                </h4>
                <p className="text-[11px] text-emerald-700/80 truncate">
                  ইংরেজি অর্থ, বাংলা অর্থ এবং বাক্যে প্রয়োগসহ এক নজরে সম্পূর্ণ তালিকা
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab('sheet');
                setCurrentView('idioms');
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors flex-shrink-0 cursor-pointer whitespace-nowrap"
            >
              তালিকা দেখুন
            </button>
          </div>
        </div>
      )}

      {/* ======================= VIEW: IDIOMS & PHRASES ======================= */}
      {currentView === 'idioms' && (
        <div className="space-y-4">
          {/* 3-Tab Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-emerald-100/80 border border-emerald-200 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/80'
                  : 'text-emerald-800 hover:text-emerald-950 hover:bg-white/50'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">১. MCQ কুইজ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recall')}
              className={`py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'recall'
                  ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/80'
                  : 'text-emerald-800 hover:text-emerald-950 hover:bg-white/50'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">২. Reveal Answer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sheet')}
              className={`py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'sheet'
                  ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/80'
                  : 'text-emerald-800 hover:text-emerald-950 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">স্টাডি শিট (১৪২)</span>
            </button>
          </div>

          {/* ==========================================================
              TAB 1: MCQ QUIZ (নাম/Idiom দেওয়া থাকবে ও ৪টি অপশন থাকবে)
          ========================================================== */}
          {activeTab === 'quiz' && (
            <div>
              {/* Phase 1: Setup */}
              {quizPhase === 'setup' && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                        <Sparkles className="w-5 h-5 text-emerald-700" />
                      </span>
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-emerald-950">
                          Idiom and Phrase — MCQ কুইজ সেটআপ
                        </h2>
                        <p className="text-xs text-emerald-700/80">
                          Idiom দেওয়া থাকবে এবং ৪টি অপশন থেকে সঠিক অর্থ নির্বাচন করতে হবে
                        </p>
                      </div>
                    </div>

                    {/* Serial Range Filter */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-emerald-600" />
                          <span>ক্রমিক নং (Serial Range) নির্বাচন করুন:</span>
                        </label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          মোট {maxQuizCount}টি Idiom
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {rangeOptions.map((r) => (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => {
                              setQuizRange(r.value);
                              setQuizQuestionCount((prev) => Math.min(prev, r.count));
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              quizRange === r.value
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            <div className="text-xs font-extrabold">{r.label}</div>
                            <div
                              className={`text-[10px] mt-0.5 ${
                                quizRange === r.value ? 'text-emerald-100' : 'text-emerald-700/80'
                              }`}
                            >
                              {r.count}টি
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Option Language Style */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-bold text-emerald-950 block">
                        অপশনের ধরন নির্বাচন করুন:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setQuizStyle('both')}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            quizStyle === 'both'
                              ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20'
                              : 'bg-white border-emerald-200 hover:bg-emerald-50/40'
                          }`}
                        >
                          <div className="text-xs font-bold text-emerald-950">
                            ইংরেজি + বাংলা অর্থ
                          </div>
                          <p className="text-[11px] text-emerald-700/80 mt-0.5">
                            যেমন: Declining (অবনতি অবস্থায়)
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setQuizStyle('en_only')}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            quizStyle === 'en_only'
                              ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20'
                              : 'bg-white border-emerald-200 hover:bg-emerald-50/40'
                          }`}
                        >
                          <div className="text-xs font-bold text-emerald-950">
                            শুধু ইংরেজি অর্থ (English)
                          </div>
                          <p className="text-[11px] text-emerald-700/80 mt-0.5">
                            যেমন: Declining / At enmity
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setQuizStyle('bn_only')}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            quizStyle === 'bn_only'
                              ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20'
                              : 'bg-white border-emerald-200 hover:bg-emerald-50/40'
                          }`}
                        >
                          <div className="text-xs font-bold text-emerald-950">
                            শুধু বাংলা অর্থ (বাংলা)
                          </div>
                          <p className="text-[11px] text-emerald-700/80 mt-0.5">
                            যেমন: অবনতি অবস্থায় / শত্রুতাপূর্ণ অবস্থায়
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Question Count Selector */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                          <span>প্রশ্নের সংখ্যা নির্বাচন করুন:</span>
                        </label>
                        <span className="text-sm sm:text-base font-extrabold text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-lg font-mono">
                          {quizQuestionCount >= maxQuizCount
                            ? `সবগুলো (${maxQuizCount}টি)`
                            : `${quizQuestionCount} টি`}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {(quizRange === 'all'
                          ? [15, 25, 40, 70, 142]
                          : [10, 15, 20, 30, maxQuizCount]
                        ).map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setQuizQuestionCount(Math.min(num, maxQuizCount))}
                            className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              quizQuestionCount === num ||
                              (num >= maxQuizCount && quizQuestionCount >= maxQuizCount)
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
                            }`}
                          >
                            {num >= maxQuizCount ? `সব (${maxQuizCount})` : `${num} টি`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quiz Mode Selector */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-bold text-emerald-950 block">
                        কুইজের ধরন নির্বাচন করুন:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setQuizMode('exam')}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                            quizMode === 'exam'
                              ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20'
                              : 'bg-white border-emerald-200 hover:bg-emerald-50/40'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl mt-0.5 ${
                              quizMode === 'exam'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-emerald-950">
                              মডেল এক্সাম মোড (টাইমারসহ)
                            </div>
                            <p className="text-[11px] text-emerald-700/80 mt-0.5">
                              নির্দিষ্ট সময়ের মধ্যে সব উত্তর দিয়ে শেষে ফলাফল ও ব্যাখ্যা দেখুন
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setQuizMode('practice')}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                            quizMode === 'practice'
                              ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20'
                              : 'bg-white border-emerald-200 hover:bg-emerald-50/40'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl mt-0.5 ${
                              quizMode === 'practice'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-emerald-950">
                              ইনস্ট্যান্ট প্র্যাকটিস মোড
                            </div>
                            <p className="text-[11px] text-emerald-700/80 mt-0.5">
                              অপশন সিলেক্ট করার সাথে সাথেই সঠিক অর্থ ও উদাহরণ দেখুন
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartQuiz}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>MCQ কুইজ শুরু করুন ({quizQuestionCount}টি প্রশ্ন)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Phase 2: Active Quiz */}
              {quizPhase === 'active' && currentQuizQ && (
                <div className="space-y-4">
                  {/* Top Status Bar */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
                        প্রশ্ন {currentQuizIndex + 1} / {quizQuestions.length}
                      </span>
                      <span className="text-xs text-emerald-700 font-medium hidden sm:inline">
                        উত্তর দিয়েছেন: {Object.keys(userAnswers).length}টি
                      </span>
                    </div>

                    {quizMode === 'exam' ? (
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-bold text-xs border ${
                          timeLeft < 30
                            ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTime(timeLeft)}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        প্র্যাকটিস মোড
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setQuizPhase('result')}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      সাবমিট করুন
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{
                        width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Question Card */}
                  <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Idiom & Phrase #{currentQuizQ.idiomId}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700">
                        মান: ১.৫ নম্বর
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                      <div className="text-lg sm:text-xl font-extrabold text-emerald-950 font-mono">
                        “{currentQuizQ.phrase}”
                      </div>
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-emerald-950 leading-relaxed">
                      {currentQuizQ.questionText}
                    </h2>

                    {/* 4 Options */}
                    <div className="space-y-2.5">
                      {currentQuizQ.options.map((opt, idx) => {
                        const isSelected = userAnswers[currentQuizIndex] === idx;
                        const isRevealed =
                          quizMode === 'practice' && revealedInPractice[currentQuizIndex];
                        const isCorrect = idx === currentQuizQ.correctAnswerIndex;

                        let btnStyle =
                          'bg-white border-emerald-200 text-emerald-950 hover:bg-emerald-50/70 hover:border-emerald-300';
                        let badgeStyle = 'bg-emerald-100 text-emerald-800';

                        if (isRevealed) {
                          if (isCorrect) {
                            btnStyle =
                              'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20';
                            badgeStyle = 'bg-emerald-600 text-white';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-red-50 border-red-400 text-red-950';
                            badgeStyle = 'bg-red-600 text-white';
                          }
                        } else if (isSelected) {
                          btnStyle =
                            'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20';
                          badgeStyle = 'bg-emerald-600 text-white';
                        }

                        const optionLetters = ['ক', 'খ', 'গ', 'ঘ'];

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectOption(idx)}
                            className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${badgeStyle}`}
                              >
                                {optionLetters[idx]}
                              </span>
                              <span className="text-sm sm:text-base font-bold">{opt}</span>
                            </div>

                            {isRevealed && isCorrect && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            )}
                            {isRevealed && isSelected && !isCorrect && (
                              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Instant Practice Explanation */}
                    {quizMode === 'practice' && revealedInPractice[currentQuizIndex] && (
                      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs sm:text-sm text-emerald-950 space-y-1.5 animate-in fade-in-50 duration-200">
                        <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>ব্যাখ্যা ও অর্থ:</span>
                        </div>
                        <p className="text-emerald-900 leading-relaxed">
                          <strong>{currentQuizQ.phrase}</strong> — এর ইংরেজি অর্থ{' '}
                          <strong>{currentQuizQ.meaningEn}</strong> এবং বাংলা অর্থ{' '}
                          <strong>‘{currentQuizQ.meaningBn}’</strong>।
                        </p>
                        <p className="text-emerald-700 italic">
                          উদাহরণ: “{currentQuizQ.example}”
                        </p>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-emerald-100">
                      <button
                        type="button"
                        onClick={() => setCurrentQuizIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuizIndex === 0}
                        className="px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>পূর্ববর্তী</span>
                      </button>

                      {currentQuizIndex < quizQuestions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentQuizIndex((prev) =>
                              Math.min(quizQuestions.length - 1, prev + 1)
                            )
                          }
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>পরবর্তী প্রশ্ন</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setQuizPhase('result')}
                          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Trophy className="w-4 h-4" />
                          <span>ফলাফল দেখুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Phase 3: Quiz Result */}
              {quizPhase === 'result' && (
                <div className="space-y-4">
                  <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs text-center space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                      <Award className="w-9 h-9" />
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        Idiom & Phrase কুইজ সম্পন্ন
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-2">
                        আপনার স্কোর: {quizStats.score} / {quizStats.totalMarks}
                      </h2>
                      <p className="text-xs text-emerald-700 mt-1">
                        সঠিকতার হার: {quizStats.percentage}% • সময় ব্যয়:{' '}
                        {formatTime(Math.max(0, examDuration - timeLeft))}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <div className="text-lg font-extrabold text-emerald-700 font-mono">
                          {quizStats.correct}
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-800">
                          সঠিক উত্তর
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                        <div className="text-lg font-extrabold text-red-600 font-mono">
                          {quizStats.wrong}
                        </div>
                        <div className="text-[11px] font-semibold text-red-800">ভুল উত্তর</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                        <div className="text-lg font-extrabold text-amber-700 font-mono">
                          {quizStats.skipped}
                        </div>
                        <div className="text-[11px] font-semibold text-amber-800">স্কিপড</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleStartQuiz}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>আবার কুইজ দিন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuizPhase('setup')}
                        className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-200 transition-all cursor-pointer"
                      >
                        সেটিংস পরিবর্তন
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('recall');
                          setRecallPhase('setup');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Reveal Answer প্র্যাকটিস</span>
                      </button>
                    </div>
                  </div>

                  {/* Detailed Review */}
                  <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-3">
                    <h3 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>সকল প্রশ্নের উত্তর ও ব্যাখ্যা ({quizQuestions.length}টি)</span>
                    </h3>

                    <div className="space-y-3">
                      {quizQuestions.map((q, idx) => {
                        const userAns = userAnswers[idx];
                        const isCorrect = userAns === q.correctAnswerIndex;
                        const isSkipped = userAns === undefined;

                        return (
                          <div
                            key={q.id}
                            className={`p-3.5 sm:p-4 rounded-2xl border ${
                              isCorrect
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : isSkipped
                                ? 'bg-amber-50/30 border-amber-200'
                                : 'bg-red-50/30 border-red-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                                #{idx + 1} • {q.phrase} (ক্রমিক #{q.idiomId})
                              </span>
                              {isCorrect ? (
                                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> সঠিক (+১.৫)
                                </span>
                              ) : isSkipped ? (
                                <span className="text-[11px] font-bold text-amber-700">
                                  উত্তর দেননি
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> ভুল
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-2">
                              <div className="p-2 rounded-xl bg-white border border-emerald-200">
                                <span className="text-emerald-700/80 block text-[10px]">
                                  সঠিক অর্থ:
                                </span>
                                <span className="font-bold text-emerald-900">
                                  {q.meaningEn} ({q.meaningBn})
                                </span>
                              </div>
                              {!isCorrect && !isSkipped && (
                                <div className="p-2 rounded-xl bg-white border border-red-200">
                                  <span className="text-red-700/80 block text-[10px]">
                                    আপনার উত্তর:
                                  </span>
                                  <span className="font-bold text-red-700">
                                    {q.options[userAns]}
                                  </span>
                                </div>
                              )}
                            </div>

                            <p className="text-[11px] text-emerald-700 italic mt-2">
                              Example: {q.example}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================================
              TAB 2: REVEAL ANSWER (অপশনহীন সেলফ-টেস্ট)
          ========================================================== */}
          {activeTab === 'recall' && (
            <div>
              {/* Phase 1: Setup */}
              {recallPhase === 'setup' && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                        <Brain className="w-5 h-5 text-emerald-700" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-extrabold text-emerald-950">
                            Idiom & Phrase — Reveal Answer টেস্ট
                          </h2>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            অপশনহীন
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700/80">
                          কোনো অপশন থাকবে না—মনে মনে অর্থ ভেবে ‘Reveal Answer’ বাটনে ট্যাপ করে উত্তর মিলিয়ে নিন
                        </p>
                      </div>
                    </div>

                    {/* Recall Direction */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-bold text-emerald-950 block">
                        প্রশ্নের ধরন নির্বাচন করুন:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setRecallDirection('phrase_to_meaning')}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            recallDirection === 'phrase_to_meaning'
                              ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20'
                              : 'bg-white border-emerald-200 hover:bg-emerald-50/40'
                          }`}
                        >
                          <div className="text-xs font-extrabold text-emerald-950">
                            Idiom ➔ অর্থ
                          </div>
                          <p className="text-[11px] text-emerald-700/80 mt-0.5">
                            Idiom দেওয়া থাকবে, ইংরেজি ও বাংলা অর্থ মনে করতে হবে
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRecallDirection('meaning_to_phrase')}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            recallDirection === 'meaning_to_phrase'
                              ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20'
                              : 'bg-white border-emerald-200 hover:bg-emerald-50/40'
                          }`}
                        >
                          <div className="text-xs font-extrabold text-emerald-950">
                            অর্থ ➔ Idiom
                          </div>
                          <p className="text-[11px] text-emerald-700/80 mt-0.5">
                            অর্থ দেওয়া থাকবে, সঠিক Idiom/Phrase মনে করতে হবে
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRecallDirection('mixed')}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            recallDirection === 'mixed'
                              ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20'
                              : 'bg-white border-emerald-200 hover:bg-emerald-50/40'
                          }`}
                        >
                          <div className="text-xs font-extrabold text-emerald-950">
                            মিক্সড মোড (উভয়)
                          </div>
                          <p className="text-[11px] text-emerald-700/80 mt-0.5">
                            উভয় ধরনের প্রশ্ন মিলিয়ে অনুশীলন হবে
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Range Selector */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-emerald-600" />
                          <span>ক্রমিক নং (Serial Range) নির্বাচন করুন:</span>
                        </label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          মোট {maxRecallCount}টি Idiom
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {rangeOptions.map((r) => (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => {
                              setRecallRange(r.value);
                              setRecallQuestionCount((prev) => Math.min(prev, r.count));
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              recallRange === r.value
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            <div className="text-xs font-extrabold">{r.label}</div>
                            <div
                              className={`text-[10px] mt-0.5 ${
                                recallRange === r.value
                                  ? 'text-emerald-100'
                                  : 'text-emerald-700/80'
                              }`}
                            >
                              {r.count}টি
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Question Count */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                          <span>অনুশীলনের জন্য Idiom সংখ্যা:</span>
                        </label>
                        <span className="text-sm sm:text-base font-extrabold text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-lg font-mono">
                          {recallQuestionCount >= maxRecallCount
                            ? `সবগুলো (${maxRecallCount}টি)`
                            : `${recallQuestionCount} টি`}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {(recallRange === 'all'
                          ? [15, 25, 40, 70, 142]
                          : [10, 15, 20, 30, maxRecallCount]
                        ).map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setRecallQuestionCount(Math.min(num, maxRecallCount))}
                            className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              recallQuestionCount === num ||
                              (num >= maxRecallCount && recallQuestionCount >= maxRecallCount)
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
                            }`}
                          >
                            {num >= maxRecallCount ? `সব (${maxRecallCount})` : `${num} টি`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartRecall}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Reveal Answer টেস্ট শুরু করুন ({recallQuestionCount}টি)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Phase 2: Active Reveal Answer */}
              {recallPhase === 'active' && currentRecallQ && (
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
                        কার্ড {currentRecallIndex + 1} / {recallQuestions.length}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 hidden sm:inline">
                        মনে ছিল: {recallStats.remembered} • ভুলে গিয়েছি: {recallStats.forgot}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRecallPhase('result')}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      সেশন শেষ করুন
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{
                        width: `${((currentRecallIndex + 1) / recallQuestions.length) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Recall Prompt Card */}
                  <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Idiom #{currentRecallQ.idiomId} •{' '}
                        {currentRecallQ.direction === 'phrase_to_meaning'
                          ? 'Idiom ➔ অর্থ'
                          : 'অর্থ ➔ Idiom'}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5 text-emerald-600" />
                        <span>অপশনহীন মেমোরি টেস্ট</span>
                      </span>
                    </div>

                    {/* Prompt Box */}
                    <div className="p-6 sm:p-8 rounded-2xl bg-emerald-50/70 border-2 border-dashed border-emerald-200 text-center space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                        {currentRecallQ.direction === 'phrase_to_meaning'
                          ? 'নিচের Idiom/Phrase-টির ইংরেজি ও বাংলা অর্থ মনে করুন:'
                          : 'নিচের অর্থটির সঠিক Idiom/Phrase মনে করুন:'}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 font-mono">
                        {currentRecallQ.promptTitle}
                      </h2>
                      <p className="text-xs text-emerald-700/90 mt-1">
                        {currentRecallQ.promptSubtitle}
                      </p>
                    </div>

                    {/* Reveal Button OR Revealed Answer Box */}
                    {!recallRevealed[currentRecallIndex] ? (
                      <button
                        type="button"
                        onClick={() =>
                          setRecallRevealed((prev) => ({
                            ...prev,
                            [currentRecallIndex]: true,
                          }))
                        }
                        className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-5 h-5" />
                        <span>উত্তর দেখুন (Reveal Answer)</span>
                      </button>
                    ) : (
                      <div className="space-y-4 animate-in fade-in-50 duration-200">
                        {/* Revealed Details */}
                        <div className="p-5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-500/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-emerald-600" />
                              <span>সঠিক উত্তর (Revealed Answer):</span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setRecallRevealed((prev) => ({
                                  ...prev,
                                  [currentRecallIndex]: false,
                                }))
                              }
                              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>লুকান</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div className="p-3 rounded-xl bg-white border border-emerald-200">
                              <span className="text-[10px] font-bold text-emerald-700 block">
                                Idiom / Phrase:
                              </span>
                              <span className="text-sm sm:text-base font-extrabold text-emerald-950 font-mono">
                                {currentRecallQ.phrase}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white border border-emerald-200">
                              <span className="text-[10px] font-bold text-emerald-700 block">
                                English Meaning:
                              </span>
                              <span className="text-sm sm:text-base font-extrabold text-emerald-900">
                                {currentRecallQ.meaningEn}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white border border-emerald-200">
                              <span className="text-[10px] font-bold text-emerald-700 block">
                                বাংলা অর্থ:
                              </span>
                              <span className="text-sm sm:text-base font-extrabold text-emerald-950">
                                {currentRecallQ.meaningBn}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-white/90 border border-emerald-200/80 text-xs text-emerald-900">
                            <span className="font-bold text-emerald-800">Example: </span>
                            <span className="italic">“{currentRecallQ.example}”</span>
                          </div>
                        </div>

                        {/* Self Evaluation Buttons */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-emerald-900 block text-center">
                            আপনার কি উত্তরটি সঠিকভাবে মনে পড়েছিল?
                          </span>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setRecallFeedback((prev) => ({
                                  ...prev,
                                  [currentRecallIndex]: 'correct',
                                }))
                              }
                              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                                recallFeedback[currentRecallIndex] === 'correct'
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              <Check className="w-4 h-4" />
                              <span>মনে ছিল (+১)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setRecallFeedback((prev) => ({
                                  ...prev,
                                  [currentRecallIndex]: 'wrong',
                                }))
                              }
                              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                                recallFeedback[currentRecallIndex] === 'wrong'
                                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                  : 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100'
                              }`}
                            >
                              <X className="w-4 h-4" />
                              <span>ভুলে গিয়েছিলাম (০)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-emerald-100">
                      <button
                        type="button"
                        onClick={() => setCurrentRecallIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentRecallIndex === 0}
                        className="px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>পূর্ববর্তী</span>
                      </button>

                      {currentRecallIndex < recallQuestions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentRecallIndex((prev) =>
                              Math.min(recallQuestions.length - 1, prev + 1)
                            )
                          }
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>পরবর্তী প্রশ্ন</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRecallPhase('result')}
                          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Trophy className="w-4 h-4" />
                          <span>ফলাফল দেখুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Phase 3: Recall Result */}
              {recallPhase === 'result' && (
                <div className="space-y-4">
                  <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs text-center space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                      <Brain className="w-9 h-9" />
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        Reveal Answer সেশন সম্পন্ন
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-2">
                        মনে ছিল: {recallStats.remembered} / {recallStats.total}
                      </h2>
                      <p className="text-xs text-emerald-700 mt-1">
                        স্মরণ রাখার হার: {recallStats.percentage}%
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <div className="text-lg font-extrabold text-emerald-700 font-mono">
                          {recallStats.remembered}
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-800">মনে ছিল</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                        <div className="text-lg font-extrabold text-red-600 font-mono">
                          {recallStats.forgot}
                        </div>
                        <div className="text-[11px] font-semibold text-red-800">
                          ভুলে গিয়েছিলাম
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                        <div className="text-lg font-extrabold text-amber-700 font-mono">
                          {recallStats.unrated}
                        </div>
                        <div className="text-[11px] font-semibold text-amber-800">আনরেটেড</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleStartRecall}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>আবার প্র্যাকটিস করুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecallPhase('setup')}
                        className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-200 transition-all cursor-pointer"
                      >
                        সেটিংস পরিবর্তন
                      </button>
                    </div>
                  </div>

                  {/* Recall Summary List */}
                  <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-3">
                    <h3 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>অনুশীলনকৃত Idiom সমূহ ({recallQuestions.length}টি)</span>
                    </h3>

                    <div className="space-y-2.5">
                      {recallQuestions.map((q, idx) => {
                        const fb = recallFeedback[idx];
                        return (
                          <div
                            key={q.id}
                            className={`p-3.5 rounded-2xl border ${
                              fb === 'correct'
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : fb === 'wrong'
                                ? 'bg-red-50/30 border-red-200'
                                : 'bg-amber-50/30 border-amber-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-mono font-bold text-emerald-950">
                                #{q.idiomId} • {q.phrase}
                              </span>
                              {fb === 'correct' ? (
                                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> মনে ছিল
                                </span>
                              ) : fb === 'wrong' ? (
                                <span className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> ভুলে গিয়েছিলাম
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                                  <HelpCircle className="w-3.5 h-3.5" /> আনরেটেড
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-emerald-900">
                              <strong>অর্থ:</strong> {q.meaningEn} ({q.meaningBn})
                            </div>
                            <div className="text-[11px] text-emerald-700 italic mt-0.5">
                              Example: {q.example}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================================
              TAB 3: STUDY SHEET (১৪২টি Idiom এবং অর্থ ও উদাহরণ)
          ========================================================== */}
          {activeTab === 'sheet' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-3">
                {/* Range Filter Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-emerald-50/80 rounded-xl border border-emerald-200">
                  {rangeOptions.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSheetRange(r.value)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        sheetRange === r.value
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-emerald-800 hover:text-emerald-950'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Idiom, ইংরেজি বা বাংলা অর্থ অথবা ক্রমিক নং (যেমন: 15) লিখে খুঁজুন..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 placeholder:text-emerald-600/60 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold px-1">
                  <span>প্রদর্শিত হচ্ছে: {filteredIdioms.length}টি Idiom & Phrase</span>
                  <span>মোট ভাণ্ডার: {idiomsData.length}টি</span>
                </div>
              </div>

              {/* Idioms List */}
              <div className="grid grid-cols-1 gap-2.5">
                {filteredIdioms.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white border border-emerald-200/90 hover:border-emerald-400 shadow-2xs transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
                          #{item.id}
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-emerald-950 font-mono">
                          {item.phrase}
                        </h3>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 flex-shrink-0">
                        {item.meaningBn}
                      </span>
                    </div>

                    <div className="text-xs text-emerald-800">
                      <span className="font-semibold text-emerald-700">English Meaning: </span>
                      <span className="font-bold text-emerald-950">{item.meaningEn}</span>
                    </div>

                    <p className="text-xs text-emerald-700/90 italic bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100">
                      <span className="font-semibold not-italic text-emerald-800">Example: </span>
                      {item.example}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
