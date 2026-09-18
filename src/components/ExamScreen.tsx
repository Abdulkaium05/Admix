import React, { useState, useEffect, useMemo } from 'react';
import { Question, SubjectType, QuizResult } from '../types';
import { translations, Language } from '../utils/i18n';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  LayoutGrid,
  Send,
  X,
  HelpCircle,
} from 'lucide-react';

interface ExamScreenProps {
  questions: Question[]; // 80 questions
  language: Language;
  onFinishExam: (result: QuizResult) => void;
  onCancelExam: () => void;
}

const EXAM_DURATION_SECONDS = 30 * 60; // 30 minutes = 1800 seconds

export const ExamScreen: React.FC<ExamScreenProps> = ({
  questions,
  language,
  onFinishExam,
  onCancelExam,
}) => {
  const t = translations[language];

  // User answers map: question index (0 to 79) -> option index (0 to 3)
  const [answers, setAnswers] = useState<Record<number, number>>({});
  // Flagged questions for review
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  
  // Current active question index
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Filter tab: 'all' | 'civil' | 'math' | 'physics' | 'chemistry' | 'english'
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>('all');
  
  // Time left in seconds
  const [secondsLeft, setSecondsLeft] = useState<number>(EXAM_DURATION_SECONDS);

  // Question sheet modal toggle for mobile / desktop
  const [showQuestionSheet, setShowQuestionSheet] = useState<boolean>(false);
  
  // Submit confirmation modal
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = secondsLeft < 300; // Under 5 mins

  // Filtered indices according to subject tab
  const filteredIndices = useMemo(() => {
    if (activeSubjectTab === 'all') {
      return questions.map((_, i) => i);
    }
    return questions
      .map((q, i) => (q.subject === activeSubjectTab ? i : -1))
      .filter((i) => i !== -1);
  }, [questions, activeSubjectTab]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIndex,
    }));
  };

  const handleClearAnswer = () => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentIndex];
      return copy;
    });
  };

  const handleToggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  // Final evaluation & submit
  const handleFinalSubmit = () => {
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const breakdown = {
      civil: { total: 0, correct: 0, wrong: 0, score: 0 },
      math: { total: 0, correct: 0, wrong: 0, score: 0 },
      physics: { total: 0, correct: 0, wrong: 0, score: 0 },
      chemistry: { total: 0, correct: 0, wrong: 0, score: 0 },
      english: { total: 0, correct: 0, wrong: 0, score: 0 },
    };

    const questionResults = questions.map((q, idx) => {
      const selected = answers[idx] !== undefined ? answers[idx] : null;
      const isCorrect = selected === q.correctAnswer;
      const subj = q.subject;

      if (breakdown[subj]) {
        breakdown[subj].total += 1;
      }

      if (selected === null) {
        skippedCount += 1;
      } else if (isCorrect) {
        correctCount += 1;
        if (breakdown[subj]) {
          breakdown[subj].correct += 1;
          breakdown[subj].score += 1.5;
        }
      } else {
        wrongCount += 1;
        if (breakdown[subj]) {
          breakdown[subj].wrong += 1;
        }
      }

      const options = language === 'en' && q.optionsEn ? q.optionsEn : q.optionsBn;

      return {
        questionId: q.id,
        question: language === 'en' && q.questionEn ? q.questionEn : q.questionBn,
        subject: q.subject,
        selectedOption: selected,
        correctOption: q.correctAnswer,
        options,
        isCorrect,
        explanation: language === 'en' && q.explanationEn ? q.explanationEn : q.explanationBn,
      };
    });

    const totalScore = Number((correctCount * 1.5).toFixed(2));
    const timeTaken = EXAM_DURATION_SECONDS - secondsLeft;

    const result: QuizResult = {
      id: `quiz-${Date.now()}`,
      quizName: `DUET Model Test #${new Date().toLocaleDateString()}`,
      score: totalScore,
      totalMarks: 120,
      correctCount,
      wrongCount,
      skippedCount,
      totalQuestions: questions.length,
      percentage: Number(((totalScore / 120) * 100).toFixed(1)),
      timeTakenSeconds: timeTaken,
      timestamp: Date.now(),
      department: 'Civil Engineering',
      subjectBreakdown: breakdown,
      questionResults,
    };

    onFinishExam(result);
  };

  const answeredCount = Object.keys(answers).length;

  const subjectTabList: { id: string; nameBn: string; nameEn: string; count: number }[] = [
    { id: 'all', nameBn: 'সব প্রশ্ন', nameEn: 'All', count: 80 },
    { id: 'civil', nameBn: 'সিভিল', nameEn: 'Civil', count: 40 },
    { id: 'math', nameBn: 'গণিত', nameEn: 'Math', count: 10 },
    { id: 'physics', nameBn: 'পদার্থ', nameEn: 'Physics', count: 10 },
    { id: 'chemistry', nameBn: 'রসায়ন', nameEn: 'Chem', count: 10 },
    { id: 'english', nameBn: 'ইংরেজি', nameEn: 'English', count: 10 },
  ];

  const currentQuestionText =
    language === 'en' && currentQuestion?.questionEn
      ? currentQuestion.questionEn
      : currentQuestion?.questionBn;

  const currentOptions =
    language === 'en' && currentQuestion?.optionsEn
      ? currentQuestion.optionsEn
      : currentQuestion?.optionsBn;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f0fdf4] flex flex-col justify-between">
      {/* 1. Sticky Exam Top Bar */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 px-4 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Progress / Status */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm font-bold text-emerald-950 font-mono">
              প্রশ্ন {currentIndex + 1} / {questions.length}
            </span>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                উত্তর: {answeredCount} / {questions.length}
              </span>
            </div>
          </div>

          {/* Center Timer */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold shadow-2xs transition-colors ${
              isLowTime
                ? 'bg-rose-50 text-rose-700 border border-rose-300 animate-pulse'
                : 'bg-emerald-100/90 text-emerald-900 border border-emerald-300'
            }`}
          >
            <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-600' : 'text-emerald-700'}`} />
            <span>{formatTime(secondsLeft)}</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuestionSheet(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-semibold transition-colors"
              title="প্রশ্ন তালিকা দেখুন"
            >
              <LayoutGrid className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">{t.questionNav}</span>
            </button>

            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-2xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.submitExam}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Question Container */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-5 flex-1 flex flex-col justify-start">
        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {subjectTabList.map((tab) => {
            const isTabActive = activeSubjectTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubjectTab(tab.id);
                  if (tab.id === 'all') {
                    setCurrentIndex(0);
                  } else {
                    const firstIdx = questions.findIndex((q) => q.subject === tab.id);
                    if (firstIdx !== -1) setCurrentIndex(firstIdx);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isTabActive
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-50'
                }`}
              >
                <span>{language === 'bn' ? tab.nameBn : tab.nameEn}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isTabActive
                      ? 'bg-white/25 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-5 sm:p-7 shadow-xs">
            {/* Question Header Meta */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-50">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                  {currentQuestion.subject.toUpperCase()}
                </span>
                <span className="text-xs text-emerald-700/70 font-mono">
                  মার্কস: ১.৫
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFlag}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    flagged[currentIndex]
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'text-emerald-700/70 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                  title="রিভিউয়ের জন্য চিহ্নিত করুন"
                >
                  <Flag className={`w-3.5 h-3.5 ${flagged[currentIndex] ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">
                    {flagged[currentIndex] ? 'চিহ্নিত' : 'চিহ্নিত করুন'}
                  </span>
                </button>

                {answers[currentIndex] !== undefined && (
                  <button
                    onClick={handleClearAnswer}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.clearAnswer}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Question Statement */}
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-bold text-emerald-950 leading-relaxed">
                <span className="text-emerald-600 font-mono mr-2 font-extrabold">
                  {currentIndex + 1}.
                </span>
                {currentQuestionText}
              </h3>
            </div>

            {/* 4 Multiple Choice Options */}
            <div className="space-y-2.5">
              {currentOptions?.map((optText, optIdx) => {
                const isSelected = answers[currentIndex] === optIdx;
                const optLetter = ['ক', 'খ', 'গ', 'ঘ'][optIdx];
                const optLetterEn = ['A', 'B', 'C', 'D'][optIdx];

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center gap-3.5 group ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs'
                        : 'bg-white border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200'
                      }`}
                    >
                      {language === 'bn' ? optLetter : optLetterEn}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-emerald-950 flex-1 leading-snug">
                      {optText}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-emerald-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Navigation Bar */}
      <div className="bg-white border-t border-emerald-100 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-900 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.prev}</span>
          </button>

          {/* Quick jump info */}
          <div className="text-xs font-semibold text-emerald-800 font-mono">
            {currentIndex + 1} / {questions.length}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
          >
            <span>{t.next}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Question Sheet / Palette Modal */}
      {showQuestionSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-emerald-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-emerald-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-600" />
                  <span>{t.questionNav} (৮০ টি প্রশ্ন)</span>
                </h3>
                <div className="flex items-center gap-3 text-[11px] text-emerald-800 mt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    উত্তর দেওয়া ({answeredCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-100 inline-block border border-emerald-300" />
                    বাকি ({questions.length - answeredCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    চিহ্নিত ({Object.values(flagged).filter(Boolean).length})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowQuestionSheet(false)}
                className="p-1 rounded-lg text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of 80 buttons */}
            <div className="p-4 overflow-y-auto grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isFlagged = flagged[idx];
                const isCurrent = idx === currentIndex;

                let btnBg = 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100';
                if (isAnswered) {
                  btnBg = 'bg-emerald-600 text-white font-bold border-transparent';
                }
                if (isFlagged) {
                  btnBg = 'bg-amber-500 text-white font-bold border-transparent';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowQuestionSheet(false);
                    }}
                    className={`h-9 rounded-lg text-xs font-mono transition-all flex items-center justify-center relative ${btnBg} ${
                      isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && isAnswered && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-emerald-100 flex justify-end">
              <button
                onClick={() => setShowQuestionSheet(false)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Submit Confirmation Dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-emerald-200 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-emerald-950 mb-1">
              {t.confirmSubmitTitle}
            </h3>
            <p className="text-xs text-emerald-700/80 mb-4 leading-relaxed">
              {t.confirmSubmitDesc}
            </p>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 mb-5 text-xs text-emerald-900 font-mono space-y-1">
              <div>উত্তর প্রদান করা হয়েছে: {answeredCount} টি</div>
              <div>উত্তরহীন বা বাকি আছে: {questions.length - answeredCount} টি</div>
              <div>বাকি সময়: {formatTime(secondsLeft)}</div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleFinalSubmit();
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
