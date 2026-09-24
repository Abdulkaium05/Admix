import React, { useState, useMemo, useEffect } from 'react';
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
  Play,
  SlidersHorizontal,
  ChevronRight,
  Timer,
  Hash,
} from 'lucide-react';
import { chemicalElements, ChemicalElement, shuffleElements } from '../data/elementsData';
import { Language } from '../utils/i18n';

interface ElementValencyQuizProps {
  language: Language;
}

type Mode = 'exam' | 'practice' | 'table';
type ExamPhase = 'setup' | 'running' | 'result';

interface ExamQuestion {
  element: ChemicalElement;
  selectedGroup: number | null;
  selectedValencies: number[];
  inputAtomicNumber: string;
}

export const ElementValencyQuiz: React.FC<ElementValencyQuizProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<Mode>('exam');

  // ==========================================
  // EXAM MODE STATE
  // ==========================================
  const [examPhase, setExamPhase] = useState<ExamPhase>('setup');
  const [examQuestionCount, setExamQuestionCount] = useState<number>(20); // 10, 20, 30
  const [examQuestions, setExamQuestions] = useState<ChemicalElement[]>([]);
  const [currentExamIndex, setCurrentExamIndex] = useState<number>(0);

  // User responses for exam: index => { selectedGroup, selectedValencies, inputAtomicNumber }
  const [examUserAnswers, setExamUserAnswers] = useState<{
    [index: number]: {
      selectedGroup: number | null;
      selectedValencies: number[];
      inputAtomicNumber: string;
    };
  }>({});

  // Current inputs in running exam question
  const [examCurrentGroup, setExamCurrentGroup] = useState<number | null>(null);
  const [examCurrentValencies, setExamCurrentValencies] = useState<number[]>([]);
  const [examCurrentAtomicNumber, setExamCurrentAtomicNumber] = useState<string>('');

  // Start exam function (30, 20, or 10 elements randomly picked with NO duplicates)
  const startExam = (count: number) => {
    // Shuffle the full 54 elements and take `count` elements
    const shuffled = shuffleElements(chemicalElements);
    const selected = shuffled.slice(0, count);

    setExamQuestions(selected);
    setCurrentExamIndex(0);
    setExamUserAnswers({});
    setExamCurrentGroup(null);
    setExamCurrentValencies([]);
    setExamCurrentAtomicNumber('');
    setExamPhase('running');
  };

  // Sync inputs when moving between questions
  const loadExamQuestionInputs = (index: number) => {
    const saved = examUserAnswers[index];
    if (saved) {
      setExamCurrentGroup(saved.selectedGroup);
      setExamCurrentValencies(saved.selectedValencies);
      setExamCurrentAtomicNumber(saved.inputAtomicNumber);
    } else {
      setExamCurrentGroup(null);
      setExamCurrentValencies([]);
      setExamCurrentAtomicNumber('');
    }
  };

  const saveCurrentExamAnswer = () => {
    setExamUserAnswers((prev) => ({
      ...prev,
      [currentExamIndex]: {
        selectedGroup: examCurrentGroup,
        selectedValencies: examCurrentValencies,
        inputAtomicNumber: examCurrentAtomicNumber.trim(),
      },
    }));
  };

  const handleExamNext = () => {
    saveCurrentExamAnswer();
    if (currentExamIndex < examQuestions.length - 1) {
      const nextIdx = currentExamIndex + 1;
      setCurrentExamIndex(nextIdx);
      loadExamQuestionInputs(nextIdx);
    } else {
      // Finished
      setExamPhase('result');
    }
  };

  const handleExamPrevious = () => {
    saveCurrentExamAnswer();
    if (currentExamIndex > 0) {
      const prevIdx = currentExamIndex - 1;
      setCurrentExamIndex(prevIdx);
      loadExamQuestionInputs(prevIdx);
    }
  };

  // Exam Score Calculation:
  // Each question has 2 marks:
  // 1 mark if Group AND Valency are BOTH correct.
  // 1 mark if Atomic Number is correct.
  // Total marks = examQuestions.length * 2
  const examScoreSummary = useMemo(() => {
    if (examPhase !== 'result') return null;

    let totalScore = 0;
    let groupValencyScore = 0;
    let atomicScore = 0;

    const questionResults = examQuestions.map((el, idx) => {
      const ans = examUserAnswers[idx] || {
        selectedGroup: null,
        selectedValencies: [],
        inputAtomicNumber: '',
      };

      // 1. Group check
      const isGroupCorrect = ans.selectedGroup === el.group;

      // 2. Valency check (must match exactly)
      const targetValSet = new Set(el.valencies);
      const selectedValSet = new Set(ans.selectedValencies);
      const isValencyCorrect =
        el.valencies.every((v) => selectedValSet.has(v)) &&
        ans.selectedValencies.every((v) => targetValSet.has(v));

      // Condition: Group and Valency BOTH correct = 1 mark
      const isGroupAndValencyCorrect = isGroupCorrect && isValencyCorrect;

      // 3. Atomic Number check = 1 mark
      const parsedAtomic = parseInt(ans.inputAtomicNumber, 10);
      const isAtomicCorrect = !isNaN(parsedAtomic) && parsedAtomic === el.atomicNumber;

      const qScore = (isGroupAndValencyCorrect ? 1 : 0) + (isAtomicCorrect ? 1 : 0);

      if (isGroupAndValencyCorrect) groupValencyScore += 1;
      if (isAtomicCorrect) atomicScore += 1;
      totalScore += qScore;

      return {
        element: el,
        ans,
        isGroupCorrect,
        isValencyCorrect,
        isGroupAndValencyCorrect,
        isAtomicCorrect,
        qScore,
      };
    });

    const maxScore = examQuestions.length * 2;
    const percentage = Math.round((totalScore / maxScore) * 100);

    return {
      totalScore,
      maxScore,
      percentage,
      groupValencyScore,
      atomicScore,
      questionResults,
    };
  }, [examPhase, examQuestions, examUserAnswers]);

  // ==========================================
  // PRACTICE MODE STATE
  // ==========================================
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredPool = useMemo(() => {
    switch (selectedFilter) {
      case 'variable':
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

  // Non-repeating randomized queue of element IDs for practice
  const [queue, setQueue] = useState<string[]>(() => {
    return shuffleElements(chemicalElements.map((el) => el.id));
  });
  const [recentElementIds, setRecentElementIds] = useState<string[]>([]);
  const [currentElementId, setCurrentElementId] = useState<string>(() => {
    const initialShuffled = shuffleElements(chemicalElements);
    return initialShuffled[0]?.id || chemicalElements[0].id;
  });

  const currentPracticeElement = useMemo(() => {
    const found = filteredPool.find((el) => el.id === currentElementId);
    if (found) return found;
    return filteredPool[0] || chemicalElements[0];
  }, [filteredPool, currentElementId]);

  // Practice inputs
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedValencies, setSelectedValencies] = useState<number[]>([]);
  const [inputAtomicNumber, setInputAtomicNumber] = useState<string>('');
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);

  // Practice Score statistics
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

  // Helpers for Practice
  const togglePracticeValency = (val: number) => {
    if (isAnswerChecked) return;
    setSelectedValencies((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val].sort((a, b) => a - b)
    );
  };

  const selectPracticeGroup = (grp: number) => {
    if (isAnswerChecked) return;
    setSelectedGroup(grp);
  };

  const handlePracticeCheck = () => {
    if (selectedGroup === null && selectedValencies.length === 0 && !inputAtomicNumber.trim()) return;

    const groupCorrect = selectedGroup === currentPracticeElement.group;

    const targetValSet = new Set(currentPracticeElement.valencies);
    const selectedValSet = new Set(selectedValencies);
    const hasAllTargetValencies = currentPracticeElement.valencies.every((v) => selectedValSet.has(v));
    const hasNoWrongValencies = selectedValencies.every((v) => targetValSet.has(v));
    const isValencyPerfect = hasAllTargetValencies && hasNoWrongValencies;

    const parsedAtomic = parseInt(inputAtomicNumber.trim(), 10);
    const isAtomicCorrect = !isNaN(parsedAtomic) && parsedAtomic === currentPracticeElement.atomicNumber;

    const isTotalPerfect = groupCorrect && isValencyPerfect && isAtomicCorrect;
    const isPartial =
      !isTotalPerfect &&
      (groupCorrect || isValencyPerfect || isAtomicCorrect || selectedValencies.some((v) => targetValSet.has(v)));

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

  const pickNextPracticeElement = (
    pool: ChemicalElement[],
    currentRecent: string[],
    currentQueue: string[]
  ): { nextElement: ChemicalElement; newRecent: string[]; newQueue: string[] } => {
    if (pool.length === 0) {
      return { nextElement: chemicalElements[0], newRecent: currentRecent, newQueue: currentQueue };
    }
    if (pool.length === 1) {
      return { nextElement: pool[0], newRecent: [pool[0].id], newQueue: [pool[0].id] };
    }

    const nonRepeatWindow = Math.min(40, pool.length - 1);
    const recentWindow = currentRecent.slice(-nonRepeatWindow);
    const recentSet = new Set(recentWindow);

    let nextId: string | undefined;
    let remainingQueue = [...currentQueue];

    const candidateIdx = remainingQueue.findIndex(
      (id) => !recentSet.has(id) && pool.some((el) => el.id === id)
    );

    if (candidateIdx !== -1) {
      nextId = remainingQueue[candidateIdx];
      remainingQueue.splice(candidateIdx, 1);
    } else {
      const eligiblePool = pool.filter((el) => !recentSet.has(el.id));
      const candidatesToShuffle = eligiblePool.length > 0 ? eligiblePool : pool;
      const freshlyShuffled = shuffleElements(candidatesToShuffle.map((el) => el.id));
      nextId = freshlyShuffled[0];
      remainingQueue = freshlyShuffled.slice(1);
    }

    const nextElement = pool.find((el) => el.id === nextId) || pool[0];
    const newRecent = [...currentRecent, nextElement.id].slice(-40);

    return { nextElement, newRecent, newQueue: remainingQueue };
  };

  const handleNextPracticeElement = () => {
    setIsAnswerChecked(false);
    setSelectedGroup(null);
    setSelectedValencies([]);
    setInputAtomicNumber('');

    const { nextElement, newRecent, newQueue } = pickNextPracticeElement(
      filteredPool,
      recentElementIds,
      queue
    );

    setCurrentElementId(nextElement.id);
    setRecentElementIds(newRecent);
    setQueue(newQueue);
  };

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    setIsAnswerChecked(false);
    setSelectedGroup(null);
    setSelectedValencies([]);
    setInputAtomicNumber('');

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

    const { nextElement, newRecent, newQueue } = pickNextPracticeElement(newPool, recentElementIds, []);
    setCurrentElementId(nextElement.id);
    setRecentElementIds(newRecent);
    setQueue(newQueue);
  };

  const handleResetPractice = () => {
    setIsAnswerChecked(false);
    setSelectedGroup(null);
    setSelectedValencies([]);
    setInputAtomicNumber('');
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

  // Group and Valency numbers
  const groupNumbers = Array.from({ length: 18 }, (_, i) => i + 1);
  const valencyNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  // Filtered elements for reference table
  const tableElements = useMemo(() => {
    if (!tableSearch.trim()) return chemicalElements;
    const q = tableSearch.toLowerCase().trim();
    return chemicalElements.filter(
      (el) =>
        el.nameBn.toLowerCase().includes(q) ||
        el.nameEn.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        el.atomicNumber.toString() === q ||
        `group ${el.group}`.includes(q) ||
        `গ্রুপ ${el.group}`.includes(q) ||
        el.valencies.some((v) => v.toString() === q)
    );
  }, [tableSearch]);

  // Current Exam Question Element
  const currentExamElement = examQuestions[currentExamIndex];

  return (
    <div className="space-y-4">
      {/* Top Banner with Navigation Tabs */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <Atom className="w-6 h-6 text-emerald-700 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-emerald-950">
                  মৌলের গ্রুপ, যোজনী ও পারমাণবিক সংখ্যা
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ৫৪টি নির্ধারিত মৌল
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  ৪০ বারে নো-রিপিট
                </span>
              </div>
              <p className="text-xs text-emerald-700/80 mt-0.5">
                মৌলের গ্রুপ (১-১৮), যোজনী (১-৮ ও ০) এবং পারমাণবিক সংখ্যা নম্বর ইনপুট দিয়ে পরীক্ষা দিন
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-emerald-50 rounded-xl border border-emerald-200/80 self-start sm:self-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('exam')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'exam'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-950'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>মডেল এক্সাম</span>
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'practice'
                  ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200'
                  : 'text-emerald-700 hover:text-emerald-950'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>অনুশীলন (প্র্যাকটিস)</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200'
                  : 'text-emerald-700 hover:text-emerald-950'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>মৌল তালিকা (৫৪)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. EXAM MODE (১০/২০/৩০ টি মৌলের পূর্ণাঙ্গ এক্সাম) */}
      {/* ========================================================================= */}
      {activeTab === 'exam' && (
        <div className="space-y-4">
          {/* Phase 1: Exam Setup */}
          {examPhase === 'setup' && (
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Award className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-emerald-950">
                    মৌলের মডেল টেস্ট (Exam System)
                  </h3>
                  <p className="text-xs text-emerald-700/80">
                    র‍্যান্ডম মৌল থেকে পরীক্ষা হবে। গ্রুপ ও যোজনী ঠিক হলে ১ নম্বর এবং পারমাণবিক সংখ্যা সঠিক হলে ১ নম্বর।
                  </p>
                </div>
              </div>

              {/* Exam Rules Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2 text-xs text-emerald-900 leading-relaxed">
                <h4 className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>নম্বর বণ্টন ও নিয়মাবলী:</span>
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-emerald-800 pl-1">
                  <li>
                    প্রতিটি মৌলের জন্য মোট <b>২ নম্বর</b> বরাদ্দ।
                  </li>
                  <li>
                    <b>গ্রুপ ও যোজনী অংশ (১ নম্বর):</b> গ্রুপ সংখ্যা এবং সংশ্লিষ্ট সকল যোজনী সঠিক হলে ১ নম্বর।
                  </li>
                  <li>
                    <b>পারমাণবিক সংখ্যা অংশ (১ নম্বর):</b> মৌলটির সঠিক পারমাণবিক সংখ্যা নম্বর ইনপুটে লিখলে ১ নম্বর।
                  </li>
                  <li>
                    পরীক্ষার মৌলগুলো সম্পূর্ণ র‍্যান্ডম পদ্ধতিতে নির্বাচিত হবে এবং একটি মৌল একবারের বেশি আসবে না।
                  </li>
                </ul>
              </div>

              {/* Question Count Selection: 10, 20, 30 */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <span>কতটি মৌলের পরীক্ষা দিতে চান?</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[10, 20, 30].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setExamQuestionCount(num)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 font-bold text-center transition-all cursor-pointer ${
                        examQuestionCount === num
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-emerald-100 bg-white hover:border-emerald-300 text-emerald-800'
                      }`}
                    >
                      <div className="text-xl sm:text-2xl font-mono font-extrabold">{num}টি</div>
                      <div className="text-[11px] opacity-80 mt-0.5">মৌল ({num * 2} নম্বর)</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                type="button"
                onClick={() => startExam(examQuestionCount)}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>{examQuestionCount}টি মৌলের এক্সাম শুরু করুন</span>
              </button>
            </div>
          )}

          {/* Phase 2: Exam Running */}
          {examPhase === 'running' && currentExamElement && (
            <div className="space-y-4">
              {/* Progress & Question Navigation Header */}
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-950">
                    প্রশ্ন {currentExamIndex + 1} / {examQuestions.length}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    ২ নম্বর
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="w-24 sm:w-36 h-2 rounded-full bg-emerald-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{
                        width: `${((currentExamIndex + 1) / examQuestions.length) * 100}%`,
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('আপনি কি নিশ্চিত যে এক্সাম সমাপ্ত করতে চান?')) {
                        saveCurrentExamAnswer();
                        setExamPhase('result');
                      }
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                  >
                    সমাপ্ত
                  </button>
                </div>
              </div>

              {/* Exam Question Card */}
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
                {/* Element Showcase (Symbol & Name Only - Atomic number hidden for test!) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-radial from-emerald-500/10 via-emerald-50/50 to-transparent border border-emerald-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Element Box without atomic number */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-emerald-500 shadow-xs flex flex-col items-center justify-center relative flex-shrink-0">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 absolute top-1 left-2">
                        ?
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono tracking-tight">
                        {currentExamElement.symbol}
                      </span>
                      <span className="text-[9px] font-semibold text-emerald-700 text-center truncate px-1">
                        {currentExamElement.nameEn}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-extrabold text-emerald-950">
                          {currentExamElement.nameBn} ({currentExamElement.symbol})
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {currentExamElement.category}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700/80 mt-1">
                        মৌলটির পারমাণবিক সংখ্যা, গ্রুপ ও যোজনী নির্বাচন করে উত্তর প্রদান করুন।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section A: পারমাণবিক সংখ্যা নম্বর ইনপুট (১ নম্বর) */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-mono font-bold">
                        ১
                      </span>
                      <span>পারমাণবিক সংখ্যা (Atomic Number) ইনপুট দিন:</span>
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ১ নম্বর
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:max-w-xs">
                      <Hash className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="118"
                        value={examCurrentAtomicNumber}
                        onChange={(e) => setExamCurrentAtomicNumber(e.target.value)}
                        placeholder="যেমন: 1, 6, 26, 29..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-emerald-200 text-sm font-mono font-bold text-emerald-950 placeholder-emerald-600/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                      />
                    </div>
                    {examCurrentAtomicNumber && (
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200">
                        Z = {examCurrentAtomicNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Section B: গ্রুপ ও যোজনী নির্বাচন (১ নম্বর) */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-mono font-bold">
                        ২
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-950">
                        গ্রুপ ও যোজনী অংশ (উভয়টি সঠিক হলে ১ নম্বর):
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ১ নম্বর
                    </span>
                  </div>

                  {/* Sub-question 1: Group (1 to 18) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-950">
                        ক) গ্রুপ সংখ্যা নির্বাচন করুন (১ - ১৮):
                      </label>
                      {examCurrentGroup !== null && (
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          গ্রুপ: {examCurrentGroup}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 sm:gap-2">
                      {groupNumbers.map((grp) => {
                        const isSelected = examCurrentGroup === grp;
                        return (
                          <button
                            key={grp}
                            type="button"
                            onClick={() => setExamCurrentGroup(grp)}
                            className={`h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-mono font-bold border transition-all flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                                : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            {grp}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sub-question 2: Valencies (0 to 8) */}
                  <div className="space-y-2 pt-2 border-t border-emerald-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-emerald-950">
                          খ) যোজনী নির্বাচন করুন (এক বা একাধিক সিলেক্ট করতে পারেন):
                        </label>
                      </div>
                      {examCurrentValencies.length > 0 && (
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          যোজনী: {examCurrentValencies.join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 sm:gap-2">
                      {valencyNumbers.map((val) => {
                        const isSelected = examCurrentValencies.includes(val);
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              setExamCurrentValencies((prev) =>
                                prev.includes(val)
                                  ? prev.filter((v) => v !== val)
                                  : [...prev, val].sort((a, b) => a - b)
                              );
                            }}
                            className={`h-11 sm:h-12 rounded-xl text-xs border transition-all flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                                : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                            }`}
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
                </div>

                {/* Exam Navigation Buttons */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleExamPrevious}
                    disabled={currentExamIndex === 0}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    আগের প্রশ্ন
                  </button>

                  <button
                    type="button"
                    onClick={handleExamNext}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>
                      {currentExamIndex === examQuestions.length - 1
                        ? 'এক্সাম শেষ করুন'
                        : 'পরবর্তী প্রশ্ন'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Phase 3: Exam Result & Breakdown */}
          {examPhase === 'result' && examScoreSummary && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              {/* Score Card */}
              <div className="p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Award className="w-8 h-8 text-emerald-700" />
                </div>

                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    মডেল টেস্ট রেজাল্ট
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-mono mt-1">
                    {examScoreSummary.totalScore} / {examScoreSummary.maxScore}
                  </h2>
                  <p className="text-xs text-emerald-800 mt-1">
                    মোট প্রাপ্ত নম্বর: <b>{examScoreSummary.percentage}%</b> (প্রতি মৌলে ২ নম্বর করে)
                  </p>
                </div>

                {/* Score Breakdown Pills */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-left">
                    <span className="block text-[11px] font-semibold text-emerald-800">
                      গ্রুপ ও যোজনী অংশ:
                    </span>
                    <span className="text-lg font-mono font-extrabold text-emerald-950">
                      {examScoreSummary.groupValencyScore} / {examQuestions.length}
                    </span>
                    <span className="text-[10px] block text-emerald-700 mt-0.5">
                      উভয়টি সঠিক হলে ১ নম্বর
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-left">
                    <span className="block text-[11px] font-semibold text-teal-800">
                      পারমাণবিক সংখ্যা অংশ:
                    </span>
                    <span className="text-lg font-mono font-extrabold text-teal-950">
                      {examScoreSummary.atomicScore} / {examQuestions.length}
                    </span>
                    <span className="text-[10px] block text-teal-700 mt-0.5">
                      সঠিক ইনপুটে ১ নম্বর
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => startExam(examQuestionCount)}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>আবার এক্সাম দিন</span>
                  </button>
                  <button
                    onClick={() => setExamPhase('setup')}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    এক্সাম সেটিংস
                  </button>
                </div>
              </div>

              {/* Detailed Review for each question */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>প্রশ্নের সমাধান ও উত্তর পর্যালোচনা ({examQuestions.length}টি মৌল):</span>
                </h3>

                <div className="space-y-3">
                  {examScoreSummary.questionResults.map((item, idx) => {
                    const {
                      element,
                      ans,
                      isGroupCorrect,
                      isValencyCorrect,
                      isGroupAndValencyCorrect,
                      isAtomicCorrect,
                      qScore,
                    } = item;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl bg-white border transition-all space-y-3 ${
                          qScore === 2
                            ? 'border-emerald-300'
                            : qScore === 1
                            ? 'border-amber-300'
                            : 'border-rose-200'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 border-b border-emerald-50 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-mono font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-base font-extrabold text-emerald-950">
                              {element.nameBn} ({element.symbol})
                            </span>
                            <span className="text-xs text-emerald-700/80 font-mono">
                              [{element.nameEn}]
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full ${
                                qScore === 2
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : qScore === 1
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              নম্বর: {qScore} / ২
                            </span>
                          </div>
                        </div>

                        {/* Part 1: Atomic Number Evaluation */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 font-semibold block">
                              ১. পারমাণবিক সংখ্যা:
                            </span>
                            <span className="font-bold text-slate-900">
                              সঠিক পারমাণবিক সংখ্যা: <b className="font-mono text-emerald-700">{element.atomicNumber}</b>
                            </span>
                          </div>

                          <div className="text-right">
                            {isAtomicCorrect ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <Check className="w-4 h-4" /> সঠিক (+১)
                              </span>
                            ) : (
                              <span className="text-rose-600 font-bold flex items-center gap-1">
                                <XCircle className="w-4 h-4" /> আপনার উত্তর: {ans.inputAtomicNumber || 'নাই'} (+০)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Part 2: Group & Valency Evaluation */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-semibold block">
                              ২. গ্রুপ ও যোজনী অংশ (উভয়টি সঠিক হলে ১ নম্বর):
                            </span>
                            <span
                              className={`font-bold text-xs ${
                                isGroupAndValencyCorrect ? 'text-emerald-700' : 'text-rose-600'
                              }`}
                            >
                              {isGroupAndValencyCorrect ? 'সঠিক (+১)' : 'অসম্পূর্ণ/ভুল (+০)'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                            <div>
                              <span className="text-[10px] text-slate-500 block">গ্রুপ সংখ্যা:</span>
                              <span className="font-semibold text-slate-900">
                                সঠিক: গ্রুপ {element.group} | পছন্দ: {ans.selectedGroup || 'নাই'}{' '}
                                {isGroupCorrect ? '✓' : '✗'}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 block">যোজনী:</span>
                              <span className="font-semibold text-slate-900">
                                সঠিক: {element.valencies.join(', ')} | পছন্দ:{' '}
                                {ans.selectedValencies.length > 0
                                  ? ans.selectedValencies.join(', ')
                                  : 'নাই'}{' '}
                                {isValencyCorrect ? '✓' : '✗'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Note & electronic configuration */}
                        <div className="text-[11px] text-emerald-800 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100 flex items-center justify-between">
                          <span>ইলেকট্রন বিন্যাস: <b className="font-mono">{element.electronConfig}</b></span>
                          {element.note && <span className="text-[10px] opacity-80">{element.note}</span>}
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

      {/* ========================================================================= */}
      {/* 2. PRACTICE MODE (একক মৌল অনুশীলন ও নো-রিপিট রেন্ডমাইজেশন) */}
      {/* ========================================================================= */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          {/* Live Streak & Performance Tracker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-800 block">মোট সমাধান</span>
              <span className="text-xl font-extrabold text-emerald-950 font-mono">
                {stats.attempted}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-700 block">পূর্ণ সঠিক</span>
              <span className="text-xl font-extrabold text-emerald-800 font-mono">
                {stats.perfect}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-800 block">আংশিক সঠিক</span>
              <span className="text-xl font-extrabold text-amber-900 font-mono">
                {stats.partial}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-rose-700 block">ভুল</span>
              <span className="text-xl font-extrabold text-rose-800 font-mono">
                {stats.wrong}
              </span>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {[
              { id: 'all', label: `সব মৌল (${chemicalElements.length})` },
              { id: 'variable', label: 'পরিবর্তনশীল যোজনী' },
              { id: 'group1_2', label: 'গ্রুপ ১ ও ২ (ক্ষার/মৃৎক্ষার)' },
              { id: 'transition', label: 'অবস্থান্তর ধাতু (d-block)' },
              { id: 'p_block', label: 'p-ব্লক মৌল (গ্রুপ ১৩-১৬)' },
              { id: 'halogens_noble', label: 'হ্যালোজেন ও নিষ্ক্রিয় গ্যাস' },
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

          {/* Main Question Card for Practice */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
            {/* Element Identity Showcase */}
            <div className="p-4 sm:p-5 rounded-2xl bg-radial from-emerald-500/10 via-emerald-50/50 to-transparent border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-emerald-500 shadow-xs flex flex-col items-center justify-center relative flex-shrink-0">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 absolute top-1 left-2">
                    {currentPracticeElement.atomicNumber}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono tracking-tight">
                    {currentPracticeElement.symbol}
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-700 text-center truncate px-1">
                    {currentPracticeElement.nameEn}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-emerald-950">
                      {currentPracticeElement.nameBn} ({currentPracticeElement.symbol})
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {currentPracticeElement.category}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700/80 mt-1">
                    পারমাণবিক সংখ্যা: <b className="font-mono text-emerald-900">{currentPracticeElement.atomicNumber}</b> | পর্যায়: <b className="font-mono text-emerald-900">{currentPracticeElement.period}</b>
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextPracticeElement}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="অন্য মৌল আনুন"
              >
                <Shuffle className="w-4 h-4 text-emerald-600" />
                <span>অন্য মৌল</span>
              </button>
            </div>

            {/* Question A: পারমাণবিক সংখ্যা ইনপুট */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-mono font-bold">
                    ১
                  </span>
                  <span>পারমাণবিক সংখ্যা ইনপুট দিন:</span>
                </label>
                {inputAtomicNumber && (
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Z = {inputAtomicNumber}
                  </span>
                )}
              </div>
              <div className="relative max-w-xs">
                <Hash className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  inputMode="numeric"
                  disabled={isAnswerChecked}
                  value={inputAtomicNumber}
                  onChange={(e) => setInputAtomicNumber(e.target.value)}
                  placeholder="পারমাণবিক সংখ্যা লিখুন..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-emerald-200 text-sm font-mono font-bold text-emerald-950 placeholder-emerald-600/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Question B: Group Selection (1 to 18) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-mono font-bold">
                    ২
                  </span>
                  <span>মৌলটির গ্রুপ সংখ্যা নির্বাচন করুন (১ - ১৮):</span>
                </label>
                {selectedGroup !== null && (
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    গ্রুপ: {selectedGroup}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 sm:gap-2">
                {groupNumbers.map((grp) => {
                  const isSelected = selectedGroup === grp;
                  const isCorrect = isAnswerChecked && grp === currentPracticeElement.group;
                  const isWrongSelected = isAnswerChecked && isSelected && grp !== currentPracticeElement.group;

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
                      onClick={() => selectPracticeGroup(grp)}
                      className={`h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-mono font-bold border transition-all flex items-center justify-center cursor-pointer disabled:cursor-default ${style}`}
                    >
                      {grp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question C: Valency Selection (0 to 8) */}
            <div className="space-y-2.5 pt-2 border-t border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-mono font-bold">
                      ৩
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

              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                {valencyNumbers.map((val) => {
                  const isSelected = selectedValencies.includes(val);
                  const isTargetVal = currentPracticeElement.valencies.includes(val);

                  let style =
                    'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300';

                  if (!isAnswerChecked) {
                    if (isSelected) {
                      style = 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold scale-102';
                    }
                  } else {
                    if (isTargetVal && isSelected) {
                      style = 'bg-emerald-600 text-white border-emerald-600 font-bold ring-2 ring-emerald-500/40';
                    } else if (isTargetVal && !isSelected) {
                      style = 'bg-amber-100 text-amber-900 border-amber-400 font-bold ring-2 ring-amber-400/40 animate-pulse';
                    } else if (!isTargetVal && isSelected) {
                      style = 'bg-rose-500 text-white border-rose-500 font-bold ring-2 ring-rose-400/40';
                    }
                  }

                  return (
                    <button
                      key={val}
                      type="button"
                      disabled={isAnswerChecked}
                      onClick={() => togglePracticeValency(val)}
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

            {/* Answer Feedback & Full Explanation */}
            {isAnswerChecked && (
              <div className="p-4 sm:p-5 rounded-2xl border space-y-3 bg-emerald-50/90 border-emerald-300">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>উত্তর পর্যালোচনা ও সমাধান:</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    {currentPracticeElement.symbol} (Z = {currentPracticeElement.atomicNumber})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Atomic number feedback */}
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                    <span className="text-[10px] text-slate-500 block">পারমাণবিক সংখ্যা:</span>
                    <span className="font-bold">সঠিক: {currentPracticeElement.atomicNumber}</span>
                  </div>

                  {/* Group feedback */}
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                    <span className="text-[10px] text-slate-500 block">গ্রুপ সংখ্যা:</span>
                    <span className="font-bold">সঠিক: গ্রুপ {currentPracticeElement.group}</span>
                  </div>

                  {/* Valency feedback */}
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                    <span className="text-[10px] text-slate-500 block">যোজনী:</span>
                    <span className="font-bold">সঠিক: {currentPracticeElement.valencies.join(', ')}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div>
                    <span className="font-bold">ইলেকট্রন বিন্যাস: </span>
                    <span className="font-mono bg-emerald-50 px-2 py-0.5 rounded text-emerald-800 border border-emerald-200">
                      {currentPracticeElement.electronConfig}
                    </span>
                  </div>
                  {currentPracticeElement.note && (
                    <p className="text-emerald-800 pt-1">💡 {currentPracticeElement.note}</p>
                  )}
                </div>
              </div>
            )}

            {/* Actions: Check vs Next */}
            <div className="pt-2 flex items-center justify-end gap-2">
              {!isAnswerChecked ? (
                <button
                  onClick={handlePracticeCheck}
                  disabled={selectedGroup === null && selectedValencies.length === 0 && !inputAtomicNumber.trim()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>উত্তর যাচাই করুন</span>
                </button>
              ) : (
                <button
                  onClick={handleNextPracticeElement}
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

      {/* ========================================================================= */}
      {/* 3. REFERENCE TABLE OF 54 ELEMENTS */}
      {/* ========================================================================= */}
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
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex flex-col items-center justify-center font-mono font-extrabold text-sm">
                      <span className="text-[9px] text-emerald-600 leading-none">
                        {el.atomicNumber}
                      </span>
                      <span>{el.symbol}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                        <span>{el.nameBn}</span>
                        <span className="text-xs text-emerald-700/80 font-normal">
                          ({el.nameEn})
                        </span>
                      </h4>
                      <p className="text-[11px] text-emerald-700/90">
                        গ্রুপ: <b className="font-mono text-emerald-950">{el.group}</b> | পর্যায়:{' '}
                        <b className="font-mono text-emerald-950">{el.period}</b>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {el.category}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-medium">যোজনী:</span>
                  <span className="font-mono font-extrabold text-emerald-950 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    {el.valencies.join(', ')}
                  </span>
                </div>

                <div className="text-[11px] text-emerald-700 flex items-center justify-between">
                  <span className="font-mono">{el.electronConfig}</span>
                  {el.valencies.length > 1 && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      পরিবর্তনশীল
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
