import React, { useState, useEffect } from 'react';
import { UpcomingSchedule } from '../types';
import {
  getNearestSchedulesForHome,
  calculateScheduleCountdown,
  purgeExpiredSchedules,
  formatDuration,
} from '../utils/storage';
import { Language } from '../utils/i18n';
import {
  Clock,
  Calendar,
  Sparkles,
  Plus,
  BookOpen,
  Award,
  ChevronRight,
  Radio,
  Flame,
  CalendarClock,
  ExternalLink,
} from 'lucide-react';

interface HomeScheduleTimersProps {
  language: Language;
  onOpenScheduleManager: () => void;
  onAddNewSchedule: () => void;
  onDeleteScheduleFromCloud?: (id: string) => void;
}

export const HomeScheduleTimers: React.FC<HomeScheduleTimersProps> = ({
  language,
  onOpenScheduleManager,
  onAddNewSchedule,
  onDeleteScheduleFromCloud,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [nearestSchedules, setNearestSchedules] = useState<UpcomingSchedule[]>([]);

  // Convert numbers to Bengali digits if language is bn
  const toBn = (num: number | string): string => {
    if (language !== 'bn') return String(num);
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
  };

  const padZero = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

  // Refresh schedule list & auto-purge expired schedules
  const updateSchedules = () => {
    const now = Date.now();
    setCurrentTime(now);

    // Auto-clean expired items (>24 hours)
    const purgedIds = purgeExpiredSchedules();
    if (purgedIds.length > 0 && onDeleteScheduleFromCloud) {
      purgedIds.forEach((id) => onDeleteScheduleFromCloud(id));
    }

    // Get the nearest upcoming active schedule(s)
    const nearest = getNearestSchedulesForHome(now);
    setNearestSchedules(nearest);
  };

  useEffect(() => {
    updateSchedules();

    // 1-second live countdown ticker
    const timerId = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Every second, check if the current schedule finished
      // getNearestSchedulesForHome will smoothly transition to the next schedule
      const nearest = getNearestSchedulesForHome(now);
      setNearestSchedules(nearest);
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  // Format 24h time ("14:30") to readable 12h format
  const formatTime12h = (timeStr: string) => {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    if (isNaN(h)) return timeStr;
    const isPm = h >= 12;
    h = h % 12 || 12;
    const suffix = language === 'bn' ? (isPm ? 'দুপুর/সন্ধ্যা' : 'সকাল') : isPm ? 'PM' : 'AM';
    return `${toBn(h)}:${toBn(m)} ${suffix}`;
  };

  // Format date like "আজ (২৪ সেপ্টেম্বর)" or "কাল (২৫ সেপ্টেম্বর)"
  const formatDateFriendly = (dateStr: string) => {
    if (!dateStr) return '';
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    if (dateStr === today) {
      return language === 'bn' ? 'আজ' : 'Today';
    } else if (dateStr === tomorrow) {
      return language === 'bn' ? 'আগামীকাল' : 'Tomorrow';
    } else {
      try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const monthsBn = [
            'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
            'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
          ];
          const monthsEn = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ];
          const mIdx = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          if (language === 'bn') {
            return `${toBn(day)} ${monthsBn[mIdx] || ''}`;
          }
          return `${day} ${monthsEn[mIdx] || ''}`;
        }
      } catch {
        // fallback
      }
      return dateStr;
    }
  };

  // If no schedules are present
  if (nearestSchedules.length === 0) {
    return (
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 border border-emerald-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-2xs border border-emerald-200/70">
            <CalendarClock className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-emerald-950">
                {language === 'bn' ? 'আপকামিং ক্লাস ও এক্সাম সিডিউল' : 'Upcoming Class & Exam Schedule'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                {language === 'bn' ? 'টাইমার' : 'Timer'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-0.5">
              {language === 'bn'
                ? 'পরবর্তী ক্লাস বা পরীক্ষার সময় সেট করুন, এখানে লাইভ টাইমার চলবে'
                : 'Schedule your next class or exam to see live countdown'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onAddNewSchedule}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{language === 'bn' ? 'সিডিউল করুন' : 'Schedule'}</span>
          </button>
        </div>
      </div>
    );
  }

  // If 1 or multiple schedules exist on that nearest day
  const isMultiple = nearestSchedules.length > 1;

  return (
    <div className="space-y-2">
      {/* Header bar of the Timer Widget */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1">
            {language === 'bn' ? 'আসন্ন সিডিউল টাইমার' : 'Upcoming Schedule Timer'}
            {isMultiple && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {language === 'bn' ? 'একই দিনে ২টি সিডিউল' : '2 Schedules Today'}
              </span>
            )}
          </span>
        </div>

        <button
          onClick={onOpenScheduleManager}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-950 flex items-center gap-0.5 hover:underline cursor-pointer"
        >
          <span>{language === 'bn' ? 'সকল সিডিউল' : 'View All'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of nearest schedules (1 card or 2 side-by-side cards) */}
      <div className={`grid gap-3 ${isMultiple ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {nearestSchedules.map((schedule) => {
          const countdown = calculateScheduleCountdown(schedule, currentTime);
          const isClass = schedule.type === 'class';
          const isExam = schedule.type === 'exam';

          const cardTheme = isExam
            ? {
                cardBg: 'bg-gradient-to-br from-white via-rose-50/40 to-amber-50/30 border-rose-200/90 shadow-rose-100/50',
                badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
                digitBg: 'bg-rose-950 text-white shadow-xs',
                labelColor: 'text-rose-900/80',
                accentText: 'text-rose-900',
                icon: <Award className="w-4 h-4 text-rose-600" />,
                typeLabel: language === 'bn' ? '📝 পরীক্ষা / এক্সাম' : '📝 Exam',
              }
            : {
                cardBg: 'bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/40 border-emerald-200/90 shadow-emerald-100/50',
                badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
                digitBg: 'bg-emerald-950 text-white shadow-xs',
                labelColor: 'text-emerald-900/80',
                accentText: 'text-emerald-950',
                icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
                typeLabel: language === 'bn' ? '📚 ক্লাস' : '📚 Class',
              };

          return (
            <div
              key={schedule.id}
              className={`p-4 rounded-2xl border shadow-xs transition-all relative overflow-hidden ${cardTheme.cardBg}`}
            >
              {/* Subtle top row: Type badge + Date/Time */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[11px] font-bold px-2.5 py-0.8 rounded-full border flex items-center gap-1 ${cardTheme.badgeBg}`}>
                    {cardTheme.icon}
                    <span>{cardTheme.typeLabel}</span>
                  </span>

                  <span className="text-[11px] font-semibold text-slate-700 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200/70 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{formatDateFriendly(schedule.date)}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{formatTime12h(schedule.time)}</span>
                  </span>
                </div>

                {countdown.status === 'in_progress' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                    <Radio className="w-3 h-3" />
                    <span>{language === 'bn' ? 'চলছে' : 'Live'}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {schedule.durationMinutes ? `${toBn(schedule.durationMinutes)} মি.` : '৬০ মি.'}
                  </span>
                )}
              </div>

              {/* Subject & Topic Details */}
              <div className="mb-3.5">
                <h3 className={`text-sm sm:text-base font-extrabold truncate ${cardTheme.accentText}`}>
                  {schedule.subject}
                </h3>
                <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                  <span className="text-slate-500">{language === 'bn' ? 'টপিক:' : 'Topic:'} </span>
                  {schedule.topic}
                </p>
                {schedule.locationOrLink && (
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                    <span>{schedule.locationOrLink}</span>
                  </p>
                )}
              </div>

              {/* Countdown Digits Display */}
              {countdown.status === 'upcoming' ? (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>{language === 'bn' ? 'শুরু হতে বাকি:' : 'Starts in:'}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {/* Days */}
                    <div className="p-1.5 sm:p-2 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                      <span className="block text-base sm:text-lg font-black font-mono text-emerald-950 leading-tight">
                        {toBn(countdown.days)}
                      </span>
                      <span className="block text-[9px] font-bold text-slate-600">
                        {language === 'bn' ? 'দিন' : 'Days'}
                      </span>
                    </div>

                    {/* Hours */}
                    <div className="p-1.5 sm:p-2 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                      <span className="block text-base sm:text-lg font-black font-mono text-emerald-950 leading-tight">
                        {toBn(padZero(countdown.hours))}
                      </span>
                      <span className="block text-[9px] font-bold text-slate-600">
                        {language === 'bn' ? 'ঘণ্টা' : 'Hours'}
                      </span>
                    </div>

                    {/* Minutes */}
                    <div className="p-1.5 sm:p-2 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                      <span className="block text-base sm:text-lg font-black font-mono text-emerald-950 leading-tight">
                        {toBn(padZero(countdown.minutes))}
                      </span>
                      <span className="block text-[9px] font-bold text-slate-600">
                        {language === 'bn' ? 'মিনিট' : 'Mins'}
                      </span>
                    </div>

                    {/* Seconds */}
                    <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-600 text-white shadow-2xs">
                      <span className="block text-base sm:text-lg font-black font-mono leading-tight animate-pulse">
                        {toBn(padZero(countdown.seconds))}
                      </span>
                      <span className="block text-[9px] font-bold text-emerald-100">
                        {language === 'bn' ? 'সেকেন্ড' : 'Secs'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : countdown.status === 'in_progress' ? (
                /* Currently In Progress Timer */
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                  <div className="text-xs font-bold text-rose-900 flex items-center justify-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-600 animate-bounce" />
                    <span>{language === 'bn' ? 'ক্লাস/পরীক্ষা এখন চলমান!' : 'Session is in progress!'}</span>
                  </div>
                  <p className="text-[11px] font-mono font-bold text-rose-700 mt-1">
                    {language === 'bn' ? 'সমাপ্ত হতে বাকি: ' : 'Time remaining: '}
                    {toBn(padZero(countdown.hours))}:{toBn(padZero(countdown.minutes))}:{toBn(padZero(countdown.seconds))}
                  </p>
                </div>
              ) : (
                /* Concluded recently */
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs font-bold text-slate-700">
                  {language === 'bn' ? 'সময় সমাপ্ত (২৪ ঘণ্টার মধ্যে অটো-ডিলেট হবে)' : 'Finished (auto-purges in 24h)'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
