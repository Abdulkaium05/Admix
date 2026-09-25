import React, { useState, useMemo } from 'react';
import { StudySession } from '../types';
import { formatDuration } from '../utils/storage';
import { Language } from '../utils/i18n';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  Sparkles,
  RotateCcw,
  Target,
  Award,
  BookOpen,
  ChevronRight,
  Info,
} from 'lucide-react';

interface StudyTimeChartProps {
  sessions: StudySession[];
  language: Language;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenAddSession?: (date: string) => void;
  onBack?: () => void;
}

export interface DayStudyData {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "১৯ সেপ্টে" or "19 Sep"
  shortDay: string; // e.g. "১৯"
  weekday: string; // "বৃহস্পতি" / "Thu"
  dayIndexFromStart: number; // 1, 2, 3...
  relativeLabel?: string; // "আজ", "গতকাল", "১ম দিন"
  totalMinutes: number;
  hoursDecimal: number;
  sessionsCount: number;
  topics: string[];
  subjects: string[];
  isToday: boolean;
  isSelected: boolean;
}

export const StudyTimeChart: React.FC<StudyTimeChartProps> = ({
  sessions,
  language,
  selectedDate,
  onSelectDate,
  onOpenAddSession,
  onBack,
}) => {
  // Chart type: 'line' (লাইন গ্রাফ) or 'bar' (বার চার্ট)
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  // Range mode: 'from_start' (starts when user actually started studying) | '30' | '14' | '7'
  const [rangeMode, setRangeMode] = useState<'from_start' | '30' | '14' | '7'>('from_start');
  // Key to force replay of animations when requested or when tab switches
  const [animationKey, setAnimationKey] = useState<number>(0);
  // Hovered / selected point for rich tooltip
  const [hoveredDay, setHoveredDay] = useState<DayStudyData | null>(null);

  // Today reference
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Helper to format date string to human readable label
  const formatDayLabel = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayNum = language === 'bn' ? d.toLocaleString('bn-BD') : String(d);
      const monthName = dateObj.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        month: 'short',
      });
      return `${dayNum} ${monthName}`;
    } catch {
      return dateStr;
    }
  };

  const getWeekday = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        weekday: 'short',
      });
    } catch {
      return '';
    }
  };

  // 1. Calculate the earliest date when user actually started studying
  const { earliestSessionDate, daysSinceStart } = useMemo(() => {
    const validDates = sessions
      .filter((s) => s.durationMinutes > 0 && typeof s.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.date))
      .map((s) => s.date)
      .sort();

    // If user has recorded study sessions, the earliest day is validDates[0]
    // Otherwise, default to today
    const firstDate = validDates.length > 0 ? validDates[0] : todayStr;

    try {
      const [ey, em, ed] = firstDate.split('-').map(Number);
      const earliestObj = new Date(ey, em - 1, ed);
      const todayObj = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffMs = todayObj.getTime() - earliestObj.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      // e.g. If earliest is yesterday, diffDays = 1, so daysSinceStart = 2 (Yesterday = Day 1, Today = Day 2)
      return { earliestSessionDate: firstDate, daysSinceStart: Math.max(1, diffDays + 1) };
    } catch {
      return { earliestSessionDate: firstDate, daysSinceStart: 1 };
    }
  }, [sessions, todayStr, today]);

  // Replay animation handler
  const handleReplayAnimation = () => {
    setAnimationKey((prev) => prev + 1);
  };

  // 2. Compute timeline data based on starting study date and selected range
  const timelineData: DayStudyData[] = useMemo(() => {
    const days: DayStudyData[] = [];

    // Group sessions by date
    const sessionMap = new Map<string, StudySession[]>();
    sessions.forEach((s) => {
      if (!sessionMap.has(s.date)) {
        sessionMap.set(s.date, []);
      }
      sessionMap.get(s.date)!.push(s);
    });

    let startDate: Date;
    let totalDaysToRender: number;

    if (rangeMode === 'from_start') {
      // Starts from earliestSessionDate up to todayStr
      // If user started yesterday, this produces exactly 2 days (Yesterday and Today)
      const [ey, em, ed] = earliestSessionDate.split('-').map(Number);
      startDate = new Date(ey, em - 1, ed);
      totalDaysToRender = daysSinceStart;
    } else {
      const daysCount = rangeMode === '30' ? 30 : rangeMode === '14' ? 14 : 7;
      totalDaysToRender = daysCount;
      const d = new Date(today);
      d.setDate(today.getDate() - (daysCount - 1));
      startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    for (let i = 0; i < totalDaysToRender; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);

      const daySessions = sessionMap.get(dateStr) || [];
      const totalMinutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      const topics = daySessions.map((s) => s.topic).filter(Boolean);
      const subjects = Array.from(
        new Set(
          daySessions.flatMap((s) => {
            if (s.subjects && Array.isArray(s.subjects) && s.subjects.length > 0) {
              return s.subjects;
            }
            if (s.subject && s.subject.includes(',')) {
              return s.subject.split(',').map((x) => x.trim()).filter(Boolean);
            }
            return s.subject ? [s.subject] : [];
          })
        )
      );

      const dayNumber = d.getDate();
      const shortDay = language === 'bn' ? dayNumber.toLocaleString('bn-BD') : String(dayNumber);

      // Relative day label (e.g. ১ম দিন, গতকাল, আজ)
      let relativeLabel = '';
      if (dateStr === todayStr) {
        relativeLabel = language === 'bn' ? 'আজ' : 'Today';
      } else if (i === 0 && rangeMode === 'from_start') {
        relativeLabel = language === 'bn' ? '১ম দিন' : 'Day 1';
      } else {
        const dObj = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const tObj = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diffD = Math.round((tObj.getTime() - dObj.getTime()) / (1000 * 60 * 60 * 24));
        if (diffD === 1) relativeLabel = language === 'bn' ? 'গতকাল' : 'Yesterday';
        else if (diffD === 2) relativeLabel = language === 'bn' ? 'গতপরশু' : '2d ago';
      }

      days.push({
        date: dateStr,
        dayLabel: formatDayLabel(dateStr),
        shortDay,
        weekday: getWeekday(dateStr),
        dayIndexFromStart: i + 1,
        relativeLabel,
        totalMinutes,
        hoursDecimal: +(totalMinutes / 60).toFixed(1),
        sessionsCount: daySessions.length,
        topics,
        subjects,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
      });
    }

    return days;
  }, [sessions, rangeMode, earliestSessionDate, daysSinceStart, selectedDate, language, todayStr, today]);

  // Aggregate Metrics for this range
  const metrics = useMemo(() => {
    const totalMins = timelineData.reduce((acc, d) => acc + d.totalMinutes, 0);
    const activeDays = timelineData.filter((d) => d.totalMinutes > 0).length;
    const avgMins = Math.round(totalMins / (timelineData.length || 1));
    const maxDay = timelineData.reduce(
      (max, d) => (d.totalMinutes > max.totalMinutes ? d : max),
      timelineData[0] || { totalMinutes: 0, date: '', dayLabel: '' }
    );

    return {
      totalMins,
      activeDays,
      avgMins,
      maxDay,
    };
  }, [timelineData]);

  // Chart Dimensions & Coordinate Math - sized to fit phone screen width without horizontal scroll
  const svgWidth = 560;
  const svgHeight = 240;
  const paddingLeft = 38;
  const paddingRight = 16;
  const paddingTop = 26;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const chartBottom = svgHeight - paddingBottom;

  // Max scale calculation (at least 4 hours for good DUET prep scale)
  const maxMinutesInRange = Math.max(...timelineData.map((d) => d.totalMinutes), 0);
  const maxHours = Math.max(4, Math.ceil(maxMinutesInRange / 60));
  const maxMinutesScale = maxHours * 60;

  // Calculate coordinates for points
  const points = useMemo(() => {
    const len = timelineData.length;
    // When few points (e.g. 2 points for yesterday & today), add comfortable margins so they aren't pinned to the absolute boundary
    const sideMargin = len === 1 ? 0 : len === 2 ? 80 : len <= 4 ? 36 : len <= 7 ? 16 : 8;
    const usableWidth = chartWidth - sideMargin * 2;

    return timelineData.map((d, index) => {
      let x = paddingLeft + chartWidth / 2;
      if (len > 1) {
        x = paddingLeft + sideMargin + (index / (len - 1)) * usableWidth;
      }
      const y = chartBottom - (d.totalMinutes / maxMinutesScale) * chartHeight;
      return {
        ...d,
        x,
        y: Math.min(chartBottom, Math.max(paddingTop, y)),
        index,
      };
    });
  }, [timelineData, chartWidth, chartHeight, chartBottom, paddingLeft, paddingTop, maxMinutesScale]);

  // Generate Smooth SVG Path (Monotone Cubic Curve or Line)
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };

    if (points.length === 1) {
      const p = points[0];
      return {
        linePath: `M ${p.x - 30} ${p.y} L ${p.x + 30} ${p.y}`,
        areaPath: `M ${p.x - 30} ${chartBottom} L ${p.x - 30} ${p.y} L ${p.x + 30} ${p.y} L ${p.x + 30} ${chartBottom} Z`,
      };
    }

    // Bezier curve interpolation through points
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      d += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    const last = points[points.length - 1];
    const first = points[0];
    const area = `${d} L ${last.x} ${chartBottom} L ${first.x} ${chartBottom} Z`;

    return { linePath: d, areaPath: area };
  }, [points, chartBottom]);

  // Bar Chart Width Calculation - dynamically sizes nicely for 1-2 bars or 30 bars
  const barWidth = useMemo(() => {
    const count = points.length;
    if (count <= 2) return 40;
    if (count <= 7) return 26;
    if (count <= 14) return 16;
    return Math.max(6, Math.min(12, (chartWidth / count) * 0.72));
  }, [points.length, chartWidth]);

  // Y-Axis Grid Lines (every 1 hour or 2 hours depending on scale)
  const yAxisTicks = useMemo(() => {
    const ticks: { hour: number; y: number; label: string }[] = [];
    const step = maxHours > 6 ? 2 : 1;
    for (let h = 0; h <= maxHours; h += step) {
      const mins = h * 60;
      const y = chartBottom - (mins / maxMinutesScale) * chartHeight;
      const label = language === 'bn' ? `${h.toLocaleString('bn-BD')}ঘ` : `${h}h`;
      ticks.push({ hour: h, y, label });
    }
    return ticks;
  }, [maxHours, maxMinutesScale, chartBottom, chartHeight, language]);

  // Selected or Hovered day display
  const activeDay = hoveredDay || timelineData.find((d) => d.date === selectedDate) || timelineData[timelineData.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-2xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 bg-emerald-50/40 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
              <span>{language === 'bn' ? 'স্টাডি গ্রাফ ও অ্যানালিটিক্স' : 'Study Time Analytics'}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                {rangeMode === 'from_start'
                  ? (language === 'bn' ? `১ম দিন থেকে আজ (${daysSinceStart.toLocaleString('bn-BD')} দিন)` : `Day 1 to Today (${daysSinceStart}d)`)
                  : (language === 'bn' ? `${timelineData.length.toLocaleString('bn-BD')} দিনের চিত্র` : `${timelineData.length}-Day View`)}
              </span>
            </h3>
          </div>
          <p className="text-xs text-emerald-700/80 mt-0.5">
            {rangeMode === 'from_start'
              ? (language === 'bn'
                  ? `পড়া শুরুর ১ম দিন (${formatDayLabel(earliestSessionDate)}) থেকে আজ পর্যন্ত পড়ার পরিমাণ`
                  : `Study progress from Day 1 (${formatDayLabel(earliestSessionDate)}) up to today`)
              : (language === 'bn'
                  ? `গত ${timelineData.length.toLocaleString('bn-BD')} দিনে প্রতিদিন কতটুকু পড়লেন তার গ্রাফ`
                  : `Visual study progress over the last ${timelineData.length} days`)}
          </p>
        </div>

        {/* View Switcher Controls (Line Graph vs Bar Chart + Days Filter) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="bg-white p-1 rounded-xl border border-emerald-200 shadow-2xs flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setChartType('line');
                setAnimationKey((prev) => prev + 1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartType === 'line'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-900 hover:bg-emerald-50'
              }`}
              title={language === 'bn' ? 'লাইন গ্রাফ দেখুন' : 'View Line Graph'}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'গ্রাফ' : 'Graph'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setChartType('bar');
                setAnimationKey((prev) => prev + 1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartType === 'bar'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-900 hover:bg-emerald-50'
              }`}
              title={language === 'bn' ? 'বার চার্ট দেখুন' : 'View Bar Chart'}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'বার চার্ট' : 'Bar Chart'}</span>
            </button>
          </div>

          {/* Range Selector: From Start (default) | 30 days | 14 days | 7 days */}
          <div className="bg-white p-1 rounded-xl border border-emerald-200 shadow-2xs flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setRangeMode('from_start');
                setAnimationKey((prev) => prev + 1);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                rangeMode === 'from_start' ? 'bg-emerald-100 text-emerald-950 font-bold' : 'text-emerald-800 hover:bg-emerald-50'
              }`}
              title={language === 'bn' ? 'পড়া শুরু করার ১ম দিন থেকে আজ পর্যন্ত' : 'From first day to today'}
            >
              {language === 'bn' ? `শুরু থেকে (${daysSinceStart.toLocaleString('bn-BD')} দিন)` : `From Start (${daysSinceStart}d)`}
            </button>
            <button
              type="button"
              onClick={() => {
                setRangeMode('30');
                setAnimationKey((prev) => prev + 1);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                rangeMode === '30' ? 'bg-emerald-100 text-emerald-950 font-bold' : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              {language === 'bn' ? '৩০ দিন' : '30D'}
            </button>
            <button
              type="button"
              onClick={() => {
                setRangeMode('14');
                setAnimationKey((prev) => prev + 1);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                rangeMode === '14' ? 'bg-emerald-100 text-emerald-950 font-bold' : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              {language === 'bn' ? '১৪ দিন' : '14D'}
            </button>
            <button
              type="button"
              onClick={() => {
                setRangeMode('7');
                setAnimationKey((prev) => prev + 1);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                rangeMode === '7' ? 'bg-emerald-100 text-emerald-950 font-bold' : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              {language === 'bn' ? '৭ দিন' : '7D'}
            </button>
          </div>

          {/* Replay Animation Button */}
          <button
            type="button"
            onClick={handleReplayAnimation}
            className="p-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 transition-colors shadow-2xs flex items-center gap-1 text-xs font-bold"
            title={language === 'bn' ? 'অ্যানিমেশন পুনরায় দেখুন' : 'Replay Animation'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{language === 'bn' ? 'অ্যানিমেশন' : 'Replay'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-emerald-100 border-b border-emerald-100 bg-white text-xs">
        <div className="p-3 sm:p-3.5">
          <span className="text-[11px] font-semibold text-emerald-700/80 block">
            {rangeMode === 'from_start'
              ? (language === 'bn' ? `১ম দিন থেকে মোট (${timelineData.length.toLocaleString('bn-BD')} দিন)` : `Total Since Day 1 (${timelineData.length}d)`)
              : (language === 'bn' ? `${timelineData.length.toLocaleString('bn-BD')} দিনের সর্বমোট` : `${timelineData.length}-Day Total`)}
          </span>
          <span className="text-sm sm:text-base font-bold text-emerald-950 font-mono">
            {formatDuration(metrics.totalMins, language)}
          </span>
        </div>

        <div className="p-3 sm:p-3.5">
          <span className="text-[11px] font-semibold text-emerald-700/80 block">
            {language === 'bn' ? 'দৈনিক গড় স্টাডি' : 'Daily Average'}
          </span>
          <span className="text-sm sm:text-base font-bold text-emerald-950 font-mono">
            {formatDuration(metrics.avgMins, language)} <span className="text-[11px] text-emerald-700/70 font-sans">/{language === 'bn' ? 'দিন' : 'd'}</span>
          </span>
        </div>

        <div className="p-3 sm:p-3.5">
          <span className="text-[11px] font-semibold text-emerald-700/80 block">
            {language === 'bn' ? 'সর্বোচ্চ পড়ার দিন' : 'Peak Day'}
          </span>
          <span className="text-sm sm:text-base font-bold text-emerald-950 font-mono">
            {metrics.maxDay.totalMinutes > 0 ? (
              <>
                {formatDuration(metrics.maxDay.totalMinutes, language)}{' '}
                <span className="text-[11px] text-emerald-700/70 font-sans">({metrics.maxDay.dayLabel})</span>
              </>
            ) : (
              '--'
            )}
          </span>
        </div>

        <div className="p-3 sm:p-3.5">
          <span className="text-[11px] font-semibold text-emerald-700/80 block">
            {language === 'bn' ? 'ধারাবাহিক পড়ার দিন' : 'Active Study Days'}
          </span>
          <span className="text-sm sm:text-base font-bold text-emerald-950 font-mono">
            {language === 'bn'
              ? `${metrics.activeDays.toLocaleString('bn-BD')} / ${timelineData.length.toLocaleString('bn-BD')} দিন`
              : `${metrics.activeDays} / ${timelineData.length} days`}
          </span>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="p-3 sm:p-5 relative select-none">
        {/* Subtle Daily Target Indicator (e.g. 3 Hours recommended for DUET) */}
        <div className="flex items-center justify-between text-[11px] text-emerald-800/80 mb-2 px-1">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-0.5 bg-emerald-500 inline-block rounded-full"></span>
            <span>{language === 'bn' ? 'প্রতিদিনের পড়ার পরিমাণ (ঘণ্টা)' : 'Daily Study Duration (Hours)'}</span>
          </span>
          <span className="flex items-center gap-1.5 text-stone-500 text-[10px] hidden sm:flex">
            <span className="w-3 border-t border-dashed border-emerald-400 inline-block"></span>
            <span>{language === 'bn' ? '৩ ঘণ্টা লক্ষ্যমাত্রা' : '3h Daily Target'}</span>
          </span>
        </div>

        {/* Responsive full-width chart container - fits phone screen width directly with no horizontal scrolling */}
        <div className="w-full overflow-hidden">
          <svg
            key={animationKey}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-60 sm:max-h-64 block select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Emerald Gradient for Line Graph Area */}
              <linearGradient id="areaEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#10b981" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>

              {/* Animated Clip Path for Line Graph Left-to-Right Reveal */}
              <clipPath id={`reveal-clip-${animationKey}`}>
                <motion.rect
                  x="0"
                  y="0"
                  height={svgHeight}
                  initial={{ width: 0 }}
                  animate={{ width: svgWidth }}
                  transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </clipPath>

              {/* Bar Gradients */}
              <linearGradient id="barGradActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="barGradToday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>
            </defs>

            {/* Grid Lines and Y-Axis Labels */}
            {yAxisTicks.map((tick) => (
              <g key={`y-${tick.hour}`}>
                <line
                  x1={paddingLeft}
                  y1={tick.y}
                  x2={svgWidth - paddingRight}
                  y2={tick.y}
                  stroke="#e5e7eb"
                  strokeDasharray={tick.hour === 3 ? '4 3' : '2 2'}
                  strokeWidth={tick.hour === 3 ? 1.5 : 1}
                  className={tick.hour === 3 ? 'stroke-emerald-300' : ''}
                />
                <text
                  x={paddingLeft - 6}
                  y={tick.y + 4}
                  textAnchor="end"
                  fontSize="11"
                  className="font-mono fill-stone-600 font-semibold"
                >
                  {tick.label}
                </text>
              </g>
            ))}

              {/* Base Axis Line */}
              <line
                x1={paddingLeft}
                y1={chartBottom}
                x2={svgWidth - paddingRight}
                y2={chartBottom}
                stroke="#d1d5db"
                strokeWidth={1.5}
              />

              {/* ========================================================================= */}
              {/* 1. LINE / AREA GRAPH MODE (With Left-to-Right Reveal Animation)           */}
              {/* ========================================================================= */}
              {chartType === 'line' && (
                <g clipPath={`url(#reveal-clip-${animationKey})`}>
                  {/* Area Fill */}
                  <path d={areaPath} fill="url(#areaEmeraldGrad)" />

                  {/* Main Line Stroke */}
                  <motion.path
                    d={linePath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                  />

                  {/* Interactive Points on Line */}
                  {points.map((pt, i) => {
                    const isHovered = hoveredDay?.date === pt.date;
                    const isSelectedDate = selectedDate === pt.date;
                    const hasStudy = pt.totalMinutes > 0;

                    return (
                      <g
                        key={`pt-${pt.date}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredDay(pt)}
                        onClick={() => {
                          onSelectDate(pt.date);
                          setHoveredDay(pt);
                        }}
                      >
                        {/* Transparent larger hit area for easy hover/tap */}
                        <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" />

                        {/* Outer pulse or ring if selected or today */}
                        {(isSelectedDate || isHovered) && (
                          <motion.circle
                            cx={pt.x}
                            cy={pt.y}
                            r={10}
                            fill="#10b981"
                            fillOpacity={0.25}
                            animate={{ scale: [1, 1.25, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                        )}

                        {/* Animated circle point */}
                        <motion.circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered || isSelectedDate ? 6 : hasStudy ? 3.5 : 2}
                          fill={
                            isSelectedDate
                              ? '#047857'
                              : isHovered
                              ? '#059669'
                              : hasStudy
                              ? '#10b981'
                              : '#d1d5db'
                          }
                          stroke="#ffffff"
                          strokeWidth={isHovered || isSelectedDate ? 2.5 : 1.5}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            delay: 0.2 + (i / points.length) * 0.8,
                            duration: 0.3,
                            type: 'spring',
                          }}
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* ========================================================================= */}
              {/* 2. BAR CHART MODE (All Bars Animate from 0 Upwards)                      */}
              {/* ========================================================================= */}
              {chartType === 'bar' && (
                <g>
                  {points.map((pt, i) => {
                    const barHeight = Math.max(3, (pt.totalMinutes / maxMinutesScale) * chartHeight);
                    const barX = pt.x - barWidth / 2;
                    const barY = chartBottom - barHeight;
                    const isHovered = hoveredDay?.date === pt.date;
                    const isSelectedDate = selectedDate === pt.date;
                    const hasStudy = pt.totalMinutes > 0;

                    return (
                      <g
                        key={`bar-${pt.date}`}
                        className="cursor-pointer group"
                        onMouseEnter={() => setHoveredDay(pt)}
                        onClick={() => {
                          onSelectDate(pt.date);
                          setHoveredDay(pt);
                        }}
                      >
                        {/* Background track indicator */}
                        <rect
                          x={barX}
                          y={paddingTop}
                          width={barWidth}
                          height={chartHeight}
                          fill="#f3f4f6"
                          opacity={0.4}
                          rx={3}
                        />

                        {/* Animated Bar Growing from 0 Upwards */}
                        <motion.rect
                          x={barX}
                          width={barWidth}
                          rx={3}
                          fill={
                            isSelectedDate
                              ? 'url(#barGradToday)'
                              : isHovered
                              ? '#047857'
                              : hasStudy
                              ? 'url(#barGradActive)'
                              : '#e5e7eb'
                          }
                          initial={{ height: 0, y: chartBottom }}
                          animate={{ height: barHeight, y: barY }}
                          transition={{
                            duration: 0.65,
                            delay: i * 0.022,
                            ease: [0.34, 1.56, 0.64, 1], // bouncy rise
                          }}
                          className="transition-colors"
                        />

                        {/* Today Marker Dot on top of bar */}
                        {pt.isToday && (
                          <circle
                            cx={pt.x}
                            cy={barY - 6}
                            r={3}
                            fill="#047857"
                            className="animate-pulse"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* X-Axis Date Labels (with intelligent spacing & relative tags) */}
              {points.map((pt, i) => {
                const total = points.length;
                const step = total <= 7 ? 1 : total <= 14 ? 2 : total <= 21 ? 3 : 5;
                const showLabel = i % step === 0 || i === total - 1 || i === 0;
                if (!showLabel) return null;

                const isSelectedDate = selectedDate === pt.date;

                return (
                  <g key={`x-lbl-${pt.date}`}>
                    <text
                      x={pt.x}
                      y={chartBottom + 15}
                      textAnchor="middle"
                      fontSize="11"
                      className={`font-mono select-none ${
                        isSelectedDate
                          ? 'font-bold fill-emerald-950'
                          : pt.isToday
                          ? 'font-bold fill-emerald-700'
                          : 'fill-stone-600'
                      }`}
                    >
                      {pt.shortDay}
                    </text>
                    <text
                      x={pt.x}
                      y={chartBottom + 27}
                      textAnchor="middle"
                      fontSize="9"
                      className={`select-none font-sans ${
                        pt.relativeLabel ? 'font-bold fill-emerald-800' : 'fill-stone-500'
                      }`}
                    >
                      {pt.relativeLabel || pt.weekday}
                    </text>
                  </g>
                );
              })}
            </svg>
        </div>

        {/* Dynamic Detail Tooltip Card on Selected or Hovered Day */}
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-950 text-sm">
                  {activeDay.dayLabel} ({activeDay.weekday})
                </span>
                {activeDay.isToday && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                    {language === 'bn' ? 'আজ' : 'Today'}
                  </span>
                )}
                {activeDay.date === selectedDate && !activeDay.isToday && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-semibold border border-emerald-200">
                    {language === 'bn' ? 'নির্বাচিত তারিখ' : 'Selected Date'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-bold text-emerald-900 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  {language === 'bn' ? 'পড়ার সময়: ' : 'Study Time: '}
                  {formatDuration(activeDay.totalMinutes, language)}
                </span>
                <span className="text-emerald-700/80">
                  {activeDay.sessionsCount > 0 ? (
                    <>
                      {activeDay.sessionsCount} {language === 'bn' ? 'টি সেশন' : 'sessions'}
                      {activeDay.subjects.length > 0 && ` • ${activeDay.subjects.join(', ')}`}
                    </>
                  ) : (
                    <span className="text-stone-500 italic">
                      {language === 'bn' ? 'এই দিনে কোনো পড়া রেকর্ড করা হয়নি' : 'No study logged on this date'}
                    </span>
                  )}
                </span>
              </div>

              {activeDay.topics.length > 0 && (
                <p className="text-[11px] text-emerald-800 mt-1 max-w-xl line-clamp-1">
                  <span className="font-semibold">{language === 'bn' ? 'পড়া হয়েছিল: ' : 'Topics: '}</span>
                  {activeDay.topics.join(', ')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {activeDay.date !== selectedDate && (
              <button
                type="button"
                onClick={() => onSelectDate(activeDay.date)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>{language === 'bn' ? 'এই দিনের হিসেব খুলুন' : 'View This Date Log'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {activeDay.sessionsCount === 0 && onOpenAddSession && (
              <button
                type="button"
                onClick={() => onOpenAddSession(activeDay.date)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-colors shadow-2xs"
              >
                {language === 'bn' ? '+ পড়ার সময় লিখুন' : '+ Log Study'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
