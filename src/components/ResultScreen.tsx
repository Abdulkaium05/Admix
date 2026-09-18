import React, { useEffect, useState } from 'react';
import { QuizResult, SubjectType } from '../types';
import { translations, Language } from '../utils/i18n';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Home,
  History,
  BookOpen,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ResultScreenProps {
  result: QuizResult;
  language: Language;
  onNavigateHome: () => void;
  onNavigateHistory: () => void;
  onRetakeExam: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  language,
  onNavigateHome,
  onNavigateHistory,
  onRetakeExam,
}) => {
  const t = translations[language];
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Trigger celebration confetti if score >= 40%
  useEffect(() => {
    if (result.percentage >= 40) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#3b82f6'],
        });
      } catch (e) {
        // ignore
      }
    }
  }, [result.percentage]);

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} মি. ${s} সে.`;
  };

  const subjectConfig: Record<SubjectType, { nameBn: string; nameEn: string; icon: string }> = {
    civil: { nameBn: 'সিভিল ইঞ্জিনিয়ারিং (৪০)', nameEn: 'Civil Engineering (40)', icon: '🏛️' },
    math: { nameBn: 'গণিত (১০)', nameEn: 'Mathematics (10)', icon: '📐' },
    physics: { nameBn: 'পদার্থবিজ্ঞান (১০)', nameEn: 'Physics (10)', icon: '⚡' },
    chemistry: { nameBn: 'রসায়ন (১০)', nameEn: 'Chemistry (10)', icon: '🧪' },
    english: { nameBn: 'ইংরেজি (১০)', nameEn: 'English (10)', icon: '📖' },
  };

  const filteredQuestions = result.questionResults?.filter((item) => {
    if (filterSubject === 'all') return true;
    if (filterSubject === 'correct') return item.isCorrect;
    if (filterSubject === 'wrong') return !item.isCorrect && item.selectedOption !== null;
    if (filterSubject === 'skipped') return item.selectedOption === null;
    return item.subject === filterSubject;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 1. Score Summary Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-bold mb-3">
          <Award className="w-4 h-4 text-amber-300" />
          <span>ডুয়েট মডেল টেস্ট মূল্যায়ন</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-1">
          {result.quizName}
        </h2>

        {/* Score Number Display */}
        <div className="my-4">
          <div className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-white">
            {result.score.toFixed(1)}{' '}
            <span className="text-xl sm:text-2xl text-emerald-200 font-normal">/ ১২০</span>
          </div>
          <div className="text-sm font-semibold text-emerald-100 mt-1">
            প্রাপ্ত নম্বর: {result.percentage}% •{' '}
            {result.percentage >= 60
              ? 'চমৎকার প্রস্তুতি! ডুয়েটের জন্য উপযুক্ত!'
              : result.percentage >= 40
              ? 'সন্তোষজনক, নির্দিষ্ট বিষয়ে আরও জোর দিন।'
              : 'আরও নিয়মিত রিভিশন ও প্র্যাকটিস প্রয়োজন।'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto mt-6">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="block text-[11px] text-emerald-200">সঠিক উত্তর</span>
            <span className="text-lg font-extrabold font-mono text-emerald-300">
              {result.correctCount} টি
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="block text-[11px] text-emerald-200">ভুল উত্তর</span>
            <span className="text-lg font-extrabold font-mono text-rose-300">
              {result.wrongCount} টি
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="block text-[11px] text-emerald-200">এড়িয়ে গেছেন</span>
            <span className="text-lg font-extrabold font-mono text-amber-200">
              {result.skippedCount} টি
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="block text-[11px] text-emerald-200">ব্যয়িত সময়</span>
            <span className="text-sm sm:text-base font-extrabold font-mono text-white mt-1 block">
              {formatSeconds(result.timeTakenSeconds)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-6">
          <button
            onClick={onNavigateHome}
            className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>{t.backToHome}</span>
          </button>
          <button
            onClick={onRetakeExam}
            className="px-5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm border border-emerald-500/30 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.retakeExam}</span>
          </button>
          <button
            onClick={onNavigateHistory}
            className="px-5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm border border-emerald-500/30 transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4" />
            <span>{t.history}</span>
          </button>
        </div>
      </div>

      {/* 2. Subject-wise Analysis */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-5 sm:p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-emerald-950 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>{t.subjectAnalysis} (৮০ টি প্রশ্ন বিশ্লেষণ)</span>
        </h3>

        <div className="space-y-3.5">
          {(['civil', 'math', 'physics', 'chemistry', 'english'] as SubjectType[]).map((subjKey) => {
            const data = result.subjectBreakdown[subjKey];
            if (!data) return null;
            const meta = subjectConfig[subjKey];
            const maxMarks = data.total * 1.5;
            const percentage = data.total > 0 ? (data.score / maxMarks) * 100 : 0;

            return (
              <div key={subjKey} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>{meta.icon}</span>
                    <span>{language === 'bn' ? meta.nameBn : meta.nameEn}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    {data.score.toFixed(1)} / {maxMarks} নম্বর ({data.correct}/{data.total} সঠিক)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <div
                    className={`h-full transition-all rounded-full ${
                      percentage >= 70
                        ? 'bg-emerald-600'
                        : percentage >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Question Review Accordion */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-100">
          <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>{t.reviewQuestions}</span>
          </h3>

          {/* Review filter chips */}
          <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
            <button
              onClick={() => setFilterSubject('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterSubject === 'all'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              সব ({result.totalQuestions})
            </button>
            <button
              onClick={() => setFilterSubject('correct')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterSubject === 'correct'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              সঠিক ({result.correctCount})
            </button>
            <button
              onClick={() => setFilterSubject('wrong')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterSubject === 'wrong'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              ভুল ({result.wrongCount})
            </button>
            <button
              onClick={() => setFilterSubject('skipped')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterSubject === 'skipped'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              এড়িয়ে গেছেন ({result.skippedCount})
            </button>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-3">
          {filteredQuestions?.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const isAnswered = item.selectedOption !== null;

            return (
              <div
                key={item.questionId || idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.isCorrect
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : isAnswered
                    ? 'border-rose-200 bg-rose-50/40'
                    : 'border-emerald-100 bg-[#f0fdf4]/50'
                }`}
              >
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-2.5">
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : isAnswered ? (
                      <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-xs font-semibold text-emerald-950">
                        {item.question}
                      </span>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-700/80">
                        <span className="uppercase font-mono font-bold text-emerald-800">
                          {item.subject}
                        </span>
                        <span>•</span>
                        <span>
                          {item.isCorrect
                            ? 'সঠিক উত্তর (+১.৫)'
                            : isAnswered
                            ? 'ভুল উত্তর (০)'
                            : 'উত্তর দেওয়া হয়নি (০)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className="text-emerald-700 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-emerald-100 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.options.map((opt, oIdx) => {
                        const isChosen = item.selectedOption === oIdx;
                        const isRight = item.correctOption === oIdx;

                        let optClass = 'bg-white border-emerald-100 text-emerald-950';
                        if (isRight) {
                          optClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                        } else if (isChosen && !isRight) {
                          optClass = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${optClass}`}
                          >
                            <span>{opt}</span>
                            {isRight && <span className="text-[10px] text-emerald-800 font-bold ml-1">✓ সঠিক</span>}
                            {isChosen && !isRight && <span className="text-[10px] text-rose-600 font-bold ml-1">✗ আপনার উত্তর</span>}
                          </div>
                        );
                      })}
                    </div>

                    {item.explanation && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                        <span className="font-bold">ব্যাখ্যা / সমাধান: </span>
                        {item.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
