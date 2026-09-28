import React, { useState, useEffect, useMemo } from 'react';
import {
  FlaskConical,
  BookOpen,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Timer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  Award,
  Layers,
  GraduationCap,
  SlidersHorizontal,
  Flame,
  AlertCircle,
  Atom,
  ArrowRight,
  Eye,
  EyeOff,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Info,
} from 'lucide-react';
import {
  radicalsData,
  radicalConcepts,
  generateRadicalsQuiz,
  generateRadicalsRecall,
  radicalsGroupStats,
  RadicalItem,
  RadicalQuizQuestion,
  RadicalRecallQuestion,
  RadicalRecallDirection,
  RadicalGroup,
} from '../data/radicalsData';
import { Language } from '../utils/i18n';

export interface RadicalsScreenProps {
  language: Language;
  onBack: () => void;
  hideHeader?: boolean;
  initialTab?: 'quiz' | 'recall' | 'sheet';
}

type MainTab = 'quiz' | 'recall' | 'sheet';
type QuizPhase = 'setup' | 'active' | 'result';
type QuizMode = 'exam' | 'practice';

export const RadicalsScreen: React.FC<RadicalsScreenProps> = ({
  language,
  onBack,
  hideHeader = false,
  initialTab = 'quiz',
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ==========================================
  // TAB 1: MCQ QUIZ STATE
  // ==========================================
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('setup');
  const [quizMode, setQuizMode] = useState<QuizMode>('exam');
  const [quizGroup, setQuizGroup] = useState<RadicalGroup>('both');
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(15);
  const [quizCategory, setQuizCategory] = useState<string>('সবগুলো');
  const [quizQuestions, setQuizQuestions] = useState<RadicalQuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [revealedInPractice, setRevealedInPractice] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // ==========================================
  // TAB 2: REVEAL / SELF-RECALL STATE
  // ==========================================
  const [recallPhase, setRecallPhase] = useState<QuizPhase>('setup');
  const [recallDirection, setRecallDirection] = useState<RadicalRecallDirection>('name_to_formula');
  const [recallGroup, setRecallGroup] = useState<RadicalGroup>('both');
  const [recallQuestionCount, setRecallQuestionCount] = useState<number>(15);
  const [recallCategory, setRecallCategory] = useState<string>('সবগুলো');
  const [recallQuestions, setRecallQuestions] = useState<RadicalRecallQuestion[]>([]);
  const [currentRecallIndex, setCurrentRecallIndex] = useState<number>(0);
  const [recallRevealed, setRecallRevealed] = useState<Record<number, boolean>>({});
  const [recallFeedback, setRecallFeedback] = useState<Record<number, 'correct' | 'wrong'>>({});

  // ==========================================
  // TAB 3: STUDY SHEET STATE
  // ==========================================
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sheetCategory, setSheetCategory] = useState<string>('সবগুলো');
  const [sheetGroup, setSheetGroup] = useState<RadicalGroup>('both');

  // Category filters
  const categories = [
    'সবগুলো',
    'একযোজী (যোজনী ১)',
    'দ্বিযোজী (যোজনী ২)',
    'ত্রিযোজী (যোজনী ৩)',
    'চতুর্থযোজী (যোজনী ৪)',
    'জটিল আয়ন',
    'বিশেষ অ্যানায়ন',
  ];

  // ------------------------------------------
  // MCQ QUIZ HANDLERS
  // ------------------------------------------
  const maxQuizCount = useMemo(() => {
    let source = radicalsData;
    if (quizGroup !== 'both') source = source.filter((r) => r.group === quizGroup);
    if (quizCategory !== 'সবগুলো') source = source.filter((r) => r.category === quizCategory);
    return Math.max(1, source.length);
  }, [quizGroup, quizCategory]);

  const maxRecallCount = useMemo(() => {
    let source = radicalsData;
    if (recallGroup !== 'both') source = source.filter((r) => r.group === recallGroup);
    if (recallCategory !== 'সবগুলো') source = source.filter((r) => r.category === recallCategory);
    return Math.max(1, source.length);
  }, [recallGroup, recallCategory]);

  const handleStartQuiz = () => {
    const questions = generateRadicalsQuiz(quizQuestionCount, quizCategory, quizGroup);
    setQuizQuestions(questions);
    setCurrentQuizIndex(0);
    setUserAnswers({});
    setRevealedInPractice({});
    const totalSecs = questions.length * 40;
    setTimeLeft(totalSecs);
    setQuizPhase('active');
  };

  useEffect(() => {
    if (quizPhase !== 'active' || quizMode !== 'exam') return;

    if (timeLeft <= 0) {
      setQuizPhase('result');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setQuizPhase('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizPhase, quizMode, timeLeft]);

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

  const quizResultStats = useMemo(() => {
    if (quizQuestions.length === 0) return { score: 0, correct: 0, wrong: 0, skipped: 0, percentage: 0 };
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    quizQuestions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans === undefined) skipped++;
      else if (ans === q.correctAnswerIndex) correct++;
      else wrong++;
    });

    const percentage = Math.round((correct / quizQuestions.length) * 100);
    return { score: correct, correct, wrong, skipped, percentage };
  }, [quizQuestions, userAnswers]);

  // ------------------------------------------
  // RECALL / REVEAL HANDLERS
  // ------------------------------------------
  const handleStartRecall = () => {
    const questions = generateRadicalsRecall(recallQuestionCount, recallDirection, recallCategory, recallGroup);
    setRecallQuestions(questions);
    setCurrentRecallIndex(0);
    setRecallRevealed({});
    setRecallFeedback({});
    setRecallPhase('active');
  };

  const recallResultStats = useMemo(() => {
    if (recallQuestions.length === 0) return { total: 0, remembered: 0, forgot: 0, unrated: 0, percentage: 0 };
    let remembered = 0;
    let forgot = 0;
    let unrated = 0;

    recallQuestions.forEach((_, idx) => {
      const fb = recallFeedback[idx];
      if (fb === 'correct') remembered++;
      else if (fb === 'wrong') forgot++;
      else unrated++;
    });

    const rated = remembered + forgot;
    const percentage = rated > 0 ? Math.round((remembered / rated) * 100) : 0;
    return { total: recallQuestions.length, remembered, forgot, unrated, percentage };
  }, [recallQuestions, recallFeedback]);

  // ------------------------------------------
  // STUDY SHEET FILTER
  // ------------------------------------------
  const filteredRadicals = useMemo(() => {
    return radicalsData.filter((item) => {
      if (sheetGroup !== 'both' && item.group !== sheetGroup) {
        return false;
      }
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.nameBn.toLowerCase().includes(q) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(q)) ||
        item.formula.toLowerCase().includes(q) ||
        item.charge.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (sheetCategory === 'সবগুলো') return true;
      return item.category === sheetCategory;
    });
  }, [searchQuery, sheetCategory, sheetGroup]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const currentQuizQ = quizQuestions[currentQuizIndex];
  const currentRecallQ = recallQuestions[currentRecallIndex];

  return (
    <div className={hideHeader ? 'space-y-4 animate-in fade-in-50 duration-200' : 'max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5'}>
      {/* 1. Header Bar (Shown when not embedded) */}
      {!hideHeader && (
        <div className="flex items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-100 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="রসায়ন মেনুতে ফিরে যান"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>যৌগমূলক (Radicals)</span>
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  সংকেত ও যোজনী
                </span>
              </div>
              <p className="text-[11px] text-emerald-700/80">
                ডুয়েট ভর্তি প্রস্তুতির ৪৯টি যৌগমূলকের সংকেত, চার্জ ও যোজনী
              </p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
          >
            মেনু
          </button>
        </div>
      )}

      {/* 2. Main Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl">
        <button
          onClick={() => {
            setActiveTab('quiz');
            setQuizPhase('setup');
          }}
          className={`py-2 px-1 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'quiz'
              ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200'
              : 'text-emerald-700 hover:text-emerald-950'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>MCQ কুইজ</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('recall');
            setRecallPhase('setup');
          }}
          className={`py-2 px-1 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
            activeTab === 'recall'
              ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200'
              : 'text-emerald-700 hover:text-emerald-950'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>রিভেল টেস্ট</span>
          <span className="text-[8px] font-black px-1 py-0.2 rounded bg-amber-200 text-amber-900 hidden sm:inline">
            নতুন
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sheet')}
          className={`py-2 px-1 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'sheet'
              ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200'
              : 'text-emerald-700 hover:text-emerald-950'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>স্টাডি শিট ({radicalsData.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MCQ QUIZ MODE                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'quiz' && (
        <div>
          {/* Phase 1: Setup */}
          {quizPhase === 'setup' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <FlaskConical className="w-5 h-5 text-emerald-700" />
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-emerald-950">
                      যৌগমূলক MCQ কুইজ
                    </h2>
                    <p className="text-xs text-emerald-700/80">
                      যৌগমূলকের নাম দেখে ৪টি অপশন থেকে সঠিক সংকেত ও চার্জ নির্বাচন করুন
                    </p>
                  </div>
                </div>

                {/* Group Selector (A, B, or Both) */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>যৌগমূলকের গ্রুপ নির্বাচন করুন:</span>
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {quizGroup === 'A' ? 'গ্রুপ A (২৮টি)' : quizGroup === 'B' ? 'গ্রুপ B (২১টি)' : 'উভয় গ্রুপ (৪৯টি)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setQuizGroup('both');
                        setQuizQuestionCount((prev) => Math.min(prev, radicalsGroupStats.total));
                      }}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        quizGroup === 'both'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-extrabold">উভয় গ্রুপ (AB)</div>
                      <div className={`text-[10px] mt-0.5 ${quizGroup === 'both' ? 'text-emerald-100' : 'text-emerald-700/80'}`}>
                        সকল {radicalsGroupStats.total}টি মূলক
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setQuizGroup('A');
                        setQuizQuestionCount((prev) => Math.min(prev, radicalsGroupStats.groupA));
                      }}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        quizGroup === 'A'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-extrabold">গ্রুপ A</div>
                      <div className={`text-[10px] mt-0.5 ${quizGroup === 'A' ? 'text-emerald-100' : 'text-emerald-700/80'}`}>
                        {radicalsGroupStats.groupA}টি মূলক
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setQuizGroup('B');
                        setQuizQuestionCount((prev) => Math.min(prev, radicalsGroupStats.groupB));
                      }}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        quizGroup === 'B'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-extrabold">গ্রুপ B</div>
                      <div className={`text-[10px] mt-0.5 ${quizGroup === 'B' ? 'text-amber-100' : 'text-amber-700/80'}`}>
                        {radicalsGroupStats.groupB}টি মূলক
                      </div>
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
                      {quizQuestionCount >= maxQuizCount ? `সবগুলো (${maxQuizCount}টি)` : `${quizQuestionCount} টি`}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {(quizGroup === 'B'
                      ? [5, 10, 15, 20, radicalsGroupStats.groupB]
                      : quizGroup === 'A'
                      ? [10, 15, 20, 25, radicalsGroupStats.groupA]
                      : [10, 15, 20, 30, radicalsData.length]
                    ).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuizQuestionCount(Math.min(num, maxQuizCount))}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          quizQuestionCount === num || (num >= maxQuizCount && quizQuestionCount >= maxQuizCount)
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-102'
                            : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
                        }`}
                      >
                        {num >= maxQuizCount ? 'সবগুলো' : `${num} টি`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-950">যৌগমূলকের শ্রেণি নির্বাচন করুন:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setQuizCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          quizCategory === cat
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exam vs Practice Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-950">কুইজ মোড বেছে নিন:</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setQuizMode('exam')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        quizMode === 'exam'
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-emerald-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Timer className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs sm:text-sm font-bold text-emerald-950">
                          মডেল এক্সাম
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700/80 leading-relaxed">
                        টাইমারসহ রিয়েল এক্সাম। শেষে মার্ক ও পূর্ণাঙ্গ শিট।
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuizMode('practice')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        quizMode === 'practice'
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-emerald-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-4 h-4 text-amber-600" />
                        <span className="text-xs sm:text-sm font-bold text-emerald-950">
                          অনুশীলন মোড
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700/80 leading-relaxed">
                        অপশনে ক্লিক করার সাথেই সঠিক সংকেত ও ব্যাখ্যা দৃশ্যমান।
                      </p>
                    </button>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={handleStartQuiz}
                  className="w-full py-3.5 rounded-xl font-bold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 hover:shadow-md transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span>কুইজ শুরু করুন ({quizQuestionCount} টি প্রশ্ন)</span>
                </button>
              </div>
            </div>
          )}

          {/* Phase 2: Active MCQ Quiz */}
          {quizPhase === 'active' && currentQuizQ && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    প্রশ্ন {currentQuizIndex + 1} / {quizQuestions.length}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 hidden sm:inline">
                    {quizMode === 'exam' ? 'এক্সাম মোড' : 'অনুশীলন মোড'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {quizMode === 'exam' && (
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold border ${
                        timeLeft <= 45
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>{formatTime(timeLeft)}</span>
                    </div>
                  )}

                  <button
                    onClick={() => setQuizPhase('result')}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    সাবমিট
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Card */}
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    যৌগমূলকের সংকেত নির্ণয়
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      currentQuizQ.group === 'B'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                    }`}
                  >
                    গ্রুপ {currentQuizQ.group}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-emerald-950 mt-2 leading-relaxed">
                  {currentQuizQ.questionText}
                </h2>

                {/* 4 Options */}
                <div className="space-y-2.5">
                  {currentQuizQ.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[currentQuizIndex] === optIdx;
                    const isCorrect = optIdx === currentQuizQ.correctAnswerIndex;
                    const isRevealed = quizMode === 'practice' && revealedInPractice[currentQuizIndex];

                    let btnStyle =
                      'bg-white border-emerald-200 text-emerald-950 hover:bg-emerald-50/70 hover:border-emerald-300';
                    let badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';

                    if (isRevealed) {
                      if (isCorrect) {
                        btnStyle =
                          'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                        badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                      } else if (isSelected && !isCorrect) {
                        btnStyle =
                          'bg-rose-50 border-rose-400 text-rose-950 font-medium ring-2 ring-rose-400/20';
                        badgeStyle = 'bg-rose-600 text-white border-rose-600';
                      }
                    } else if (isSelected) {
                      btnStyle =
                        'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                      badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                    }

                    const optLabels = ['A', 'B', 'C', 'D'];

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs border flex-shrink-0 ${badgeStyle}`}
                          >
                            {optLabels[optIdx]}
                          </span>
                          <span className="text-base sm:text-lg font-bold font-mono tracking-wide">
                            {opt}
                          </span>
                        </div>

                        {isRevealed && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                        {isRevealed && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Practice Explanation */}
                {quizMode === 'practice' && revealedInPractice[currentQuizIndex] && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 animate-in fade-in duration-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                      <span>যৌগমূলকের বিবরণ ও যোজনী:</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      {currentQuizQ.explanation}
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-emerald-100">
                  <button
                    onClick={() => setCurrentQuizIndex((p) => Math.max(0, p - 1))}
                    disabled={currentQuizIndex === 0}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      currentQuizIndex === 0
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>পূর্ববর্তী</span>
                  </button>

                  {currentQuizIndex < quizQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuizIndex((p) => Math.min(quizQuestions.length - 1, p + 1))}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>পরবর্তী প্রশ্ন</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setQuizPhase('result')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>কুইজ শেষ করুন</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Map */}
              <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span>প্রশ্ন তালিকা:</span>
                  <span className="text-[11px] font-normal text-emerald-700">
                    উত্তর দেওয়া হয়েছে: {Object.keys(userAnswers).length} / {quizQuestions.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quizQuestions.map((_, qIdx) => {
                    const isAnswered = userAnswers[qIdx] !== undefined;
                    const isCurrent = currentQuizIndex === qIdx;
                    return (
                      <button
                        key={qIdx}
                        onClick={() => setCurrentQuizIndex(qIdx)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-800 text-white ring-2 ring-emerald-500/50 scale-105'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Phase 3: MCQ Result Screen */}
          {quizPhase === 'result' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Award className="w-8 h-8 text-emerald-700" />
                </div>

                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    যৌগমূলক কুইজ ফলাফল
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono mt-1">
                    {quizResultStats.score} / {quizQuestions.length}
                  </h2>
                  <p className="text-xs text-emerald-800 mt-1">
                    প্রাপ্ত নম্বর: {quizResultStats.percentage}% ({quizResultStats.score * 1.5} /{' '}
                    {quizQuestions.length * 1.5})
                  </p>
                </div>

                {/* Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="block text-[10px] font-semibold text-emerald-700">সঠিক</span>
                    <span className="text-base font-extrabold text-emerald-800 font-mono">
                      {quizResultStats.correct}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                    <span className="block text-[10px] font-semibold text-rose-700">ভুল</span>
                    <span className="text-base font-extrabold text-rose-800 font-mono">
                      {quizResultStats.wrong}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block text-[10px] font-semibold text-slate-600">বাদ দেওয়া</span>
                    <span className="text-base font-extrabold text-slate-800 font-mono">
                      {quizResultStats.skipped}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleStartQuiz}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>আবার কুইজ দিন</span>
                  </button>
                  <button
                    onClick={() => setQuizPhase('setup')}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    সেটিংস পরিবর্তন
                  </button>
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>প্রশ্নের সঠিক সমাধান ও বিস্তারিত পর্যালোচনা ({quizQuestions.length}টি):</span>
                </h3>

                <div className="space-y-2.5">
                  {quizQuestions.map((q, idx) => {
                    const userAns = userAnswers[idx];
                    const isCorrect = userAns === q.correctAnswerIndex;
                    const isSkipped = userAns === undefined;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl bg-white border transition-all ${
                          isCorrect
                            ? 'border-emerald-200'
                            : isSkipped
                            ? 'border-slate-200'
                            : 'border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              #{idx + 1} {q.radicalName}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                q.group === 'B'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                              }`}
                            >
                              গ্রুপ {q.group}
                            </span>
                          </div>
                          {isCorrect ? (
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> সঠিক (+১.৫)
                            </span>
                          ) : isSkipped ? (
                            <span className="text-[11px] font-semibold text-slate-500">উত্তর দেননি</span>
                          ) : (
                            <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> ভুল (০)
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-bold text-emerald-950 mb-2">
                          {q.questionText}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200">
                            <span className="text-[10px] text-emerald-700 block font-semibold">সঠিক সংকেত:</span>
                            <span className="font-mono font-bold text-emerald-950 text-sm">
                              {q.correctFormula} (যোজনী: {q.correctValency})
                            </span>
                          </div>
                          {!isCorrect && !isSkipped && (
                            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                              <span className="text-[10px] text-rose-700 block font-semibold">আপনার উত্তর:</span>
                              <span className="font-mono font-bold text-rose-950 text-sm">
                                {q.options[userAns]}
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-emerald-800/90 bg-emerald-50/40 p-2 rounded-lg border border-emerald-100">
                          {q.explanation}
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

      {/* ========================================================================= */}
      {/* TAB 2: REVEAL / SELF-RECALL MODE (No Options, Reveal Answer)              */}
      {/* ========================================================================= */}
      {activeTab === 'recall' && (
        <div>
          {/* Phase 1: Recall Setup */}
          {recallPhase === 'setup' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                      <Brain className="w-5 h-5 text-emerald-700" />
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-emerald-950">
                        যৌগমূলক রিভেল টেস্ট (অপশনহীন)
                      </h2>
                      <p className="text-xs text-emerald-700/80">
                        কোনো অপশন থাকবে না! মনে মনে উত্তর ভেবে ‘রিভেল আনসার’ বাটনে মিলিয়ে নিন।
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-300 text-amber-950">
                    সেলফ-টেস্ট
                  </span>
                </div>

                {/* Sub-selector for Direction */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-950">
                    কোন ধরনের অনুশীলন করতে চান?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Direction 1: নাম ➔ সংকেত ও যোজনী */}
                    <button
                      type="button"
                      onClick={() => setRecallDirection('name_to_formula')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        recallDirection === 'name_to_formula'
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-emerald-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">🏷️</span>
                        <span className="text-xs font-bold text-emerald-950">নাম ➔ সংকেত</span>
                      </div>
                      <p className="text-[11px] text-emerald-700/80 leading-relaxed">
                        যৌগমূলকের নাম দেওয়া থাকবে, মনে মনে সংকেত ও যোজনী ভাববেন এবং রিভেল করবেন।
                      </p>
                    </button>

                    {/* Direction 2: সংকেত ➔ নাম ও যোজনী */}
                    <button
                      type="button"
                      onClick={() => setRecallDirection('formula_to_name')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        recallDirection === 'formula_to_name'
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-emerald-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">🧪</span>
                        <span className="text-xs font-bold text-emerald-950">সংকেত ➔ নাম</span>
                      </div>
                      <p className="text-[11px] text-emerald-700/80 leading-relaxed">
                        সংকেত দেওয়া থাকবে, মনে মনে যৌগমূলকের নাম ও যোজনী ভাববেন এবং রিভেল করবেন।
                      </p>
                    </button>

                    {/* Direction 3: মিক্সড */}
                    <button
                      type="button"
                      onClick={() => setRecallDirection('mixed')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        recallDirection === 'mixed'
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-emerald-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">🔀</span>
                        <span className="text-xs font-bold text-emerald-950">মিক্সড (উভয় ধরন)</span>
                      </div>
                      <p className="text-[11px] text-emerald-700/80 leading-relaxed">
                        নাম থেকে সংকেত এবং সংকেত থেকে নাম—উভয় ধরনের প্রশ্নই ক্রমান্বয়ে আসবে।
                      </p>
                    </button>
                  </div>
                </div>

                {/* Group Selector (A, B, or Both) */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>যৌগমূলকের গ্রুপ নির্বাচন করুন:</span>
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {recallGroup === 'A' ? 'গ্রুপ A (২৮টি)' : recallGroup === 'B' ? 'গ্রুপ B (২১টি)' : 'উভয় গ্রুপ (৪৯টি)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRecallGroup('both');
                        setRecallQuestionCount((prev) => Math.min(prev, radicalsGroupStats.total));
                      }}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        recallGroup === 'both'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-extrabold">উভয় গ্রুপ (AB)</div>
                      <div className={`text-[10px] mt-0.5 ${recallGroup === 'both' ? 'text-emerald-100' : 'text-emerald-700/80'}`}>
                        সকল {radicalsGroupStats.total}টি মূলক
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRecallGroup('A');
                        setRecallQuestionCount((prev) => Math.min(prev, radicalsGroupStats.groupA));
                      }}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        recallGroup === 'A'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-extrabold">গ্রুপ A</div>
                      <div className={`text-[10px] mt-0.5 ${recallGroup === 'A' ? 'text-emerald-100' : 'text-emerald-700/80'}`}>
                        {radicalsGroupStats.groupA}টি মূলক
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRecallGroup('B');
                        setRecallQuestionCount((prev) => Math.min(prev, radicalsGroupStats.groupB));
                      }}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        recallGroup === 'B'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-extrabold">গ্রুপ B</div>
                      <div className={`text-[10px] mt-0.5 ${recallGroup === 'B' ? 'text-amber-100' : 'text-amber-700/80'}`}>
                        {radicalsGroupStats.groupB}টি মূলক
                      </div>
                    </button>
                  </div>
                </div>

                {/* Question Count Selector */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                      <span>অনুশীলনের জন্য যৌগমূলকের সংখ্যা:</span>
                    </label>
                    <span className="text-sm sm:text-base font-extrabold text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-lg font-mono">
                      {recallQuestionCount >= maxRecallCount ? `সবগুলো (${maxRecallCount}টি)` : `${recallQuestionCount} টি`}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {(recallGroup === 'B'
                      ? [5, 10, 15, 20, radicalsGroupStats.groupB]
                      : recallGroup === 'A'
                      ? [10, 15, 20, 25, radicalsGroupStats.groupA]
                      : [10, 15, 20, 30, radicalsData.length]
                    ).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRecallQuestionCount(Math.min(num, maxRecallCount))}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          recallQuestionCount === num || (num >= maxRecallCount && recallQuestionCount >= maxRecallCount)
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-102'
                            : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
                        }`}
                      >
                        {num >= maxRecallCount ? 'সবগুলো' : `${num} টি`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-950">শ্রেণি ফিল্টার (ঐচ্ছিক):</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setRecallCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          recallCategory === cat
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={handleStartRecall}
                  className="w-full py-3.5 rounded-xl font-bold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 hover:shadow-md transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>রিভেল অনুশীলন শুরু করুন ({recallQuestionCount} টি মূলক)</span>
                </button>
              </div>

              {/* Guide Banner */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-100 text-xs text-emerald-900/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>রিভেল আনসার মোডের নিয়ম:</span>
                </div>
                <p>• কোনো অপশন থাকবে না! প্রশ্ন দেখে নিজের মনে মনে সঠিক উত্তর চিন্তা করবেন বা বলবেন।</p>
                <p>• উত্তর ভাবা হলে ‘রিভেল আনসার’ বাটনে ক্লিক করে সঠিক সংকেত, চার্জ ও যোজনী মিলিয়ে নিবেন।</p>
                <p>• ‘পরবর্তী প্রশ্ন’ বাটনে ট্যাপ করলে নতুন যৌগমূলক আসবে এবং সমাধান স্বয়ংক্রিয়ভাবে লুকানো থাকবে।</p>
              </div>
            </div>
          )}

          {/* Phase 2: Active Recall */}
          {recallPhase === 'active' && currentRecallQ && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Status Header */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    যৌগমূলক {currentRecallIndex + 1} / {recallQuestions.length}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    {currentRecallQ.direction === 'name_to_formula'
                      ? '🏷️ নাম ➔ সংকেত'
                      : '🧪 সংকেত ➔ নাম'}
                  </span>
                </div>

                <button
                  onClick={() => setRecallPhase('result')}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                >
                  অনুশীলন সমাপ্ত
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${((currentRecallIndex + 1) / recallQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Card */}
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {currentRecallQ.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        currentRecallQ.group === 'B'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      গ্রুপ {currentRecallQ.group}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-emerald-600" />
                    <span>সেলফ-রিকল টেস্ট</span>
                  </span>
                </div>

                {/* Content */}
                {currentRecallQ.direction === 'name_to_formula' ? (
                  /* Task 1: Name given, mentally recall formula & valency */
                  <div className="space-y-3">
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                      <span className="text-[11px] font-bold text-emerald-700 block uppercase tracking-wider">
                        যৌগমূলকের নাম
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                        {currentRecallQ.radicalName}
                      </h2>
                      <p className="text-xs text-emerald-800/80">
                        এই যৌগমূলকের সঠিক রাসায়নিক সংকেত, চার্জ ও যোজনী কত?
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-950 text-xs flex items-start gap-2.5">
                      <span className="text-base flex-shrink-0">💭</span>
                      <p className="leading-relaxed">
                        <strong>আপনার কাজ:</strong> কোনো অপশন ছাড়াই নিজের মনে মনে এর সঠিক সংকেত (যেমন: SO₄²⁻, NH₄⁺) ও যোজনী ভাবুন। ভাবা হলে নিচে ‘রিভেল আনসার’ বাটনে ক্লিক করুন।
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Task 2: Formula given, mentally recall name & valency */
                  <div className="space-y-3">
                    <div className="p-5 sm:p-6 rounded-2xl bg-radial from-emerald-500/10 via-emerald-50/50 to-white border-2 border-emerald-300 text-center shadow-xs space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                        যৌগমূলকের সংকেত
                      </span>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-950 tracking-wider py-1 select-all">
                        {currentRecallQ.formula}
                      </div>
                      <p className="text-xs text-emerald-800 font-medium">
                        এই সংকেতটির যৌগমূলকের নাম, চার্জ ও যোজনী কী?
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-teal-50/90 border border-teal-200/80 text-teal-950 text-xs flex items-start gap-2.5">
                      <span className="text-base flex-shrink-0">💭</span>
                      <p className="leading-relaxed">
                        <strong>আপনার কাজ:</strong> সংকেত দেখে নিজের মনে মনে যৌগমূলকের নাম ও যোজনী বলুন। ভাবা শেষ হলে নিচে ‘রিভেল আনসার’ বাটনে ক্লিক করুন।
                      </p>
                    </div>
                  </div>
                )}

                {/* Reveal Answer Section */}
                {!recallRevealed[currentRecallIndex] ? (
                  <div className="pt-2 text-center space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setRecallRevealed((prev) => ({ ...prev, [currentRecallIndex]: true }))}
                      className="w-full py-4 px-5 rounded-2xl font-extrabold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/25 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
                    >
                      <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>রিভেল আনসার (Reveal Answer)</span>
                    </button>
                    <p className="text-[11px] text-emerald-700/80">
                      মনে মনে উত্তর ঠিক করে বাটনে চাপ দিলে সমাধান উন্মোচিত হবে
                    </p>
                  </div>
                ) : (
                  <div className="pt-2 space-y-3.5 animate-in fade-in-50 zoom-in-95 duration-200">
                    <div className="p-4 sm:p-5 rounded-2xl bg-radial from-emerald-50 via-white to-white border-2 border-emerald-400 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                        <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>সঠিক সমাধান ও তথ্য:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setRecallRevealed((prev) => ({ ...prev, [currentRecallIndex]: false }))}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>উত্তর লুকান</span>
                        </button>
                      </div>

                      {/* Display Data */}
                      <div className="p-3.5 rounded-xl bg-emerald-100/90 border border-emerald-300 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                            সঠিক সংকেত ও নাম
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-950">
                              {currentRecallQ.formula}
                            </span>
                            <span className="text-sm sm:text-base font-bold text-emerald-900">
                              ({currentRecallQ.radicalName})
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-600 text-white shadow-2xs">
                          যোজনী: {currentRecallQ.valency}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                          <span className="text-[10px] text-emerald-700 font-semibold block">আধান / চার্জ:</span>
                          <span className="font-mono font-bold text-emerald-950 text-sm">
                            {currentRecallQ.charge}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                          <span className="text-[10px] text-emerald-700 font-semibold block">শ্রেণি:</span>
                          <span className="font-bold text-emerald-950 text-xs">
                            {currentRecallQ.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-800 leading-relaxed font-sans">
                        <span className="font-bold text-emerald-900 block mb-0.5">📌 বিবরণ:</span>
                        {currentRecallQ.explanation}
                      </div>

                      {/* Self Rating Bar */}
                      <div className="pt-2 border-t border-emerald-100/80 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-semibold text-emerald-900">
                          মনে মনে কি সঠিক ভেবেছিলেন?
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRecallFeedback((prev) => ({ ...prev, [currentRecallIndex]: 'correct' }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              recallFeedback[currentRecallIndex] === 'correct'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>পেরেছি</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecallFeedback((prev) => ({ ...prev, [currentRecallIndex]: 'wrong' }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              recallFeedback[currentRecallIndex] === 'wrong'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>মনে আসেনি</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nav buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-emerald-100">
                  <button
                    onClick={() => setCurrentRecallIndex((p) => Math.max(0, p - 1))}
                    disabled={currentRecallIndex === 0}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      currentRecallIndex === 0
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>পূর্ববর্তী</span>
                  </button>

                  {currentRecallIndex < recallQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentRecallIndex((p) => Math.min(recallQuestions.length - 1, p + 1))}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>পরবর্তী প্রশ্ন</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setRecallPhase('result')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>অনুশীলন শেষ করুন</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Navigator */}
              <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span>প্রশ্ন তালিকা:</span>
                  <span className="text-[11px] font-normal text-emerald-700">
                    রিভেল করা হয়েছে: {Object.keys(recallRevealed).filter((k) => recallRevealed[Number(k)]).length} /{' '}
                    {recallQuestions.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recallQuestions.map((_, qIdx) => {
                    const isCurrent = currentRecallIndex === qIdx;
                    const fb = recallFeedback[qIdx];
                    const isRev = !!recallRevealed[qIdx];

                    let btnClass = 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100';
                    if (fb === 'correct') btnClass = 'bg-emerald-600 text-white font-bold';
                    else if (fb === 'wrong') btnClass = 'bg-rose-500 text-white font-bold';
                    else if (isRev) btnClass = 'bg-emerald-200 text-emerald-950 border border-emerald-400 font-bold';

                    return (
                      <button
                        key={qIdx}
                        onClick={() => setCurrentRecallIndex(qIdx)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${btnClass} ${
                          isCurrent ? 'ring-2 ring-emerald-500 ring-offset-1 scale-105 shadow-xs' : ''
                        }`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Phase 3: Recall Result */}
          {recallPhase === 'result' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-emerald-700" />
                </div>

                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    যৌগমূলক সেলফ-রিকল ফলাফল
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono mt-1">
                    {recallResultStats.remembered} / {recallResultStats.total}
                  </h2>
                  <p className="text-xs text-emerald-800 mt-1">
                    {recallResultStats.remembered + recallResultStats.forgot > 0
                      ? `স্মৃতিতে সঠিক মনে পড়েছে: ${recallResultStats.percentage}% (${recallResultStats.remembered} টি)`
                      : `মোট ${recallResultStats.total}টি যৌগমূলক রিভেল করে অনুশীলন সম্পন্ন হয়েছে।`}
                  </p>
                </div>

                {/* Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="block text-[10px] font-semibold text-emerald-700">মনে পড়েছে</span>
                    <span className="text-base font-extrabold text-emerald-800 font-mono">
                      {recallResultStats.remembered}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                    <span className="block text-[10px] font-semibold text-rose-700">ভুলে গিয়েছিলেন</span>
                    <span className="text-base font-extrabold text-rose-800 font-mono">
                      {recallResultStats.forgot}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block text-[10px] font-semibold text-slate-600">রেটিং ছাড়া</span>
                    <span className="text-base font-extrabold text-slate-800 font-mono">
                      {recallResultStats.unrated}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleStartRecall}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>আবার অনুশীলন</span>
                  </button>
                  <button
                    onClick={() => setRecallPhase('setup')}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    সেটিংস পরিবর্তন
                  </button>
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>অনুশীলন করা যৌগমূলকসমূহের তালিকা ({recallQuestions.length}টি):</span>
                </h3>

                <div className="space-y-2.5">
                  {recallQuestions.map((q, idx) => {
                    const fb = recallFeedback[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl bg-white border transition-all ${
                          fb === 'correct'
                            ? 'border-emerald-300'
                            : fb === 'wrong'
                            ? 'border-rose-300'
                            : 'border-emerald-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              #{idx + 1} {q.radicalName}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                q.group === 'B'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                              }`}
                            >
                              গ্রুপ {q.group}
                            </span>
                          </div>
                          {fb === 'correct' ? (
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> মনে পড়েছে
                            </span>
                          ) : fb === 'wrong' ? (
                            <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> মনে আসেনি
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-500">রিভিউড</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                            <span className="text-[10px] text-emerald-700 block font-semibold">সংকেত ও যোজনী:</span>
                            <span className="font-mono font-bold text-emerald-950 text-base">
                              {q.formula}
                            </span>
                            <span className="text-[11px] text-emerald-800 block">যোজনী: {q.valency}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                            <span className="text-[10px] text-emerald-700 block font-semibold">আধান ও শ্রেণি:</span>
                            <span className="font-bold text-emerald-950 text-xs block">চার্জ: {q.charge}</span>
                            <span className="text-[11px] text-emerald-800 block">{q.category}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-emerald-800/90 bg-emerald-50/40 p-2 rounded-lg border border-emerald-100">
                          {q.explanation}
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

      {/* ========================================================================= */}
      {/* TAB 3: STUDY SHEET & CONCEPTS                                            */}
      {/* ========================================================================= */}
      {activeTab === 'sheet' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          {/* Definition Banner from DUET Sheet */}
          <div className="p-4 rounded-2xl bg-radial from-emerald-500/10 via-emerald-50/40 to-white border border-emerald-200 space-y-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>যৌগমূলক (Radical) কী?</span>
            </div>
            <p className="text-xs text-emerald-900/90 leading-relaxed font-sans">
              {radicalConcepts.definition}
            </p>
          </div>

          {/* Theoretical Rule Cards: চরম ও পরম যোজ্যতা */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* চরম যোজ্যতা */}
            <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                বিশেষ নিয়ম
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-emerald-950">
                {radicalConcepts.chormoYojyota.title}
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {radicalConcepts.chormoYojyota.rule}
              </p>
              <div className="pt-1 space-y-1">
                {radicalConcepts.chormoYojyota.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-emerald-50/60 font-semibold"
                  >
                    <span>{ex.element}</span>
                    <span className="font-mono font-bold text-emerald-900">
                      চরম যোজনী = {ex.maxValency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* পরম বা বিষম যোজ্যতা */}
            <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-900 border border-teal-200">
                স্থির যোজ্যতা
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-emerald-950">
                {radicalConcepts.poromYojyota.title}
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {radicalConcepts.poromYojyota.rule}
              </p>
              <div className="pt-1 space-y-1">
                {radicalConcepts.poromYojyota.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-emerald-50/60 font-semibold"
                  >
                    <span>{ex.element}</span>
                    <span className="font-mono font-bold text-emerald-900">
                      যোজনী = {ex.valency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-3">
            {/* Group Filter Tabs (Both / A / B) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-emerald-50/80 rounded-xl border border-emerald-200">
              <button
                type="button"
                onClick={() => setSheetGroup('both')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sheetGroup === 'both'
                    ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200'
                    : 'text-emerald-700 hover:text-emerald-950'
                }`}
              >
                উভয় গ্রুপ ({radicalsGroupStats.total})
              </button>
              <button
                type="button"
                onClick={() => setSheetGroup('A')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sheetGroup === 'A'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-950'
                }`}
              >
                গ্রুপ A ({radicalsGroupStats.groupA})
              </button>
              <button
                type="button"
                onClick={() => setSheetGroup('B')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sheetGroup === 'B'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-950'
                }`}
              >
                গ্রুপ B ({radicalsGroupStats.groupB})
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="যৌগমূলকের নাম, সংকেত বা চার্জ দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 placeholder-emerald-700/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSheetCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                    sheetCategory === cat
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-700/80 px-1">
              <span>পাওয়া গেছে: {filteredRadicals.length}টি যৌগমূলক</span>
              <button
                onClick={() => {
                  setActiveTab('recall');
                  setRecallPhase('setup');
                }}
                className="font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>রিভেল টেস্ট দিন</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Radicals List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredRadicals.map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-emerald-950">
                      {item.nameBn}
                    </h3>
                    {item.nameEn && (
                      <p className="text-[11px] text-emerald-700/70 font-sans">
                        {item.nameEn}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        item.group === 'B'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      গ্রুপ {item.group}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                      যোজনী: {item.valency}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      চার্জ: {item.charge}
                    </span>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-medium">সংকেত:</span>
                  <span className="text-base sm:text-lg font-black text-emerald-950 font-mono tracking-wide">
                    {item.formula}
                  </span>
                </div>

                {item.note && (
                  <p className="text-[10px] text-emerald-800/80 leading-tight">
                    💡 {item.note}
                  </p>
                )}
              </div>
            ))}

            {filteredRadicals.length === 0 && (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-emerald-100 space-y-2">
                <AlertCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-emerald-900">কোনো যৌগমূলক পাওয়া যায়নি</p>
                <p className="text-xs text-emerald-700">অন্য কোনো নাম বা কিওয়ার্ড দিয়ে খুঁজুন।</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
