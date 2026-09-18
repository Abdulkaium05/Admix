import React, { useState, useEffect } from 'react';
import { Language } from '../utils/i18n';
import {
  getAdmissionTargetDate,
  setAdmissionTargetDate,
  calculateAdmissionCountdown,
} from '../utils/storage';
import {
  Calendar,
  Clock,
  X,
  Check,
  Flame,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface AdmissionCountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AdmissionCountdownModal: React.FC<AdmissionCountdownModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [targetDateInput, setTargetDateInput] = useState<string>(() => getAdmissionTargetDate());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [countdown, setCountdown] = useState(() =>
    calculateAdmissionCountdown(getAdmissionTargetDate())
  );

  useEffect(() => {
    if (!isOpen) return;
    const currentStored = getAdmissionTargetDate();
    setTargetDateInput(currentStored);
    setCountdown(calculateAdmissionCountdown(currentStored));

    const interval = setInterval(() => {
      setCountdown(calculateAdmissionCountdown(getAdmissionTargetDate()));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDateInput) return;
    setAdmissionTargetDate(targetDateInput);
    setCountdown(calculateAdmissionCountdown(targetDateInput));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const setQuickOffsetDays = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const dateStr = d.toISOString().slice(0, 10);
    setTargetDateInput(dateStr);
    setAdmissionTargetDate(dateStr);
    setCountdown(calculateAdmissionCountdown(dateStr));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const toBnNumber = (n: number) => n.toLocaleString('bn-BD');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/40 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-md rounded-3xl border border-emerald-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-emerald-100/40 to-white border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-1.5">
                <span>{language === 'bn' ? 'অ্যাডমিশন কাউন্টডাউন' : 'Admission Countdown'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-medium">
                  {language === 'bn' ? 'ডুয়েট মিশন' : 'DUET Mission'}
                </span>
              </h3>
              <p className="text-[11px] text-emerald-700/80">
                {language === 'bn'
                  ? 'সম্ভাব্য পরীক্ষার তারিখ অনুযায়ী আর কতদিন বাকি'
                  : 'Time remaining until your target admission exam'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-emerald-50 rounded-xl transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-5">
          {/* 1. Countdown Digit Boxes */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-700/50">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'কাঙ্ক্ষিত অ্যাডমিশন পরীক্ষার দিন:' : 'Target Exam Date:'}</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-100 bg-emerald-900/80 px-2 py-0.5 rounded-md border border-emerald-700">
                {targetDateInput}
              </span>
            </div>

            {countdown.isPassed ? (
              <div className="text-center py-4 space-y-1">
                <span className="text-2xl font-bold text-amber-300">
                  {language === 'bn' ? 'পরীক্ষার তারিখ উত্তীর্ণ হয়েছে!' : 'Exam date has arrived!'}
                </span>
                <p className="text-xs text-emerald-200">
                  {language === 'bn' ? 'নতুন কোনো তারিখ সেট করুন।' : 'Please set a new target date below.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 text-center">
                {/* Days */}
                <div className="bg-emerald-900/70 border border-emerald-700/60 p-2.5 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
                    {language === 'bn' ? toBnNumber(countdown.days) : countdown.days}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider mt-0.5">
                    {language === 'bn' ? 'দিন বাকি' : 'Days'}
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-emerald-900/70 border border-emerald-700/60 p-2.5 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
                    {language === 'bn' ? toBnNumber(countdown.hours) : String(countdown.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider mt-0.5">
                    {language === 'bn' ? 'ঘণ্টা' : 'Hours'}
                  </div>
                </div>

                {/* Minutes */}
                <div className="bg-emerald-900/70 border border-emerald-700/60 p-2.5 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
                    {language === 'bn' ? toBnNumber(countdown.minutes) : String(countdown.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider mt-0.5">
                    {language === 'bn' ? 'মিনিট' : 'Mins'}
                  </div>
                </div>

                {/* Seconds */}
                <div className="bg-emerald-900/70 border border-emerald-700/60 p-2.5 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-300 tracking-tight">
                    {language === 'bn' ? toBnNumber(countdown.seconds) : String(countdown.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider mt-0.5">
                    {language === 'bn' ? 'সেকেন্ড' : 'Secs'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Target Date Picker Form */}
          <form onSubmit={handleSaveDate} className="space-y-3 bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100">
            <label className="block text-xs font-bold text-emerald-950">
              {language === 'bn' ? 'সম্ভাব্য অ্যাডমিশন তারিখ নির্বাচন করুন:' : 'Select Target Admission Date:'}
            </label>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={targetDateInput}
                  onChange={(e) => setTargetDateInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold text-emerald-950 bg-white rounded-xl border border-emerald-200 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <Calendar className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'সেভ হয়েছে' : 'Saved'}</span>
                  </>
                ) : (
                  <span>{language === 'bn' ? 'তারিখ সেভ' : 'Set Date'}</span>
                )}
              </button>
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-semibold text-emerald-700 mr-1">
                {language === 'bn' ? 'কুইক সিলেক্ট:' : 'Quick Select:'}
              </span>
              <button
                type="button"
                onClick={() => setQuickOffsetDays(30)}
                className="text-[10px] px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-100 transition-colors font-semibold"
              >
                {language === 'bn' ? '১ মাস (৩০ দিন)' : '+30 Days'}
              </button>
              <button
                type="button"
                onClick={() => setQuickOffsetDays(60)}
                className="text-[10px] px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-100 transition-colors font-semibold"
              >
                {language === 'bn' ? '২ মাস (৬০ দিন)' : '+60 Days'}
              </button>
              <button
                type="button"
                onClick={() => setQuickOffsetDays(90)}
                className="text-[10px] px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-100 transition-colors font-semibold"
              >
                {language === 'bn' ? '৩ মাস (৯০ দিন)' : '+90 Days'}
              </button>
            </div>
          </form>

          {/* 3. Study Routine Tip */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-950 leading-relaxed">
              {language === 'bn'
                ? 'ডুয়েট ভর্তি পরীক্ষায় প্রতিযোগিতা অনেক বেশি। প্রতিদিন লক্ষ্য স্থির করে ডিপার্টমেন্ট (সিভিল) ও নন-ডিপার্টমেন্ট নিয়মিত পড়লে কাঙ্ক্ষিত সাফল্য অর্জন সহজ হবে।'
                : 'Consistent daily study routines and regular 80-question model tests are key to securing a top position in DUET admission.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-emerald-50/50 border-t border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Admix DUET Prep</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
