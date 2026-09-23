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
  Compass,
} from 'lucide-react';
import {
  chemistryFormulas,
  generateChemistryQuiz,
  ChemistryQuizQuestion,
  ChemistryCompound,
} from '../data/chemistryFormulas';
import { ElementValencyQuiz } from './ElementValencyQuiz';
import { Language } from '../utils/i18n';

interface ChemistryScreenProps {
  language: Language;
  onBack: () => void;
}

type ChemistryView = 'hub' | 'elements' | 'quiz' | 'formulas';
type QuizPhase = 'setup' | 'active' | 'result';
type QuizMode = 'practice' | 'exam';

export const ChemistryScreen: React.FC<ChemistryScreenProps> = ({ language, onBack }) => {
  // Navigation: Default to 'hub' landing screen showing two big cards
  const [currentView, setCurrentView] = useState<ChemistryView>('hub');

  // Quiz Settings State
  const [questionCount, setQuestionCount] = useState<number>(15); // Default 15 (between 10-30)
  const [quizMode, setQuizMode] = useState<QuizMode>('exam');
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('setup');

  // Active Quiz State
  const [questions, setQuestions] = useState<ChemistryQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({}); // questionIndex -> selectedOptionIndex
  const [revealedInPractice, setRevealedInPractice] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0); // Seconds for exam mode
  const [examDuration, setExamDuration] = useState<number>(0);

  // Formula Sheet Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সবগুলো');

  // Start Quiz Handler
  const handleStartQuiz = () => {
    const generated = generateChemistryQuiz(questionCount);
    setQuestions(generated);
    setCurrentIndex(0);
    setUserAnswers({});
    setRevealedInPractice({});
    // 45 seconds per question in exam mode
    const totalSecs = generated.length * 45;
    setTimeLeft(totalSecs);
    setExamDuration(totalSecs);
    setQuizPhase('active');
  };

  // Timer Effect for Exam Mode
  useEffect(() => {
    if (quizPhase !== 'active' || quizMode !== 'exam') return;

    if (timeLeft <= 0) {
      // Auto submit when time runs out
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

  // Handle Option Select
  const handleSelectOption = (optionIndex: number) => {
    if (quizPhase !== 'active') return;

    // In practice mode, if already answered, don't allow changing
    if (quizMode === 'practice' && revealedInPractice[currentIndex]) return;

    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));

    if (quizMode === 'practice') {
      setRevealedInPractice((prev) => ({
        ...prev,
        [currentIndex]: true,
      }));
    }
  };

  // Finish Quiz
  const handleFinishQuiz = () => {
    setQuizPhase('result');
  };

  // Retake or Reset
  const handleRetake = () => {
    handleStartQuiz();
  };

  const handleBackToSetup = () => {
    setQuizPhase('setup');
  };

  // Score Calculation
  const resultStats = useMemo(() => {
    if (questions.length === 0) return { score: 0, correct: 0, wrong: 0, skipped: 0, percentage: 0 };
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans === undefined) {
        skipped++;
      } else if (ans === q.correctAnswerIndex) {
        correct++;
      } else {
        wrong++;
      }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    return { score: correct, correct, wrong, skipped, percentage };
  }, [questions, userAnswers]);

  // Filtered Formulas for Formula Guide
  const filteredFormulas = useMemo(() => {
    return chemistryFormulas.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.commonName.toLowerCase().includes(q) ||
        item.chemicalName.toLowerCase().includes(q) ||
        item.formula.toLowerCase().includes(q) ||
        (item.duetRef && item.duetRef.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedCategory === 'সবগুলো') return true;
      if (selectedCategory === 'DUET বিগত প্রশ্ন') return !!item.duetRef;
      return item.category === selectedCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories = ['সবগুলো', 'DUET বিগত প্রশ্ন', 'এসিড', 'ক্ষার', 'লবণ', 'গ্যাস', 'খনিজ', 'জৈব যৌগ', 'মিশ্রণ'];

  // Format Seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-100 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentView !== 'hub') {
                setCurrentView('hub');
              } else {
                onBack();
              }
            }}
            className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
            title={currentView === 'hub' ? 'হোমে ফিরে যান' : 'রসায়ন মেনুতে ফিরে যান'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-1.5">
                <FlaskConical className="w-5 h-5 text-emerald-600" />
                <span>রসায়ন (Chemistry)</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                ডুয়েট স্পেশাল
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/80">
              {currentView === 'hub'
                ? 'মৌলের গ্রুপ-যোজনী এবং রাসায়নিক সংকেত প্রস্তুতি'
                : currentView === 'elements'
                ? 'মৌলের গ্রুপ সংখ্যা ও পরিবর্তনশীল যোজনী কুইজ'
                : currentView === 'quiz'
                ? 'বাণিজ্যিক ও রাসায়নিক সংকেত কুইজ'
                : 'সকল রাসায়নিক সংকেত ভাণ্ডার ও স্টাডি শিট'}
            </p>
          </div>
        </div>

        {currentView !== 'hub' && (
          <button
            onClick={() => setCurrentView('hub')}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">মেনু</span>
          </button>
        )}
      </div>

      {/* ======================= VIEW: HUB (TWO BIG BEAUTIFUL CARDS) ======================= */}
      {currentView === 'hub' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="text-center py-2 space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-emerald-950">
              কোন বিষয়টি অনুশীলন করতে চান?
            </h2>
            <p className="text-xs text-emerald-700/80">
              নিচের যে কোনো একটি অপশনে ট্যাপ করে প্র্যাকটিস শুরু করুন
            </p>
          </div>

          {/* TWO BIG CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Card 1: মৌলের গ্রুপ ও যোজনী */}
            <button
              type="button"
              onClick={() => setCurrentView('elements')}
              className="w-full text-left p-5 sm:p-6 rounded-3xl bg-radial from-emerald-500/10 via-white to-white border-2 border-emerald-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer relative overflow-hidden active:scale-[0.99]"
            >
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Atom className="w-7 h-7 text-emerald-700 animate-spin-slow" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ৫৪টি মৌল
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                    <span>মৌলের গ্রুপ ও যোজনী</span>
                  </h3>
                  <p className="text-xs text-emerald-700/90 mt-1 leading-relaxed">
                    র‍্যান্ডম মৌলের গ্রুপ সংখ্যা (১-১৮) ও পরিবর্তনশীল যোজনী (১-৮ এবং ০) একাধিক অপশন সিলেক্ট করে নিজেকে যাচাই করার কুইজ ও মৌল তালিকা।
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-emerald-100/80 flex items-center justify-between text-xs font-bold text-emerald-800 group-hover:text-emerald-950">
                <span>অনুশীলন শুরু করুন</span>
                <span className="w-7 h-7 rounded-xl bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </button>

            {/* Card 2: রাসায়নিক সংকেত কুইজ */}
            <button
              type="button"
              onClick={() => setCurrentView('quiz')}
              className="w-full text-left p-5 sm:p-6 rounded-3xl bg-radial from-teal-500/10 via-white to-white border-2 border-emerald-200 hover:border-teal-500 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer relative overflow-hidden active:scale-[0.99]"
            >
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FlaskConical className="w-7 h-7 text-teal-700" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    ১০-৩০ টি প্রশ্ন
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
                    <span>রাসায়নিক সংকেত কুইজ</span>
                  </h3>
                  <p className="text-xs text-emerald-700/90 mt-1 leading-relaxed">
                    ডুয়েট ভর্তি পরীক্ষায় বিগত বছরগুলোতে আসা বাণিজ্যিক ও রাসায়নিক নাম, সংকেত নিয়ে ১০ থেকে ৩০ টি প্রশ্নের পূর্ণাঙ্গ মডেল টেস্ট ও তাৎক্ষণিক উত্তর।
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-emerald-100/80 flex items-center justify-between text-xs font-bold text-teal-800 group-hover:text-emerald-950">
                <span>কুইজ টেস্ট দিন</span>
                <span className="w-7 h-7 rounded-xl bg-teal-100 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          </div>

          {/* Quick link to সংকেত ভাণ্ডার study sheet */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                  রাসায়নিক সংকেত ভাণ্ডার (Study Sheet)
                </h4>
                <p className="text-[11px] text-emerald-700/80">
                  পরীক্ষার আগে এক নজরে সবকটি ৬০+ সংকেত ও বিগত সালের প্রশ্ন পড়ে নিন
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('formulas')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors flex-shrink-0 cursor-pointer"
            >
              সংকেত তালিকা
            </button>
          </div>
        </div>
      )}

      {/* Sub-Navigation Switcher (Visible only inside sub-screens for quick jumping) */}
      {currentView !== 'hub' && (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
          <button
            onClick={() => setCurrentView('elements')}
            className={`py-2 px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'elements'
                ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <Atom className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate">গ্রুপ ও যোজনী</span>
          </button>
          <button
            onClick={() => {
              setCurrentView('quiz');
              setQuizPhase('setup');
            }}
            className={`py-2 px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'quiz'
                ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <Play className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate">সংকেত কুইজ</span>
          </button>
          <button
            onClick={() => setCurrentView('formulas')}
            className={`py-2 px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'formulas'
                ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate">সংকেত ভাণ্ডার</span>
          </button>
        </div>
      )}

      {/* ======================= TAB 0: ELEMENTS GROUP & VALENCY QUIZ ======================= */}
      {currentView === 'elements' && (
        <ElementValencyQuiz language={language} />
      )}

      {/* ======================= TAB 1: QUIZ SYSTEM ======================= */}
      {currentView === 'quiz' && (
        <div>
          {/* Phase 1: Setup Screen */}
          {quizPhase === 'setup' && (
            <div className="space-y-4">
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                      <Sparkles className="w-5 h-5 text-emerald-700" />
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-emerald-950">
                        রাসায়নিক সংকেত কুইজ
                      </h2>
                      <p className="text-xs text-emerald-700/80">
                        ডুয়েট ভর্তি পরীক্ষায় বিগত বছরে আসা ও সর্বাধিক গুরুত্বপূর্ণ সংকেত
                      </p>
                    </div>
                  </div>
                </div>

                {/* Question Count Selector (10 to 30) */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                      <span>প্রশ্নের সংখ্যা নির্বাচন করুন (১০ - ৩০ টি):</span>
                    </label>
                    <span className="text-sm sm:text-base font-extrabold text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-lg font-mono">
                      {questionCount} টি
                    </span>
                  </div>

                  {/* Preset Buttons: 10, 15, 20, 25, 30 */}
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {[10, 15, 20, 25, 30].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuestionCount(num)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          questionCount === num
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-102'
                            : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
                        }`}
                      >
                        {num} টি
                      </button>
                    ))}
                  </div>

                  {/* Range Slider for custom 10-30 selection */}
                  <div className="pt-2">
                    <input
                      type="range"
                      min={10}
                      max={30}
                      step={1}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-2 bg-emerald-200 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-emerald-700/80 mt-1">
                      <span>১০ টি প্রশ্ন</span>
                      <span>২০ টি প্রশ্ন</span>
                      <span>৩০ টি প্রশ্ন</span>
                    </div>
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-950">পরীক্ষার মোড বেছে নিন:</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setQuizMode('exam')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        quizMode === 'exam'
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-emerald-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Timer className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs sm:text-sm font-bold text-emerald-950">
                          মডেল এক্সাম মোড
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700/80 leading-relaxed">
                        টাইমারসহ রিয়েল টেস্ট। শেষে পূর্ণাঙ্গ মার্ক ও সঠিক উত্তর শিট পাবেন।
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuizMode('practice')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
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
                        অপশন সিলেক্ট করার সাথে সাথেই সঠিক উত্তর ও রাসায়নিক নাম দেখা যাবে।
                      </p>
                    </button>
                  </div>
                </div>

                {/* Start Exam Button */}
                <button
                  onClick={handleStartQuiz}
                  className="w-full py-3.5 rounded-xl font-bold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 hover:shadow-md transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span>কুইজ শুরু করুন ({questionCount} টি প্রশ্ন)</span>
                </button>
              </div>

              {/* Instructions banner */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-100 text-xs text-emerald-900/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>কুইজ সম্পর্কিত তথ্য:</span>
                </div>
                <p>• প্রতিটি প্রশ্নের সঠিক রাসায়নিক সংকেত ৪টি অপশন থেকে নির্বাচন করতে হবে।</p>
                <p>• বাণিজ্যিক নাম (যেমন: অয়েল অব ভিট্রিওল, লাফিং গ্যাস, বোরাক্স ইত্যাদি) থেকে সংকেত যাচাই করা হবে।</p>
                <p>• ডুয়েট ভর্তি পরীক্ষায় বিগত বছরগুলোতে আসা প্রশ্নগুলো অন্তর্ভুক্ত করা রয়েছে।</p>
              </div>
            </div>
          )}

          {/* Phase 2: Active Quiz */}
          {quizPhase === 'active' && currentQ && (
            <div className="space-y-4">
              {/* Quiz Status Header */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    প্রশ্ন {currentIndex + 1} / {questions.length}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 hidden sm:inline">
                    {quizMode === 'exam' ? 'এক্সাম মোড' : 'অনুশীলন মোড'}
                  </span>
                </div>

                {/* Timer or Finish Button */}
                <div className="flex items-center gap-2">
                  {quizMode === 'exam' && (
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold border ${
                        timeLeft <= 60
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>{formatTime(timeLeft)}</span>
                    </div>
                  )}

                  <button
                    onClick={handleFinishQuiz}
                    className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                  >
                    সাবমিট
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Card */}
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
                <div className="space-y-2">
                  {currentQ.duetRef && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                      <GraduationCap className="w-3 h-3 text-amber-600" />
                      <span>{currentQ.duetRef}</span>
                    </div>
                  )}

                  <h2 className="text-base sm:text-lg font-bold text-emerald-950 leading-relaxed">
                    {currentQ.questionText}
                  </h2>
                </div>

                {/* 4 Options */}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[currentIndex] === optIdx;
                    const isCorrect = optIdx === currentQ.correctAnswerIndex;
                    const isRevealed = quizMode === 'practice' && revealedInPractice[currentIndex];

                    let btnStyle =
                      'bg-white border-emerald-200 text-emerald-950 hover:bg-emerald-50/70 hover:border-emerald-300';
                    let badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';

                    if (isRevealed) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                        badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-medium ring-2 ring-rose-400/20';
                        badgeStyle = 'bg-rose-600 text-white border-rose-600';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                      badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                    }

                    const optLabels = ['A', 'B', 'C', 'D'];

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs border flex-shrink-0 ${badgeStyle}`}
                          >
                            {optLabels[optIdx]}
                          </span>
                          <span className="text-sm sm:text-base font-semibold font-mono tracking-wide">
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

                {/* Practice Mode Explanation Box */}
                {quizMode === 'practice' && revealedInPractice[currentIndex] && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 animate-in fade-in duration-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                      <span>রাসায়নিক পরিচিতি:</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed font-sans">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}

                {/* Navigation Buttons: Prev & Next */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-emerald-100">
                  <button
                    onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                    disabled={currentIndex === 0}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      currentIndex === 0
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>পূর্ববর্তী</span>
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>পরবর্তী প্রশ্ন</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishQuiz}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>পরীক্ষা শেষ করুন</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Grid Quick Jump (for Exam Mode) */}
              <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span>প্রশ্ন তালিকা:</span>
                  <span className="text-[11px] font-normal text-emerald-700">
                    উত্তর দেওয়া হয়েছে: {Object.keys(userAnswers).length} / {questions.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {questions.map((_, qIdx) => {
                    const isAnswered = userAnswers[qIdx] !== undefined;
                    const isCurrent = currentIndex === qIdx;
                    return (
                      <button
                        key={qIdx}
                        onClick={() => setCurrentIndex(qIdx)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all ${
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

          {/* Phase 3: Result & Detailed Review */}
          {quizPhase === 'result' && (
            <div className="space-y-4">
              {/* Score Card */}
              <div className="p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Award className="w-8 h-8 text-emerald-700" />
                </div>

                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    কুইজ ফলাফল
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono mt-1">
                    {resultStats.score} / {questions.length}
                  </h2>
                  <p className="text-xs text-emerald-800 mt-1">
                    প্রাপ্ত নম্বর: {resultStats.percentage}% ({resultStats.score * 1.5} / {questions.length * 1.5})
                  </p>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="block text-[10px] font-semibold text-emerald-700">সঠিক</span>
                    <span className="text-base font-extrabold text-emerald-800 font-mono">
                      {resultStats.correct}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                    <span className="block text-[10px] font-semibold text-rose-700">ভুল</span>
                    <span className="text-base font-extrabold text-rose-800 font-mono">
                      {resultStats.wrong}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block text-[10px] font-semibold text-slate-600">বাদ দেওয়া</span>
                    <span className="text-base font-extrabold text-slate-800 font-mono">
                      {resultStats.skipped}
                    </span>
                  </div>
                </div>

                {/* Performance Message */}
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                  {resultStats.percentage >= 80 ? (
                    <span className="font-semibold text-emerald-900">
                      🎉 অসাধারণ পারফরম্যান্স! রাসায়নিক সংকেতে তোমার প্রস্তুতি চমৎকার।
                    </span>
                  ) : resultStats.percentage >= 50 ? (
                    <span>
                      👍 ভালো প্রস্তুতি! সংকেত ভাণ্ডার থেকে ভুল হওয়া সংকেতগুলো আরেকবার রিভিশন দিয়ে নাও।
                    </span>
                  ) : (
                    <span>
                      💡 আরও নিয়মিত অনুশীলন প্রয়োজন। ‘সংকেত ভাণ্ডার’ ট্যাব থেকে সংকেতগুলো মনোযোগ দিয়ে পড়ে আবার কুইজ দাও।
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleRetake}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>আবার কুইজ দিন</span>
                  </button>
                  <button
                    onClick={handleBackToSetup}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                  >
                    সেটিংস পরিবর্তন
                  </button>
                </div>
              </div>

              {/* Detailed Review Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>প্রশ্নের সঠিক সমাধান ও বিস্তারিত পর্যালোচনা ({questions.length}টি):</span>
                </h3>

                <div className="space-y-2.5">
                  {questions.map((q, idx) => {
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
                              #{idx + 1}
                            </span>
                            {q.duetRef && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                {q.duetRef}
                              </span>
                            )}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                          <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200">
                            <span className="text-[10px] text-emerald-700 block font-semibold">সঠিক সংকেত:</span>
                            <span className="font-mono font-bold text-emerald-950 text-sm">
                              {q.correctFormula}
                            </span>
                            <span className="text-[11px] text-emerald-800 block">
                              ({q.chemicalName})
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

      {/* ======================= TAB 2: FORMULA GUIDE ======================= */}
      {currentView === 'formulas' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বাণিজ্যিক নাম, রাসায়নিক নাম বা সংকেত দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 placeholder-emerald-700/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-700/80 px-1 pt-1">
              <span>পাওয়া গেছে: {filteredFormulas.length}টি সংকেত</span>
              <button
                onClick={() => {
                  setCurrentView('quiz');
                  setQuizPhase('setup');
                }}
                className="font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>কুইজ দিন</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Formulas List Cards */}
          <div className="space-y-2.5">
            {filteredFormulas.map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-emerald-950">
                      {item.commonName}
                    </h3>
                    <p className="text-xs text-emerald-700/80 font-medium">
                      রাসায়নিক নাম: {item.chemicalName}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {item.duetRef && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {item.duetRef}
                      </span>
                    )}
                    {item.category && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Highlighted Formula Pill */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-medium">রাসায়নিক সংকেত:</span>
                  <span className="text-sm sm:text-base font-extrabold text-emerald-950 font-mono tracking-wide">
                    {item.formula}
                  </span>
                </div>
              </div>
            ))}

            {filteredFormulas.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-emerald-100 space-y-2">
                <AlertCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-emerald-900">কোনো সংকেত পাওয়া যায়নি</p>
                <p className="text-xs text-emerald-700">অন্য কোনো নাম বা কিওয়ার্ড দিয়ে খুঁজুন।</p>
              </div>
            )}
          </div>

          {/* Quick CTA to start quiz on these formulas */}
          <div className="p-4 rounded-2xl bg-emerald-600 text-white flex items-center justify-between gap-3 shadow-sm">
            <div>
              <h4 className="text-xs sm:text-sm font-bold">সংকেতগুলো রিভিশন দেওয়া শেষ?</h4>
              <p className="text-[11px] text-emerald-100">এখনই ১০-৩০ টি প্রশ্নের কুইজ দিয়ে নিজের প্রস্তুতি যাচাই করো।</p>
            </div>
            <button
              onClick={() => {
                setCurrentView('quiz');
                setQuizPhase('setup');
              }}
              className="px-3.5 py-2 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors flex-shrink-0 cursor-pointer"
            >
              কুইজ শুরু করুন
            </button>
          </div>
        </div>
      )}

      {/* Future Additions Notice */}
      <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 text-center space-y-1">
        <p className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>পরবর্তীতে রসায়ন বিভাগে পর্যায় সারণী, জারণ-বিজারণ ও গাণিতিক সমস্যা যুক্ত করা হবে।</span>
        </p>
      </div>
    </div>
  );
};
