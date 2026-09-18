import React, { useState } from 'react';
import { QuizResult } from '../types';
import { translations, Language } from '../utils/i18n';
import { clearQuizHistory } from '../utils/storage';
import {
  History,
  Award,
  Calendar,
  Clock,
  Trash2,
  ChevronRight,
  TrendingUp,
  FileText,
  Play,
} from 'lucide-react';

interface HistoryScreenProps {
  history: QuizResult[];
  language: Language;
  onSelectResult: (result: QuizResult) => void;
  onRefreshHistory: () => void;
  onStartExam: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  language,
  onSelectResult,
  onRefreshHistory,
  onStartExam,
}) => {
  const t = translations[language];
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClear = () => {
    clearQuizHistory();
    onRefreshHistory();
    setShowClearConfirm(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-4 sm:space-y-5">
      {/* 1. Header Banner */}
      <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <History className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-emerald-950">
              {t.historyTitle}
            </h2>
            <p className="text-xs text-emerald-700/80">
              মোট সংরক্ষিত পরীক্ষা: {history.length} টি
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>হিস্ট্রি মুছুন</span>
          </button>
        )}
      </div>

      {/* 2. History List */}
      {history.length === 0 ? (
        <div className="p-10 sm:p-12 text-center rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <Award className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-emerald-950 mb-1">
              {t.noHistory}
            </h3>
            <p className="text-xs text-emerald-700/80 mb-5 leading-relaxed">
              ৮০টি প্রশ্নের ৩০ মিনিটের মডেল টেস্ট দিয়ে নিজের প্রস্তুতি যাচাই করে নিন।
            </p>
            <button
              onClick={onStartExam}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-2xs transition-all inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.startExam}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResult(item)}
              className="group p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-4"
            >
              {/* Left: Name & Date */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors truncate">
                    {item.quizName}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {item.department}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-emerald-700/80">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    {formatDate(item.timestamp)}
                  </span>
                  <span>•</span>
                  <span>৮০ টি প্রশ্ন (৩০ মিনিট)</span>
                </div>
              </div>

              {/* Right: Score */}
              <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="text-base sm:text-lg font-extrabold text-emerald-800 font-mono">
                    {item.score.toFixed(1)}{' '}
                    <span className="text-xs text-emerald-600/70 font-normal">/ ১২০</span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700/80">
                    {item.percentage}% ({item.correctCount} সঠিক, {item.wrongCount} ভুল)
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-emerald-200 text-center">
            <h3 className="text-base font-bold text-emerald-950 mb-2">
              আপনি কি নিশ্চিত?
            </h3>
            <p className="text-xs text-emerald-700/80 mb-5">
              সব পূর্ববর্তী পরীক্ষার ফলাফল মুছে ফেলা হবে। এই কাজটি পুনরায় ফিরিয়ে আনা যাবে না।
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-emerald-200 text-emerald-900 hover:bg-emerald-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-2xs"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
