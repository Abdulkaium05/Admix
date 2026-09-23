import React, { useState, useMemo } from 'react';
import {
  Atom,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Flame,
  ArrowRight,
  Shuffle,
  BookOpen,
  Search,
  Check,
  Award,
  Layers,
  Info,
} from 'lucide-react';
import { chemicalElements, ChemicalElement, shuffleElements } from '../data/elementsData';
import { Language } from '../utils/i18n';

interface ElementValencyQuizProps {
  language: Language;
}

type Mode = 'practice' | 'table';

export const ElementValencyQuiz: React.FC<ElementValencyQuizProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<Mode>('practice');

  // Filter category
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Filtered elements list
  const filteredPool = useMemo(() => {
    switch (selectedFilter) {
      case 'variable':
        // Elements with multiple valencies
        return chemicalElements.filter((el) => el.valencies.length > 1);
      case 'group1_2':
        return chemicalElements.filter((el) => el.group === 1 || el.group === 2);
      case 'transition':
        return chemicalElements.filter((el) => el.group >= 3 && el.group <= 12);
      case 'p_block':
        return chemicalElements.filter((el) => el.group >= 13 && el.group <= 16);
      case 'halogens_noble':
        return chemicalElements.filter((el) => el.group === 17 || el.group === 18);
      default:
        return chemicalElements;
    }
  }, [selectedFilter]);

  // Non-repeating randomized queue of element IDs.
  // When a pool has > 40 elements (e.g. all 54 elements), an element is guaranteed NEVER to appear again within 40 turns!
  // Even for smaller filtered categories, it will exhaust all available items before cycling, and avoids immediate repeats.
  const [queue, setQueue] = useState<string[]>(() => {
    return shuffleElements(chemicalElements.map((el) => el.id));
  });

  // Keep track of recently served element IDs (up to 40)
  const [recentElementIds, setRecentElementIds] = useState<string[]>([]);

  // Current Element ID
  const [currentElementId, setCurrentElementId] = useState<string>(() => {
    const initialShuffled = shuffleElements(chemicalElements);
    return initialShuffled[0]?.id || chemicalElements[0].id;
  });

  // Resolve active element from currentElementId and filteredPool
  const currentElement = useMemo(() => {
    const found = filteredPool.find((el) => el.id === currentElementId);
    if (found) return found;
    return filteredPool[0] || chemicalElements[0];
  }, [filteredPool, currentElementId]);

  // User input selections
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedValencies, setSelectedValencies] = useState<number[]>([]);

  // Submission & Result state
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);

  // Score statistics
  const [stats, setStats] = useState({
    attempted: 0,
    perfect: 0,
    partial: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
  });

  // Reference table search query
  const [tableSearch, setTableSearch] = useState<string>('');

  // Handle toggling valency (Multiple selections allowed)
  const toggleValency = (val: number) => {
    if (isAnswerChecked) return;
    setSelectedValencies((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val].sort((a, b) => a - b)
    );
  };

  // Handle group select (Single selection 1 to 18)
  const selectGroup = (grp: number) => {
    if (isAnswerChecked) return;
    setSelectedGroup(grp);
  };

  // Check Answer logic
  const handleCheckAnswer = () => {
    if (selectedGroup === null && selectedValencies.length === 0) return;

    const groupCorrect = selectedGroup === currentElement.group;

    // Check valencies
    // Target valencies set vs selected valencies set
    const targetValSet = new Set(currentElement.valencies);
    const selectedValSet = new Set(selectedValencies);

    const hasAllTargetValencies = currentElement.valencies.every((v) => selectedValSet.has(v));
    const hasNoWrongValencies = selectedValencies.every((v) => targetValSet.has(v));
    const isValencyPerfect = hasAllTargetValencies && hasNoWrongValencies;

    // Partial correctness: some target valencies picked without any wrong ones, or group right
    const hasSomeTargetValencies = selectedValencies.some((v) => targetValSet.has(v));
    const isValencyPartial = !isValencyPerfect && hasSomeTargetValencies && hasNoWrongValencies;

    const isTotalPerfect = groupCorrect && isValencyPerfect;
    const isPartial = !isTotalPerfect && (groupCorrect || isValencyPartial || isValencyPerfect);

    setStats((prev) => {
      const newStreak = isTotalPerfect ? prev.streak + 1 : 0;
      return {
        attempted: prev.attempted + 1,
        perfect: isTotalPerfect ? prev.perfect + 1 : prev.perfect,
        partial: isPartial ? prev.partial + 1 : prev.partial,
        wrong: !isTotalPerfect && !isPartial ? prev.wrong + 1 : prev.wrong,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      };
    });

    setIsAnswerChecked(true);
  };

  // Function to pick the next element with strict non-repetition (at least 40 turns for 54-element pool)
  const pickNextElement = (
    pool: ChemicalElement[],
    currentRecent: string[],
    currentQueue: string[]
  ): { nextElement: ChemicalElement; newRecent: string[]; newQueue: string[] } => {
    if (pool.length === 0) {
      return {
        nextElement: chemicalElements[0],
        newRecent: currentRecent,
        newQueue: currentQueue,
      };
    }

    if (pool.length === 1) {
      return {
        nextElement: pool[0],
        newRecent: [pool[0].id],
        newQueue: [pool[0].id],
      };
    }

    // Determine the safe non-repeat window:
    // If pool has >= 41 items (e.g. all 54 elements), the non-repeat window is 40!
    // If pool has fewer items (e.g. 10 transition metals), window is pool.length - 1 so every element is seen before any repeat.
    const nonRepeatWindow = Math.min(40, pool.length - 1);

    // Candidates in current pool that are NOT in the recent non-repeat window
    const recentWindow = currentRecent.slice(-nonRepeatWindow);
    const recentSet = new Set(recentWindow);

    // Filter queue for valid elements in the current pool that haven't been seen recently
    let nextId: string | undefined;
    let remainingQueue = [...currentQueue];

    // Find first item in remainingQueue that belongs to pool and not in recentSet
    const candidateIdx = remainingQueue.findIndex(
      (id) => !recentSet.has(id) && pool.some((el) => el.id === id)
    );

    if (candidateIdx !== -1) {
      nextId = remainingQueue[candidateIdx];
      remainingQueue.splice(candidateIdx, 1);
    } else {
      // Re-fill / shuffle pool elements that are not in recentSet
      const eligiblePool = pool.filter((el) => !recentSet.has(el.id));
      const candidatesToShuffle = eligiblePool.length > 0 ? eligiblePool : pool;
      const freshlyShuffled = shuffleElements(candidatesToShuffle.map((el) => el.id));

      nextId = freshlyShuffled[0];
      remainingQueue = freshlyShuffled.slice(1);
    }

    const nextElement = pool.find((el) => el.id === nextId) || pool[0];
    const newRecent = [...currentRecent, nextElement.id].slice(-40);

    return {
      nextElement,
      newRecent,
      newQueue: remainingQueue,
    };
  };

  // Next Random Element (guaranteed no repeat within 40 turns)
  const handleNextElement = () => {
    setIsAnswerChecked(false);
    setSelectedGroup(null);
    setSelectedValencies([]);

    const { nextElement, newRecent, newQueue } = pickNextElement(
      filteredPool,
      recentElementIds,
      queue
    );

    setCurrentElementId(nextElement.id);
    setRecentElementIds(newRecent);
    setQueue(newQueue);
  };

  // Change filter handler
  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    setIsAnswerChecked(false);
    setSelectedGroup(null);
    setSelectedValencies([]);

    // Get the target pool for this filter
    let newPool: ChemicalElement[];
    switch (filterId) {
      case 'variable':
        newPool = chemicalElements.filter((el) => el.valencies.length > 1);
        break;
      case 'group1_2':
        newPool = chemicalElements.filter((el) => el.group === 1 || el.group === 2);
        break;
      case 'transition':
        newPool = chemicalElements.filter((el) => el.group >= 3 && el.group <= 12);
        break;
      case 'p_block':
        newPool = chemicalElements.filter((el) => el.group >= 13 && el.group <= 16);
        break;
      case 'halogens_noble':
        newPool = chemicalElements.filter((el) => el.group === 17 || el.group === 18);
        break;
      default:
        newPool = chemicalElements;
    }

    const { nextElement, newRecent, newQueue } = pickNextElement(
      newPool,
      recentElementIds,
      []
    );

    setCurrentElementId(nextElement.id);
    setRecentElementIds(newRecent);
    setQueue(newQueue);
  };

  // Reset Stats
  const handleResetStats = () => {
    setStats({
      attempted: 0,
      perfect: 0,
      partial: 0,
      wrong: 0,
      streak: 0,
      bestStreak: 0,
    });
    setRecentElementIds([]);
    setQueue(shuffleElements(chemicalElements.map((el) => el.id)));
  };

  // Check state calculations
  const groupIsCorrect = selectedGroup === currentElement.group;
  const targetValSet = useMemo(() => new Set(currentElement.valencies), [currentElement]);
  const selectedValSet = useMemo(() => new Set(selectedValencies), [selectedValencies]);
  const hasAllTargetValencies = currentElement.valencies.every((v) => selectedValSet.has(v));
  const hasNoWrongValencies = selectedValencies.every((v) => targetValSet.has(v));
  const isValencyExact = hasAllTargetValencies && hasNoWrongValencies;
  const isAllPerfect = isAnswerChecked && groupIsCorrect && isValencyExact;

  // Search filtered elements for reference table
  const tableElements = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();
    if (!q) return chemicalElements;
    return chemicalElements.filter(
      (el) =>
        el.symbol.toLowerCase().includes(q) ||
        el.nameBn.toLowerCase().includes(q) ||
        el.nameEn.toLowerCase().includes(q) ||
        el.atomicNumber.toString() === q ||
        el.group.toString() === q ||
        el.valencies.some((v) => v.toString() === q)
    );
  }, [tableSearch]);

  const groupNumbers = Array.from({ length: 18 }, (_, i) => i + 1);
  // Valency options: 0 (for noble gases) and 1 to 8
  const valencyNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-4">
      {/* Top Banner & Mode Toggle */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <Atom className="w-6 h-6 text-emerald-700 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-emerald-950">
                  মৌলের গ্রুপ ও যোজনী কুইজ
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ৫৪টি নির্ধারিত মৌল
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  ৪০ বারে নো-রিপিট
                </span>
              </div>
              <p className="text-xs text-emerald-700/80 mt-0.5">
                র‍্যান্ডম মৌলের গ্রুপ (১-১৮) ও যোজনী যাচাই করুন (একবার আসা মৌল অন্তত ৪০ বারের মধ্যে পুনরায় আসবে না)
              </p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-emerald-50 rounded-xl border border-emerald-200/80 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'practice'
                  ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200'
                  : 'text-emerald-700 hover:text-emerald-950'
              }`}
            >
              কুইজ প্র্যাকটিস
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'table'
                  ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200'
                  : 'text-emerald-700 hover:text-emerald-950'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>মৌল তালিকা ({chemicalElements.length})</span>
            </button>
          </div>
        </div>

        {/* Live Streak & Performance Tracker */}
        {activeTab === 'practice' && (
          <div className="pt-2 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>টানা সঠিক: {stats.streak}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <span>অনুশীলন: <b className="font-mono">{stats.attempted}</b></span>
                <span className="text-emerald-400">•</span>
                <span className="text-emerald-700">পূর্ণাঙ্গ সঠিক: <b className="font-mono">{stats.perfect}</b></span>
                <span className="text-emerald-400">•</span>
                <span className="text-rose-600">ভুল: <b className="font-mono">{stats.wrong}</b></span>
              </div>
            </div>

            {stats.attempted > 0 && (
              <button
                onClick={handleResetStats}
                className="text-[11px] text-emerald-700 hover:text-rose-600 hover:underline flex items-center gap-1 transition-colors"
                title="স্কোর রিসেট করুন"
              >
                <RotateCcw className="w-3 h-3" />
                <span>রিসেট</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================= TAB 1: INTERACTIVE QUIZ ================= */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-emerald-900 whitespace-nowrap mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>ফিল্টার:</span>
            </span>
            {[
              { id: 'all', label: 'সব মৌল (৫৪টি)' },
              { id: 'variable', label: 'পরিবর্তনশীল যোজনী' },
              { id: 'group1_2', label: 'গ্রুপ ১ ও ২ (ক্ষার/মৃৎক্ষার)' },
              { id: 'transition', label: 'অবস্থান্তর ধাতু (Sc-Zn)' },
              { id: 'p_block', label: 'গ্রুপ ১৩-১৬ (p-ব্লক)' },
              { id: 'halogens_noble', label: 'হ্যালোজেন ও নিষ্ক্রিয় (১৭, ১৮)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => handleFilterChange(f.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Main Question Card */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
            {/* Element Identity Showcase */}
            <div className="p-4 sm:p-5 rounded-2xl bg-radial from-emerald-500/10 via-emerald-50/50 to-transparent border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Periodic Table Box */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-emerald-500 shadow-xs flex flex-col items-center justify-center relative flex-shrink-0">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 absolute top-1 left-2">
                    {currentElement.atomicNumber}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono tracking-tight">
                    {currentElement.symbol}
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-700 text-center truncate px-1">
                    {currentElement.nameEn}
                  </span>
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-emerald-950">
                      {currentElement.nameBn} ({currentElement.symbol})
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {currentElement.category}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700/80 mt-1">
                    পারমাণবিক সংখ্যা: <b className="font-mono text-emerald-900">{currentElement.atomicNumber}</b> | পর্যায়: <b className="font-mono text-emerald-900">{currentElement.period}</b>
                  </p>
                </div>
              </div>

              {/* Shuffle Element Button */}
              <button
                onClick={handleNextElement}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="অন্য মৌল আনুন"
              >
                <Shuffle className="w-4 h-4 text-emerald-600" />
                <span>অন্য মৌল</span>
              </button>
            </div>

            {/* Question 1: Group Selection (1 to 18) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-mono font-bold">
                    ১
                  </span>
                  <span>মৌলটির গ্রুপ সংখ্যা নির্বাচন করুন (১ - ১৮):</span>
                </label>
                {selectedGroup !== null && (
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    গ্রুপ: {selectedGroup}
                  </span>
                )}
              </div>

              {/* 18 Group Buttons Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 sm:gap-2">
                {groupNumbers.map((grp) => {
                  const isSelected = selectedGroup === grp;
                  const isCorrect = isAnswerChecked && grp === currentElement.group;
                  const isWrongSelected = isAnswerChecked && isSelected && grp !== currentElement.group;

                  let style =
                    'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300';
                  if (isSelected && !isAnswerChecked) {
                    style = 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold scale-102';
                  } else if (isCorrect) {
                    style = 'bg-emerald-600 text-white border-emerald-600 font-bold ring-2 ring-emerald-500/40';
                  } else if (isWrongSelected) {
                    style = 'bg-rose-500 text-white border-rose-500 font-bold ring-2 ring-rose-400/40';
                  }

                  return (
                    <button
                      key={grp}
                      type="button"
                      disabled={isAnswerChecked}
                      onClick={() => selectGroup(grp)}
                      className={`h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-mono font-bold border transition-all flex items-center justify-center cursor-pointer disabled:cursor-default ${style}`}
                    >
                      {grp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 2: Valency Selection (Multiple choices allowed: 0 to 8) */}
            <div className="space-y-2.5 pt-2 border-t border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-mono font-bold">
                      ২
                    </span>
                    <span>যোজনী (Valency) নির্বাচন করুন (১ - ৮ ও ০):</span>
                  </label>
                  <p className="text-[11px] text-emerald-700/80 ml-6">
                    💡 এক বা একাধিক যোজনী সিলেক্ট করতে পারেন (ক্লিক করে সিলেক্ট/আনসিলেক্ট করুন)
                  </p>
                </div>

                {selectedValencies.length > 0 && (
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    সিলেক্টেড: {selectedValencies.join(', ')}
                  </span>
                )}
              </div>

              {/* Valency Buttons Grid: 0, 1, 2, 3, 4, 5, 6, 7, 8 */}
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                {valencyNumbers.map((val) => {
                  const isSelected = selectedValencies.includes(val);
                  const isTargetVal = currentElement.valencies.includes(val);

                  let style =
                    'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300';

                  if (!isAnswerChecked) {
                    if (isSelected) {
                      style = 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold scale-102';
                    }
                  } else {
                    // Checked state
                    if (isTargetVal && isSelected) {
                      // Correctly selected
                      style = 'bg-emerald-600 text-white border-emerald-600 font-bold ring-2 ring-emerald-500/40';
                    } else if (isTargetVal && !isSelected) {
                      // Missed valency
                      style = 'bg-amber-100 text-amber-900 border-amber-400 font-bold ring-2 ring-amber-400/40 animate-pulse';
                    } else if (!isTargetVal && isSelected) {
                      // Wrongly selected
                      style = 'bg-rose-500 text-white border-rose-500 font-bold ring-2 ring-rose-400/40';
                    }
                  }

                  return (
                    <button
                      key={val}
                      type="button"
                      disabled={isAnswerChecked}
                      onClick={() => toggleValency(val)}
                      className={`h-11 sm:h-12 rounded-xl text-xs sm:text-sm border transition-all flex flex-col items-center justify-center cursor-pointer disabled:cursor-default ${style}`}
                    >
                      <span className="font-mono font-extrabold text-sm sm:text-base leading-none">
                        {val}
                      </span>
                      <span className="text-[9px] mt-0.5 opacity-80">
                        {val === 0 ? 'নিষ্ক্রিয়' : `যোজনী ${val}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Answer Feedback & Full Explanation (Appears after Check) */}
            {isAnswerChecked && (
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-all animate-in fade-in-50 duration-200 ${
                  isAllPerfect
                    ? 'bg-emerald-50/90 border-emerald-300'
                    : 'bg-amber-50/70 border-amber-200'
                }`}
              >
                {/* Result Title */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isAllPerfect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    )}
                    <h4 className="text-sm sm:text-base font-bold text-emerald-950">
                      {isAllPerfect
                        ? '🎉 সঠিক উত্তর! অসাধারণ প্রস্তুতি!'
                        : 'উত্তর পর্যালোচনা ও সঠিক সমাধান:'}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200">
                    {currentElement.symbol} ({currentElement.atomicNumber})
                  </span>
                </div>

                {/* Status breakdown for Group & Valency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Group status */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      groupIsCorrect
                        ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div>
                      <span className="block text-[10px] font-semibold opacity-80">গ্রুপ সংখ্যা:</span>
                      <span className="font-bold">সঠিক: গ্রুপ {currentElement.group}</span>
                    </div>
                    {groupIsCorrect ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> সঠিক
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> আপনার পছন্দ: {selectedGroup || 'দেওয়া হয়নি'}
                      </span>
                    )}
                  </div>

                  {/* Valency status */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      isValencyExact
                        ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                        : 'bg-amber-100/70 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div>
                      <span className="block text-[10px] font-semibold opacity-80">যোজনী:</span>
                      <span className="font-bold">
                        সঠিক যোজনী: {currentElement.valencies.join(', ')}
                      </span>
                    </div>
                    {isValencyExact ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> পূর্ণাঙ্গ সঠিক
                      </span>
                    ) : (
                      <span className="text-amber-800 font-bold text-[11px]">
                        আপনার পছন্দ: {selectedValencies.length > 0 ? selectedValencies.join(', ') : 'নাই'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Chemical explanation & electronic configuration */}
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 space-y-1.5 text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950">ইলেকট্রন বিন্যাস:</span>
                    <span className="font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded text-emerald-800 border border-emerald-200">
                      {currentElement.electronConfig}
                    </span>
                  </div>
                  {currentElement.note && (
                    <p className="text-emerald-800 leading-relaxed font-sans pt-1">
                      💡 {currentElement.note}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions: Check Answer vs Next Element */}
            <div className="pt-2 flex items-center justify-end gap-2">
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedGroup === null && selectedValencies.length === 0}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>উত্তর যাচাই করুন</span>
                </button>
              ) : (
                <button
                  onClick={handleNextElement}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>পরবর্তী র্যান্ডম মৌল</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: REFERENCE TABLE OF 54 ELEMENTS ================= */}
      {activeTab === 'table' && (
        <div className="space-y-3">
          {/* Search box */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="মৌলের প্রতীক (Fe, Cu...), নাম, পারমাণবিক সংখ্যা বা গ্রুপ দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 placeholder-emerald-700/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-700/80 px-1">
              <span>মোট মৌল: {tableElements.length}টি (প্রদত্ত ৫৪টি মৌলিক তালিকা)</span>
              <span className="font-semibold">গ্রুপ ১-১৮ এবং যোজনী ১-৮ অন্তর্ভুক্ত</span>
            </div>
          </div>

          {/* Cards list for mobile/responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {tableElements.map((el) => (
              <div
                key={el.id}
                className="p-3.5 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center font-mono">
                      <span className="text-[9px] text-emerald-600 font-bold leading-none">
                        {el.atomicNumber}
                      </span>
                      <span className="text-sm font-extrabold text-emerald-950 leading-tight">
                        {el.symbol}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950 leading-tight">
                        {el.nameBn}
                      </h4>
                      <p className="text-[10px] text-emerald-700/80">{el.nameEn}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    গ্রুপ {el.group}
                  </span>
                </div>

                {/* Valency & Electron config */}
                <div className="grid grid-cols-2 gap-1.5 text-xs pt-1 border-t border-emerald-50">
                  <div className="p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block font-semibold">যোজনী:</span>
                    <span className="font-mono font-extrabold text-emerald-950 text-xs">
                      {el.valencies.join(', ')}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block font-semibold">শ্রেণি:</span>
                    <span className="text-[11px] font-semibold text-emerald-900 truncate block">
                      {el.category}
                    </span>
                  </div>
                </div>

                {el.note && (
                  <p className="text-[10px] text-emerald-800/90 leading-tight bg-emerald-50/40 p-1.5 rounded-md border border-emerald-100/60">
                    {el.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
